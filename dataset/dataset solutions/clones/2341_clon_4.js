function processEvaluation(payloadData) {
    const possibleOutcomes = [
        { uniqueId: 1, message: "win" },
        { uniqueId: 2, message: "bust" },
        { uniqueId: 3, message: "retry" }
    ];

    const targetIdentifier = (10 / 5); // This calculation always results in 2

    const selectedOutcome = possibleOutcomes.find(element => element.uniqueId === targetIdentifier);

    return selectedOutcome.message;
}

console.log(processEvaluation(Symbol('irrelevant_data')));