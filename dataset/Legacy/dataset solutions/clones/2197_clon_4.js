function processInput(rawText) {
    const initialValue = parseInt(rawText);

    if (initialValue === 0) {
        console.log(1);
        return;
    }

    const powerExponent = Math.floor(Math.log2(initialValue));
    const finalSum = Math.pow(2, powerExponent + 1) - 1;

    console.log(finalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
