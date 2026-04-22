const expectAssertions = require('should');
const nodeFileSys = require('fs');
const challengeCreator = require('../lib/utils/generator');
const resultVerifier = require('../lib/utils/validator');
const assetLocator = require('../lib/utils/finder');
const infoRetriever = require('../lib/utils/getter');

// Constants defining the range of problem identifiers
const challengeRange = {
  lowerBound: '000',
  upperBound: '267'
};

const answerLimits = {
  minProb: '000',
  maxProb: '405'
};

// Helper constant for temporary directory management
const TEMP_WORKSPACE_DIR = './temp_challenge_workspace';

// Test suite for the problem generation utilities
describe('Problem Generation Module', function() {

  // Setup: Create a temporary directory before each test
  beforeEach(function() {
    // Ensure a clean test environment by creating a dedicated folder
    nodeFileSys.mkdirSync(TEMP_WORKSPACE_DIR);
    process.chdir(TEMP_WORKSPACE_DIR); // Change into the new directory
    // console.log(`Switched to temporary directory: ${process.cwd()}`); // Optional debug log
  });

  // Teardown: Clean up the temporary directory after each test
  afterEach(function() {
    // A small delay might be needed for some OS to release file handles
    const directoryContents = nodeFileSys.readdirSync('.');

    // Delete all files within the current test directory
    for (const item of directoryContents) {
      nodeFileSys.unlinkSync(item);
    }

    // Navigate back to the parent directory and remove the temporary folder
    process.chdir('..');
    nodeFileSys.rmdirSync(TEMP_WORKSPACE_DIR);
    // console.log(`Cleaned up temporary directory: ${TEMP_WORKSPACE_DIR}`); // Optional debug log
  });

  // Sub-suite for preview content generation
  describe('Preview Content Creation', function() {

    // Test case: Verify a preview is generated for an existing problem ID
    it('should successfully retrieve and display preview text for an existing challenge', function() {
      let receivedContent;
      const expectedOutput = `Problem 1
=========

If we list all the natural numbers below 10 that are multiples of 3 or 5,
we get 3, 5, 6 and 9. The sum of these multiples is 23.

Find the sum of all the multiples of 3 or 5 below 1000.`;
      const problemIdentifier = '001';

      challengeCreator.displayPreview(
        (previewText) => {
          receivedContent = previewText;
          // console.log('Successfully received preview content.'); // Debug
        },
        () => {
          receivedContent = 'ERROR: Failure callback invoked unexpectedly.';
          // console.error('Preview generation failed unexpectedly.'); // Debug
        },
        problemIdentifier
      );

      expectAssertions(receivedContent).to.equal(expectedOutput);
    });

    // Test case: Ensure failure callback is triggered for a problem ID below the minimum
    it('should invoke the failure handler when requesting a challenge ID below the lowest allowed', function() {
      let operationSuccess = true;
      const invalidProblemId = challengeRange.lowerBound; // Use the defined lower bound

      challengeCreator.displayPreview(
        (previewText) => {
          operationSuccess = false; // If success callback runs, it's a failure for this test
          console.warn(`Unexpected success for invalid ID: ${previewText}`);
        },
        () => {
          // This is the expected path for this test
          operationSuccess = true;
          // console.log('Failure callback correctly invoked for invalid ID.'); // Debug
        },
        invalidProblemId
      );

      expectAssertions(operationSuccess).to.be.true();
    });

    // Test case: Ensure failure callback is triggered for a problem ID above the maximum
    it('should activate the error handler when attempting to retrieve a challenge ID exceeding the maximum limit', function() {
      let operationResult = true;
      const excessiveProblemId = '405'; // A hardcoded value beyond typical max

      challengeCreator.displayPreview(
        (previewText) => {
          operationResult = false; // Incorrectly succeeded
          console.warn(`Unexpected success for out-of-bounds ID: ${previewText}`);
        },
        () => {
          // Correctly failed
          operationResult = true;
          // console.log('Failure callback correctly invoked for out-of-bounds ID.'); // Debug
        },
        excessiveProblemId
      );

      expectAssertions(operationResult).to.be.true();
    });

  });

  // Sub-suite for file template generation
  describe('File Template Generation', function() {

    // Test case: Generate a JavaScript template for an existing problem
    it('should produce a JavaScript-style template file for an available problem', function() {
      let generatedContent;
      const expectedJsTemplate = `// Problem 1
// =========
// 
// If we list all the natural numbers below 10 that are multiples of 3 or 5,
// we get 3, 5, 6 and 9. The sum of these multiples is 23.
// 
// Find the sum of all the multiples of 3 or 5 below 1000.



// TODO: Implement your solution for this problem here.
return /* your solution */;
`;
      const targetLanguage = 'js';
      const challengeNumber = '001';

      challengeCreator.createTemplateFile(
        (templateText) => {
          generatedContent = templateText;
          // console.log(`JS template generated for ${challengeNumber}`); // Debug
        },
        () => {
          generatedContent = 'ERROR: JS template generation failed.';
          console.error('JS template generation failed unexpectedly.');
        },
        targetLanguage,
        challengeNumber
      );

      expectAssertions(generatedContent).to.equal(expectedJsTemplate);
    });

    // Test case: Generate a CoffeeScript template for an existing problem
    it('should create a CoffeeScript-formatted template for an existing problem', function() {
      let generatedContent;
      const expectedCoffeeTemplate = `# Problem 1
# =========
# 
# If we list all the natural numbers below 10 that are multiples of 3 or 5,
# we get 3, 5, 6 and 9. The sum of these multiples is 23.
# 
# Find the sum of all the multiples of 3 or 5 below 1000.



# TODO: Implement your solution for this problem here.
return # your solution
`;
      const targetLanguage = 'coffee';
      const challengeNumber = '001';

      challengeCreator.createTemplateFile(
        (templateText) => {
          generatedContent = templateText;
          // console.log(`CoffeeScript template generated for ${challengeNumber}`); // Debug
        },
        () => {
          generatedContent = 'ERROR: CoffeeScript template generation failed.';
          console.error('CoffeeScript template generation failed unexpectedly.');
        },
        targetLanguage,
        challengeNumber
      );

      expectAssertions(generatedContent).to.equal(expectedCoffeeTemplate);
    });

    // Test case: Ensure failure callback for a problem ID below the minimum
    it('should trigger the failure handler when asked to generate a template for an ID below the minimum threshold', function() {
      let statusIndicator = true;
      const targetLanguage = 'coffee';
      const problemId = challengeRange.lowerBound; // Using the defined lower bound

      challengeCreator.createTemplateFile(
        (template) => {
          statusIndicator = false; // Should not succeed
          console.warn(`Unexpected success for template generation with ID ${problemId}: ${template}`);
        },
        () => {
          statusIndicator = true; // Expected failure
          // console.log(`Correctly failed to generate template for ID ${problemId}.`); // Debug
        },
        targetLanguage,
        problemId
      );

      expectAssertions(statusIndicator).to.be.true();
    });

    // Test case: Ensure failure callback for a problem ID above the maximum
    it('should activate the failure callback when attempting to generate a template for an ID beyond the maximum allowed', function() {
      let statusIndicator = true;
      const targetLanguage = 'coffee';
      const problemId = challengeRange.upperBound; // Using the defined upper bound

      challengeCreator.createTemplateFile(
        (template) => {
          statusIndicator = false; // Should not succeed
          console.warn(`Unexpected success for template generation with ID ${problemId}: ${template}`);
        },
        () => {
          statusIndicator = true; // Expected failure
          // console.log(`Correctly failed to generate template for ID ${problemId}.`); // Debug
        },
        targetLanguage,
        problemId
      );

      expectAssertions(statusIndicator).to.be.true();
    });

  });

});

