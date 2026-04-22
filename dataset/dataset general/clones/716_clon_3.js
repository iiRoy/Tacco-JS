const initialByteSequence = new Uint8Array(256);
for (let bIdx = 0; bIdx < 256; bIdx++) {
    initialByteSequence[bIdx] = bIdx;
}

/**
 * Compares the contents of two ArrayBuffer-like objects byte by byte.
 * @param {ArrayBufferLike} primaryBuffer - The first buffer to compare.
 * @param {ArrayBufferLike} secondaryBuffer - The second buffer to compare.
 * @returns {boolean} True if both buffers have identical byte sequences and lengths, false otherwise.
 */
const compareBinaryContent = (primaryBuffer, secondaryBuffer) => {
    if (!primaryBuffer || !secondaryBuffer) {
        return false;
    }

    const primaryView = new Uint8Array(primaryBuffer);
    const secondaryView = new Uint8Array(secondaryBuffer);

    if (primaryView.byteLength !== secondaryView.byteLength) {
        return false;
    }

    let isMatch = true;
    let currentByteIndex = 0;
    const totalBytes = primaryView.byteLength;

    while (currentByteIndex < totalBytes) {
        if (primaryView[currentByteIndex] !== secondaryView[currentByteIndex]) {
            isMatch = false;
            break;
        }
        currentByteIndex++;
    }
    return isMatch;
};

const isRuntimeNode = (typeof process !== 'undefined') && (typeof process.versions !== 'undefined') && (typeof process.versions.node !== 'undefined');

QUnit.module("Core Utility Checks");
QUnit.test("Binary Integer Reader Verification",
    function() {
        const integerHolder = new Uint32Array(2);
        integerHolder[0] = 2147483647;
        const backingBuffer = integerHolder.buffer;
        const firstReadValue = BSync.util.readInt32(new Uint8Array(backingBuffer), 0);
        ok(firstReadValue === 2147483647, "Positive 32-bit integer read successfully.");

        integerHolder[1] = 4294967295;
        const secondReadValue = BSync.util.readInt32(new Uint8Array(backingBuffer), 4);
        ok(secondReadValue === 4294967295, "Unsigned 32-bit integer read successfully.");

        integerHolder[0] = -1;
        const thirdReadValue = BSync.util.readInt32(new Uint8Array(backingBuffer), 0);
        ok(thirdReadValue === 4294967295, "Negative 1 (0xFFFFFFFF) read as unsigned 32-bit integer.");
    });

QUnit.test("Adler-32 Checksum Algorithm Validation",
    function() {
        const sourceDataSlice = new Uint8Array(initialByteSequence.buffer.slice(0));
        const partialResultA = BSync.util.adler32(0, 10, sourceDataSlice);
        ok(partialResultA.a === 55, "Adler 'a' component verified for initial segment.");

        const partialResultB = BSync.util.adler32(0, 4, sourceDataSlice);

        ok(partialResultB.b === 20, "Adler 'b' component verified for smaller segment.");
        const calculatedChecksum = (partialResultB.b << 16) | partialResultB.a;
        ok(calculatedChecksum === partialResultB.checksum, "Combined checksum value matches computed result.");

        const oversizedRangeResult = BSync.util.adler32(0, 300, sourceDataSlice);
        const fullRangeResult = BSync.util.adler32(0, 255, sourceDataSlice);
        ok(oversizedRangeResult.checksum === fullRangeResult.checksum, "Range overflow handling corrected for Adler-32.");

        let consistencyCheckSum = 0;
        const modificationIterations = 20;
        for (let modLoopIdx = 0; modLoopIdx < modificationIterations; modLoopIdx++) {
            if (sourceDataSlice.length === 0) continue;

            const randomPosition = Math.floor(Math.random() * sourceDataSlice.length);
            sourceDataSlice[randomPosition]++;

            const firstComputedChecksum = BSync.util.adler32(0, 255, sourceDataSlice);
            const secondComputedChecksum = BSync.util.adler32(0, 255, sourceDataSlice);
            consistencyCheckSum = secondComputedChecksum.checksum;

            ok(firstComputedChecksum.checksum === consistencyCheckSum, "Checksum calculation is consistent for identical data slices.");
            ok(fullRangeResult.checksum !== firstComputedChecksum.checksum, "Data modification correctly alters checksum.");
        }
    });

