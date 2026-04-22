const obtainSourceMaterial = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const presentResult = (indicatorText) => process.stdout.write(indicatorText + '\n');

const evaluateSegments = (inputPayload) => {
    let accumulatedFragment = '';
    let parsedComponents = [];

    for (let position = 0; position < inputPayload.length; position++) {
        const characterAtPosition = inputPayload[position];
        if (characterAtPosition === ' ') {
            parsedComponents.push(accumulatedFragment);
            accumulatedFragment = '';
        } else {
            accumulatedFragment += characterAtPosition;
        }
    }
    // Add the final accumulated fragment after the loop
    parsedComponents.push(accumulatedFragment);

    const firstItem = parsedComponents[0];
    const secondItem = parsedComponents[1]; // Will be undefined if fewer than two components

    const outcomeMap = new Map();
    outcomeMap.set(true, 'Yes');
    outcomeMap.set(false, 'No');

    return outcomeMap.get(firstItem === secondItem);
};

const orchestrateExecution = () => {
    const rawContent = obtainSourceMaterial();
    const finalDecision = evaluateSegments(rawContent);
    presentResult(finalDecision);
};

orchestrateExecution();