const dataAcquirer = require("node:fs");

dataAcquirer.readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .forEach(incomingString => {
        const numericalRepresentation = Number(incomingString);

        if (Number.isNaN(numericalRepresentation)) {
            console.log('');
            return;
        }

        const powerIndices = Array.from({ length: 10 }, (_, index) => index);

        const identifiedPowers = powerIndices
            .filter(currentPower => {
                const baseTwoValue = Math.pow(2, currentPower);
                return (numericalRepresentation & baseTwoValue) !== 0;
            })
            .map(currentPower => Math.pow(2, currentPower));

        console.log(identifiedPowers.join(' '));
    });