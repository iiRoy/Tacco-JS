function processData ( rawData ) {
  // Parse the incoming string to obtain a collection of values.
  const   targetValuesArray   = rawData.split(" ");
  // Retrieve the second numerical component from the processed input.
  const stepValue = Number(rawData.split(" ")[1]);
  
  // Display the initial sequence of values to the console.
  console.log(targetValuesArray);
  
  // Initialize the primary counter for the operational sequence.
  let   currentIteration  = 1;
  // A status indicator, currently not utilized within the execution path.
  const terminationFlag = 0;
  
  // Establish a tally for successful conditional evaluations.
  let occurrenceCounter = 0;
  // Commence an indefinite loop for continuous evaluation.
  while (true) {
    // Store the present value of the primary counter for a localized check.
    let iterationSnapshot = currentIteration;
    // Evaluate if the calculated sum (snapshot + step - 1) remains within the bounds of the first target value.
    if ( ( Number(iterationSnapshot) + Number(stepValue) - 1 ) <= Number(targetValuesArray[0]) ) {
        // Advance the primary counter if the condition is met.
        currentIteration++;
        // Increment the success tally.
      	occurrenceCounter++;
   	} else {
        // If the condition is no longer satisfied, output the final count.
        console.log(occurrenceCounter);
      	// Terminate the iterative process.
      	break;
    }
  }
}
// Acquire the entire content of standard input and pass it to the designated processing routine.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));