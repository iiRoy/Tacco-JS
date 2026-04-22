function main( input )
{
    /*
     * This is the main function that processes the input.
     * It calculates the maximum number of people who can receive candy
     * given their individual demands and the total available candy.
     */


    // Initialize the answer variable to 0.
    var answer = 0;


    // Parse the number of people from the first line of input.
    var num_people = input.split( '\n' )[ 0 ].split( ' ' )[ 0 ];


    // Parse the total amount of candy available from the first line of input.
    var num_candy = input.split( '\n' )[ 0 ].split( ' ' )[ 1 ];


    // Parse the individual candy demands from the second line of input.
    var num_demands = input.split( '\n' )[ 1 ].split( ' ' );


    /*
     * The strategy is to sort the demands in ascending order.
     * Then, iterate through the sorted demands, summing them up.
     * The loop continues as long as the total summed demand does not exceed
     * the available candy.
     */

    // Sort the array of candy demands in ascending numerical order.
    // The comparison function 'a - b' ensures a stable ascending sort.
    num_demands.sort( function( a, b )
    {
        return a - b;
    } );


    // Initialize a variable to keep track of the cumulative sum of candy demands.
    var sum_candy = 0;


    // Loop through each person, up to the total number of people.
    // The loop variable 'i' represents the index of the person in the sorted demands array.
    for ( var i = 0; i < num_people; i++ )
    {

        // The current value of 'i' represents the number of people served so far.
        // This will be the potential answer if the current person's demand can be met.
        answer = i;

        // Add the current person's demand to the running total of candy consumed.
        sum_candy += parseInt( num_demands[ i ] );


        // Check if the cumulative demand has exceeded the total available candy.
        // If it has, then the previous 'answer' (i.e., 'i') is the maximum number
        // of people that could be satisfied.
        if ( sum_candy > num_candy )
        {
            // Output the result and terminate the function.
            console.log( parseInt( answer ) );
            return;
        }

    }


    // If the loop completes without the sum_candy exceeding num_candy,
    // it means all people (num_people) can be satisfied.
    // In this case, the 'answer' should be num_people.
    // Since 'answer' was 'num_people - 1' at the end of the loop (due to 'answer = i'),
    // we need to increment it by 1 to get the correct total.
    answer += 1;


    // Output the final answer, which is the total number of people whose demands could be met.
    console.log( answer );

}


// The script reads the input from '/dev/stdin' using the 'fs' module
// and passes it to the main function to start the processing.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );