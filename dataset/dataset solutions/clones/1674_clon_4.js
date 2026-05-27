const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");

((sourceText) => {
    const dataLines = sourceText.split('\n');
    const upperLimit = Number(dataLines[0]);

    const calculateExpression = (valA, valB, valC) => {
        return valA * valA + valB * valB + valC * valC + valA * valB + valB * valC + valA * valC;
    };

    const frequencyCounter = Array.from({ length: upperLimit + 1 }, () => 0);

    function* valueGenerator(maxVal) {
        for (let first = 1; ; ++first) {
            const firstSq = first * first;
            if (firstSq > maxVal) break;
            for (let second = 1; ; ++second) {
                const secondSq = second * second;
                const firstSecondProd = first * second;
                const partialSumXY = firstSq + secondSq + firstSecondProd;
                if (partialSumXY > maxVal) break;
                for (let third = 1; ; ++third) {
                    const thirdSq = third * third;
                    const secondThirdProd = second * third;
                    const firstThirdProd = first * third;
                    const finalSum = firstSq + secondSq + thirdSq + firstSecondProd + secondThirdProd + firstThirdProd;
                    if (finalSum > maxVal) break;
                    yield finalSum;
                }
            }
        }
    }

    for (const resultValue of valueGenerator(upperLimit)) {
        frequencyCounter[resultValue]++;
    }

    for (let idx = 1; idx <= upperLimit; ++idx) {
        console.log(frequencyCounter[idx]);
    }

})(inputSource);