// Test suite for the solution validation utilities
describe('Solution Verification Module', function() {

  const tempDir = TEMP_WORKSPACE_DIR; // Use the same directory constant

  // Teardown: Clean up the temporary directory after each test
  afterEach(function() {
    const workspaceItems = nodeFileSys.readdirSync('.');
    workspaceItems.forEach(item => nodeFileSys.unlinkSync(item));
    process.chdir('..');
    nodeFileSys.rmdirSync(tempDir);
  });

  // Sub-suite for single solution validation
  describe('Single Solution Check', function() {

    // Setup: Create a temporary directory and some test files before each test
    beforeEach(function() {
      nodeFileSys.mkdirSync(tempDir);
      process.chdir(tempDir);

      const noOpCallback = () => {}; // A dummy function for callbacks
      challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'js', '001');
      challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'coffee', '001');
      // console.log('Created dummy solution files for single validation tests.'); // Debug
    });

    // Test case: Validate a JavaScript answer against its expected solution
    it('should correctly validate a JavaScript-based answer against its known solution', function() {
      let validationStatus = false;
      const targetLanguage = 'js';
      const problemId = '001';
      const expectedSolutionValue = '233168'; // Known correct answer for Problem 1

      resultVerifier.verifySingle(
        (userResult, correctAnswer, problemIdNumber, execTime) => {
          // Check if the received values match expectations
          validationStatus = (userResult === 'undefined') && // User's code returns 'undefined' initially
                           (correctAnswer === expectedSolutionValue) &&
                           (problemIdNumber === problemId);
          // console.log(`JS validation callback: UserResult=${userResult}, CorrectAnswer=${correctAnswer}, ProblemId=${problemIdNumber}`); // Debug
        },
        () => {
          validationStatus = false; // Failure callback invoked incorrectly
          console.error('JS validation failed unexpectedly.');
        },
        targetLanguage,
        problemId
      );

      expectAssertions(validationStatus).to.be.true();
    });

    // Test case: Validate a CoffeeScript answer against its expected solution
    it('should correctly validate a CoffeeScript-based answer against its known solution', function() {
      let validationStatus = false;
      const targetLanguage = 'coffee';
      const problemId = '001';
      const expectedSolutionValue = '233168'; // Known correct answer for Problem 1

      resultVerifier.verifySingle(
        (userResult, correctAnswer, problemIdNumber) => {
          // Check if the received values match expectations
          validationStatus = (userResult === 'undefined') &&
                           (correctAnswer === expectedSolutionValue) &&
                           (problemIdNumber === problemId);
          // console.log(`CoffeeScript validation callback: UserResult=${userResult}, CorrectAnswer=${correctAnswer}, ProblemId=${problemIdNumber}`); // Debug
        },
        () => {
          validationStatus = false; // Failure callback invoked incorrectly
          console.error('CoffeeScript validation failed unexpectedly.');
        },
        targetLanguage,
        problemId
      );

      expectAssertions(validationStatus).to.be.true();
    });

    // Test case: Ensure failure callback if solution data does not exist
    it('should invoke the failure handler if the corresponding solution data cannot be found', function() {
      let validationStatus = true;
      const nonExistentProblemId = answerLimits.maxProb; // A problem ID for which no solution might exist

      resultVerifier.verifySingle(
        (userResult, correctAnswer, problemIdNumber) => {
          validationStatus = false; // Success callback invoked incorrectly
          console.warn(`Unexpected success for non-existent solution: ${problemIdNumber}`);
        },
        () => {
          validationStatus = true; // Expected failure
          // console.log('Failure callback correctly invoked for missing solution data.'); // Debug
        },
        'coffee',
        nonExistentProblemId
      );

      expectAssertions(validationStatus).to.be.true();
    });

    // Test case: Ensure failure callback if the user's file does not exist
    it('should trigger the failure callback if the user\'s problem file is missing', function() {
      let validationStatus = true;
      const problemId = '001';
      const missingFile = `euler_${problemId}.coffee`;

      // Manually delete a generated file to simulate it being missing
      nodeFileSys.unlinkSync(missingFile);
      // console.log(`Deleted file: ${missingFile} to simulate missing user file.`); // Debug

      resultVerifier.verifySingle(
        (userResult, correctAnswer, problemIdNumber) => {
          validationStatus = false; // Success callback invoked incorrectly
          console.warn(`Unexpected success for missing user file: ${problemIdNumber}`);
        },
        () => {
          validationStatus = true; // Expected failure
          // console.log('Failure callback correctly invoked for missing user file.'); // Debug
        },
        'coffee',
        problemId
      );

      expectAssertions(validationStatus).to.be.true();
    });

  });

  // Sub-suite for batch solution validation
  describe('Batch Solution Verification', function() {

    // Setup: Create a temporary directory and numerous test files before each test
    beforeEach(function() {
      nodeFileSys.mkdirSync(tempDir);
      process.chdir(tempDir);

      const noOpCallback = () => {};
      const zeroPad = '000';
      this.timeout(0); // Disable timeout for potentially long file generation

      // Generate a range of JavaScript and CoffeeScript files
      Array.from({ length: 266 }, (_, idx) => idx + 1).forEach(i => {
        const paddedId = (zeroPad + i).slice(-zeroPad.length);
        challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'js', paddedId);
        challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'coffee', paddedId);
      });
      // console.log('Generated multiple dummy solution files for batch validation.'); // Debug
    });

    // Test case: Validate all JavaScript answers
    it('should validate all generated JavaScript answers against their respective solutions', function(done) {
      let overallSuccess = true;
      const zeroPad = '000';

      resultVerifier.verifyAll(
        (allResults) => {
          // console.log(`Received ${Object.keys(allResults).length} JS results.`); // Debug
          for (let i = 1; i <= 266; i++) {
            const paddedId = (zeroPad + i).slice(-zeroPad.length);
            const currentResult = allResults[paddedId];

            if (!currentResult || currentResult[0] !== 'undefined') {
              overallSuccess = false;
              console.error(`JS result mismatch for ID ${paddedId}: ${currentResult}`);
              break;
            }

            // Asynchronously fetch solution to compare
            infoRetriever.retrieveSolution(
              (expectedVal) => {
                if (currentResult[1] !== expectedVal) {
                  overallSuccess = false;
                  console.error(`JS solution mismatch for ID ${paddedId}: expected ${expectedVal}, got ${currentResult[1]}`);
                }
              },
              () => {
                overallSuccess = false;
                console.error(`Failed to retrieve solution for JS ID ${paddedId}`);
              },
              paddedId
            );
          }
          expectAssertions(overallSuccess).to.be.true();
          done();
        },
        () => {
          overallSuccess = false;
          console.error('Batch JS validation failed unexpectedly.');
          expectAssertions(overallSuccess).to.be.true(); // This will fail the test
          done();
        },
        'js'
      );
    });

    // Test case: Validate all CoffeeScript answers
    it('should validate all generated CoffeeScript answers against their respective solutions', function(done) {
      let overallSuccess = true;
      const zeroPad = '000';

      resultVerifier.verifyAll(
        (allResults) => {
          // console.log(`Received ${Object.keys(allResults).length} CoffeeScript results.`); // Debug
          for (let i = 1; i <= 266; i++) {
            const paddedId = (zeroPad + i).slice(-zeroPad.length);
            const currentResult = allResults[paddedId];

            if (!currentResult || currentResult[0] !== 'undefined') {
              overallSuccess = false;
              console.error(`CoffeeScript result mismatch for ID ${paddedId}: ${currentResult}`);
              break;
            }

            infoRetriever.retrieveSolution(
              (expectedVal) => {
                if (currentResult[1] !== expectedVal) {
                  overallSuccess = false;
                  console.error(`CoffeeScript solution mismatch for ID ${paddedId}: expected ${expectedVal}, got ${currentResult[1]}`);
                }
              },
              () => {
                overallSuccess = false;
                console.error(`Failed to retrieve solution for CoffeeScript ID ${paddedId}`);
              },
              paddedId
            );
          }
          expectAssertions(overallSuccess).to.be.true();
          done();
        },
        () => {
          overallSuccess = false;
          console.error('Batch CoffeeScript validation failed unexpectedly.');
          expectAssertions(overallSuccess).to.be.true();
          done();
        },
        'coffee'
      );
    });

    // Test case: Validate all answers regardless of language
    it('should validate all available answers (both JS and CoffeeScript) against their solutions', function(done) {
      let overallSuccess = true;
      const zeroPad = '000';

      resultVerifier.verifyAll(
        (allResults) => {
          // console.log(`Received ${Object.keys(allResults).length} total results.`); // Debug
          for (let i = 1; i <= 266; i++) {
            const paddedId = (zeroPad + i).slice(-zeroPad.length);
            const currentResult = allResults[paddedId];

            if (!currentResult || currentResult[0] !== 'undefined') {
              overallSuccess = false;
              console.error(`General result mismatch for ID ${paddedId}: ${currentResult}`);
              break;
            }

            infoRetriever.retrieveSolution(
              (expectedVal) => {
                if (currentResult[1] !== expectedVal) {
                  overallSuccess = false;
                  console.error(`General solution mismatch for ID ${paddedId}: expected ${expectedVal}, got ${currentResult[1]}`);
                }
              },
              () => {
                overallSuccess = false;
                console.error(`Failed to retrieve solution for general ID ${paddedId}`);
              },
              paddedId
            );
          }
          expectAssertions(overallSuccess).to.be.true();
          done();
        },
        () => {
          overallSuccess = false;
          console.error('Batch general validation failed unexpectedly.');
          expectAssertions(overallSuccess).to.be.true();
          done();
        }
        // No language specified, so it validates all
      );
    });

  });

});

