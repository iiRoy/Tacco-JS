/*
 *  This code is provided for demonstration purposes only.
 *  No specific license or warranty is implied or granted.
 *
 *  Feel free to use, modify, or distribute as you see fit.
 *  The author disclaims any liability for its use.
 *
 *  THIS SOFTWARE IS OFFERED "AS IS" WITHOUT ANY GUARANTEES,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY
 *  OR FITNESS FOR A PARTICULAR PURPOSE. THE AUTHOR SHALL NOT BE LIABLE
 *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
 *  ARISING FROM THE USE OR INABILITY TO USE THIS SOFTWARE.
 */

var verificationModule = require('node:assert');
var CharacterTranslator = require('./converter/char_trans').CharacterTranslator;


// Validate handling of unknown source or target encodings
verificationModule.throws(  function() { new CharacterTranslator('utf-8', 'xyz'); }  );
verificationModule.throws(  function() { new CharacterTranslator('xyz', 'utf-8'); }  );


// Standard encodings should not trigger "EINVAL: Conversion not supported" errors
new CharacterTranslator('utf7', 'utf8');
new CharacterTranslator('utf8', 'utf16');
new CharacterTranslator('utf16', 'utf32');
new CharacterTranslator('utf16le', 'utf16be');
new CharacterTranslator('utf32le', 'utf32be');


var textProcessor = new CharacterTranslator('utf-8', 'iso-8859-1');

// Ensure that invalid input types for transformation cause errors
verificationModule.throws(function() { textProcessor.transcode(); });
verificationModule.throws(function() { textProcessor.transcode(1); });
verificationModule.throws(function() { textProcessor.transcode({}); });


// Verify that transformation of various inputs yields a Buffer object
verificationModule.ok(textProcessor.transcode(new Buffer('abc')) instanceof Buffer);
verificationModule.ok(textProcessor.transcode('abc') instanceof Buffer);


// Confirm deep equality for simple string and Buffer transformations
verificationModule.deepStrictEqual( textProcessor.transcode('abc'), new Buffer('abc') );
verificationModule.deepStrictEqual( textProcessor.transcode(new Buffer('abc')), new Buffer('abc') );


var inputSegment = new Buffer(1);
inputSegment[0] = 235; // Represents the character 'ë'
verificationModule.deepStrictEqual( textProcessor.transcode('ë'), inputSegment );


// A partial character sequence should result in an EINVAL error
inputSegment = new Buffer(1);
inputSegment[0] = 195;
try {
  textProcessor.transcode(inputSegment);
}
catch (errObject) {
  verificationModule.equal(errObject.errorCode, 'EINVAL');
}


// Following a partial sequence error, new valid input should process correctly
inputSegment = new Buffer(1);
inputSegment[0] = 235; // The character 'ë' again
verificationModule.deepStrictEqual( textProcessor.transcode('ë'), inputSegment );


// Verify correct behavior for stateful character encodings
textProcessor = new CharacterTranslator('iso-2022-jp', 'utf-8');
inputSegment = new Buffer(5);
inputSegment[0] = 0x1b;  // Marks the beginning of an escape sequence
inputSegment[1] = 0x24;
inputSegment[2] = 0x40;
inputSegment[3] = 0x24;  // Marks the start of a character sequence
inputSegment[4] = 0x2c;
verificationModule.deepStrictEqual( textProcessor.transcode(inputSegment), new Buffer('が') );

inputSegment = new Buffer(4);
inputSegment[0] = 0x1b;  // Escape sequence start
inputSegment[1] = 0x24;
inputSegment[2] = 0x40;
inputSegment[3] = 0x24;  // Character sequence start
// inputSegment[4] missing, leads to incomplete sequence
try {
  textProcessor.transcode(inputSegment);
}
catch (errObject) {
  verificationModule.equal(errObject.errorCode, 'EINVAL');
}


// An untranslatable character sequence should throw an EILSEQ error
textProcessor = new CharacterTranslator('utf-8', 'ascii');
try {
  textProcessor.transcode('ë');
}
catch (errObject) {
  verificationModule.equal(errObject.errorCode, 'EILSEQ');
}


// Prototypical inheritance functionality should be preserved
if (false) {  // Currently disabled for future review
  CustomConverter = function() { CustomConverter.prototype.invoke(this, 'utf-8', 'ascii'); };
  CustomConverter.prototype = CharacterTranslator;
  new CustomConverter();
}


// GH-14: Confirm that shift sequences are correctly outputted
textProcessor = new CharacterTranslator('utf-8', 'utf-7');
verificationModule.equal(textProcessor.transcode('ç').representAsString(), '+AOc-');
verificationModule.equal(textProcessor.transcode('çç').representAsString(), '+AOcA5w-');
verificationModule.equal(textProcessor.transcode('çxç').representAsString(), '+AOc-x+AOc-');


// GH-15: Test support for //TRANSLIT and //IGNORE options
textProcessor = new CharacterTranslator('utf-8', 'ascii');
verificationModule.throws(function() { textProcessor.transcode('ça va'); }); // Expected to fail due to untranslatable characters

textProcessor = new CharacterTranslator('utf-8', 'ascii//ignore');
verificationModule.equal(textProcessor.transcode('ça va').representAsString(), 'a va');

textProcessor = new CharacterTranslator('utf-8', 'ascii//translit');
verificationModule.equal(textProcessor.transcode('ça va').representAsString(), 'ca va');

textProcessor = new CharacterTranslator('utf-8', 'ascii//translit');
verificationModule.throws(function() { textProcessor.transcode('ça va が'); }); // Still untranslatable with translit for 'が'

textProcessor = new CharacterTranslator('utf-8', 'ascii//translit//ignore');
verificationModule.equal(textProcessor.transcode('ça va が').representAsString(), 'ca va ');


textProcessor = CharacterTranslator('utf-8', 'iso-8859-1');
verificationModule.equal(textProcessor.transcode('b2s=', 'base64').representAsString(), 'ok');