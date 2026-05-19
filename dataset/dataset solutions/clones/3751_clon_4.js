function processInput(rawData) {
    const parts = rawData.match(/\S+/g);
    
    const exponentVal = Math.trunc(Number(parts[0]));
    const factorVal = Math.trunc(Number(parts[1]));

    let calculatedPower = 1;
    for (let currentIteration = 0; currentIteration < exponentVal; currentIteration++) {
        calculatedPower *= 100;
    }

    console.log(calculatedPower * factorVal);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
