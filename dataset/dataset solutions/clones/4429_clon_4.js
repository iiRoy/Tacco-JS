const processInputString = (sourceText) => {
  const initialCharacter = sourceText.charAt(0);
  const finalCharacter = sourceText.charAt(sourceText.length - 1);
  const innerSegmentLength = Math.max(0, sourceText.length - 2);
  return `${initialCharacter}${innerSegmentLength}${finalCharacter}`;
};

function ExecuteTask(dataPayload) {
  console.log(processInputString(dataPayload));
}

ExecuteTask(require("fs").readFileSync("/dev/stdin","utf8"));
