const UtilityKit = (function() {
    const valueConverter = (inputVal, targetKind, fieldSettings) => {
        let transformedVal;
        switch (targetKind) {
            case 'string':
                if (inputVal === undefined || inputVal === null || (Array.isArray(inputVal) && inputVal.length === 0)) {
                    transformedVal = '';
                } else {
                    transformedVal = String(inputVal);
                }
                break;
            case 'integer':
                if (typeof inputVal === 'boolean') {
                    transformedVal = Number(inputVal);
                } else if (typeof inputVal === 'number' && Number.isInteger(inputVal)) {
                    transformedVal = inputVal;
                } else if (typeof inputVal === 'string' && /^-?\d+$/.test(inputVal)) {
                    transformedVal = parseInt(inputVal, 10);
                } else if (typeof inputVal === 'string' && /^-?\d+\.0+$/.test(inputVal)) {
                    transformedVal = parseInt(inputVal, 10);
                } else {
                    transformedVal = NaN;
                }
                break;
            case 'number':
                if (typeof inputVal === 'boolean') {
                    transformedVal = Number(inputVal);
                } else if (typeof inputVal === 'number') {
                    transformedVal = inputVal;
                } else if (typeof inputVal === 'string' && /^-?\d+(\.\d+)?$/.test(inputVal)) {
                    transformedVal = parseFloat(inputVal);
                } else {
                    transformedVal = NaN;
                }
                break;
            case 'array':
                transformedVal = Array.isArray(inputVal) ? inputVal : (inputVal !== undefined && inputVal !== null ? [inputVal] : []);
                break;
            case 'date':
                const dateVal = new Date(inputVal);
                transformedVal = dateVal;
                break;
            default:
                transformedVal = inputVal;
                break;
        }
        return transformedVal;
    };

    const parseDateFromText = (dateString) => {
        return new Date(dateString);
    };

    const processObjectData = (dataObject, dataSchema, configuration) => {
        const issueReports = [];
        const initialObjectKeys = Object.keys(dataObject);

        const configDefaults = {
            permitVetoRules: true,
            removeExtraFields: false,
            processingFlavor: 'add',
            performTypeConversion: true,
            processExistingFieldsOnly: false
        };
        const currentConfig = { ...configDefaults, ...configuration };

        const schemaFields = dataSchema.properties || {};
        const schemaFieldNames = Object.keys(schemaFields);

        for (const fieldName of schemaFieldNames) {
            if (!initialObjectKeys.includes(fieldName)) {
                continue;
            }

            const fieldSchema = schemaFields[fieldName];
            let fieldValue = dataObject[fieldName];

            if (currentConfig.permitVetoRules && fieldSchema.veto && fieldSchema.veto[currentConfig.processingFlavor]) {
                delete dataObject[fieldName];
                continue;
            }

            if (fieldSchema.value !== undefined) {
                dataObject[fieldName] = fieldSchema.value;
                continue;
            }

            if (fieldSchema.optional && (fieldValue === undefined || fieldValue === null)) {
                if (fieldValue === undefined) {
                    delete dataObject[fieldName];
                }
                continue;
            }

            if (currentConfig.performTypeConversion && fieldSchema.type) {
                const coercedValue = valueConverter(fieldValue, fieldSchema.type, fieldSchema);
                if (isNaN(coercedValue) && typeof coercedValue === 'number' && !isNaN(fieldValue)) {
                    issueReports.push({ property: fieldName, message: 'type' });
                } else if (fieldSchema.type === 'date' && isNaN(coercedValue.getTime()) && fieldValue !== undefined && fieldValue !== null) {
                    issueReports.push({ property: fieldName, message: 'type' });
                } else {
                    fieldValue = coercedValue;
                    dataObject[fieldName] = fieldValue;
                }
            }

            if (fieldValue !== undefined && fieldValue !== null) {
                if (fieldSchema.type) {
                    let isValidType = true;
                    switch (fieldSchema.type) {
                        case 'string': isValidType = typeof fieldValue === 'string'; break;
                        case 'integer': isValidType = typeof fieldValue === 'number' && Number.isInteger(fieldValue); break;
                        case 'number': isValidType = typeof fieldValue === 'number' && !isNaN(fieldValue); break;
                        case 'array': isValidType = Array.isArray(fieldValue); break;
                        case 'date': isValidType = fieldValue instanceof Date && !isNaN(fieldValue.getTime()); break;
                    }
                    if (!isValidType) {
                        issueReports.push({ property: fieldName, message: 'type' });
                    }
                }
                if (fieldSchema.type === 'string' && fieldSchema.pattern && !fieldSchema.pattern.test(fieldValue)) {
                    issueReports.push({ property: fieldName, message: 'pattern' });
                }
                if (fieldSchema.type === 'number' && fieldSchema.maxDecimal !== undefined) {
                    if (typeof fieldValue === 'number') {
                        const decimalPart = (fieldValue.toString().split('.')[1] || '').length;
                        if (decimalPart > fieldSchema.maxDecimal) {
                            issueReports.push({ property: fieldName, message: 'digits' });
                        }
                    }
                }
                if (fieldSchema.type === 'array' && Array.isArray(fieldValue) && fieldSchema.items) {
                    const itemSchema = fieldSchema.items;
                    for (let i = 0; i < fieldValue.length; i++) {
                        let itemValue = fieldValue[i];
                        if (currentConfig.performTypeConversion && itemSchema.type) {
                            const coercedItemValue = valueConverter(itemValue, itemSchema.type, itemSchema);
                            if (isNaN(coercedItemValue) && typeof coercedItemValue === 'number' && !isNaN(itemValue)) {
                                issueReports.push({ property: `${fieldName}[${i}]`, message: 'type' });
                            } else if (itemSchema.type === 'date' && isNaN(coercedItemValue.getTime()) && itemValue !== undefined && itemValue !== null) {
                                issueReports.push({ property: `${fieldName}[${i}]`, message: 'type' });
                            } else {
                                itemValue = coercedItemValue;
                                fieldValue[i] = itemValue;
                            }
                        }
                        if (itemSchema.enum && !itemSchema.enum.includes(itemValue)) {
                            issueReports.push({ property: `${fieldName}[${i}]`, message: 'enum' });
                        }
                    }
                }
            }
        }

        for (const fieldName of schemaFieldNames) {
            if (initialObjectKeys.includes(fieldName)) {
                continue;
            }
            if (currentConfig.processingFlavor === 'update' && currentConfig.processExistingFieldsOnly) {
                continue;
            }

            const fieldSchema = schemaFields[fieldName];
            if (fieldSchema.default !== undefined && currentConfig.processingFlavor === 'add') {
                let defaultValue = fieldSchema.default;
                if (fieldSchema.type) {
                    if (fieldSchema.type === 'date') {
                        defaultValue = parseDateFromText(defaultValue);
                    } else {
                        defaultValue = valueConverter(defaultValue, fieldSchema.type, fieldSchema);
                    }
                }
                dataObject[fieldName] = defaultValue;
            } else if (!fieldSchema.optional && currentConfig.processingFlavor === 'add') {
                issueReports.push({ property: fieldName, message: 'required' });
            }
        }

        const finalObjectKeys = Object.keys(dataObject);
        for (const key of finalObjectKeys) {
            if (schemaFieldNames.includes(key)) {
                continue;
            }

            if (dataSchema.additionalProperties === false) {
                if (currentConfig.removeExtraFields) {
                    delete dataObject[key];
                } else {
                    issueReports.push({ property: key, message: 'additionalPropertyForbidden' });
                }
            } else if (typeof dataSchema.additionalProperties === 'object') {
                const additionalPropSchema = dataSchema.additionalProperties;
                let propValue = dataObject[key];

                if (currentConfig.performTypeConversion && additionalPropSchema.type) {
                    const coercedPropValue = valueConverter(propValue, additionalPropSchema.type, additionalPropSchema);
                    if (isNaN(coercedPropValue) && typeof coercedPropValue === 'number' && !isNaN(propValue)) {
                        issueReports.push({ property: key, message: 'type' });
                    } else if (additionalPropSchema.type === 'date' && isNaN(coercedPropValue.getTime()) && propValue !== undefined && propValue !== null) {
                        issueReports.push({ property: key, message: 'type' });
                    } else {
                        propValue = coercedPropValue;
                        dataObject[key] = propValue;
                    }
                }
                if (propValue !== undefined && propValue !== null) {
                    if (additionalPropSchema.type) {
                        let isValidType = true;
                        switch (additionalPropSchema.type) {
                            case 'string': isValidType = typeof propValue === 'string'; break;
                            case 'integer': isValidType = typeof propValue === 'number' && Number.isInteger(propValue); break;
                            case 'number': isValidType = typeof propValue === 'number' && !isNaN(propValue); break;
                            case 'array': isValidType = Array.isArray(propValue); break;
                            case 'date': isValidType = propValue instanceof Date && !isNaN(propValue.getTime()); break;
                        }
                        if (!isValidType) {
                            issueReports.push({ property: key, message: 'type' });
                        }
                    }
                    if (additionalPropSchema.pattern) {
                        if (!additionalPropSchema.pattern.test(propValue)) {
                            issueReports.push({ property: key, message: 'pattern' });
                        }
                    }
                    if (additionalPropSchema.maxDecimal !== undefined) {
                        if (typeof propValue === 'number') {
                            const decimalPart = (propValue.toString().split('.')[1] || '').length;
                            if (decimalPart > additionalPropSchema.maxDecimal) {
                                issueReports.push({ property: key, message: 'digits' });
                            }
                        }
                    }
                }
            }
        }

        return issueReports.length > 0 ? issueReports : null;
    };

    return {
        valueConverter: valueConverter,
        processObjectData: processObjectData,
        parseDateFromText: parseDateFromText
    };
})();

