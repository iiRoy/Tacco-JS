"use strict";

const processInput = (rawData) => {
    const parts = rawData.trim().split(' ');
    const alpha = Number(parts[0]);
    const beta = Number(parts[1]);
    const gamma = Number(parts[2]);

    const deriveOutcomeIdentifier = (valA, valB, valC) => {
        const deltaValue = valC - valB;
        const limitValue = valA + 1;

        return valB >= valC
            ? 'scenarioOne'
            : limitValue < deltaValue
                ? 'scenarioTwo'
                : limitValue > deltaValue
                    ? 'scenarioThree'
                    : 'scenarioFour';
    };

    const outcomeRegistry = {
        'scenarioOne': 'delicious',
        'scenarioTwo': 'dangerous',
        'scenarioThree': 'safe',
        'scenarioFour': ''
    };

    const identifier = deriveOutcomeIdentifier(alpha, beta, gamma);
    const finalMessage = outcomeRegistry[identifier];

    console.log(finalMessage);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
