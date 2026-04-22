/*
 * This file contains sample data and various utility tests for a BSync library.
 * It demonstrates functionality such as data verification, adler-32 checksums,
 * rolling checksums, checksum document creation, and patch application.
 */

// Initialize a large Uint8Array with sequential byte values from 0 to 255.
var data  =  new Uint8Array(
  [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, // First row of data values
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
    70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
    80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
    90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
    110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
    130, 131, 132, 133, 134, 135, 136, 137, 138, 139,
    140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
    150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
    160, 161, 162, 163, 164, 165, 166, 167, 168, 169,
    170, 171, 172, 173, 174, 175, 176, 177, 178, 179,
    180, 181, 182, 183, 184, 185, 186, 187, 188, 189,
    190, 191, 192, 193, 194, 195, 196, 197, 198, 199,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
    210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
    220, 221, 222, 223, 224, 225, 226, 227, 228, 229,
    230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
    240, 241, 242, 243, 244, 245, 246, 247, 248, 249,
    250, 251, 252, 253, 254, 255
  ]
);


/**
 * Verifies if the content of two ArrayBuffers is identical byte-for-byte.
 * @param {ArrayBuffer} buffer1 - The first ArrayBuffer to compare.
 * @param {ArrayBuffer} buffer2 - The second ArrayBuffer to compare.
 * @returns {boolean} - True if the buffers are identical, false otherwise.
 */
function verifyData(buffer1, buffer2)
{
  // Create Uint8Array views for byte-level comparison.
  var buffer1View8 = new Uint8Array(buffer1);
  var buffer2View8 = new Uint8Array(buffer2);

  // First, check if the lengths of the buffers are different.
  if ( buffer1.byteLength  !=  buffer2.byteLength ) {
    return false; // If lengths differ, they cannot be identical.
  }

  var pass = true; // Assume they pass until a difference is found.

  // Iterate through each byte and compare.
  for (var i = 0; i < buffer1View8.length; i++) {
    if (buffer1View8[i] != buffer2View8[i]) {
      pass = false; // Found a difference.
      break;        // No need to check further.
    }
  }

  return pass; // Return the result of the comparison.
}


// Determine if the current environment is Node.js.
var isNode = ( (typeof require) != "undefined" )  &&  ( (typeof module) != "undefined" )  &&  ( (typeof module.exports) != "undefined" );


// Start QUnit test suite for 'utilities tests'.
QUnit.module( "utilities tests" );

// Test case for reading 32-bit integers.
test( "read int 32",
  function()
  {
    // Create a Uint32Array to hold test values.
    var arr = new Uint32Array(2);

    // Test with a positive 32-bit integer.
    arr[0] = 2147483647; // Max signed 32-bit integer.
    var buff = arr.buffer; // Get the underlying ArrayBuffer.
    var test = BSync.util.readInt32(new Uint8Array(buff), 0); // Read from offset 0.
    ok(test == 2147483647, "int32 read correctly for positive max value");

    // Test with an unsigned 32-bit integer (implicitly handled by readInt32 for its bit pattern).
    arr[1] = 4294967295; // Max unsigned 32-bit integer.
    var test = BSync.util.readInt32(new Uint8Array(buff), 4); // Read from offset 4.
    ok(test == 4294967295, "int32 read correctly for unsigned max value");
  }
);


