/*
 * This JavaScript file processes input data to solve a specific problem.
 * It reads from standard input, parses numbers and time values,
 * and performs calculations related to overlapping intervals or "trains".
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */


//  Import the 'fs' module to interact with the file system,
//  specifically for reading input from /dev/stdin.
 var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

//  Split the entire input string by newline characters
//  to get an array where each element is a line of input.
 var   lines   =   input . split ( '\n' ) ;


//  Initialize a variable 'line' to null.
//  This variable will hold the current line being processed from the 'lines' array.
 var   line   =   null ;

/*
 *  The main processing loop.
 *  It continues as long as there are lines to process and the current line
 *  (after being shifted from the 'lines' array) is not falsy.
 *  The 'lines.shift()' method removes the first element from the 'lines' array
 *  and returns it, effectively processing lines one by one.
 */
while    (    line    =    lines . shift ( )    )
{
    //  Parse the current line as an integer. This 'num' often represents
    //  the count of subsequent data entries for the current test case.
    var   num   =   parseInt ( line ) ;

    //  If the parsed number is 0, it signals the end of input for all test cases.
    //  Therefore, the loop should terminate.
    if    (    num    ==    0    )
    {
        break ; // Exit the while loop
    }

    //  Initialize an empty array 'arr'.
    //  This array will store parsed time intervals for the current test case.
    var   arr   =   [ ] ;

    //  Loop 'num' times to read the interval data for the current test case.
    for   (   var   i   =   0 ;   i   <   num ;   i ++   )
    {
        //  Get the next line, which should contain time arguments.
        line   =   lines . shift ( ) ;

        //  Split the line by spaces, then map each time string to a Date object's timestamp.
        //  The '+(new Date(...))' converts the Date object to its numeric timestamp (milliseconds since epoch).
        var   args   =   line . split ( ' ' ) . map (   function ( t )
        {
            //  Create a Date object with a fixed base date and the time part 't'.
            //  The unary plus operator converts the Date object to its primitive value (timestamp).
            return   + ( new   Date ( '2000-01-01   '   +   t ) ) ;
        }   ) ;

        //  Add the processed arguments (timestamps) as an array to the 'arr' collection.
        arr . push ( args ) ;
    }

    //  Initialize 'mainTrain' to 1. This variable will keep track of the
    //  maximum number of non-overlapping intervals (trains) found.
    var   mainTrain   =   1 ;

    //  Outer loop: Iterate through each interval in the 'arr' array.
    for   (   var   i   =   0 ;   i   <   arr . length ;   i ++   )
    {
        //  Get the current interval being considered.
        var   val   =   arr [ i ] ;

        //  Initialize 'train' for the current iteration of the outer loop.
        //  It represents the number of intervals in the current non-overlapping set,
        //  starting with the 'val' interval itself.
        var   train   =   1 ;

        //  Initialize an array to store indices of intervals that need to be "deleted" (marked as null)
        //  because they overlap with the current 'val' interval.
        var   delNum   =   [ ] ;

        //  Inner loop: Compare 'val' with all subsequent intervals in 'arr'.
        for   (   var   j   =   i   +   1 ;   j   <   arr . length ;   j ++   )
        {
            //  Get the subsequent interval for comparison.
            var   sub   =   arr [ j ] ;

            //  Check for overlap conditions. If intervals 'val' and 'sub' do NOT overlap,
            //  then one must end before the other begins, or vice versa.
            //  val = [start1, end1], sub = [start2, end2]
            //  They do NOT overlap if: end1 <= start2 OR end2 <= start1
            //  The condition `val[1] <= sub[0] || sub[0] <= val[0]` checks for non-overlap.
            //  Note: The original condition `sub[0] <= val[0]` checks if sub starts before or at the same time as val starts.
            //  This implies that if sub starts before or at the same time as val starts, it's NOT considered an overlap in this specific logic,
            //  OR if val ends before sub starts, it's NOT an overlap.
            //  The `else` branch is executed when they DO overlap.
            if    (    val [ 1 ]    <=    sub [ 0 ]    ||    sub [ 0 ]    <=    val [ 0 ]    )
            {
                //  No overlap based on the specified condition. Do nothing.
            }
            else
            {
                //  Overlap detected. Mark this 'sub' interval for deletion
                //  and increment the 'train' count.
                delNum . push ( j ) ;
                train ++ ;
            }
        }

        //  After checking all subsequent intervals against 'val',
        //  mark the overlapping ones as null in the 'arr' array.
        delNum . forEach (   function ( k )
        {
            arr [ k ]   =   null ;
        }   ) ;

        //  Filter out all the 'null' entries from 'arr', effectively "deleting" them.
        //  This modifies 'arr' in place for the next iteration of the outer loop.
        arr   =   arr . filter (   function ( p )
        {
            return   p   !=   null ;
        }   ) ;

        //  Update 'mainTrain' if the current 'train' count is greater.
        //  This finds the maximum number of non-overlapping intervals.
        mainTrain   =   Math . max ( mainTrain , train ) ;
    }

    //  After processing all intervals for the current test case,
    //  print the maximum number of non-overlapping intervals found.
    console . log ( mainTrain ) ;
}