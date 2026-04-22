var  input   =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; /* Read input from standard input */

var   arr = input . trim() . split ( "\n" ) ; // Split input into an array of lines

var    n = arr.shift() - 0 ; /* Convert the first element to a number */

var   [a , d] = arr.shift() . split ( " " ) . map ( Number ) ; // Parse 'a' and 'd' values

  var   obj = { } ; // Initialize an empty object to store relationships

var   m = arr.shift() - 0 ; // Get the number of operations to perform

/* This loop processes 'm' operations */
for ( var i = 0 ; i < m ; i ++ )
{
       var   [x , y , z] = arr.shift() . split ( " " ) ; // Destructure operation parameters

       // Check the type of operation based on 'x'
       if ( x == "1" )
       {
          // Case 1: Neither y nor z are in obj
          if ( obj.hasOwnProperty ( y ) == false && obj.hasOwnProperty ( z ) == false )
          {
             obj [ y ] = z ;
             obj [ z ] = y ;
          }
          // Case 2: y is in obj, but z is not
          else if ( obj.hasOwnProperty ( y ) == true && obj.hasOwnProperty ( z ) == false )
          {
             obj [ z ] = obj [ y ] ;
             obj [ y ] = z ;
          }
          // Case 3: z is in obj, but y is not
          else if ( obj.hasOwnProperty ( y ) == false && obj.hasOwnProperty ( z ) == true )
          {
             obj [ y ] = obj [ z ] ;
             obj [ z ] = y ;
          }
          // Case 4: Both y and z are in obj (swap their mapped values)
          else
          {
             [ obj [ y ] , obj [ z ] ] = [ obj [ z ] , obj [ y ] ] ;
          }
       }
       else
       {
          // Operation type 2 (assignment)
          // Case 1: Neither y nor z are in obj
          if ( obj.hasOwnProperty ( y ) == false && obj.hasOwnProperty ( z ) == false )
          {
             obj [ y ] = z ;
          }
          // Case 2: y is in obj, but z is not
          else if ( obj.hasOwnProperty ( y ) == true && obj.hasOwnProperty ( z ) == false )
          {
             obj [ y ] = z ;
          }
          // Case 3: z is in obj, but y is not
          else if ( obj.hasOwnProperty ( y ) == false && obj.hasOwnProperty ( z ) == true )
          {
             obj [ y ] = obj [ z ] ;
          }
          // Case 4: Both y and z are in obj
          else
          {
             obj [ y ] = obj [ z ] ;
          }
       }
} // End of the main processing loop

var   k = arr.shift() ; // Get the final key for calculation

/* Check if 'k' has been remapped in 'obj' */
if ( obj.hasOwnProperty ( k ) )
{
   k = obj [ k ] ;
}

k = k - 0 ; // Convert 'k' to a numeric type

// Output the final calculated value
console . log ( a + ( ( k - 1 ) * d ) ) ; // Arithmetic progression calculation