"use strict";

// Function to generate permutations with allowed repetitions.
const generatePermutationsWithRepeats = (
  optionSet,
  permLength
) => {
  // Base case: if the desired permutation length is 1,
  // each individual option forms a permutation.
  if (permLength === 1) {
    return optionSet.map(singleOption => [singleOption]);
  }

  // Initialize an array to hold all the resulting permutations.
  const resultPerms = [];

  // Recursively call the function to get permutations of a smaller length.
  const subPerms = generatePermutationsWithRepeats(
    optionSet,
    permLength - 1
  );

  // Iterate through each available option in the set.
  optionSet.forEach((currentChoice) => {
    // For each smaller permutation obtained, prepend the current option
    // to form a new, longer permutation.
    subPerms.forEach((subPerm) => {
      resultPerms.push([currentChoice].concat(subPerm));
    });
  });

  // Return the complete collection of permutations.
  return resultPerms;
};

const processInput = inputString => {
    // Clean up the input string and split it into lines.
    inputString = inputString.trim().split("\n");
    // Parse the four individual digits from the first line of input.
    const val1 = parseInt(inputString[0].split("")[0]);
    const val2 = parseInt(inputString[0].split("")[1]);
    const val3 = parseInt(inputString[0].split("")[2]);
    const val4 = parseInt(inputString[0].split("")[3]);

    // Define the set of arithmetic operators to be used.
    const operators = ["+", "-"];
    
    // Generate all possible combinations of 3 operators, allowing repetitions.
    const allCombinations = generatePermutationsWithRepeats(operators, 3);
    
    // Iterate through each generated operator combination.
    for (let idx in allCombinations) {
        let expressionParts = []; // This array will store components of the current arithmetic expression.
        
        // Construct the full arithmetic expression string.
        for (let opIdx = 0; opIdx < allCombinations[idx].length; opIdx++) {
            // Add the numeric values based on the current operator's position.
            if (opIdx === 0) {
                expressionParts.push(val1);
            }
            
            if (opIdx === 1) {
                expressionParts.push(val2);
            }
            
            if (opIdx === 2) {
                expressionParts.push(val3);
            }
            
            // Append the operator itself.
            expressionParts.push(allCombinations[idx][opIdx]);
        }
        
        // After adding all operators and their preceding numbers, append the final numeric value.
        expressionParts.push(val4);

        // Evaluate the constructed expression string.
        if (eval(expressionParts.join("")) === 7) {
            // If the evaluation result is 7, print the expression and terminate.
            console.log(expressionParts.join("") + "=7");
            return;
        }
    }
};

// Read the input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
