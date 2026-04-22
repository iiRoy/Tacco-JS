const byteSequence = new Uint8Array([0,1,2,3,4,5,6,7,8,9,
    10,11,12,13,14,15,16,17,18,19,
    20,21,22,23,24,25,26,27,28,29,
    30,31,32,33,34,35,36,37,38,39,
    40,41,42,43,44,45,46,47,48,49,
    50,51,52,53,54,55,56,57,58,59,
    60,61,62,63,64,65,66,67,68,69,
    70,71,72,73,74,75,76,77,78,79,
    80,81,82,83,84,85,86,87,88,89,
    90,91,92,93,94,95,96,97,98,99,
    100,101,102,103,104,105,106,107,108,109,
    110,111,112,113,114,115,116,117,118,119,
    120,121,122,123,124,125,126,127,128,129,
    130,131,132,133,134,135,136,137,138,139,
    140,141,142,143,144,145,146,147,148,149,
    150,151,152,153,154,155,156,157,158,159,
    160,161,162,163,164,165,166,167,168,169,
    170,171,172,173,174,175,176,177,178,179,
    180,181,182,183,184,185,186,187,188,189,
    190,191,192,193,194,195,196,197,198,199,
    200,201,202,203,204,205,206,207,208,209,
    210,211,212,213,214,215,216,217,218,219,
    220,221,222,223,224,225,226,227,228,229,
    230,231,232,233,234,235,236,237,238,239,
    240,241,242,243,244,245,246,247,248,249,
    250,251,252,253,254,255]);


function compareBuffers(firstArray, secondArray) {
  // Create Uint8Array views for byte-by-byte comparison
  let firstByteView = new Uint8Array(firstArray);
  let secondByteView = new Uint8Array(secondArray);

  // Check if buffer lengths are different; if so, they cannot be identical
  if (firstArray.byteLength !== secondArray.byteLength) {
    return false;
  }

  // Assume equality initially
  let areIdentical = true;
  // Iterate through each byte and compare
  for (let idx = 0; idx < firstByteView.length; idx++) {
    if (firstByteView[idx] !== secondByteView[idx]) {
      areIdentical = false; // Found a difference
      break; // Exit loop early
    }
  }
  return areIdentical;
}

// Determine if the current environment is Node.js
const environmentIsNode = ((typeof require) !== "undefined") &&
                          ((typeof module) !== "undefined") &&
                          ((typeof module.exports) !== "undefined");

QUnit.module("utility function evaluations"); // Module for testing utility features

test("read 32-bit integer",
  function() {
    // Create a 32-bit unsigned integer array with two elements
    const intContainer = new Uint32Array(2);
    // Assign a large positive integer
    intContainer[0] = 2147483647;
    // Get the underlying ArrayBuffer
    const memorySegment = intContainer.buffer;
    // Read the first 32-bit integer from the buffer
    let extractedValue = BSync.util.readInt32(new Uint8Array(memorySegment), 0);
    // Assert that the read value is correct
    ok(extractedValue === 2147483647, "32-bit integer read accurately");

    // Assign another large integer to the second element
    intContainer[1] = 4294967295;
    // Read the second 32-bit integer (offset by 4 bytes)
    extractedValue = BSync.util.readInt32(new Uint8Array(memorySegment), 4);
    // Assert that this read value is also correct
    ok(extractedValue === 4294967295, "second 32-bit integer read accurately");
  });

