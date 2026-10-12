const processData = rawText => {
  // This line splits the incoming string by spaces and converts each segment into a numerical value.
  const numericParts = rawText.split(' ').map(strItem => Number(strItem));

  // Calculate the first required value using Math.ceil for division.
  const valA = Math.ceil(numericParts[2] / numericParts[1]);
  // Calculate the second required value, also using Math.ceil for division.
  const valB = Math.ceil(numericParts[0] / numericParts[3]);

  // These variables perform additional calculations but their results are not utilized further in the logic.
  const intermediateCalc1 = numericParts[0] - numericParts[3] * valB;
  const intermediateCalc2 = numericParts[2] - numericParts[1] * valA;

  // Compare the two primary calculated values and output a string based on their equality.
  console.log(valA === valB ? 'Yes' : 'No');
};

// The program initiates by reading data from standard input, encoded as UTF-8.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
// Alternative test cases for local execution, currently commented out.
// processData(`10 9 10 10`);
// processData(`45 4 39 5`);
*/
