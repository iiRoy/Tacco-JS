'use strict';

const evaluateLunarCycleCompatibility = (rawSequence) => {
    const parsedDigits = rawSequence.match(/\d+/g).map(Number);
    const initialOrb = parsedDigits[0];
    const subsequentOrb = parsedDigits[1];

    const celestialGrouping = {
        1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1,
        4: 2, 6: 2, 9: 2, 11: 2,
        2: 3
    };

    const firstCategory = celestialGrouping[initialOrb];
    const secondCategory = celestialGrouping[subsequentOrb];

    return (firstCategory === secondCategory) ? "Yes" : "No";
};

((initialPayload) => {
    const determination = evaluateLunarCycleCompatibility(initialPayload);
    console.log(determination);
})(require("node:fs").readFileSync("/dev/stdin", "utf8"));