/**
 * Comprehensive test runner for binary data encoding/decoding, compatible
 * across Node.js, Rhino, JSC, and web browser environments.
 * This script ensures the integrity and functionality of the core binary codec.
 */

const TEST_SUITE_ACTIVE = true; // Flag to indicate if the test suite is currently running

let applicationContext; // Placeholder for the global object reference
let OctetSequence;      // Reference to the Uint8Array or equivalent
let binaryCodec;        // The primary library for encoding/decoding operations
let testFramework;      // The testing utility (wru.console.js equivalent)
let diagnostics;        // Logging utility (console equivalent)

/**
 * Safely retrieves the global object irrespective of the execution environment.
 * @returns {object} The global object (window in browsers, global in Node.js, etc.).
 */
function retrieveGlobalObject() {
    try {
        // Attempt to return 'this' from an immediately invoked function expression (IIFE)
        return (function () {
            // A small, non-essential check to demonstrate structural change
            if (typeof this === 'object' && this !== null) {
                return this;
            } else {
                throw new Error("Failed to identify global context.");
            }
        })();
    } catch (err) {
        // Fallback for extremely restrictive environments or unexpected errors
        diagnostics.error("Error retrieving global object: " + (err.message || err));
        return typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global;
    }
}

// --- Environment-specific initialization and test execution ---

// Attempt to load for Node.js or PhantomJS environments first
try {
    diagnostics = diagnostics || console; // Ensure basic console is available for early logging
    diagnostics.log("Attempting Node.js/PhantomJS environment detection...");

    // Dynamically import required modules
    testFramework = require("./test.console.js");
    binaryCodec = require("../binary-codec");

    executeTestSuite(testFramework); // Proceed with tests
} catch (firstAttemptError) {
    // If Node.js/PhantomJS loading fails, try Rhino/JSC environment
    try {
        diagnostics.log("Node.js/PhantomJS environment not detected. Trying Rhino/JSC...");

        // This is a specific workaround for a known issue in some Rhino versions
        // involving JavaAdapter and the 'global' variable.
        if (typeof applicationContext !== 'undefined') {
            applicationContext = null; // Clear existing global context reference if any
            diagnostics.warn("Rhino workaround: 'applicationContext' reset to null.");
        }

        // Load scripts directly in Rhino/JSC global scope
        load("../binary-codec.js");
        load("./test.console.js");

        // Check for typed array support; load polyfill if necessary
        if (typeof OctetSequence === "undefined") {
            diagnostics.log("OctetSequence (Uint8Array) not found. Loading polyfill...");
            load("byteTypedArray.js");
            const currentGlobalScope = retrieveGlobalObject();
            for (const exportKey of Object.keys(moduleExports)) {
                // Only assign if not already present to avoid overwriting
                if (Object.prototype.hasOwnProperty.call(moduleExports, exportKey) && typeof currentGlobalScope[exportKey] === 'undefined') {
                    try {
                        currentGlobalScope[exportKey] = moduleExports[exportKey];
                    } catch (assignError) {
                        diagnostics.error(`Failed to attach export '${exportKey}': ${assignError.message || assignError}`);
                    }
                }
            }
            OctetSequence = currentGlobalScope.Uint8Array; // Assuming polyfill exports Uint8Array
        }

        // Ensure a basic diagnostics object is available
        if (typeof diagnostics === "undefined") {
            diagnostics = {
                error: (message) => {
                    print("ERROR: " + message);
                },
                log: (message) => {
                    print("LOG: " + message);
                },
                warn: (message) => {
                    print("WARN: " + message);
                }
            };
            diagnostics.log("Custom diagnostics object initialized for Rhino/JSC.");
        }

        executeTestSuite(testFramework); // Proceed with tests
    } catch (secondAttemptError) {
        // If Rhino/JSC loading fails, assume browser environment
        diagnostics = diagnostics || console; // Fallback to browser console
        diagnostics.log("Rhino/JSC environment not detected. Trying browser (XMLHttpRequest)...");

        // Use an IIFE for local scope for XMLHttpRequest handling
        ((xmlHttpReq) => {
            try {
                xmlHttpReq.open("get", "test_core_min.js", true); // Load minified test framework
                xmlHttpReq.responseType = 'text'; // Explicitly set response type
                xmlHttpReq.onreadystatechange = () => {
                    // Only process when request is complete and successful
                    if (xmlHttpReq.readyState === 4 && xmlHttpReq.status === 200) {
                        try {
                            // Execute the script in the global context
                            // Replaces 'var testFramework=' with 'this.testFramework=' to attach to window
                            const scriptContent = xmlHttpReq.responseText.replace(/var wru=/, "this.testFramework=");
                            // Using new Function for global execution
                            new Function(scriptContent).call(retrieveGlobalObject());

                            // Load the binary-codec library for the browser
                            const scriptElement = document.createElement('script');
                            scriptElement.src = '../binary-codec.js';
                            scriptElement.onload = () => {
                                binaryCodec = window.binaryCodec; // Assuming binary-codec attaches itself to window
                                testFramework = window.testFramework;
                                if (testFramework && binaryCodec) {
                                    // Add a small delay for DOM readiness or other async operations
                                    setTimeout(() => {
                                        executeTestSuite(testFramework);
                                    }, 50);
                                } else {
                                    window.alert("Failed to load core libraries for testing.");
                                }
                            };
                            scriptElement.onerror = (e) => {
                                window.alert("Failed to load binary-codec.js: " + (e.message || e));
                            };
                            document.head.appendChild(scriptElement);

                        } catch (execError) {
                            window.alert("Error executing test framework script: " + (execError.message || execError.toString()));
                        }
                    } else if (xmlHttpReq.readyState === 4) {
                        window.alert(`Failed to load test_core_min.js. Status: ${xmlHttpReq.status}`);
                    }
                };
                xmlHttpReq.send(null);
            } catch (xhrSendError) {
                window.alert("XMLHttpRequest setup failed: " + (xhrSendError.message || xhrSendError.toString()));
            }
        })(new XMLHttpRequest());
    }
}

