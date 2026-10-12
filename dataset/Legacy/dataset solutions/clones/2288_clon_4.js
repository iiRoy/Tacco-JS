function Main(sourceData) {
    const lineSegments = sourceData.split("\n");

    const initialConfig = lineSegments[0].split(' ');
    const elementQuantity = Number(initialConfig[0]);
    const upperBound = Number(initialConfig[1]);

    const rawNumericStrings = lineSegments[1].split(' ');
    
    const transformedValues = rawNumericStrings
        .slice(0, elementQuantity)
        .map(str => Number(str) * 0.5);

    const currentProduct = transformedValues.reduce((accumulator, currentVal) => accumulator * currentVal, 1);

    let growthCycles;

    if (upperBound <= currentProduct) {
        growthCycles = 0;
    } else {
        growthCycles = Math.floor(Math.log2(upperBound / currentProduct)) + 1;
    }

    console.log(growthCycles);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
