function Main(input) {
    const numberStrings = input.split(" ");

    const firstValue = Number(numberStrings[0]);
    const secondValue = Number(numberStrings[1]);
    const thirdValue = Number(numberStrings[2]);

    const sumPairOne = firstValue + secondValue;
    const sumPairTwo = secondValue + thirdValue;
    const sumPairThree = thirdValue + firstValue;

    const allSums = [sumPairOne, sumPairTwo, sumPairThree];
    const smallestSum = Math.min(...allSums);

    console.log(smallestSum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
