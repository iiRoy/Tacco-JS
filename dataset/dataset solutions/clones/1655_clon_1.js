// This initial comment describes the purpose of the 'input' parameter.
// The 'input' variable will receive the entire input data as a string.
function   Main  (  input  )   {

  // First, we process the raw input string.
  // It is split into an array of strings, where each element represents a line from the input.
  input   =   input .  split (  "\n"  ) ;
  
  // The first line of the input contains the integer N.
  // We parse it using parseInt, specifying base 10 for clarity.
  let   N   =   parseInt (  input [ 0 ] ,   10  ) ;

  // The second line of the input contains space-separated values.
  // We split this line by spaces to get an array of strings representing daily prices.
  let   line   =   input [ 1 ] .  split (  " "  ) ;

  // Initialize 'pre' (previous day's price) and 'cur' (current day's price) to zero.
  let   pre   =   0 ;
  let   cur   =   0 ;

  // Initialize 'stock' (number of shares held) to zero.
  // Initialize 'money' (current cash balance) to the starting amount of 1000.
  let   stock   =   0 ;
  let   money   =   1000 ;

  // Begin a loop to simulate trading over N-1 days.
  // The loop starts from i = 1 because we need to compare current day (i) with previous day (i-1).
  for   (  let   i   =   1 ;   i   <   N ;   i ++   )   {
      // Parse the price from the previous day.
      pre   =   parseInt (  line [ i - 1 ] ,   10  ) ;
      // Parse the price from the current day.
      cur   =   parseInt (  line [ i ] ,   10  ) ;

      // Check if the price has increased from the previous day to the current day.
      // This is the condition to consider buying stock.
      if   (  pre   <   cur  )   {
          // If the price increased, calculate how many shares can be bought with current money.
          // Math.trunc ensures that only whole shares are bought.
          stock   =   Math .  trunc (  money   /   pre  ) ;
      }

      // Regardless of whether stock was bought, simulate selling any held stock at the current price.
      // The profit/loss from this transaction is added to the money.
      // If stock was bought, it's sold for a profit (cur - pre > 0).
      // If no stock was bought (stock remains 0), this operation adds 0 to money.
      money   +=   (  cur   -   pre  )   *   stock ;
  }
  
  // This section is for printing the final result.
  //出力
  // The console.log function is used to display the final calculated money.
  // '%d' is a format specifier, indicating an integer output.
  console .  log (  '%d' ,   money  ) ;
}


// This is the entry point for the program execution.
// It reads the entire content of standard input synchronously.
// The "fs" module is used for file system operations.
// "/dev/stdin" is the standard input file path on Unix-like systems.
// "utf8" specifies the encoding of the input.
// The read content is then passed as the 'input' argument to the Main function.
Main (  require (  "fs"  ) .  readFileSync (  "/dev/stdin" ,   "utf8"  )  ) ;