'use strict';

var express    = require('express'),
	zarinpal   = require('zarinpal-checkout'),
	bodyParser = require('body-parser'),
	app        = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/**
 * Initial ZarinPal module.
 * @param {String} 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' [MerchantID]
 * @param {bool} false [toggle `Sandbox` mode]
 */
var zarinpal = zarinpal.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', false);

/**
 * Route: PaymentRequest [module]
 * @return {String} URL [Payement Authority]
 */
app.get('/PaymentRequest', function(req, res) {
	zarinpal.PaymentRequest('1000', 'http://siamak.us', 'Hello NodeJS API.', 'hi@siamak.work', '09120000000', function (status, url) {
		if (status === 100) {
			res.redirect(url);
		}
	});
});


/**
 * Route: PaymentVerification [module]
 * @return {number} RefID [Check Paymenet state]
 */
app.get('/PaymentVerification/:amout/:token', function(req, res) {
	zarinpal.PaymentVerification(req.params.amout, req.params.token, function (status, RefID) {
		if (status == -21) {
			res.send('It Doesn`t any transaction!');
		} else {
			res.send('Yohoooo! ' + RefID);
		}
	});
});


/**
 * Route: UnverifiedTransactions [module]
 * @return {Object} authorities [List of Unverified transactions]
 */
app.get('/UnverifiedTransactions', function(req, res) {
	zarinpal.PaymentVerification(function (status, authorities) {
		if (status == 100) {
			res.send(authorities);
		}
	});
});


/**
 * Route: Refresh Authority [module]
 * @param {number} expire [(1800 / 60) = 30min]
 * @return {String} status [Status of Authority]
 */
app.get('/RefreshAuthority/:expire/:token', function(req, res) {
	zarinpal.RefreshAuthority(req.params.token, req.params.expire, function (status) {
		if (status == 100) {
			res.send('<h2>You can Use: <u>' + req.params.token + '</u> — Expire in: <u>' + req.params.expire + '</u></h2>');
		}
	});
});


/**
 * Serve App on 9990
 */
app.listen(9990, function() {
	console.log('App is Running on Port 9990.');
});
