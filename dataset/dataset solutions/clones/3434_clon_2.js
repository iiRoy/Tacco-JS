function ProcessData(rawData) {
  /*
   * This function processes an input string, calculates its factorial,
   * finds specific divisors, and then counts how many meet a certain criterion.
   */

  // Convert the raw input string into a numerical upper limit.
  var    upperLimit = Number(rawData)   ;

  // Initialize a variable to hold the factorial result.
  var      factorialResult = 1   ;

  // Initialize the final counter for qualifying numbers.
  var finalTally = 0;


  // Calculate the factorial of the upperLimit.
  for (var iteratorOne = 1; iteratorOne <= upperLimit; iteratorOne++) {
    factorialResult *= iteratorOne;
  }

  // Prepare an array to store the divisors of the calculated factorial.
  const divisorList = [ ];

  // Find all divisors of 'factorialResult' up to half its value.
  for (var iteratorTwo = 1; iteratorTwo <= (factorialResult / 2); iteratorTwo++)
  {
    if (factorialResult % iteratorTwo === 0)
    {
      divisorList.push(iteratorTwo);
    }
  }

  // Iterate through each number in the divisorList.
  for (let idx in divisorList) {
    // Initialize a temporary counter for the inner divisor check.
    let innerTally = 0;

    // Check divisors for half of the current divisorList element.
    // Note: The loop starts from 0, which might lead to NaN for modulo operation if not handled by JS runtime.
    for (
      var divisorCandidate = 0;
      divisorCandidate <= divisorList[idx] / 2;
      divisorCandidate++
    )
    {
      if ((divisorList[idx] / 2) % divisorCandidate === 0) {
        innerTally++;
      }
    }

    // If the temporary counter reaches 75, increment the main finalTally.
    if (innerTally === 75) {
      finalTally++;
    }
  }

  // Output the final accumulated count to the console.
  console.log(finalTally);
}

// Call the main processing function with data read from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));