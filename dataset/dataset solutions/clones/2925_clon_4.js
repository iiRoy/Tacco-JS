const calculateOutcome = (inputDataStream) => {
    const extractedValues = inputDataStream.match(/^(-?\d+)\s+(-?\d+)/);

    const firstQuantity = Number(extractedValues[1]);
    const secondQuantity = Number(extractedValues[2]);

    const rulesEngine = [
        { conditionCheck: (val) => val >= 13, actionFormula: (operand) => operand },
        { conditionCheck: (val) => val >= 6, actionFormula: (operand) => operand / 2 },
        { conditionCheck: (val) => true, actionFormula: () => 0 }
    ];

    const applicableRule = rulesEngine.find(rule => rule.conditionCheck(firstQuantity));
    const computedResult = applicableRule.actionFormula(secondQuantity);

    process.stdout.write(String(computedResult) + '\n');
};

calculateOutcome(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));