function processInputData(inputSource) {
    let resultingSegments = [];
    let executionStack = []; // Explicit stack to manage program flow

    // Initialize the first task, simulating the initial call to Sub1
    // after Main function setup.
    executionStack.push({
        operationType: 'startSegmentAnalysis',
        sourceText: inputSource,
        currentIdx: 0,
        currentPartLen: 1,
        segmentAccumulator: resultingSegments
    });

    // Process tasks from the stack until it's empty
    while (executionStack.length > 0) {
        const currentOperation = executionStack.pop(); // LIFO for recursion simulation

        if (currentOperation.operationType === 'startSegmentAnalysis') {
            const { sourceText, currentIdx, currentPartLen, segmentAccumulator } = currentOperation;

            // Handle initial sequence of identical characters (mimics SubRepeat1 & SubRepeat2)
            const firstCharacterInRun = sourceText[currentIdx];
            if (firstCharacterInRun) { // Ensure string is not empty
                let identicalCharCount = 0;
                for (let k = currentIdx; k < sourceText.length; k++) {
                    if (sourceText[k] === firstCharacterInRun) {
                        identicalCharCount++;
                    } else {
                        break;
                    }
                }

                if (identicalCharCount > 3) {
                    let charsProcessedByRepeats = 0;
                    let nextChunkSize = (identicalCharCount % 3 === 2 || identicalCharCount % 3 === 0) ? 2 : 1;

                    while (identicalCharCount > 0) {
                        const actualChunk = Math.min(identicalCharCount, nextChunkSize);
                        segmentAccumulator.push(firstCharacterInRun.repeat(actualChunk));
                        charsProcessedByRepeats += actualChunk;
                        identicalCharCount -= actualChunk;
                        nextChunkSize = 3 - nextChunkSize; // Toggle between 1 and 2
                    }
                    currentOperation.currentIdx += charsProcessedByRepeats; // Update index
                }
            }
            // After initial repeat handling, push the next phase (equivalent to Sub1)
            executionStack.push({
                operationType: 'segmentationPhase1',
                sourceText: currentOperation.sourceText,
                currentIdx: currentOperation.currentIdx,
                currentPartLen: currentOperation.currentPartLen,
                segmentAccumulator: currentOperation.segmentAccumulator
            });

        } else if (currentOperation.operationType === 'segmentationPhase1') {
            const { sourceText, currentIdx, currentPartLen, segmentAccumulator } = currentOperation;

            if (currentIdx > sourceText.length) continue; // Base case for recursion
            
            const currentSlice = sourceText.slice(currentIdx, currentIdx + currentPartLen);
            if (currentSlice === '') continue; // Base case for recursion

            const subsequentChar = sourceText.slice(currentIdx + currentPartLen, currentIdx + currentPartLen + 1);

            if (currentSlice === subsequentChar) {
                // Equivalent to Sub1: if (Si === Sj) { return Sub1(s, i, iLen + 1, results); }
                executionStack.push({
                    operationType: 'segmentationPhase1',
                    sourceText: sourceText,
                    currentIdx: currentIdx,
                    currentPartLen: currentPartLen + 1,
                    segmentAccumulator: segmentAccumulator
                });
            } else {
                // Equivalent to Sub1: else { results.push(Si, Sj); return Sub2(s, i + iLen + 1, 1, Sj, results); }
                segmentAccumulator.push(currentSlice);
                if (subsequentChar !== '') { // Only push non-empty strings
                    segmentAccumulator.push(subsequentChar);
                }
                executionStack.push({
                    operationType: 'segmentationPhase2',
                    sourceText: sourceText,
                    currentIdx: currentIdx + currentPartLen + 1,
                    currentPartLen: 1,
                    lastFragmentChar: subsequentChar, // Sj becomes Si for Sub2
                    segmentAccumulator: segmentAccumulator
                });
            }

        } else if (currentOperation.operationType === 'segmentationPhase2') {
            const { sourceText, currentIdx, currentPartLen, lastFragmentChar, segmentAccumulator } = currentOperation;

            if (currentIdx > sourceText.length) continue; // Base case
            
            const currentSubSlice = sourceText.slice(currentIdx, currentIdx + currentPartLen);
            if (currentSubSlice === '') continue; // Base case

            if (lastFragmentChar === currentSubSlice) {
                // Equivalent to Sub2: if (Si === Sj) { ... }
                if (currentIdx + currentPartLen + 1 > sourceText.length) {
                    // Special swap case
                    if (segmentAccumulator.length >= 2) {
                        const penultimateElement = segmentAccumulator[segmentAccumulator.length - 2];
                        segmentAccumulator[segmentAccumulator.length - 2] = lastFragmentChar;
                        segmentAccumulator[segmentAccumulator.length - 1] = penultimateElement;
                        // Recurse: Sub2(s, i, iLen + 1, Si_1, results);
                        executionStack.push({
                            operationType: 'segmentationPhase2',
                            sourceText: sourceText,
                            currentIdx: currentIdx,
                            currentPartLen: currentPartLen + 1,
                            lastFragmentChar: penultimateElement, // Si_1 becomes new Si
                            segmentAccumulator: segmentAccumulator
                        });
                    } else {
                        // If not enough elements for swap, proceed as if regular extension
                        executionStack.push({
                            operationType: 'segmentationPhase2',
                            sourceText: sourceText,
                            currentIdx: currentIdx,
                            currentPartLen: currentPartLen + 1,
                            lastFragmentChar: lastFragmentChar, // Si unchanged
                            segmentAccumulator: segmentAccumulator
                        });
                    }
                } else {
                    // Regular extension in Sub2
                    // Recurse: Sub2(s, i, iLen + 1, Si, results);
                    executionStack.push({
                        operationType: 'segmentationPhase2',
                        sourceText: sourceText,
                        currentIdx: currentIdx,
                        currentPartLen: currentPartLen + 1,
                        lastFragmentChar: lastFragmentChar, // Si unchanged
                        segmentAccumulator: segmentAccumulator
                    });
                }
            } else {
                // Equivalent to Sub2: else { results.push(Sj); return Sub2(s, i + iLen, 1, Sj, results); }
                segmentAccumulator.push(currentSubSlice);
                executionStack.push({
                    operationType: 'segmentationPhase2',
                    sourceText: sourceText,
                    currentIdx: currentIdx + currentPartLen,
                    currentPartLen: 1,
                    lastFragmentChar: currentSubSlice, // Sj becomes Si for next call
                    segmentAccumulator: segmentAccumulator
                });
            }
        }
    }
    return resultingSegments.length;
}

// Entry point function, equivalent to the original Main
function runAnalysis(dataInput) {
    const finalSegmentCount = processInputData(dataInput);
    console.log('%d', finalSegmentCount);
}

// Read input and execute the analysis
runAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));