// Test case for the adler-32 checksum algorithm.
test( "adler-32",
  function()
  {
    // Create a copy of the global data.
    var testData = new Uint8Array(data.buffer.slice(0));

    // Calculate adler-32 for a small range (0 to 9).
    var result1 = BSync.util.adler32(0, 10, testData);
    ok(result1.a == 55, "a component correct for 0-9");

    // Calculate adler-32 for another small range (0 to 3).
    var result2 = BSync.util.adler32(0, 4, testData);

    ok(result2.b == 20, "b component correct for 0-3");
    // Verify the combined checksum.
    ok((result2.b << 16 | result2.a) == result2.checksum, "checksum correct by combining a and b");

    // Test range overflow correction.
    result2 = BSync.util.adler32(0, 300, testData); // Range exceeds data length.
    result1 = BSync.util.adler32(0, 255, testData); // Correct range to data length.
    ok(result2.checksum == result1.checksum, "range overflow corrected to data length");

    var result3 = 0;

    // Perform multiple random modifications and verify checksum consistency and change detection.
    for ( var i = 0; i < 20; i++ )
    {
      // Modify a random byte in the test data.
      testData[Math.floor(Math.random() * 256)]++;

      // Calculate checksums for the modified data.
      result2 = BSync.util.adler32(0, 255, testData);
      result3 = BSync.util.adler32(0, 255, testData);

      // Verify consistency for the same modified data.
      ok(result2.checksum == result3.checksum, "checksum consistent for varying data");
      // Verify that the change was detected (checksum should be different from original).
      ok(result1.checksum != result2.checksum, "change correctly detected after modification");
    }
  }
);


// Test case for the rolling checksum algorithm.
test("rolling checksum", function()
{
  var i = 0;
  var testData = new Uint8Array(data.buffer.slice(0)); // Copy of original data.
  var result1;
  var blockSize = 10; // Define a block size for rolling.

  // Calculate initial adler-32 for the first block.
  var adler1 = BSync.util.adler32(0, blockSize - 1, testData);
  var adler2;

  // Perform the first roll.
  result1 = BSync.util.rollingChecksum(adler1, 1, blockSize, testData);

  // Roll through the entire data set, verifying each rolling checksum against a straight adler-32.
  for (i = 2; i < testData.length - blockSize; i++)
  {
    result1 = BSync.util.rollingChecksum(result1, i, i + blockSize - 1, testData); // Roll forward.
    adler2 = BSync.util.adler32(i, i + blockSize - 1, testData); // Calculate straight adler for comparison.

    ok(
      (result1.checksum == adler2.checksum) && // Ensure rolling checksum matches straight adler.
      (adler2.checksum != 0), // Ensure checksums are not zero (indicating a valid calculation).
      "rolling checksums match and are not zero"
    );
  }
});


// Test case for creating checksum documents.
test("checksum document", function()
{
  var testData1 = data.buffer.slice(0); // Original data buffer.
  var blockSize = 10; // Block size for checksums.

  // Create the first checksum document.
  var doc1 = BSync.createChecksumDocument(blockSize, testData1);
  var Uint8View1 = new Uint8Array(doc1);
  var Uint32View1 = new Uint32Array(doc1);
  ok(true, "checksum document 1 created successfully");

  var testData2 = data.buffer.slice(0); // Another copy of original data.
  var doc2 = BSync.createChecksumDocument(blockSize, testData2);
  var Uint8View2 = new Uint8Array(doc2);
  var Uint32View2 = new Uint32Array(doc2);
  ok(true, "checksum document 2 created successfully");

  // Verify that initially, checksum documents are identical.
  var pass = true;
  for (var i = 0; i < Uint8View1.length; i++) {
    if (Uint8View1[i] != Uint8View2[i]) {
      pass = false;
      break;
    }
  }
  ok(pass, "checksum documents match byte for byte when data is identical");

  pass = false; // Reset pass flag.

  // Change data in the first block of testData2.
  (new Uint8Array(testData2))[0]++;
  // Re-create checksum document for the modified data.
  doc2 = BSync.createChecksumDocument(blockSize, testData2);
  Uint8View2 = new Uint8Array(doc2);
  Uint32View2 = new Uint32Array(doc2);

  // Verify that checksum documents now differ.
  for (var i = 0; i < Uint8View1.length; i++) {
    if (Uint8View1[i] != Uint8View2[i]) {
      pass = true; // Found a difference.
      break;
    }
  }
  ok(pass, "checksum documents differ after data change");

  // Verify that the adler32 checksum for the first block is different.
  ok(Uint32View1[2] != Uint32View2[3], "adler32 is different for the first block");

  pass = false; // Reset pass flag for MD5 comparison.

  // Verify that the MD5 sum for the first block is different.
  for (var i = 3; i < 6; i++) { // MD5 typically spans multiple 32-bit words.
    if (Uint32View1[i] != Uint32View2[i]) {
      pass = true;
      break;
    }
  }
  ok(pass, "md5 sum is different for the first block");

  pass = true; // Assume remaining blocks are identical.

  // Verify that checksums for all blocks *except* the first remain the same.
  for (var i = 7; i < Uint32View1.length; i++) {
    if (Uint32View1[i] != Uint32View2[i]) {
      pass = false; // Found an unexpected difference.
      break;
    }
  }
  ok(pass, "checksums are the same for all blocks except the first");
});


