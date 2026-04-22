const fileSys = require('node:fs');
const contentSize = fileSys.fstatSync(process.stdin.fd).size;
const inputBuffer = new Buffer(contentSize);
const octetsProcessed = fileSys.readSync(process.stdin.fd, inputBuffer, 0, contentSize, 0);
const dataLines = inputBuffer.toString('utf8', 0, octetsProcessed).trim().split('\n');

processCalculations();

// Main routine to solve the puzzle
function processCalculations() {
  // Define the available arithmetic symbols
  const arithmeticOperators = ['+', '-', '*'];
  let currentLineData; // Holds the parsed numbers for the current line

  // Iterate through each line of input until the termination condition is met
  for (let lineIndex = 0; (currentLineData = dataLines[lineIndex]) !== '0 0 0 0'; lineIndex++) {

    // Parse the current line into an array of numbers
    currentLineData = new Uint8Array(currentLineData.split(' ').map(Number));
    let solutionDiscovered = false; // Flag to indicate if a solution is found for the current line

    // Array to keep track of already checked number permutations
    // Using Int32Array as a boolean-like flag for up to 10000 entries
    const visitedPermutations = new Int32Array(10000);

    // Begin iterating through all possible permutations of the four input numbers
    OUTER_PERMUTATION_LOOP:
    for (let idxOne = 0; idxOne < 4; idxOne++) {
      // Cache the value to reduce repeated array lookups
      const digitVal1 = currentLineData[idxOne];

      for (let idxTwo = 0; idxTwo < 4; idxTwo++) {
        if (idxOne === idxTwo) continue; // Ensure unique indices for permutation
        const digitVal2 = currentLineData[idxTwo];

        for (let idxThree = 0; idxThree < 4; idxThree++) {
          if (idxOne === idxThree || idxTwo === idxThree) continue; // Ensure unique indices
          const digitVal3 = currentLineData[idxThree];

          for (let idxFour = 0; idxFour < 4; idxFour++) {
            if (idxOne === idxFour || idxTwo === idxFour || idxThree === idxFour) continue; // Ensure unique indices
            const digitVal4 = currentLineData[idxFour];

            // Create a unique key for this number permutation (e.g., 1234 for digits 1,2,3,4)
            const permutationKey = digitVal1 * 1000 + digitVal2 * 100 + digitVal3 * 10 + digitVal4;

            // If this permutation has already been checked, skip it
            if (visitedPermutations[permutationKey]) {
              continue;
            }
            // Mark this permutation as visited
            visitedPermutations[permutationKey]++;

            // Iterate through all combinations of the three operators
            for (let operatorIdxA = 0; operatorIdxA < 3; operatorIdxA++) {
              const currentOpA = arithmeticOperators[operatorIdxA];

              for (let operatorIdxB = 0; operatorIdxB < 3; operatorIdxB++) {
                const currentOpB = arithmeticOperators[operatorIdxB];

                for (let operatorIdxC = 0; operatorIdxC < 3; operatorIdxC++) {
                  const currentOpC = arithmeticOperators[operatorIdxC];

                  // Skip a specific combination of operators (all subtractions)
                  // The original code had `op1 == 1 && op2 == 1 && op3 == 1` where 1 is the index of '-'
                  if (operatorIdxA === 1 && operatorIdxB === 1 && operatorIdxC === 1) {
                    continue;
                  }

                  // Iterate through different expression structures (RPN patterns)
                  for (let expressionStructure = 0; expressionStructure < 3; expressionStructure++) {
                    let reversePolishNotation = []; // Array to store the expression in RPN

                    switch (expressionStructure) {
                      case 0:
                        // Pattern A: (((num1 opA num2) opB num3) opC num4)
                        reversePolishNotation = [digitVal1, digitVal2, currentOpA, digitVal3, currentOpB, digitVal4, currentOpC];
                        break;
                      case 1:
                        // Pattern B: ((num1 opB (num2 opA num3)) opC num4)
                        reversePolishNotation = [digitVal1, digitVal2, digitVal3, currentOpA, currentOpB, digitVal4, currentOpC];
                        break;
                      case 2:
                        // Pattern C: ((num1 opA num2) opC (num3 opB num4))
                        reversePolishNotation = [digitVal1, digitVal2, currentOpA, digitVal3, digitVal4, currentOpB, currentOpC];
                        break;
                    }

                    // Evaluate the Reverse Polish Notation expression
                    const evaluationPile = [];
                    for (let elementIndex = 0; elementIndex < 7; elementIndex++) {
                      const currentElement = reversePolishNotation[elementIndex];

                      switch (currentElement) {
                        case '+':
                          // Addition is commutative, order of pops doesn't strictly matter
                          evaluationPile.push(evaluationPile.pop() + evaluationPile.pop());
                          break;
                        case '-':
                          // Subtraction order matters: (second_popped - first_popped)
                          const operandB = evaluationPile.pop();
                          const operandA = evaluationPile.pop();
                          evaluationPile.push(operandA - operandB);
                          break;
                        case '*':
                          // Multiplication is commutative
                          evaluationPile.push(evaluationPile.pop() * evaluationPile.pop());
                          break;
                        default:
                          // Push number onto the stack
                          evaluationPile.push(currentElement);
                          break;
                      }
                    }

                    // Check if the final result of the RPN evaluation is 10
                    if (evaluationPile.pop() === 10) {
                      solutionDiscovered = true; // Mark that a solution has been found

                      // Reconstruct the infix expression for printing
                      const formattedExpression = [];
                      let leftTerm, rightTerm;

                      for (let tokenIndex = 0; tokenIndex < 7; tokenIndex++) {
                        const expressionToken = reversePolishNotation[tokenIndex];

                        if (expressionToken === '+' || expressionToken === '-' || expressionToken === '*') {
                          rightTerm = formattedExpression.pop();
                          leftTerm = formattedExpression.pop();
                          formattedExpression.push(`(${leftTerm} ${expressionToken} ${rightTerm})`);
                        } else {
                          formattedExpression.push(expressionToken);
                        }
                      }

                      // Output the successfully found expression
                      console.log(formattedExpression.pop());
                      // Exit all outer loops as a solution for this line is found
                      break OUTER_PERMUTATION_LOOP;
                    } // End if (evaluationPile.pop() === 10)
                  } // End for (expressionStructure)
                } // End for (operatorIdxC)
              } // End for (operatorIdxB)
            } // End for (operatorIdxA)
          } // End for (idxFour)
        } // End for (idxThree)
      } // End for (idxTwo)
    } // End for (idxOne)

    // If no solution was found for the current input line, print 0
    if (!solutionDiscovered) {
      console.log(0);
    }
  } // End for (lineIndex)
} // End function processCalculations