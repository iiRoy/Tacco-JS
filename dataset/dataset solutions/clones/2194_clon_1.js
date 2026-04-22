/* This function processes the entire input data provided. */
function      Main    ( input )
{


  /* The input array is structured such that input[0] is the first line, input[1] is the second, and so on. */
  input  =  input . split ( "\n" ) ;

  tmp   =   input [ 1 ] ;


  tmp1  =  input [ 0 ] . split ( " " ) ;

  var   n   =   parseInt ( tmp1 [ 0 ] , 10 ) ;   // Parse the first number from the first line of input.

  var   k   =   parseInt ( tmp1 [ 1 ] , 10 ) ;   // Parse the second number from the first line of input.


  /* Initialization for the output variable, which will store the calculated sum. */
  count  =  0 ;



  if  ( n  <=  k )
  {
              console . log ( "0" ) ;   // Output zero if 'n' is less than or equal to 'k', as per problem logic.
  }
  else  if  ( k  ==  0 )
  {
              m  =  tmp . split ( " " ) ;   // Split the second line of input into an array of strings.


              for ( j = 0 ; j < m . length ; i ++ )
              {
                          // This loop accumulates values. Note: The original code has a potential bug here (i++ instead of j++).
                          count += m [ i ] ;
              }

  }
  else
  {
              m  =  tmp . split ( " " ) ;   // Split the temporary string (second line of input) into an array of strings.

              m . sort ( function ( a , b )
              {
                          return ( a < b ? 1 : -1 ) ;   // Custom comparison logic for sorting in descending order.
              } ) ;


              for ( k ; k < n ; k ++ )
              {
                          // Convert the current array element to an integer and add it to the running total.
                          count += parseInt ( m [ k ] , 10 ) ;
              }


              console . log ( '%d' , count ) ;   // Print the final calculated count to standard output, formatted as a decimal integer.
  }


}
// DO NOT MODIFY THE FOLLOWING LINE: This part handles standard input/output operations and invokes the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;