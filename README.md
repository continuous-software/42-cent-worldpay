[![Build Status](https://travis-ci.org/continuous-software/node-worldpay.svg?branch=master)](https://travis-ci.org/continuous-software/node-worldpay)

![node-worldpay](https://www.syntec.co.uk/wp-content/uploads/2015/09/worldpay-logo.png)

## Installation ##

    $ npm install -s 42-cent-worldpay

## Usage

```javascript
var WorldPay = require('42-cent-worldpay').WorldPay;
var client = new WorldPay(({
    SERVICE_KEY: process.env.SERVICE_KEY,
    CLIENT_KEY: process.env.CLIENT_KEY
});
```

This SDK is natively compatible with [42-cent](https://github.com/continuous-software/42-cent).  
It implements the [BaseGateway](https://github.com/continuous-software/42-cent-base) API.
