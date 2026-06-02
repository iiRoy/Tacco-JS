function Main(input) {
    const inputLines = input.split('\n');
    const [lenX, lenY] = inputLines[0].split(' ').map(Number);
    const arrayX = inputLines[1].split(' ').map(Number);
    const arrayY = inputLines[2].split(' ').map(Number);

    const primeModulus = 1000000007;

    const cacheMatrix = Array.from({ length: lenX + 1 }, () =>
        Array.from({ length: lenY + 1 }, () => -1)
    );

    const computeSubsequenceCount = (currentX, currentY) => {
        if (currentX === 0 || currentY === 0) {
            return 1;
        }

        if (cacheMatrix[currentX][currentY] !== -1) {
            return cacheMatrix[currentX][currentY];
        }

        let currentResult;
        const valFromXMinus1 = computeSubsequenceCount(currentX - 1, currentY);
        const valFromYMinus1 = computeSubsequenceCount(currentX, currentY - 1);
        const valFromBothMinus1 = computeSubsequenceCount(currentX - 1, currentY - 1);

        if (arrayX[currentX - 1] === arrayY[currentY - 1]) {
            currentResult = (valFromXMinus1 + valFromYMinus1) % primeModulus;
        } else {
            currentResult = (valFromXMinus1 + valFromYMinus1 - valFromBothMinus1 + primeModulus) % primeModulus;
        }

        cacheMatrix[currentX][currentY] = currentResult;
        return currentResult;
    };

    const finalAnswer = computeSubsequenceCount(lenX, lenY);

    console.log('%s', finalAnswer);
    return finalAnswer;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
