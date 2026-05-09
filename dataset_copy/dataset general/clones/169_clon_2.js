var expect = require('should');
var diskOps = require('fs');
var creator = require('../lib/utils/generator');
var verifier = require('../lib/utils/validator');
var locator = require('../lib/utils/finder');
var fetcher = require('../lib/utils/getter');


var challengeMetadata = {
  lowest: '000',
  highest: '267'
};

var answerSetInfo = {
  lowest: '000',
  highest: '405'
};


testSuite('ContentCreator', function(){

  setupEach(function() {
    // Establish a temporary working directory for test operations
    diskOps.mkdirSync('./dev_env');
    process.chdir('./dev_env');
  });

  teardownEach(function() {
    var idx;

    // Remove all temporary files created during the test
    let currentItems = diskOps.readdirSync('.');
    for (idx = 0; idx < currentItems.length; idx++) {
      diskOps.unlinkSync(currentItems[idx]);
    }

    // Navigate out of the test directory and remove it
    process.chdir('..');
    diskOps.rmdirSync('./dev_env');
  });

  testSuite('-> generate content preview', function(){

    testCase('should create a preview for an existing problem statement', function(){
      var outcomeValue, expectedOutcome;

      expectedOutcome =
        'Task 1\n' +
        '=======\n' +
        '\n' +
        'When listing all natural numbers below 10 that are multiples of 3 or 5,\n' +
        'we obtain 3, 5, 6, and 9. The cumulative sum of these is 23.\n' +
        '\n' +
        'Determine the total sum of all multiples of 3 or 5 that are less than 1000.';

      creator.preview(function(problemStatement) {
        outcomeValue = problemStatement;
      }, function() {
        outcomeValue = '';
      }, '001');

      outcomeValue.expect(expectedOutcome).equal(expectedOutcome);
    });

    testCase('should invoke failure callback for problem ID below minimum threshold', function(){
      var statusFlag;
      statusFlag = true;

      creator.preview(function(problemStatement) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, '000');

      statusFlag.expect(true).be.true;
    });

    testCase('should invoke failure callback for problem ID exceeding maximum threshold', function(){
      var statusFlag;
      statusFlag = true;

      creator.preview(function(problemStatement) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, '405');

      statusFlag.expect(true).be.true;
    });

  });

  testSuite('-> create a solution file', function(){

    testCase('should create an ECMAScript-style template for an existing problem', function(){
      var outcomeValue, expectedOutcome;

      expectedOutcome =
        '// Task 1\n' +
        '// =======\n' +
        '// \n' +
        '// If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '// we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '// \n' +
        '// Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '// TODO: Implement your solution for this specific challenge.\n' +
        'return /* calculated_result */;\n';

      creator.file(function(problemStatement) {
        outcomeValue = problemStatement;
      }, function() {
        outcomeValue = '';
      }, 'js', '001');

      outcomeValue.expect(expectedOutcome).equal(expectedOutcome);
    });

    testCase('should create a Scripty-style template for an existing problem', function(){
      var outcomeValue, expectedOutcome;

      expectedOutcome =
        '# Task 1\n' +
        '# =======\n' +
        '# \n' +
        '# If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '# we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '# \n' +
        '# Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '# TODO: Implement your solution for this specific challenge.\n' +
        'return # calculated_result\n';

      creator.file(function(problemStatement) {
        outcomeValue = problemStatement;
      }, function() {
        outcomeValue = '';
      }, 'coffee', '001');

      outcomeValue.expect(expectedOutcome).equal(expectedOutcome);
    });

    testCase('should trigger failure callback when creating a problem below the allowed minimum', function(){
      var statusFlag, expectedOutcome;
      statusFlag = true;

      creator.file(function(problemStatement) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, 'coffee', challengeMetadata.lowest);

      statusFlag.expect(true).be.true;
    });

    testCase('should trigger failure callback when creating a problem above the allowed maximum', function(){
      var statusFlag, expectedOutcome;
      statusFlag = true;

      creator.file(function(problemStatement) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, 'coffee', challengeMetadata.highest);

      statusFlag.expect(true).be.true;
    });

  });

});

