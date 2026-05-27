const computeValue = (rawData) => {
    const [num1, num2, num3, num4] = rawData.split(" ").map(Number);

    const productOneThree = num1 * num3;
    const productOneFour = num1 * num4;
    const productTwoThree = num2 * num3;
    const productTwoFour = num2 * num4;

    const finalOutcome = (productOneFour > productOneThree)
        ? productOneFour
        : (productTwoThree > productOneThree)
            ? productOneFour
            : (productTwoFour > productOneThree)
                ? productTwoFour
                : productOneThree;

    console.log(finalOutcome);
};

computeValue(require("fs").readFileSync("/dev/stdin", "utf8"));
