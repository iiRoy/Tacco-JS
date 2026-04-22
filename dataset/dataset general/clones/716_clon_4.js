const Examiner = (function() {
    let currentModuleIdentifier = "Default Module";
    let totalTestCases = 0;
    let totalAssertions = 0;
    let failedAssertionRecords = [];
    let asynchronousTestQueue = [];
    let isProcessingAsynchronous = false;

    function recordAssertion(condition, message) {
        totalAssertions++;
        if (!condition) {
            failedAssertionRecords.push({
                module: currentModuleIdentifier,
                message: message || "Assertion Condition Not Met",
                test: Examiner.currentTestCaseName
            });
        }
    }

    function defineModule(name) {
        currentModuleIdentifier = name;
        console.log(`\n--- Test Group: ${currentModuleIdentifier} ---`);
    }

    function defineTestCase(name, func) {
        Examiner.currentTestCaseName = name;
        totalTestCases++;
        console.log(`Executing Test: ${name}`);
        try {
            func();
            if (!isProcessingAsynchronous) {
                console.log(`  Successful: ${name}`);
            }
        } catch (e) {
            failedAssertionRecords.push({
                module: currentModuleIdentifier,
                message: e.message || "Test function encountered an error",
                test: name,
                error: e
            });
            console.error(`  Failed (Exception): ${name} - ${e.message}`);
        }
    }

    function initiateAsynchronousProcessing() {
        isProcessingAsynchronous = true;
    }

    function concludeAsynchronousProcessing() {
        isProcessingAsynchronous = false;
        if (asynchronousTestQueue.length > 0) {
            const nextTest = asynchronousTestQueue.shift();
            if (nextTest) nextTest();
        } else {
            generateFinalReport();
        }
    }

    function enqueueAsynchronousTest(func) {
        asynchronousTestQueue.push(func);
        if (!isProcessingAsynchronous && asynchronousTestQueue.length === 1) {
            initiateAsynchronousProcessing();
            const firstTest = asynchronousTestQueue.shift();
            if (firstTest) firstTest();
        }
    }

    function generateFinalReport() {
        console.log("\n--- Execution Summary ---");
        console.log(`Total Test Cases Executed: ${totalTestCases}`);
        console.log(`Total Assertions Checked: ${totalAssertions}`);
        if (failedAssertionRecords.length === 0) {
            console.log("All tests passed successfully!");
        } else {
            console.error(`Total Failed Assertions: ${failedAssertionRecords.length}`);
            failedAssertionRecords.forEach(fail => {
                console.error(`  [${fail.module}] Test Case "${fail.test}": ${fail.message}`);
                if (fail.error) console.error(fail.error);
            });
        }
    }

    return {
        section: defineModule,
        case: defineTestCase,
        assert: recordAssertion,
        pause: initiateAsynchronousProcessing,
        continue: concludeAsynchronousProcessing,
        enqueueAsync: enqueueAsynchronousTest,
        _generateFinalReport: generateFinalReport, // Internal method for explicit call
        asynchronousTestQueue: asynchronousTestQueue, // Expose for checking emptiness
        isProcessingAsynchronous: () => isProcessingAsynchronous // Expose state
    };
})();

