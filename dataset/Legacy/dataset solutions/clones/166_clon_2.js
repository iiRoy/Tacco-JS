var fileSystem = require('fs'); // Import the file system module
var dataSize = fileSystem.fstatSync(process.stdin.fd).size; // Determine the size of the standard input
var rawData = new Buffer(dataSize); // Allocate a buffer to hold the input data
var readBytesCount = fileSystem.readSync(process.stdin.fd, rawData, 0, dataSize, 0); // Read data from standard input into the buffer
var inputLines = rawData.toString('utf8', 0, readBytesCount).trim().split('\n'); // Convert buffer to string, trim whitespace, and split into lines

// Begin the primary execution flow
executeCalculation();

/**
 * Main function to process input lines and find solutions.
 * This function iterates through input lines, attempting to find a combination
 * of numbers and operators that evaluates to 10.
 */
function executeCalculation() {
  // Define the available arithmetic operators
  var operatorSymbols = ['+', '-', '*'];
  var currentLine; // Variable to hold the current input line being processed

  // Loop through each line of input until a termination condition is met ('0 0 0 0')
  for (var lineIndex = 0; (currentLine = inputLines[lineIndex]) !== '0 0 0 0'; lineIndex++) {
    // Parse the current line into an array of numbers
    currentLine = currentLine.split(' ').map(Number);
    var solutionFound = false; // Flag to indicate if a solution (evaluating to 10) was found for the current line

    // Label for breaking out of nested loops once a solution is found
    SolutionSearch:
    // Iterate through all permutations of the four input numbers
    for (var idxA = 0; idxA < 4; idxA++) {
      var valA = currentLine[idxA]; // Cache value to reduce array access
      for (var idxB = 0; idxB < 4; idxB++) {
        if (idxA === idxB) continue; // Ensure distinct numbers
        var valB = currentLine[idxB];
        for (var idxC = 0; idxC < 4; idxC++) {
          if (idxA === idxC || idxB === idxC) continue; // Ensure distinct numbers
          var valC = currentLine[idxC];
          for (var idxD = 0; idxD < 4; idxD++) {
            if (idxA === idxD || idxB === idxD || idxC === idxD) continue; // Ensure distinct numbers
            var valD = currentLine[idxD];

            // Iterate through all combinations of three operators
            for (var opIdx1 = 0; opIdx1 < 3; opIdx1++) {
              var opChar1 = operatorSymbols[opIdx1]; // First operator symbol
              for (var opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                var opChar2 = operatorSymbols[opIdx2]; // Second operator symbol
                for (var opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                  var opChar3 = operatorSymbols[opIdx3]; // Third operator symbol

                  // Skip a specific operator combination (e.g., to avoid redundant checks or specific edge cases)
                  if (opIdx1 === 1 && opIdx2 === 1 && opIdx3 === 1) continue;

                  // Iterate through different expression patterns (ways to group numbers and operators)
                  for (var expressionPattern = 0; expressionPattern < 3; expressionPattern++) {
                    var rpnExpression = []; // Array to store the Reverse Polish Notation (RPN) expression

                    // Construct the RPN expression based on the current pattern
                    switch (expressionPattern) {
                      case 0:
                        // Pattern 1: (((a op1 b) op2 c) op3 d)
                        rpnExpression = [valA, valB, opChar1, valC, opChar2, valD, opChar3];
                        break;
                      case 1:
                        // Pattern 2: ((a op2 (b op1 c)) op3 d)
                        rpnExpression = [valA, valB, valC, opChar1, opChar2, valD, opChar3];
                        break;
                      case 2:
                        // Pattern 3: ((c op1 d) op3 (a op2 b)) - Note: Original comment was misleading, this is (a op1 b) op3 (c op2 d)
                        rpnExpression = [valA, valB, opChar1, valC, valD, opChar2, opChar3];
                        break;
                    }

                    var evaluationStack = []; // Stack for evaluating the RPN expression
                    // Evaluate the RPN expression
                    for (var elementIndex = 0; elementIndex < 7; elementIndex++) {
                      var currentElement = rpnExpression[elementIndex];
                      switch (currentElement) {
                        case '+':
                          evaluationStack.push(evaluationStack.pop() + evaluationStack.pop());
                          break;
                        case '-':
                          // Subtraction in RPN: second_popped - first_popped
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
                      solutionFound = true; // Mark that a solution has been found

                      var expressionParts = []; // Array to reconstruct the infix expression string
                      var rightOperand, leftOperand; // Variables for operands during reconstruction

                      // Reconstruct the infix expression string from the RPN expression
                      for (var elementIndex = 0; elementIndex < 7; elementIndex++) {
                        var currentElement = rpnExpression[elementIndex];
                        if (currentElement === '+' || currentElement === '-' || currentElement === '*') {
                          rightOperand = expressionParts.pop();
                          leftOperand = expressionParts.pop();
                          expressionParts.push("(" + leftOperand + " " + currentElement + " " + rightOperand + ")");
                        } else {
                          expressionParts.push(currentElement);
                        }
                      }

                      // Output the found expression
                      console.log(expressionParts.pop());
                      break SolutionSearch; // Exit all nested loops as a solution is found
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // If no solution was found for the current line, output 0
    if (!solutionFound) {
      console.log(0);
    }
  }
}
