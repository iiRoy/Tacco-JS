/*
 * This section contains utility functions and setup code.
 * It's generally not the focus of the main problem logic.
 *
 * Original header: "Don't have to see. start------------------------------------------"
 */
 var read = require('readline') . createInterface(
    {
       input : process.stdin,
       output : process.stdout
    }
 );
 var   obj;
 var   inLine = [ ];
 // Event listener for each line of input
 read . on(
    'line',
    function ( input ) {
       inLine . push(input);
    }
 );
 // Event listener for when input stream closes
 read . on(
    'close',
    function ( ) {
       obj = init(inLine);
       // Display a visual separator for debugging purposes
       console . error( '\n↑入力 ↓出力' );

       Main( );
    }
 );

 /**
  * Creates a deep clone of an object or Set.
  * @param {any} obj - The object to clone.
  * @returns {any} A deep clone of the input object.
  */
 function makeClone ( obj ) {
    return ( obj instanceof Set )
       ? new Set( Array . from( obj ) )
       : JSON . parse( JSON . stringify( obj ) ) ;
 }
 function nextInt ( ) {
    return myconv( next( ) , 1 ) ;
 }
 function nextStrArray ( ) {
    return myconv( next( ) , 2 ) ;
 }
 function nextIntArray ( ) {
    return myconv( next( ) , 4 ) ;
 }
 function nextCharArray ( ) {
    return myconv( next( ) , 6 ) ;
 }
 function next ( ) {
    return obj . next( ) ;
 }
 function hasNext ( ) {
    return obj . hasNext( ) ;
 }
 /**
  * Initializes an object for sequential input processing.
  * @param {string[]} input - An array of input lines.
  * @returns {object} An object with methods to access input lines.
  */
 function init ( input ) {

    return {
       list : input,
       index : 0,
       max : input . length,
       hasNext : function ( ) {
          return ( this . index < this . max ) ;
       },
       next : function ( ) {
          if ( this . hasNext( ) ) {
             return this . list [ this . index ++ ] ;
          } else {
             throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
          }
       }
    };
 }
 function myout ( s ) {
    console . log( s ) ;
 }
 function myerr ( s ) {
    console . error( 'debug:' + require( 'util' ) . inspect( s , false , null ) ) ;
 }
 // The "no" parameter specifies the conversion type:
 // unknown or outlier: return i as is.
 // 1: parseInt.
 // 2: split by space.
 // 4: split by space and parseInt.
 // 6: split by 1 character.
 // 7: split by 1 character and parseInt.
 // 8: join with space.
 // 9: join with newline.
 // 0: join with no character.
 function myconv ( i , no ) {
    try {
       switch ( no ) {
          case 1 :
             return parseInt( i ) ;
          case 2 :
             return i . split( ' ' ) ;
          case 4 :
             return i . split( ' ' ) . map( Number ) ;
          case 6 :
             return i . split( '' ) ;
          case 7 :
             return i . split( '' ) . map( Number ) ;
          case 8 :
             return i . join( ' ' ) ;
          case 9 :
             return i . join( '\n' ) ;
          case 0 :
             return i . join( '' ) ;
          default :
             return i ;
       }
    } catch ( e ) {
       return i ;
    }
 }

 /* End of utility functions.
  * The main program logic starts here.
  * Original footer: "Don't have to see. end------------------------------------------"
  */
 function Main ( ) {
    var S = nextInt( ); // Read the input integer S
    // Initialize a dynamic programming array with 2001 elements, all set to 0.
    // The size 2001 is chosen to accommodate S up to 2000 (0-indexed).
    var dp = new Array( 2001 ) . fill( 0 ) ;
    var mod = 1000000007 ; // Define the modulo constant

    // Iterate from i = 3 up to S
    for ( var i = 3 ; i <= S ; i ++ ) {
       dp [ i ] ++ ; // Increment dp[i] by 1
       // Inner loop for j, starting from 3 and going up to i - 3
       for ( var j = 3 ; j <= i - 3 ; j ++ ) {
          dp [ i ] += dp [ j ] ; // Add dp[j] to dp[i]
          dp [ i ] %= mod ; // Apply modulo operation to keep the result within bounds
       }
    }
    myout( dp [ S ] ) ; // Output the final calculated value for dp[S]
 }