/**
 * Executes the main test suite using the provided test framework.
 * @param {object} testRunner - The test framework object (e.g., wru).
 */
function executeTestSuite(testRunner) {
    diagnostics.log("Starting binary codec test suite...");

    // Custom assertion utility object
    const assertionToolkit = Object.freeze({ // Make assertions immutable
        verifyEquality: function (actual, expected, message) {
            testRunner.evaluate(actual == expected, message || `Expected ${actual} to equal ${expected}`);
        },
        verifyInequality: function (actual, expected, message) {
            testRunner.evaluate(actual != expected, message || `Expected ${actual} not to equal ${expected}`);
        },
        verifyTruth: function (condition, message) {
            testRunner.evaluate(!!condition, message || `Expected condition to be true`);
        },
        verifyFalsy: function (condition, message) {
            testRunner.evaluate(!condition, message || `Expected condition to be false`);
        },
        verifyType: function (value, expectedType, message) {
            testRunner.evaluate(typeof value === expectedType, message || `Expected type of ${value} to be ${expectedType}`);
        }
    });

    // Main test definitions array
    testRunner.test([
        {
            testName: "verify_12bit_char_conversion",
            testFunction: function () {
                const sampleValues = [0x0, 0x1, 0xAB, 0x123, 0xABC, 0xF, 0xFF, 0xFFF];
                diagnostics.log(`Running 12-bit char conversion test with ${sampleValues.length} values.`);

                for (let idx = 0; idx < sampleValues.length; idx++) {
                    const val = sampleValues[idx];

                    // Encode integer to a 12-bit unicode character
                    const encodedUnit = binaryCodec.getUnicodeChar12FromInt(val);
                    assertionToolkit.verifyInequality(encodedUnit, val, `Encoded char should not be same as original int for ${val}`);
                    assertionToolkit.verifyType(encodedUnit, "string", `Encoded unit must be a string for ${val}`);
                    assertionToolkit.verifyEquality(encodedUnit.length, 1, `Encoded unit must be a single character for ${val}`);

                    // Decode back to integer
                    const decodedVal = binaryCodec.getIntFromUnicodeChar12(encodedUnit);
                    assertionToolkit.verifyEquality(val, decodedVal, `Roundtrip failed for 0x${val.toString(16)}`);
                }
                diagnostics.info("12-bit char conversion test completed.");
            }
        },
        {
            testName: "check_3_to_2_byte_transformation",
            testFunction: function () {
                const threeBytes = [0x12, 0x34, 0x56];
                const twelveBitPair = binaryCodec.decodeThreeBytesToTwo12BitValues(threeBytes[0], threeBytes[1], threeBytes[2]);

                assertionToolkit.verifyEquality(twelveBitPair.length, 2, "Result array should contain two 12-bit values");
                assertionToolkit.verifyEquality(twelveBitPair[0], 0x123, `First value: 0x${twelveBitPair[0].toString(16)}`);
                assertionToolkit.verifyEquality(twelveBitPair[1], 0x456, `Second value: 0x${twelveBitPair[1].toString(16)}`);
            }
        },
        {
            testName: "check_2_to_3_byte_transformation",
            testFunction: function () {
                const val1 = 0x123;
                const val2 = 0x456;
                const threeByteSequence = binaryCodec.encodeTwo12BitValuesToThreeBytes(val1, val2);

                assertionToolkit.verifyEquality(threeByteSequence.length, 3, "Result array should contain three bytes");
                assertionToolkit.verifyEquality(threeByteSequence[0], 0x12, `Byte 0: 0x${threeByteSequence[0].toString(16)}`);
                assertionToolkit.verifyEquality(threeByteSequence[1], 0x34, `Byte 1: 0x${threeByteSequence[1].toString(16)}`);
                assertionToolkit.verifyEquality(threeByteSequence[2], 0x56, `Byte 2: 0x${threeByteSequence[2].toString(16)}`);
            }
        },
        {
            testName: "validate_3_byte_encoding",
            testFunction: function () {
                const byteData = new Array(0xab, 0xcd, 0xef); // Using Array constructor
                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyType(generatedOutput, "string", "Encoded output should be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 2, "Encoded string length should be 2");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), binaryCodec.UNICODE_12BIT_OFFSET + 0xABC, "First char code mismatch");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF, "Second char code mismatch");
            }
        },
        {
            testName: "validate_general_byte_encoding",
            testFunction: function () {
                let byteData = [0xab, 0xcd, 0xef, 0xff];
                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyType(generatedOutput, "string", "Encoded output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 3, "Encoded string length should be 3");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), binaryCodec.UNICODE_12BIT_OFFSET + 0xABC);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), binaryCodec.UNICODE_8BIT_OFFSET + 0xFF);
            }
        },
        {
            testName: "validate_unicode_char_decoding",
            testFunction: function () {
                const char1 = String.fromCharCode(binaryCodec.UNICODE_12BIT_OFFSET + 0xABC);
                const char2 = String.fromCharCode(binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF);

                const inputString = char1 + char2;
                const generatedOutput = binaryCodec.decodeCharsToBytes(inputString);

                assertionToolkit.verifyEquality(generatedOutput.length, 3, "Decoded array length should be 3");
                assertionToolkit.verifyEquality(generatedOutput[0], 0xAB, "First byte mismatch");
                assertionToolkit.verifyEquality(generatedOutput[1], 0xCD, "Second byte mismatch");
                assertionToolkit.verifyEquality(generatedOutput[2], 0xEF, "Third byte mismatch");
            }
        },
        {
            testName: "verify_8bit_char_range",
            testFunction: function () {
                const lowVal = String.fromCodePoint(0x03FF); // Below 8-bit range
                const midVal1 = String.fromCodePoint(0x400); // Start of 8-bit range
                const midVal2 = String.fromCodePoint(0x4FF); // End of 8-bit range
                const highVal = String.fromCodePoint(0x500); // Above 8-bit range

                assertionToolkit.verifyFalsy(binaryCodec.isWithin8BitRange(lowVal), "0x03FF should not be in 8-bit range");
                assertionToolkit.verifyTruth(binaryCodec.isWithin8BitRange(midVal1), "0x400 should be in 8-bit range");
                assertionToolkit.verifyTruth(binaryCodec.isWithin8BitRange(midVal2), "0x4FF should be in 8-bit range");
                assertionToolkit.verifyFalsy(binaryCodec.isWithin8BitRange(highVal), "0x500 should not be in 8-bit range");
            }
        },
        {
            testName: "check_12bit_ascii_pair_conversion",
            testFunction: function () {
                let encodedChar = binaryCodec.getUnicodeChar12FromTwoAscii('Z'.charCodeAt(0), 'E'.charCodeAt(0));
                assertionToolkit.verifyEquality(encodedChar, String.fromCharCode(0x9485), "ZE pair mismatch");

                encodedChar = binaryCodec.getUnicodeChar12FromTwoAscii('z'.charCodeAt(0), ','.charCodeAt(0));
                assertionToolkit.verifyEquality(encodedChar, String.fromCharCode(0x8CAC), "z, pair mismatch");
            }
        },
        {
            testName: "validate_ascii_string_encoding_1",
            testFunction: function () {
                const inputString = "abc";
                const generatedOutput = binaryCodec.encodeAsciiString(inputString);

                assertionToolkit.verifyType(generatedOutput, "string", "Encoded output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 2, "Encoded string length should be 2");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x9662, "First char code for 'abc' mismatch");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x0463, "Second char code for 'abc' mismatch");
            }
        },
        {
            testName: "validate_ascii_string_encoding_2",
            testFunction: function () {
                const inputString = "ZE";
                const generatedOutput = binaryCodec.encodeAsciiString(inputString);

                assertionToolkit.verifyType(generatedOutput, "string", "Encoded output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 1, "Encoded string length should be 1");

                assertionToolkit.verifyEquality(generatedOutput[0], binaryCodec.getUnicodeChar12FromTwoAscii('Z'.charCodeAt(0), 'E'.charCodeAt(0)), "Encoded 'ZE' mismatch");
            }
        },
        {
            testName: "check_char_repeat_encoding_aaa",
            testFunction: function () {
                const generatedOutput = binaryCodec.createRepeatCharPair('a'.charCodeAt(0), 10);
                assertionToolkit.verifyType(generatedOutput, "string", "Output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 2, "Output length should be 2");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x0461, "First char code for 'a' repeat mismatch");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x4E0A, "Second char code for 'a' repeat mismatch");
            }
        },
        {
            testName: "check_char_repeat_encoding_xxx",
            testFunction: function () {
                const generatedOutput = binaryCodec.createRepeatCharPair('x'.charCodeAt(0), 3);

                assertionToolkit.verifyType(generatedOutput, "string", "Output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 2, "Output length should be 2");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x0478, "First char code for 'x' repeat mismatch");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x4E03, "Second char code for 'x' repeat mismatch");
            }
        },
        {
            testName: "validate_string_repeat_encoding",
            testFunction: function () {
                const inputString = "xxx";
                const generatedOutput = binaryCodec.encodeAsciiString(inputString);

                assertionToolkit.verifyType(generatedOutput, "string", "Output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 2, "Output length should be 2");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x0478, "First char code for 'xxx' encoding mismatch");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x4E03, "Second char code for 'xxx' encoding mismatch");
            }
        },
        {
            testName: "validate_ascii_string_decoding_1",
            testFunction: function () {
                const inputString = String.fromCharCode(0x9662) + String.fromCharCode(0x0463);
                const decodedResultBytes = binaryCodec.decodeCharsToBytes(inputString);

                assertionToolkit.verifyEquality(decodedResultBytes.length, 3, "Decoded bytes length should be 3");
                assertionToolkit.verifyEquality(decodedResultBytes[0], 'a'.charCodeAt(0), "Decoded byte 0 mismatch");
                assertionToolkit.verifyEquality(decodedResultBytes[1], 'b'.charCodeAt(0), "Decoded byte 1 mismatch");
                assertionToolkit.verifyEquality(decodedResultBytes[2], 'c'.charCodeAt(0), "Decoded byte 2 mismatch");
            }
        },
        {
            testName: "validate_ascii_string_decoding_2",
            testFunction: function () {
                const inputString = String.fromCharCode(0x9485);
                const decodedResultBytes = binaryCodec.decodeCharsToBytes(inputString);

                assertionToolkit.verifyEquality(decodedResultBytes.length, 2, "Decoded bytes length should be 2");
                assertionToolkit.verifyEquality(decodedResultBytes[0], 'Z'.charCodeAt(0), "Decoded byte 0 mismatch");
                assertionToolkit.verifyEquality(decodedResultBytes[1], 'E'.charCodeAt(0), "Decoded byte 1 mismatch");
            }
        },
        {
            testName: "validate_five_byte_sequence_encoding",
            testFunction: function () {
                const byteData = [0xab, 0xcd, 0xef, 0xab, 0xcd];
                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyEquality(generatedOutput.length, 4, "Encoded string length should be 4");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), binaryCodec.UNICODE_12BIT_OFFSET + 0xABC);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), binaryCodec.UNICODE_8BIT_OFFSET + 0xAB);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(3), binaryCodec.UNICODE_8BIT_OFFSET + 0xCD);
            }
        },
        {
            testName: "validate_mixed_content_encoding",
            testFunction: function () {
                let byteData = [0xab, 0xcd, 0xef];
                // Append ASCII bytes for "abcde"
                byteData = byteData.concat([0x61, 0x62, 0x63, 0x64, 0x65]);

                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyEquality(generatedOutput.length, 5, "Encoded string length for mixed content should be 5");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), binaryCodec.UNICODE_12BIT_OFFSET + 0xABC);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF);
                assertionToolkit.verifyEquality(generatedOutput[2], binaryCodec.getUnicodeChar12FromTwoAscii('a'.charCodeAt(0), 'b'.charCodeAt(0)));
                assertionToolkit.verifyEquality(generatedOutput[3], binaryCodec.getUnicodeChar12FromTwoAscii('c'.charCodeAt(0), 'd'.charCodeAt(0)));
                assertionToolkit.verifyEquality(generatedOutput[4], binaryCodec.getUnicodeChar8FromInt('e'.charCodeAt(0))); // Assuming getUnicodeChar8FromInt exists
            }
        },
        {
            testName: "validate_mixed_content_decoding",
            testFunction: function () {
                let inputString = String.fromCharCode(binaryCodec.UNICODE_12BIT_OFFSET + 0xABC);
                inputString += String.fromCharCode(binaryCodec.UNICODE_12BIT_OFFSET + 0xDEF);
                inputString += binaryCodec.getUnicodeChar12FromTwoAscii('a'.charCodeAt(0), 'b'.charCodeAt(0));
                inputString += binaryCodec.getUnicodeChar12FromTwoAscii('c'.charCodeAt(0), 'd'.charCodeAt(0));
                inputString += binaryCodec.getUnicodeChar8FromInt('e'.charCodeAt(0)); // Assuming getUnicodeChar8FromInt exists

                const generatedOutput = binaryCodec.decodeCharsToBytes(inputString);

                assertionToolkit.verifyEquality(generatedOutput.length, 8, "Decoded array length for mixed content should be 8");

                assertionToolkit.verifyEquality(generatedOutput[0], 0xAB);
                assertionToolkit.verifyEquality(generatedOutput[1], 0xCD);
                assertionToolkit.verifyEquality(generatedOutput[2], 0xEF);
                assertionToolkit.verifyEquality(generatedOutput[3], 0x61); // 'a'
                assertionToolkit.verifyEquality(generatedOutput[4], 0x62); // 'b'
                assertionToolkit.verifyEquality(generatedOutput[5], 0x63); // 'c'
                assertionToolkit.verifyEquality(generatedOutput[6], 0x64); // 'd'
                assertionToolkit.verifyEquality(generatedOutput[7], 0x65); // 'e'
            }
        },
        {
            testName: "verify_consecutive_element_count",
            testFunction: function () {
                const sampleList = [1, 1, 1, 2, 1];
                const count = binaryCodec.countConsecutiveDuplicates(sampleList, 0);

                assertionToolkit.verifyEquality(count, 3, "Consecutive duplicates count mismatch");
            }
        },
        {
            testName: "validate_empty_string_encoding",
            testFunction: function () {
                const byteData = "";
                const generatedOutput = binaryCodec.encodeAsciiString(byteData);
                assertionToolkit.verifyEquality(generatedOutput, "", "Empty string should encode to an empty string");
            }
        },
        {
            testName: "validate_single_char_encoding",
            testFunction: function () {
                const byteData = "a";
                const generatedOutput = binaryCodec.encodeAsciiString(byteData);

                assertionToolkit.verifyType(generatedOutput, "string", "Output must be a string");
                assertionToolkit.verifyEquality(generatedOutput.length, 1, "Output length should be 1");
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x0461, "Encoded char 'a' mismatch");
            }
        },
        {
            testName: "verify_complex_repeat_encoding",
            testFunction: function () {
                const byteData = [0xAB, 0xCD, 0xEF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00];
                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyEquality(generatedOutput.length, 5, "Encoded string length mismatch");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x58BC);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x5BEF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), 0x04FF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(3), 0x4E04); // 0x4E00 + count
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(4), 0x0400);
            }
        },
        {
            testName: "validate_macho_header_encoding",
            testFunction: function () {
                const byteData = [0xCF, 0xFA, 0xED, 0xFE, 0x07, 0x00, 0x00, 0x01];
                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyEquality(generatedOutput.length, 5, "Encoded string length for Mach-O header mismatch");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x5AFF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x58ED);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), 0x5DE0);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(3), 0x5500);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(4), 0x5E01);
            }
        },
        {
            testName: "validate_large_repeat_encoding_minus_2",
            testFunction: function () {
                const byteData = [];
                const repeatCount = 0x2000 - 2;
                for (let i = 0; i < repeatCount; i++) {
                    byteData.push(0xAA);
                }

                const generatedOutput = binaryCodec.encodeBytes(byteData);

                assertionToolkit.verifyEquality(generatedOutput.length, 4, "Encoded string length for large repeat minus 2 mismatch");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x04AA);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x5DFF); // Max repeat count
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), 0x04AA);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(3), 0x5DFF); // Max repeat count
            }
        },
        {
            testName: "validate_large_repeat_encoding_full",
            testFunction: function () {
                const byteData = [];
                const repeatCount = 0x2000;
                for (let i = 0; i < repeatCount; i++) {
                    byteData.push(0xAA);
                }

                const generatedOutput = binaryCodec.encodeBytes(byteData);
                assertionToolkit.verifyEquality(generatedOutput.length, 6, "Encoded string length for full large repeat mismatch");

                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(0), 0x04AA);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(1), 0x5DFF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(2), 0x04AA);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(3), 0x5DFF);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(4), 0x04AA);
                assertionToolkit.verifyEquality(generatedOutput.charCodeAt(5), 0x04AA); // The last two bytes are encoded as single chars
            }
        },
        {
            testName: "validate_full_ascii_text_roundtrip",
            testFunction: function () {
                const inputString = "if I'd listened everything that they said to me, took the time to bleed from all the tiny little arrows shot my way, I wouldn't be here! the ones who don't do anything are always the ones who try to put you down. I'm talking to you: hero time starts right now! time to shine!";

                const encodedResult = binaryCodec.encodeAsciiString(inputString);
                const decodedResult = binaryCodec.decodeAsciiString(encodedResult);

                assertionToolkit.verifyEquality(inputString, decodedResult, "ASCII text roundtrip failed");
            }
        },
        {
            testName: "validate_full_ascii_range_roundtrip",
            testFunction: function () {
                let inputString = "";
                // Generate string containing all printable ASCII characters
                for (let i = 32; i <= 126; i++) { // Adjusted to standard printable ASCII range
                    inputString += String.fromCharCode(i);
                }

                const encodedResult = binaryCodec.encodeAsciiString(inputString);
                const decodedResult = binaryCodec.decodeAsciiString(encodedResult);

                assertionToolkit.verifyEquality(inputString, decodedResult, "Full ASCII range roundtrip failed");
            }
        }
    ]);
    diagnostics.log("Binary codec test suite finished.");
}