// Test suite for the file finding utilities
describe('Resource Location Module', function() {

  const tempDir = TEMP_WORKSPACE_DIR;

  // Teardown: Clean up the temporary directory after each test
  afterEach(function() {
    const workspaceItems = nodeFileSys.readdirSync('.');
    workspaceItems.forEach(item => nodeFileSys.unlinkSync(item));
    process.chdir('..');
    nodeFileSys.rmdirSync(tempDir);
  });

  // Sub-suite for finding the highest problem identifier
  describe('Highest Problem Identifier Discovery', function() {

    // Setup: Create a temporary directory and some specific test files
    beforeEach(function() {
      nodeFileSys.mkdirSync(tempDir);
      process.chdir(tempDir);

      const noOpCallback = () => {};
      // Create files with specific, non-sequential IDs
      challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'js', '115');
      challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'coffee', '266');
      challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'js', '050');
      // console.log('Created specific files for highest ID discovery tests.'); // Debug
    });

    // Test case: Find the highest solution file number across all languages
    it('should correctly identify the highest numbered solution file overall', function() {
      let highestIdFound = 'initial_state';

      assetLocator.locateHighest(
        (discoveredId) => {
          highestIdFound = discoveredId;
          // console.log(`Highest ID discovered: ${discoveredId}`); // Debug
        },
        () => {
          highestIdFound = 'error_state'; // Failure callback invoked incorrectly
          console.error('Highest ID discovery failed unexpectedly.');
        }
      );

      expectAssertions(highestIdFound).to.equal('266');
    });

    // Test case: Find the highest CoffeeScript solution file number
    it('should determine the highest numbered CoffeeScript solution file', function() {
      let highestIdFound;

      assetLocator.locateHighest(
        (discoveredId) => {
          highestIdFound = discoveredId;
          // console.log(`Highest CoffeeScript ID discovered: ${discoveredId}`); // Debug
        },
        () => {
          highestIdFound = 'error_state';
          console.error('Highest CoffeeScript ID discovery failed unexpectedly.');
        },
        'coffee'
      );

      expectAssertions(highestIdFound).to.equal('266');
    });

    // Test case: Find the highest JavaScript solution file number
    it('should determine the highest numbered JavaScript solution file', function() {
      let highestIdFound;

      assetLocator.locateHighest(
        (discoveredId) => {
          highestIdFound = discoveredId;
          // console.log(`Highest JavaScript ID discovered: ${discoveredId}`); // Debug
        },
        () => {
          highestIdFound = 'error_state';
          console.error('Highest JavaScript ID discovery failed unexpectedly.');
        },
        'js'
      );

      expectAssertions(highestIdFound).to.equal('115');
    });

    // Test case: Return '000' if no solution files exist
    it('should return "000" if no solution files are present in the directory', function() {
      let highestIdFound;

      // Delete all existing files to simulate an empty state
      const currentFiles = nodeFileSys.readdirSync('.');
      currentFiles.forEach(file => nodeFileSys.unlinkSync(file));
      // console.log('All files deleted to test empty directory highest ID.'); // Debug

      assetLocator.locateHighest(
        (discoveredId) => {
          highestIdFound = discoveredId;
          // console.log(`Highest ID in empty directory: ${discoveredId}`); // Debug
        },
        () => {
          highestIdFound = 'error_state';
          console.error('Highest ID discovery failed in empty directory unexpectedly.');
        }
      );

      expectAssertions(highestIdFound).to.equal('000');
    });

  });

  // Sub-suite for finding all solution files
  describe('Comprehensive File Listing', function() {

    // Setup: Create a temporary directory and numerous test files
    beforeEach(function() {
      nodeFileSys.mkdirSync(tempDir);
      process.chdir(tempDir);

      const noOpCallback = () => {};
      const zeroPad = '000';
      this.timeout(0);

      // Generate a large set of JS and CoffeeScript files
      Array.from({ length: 266 }, (_, idx) => idx + 1).forEach(i => {
        const paddedId = (zeroPad + i).slice(-zeroPad.length);
        challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'js', paddedId);
        challengeCreator.createTemplateFile(noOpCallback, noOpCallback, 'coffee', paddedId);
      });
      // console.log('Generated extensive files for comprehensive listing tests.'); // Debug
    });

    // Test case: Return an array of all JavaScript solution files
    it('should provide an array containing all JavaScript solution files', function() {
      const foundFilesCollection = assetLocator.retrieveAll('js');
      expectAssertions(foundFilesCollection).to.have.lengthOf(266);
      expectAssertions(foundFilesCollection.every(f => f.endsWith('.js'))).to.be.true();
      // console.log(`Found ${foundFilesCollection.length} JS files.`); // Debug
    });

    // Test case: Return an array of all CoffeeScript solution files
    it('should provide an array containing all CoffeeScript solution files', function() {
      const foundFilesCollection = assetLocator.retrieveAll('coffee');
      expectAssertions(foundFilesCollection).to.have.lengthOf(266);
      expectAssertions(foundFilesCollection.every(f => f.endsWith('.coffee'))).to.be.true();
      // console.log(`Found ${foundFilesCollection.length} CoffeeScript files.`); // Debug
    });

    // Test case: Return an array of all solution files (mixed languages)
    it('should provide an array containing all solution files regardless of language', function() {
      const foundFilesCollection = assetLocator.retrieveAll(); // No language specified
      expectAssertions(foundFilesCollection).to.have.lengthOf(266 * 2);
      // console.log(`Found ${foundFilesCollection.length} total files.`); // Debug
    });

    // Test case: Return an array of all solution files for a given problem number
    it('should provide an array of all solution files associated with a specific problem identifier', function() {
      const foundFilesCollection = assetLocator.retrieveAll(undefined, '001'); // Language undefined, specific ID
      expectAssertions(foundFilesCollection).to.have.lengthOf(2);
      expectAssertions(foundFilesCollection).to.include('euler_001.js');
      expectAssertions(foundFilesCollection).to.include('euler_001.coffee');
      // console.log(`Found ${foundFilesCollection.length} files for ID 001.`); // Debug
    });

    // Test case: Return an array containing only a specified JavaScript file
    it('should return an array containing only a single, specified JavaScript file', function() {
      const foundFilesCollection = assetLocator.retrieveAll('js', '001');
      expectAssertions(foundFilesCollection).to.have.lengthOf(1);
      expectAssertions(foundFilesCollection[0]).to.equal('euler_001.js');
      // console.log(`Found specific JS file: ${foundFilesCollection[0]}`); // Debug
    });

    // Test case: Return an array containing only a specified CoffeeScript file
    it('should return an array containing only a single, specified CoffeeScript file', function() {
      const foundFilesCollection = assetLocator.retrieveAll('coffee', '001');
      expectAssertions(foundFilesCollection).to.have.lengthOf(1);
      expectAssertions(foundFilesCollection[0]).to.equal('euler_001.coffee');
      // console.log(`Found specific CoffeeScript file: ${foundFilesCollection[0]}`); // Debug
    });

    // Test case: Return an empty array if no solution files exist
    it('should return an empty array when no solution files are present', function() {
      // Delete all files to create an empty directory
      const currentFiles = nodeFileSys.readdirSync('.');
      currentFiles.forEach(file => nodeFileSys.unlinkSync(file));
      // console.log('All files deleted to test empty directory listing.'); // Debug

      const foundFilesCollection = assetLocator.retrieveAll();
      expectAssertions(foundFilesCollection).to.have.lengthOf(0);
      expectAssertions(Array.isArray(foundFilesCollection)).to.be.true(); // Ensure it's still an array
    });

  });
});

