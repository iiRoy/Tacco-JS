'use strict'; // Enforce strict mode for cleaner code practices

function  processInputData  (  sourceData  )   {
  // First, parse the incoming raw data string into structured lines and segments.
  // Each line is split by newline, and then each resulting line is split by space.
  const  parsedLines  =  sourceData.split( '\n' ).map(  (  lineFragment  )  =>  lineFragment.split(  ' '  )  );

  // Extract the total number of elements from the first segment of the first line.
  const  totalItems  =  parsedLines[0][0];
  // Retrieve the array of stringified numeric values from the second line.
  const  elementArray  =  parsedLines[1];

  // Initialize the output string with the very first element of the array.
  let  finalOutput  =  elementArray.slice(0,  1).toString();

  // Iterate through the array, starting from the second element.
  for  (  let  elementIndex  =  1;  elementIndex  <  totalItems;  elementIndex++  )   {
    // Determine the placement of the current element based on parity checks.
    // If both the current index and the total count have the same parity (both even or both odd).
    if  (  elementIndex  %  2  ==  totalItems  %  2  )   {
      // Append the current element to the end of the accumulating result.
      finalOutput  =  finalOutput  +  ' '  +  elementArray[elementIndex];
    }  else   {
      // Prepend the current element to the beginning of the accumulating result.
      finalOutput  =  elementArray[elementIndex]  +  ' '  +  finalOutput;
    }
  }

  // Display the final constructed string to the standard output.
  console.log(  finalOutput  );
}

// Invoke the primary data processing function.
// It reads the entire content of standard input as a UTF-8 string.
processInputData(  require(  'fs'  ).readFileSync(  '/dev/stdin',  'utf8'  )  );