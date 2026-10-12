const processInputValues = (sourceText) => {
    const segments = sourceText.trim().split(' ');
    
    const relevantSegments = segments.slice(0, 2);

    const finalSum = relevantSegments.reduce((currentTotal, segment) => {
        return currentTotal + Number.parseInt(segment, 10);
    }, 0);

    const outcomeDecision = (finalSum % 3 === 0);
    const outcomeMessage = outcomeDecision ? 'Possible' : 'Impossible';
    
    console.log(outcomeMessage);
};

processInputValues(require('fs').readFileSync('/dev/stdin', 'utf8'));
