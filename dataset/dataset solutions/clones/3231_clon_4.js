!function(moduleDefinitions){
    var moduleCache = {};

    function customRequire(moduleId){
        if(moduleCache[moduleId]) return moduleCache[moduleId].exports;

        var module = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(module.exports, module, module.exports, customRequire);
        module.loaded = true;
        return module.exports;
    }

    customRequire.modules = moduleDefinitions;
    customRequire.cache = moduleCache;
    customRequire.define = function(exportsObj, name, getter){
        if(!customRequire.hasOwn(exportsObj, name)){
            Object.defineProperty(exportsObj, name, { enumerable: true, get: getter });
        }
    };
    customRequire.register = function(exportsObj){
        if(typeof Symbol !== "undefined" && Symbol.toStringTag){
            Object.defineProperty(exportsObj, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exportsObj, "__esModule", { value: true });
    };
    customRequire.interop = function(module, type){
        if(1 & type && (module = customRequire(module)), 8 & type) return module;
        if(4 & type && typeof module === "object" && module && module.__esModule) return module;
        var result = Object.create(null);
        customRequire.register(result);
        Object.defineProperty(result, "default", { enumerable: true, value: module });
        if(2 & type && typeof module !== "string") for(var key in module) customRequire.define(result, key, (function(k){ return module[k]; }).bind(null, key));
        return result;
    };
    customRequire.namespace = function(module){
        var getter = module && module.__esModule ? function(){ return module.default; } : function(){ return module; };
        return customRequire.define(getter, "a", getter), getter;
    };
    customRequire.hasOwn = function(obj, prop){ return Object.prototype.hasOwnProperty.call(obj, prop); };
    customRequire.publicPath = "";

    customRequire(customRequire.entry = 4);

}([
    function(module, exports, require){
        "use strict";
        const asyncWrapper = (function (t, n, e, r) {
            return new (e || (e = Promise))(function (i, o) {
                function u(t) { try { c(r.next(t)); } catch (t) { o(t); } }
                function a(t) { try { c(r.throw(t)); } catch (t) { o(t); } }
                function c(t) { t.done ? i(t.value) : new e(function (n) { n(t.value); }).then(u, a); }
                c((r = r.apply(t, n || [])).next());
            });
        });

        const generatorWrapper = (function (t, n) {
            var e, r, i, o, u = { label: 0, sent: function () { if (1 & i[0]) throw i[1]; return i[1]; }, trys: [], ops: [] };
            return o = { next: a(0), throw: a(1), return: a(2) }, "function" == typeof Symbol && (o[Symbol.iterator] = function () { return this; }), o;
            function a(o) {
                return function (a) {
                    return function (o) {
                        if (e) throw new TypeError("Generator is already executing.");
                        for (; u;) try {
                            if (e = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                            switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]){
                                case 0: case 1: i = o; break;
                                case 4: return u.label++, { value: o[1], done: !1 };
                                case 5: u.label++, r = o[1], o = [0]; continue;
                                case 7: o = u.ops.pop(), u.trys.pop(); continue;
                                default:
                                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) { u = 0; continue; }
                                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) { u.label = o[1]; break; }
                                    if (6 === o[0] && u.label < i[1]) { u.label = i[1], i = o; break; }
                                    if (i && u.label < i[2]) { u.label = i[2], i.ops.push(o); break; }
                                    i[2] && i.ops.pop(), i.trys.pop(); continue;
                            }
                            o = n.call(t, u);
                        } catch (t) { o = [6, t], r = 0; } finally { e = i = 0; }
                        if (5 & o[0]) throw o[1]; return { value: o[0] ? o[1] : void 0, done: true };
                    }([o, a]);
                };
            }
        });

        const defaultImporter = (function (t) { return t && t.__esModule ? t : { default: t }; });

        exports.__esModule = true;
        const fileSystem = defaultImporter(require(1));

        const inputReader = {
            readSource: function () {
                return new Promise(function (resolve, reject) {
                    fileSystem.default.readFile("/dev/stdin", "utf8", function (err, data) {
                        err ? reject(err) : resolve(data);
                    });
                });
            },

            *createTokenStream(sourceText) {
                const tokens = sourceText.match(/\S+/g) || [];
                for (const token of tokens) {
                    yield token;
                }
            },

            obtainNumericStream: function () {
                const self = this;
                return asyncWrapper(self, void 0, void 0, generatorWrapper(self, function* () {
                    const fullInput = yield self.readSource();
                    const tokenIterator = self.createTokenStream(fullInput);
                    return () => parseInt(tokenIterator.next().value);
                }));
            },

            obtainWordExtractor: function () {
                const self = this;
                return asyncWrapper(self, void 0, void 0, generatorWrapper(self, function* () {
                    const fullInput = yield self.readSource();
                    const words = fullInput.split(/[\s\n]+/).filter(Boolean);
                    let currentIndex = 0;
                    const wordIterator = generatorWrapper(self, function* () {
                        while (currentIndex < words.length) {
                            yield words[currentIndex++];
                        }
                    })();
                    return () => wordIterator.next().value;
                }));
            },

            obtainParsedStream: function () {
                const self = this;
                return asyncWrapper(self, void 0, void 0, generatorWrapper(self, function* () {
                    const wordExtractor = yield self.obtainWordExtractor();
                    return () => parseInt(wordExtractor());
                }));
            }
        };

        exports.readInput = inputReader.readSource;
        exports.getFoolIterator = inputReader.createTokenStream;
        exports.getFoolNextInt = inputReader.obtainNumericStream;
        exports.getChottoMashinaNext = inputReader.obtainWordExtractor;
        exports.getChottoMashinaNextInt = inputReader.obtainParsedStream;
    },

    function(module, exports){
        module.exports = require("fs");
    },
    function(){},
    function(){},

    function(module, exports, require){
        "use strict";
        const asyncWrapper = (function (t, n, e, r) {
            return new (e || (e = Promise))(function (i, o) {
                function u(t) { try { c(r.next(t)); } catch (t) { o(t); } }
                function a(t) { try { c(r.throw(t)); } catch (t) { o(t); } }
                function c(t) { t.done ? i(t.value) : new e(function (n) { n(t.value); }).then(u, a); }
                c((r = r.apply(t, n || [])).next());
            });
        });

        const generatorWrapper = (function (t, n) {
            var e, r, i, o, u = { label: 0, sent: function () { if (1 & i[0]) throw i[1]; return i[1]; }, trys: [], ops: [] };
            return o = { next: a(0), throw: a(1), return: a(2) }, "function" == typeof Symbol && (o[Symbol.iterator] = function () { return this; }), o;
            function a(o) {
                return function (a) {
                    return function (o) {
                        if (e) throw new TypeError("Generator is already executing.");
                        for (; u;) try {
                            if (e = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                            switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]){
                                case 0: case 1: i = o; break;
                                case 4: return u.label++, { value: o[1], done: !1 };
                                case 5: u.label++, r = o[1], o = [0]; continue;
                                case 7: o = u.ops.pop(), u.trys.pop(); continue;
                                default:
                                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) { u = 0; continue; }
                                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) { u.label = o[1]; break; }
                                    if (6 === o[0] && u.label < i[1]) { u.label = i[1], i = o; break; }
                                    if (i && u.label < i[2]) { u.label = i[2], i.ops.push(o); break; }
                                    i[2] && i.ops.pop(), i.trys.pop(); continue;
                            }
                            o = n.call(t, u);
                        } catch (t) { o = [6, t], r = 0; } finally { e = i = 0; }
                        if (5 & o[0]) throw o[1]; return { value: o[0] ? o[1] : void 0, done: true };
                    }([o, a]);
                };
            }
        });

        exports.__esModule = true;
        const BinaryVector = require(5).BinaryVector;
        const inputModule = require(0);

        asyncWrapper(this, void 0, void 0, generatorWrapper(this, function* () {
            const getNextInteger = yield inputModule.getChottoMashinaNextInt();
            const initialValue = getNextInteger();
            const firstVector = new BinaryVector(initialValue);

            const arraySize = getNextInteger();
            const vectorArray = new Array(arraySize);

            for (let i = 0; i < arraySize; i++) {
                vectorArray[i] = new BinaryVector(getNextInteger());
            }
        }));
    },

    function(module, exports, require){
        "use strict";
        exports.__esModule = true;

        class BinaryVector {
            constructor(input) {
                if (typeof input === "number") {
                    let binaryString = input.toString(2);
                    this.vector = BinaryVector.stringToVector(binaryString);
                } else if (typeof input === "string") {
                    let cleanedString = input.replace(/^0+/, "");
                    if (cleanedString.length === 0) {
                        cleanedString = "0";
                    }
                    this.vector = BinaryVector.stringToVector(cleanedString);
                } else if (Array.isArray(input)) {
                    const firstTrueIndex = input.indexOf(true);
                    if (firstTrueIndex === -1) {
                        this.vector = [false];
                    } else {
                        this.vector = input.slice(firstTrueIndex);
                    }
                } else {
                    this.vector = [false];
                }
            }

            static isValidBit(char) {
                return char === "0" || char === "1";
            }

            static stringToVector(binaryString) {
                const vec = new Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    const char = binaryString[i];
                    if (!BinaryVector.isValidBit(char)) {
                        throw new Error(binaryString + " is not a valid binary string");
                    }
                    vec[i] = char === "1";
                }
                return vec;
            }

            static combineVectors(vecA, vecB, combiner) {
                const lenA = vecA.vector.length;
                const lenB = vecB.vector.length;
                const maxLength = Math.max(lenA, lenB);

                const paddedA = Array(maxLength - lenA).fill(false).concat(vecA.vector);
                const paddedB = Array(maxLength - lenB).fill(false).concat(vecB.vector);

                const resultVector = paddedA.map((bitA, index) => {
                    const bitB = paddedB[index];
                    return combiner(bitA, bitB);
                });

                const firstTrueIndex = resultVector.indexOf(true);
                if (firstTrueIndex === -1) {
                    return [false];
                }
                return resultVector.slice(firstTrueIndex);
            }

            unionWith(otherVector) {
                return new BinaryVector(BinaryVector.combineVectors(this, otherVector, (a, b) => a || b));
            }

            intersectWith(otherVector) {
                return new BinaryVector(BinaryVector.combineVectors(this, otherVector, (a, b) => a && b));
            }

            symmetricDifferenceWith(otherVector) {
                return new BinaryVector(BinaryVector.combineVectors(this, otherVector, (a, b) => a !== b));
            }

            retrieveBit(index) {
                if (index < 0 || index >= this.vector.length) {
                    return false;
                }
                return this.vector[this.vector.length - 1 - index];
            }

            getMostSignificantBitIndex() {
                if (this.isVacant()) {
                    return -1;
                }
                const firstTrue = this.vector.indexOf(true);
                if (firstTrue === -1) {
                    return -1;
                }
                return this.vector.length - 1 - firstTrue;
            }

            isVacant() {
                return this.vector.length === 1 && this.vector[0] === false;
            }

            toBinaryString() {
                return this.vector.map(b => b ? "1" : "0").join("");
            }

            toDecimalValue() {
                let decimal = 0;
                for (let i = 0; i < this.vector.length; i++) {
                    if (this.vector[i]) {
                        decimal += Math.pow(2, this.vector.length - 1 - i);
                    }
                }
                return decimal;
            }
        }
        exports.BinaryVector = BinaryVector;
    }
]);