// Test suite for the solution retrieval utilities
describe('Data Retrieval Module', function() {

  const tempDir = TEMP_WORKSPACE_DIR;

  // Setup: Create a temporary directory and a dummy solution file
  beforeEach(function() {
    nodeFileSys.mkdirSync(tempDir);
    process.chdir(tempDir);
    // Create a dummy solution file for testing retrieval
    nodeFileSys.writeFileSync('solution_001.js', 'module.exports = 12345;');
    // console.log('Created dummy solution_001.js for data retrieval tests.'); // Debug
  });

  // Teardown: Clean up the temporary directory
  afterEach(function() {
    const workspaceItems = nodeFileSys.readdirSync('.');
    workspaceItems.forEach(item => nodeFileSys.unlinkSync(item));
    process.chdir('..');
    nodeFileSys.rmdirSync(tempDir);
  });

  // Test case: Retrieve a specific solution by its ID
  it('should successfully retrieve the content of a specified solution file', function(done) {
    let retrievedValue;
    const problemId = '001';
    const expectedValue = 12345; // The content written to the dummy file

    infoRetriever.retrieveSolution(
      (solutionContent) => {
        retrievedValue = solutionContent;
        // console.log(`Retrieved solution content for ID ${problemId}: ${solutionContent}`); // Debug
        expectAssertions(retrievedValue).to.equal(expectedValue);
        done();
      },
      () => {
        console.error('Solution retrieval failed unexpectedly.');
        expectAssertions(false).to.be.true(); // Force test failure
        done();
      },
      problemId
    );
  });

  // Test case: Handle retrieval of a non-existent solution gracefully
  it('should invoke the error callback when attempting to retrieve a non-existent solution file', function(done) {
    let errorHandled = false;
    const nonExistentProblemId = '999';

    infoRetriever.retrieveSolution(
      (solutionContent) => {
        console.warn(`Unexpected success for non-existent solution: ${solutionContent}`);
        expectAssertions(false).to.be.true(); // Force test failure
        done();
      },
      () => {
        errorHandled = true;
        // console.log('Error callback correctly invoked for non-existent solution.'); // Debug
        expectAssertions(errorHandled).to.be.true();
        done();
      },
      nonExistentProblemId
    );
  });

});