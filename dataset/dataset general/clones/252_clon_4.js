class MergedContentWrapper {
    constructor(content) {
        this.content = content;
    }
}

class SchemaProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = "SchemaProcessingError";
    }
}

const typeCheckers = {
    IdentifierCode: /[0-9a-fA-F]{24}/,
    'txt': (val) => typeof val === 'string' ? val : undefined,
    'num': (val) => typeof val === 'number' ? val : undefined,
    'logical': (val) => typeof val === 'boolean' ? val : undefined,
    'func': (val) => typeof val === 'function' ? val : undefined,
    'obj': (val) => typeof val === 'object' && val !== null ? val : undefined
};

function determineSchemaKind(schemaItem) {
    if (typeof schemaItem === 'object' && schemaItem !== null) {
        if (Array.isArray(schemaItem)) return 'list';
        if (schemaItem instanceof RegExp) return "pattern";
        return 'structure';
    } else if (schemaItem === null) {
        return 'nil';
    }
    return typeof schemaItem;
}

const processSchema = {};

function transformValidate(dataItem, schemaDefinition, configParams) {
    const processedConfig = configParams || {};
    const universalSchema = processedConfig.universalSchema;

    const schemaKind = determineSchemaKind(schemaDefinition);

    if (processSchema[schemaKind]) {
        return processSchema[schemaKind](dataItem, schemaDefinition, processedConfig);
    }

    if (schemaKind === 'boolean') {
        if (schemaDefinition === true) {
            return dataItem;
        }
        if (schemaDefinition === false && determineSchemaKind(dataItem) === 'structure') {
            let outcome = undefined;
            for (const fieldKey in dataItem) {
                if (!Object.prototype.hasOwnProperty.call(dataItem, fieldKey)) continue;

                if (determineSchemaKind(dataItem[fieldKey]) === 'structure') {
                    const fieldOutcome = transformValidate(dataItem[fieldKey], false, processedConfig);
                    if (typeof fieldOutcome !== 'undefined') {
                        if (!outcome) outcome = {};
                        outcome[fieldKey] = fieldOutcome;
                    } else if (processedConfig.fill) {
                        if (!outcome) outcome = {};
                        outcome[fieldKey] = null;
                    }
                }
                if (typeof universalSchema !== 'undefined' && typeof universalSchema[fieldKey] !== 'undefined') {
                    if (typeof dataItem[fieldKey] !== 'undefined') {
                        const fieldOutcome = transformValidate(dataItem[fieldKey], universalSchema[fieldKey], processedConfig);
                        if (typeof fieldOutcome !== 'undefined') {
                            if (!outcome) outcome = {};
                            outcome[fieldKey] = fieldOutcome;
                        }
                    }
                }
            }
            return outcome;
        }
    }

    return undefined;
}

processSchema.list = (dataItem, schemaDefinition, processedConfig) => {
    if (!Array.isArray(dataItem)) {
        if (processedConfig.exact) throw new SchemaProcessingError("Field is not a list");
        if (processedConfig.fill) return [];
        return undefined;
    }

    const subSchema = schemaDefinition[0];

    const outcome = dataItem.reduce((acc, currentElement, index) => {
        const elementOutcome = transformValidate(currentElement, subSchema, processedConfig);
        if (typeof elementOutcome !== 'undefined') {
            acc.push(elementOutcome);
        } else if (processedConfig.exact) {
            throw new SchemaProcessingError("Element " + index + " in list field has incorrect kind");
        }
        return acc;
    }, []);
    return outcome;
};

processSchema.string = (dataItem, schemaDefinition, processedConfig) => {
    const checker = typeCheckers[schemaDefinition];
    if (checker) {
        if (checker instanceof RegExp) {
            if (typeof dataItem === 'string') {
                const matchResult = dataItem.match(checker);
                if (matchResult && matchResult[0].length === dataItem.length) return dataItem;
            }
        } else if (typeof checker === 'function') {
            return checker(dataItem);
        }
    }
    return undefined;
};

processSchema.function = (dataItem, schemaDefinition, processedConfig) => {
    return schemaDefinition(dataItem);
};

processSchema.pattern = (dataItem, schemaDefinition, processedConfig) => {
    if (typeof dataItem === 'string') {
        const matchResult = dataItem.match(schemaDefinition);
        if (matchResult && matchResult[0].length === dataItem.length) return dataItem;
    }
    return undefined;
};

