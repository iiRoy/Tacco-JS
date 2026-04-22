function Main  ( input ) {

  // This function calculates the minimum cost to buy a certain number of A and B items.
  // It considers three pricing strategies: buying A and B separately, buying a mix of A/B and AB sets,
  // and buying only AB sets.

  // First, parse the input string into an array of numbers.
  let input = input . split ( " " ) ;

  // Declare and initialize variables for item prices and quantities.
  // 'a' is the price of an A item.
  let a = Number . parseInt ( input [ 0 ] , 10 ) ;
  // 'b' is the price of a B item.
  let b = Number . parseInt ( input [ 1 ] , 10 ) ;
  // 'c' is the price of an AB set (which contains one A and one B item).
  let c = Number . parseInt ( input [ 2 ] , 10 ) ;
  // 'x' is the required quantity of A items.
  let x = Number . parseInt ( input [ 3 ] , 10 ) ;
  // 'y' is the required quantity of B items.
  let y = Number . parseInt ( input [ 4 ] , 10 ) ;


  // Determine the minimum and maximum of the required quantities.
  // This helps in calculating costs for combined sets.
  let min = Math . min ( x , y ) ;
  let max = Math . max ( x , y ) ;


  // Initialize an array to store different calculated prices.
  let priceList = [ ] ;


  // --- Strategy 1: Calculate cost if buying 'min' pairs of A and B separately. ---
  // This represents buying 'min' A items and 'min' B items individually.
  let singlePrice = min * a + min * b ;
  priceList . push ( singlePrice ) ;


  // --- Strategy 2: Calculate cost using a mix of AB sets and individual items. ---
  // Buy 'min' AB sets, then buy the remaining (x-min) A items and (y-min) B items individually.
  // Note: 'c * 2' is used because an AB set provides one A and one B, so 'min' sets cover 'min' A and 'min' B.
  setPrice1 = min * c * 2 + ( x - min ) * a + ( y - min ) * b ;
  priceList . push ( setPrice1 ) ;


  // --- Strategy 3: Calculate cost if buying only AB sets to cover all needs. ---
  // Buy 'max' AB sets. This ensures both x and y quantities are met, as 'max' is the larger of x and y.
  setPrice2 = max * c * 2 ;
  priceList . push ( setPrice2 ) ;


  // Find the minimum price among all calculated strategies.
  let bestPrice = Math . min . apply ( null , priceList ) ;


  // Output the best (minimum) price found.
  console . log ( bestPrice ) ;

}
// Example test cases for the Main function.
// These are illustrative calls to demonstrate functionality.
Main ( "1500 2000 1600 3 2" ) ;
Main ( "1500 2000 1900 3 2" ) ;
Main ( "1500 2000 500 90000 100000" ) ;