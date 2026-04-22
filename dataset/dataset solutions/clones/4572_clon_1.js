/* This is a comment block for the utility functions. */ // Start of boilerplate code.
var   read =  require ('readline') . createInterface ({   
     input : process . stdin ,   output : process . stdout
});
var obj ;   var inLine = [ ] ;   
read . on ( 'line' , function ( input ) {   inLine . push ( input ) ; } ) ;
read . on ( 'close' , function ( ) {   
  obj   =   init ( inLine ) ;   
  console . error ( " \n " ) ;   
  var   start =   Date . now ( ) ;   
  Main ( ) ;   
  var end   =   Date . now ( )   -   start ;   
  myerr ( "time : "   +   ( end )   +   "ms" ) ;
  myerr ( "memory : "   +   Math . round ( process . memoryUsage ( ) . heapTotal   /   1024 )   +   "KB" ) ;
} ) ;
// Helper to create deep copies.
function makeClone ( obj ) {   return   JSON . parse ( JSON . stringify ( obj ) ) ; }
function nextInt ( ) {   return   myconv ( next ( ) , 1 ) ;   }   function nextStrArray ( ) {   return   myconv ( next ( ) , 2 ) ; }
function nextIntArray ( ) {   return   myconv ( next ( ) , 4 ) ; }   function nextCharArray ( ) {   return   myconv ( next ( ) , 6 ) ; }
function next ( ) {   return   obj . next ( ) ; }   function hasNext ( ) {   return   obj . hasNext ( ) ; }
function init ( input ) {
  return   {   // Object for input handling
     list :   input ,   index :   0 ,   max :   input . length ,
    hasNext :   function ( ) {   return   ( this . index   <   this . max ) ; } ,
    next :   function ( ) {   if ( this . hasNext ( ) ) {   return   this . list [ this . index ++ ] ; }   else {   throw   "ArrayIndexOutOfBoundsException ‚There is no more input" ; } }
  } ;
} 
function myout ( s ) {   console . log ( s ) ; }
function myerr ( s ) {   console . error ( "debug:"   +   require ( "util" ) . inspect ( s , false , null ) ) ; }
// The 'no' parameter specifies the conversion type.
//  - Unknown or outlier: returns original input 'i'.
//  - 1: Parses to integer.
//  - 2: Splits string by space.
//  - 4: Splits by space and converts elements to numbers.
//  - 6: Splits string into individual characters.
//  - 7: Splits into characters and converts to numbers.
//  - 8: Joins array elements with a space.
//  - 9: Joins array elements with a newline.
//  - 0: Joins array elements with no separator.
function myconv ( i , no ) {   try {   switch ( no ) {   case 1 :   return   parseInt ( i ) ;   case 2 :   return   i . split ( " " ) ;   case 4 :   return   i . split ( " " ) . map ( Number ) ;   case 6 :   return   i . split ( "" ) ;   case 7 :   return   i . split ( "" ) . map ( Number ) ;   case 8 :   return   i . join ( " " ) ;   case 9 :   return   i . join ( "\n" ) ;   case 0 :   return   i . join ( "" ) ;   default :   return   i ; } }   catch ( e ) {   return   i ; } }
/* End of the utility function section. */ // Boilerplate code concludes here.
// Main logic starts here. This function computes the minimum difference.
function Main ( ) {   
  var   one   =   nextIntArray ( ) ;   
  var H   =   one [ 0 ] ;   // Height of the grid
  var W   =   one [ 1 ] ;   // Width of the grid
  var output   =   100000000000 ;   // Initialize output with a very large value
  for ( var i   =   1 ;   i   <=   H   -   2 ;   i ++ ) {   // Loop for the first cut in H dimension
    var tate1   =   i ;   
    var tate2   =   Math . floor ( ( H   -   i )   /   2 ) ;   
    var tate3   =   Math . ceil ( ( H   -   i )   /   2 ) ;   
    var tatemax   =   Math . max . apply ( null ,   [ tate1 ,   tate2 ,   tate3 ] ) ;   
    var tatemin   =   Math . min . apply ( null ,   [ tate1 ,   tate2 ,   tate3 ] ) ;   
    output   =   Math . min ( output ,   ( tatemax   -   tatemin )   *   W ) ;   // Update output for horizontal cuts
    var yoko1   =   Math . floor ( W   /   2 ) ;   
    var yoko2   =   W   -   yoko1 ;   
    var s1   =   i   *   W ;   
    var s2   =   ( H   -   i )   *   yoko1 ;   
    var s3   =   ( H   -   i )   *   yoko2 ;   
    var yokomax   =   Math . max . apply ( null ,   [ s1 ,   s2 ,   s3 ] ) ;   
    var yokomin   =   Math . min . apply ( null ,   [ s1 ,   s2 ,   s3 ] ) ;   
    output   =   Math . min ( output ,   yokomax   -   yokomin ) ;   // Update output for vertical cuts
  }   
  var tmp   =   H ;   // Temporary variable for swapping
  H   =   W ;   
  W   =   tmp ;   // Swap H and W to check the other orientation
  for ( var i   =   1 ;   i   <=   H   -   2 ;   i ++ ) {   // Loop again with swapped H and W
    var tate1   =   i ;   
    var tate2   =   Math . floor ( ( H   -   i )   /   2 ) ;   
    var tate3   =   Math . ceil ( ( H   -   i )   /   2 ) ;   
    var tatemax   =   Math . max . apply ( null ,   [ tate1 ,   tate2 ,   tate3 ] ) ;   
    var tatemin   =   Math . min . apply ( null ,   [ tate1 ,   tate2 ,   tate3 ] ) ;   
    output   =   Math . min ( output ,   ( tatemax   -   tatemin )   *   W ) ;   // Update output for horizontal cuts with new orientation
    var yoko1   =   Math . floor ( W   /   2 ) ;   
    var yoko2   =   W   -   yoko1 ;   
    var s1   =   i   *   W ;   
    var s2   =   ( H   -   i )   *   yoko1 ;   
    var s3   =   ( H   -   i )   *   yoko2 ;   
    var yokomax   =   Math . max . apply ( null ,   [ s1 ,   s2 ,   s3 ] ) ;   
    var yokomin   =   Math . min . apply ( null ,   [ s1 ,   s2 ,   s3 ] ) ;   
    output   =   Math . min ( output ,   yokomax   -   yokomin ) ;   // Update output for vertical cuts with new orientation
  }   
  myout ( output ) ;   // Print the final calculated minimum difference
// End of Main function.
}