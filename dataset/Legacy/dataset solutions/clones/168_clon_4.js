function processInputData() {
  input.forEach(function(lineText) {
    const parsedNumbers = lineText.split(' ').map(parseFloat);
    if (parsedNumbers.length !== 4 || lineText.indexOf('0 0 0 0') === 0) return;
    console.log(findTargetExpression(parsedNumbers));
  });
}

const binaryOperations = [
    { func: (a, b) => a + b, symbol: '+' },
    { func: (a, b) => a - b, symbol: '-' },
    { func: (a, b) => a * b, symbol: '*' }
];

function createAllArrangements(originalArray) {
    const resultCollection = [];
    const mutableArray = [...originalArray];
    const controlIndices = new Array(mutableArray.length).fill(0);

    resultCollection.push([...mutableArray]);

    let currentIdx = 1;
    let swapIdx;

    while (currentIdx < mutableArray.length) {
        if (controlIndices[currentIdx] < currentIdx) {
            swapIdx = (currentIdx % 2 === 0) ? 0 : controlIndices[currentIdx];
            [mutableArray[currentIdx], mutableArray[swapIdx]] = [mutableArray[swapIdx], mutableArray[currentIdx]];
            resultCollection.push([...mutableArray]);
            controlIndices[currentIdx]++;
            currentIdx = 1;
        } else {
            controlIndices[currentIdx] = 0;
            currentIdx++;
        }
    }
    return resultCollection;
}

function findTargetExpression(numberSequence) {
    const allPermutations = createAllArrangements(numberSequence);

    for (const currentNumbers of allPermutations) {
        const [n1, n2, n3, n4] = currentNumbers;

        for (let i = 0; i < binaryOperations.length; i++) {
            const op1 = binaryOperations[i];
            for (let j = 0; j < binaryOperations.length; j++) {
                const op2 = binaryOperations[j];
                for (let k = 0; k < binaryOperations.length; k++) {
                    const op3 = binaryOperations[k];

                    // Pattern 1: ((n1 op1 n2) op2 n3) op3 n4
                    let valA = op1.func(n1, n2);
                    valA = op2.func(valA, n3);
                    valA = op3.func(valA, n4);
                    if (valA === 10) {
                        return `((${n1}${op1.symbol}${n2})${op2.symbol}${n3})${op3.symbol}${n4}`;
                    }

                    // Pattern 2: (n1 op1 (n2 op2 n3)) op3 n4
                    let valB_inner = op2.func(n2, n3);
                    let valB = op1.func(n1, valB_inner);
                    valB = op3.func(valB, n4);
                    if (valB === 10) {
                        return `(${n1}${op1.symbol}(${n2}${op2.symbol}${n3}))${op3.symbol}${n4}`;
                    }

                    // Pattern 3: (n1 op1 n2) op2 (n3 op3 n4)
                    let valC_left = op1.func(n1, n2);
                    let valC_right = op3.func(n3, n4);
                    let valC = op2.func(valC_left, valC_right);
                    if (valC === 10) {
                        return `(${n1}${op1.symbol}${n2})${op2.symbol}(${n3}${op3.symbol}${n4})`;
                    }

                    // Pattern 4: n1 op1 ((n2 op2 n3) op3 n4)
                    let valD_inner = op2.func(n2, n3);
                    let valD_outer = op3.func(valD_inner, n4);
                    let valD = op1.func(n1, valD_outer);
                    if (valD === 10) {
                        return `${n1}${op1.symbol}((${n2}${op2.symbol}${n3})${op3.symbol}${n4})`;
                    }

                    // Pattern 5: n1 op1 (n2 op2 (n3 op3 n4))
                    let valE_inner = op3.func(n3, n4);
                    let valE_middle = op2.func(n2, valE_inner);
                    let valE = op1.func(n1, valE_middle);
                    if (valE === 10) {
                        return `${n1}${op1.symbol}(${n2}${op2.symbol}(${n3}${op3.symbol}${n4}))`;
                    }
                }
            }
        }
    }
    return 0;
}

var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  processInputData();
});
