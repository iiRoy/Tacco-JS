const fileSystem = require('node:fs');

// Read standard input data
let streamLength = fileSystem.fstatSync(process.stdin.fd).size;
let dataBuffer = Buffer.alloc(streamLength);
let bytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, streamLength, 0);
let inputLines = dataBuffer.toString('utf-8', 0, bytesCount).trim().split('\n');

// Begin the primary computation flow
processCalculations();

function processCalculations( ) {
  const arithmeticOperators = ['+', '-', '*'];

  // Iterate through each input line until a terminator is found
  let currentLine;
  for ( let lineIndex = 0; (currentLine = inputLines[lineIndex]) !== '0 0 0 0'; lineIndex++ ) {
    // Parse numbers from the current input string
    currentLine = currentLine.split(' ').map(Number);
    let solutionAchieved = false;

    // Outer loop for permutations of the four input numbers
    NUMBER_PERMUTATIONS: for ( let firstNumIdx = 0; firstNumIdx < 4; firstNumIdx++ ) {
      const valA = currentLine[firstNumIdx]; // Cache first number for efficiency
      for ( let secondNumIdx = 0; secondNumIdx < 4; secondNumIdx++ ) {
        if ( firstNumIdx === secondNumIdx ) continue; // Ensure unique number indices
        const valB = currentLine[secondNumIdx];
        for ( let thirdNumIdx = 0; thirdNumIdx < 4; thirdNumIdx++ ) {
          if ( firstNumIdx === thirdNumIdx || secondNumIdx === thirdNumIdx ) continue;
          const valC = currentLine[thirdNumIdx];
          for ( let fourthNumIdx = 0; fourthNumIdx < 4; fourthNumIdx++ ) {
            if ( firstNumIdx === fourthNumIdx || secondNumIdx === fourthNumIdx || thirdNumIdx === fourthNumIdx ) continue;
            const valD = currentLine[fourthNumIdx];

            // Iterate through all possible operator combinations
            for ( let opIdx1 = 0; opIdx1 < 3; opIdx1++ ) {
              const currentOp1 = arithmeticOperators[opIdx1];
              for ( let opIdx2 = 0; opIdx2 < 3; opIdx2++ ) {
                const currentOp2 = arithmeticOperators[opIdx2];
                for ( let opIdx3 = 0; opIdx3 < 3; opIdx3++ ) {
                  const currentOp3 = arithmeticOperators[opIdx3];

                  // Skip case where all operators are subtraction (specific problem constraint)
                  if ( opIdx1 === 1 && opIdx2 === 1 && opIdx3 === 1 ) continue;
                  
                  // Explore different expression structures (RPN patterns)
                  for ( let expressionPattern = 0; expressionPattern < 3; expressionPattern++ ) {
                    let rpnExpression = [];
                    switch ( expressionPattern ) {
                      case 0:
                        // Pattern 1: (((A op1 B) op2 C) op3 D)
                        rpnExpression = [ valA, valB, currentOp1, valC, currentOp2, valD, currentOp3 ];
                        break;
                      case 1:
                        // Pattern 2: ((A op2 (B op1 C)) op3 D)
                        rpnExpression = [ valA, valB, valC, currentOp1, currentOp2, valD, currentOp3 ];
                        break;
                      case 2:
                        // Pattern 3: ((A op1 B) op3 (C op2 D))
                        rpnExpression = [ valA, valB, currentOp1, valC, valD, currentOp2, currentOp3 ];
                        break;
                    }
     
                    // Evaluate the Reverse Polish Notation (RPN) expression
                    let evalStack = [];
                    for ( let tokenIndex = 0; tokenIndex < 7; tokenIndex++ ) {
                      const currentToken = rpnExpression[tokenIndex];
                      switch ( currentToken ) {
                        case '+':
                          evalStack.push(evalStack.pop() + evalStack.pop());
                          break;
                        case '-':
                          // RPN order: [..., A, B] becomes A-B. Pop B, then A. So A - B is -B + A.
                          evalStack.push(-evalStack.pop() + evalStack.pop());
                          break;
                        case '*':
                          evalStack.push(evalStack.pop() * evalStack.pop());
                          break;
                        default:
                          evalStack.push(currentToken);
                          break;
                      }
                    }
     
                    // Check if the final result is 10
                    if ( evalStack.pop() === 10 ) {
                      solutionAchieved = true;
     
                      // Reconstruct and print the infix expression
                      let infixOutput = [];
                      let leftOperand, rightOperand;
                      for ( let elemIndex = 0; elemIndex < 7; elemIndex++ ) {
                        const currentElement = rpnExpression[elemIndex];
                        if ( currentElement === '+' || currentElement === '-' || currentElement === '*' ) {
                          rightOperand = infixOutput.pop();
                          leftOperand = infixOutput.pop();
                          infixOutput.push("(" + leftOperand + " " + currentElement + " " + rightOperand + ")");
                        } else {
                          infixOutput.push(currentElement);
                        }
                      }
                       
                      console.log(infixOutput.pop());
                      break NUMBER_PERMUTATIONS; // Exit all nested loops once a solution is found
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
 
    // If no combination resulted in 10 for the current line
    if ( !solutionAchieved )
      console.log(0);
     
  }
}