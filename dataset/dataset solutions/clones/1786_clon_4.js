const obtainCharacters = (sourceMaterial, currentPosition, limitLength, accumulatedString) => {
  if (currentPosition >= limitLength || currentPosition >= sourceMaterial.length) {
    return accumulatedString;
  }
  return obtainCharacters(sourceMaterial, currentPosition + 1, limitLength, accumulatedString + sourceMaterial[currentPosition]);
};

const processDataStream = (incomingContent) => {
  const resultantSnippet = obtainCharacters(incomingContent, 0, 3, '');
  console.log(resultantSnippet);
};


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));