const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.trim().split("\n");

let pointer = 0;
while (pointer < lineSegments.length) {
    const primaryDatumString = lineSegments[pointer];
    const primaryDatum = Number(primaryDatumString);

    if (primaryDatum === 0) {
        break;
    }

    const tenSubsequentValues = [];
    for (let k = 0; k < 10; k++) {
        tenSubsequentValues.push(lineSegments[pointer + 1 + k]);
    }

    const subsequentTotal = tenSubsequentValues.reduce((accumulator, currentSegment) => {
        return accumulator + Number(currentSegment);
    }, 0);

    console.log(primaryDatum - subsequentTotal);

    pointer += 11;
}
