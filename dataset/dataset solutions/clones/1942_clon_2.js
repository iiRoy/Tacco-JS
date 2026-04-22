const ProcessInputData =  (  incomingString  )   =>   {
  /*
   * This section parses the input string.
   * It splits the string by spaces and converts each segment into a numerical value.
   */
  const   numericValuesArray   =   incomingString
    .split( ' ' )
    .map(   (   anElement   )   =>   Number(   anElement   )   )  ;

  // Calculate the first upper bound using values from specific array positions.
  const firstCeilingValue = Math.ceil(
    numericValuesArray[2] / numericValuesArray[1]
  );
  // Calculate the second upper bound using different values from the array.
  const secondCeilingValue = Math.ceil(
    numericValuesArray[0] / numericValuesArray[3]
  );

  // Compute an initial residual value.
  const initialResidualValue = numericValuesArray[0] - numericValuesArray[3] * secondCeilingValue;
  // Compute a secondary residual value.
  const secondaryResidualValue = numericValuesArray[2] - numericValuesArray[1] * firstCeilingValue;

  // Output the comparison result of the two calculated ceiling values.
  console.log(
    firstCeilingValue === secondCeilingValue
      ? 'Yes'
      : 'No'
  );
};

// Execute the primary data processing routine by reading from standard input.
ProcessInputData(
  require('fs').readFileSync(
    '/dev/stdin',
    'utf8'
  )
);

// Some alternative input examples for testing, currently commented out:
// ProcessInputData(`10   9   10 10`); /* Test case 1 */
// ProcessInputData(`45   4   39 5`);  /* Test case 2 */