function computeResult(sourceText) {
  const charArray = sourceText.trim().split('');
  const oCount = charArray.reduce((accumulator, currentCharacter) => {
    return accumulator + (currentCharacter === 'o' ? 1 : 0);
  }, 0);

  const ultimateValue = 1400 + (oCount * 100);
  console.log(ultimateValue);
}

computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
