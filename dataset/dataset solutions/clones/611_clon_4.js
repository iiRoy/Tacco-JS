let dataBuffer = '';

process.stdin.on('data', (chunk) => {
    dataBuffer += chunk.toString();
});

process.stdin.on('end', () => {
    const lineSegments = dataBuffer.trim().split('\n');
    const iterationLimit = Number(lineSegments.shift());
    const primaryUnits = lineSegments.shift().split('');
    const candidatePhrases = lineSegments.slice(0, iterationLimit);

    const evaluatePhrase = (textUnderExamination, baseSequenceElements, separatorIndex = 0) => {
        if (separatorIndex >= 47) {
            return false;
        }

        const interstitialFiller = '.'.repeat(separatorIndex);
        const formedExpression = baseSequenceElements.join(interstitialFiller);

        if (formedExpression >= 100) {
            return false;
        }

        const patternRecognizer = new RegExp(formedExpression);

        if (patternRecognizer.test(textUnderExamination)) {
            return true;
        }

        return evaluatePhrase(textUnderExamination, baseSequenceElements, separatorIndex + 1);
    };

    const consecutiveMatches = candidatePhrases.reduce((cumulativeSum, phraseToInspect) => {
        if (evaluatePhrase(phraseToInspect, primaryUnits)) {
            return cumulativeSum + 1;
        }
        return cumulativeSum;
    }, 0);

    process.stdout.write(String(consecutiveMatches));
});