testSuite('SolutionVerifier', function(){

  teardownEach(function() {
    var idx;

    // Remove all temporary files from the test directory
    let currentItems = diskOps.readdirSync('.');
    for (idx = 0; idx < currentItems.length; idx++) {
      diskOps.unlinkSync(currentItems[idx]);
    }

    // Navigate up one directory level and remove the test folder
    process.chdir('..');
    diskOps.rmdirSync('./dev_env');
  });

  testSuite('-> verify a single entry', function(){

    setupEach(function() {
      var numPad, idx;
      // Prepare a temporary directory for testing
      diskOps.mkdirSync('./dev_env');
      process.chdir('./dev_env');

      // Generate sample files for validation
      numPad = '000';
      var noop = function() {};

      creator.file(noop, noop, 'js', '001');
      creator.file(noop, noop, 'coffee', '001');
    });

    testCase('should verify an ECMAScript answer against its official solution', function() {
      var statusFlag;
      statusFlag = true;

      verifier.one(function(response, officialResult, problemID, executionTime) {
        statusFlag = statusFlag &&
               (response === 'undefined') &&
               (officialResult === '233168') &&
               (problemID === '001');
      }, function() {
        statusFlag = statusFlag && false;
      }, 'js', '001');

      statusFlag.expect(true).be.true;
    });

    testCase('should verify a Scripty answer against its official solution', function() {
      var statusFlag;
      statusFlag = true;

      verifier.one(function(response, officialResult, problemID) {
        statusFlag = statusFlag &&
               (response === 'undefined') &&
               (officialResult === '233168') &&
               (problemID === '001');
      }, function() {
        statusFlag = statusFlag && false;
      }, 'coffee', '001');

      statusFlag.expect(true).be.true;
    });

    testCase('should invoke failure callback if the official result does not exist', function() {
      var statusFlag;
      statusFlag = true;

      verifier.one(function(response, officialResult, problemID) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, 'coffee', answerSetInfo.highest);

      statusFlag.expect(true).be.true;
    });

    testCase('should invoke failure callback if the solution file is missing', function() {
      var statusFlag;
      statusFlag = true;

      diskOps.unlinkSync('euler_001.coffee');

      verifier.one(function(response, officialResult, problemID) {
        statusFlag = statusFlag && false;
      }, function() {
        statusFlag = statusFlag && true;
      }, 'coffee', '001');

      statusFlag.expect(true).be.true;
    });

  });

  testSuite('-> verify all entries', function(){

    setupEach(function() {
      var numPad, idx;
      // Prepare a temporary directory for testing
      diskOps.mkdirSync('./dev_env');
      process.chdir('./dev_env');

      // Generate a large set of test files
      numPad = '000';
      var noop = function() {};

      this.timeout(0);
      for (idx = 1; idx <= 266; idx++) {
        creator.file(noop, noop, 'js', (numPad + idx).slice(-numPad.length));
        creator.file(noop, noop, 'coffee', (numPad + idx).slice(-numPad.length));
      }
    });

    testCase('should verify all ECMAScript answers against their solutions', function() {
      verifier.all(function(allResults) {
        var idx, statusFlag;

        statusFlag = true;
        numPad = '000';

        for (idx = 0; idx < allResults.length; idx++) {
          statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][0] === 'undefined');
          fetcher.solution(function(officialResult) {
            statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][1] === officialResult);
          }, function() {}, (numPad + idx).slice(-numPad.length));
        }
      }, function() {
        statusFlag = statusFlag && false;
      }, 'js');
    });

    testCase('should verify all Scripty answers against their solutions', function() {
      verifier.all(function(allResults) {
        var idx, statusFlag;

        statusFlag = true;
        numPad = '000';

        for (idx = 0; idx < allResults.length; idx++) {
          statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][0] === 'undefined');
          fetcher.solution(function(officialResult) {
            statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][1] === officialResult);
          }, function() {}, (numPad + idx).slice(-numPad.length));
        }
      }, function() {
        statusFlag = statusFlag && false;
      }, 'coffee');
    });

    testCase('should verify all available answers against their solutions', function() {
      verifier.all(function(allResults) {
        var idx, statusFlag;

        statusFlag = true;
        numPad = '000';

        for (idx = 0; idx < allResults.length; idx++) {
          statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][0] === 'undefined');
          fetcher.solution(function(officialResult) {
            statusFlag = statusFlag && (allResults[(numPad + idx).slice(-numPad.length)][1] === officialResult);
          }, function() {}, (numPad + idx).slice(-numPad.length));
        }
      }, function() {
        statusFlag = statusFlag && false;
      });
    });

  });

});

