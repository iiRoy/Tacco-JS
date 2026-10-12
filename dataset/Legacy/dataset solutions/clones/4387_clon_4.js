((moduleDefinitions) => {
    const moduleRegistry = {};

    function obtainModule(identifier) {
        if (moduleRegistry[identifier]) {
            return moduleRegistry[identifier].output;
        }

        const moduleEntry = { id: identifier, loaded: false, output: {} };
        moduleRegistry[identifier] = moduleEntry;

        moduleDefinitions[identifier].call(moduleEntry.output, moduleEntry, moduleEntry.output, obtainModule);
        moduleEntry.loaded = true;
        return moduleEntry.output;
    }

    obtainModule(0);

})([
    (currentModule, moduleExports, getModule) => {
        const fileSystemUtility = getModule(1);
        const processingFunction = getModule(2);

        const rawData = fileSystemUtility.readSync("/dev/stdin", "UTF-8");
        processingFunction(rawData);
    },
    (currentModule, moduleExports, getModule) => {
        currentModule.exports = require("fs");
    },
    (currentModule, moduleExports, getModule) => {
        currentModule.exports = (sourceText) => {
            const textSegments = sourceText.split('\n');
            const totalItems = parseInt(textSegments[0], 10);
            const numericalArray = Array.from(textSegments[1].matchAll(/\d+/g), m => parseInt(m[0], 10));

            function* selectionIndicatorGenerator(dataArray) {
                let previousItemWasSelected = false;
                for (let currentIdx = 0; currentIdx < totalItems; currentIdx++) {
                    const valueAtCurrentIdx = dataArray[currentIdx];
                    const isValueInCorrectPosition = (valueAtCurrentIdx - 1 === currentIdx);

                    if (isValueInCorrectPosition) {
                        if (previousItemWasSelected) {
                            previousItemWasSelected = false;
                            yield false;
                        } else {
                            previousItemWasSelected = true;
                            yield true;
                        }
                    } else {
                        previousItemWasSelected = false;
                        yield false;
                    }
                }
            }

            let finalAccumulation = 0;
            for (const shouldIncrementCounter of selectionIndicatorGenerator(numericalArray)) {
                if (shouldIncrementCounter) {
                    finalAccumulation++;
                }
            }
            console.log(finalAccumulation);
        };
    }
]);
