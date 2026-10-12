function transformString(sourceText) {
  const finalChar = sourceText.slice(-1);
  const suffixMap = {
    's': 'es'
  };
  const selectedSuffix = suffixMap[finalChar] !== undefined ? suffixMap[finalChar] : 's';
  console.log(sourceText + selectedSuffix);
}

transformString(require("fs").readFileSync("/dev/stdin", "utf8"));