test("adler-32 checksum computation",
  function() {
    // Create a mutable copy of the initial byte sequence
    const inputData = new Uint8Array(byteSequence.buffer.slice(0));
    // Calculate Adler-32 checksum for a specific range (0 to 10)
    let firstOutcome = BSync.util.adler32(0, 10, inputData);
    // Verify the 'a' component of the checksum
    ok(firstOutcome.a === 55, "component 'a' is correct");
    // Calculate Adler-32 checksum for a different range (0 to 4)
    let secondOutcome = BSync.util.adler32(0, 4, inputData);

    // Verify the 'b' component
    ok(secondOutcome.b === 20, "component 'b' is correct");
    // Verify the combined checksum value
    ok((secondOutcome.b << 16 | secondOutcome.a) === secondOutcome.checksum, "full checksum value is correct");

    // Test range overflow behavior (requesting more data than available)
    secondOutcome = BSync.util.adler32(0, 300, inputData);
    firstOutcome = BSync.util.adler32(0, 255, inputData); // Max available length
    ok(secondOutcome.checksum === firstOutcome.checksum, "range exceeding data length is handled correctly");

    let thirdOutcome = 0; // Placeholder for another checksum
    // Perform multiple random modifications and re-check checksum consistency
    for (let currentIteration = 0; currentIteration < 20; currentIteration++) {
      // Modify a random byte in the test data
      inputData[Math.floor(Math.random() * 256)]++;
      secondOutcome = BSync.util.adler32(0, 255, inputData);
      thirdOutcome = BSync.util.adler32(0, 255, inputData);
      // Ensure checksum is consistent for the same modified data
      ok(secondOutcome.checksum === thirdOutcome.checksum, "checksum is consistent for modified data");
      // Ensure checksum changes when data is modified
      ok(firstOutcome.checksum !== secondOutcome.checksum, "data change is correctly detected by checksum");
    }
  });

test("rolling checksum mechanism",
  function() {
    let loopIndex = 0;
    // Prepare a copy of the initial data
    const sampleBytes = new Uint8Array(byteSequence.buffer.slice(0));
    let initialResult;
    const segmentSize = 10; // Define block size for rolling checksum
    // Calculate initial Adler-32 for the first block
    let initialAdler = BSync.util.adler32(0, segmentSize - 1, sampleBytes);
    let subsequentAdler;
    // Perform one roll to initialize the rolling checksum
    initialResult = BSync.util.rollingChecksum(initialAdler, 1, segmentSize, sampleBytes);

    // Loop through the entire data set, comparing rolling checksums with direct Adler-32 calculations
    for (loopIndex = 2; loopIndex < sampleBytes.length - segmentSize; loopIndex++) {
      // Roll the checksum forward
      initialResult = BSync.util.rollingChecksum(initialResult, loopIndex, loopIndex + segmentSize - 1, sampleBytes);
      // Calculate direct Adler-32 for the current block
      subsequentAdler = BSync.util.adler32(loopIndex, loopIndex + segmentSize - 1, sampleBytes);
      // Assert that rolling checksum matches direct checksum and is not zero
      ok(
        (initialResult.checksum === subsequentAdler.checksum) &&  // Check if they match
        (subsequentAdler.checksum !== 0),                         // Ensure it's not a zero checksum
        "rolling checksums are consistent and non-zero");
    }
  });

test("checksum document generation",
  function() {
    // Prepare the first data buffer
    const originalContentA = byteSequence.buffer.slice(0);
    const dataBlockSize = 10;
    // Create the first checksum document
    const hashDocA = BSync.createChecksumDocument(dataBlockSize, originalContentA);
    const byteViewA = new Uint8Array(hashDocA);
    const intViewA = new Uint32Array(hashDocA);
    ok(true, "first checksum document successfully generated");

    // Prepare the second data buffer (identical initially)
    const originalContentB = byteSequence.buffer.slice(0);
    // Create the second checksum document
    const hashDocB = BSync.createChecksumDocument(dataBlockSize, originalContentB);
    let byteViewB = new Uint8Array(hashDocB);
    let intViewB = new Uint32Array(hashDocB);
    ok(true, "second checksum document successfully generated");

    // Verify that initially, both checksum documents are byte-for-byte identical
    let matchFound = true;
    for (let i = 0; i < byteViewA.length; i++) {
      if (byteViewA[i] !== byteViewB[i]) {
        matchFound = false;
        break;
      }
    }
    ok(matchFound, "checksum documents are identical initially");

    matchFound = false; // Reset for next check
    // Modify data in the first block of the second content
    (new Uint8Array(originalContentB))[0]++;
    // Re-create the checksum document for the modified content
    hashDocB = BSync.createChecksumDocument(dataBlockSize, originalContentB);
    byteViewB = new Uint8Array(hashDocB);
    intViewB = new Uint32Array(hashDocB);

    // Verify that checksum documents now differ
    for (let i = 0; i < byteViewA.length; i++) {
      if (byteViewA[i] !== byteViewB[i]) {
        matchFound = true;
        break;
      }
    }
    ok(matchFound, "checksum documents differ after content modification");

    // Check specific hash components for differences
    ok(intViewA[2] !== intViewB[3], "Adler32 checksum is different for the first block");
    matchFound = false;
    for (let i = 3; i < 6; i++) { // Assuming MD5 hash spans certain indices
      if (intViewA[i] !== intViewB[i]) {
        matchFound = true;
        break;
      }
    }
    ok(matchFound, "MD5 hash is different for the first block");

    matchFound = true; // Reset for next check
    // Verify that checksums for subsequent, unchanged blocks remain the same
    for (let i = 7; i < intViewA.length; i++) {
      if (intViewA[i] !== intViewB[i]) {
        matchFound = false;
        break;
      }
    }
    ok(matchFound, "checksums are identical for all blocks except the first modified one");
  });

