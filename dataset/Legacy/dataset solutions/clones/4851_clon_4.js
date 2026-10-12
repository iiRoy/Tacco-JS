const computeEquivalentResistance = (inputLine) => {
    const [firstValue, secondValue] = inputLine.split(" ").map(parseFloat);

    const reciprocalFirst = 1 / firstValue;
    const reciprocalSecond = 1 / secondValue;
    const sumOfReciprocals = reciprocalFirst + reciprocalSecond;
    const finalResistance = 1 / sumOfReciprocals;

    console.log(finalResistance);
};

computeEquivalentResistance(require("fs").readFileSync("/dev/stdin", "utf8"));
