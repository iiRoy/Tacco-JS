function computeEquivalentResistance(inputLine) {
    const VALUE_DELIMITER = " ";

    const resistanceStrings = inputLine.split(VALUE_DELIMITER);

    const parseResistanceValue = (str) => parseFloat(str);

    const firstResistor = parseResistanceValue(resistanceStrings[0]);
    const secondResistor = parseResistanceValue(resistanceStrings[1]);

    const productOfValues = firstResistor * secondResistor;
    const sumOfValues = firstResistor + secondResistor;

    const finalEquivalentResistance = productOfValues / sumOfValues;

    console.log(finalEquivalentResistance);
}

computeEquivalentResistance(require("fs").readFileSync("/dev/stdin", "utf8"));
