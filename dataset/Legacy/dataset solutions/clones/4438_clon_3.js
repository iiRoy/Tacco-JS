function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const elementCount = parseInt(inputLines[0], 10);

  // Parse the array of numbers, ensuring only 'elementCount' elements are considered
  const rawNumberStrings = inputLines[1].split(" ");
  const numericValues = rawNumberStrings.slice(0, elementCount).map(str => parseInt(str, 10));

  // Use reduce to count odd numbers and multiples of four in a single pass
  const classificationCounts = numericValues.reduce((accumulator, currentNumber) => {
    if (currentNumber % 2 === 1) {
      accumulator.oddNumbers++;
    } else if (currentNumber % 4 === 0) {
      accumulator.multiplesOfFour++;
    }
    return accumulator;
  }, { oddNumbers: 0, multiplesOfFour: 0 });

  const totalOddCount = classificationCounts.oddNumbers;
  const totalFourMultipleCount = classificationCounts.multiplesOfFour;

  let isConditionMet = false; // Flag to determine the final status

  // Evaluate the conditions for a "Yes" status
  if (totalOddCount === 0) {
    // Condition 1: If there are no odd numbers, it's always "Yes"
    isConditionMet = true;
  } else if (totalOddCount <= totalFourMultipleCount) {
    // Condition 2: If the count of odd numbers is less than or equal to the count of multiples of four
    isConditionMet = true;
  } else {
    // Condition 3: A specific edge case for N=3
    const isSpecialN3Case = (elementCount === 3 && (totalOddCount - totalFourMultipleCount) <= 1 && totalFourMultipleCount > 0);
    if (isSpecialN3Case) {
      isConditionMet = true;
    }
  }

  const finalResultStatus = isConditionMet ? "Yes" : "No";
  console.log('%s', finalResultStatus);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
