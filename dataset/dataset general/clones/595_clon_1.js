/*******************************************************************************
 * This is a Type I clone of the original JavaScript code.                     *
 *                                                                             *
 * Original Copyright (c) 2013, Ben Noordhuis <info@bnoordhuis.nl>            *
 *                                                                             *
 * Permission to use, copy, modify, and/or distribute this software for any    *
 * purpose with or without fee is hereby granted, provided that the above      *
 * copyright notice and this permission notice appear in all copies.           *
 *                                                                             *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES    *
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF            *
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR     *
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES      *
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN       *
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF     *
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.              *
 *******************************************************************************/

    // Importing the 'assert' module for making various assertions in tests.
    var assert =    require ( 'assert' ) ;

    // Importing the Iconv class from the local 'iconv' library.
    var Iconv  =    require ( '../lib/iconv' ) . Iconv ;


// --- Test Cases for Iconv Initialization ---

    // Scenario: Attempting to create an Iconv instance with an unknown target encoding.
    // This operation is expected to throw an error, as the 'xxx' encoding is not recognized.
    assert . throws ( function ( ) { new Iconv ( 'utf-8' , 'xxx' ) ; } ) ;


    // Scenario: Attempting to create an Iconv instance with an unknown source encoding.
    // Similar to the above, 'xxx' as a source encoding should also trigger an error.
    assert . throws ( function ( ) { new Iconv ( 'xxx' , 'utf-8' ) ; } ) ;


    // These are valid encoding combinations that should initialize Iconv without throwing.
    // They confirm that standard UTF encodings and their variants are correctly supported.
    new Iconv ( 'utf7' , 'utf8' ) ;
    new Iconv ( 'utf8' , 'utf16' ) ;
    new Iconv ( 'utf16' , 'utf32' ) ;
    new Iconv ( 'utf16le' , 'utf16be' ) ;
    new Iconv ( 'utf32le' , 'utf32be' ) ;


// --- Test Cases for Iconv Conversion Method ---

    // Initialize an Iconv instance for UTF-8 to ISO-8859-1 conversion.
    var iconv = new Iconv ( 'utf-8' , 'iso-8859-1' ) ;


    // Test for invalid arguments passed to `convert()`.
    // Calling without arguments should throw.
    assert . throws ( function ( ) { iconv . convert ( ) } ) ;

    // Calling with a number (invalid type) should throw.
    assert . throws ( function ( ) { iconv . convert ( 1 ) } ) ;

    // Calling with an empty object (invalid type) should throw.
    assert . throws ( function ( ) { iconv . convert ( { } ) } ) ;


    // Verify that the return type of `convert` is always a Buffer,
    // regardless of whether input is a string or a Buffer.
    assert ( iconv . convert ( new Buffer ( 'xxx' ) ) instanceof Buffer ) ;
    assert ( iconv . convert ( 'xxx' ) instanceof Buffer ) ;


    // Test for correct conversion results using `deepEqual`.
    // String input should convert to an identical Buffer.
    assert . deepEqual ( iconv . convert ( 'xxx' ) , new Buffer ( 'xxx' ) ) ;

    // Buffer input should convert to an identical Buffer.
    assert . deepEqual ( iconv . convert ( new Buffer ( 'xxx' ) ) , new Buffer ( 'xxx' ) ) ;


    // Test with a specific character 'ë' (235 in ISO-8859-1).
    // The expected output is a Buffer containing the byte 235.
    var buffer = new Buffer ( 1 ) ;
    buffer [ 0 ] = 235 ; // Represents the character 'ë' in ISO-8859-1.
    assert . deepEqual ( iconv . convert ( 'ë' ) , buffer ) ;


    // --- Partial Character Sequence Handling Test ---

    // This section verifies that partial character sequences trigger an 'EINVAL' error.
    buffer = new Buffer ( 1 ) ;
    buffer [ 0 ] = 195 ; // This is the first byte of a two-byte UTF-8 character (e.g., 'Ã').
    try {
        iconv . convert ( buffer ) ; // Attempting to convert an incomplete sequence.
    } catch ( e ) {
        // Expecting an 'EINVAL' error code for invalid input sequence.
        assert . equal ( e . code , 'EINVAL' ) ;
    }


    // After a partial character sequence error, subsequent conversions should still work correctly.
    // This confirms that the internal state of the iconv converter is properly reset or handled.
    buffer = new Buffer ( 1 ) ;
    buffer [ 0 ] = 235 ; // Reset buffer to 'ë' byte.
    assert . deepEqual ( iconv . convert ( 'ë' ) , buffer ) ;


