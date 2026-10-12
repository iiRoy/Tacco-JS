const processInput = (rawText) => {
    const lines = rawText.split("\n");
    const targetValue = Number.parseInt(lines[0], 10);

    let currentK = 1;
    let resultFound = false;

    while (!resultFound) {
        const productTerm = currentK * (currentK + 1);
        const divisorValue = 2 * targetValue;

        if (productTerm % divisorValue === 0) {
            console.log(currentK);
            resultFound = true;
        } else {
            currentK++;
        }
    }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
