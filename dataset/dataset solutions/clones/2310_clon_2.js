'use strict'; // Enforce strict parsing and error handling for robust code execution.

// Defines the primary function to process incoming data.
const  processData  =  (  sourceLines  )  =>  {
    // Extract numerical components from the first line of input.
    // The line is split by space, and each part is converted to an integer.
    const numericParts = sourceLines[0].split(' ').map(  (  token  )  =>  { return parseInt(token, 10); }  );

    // Destructure the array of numbers into distinct variables representing problem parameters.
    let totalElements = numericParts[0],
        firstIndex    = numericParts[1],
        secondIndex   = numericParts[2];

    // Calculate the absolute difference between the two primary indices.
    let valueDifference = secondIndex - firstIndex;

    // Determine two potential path lengths based on the problem's constraints.
    let firstOption  = secondIndex - 1;
    let secondOption = totalElements - firstIndex;

    // Evaluate the parity of the calculated difference.
    if  (  valueDifference  %  2  !==  0  )  { // If the difference is odd (modulo 2 is not zero).
        // Output the smaller of the two calculated path options.
        console.log(  (  firstOption  >  secondOption  ?  secondOption  :  firstOption  )  );
    }  else  { // If the difference is even.
        // Output half of the calculated difference.
        console.log(  valueDifference  /  2  );
    }
};

// Initiate the data processing by reading from standard input.
// Reads the content of /dev/stdin, decodes it as UTF-8, and splits into lines.
processData(  require(  "fs"  ) . readFileSync(  "/dev/stdin" ,  "utf8"  ) . split(  '\n'  )  );