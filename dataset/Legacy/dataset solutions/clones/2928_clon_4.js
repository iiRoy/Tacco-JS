const processInput = (rawData) => {
    const valueParts = rawData.split(" ");

    const firstNumericValue = parseInt(valueParts[0], 10);
    const secondNumericValue = parseInt(valueParts[1], 10);

    const finalCalculatedOutcome = firstNumericValue <= 5
        ? 0
        : firstNumericValue === 6
            ? secondNumericValue / 2
            : firstNumericValue >= 13
                ? secondNumericValue
                : undefined; // Explicitly handles the range 7-12 where no condition matches in the original

    console.log(finalCalculatedOutcome);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
