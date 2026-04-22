function main ( input )
{

    // Initialize the counter for the number of people who can be satisfied.
    var answer = 0 ;

    // Split the raw input string by newline characters to separate lines of data.
    var input1 = input.split ( '\n' ) ;


    // The first line contains two space-separated numbers: num_people and num_candy.
    // Extract the number of people from the first part of the first line.
    var num_people = input1 [ 0 ] .split ( ' ' ) [ 0 ] ;

    // Extract the total available candy from the second part of the first line.
    var num_candy = input1 [ 0 ] .split ( ' ' ) [ 1 ] ;


    // The second line contains space-separated individual candy demands.
    // Parse these demands into an array.
    var num_demands = input1 [ 1 ] .split ( ' ' ) ;


    /*
     * The core logic is to satisfy people with the smallest demands first.
     * This strategy maximizes the number of people who can receive candy.
     * We achieve this by sorting the demands and then accumulating them
     * until the total available candy is exhausted.
     */

    // Sort the 'num_demands' array in ascending numerical order.
    // The comparison function 'a - b' ensures a stable numeric sort.
    num_demands . sort ( function ( a , b )
    {
      // This anonymous function defines the sorting order.
      return a - b ;
    } ) ;


    // Initialize a variable to track the cumulative sum of candy demanded.
    var sum_candy = 0 ;


    // Iterate through the sorted demands.
    // The loop continues as long as we have people to consider and haven't exceeded candy supply.
    for ( var i = 0 ; i < num_people ; i ++ )
    {
        // 'answer' stores the count of people who *can* be satisfied.
        // It's updated with 'i' because 'i' represents the count of people processed so far.
        answer = i ;

        // Add the current person's demand to the running total of candy distributed.
        sum_candy += num_demands [ i ] ;

        // Check if the accumulated demand has now exceeded the total available candy.
        if ( sum_candy > num_candy )
        {
            // If demand exceeds supply, it means the current person (i) cannot be satisfied
            // along with the previous ones without exceeding the candy limit.
            // So, the 'answer' before including this person is the final count.
            console . log ( answer ) ;

            // Exit the loop as we've found our maximum.
            break ;
        }

    }

    // The line below is commented out, suggesting it was an alternative or debug statement.
    // answer +=1;

    // If the loop completes without breaking (i.e., all people can be satisfied),
    // or if it broke, the 'answer' variable holds the correct final count.
    console . log ( answer ) ;

}

// This line handles reading input from standard input in Node.js environments.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;