const TestBench = (function() {
    let currentSuiteName = '';
    const allResults = [];

    function checkDeepEquality(val1, val2) {
        if (val1 === val2) return true;

        if (val1 instanceof Date && val2 instanceof Date) {
            return val1.getTime() === val2.getTime();
        }

        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val1.length !== val2.length) return false;
            for (let i = 0; i < val1.length; i++) {
                if (!checkDeepEquality(val1[i], val2[i])) return false;
            }
            return true;
        }

        if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
            const keys1 = Object.keys(val1);
            const keys2 = Object.keys(val2);
            if (keys1.length !== keys2.length) return false;
            for (const key of keys1) {
                if (!keys2.includes(key) || !checkDeepEquality(val1[key], val2[key])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    return {
        beginSuit: function(name) {
            currentSuiteName = name;
            console.log(`\nStarting Suite: ${name}`);
        },
        recordTrial: function(description, testFunction) {
            try {
                testFunction();
                console.log(`  ✔ ${description}`);
            } catch (error) {
                console.error(`  ✖ ${description} - ${error.message}`);
            }
        },
        confirmEqual: function(actual, expected, message) {
            const status = checkDeepEquality(actual, expected) ? 'PASS' : 'FAIL';
            allResults.push({ suite: currentSuiteName, trial: message, status: status, actual: actual, expected: expected });
            if (status === 'FAIL') {
                throw new Error(`${message} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
            }
        },
        confirmDeepEqual: function(actual, expected, message) {
            const status = checkDeepEquality(actual, expected) ? 'PASS' : 'FAIL';
            allResults.push({ suite: currentSuiteName, trial: message, status: status, actual: actual, expected: expected });
            if (status === 'FAIL') {
                throw new Error(`${message} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
            }
        },
        finalReport: function() {
            console.log('\n--- Test Summary ---');
            let passed = 0;
            let failed = 0;
            for (const res of allResults) {
                if (res.status === 'PASS') {
                    passed++;
                } else {
                    failed++;
                    console.error(`FAIL: ${res.suite} - ${res.trial} -> Expected: ${JSON.stringify(res.expected)}, Got: ${JSON.stringify(res.actual)}`);
                }
            }
            console.log(`Total Trials: ${allResults.length}, Passed: ${passed}, Failed: ${failed}`);
            if (failed > 0) {
                console.error('Some tests failed!');
            } else {
                console.log('All tests passed!');
            }
        }
    };
})();

(function(){
    TestBench.beginSuit('Value Conversion: type transformation');

    TestBench.recordTrial('falsy values', function(){
        TestBench.confirmEqual(UtilityKit.valueConverter(undefined, 'string'), '', 'undefined to empty string');
        TestBench.confirmEqual(UtilityKit.valueConverter(null, 'string'), '', 'null to empty string');
        TestBench.confirmEqual(UtilityKit.valueConverter(0, 'string'), '0', 'zero to string "0"');
        TestBench.confirmEqual(UtilityKit.valueConverter(false, 'string'), 'false', 'false to string "false"');
        TestBench.confirmEqual(UtilityKit.valueConverter(NaN, 'string'), 'NaN', 'NaN to string "NaN"');
    });

    TestBench.recordTrial('truthy values', function(){
        TestBench.confirmEqual(UtilityKit.valueConverter(1, 'string'), '1', 'integer 1 to string "1"');
        TestBench.confirmEqual(UtilityKit.valueConverter(1.0, 'string'), '1', 'float 1.0 to string "1"');
        TestBench.confirmEqual(UtilityKit.valueConverter(1.1, 'string'), '1.1', 'float 1.1 to string "1.1"');
        TestBench.confirmEqual(UtilityKit.valueConverter(true, 'string'), 'true', 'true to string "true"');
        TestBench.confirmEqual(UtilityKit.valueConverter([], 'string'), '', 'empty array to empty string');
        TestBench.confirmEqual(UtilityKit.valueConverter({}, 'string'), '[object Object]', 'empty object to string "[object Object]"');
    });
})();

(function(){
    let dataItem;

    TestBench.beginSuit('Data Processing: schema application');

    TestBench.recordTrial('value attribute', function(){
        dataItem = {id: 'bac', foo: '4'};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            properties: {
                foo: {
                    value: 'Зафиксировано'
                }
            },
            additionalProperties: true
        }, {permitVetoRules: true, removeExtraFields: false, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: 'Зафиксировано'}, 'schema ok');
    });

    TestBench.recordTrial('empty properties', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            properties: {
            },
            additionalProperties: true
        }, {permitVetoRules: true, removeExtraFields: false, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '4', bar: 'vareniki', spam: true}, 'schema ok');
    });

    TestBench.recordTrial('undefined properties', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            additionalProperties: true
        }, {permitVetoRules: true, removeExtraFields: false, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '4', bar: 'vareniki', spam: true}, 'schema ok');
    });

    TestBench.recordTrial('undefined properties and additionalProperties=false', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            additionalProperties: false
        }, {permitVetoRules: true, removeExtraFields: true, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '4', bar: 'vareniki', spam: true}, 'schema ok');
    });

    TestBench.recordTrial('greedy coercion for optionals', function(){
        dataItem = {foo: undefined, bar: null};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            properties: {
                foo: {
                    type: 'string',
                    pattern: /^aaa$/,
                    optional: true
                },
                bar: {
                }
            },
            additionalProperties: true
        }, {permitVetoRules: true, removeExtraFields: false, processingFlavor: 'add', performTypeConversion: true}),
            null, 'optionals not coerced ok');
        TestBench.confirmDeepEqual(dataItem, {bar: null}, 'schema ok');
    });

    TestBench.recordTrial('fixed values', function(){
        dataItem = {foo: 'baz'};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            properties: {
                foo: {
                    type: 'string',
                    value: 'bar',
                    veto: {
                        update: true
                    }
                }
            },
            additionalProperties: false
        }, {permitVetoRules: true, removeExtraFields: true, processingFlavor: 'add', performTypeConversion: true}),
            null, 'fixed values fixed ok');
        TestBench.confirmDeepEqual(dataItem, {foo: 'bar'}, 'schema ok');

        dataItem = {};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, {
            type: 'object',
            properties: {
                foo: {
                    type: 'string',
                    value: 'bar',
                    veto: {
                        update: true
                    }
                }
            },
            additionalProperties: false
        }, {permitVetoRules: true, removeExtraFields: true, processingFlavor: 'add', performTypeConversion: true}),
            null, 'fixed values fixed ok');
        TestBench.confirmDeepEqual(dataItem, {foo: 'bar'}, 'schema ok');
    });
})();

