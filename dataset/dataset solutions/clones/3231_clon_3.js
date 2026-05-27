const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const __generator = (this && this.__generator) || function (thisArg, body) {
    let _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
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
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

const __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

const moduleDefinitions = [];

const moduleCache = {};

function requireModule(moduleId) {
    if (moduleCache[moduleId]) {
        return moduleCache[moduleId].exports;
    }

    const currentModule = moduleCache[moduleId] = {
        id: moduleId,
        loaded: false,
        exports: {}
    };

    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, requireModule);

    currentModule.loaded = true;
    return currentModule.exports;
}

requireModule.defineExportProperty = function(exportsObject, propertyName, getterFunction) {
    if (!Object.prototype.hasOwnProperty.call(exportsObject, propertyName)) {
        Object.defineProperty(exportsObject, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    }
};

requireModule.markAsEsModule = function(exportsObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exportsObject, "__esModule", { value: true });
};

requireModule.interopRequireDefault = function(moduleValue, mode) {
    if (mode & 1) moduleValue = requireModule(moduleValue);
    if (mode & 8) return moduleValue;
    if ((mode & 4) && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) return moduleValue;
    const defaultExportObject = Object.create(null);
    requireModule.markAsEsModule(defaultExportObject);
    Object.defineProperty(defaultExportObject, "default", { enumerable: true, value: moduleValue });
    if (mode & 2 && typeof moduleValue !== "string") {
        for (const key in moduleValue) {
            requireModule.defineExportProperty(defaultExportObject, key, ((k) => moduleValue[k]).bind(null, key));
        }
    }
    return defaultExportObject;
};

requireModule.getDefaultExport = function(moduleValue) {
    const getter = moduleValue && moduleValue.__esModule ?
        () => moduleValue.default :
        () => moduleValue;
    requireModule.defineExportProperty(getter, "a", getter);
    return getter;
};

requireModule.hasOwn = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
};

requireModule.publicPath = "";

