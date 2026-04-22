/* This is the primary function for the stock trading simulation.
 * It takes a single string 'input' which contains all the necessary data. */
function   Main   (   input   )
{

	// The input string is split by newline characters to get individual lines of data.
	input   =   input . split   (   "\n"   )   ;

	// This 'tmp' variable holds the split second line, but it appears to be unused later.
	tmp   =   input[1] . split   (   " "   )   ;

	/*
	 * We use parseInt to convert the string representation of a number
	 * into its integer equivalent, specifying base 10 for clarity.
	 * The first line of input provides 'n', the number of days.
	 */
	var   n   =   parseInt   (   input[0]   ,   10   )   ;

	// The array 'a' stores the stock prices for each day, parsed from the second line of input.
	var   a   =   input[1] . split   (   " "   )   ;

	// Initialize the money with a starting capital.
	var   money   =   1000   ;

	// Initialize the number of shares (kabu) to zero.
	var   kabu   =   0   ;

	// Declare variables for current and next day's stock rates.
	var   rate   ;
	var   nextrate   ;

	// Loop through each day from the first day up to (but not including) 'n'.
	for   (   let   i   =   0   ;   i   <   n   ;   i++   )
	{
		// Parse the stock rate for the current day 'i'.
		rate   =   parseInt   (   a[i]   ,   10   )   ;

		// If this is the last day of the simulation...
		if   (   i   ===   n   -   1   )
		{
			// ...we set the next rate to 0. This effectively forces a sale of all stocks.
			nextrate   =   0   ;
		}
		else
		{
			// Otherwise, get the stock rate for the next day (i + 1).
			nextrate   =   parseInt   (   a[i   +   1]   ,   10   )   ;
		}


		// Decision logic: If the current rate is less than the next day's rate...
		if   (   rate   <   nextrate   )
		{
			// ...it's profitable to buy. Calculate how many shares can be bought.
			kabu   +=   Math.floor   (   money   /   rate   )   ;

			// Update the remaining money after purchasing shares.
			money   =   money   %   rate   ;
		}
		// If the current rate is not less than the next rate (i.e., it's equal or higher)...
		else
		{
			// ...it's better to sell any held shares.
			money   +=   kabu   *   rate   ;

			// After selling, the number of shares held becomes zero.
			kabu   =   0   ;
		}
	}

	// Output the final amount of money to the console.
	console . log   (   '%d'   ,   money   )   ;
}

/*
 * This section determines how the script is being executed.
 * It checks the filename to differentiate between a "production" run
 * (e.g., on an online judge platform) and a local development run.
 */
if   (   __filename . match   (   "Main.js$"   )   )
{
	// If the filename matches "Main.js", it's likely a production environment.
	// Read input from standard input (/dev/stdin).
	Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
}
else
{
	// For local testing or development, input is read from a local file.
	// The commented line below shows an alternative for hardcoded string input.
	//	Main("3\n4 5\nhello\n");
	Main   (   require   (   "fs"   ) . readFileSync   (   "q4.txt"   ,   "utf8"   )   )   ;
}