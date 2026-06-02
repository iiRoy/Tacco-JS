"use strict";

(function() {
    const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    const firstRelevantLine = sourceContent.trim().split('\n')[0];

    const candidatePrefix = firstRelevantLine.substring(0, 4);

    console.log(candidatePrefix === "YAKI" ? "Yes" : "No");
})();
