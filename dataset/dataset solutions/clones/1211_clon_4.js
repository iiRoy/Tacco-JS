(function(inputData) {
    const parsedLines = inputData.toString().trim().split('\n');

    function decomposeInterval(overallUnits) {
        let remainingUnits = overallUnits;
        const secondComponent = remainingUnits % 60;
        remainingUnits = Math.floor(remainingUnits / 60);
        const minuteComponent = remainingUnits % 60;
        const hourComponent = Math.floor(remainingUnits / 60);
        return [hourComponent, minuteComponent, secondComponent];
    }

    function composeRepresentation(partsArray, linkChar = ':') {
        return `${partsArray[0]}${linkChar}${partsArray[1]}${linkChar}${partsArray[2]}`;
    }

    const initialValue = parseInt(parsedLines[0], 10);
    const timeParts = decomposeInterval(initialValue);
    const finalOutput = composeRepresentation(timeParts);

    console.log(finalOutput);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));