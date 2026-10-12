function processContent(sourceText) {
  const targetString = sourceText.split("\n")[0];

  const outputMapping = {
    "ABC": "ARC"
  };

  const result = outputMapping[targetString] || "ABC";

  console.log(result);
}

processContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
