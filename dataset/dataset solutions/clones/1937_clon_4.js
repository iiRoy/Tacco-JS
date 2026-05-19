function processNumericInput(sourceData) {
    const [primaryMeasure, secondaryMeasure] = sourceData.split(' ').map(Number);
    const evaluationResult = (primaryMeasure > secondaryMeasure) ? 'safe' : 'unsafe';
    console.log(evaluationResult);
}
processNumericInput(require("fs").readFileSync("/dev/stdin", "utf8"));
