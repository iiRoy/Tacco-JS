const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
                    result[key] = deepMerge(result[key], source[key]);
                } else {
                    result[key] = { ...source[key] };
                }
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
};

const alterStringCasing = (inputString, casingStyle) => {
    if (casingStyle === '*') return inputString;
    if (!inputString) return '';

    switch (casingStyle) {
        case 'camelCase':
        case 'lowerCamelCase':
            return inputString.charAt(0).toLowerCase() + inputString.slice(1);
        case 'lowerCase':
            return inputString.toLowerCase();
        case 'screamingSnakeCase':
            return inputString.replace(/-/g, '_').replace(/([a-z\d])([A-Z])/g, '$1_$2').toUpperCase();
        case 'snakeCase':
            return inputString.replace(/-/g, '_').replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase();
        case 'spinalCase':
            return inputString.replace(/_/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
        case 'trainCase':
            let tempTrain = inputString.replace(/_/g, '-');
            tempTrain = tempTrain.replace(/([a-z\d])([A-Z])/g, '$1-$2');
            return tempTrain.charAt(0).toUpperCase() + tempTrain.slice(1);
        case 'upperCamelCase':
            return inputString.charAt(0).toUpperCase() + inputString.slice(1);
        case 'upperCase':
            return inputString.toUpperCase();
        default:
            throw new Error(`Unrecognized casing style: '${casingStyle}'`);
    }
};

const applyCasingTransforms = (initialValue, styleFilters) => {
    let currentVal = initialValue;
    for (const style of styleFilters) {
        currentVal = alterStringCasing(currentVal, style);
    }
    return currentVal;
};

const generateValidCategories = (currentPrefix = '') => {
    let effectivePrefix = currentPrefix;
    if (effectivePrefix !== '' && effectivePrefix.slice(-1) !== '.') {
        effectivePrefix += '.';
    }
    const baseCategories = ['Animation', 'Application', 'Configuration', 'Constant', 'Controller', 'Directive', 'Factory', 'Filter', 'Provider', 'Run', 'Service', 'Value'];
    return baseCategories.map(cat => `${effectivePrefix}${cat}`);
};

const configureProcessingSettings = (userOptions) => {
    const defaultStyleRules = {
        animation: { style: 'spinalCase', leading: '.' },
        constant: { style: 'screamingSnakeCase' },
        controller: { style: 'camelCase', trailing: 'Controller' },
        directive: { style: 'camelCase' },
        factory: { style: 'upperCamelCase' },
        filter: { style: 'camelCase' },
        provider: { style: 'camelCase', trailing: 'Provider' },
        service: { style: 'camelCase', trailing: 'Service' },
        value: { style: 'camelCase' }
    };

    for (const key in defaultStyleRules) {
        if (Object.prototype.hasOwnProperty.call(defaultStyleRules, key)) {
            if (!defaultStyleRules[key].leading) defaultStyleRules[key].leading = '';
            if (!defaultStyleRules[key].trailing) defaultStyleRules[key].trailing = '';
        }
    }

    const mergedStyleRules = deepMerge(defaultStyleRules, userOptions);

    const defaultBuildPatterns = {
        mainAppIdentifier: 'application',
        outputFormats: {
            animation: ".{{category|lower}}('" + mergedStyleRules.animation.leading + "{{identifier|" + mergedStyleRules.animation.style + "}}" + mergedStyleRules.animation.trailing + "', [{{parameters}}])",
            application: "angular.module('{{appIdentifier}}', new {{identifier}}())",
            configuration: ".{{category|lower}}([{{parameters}}])",
            constant: ".{{category|lower}}('" + mergedStyleRules.constant.leading + "{{identifier|" + mergedStyleRules.constant.style + "}}" + mergedStyleRules.constant.trailing + "', {{identifier}}())",
            controller: ".{{category|lower}}('" + mergedStyleRules.controller.leading + "{{identifier|" + mergedStyleRules.controller.style + "}}" + mergedStyleRules.controller.trailing + "', [{{parameters}}])",
            directive: ".{{category|lower}}('" + mergedStyleRules.directive.leading + "{{identifier|" + mergedStyleRules.directive.style + "}}" + mergedStyleRules.directive.trailing + "', [{{parameters}}])",
            factory: ".{{category|lower}}('" + mergedStyleRules.factory.leading + "{{identifier|" + mergedStyleRules.factory.style + "}}" + mergedStyleRules.factory.trailing + "', [{{parameters}}])",
            filter: ".{{category|lower}}('" + mergedStyleRules.filter.leading + "{{identifier|" + mergedStyleRules.filter.style + "}}" + mergedStyleRules.filter.trailing + "', [{{parameters}}])",
            provider: ".{{category|lower}}('" + mergedStyleRules.provider.leading + "{{identifier|" + mergedStyleRules.provider.style + "}}" + mergedStyleRules.provider.trailing + "', [{{parameters}}])",
            run: ".{{category|lower}}([{{parameters}}])",
            service: ".{{category|lower}}('" + mergedStyleRules.service.leading + "{{identifier|" + mergedStyleRules.service.style + "}}" + mergedStyleRules.service.trailing + "', [{{parameters}}])",
            value: ".{{category|lower}}('" + mergedStyleRules.value.leading + "{{identifier|" + mergedStyleRules.value.style + "}}" + mergedStyleRules.value.trailing + "', {{identifier}}())"
        },
        categoryPrefix: ''
    };
    return deepMerge(defaultBuildPatterns, userOptions);
};

const renderFragmentDefinition = (structureItem, processingSettings) => {
    const categoryParts = structureItem.category.split('.');
    const baseCategory = categoryParts[categoryParts.length - 1];
    const formattingTemplate = processingSettings.outputFormats[baseCategory.toLowerCase()];

    if (!formattingTemplate) {
        throw new Error(`No formatting template found for category: ${baseCategory}`);
    }

    const templateSegments = formattingTemplate.split(/{{(.*?)}}/g);

    const assembledOutput = templateSegments.map((segment, index) => {
        if (index % 2 === 0) {
            return segment;
        } else {
            const filters = segment.split('|');
            const componentKey = filters[0];
            let valueToFormat;

            if (componentKey === 'parameters') {
                valueToFormat = structureItem.parameters ? structureItem.parameters.join(', ') : '';
            } else if (componentKey === 'category') {
                valueToFormat = baseCategory;
            } else if (structureItem.hasOwnProperty(componentKey)) {
                valueToFormat = structureItem[componentKey];
            } else {
                return componentKey;
            }

            if (filters.length > 1) {
                const casingFilters = filters.slice(1);
                return applyCasingTransforms(valueToFormat, casingFilters);
            }
            return valueToFormat;
        }
    }).join('');

    return assembledOutput;
};

const parseCoffeeStructures = (sourceCode, recognizedCategories) => {
    const coffeeScript = require('coffee-script');
    const vm = require('vm');

    const declarationRegistry = [];
    const categorySet = new Set(recognizedCategories);

    const isRecognizedCategory = (categoryName) => categorySet.has(categoryName);

    class AstWalker {
        constructor() {
            this.currentStructure = null;
        }

        visit(node) {
            if (!node) return;

            if (node.variable && node.parent && node.body && node.body.classBody) {
                const base = node.variable.base;
                const identifierName = base.value;
                const identifierLocation = base.locationData;
                const parentNode = node.parent;

                let categoryName;
                let appNameValue = null;
                const positionData = {
                    row: identifierLocation.last_line,
                    start: identifierLocation.last_column
                };

                if (parentNode && parentNode.base) {
                    categoryName = parentNode.base.value;
                    positionData.end = parentNode.base.locationData.last_column;
                } else if (parentNode && parentNode.variable && parentNode.variable.base) {
                    categoryName = parentNode.variable.base.value;
                    positionData.end = parentNode.locationData.last_column;
                    const appNameNode = parentNode.args[0];
                    if (appNameNode && appNameNode.base) {
                        try {
                            appNameValue = vm.runInNewContext(`(${appNameNode.base.value})`, {});
                            if (typeof appNameValue !== 'string') {
                                throw new Error('App name expression did not evaluate to a string.');
                            }
                        } catch (e) {
                            console.warn(`Warning: Could not safely evaluate appIdentifier expression '${appNameNode.base.value}'. Error: ${e.message}`);
                            appNameValue = null;
                        }
                    }
                } else {
                    return;
                }

                const properties = parentNode.properties || [];
                if (properties.length > 0) {
                    const namespaces = properties.map(prop => prop.name.value);
                    categoryName += '.' + namespaces.join('.');
                    positionData.end = properties[properties.length - 1].locationData.last_column;
                }

                if (isRecognizedCategory(categoryName)) {
                    this.currentStructure = {
                        identifier: identifierName,
                        category: categoryName,
                        appIdentifier: appNameValue,
                        parameters: [],
                        position: positionData
                    };
                    declarationRegistry.push(this.currentStructure);
                    this.visitExpressions(node.body.expressions);
                }
                return;
            }

            if (node.value && node.variable && node.variable.base && node.variable.base.value === 'constructor') {
                if (this.currentStructure) {
                    const params = node.value.params;
                    const collectedParams = [];
                    params.forEach(param => {
                        if (param.name && param.name.this) {
                            param.name.properties.forEach(prop => {
                                collectedParams.push(prop.name.value);
                            });
                        } else if (param.name) {
                            collectedParams.push(param.name.value);
                        }
                    });
                    this.currentStructure.parameters = collectedParams;
                }
                this.visitExpressions(node.value.body.expressions);
                return;
            }

            if (node.args && node.args[0] && node.args[0].body && node.args[0].body.expressions) {
                this.visitExpressions(node.args[0].body.expressions);
                return;
            }

            if (node.base && node.base.properties) {
                this.visitExpressions(node.base.properties);
                return;
            }

            for (const key in node) {
                if (Object.prototype.hasOwnProperty.call(node, key)) {
                    const value = node[key];
                    if (Array.isArray(value)) {
                        this.visitExpressions(value);
                    } else if (typeof value === 'object' && value !== null && value.constructor.name === 'Node') {
                        this.visit(value);
                    }
                }
            }
        }

        visitExpressions(expressions) {
            if (expressions && Array.isArray(expressions)) {
                for (const expr of expressions) {
                    this.visit(expr);
                }
            }
        }
    }

    const ast = coffeeScript.nodes(sourceCode).expressions;
    const walker = new AstWalker();
    walker.visitExpressions(ast);

    declarationRegistry.forEach(item => {
        if (item.parameters && item.parameters.length > 0) {
            item.parameters = item.parameters.map(p => `'${p}'`);
        } else {
            item.parameters = [];
        }
        item.parameters.push(item.identifier);
    });

    return declarationRegistry;
};

const removeProcessedSections = (originalText, declarationRegistry) => {
    let currentLines = originalText.split('\n');
    const sortedDeclarations = [...declarationRegistry].sort((a, b) => {
        if (a.position.row !== b.position.row) {
            return b.position.row - a.position.row;
        }
        return b.position.start - a.position.start;
    });

    for (const item of sortedDeclarations) {
        const { row, start, end } = item.position;
        if (row < currentLines.length) {
            const lineContent = currentLines[row];
            if (lineContent) {
                const before = lineContent.substring(0, start + 1);
                const after = lineContent.substring(end + 1);
                currentLines[row] = before + after;
            }
        }
    }
    return currentLines;
};

const buildAngularModuleDefinitions = (declarationRegistry, processingSettings) => {
    const applicationGroups = new Map();

    for (const item of declarationRegistry) {
        const effectiveAppIdentifier = item.appIdentifier || processingSettings.mainAppIdentifier;
        if (!applicationGroups.has(effectiveAppIdentifier)) {
            applicationGroups.set(effectiveAppIdentifier, { appInstantiations: [], componentDefinitions: [] });
        }
        const appGroup = applicationGroups.get(effectiveAppIdentifier);

        if (item.category.endsWith('App') || item.category.endsWith('Application')) {
            appGroup.appInstantiations.push(renderFragmentDefinition(item, processingSettings));
        } else {
            appGroup.componentDefinitions.push(renderFragmentDefinition(item, processingSettings));
        }
    }

    const outputSegments = [];

    for (const [appKey, groupData] of applicationGroups.entries()) {
        if (outputSegments.length > 0) {
            outputSegments.push('');
        }

        if (groupData.appInstantiations.length > 0) {
            groupData.appInstantiations.forEach(instantiation => outputSegments.push(instantiation));
        } else {
            outputSegments.push(`angular.module('${appKey}')`);
        }

        if (groupData.componentDefinitions.length > 0) {
            groupData.componentDefinitions.forEach(definition => outputSegments.push(definition));
        }
    }

    return outputSegments;
};

module.exports = (sourceCode, configParams) => {
    const processingSettings = configureProcessingSettings(configParams);
    const validCategories = generateValidCategories(processingSettings.categoryPrefix);

    const parsedStructures = parseCoffeeStructures(sourceCode, validCategories);

    let cleanedSourceLines = removeProcessedSections(sourceCode, parsedStructures);
    let finalModuleDeclarations = buildAngularModuleDefinitions(parsedStructures, processingSettings);

    let finalAssembly = cleanedSourceLines.join('\n');

    if (finalModuleDeclarations.length > 0) {
        finalAssembly += '\n\n' + finalModuleDeclarations.join('\n');
    }

    return finalAssembly;
};