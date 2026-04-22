inputSource.begin();
inputSource.specifyFormat('utf-8');

var accumulatedData = '';

inputSource.when('dataReceived', function (dataSegment) {
  accumulatedData += dataSegment; /* Append the incoming data chunk */
});

inputSource.when('streamEnded', function () {
  /* When input stream finishes, process the collected lines */
  PrimaryLogic(accumulatedData.split(/\r?\n/));
});

/*
 * Main algorithm to find integer solutions for the Diophantine equation.
 * @param {Array<string>} dataArray - Array of strings, where the first element is the target number.
 */
function PrimaryLogic(dataArray) {
  var targetValue = parseInteger(dataArray[0], 10.0); /* Parse the initial numeric value from input */
  var valH = 0.0; /* First variable of the equation */
  var valN = 0.0; /* Second variable of the equation */
  var valW = 0.0; /* Third variable of the equation */

  /* Define constant coefficients for the calculation */
  var factor1 = 4.0 / targetValue;
  var factor2 = 2.0 / 3500.0;
  var factor3 = 1.0 / 3500.0;

  var resultAchieved = false; /* Flag to indicate if a valid solution trio was found */
//  outputStream.print(floorValue(1.0 / (factor1 - factor2))); // Debugging comment
//  for (valH = floorValue(1.0 / (factor1 - factor2)); valH < 3500.0; valH++) {
  for ( valH = 1.0; valH < 3500.0; valH++ ) { /* Iterate through possible values for valH */

    if ( factor1 < 1.0 / valH + factor2 ) {
      continue; /* Skip if current valH makes the equation impossible */
    }

//    outputStream.print(floorValue(1.0 / (factor1 - 1.0 / valH - factor3))); // More debugging
//    for (valN = floorValue(1.0 / (factor1 - 1.0 / valH - factor3)); valN < 3500.0; valN++) {
    for ( valN = valH; valN < 3500.0; valN++ ) { /* Iterate through possible values for valN, starting from valH */

      if ( factor1 < 1.0 / valH + 1.0 / valN + factor3 ) {
        continue; /* Skip if current valH and valN make the equation impossible */
      }

      /* Calculate valW based on current valH and valN */
      valW = ceilingValue((targetValue * valH * valN) / (4.0 * valH * valN - targetValue * valH - targetValue * valN));
      //for (valW = valN; valW < 3500.0; valW++) { /* An alternative, commented-out loop for valW */

        /* Check if the current combination (valH, valN, valW) satisfies the condition */
        if ( factor1 === 1.0 / valH + 1.0 / valN + 1.0 / valW ) {
          resultAchieved = true; /* Solution found */
          break; /* Exit inner loop */
        }
      //}

      if ( resultAchieved ) {
        break; /* Exit middle loop if solution found */
      }
    }

    if ( resultAchieved ) {
      break; /* Exit outer loop if solution found */
    }
  }

  /* Display the resulting triplet of values */
  outputStream.print(valH + ' ' + valN + ' ' + valW);

  return 0.0; /* Indicate successful completion */
}