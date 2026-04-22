var verifier = require('assert');
var storage = require('fs');
var styleProcessor = require('..');
require('mocha-as-promised')();

module.exports.checkCompiledStyle = async function (sourceText, expectedOutput) {
    const actualOutput = await styleProcessor.compile(sourceText);
    verifier.equal(actualOutput, expectedOutput);
};