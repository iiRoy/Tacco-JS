function achieveFullReplacement(sourceText, targetFragment, replacementFragment) {
  if (typeof sourceText !== 'string' || typeof targetFragment !== 'string' || typeof replacementFragment !== 'string') {
    return sourceText;
  }
  return sourceText.split(targetFragment).join(replacementFragment);
}

const collectedValidTokens = [];

function passesLengthCriterion(candidateToken) {
  if (typeof candidateToken !== 'string' || candidateToken.trim().length === 0) {
    return false;
  }
  const actualLength = candidateToken.trim().length;
  const minLength = 2;
  const maxLength = 7;
  return actualLength > minLength && actualLength < maxLength;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (receivedChunkOfData) {
  if (typeof receivedChunkOfData !== 'string') {
    console.warn("Received non-string data chunk, skipping.");
    return;
  }

  const firstPassProcessed = achieveFullReplacement(receivedChunkOfData, ".", " ");
  const secondPassProcessed = achieveFullReplacement(firstPassProcessed, ",", " ");
  const rawLexicalUnits = secondPassProcessed.split(" ");

  rawLexicalUnits.forEach(individualToken => {
    const trimmedToken = individualToken.trim();

    if (trimmedToken.length > 0 && passesLengthCriterion(trimmedToken)) {
      collectedValidTokens.push(trimmedToken);
    }
  });
});

process.stdin.on('end', function () {
  if (collectedValidTokens.length > 0) {
    const finalOutputString = collectedValidTokens.join(" ");
    console.log(finalOutputString);
  } else {
    console.log("No tokens matching the criteria were found in the input.");
  }
});