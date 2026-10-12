function executeLogic(sourceText) {
  const trimmedText = sourceText.trim();

  const numericValues = trimmedText.split(" ").reduce((acc, current) => {
    acc.push(Number(current));
    return acc;
  }, []);

  const conditionMet = numericValues[0] + numericValues[1] >= numericValues[2];
  const responseMap = {
    true: "Yes",
    false: "No"
  };

  console.log(responseMap[conditionMet]);
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
