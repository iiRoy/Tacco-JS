function processInput(rawContent) {
    const flipStr = (strVal) => {
        return strVal.split('').reverse().join('');
    };

    const initialPhrases = ['dream', 'dreamer', 'erase', 'eraser'];
    const targetPhrases = initialPhrases.map(flipStr);

    const inputLine = rawContent.split('\n')[0];
    const processedText = flipStr(inputLine);

    const canFormText = (currentSegment) => {
        if (currentSegment.length === 0) {
            return true;
        }

        return targetPhrases.some(phraseCandidate => {
            if (currentSegment.startsWith(phraseCandidate)) {
                const nextSegment = currentSegment.substring(phraseCandidate.length);
                return canFormText(nextSegment);
            }
            return false;
        });
    };

    if (canFormText(processedText)) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