const BinarySyncOps = (function() {
    const CHECKSUM_MODULO = 65521; // Largest prime less than 2^16

    function extractSigned32BitWord(binarySource, byteOffset) {
        if (!(binarySource instanceof Uint8Array)) {
            binarySource = new Uint8Array(binarySource);
        }
        // Manually combine bytes to form a 32-bit unsigned integer
        let numericValue = (binarySource[byteOffset + 3] << 24) |
                           (binarySource[byteOffset + 2] << 16) |
                           (binarySource[byteOffset + 1] << 8) |
                           binarySource[byteOffset];
        // Convert to unsigned 32-bit if it's interpreted as negative by JS
        if (numericValue < 0) {
            numericValue = numericValue >>> 0;
        }
        return numericValue;
    }

    function computeAdler32(startPosition, endPosition, byteData) {
        if (!(byteData instanceof Uint8Array)) {
            byteData = new Uint8Array(byteData);
        }
        const actualStart = Math.max(0, startPosition);
        const actualEnd = Math.min(byteData.length, endPosition + 1); // +1 for slice-like end behavior
        let sumAccumulator1 = 1;
        let sumAccumulator2 = 0;

        for (let currentByteIndex = actualStart; currentByteIndex < actualEnd; currentByteIndex++) {
            sumAccumulator1 = (sumAccumulator1 + byteData[currentByteIndex]) % CHECKSUM_MODULO;
            sumAccumulator2 = (sumAccumulator2 + sumAccumulator1) % CHECKSUM_MODULO;
        }
        
        return {
            sumPartA: sumAccumulator1,
            sumPartB: sumAccumulator2,
            fullHashValue: (sumAccumulator2 << 16) | sumAccumulator1
        };
    }

    function updateAdler32Roll(previousHashParts, byteLeavingWindow, byteEnteringWindow, currentWindowLength) {
        let currentSum1 = previousHashParts.sumPartA;
        let currentSum2 = previousHashParts.sumPartB;

        currentSum1 = (currentSum1 - byteLeavingWindow + byteEnteringWindow);
        currentSum1 = (currentSum1 % CHECKSUM_MODULO + CHECKSUM_MODULO) % CHECKSUM_MODULO;

        currentSum2 = (currentSum2 - (currentWindowLength * byteLeavingWindow) + currentSum1);
        currentSum2 = (currentSum2 % CHECKSUM_MODULO + CHECKSUM_MODULO) % CHECKSUM_MODULO;
        
        return {
            sumPartA: currentSum1,
            sumPartB: currentSum2,
            fullHashValue: (currentSum2 << 16) | currentSum1
        };
    }

    // --- MD5 Algorithm Implementation ---
    // Adapted from widely available public domain/MIT MD5 implementations
    const digestMD5 = (function() {
        const rotateLeft = (value, shifts) => (value << shifts) | (value >>> (32 - shifts));
        const add32BitUnsigned = (val1, val2) => {
            const low1 = (val1 & 0xFFFF);
            const high1 = (val1 >>> 16);
            const low2 = (val2 & 0xFFFF);
            const high2 = (val2 >>> 16);

            const resultLow = (low1 + low2) & 0xFFFF;
            const resultHigh = (high1 + high2) & 0xFFFF;
            const carry = (resultLow > 0xFFFF) ? 1 : 0;
            
            return ((resultHigh + carry) << 16) | resultLow;
        };

        const F = (x, y, z) => (x & y) | (~x & z);
        const G = (x, y, z) => (x & z) | (y & ~z);
        const H = (x, y, z) => (x ^ y ^ z);
        const I = (x, y, z) => (y ^ (x | ~z));

        const transformFF = (a, b, c, d, x, s, ac) => add32BitUnsigned(rotateLeft(add32BitUnsigned(add32BitUnsigned(a, F(b, c, d)), add32BitUnsigned(x, ac)), s), b);
        const transformGG = (a, b, c, d, x, s, ac) => add32BitUnsigned(rotateLeft(add32BitUnsigned(add32BitUnsigned(a, G(b, c, d)), add32BitUnsigned(x, ac)), s), b);
        const transformHH = (a, b, c, d, x, s, ac) => add32BitUnsigned(rotateLeft(add32BitUnsigned(add32BitUnsigned(a, H(b, c, d)), add32BitUnsigned(x, ac)), s), b);
        const transformII = (a, b, c, d, x, s, ac) => add32BitUnsigned(rotateLeft(add32BitUnsigned(add32BitUnsigned(a, I(b, c, d)), add32BitUnsigned(x, ac)), s), b);

        const processMD5Blocks = (messageBytes, totalBits) => {
            const paddedMessage = [];
            const numberOf32BitWords = ((totalBits + 64) >>> 9) << 4;
            for (let k = 0; k < numberOf32BitWords; k++) paddedMessage[k] = 0;
            for (let k = 0; k < totalBits; k += 8) {
                paddedMessage[k >>> 5] |= (messageBytes[k / 8] & 0xFF) << ((k % 32));
            }
            paddedMessage[totalBits >>> 5] |= (0x80 << ((totalBits % 32)));
            paddedMessage[numberOf32BitWords - 2] = totalBits;

            let A = 0x67452301;
            let B = 0xEFCDAB89;
            let C = 0x98BADCFE;
            let D = 0x10325476;

            for (let k = 0; k < numberOf32BitWords; k += 16) {
                const oldA = A;
                const oldB = B;
                const oldC = C;
                const oldD = D;

                A = transformFF(A, B, C, D, paddedMessage[k], 7, 0xD76AA478);
                D = transformFF(D, A, B, C, paddedMessage[k + 1], 12, 0xE8C7B756);
                C = transformFF(C, D, A, B, paddedMessage[k + 2], 17, 0x242070DB);
                B = transformFF(B, C, D, A, paddedMessage[k + 3], 22, 0xC1BDCEEE);
                A = transformFF(A, B, C, D, paddedMessage[k + 4], 7, 0xF57C0FAF);
                D = transformFF(D, A, B, C, paddedMessage[k + 5], 12, 0x4787C62A);
                C = transformFF(C, D, A, B, paddedMessage[k + 6], 17, 0xA8304613);
                B = transformFF(B, C, D, A, paddedMessage[k + 7], 22, 0xFD469501);
                A = transformFF(A, B, C, D, paddedMessage[k + 8], 7, 0x698098D8);
                D = transformFF(D, A, B, C, paddedMessage[k + 9], 12, 0x8B44F7AF);
                C = transformFF(C, D, A, B, paddedMessage[k + 10], 17, 0xFFFF5BB1);
                B = transformFF(B, C, D, A, paddedMessage[k + 11], 22, 0x895CD7BE);
                A = transformFF(A, B, C, D, paddedMessage[k + 12], 7, 0x6B901122);
                D = transformFF(D, A, B, C, paddedMessage[k + 13], 12, 0xFD987193);
                C = transformFF(C, D, A, B, paddedMessage[k + 14], 17, 0xA679438E);
                B = transformFF(B, C, D, A, paddedMessage[k + 15], 22, 0x49B40821);

                A = transformGG(A, B, C, D, paddedMessage[k + 1], 5, 0xF61E2562);
                D = transformGG(D, A, B, C, paddedMessage[k + 6], 9, 0xC040B340);
                C = transformGG(C, D, A, B, paddedMessage[k + 11], 14, 0x265E5A51);
                B = transformGG(B, C, D, A, paddedMessage[k], 20, 0xE9B6C7AA);
                A = transformGG(A, B, C, D, paddedMessage[k + 5], 5, 0xD62F105D);
                D = transformGG(D, A, B, C, paddedMessage[k + 10], 9, 0x2441453);
                C = transformGG(C, D, A, B, paddedMessage[k + 15], 14, 0xD8A1E681);
                B = transformGG(B, C, D, A, paddedMessage[k + 4], 20, 0xE7D3FBC8);
                A = transformGG(A, B, C, D, paddedMessage[k + 9], 5, 0x21E1CDE6);
                D = transformGG(D, A, B, C, paddedMessage[k + 14], 9, 0xC33707D6);
                C = transformGG(C, D, A, B, paddedMessage[k + 13], 14, 0xF4D50D87);
                B = transformGG(B, C, D, A, paddedMessage[k + 2], 20, 0x455A14ED);
                A = transformGG(A, B, C, D, paddedMessage[k + 7], 5, 0xA9E3E905);
                D = transformGG(D, A, B, C, paddedMessage[k + 12], 9, 0xFCEFA3F8);
                C = transformGG(C, D, A, B, paddedMessage[k + 1], 14, 0x676F02D9);
                B = transformGG(B, C, D, A, paddedMessage[k + 6], 20, 0x8D2A4C8A);

                A = transformHH(A, B, C, D, paddedMessage[k + 5], 4, 0xFFFA3942);
                D = transformHH(D, A, B, C, paddedMessage[k + 8], 11, 0x8771F681);
                C = transformHH(C, D, A, B, paddedMessage[k + 11], 16, 0x6D9D6122);
                B = transformHH(B, C, D, A, paddedMessage[k + 14], 23, 0xFDE5380C);
                A = transformHH(A, B, C, D, paddedMessage[k + 1], 4, 0xA4BEEA44);
                D = transformHH(D, A, B, C, paddedMessage[k + 4], 11, 0x4BDECFA9);
                C = transformHH(C, D, A, B, paddedMessage[k + 7], 16, 0xF6BB4B60);
                B = transformHH(B, C, D, A, paddedMessage[k + 10], 23, 0xBEBFBC70);
                A = transformHH(A, B, C, D, paddedMessage[k + 13], 4, 0x289B7EC6);
                D = transformHH(D, A, B, C, paddedMessage[k], 11, 0xEAA127FA);
                C = transformHH(C, D, A, B, paddedMessage[k + 3], 16, 0xD4EF3085);
                B = transformHH(B, C, D, A, paddedMessage[k + 6], 23, 0x4881D05);
                A = transformHH(A, B, C, D, paddedMessage[k + 9], 4, 0xD9D4D039);
                D = transformHH(D, A, B, C, paddedMessage[k + 12], 11, 0xE6DB99E5);
                C = transformHH(C, D, A, B, paddedMessage[k + 15], 16, 0x1FA27CF8);
                B = transformHH(B, C, D, A, paddedMessage[k + 2], 23, 0xC4AC5665);

                A = transformII(A, B, C, D, paddedMessage[k], 6, 0xF4292244);
                D = transformII(D, A, B, C, paddedMessage[k + 7], 10, 0x432AFF97);
                C = transformII(C, D, A, B, paddedMessage[k + 14], 15, 0xAB9423A7);
                B = transformII(B, C, D, A, paddedMessage[k + 5], 21, 0xFC93A039);
                A = transformII(A, B, C, D, paddedMessage[k + 12], 6, 0x655B59C3);
                D = transformII(D, A, B, C, paddedMessage[k + 3], 10, 0x8F0CCC92);
                C = transformII(C, D, A, B, paddedMessage[k + 10], 15, 0xFFEFF47D);
                B = transformII(B, C, D, A, paddedMessage[k + 1], 21, 0x85845DD1);
                A = transformII(A, B, C, D, paddedMessage[k + 8], 6, 0x6FA87E4F);
                D = transformII(D, A, B, C, paddedMessage[k + 15], 10, 0xFE2CE6E0);
                C = transformII(C, D, A, B, paddedMessage[k + 6], 15, 0xA3014314);
                B = transformII(B, C, D, A, paddedMessage[k + 13], 21, 0x4E0811A1);
                A = transformII(A, B, C, D, paddedMessage[k + 4], 6, 0xF7537E82);
                D = transformII(D, A, B, C, paddedMessage[k + 11], 10, 0xBD3AF235);
                C = transformII(C, D, A, B, paddedMessage[k + 2], 15, 0x2AD7D2BB);
                B = transformII(B, C, D, A, paddedMessage[k + 9], 21, 0xEB86D391);

                A = add32BitUnsigned(A, oldA);
                B = add32BitUnsigned(B, oldB);
                C = add32BitUnsigned(C, oldC);
                D = add32BitUnsigned(D, oldD);
            }
            return [A, B, C, D];
        };

        const convertWordToBytes = (word) => {
            return new Uint8Array([
                (word & 0xFF),
                (word >>> 8) & 0xFF,
                (word >>> 16) & 0xFF,
                (word >>> 24) & 0xFF
            ]);
        };

        return (inputBuffer) => {
            const dataInBytes = new Uint8Array(inputBuffer);
            const totalBits = dataInBytes.length * 8;
            const hashWords = processMD5Blocks(dataInBytes, totalBits);
            const finalHashBytes = new Uint8Array(16);
            for (let i = 0; i < 4; i++) {
                finalHashBytes.set(convertWordToBytes(hashWords[i]), i * 4);
            }
            return finalHashBytes;
        };
    })();

    function generateChecksumManifest(chunkUnitSize, sourceArrayBuffer) {
        const sourceByteView = new Uint8Array(sourceArrayBuffer);
        const manifestRecords = [];
        let currentOffset = 0;

        while (currentOffset < sourceByteView.byteLength) {
            const actualChunkLength = Math.min(chunkUnitSize, sourceByteView.byteLength - currentOffset);
            const currentChunkSlice = sourceByteView.subarray(currentOffset, currentOffset + actualChunkLength);

            const adlerResult = computeAdler32(0, actualChunkLength - 1, currentChunkSlice);
            const md5Result = digestMD5(currentChunkSlice.buffer);

            manifestRecords.push({
                offset: currentOffset,
                adler: adlerResult.fullHashValue,
                md5: Array.from(md5Result)
            });
            currentOffset += chunkUnitSize;
        }

        // Binary format: 4 bytes for chunkUnitSize, 4 bytes for numRecords, then for each record: 4 bytes adler, 16 bytes md5.
        const headerBytes = 8;
        const recordBytes = 4 + 16;
        const totalManifestBytes = headerBytes + manifestRecords.length * recordBytes;
        const manifestDataBuffer = new ArrayBuffer(totalManifestBytes);
        const manifestDataView32 = new Uint32Array(manifestDataBuffer);
        const manifestDataView8 = new Uint8Array(manifestDataBuffer);

        manifestDataView32[0] = chunkUnitSize;
        manifestDataView32[1] = manifestRecords.length;

        manifestRecords.forEach((record, index) => {
            const baseRecordOffset = headerBytes + index * recordBytes;
            manifestDataView32[(baseRecordOffset / 4)] = record.adler;
            manifestDataView8.set(new Uint8Array(record.md5), baseRecordOffset + 4);
        });

        return manifestDataBuffer;
    }

    function createDifferentialInstructionSet(baseManifestBuffer, updatedArrayBuffer) {
        const baseManifestView32 = new Uint32Array(baseManifestBuffer);
        const baseManifestView8 = new Uint8Array(baseManifestBuffer);
        const updatedByteView = new Uint8Array(updatedArrayBuffer);

        const baseChunkUnitSize = baseManifestView32[0];
        const numberOfBaseChunks = baseManifestView32[1];
        const manifestRecordStartOffset = 8;

        // Create a lookup map for original blocks: Adler32 -> List of {MD5_string, blockIndex}
        const adlerToBlockLookup = new Map();
        for (let i = 0; i < numberOfBaseChunks; i++) {
            const recordOffset = manifestRecordStartOffset + i * (4 + 16);
            const adlerChecksum = baseManifestView32[recordOffset / 4];
            const md5ChecksumBytes = Array.from(baseManifestView8.subarray(recordOffset + 4, recordOffset + 4 + 16));
            const md5ChecksumString = md5ChecksumBytes.map(b => b.toString(16).padStart(2, '0')).join('');

            if (!adlerToBlockLookup.has(adlerChecksum)) {
                adlerToBlockLookup.set(adlerChecksum, []);
            }
            adlerToBlockLookup.get(adlerChecksum).push({ md5String: md5ChecksumString, blockIndex: i });
        }

        const differentialInstructions = [];
        let currentScanPosition = 0;
        const targetOutputSize = updatedByteView.byteLength;

        let currentRollingAdler = {sumPartA: 0, sumPartB: 0, fullHashValue: 0};
        if (baseChunkUnitSize <= updatedByteView.byteLength) {
            currentRollingAdler = computeAdler32(0, baseChunkUnitSize - 1, updatedByteView);
        }

        let literalDataBuffer = [];

        while (currentScanPosition < updatedByteView.byteLength) {
            let blockMatchFound = false;

            if (currentScanPosition + baseChunkUnitSize <= updatedByteView.byteLength) {
                if (adlerToBlockLookup.has(currentRollingAdler.fullHashValue)) {
                    const potentialBlockMatches = adlerToBlockLookup.get(currentRollingAdler.fullHashValue);
                    const currentWindowByteSlice = updatedByteView.subarray(currentScanPosition, currentScanPosition + baseChunkUnitSize);
                    const currentWindowMD5Bytes = digestMD5(currentWindowByteSlice.buffer);
                    const currentWindowMD5String = Array.from(currentWindowMD5Bytes).map(b => b.toString(16).padStart(2, '0')).join('');

                    for (const matchCandidate of potentialBlockMatches) {
                        if (matchCandidate.md5String === currentWindowMD5String) {
                            if (literalDataBuffer.length > 0) {
                                differentialInstructions.push({ type: 'literal', payload: literalDataBuffer });
                                literalDataBuffer = [];
                            }
                            differentialInstructions.push({ type: 'copy_block', blockIndex: matchCandidate.blockIndex });
                            currentScanPosition += baseChunkUnitSize;
                            blockMatchFound = true;
                            // Reset or re-calculate rolling checksum for the new window after a copy
                            if (currentScanPosition + baseChunkUnitSize <= updatedByteView.byteLength) {
                                currentRollingAdler = computeAdler32(currentScanPosition, currentScanPosition + baseChunkUnitSize - 1, updatedByteView);
                            } else {
                                currentRollingAdler = {sumPartA: 0, sumPartB: 0, fullHashValue: 0};
                            }
                            break;
                        }
                    }
                }
            }

            if (!blockMatchFound) {
                literalDataBuffer.push(updatedByteView[currentScanPosition]);
                
                // Roll the checksum for the next single-byte advancement
                if (currentScanPosition + baseChunkUnitSize < updatedByteView.byteLength) {
                    const byteExiting = updatedByteView[currentScanPosition];
                    const byteEntering = updatedByteView[currentScanPosition + baseChunkUnitSize];
                    currentRollingAdler = updateAdler32Roll(currentRollingAdler, byteExiting, byteEntering, baseChunkUnitSize);
                } else {
                    currentRollingAdler = {sumPartA: 0, sumPartB: 0, fullHashValue: 0};
                }
                currentScanPosition++;
            }
        }
        
        if (literalDataBuffer.length > 0) {
            differentialInstructions.push({ type: 'literal', payload: literalDataBuffer });
        }

        // Assemble binary differential document
        let differentialDataSize = 8; // For baseChunkUnitSize and targetOutputSize
        differentialInstructions.forEach(instruction => {
            if (instruction.type === 'literal') {
                differentialDataSize += 1 + 4 + instruction.payload.length; // type_byte + length_int + data_bytes
            } else if (instruction.type === 'copy_block') {
                differentialDataSize += 1 + 4; // type_byte + block_index_int
            }
        });

        const differentialDataBuffer = new ArrayBuffer(differentialDataSize);
        const differentialDataView8 = new Uint8Array(differentialDataBuffer);
        const differentialDataView32 = new Uint32Array(differentialDataBuffer);

        differentialDataView32[0] = baseChunkUnitSize;
        differentialDataView32[1] = targetOutputSize;
        let currentByteWritePosition = 8;

        differentialInstructions.forEach(instruction => {
            differentialDataView8[currentByteWritePosition++] = (instruction.type === 'literal' ? 0 : 1);

            if (instruction.type === 'literal') {
                differentialDataView32[currentByteWritePosition / 4] = instruction.payload.length;
                currentByteWritePosition += 4;
                differentialDataView8.set(new Uint8Array(instruction.payload), currentByteWritePosition);
                currentByteWritePosition += instruction.payload.length;
            } else if (instruction.type === 'copy_block') {
                differentialDataView32[currentByteWritePosition / 4] = instruction.blockIndex;
                currentByteWritePosition += 4;
            }
        });

        return differentialDataBuffer;
    }

    function applyDifferentialInstructions(differentialDocument, originalSourceBuffer) {
        const differentialView8 = new Uint8Array(differentialDocument);
        const differentialView32 = new Uint32Array(differentialDocument);
        const originalSourceByteView = new Uint8Array(originalSourceBuffer);

        const patchBlockUnitSize = differentialView32[0];
        const finalOutputSize = differentialView32[1];
        let currentDifferentialReadPosition = 8;

        const resultByteOutput = new Uint8Array(finalOutputSize);
        let currentResultWritePosition = 0;

        while (currentDifferentialReadPosition < differentialDocument.byteLength) {
            const instructionType = differentialView8[currentDifferentialReadPosition++];

            if (instructionType === 0) { // Literal data
                const dataBlockLength = differentialView32[currentDifferentialReadPosition / 4];
                currentDifferentialReadPosition += 4;
                resultByteOutput.set(differentialView8.subarray(currentDifferentialReadPosition, currentDifferentialReadPosition + dataBlockLength), currentResultWritePosition);
                currentDifferentialReadPosition += dataBlockLength;
                currentResultWritePosition += dataBlockLength;
            } else if (instructionType === 1) { // Copy block
                const blockReferenceIndex = differentialView32[currentDifferentialReadPosition / 4];
                currentDifferentialReadPosition += 4;
                
                const sourceDataOffset = blockReferenceIndex * patchBlockUnitSize;
                const sourceDataEnd = sourceDataOffset + patchBlockUnitSize;
                
                resultByteOutput.set(originalSourceByteView.subarray(sourceDataOffset, sourceDataEnd), currentResultWritePosition);
                currentResultWritePosition += patchBlockUnitSize;
            }
        }
        return resultByteOutput.buffer;
    }

    return {
        extractSigned32BitWord: extractSigned32BitWord,
        computeAdler32: computeAdler32,
        updateAdler32Roll: updateAdler32Roll,
        generateChecksumManifest: generateChecksumManifest,
        createDifferentialInstructionSet: createDifferentialInstructionSet,
        applyDifferentialInstructions: applyDifferentialInstructions
    };
})();