(function(){
    let dataSchema, dataItem;

    TestBench.beginSuit('Data Processing: additionalProperties=false');

    dataSchema = {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                pattern: /^[abc]+$/,
                veto: {
                    update: true
                }
            },
            foo: {
                type: 'integer',
                veto: {
                    get: true
                }
            },
            bar: {
                type: 'array',
                items: {
                    type: 'string',
                    'enum': ['eniki', 'beniki', 'eli', 'vareniki']
                },
                veto: {
                    query: true
                }
            },
            defaulty: {
                type: 'date',
                'default': '2011-02-14'
            }
        },
        additionalProperties: false
    };

    TestBench.recordTrial('add flavor', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: UtilityKit.parseDateFromText('2011-02-14')}, 'coerced for "add" ok');

        dataItem = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'validate for "add"');

        dataItem = {id: 'bac'};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            [{'property': 'foo', 'message': 'required'}, {'property': 'bar', 'message': 'required'}], 'validate for "add"');
    });

    TestBench.recordTrial('update flavor', function(){
        dataItem = {id: 'bac', foo1: '5', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" nak: required');
        TestBench.confirmDeepEqual(dataItem, {bar: ['eli', 'eniki']}, 'validate for "update" ok');

        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" ok');
        TestBench.confirmDeepEqual(dataItem, {foo: 5, bar: ['eli', 'eniki']}, 'validate for "update" ok');
    });

    TestBench.recordTrial('get flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'get'}),
            null, 'validate for "get" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', bar: ['eli', 'eniki']}, 'validate for "get" ok');
    });

    TestBench.recordTrial('query flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'query'}),
            null, 'validate for "query" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '5'}, 'validate for "query" ok');
    });
})();

