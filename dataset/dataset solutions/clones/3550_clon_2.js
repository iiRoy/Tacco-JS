const constructWordSequence = (phraseList) => { // This function aims to build a sequence of words according to specific linking rules.
  // Initialize an array that will hold the validated word chain.
  let finalSegment = [];

  // Check for initial invalid conditions: an empty input array or the first element being an empty string.
  if (phraseList.length === 0 || phraseList[0] === "") {
    return finalSegment; // If either is true, return an empty chain immediately.
  }

  // The very first word is always a valid starting point for the sequence.
  finalSegment.push(phraseList[0]);

  // Iterate through the rest of the elements in the input array, starting from the second item.
  for (let idx = 1; idx < phraseList.length; idx++) {
    // Obtain the last word successfully added to the chain and the current word being evaluated.
    let priorWord = phraseList[idx - 1];
    let presentWord = phraseList[idx];

    // If the current word is an empty string, it signifies an invalid break in the sequence.
    if (presentWord === "") {
      break; // Terminate the chain building process.
    }

    // Apply the core linking rule: the first character of the present word must match
    // the last character of the prior word.
    if (presentWord[0] === priorWord[priorWord.length - 1]) {
      finalSegment.push(presentWord); // If the rule is met, append the current word to the sequence.
    }
    else {
      break; // If the rule is violated, the chain is broken, so stop.
    }
  }

  // Return the longest possible valid word sequence that was constructed.
  return finalSegment;
};