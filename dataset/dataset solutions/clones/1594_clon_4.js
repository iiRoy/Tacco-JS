function evaluateSequence(sequenceInput) {
    const valueRegistry = {
        'RRS': 2,
        'SRR': 2,
        'RRR': 3,
        'SSS': 0
    };

    const finalOutcome = valueRegistry[sequenceInput];

    console.log('%d', finalOutcome === undefined ? 1 : finalOutcome);
}

evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));