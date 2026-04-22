(function() {
    const contentPayload = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const contentLines = contentPayload.trim().split('\n');
    const dataLine = contentLines[0];

    const numTokens = dataLine.match(/\d+/g);
    const numericalParameters = numTokens.map(Number);

    const initialMomentHour = numericalParameters[0];
    const initialMomentMinute = numericalParameters[1];
    const finalMomentHour = numericalParameters[2];
    const finalMomentMinute = numericalParameters[3];
    const deductDuration = numericalParameters[4];

    const initialTotalMinutes = (initialMomentHour * 60) + initialMomentMinute;
    const finalTotalMinutes = (finalMomentHour * 60) + finalMomentMinute;

    const effectiveTimeChange = initialTotalMinutes - finalTotalMinutes;

    const computedOutcome = effectiveTimeChange - deductDuration;

    process.stdout.write(computedOutcome.toString() + '\n');
})();