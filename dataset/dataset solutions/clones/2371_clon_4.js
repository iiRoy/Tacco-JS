"use strict";

const ruleBook = Array.from({ length: 100 }, (_, idx) =>
    (idx === 0) ? 1 : ((idx >= 5 && idx % 5 !== 0) ? 2 : 1)
);

const evaluateCondition = (content) => {
    const processedContent = content.trim().split("\n")[0];
    const numericInput = Number(processedContent);

    return (numericInput < 100)
        ? 0
        : (
            (numericInput % 100 === 0)
                ? 1
                : (
                    (100 * ruleBook[numericInput % 100] < numericInput)
                        ? 1
                        : 0
                )
        );
};

process.stdout.write(String(evaluateCondition(require('fs').readFileSync('/dev/stdin', 'utf8'))));