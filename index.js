'use strict';

var express          = require('express'),
		ZarinpalCheckout = require('zarinpal-checkout'),
		bodyParser       = require('body-parser'),
		app              = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/**
 * Initial ZarinPal module.
 * @param {String} 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' [MerchantID]
 * @param {bool} false [toggle `Sandbox` mode]
 */
var zarinpal = ZarinpalCheckout.create('c5fd5af2-f981-11e5-8d49-005056a205be', false);

/**
 * Route: PaymentRequest [module]
 * @return {String} URL [Payement Authority]
 */
app.get('/PaymentRequest', function(req, res) {
	zarinpal.PaymentRequest({
		Amount: '1000',
		CallbackURL: 'http://siamak.us',
		Description: 'Hello NodeJS API.',
		Email: 'hi@siamak.work',
		Mobile: '09120000000'
	}).then(function (response) {
		if (response.status == 100) {
			res.redirect(response.url);
		}
	}).catch(function (err) {
		console.log(err);
	});
});


/**
 * Route: PaymentVerification [module]
 * @return {number} RefID [Check Paymenet state]
 */
app.get('/PaymentVerification/:amount/:token', function(req, res) {
	zarinpal.PaymentVerification({
		Amount: req.params.amount,
		Authority: req.params.token,
	}).then(function (response) {
		if (response.status == -21) {
			console.log('Empty!');
		} else {
			console.log('Yohoooo! ' + response.RefID);
		}
	}).catch(function (err) {
		console.log(err);
	});
});


/**
 * Route: UnverifiedTransactions [module]
 * @return {Object} authorities [List of Unverified transactions]
 */
app.get('/UnverifiedTransactions', function(req, res) {
	zarinpal.UnverifiedTransactions().then(function (response) {
		if (response.status == 100) {
			console.log(response.authorities);
		}
	}).catch(function (err) {
		console.log(err);
	});
});


/**
 * Route: Refresh Authority [module]
 * @param {number} expire [(1800 / 60) = 30min]
 * @return {String} status [Status of Authority]
 */
app.get('/RefreshAuthority/:expire/:token', function(req, res) {
	zarinpal.RefreshAuthority({
		Authority: req.params.token,
		Expire: req.params.expire
	}).then(function (response) {
		if (response.status == 100) {
			res.send('<h2>You can Use: <u>' + req.params.token + '</u> — Expire in: <u>' + req.params.expire + '</u></h2>');
		}
	}).catch(function (err) {
		console.log(err);
	});
});


/**
 * Serve App on 9990
 */
app.listen(9990, function() {
	console.log('App is Running on Port 9990.');
});
