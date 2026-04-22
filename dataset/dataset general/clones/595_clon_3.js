// This file contains a suite of validation routines for character encoding conversions.
// It verifies the behavior of the CharTransform library under various conditions.
//
// Original work by a developer from 2013, adapted and extended for demonstration purposes.
// This version is released under a permissive license, allowing use, modification, and distribution.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
// THE AUTHORS OR COPYRIGHT HOLDERS SHALL NOT BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
// THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const verifier = require('assert'); // Utilizing Node.js's built-in assertion module for test verification.
const CharTransform = require('../lib/iconv').Iconv; // Renamed Iconv to CharTransform for this clone.

// --- Section 1: Instantiation Checks and Basic Encoding Support ---

// Test case: Verify that unsupported source or target encoding names lead to runtime errors.
verifier.throws(() => {
    new CharTransform('unknown-source-codec', 'utf-8');
}, 'Should throw an error when attempting to initialize with an unrecognized source encoding.');
verifier.throws(() => {
    new CharTransform('utf-8', 'unsupported-target-codec');
}, 'Should throw an error when attempting to initialize with an unrecognized target encoding.');

// Test case: Confirm that common encoding aliases and types can be instantiated successfully.
// These are essential checks to ensure the library's core encoding support is functional.
new CharTransform('utf7', 'utf8');
new CharTransform('utf8', 'utf16');
new CharTransform('utf16', 'utf32');
new CharTransform('utf16le', 'utf16be'); // Validate byte order mark variations.
new CharTransform('utf32le', 'utf32be');

// --- Section 2: Conversion Parameter Validation and Output Type Verification ---

const initialSourceEncoding = 'utf-8';
const initialTargetEncoding = 'iso-8859-1';
let charTransformer = new CharTransform(initialSourceEncoding, initialTargetEncoding);

// Test case: Confirm that calling the convert method with invalid input types throws errors.
verifier.throws(() => {
    charTransformer.convert();
}, 'Invoking convert without any arguments must result in an error.');
verifier.throws(() => {
    charTransformer.convert(12345);
}, 'Passing a numeric value to convert should trigger an error.');
verifier.throws(() => {
    charTransformer.convert({
        key: 'value'
    });
}, 'Passing a generic object to convert should also result in an error.');

// Test case: Ensure that valid input (Buffer or string) consistently produces a Buffer instance as output.
const sampleStringInput = 'This is some sample text.';
const sampleBufferInput = Buffer.from(sampleStringInput, 'utf-8');

verifier.ok(charTransformer.convert(sampleBufferInput) instanceof Buffer,
    'Conversion of a Buffer input must yield a Buffer instance.');
verifier.ok(charTransformer.convert(sampleStringInput) instanceof Buffer,
    'Conversion of a string input must also yield a Buffer instance.');

// Test case: Validate that simple ASCII-range character conversions result in the expected byte sequence.
const simpleAsciiContent = 'abcde';
const expectedAsciiBufferOutput = Buffer.from(simpleAsciiContent, initialTargetEncoding);

verifier.deepStrictEqual(charTransformer.convert(simpleAsciiContent), expectedAsciiBufferOutput,
    'String conversion of pure ASCII characters should produce a matching byte Buffer.');
verifier.deepStrictEqual(charTransformer.convert(Buffer.from(simpleAsciiContent)), expectedAsciiBufferOutput,
    'Buffer conversion of pure ASCII characters should also produce a matching byte Buffer.');

// Test case: Verify accurate conversion of a specific non-ASCII Unicode character.
const unicodeCharacterToTest = 'ë'; // U+00EB LATIN SMALL LETTER E WITH DIAERESIS
const expectedIso88591Byte = Buffer.from([235]); // 'ë' is represented as byte 235 in ISO-8859-1

verifier.deepStrictEqual(charTransformer.convert(unicodeCharacterToTest), expectedIso88591Byte,
    'Conversion of specific Unicode character "ë" to its ISO-8859-1 byte representation.');

// --- Section 3: Robustness Checks for Partial Character Sequences ---

// Test case: Handling of incomplete multi-byte sequences, which should lead to an EINVAL error.
const partialUtf8LeadByte = Buffer.from([195]); // This is the first byte of a 2-byte UTF-8 sequence (e.g., for 'Ã').
try {
    charTransformer.convert(partialUtf8LeadByte);
    verifier.fail('Expected an EINVAL error for a partial UTF-8 sequence, but none was thrown.');
} catch (errorObject) {
    verifier.strictEqual(errorObject.code, 'EINVAL',
        'Converting a partial multi-byte character sequence must throw an EINVAL error.');
}

// Test case: Ensure the converter's state is reset or handles subsequent valid input correctly after an error.
// This confirms that an EINVAL error does not permanently corrupt the converter's state.
const recoveryCharacter = 'ë';
const expectedRecoveryBuffer = Buffer.from([235]);
verifier.deepStrictEqual(charTransformer.convert(recoveryCharacter), expectedRecoveryBuffer,
    'The converter should successfully process new input after recovering from a partial sequence error.');

// --- Section 4: Validation of Stateful Encoding Behavior ---

// Test case: Verify conversion involving a stateful encoding like ISO-2022-JP, which uses escape sequences.
charTransformer = new CharTransform('iso-2022-jp', 'utf-8');

