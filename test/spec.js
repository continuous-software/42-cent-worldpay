'use strict';
var assert = require('assert');
var factory = require('../index.js').factory;
var casual = require('casual');
var Prospect = require('42-cent-model').Prospect;
var CreditCard = require('42-cent-model').CreditCard;

describe('WorldPay payment gateway', function () {

  let service;
  let prospect = new Prospect()
    .withBillingFirstName(casual.first_name)
    .withBillingLastName(casual.last_name)
    .withBillingEmailAddress(casual.email)
    .withBillingPhone(casual.phone)
    .withBillingAddress1(casual.address1)
    .withBillingAddress2(casual.address2)
    .withBillingCity(casual.city)
    .withBillingState(casual.state)
    .withBillingPostalCode('3212')
    .withBillingCountry(casual.country_code)
    .withShippingFirstName(casual.first_name)
    .withShippingLastName(casual.last_name)
    .withShippingAddress1(casual.address1)
    .withShippingAddress2(casual.address2)
    .withShippingCity(casual.city)
    .withShippingState(casual.state)
    .withShippingPostalCode('3212')
    .withShippingCountry(casual.country_code);

  let creditCards = {
    visa: function () {
      return new CreditCard()
        .withCreditCardNumber('4444333322221111')
        .withExpirationMonth('11')
        .withExpirationYear('2021')
        .withCvv2('123');
    },
    mastercard: function () {
      return new CreditCard()
        .withCreditCardNumber('5555555555554444')
        .withExpirationMonth('12')
        .withExpirationYear('2017')
        .withCvv2('123');
    },
    amex: function () {
      return new CreditCard()
        .withCreditCardNumber('34343434343434')
        .withExpirationMonth('12')
        .withExpirationYear('2017')
        .withCvv2('123');
    }
  };

  beforeEach(() => {
    service = factory({SERVICE_KEY: process.env.SERVICE_KEY, CLIENT_KEY: process.env.CLIENT_KEY});
  });

  it('should create a token', done => {
    service.createToken(creditCards.visa().withCardHolder('SUCCESS'))
      .then((response) => {
        assert(response.token, 'token should be defined');
        done();
      })
      .catch(error => {
        done(error);
      })
  });

  it('should submit a transaction', (done) => {
    service.submitTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should handle failed transaction', done => {
    service.submitTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa()
      .withCardHolder('FAILED')
      .withCreditCardNumber('4111111111111111'), prospect)
      .then((transaction) => {
        done(new Error('should not get here'));
      })
      .catch(error => {
        assert(error._original);
        assert.equal(error.message, 'This card is not accepted for Test transactions');
        done();
      });
  });

  it('should authorize a transaction', done => {
    service.authorizeTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        assert.equal(transaction._original.authorizeOnly, true);
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should handle failed authorization', done => {
    service.authorizeTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa()
      .withCardHolder('FAILED')
      .withCreditCardNumber('4111111111111111'), prospect)
      .then((transaction) => {
        done(new Error('should not get here'));
      })
      .catch(error => {
        assert(error._original);
        assert.equal(error.message, 'This card is not accepted for Test transactions');
        done();
      });
  });

  it('should void an authorize transaction', done => {
    service.authorizeTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        assert.equal(transaction._original.authorizeOnly, true);
        return service.voidTransaction(transaction.transactionId);
      })
      .then(result => {
        assert(result._original);
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should handle error on cancel', done => {
    service.authorizeTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        assert.equal(transaction._original.authorizeOnly, true);
        return service.voidTransaction('foo');
      })
      .then(result => {
        done(new Error('it should not get here'));
      })
      .catch(error => {
        assert.equal(error.message, 'Order with Order Code: foo not found');
        done();
      });
  });

  it('should refund an order ', done => {
    service.submitTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        return service.refundTransaction(transaction.transactionId);
      })
      .then(resp => {
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should support partial refund', done => {
    var amount = Math.random() * 1000;
    service.submitTransaction({
      amount: amount
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        return service.refundTransaction(transaction.transactionId, {amount: amount / 2});
      })
      .then(resp => {
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should handle error when refunding', done => {
    service.submitTransaction({
      amount: Math.random() * 1000
    }, creditCards.visa().withCardHolder('SUCCESS'), prospect)
      .then((transaction) => {
        assert(transaction.transactionId, 'transactionId should be defined');
        assert(transaction._original, 'original should be defined');
        return service.refundTransaction('foo');
      })
      .then(result => {
        done(new Error('it should not get here'));
      })
      .catch(error => {
        assert.equal(error.message, 'Order with Order Code: foo not found');
        done();
      });
  });

  it('should create a customer profile', done => {
    service.createCustomerProfile(creditCards.visa().withCardHolder('SUCCESS'), prospect, prospect)
      .then(profile => {
        assert(profile.profileId, 'profileId should be defined');
        assert(profile._original);
        assert.equal(profile._original.reusable, true);
        done();
      })
      .catch(error => {
        done(error)
      });
  });

  it('should charge an existing customer', done => {
    service.createCustomerProfile(creditCards.visa().withCardHolder('SUCCESS'))
      .then((result) => {
        assert(result.profileId, ' profileId Should be defined');
        assert(result._original, '_original should be defined');
        prospect.profileId = result.profileId;
        return service.chargeCustomer({amount: Math.random() * 1000}, prospect);
      })
      .then(result => {
        done()
      })
      .catch(err => {
        done(err);
      });
  });
});