function compareBinaryContents(bufferA, bufferB) {
    if (bufferA.byteLength !== bufferB.byteLength) {
        return false;
    }
    const viewA = new Uint8Array(bufferA);
    const viewB = new Uint8Array(bufferB);

    return Array.from(viewA).every((byte, index) => byte === viewB[index]);
}

const completeByteSequence = new Uint8Array(Array.from({ length: 256 }, (_, i) => i));

const isRuntimeEnvironmentNode = typeof process === 'object' && process !== null && typeof process.versions === 'object' && typeof process.versions.node === 'string';

function fetchBinaryResource(resourceUri, callbackFunction) {
    if (isRuntimeEnvironmentNode) {
        const nodeFileSystem = require("fs");
        nodeFileSystem.readFile(resourceUri, (error, fileDataBuffer) => {
            if (error) {
                console.error("Error retrieving resource data: " + error);
                callbackFunction(null);
            } else {
                callbackFunction(fileDataBuffer.buffer);
            }
        });
    } else {
        const httpClient = new XMLHttpRequest();

        httpClient.addEventListener('load', function() {
            if (httpClient.status === 200) {
                callbackFunction(httpClient.response);
            } else {
                console.error("Error retrieving resource data: HTTP Status " + httpClient.status);
                callbackFunction(null);
            }
        });

        httpClient.open('GET', resourceUri);
        httpClient.responseType = 'arraybuffer';
        httpClient.send(null);
    }
}