test("patch document creation",
  function() {
    // TODO: This test needs significant expansion for thorough coverage.
    // Prepare initial data
    const sourceContent = byteSequence.buffer.slice(0);
    const segmentSize = 10;
    // Create a checksum document for the source content
    const sourceHashDoc = BSync.createChecksumDocument(segmentSize, sourceContent);

    // Prepare target data, initially a clone
    const targetContent = byteSequence.buffer.slice(0);
    // Introduce a modification to the target content
    (new Uint8Array(targetContent))[0]++;

    // Create a patch document based on the difference between source checksums and target content
    const changeSet = BSync.createPatchDocument(sourceHashDoc, targetContent);
    ok(true, "patch document successfully generated");
  });

test("patch application process",
  function() {
    // Initial data buffer
    const originalContent = byteSequence.buffer.slice(0);
    const dataBlockSize = 10;
    // Create checksum document for the original data
    const baseChecksumDoc = BSync.createChecksumDocument(dataBlockSize, originalContent);

    // Variables for views of various buffers
    let checksumDocBuffer;
    let patchBufView;
    let finalDataView;

    // Test Case 1: No changes (target is identical to original)
    let modifiedContent = byteSequence.buffer.slice(0);
    let changeSet = BSync.createPatchDocument(baseChecksumDoc, modifiedContent);
    let patchedContent = BSync.applyPatch(changeSet, originalContent);
    ok(compareBuffers(originalContent, modifiedContent), "documents are identical before any changes");

    // Test Case 2: Single byte modification
    (new Uint8Array(modifiedContent))[0]++; // Modify first byte
    changeSet = BSync.createPatchDocument(baseChecksumDoc, modifiedContent);
    patchedContent = BSync.applyPatch(changeSet, originalContent);
    ok(compareBuffers(modifiedContent, patchedContent), "documents are identical after single byte patch");

    // Test Case 3: Multiple scattered modifications
    (new Uint8Array(modifiedContent))[0]++;
    (new Uint8Array(modifiedContent))[10]++;
    (new Uint8Array(modifiedContent))[11]++;
    (new Uint8Array(modifiedContent))[20]++;
    (new Uint8Array(modifiedContent))[21]++;
    (new Uint8Array(modifiedContent))[30]++;
    (new Uint8Array(modifiedContent))[40]++;
    (new Uint8Array(modifiedContent))[50]++;
    (new Uint8Array(modifiedContent))[100]++;
    (new Uint8Array(modifiedContent))[110]++;
    (new Uint8Array(modifiedContent))[120]++;
    (new Uint8Array(modifiedContent))[130]++;
    (new Uint8Array(modifiedContent))[140]++;
    (new Uint8Array(modifiedContent))[150]++;
    (new Uint8Array(modifiedContent))[200]++;
    (new Uint8Array(modifiedContent))[210]++;
    (new Uint8Array(modifiedContent))[211]++;
    (new Uint8Array(modifiedContent))[213]++;
    (new Uint8Array(modifiedContent))[215]++;
    (new Uint8Array(modifiedContent))[220]++;
    (new Uint8Array(modifiedContent))[230]++;
    (new Uint8Array(modifiedContent))[240]++;
    (new Uint8Array(modifiedContent))[254]++;
    changeSet = BSync.createPatchDocument(baseChecksumDoc, modifiedContent);
    patchedContent = BSync.applyPatch(changeSet, originalContent);
    ok(compareBuffers(modifiedContent, patchedContent), "documents are identical after multiple scattered patches");

    // Test Case 4: Extensive randomized modifications over many runs
    for (let run = 0; run < 1000; run++) {
      modifiedContent = byteSequence.buffer.slice(0); // Start with clean copy
      checksumDocBuffer = new Uint8Array(baseChecksumDoc); // View of base checksum

      // Apply a random number of modifications
      const modCount = Math.ceil(Math.random() * modifiedContent.byteLength);
      for (let k = 0; k < modCount; k++) {
        // Modify a random byte
        (new Uint8Array(modifiedContent))[Math.floor(Math.random() * modifiedContent.byteLength)]++;
      }
      changeSet = BSync.createPatchDocument(baseChecksumDoc, modifiedContent);
      patchBufView = new Uint8Array(changeSet); // View of the generated patch
      patchedContent = BSync.applyPatch(changeSet, originalContent);
      finalDataView = new Uint8Array(patchedContent); // View of the result

      ok(compareBuffers(modifiedContent, patchedContent), "exact match achieved after randomized patching");
    }
  });

