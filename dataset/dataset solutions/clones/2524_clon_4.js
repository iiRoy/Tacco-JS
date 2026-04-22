function performCalculation(rawText) {
    const lines = rawText.split("\n");
    const initialParameters = lines[0].split(" ").map(Number);
    const criterion = initialParameters[1];
    const dataPoints = lines[1].split(" ").map(Number);
    const qualifyingElementsCount = dataPoints.filter(element => element >= criterion).length;
    console.log(qualifyingElementsCount);
}
performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));