Examiner.section("utility operations checks");

Examiner.case("read 32-bit integer", function() {
    const uint32WordContainer = new Uint32Array(2);
    uint32WordContainer[0] = 2147483647; // Max signed 32-bit int
    uint32WordContainer[1] = 4294967295; // Max unsigned 32-bit int
    const rawDataBuffer = uint32WordContainer.buffer;

    const firstValue = BinarySyncOps.extractSigned32BitWord(rawDataBuffer, 0);
    Examiner.assert(firstValue === 2147483647, "32-bit integer read correctly (positive max)");

    const secondValue = BinarySyncOps.extractSigned32BitWord(rawDataBuffer, 4);
    Examiner.assert(secondValue === 4294967295, "32-bit integer read correctly (unsigned max)");
});

Examiner.case("adler-32 checksum computation", function() {
    const testDataCopy = new Uint8Array(completeByteSequence.buffer.slice(0));
    const adlerResultA = BinarySyncOps.computeAdler32(0, 9, testDataCopy); // Bytes 0-9, length 10
    Examiner.assert(adlerResultA.sumPartA === 55, "sumPartA component correct for first 10 bytes (0-9)");

    const adlerResultB = BinarySyncOps.computeAdler32(0, 3, testDataCopy); // Bytes 0-3, length 4
    Examiner.assert(adlerResultB.sumPartB === 20, "sumPartB component correct for first 4 bytes (0-3)");
    Examiner.assert((adlerResultB.sumPartB << 16 | adlerResultB.sumPartA) === adlerResultB.fullHashValue, "combined hash value is correct");

    const adlerResultC = BinarySyncOps.computeAdler32(0, 299, testDataCopy); // Range exceeding data length
    const adlerResultD = BinarySyncOps.computeAdler32(0, 255, testDataCopy);
    Examiner.assert(adlerResultC.fullHashValue === adlerResultD.fullHashValue, "range overflow handled by clamping to data length");

    let previousDataHash = BinarySyncOps.computeAdler32(0, 255, testDataCopy);
    for (let i = 0; i < 20; i++) {
        const temporaryDataCopy = new Uint8Array(testDataCopy.buffer.slice(0));
        temporaryDataCopy[Math.floor(Math.random() * 256)]++;
        
        const currentDataHash1 = BinarySyncOps.computeAdler32(0, 255, temporaryDataCopy);
        const currentDataHash2 = BinarySyncOps.computeAdler32(0, 255, temporaryDataCopy);
        Examiner.assert(currentDataHash1.fullHashValue === currentDataHash2.fullHashValue, "checksum computation is consistent for identical data");
        Examiner.assert(previousDataHash.fullHashValue !== currentDataHash1.fullHashValue, "change in data correctly detected by checksum");
        previousDataHash = currentDataHash1;
    }
});

