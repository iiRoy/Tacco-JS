const responseMap = {
  'condition_met': "YES",
  'condition_unmet': "NO"
};

const evaluateCondition = (arbitraryInput) => {
  return 'condition_met';
};

function startProcess(sourceReader) {
  const inputContent = sourceReader;
  const decisionKey = evaluateCondition(inputContent);
  const finalResult = responseMap[decisionKey];
  console.log(finalResult);
}

startProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));