const iso2022JpData = Buffer.from([0x1b, 0x24, 0x40, 0x24, 0x2c]); // This sequence represents the Japanese character 'が'.
const expectedUtf8ForJapaneseChar = Buffer.from('が', 'utf-8');
verifier.deepStrictEqual(charTransformer.convert(iso2022JpData), expectedUtf8ForJapaneseChar,
    'Stateful encoding conversion (ISO-2022-JP to UTF-8) for "が" must be accurate.');

// Test case: An incomplete stateful sequence should also trigger an EINVAL error.
const partialIso2022JpData = Buffer.from([0x1b, 0x24, 0x40, 0x24]); // Missing the final byte for 'が'.
try {
    charTransformer.convert(partialIso2022JpData);
    verifier.fail('Expected an EINVAL error for an incomplete stateful sequence, but none occurred.');
} catch (errorObject) {
    verifier.strictEqual(errorObject.code, 'EINVAL',
        'An incomplete stateful character sequence must throw EINVAL.');
}

// --- Section 5: Error Handling for Non-Convertible Characters (EILSEQ) ---

// Test case: Conversion of a character that has no direct representation in the target encoding.
charTransformer = new CharTransform('utf-8', 'ascii');
const characterWithoutAsciiEquivalent = 'ë';

try {
    charTransformer.convert(characterWithoutAsciiEquivalent);
    verifier.fail('Expected an EILSEQ error for a non-ASCII character to ASCII conversion, but none was thrown.');
} catch (errorObject) {
    verifier.strictEqual(errorObject.code, 'EILSEQ',
        'Converting a character with no equivalent in the target encoding must throw EILSEQ.');
}

// --- Section 6: Specific Edge Cases and Encoding Modifiers (GH-14, GH-15 related) ---

// Test case: Validate correct handling of shift sequences in UTF-7 encoding.
charTransformer = new CharTransform('utf-8', 'utf-7');
const cCedillaChar = 'ç'; // U+00E7 LATIN SMALL LETTER C WITH CEDILLA
const expectedUtf7SingleChar = '+AOc-';
const expectedUtf7DoubleChar = '+AOcA5w-'; // Two consecutive 'ç' characters
const expectedUtf7MixedChar = '+AOc-x+AOc-'; // 'ç' followed by 'x' then 'ç'

verifier.strictEqual(charTransformer.convert(cCedillaChar).toString(), expectedUtf7SingleChar,
    'UTF-7 conversion of a single "ç" should match the expected shift sequence.');
verifier.strictEqual(charTransformer.convert(cCedillaChar + cCedillaChar).toString(), expectedUtf7DoubleChar,
    'UTF-7 conversion of two consecutive "ç" characters should handle shifts correctly.');
verifier.strictEqual(charTransformer.convert(cCedillaChar + 'x' + cCedillaChar).toString(), expectedUtf7MixedChar,
    'UTF-7 conversion with mixed ASCII and non-ASCII characters should manage shift states.');

// Test case: Examination of //TRANSLIT and //IGNORE modifiers for encoding conversions.
charTransformer = new CharTransform('utf-8', 'ascii');
const problematicString = 'ça va'; // 'ç' cannot be directly represented in ASCII.
verifier.throws(() => {
    charTransformer.convert(problematicString);
}, 'Direct conversion of a string with untranslatable characters to ASCII must throw an error.');

// Using the //ignore modifier to discard untranslatable characters.
charTransformer = new CharTransform('utf-8', 'ascii//ignore');
verifier.strictEqual(charTransformer.convert(problematicString).toString(), 'a va',
    'The //ignore modifier should successfully remove characters that cannot be converted.');

// Using the //translit modifier to convert characters to their closest ASCII representation.
charTransformer = new CharTransform('utf-8', 'ascii//translit');
verifier.strictEqual(charTransformer.convert(problematicString).toString(), 'ca va',
    'The //translit modifier should transliterate "ç" to "c" during conversion.');

// Test case: //translit with a character that cannot be transliterated (e.g., a complex East Asian character).
const complexUntranslatableString = 'ça va が'; // 'が' (GA) typically has no direct ASCII transliteration.
verifier.throws(() => {
    charTransformer.convert(complexUntranslatableString);
}, 'Even with //translit, conversion should fail for characters with no transliteration equivalent.');

// Using both //translit and //ignore modifiers.
charTransformer = new CharTransform('utf-8', 'ascii//translit//ignore');
verifier.strictEqual(charTransformer.convert(complexUntranslatableString).toString(), 'ca va ',
    'Combined //translit//ignore should transliterate what is possible and ignore the rest.');

// Test case: Specific base64 encoded string conversion.
const base64EncodedPayload = 'b2s='; // Base64 for "ok"
const expectedDecodedOutput = 'ok';
// Re-initialize for this specific test, as context might have changed with modifiers.
charTransformer = new CharTransform('utf-8', 'iso-8859-1');
verifier.strictEqual(charTransformer.convert(base64EncodedPayload, 'base64').toString(), expectedDecodedOutput,
    'Conversion of a base64 encoded string should yield the correct original string.');

// Final confirmation message upon successful completion of all validation checks.
console.log("All CharTransform validation checks completed successfully.");