(function() {
    function acquireAllInput() {
        return new Promise((resolve, reject) => {
            let dataAccumulator = '';
            const inStream = typeof process !== 'undefined' && process.stdin;
            if (!inStream) {
                return reject(new Error('Standard input channel not found.'));
            }
            inStream.setEncoding('utf8');
            inStream.on('data', (chunk) => {
                dataAccumulator += chunk;
            });
            inStream.on('end', () => {
                resolve(dataAccumulator);
            });
            inStream.on('error', (err) => {
                reject(err);
            });
        });
    }

    function emitOutput(content) {
        const outStream = typeof process !== 'undefined' && process.stdout;
        if (outStream) {
            outStream.write(content + '\n');
        } else {
            console.log(content);
        }
    }

    function interpretProblemDescription(textualInput) {
        const structuralLines = textualInput.trim().split('\n');
        if (structuralLines.length === 0) {
            throw new Error("Empty input received.");
        }

        const primaryDirective = structuralLines[0].split(' ').map(Number);
        if (primaryDirective.length !== 2 || isNaN(primaryDirective[0]) || isNaN(primaryDirective[1])) {
            throw new Error("Invalid format for initial parameters.");
        }
        const totalProblemUnits = primaryDirective[0];
        const targetPointThreshold = primaryDirective[1];

        const individualProblemDetails = structuralLines.slice(1).map(lineContent => {
            const componentValues = lineContent.split(' ').map(Number);
            if (componentValues.length !== 2 || isNaN(componentValues[0]) || isNaN(componentValues[1])) {
                throw new Error("Incorrect format for problem specifications.");
            }
            return { quantity: componentValues[0], bonusPoints: componentValues[1] };
        });

        if (individualProblemDetails.length !== totalProblemUnits) {
            throw new Error("Mismatch between declared and actual problem count.");
        }

        return {
            unitCount: totalProblemUnits,
            pointGoal: targetPointThreshold,
            unitSpecifications: individualProblemDetails
        };
    }

    function calculateMinimumEffort(problemCount, targetScore, problemSpecs) {
        let globalMinimumEffort = Number.MAX_SAFE_INTEGER;

        function investigateCombinations(currentProblemIndex, accumulatedScore, accumulatedEffort, completionStatusMask) {
            if (currentProblemIndex === problemCount) {
                if (accumulatedScore >= targetScore) {
                    globalMinimumEffort = Math.min(globalMinimumEffort, accumulatedEffort);
                    return;
                }

                let supplementaryEffort = 0;
                let outstandingScore = targetScore - accumulatedScore;
                let highestUncompletedProblemIndex = -1;

                for (let k = problemCount - 1; k >= 0; k--) {
                    if (!((completionStatusMask >> k) & 1)) {
                        highestUncompletedProblemIndex = k;
                        break;
                    }
                }

                if (highestUncompletedProblemIndex === -1) {
                    return;
                }

                for (let k = highestUncompletedProblemIndex; k >= 0; k--) {
                    if (!((completionStatusMask >> k) & 1)) {
                        const pointsPerQuestion = 100 * (k + 1);
                        const availableQuestions = problemSpecs[k].quantity;

                        if (outstandingScore <= 0) break;

                        const questionsToAttempt = Math.min(availableQuestions, Math.ceil(outstandingScore / pointsPerQuestion));

                        supplementaryEffort += questionsToAttempt;
                        outstandingScore -= (questionsToAttempt * pointsPerQuestion);
                    }
                }

                if (outstandingScore <= 0) {
                    globalMinimumEffort = Math.min(globalMinimumEffort, accumulatedEffort + supplementaryEffort);
                }
                return;
            }

            investigateCombinations(currentProblemIndex + 1, accumulatedScore, accumulatedEffort, completionStatusMask);

            const currentProblemPoints = (100 * (currentProblemIndex + 1) * problemSpecs[currentProblemIndex].quantity) + problemSpecs[currentProblemIndex].bonusPoints;
            const currentProblemEffort = problemSpecs[currentProblemIndex].quantity;
            investigateCombinations(currentProblemIndex + 1, accumulatedScore + currentProblemPoints, accumulatedEffort + currentProblemEffort, completionStatusMask | (1 << currentProblemIndex));
        }

        investigateCombinations(0, 0, 0, 0);
        return globalMinimumEffort;
    }

    async function mainExecutionFlow() {
        try {
            const rawInput = await acquireAllInput();
            const structuredData = interpretProblemDescription(rawInput);
            const finalResult = calculateMinimumEffort(
                structuredData.unitCount,
                structuredData.pointGoal,
                structuredData.unitSpecifications
            );
            emitOutput(finalResult.toString());
        } catch (error) {
            throw error;
        }
    }

    mainExecutionFlow();
})();