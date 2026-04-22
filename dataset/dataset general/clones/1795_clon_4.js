var _TEST_FRAMEWORK_ACTIVATION_ = true;

var _UNIVERSAL_CONTEXT_;
var _OCTET_ARRAY_TYPE_;
var _DATA_TRANSFORMER_LIB_;
var _VALIDATOR_CORE_INSTANCE_;
var _LOG_FACILITY_INSTANCE_;

const _GET_GLOBAL_OBJECT_ = () => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    if (typeof global !== 'undefined') return global;
    return (function() { return this; })();
};

_UNIVERSAL_CONTEXT_ = _GET_GLOBAL_OBJECT_();

function _INITIALIZE_TEST_SYSTEM_() {
    _LOG_FACILITY_INSTANCE_ = _UNIVERSAL_CONTEXT_.console || {
        error: function(msg) {
            // Fallback for environments without console (e.g., some minimal JSC/Rhino setups or old browsers)
            if (typeof print === 'function') print(msg);
            else if (typeof alert === 'function') alert(msg);
            else console.log("ERROR: " + msg); // Last resort
        },
        log: function(msg) {
            if (typeof print === 'function') print(msg);
            else console.log(msg); // Last resort
        }
    };

    // Node.js / PhantomJS detection
    if (typeof require === 'function' && typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        try {
            _VALIDATOR_CORE_INSTANCE_ = require("./wru.console.js");
            _DATA_TRANSFORMER_LIB_ = require("../unibinary");
            _OCTET_ARRAY_TYPE_ = _UNIVERSAL_CONTEXT_.Uint8Array;
            return Promise.resolve();
        } catch (e) {
            _LOG_FACILITY_INSTANCE_.log("Node/Require environment failed, trying others: " + e.message);
        }
    }

    // Rhino / JSC detection
    if (typeof load === 'function') {
        try {
            // Replicate the original hack for wru/Rhino bug
            _UNIVERSAL_CONTEXT_.global = undefined;

            load("../unibinary.js");
            load("./wru.console.js");

            _DATA_TRANSFORMER_LIB_ = _UNIVERSAL_CONTEXT_.unibinary;
            _VALIDATOR_CORE_INSTANCE_ = _UNIVERSAL_CONTEXT_.wru;

            if (typeof _UNIVERSAL_CONTEXT_.Uint8Array === "undefined" && typeof exports !== "undefined") {
                load("typedarray.js");
                for (let p in exports) {
                    if (Object.prototype.hasOwnProperty.call(exports, p)) {
                        try {
                            _UNIVERSAL_CONTEXT_[p] = exports[p];
                        } catch (e) {
                            _LOG_FACILITY_INSTANCE_.error(e);
                        }
                    }
                }
            }
            _OCTET_ARRAY_TYPE_ = _UNIVERSAL_CONTEXT_.Uint8Array;

            // Handle console for Rhino/JSC if not present
            if (typeof _UNIVERSAL_CONTEXT_.console === "undefined") {
                _LOG_FACILITY_INSTANCE_ = {
                    error: function(msg) { print(msg); },
                    log: function(msg) { print(msg); }
                };
            }
            return Promise.resolve();
        } catch (e) {
            _LOG_FACILITY_INSTANCE_.log("Rhino/JSC environment failed, trying others: " + e.message);
        }
    }

    // Browser detection (XMLHttpRequest)
    if (typeof XMLHttpRequest !== 'undefined') {
        return new Promise((resolve, reject) => {
            const browserReq = new XMLHttpRequest();
            browserReq.open("get", "wru.min.js", true);
            browserReq.onreadystatechange = () => {
                if (browserReq.readyState === 4) {
                    if (browserReq.status === 200) {
                        try {
                            // Execute the script, making `wru` available as `_VALIDATOR_CORE_INSTANCE_`
                            const scriptContentTransformed = browserReq.responseText.replace(/var wru=/, "this._VALIDATOR_CORE_INSTANCE_=");
                            Function(scriptContentTransformed).call(_UNIVERSAL_CONTEXT_);

                            _VALIDATOR_CORE_INSTANCE_ = _UNIVERSAL_CONTEXT_._VALIDATOR_CORE_INSTANCE_;
                            // Assume _DATA_TRANSFORMER_LIB_ (unibinary) is globally available,
                            // possibly loaded via a separate script tag in the HTML.
                            // If it's not available under _DATA_TRANSFORMER_LIB_, it might be under its original name.
                            _DATA_TRANSFORMER_LIB_ = _UNIVERSAL_CONTEXT_._DATA_TRANSFORMER_LIB_ || _UNIVERSAL_CONTEXT_.unibinary;
                            _OCTET_ARRAY_TYPE_ = _UNIVERSAL_CONTEXT_.Uint8Array;

                            if (typeof _UNIVERSAL_CONTEXT_.console === "undefined") {
                                _LOG_FACILITY_INSTANCE_ = {
                                    error: function(msg) { alert(msg); },
                                    log: function(msg) { console.log(msg); }
                                };
                            }
                            resolve();
                        } catch (e) {
                            _LOG_FACILITY_INSTANCE_.error("Browser test runner setup error: " + (e.message || e));
                            reject(e);
                        }
                    } else {
                        _LOG_FACILITY_INSTANCE_.error("Failed to load browser test runner: Status " + browserReq.status);
                        reject(new Error("Failed to load browser test runner"));
                    }
                }
            };
            try {
                browserReq.send(null);
            } catch (e) {
                _LOG_FACILITY_INSTANCE_.error("Browser XHR send error: " + (e.message || e));
                reject(e);
            }
        });
    }

    // If no environment detected
    return Promise.reject(new Error("No compatible testing environment found."));
}


