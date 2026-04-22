function ProcessInputAndCompute(sourceData) {
    const extractedParts = sourceData.match(/(\d+)\s(\d+)\s(\d+)\n(\d+)/);

    const stringOne = extractedParts[1];
    const stringTwo = extractedParts[2];
    const stringThree = extractedParts[3];
    const stringExponent = extractedParts[4];

    const itemCollection = [];
    itemCollection.push({ original: stringOne, value: Number(stringOne) });
    itemCollection.push({ original: stringTwo, value: Number(stringTwo) });
    itemCollection.push({ original: stringThree, value: Number(stringThree) });

    itemCollection.sort((alpha, beta) => alpha.value - beta.value);

    const majorComponentString = itemCollection[2].original;
    const minorComponentsConcatenated = itemCollection[0].original + itemCollection[1].original;

    const calculatePower = (base, exp) => {
        let res = 1;
        for (let i = 0; i < exp; ++i) {
            res *= base;
        }
        return res;
    };

    const exponentAsNumber = Number(stringExponent);
    const powerOfTwo = calculatePower(2, exponentAsNumber);

    const majorComponentNumeric = Number(majorComponentString);
    const productPart = majorComponentNumeric * powerOfTwo;

    const finalOutcome = String(productPart) + minorComponentsConcatenated;

    console.log(finalOutcome);
}

ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));