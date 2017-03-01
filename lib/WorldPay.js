var BaseGateway = require('42-cent-base').BaseGateway;
var GatewayError = require('42-cent-base').GatewayError;
var mapKeys = require('42-cent-util').mapKeys;
var util = require('util');
var P = require('bluebird');
var http = require('superagent');
var assign = require('object-assign');

var creditCardSchema = {
  creditCardNumber: 'cardNumber',
  expirationMonth: 'expiryMonth',
  expirationYear: 'expiryYear',
  cvv2: 'cvc',
  cardHolder: 'name'
};

var billingSchema = {
  billingAddress1: 'address1',
  billingAddress2: 'address2',
  billingCity: 'city',
  billingStateRegion: 'state',
  billingCountry: 'countryCode',
  billingPostalCode: 'postalCode'
};

var shippingSchema = {
  shippingAddress1: 'address1',
  shippingAddress2: 'address2',
  shippingCity: 'city',
  shippingStateRegion: 'state',
  shippingCountry: 'countryCode',
  shippingPostalCode: 'postalCode'
};

var customerSchema = {
  billingEmailAddress: 'shopperEmailAddress'
};

function WorldPay (options) {
  this.endpoint = 'https://api.worldpay.com/';
  this.version = 'v1';
  this.serviceKey = options.SERVICE_KEY;
  this.clientKey = options.CLIENT_KEY;
  BaseGateway.call(this, options);
}

util.inherits(WorldPay, BaseGateway);

WorldPay.prototype.resolveEndpoint = function (path) {
  return this.endpoint + this.version + path;
};

WorldPay.prototype._post = function (path, body) {
  var self = this;
  return new P(function (resolve, reject) {
    http.post(self.resolveEndpoint(path))
      .send(body)
      .set('Authorization', self.serviceKey)
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        if (err) {
          res.body = res.body || {message: 'Unknown error'};
          reject(new GatewayError(res.body.message, res.body));
        } else {
          resolve(res);
        }
      });
  })
};

WorldPay.prototype._del = function (path) {
  var self = this;
  return new P(function (resolve, reject) {
    http.del(self.resolveEndpoint(path))
      .set('Authorization', self.serviceKey)
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        if (err) {
          res.body = res.body || {message: 'Unknown error'};
          reject(new GatewayError(res.body.message, res.body));
        } else {
          resolve(res);
        }
      });
  });
};

WorldPay.prototype.createToken = function (paymentInfo, options) {
  var body;
  var paymentMethod;
  options = options || {};
  paymentInfo.reusable = options.reusable === true;
  options.clientKey = options.clientKey || this.clientKey;
  paymentMethod = mapKeys(paymentInfo, creditCardSchema);
  paymentMethod.type = 'Card';
  body = assign({paymentMethod: paymentMethod}, options);
  return this._post('/tokens', body)
    .then(function (res) {
      return {
        _original: res.body,
        token: res.body.token
      }
    });
};

WorldPay.prototype.submitTransaction = function submitTransaction (order, creditcard, prospect, other) {
  var self = this;

  return this.createToken(creditcard)
    .then(function (tokenResponse) {
      var body = assign(mapKeys(prospect, customerSchema), {
        token: tokenResponse.token,
        name: creditcard.cardHolder,
        amount: parseInt(parseFloat((parseFloat(order.amount)).toFixed(2)) * 100),
        currencyCode: order.currency || 'GBP',
        settlementCurrency: order.currency || 'GBP',
        billingAddress: mapKeys(prospect, billingSchema),
        deliveryAddress: mapKeys(prospect, shippingSchema),
        orderDescription: 'Order processed through 42-cent-worldPay'
      });
      return self._post('/orders', assign(body, other || {}));
    })
    .then(function (res) {
      return {
        transactionId: res.body.orderCode,
        _original: res.body
      };
    });
};

WorldPay.prototype.authorizeTransaction = function authorizeTransaction (order, creditcard, prospect, options) {
  return this.submitTransaction(order, creditcard, prospect, assign(options || {}, {authorizeOnly: true}));
};

WorldPay.prototype.voidTransaction = function voidTransaction (transactionId, options) {
  return this._del(('/orders/' + transactionId))
    .then(function (res) {
      return {_original: res.body};
    });
};

WorldPay.prototype.refundTransaction = function refundTransaction (transactionId, options) {
  options = options || {};
  var body = {};
  if (options.amount) {
    body.refundAmount = parseFloat(parseFloat(options.amount)).toFixed(2) * 100;
  }
  return this._post('/orders/' + transactionId + '/refund', body)
    .then(function (res) {
      return {
        _original: res.body || {}
      };
    });
};

WorldPay.prototype.createCustomerProfile = function createCustomerProfile (payment, billing, shipping, other) {
  return this.createToken(payment, {reusable: true})
    .then(function (res) {
      return {
        profileId: res.token,
        _original: res._original
      }
    });
};

WorldPay.prototype.chargeCustomer = function chargeCustomer (order, prospect, other) {

  var self = this;

  var body = assign(mapKeys(prospect, customerSchema), {
    token: prospect.profileId,
    amount: parseFloat((parseFloat(order.amount)).toFixed(2)) * 100,
    currencyCode: order.currency || 'GBP',
    settlementCurrency: order.currency || 'GBP',
    billingAddress: mapKeys(prospect, billingSchema),
    deliveryAddress: mapKeys(prospect, shippingSchema),
    orderDescription: 'Order processed through 42-cent-worldPay'
  });
  return self._post('/orders', assign(body, other || {}))
    .then(function (res) {
      return {
        transactionId: res.body.orderCode,
        _original: res.body
      };
    });
};


module.exports = WorldPay;
