!function(moduleDefinitions) {
    // Cache for loaded modules
    var moduleCache = {};

    // Custom module loader function
    function moduleLoader(requestedModuleId) {
        // If module is already in cache, return its exports
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        // Create a new module object and add it to the cache
        var moduleObject = moduleCache[requestedModuleId] = {
            i: requestedModuleId, // Module ID
            l: false,             // Loaded flag
            exports: {}           // Exports object
        };

        // Execute the module function with its exports and the loader
        moduleDefinitions[requestedModuleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);

        // Mark module as loaded
        moduleObject.l = true;

        // Return module exports
        return moduleObject.exports;
    }

    // Store module definitions on the loader
    moduleLoader.modules = moduleDefinitions;

    // Store module cache on the loader
    moduleLoader.cache = moduleCache;

    // Define a getter property on exports
    moduleLoader.define = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Mark an object as an ES module
    moduleLoader.register = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    // Create a fake namespace object for interop
    moduleLoader.interopRequireDefault = function(moduleValue, flags) {
        // If flag 1 is set, moduleValue is already processed by moduleLoader
        if (1 & flags) {
            moduleValue = moduleLoader(moduleValue);
        }
        // If flag 8 is set, return moduleValue directly
        if (8 & flags) {
            return moduleValue;
        }
        // If flag 4 is set and it's an object and an ES module, return it directly
        if (4 & flags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new namespace object
        var namespaceObject = Object.create(null);
        moduleLoader.register(namespaceObject); // Mark as ES module
        Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleValue }); // Set default export

        // If flag 2 is set and it's not a string, copy all properties
        if (2 & flags && typeof moduleValue !== "string") {
            for (var propertyKey in moduleValue) {
                moduleLoader.define(namespaceObject, propertyKey, (function(key) {
                    return moduleValue[key];
                }).bind(null, propertyKey));
            }
        }
        return namespaceObject;
    };

    // Create a getter function for the default export
    moduleLoader.createDefaultExportGetter = function(moduleValue) {
        var getter = moduleValue && moduleValue.__esModule ?
            function() { return moduleValue.default; } :
            function() { return moduleValue; };
        moduleLoader.define(getter, "a", getter); // Define 'a' property as the getter itself
        return getter;
    };

    // Check if an object has a property
    moduleLoader.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Set public path (empty in this case)
    moduleLoader.publicPath = "";

    // Load the entry point module (module ID 13)
    moduleLoader(moduleLoader.startupModuleId = 13);
}({
    // Module 0: Input utility functions
    0: function(currentModule, moduleExports, localRequire) {
        "use strict";
        // Helper for async/await transpilation
        var asyncAwaiterHelper = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };

        // Helper for generator function transpilation
        var generatorRuntimeHelper = (this && this.__generator) || function(thisArg, body) {
            var _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
            return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
            function verb(n) { return function(v) { return step([n, v]); }; }
            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0: case 1: t = op; break;
                        case 4: _.label++; return { value: op[1], done: false };
                        case 5: _.label++; y = op[1]; op = [0]; continue;
                        case 7: op = _.ops.pop(); _.trys.pop(); continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
                if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
            }
        };

        // Helper for default import handling
        var importDefaultHelper = (this && this.__importDefault) || function(moduleObject) {
            return (moduleObject && moduleObject.__esModule) ? moduleObject : { default: moduleObject };
        };

        // Store the current module's context
        var moduleContext = this;

        // Mark module as an ES module
        moduleExports.__esModule = true;

        // Import the 'fs' (file system) module
        var fileSystemAccess = importDefaultHelper(localRequire(1));

        /**
         * Creates an async iterator that yields words from an input string.
         * Words are separated by one or more whitespace characters.
         * @param {string} inputStringContent - The string to tokenize.
         * @returns {AsyncGenerator<string>} An async generator yielding words.
         */
        function createWordSplitIterator(inputStringContent) {
            var splitWordsArray, wordIndex;
            return generatorRuntimeHelper(this, function(generatorState) {
                switch (generatorState.label) {
                    case 0:
                        // Split the input string by whitespace and filter out empty strings
                        splitWordsArray = inputStringContent.split(/\s+/).filter(function(wordItem) { return wordItem.length > 0; });
                        wordIndex = 0;
                        generatorState.label = 1;
                    case 1:
                        // Loop through the words
                        return (wordIndex < splitWordsArray.length) ? [4, splitWordsArray[wordIndex]] : [3, 4];
                    case 2:
                        generatorState.sent(); // Consume the yielded value (not used here)
                        generatorState.label = 3;
                    case 3:
                        wordIndex++;
                        return [3, 1]; // Continue loop
                    case 4:
                        return [2]; // Generator finished
                }
            });
        }

        /**
         * Reads content from standard input asynchronously.
         * @returns {Promise<string>} A promise that resolves with the input content or rejects with an error.
         */
        moduleExports.readStandardInput = function() {
            return new Promise(function(resolveInput, rejectInput) {
                fileSystemAccess.default.readFile("/dev/stdin", "utf8", function(readError, readData) {
                    if (readError) {
                        rejectInput(readError);
                    } else {
                        resolveInput(readData);
                    }
                });
            });
        };

        // Export the word split iterator function
        moduleExports.createWordSplitIterator = createWordSplitIterator;

        /**
         * Asynchronously gets a function that returns the next integer from standard input,
         * assuming input is space-separated integers.
         * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
         */
        moduleExports.getNextIntegerFromWords = function() {
            return asyncAwaiterHelper(moduleContext, void 0, void 0, function() {
                var fullInputContent, wordIteratorInstance;
                return generatorRuntimeHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, moduleExports.readStandardInput()]; // Await input
                        case 1:
                            fullInputContent = generatorState.sent();
                            wordIteratorInstance = createWordSplitIterator(fullInputContent);
                            // Return a function that parses the next word as an integer
                            return [2, function() { return parseInt(wordIteratorInstance.next().value); }];
                    }
                });
            });
        };

        /**
         * Asynchronously gets a function that returns the next whitespace-separated token from standard input.
         * This implementation handles tokens that might contain spaces if they are part of a larger "word".
         * @returns {Promise<function(): string>} A promise resolving to a function that returns the next token.
         */
        moduleExports.getWhitespaceSeparatedToken = function() {
            return asyncAwaiterHelper(moduleContext, void 0, void 0, function() {
                var fullInputContent, tokenExtractorGenerator;
                return generatorRuntimeHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, moduleExports.readStandardInput()]; // Await input
                        case 1:
                            fullInputContent = generatorState.sent();
                            // Define an inner generator to extract tokens
                            tokenExtractorGenerator = function() {
                                var tokenStartPos, currentScanPos, extractedSegment;
                                return generatorRuntimeHelper(this, function(genState) {
                                    switch (genState.label) {
                                        case 0:
                                            tokenStartPos = -1;
                                            currentScanPos = 0;
                                            genState.label = 1;
                                        case 1:
                                            // Loop through the input string
                                            return (currentScanPos <= fullInputContent.length) ?
                                                // If current char is space/newline or end of string
                                                (fullInputContent[currentScanPos] !== " " && fullInputContent[currentScanPos] !== "\n" && currentScanPos !== fullInputContent.length) ?
                                                    [3, 5] : // Not a separator, continue building token
                                                    (tokenStartPos !== -1) ?
                                                        [3, 2] : // Separator found, and a token was being built
                                                        [3, 6] : // Separator found, but no token was being built
                                                [3, 7]; // End of string
                                        case 2:
                                            // Extract the token
                                            extractedSegment = fullInputContent.substring(tokenStartPos, currentScanPos);
                                            tokenStartPos = -1; // Reset start position
                                            return [4, extractedSegment]; // Yield the token
                                        case 3:
                                            genState.sent(); // Consume yielded value
                                            genState.label = 4;
                                        case 4:
                                            return [3, 6]; // Continue scan
                                        case 5:
                                            // If not currently building a token, mark start position
                                            if (tokenStartPos === -1) {
                                                tokenStartPos = currentScanPos;
                                            }
                                            genState.label = 6;
                                        case 6:
                                            currentScanPos++;
                                            return [3, 1]; // Continue loop
                                        case 7:
                                            return [2]; // Generator finished
                                    }
                                });
                            }(); // Immediately invoke to get the generator object
                            // Return a function that gets the next token from the generator
                            return [2, function() { return tokenExtractorGenerator.next().value; }];
                    }
                });
            });
        };

        /**
         * Asynchronously gets a function that returns the next whitespace-separated integer from standard input.
         * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
         */
        moduleExports.getWhitespaceSeparatedInteger = function() {
            return asyncAwaiterHelper(moduleContext, void 0, void 0, function() {
                var tokenGetterFunction;
                return generatorRuntimeHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, moduleExports.getWhitespaceSeparatedToken()]; // Await token getter
                        case 1:
                            tokenGetterFunction = generatorState.sent();
                            // Return a function that gets the next token and parses it as an integer
                            return [2, function() { return parseInt(tokenGetterFunction()); }];
                    }
                });
            });
        };
    },

    // Module 1: Node.js 'fs' module
    1: function(mod, exp) {
        mod.exports = require("fs");
    },

    // Module 13: Main application logic (entry point)
    13: function(mainModule, mainExports, mainRequire) {
        "use strict";
        // Helper for async/await transpilation (main module specific)
        var mainAsyncAwaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };

        // Helper for generator function transpilation (main module specific)
        var mainGeneratorRuntime = (this && this.__generator) || function(thisArg, body) {
            var _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
            return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
            function verb(n) { return function(v) { return step([n, v]); }; }
            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0: case 1: t = op; break;
                        case 4: _.label++; return { value: op[1], done: false };
                        case 5: _.label++; y = op[1]; op = [0]; continue;
                        case 7: op = _.ops.pop(); _.trys.pop(); continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
                if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
            }
        };

        // Store the current module's context
        var mainModuleContext = this;

        // Mark module as an ES module
        mainExports.__esModule = true;

        // Import input utility functions from module 0
        var inputHelpers = mainRequire(0);

        // Main asynchronous execution block
        mainAsyncAwaiter(mainModuleContext, void 0, void 0, function() {
            var tokenReaderFunc, currentTokenValue, tokenFrequencyMap, iterationCounter, currentFrequency, moduloAddition, finalProductResult;
            return mainGeneratorRuntime(this, function(generatorState) {
                switch (generatorState.label) {
                    case 0:
                        // Get the function to read the next whitespace-separated token
                        return [4, inputHelpers.getWhitespaceSeparatedToken()];
                    case 1:
                        tokenReaderFunc = generatorState.sent(); // This is the function that returns the next token
                        tokenReaderFunc(); // Call it once to initialize or consume the first empty token if any
                        currentTokenValue = tokenReaderFunc(); // Get the actual first token
                        tokenFrequencyMap = {}; // Initialize a map to store token frequencies

                        // Loop through the characters of the first token to count frequencies
                        for (iterationCounter = 0; iterationCounter < currentTokenValue.length; iterationCounter++) {
                            currentFrequency = tokenFrequencyMap[currentTokenValue[iterationCounter]] || 0;
                            tokenFrequencyMap[currentTokenValue[iterationCounter]] = currentFrequency + 1;
                        }

                        // Define a helper function for modulo addition
                        moduloAddition = function(value) {
                            return (value + 1000000007) % 1000000007;
                        };

                        finalProductResult = 1; // Initialize product for calculation

                        // Iterate over the keys (characters) in the frequency map
                        Object.keys(tokenFrequencyMap).forEach(function(mapEntryKey) {
                            // Calculate (1 + frequency) and multiply into the result, applying modulo
                            finalProductResult = moduloAddition(finalProductResult * (1 + tokenFrequencyMap[mapEntryKey]));
                        });

                        // Print the final result (modulo - 1)
                        console.log(moduloAddition(finalProductResult - 1));
                        return [2]; // End of main execution
                }
            });
        });
    }
});
