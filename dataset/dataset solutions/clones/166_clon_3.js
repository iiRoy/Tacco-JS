var fileSystem = require('fs');
var fileStats = fileSystem.fstatSync(process.stdin.fd);
var dataLength = fileStats.size;
var inputBuffer = Buffer.alloc(dataLength);
var bytesReadCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var rawInputLines = inputBuffer.toString('utf8', 0, bytesReadCount).trim().split('\n');

function calculateRpn(tokenList) {
    const evaluationStack = [];
    for (let k = 0; k < tokenList.length; k++) {
        const currentToken = tokenList[k];
        switch (currentToken) {
            case '+':
                evaluationStack.push(evaluationStack.pop() + evaluationStack.pop());
                break;
            case '-':
                const subtrahend = evaluationStack.pop();
                const minuend = evaluationStack.pop();
                evaluationStack.push(minuend - subtrahend);
                break;
            case '*':
                evaluationStack.push(evaluationStack.pop() * evaluationStack.pop());
                break;
            default:
                evaluationStack.push(currentToken);
                break;
        }
    }
    return evaluationStack.pop();
}

function buildInfixExpression(tokenList) {
    const infixResultStack = [];
    let leftPart, rightPart;
    for (let k = 0; k < tokenList.length; k++) {
        const currentToken = tokenList[k];
        if (currentToken === '+' || currentToken === '-' || currentToken === '*') {
            rightPart = infixResultStack.pop();
            leftPart = infixResultStack.pop();
            infixResultStack.push("(" + leftPart + " " + currentToken + " " + rightPart + ")");
        } else {
            infixResultStack.push(currentToken);
        }
    }
    return infixResultStack.pop();
}

function processInputData() {
    const operatorChars = ['+', '-', '*'];
    let currentInputLine;
    let lineIndex = 0;

    while ((currentInputLine = rawInputLines[lineIndex]) !== '0 0 0 0') {
        const numbersOnLine = currentInputLine.split(' ').map(Number);
        let solutionFoundForLine = false;

        SEARCH_LOOP:
        for (let numPermA = 0; numPermA < 4; numPermA++) {
            const valA = numbersOnLine[numPermA];
            for (let numPermB = 0; numPermB < 4; numPermB++) {
                if (numPermA === numPermB) continue;
                const valB = numbersOnLine[numPermB];
                for (let numPermC = 0; numPermC < 4; numPermC++) {
                    if (numPermA === numPermC || numPermB === numPermC) continue;
                    const valC = numbersOnLine[numPermC];
                    for (let numPermD = 0; numPermD < 4; numPermD++) {
                        if (numPermA === numPermD || numPermB === numPermD || numPermC === numPermD) continue;
                        const valD = numbersOnLine[numPermD];

                        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
                            const charOp1 = operatorChars[opIdx1];
                            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                                const charOp2 = operatorChars[opIdx2];
                                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                                    const charOp3 = operatorChars[opIdx3];

                                    if (opIdx1 === 1 && opIdx2 === 1 && opIdx3 === 1) continue;

                                    for (let exprPattern = 0; exprPattern < 3; exprPattern++) {
                                        let rpnTokens = [];
                                        switch (exprPattern) {
                                            case 0:
                                                // pattern1:num num op num op num op (((a op1 b) op2 c) op3 d)
                                                rpnTokens = [valA, valB, charOp1, valC, charOp2, valD, charOp3];
                                                break;
                                            case 1:
                                                // pattern2:num num num op op num op ((a op2 (b op1 c)) op3 d)
                                                rpnTokens = [valA, valB, valC, charOp1, charOp2, valD, charOp3];
                                                break;
                                            case 2:
                                                // pattern3:num num op num num op op ((c op1 d) op3 (a op2 b))
                                                rpnTokens = [valA, valB, charOp1, valC, valD, charOp2, charOp3];
                                                break;
                                        }
 
                                        const calculatedValue = calculateRpn(rpnTokens);
 
                                        if (calculatedValue === 10) {
                                            solutionFoundForLine = true;
                                            const finalExpression = buildInfixExpression(rpnTokens);
                                            console.log(finalExpression);
                                            break SEARCH_LOOP;
                                        }
                                    }
                                }
                            }
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

processInputData();
