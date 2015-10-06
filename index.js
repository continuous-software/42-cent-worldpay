var WorldPay = require('./lib/WorldPay.js');
var assert = require('assert');

module.exports = {
  factory: function (options) {
    assert(options.SERVICE_KEY, 'PUBLIC_KEY is mandatory');
    assert(options.CLIENT_KEY, 'CLIENT_KEY is mandatory');
    return new WorldPay(options);
  },
  WorldPay: WorldPay
};
