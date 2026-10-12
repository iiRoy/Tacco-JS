function substituteAll(sourceString, targetChar, replacementChar) {
  return sourceString.split(targetChar).join(replacementChar);
}

var filteredWordsCollection = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingData) {
    const firstTransformation = substituteAll(incomingData, ".", " ");
    const secondTransformation = substituteAll(firstTransformation, ",", " ");
    const splitTokens = secondTransformation.split(" ");

    for (const currentToken of splitTokens) {
      const currentTokenLength = currentToken.length;
      const isLengthValid = currentTokenLength > 2 && currentTokenLength < 7;
      if (isLengthValid) {
        filteredWordsCollection.push(currentToken);
      }
    }
});
process.stdin.on('end', function() {
  console.log(filteredWordsCollection.join(" "));
});
