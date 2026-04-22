(function(utilTools) {
    const dataStore = new Map();

    const processText = (sourceInput) => {
        if (dataStore.has(sourceInput)) {
            return dataStore.get(sourceInput);
        }

        const initialContext = {
            outputElements: ["'"],
            currentDepth: 0,
            withinLiteralSegment: true
        };

        const finalContext = Array.from(sourceInput).reduce((currentContext, characterUnit) => {
            if (currentContext.withinLiteralSegment) {
                if (characterUnit === '{') {
                    currentContext.currentDepth++;
                    currentContext.outputElements.push("'+(");
                    currentContext.withinLiteralSegment = false;
                } else if (characterUnit === "'") {
                    currentContext.outputElements.push("\\'");
                } else {
                    currentContext.outputElements.push(characterUnit);
                }
            } else {
                if (characterUnit === '{') {
                    currentContext.currentDepth++;
                    currentContext.outputElements.push(characterUnit);
                } else if (characterUnit === '}') {
                    currentContext.currentDepth--;
                    if (currentContext.currentDepth === 0) {
                        currentContext.outputElements.push(")+'");
                        currentContext.withinLiteralSegment = true;
                    } else {
                        currentContext.outputElements.push(characterUnit);
                    }
                } else {
                    currentContext.outputElements.push(characterUnit);
                }
            }
            return currentContext;
        }, initialContext);

        finalContext.outputElements.push("'");
        const transformedOutput = finalContext.outputElements.join('');
        dataStore.set(sourceInput, transformedOutput);
        return transformedOutput;
    };

    utilTools.interpolateString = processText;

})(window.stringTransformer = window.stringTransformer || {});