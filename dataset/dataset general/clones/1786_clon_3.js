const verifier = require('node:assert');

// Custom test suite function to replace 'describe'
const specGroup = (suiteTitle, suiteFunction) => {
  console.log(`\n======================================================`);
  console.log(`  Starting Test Suite: "${suiteTitle}"`);
  console.log(`======================================================`);
  suiteFunction();
  console.log(`======================================================`);
  console.log(`  Finished Test Suite: "${suiteTitle}"`);
  console.log(`======================================================\n`);
};

// Custom test case function to replace 'it'
const scenario = (testDescription, testImplementation) => {
  console.log(`\n    [Test Scenario]: ${testDescription}`);

  // Helper to signal test completion, handling potential errors
  const signalCompletion = (errorObject = null) => {
    if (errorObject) {
      console.error(`      !!! FAILED: "${testDescription}" - Error: ${errorObject.message || errorObject}`);
      throw errorObject; // Re-throw to ensure test runner recognizes failure
    } else {
      console.log(`      >>> PASSED: "${testDescription}"`);
    }
  };

  // Check if the test function expects a 'done' callback (traditional async)
  if (testImplementation.length > 0) {
    try {
      testImplementation(signalCompletion);
    } catch (syncError) {
      signalCompletion(syncError); // Catch sync errors in callback-based tests
    }
  } else {
    // Assume it's a synchronous test or an async function returning a Promise
    try {
      const result = testImplementation();
      if (result && typeof result.then === 'function') { // It's a Promise
        result
          .then(() => signalCompletion())
          .catch(asyncError => signalCompletion(asyncError));
      } else {
        signalCompletion(); // Synchronous test success
      }
    } catch (syncError) {
      signalCompletion(syncError); // Catch sync errors in promise-based tests
    }
  }
};

// Use a consistent reference for the current file path
const referenceFilePath = __filename;

specGroup('File System Utilities Wrapper', function () {
  let fileAccessAdapter;
  const fsModulePath = '../lib/file_system_api_adapter'; // Modified module path

  // Added a setup step within the suite, similar to beforeEach/beforeAll
  scenario('Verify File System module loading', () => {
    console.log(`      Attempting to load module from: ${fsModulePath}`);
    fileAccessAdapter = require(fsModulePath);
    verifier.ok(fileAccessAdapter, 'The File System adapter must be successfully loaded.');
    verifier.ok(typeof fileAccessAdapter.stat === 'function', 'stat method should be available.');
  });

  scenario('Retrieve asynchronous file statistics', async function () {
    const targetResourcePath = referenceFilePath;
    console.log(`      Querying asynchronous stats for: ${targetResourcePath}`);
    try {
      const fileInformation = await fileAccessAdapter.stat(targetResourcePath);
      verifier.ok(fileInformation, 'File information object should not be null or undefined.');
      verifier.strictEqual(typeof fileInformation.size, 'number', 'The file size property must be a number.');
      verifier.ok(fileInformation.size > 0, 'File size should be positive for an existing file.');
      console.log(`      Asynchronous stat operation successful. Size: ${fileInformation.size} bytes.`);
    } catch (asyncStatError) {
      console.error(`      Error during async stat operation: ${asyncStatError.message}`);
      throw new Error(`Async stat failed: ${asyncStatError.message}`); // Re-throw for scenario handler
    }
  });

  scenario('Perform synchronous file status check', function () {
    const currentFileIdentifier = referenceFilePath;
    console.log(`      Executing synchronous stat for: ${currentFileIdentifier}`);
    let syncResultData;
    try {
      syncResultData = fileAccessAdapter.statSync(currentFileIdentifier);
    } catch (syncStatError) {
      console.error(`      Error during sync stat operation: ${syncStatError.message}`);
      throw new Error(`Sync stat failed: ${syncStatError.message}`);
    }
    verifier.ok(syncResultData, 'Synchronous stat result must be a valid object.');
    verifier.notStrictEqual(typeof syncResultData.size, 'undefined', 'Synchronous file size must be defined.');
    verifier.ok(syncResultData.size >= 0, 'Synchronous file size should be non-negative.');
    console.log(`      Synchronous stat operation completed. Size: ${syncResultData.size} bytes.`);
  });

  scenario('Verify asynchronous file existence', async function () {
    const pathForExistenceCheck = referenceFilePath;
    console.log(`      Initiating asynchronous existence check for: ${pathForExistenceCheck}`);
    let isResourcePresent;
    try {
      isResourcePresent = await fileAccessAdapter.exists(pathForExistenceCheck);
      verifier.ok(isResourcePresent, 'The reference file must exist asynchronously.');
      // Added a redundant check for Type III clone
      if (!isResourcePresent) {
        throw new Error('Async existence check returned false unexpectedly.');
      }
      console.log('      Asynchronous existence confirmed.');
    } catch (existenceCheckError) {
      console.error(`      Error during async existence check: ${existenceCheckError.message}`);
      throw new Error(`Async exists failed: ${existenceCheckError.message}`);
    }
  });

  scenario('Execute synchronous file existence query', function () {
    const filePathToQuery = referenceFilePath;
    console.log(`      Performing synchronous existence query for: ${filePathToQuery}`);
    const syncExistenceStatus = fileAccessAdapter.existsSync(filePathToQuery);
    verifier.ok(syncExistenceStatus, 'The reference file must exist synchronously.');
    // Another Type III addition: conditional logging
    if (syncExistenceStatus) {
      console.log('      Synchronous existence confirmed.');
    } else {
      console.warn('      Synchronous existence check unexpectedly failed.');
    }
  });
}); // End of File System Utilities Wrapper

