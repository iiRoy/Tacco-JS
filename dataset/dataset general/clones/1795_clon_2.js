// This module provides a flexible test execution environment
// compatible with Node.js, Rhino, JavaScriptCore, and web browsers.
// It's designed for verifying the functionality of a custom binary data handler.

BINARY_TEST_FLAG_ACTIVE = !false; // Activate the custom binary testing suite

var currentScope; // Holds reference to the global object
var OctetArray; // Represents the Uint8Array or similar byte structure
var bitStreamUtil; // The core utility for handling binary to string conversions
var testRunner; // The framework responsible for running tests
var debugLog; // Console-like object for logging messages

/**
 * Retrieves the global execution context.
 * This function ensures compatibility across various JavaScript environments
 * by returning the 'this' context from an immediately invoked function expression.
 */
function fetchCurrentContext() {
    return (function() {
        return this; // Return the global 'this'
    })();
}

// Attempt to load dependencies based on the environment.
// This block handles different module loading mechanisms.
try {
    // Environment check: Node.js or similar CommonJS-style environments (e.g., PhantomJS).
    // Attempt to load the test framework and the binary utility.
    testRunner = require("./test.console.js"); // Load the console-based test framework
    bitStreamUtil = require("../binary_data_handler"); // Load the custom binary handling library

    // Once dependencies are loaded, initiate the test execution.
    beginTests(testRunner);
} catch (errObject) {
    // If CommonJS 'require' fails, it might be a Rhino or JavaScriptCore environment.
    try {
        currentScope = void 0; // Explicitly set global to undefined to bypass potential issues in some Rhino versions.
                               // This is a known workaround for specific framework interactions.

        load("../binary_data_handler.js"); // Load the binary utility script directly
        load("./test.console.js"); // Load the console test framework script

        // Check if a native TypedArray implementation is available.
        if (typeof OctetArray === "undefined") {
            load("octetarray_polyfill.js"); // Load a polyfill for Uint8Array if not present
            var browserWindow = fetchCurrentContext(); // Get the global context (which could be 'window' in a browser-like env)
            for (var propKey in exports) { // Iterate through properties exported by the polyfill
                if (exports.hasOwnProperty(propKey)) {
                    try {
                        browserWindow[propKey] = exports[propKey]; // Expose polyfill exports to the global scope
                    } catch (errObject2) { // Catch potential errors during property assignment
                        print(errObject2); // Log any errors to the console (or print function in Rhino)
                    }
                }
            }
        }

        // Ensure a basic console object is available for logging.
        if (typeof debugLog === "undefined") {
            debugLog = {
                error: function(message) {
                    print(message); // Output error messages
                },
                log: function(message) {
                    print(message); // Output general log messages
                }
            };
        }

        // Proceed with test execution using the loaded test runner.
        beginTests(testRunner);
    } catch (errObject3) {
        // If direct 'load' also fails, assume a standard browser environment (HTML).
        // This path attempts to load the test runner via XMLHttpRequest.
        (function(httpRequest) {
            try {
                httpRequest.open("GET", "test.min.js", true); // Prepare an asynchronous GET request for the minified test runner
                httpRequest.onreadystatechange = function() {
                    // Check if the request is complete and successful.
                    if (httpRequest.readyState === 4) {
                        try {
                            // Execute the fetched script. Replace 'var testRunner=' with 'this.testRunner='
                            // to ensure it's assigned to the global context in this scope.
                            Function(httpRequest.responseText.replace(/var testRunner=/, "this.testRunner=")).call(window);
                        } catch (errObject4) {
                            alert(errObject4); // Alert any errors during script execution
                        }
                        beginTests(window.testRunner); // Start tests using the now globally available test runner
                    }
                };
                httpRequest.send(null); // Send the request
            } catch (errObject5) {
                alert(errObject5.message || errObject5); // Alert any errors during the XHR setup
            }
        }(new XMLHttpRequest())); // Create and immediately invoke with a new XMLHttpRequest instance
    }
}


/**
 * Main function to kick off the unit tests.
 * @param {object} testEngine The testing framework instance.
 */