QUnit.test("Sliding Window Checksum Operation", function() {
    let currentIteration = 0;
    const baseTestBytes = new Uint8Array(initialByteSequence.buffer.slice(0));
    let currentSlidingChecksum;
    const windowSize = 10;

    const initialAdler = BSync.util.adler32(0, windowSize - 1, baseTestBytes);
    currentSlidingChecksum = BSync.util.rollingChecksum(initialAdler, 1, windowSize, baseTestBytes);

    ok(initialAdler.checksum !== 0, "Initial Adler checksum is not zero.");

    for (currentIteration = 2; currentIteration <= (baseTestBytes.length - windowSize); currentIteration++) {
        const windowEndIndex = currentIteration + windowSize - 1;
        currentSlidingChecksum = BSync.util.rollingChecksum(currentSlidingChecksum, currentIteration, windowEndIndex, baseTestBytes);
        const directAdler = BSync.util.adler32(currentIteration, windowEndIndex, baseTestBytes);

        ok(
            (currentSlidingChecksum.checksum === directAdler.checksum) &&
            (directAdler.checksum !== 0),
            `Rolling checksum at index ${currentIteration} matches direct Adler-32 and is non-zero.`
        );
    }
});

QUnit.test("Checksum Document Generation and Comparison", function() {
    const referenceSourceData = initialByteSequence.buffer.slice(0);
    const blockPartitionSize = 10;
    const firstChecksumDoc = BSync.createChecksumDocument(blockPartitionSize, referenceSourceData);
    const doc1Uint8View = new Uint8Array(firstChecksumDoc);
    const doc1Uint32View = new Uint32Array(firstChecksumDoc);
    ok(true, "First checksum document successfully generated.");

    const comparisonSourceData = initialByteSequence.buffer.slice(0);
    const secondChecksumDoc = BSync.createChecksumDocument(blockPartitionSize, comparisonSourceData);
    const doc2Uint8View = new Uint8Array(secondChecksumDoc);
    const doc2Uint32View = new Uint32Array(secondChecksumDoc);
    ok(true, "Second checksum document successfully generated.");

    const areByteArraysEqual = (viewA, viewB) => {
        if (viewA.length !== viewB.length) return false;
        for (let k = 0; k < viewA.length; k++) {
            if (viewA[k] !== viewB[k]) return false;
        }
        return true;
    };

    let documentsAreIdentical = areByteArraysEqual(doc1Uint8View, doc2Uint8View);
    ok(documentsAreIdentical, "Initially, checksum documents are byte-for-byte identical.");

    documentsAreIdentical = false;
    const modifiedByteView = new Uint8Array(comparisonSourceData);
    modifiedByteView[0]++;

    const updatedSecondChecksumDoc = BSync.createChecksumDocument(blockPartitionSize, comparisonSourceData);
    const updatedDoc2Uint8View = new Uint8Array(updatedSecondChecksumDoc);
    const updatedDoc2Uint32View = new Uint32Array(updatedSecondChecksumDoc);

    if (!areByteArraysEqual(doc1Uint8View, updatedDoc2Uint8View)) {
        documentsAreIdentical = true;
    }
    ok(documentsAreIdentical, "Checksum documents correctly differ after data alteration.");

    ok(doc1Uint32View[2] !== updatedDoc2Uint32View[2], "Adler-32 checksum for the first block is correctly detected as different.");

    let md5Differs = false;
    for (let md5Idx = 3; md5Idx <= 6; md5Idx++) {
        if (doc1Uint32View[md5Idx] !== updatedDoc2Uint32View[md5Idx]) {
            md5Differs = true;
            break;
        }
    }
    ok(md5Differs, "MD5 hash for the first block is correctly detected as different.");

    let subsequentBlocksMatch = true;
    const startOfSubsequentBlocks = 7;
    for (let blockCheckIdx = startOfSubsequentBlocks; blockCheckIdx < doc1Uint32View.length; blockCheckIdx++) {
        if (doc1Uint32View[blockCheckIdx] !== updatedDoc2Uint32View[blockCheckIdx]) {
            subsequentBlocksMatch = false;
            break;
        }
    }
    ok(subsequentBlocksMatch, "Checksums for all blocks beyond the first remain identical.");
});