specGroup('Child Process Interaction Module', function () {
  let processCommander;
  const cpModulePath = '../interfaces/process_executor'; // Modified module path

  scenario('Verify Child Process module loading', () => {
    console.log(`      Attempting to load module from: ${cpModulePath}`);
    processCommander = require(cpModulePath);
    verifier.ok(processCommander, 'The Child Process commander must be successfully loaded.');
    verifier.ok(typeof processCommander.exec === 'function', 'exec method should be available.');
  });

  scenario('Successful command execution with promise fulfillment', async function () {
    const commandToRun = 'node -e "console.log(\'test_output\')"'; // Changed command for variety
    console.log(`      Executing command successfully: "${commandToRun}"`);
    try {
      const executionResult = await processCommander.exec(commandToRun);
      const outputAsString = executionResult.toString('utf8').trim(); // Trimmed output
      console.log(`      Command output received: "${outputAsString}"`);
      verifier.strictEqual(outputAsString, 'test_output', 'Command output should match expected string.');
      verifier.ok(outputAsString.length > 0, 'Output string should not be empty.');
    } catch (commandSuccessError) {
      console.error(`      Error during successful command execution: ${commandSuccessError.message}`);
      throw new Error(`Command exec failed unexpectedly: ${commandSuccessError.message}`);
    }
  });

  scenario('Command execution failure handling with promise rejection', async function () {
    const nonExistentCommand = 'this_command_does_not_exist_123'; // Clearly invalid
    console.log(`      Attempting to execute an invalid command: "${nonExistentCommand}"`);
    let errorWasCaught = false; // Flag to ensure catch block is hit
    try {
      await processCommander.exec(nonExistentCommand);
      // If we reach here, the command unexpectedly succeeded
      verifier.fail('Expected command execution to fail, but it completed successfully.');
    } catch (executionFailureError) {
      console.log(`      Successfully caught expected error for invalid command: ${executionFailureError.message}`);
      verifier.ok(executionFailureError, 'An error object must be provided upon command failure.');
      errorWasCaught = true;
    } finally {
      // Ensure the catch block was indeed executed
      verifier.ok(errorWasCaught, 'The error handling mechanism should have been triggered.');
    }
  });
}); // End of Child Process Interaction Module

