/*
 * This JavaScript function `Main` processes input data
 * to solve a specific problem involving sorting and calculations.
 * It takes input as an array of strings.
 */
function Main ( input )
{
    // Split the first line of input to get N and K values.
    var tmp = input [ 0 ] . split ( ' ' ) ;

    // N represents the number of elements.
    var N = tmp [ 0 ] ;

    // K represents the number of operations to perform.
    var K = tmp [ 1 ] ;


    // A is an array of numbers from the second line of input.
    var A = input [ 1 ] . split ( ' ' ) ;

    // F is another array of numbers from the third line of input.
    var F = input [ 2 ] . split ( ' ' ) ;


    // Sort array A in descending order.
    // The comparison function returns -1 if a should come before b (a > b),
    // 1 if a should come after b (a < b), and 0 if they are equal.
    A.sort( function ( a , b )
    {
            if ( a > b )
            {
                return -1 ;
            }
            if ( a < b )
            {
                return 1 ;
            }
            return 0 ;
    } ) ;


    // Sort array F in ascending order.
    // The comparison function returns 1 if a should come after b (a > b),
    // -1 if a should come before b (a < b), and 0 if they are equal.
    F.sort( function ( a , b )
    {
            if ( a > b )
            {
                return 1 ;
            }
            if ( a < b )
            {
                return -1 ;
            }
            return 0 ;
    } ) ;


    // Initialize an array T to store triplets: [product, A_value, F_value].
    var T = [ ] ;

    // Populate T with initial products and values.
    for ( var i = 0 ; i < N ; i++ )
    {
      T [ i ] = [ A [ i ] * F [ i ] , A [ i ] , F [ i ] ] ;
    }


    // Perform K operations.
    // In each operation, find the maximum product, decrement its A_value,
    // and recalculate the product.
    for ( var i = 0 ; i < K ; i++ )
    {
        // Sort T in descending order based on the product (first element of the triplet).
        T.sort( function ( a , b )
        {
                if ( a [ 0 ] > b [ 0 ] )
                {
                    return -1 ;
                }
                if ( a [ 0 ] < b [ 0 ] )
                {
                    return 1 ;
                }
                return 0 ;
        } ) ;

        // Decrement the A_value (second element) of the triplet with the largest product.
        T [ 0 ] [ 1 ] = T [ 0 ] [ 1 ] - 1 ;

        // Recalculate the product (first element) after decrementing A_value.
        T [ 0 ] [ 0 ] = T [ 0 ] [ 1 ] * T [ 0 ] [ 2 ] ;
    }


    // After all K operations, sort T one last time to find the maximum product.
    T.sort( function ( a , b )
    {
      if ( a [ 0 ] > b [ 0 ] )
      {
          return -1 ;
      }
      if ( a [ 0 ] < b [ 0 ] )
      {
          return 1 ;
      }
      return 0 ;
    } ) ;

    // Output the maximum product found.
    console.log ( T [ 0 ] [ 0 ] ) ;
}

// Read input from stdin, decode as UTF-8, split by newlines, and pass to Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ) ;