/*
 * This JavaScript module processes a string of numerical data
 * to determine a specific count of operations required to balance
 * the last two elements of a sorted array against the first.
 */
function ProcessNumericData(  inputStringData  ) {

  // Parse the input string:
  // 1. Split by newline, take the first line.
  // 2. Split by space to get individual string numbers.
  // 3. Convert each string number to an integer (base 10).
  // 4. Sort the resulting numbers in descending order.
  let  numericValuesArray  =  inputStringData
                                .split(  "\n"  )
                                [  0  ]
                                .split(  " "  )
                                .map(  (  currentElementStr  )  =>  parseInt(  currentElementStr,  10  )  )
                                .sort(  (  valA,  valB  )  =>  valB  -  valA  );

  // Initialize a counter for the total operations performed.
  let  operationTally  =  0;

  // Check the parity of the difference between the second and third elements.
  // This initial condition dictates the first approach to balancing the values.
  if  (  (  numericValuesArray[1]  -  numericValuesArray[2]  )  %  2  ===  0  )  {
    // Case where the difference between the second and third values is even.
    // Continue adjusting values until the first element is equal to both the second and third.
    while  (  numericValuesArray[0]  !==  numericValuesArray[1]  ||  numericValuesArray[0]  !==  numericValuesArray[2]  )  {
      // If the first element is strictly greater than the second,
      // increment both the second and third elements by one.
      if  (  numericValuesArray[0]  >  numericValuesArray[1]  )  {
        numericValuesArray[1]  =  numericValuesArray[1]  +  1;
        numericValuesArray[2]  =  numericValuesArray[2]  +  1;
        operationTally  =  operationTally  +  1; // Increment operation counter for this step.
      }  else  {
        // Otherwise (first element is less than or equal to the second),
        // increment only the third element by two.
        numericValuesArray[2]  =  numericValuesArray[2]  +  2;
        operationTally  =  operationTally  +  1; // Increment operation counter for this step.
      }
    }
  }  else  {
    // Case where the difference between the second and third values is odd.
    // Perform an initial adjustment to make the difference even,
    // by incrementing the first two elements.
    numericValuesArray[0]  =  numericValuesArray[0]  +  1;
    numericValuesArray[1]  =  numericValuesArray[1]  +  1;
    operationTally  =  operationTally  +  1; // Increment operation counter for this initial adjustment.

    // Now, with the difference between the second and third values likely even
    // (after the initial adjustment), proceed with the same adjustment logic as above.
    while  (  numericValuesArray[0]  !==  numericValuesArray[1]  ||  numericValuesArray[0]  !==  numericValuesArray[2]  )  {
      // If the first element is strictly greater than the second,
      // increment both the second and third elements by one.
      if  (  numericValuesArray[0]  >  numericValuesArray[1]  )  {
        numericValuesArray[1]  =  numericValuesArray[1]  +  1;
        numericValuesArray[2]  =  numericValuesArray[2]  +  1;
        operationTally  =  operationTally  +  1; // Increment operation counter.
      }  else  {
        // Otherwise, increment only the third element by two.
        numericValuesArray[2]  =  numericValuesArray[2]  +  2;
        operationTally  =  operationTally  +  1; // Increment operation counter.
      }
    }
  }

  // Output the final accumulated count of operations to the console.
  console.log(  operationTally  );
}

// Entry point for execution: Read data from standard input using Node.js 'fs' module
// and pass the UTF-8 encoded string content to the main processing function.
ProcessNumericData(  require(  "fs"  ).readFileSync(  "/dev/stdin",  "utf8"  )  );