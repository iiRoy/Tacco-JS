function processInputData(rawTextContent) {
    const numericComponents = rawTextContent.trim().split(/\s+/).slice(0, 3).map(Number);

    const sortedComponents = [...numericComponents].sort((valA, valB) => valA - valB);

    const conditionMet = sortedComponents[2] === (sortedComponents[0] + sortedComponents[1]);

    console.log(["No", "Yes"][+conditionMet]);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
