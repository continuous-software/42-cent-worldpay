[![Build Status](https://travis-ci.org/continuous-software/42-cent-worldpay.svg?branch=master)](https://travis-ci.org/continuous-software/42-cent-worldpay) [![Greenkeeper badge](https://badges.greenkeeper.io/continuous-software/42-cent-worldpay.svg)](https://greenkeeper.io/)

<img src="https://www.worldpay.com/sites/all/themes/custom/worldpay/img/brand/worldpay-logo.svg" height=84 alt="42-cent-worldpay"/>

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
