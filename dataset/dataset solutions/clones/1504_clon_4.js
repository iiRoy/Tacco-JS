const transformWord = (textualUnit) => {
  const endPosition = textualUnit.length - 1;
  const terminalSymbol = textualUnit.substring(endPosition, endPosition + 1);

  const suffixChoices = {
    's': 'es',
    'default_suffix': 's'
  };

  const selectedAppendage = suffixChoices[terminalSymbol] || suffixChoices['default_suffix'];
  console.log(textualUnit + selectedAppendage);
};

transformWord(require("fs").readFileSync("/dev/stdin", "utf8"));