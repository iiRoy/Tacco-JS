function  myin (  ) { return  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ; }


/*
 * Helper function for various input conversions.
 * Case 0: No conversion, returns input as is.
 * Case 1: Converts to integer using parseInt.
 * Case 2: Splits by space.
 * Case 3: Splits by newline.
 * Case 4: Splits by space and converts to number array.
 * Case 5: Splits by newline and converts to number array.
 * Case 6: Splits into individual characters.
 * Case 7: Splits into individual characters and converts to number array.
 */
function   myconv ( i ,   no ) {
  switch ( no ) {
    case   0 :
      return   i ;

    case   1 :
      return   parseInt ( i ) ;

    case   2 :
      return   i . split ( " " ) ;

    case   3 :
      return   i . split ( "\n" ) ;

    case   4 :
      return   i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;

    case   5 :
      return   i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;

    case   6 :
      return   i . split ( "" ) ;

    case   7 :
      return   i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
  }
}


function   Main ( input ) {

  // Initial input processing: split by newline
  input   =   myconv ( input ,   3 ) ;


  // Extracting A, B, M from the first line of input
  const   A   =   myconv ( input [ 0 ] ,   4 ) [ 0 ] ;
  const   B   =   myconv ( input [ 0 ] ,   4 ) [ 1 ] ;
  const   M   =   myconv ( input [ 0 ] ,   4 ) [ 2 ] ;


  // Extracting 'a' and 'b' arrays from subsequent lines
  const   a   =   myconv ( input [ 1 ] ,   4 ) ;
  const   b   =   myconv ( input [ 2 ] ,   4 ) ;


  // Remove the first three processed lines from the input array
  input . shift ( ) ;
  input . shift ( ) ;
  input . shift ( ) ;


  // Initialize an array to store calculated prices
  let   price   =   [ ] ;


  // Calculate all possible base prices without discounts
  for ( let   i   =   0 ;   i   <   A ;   i ++ ) {
    for ( let   j   =   0 ;   j   <   B ;   j ++ ) {
      let   p   =   a [ i ]   +   b [ j ] ;
      price . push ( p ) ;
    }
  }


  // Process discount coupons
  // 'len' stores the number of remaining lines, each representing a coupon
  len   =   input . length ;

  for ( let   i   =   0 ;   i   <   len ;   i ++ ) {
    // Parse coupon details: x (item from 'a'), y (item from 'b'), c (discount amount)
    let   x   =   myconv ( input [ i ] ,   4 ) [ 0 ] ;
    let   y   =   myconv ( input [ i ] ,   4 ) [ 1 ] ;
    let   c   =   myconv ( input [ i ] ,   4 ) [ 2 ] ;

    // Calculate the index 'k' corresponding to the original price of the discounted item combination
    let   k   =   ( x - 1 ) * B   +   y   -   1 ;

    // Retrieve the original price before discount
    const   origin_p   =   price [ k ] ;

    // Apply the discount and add the new discounted price to the 'price' array
    price . push ( price [ k ]   -   c ) ;
  }


  // Output the minimum price found among all calculated prices (original and discounted)
  console . log ( Math . min . apply ( null ,   price ) ) ;
}


Main ( myin ( ) ) ;