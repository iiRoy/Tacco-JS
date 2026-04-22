// This central function processes incoming data to perform a calculation.
function ComputeExpression(  sourceData  )
{
    /*
     *  Extracts the first numerical value from the provided input array.
     *  The subtraction by zero trick efficiently converts the string element to a number.
     */
    var   operandX  =  sourceData[0]  -  0  ;

    //  Retrieves the second numerical value, ensuring it's treated as a number.
    var   operandY  =  sourceData[4]  -  0  ;

    //  Checks if the operation indicated in the input is addition.
    if  (  sourceData[2]  ===  '+'  )
    {
        console.log(  operandX  +  operandY  ) ; //  Prints the result of the summation.
    }

    //  Alternatively, verifies if the operation is subtraction.
    if  (  sourceData[2]  ===  '-'  )
    {
        console.log(  operandX  -  operandY  ) ; //  Prints the result of the subtraction.
    }
}

//  Initiates the data processing by reading from standard input.
//  Uses Node.js 'fs' module to synchronously fetch content from /dev/stdin.
ComputeExpression(  require(  "fs"  ) . readFileSync(  "/dev/stdin"  ,  "utf8"  )  ) ;