// Test case for creating a patch document.
test("patch document",
  function()
  {
    // TODO: Seriously improve this test. It currently only verifies creation, not content.

    var testData1 = data.buffer.slice(0); // Original data.
    var blockSize = 10; // Block size.
    var doc1 = BSync.createChecksumDocument(blockSize, testData1); // Checksum document for original.

    var testData2 = data.buffer.slice(0); // Copy of original data.
    (new Uint8Array(testData2))[0]++; // Modify the copy.

    // Create a patch document based on doc1 and the modified testData2.
    var patchDocument = BSync.createPatchDocument(doc1, testData2);
    ok(true, "patch document created successfully");
  }
);


// Test case for applying a patch document.
test("apply patch",
  function()
  {
    var testData1 = data.buffer.slice(0); // Original base data.
    var blockSize = 10;
    var doc1 = BSync.createChecksumDocument(blockSize, testData1); // Checksum document for base.

    var checksumDocView;
    var patchDocumentView;
    var dataView;

    var testData2 = data.buffer.slice(0); // Target data, initially identical to testData1.
    var patchDocument = BSync.createPatchDocument(doc1, testData2);
    var testData3 = BSync.applyPatch(patchDocument, testData1); // Apply patch to base.
    ok(verifyData(testData1, testData2), "Target data is identical to original source when no changes"); // This checks original source and target
    ok(verifyData(testData2, testData3), "Patched document is identical to target document (no changes)"); // This checks target and patched


    // Modify the data a bit.
    (new Uint8Array(testData2))[0]++;
    patchDocument = BSync.createPatchDocument(doc1, testData2);
    testData3 = BSync.applyPatch(patchDocument, testData1);
    ok(verifyData(testData2, testData3), "Patched document is identical to target document (single change)");


    // Modify it a bit more extensively across different blocks.
    (new Uint8Array(testData2))[0]++;
    (new Uint8Array(testData2))[10]++;
    (new Uint8Array(testData2))[11]++;
    (new Uint8Array(testData2))[20]++;
    (new Uint8Array(testData2))[21]++;
    (new Uint8Array(testData2))[30]++;
    (new Uint8Array(testData2))[40]++;
    (new Uint8Array(testData2))[50]++;
    (new Uint8Array(testData2))[100]++;
    (new Uint8Array(testData2))[110]++;
    (new Uint8Array(testData2))[120]++;
    (new Uint8Array(testData2))[130]++;
    (new Uint8Array(testData2))[140]++;
    (new Uint8Array(testData2))[150]++;
    (new Uint8Array(testData2))[200]++;
    (new Uint8Array(testData2))[210]++;
    (new Uint8Array(testData2))[211]++;
    (new Uint8Array(testData2))[213]++;
    (new Uint8Array(testData2))[215]++;
    (new Uint8Array(testData2))[220]++;
    (new Uint8Array(testData2))[230]++;
    (new Uint8Array(testData2))[240]++;
    (new Uint8Array(testData2))[254]++;

    patchDocument = BSync.createPatchDocument(doc1, testData2);
    testData3 = BSync.applyPatch(patchDocument, testData1);
    ok(verifyData(testData2, testData3), "Patched document is identical to target document (multiple changes)");


    // Let's do lots of runs of randomized modifications.
    // This should get a pretty good modification distribution through these runs for testing.
    for (var j = 0; j < 1000; j++)
    {
      testData2 = data.buffer.slice(0); // Reset target data to original base for each run.
      checksumDocView = new Uint8Array(doc1); // Re-initialize view (though doc1 doesn't change).

      // Modify a random number of bytes in testData2.
      var numMods = Math.ceil(Math.random() * testData2.byteLength);
      for (var k = 0; k < numMods; k++) {
        (new Uint8Array(testData2))[Math.floor(Math.random() * testData2.byteLength)]++;
      }

      patchDocument = BSync.createPatchDocument(doc1, testData2); // Create patch for current modification.
      patchDocumentView = new Uint8Array(patchDocument); // View of the patch document.

      testData3 = BSync.applyPatch(patchDocument, testData1); // Apply patch to original base.
      dataView = new Uint8Array(testData3); // View of the patched data.

      ok(verifyData(testData2, testData3), "exact match after randomized modifications (Run " + j + ")");
    }
  }
);