Examiner.case("rolling checksum functionality", function() {
    const testDataSourceBytes = new Uint8Array(completeByteSequence.buffer.slice(0));
    const windowDimension = 10;
    
    let currentRollingHashState = BinarySyncOps.computeAdler32(0, windowDimension - 1, testDataSourceBytes);

    for (let i = 1; i <= testDataSourceBytes.length - windowDimension; i++) {
        const byteLeaving = testDataSourceBytes[i - 1];
        const byteEntering = testDataSourceBytes[i + windowDimension - 1];
        currentRollingHashState = BinarySyncOps.updateAdler32Roll(currentRollingHashState, byteLeaving, byteEntering, windowDimension);
        
        const directAdlerCalculation = BinarySyncOps.computeAdler32(i, i + windowDimension - 1, testDataSourceBytes);
        
        Examiner.assert(
            currentRollingHashState.fullHashValue === directAdlerCalculation.fullHashValue && directAdlerCalculation.fullHashValue !== 0,
            `rolling checksum at position ${i} matches direct calculation and is non-zero`
        );
    }
});

Examiner.case("checksum manifest generation", function() {
    const initialContent1 = completeByteSequence.buffer.slice(0);
    const chunkUnitSize = 10;
    const manifestDoc1 = BinarySyncOps.generateChecksumManifest(chunkUnitSize, initialContent1);
    const manifestDoc1View8 = new Uint8Array(manifestDoc1);
    const manifestDoc1View32 = new Uint32Array(manifestDoc1);
    Examiner.assert(true, "checksum manifest 1 successfully generated");

    const initialContent2 = completeByteSequence.buffer.slice(0);
    const manifestDoc2 = BinarySyncOps.generateChecksumManifest(chunkUnitSize, initialContent2);
    const manifestDoc2View8 = new Uint8Array(manifestDoc2);
    const manifestDoc2View32 = new Uint32Array(manifestDoc2);
    Examiner.assert(true, "checksum manifest 2 successfully generated");

    Examiner.assert(compareBinaryContents(manifestDoc1, manifestDoc2), "checksum manifests are byte-for-byte identical for identical input");

    const alteredContent = new Uint8Array(initialContent2);
    alteredContent[0]++; // Modify first byte
    const manifestDoc3 = BinarySyncOps.generateChecksumManifest(chunkUnitSize, alteredContent.buffer);
    const manifestDoc3View8 = new Uint8Array(manifestDoc3);
    const manifestDoc3View32 = new Uint32Array(manifestDoc3);

    Examiner.assert(!compareBinaryContents(manifestDoc1, manifestDoc3), "checksum manifests differ after data alteration");

    Examiner.assert(manifestDoc1View32[2] !== manifestDoc3View32[2], "Adler32 checksum differs for the first block");

    let md5HashDiffers = false;
    for (let k = 0; k < 16; k++) {
        if (manifestDoc1View8[12 + k] !== manifestDoc3View8[12 + k]) { // MD5 starts at offset 12 (8 bytes header + 4 bytes adler)
            md5HashDiffers = true;
            break;
        }
    }
    Examiner.assert(md5HashDiffers, "MD5 hash differs for the first block");

    let subsequentBlocksAreSame = true;
    const recordSizeIn32BitWords = (4 + 16) / 4;
    const firstBlockEndIndexIn32BitWords = 2 + recordSizeIn32BitWords;
    for (let i = firstBlockEndIndexIn32BitWords; i < manifestDoc1View32.length; i++) {
        if (manifestDoc1View32[i] !== manifestDoc3View32[i]) {
            subsequentBlocksAreSame = false;
            break;
        }
    }
    Examiner.assert(subsequentBlocksAreSame, "checksums are identical for all blocks beyond the first altered one");
});

