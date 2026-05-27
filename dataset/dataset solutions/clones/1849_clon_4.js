function processInputData(rawData) {
  const [firstLineContent, secondLineContent] = rawData.split('\n').map(segment => segment.trim());

  const characterLimit = Number(firstLineContent);
  const sourceText = secondLineContent;

  const formatTextForDisplay = (textToProcess, maxChars) => {
    return textToProcess.length <= maxChars
      ? textToProcess
      : Array.from(textToProcess).slice(0, maxChars).join('') + '...';
  };

  console.log(formatTextForDisplay(sourceText, characterLimit));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