(function(){
    let dataSchema, dataItem;

    TestBench.beginSuit('Data Processing: additionalProperties=true');

    dataSchema = {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                pattern: /^[abc]+$/,
                veto: {
                    update: true
                }
            },
            foo: {
                type: 'integer',
                veto: {
                    get: true
                }
            },
            bar: {
                type: 'array',
                items: {
                    type: 'string',
                    'enum': ['eniki', 'beniki', 'eli', 'vareniki']
                },
                veto: {
                    query: true
                }
            },
            defaulty: {
                type: 'date',
                'default': '2011-02-14'
            }
        },
        additionalProperties: true
    };

    TestBench.recordTrial('add flavor', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: UtilityKit.parseDateFromText('2011-02-14'), spam: true}, 'coerced for "add" ok');
        dataItem = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'validate for "add"');
    });

    TestBench.recordTrial('update flavor', function(){
        dataItem = {id: 'bac', foo1: '5', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" nak: required');
        TestBench.confirmDeepEqual(dataItem, {bar: ['eli', 'eniki'], foo1: '5'}, 'validate for "update" ok');
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" ok');
        TestBench.confirmDeepEqual(dataItem, {foo: 5, bar: ['eli', 'eniki']}, 'validate for "update" ok');
    });

    TestBench.recordTrial('get flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'get'}),
            null, 'validate for "get" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', bar: ['eli', 'eniki'], secret: true}, 'validate for "get" ok');
    });

    TestBench.recordTrial('query flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'query'}),
            null, 'validate for "query" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '5', secret: true}, 'validate for "query" ok');
    });
})();

