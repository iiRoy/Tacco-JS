function  DataProcessor(  rawStream  ) {

    // Split the incoming stream of characters into distinct lines.
    rawStream = rawStream.split(  "\n"  );

    // Extract and convert the first three numerical components from the processed lines.
    const  baseOneValue  =  rawStream[0]  -  0;
    const  baseTwoValue  =  rawStream[1]  -  0;
    const  verticalDimension  =  rawStream[2]  -  0;

    // Display the calculated area of a shape, using the standard formula.
    console.log(  (baseOneValue  +  baseTwoValue)  *  verticalDimension  /  2  );

}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// The subsequent code segment manages standard input/output operations.
// It is crucial not to alter this part to ensure correct program execution.
DataProcessor(  require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  )  );