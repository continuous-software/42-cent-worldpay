[![Build Status](https://travis-ci.org/continuous-software/node-worldpay.svg?branch=master)](https://travis-ci.org/continuous-software/node-worldpay)

![node-worldpay](https://worldpay.ncr.com/media/worldpay/images/Home/worldpay_logo_v1_m56577569830484834.png)

## Installation ##

    $ npm install -s 42-cent-worldpay

## Usage

```javascript
var WorldPay = require('42-cent-worldpay').WorldPay;
var client = new WorldPay({
    SERVICE_KEY: '<PLACEHOLDER>',
    CLIENT_KEY: '<PLACEHOLDER>'
});
```

This SDK is natively compatible with [42-cent](https://github.com/continuous-software/42-cent).  
It implements the [BaseGateway](https://github.com/continuous-software/42-cent-base) API.
