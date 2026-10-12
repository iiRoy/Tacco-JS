function executeLogic(sourceContent) {
    const variableFactory = (rawText) => {
        const cleanedText = rawText.trim();
        const firstArray = Array.from(cleanedText.split('\n'));
        const secondArray = Array.from(cleanedText);
        return {
            firstIdentifier: firstArray,
            secondIdentifier: secondArray
        };
    };

    const { firstIdentifier: a, secondIdentifier: ｂ } = variableFactory(sourceContent);

    const decisionMap = new Map();
    decisionMap.set(true, 'YES');
    decisionMap.set(false, 'NO');

    console.log(decisionMap.get(a == b.reverse().join("")));
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
