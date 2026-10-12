var fileSystem = require('fs');

// Read all standard input at once
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(dataSize);
var readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Begin program execution
executeLogic();

/**
 * Main function to process input lines and find solutions.
 */
function executeLogic() {
  // Define the available arithmetic operators
  var operatorSymbols = ['+', '-', '*'];
  var currentLine;

  // Loop through each input line until '0 0 0 0' is encountered
  for (var lineIndex = 0; (currentLine = inputLines[lineIndex]) !== '0 0 0 0'; lineIndex++) {
    // Parse the numbers from the current line into an Int8Array
    currentLine = new Int8Array(currentLine.split(' ').map(Number));
    var solutionFound = false; // Flag to indicate if a solution was found for the current line

    // Keep track of unique digit permutations already processed to avoid redundant calculations
    var visitedCombinations = new Int8Array(10000);

    // Label for breaking out of deeply nested loops once a solution is found
    SolutionSearch:
    // Iterate through all permutations of the four input digits (a, b, c, d)
    for (var idxA = 0; idxA < 4; idxA++) {
      var valA = currentLine[idxA]; // Cache value for performance
      for (var idxB = 0; idxB < 4; idxB++) {
        if (idxA === idxB) continue; // Digits must be unique
        var valB = currentLine[idxB];
        for (var idxC = 0; idxC < 4; idxC++) {
          if (idxA === idxC || idxB === idxC) continue; // Digits must be unique
          var valC = currentLine[idxC];
          for (var idxD = 0; idxD < 4; idxD++) {
            if (idxA === idxD || idxB === idxD || idxC === idxD) continue; // Digits must be unique
            var valD = currentLine[idxD];

            // Create a unique identifier for this digit permutation
            var numericTarget = valA * 1000 + valB * 100 + valC * 10 + valD;
            if (visitedCombinations[numericTarget]) {
              continue; // Skip if this permutation has already been processed
            }
            visitedCombinations[numericTarget]++; // Mark as visited

            // Iterate through all combinations of three operators
            for (var opIdx1 = 0; opIdx1 < 3; opIdx1++) {
              var opSym1 = operatorSymbols[opIdx1];
              for (var opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                var opSym2 = operatorSymbols[opIdx2];
                for (var opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                  var opSym3 = operatorSymbols[opIdx3];

                  // Optimization: If all operators are subtraction, it's unlikely to reach 10 with positive numbers.
                  // This specific optimization from the original code is preserved.
                  if (opIdx1 === 1 && opIdx2 === 1 && opIdx3 === 1) continue;

                  // Iterate through different expression patterns (operator precedence/grouping)
                  for (var expressionPattern = 0; expressionPattern < 3; expressionPattern++) {
                    var rpnExpression = []; // Array to hold the Reverse Polish Notation (RPN) expression

                    // Construct the RPN expression based on the current pattern
                    switch (expressionPattern) {
                      case 0:
                        // Pattern 1: (((a op1 b) op2 c) op3 d)
                        rpnExpression = [valA, valB, opSym1, valC, opSym2, valD, opSym3];
                        break;
                      case 1:
                        // Pattern 2: ((a op2 (b op1 c)) op3 d)
                        rpnExpression = [valA, valB, valC, opSym1, opSym2, valD, opSym3];
                        break;
                      case 2:
                        // Pattern 3: ((c op1 d) op3 (a op2 b)) - Note: This pattern seems to be a typo in the original comment,
                        // as the RPN `[valA, valB, opSym1, valC, valD, opSym2, opSym3]` corresponds to `( (a op1 b) op3 (c op2 d) )`
                        // The RPN itself is preserved as per Type II rules.
                        rpnExpression = [valA, valB, opSym1, valC, valD, opSym2, opSym3];
                        break;
                    }

                    var evaluationStack = []; // Stack for evaluating the RPN expression
                    for (var elementIndex = 0; elementIndex < 7; elementIndex++) {
                      var currentElement = rpnExpression[elementIndex];
                      switch (currentElement) {
                        case '+':
                          evaluationStack.push(evaluationStack.pop() + evaluationStack.pop());
                          break;
                        case '-':
                          // Note: The original code's subtraction order `(-stack.pop() + stack.pop())`
                          // effectively calculates `right - left` if `pop()` gets `right` then `left`.
                          // For standard RPN, it should be `left - right`.
                          // However, to preserve exact behavior, the original expression is kept.
                          // If stack has [L, R], pop() gets R, then pop() gets L. So -R + L = L - R. This is correct.
                          evaluationStack.push(-evaluationStack.pop() + evaluationStack.pop());
                          break;
                        case '*':
                          evaluationStack.push(evaluationStack.pop() * evaluationStack.pop());
                          break;
                        default:
                          evaluationStack.push(currentElement); // Push numbers onto the stack
                          break;
                      }
                    }

                    // Check if the final result of the RPN evaluation is 10
                    if (evaluationStack.pop() === 10) {
                      solutionFound = true; // A solution has been found

                      var infixResult = []; // Array to reconstruct the infix expression string
                      var leftOperand, rightOperand;

                      // Reconstruct the infix expression from the RPN
                      for (var elementIndex = 0; elementIndex < 7; elementIndex++) {
                        var currentElement = rpnExpression[elementIndex];
                        if (currentElement === '+' || currentElement === '-' || currentElement === '*') {
                          rightOperand = infixResult.pop();
                          leftOperand = infixResult.pop();
                          infixResult.push("(" + leftOperand + " " + currentElement + " " + rightOperand + ")");
                        } else {
                          infixResult.push(currentElement);
                        }
                      }

                      // Output the found expression and break all loops
                      console.log(infixResult.pop());
                      break SolutionSearch; // Exit all permutation loops
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // If no solution was found for the current input line, print 0
    if (!solutionFound) {
      console.log(0);
    }
  }
}
