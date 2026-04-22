const sampleExpressions = [
    { queryString: "a=1" },
    { queryString: "b=2" },
    { queryString: "c=3" },
    { queryString: "d=4" },
    { queryString: "e=5" },
    { queryString: "f=6" }
];

const globalProcessedFormulaStore = new Map();
const globalComponentRegistry = new Map();

function sanitizeIdentifier(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function refineNumericalInput(inputValue, precisionStep) {
    const numberValue = parseFloat(inputValue);
    if (isNaN(numberValue)) return NaN;

    if (precisionStep < 1) {
        return Math.round(numberValue / precisionStep) * precisionStep;
    }
    return numberValue;
}

function extractFormulaDetails(inputSequence) {
    const componentSeparator = "{";
    const detailSeparator = ":";

    const expressionBlocks = inputSequence.split(componentSeparator);
    const structuredExpressions = [];

    for (const block of expressionBlocks) {
        const parts = block.split(detailSeparator);
        let currentExpression = "ExpressionDefault";
        let currentLabel = "LabelDefault";
        const variableConfigurations = new Map();

        if (parts.length > 0) {
            currentExpression = parts[0];
            if (parts.length > 1) {
                currentLabel = parts[1];
            }

            for (let i = 2; i < parts.length; i += 4) {
                if (parts.length >= i + 4) {
                    const varId = parts[i];
                    const varMin = parseFloat(parts[i + 1]);
                    const varCurrent = parseFloat(parts[i + 2]);
                    const varMax = parseFloat(parts[i + 3]);
                    variableConfigurations.set(varId, {
                        rangeMin: varMin,
                        currentValue: varCurrent,
                        rangeMax: varMax
                    });
                }
            }
        }
        structuredExpressions.push({
            expression: currentExpression,
            label: currentLabel,
            variableSettings: variableConfigurations
        });
    }
    return structuredExpressions;
}

function processURI() {
    const urlReference = window.location.href;
    const queryDelimiterPosition = urlReference.indexOf("?");
    
    if (queryDelimiterPosition < 0) {
        const defaultElementIndex = 5;
        const currentPath = urlReference.substring(0, queryDelimiterPosition > -1 ? queryDelimiterPosition : urlReference.length);
        const newLocation = `${currentPath}?${sampleExpressions[defaultElementIndex].queryString}`;
        window.location.assign(newLocation);
        return;
    }

    let rawQueryContent = urlReference.substring(queryDelimiterPosition + 1);
    rawQueryContent = rawQueryContent.replace(/'%/g, "+");

    const primaryPayload = rawQueryContent.split('&')[0];
    const formulaList = extractFormulaDetails(primaryPayload);

    const processedFormulas = [];
    for (const formulaSpec of formulaList) {
        if (formulaSpec.expression.length > 1) {
            let parsedFormula;
            try {
                parsedFormula = {
                    expression: formulaSpec.expression,
                    variables: () => Array.from(formulaSpec.variableSettings.keys()),
                    activeVariable: Array.from(formulaSpec.variableSettings.keys())[0]
                };
            } catch (error) {
                console.error("Formula parsing failed:", error);
                continue;
            }

            const componentData = {
                identifier: sanitizeIdentifier(formulaSpec.label),
                expressionText: formulaSpec.expression,
                parsedEquationObject: parsedFormula,
                variableConfigurations: formulaSpec.variableSettings
            };
            processedFormulas.push(componentData);
        }
    }
    globalProcessedFormulaStore.set("main", processedFormulas);
}

function resetApplicationState() {
    globalProcessedFormulaStore.clear();
    globalComponentRegistry.clear();
    const rootElement = document.getElementById("application_root");
    if (rootElement) {
        while (rootElement.firstChild) {
            rootElement.removeChild(rootElement.firstChild);
        }
    }
}

function adjustControlElement(elementValue, elementIdentifier) {
    const parts = elementIdentifier.split('_');
    if (parts.length < 3) return;

    const functionName = parts[0];
    const variableName = parts[1];
    
    const currentFormulaData = globalProcessedFormulaStore.get("main")?.find(f => f.identifier === functionName);
    if (!currentFormulaData) return;

    const variableContext = currentFormulaData.variableConfigurations.get(variableName);
    if (!variableContext) return;

    const inferredStep = (variableContext.rangeMax - variableContext.rangeMin) / 1000;
    const processedValue = refineNumericalInput(elementValue, inferredStep);
    variableContext.currentValue = processedValue;
}

function generateVisualExport() {
    const visualCanvas = document.getElementById("visual_representation_canvas");
    if (visualCanvas instanceof HTMLCanvasElement) {
        const imageDataURL = visualCanvas.toDataURL("image/png");
        window.open(imageDataURL);
    } else {
        alert("No visual output to export. Please generate a graph first!");
    }
}

function designateActiveParameter(functionLabel, parameterName) {
    const relevantFormula = globalProcessedFormulaStore.get("main")?.find(f => f.identifier === functionLabel);
    if (!relevantFormula) return;

    relevantFormula.parsedEquationObject.activeVariable = parameterName;
}

function assembleControlInterface(formulaDescription) {
    const { identifier, parsedEquationObject, variableConfigurations } = formulaDescription;
    const components = [];

    const availableVariables = parsedEquationObject.variables();
    const activeVar = parsedEquationObject.activeVariable || availableVariables[0];

    const variableSelector = {
        type: 'variable_selector',
        label: 'Select Parameter:',
        options: availableVariables.map(vName => ({
            name: vName,
            isSelected: vName === activeVar,
            action: `designateActiveParameter('${identifier}', '${vName}')`
        }))
    };
    components.push(variableSelector);

    variableConfigurations.forEach((details, varId) => {
        const currentDisplay = {
            type: 'value_display',
            id: `${identifier}_${varId}_current_display`,
            label: varId,
            current: details.currentValue
        };
        components.push(currentDisplay);

        const sliderControl = {
            type: 'range_slider',
            id: `${identifier}_${varId}_control`,
            label: `Adjust ${varId}`,
            min: details.rangeMin,
            max: details.rangeMax,
            step: (details.rangeMax - details.rangeMin) / 1000,
            value: details.currentValue,
            action: `adjustControlElement(this.value, '${identifier}_${varId}_control')`
        };
        components.push(sliderControl);
    });

    return components;
}

function initializeApplication() {
    resetApplicationState();
    processURI();
    globalProcessedFormulaStore.get("main")?.forEach(formula => {
        const uiElements = assembleControlInterface(formula);
        globalComponentRegistry.set(formula.identifier, uiElements);
    });
}