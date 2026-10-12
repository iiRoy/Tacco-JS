(function(rawData) {
    const calculateStringDigitSum = (inputStringSegment) => {
        const characterComponents = inputStringSegment.split('');
        const totalSum = characterComponents.reduce((currentAccumulator, charElement) => {
            const numericRepresentation = Number(charElement);
            return currentAccumulator + numericRepresentation;
        }, 0);
        return totalSum;
    };

    const linesArray = rawData.split('\n');

    for (const currentLineSegment of linesArray) {
        if (currentLineSegment === '0') {
            return;
        }

        const lineSum = calculateStringDigitSum(currentLineSegment);
        console.log(lineSum);
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
