function processInputData(rawData) {
    const inputParts = rawData.split('\n');
    const maxLen = Number(inputParts[0]);
    const charSequence = inputParts[1];
    const charIdx = Number(inputParts[2]);

    const specificChar = charSequence.charAt(charIdx);

    const effectiveSequence = charSequence.slice(0, maxLen);
    
    const escapedSpecificChar = specificChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const replacementPattern = new RegExp(`[^${escapedSpecificChar}]`, 'g');
    
    const finalResult = effectiveSequence.replace(replacementPattern, '*');
    
    console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));