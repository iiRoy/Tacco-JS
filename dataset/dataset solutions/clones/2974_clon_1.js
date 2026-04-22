function main ( input ) {
  // This function, 'main', takes a single argument 'input'.
  // It's the primary entry point for processing the provided data.
  let  continuityNum  =  input . split ( " " ) ;  //  Splits the input string by a space character.
  
  //  The following line was part of the original source but commented out.
  //  It intended to extract a second number from the input.
  /*  let  selectNum  =  input . split ( " " ) [ 1 ] ;  */
  
  console . log ( continuityNum ) ;  //  Outputs the resulting array `continuityNum` to the standard console.
  
  //  -------------------------------------------------------------------
  //  Below are several lines of code that were entirely commented out
  //  in the original submission. They seem to outline a more complex
  //  algorithm or logic that was not active.
  //  -------------------------------------------------------------------
  
  //  let  nowNum  =  1 ;  //  A variable intended to hold a current numerical value, initialized to 1.
  //  let  endFlg  =  0 ;  //  A flag, potentially for controlling loop termination or state.
  
  /*
   *  This block contains a 'while' loop structure that was also
   *  completely commented out. It appears to perform calculations
   *  and conditional checks based on 'nowNum', 'selectNum',
   *  and 'continuityNum'.
   */
  //  var  count  =  0 ;
  //  while ( 1 ) {  //  An infinite loop, typically broken by an internal condition.
  //    var  judge  =  nowNum ;  //  'judge' variable assigned the value of 'nowNum'.
  //    if ( Number ( judge ) + Number ( selectNum ) - 1  <=  continuityNum ) {
  //        nowNum ++ ;  //  Increments 'nowNum'.
  //      	count ++ ;   //  Increments 'count'.
  //   	} else {
  //        console . log ( count ) ;  //  Logs the final count when the condition is no longer met.
  //      	break ;  //  Exits the 'while' loop.
  //    }
  //  }
  //  -------------------------------------------------------------------
}


//  This part of the script is responsible for reading input from the
//  standard input stream and then passing it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
//  The 'fs' module is used here to synchronously read the entire
//  contents of '/dev/stdin' as a UTF-8 encoded string.