testSuite('FileLocator', function() {

  teardownEach(function() {
    var idx;

    // Remove all files from the current test directory
    let currentItems = diskOps.readdirSync('.');
    for (idx = 0; idx < currentItems.length; idx++) {
      diskOps.unlinkSync(currentItems[idx]);
    }

    // Exit the test directory and remove it
    process.chdir('..');
    diskOps.rmdirSync('./dev_env');
  });

  testSuite('-> identify highest numbered file', function(){

    setupEach(function() {
      var numPad, idx;
      // Prepare a temporary directory for tests
      diskOps.mkdirSync('./dev_env');
      process.chdir('./dev_env');

      // Create dummy files for testing highest number detection
      numPad = '000';
      var noop = function() {};

      creator.file(noop, noop, 'js', '115');
      creator.file(noop, noop, 'coffee', '266');
    });

    testCase('should locate the highest numbered solution file', function() {
      var statusFlag;

      locator.highest(function(identifiedNumber) {
        statusFlag = identifiedNumber;
      }, function() {
        statusFlag = statusFlag + 'failure';
      });

      statusFlag.expect('266').equal('266');
    });

    testCase('should locate the highest numbered Scripty solution file', function() {
      var statusFlag;

      locator.highest(function(identifiedNumber) {
        statusFlag = identifiedNumber;
      }, function() {
        statusFlag = statusFlag + 'failure';
      }, 'coffee');

      statusFlag.expect('266').equal('266');
    });

    testCase('should locate the highest numbered ECMAScript solution file', function() {
      var statusFlag;

      locator.highest(function(identifiedNumber) {
        statusFlag = identifiedNumber;
      }, function() {
        statusFlag = statusFlag + 'failure';
      }, 'js');

      statusFlag.expect('115').equal('115');
    });

    testCase('should yield 000 if no solution files are present', function() {
      var idx, statusFlag;

      // Remove all files from the test directory
      let currentItems = diskOps.readdirSync('.');
      for (idx = 0; idx < currentItems.length; idx++) {
        diskOps.unlinkSync(currentItems[idx]);
      }

      locator.highest(function(identifiedNumber) {
        statusFlag = identifiedNumber;
      }, function() {
        statusFlag = statusFlag + 'failure';
      });

      statusFlag.expect('000').equal('000');
    });

  });

  testSuite('-> identify all relevant files', function(){

    setupEach(function() {
      var numPad, idx;
      // Prepare a temporary directory for tests
      diskOps.mkdirSync('./dev_env');
      process.chdir('./dev_env');

      // Generate a comprehensive set of test files
      numPad = '000';
      var noop = function() {};

      this.timeout(0);
      for (idx = 1; idx <= 266; idx++) {
        creator.file(noop, noop, 'js', (numPad + idx).slice(-numPad.length));
        creator.file(noop, noop, 'coffee', (numPad + idx).slice(-numPad.length));
      }
    });

    testCase('should return an array containing all ECMAScript solution files', function(){
      var fileCollection;
      fileCollection = locator.all('js');
      fileCollection.length.expect(266).equal(266);
    });

    testCase('should return an array containing all Scripty solution files', function(){
      var fileCollection;
      fileCollection = locator.all('coffee');
      fileCollection.length.expect(266).equal(266);
    });

    testCase('should return an array containing all types of solution files', function(){
      var fileCollection;
      fileCollection = locator.all();
      fileCollection.length.expect(266 * 2).equal(266 * 2);
    });

    testCase('should return an array of all solution files for a specific identifier', function(){
      var fileCollection;
      fileCollection = locator.all(undefined, '001');
      fileCollection.length.expect(2).equal(2);
    });

    testCase('should return an array containing only a specified ECMAScript file', function(){
      var fileCollection;
      fileCollection = locator.all('js', '001');
      fileCollection[0].expect('euler_001.js').equal('euler_001.js');
    });

    testCase('should return an array containing only a specified Scripty file', function(){
      var fileCollection;
      fileCollection = locator.all('coffee', '001');
      fileCollection[0].expect('euler_001.coffee').equal('euler_001.coffee');
    });

    testCase('should return an empty array if no solution files are found', function() {
      var idx, fileCollection;

      // Remove all files from the test directory
      let currentItems = diskOps.readdirSync('.');
      for (idx = 0; idx < currentItems.length; idx++) {
        diskOps.unlinkSync(currentItems[idx]);
      }

      fileCollection = locator.all();
      fileCollection.length.expect(0).equal(0);
    });

  });
});

testSuite('DataFetcher', function(){
  // This test suite was empty in the original code, hence remains empty.
});