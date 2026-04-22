const streamUtility = require('readline');
const systemInputSource = process.stdin;
const systemOutputDestination = process.stdout;

let collectedInputLines = [];

const inputProcessingInterface = streamUtility.createInterface({
  input: systemInputSource,
  output: systemOutputDestination
});

inputProcessingInterface.on('line', (receivedLine) => {
  collectedInputLines.push(receivedLine);
});

inputProcessingInterface.on('close', () => {
  const quantityToExamine = parseInt(collectedInputLines[0], 10);
  // The original loop iterates from i=1 up to (but not including) lines[0].
  // This means it processes lines[1], lines[2], ..., lines[lines[0]-1].
  const elementsForAnalysis = collectedInputLines.slice(1, quantityToExamine);

  const initialAnalysisState = {
    outcomeFlag: "Affirmative", // Equivalent to "Yes"
    firstBreakingWord: null,     // Stores the word that causes a "Negative" outcome
    encounteredWords: new Set(), // Equivalent to 'checkSpell' hash map
    lastProcessedSegment: null   // Equivalent to 'lastWord' (str.slice(0,-1))
  };

  const finalAnalysisResult = elementsForAnalysis.reduce((currentAnalysisState, currentWord) => {
    // If a negative outcome is already determined, short-circuit further processing.
    if (currentAnalysisState.outcomeFlag === "Negative") {
      return currentAnalysisState;
    }

    const isWordAlreadySeen = currentAnalysisState.encounteredWords.has(currentWord);
    const currentWordInitialChar = currentWord.charAt(0);

    // The original code's 'lastWord' (now 'lastProcessedSegment') stores the
    // previous string's prefix (str.slice(0,-1)). The comparison is
    // currentWord.charAt(0) !== lastProcessedSegment.
    const isConnectionRuleViolated = (
      currentAnalysisState.lastProcessedSegment !== null &&
      currentWordInitialChar !== currentAnalysisState.lastProcessedSegment
    );

    if (isWordAlreadySeen || isConnectionRuleViolated) {
      // A rule is broken, set the outcome to "Negative" and record the breaking word.
      return {
        outcomeFlag: "Negative",
        firstBreakingWord: currentWord,
        encounteredWords: currentAnalysisState.encounteredWords,
        lastProcessedSegment: currentAnalysisState.lastProcessedSegment
      };
    } else {
      // No rule broken for this word, update the state for the next iteration.
      currentAnalysisState.encounteredWords.add(currentWord); // Add current word to the set.
      const updatedLastProcessedSegment = currentWord.slice(0, -1); // Update the segment for the next comparison.

      return {
        outcomeFlag: "Affirmative",
        firstBreakingWord: null,
        encounteredWords: currentAnalysisState.encounteredWords,
        lastProcessedSegment: updatedLastProcessedSegment
      };
    }
  }, initialAnalysisState); // Start the reduction with the defined initial state.

  // Output the final verdict based on the analysis result.
  if (finalAnalysisResult.outcomeFlag === "Negative") {
    console.log(finalAnalysisResult.firstBreakingWord); // Output the first word that caused the failure.
    console.log("Negative"); // Output the "No" equivalent.
  } else {
    console.log("Affirmative"); // Output the "Yes" equivalent.
  }
});