(function(){
    let dataSchema, dataItem;

    TestBench.beginSuit('Data Processing: additionalProperties=schema');

    dataSchema = {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                pattern: /^[abc]+$/,
                veto: {
                    update: true
                }
            },
            foo: {
                type: 'integer',
                veto: {
                    get: true
                }
            },
            bar: {
                type: 'array',
                items: {
                    type: 'string',
                    'enum': ['eniki', 'beniki', 'eli', 'vareniki']
                },
                veto: {
                    query: true
                }
            },
            defaulty: {
                type: 'date',
                'default': '2011-12-31'
            }
        },
        additionalProperties: {
            type: 'number',
            maxDecimal: 2
        }
    };

    TestBench.recordTrial('add flavor', function(){
        dataItem = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
        TestBench.confirmEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            null, 'coerced and added ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: UtilityKit.parseDateFromText('2011-12-31'), spam: 1}, 'coerced for "add" ok');
        dataItem = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'add', performTypeConversion: true}),
            [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'validate for "add"');
    });

    TestBench.recordTrial('update flavor', function(){
        dataItem = {id: 'bac', foo1: '5.111', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            [{property: 'foo1', message: 'digits'}], 'validate for "update" nak: digits');
        dataItem = {id: 'bac', foo1: '5.11', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" ok');
        TestBench.confirmDeepEqual(dataItem, {bar: ['eli', 'eniki'], foo1: 5.11}, 'validate for "update" ok');
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processExistingFieldsOnly: true, processingFlavor: 'update', performTypeConversion: true}),
            null, 'validate for "update" ok');
        TestBench.confirmDeepEqual(dataItem, {foo: 5, bar: ['eli', 'eniki']}, 'validate for "update" ok');
    });

    TestBench.recordTrial('get flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'get'}),
            null, 'validate for "get" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', bar: ['eli', 'eniki'], secret: true}, 'validate for "get" ok');
    });

    TestBench.recordTrial('query flavor', function(){
        dataItem = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
        TestBench.confirmDeepEqual(UtilityKit.processObjectData(dataItem, dataSchema, {permitVetoRules: true, removeExtraFields: !dataSchema.additionalProperties, processingFlavor: 'query'}),
            null, 'validate for "query" ok');
        TestBench.confirmDeepEqual(dataItem, {id: 'bac', foo: '5', secret: true}, 'validate for "query" ok');
    });
})();

TestBench.finalReport();