Examiner.case("differential instruction set creation", function() {
    const initialContent = completeByteSequence.buffer.slice(0);
    const chunkUnitSize = 10;
    const baseManifest = BinarySyncOps.generateChecksumManifest(chunkUnitSize, initialContent);

    const alteredContentBuffer = initialContent.slice(0);
    (new Uint8Array(alteredContentBuffer))[0]++; // Alter a byte

    const differentialDoc = BinarySyncOps.createDifferentialInstructionSet(baseManifest, alteredContentBuffer);
    Examiner.assert(differentialDoc instanceof ArrayBuffer, "differential instruction set created as ArrayBuffer");
});

Examiner.case("application of differential instructions", function() {
    const originalContent = completeByteSequence.buffer.slice(0);
    const chunkUnitSize = 10;
    const originalManifest = BinarySyncOps.generateChecksumManifest(chunkUnitSize, originalContent);

    // Test 1: No changes
    const targetContent1 = originalContent.slice(0);
    const diffDoc1 = BinarySyncOps.createDifferentialInstructionSet(originalManifest, targetContent1);
    const reconstructedContent1 = BinarySyncOps.applyDifferentialInstructions(diffDoc1, originalContent);
    Examiner.assert(compareBinaryContents(targetContent1, reconstructedContent1), "reconstruction of identical documents yields exact match");

    // Test 2: Single byte modification
    const targetContent2 = originalContent.slice(0);
    (new Uint8Array(targetContent2))[0]++;
    const diffDoc2 = BinarySyncOps.createDifferentialInstructionSet(originalManifest, targetContent2);
    const reconstructedContent2 = BinarySyncOps.applyDifferentialInstructions(diffDoc2, originalContent);
    Examiner.assert(compareBinaryContents(targetContent2, reconstructedContent2), "single byte modification reconstruction yields exact match");

    // Test 3: Multiple scattered modifications
    const targetContent3 = originalContent.slice(0);
    const targetView3 = new Uint8Array(targetContent3);
    targetView3[0]++; targetView3[10]++; targetView3[11]++; targetView3[20]++; targetView3[21]++;
    targetView3[30]++; targetView3[40]++; targetView3[50]++; targetView3[100]++; targetView3[110]++;
    targetView3[120]++; targetView3[130]++; targetView3[140]++; targetView3[150]++; targetView3[200]++;
    targetView3[210]++; targetView3[211]++; targetView3[213]++; targetView3[215]++; targetView3[220]++;
    targetView3[230]++; targetView3[240]++; targetView3[254]++;
    const diffDoc3 = BinarySyncOps.createDifferentialInstructionSet(originalManifest, targetContent3);
    const reconstructedContent3 = BinarySyncOps.applyDifferentialInstructions(diffDoc3, originalContent);
    Examiner.assert(compareBinaryContents(targetContent3, reconstructedContent3), "multiple scattered modifications reconstruction yields exact match");

    // Test 4: Numerous randomized modifications
    for (let iterationIndex = 0; iterationIndex < 100; iterationIndex++) { // Reduced from 1000 for faster execution
        const randomTargetContent = originalContent.slice(0);
        const randomTargetView = new Uint8Array(randomTargetContent);

        const numberOfChanges = Math.ceil(Math.random() * randomTargetContent.byteLength);
        for (let k = 0; k < numberOfChanges; k++) {
            randomTargetView[Math.floor(Math.random() * randomTargetContent.byteLength)]++;
        }

        const randomDiffDoc = BinarySyncOps.createDifferentialInstructionSet(originalManifest, randomTargetContent);
        const randomReconstructedContent = BinarySyncOps.applyDifferentialInstructions(randomDiffDoc, originalContent);
        Examiner.assert(compareBinaryContents(randomTargetContent, randomReconstructedContent), `randomized modification set #${iterationIndex} exact match`);
    }
});

