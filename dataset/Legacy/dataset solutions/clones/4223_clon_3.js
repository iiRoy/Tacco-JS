"use strict";

// Function to generate permutations with repetitions
const generateRepeatedPermutations = (
  itemChoices, // Renamed from permutationOptions
  desiredLength // Renamed from permutationLength
) => {
  if (desiredLength === 1) {
    // Introduce a temporary variable for the base case mapping
    const singleItemPermutations = itemChoices.map(choice => [choice]);
    return singleItemPermutations;
  }

  // Initialize the array to store all generated permutations.
  const resultPerms = []; // Renamed from permutations

  // Recursively obtain permutations of a smaller length.
  const subPerms = generateRepeatedPermutations( // Renamed from smallerPermutations
    itemChoices,
    desiredLength - 1
  );

  // Iterate through each available item choice and combine it with smaller permutations.
  for (const currentItem of itemChoices) { // Renamed from currentOption, using for...of
    for (const subPerm of subPerms) { // Renamed from smallerPermutation, using for...of
      // Create a new permutation by prepending the current item to a smaller permutation.
      const newPermutation = [currentItem].concat(subPerm); // Introduce helper constant
      resultPerms.push(newPermutation);
    }
  }

  return resultPerms;
};

const processInput = inputStr => { // Renamed from main, arg
    const TARGET_VALUE = 7; // Added a constant for the target sum

    // Process the input string to extract the four numeric values.
    const firstInputLine = inputStr.trim().split("\n")[0]; // Extract first line explicitly
    const val1 = parseInt(firstInputLine[0]); // Renamed from A
    const val2 = parseInt(firstInputLine[1]); // Renamed from B
    const val3 = parseInt(firstInputLine[2]); // Renamed from C
    const val4 = parseInt(firstInputLine[3]); // Renamed from D

    // Store the numeric values in an array for easier access.
    const numericOperands = [val1, val2, val3, val4]; // Added helper array

    const availableOperators = ["+", "-"]; // Renamed from operands

    // Generate all possible combinations of 3 operators.
    const operatorCombinations = generateRepeatedPermutations(availableOperators, 3); // Renamed from patterns

    // Iterate through each generated operator combination.
    for (const currentCombination of operatorCombinations) { // Using for...of instead of for...in
        // Construct the full arithmetic expression string.
        const expressionComponents = []; // Renamed from temp

        // Interleave the numeric values and operators directly.
        // This replaces the original's repetitive if-else block with a more direct construction.
        expressionComponents.push(numericOperands[0]); // First number (A)
        expressionComponents.push(currentCombination[0]); // First operator
        expressionComponents.push(numericOperands[1]); // Second number (B)
        expressionComponents.push(currentCombination[1]); // Second operator
        expressionComponents.push(numericOperands[2]); // Third number (C)
        expressionComponents.push(currentCombination[2]); // Third operator
        expressionComponents.push(numericOperands[3]); // Fourth number (D)

        const fullExpressionString = expressionComponents.join(""); // Added helper variable for the joined string

        // Evaluate the constructed expression.
        if (eval(fullExpressionString) === TARGET_VALUE) { // Using the constant TARGET_VALUE
            console.log(fullExpressionString + "=" + TARGET_VALUE); // Using the constant TARGET_VALUE
            return; // Exit once the first valid expression is found.
        }
    }
};

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
