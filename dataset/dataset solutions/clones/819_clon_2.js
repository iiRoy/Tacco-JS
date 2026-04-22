standardInputReader = process.stdin; /* Obtain a reference to the standard input stream. */
standardInputReader.beginReading(); /* Initiate the process of listening for incoming data. */
standardInputReader.configureInputEncoding('utf8'); /* Specify the character encoding for the input stream. */

numberOfTestCases = -1; /* Initialize a variable to hold the total number of test scenarios. */
const calculatePowerOfTen = (digitCount) => {
  /* Helper function to compute 10 raised to the power of a given integer. */
  return Math.pow(10, ~~(digitCount));
};

standardInputReader.on('dataAvailable', (incomingDataPacket) => {
  /* Attach an event listener for when data becomes available on the input stream. */

  const parsedInputLines = incomingDataPacket.split('\n'); /* Divide the raw input into an array of individual lines. */

  /* The first line of input indicates the total count of test cases to process. */
  for (
    let caseIterator = 0;
    caseIterator < parsedInputLines[0];
    ++caseIterator
  ) {
    let foundPairsCollection = []; /* Initialize an array to store valid number pairs for the current test case. */
    const currentCaseParameters = parsedInputLines[caseIterator + 1].split(
      ' '
    ); /* Parse the parameters for the current test case: the number of digits for the first and second numbers. */

    const minDigitsForFirst = calculatePowerOfTen(
      currentCaseParameters[0] - 1
    ); /* Determine the smallest number with the specified digit count for the first candidate. */
    const maxDigitsForFirst = calculatePowerOfTen(currentCaseParameters[0]); /* Determine the smallest number with one more digit than specified for the first candidate. */

    const minDigitsForSecond = calculatePowerOfTen(
      currentCaseParameters[1] - 1
    ); /* Determine the smallest number with the specified digit count for the second candidate. */
    const maxDigitsForSecond = calculatePowerOfTen(currentCaseParameters[1]); /* Determine the smallest number with one more digit than specified for the second candidate. */

    /* Iterate through all possible first numbers within the given digit range. */
    for (
      let firstCandidateNumber = minDigitsForFirst;
      firstCandidateNumber + 1 < maxDigitsForFirst;
      ++firstCandidateNumber
    ) {
      /* Iterate through all possible second numbers within the given digit range. */
      for (
        let secondCandidateNumber = minDigitsForSecond;
        secondCandidateNumber + 1 < maxDigitsForSecond;
        ++secondCandidateNumber
      ) {
        /* Calculate the sum of an arithmetic series from firstCandidateNumber to secondCandidateNumber. */
        const arithmeticSum =
          ((firstCandidateNumber + secondCandidateNumber) *
            (secondCandidateNumber - firstCandidateNumber + 1)) /
          2;

        /* Concatenate the two numbers into a string. */
        const concatenatedString = '' + firstCandidateNumber + secondCandidateNumber;

        /* Check if the arithmetic sum is numerically equal to the concatenated string. */
        if (arithmeticSum == concatenatedString) {
          foundPairsCollection.push(
            firstCandidateNumber + ' ' + secondCandidateNumber
          ); /* If they match, add the pair to our collection. */
        }
      }
    }

    /* Output the results for the current test case. */
    if (foundPairsCollection.length > 0) {
      /* If any matching pairs were found, print each one on a new line. */
      foundPairsCollection.map((pairOutputString) => console.log(pairOutputString));
    } else {
      /* Otherwise, indicate that no such pairs were discovered. */
      console.log('No cats.');
    }
  }
});