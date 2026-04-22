(function () {
    let pathCounter = 0;

    const padNumber = (num) => String(num).padStart(2, '0');

    const standardDateFormats = {
        'date': {
            pattern: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
            decode: (val, d, m, y) => new Date(y, m - 1, d),
            encode: (dt) => `${padNumber(dt.getDate())}-${padNumber(dt.getMonth() + 1)}-${dt.getFullYear()}`
        },
        'dateEnd': {
            pattern: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
            decode: (val, d, m, y) => new Date(y, m - 1, d, 23, 59, 59, 999),
            encode: (dt) => `${padNumber(dt.getDate())}-${padNumber(dt.getMonth() + 1)}-${dt.getFullYear()}`
        }
    };

    const isoFormatDates = {
        'date': {
            pattern: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
            decode: (val, y, m, d) => new Date(y, m - 1, d),
            encode: (dt) => dt.toISOString().split('T')[0]
        },
        'dateEnd': {
            pattern: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
            decode: (val, y, m, d) => new Date(y, m - 1, d, 23, 59, 59, 999),
            encode: (dt) => dt.toISOString().split('T')[0]
        }
    };

    const typeRegistry = new Map();

    const initializeDefaultTypes = () => {
        typeRegistry.set('integer', {
            pattern: /\d+?/,
            decode: (val) => parseInt(val, 10)
        });
        typeRegistry.set('floating', {
            pattern: /\d+\.\d+?/,
            decode: (val) => parseFloat(val)
        });
        typeRegistry.set('wordString', {
            pattern: /\w+?/
        });
        typeRegistry.set('anyString', {
            pattern: /\w+?/ 
        });
        typeRegistry.set('dateTime', {
            pattern: /(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/,
            decode: (val, y, m, d, h, M, s, ms) => new Date(y, m - 1, d, h, M, s, ms),
            encode: (dt) => dt.toISOString()
        });
        typeRegistry.set('date', isoFormatDates.date);
        typeRegistry.set('dateEnd', isoFormatDates.dateEnd);
    };

    initializeDefaultTypes();

    const pathDispatcher = {
        allRegisteredPaths: [],
        activePathContext: null,

        setDateFormatting: function (useIso) {
            if (useIso === true) {
                typeRegistry.set('date', isoFormatDates.date);
                typeRegistry.set('dateEnd', isoFormatDates.dateEnd);
            } else {
                typeRegistry.set('date', standardDateFormats.date);
                typeRegistry.set('dateEnd', standardDateFormats.dateEnd);
            }
        },

        reInvokeCurrent: function (newArguments) {
            if (this.activePathContext) {
                const updatedArgs = Object.assign({}, this.activePathContext.arguments, newArguments);
                const targetUrl = this.activePathContext.config.buildPath(updatedArgs);
                if (targetUrl !== location.hash) {
                    location.hash = targetUrl;
                } else {
                    this.activePathContext.config.executeHandler(updatedArgs);
                }
            } else {
                location.href = location.href;
            }
        },

        registerPath: function (pattern, identifier, initialValues, handlerFunction) {
            if (typeof identifier === 'function') { handlerFunction = identifier; identifier = undefined; }
            if (typeof initialValues === 'function') { handlerFunction = initialValues; initialValues = undefined; }
            if (typeof identifier === 'object') { initialValues = identifier; identifier = undefined; }

            if (identifier === undefined) { identifier = `path${++pathCounter}`; }
            if (pattern[pattern.length - 1] !== '/') { pattern += '/'; }

            const parameterRegex = /\{\s*?([a-zA-Z0-9:\|\\*\?\.]*?)\s*?\}/g;
            let currentPattern = pattern;
            let regexString = '^' + pattern;
            const paramDefinitions = [];

            let match;
            while ((match = parameterRegex.exec(currentPattern)) !== null) {
                const paramSpec = match[1].split(':');
                const paramName = paramSpec[0];
                const paramType = paramSpec[1];

                paramDefinitions.push([paramName, paramType]);

                let constraint = '.*?'; 
                if (paramType && typeRegistry.has(paramType)) {
                    const typeDef = typeRegistry.get(paramType);
                    let typePatternStr = typeDef.pattern.toString();
                    typePatternStr = typePatternStr.replace(/^\/|\/$/g, ''); 
                    typePatternStr = typePatternStr.replace(/[gim]+$/, ''); 
                    typePatternStr = typePatternStr.replace(/[\(\)]/g, ''); 
                    constraint = typePatternStr;
                }
                
                let optionalModifier = '';
                if (initialValues && initialValues[paramName] !== undefined) {
                    optionalModifier = '?'; 
                }
                
                regexString = regexString.replace(match[0], `(${constraint})${optionalModifier}`);
                currentPattern = currentPattern.replace(match[0], ''); 
                parameterRegex.lastIndex = match.index; 
            }
            regexString = regexString.replace(/\/+$/, '/?'); 

            const pathMatcher = new RegExp(regexString, 'i');

            const generatePath = (parameters) => {
                let pathSegment = pattern;
                const effectiveParams = Object.assign({}, initialValues, parameters);

                for (const [pName, pType] of paramDefinitions) {
                    const processor = typeRegistry.get(pType);
                    let valueToInsert = effectiveParams[pName];

                    if (valueToInsert !== undefined) {
                        if (processor && typeof processor.encode === 'function') {
                            valueToInsert = processor.encode(valueToInsert);
                        }
                    } else if (initialValues && initialValues[pName] !== undefined) {
                        valueToInsert = initialValues[pName];
                        if (processor && typeof processor.encode === 'function') {
                            valueToInsert = processor.encode(valueToInsert);
                        }
                    } else {
                        valueToInsert = `{${pName}:${pType}}`;
                    }
                    pathSegment = pathSegment.replace(`{${pName}:${pType}}`, valueToInsert);
                }
                return `#${pathSegment}`;
            };
            
            const extractPathParameters = (hashMatch) => {
                const extracted = Object.assign({}, initialValues);
                paramDefinitions.forEach(([pName, pType], index) => {
                    const value = hashMatch[index + 1]; 
                    const processor = typeRegistry.get(pType);
                    
                    if (value !== undefined) {
                        if (processor && typeof processor.decode === 'function') {
                            const decodeArgs = [value];
                            if (processor.pattern) {
                                const subMatch = processor.pattern.exec(value);
                                if (subMatch) {
                                    for (let i = 1; i < subMatch.length; i++) {
                                        decodeArgs.push(subMatch[i]);
                                    }
                                }
                            }
                            extracted[pName] = processor.decode.apply(processor, decodeArgs);
                        } else {
                            extracted[pName] = value;
                        }
                    } else if (initialValues && initialValues[pName] !== undefined) {
                         extracted[pName] = initialValues[pName]; 
                    }
                });
                return extracted;
            };

            const routeConfig = {
                identifier: identifier,
                regexMatcher: pathMatcher,
                originalPattern: pattern,
                handler: handlerFunction,
                buildPath: generatePath,
                navigateTo: function (data) {
                    location.href = this.buildPath(data);
                },
                executeHandler: function (data) {
                    this.handler.apply(null, [Object.assign({}, initialValues, data)]); 
                },
                parameterDefinitions: paramDefinitions,
                defaultValues: initialValues,
                pathLength: pattern.length - (pattern.match(/\//g) || []).length 
            };

            this.allRegisteredPaths.push(routeConfig);
            return routeConfig;
        },

        addCustomType: function (typeName, typeDefinition) {
            typeRegistry.set(typeName, typeDefinition);
            this.createCollectionType(typeName); 
        },

        getPathConfig: function (id) {
            return this.allRegisteredPaths.find(rc => rc.identifier === id);
        },

        findBestMatch: function (currentHash) {
            let bestMatchConfig = null;
            let bestMatchResult = null; 
            this.allRegisteredPaths.forEach(rc => {
                const matchResult = rc.regexMatcher.exec(currentHash);
                if (matchResult) {
                    if (!bestMatchConfig || rc.pathLength > bestMatchConfig.pathLength) {
                        bestMatchConfig = rc;
                        bestMatchResult = matchResult;
                    }
                }
            });
            return bestMatchConfig ? { config: bestMatchConfig, matchResult: bestMatchResult } : null;
        },

        handlePathChange: function (hashValue) {
            const cleanHash = hashValue.startsWith('#') ? hashValue.substring(1) : hashValue;
            let matchedPath = this.findBestMatch(cleanHash);

            if (!matchedPath) { return; } 

            const params = matchedPath.config.extractPathParameters(matchedPath.matchResult);

            this.activePathContext = {
                config: matchedPath.config,
                arguments: params
            };
            matchedPath.config.executeHandler(params);
        },

        createCollectionType: function (baseTypeName) {
            const baseType = typeRegistry.get(baseTypeName);
            if (!baseType || typeRegistry.has(`${baseTypeName}Array`)) { return; }

            const arrayPatternString = `(?:${baseType.pattern.toString().replace(/^\/|\/$/g, '').replace(/[gim]+$/, '')}(?:\\/|$))*`;
            
            typeRegistry.set(`${baseTypeName}Array`, {
                baseType: baseType,
                pattern: new RegExp(arrayPatternString, 'i'),
                decode: function (fullValue) {
                    const items = fullValue.split('/').filter(Boolean); 
                    return items.map(item => {
                        const subMatch = this.baseType.pattern.exec(item);
                        const decodeArgs = [item];
                        if (subMatch) {
                            for (let i = 1; i < subMatch.length; i++) {
                                decodeArgs.push(subMatch[i]);
                            }
                        }
                        return this.baseType.decode.apply(this.baseType, decodeArgs);
                    });
                },
                encode: function (valuesArray) {
                    return valuesArray.map(item => {
                        return this.baseType.encode ? this.baseType.encode(item) : String(item);
                    }).join('/');
                }
            });
        }
    };

    Array.from(typeRegistry.keys()).forEach(key => {
        pathDispatcher.createCollectionType(key);
    });

    window.addEventListener('hashchange', () => {
        pathDispatcher.handlePathChange(location.hash);
    });

    document.addEventListener('DOMContentLoaded', () => {
        let currentHash = location.hash;
        if (currentHash.length > 0) {
            if (currentHash[currentHash.length - 1] !== '/') {
                currentHash += '/';
            }
            pathDispatcher.handlePathChange(currentHash);
        }
    });

    window.AppRouter = pathDispatcher;

})();