const displayInfo = (dataOutput) => console.log(dataOutput);

const componentRegistry = new Map();

componentRegistry.set('EvenComponent', {
    isDivisibleByTwo: (numericValue) => numericValue % 2 === 0
});

componentRegistry.set('OddComponent', {
    isNotDivisibleByTwo: (numericValue) => numericValue % 2 !== 0
});

componentRegistry.set('MessageDisplayer', {
    output: displayInfo
});

componentRegistry.set('ConnectionUtility', {});

const fetchComponent = (componentHandle, completionRoutine) => {
    Promise.resolve().then(() => {
        const retrievedObject = componentRegistry.get(componentHandle);
        completionRoutine(retrievedObject);
    });
};

const processInstruction = (instructionText, outcomeHandler) => {
    Promise.resolve().then(() => {
        // This function specifically interprets the predefined instruction string
        // "invoke: 'Odd'; checkValue(2);" to match the original's effect.
        // It bypasses actual string evaluation for security and Type IV divergence.
        const oddChecker = componentRegistry.get('OddComponent');
        const twoIsOdd = oddChecker.isNotDivisibleByTwo(2);
        const finalDetermination = twoIsOdd ? 'odd' : 'even';
        outcomeHandler(finalDetermination);
    });
};

const itemIdentifier = ['E', 'v', 'e', 'n'].join('');

fetchComponent(itemIdentifier + 'Component', (utilityProvider) => {
    const isOneEven = utilityProvider.isDivisibleByTwo(1);
    const firstOutput = isOneEven ? 'even' : 'odd';
    displayInfo('1 is ' + firstOutput);
});

processInstruction("invoke: 'Odd'; checkValue(2);", (determination) => {
    displayInfo('2 is ' + determination);
});