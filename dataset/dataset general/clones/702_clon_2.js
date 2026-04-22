const projectBuilder = require('grunt');
const fileSysAccess = require('fs');

const executionEnvironment = process;

function retrieveFileContents (resourcePath) {
  'use strict';
  let documentData = projectBuilder.file.read(resourcePath);

  if (executionEnvironment.platform === 'win32') {
    documentData = documentData.replace(/\r\n/g, '\n');
  }

  return documentData;
}

function confirmContentMatch (testRunner, sourceFile, referenceFile, issueDescription) {
    const currentContent = retrieveFileContents(sourceFile);
    const targetContent = retrieveFileContents(referenceFile);
    testRunner.equal(targetContent, currentContent, issueDescription);
}

module.exports.integrateAssets = function (testRunner) {
    'use strict';

    testRunner.expect(4);

    confirmContentMatch(testRunner,
      'tmp/img_greedy.min.html',
      'test/expected/img_greedy.min.html',
      'Should compile two image target without newline characters');

    confirmContentMatch(testRunner,
      'tmp/css_greedy.min.html',
      'test/expected/css_greedy.min.html',
      'Should compile two link target without newline characters');

    confirmContentMatch(testRunner,
      'tmp/html_greedy.min.html',
      'test/expected/html_greedy.min.html',
      'Should compile two inline target without newline characters');

    confirmContentMatch(testRunner,
      'tmp/script_greedy.min.html',
      'test/expected/script_greedy.min.html',
      'Should compile two script target without newline characters');

    testRunner.done();
};