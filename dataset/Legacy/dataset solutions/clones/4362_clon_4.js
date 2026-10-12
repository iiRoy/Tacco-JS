function analyzeString(sourceText) {
    const relevantChars = [sourceText.charAt(0), sourceText.charAt(1)];
    const hasNine = relevantChars.some(charValue => charValue === '9');
    console.log(hasNine ? "Yes\n" : "No\n");
}

analyzeString(require('fs').readFileSync('/dev/stdin', 'utf8'));
