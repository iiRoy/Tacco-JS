function convertToBaseNegativeTwo(entryData) {
    let targetNumber = parseInt(entryData.split("\n")[0]);
    let negitResult = "";

    if (targetNumber === 0) {
        negitResult = "0";
    } else {
        let temporaryValue = targetNumber;
        while (temporaryValue !== 0) {
            let moduloRemnant = temporaryValue % -2;

            if (moduloRemnant < 0) {
                moduloRemnant += 2;
                temporaryValue = Math.floor((temporaryValue - moduloRemnant) / -2);
            } else {
                temporaryValue = Math.floor(temporaryValue / -2);
            }
            negitResult = moduloRemnant.toString() + negitResult;
        }
    }
    console.log(negitResult);
}
convertToBaseNegativeTwo(require("fs").readFileSync("/dev/stdin", "utf8"));