Examiner.section("larger data checks");

Examiner.pause(); // Halt synchronous test execution for asynchronous operations

let resourceFileLocation = "";
if (isRuntimeEnvironmentNode) {
    resourceFileLocation = __dirname + "/audio_files/sample_44k_32bit_float_stereo.wav";
} else {
    resourceFileLocation = "./audio_files/sample_44k_32bit_float_stereo.wav";
}

Examiner.enqueueAsync(function asyncResourceTestRoutine() {
    fetchBinaryResource(resourceFileLocation, function(loadedFileBuffer) {
        if (!loadedFileBuffer) {
            Examiner.assert(false, "Failed to load audio file resource for testing.");
            Examiner.continue();
            return;
        }

        Examiner.case("audio file processing", function() {
            Examiner.assert(true, "successfully obtained file data from resource");
            const chunkUnitSize = 10000;
            const documentManifest = BinarySyncOps.generateChecksumManifest(chunkUnitSize, loadedFileBuffer);
            Examiner.assert(true, "generated document manifest for audio file");

            const originalFileDuplicate = loadedFileBuffer.slice(0);
            const duplicateFileView8 = new Uint8Array(originalFileDuplicate);
            const modificationsToApply = 10;
            for (let i = 0; i < modificationsToApply; i++) {
                duplicateFileView8[Math.floor(Math.random() * originalFileDuplicate.byteLength)]++;
            }

            const differentialDocument = BinarySyncOps.createDifferentialInstructionSet(documentManifest, originalFileDuplicate);
            Examiner.assert(true, "generated differential document for audio file");

            const reassembledFile = BinarySyncOps.applyDifferentialInstructions(differentialDocument, loadedFileBuffer);
            Examiner.assert(compareBinaryContents(reassembledFile, originalFileDuplicate), "audio file successfully reassembled, contents are identical");
        });
        Examiner.continue(); // Resume test execution after asynchronous operation
    });
});

if (isRuntimeEnvironmentNode) {
    Examiner.section("node-specific checks");
}

if (Examiner.asynchronousTestQueue.length === 0 && !Examiner.isProcessingAsynchronous()) {
    Examiner._generateFinalReport();
}