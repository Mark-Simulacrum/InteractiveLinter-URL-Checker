var _ = require('lodash');
var request = require('request');
var messages = require("./jshint-messages");

var notFoundCount = 0;
var processedCount = 0;
var foundErrors = [];

function handleMessage(message, code) {
    'use strict';

    if (!message) {
        ++processedCount;
        return;
    }

    var root = "http://jslinterrors.com/";
    var originalMessage = message;
    message = message
        .replace(/'*\{*(\w*)\}*'*/g, "$1")
        .replace(/\s/g, '-')
        .replace(/\..*?$/, '')
        .replace(/['"]/g, '')
        .replace(/\/=/, '')
        .replace(/\(\)/, '')
        .replace(/\//g, '-')
        .replace(/--/g, '-')
        .toLowerCase();
    var url = encodeURI(root + message);


    request.head(url, function (err, response) {
        processedCount++;
        if (response.statusCode !== 200) {
            notFoundCount++;
            foundErrors.push({
                code: code,
                url: url,
                originalMessage: originalMessage,
                message: message
            });
        }
    });
}

_.forEach(messages, handleMessage);

function logResults() {
    foundErrors = _.sortBy(foundErrors, 'code');

    _.forEach(foundErrors, function (error) {
        console.log(error.code, ":", error.url);
        console.log("\t", error.originalMessage);
        console.log("\t", error.message);
    });
}

function setCallback() {
    setTimeout(function () {
        if (processedCount === _.size(messages)) {
            console.log('Total messages:', _.size(messages));
            console.log('404s encountered:', foundErrors.length);
            logResults();
        } else {
            console.log('setting callback, processed', (processedCount / _.size(messages)) * 100 + '%');
            setCallback();
        }
    }, 2000);
}

setCallback();