// --- Stateful Encodings Test (ISO-2022-JP) ---

    // Test to ensure stateful encodings like ISO-2022-JP handle escape sequences correctly.
    iconv = new Iconv ( 'iso-2022-jp' , 'utf-8' ) ;
    buffer = new Buffer ( 5 ) ;
    buffer [ 0 ] = 0x1b ;  // ESC byte - signals start of an escape sequence.
    buffer [ 1 ] = 0x24 ;  // '$' byte.
    buffer [ 2 ] = 0x40 ;  // '@' byte - together with ESC $ @, switches to JIS X 0208-1978.
    buffer [ 3 ] = 0x24 ;  // First byte of a two-byte character in JIS X 0208.
    buffer [ 4 ] = 0x2c ;  // Second byte of the character. This sequence represents 'が'.
    assert . deepEqual ( iconv . convert ( buffer ) , new Buffer ( 'が' ) ) ;


    // Test case for an incomplete stateful character sequence, expecting an error.
    buffer = new Buffer ( 4 ) ; // Buffer is intentionally one byte short.
    buffer [ 0 ] = 0x1b ;  // ESC
    buffer [ 1 ] = 0x24 ;  // $
    buffer [ 2 ] = 0x40 ;  // @
    buffer [ 3 ] = 0x24 ;  // First byte of 'が' but the second byte is missing.
    // buffer [ 4 ] = 0x2c ; // This byte is deliberately omitted to create an incomplete sequence.
    try {
        iconv . convert ( buffer ) ; // This conversion should fail due to incompleteness.
    } catch ( e ) {
        // Assert that an 'EINVAL' error (invalid argument) is thrown.
        assert . equal ( e . code , 'EINVAL' ) ;
    }


// --- Non-Convertible Character Sequence Test (EILSEQ) ---

    // Initialize iconv to convert from UTF-8 to ASCII.
    // ASCII cannot represent all UTF-8 characters directly.
    iconv = new Iconv ( 'utf-8' , 'ascii' ) ;
    try {
        iconv . convert ( 'ë' ) ; // 'ë' cannot be represented in pure ASCII.
    } catch ( e ) {
        // Expecting an 'EILSEQ' error (illegal byte sequence) for untranslatable characters.
        assert . equal ( e . code , 'EILSEQ' ) ;
    }


// --- Prototypical Inheritance Test (Currently Disabled) ---

    // This block demonstrates how prototypical inheritance *would* work with Iconv,
    // though it is currently commented out (`if (false)`).
    // It shows how a custom constructor `Foo` could inherit from `Iconv`.
    if ( false ) {  // XXX This feature/test is disabled for the moment.
        Foo = function ( ) {
            // Call the Iconv constructor using `call` to set up the instance.
            Foo . prototype . call ( this , 'utf-8' , 'ascii' ) ;
        } ;
        Foo . prototype = Iconv ; // Set Foo's prototype to Iconv's prototype.
        new Foo ( ) ; // Instantiate Foo, which should behave like an Iconv.
    }


// --- GH-14: Shift Sequences in UTF-7 ---

    // Test related to GitHub issue #14, ensuring correct handling of shift sequences in UTF-7.
    iconv = new Iconv ( 'utf-8' , 'utf-7' ) ;

    // Convert a single non-ASCII character 'ç'.
    // In UTF-7, 'ç' should be represented with a shift sequence '+AOc-'.
    assert . equal ( iconv . convert ( 'ç' ) . toString ( ) , '+AOc-' ) ;

    // Convert two consecutive 'ç' characters.
    // UTF-7 should handle both, potentially concatenating shift sequences.
    assert . equal ( iconv . convert ( 'çç' ) . toString ( ) , '+AOcA5w-' ) ;

    // Convert 'ç' followed by an ASCII character 'x' then another 'ç'.
    // This tests shifting in and out of the modified UTF-7 alphabet.
    assert . equal ( iconv . convert ( 'çxç' ) . toString ( ) , '+AOc-x+AOc-' ) ;


// --- GH-15: //TRANSLIT and //IGNORE Modifiers ---

    // Test related to GitHub issue #15, demonstrating support for //TRANSLIT and //IGNORE.

    // Basic conversion from UTF-8 to ASCII without modifiers.
    // 'ça va' contains 'ç' which is untranslatable to ASCII, so it should throw.
    iconv = new Iconv ( 'utf-8' , 'ascii' ) ;
    assert . throws ( function ( ) { iconv . convert ( 'ça va' ) ; } ) ; // Expected to throw for 'ç'.

    // Using the //ignore modifier: untranslatable characters should be dropped.
    iconv = new Iconv ( 'utf-8' , 'ascii//ignore' ) ;
    assert . equal ( iconv . convert ( 'ça va' ) . toString ( ) , 'a va' ) ; // 'ç' is ignored.

    // Using the //translit modifier: untranslatable characters should be transliterated.
    iconv = new Iconv ( 'utf-8' , 'ascii//translit' ) ;
    assert . equal ( iconv . convert ( 'ça va' ) . toString ( ) , 'ca va' ) ; // 'ç' becomes 'c'.

    // Test //translit with a character that cannot be transliterated (e.g., Japanese 'が').
    iconv = new Iconv ( 'utf-8' , 'ascii//translit' ) ;
    assert . throws ( function ( ) { iconv . convert ( 'ça va が' ) ; } ) ; // 'が' is untranslatable even with transliteration.

    // Combining //translit and //ignore: transliterate what can be, ignore what cannot.
    iconv = new Iconv ( 'utf-8' , 'ascii//translit//ignore' ) ;
    assert . equal ( iconv . convert ( 'ça va が' ) . toString ( ) , 'ca va ' ) ; // 'ç' becomes 'c', 'が' is ignored.


    // Final test: Convert a base64 string to its original form using Iconv.
    // This demonstrates an interesting use case of Iconv's capabilities.
    iconv = Iconv ( 'utf-8' , 'iso-8859-1' ) ;
    assert . equal ( iconv . convert ( 'b2s=' , 'base64' ) . toString ( ) , 'ok' ) ;