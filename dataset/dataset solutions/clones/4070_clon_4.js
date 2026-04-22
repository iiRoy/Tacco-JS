function processInputData(rawData) {
    const spaceIndex = rawData.indexOf(' ');
    const firstSegment = rawData.substring(0, spaceIndex);
    const secondSegment = rawData.substring(spaceIndex + 1);

    const fullNumericValue = Number(firstSegment + secondSegment);

    let isValuePerfectSquare = false;
    let currentTest = 0;
    while (true) {
        const product = currentTest * currentTest;
        if (product === fullNumericValue) {
            isValuePerfectSquare = true;
            break;
        }
        if (product > fullNumericValue) {
            isValuePerfectSquare = false;
            break;
        }
        currentTest++;
    }

    if (isValuePerfectSquare) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));