processSchema.structure = (dataItem, schemaDefinition, processedConfig) => {
    let outcome = {};
    const universalSchema = processedConfig.universalSchema;

    if (typeof universalSchema === 'object' && universalSchema !== null) {
        for (const fieldKey in dataItem) {
            if (!Object.prototype.hasOwnProperty.call(dataItem, fieldKey)) continue;
            if (typeof universalSchema[fieldKey] === 'undefined') continue;
            const fieldOutcome = transformValidate(dataItem[fieldKey], universalSchema[fieldKey], processedConfig);

            if (typeof fieldOutcome !== 'undefined') {
                outcome[fieldKey] = fieldOutcome;
            }
        }
    }

    if (dataItem === undefined || dataItem === null) {
        if (processedConfig.fill) {
            dataItem = {};
        } else if (processedConfig.exact) {
            throw new SchemaProcessingError("Missing data item for schema structure");
        } else {
            return undefined;
        }
    }

    for (const fieldKey in schemaDefinition) {
        if (!Object.prototype.hasOwnProperty.call(schemaDefinition, fieldKey)) continue;

        if (typeof dataItem[fieldKey] === 'undefined') {
            if (processedConfig.exact) throw new SchemaProcessingError("Missing field: " + fieldKey);
            if (processedConfig.fill) {
                if (determineSchemaKind(schemaDefinition[fieldKey]) === 'list') {
                    outcome[fieldKey] = [];
                } else {
                    outcome[fieldKey] = null;
                }
            }
            continue;
        }

        const fieldOutcome = transformValidate(dataItem[fieldKey], schemaDefinition[fieldKey], processedConfig);

        if (fieldOutcome instanceof MergedContentWrapper) {
            for (const mergeKey in fieldOutcome.content) {
                if (Object.prototype.hasOwnProperty.call(fieldOutcome.content, mergeKey)) {
                    outcome[mergeKey] = fieldOutcome.content[mergeKey];
                }
            }
        } else if (typeof fieldOutcome !== 'undefined') {
            outcome[fieldKey] = fieldOutcome;
        } else if (processedConfig.exact) {
            throw new SchemaProcessingError("Schema processing failed for: " + fieldKey);
        } else if (processedConfig.fill) {
            outcome[fieldKey] = null;
        }
    }
    return outcome;
};

({
    registerModule: typeof define === "function" ? define : function(dependencyList, factoryFunction) {
        module.exports = factoryFunction.apply(null, dependencyList.map(require));
    }
}).
registerModule([], function() {

    transformValidate.applySchema = function(dataItem, schemaDefinition, configParams) {
        const currentConfig = Object.assign({}, configParams);
        currentConfig.fill = true;
        return transformValidate(dataItem, schemaDefinition, currentConfig);
    };

    transformValidate.strictApply = function(dataItem, schemaDefinition, configParams) {
        const currentConfig = Object.assign({}, configParams);
        currentConfig.exact = true;
        try {
            return transformValidate(dataItem, schemaDefinition, currentConfig);
        } catch (e) {
            if (e instanceof SchemaProcessingError) {
                return undefined;
            }
            throw e;
        }
    };

    transformValidate.registerChecker = function(nameKey, checkerFunction) {
        typeCheckers[nameKey] = checkerFunction;
    };

    transformValidate.anyOf = function() {
        const schemaSet = Array.from(arguments);
        return function(valueToTest) {
            let iterationValue = valueToTest;
            let finalResult = undefined;
            for (let k = 0; k < schemaSet.length; ++k) {
                const interimResult = transformValidate(iterationValue, schemaSet[k]);
                if (typeof interimResult !== 'undefined') {
                    iterationValue = interimResult;
                    finalResult = interimResult;
                }
            }
            return finalResult;
        };
    };

    transformValidate.allOf = function() {
        const schemaSet = Array.from(arguments);
        return function(valueToTest) {
            let interimResult = valueToTest;
            for (let k = 0; k < schemaSet.length; ++k) {
                interimResult = transformValidate(interimResult, schemaSet[k]);
                if (typeof interimResult === 'undefined') return undefined;
            }
            return interimResult;
        };
    };

    transformValidate.incorporate = function(schemaDefinition, configParams) {
        return function(valueToTest) {
            const interimResult = transformValidate(valueToTest, schemaDefinition, configParams);
            if (typeof interimResult !== 'undefined') return new MergedContentWrapper(interimResult);
        };
    };
    transformValidate.mainProcessor = transformValidate;

    return transformValidate;
});