// Start QUnit test suite for 'larger file tests'.
QUnit.module("larger file tests");


// Utility function to get file data, regardless of whether we are in Node.js or a browser.
function getFileData(file, callback)
{
  if (isNode)
  {
    // Node.js environment: use 'fs' module.
    var fs = require("fs");
    fs.readFile(file,
      function(err, data)
      {
        if (err)
          console.log("Error getting file data: " + err);
        callback(data.buffer); // Pass ArrayBuffer to callback.
      }
    );
  }
  else
  {
    // Browser environment: use XMLHttpRequest.
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function()
    {
      if (xhr.status == 200) {
        callback(xhr.response); // xhr.response will be an ArrayBuffer if responseType is 'blob'.
      }
    });

    xhr.open('GET', file);
    xhr.responseType = 'blob'; // Request blob response which can be converted to ArrayBuffer.
    xhr.send(null);
  }
}

stop(); // QUnit.stop() prevents the test runner from continuing until QUnit.start() is called.


var path = "";
if (isNode) {
  path = __dirname + "/audio_files/sample_44k_32bit_float_stereo.wav";
} else {
  path = "./audio_files/sample_44k_32bit_float_stereo.wav";
}

getFileData(path,
  function(data)
  {
    function runTest(buffer)
    {
      start(); // Resume QUnit test runner.
      test("audio file patching",
        function()
        {
          ok(true, "successfully got audio file data");
          var doc = BSync.createChecksumDocument(10000, buffer);
          ok(true, "created checksum document for audio file");
          var clone = buffer.slice(0); // Create a clone of the original buffer.
          var numMods = 10;
          var cloneView8 = new Uint8Array(clone);

          // Apply random modifications to the cloned file.
          for (var i = 0; i < numMods; i++)
          {
            cloneView8[Math.floor(Math.random() * clone.byteLength)]++;
          }

          // Create a patch document between the original doc and the modified clone.
          var patchDocument = BSync.createPatchDocument(doc, clone);
          ok(true, "created patch document for audio file");

          // Apply the patch to the original buffer.
          var patchedFile = BSync.applyPatch(patchDocument, buffer);
          ok(verifyData(patchedFile, clone), "music file patched successfully, resulting in identical data");
        }
      );
    }

    if (isNode)
    {
      // In Node.js, data is already an ArrayBuffer, so call runTest directly.
      runTest(data);
    }
    else
    {
      // In browser, if data is a Blob, convert it to ArrayBuffer.
      // (getFileData already handles responseType 'blob' and passes ArrayBuffer,
      // but this block shows a common pattern for Blob to ArrayBuffer conversion).
      var reader = new FileReader();
      reader.onload = function(f)
      {
        var buffer = f.target.result; // f.target.result will be an ArrayBuffer.
        runTest(buffer);
      };
      reader.readAsArrayBuffer(data);
    }
  }
);


// Node.js specific tests.
if (isNode)
{
  QUnit.module("node specific tests");
  // Additional Node.js specific tests would go here.
}