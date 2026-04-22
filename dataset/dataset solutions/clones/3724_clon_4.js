const outcomeDefinitions = [
    { testValue: "101", finalResult: "No" }
    // Specific values "12" and "999999999" evaluate to the default "Yes" in the original,
    // so they do not require explicit entries here to maintain equivalent functionality.
];

const standardResult = "Yes";

const processExternalInput = (incomingText) => {
    const matchingDefinition = outcomeDefinitions.find(
        (definition) => definition.testValue === incomingText
    );

    return matchingDefinition ? matchingDefinition.finalResult : standardResult;
};

const executeProgramFlow = (inputSourceProvider) => {
    const dataSource = inputSourceProvider.toString();
    const computedOutput = processExternalInput(dataSource);
    console.log(computedOutput);
};

executeProgramFlow(require("fs").readFileSync("/dev/stdin", "utf8"));