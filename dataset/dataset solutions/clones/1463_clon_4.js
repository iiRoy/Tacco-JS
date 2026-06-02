(function(rawData) {
    const lineSegments = rawData.split('\n');

    const sourceCount = Number(lineSegments[0]);
    const sourceElements = new Set(lineSegments[1].split(' ').slice(0, sourceCount).map(Number));

    const queryCount = Number(lineSegments[2]);
    const targetValues = lineSegments[3].split(' ').slice(0, queryCount).map(Number);

    const matchTotal = targetValues.reduce((accumulator, currentValue) => {
        return accumulator + (sourceElements.has(currentValue) ? 1 : 0);
    }, 0);

    console.log(matchTotal);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