QUnit.test("Patch Document Generation Validation", function() {
    const originalContentBuffer = initialByteSequence.buffer.slice(0);
    const chunkingSize = 10;
    const baseChecksumDoc = BSync.createChecksumDocument(chunkingSize, originalContentBuffer);

    const modifiedContentBuffer = initialByteSequence.buffer.slice(0);
    const modifiedBytesView = new Uint8Array(modifiedContentBuffer);
    modifiedBytesView[0]++;
    modifiedBytesView[modifiedBytesView.length - 1]--;

    const generatedPatchDocument = BSync.createPatchDocument(baseChecksumDoc, modifiedContentBuffer);
    ok(generatedPatchDocument instanceof ArrayBuffer, "Patch document successfully created and is an ArrayBuffer.");

    if (compareBinaryContent(originalContentBuffer, modifiedContentBuffer)) {
        ok(generatedPatchDocument.byteLength === 0, "Empty patch generated for identical content.");
    } else {
        ok(generatedPatchDocument.byteLength > 0, "Non-empty patch generated for modified content.");
    }
});

QUnit.test("Patch Application Accuracy", function() {
    const originalFileContent = initialByteSequence.buffer.slice(0);
    const processingBlockSize = 10;
    const baselineChecksumDoc = BSync.createChecksumDocument(processingBlockSize, originalFileContent);

    const targetFileContent = initialByteSequence.buffer.slice(0);
    let generatedPatch = BSync.createPatchDocument(baselineChecksumDoc, targetFileContent);
    let patchedResult = BSync.applyPatch(generatedPatch, originalFileContent);
    ok(compareBinaryContent(originalFileContent, patchedResult), "Patching identical documents results in an identical copy.");

    const targetFileView = new Uint8Array(targetFileContent);
    targetFileView[0]++;
    generatedPatch = BSync.createPatchDocument(baselineChecksumDoc, targetFileContent);
    patchedResult = BSync.applyPatch(generatedPatch, originalFileContent);
    ok(compareBinaryContent(targetFileContent, patchedResult), "Single byte modification patch applied correctly.");

    const modificationPoints = [
        0, 10, 11, 20, 21, 30, 40, 50, 100, 110, 120, 130, 140, 150, 200, 210, 211, 213, 215, 220, 230, 240, 254
    ];
    modificationPoints.forEach(idx => {
        if (idx < targetFileView.length) {
            targetFileView[idx]++;
        }
    });

    generatedPatch = BSync.createPatchDocument(baselineChecksumDoc, targetFileContent);
    patchedResult = BSync.applyPatch(generatedPatch, originalFileContent);
    ok(compareBinaryContent(targetFileContent, patchedResult), "Multiple specific byte modifications patched successfully.");

    const numRandomRuns = 1000;
    for (let runIndex = 0; runIndex < numRandomRuns; runIndex++) {
        const currentTargetData = initialByteSequence.buffer.slice(0);
        const currentTargetView = new Uint8Array(currentTargetData);

        const numberOfMods = Math.ceil(Math.random() * currentTargetView.byteLength);
        for (let modIndex = 0; modIndex < numberOfMods; modIndex++) {
            const randomByteIndex = Math.floor(Math.random() * currentTargetView.byteLength);
            currentTargetView[randomByteIndex]++;
        }

        const randomPatch = BSync.createPatchDocument(baselineChecksumDoc, currentTargetData);
        const resultAfterRandomPatch = BSync.applyPatch(randomPatch, originalFileContent);

        if (!resultAfterRandomPatch) {
            ok(false, `Patch application failed for run ${runIndex}.`);
            continue;
        }

        ok(compareBinaryContent(currentTargetData, resultAfterRandomPatch), `Exact match after randomized patch application (Run ${runIndex}).`);
    }
});

QUnit.module("Larger File Processing Tests");

