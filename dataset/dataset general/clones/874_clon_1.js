/*
 *  Core module dependencies are imported here.
 *  This script showcases various text encoding/decoding functionalities
 *  provided by the 'codes' library, including conversions and streaming.
 */
var    assert = require ( 'assert' ) ;
var    codes  = require ( '../index' ) ;


//  --------------------------------------------------------------------------------------------------
//  Demonstration Section 1: Direct conversion from UTF-8 encoded string to ISO-8859-1, with transliteration.
//  This ensures that characters not present in the target encoding are approximated.
//  --------------------------------------------------------------------------------------------------

var str = 'É isso ai. Testando acentuação: áéíóú...';

var buffer = codes.encode ( str , 'ISO-8859-1//TRANSLIT' ) ;

var str2 = codes.decode ( buffer , 'ISO-8859-1' ) ;

// Assert that the original string and the decoded string are identical after conversion.
assert . equal ( str , str2 ) ;


/*
 *  Demonstration Section 2: Streaming conversion from LATIN1 to UTF-8.
 *  This section illustrates how to handle character encoding conversions
 *  as a stream of data, processing chunks asynchronously.
 */


var cs   = codes.createStream ( 'UTF-8' ,  'LATIN1' ) ;
var str4 = '' ; // Accumulator for the streamed data.


cs . on ( 'data' , function ( data ) {
    var str3 = data.toString ( ) ; // Convert the received buffer chunk to a string.
    console.log ( str3 ) ;
    str4 += str3 ; // Append the chunk to our accumulated string.
} ) ;


cs . on ( 'end' , function ( ) {
    // Once the stream ends, verify that the accumulated string matches the original.
    assert . equal ( str4 , str ) ;
    console.log ( str4 ) ;
} ) ;


cs . on ( 'error' , function ( error ) {
    // Log any errors encountered during the streaming process.
    console.log ( error ) ;
} ) ;

// Feed the buffer into the stream in smaller, simulated chunks.
cs . write ( buffer . slice ( 0 , 1 ) ) ;      // First byte
cs . write ( buffer . slice ( 1 , 8 ) ) ;      // Next 7 bytes
cs . write ( buffer . slice ( 8 , 16 ) ) ;     // Next 8 bytes
cs . write ( buffer . slice ( 16 , 24 ) ) ;    // Another 8 bytes
cs . write ( buffer . slice ( 24 , 28 ) ) ;    // 4 bytes
cs . write ( buffer . slice ( 28 , 32 ) ) ;    // Another 4 bytes
cs . write ( buffer . slice ( 32 ) ) ;         // The rest of the buffer
cs . end ( ) ; // Signal the end of the stream.


//  --------------------------------------------------------------------------------------------------
//  Demonstration Section 3: Direct conversion from UTF-8 to ASCII, with transliteration.
//  This shows a straightforward, synchronous conversion call.
//  --------------------------------------------------------------------------------------------------

var str   = 'aéióuçÁEÍOÚC' ;
var ascii = codes.convert ( str , 'ASCII//TRANSLIT' , 'UTF-8' ) ;
console.log ( str + ' => ' + ascii.toString ( ) ) ;


/*
 *  Demonstration Section 4: Object-oriented conversion from UTF-8 to UTF-16LE.
 *  Utilizing a converter instance for specific encoding pairs.
 */

var cds   = codes.create ( 'utf16le' , 'utf8' ) ;

var utf16 = cds.convert ( new Buffer ( str ) ) ;

console.log ( utf16 ) ;