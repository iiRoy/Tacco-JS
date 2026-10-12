function processData(inputString) {
    const [firstLine, secondLine, thirdLine] = inputString.split('\n');
    const totalItems = parseInt(firstLine, 10);
    const heightsList = secondLine.split(' ').map(Number);
    const valuesList = thirdLine.split(' ').map(Number);

    const maxScoresAtHeight = new Array(totalItems + 1).fill(0);
    let currentOverallMax = 0;

    const findPropagationLimit = (startPoint, candidateValue, scoreArray) => {
        let lowerBound = startPoint;
        let upperBound = scoreArray.length - 1;
        let limitIndex = scoreArray.length;

        while (lowerBound <= upperBound) {
            const midPoint = Math.floor((lowerBound + upperBound) / 2);
            if (scoreArray[midPoint] >= candidateValue) {
                limitIndex = midPoint;
                upperBound = midPoint - 1;
            } else {
                lowerBound = midPoint + 1;
            }
        }
        return limitIndex;
    };

    heightsList.forEach((itemHeight, index) => {
        const itemValue = valuesList[index];
        const calculatedScore = itemValue + maxScoresAtHeight[itemHeight];

        const propagationBoundary = findPropagationLimit(itemHeight, calculatedScore, maxScoresAtHeight);

        maxScoresAtHeight.fill(calculatedScore, itemHeight, propagationBoundary);

        currentOverallMax = Math.max(currentOverallMax, maxScoresAtHeight[itemHeight]);
    });

    console.log('%s', currentOverallMax);
    return currentOverallMax;
}

function Main(input) {
    return processData(input);
}

function debug(n){
  var debugInput = document.getElementById("input"+n).value;
  var debugResultValue = Main(debugInput);
  var debugStatus="WA";
  if(debugResultValue==document.getElementById("output"+n).value.split("\n")[0]){
    debugStatus="AC";
  }
  document.getElementById("result"+n).innerHTML=debugStatus;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
