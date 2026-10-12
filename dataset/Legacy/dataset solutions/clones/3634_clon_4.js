const classificationRules = [
    { check: (val) => val < 1200, label: 'ABC' },
    { check: (val) => val >= 1200 && val < 2800, label: 'ARC' },
    { check: (val) => val <= 4208, label: 'AGC' }
];

function determineAndDisplay(rawData) {
    const numericData = Number(rawData);
    classificationRules.forEach(rule => {
        if (rule.check(numericData)) {
            console.log(rule.label);
        }
    });
}

determineAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
