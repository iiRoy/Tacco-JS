let collectedInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
    collectedInput += inputChunk;
});

process.stdin.on('end', () => {
    function processInputSequence(fullData) {
        const sourceLines = fullData.trim().split('\n');
        const [headerLine, ...contentLines] = sourceLines;
        const totalExpressions = Number(headerLine);
        const relevantLines = contentLines.slice(0, totalExpressions);

        function computeExpression(expressionSource) {
            let traversalIndex = 0;

            function advancePastWhitespace() {
                while (traversalIndex < expressionSource.length && /\s/.test(expressionSource[traversalIndex])) {
                    traversalIndex++;
                }
            }

            function extractNumericValue() {
                advancePastWhitespace();
                let valueSegment = '';
                while (traversalIndex < expressionSource.length && (
                    (expressionSource[traversalIndex] >= '0' && expressionSource[traversalIndex] <= '9') ||
                    expressionSource[traversalIndex] === '.'
                )) {
                    valueSegment += expressionSource[traversalIndex];
                    traversalIndex++;
                }
                // Truncate decimal numbers as per original logic
                return Math.trunc(parseFloat(valueSegment || '0'));
            }

            function processPrimary() {
                advancePastWhitespace();
                let valueMultiplier = 1;
                if (expressionSource[traversalIndex] === '-') {
                    valueMultiplier = -1;
                    traversalIndex++;
                    advancePastWhitespace();
                } else if (expressionSource[traversalIndex] === '+') {
                    traversalIndex++;
                    advancePastWhitespace();
                }

                let segmentResult;
                if (expressionSource[traversalIndex] === '(') {
                    traversalIndex++;
                    segmentResult = evaluateSumDifference();
                    advancePastWhitespace();
                    if (expressionSource[traversalIndex] !== ')') {
                        throw new Error('Mismatched parenthesis error');
                    }
                    traversalIndex++;
                } else {
                    segmentResult = extractNumericValue();
                }
                return valueMultiplier * segmentResult;
            }

            function processTerm() {
                let currentTerm = processPrimary();
                advancePastWhitespace();
                while (traversalIndex < expressionSource.length && (expressionSource[traversalIndex] === '*' || expressionSource[traversalIndex] === '/')) {
                    const mathOperator = expressionSource[traversalIndex];
                    traversalIndex++;
                    const rightHandValue = processPrimary();
                    if (mathOperator === '*') {
                        currentTerm *= rightHandValue;
                    } else {
                        if (rightHandValue === 0) {
                            currentTerm = Number.NaN; // Matches parseInt(eval('X/0')) -> NaN
                        } else {
                            currentTerm /= rightHandValue;
                        }
                    }
                    advancePastWhitespace();
                }
                return currentTerm;
            }

            function evaluateSumDifference() {
                let currentTotal = processTerm();
                advancePastWhitespace();
                while (traversalIndex < expressionSource.length && (expressionSource[traversalIndex] === '+' || expressionSource[traversalIndex] === '-')) {
                    const mathOperator = expressionSource[traversalIndex];
                    traversalIndex++;
                    const rightHandValue = processTerm();
                    if (mathOperator === '+') {
                        currentTotal += rightHandValue;
                    } else {
                        currentTotal -= rightHandValue;
                    }
                    advancePastWhitespace();
                }
                return currentTotal;
            }

            const finalOutcome = evaluateSumDifference();
            return Math.trunc(finalOutcome);
        }

        relevantLines.forEach(currentExpressionLine => {
            const adjustedLine = currentExpressionLine.substring(0, currentExpressionLine.length - 1);
            const computedAnswer = computeExpression(adjustedLine);
            process.stdout.write(computedAnswer.toString() + '\n');
        });
    }
    processInputSequence(collectedInput);
});