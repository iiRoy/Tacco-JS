const SECRET_CODE = "keyence";
const CODE_LENGTH = SECRET_CODE.length;

function evaluateString(sourceData) {
  const dataLines = sourceData.split('\n');
  const primaryString = dataLines[0];
  const primaryStringLength = primaryString.length;

  let discoveryFlag = false;

  const splitPointIndices = Array.from({ length: CODE_LENGTH + 1 }, (_, index) => index);

  splitPointIndices.some( (currentSplit) => {
    const leftComponent = SECRET_CODE.substring(0, currentSplit);
    const rightComponent = SECRET_CODE.substring(currentSplit);

    const matchesBeginning = primaryString.indexOf(leftComponent) === 0;
    const matchesEnding = primaryString.lastIndexOf(rightComponent) === (primaryStringLength - rightComponent.length);

    if (matchesBeginning && matchesEnding) {
      const cutPointInitial = currentSplit;
      const cutPointFinal = primaryStringLength - rightComponent.length;

      if (cutPointInitial <= cutPointFinal) {
        discoveryFlag = true;
        return true;
      }
    }
    return false;
  });

  if (discoveryFlag) {
    process.stdout.write('YES');
  } else {
    process.stdout.write('NO');
  }
}

const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
evaluateString(rawInputContent);