function beginTests(testEngine) {
    // Define an assertion helper object for cleaner test syntax.
    var assertionChecks = {
        verifyEquality: function(val1, val2, msgText) {
            testEngine.assert(val1 == val2, msgText); // Assert if two values are equal
        },
        verifyInequality: function(val1, val2, msgText) {
            testEngine.assert(val1 != val2, msgText); // Assert if two values are not equal
        },
        confirmTrue: function(val1, msgText) {
            testEngine.assert(val1, msgText); // Assert if a value is truthy
        }
    };

    // Begin the test suite execution.
    testEngine.test([
        {
            name: "verify_char12_conversion_cycle", // Test name for clarity
            test: function() {
                var inputSequence = [0x00, 0x01, 0xAB, 0x123, 0xABC, 0xF, 0xFF, 0xFFF]; // Array of integers to test
                var idx; // Loop index
                var currentVal; // Current integer value from the sequence

                for (idx = 0; idx < inputSequence.length; idx++) {
                    currentVal = inputSequence[idx]; // Get current value

                    var charRepresentation = bitStreamUtil.getChar12FromInt(currentVal); // Convert int to 12-bit char
                    assertionChecks.verifyInequality(charRepresentation, currentVal); // Ensure conversion changes value

                    var reconvertedInt = bitStreamUtil.getIntFromChar12(charRepresentation); // Convert char back to int
                    assertionChecks.verifyEquality(currentVal, reconvertedInt); // Verify original and reconverted values are identical
                }
            }
        },
        {
            name: "verify_three_to_two_byte_split",
            test: function() {
                var pairOfValues = bitStreamUtil.getTwo12BitValsFromThreeBytes(0x12, 0x34, 0x56); // Convert 3 bytes to 2x12-bit values

                assertionChecks.verifyEquality(pairOfValues[0], 0x123, "Hex: " + pairOfValues[0].toString(16)); // Check first 12-bit value
                assertionChecks.verifyEquality(pairOfValues[1], 0x456, "Hex: " + pairOfValues[1].toString(16)); // Check second 12-bit value
            }
        },
        {
            name: "verify_two_to_three_byte_merge",
            test: function() {
                var tripleOfValues = bitStreamUtil.getThreeBytesFromTwo12BitVals(0x123, 0x456); // Convert 2x12-bit values to 3 bytes

                assertionChecks.verifyEquality(tripleOfValues[0], 0x12, "Hex: " + tripleOfValues[0].toString(16)); // Check first byte
                assertionChecks.verifyEquality(tripleOfValues[1], 0x34, "Hex: " + tripleOfValues[1].toString(16)); // Check second byte
                assertionChecks.verifyEquality(tripleOfValues[2], 0x56, "Hex: " + tripleOfValues[2].toString(16)); // Check third byte
            }
        },
        {
            name: "verify_three_byte_encoding",
            test: function() {
                var rawData = [0xab, 0xcd, 0xef]; // Input byte array
                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode the bytes

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output should be a string
                assertionChecks.verifyEquality(generatedOutput.length, 2); // Expected string length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), bitStreamUtil.UNICODE12_START_CODE + 0xABC); // Check first encoded character
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Check second encoded character
            }
        },
        {
            name: "verify_multiple_byte_encoding",
            test: function() {
                var rawData = [0xab, 0xcd, 0xef, 0xff]; // Input byte array
                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode the bytes

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output should be a string
                assertionChecks.verifyEquality(generatedOutput.length, 3); // Expected string length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), bitStreamUtil.UNICODE12_START_CODE + 0xABC); // First char
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Second char
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), bitStreamUtil.UNICODE8_START_CODE + 0xFF); // Third char (8-bit)
            }
        },
        {
            name: "verify_unicode_character_decoding",
            test: function() {
                var char1 = String.fromCharCode(bitStreamUtil.UNICODE12_START_CODE + 0xABC); // Create first unicode char
                var char2 = String.fromCharCode(bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Create second unicode char

                var inputString = char1 + char2; // Concatenate them

                var generatedOutput = bitStreamUtil.decodeData(inputString); // Decode the string

                assertionChecks.verifyEquality(generatedOutput.length, 3); // Expected byte array length

                assertionChecks.verifyEquality(generatedOutput[0], 0xAB); // Verify first byte
                assertionChecks.verifyEquality(generatedOutput[1], 0xCD); // Verify second byte
                assertionChecks.verifyEquality(generatedOutput[2], 0xEF); // Verify third byte
            }
        },
        {
            name: "verify_8bit_range_check",
            test: function() {
                assertionChecks.confirmTrue(!bitStreamUtil.isWithin8BitRange(String.fromCharCode(0x03FF))); // Should be false
                assertionChecks.confirmTrue(bitStreamUtil.isWithin8BitRange(String.fromCharCode(0x400))); // Should be true
                assertionChecks.confirmTrue(bitStreamUtil.isWithin8BitRange(String.fromCharCode(0x4FF))); // Should be true
                assertionChecks.confirmTrue(!bitStreamUtil.isWithin8BitRange(String.fromCharCode(0x500))); // Should be false
            }
        },
        {
            name: "verify_12bit_ascii_encoding_from_two_chars",
            test: function() {
                var charRepresentation = bitStreamUtil.getChar12FromTwoAscii('Z'.charCodeAt(0), 'E'.charCodeAt(0)); // Convert two ASCII to one 12-bit char
                assertionChecks.verifyEquality(charRepresentation, String.fromCharCode(0x9485)); // Check result

                charRepresentation = bitStreamUtil.getChar12FromTwoAscii('z'.charCodeAt(0), ','.charCodeAt(0)); // Another conversion
                assertionChecks.verifyEquality(charRepresentation, String.fromCharCode(0x8CAC)); // Check result
            }
        },
        {
            name: "verify_ascii_text_encoding",
            test: function() {
                var inputString = "abc"; // Input ASCII string
                var generatedOutput = bitStreamUtil.encodeText(inputString); // Encode the string

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 2); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x9662); // Check first char code
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x0463); // Check second char code
            }
        },
        {
            name: "verify_ascii_text_encoding_short",
            test: function() {
                var inputString = "ZE"; // Short ASCII string
                var generatedOutput = bitStreamUtil.encodeText(inputString); // Encode

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 1); // Expected length

                assertionChecks.verifyEquality(generatedOutput[0], bitStreamUtil.getChar12FromTwoAscii('Z'.charCodeAt(0), 'E'.charCodeAt(0))); // Check encoded char
            }
        },
        {
            name: "verify_repeat_byte_encoding_long",
            test: function() {
                var generatedOutput = bitStreamUtil.getTwoCharsForRepeatByte('a'.charCodeAt(0), 10); // Encode 'a' repeated 10 times
                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 2); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x0461); // First char code
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x4E0A); // Second char code
            }
        },
        {
            name: "verify_repeat_byte_encoding_short",
            test: function() {
                var generatedOutput = bitStreamUtil.getTwoCharsForRepeatByte('x'.charCodeAt(0), 3); // Encode 'x' repeated 3 times

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 2); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x0478); // First char code
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x4E03); // Second char code
            }
        },
        {
            name: "verify_string_repeat_encoding",
            test: function() {
                var inputString = "xxx"; // String with repeating characters
                var generatedOutput = bitStreamUtil.encodeText(inputString); // Encode it

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 2); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x0478); // First char code
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x4E03); // Second char code
            }
        },
        {
            name: "verify_ascii_text_decoding",
            test: function() {
                var inputString = String.fromCharCode(0x9662) + String.fromCharCode(0x0463); // Encoded string

                var decodedResult = bitStreamUtil.decodeData(inputString); // Decode it

                assertionChecks.verifyEquality(decodedResult[0], 'a'.charCodeAt(0)); // Verify first byte
                assertionChecks.verifyEquality(decodedResult[1], 'b'.charCodeAt(0)); // Verify second byte
                assertionChecks.verifyEquality(decodedResult[2], 'c'.charCodeAt(0)); // Verify third byte
            }
        },
        {
            name: "verify_ascii_text_decoding_short",
            test: function() {
                var inputString = String.fromCharCode(0x9485); // Encoded short string

                var decodedResult = bitStreamUtil.decodeData(inputString); // Decode it

                assertionChecks.verifyEquality(decodedResult[0], 'Z'.charCodeAt(0)); // Verify first byte
                assertionChecks.verifyEquality(decodedResult[1], 'E'.charCodeAt(0)); // Verify second byte
            }
        },
        {
            name: "verify_five_byte_encoding",
            test: function() {
                var rawData = [0xab, 0xcd, 0xef, 0xab, 0xcd]; // Five bytes
                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput.length, 4); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), bitStreamUtil.UNICODE12_START_CODE + 0xABC); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Char 2
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), bitStreamUtil.UNICODE8_START_CODE + 0xAB); // Char 3
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(3), bitStreamUtil.UNICODE8_START_CODE + 0xCD); // Char 4
            }
        },
        {
            name: "verify_mixed_ascii_and_raw_byte_encoding",
            test: function() {
                var rawData = [0xab, 0xcd, 0xef]; // Initial raw bytes
                rawData = rawData.concat([0x61, 0x62, 0x63, 0x64, 0x65]); // Append ASCII bytes for "abcde"

                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode the mixed data

                assertionChecks.verifyEquality(generatedOutput.length, 5); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), bitStreamUtil.UNICODE12_START_CODE + 0xABC); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Char 2
                assertionChecks.verifyEquality(generatedOutput[2], bitStreamUtil.getChar12FromTwoAscii('a'.charCodeAt(0), 'b'.charCodeAt(0))); // Char 3 (2 ASCII)
                assertionChecks.verifyEquality(generatedOutput[3], bitStreamUtil.getChar12FromTwoAscii('c'.charCodeAt(0), 'd'.charCodeAt(0))); // Char 4 (2 ASCII)
                assertionChecks.verifyEquality(generatedOutput[4], bitStreamUtil.getChar8FromInt('e'.charCodeAt(0))); // Char 5 (1 ASCII as 8-bit)
            }
        },
        {
            name: "verify_mixed_ascii_and_raw_byte_decoding",
            test: function() {
                var inputString = String.fromCharCode(bitStreamUtil.UNICODE12_START_CODE + 0xABC); // First part of encoded string
                inputString += String.fromCharCode(bitStreamUtil.UNICODE12_START_CODE + 0xDEF); // Second part
                inputString += bitStreamUtil.getChar12FromTwoAscii('a'.charCodeAt(0), 'b'.charCodeAt(0)); // Third part (2 ASCII)
                inputString += bitStreamUtil.getChar12FromTwoAscii('c'.charCodeAt(0), 'd'.charCodeAt(0)); // Fourth part (2 ASCII)
                inputString += bitStreamUtil.getChar8FromInt('e'.charCodeAt(0)); // Fifth part (1 ASCII as 8-bit)

                var generatedOutput = bitStreamUtil.decodeData(inputString); // Decode the mixed string

                assertionChecks.verifyEquality(generatedOutput.length, 8); // Expected length of decoded bytes

                assertionChecks.verifyEquality(generatedOutput[0], 0xAB); // Byte 1
                assertionChecks.verifyEquality(generatedOutput[1], 0xCD); // Byte 2
                assertionChecks.verifyEquality(generatedOutput[2], 0xEF); // Byte 3
                assertionChecks.verifyEquality(generatedOutput[3], 0x61); // Byte 4 ('a')
                assertionChecks.verifyEquality(generatedOutput[4], 0x62); // Byte 5 ('b')
                assertionChecks.verifyEquality(generatedOutput[5], 0x63); // Byte 6 ('c')
                assertionChecks.verifyEquality(generatedOutput[6], 0x64); // Byte 7 ('d')
                assertionChecks.verifyEquality(generatedOutput[7], 0x65); // Byte 8 ('e')
            }
        },
        {
            name: "verify_consecutive_instance_count",
            test: function() {
                var dataList = [1, 1, 1, 2, 1]; // Sample list
                var count = bitStreamUtil.countLeftwardOccurrences(dataList, 0); // Count repetitions from index 0

                assertionChecks.verifyEquality(count, 3); // Expected count is 3
            }
        },
        {
            name: "verify_empty_string_encoding",
            test: function() {
                var rawData = ""; // Empty string input
                var generatedOutput = bitStreamUtil.encodeText(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput, ""); // Expected empty string output
            }
        },
        {
            name: "verify_single_character_encoding",
            test: function() {
                var rawData = "a"; // Single character input
                var generatedOutput = bitStreamUtil.encodeText(rawData); // Encode

                assertionChecks.confirmTrue(typeof generatedOutput === "string"); // Output is string
                assertionChecks.verifyEquality(generatedOutput.length, 1); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x0461); // Check char code
            }
        },
        {
            name: "verify_multiple_repeats_encoding_complex",
            test: function() {
                var rawData = [0xAB, 0xCD, 0xEF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]; // Bytes with repeats

                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput.length, 5); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x58BC); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x5BEF); // Char 2
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), 0x04FF); // Char 3 (repeated byte marker)
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(3), 0x4E04); // Char 4 (count of repeats)
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(4), 0x0400); // Char 5
            }
        },
        {
            name: "verify_macho_header_encoding",
            test: function() {
                var rawData = [0xCF, 0xFA, 0xED, 0xFE, 0x07, 0x00, 0x00, 0x01]; // Mach-O header bytes

                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput.length, 5); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x5AFF); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x58ED); // Char 2
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), 0x5DE0); // Char 3
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(3), 0x5500); // Char 4
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(4), 0x5E01); // Char 5
            }
        },
        {
            name: "verify_large_repeats_encoding_boundary_minus_two",
            test: function() {
                var rawData = []; // Initialize byte array
                for (var index = 0; index < 0x2000 - 2; index++) {
                    rawData.push(0xAA); // Fill with repeating byte
                }

                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput.length, 4); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x04AA); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x5DFF); // Char 2
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), 0x04AA); // Char 3
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(3), 0x5DFF); // Char 4
            }
        },
        {
            name: "verify_large_repeats_encoding_boundary",
            test: function() {
                var rawData = []; // Initialize byte array
                for (var index = 0; index < 0x2000; index++) {
                    rawData.push(0xAA); // Fill with repeating byte
                }

                var generatedOutput = bitStreamUtil.encodeData(rawData); // Encode

                assertionChecks.verifyEquality(generatedOutput.length, 6); // Expected length

                assertionChecks.verifyEquality(generatedOutput.charCodeAt(0), 0x04AA); // Char 1
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(1), 0x5DFF); // Char 2
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(2), 0x04AA); // Char 3
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(3), 0x5DFF); // Char 4
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(4), 0x04AA); // Char 5
                assertionChecks.verifyEquality(generatedOutput.charCodeAt(5), 0x04AA); // Char 6
            }
        },
        {
            name: "verify_full_ascii_text_encoding_decoding_cycle",
            test: function() {
                var inputString = "if I'd listened everything that they said to me, took the time to bleed from all the tiny little arrows shot my way, I wouldn't be here! the ones who don't do anything are always the ones who try to put you down. I'm talking to you: hero time starts right now! time to shine!"; // Long ASCII text

                var encodedResult = bitStreamUtil.encodeText(inputString); // Encode the text
                var decodedResult = bitStreamUtil.decodeText(encodedResult); // Decode it back

                assertionChecks.verifyEquality(inputString, decodedResult); // Verify original and decoded text are identical
            }
        },
        {
            name: "verify_full_ascii_range_encoding_decoding_cycle",
            test: function() {
                var inputString = ""; // Initialize empty string
                for (var charCode = 32; charCode <= 128; charCode++) {
                    inputString += String.fromCharCode(charCode); // Build string with full ASCII range (printable)
                }

                var encodedResult = bitStreamUtil.encodeText(inputString); // Encode the range string
                var decodedResult = bitStreamUtil.decodeText(encodedResult); // Decode it back

                assertionChecks.verifyEquality(inputString, decodedResult); // Verify original and decoded text are identical
            }
        }
    ]);
}