const _VALIDATION_CASES_COLLECTION_ = {
    "_VERIFY_UNICHR_12_ENCODING_DECODING_": (dataCodec, verifier) => {
        const sampleValues = [0x0, 0x1, 0xAB, 0x123, 0xABC, 0xF, 0xFF, 0xFFF];
        for (const currentVal of sampleValues) {
            const encodedChar = dataCodec.unichr_12_from_int(currentVal);
            verifier.notEquivalent(encodedChar, currentVal);
            const decodedInt = dataCodec.int_from_u12b(encodedChar);
            verifier.equivalent(currentVal, decodedInt);
        }
    },
    "_VERIFY_3_TO_2_BYTE_TRANSFORMATION_": (dataCodec, verifier) => {
        const byteTriplet = [0x12, 0x34, 0x56];
        const resultPair = dataCodec.two_twelve_bits_values_from_three_bytes(...byteTriplet);
        verifier.equivalent(resultPair[0], 0x123, "0x" + resultPair[0].toString(16));
        verifier.equivalent(resultPair[1], 0x456, "0x" + resultPair[1].toString(16));
    },
    "_VERIFY_2_TO_3_BYTE_TRANSFORMATION_": (dataCodec, verifier) => {
        const resultTriplet = dataCodec.three_bytes_from_two_twelve_bits_values(0x123, 0x456);
        verifier.equivalent(resultTriplet[0], 0x12, "0x" + resultTriplet[0].toString(16));
        verifier.equivalent(resultTriplet[1], 0x34, "0x" + resultTriplet[1].toString(16));
        verifier.equivalent(resultTriplet[2], 0x56, "0x" + resultTriplet[2].toString(16));
    },
    "_VERIFY_3_BYTE_ENCODING_": (dataCodec, verifier) => {
        const inputBytes = [0xab, 0xcd, 0xef];
        const generatedSequence = dataCodec.encode(inputBytes);
        verifier.isTrue(typeof generatedSequence == "string");
        verifier.equivalent(generatedSequence.length, 2);
        verifier.equivalent(generatedSequence.charCodeAt(0), dataCodec.U12b_start + 0xABC);
        verifier.equivalent(generatedSequence.charCodeAt(1), dataCodec.U12b_start + 0xDEF);
    },
    "_VERIFY_MIXED_BYTE_ENCODING_": (dataCodec, verifier) => {
        const inputBytes = [0xab, 0xcd, 0xef, 0xff];
        const generatedSequence = dataCodec.encode(inputBytes);
        verifier.isTrue(typeof generatedSequence == "string");
        verifier.equivalent(generatedSequence.length, 3);
        verifier.equivalent(generatedSequence.charCodeAt(0), dataCodec.U12b_start + 0xABC);
        verifier.equivalent(generatedSequence.charCodeAt(1), dataCodec.U12b_start + 0xDEF);
        verifier.equivalent(generatedSequence.charCodeAt(2), dataCodec.U8_start + 0xFF);
    },
    "_VERIFY_UNICHAR_DECODING_": (dataCodec, verifier) => {
        const char1 = String.fromCharCode(dataCodec.U12b_start + 0xABC);
        const char2 = String.fromCharCode(dataCodec.U12b_start + 0xDEF);
        const encodedString = char1 + char2;
        const decodedBytes = dataCodec.decode(encodedString);
        verifier.equivalent(decodedBytes.length, 3);
        verifier.equivalent(decodedBytes[0], 0xAB);
        verifier.equivalent(decodedBytes[1], 0xCD);
        verifier.equivalent(decodedBytes[2], 0xEF);
    },
    "_VERIFY_U8B_RANGE_CHECK_": (dataCodec, verifier) => {
        verifier.isTrue(!dataCodec.is_in_U8b(String.fromCharCode(0x03FF)));
        verifier.isTrue(dataCodec.is_in_U8b(String.fromCharCode(0x400)));
        verifier.isTrue(dataCodec.is_in_U8b(String.fromCharCode(0x4FF)));
        verifier.isTrue(!dataCodec.is_in_U8b(String.fromCharCode(0x500)));
    },
    "_VERIFY_ASCII_PAIR_TO_UNICHAR_": (dataCodec, verifier) => {
        let resultChar = dataCodec.unichr_12a_from_two_ascii('Z'.charCodeAt(0), 'E'.charCodeAt(0));
        verifier.equivalent(resultChar, String.fromCharCode(0x9485));
        resultChar = dataCodec.unichr_12a_from_two_ascii('z'.charCodeAt(0), ','.charCodeAt(0));
        verifier.equivalent(resultChar, String.fromCharCode(0x8CAC));
    },
    "_VERIFY_ASCII_STRING_ENCODING_": (dataCodec, verifier) => {
        const asciiInput = "abc";
        const encodedOutput = dataCodec.encodeString(asciiInput);
        verifier.isTrue(typeof encodedOutput == "string");
        verifier.equivalent(encodedOutput.length, 2);
        verifier.equivalent(encodedOutput.charCodeAt(0), 0x9662);
        verifier.equivalent(encodedOutput.charCodeAt(1), 0x0463);
    },
    "_VERIFY_ASCII_STRING_ENCODING_SHORT_": (dataCodec, verifier) => {
        const shortAsciiInput = "ZE";
        const encodedOutput = dataCodec.encodeString(shortAsciiInput);
        verifier.isTrue(typeof encodedOutput == "string");
        verifier.equivalent(encodedOutput.length, 1);
        verifier.equivalent(encodedOutput[0], dataCodec.unichr_12a_from_two_ascii('Z'.charCodeAt(0), 'E'.charCodeAt(0)));
    },
    "_VERIFY_REPEAT_BYTE_GEN_AAA_": (dataCodec, verifier) => {
        const generatedRepeat = dataCodec.two_unichr_to_repeat_byte_ntimes('a'.charCodeAt(0), 10);
        verifier.isTrue(typeof generatedRepeat == "string");
        verifier.equivalent(generatedRepeat.length, 2);
        verifier.equivalent(generatedRepeat.charCodeAt(0), 0x0461);
        verifier.equivalent(generatedRepeat.charCodeAt(1), 0x4E0A);
    },
    "_VERIFY_REPEAT_BYTE_GEN_XXX_": (dataCodec, verifier) => {
        const generatedRepeat = dataCodec.two_unichr_to_repeat_byte_ntimes('x'.charCodeAt(0), 3);
        verifier.isTrue(typeof generatedRepeat == "string");
        verifier.equivalent(generatedRepeat.length, 2);
        verifier.equivalent(generatedRepeat.charCodeAt(0), 0x0478);
        verifier.equivalent(generatedRepeat.charCodeAt(1), 0x4E03);
    },
    "_VERIFY_STRING_REPEAT_ENCODING_": (dataCodec, verifier) => {
        const repeatString = "xxx";
        const encodedRepeat = dataCodec.encodeString(repeatString);
        verifier.isTrue(typeof encodedRepeat == "string");
        verifier.equivalent(encodedRepeat.length, 2);
        verifier.equivalent(encodedRepeat.charCodeAt(0), 0x0478);
        verifier.equivalent(encodedRepeat.charCodeAt(1), 0x4E03);
    },
    "_VERIFY_ASCII_STRING_DECODING_": (dataCodec, verifier) => {
        const inputEncodedString = String.fromCharCode(0x9662) + String.fromCharCode(0x0463);
        const decodedBytesArray = dataCodec.decode(inputEncodedString);
        verifier.equivalent(decodedBytesArray[0], 'a'.charCodeAt(0));
        verifier.equivalent(decodedBytesArray[1], 'b'.charCodeAt(0));
        verifier.equivalent(decodedBytesArray[2], 'c'.charCodeAt(0));
    },
    "_VERIFY_ASCII_STRING_DECODING_SHORT_": (dataCodec, verifier) => {
        const inputEncodedChar = String.fromCharCode(0x9485);
        const decodedBytesArray = dataCodec.decode(inputEncodedChar);
        verifier.equivalent(decodedBytesArray[0], 'Z'.charCodeAt(0));
        verifier.equivalent(decodedBytesArray[1], 'E'.charCodeAt(0));
    },
    "_VERIFY_FIVE_BYTES_ENCODING_": (dataCodec, verifier) => {
        const fiveBytesInput = [0xab, 0xcd, 0xef, 0xab, 0xcd];
        const encodedFiveBytes = dataCodec.encode(fiveBytesInput);
        verifier.equivalent(encodedFiveBytes.length, 4);
        verifier.equivalent(encodedFiveBytes.charCodeAt(0), dataCodec.U12b_start + 0xABC);
        verifier.equivalent(encodedFiveBytes.charCodeAt(1), dataCodec.U12b_start + 0xDEF);
        verifier.equivalent(encodedFiveBytes.charCodeAt(2), dataCodec.U8_start + 0xAB);
        verifier.equivalent(encodedFiveBytes.charCodeAt(3), dataCodec.U8_start + 0xCD);
    },
    "_VERIFY_MIXED_ASCII_BYTE_ENCODING_": (dataCodec, verifier) => {
        let mixedBytesInput = [0xab, 0xcd, 0xef];
        mixedBytesInput = mixedBytesInput.concat([0x61, 0x62, 0x63, 0x64, 0x65]); //abcde
        const encodedMixed = dataCodec.encode(mixedBytesInput);
        verifier.equivalent(encodedMixed.length, 5);
        verifier.equivalent(encodedMixed.charCodeAt(0), dataCodec.U12b_start + 0xABC);
        verifier.equivalent(encodedMixed.charCodeAt(1), dataCodec.U12b_start + 0xDEF);
        verifier.equivalent(encodedMixed[2], dataCodec.unichr_12a_from_two_ascii('a'.charCodeAt(0), 'b'.charCodeAt(0)));
        verifier.equivalent(encodedMixed[3], dataCodec.unichr_12a_from_two_ascii('c'.charCodeAt(0), 'd'.charCodeAt(0)));
        verifier.equivalent(encodedMixed[4], dataCodec.unichr_08_from_int('e'.charCodeAt(0)));
    },
    "_VERIFY_MIXED_ASCII_BYTE_DECODING_": (dataCodec, verifier) => {
        let mixedEncodedString = String.fromCharCode(dataCodec.U12b_start + 0xABC);
        mixedEncodedString += String.fromCharCode(dataCodec.U12b_start + 0xDEF);
        mixedEncodedString += dataCodec.unichr_12a_from_two_ascii('a'.charCodeAt(0), 'b'.charCodeAt(0));
        mixedEncodedString += dataCodec.unichr_12a_from_two_ascii('c'.charCodeAt(0), 'd'.charCodeAt(0));
        mixedEncodedString += dataCodec.unichr_08_from_int('e'.charCodeAt(0));
        const decodedMixed = dataCodec.decode(mixedEncodedString);
        verifier.equivalent(decodedMixed.length, 8);
        verifier.equivalent(decodedMixed[0], 0xAB);
        verifier.equivalent(decodedMixed[1], 0xCD);
        verifier.equivalent(decodedMixed[2], 0xEF);
        verifier.equivalent(decodedMixed[3], 0x61);
        verifier.equivalent(decodedMixed[4], 0x62);
        verifier.equivalent(decodedMixed[5], 0x63);
        verifier.equivalent(decodedMixed[6], 0x64);
        verifier.equivalent(decodedMixed[7], 0x65);
    },
    "_VERIFY_LEFT_INSTANCE_COUNT_": (dataCodec, verifier) => {
        const sampleList = [1, 1, 1, 2, 1];
        const countResult = dataCodec.number_of_left_instances_from_index(sampleList, 0);
        verifier.equivalent(countResult, 3);
    },
    "_VERIFY_EMPTY_STRING_ENCODING_": (dataCodec, verifier) => {
        const emptyInput = "";
        const encodedEmpty = dataCodec.encodeString(emptyInput);
        verifier.equivalent(encodedEmpty, "");
    },
    "_VERIFY_SINGLE_CHAR_ENCODING_": (dataCodec, verifier) => {
        const singleCharInput = "a";
        const encodedSingleChar = dataCodec.encodeString(singleCharInput);
        verifier.isTrue(typeof encodedSingleChar == "string");
        verifier.equivalent(encodedSingleChar.length, 1);
        verifier.equivalent(encodedSingleChar.charCodeAt(0), 0x0461);
    },
    "_VERIFY_COMPLEX_REPEAT_ENCODING_": (dataCodec, verifier) => {
        const complexRepeatInput = [0xAB, 0xCD, 0xEF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00];
        const encodedComplexRepeat = dataCodec.encode(complexRepeatInput);
        verifier.equivalent(encodedComplexRepeat.length, 5);
        verifier.equivalent(encodedComplexRepeat.charCodeAt(0), 0x58BC);
        verifier.equivalent(encodedComplexRepeat.charCodeAt(1), 0x5BEF);
        verifier.equivalent(encodedComplexRepeat.charCodeAt(2), 0x04FF);
        verifier.equivalent(encodedComplexRepeat.charCodeAt(3), 0x4E04);
        verifier.equivalent(encodedComplexRepeat.charCodeAt(4), 0x0400);
    },
    "_VERIFY_MACHO_HEADER_ENCODING_": (dataCodec, verifier) => {
        const machoHeaderBytes = [0xCF, 0xFA, 0xED, 0xFE, 0x07, 0x00, 0x00, 0x01];
        const encodedMachoHeader = dataCodec.encode(machoHeaderBytes);
        verifier.equivalent(encodedMachoHeader.length, 5);
        verifier.equivalent(encodedMachoHeader.charCodeAt(0), 0x5AFF);
        verifier.equivalent(encodedMachoHeader.charCodeAt(1), 0x58ED);
        verifier.equivalent(encodedMachoHeader.charCodeAt(2), 0x5DE0);
        verifier.equivalent(encodedMachoHeader.charCodeAt(3), 0x5500);
        verifier.equivalent(encodedMachoHeader.charCodeAt(4), 0x5E01);
    },
    "_VERIFY_LARGE_REPEAT_ENCODING_PARTIAL_": (dataCodec, verifier) => {
        const largeRepeatBytes = [];
        for (let counter = 0; counter < 0x2000 - 2; counter++) largeRepeatBytes.push(0xAA);
        const encodedLargeRepeat = dataCodec.encode(largeRepeatBytes);
        verifier.equivalent(encodedLargeRepeat.length, 4);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(0), 0x04AA);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(1), 0x5DFF);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(2), 0x04AA);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(3), 0x5DFF);
    },
    "_VERIFY_LARGE_REPEAT_ENCODING_FULL_": (dataCodec, verifier) => {
        const largeRepeatBytes = [];
        for (let counter = 0; counter < 0x2000; counter++) largeRepeatBytes.push(0xAA);
        const encodedLargeRepeat = dataCodec.encode(largeRepeatBytes);
        verifier.equivalent(encodedLargeRepeat.length, 6);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(0), 0x04AA);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(1), 0x5DFF);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(2), 0x04AA);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(3), 0x5DFF);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(4), 0x04AA);
        verifier.equivalent(encodedLargeRepeat.charCodeAt(5), 0x04AA);
    },
    "_VERIFY_LONG_ASCII_TEXT_ROUNDTRIP_": (dataCodec, verifier) => {
        const longTextInput = "if I'd listened everything that they said to me, took the time to bleed from all the tiny little arrows shot my way, I wouldn't be here! the ones who don't do anything are always the ones who try to put you down. I'm talking to you: hero time starts right now! time to shine!";
        const encodedText = dataCodec.encodeString(longTextInput);
        const decodedText = dataCodec.decodeString(encodedText);
        verifier.equivalent(longTextInput, decodedText);
    },
    "_VERIFY_ASCII_RANGE_TEXT_ROUNDTRIP_": (dataCodec, verifier) => {
        let asciiRangeInput = "";
        for (let charValue = 32; charValue <= 128; charValue++) asciiRangeInput += String.fromCharCode(charValue);
        const encodedRangeText = dataCodec.encodeString(asciiRangeInput);
        const decodedRangeText = dataCodec.decodeString(encodedRangeText);
        verifier.equivalent(asciiRangeInput, decodedRangeText);
    }
};

function _START_ALL_VALIDATIONS_(activeRunner) {
    const _VERIFICATION_MODULE_ = {
        equivalent: function(val1, val2, msg) {
            activeRunner.assert(val1 === val2, msg);
        },
        notEquivalent: function(val1, val2, msg) {
            activeRunner.assert(val1 !== val2, msg);
        },
        isTrue: function(condition, msg) {
            activeRunner.assert(!!condition, msg);
        }
    };

    const convertedTests = [];
    for (const testName in _VALIDATION_CASES_COLLECTION_) {
        if (Object.prototype.hasOwnProperty.call(_VALIDATION_CASES_COLLECTION_, testName)) {
            convertedTests.push({
                name: testName,
                test: () => _VALIDATION_CASES_COLLECTION_[testName](_DATA_TRANSFORMER_LIB_, _VERIFICATION_MODULE_)
            });
        }
    }
    activeRunner.test(convertedTests);
}

_INITIALIZE_TEST_SYSTEM_().then(() => {
    _START_ALL_VALIDATIONS_(_VALIDATOR_CORE_INSTANCE_);
}).catch(err => {
    _LOG_FACILITY_INSTANCE_.error("Initialization failed: " + err.message);
});