const fetchBinaryFileContent = (filePath, contentCallback) => {
    if (isRuntimeNode) {
        const nodeFs = require("fs");
        nodeFs.readFile(filePath,
            (err, fileBuffer) => {
                if (err) {
                    console.error("Error retrieving file data in Node.js:", err);
                    contentCallback(null, err);
                    return;
                }
                const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
                contentCallback(arrayBuffer);
            });
    } else {
        const xhrRequest = new XMLHttpRequest();

        xhrRequest.addEventListener('load', function() {
            if (xhrRequest.status === 200) {
                contentCallback(xhrRequest.response);
            } else {
                console.error(`XHR request failed with status: ${xhrRequest.status}`);
                contentCallback(null, new Error(`HTTP Error ${xhrRequest.status}`));
            }
        });
        xhrRequest.addEventListener('error', function() {
            console.error("XHR network error occurred.");
            contentCallback(null, new Error("Network error during XHR."));
        });

        xhrRequest.open('GET', filePath);
        xhrRequest.responseType = 'arraybuffer';
        xhrRequest.send(null);
    }
};

QUnit.stop();

let currentFilePath = "";
if (isRuntimeNode) {
    currentFilePath = __dirname + "/audio_files/sample_44k_32bit_float_stereo.wav";
} else {
    currentFilePath = "./audio_files/sample_44k_32bit_float_stereo.wav";
}

fetchBinaryFileContent(currentFilePath,
    (loadedBuffer, error) => {
        if (error) {
            console.error("Failed to load file for tests:", error);
            QUnit.start();
            return;
        }

        const performFilePatchTest = (inputBuffer) => {
            QUnit.start();
            QUnit.test("Large Audio File Patching Scenario",
                function() {
                    ok(inputBuffer instanceof ArrayBuffer, "Successfully obtained file data as ArrayBuffer.");

                    const documentBlockSize = 10000;
                    const originalDocument = BSync.createChecksumDocument(documentBlockSize, inputBuffer);
                    ok(originalDocument instanceof ArrayBuffer, "Checksum document created for large file.");

                    const clonedInputBuffer = inputBuffer.slice(0);
                    const numberOfModifications = 10;
                    const clonedBufferView = new Uint8Array(clonedInputBuffer);

                    for (let modCounter = 0; modCounter < numberOfModifications; modCounter++) {
                        const randomIndex = Math.floor(Math.random() * clonedBufferView.byteLength);
                        clonedBufferView[randomIndex]++;
                    }

                    const generatedPatchForFile = BSync.createPatchDocument(originalDocument, clonedInputBuffer);
                    ok(generatedPatchForFile instanceof ArrayBuffer, "Patch document generated for modified large file.");

                    const patchedFileOutput = BSync.applyPatch(generatedPatchForFile, inputBuffer);
                    ok(compareBinaryContent(patchedFileOutput, clonedInputBuffer), "Large audio file successfully patched and verified as identical to modified clone.");
                });
        };

        if (isRuntimeNode) {
            performFilePatchTest(loadedBuffer);
        } else {
            if (loadedBuffer instanceof ArrayBuffer) {
                performFilePatchTest(loadedBuffer);
            } else {
                console.warn("Unexpected: XHR returned something other than ArrayBuffer. Attempting FileReader fallback.");
                const fileReader = new FileReader();
                fileReader.onload = (readEvent) => {
                    const arrayBufferFromReader = readEvent.target.result;
                    performFilePatchTest(arrayBufferFromReader);
                };
                fileReader.onerror = (readError) => {
                    console.error("FileReader error during blob conversion:", readError);
                    QUnit.start();
                };
                fileReader.readAsArrayBuffer(new Blob([loadedBuffer]));
            }
        }
    });

if (isRuntimeNode) {
    QUnit.module("Node.js Specific Functionality Tests");
    QUnit.test("Node.js File System Access Check", function() {
        const fsModule = require('fs');
        ok(typeof fsModule.readFileSync === 'function', "Node.js 'fs' module is accessible and has readFileSync.");
        try {
            fsModule.readFileSync('/non_existent_path_for_test.txt');
            ok(false, "Should not be able to read a non-existent file.");
        } catch (e) {
            ok(e.code === 'ENOENT', "Correctly failed to read non-existent file with ENOENT error.");
        }
    });
}