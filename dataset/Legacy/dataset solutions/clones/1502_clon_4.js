function processTextData(rawInputContent) {
  const lineSegments = rawInputContent.split("\n");

  lineSegments.forEach((wordSegment) => {
    console.log(determinePluralForm(wordSegment));
  });
}

function determinePluralForm(wordCandidate) {
  const endsWithS = wordCandidate.endsWith('s');

  if (endsWithS) {
    return wordCandidate + "es";
  } else {
    return wordCandidate + "s";
  }
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
processTextData(fileData);