moduleDefinitions[0] = function(module, exports, requireModule) {
    "use strict";
    const selfContext = this;
    exports.__esModule = true;

    const fileSystemModule = __importDefault(requireModule(1));

    function* generateFoolTokens(inputString) {
        const rawTokens = inputString.split(/\s+/);
        const filteredTokens = rawTokens.filter(token => token.length > 0);
        let tokenIndex = 0;
        while (tokenIndex < filteredTokens.length) {
            yield filteredTokens[tokenIndex];
            tokenIndex++;
        }
    }
    exports.getFoolIterator = generateFoolTokens;

    exports.readInput = function() {
        const stdinPath = "/dev/stdin";
        return new Promise(function(resolve, reject) {
            fileSystemModule.default.readFile(stdinPath, "utf8", function(error, data) {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    };

    exports.getFoolNextInt = function() {
        return __awaiter(selfContext, void 0, void 0, function* () {
            const inputData = yield exports.readInput();
            const tokenIterator = generateFoolTokens(inputData);
            return () => parseInt(tokenIterator.next().value);
        });
    };

    function* createChottoMashinaTokenizer(inputString) {
        if (!inputString || inputString.length === 0) {
            return;
        }
        let currentTokenStart = -1;
        let charIndex = 0;
        const inputLength = inputString.length;

        while (charIndex <= inputLength) {
            const currentChar = inputString[charIndex];
            const isSeparator = currentChar === " " || currentChar === "\n" || charIndex === inputLength;

            if (isSeparator) {
                if (currentTokenStart !== -1) {
                    const token = inputString.substring(currentTokenStart, charIndex);
                    currentTokenStart = -1;
                    yield token;
                }
            } else {
                if (currentTokenStart === -1) {
                    currentTokenStart = charIndex;
                }
            }
            charIndex++;
        }
    }

    exports.getChottoMashinaNext = function() {
        return __awaiter(selfContext, void 0, void 0, function* () {
            const fullInputText = yield exports.readInput();
            const tokenizer = createChottoMashinaTokenizer(fullInputText);
            return () => tokenizer.next().value;
        });
    };

    exports.getChottoMashinaNextInt = function() {
        return __awaiter(selfContext, void 0, void 0, function* () {
            const getNextToken = yield exports.getChottoMashinaNext();
            return () => parseInt(getNextToken());
        });
    };
};

moduleDefinitions[1] = function(module, exports, requireModule) {
    module.exports = require("fs");
};

moduleDefinitions[2] = function(module, exports, requireModule) {};
moduleDefinitions[3] = function(module, exports, requireModule) {};


moduleDefinitions[4] = function(module, exports, requireModule) {
    "use strict";
    const selfContext = this;
    const inputUtils = requireModule(0);
    const BigBitModule = requireModule(5);

    __awaiter(selfContext, void 0, void 0, function* () {
        const getNextInt = yield inputUtils.getChottoMashinaNextInt();
        const initialValue = getNextInt();
        const arraySize = getNextInt();

        const initialBigBit = new BigBitModule.BigBit(initialValue);

        const bigBitInstances = new Array(arraySize);
        for (let i = 0; i < arraySize; i++) {
            bigBitInstances[i] = new BigBitModule.BigBit(getNextInt());
        }
    });
};

moduleDefinitions[5] = function(module, exports, requireModule) {
    "use strict";
    exports.__esModule = true;

    const BigBit = (function() {
        function BigBit(inputValue) {
            const instanceRef = this;

            this.or = function(otherBigBit) {
                return new BigBit(BigBit.performBitwiseOperation(otherBigBit, instanceRef, (bitA, bitB) => {
                    return ("1" === bitA || "1" === bitB) ? "1" : "0";
                }));
            };

            this.and = function(otherBigBit) {
                return new BigBit(BigBit.performBitwiseOperation(otherBigBit, instanceRef, (bitA, bitB) => {
                    return ("1" === bitA && "1" === bitB) ? "1" : "0";
                }));
            };

            this.xor = function(otherBigBit) {
                return new BigBit(BigBit.performBitwiseOperation(otherBigBit, instanceRef, (bitA, bitB) => {
                    return ("1" === bitA && "0" === bitB) || ("0" === bitA && "1" === bitB) ? "1" : "0";
                }));
            };

            this.getBit = function(index) {
                return instanceRef.bit[index];
            };

            this.getHighestZeroIndex = function() {
                return instanceRef.isZero() ? -1 : instanceRef.bit.length - 1;
            };

            this.isZero = function() {
                return instanceRef.bit.length === 1 && "0" === instanceRef.bit[0];
            };

            this.toString = function() {
                return instanceRef.bit.slice(0).reverse().join("");
            };

            this.toNumber = function() {
                let decimalValue = 0;
                for (let bitIndex = 0; bitIndex < instanceRef.bit.length; bitIndex++) {
                    if ("1" === instanceRef.bit[bitIndex]) {
                        decimalValue += (1 << bitIndex);
                    }
                }
                return decimalValue;
            };

            if (typeof inputValue === "number") {
                this.bit = BigBit.convertStringToBitArray(inputValue.toString(2));
            } else if (typeof inputValue === "string") {
                let trimmedBinaryString = inputValue.replace(/^0+/, "");
                if (trimmedBinaryString.length === 0) {
                    trimmedBinaryString = "0";
                }
                this.bit = BigBit.convertStringToBitArray(trimmedBinaryString);
            } else if (Array.isArray(inputValue)) {
                const lastOneIndex = inputValue.lastIndexOf("1");
                this.bit = lastOneIndex < 0 ? ["0"] : inputValue.slice(0, lastOneIndex + 1);
            }
        }

        BigBit.isValidBitChar = function(char) {
            return "0" === char || "1" === char;
        };

        BigBit.convertStringToBitArray = function(binaryString) {
            if (!binaryString || binaryString.length === 0) {
                return ["0"];
            }
            const bitCharArr = new Array(binaryString.length);
            for (let charIndex = 0; charIndex < binaryString.length; charIndex++) {
                const currentChar = binaryString[charIndex];
                if (!BigBit.isValidBitChar(currentChar)) {
                    throw Error(binaryString + " is not a valid binary string");
                }
                bitCharArr[charIndex] = currentChar;
            }
            bitCharArr.reverse();
            return bitCharArr;
        };

        BigBit.performBitwiseOperation = function(otherBitInstance, currentBitInstance, logicFunction) {
            const maxLength = Math.max(otherBitInstance.bit.length, currentBitInstance.bit.length);
            const resultArray = new Array(maxLength);
            for (let bitPosition = 0; bitPosition < maxLength; bitPosition++) {
                const bitA = bitPosition < otherBitInstance.bit.length ? otherBitInstance.bit[bitPosition] : "0";
                const bitB = bitPosition < currentBitInstance.bit.length ? currentBitInstance.bit[bitPosition] : "0";
                const resultBit = logicFunction(bitA, bitB);
                const targetIndex = maxLength - bitPosition - 1;
                resultArray[targetIndex] = resultBit;
            }
            return resultArray;
        };

        return BigBit;
    })();
    exports.BigBit = BigBit;
};

requireModule(4);
