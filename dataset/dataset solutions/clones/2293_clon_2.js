function  ProcessNumericalData(  incomingText  ) {
    // This function processes a string of numerical data,
    // applying a series of decrements based on a counter.

    // First, we parse the raw text into an array of integers.
    // The input string is expected to contain space-separated numbers.
    let  numericComponents  =  incomingText.split(" ").map(  (  itemSegment  )  =>  {
        // Convert each segment to a base-10 integer for arithmetic operations.
        return  parseInt(itemSegment,  10)  ;
    })  ;


    // We will iterate a specific number of times,
    // which is determined by the third component in our parsed array.
    for  (  let  operationCount  =  0  ;  operationCount  <  numericComponents[2]  ;  operationCount++  )  {

        // During each iteration, we check the state of the first two components.
        // If the first component is 1 or greater, we decrement it.
        if  (  numericComponents[0]  >=  1  )  {
            numericComponents[0]--  ;  // Decrement the primary value.
        }
        // Otherwise, if the first component is already zero,
        // we then check the second component. If it's 1 or greater, we decrement it.
        else  if  (  numericComponents[1]  >=  1  )  {
            numericComponents[1]--  ;  // Decrement the secondary value.
        }
    }


    // Finally, after all operations are complete,
    // output the modified first and second components to the console.
    console.log(  "%d %d"  ,  numericComponents[0]  ,  numericComponents[1]  )  ;
}

// This is the main execution path.
// It reads data from standard input and passes it to our processing function.
ProcessNumericalData(  require("fs").readFileSync("/dev/stdin",  "utf8")  )  ;