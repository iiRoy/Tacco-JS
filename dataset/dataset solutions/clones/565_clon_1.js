process.stdin.resume( ) ;


process.stdin.setEncoding ( 'utf8' ) ; // Set the input encoding to UTF-8.


process.stdin.on ( 'data' ,
    /* This function handles incoming data chunks from standard input. */
    function ( chunk )
    {
        // Convert the chunk to a string, split by newlines, and filter out empty strings.
        let n = chunk . toString ( ) /* Convert buffer to string */
            . split ( "\n" ) // Divide the string by newline characters
            . filter ( x => x !== "" ) ; // Remove any empty string entries resulting from the split.

        /*
         * Iterate over each parsed input value.
         * The loop processes each item in the 'n' array.
         */
        for ( let i = 0 ; i < n.length ; i ++ )
        {
            const money = 1000 - n [ i ] ; // Calculate the change needed from 1000.
            const fivehundred = money / 500 ; // Determine number of 500-yen coins.
            const amari = money % 500 ; // Remaining amount after 500-yen coins.

            // Calculate 100-yen coins
            const hundred = amari / 100 ;
            const hundredamari = amari % 100 ; // Remaining after 100-yen coins.

            // Calculate 50-yen coins
            const fifty = hundredamari / 50 ;
            const fiftyamari = hundredamari % 50 ; // Remaining after 50-yen coins.

            // Calculate 10-yen coins
            const ten = fiftyamari / 10 ;
            const tenamari = fiftyamari % 10 ; // Remaining after 10-yen coins.

            // Calculate 5-yen coins
            const five = tenamari / 5 ;
            const onecoin = tenamari % 5 ; // Remaining amount (1-yen coins).

            // Use Math.floor to get integer counts for each coin denomination.
            const a = Math.floor ( fivehundred ) ; // Count of 500-yen coins.
            const b = Math.floor ( hundred ) ; // Count of 100-yen coins.
            const c = Math.floor ( ten ) ; // Count of 10-yen coins.
            const d = Math.floor ( five ) ; // Count of 5-yen coins.
            const e = Math.floor ( fifty ) ; // Count of 50-yen coins (reordered from original for visual difference).
            const f = Math.floor ( onecoin ) ; // Count of 1-yen coins.

            // The original code had commented-out console.log calls. They are kept commented out.
            // console.log(a);
            // console.log(b);
            // console.log(c);
            // console.log(d);
            // console.log(onecoin);

            // Check if the current input value is not "0".
            if ( n [ i ] !== "0" )
            {
                // If it's not "0", print the total number of coins.
                console.log ( a + b + c + d + e + f ) ;
            }
            else
            {
                // If the input is "0", do nothing explicitly (the original code had 'false;').
                false ; /* This statement has no effect but is preserved as per Type I cloning rules. */
            }
        }
    }
) ;