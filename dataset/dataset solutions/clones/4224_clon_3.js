function ProcessInput(rawData) {
  const digitChars = rawData.split("");
  const operatorChoices = [];

  const TARGET_SUM_VALUE = 7; // Introduce a constant for the target sum

  function FindExpression(remainingDigitsCount, requiredValue) {
    // Convert the current digit character to a number using unary plus
    const currentDigitValue = +digitChars[remainingDigitsCount - 1];

    if (remainingDigitsCount === 0) {
      // Base case: If all digits have been processed, check if the required value is 0.
      // This preserves the exact behavior of the original code, including its specific base condition.
      return requiredValue === 0;
    } else {
      // Recursive step: Explore two possibilities for the current digit.

      // Path 1: Assume the current digit was subtracted from the previous prefix sum.
      // This means the previous prefix sum needed to be `requiredValue + currentDigitValue`.
      if (FindExpression(remainingDigitsCount - 1, requiredValue + currentDigitValue)) {
        operatorChoices[remainingDigitsCount - 1] = "-"; // Store '-' as the operator before this digit
        return true;
      }
      // Path 2: If Path 1 didn't lead to a solution, assume the current digit was added to the previous prefix sum.
      // This means the previous prefix sum needed to be `requiredValue - currentDigitValue`.
      else if (FindExpression(remainingDigitsCount - 1, requiredValue - currentDigitValue)) {
        operatorChoices[remainingDigitsCount - 1] = "+"; // Store '+' as the operator before this digit
        return true;
      } else {
        // Neither adding nor subtracting the current digit led to a solution in this branch.
        return false;
      }
    }
  }

  // Initiate the search for an expression.
  // The original code calls Func(4, 7), so 'remainingDigitsCount' starts at 4 and 'requiredValue' is 7.
  if (FindExpression(4, TARGET_SUM_VALUE)) {
    // Construct the output string using an array for better readability and manipulation.
    const expressionParts = [];
    expressionParts.push(digitChars[0]);
    expressionParts.push(operatorChoices[1]); // Operator for digitChars[1]
    expressionParts.push(digitChars[1]);
    expressionParts.push(operatorChoices[2]); // Operator for digitChars[2]
    expressionParts.push(digitChars[2]);
    expressionParts.push(operatorChoices[3]); // Operator for digitChars[3]
    expressionParts.push(digitChars[3]);
    expressionParts.push("=");
    expressionParts.push(TARGET_SUM_VALUE);

    console.log(expressionParts.join(""));
  } else {
    console.log("program error");
  }
}

// Standard input reading for competitive programming environments.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
