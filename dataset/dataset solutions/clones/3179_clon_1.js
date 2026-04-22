/*
 * This JavaScript code processes input data
 * to calculate optimal movement.
 * It's structured as a main function.
 */
function Main ( input )
{
    // The 'input' variable receives all the raw data.
    // Each line of input will be an element in an array after splitting by newline.
    input = input.split( "\n" ) ;

    // Parse the first line to get counts for shrines, temples, and queries.
    var start = input[0].split( " " ) ;

    // 'sc' represents the number of shrines.
    var sc = parseInt( start[0], 10 ) ;

    // 'tc' represents the number of temples.
    var tc = parseInt( start[1], 10 ) ;

    // 'qc' represents the number of queries to process.
    var qc = parseInt( start[2], 10 ) ;


    // Initialize an array to store shrine locations.
    var sa = [ ] ;
    // Populate the 'sa' array with shrine data from input.
    for ( var i = 1 ; i <= sc ; i ++ )
    {
        sa.push( input[i] ) ;
    }


    // Initialize an array to store temple locations.
    var ta = [ ] ;
    // Populate the 'ta' array with temple data from input.
    // Note: temple data follows shrine data in the input.
    for ( var i = 1 ; i <= tc ; i ++ )
    {
        ta.push( input[ i + sc ] ) ;
    }


    // Iterate through each query to find the minimum movement.
    for ( var i = 1 ; i <= qc ; i ++ )
    {
        // Get the current query location.
        var ql = input[ i + sc + tc ] ;

        // Initialize 'movement' to null, indicating no movement calculated yet.
        var movement = null ;

        // Nested loops to consider all possible shrine and temple combinations.
        for ( var s = 0 ; s < sa.length ; s ++ )
        {
            for ( var t = s ; t < ta.length ; t ++ )
            {
                // Current shrine location from the 'sa' array.
                var sl = sa[s] ;

                // Current temple location from the 'ta' array.
                var tl = ta[t] ;

                // Calculate the total movement for this shrine-temple pair.
                // This involves moving between the shrine and temple,
                // and then from the query location to either the shrine or temple.
                var ans = Math.abs( sl - tl ) + Math.min( Math.abs( ql - sl ), Math.abs( ql - tl ) ) ;

                // Update 'movement' if this 'ans' is smaller or if 'movement' is still null.
                movement = ( movement == null || movement > ans ) ? ans : movement ;
            }
        }
        // Output the minimum movement found for the current query.
        console.log( "%d", movement ) ;
    }
}

// Do not modify the code below this line. It handles standard input/output.
Main ( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;