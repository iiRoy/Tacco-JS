function acquireInputString() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function presentOutcome(resultText) {
  console.log(resultText);
}

function signalIssue(errorText) {
  console.error(errorText);
}

function decomposeToCharacters(sourceString) {
  return Array.from(sourceString);
}

function evaluateSequence(rawText) {
  const symbolSequence = decomposeToCharacters(rawText);

  const characterPositions = new Map();
  const requiredSymbols = ['K', 'I', 'H', 'B', 'R'];

  symbolSequence.forEach((char, idx) => {
    if (requiredSymbols.includes(char) && !characterPositions.has(char)) {
      characterPositions.set(char, idx);
    }
  });

  const sequencePassesAllChecks = (() => {
    const kPosition = characterPositions.get('K');
    const iPosition = characterPositions.get('I');
    const hPosition = characterPositions.get('H');
    const bPosition = characterPositions.get('B');
    const rPosition = characterPositions.get('R');

    if (requiredSymbols.some(sym => characterPositions.get(sym) === undefined)) {
      return false;
    }

    if (!(kPosition < iPosition && iPosition < hPosition && hPosition < bPosition && bPosition < rPosition)) {
      return false;
    }

    if (symbolSequence.length > 9) {
      return false;
    }

    if (iPosition - kPosition !== 1) {
      return false;
    }

    const gapHtoB = bPosition - hPosition;
    if (gapHtoB > 2) {
      return false;
    }
    if (gapHtoB === 2) {
      return false;
    }

    const gapBtoR = rPosition - bPosition;
    if (gapBtoR > 2) {
      return false;
    }
    if (gapBtoR === 2) {
      return false;
    }

    if (symbolSequence[0] === 'A' && symbolSequence[1] === 'A') {
      return false;
    }

    const sequenceEndIndex = symbolSequence.length - 1;
    if (symbolSequence[sequenceEndIndex] === 'A' && symbolSequence[sequenceEndIndex - 1] === 'A') {
      return false;
    }

    return true;
  })();

  presentOutcome(sequencePassesAllChecks ? "YES" : "NO");
}

evaluateSequence(acquireInputString());
