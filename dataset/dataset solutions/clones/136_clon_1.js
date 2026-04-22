/*
 * This file processes input data from a text file, performing calculations
 * and conditional logic based on parsed numerical values.
 * It demonstrates reading file contents, string manipulation, and loop structures.
 */


//  Load the file system module.
var  arr  =  require ( "fs" )
    . readFileSync ( "./test.txt" ,  "utf8" )  //  Read the entire file synchronously, decoding as UTF-8.
    . trim ( )                                 //  Remove any leading or trailing whitespace from the file content.
    . split ( /\n/ ) ;                         //  Split the content into an array of strings, using newline as a delimiter.


//  Determine the total number of cases to process.
//  This assumes each line in the file represents a distinct test case.
var  caseCount  =  arr . length ;


//  Begin iterating through each test case, starting from the second line (index 1).
//  The first line (index 0) is often a header or not relevant for the main processing logic.
for  (  let  i  =  1 ;  i  <  caseCount ;  i ++  )
{
    //  For the current line (case), trim whitespace and split it into an array of 'ball' strings.
    //  Splitting by /\s/ handles one or more whitespace characters as delimiters.
    let  balls  =  arr [ i ] . trim ( ) . split ( /\s/ ) ;


    //  Initialize a mysterious 'course' array with two zero values.
    //  The name 'course???' suggests a potential placeholder or unknown meaning in the original code.
    let  course??? = [ 0 , 0 ] ;


    //  Iterate through each 'ball' string within the current case.
    for  (  var  j  =  0 ;  j  <  balls . length ;  j ++  )
    {
        //  Convert the current 'ball' string to an integer, specifying base 10.
        let  ballNum  =  parseInt ( balls [ j ] ,  10 ) ;


        //  Calculate two 'difference' values based on the current ball number and the 'course' array elements.
        let  courseDeff  =  [ ballNum  -  course??? [ 0 ] ,  ballNum  -  course??? [ 1 ] ] ;


        //  Check a critical condition: if both calculated differences are negative.
        if  (  ( courseDeff [ 0 ]  <  0 )  &&  ( courseDeff [ 1 ]  <  0 )  )
        {
            //  If both are negative, print "NO" to the console.
            console . log ( "NO" ) ;
            //  Immediately exit the inner loop for this case, as it's deemed a failure.
            break ;
        }


        //  Evaluate another condition to decide which 'course' value to update.
        //  The update happens if the first difference is less than or equal to the second,
        //  AND the first difference is strictly positive.
        if  (  ( courseDeff [ 0 ]  <=  courseDeff [ 1 ] )  &&  courseDeff [ 0 ]  >  0  )
        {
            //  Update the first element of the 'course' array with the current ball number.
            course??? [ 0 ]  =  ballNum ;
        }
        else
        {
            //  Otherwise (if the above condition is false), update the second element.
            course??? [ 1 ]  =  ballNum ;
        }


        //  A specific check for the inner loop's iteration count.
        //  If the loop variable 'j' reaches the value 9.
        if  (  j  ==  9  )
        {
            //  Print "YES" to the console. This likely indicates a successful completion
            //  of a certain number of inner loop iterations without hitting the 'break' condition.
            console . log ( "YES" ) ;
        }
    }
}