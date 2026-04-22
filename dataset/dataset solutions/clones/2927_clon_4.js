const obtainData = () => {
    const streamContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const firstSegment = streamContent.split("\n")[0];
    const numericalComponents = firstSegment.match(/-?\d+/g);

    if (!numericalComponents || numericalComponents.length < 2) {
        throw new Error("Insufficient numerical input provided.");
    }
    return {
        itemX: Number(numericalComponents[0]),
        itemY: Number(numericalComponents[1])
    };
};

const calculateResult = (inputX, inputY) => {
    const computationRules = [
        {
            condition: (val) => val <= 5,
            action: () => 0
        },
        {
            condition: (val) => val <= 12,
            action: (x, y) => y / 2
        },
        {
            condition: (val) => true,
            action: (x, y) => y
        }
    ];

    const applicableRule = computationRules.find(rule => rule.condition(inputX));

    if (applicableRule) {
        return applicableRule.action(inputX, inputY);
    }
    return null; // Should not be reached due to the catch-all rule
};

const runProcess = () => {
    const { itemX, itemY } = obtainData();
    const finalValue = calculateResult(itemX, itemY);
    console.log(finalValue);
};

runProcess();