QUnit.module("larger file processing tests");

// Helper function to acquire file data, compatible with both Node.js and browser environments
function retrieveFileContent(resourcePath, completionHandler) {
  if (environmentIsNode) {
    // Node.js specific file reading
    const fs = require("fs");
    fs.readFile(resourcePath,
      function(readErr, payload) {
        if (readErr) {
          console.log("Error obtaining file data: " + readErr);
        }
        completionHandler(payload);
      });
  } else {
    // Browser (XMLHttpRequest) specific file reading
    const dataRequest = new XMLHttpRequest();

    dataRequest.addEventListener('load', function() {
      if (dataRequest.status === 200) {
        completionHandler(dataRequest.response);
      }
    });

    dataRequest.open('GET', resourcePath);
    dataRequest.responseType = 'blob'; // Expecting binary data
    dataRequest.send(null);
  }
}

stop(); // Pause QUnit tests until async operations complete

let assetPath = "";
if (environmentIsNode) {
  assetPath = __dirname + "/audio_files/sample_44k_32bit_float_stereo.wav";
} else {
  assetPath = "./audio_files/sample_44k_32bit_float_stereo.wav";
}

retrieveFileContent(assetPath,
  function(fileContent) {
    function performAudioTest(mediaData) {
      start(); // Resume QUnit tests
      test("audio file integrity check",
        function() {
          ok(true, "successfully retrieved audio data");
          // Create a checksum document for the large audio file
          const checksumDoc = BSync.createChecksumDocument(10000, mediaData);
          ok(true, "checksum document generated for audio file");
          // Create a clone of the original audio data
          const duplicateBuffer = mediaData.slice(0);
          const numChanges = 10;
          const duplicateBytesView = new Uint8Array(duplicateBuffer);
          // Introduce random modifications to the cloned data
          for (let i = 0; i < numChanges; i++) {
            duplicateBytesView[Math.floor(Math.random() * duplicateBuffer.byteLength)]++;
          }
          // Create a patch document reflecting these changes
          const changeSet = BSync.createPatchDocument(checksumDoc, duplicateBuffer);
          ok(true, "patch document created for audio file changes");
          // Apply the patch to the original data
          const updatedMedia = BSync.applyPatch(changeSet, mediaData);
          ok(compareBuffers(updatedMedia, duplicateBuffer), "audio file patched correctly, resulting in identical data");
        });
    }

    if (environmentIsNode) {
      // In Node.js, fileContent is already an ArrayBuffer or Buffer
      // We assume BSync functions can work directly with Node.js Buffer or its ArrayBuffer representation.
      // No extra conversion needed here for the example logic.
      performAudioTest(fileContent.buffer || fileContent); // Pass buffer or direct Buffer
    } else {
      // In browser, fileContent is a Blob, needs to be read into ArrayBuffer
      const blobReader = new FileReader();
      blobReader.onload = function(event) {
        const audioBuffer = event.target.result;
        performAudioTest(audioBuffer);
      };
      blobReader.readAsArrayBuffer(fileContent);
    }
  });

if (environmentIsNode) {
  QUnit.module("node.js specific evaluations"); // Module for Node.js-only tests
}