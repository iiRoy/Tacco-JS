function processInputData(externalDatum) {
    const numericalInterpretation = Number(externalDatum);

    if (isNaN(numericalInterpretation)) {
        console.log(NaN);
        return;
    }

    if (numericalInterpretation < 0) {
        console.log(numericalInterpretation);
        return;
    }

    const stringForm = String(numericalInterpretation);
    let lastThreeDigits = stringForm;

    if (stringForm.length > 3) {
        lastThreeDigits = stringForm.slice(-3);
    }
    
    const finalValue = Number(lastThreeDigits);

    console.log(finalValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));