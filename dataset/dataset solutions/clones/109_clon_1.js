/* This section handles standard input processing. */
var fs = require ( 'fs' ) ,
 length = fs . fstatSync ( process . stdin . fd ) . size ,
  buffer = new Buffer ( length ) ,
   bytesRead = fs . readSync ( process . stdin . fd , buffer , 0 , length , 0 ) ,
    input = buffer . toString ( 'utf8' , 0 , bytesRead ) . trim ( ) . split ( '\n' ) ; // Process input lines


main ( ) ;


function main ( ) { // Main execution function

  for ( var i = 0 , len = input . length ; i < len ; i ++ ) { // Loop through each input line

    var c = input [ i ] . split ( ' ' ) ;

    if ( + c [ 1 ] && + c [ 0 ] ) { // Check if both month and day are valid numbers

      var date = new Date ( 2004 , c [ 0 ] - 1 , + c [ 1 ] ) ; // Create a Date object for the year 2004

      console . log ( [ 'Sunday' , 'Monday' , 'Thuesday' , 'Wednesday' , 'Thursday' , 'Friday' , 'Saturday' ] [ date . getDay ( ) ] ) ; // Output the day of the week
    } // End of if condition
  } // End of for loop


} // End of main function