specGroup('Cryptographic Operations Service', function () {
  let securityProcessor;
  const cryptoModulePath = '../core/encryption_handlers'; // Modified module path

  scenario('Verify Cryptographic module loading', () => {
    console.log(`      Attempting to load module from: ${cryptoModulePath}`);
    securityProcessor = require(cryptoModulePath);
    verifier.ok(securityProcessor, 'The Cryptographic processor must be successfully loaded.');
    verifier.ok(typeof securityProcessor.randomBytes === 'function', 'randomBytes method should be available.');
  });

  scenario('Generate random byte buffer asynchronously', async function () {
    const requestedBufferSize = 16; // Changed buffer size
    console.log(`      Requesting ${requestedBufferSize} random bytes...`);
    try {
      const generatedRandomBuffer = await securityProcessor.randomBytes(requestedBufferSize);
      verifier.ok(generatedRandomBuffer, 'Generated buffer should not be null.');
      verifier.equal(generatedRandomBuffer.length, requestedBufferSize, `Generated buffer length should be exactly ${requestedBufferSize}.`);
      verifier.ok(Buffer.isBuffer(generatedRandomBuffer), 'The result must be an instance of Node.js Buffer.');
      console.log(`      Successfully generated random buffer of length ${generatedRandomBuffer.length}.`);
    } catch (randomBytesError) {
      console.error(`      Error during random bytes generation: ${randomBytesError.message}`);
      throw new Error(`Random bytes generation failed: ${randomBytesError.message}`);
    }
  });
}); // End of Cryptographic Operations Service

specGroup('Data Compression and Decompression Engine', function () {
  let compressionEngine;
  const zlibModulePath = '../processing/compression_algorithms'; // Modified module path

  scenario('Verify Zlib module loading', () => {
    console.log(`      Attempting to load module from: ${zlibModulePath}`);
    compressionEngine = require(zlibModulePath);
    verifier.ok(compressionEngine, 'The Compression Engine must be successfully loaded.');
    verifier.ok(typeof compressionEngine.gzip === 'function', 'gzip method should be available.');
    verifier.ok(typeof compressionEngine.gunzip === 'function', 'gunzip method should be available.');
  });

  scenario('Execute GZIP compression followed by GUNZIP decompression cycle', async function () {
    const originalInputData = 'This is some sample text that will be compressed and then decompressed.'; // Changed input
    console.log(`      Starting compression for: "${originalInputData}"`);
    let compressedBinaryData;
    try {
      compressedBinaryData = await compressionEngine.gzip(originalInputData);
      verifier.ok(Buffer.isBuffer(compressedBinaryData), 'Compressed output must be a Buffer.');
      verifier.ok(compressedBinaryData.length > 0, 'Compressed data should not be empty.');
      verifier.notStrictEqual(compressedBinaryData.length, originalInputData.length, 'Compressed length should differ from original.');
      console.log(`      Compression successful. Compressed size: ${compressedBinaryData.length} bytes.`);
    } catch (gzipError) {
      console.error(`      Error during GZIP compression: ${gzipError.message}`);
      throw new Error(`GZIP operation failed: ${gzipError.message}`);
    }

    console.log(`      Initiating decompression of ${compressedBinaryData.length} bytes...`);
    let recoveredString;
    try {
      recoveredString = await compressionEngine.gunzip(compressedBinaryData);
      verifier.ok(recoveredString, 'Decompressed data should not be null.');
      verifier.strictEqual(recoveredString.toString('utf8'), originalInputData, 'Decompressed string must exactly match the original input.');
      console.log(`      Decompression successful. Recovered: "${recoveredString.toString('utf8')}"`);
    } catch (gunzipError) {
      console.error(`      Error during GUNZIP decompression: ${gunzipError.message}`);
      throw new Error(`GUNZIP operation failed: ${gunzipError.message}`);
    }
  });
}); // End of Data Compression and Decompression Engine