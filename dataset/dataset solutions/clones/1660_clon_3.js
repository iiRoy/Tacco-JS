(function(moduleDefinitions) {
    const moduleCache = {};

    function __wp_require__(modId) {
        if (moduleCache[modId]) {
            return moduleCache[modId].exports;
        }
        const currentModule = moduleCache[modId] = {
            i: modId,
            l: false,
            exports: {}
        };
        moduleDefinitions[modId].call(currentModule.exports, currentModule, currentModule.exports, __wp_require__);
        currentModule.l = true;
        return currentModule.exports;
    }

    __wp_require__.moduleMap = moduleDefinitions;
    __wp_require__.moduleCache = moduleCache;

    __wp_require__.defineExport = function(modExports, exportName, exportGetter) {
        if (!__wp_require__.hasOwnProp(modExports, exportName)) {
            Object.defineProperty(modExports, exportName, { enumerable: true, get: exportGetter });
        }
    };

    __wp_require__.markAsEsModule = function(modExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(modExports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(modExports, '__esModule', { value: true });
    };

    __wp_require__.createNamespaceObject = function(exportValue, exportMode) {
        if (exportMode & 1) exportValue = __wp_require__(exportValue);
        if (exportMode & 8) return exportValue;
        if ((exportMode & 4) && typeof exportValue === 'object' && exportValue && exportValue.__esModule) return exportValue;
        const namespaceObject = Object.create(null);
        __wp_require__.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: exportValue });
        if (exportMode & 2 && typeof exportValue != 'string') {
            for (const propKey in exportValue) {
                __wp_require__.defineExport(namespaceObject, propKey, function(k) { return exportValue[k]; }.bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    __wp_require__.getDefaultExportFn = function(currentModule) {
        const defaultGetter = currentModule && currentModule.__esModule ?
            function getModuleDefault() { return currentModule['default']; } :
            function getModuleExports() { return currentModule; };
        __wp_require__.defineExport(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    __wp_require__.hasOwnProp = function(targetObject, propertyName) {
        const hasProp = Object.prototype.hasOwnProperty;
        return hasProp.call(targetObject, propertyName);
    };

    __wp_require__.publicPath = "";

    __wp_require__.entryModuleId = "./src/contest/atcoder/msol2020/e.ts";
    return __wp_require__(__wp_require__.entryModuleId);
})
({

/***/ "./node_modules/webpack/buildin/module.js":
/***/ (function(modRef, modExports) {

modRef.exports = function(innerMod) {
	if (!innerMod.isWebpackPolyfilled) {
		innerMod.deprecateFn = function() {};
		innerMod.resolvePaths = [];
		if (!innerMod.childModules) innerMod.childModules = [];
		Object.defineProperty(innerMod, "isLoaded", {
			enumerable: true,
			get: function() {
				return innerMod.loadFlag;
			}
		});
		Object.defineProperty(innerMod, "identifier", {
			enumerable: true,
			get: function() {
				return innerMod.internalId;
			}
		});
		innerMod.isWebpackPolyfilled = 1;
	}
	return innerMod;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/***/ (function(modRef, modExports, __wp_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(currentModuleForInjection) {
const __importDefault = (this && this.__importDefault) || function (inputModule) {
    return (inputModule && inputModule.__esModule) ? inputModule : { "default": inputModule };
};
Object.defineProperty(modExports, "__esModule", { value: true });
modExports.main = void 0;
const fileSystemUtil = __importDefault(__wp_require__(/*! fs */ "fs"));
const inputOutputUtil = __wp_require__(/*! ../../common/io */ "./src/contest/common/io.ts");

var CoordAxis;
(function (CoordAxis) {
    CoordAxis["X"] = "X";
    CoordAxis["Y"] = "Y";
    CoordAxis["N"] = "N";
})(CoordAxis || (CoordAxis = {}));

function computeMinCosts({ numCities, cityData, assignmentChoices, citiesSortedByX, citiesSortedByY }) {
    const minDistances = Array(numCities);

    const calculateInitialMin = (city) => Math.min(Math.abs(city.coordX), Math.abs(city.coordY)) * city.priority;

    for (let idx = 0; idx < numCities; idx++) {
        minDistances[idx] = calculateInitialMin(cityData[idx]);
    }

    const applyAxisOptimization = (sortedCities, axisProp, axisCheck) => {
        let lastAssignedIdx = null;
        for (let idx = 0; idx < numCities; idx++) {
            const currentCity = sortedCities[idx];
            const originalCityIndex = currentCity.originalIndex;
            if (assignmentChoices[originalCityIndex] === axisCheck) {
                lastAssignedIdx = idx;
                minDistances[originalCityIndex] = 0;
            } else if (lastAssignedIdx !== null) {
                const distance = Math.abs(currentCity[axisProp] - sortedCities[lastAssignedIdx][axisProp]) * currentCity.priority;
                minDistances[originalCityIndex] = Math.min(minDistances[originalCityIndex], distance);
            }
        }
    };

    const applyAxisOptimizationReverse = (sortedCities, axisProp, axisCheck) => {
        let lastAssignedIdx = null;
        for (let idx = numCities - 1; idx >= 0; idx--) {
            const currentCity = sortedCities[idx];
            const originalCityIndex = currentCity.originalIndex;
            if (assignmentChoices[originalCityIndex] === axisCheck) {
                lastAssignedIdx = idx;
                minDistances[originalCityIndex] = 0;
            } else if (lastAssignedIdx !== null) {
                const distance = Math.abs(currentCity[axisProp] - sortedCities[lastAssignedIdx][axisProp]) * currentCity.priority;
                minDistances[originalCityIndex] = Math.min(minDistances[originalCityIndex], distance);
            }
        }
    };

    applyAxisOptimization(citiesSortedByX, 'coordX', CoordAxis.Y);
    applyAxisOptimizationReverse(citiesSortedByX, 'coordX', CoordAxis.Y);

    applyAxisOptimization(citiesSortedByY, 'coordY', CoordAxis.X);
    applyAxisOptimizationReverse(citiesSortedByY, 'coordY', CoordAxis.X);

    return minDistances.reduce((totalSum, val) => totalSum + val, 0);
}

function exploreAssignments(currentCityIdx, assignedCount, systemState) {
    const { assignmentChoices, numCities, cityData, results, citiesSortedByX, citiesSortedByY } = systemState;

    if (currentCityIdx === numCities) {
        const currentResult = computeMinCosts({
            numCities,
            cityData,
            citiesSortedByX,
            citiesSortedByY,
            assignmentChoices
        });
        results[assignedCount] = Math.min(results[assignedCount], currentResult);
        return;
    }

    assignmentChoices[currentCityIdx] = CoordAxis.N;
    exploreAssignments(currentCityIdx + 1, assignedCount, systemState);

    assignmentChoices[currentCityIdx] = CoordAxis.X;
    const nextAssignedCountX = assignedCount + 1;
    exploreAssignments(currentCityIdx + 1, nextAssignedCountX, systemState);

    assignmentChoices[currentCityIdx] = CoordAxis.Y;
    const nextAssignedCountY = assignedCount + 1;
    exploreAssignments(currentCityIdx + 1, nextAssignedCountY, systemState);
}

function calculateOptimalCosts({ numCities, cityData }) {
    const maxPossibleValue = Number.MAX_SAFE_INTEGER;
    const results = Array(numCities + 1).fill(maxPossibleValue);
    const assignmentChoices = Array(numCities);

    const citiesSortedByX = [...cityData].sort((a, b) => a.coordX - b.coordX);
    const citiesSortedByY = [...cityData].sort((a, b) => a.coordY - b.coordY);

    const systemState = {
        numCities,
        cityData,
        results,
        assignmentChoices,
        citiesSortedByX,
        citiesSortedByY,
    };

    exploreAssignments(0, 0, systemState);
    return results;
}

function processInputAndSolve(inputLine) {
    const getNextInteger = inputOutputUtil.getIntegerReader(inputLine);
    const numCities = getNextInteger();
    const cityList = [];
    for (let idx = 0; idx < numCities; idx++) {
        const currentX = getNextInteger();
        const currentY = getNextInteger();
        const currentP = getNextInteger();
        cityList.push({ coordX: currentX, coordY: currentY, priority: currentP, originalIndex: idx });
    }
    console.log(calculateOptimalCosts({ numCities, cityData: cityList }).join('\n'));
}
modExports.main = processInputAndSolve;
if (__wp_require__.moduleCache[__wp_require__.entryModuleId] === modRef) {
    const inputData = fileSystemUtil.default.readFileSync("/dev/stdin", "utf8");
    processInputAndSolve(inputData);
}

/* WEBPACK VAR INJECTION */}.call(this, __wp_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(modRef)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/***/ (function(modRef, modExports, __wp_require__) {

"use strict";

Object.defineProperty(modExports, "__esModule", { value: true });
modExports.getBigIntegerReader = modExports.getIntegerReader = modExports.getRawTokenReader = modExports.createParsedTokenIterator = modExports.createTokenIterator = void 0;
function* createTokenIterator(inputLineStr) {
    const lineTokens = inputLineStr.split(/\s+/);
    for (const currentTok of lineTokens) {
        yield currentTok;
    }
}
modExports.createTokenIterator = createTokenIterator;
function* createParsedTokenIterator(inputLineStr, tokenParser) {
    const lineTokens = inputLineStr.split(/\s+/);
    for (const currentTok of lineTokens) {
        yield tokenParser(currentTok);
    }
}
modExports.createParsedTokenIterator = createParsedTokenIterator;
function getRawTokenReader(inputLineStr) {
    const iteratorInstance = createTokenIterator(inputLineStr);
    return () => iteratorInstance.next().value;
}
modExports.getRawTokenReader = getRawTokenReader;
function getIntegerReader(inputLineStr) {
    const iteratorInstance = createTokenIterator(inputLineStr);
    return () => parseInt(iteratorInstance.next().value);
}
modExports.getIntegerReader = getIntegerReader;
function getBigIntegerReader(inputLineStr) {
    const iteratorInstance = createTokenIterator(inputLineStr);
    return () => BigInt(iteratorInstance.next().value);
}
modExports.getBigIntegerReader = getBigIntegerReader;


/***/ }),

/***/ "fs":
/***/ (function(modRef, modExports) {

modRef.exports = require("fs");

/***/ })

});
