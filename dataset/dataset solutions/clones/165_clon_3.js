const fileSystemModule = require('fs');
const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputBufferLength);
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
const rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
const inputLines = rawInputString.trim().split('\n');

solveTenPuzzle();

function solveTenPuzzle() {
  const arithmeticOperators = ['+', '-', '*'];
  let lineIndex = 0;
  let currentInputLine;

  // Helper function to evaluate Reverse Polish Notation (RPN)
  const evaluateRPN = (rpnSequence) => {
    const evaluationStack = [];
    for (const element of rpnSequence) {
      if (typeof element === 'number') {
        evaluationStack.push(element);
      } else { // It's an operator
        const rightOperand = evaluationStack.pop();
        const leftOperand = evaluationStack.pop();
        switch (element) {
          case '+':
            evaluationStack.push(leftOperand + rightOperand);
            break;
          case '-':
            evaluationStack.push(leftOperand - rightOperand);
            break;
          case '*':
            evaluationStack.push(leftOperand * rightOperand);
            break;
        }
      }
    }
    return evaluationStack.pop();
  };

  // Helper function to reconstruct the infix expression string from RPN
  const reconstructInfix = (rpnSequence) => {
    const expressionParts = [];
    for (const element of rpnSequence) {
      if (typeof element === 'number') {
        expressionParts.push(element.toString());
      } else { // It's an operator
        const rightPart = expressionParts.pop();
        const leftPart = expressionParts.pop();
        expressionParts.push(`(${leftPart} ${element} ${rightPart})`);
      }
    }
    return expressionParts.pop();
  };

  // Helper function to try all operator combinations and expression patterns for a given number permutation
  const tryOperatorsAndPatterns = (n1, n2, n3, n4, ops) => {
    for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
      const operator1 = ops[opIdx1];
      for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
        const operator2 = ops[opIdx2];
        for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
          const operator3 = ops[opIdx3];

          // Skip the all-minus case as per original logic (optimization)
          if (operator1 === '-' && operator2 === '-' && operator3 === '-') {
            continue;
          }

          for (let expressionPattern = 0; expressionPattern < 3; expressionPattern++) {
            let rpnExpression = [];
            switch (expressionPattern) {
              case 0: // Pattern 1: (((n1 op1 n2) op2 n3) op3 n4)
                rpnExpression = [n1, n2, operator1, n3, operator2, n4, operator3];
                break;
              case 1: // Pattern 2: ((n1 op2 (n2 op1 n3)) op3 n4)
                rpnExpression = [n1, n2, n3, operator1, operator2, n4, operator3];
                break;
              case 2: // Pattern 3: ((n1 op1 n2) op3 (n3 op2 n4))
                rpnExpression = [n1, n2, operator1, n3, n4, operator2, operator3];
                break;
            }

            if (evaluateRPN(rpnExpression) === 10) {
              return reconstructInfix(rpnExpression); // Return the expression string
            }
          }
        }
      }
    }
    return null; // No solution found for this set of numbers and operators/patterns
  };

  // Main loop processing each line of input
  while ((currentInputLine = inputLines[lineIndex]) !== '0 0 0 0') {
    const currentInputNumbers = new Int8Array(currentInputLine.split(' ').map(Number));
    let solutionFoundForLine = false;

    // Use a boolean array to track processed permutations of input numbers
    // Max value for a number is 9, so 9999 is max permutation key.
    const processedPermutations = new Int8Array(10000);

    // Outer loops for generating permutations of the four input numbers
    permutationLoop:
    for (let idxA = 0; idxA < 4; idxA++) {
      const numA = currentInputNumbers[idxA];
      for (let idxB = 0; idxB < 4; idxB++) {
        if (idxA === idxB) continue;
        const numB = currentInputNumbers[idxB];
        for (let idxC = 0; idxC < 4; idxC++) {
          if (idxA === idxC || idxB === idxC) continue;
          const numC = currentInputNumbers[idxC];
          for (let idxD = 0; idxD < 4; idxD++) {
            if (idxA === idxD || idxB === idxD || idxC === idxD) continue;
            const numD = currentInputNumbers[idxD];

            // Create a unique key for this permutation to avoid redundant calculations
            const permutationKey = numA * 1000 + numB * 100 + numC * 10 + numD;
            if (processedPermutations[permutationKey]) {
              continue;
            }
            processedPermutations[permutationKey] = 1; // Mark as processed

            const resultExpression = tryOperatorsAndPatterns(numA, numB, numC, numD, arithmeticOperators);
            if (resultExpression) {
              console.log(resultExpression);
              solutionFoundForLine = true;
              break permutationLoop; // Solution found for this input line, move to next
            }
          }
        }
      }
    }

    if (!solutionFoundForLine) {
      console.log(0);
    }

    lineIndex++;
  }
}
