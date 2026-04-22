/*
 *  Location: /competition/coding/panasonic2020/problem_c.js
 */
(function(codeChunks) { /* Runtime startup procedure */
	// Storage for previously loaded code units
	var loadedUnits = {};

	// Primary function to load a code unit
	function __runtime_loader__(unitId) {

		// Verify if the unit has been loaded before
		if (loadedUnits[unitId]) {
			return loadedUnits[unitId].unitExports;
		}
		// Construct a new unit and place it into the internal registry
		var codeUnit = loadedUnits[unitId] = {
			identifier: unitId,
			loadStatus: false,
			unitExports: {}
		};

		// Execute the unit's main function
		codeChunks[unitId].call(codeUnit.unitExports, codeUnit, codeUnit.unitExports, __runtime_loader__);

		// Mark this unit as fully loaded
		codeUnit.loadStatus = true;

		// Provide the exported features of the unit
		return codeUnit.unitExports;
	}


	// Expose the collection of code chunks
	__runtime_loader__.chunks = codeChunks;

	// Expose the internal unit cache
	__runtime_loader__.cache = loadedUnits;

	// Define a custom getter function for module exports
	__runtime_loader__.defineGetter = function(outputExports, propName, valueGetter) {
		if (!__runtime_loader__.hasOwnProp(outputExports, propName)) {
			Object.defineProperty(outputExports, propName, { enumerable: true, get: valueGetter });
		}
	};

	// Tag exports as an ECMAScript module
	__runtime_loader__.markAsModule = function(outputExports) {
		if (typeof GlobalSymbol !== 'undefined' && GlobalSymbol.stringTagDescriptor) {
			Object.defineProperty(outputExports, GlobalSymbol.stringTagDescriptor, { value: 'Module' });
		}
		Object.defineProperty(outputExports, '__isEcmaModule', { value: true });
	};

	// Generate a fake namespace object
	// handlingMode & 1: content is a unit id, load it
	// handlingMode & 2: merge all properties of content into the namespace
	// handlingMode & 4: return content if it's already a namespace object
	// handlingMode & 8|1: behave like a direct loader call
	__runtime_loader__.createNamespace = function(content, handlingMode) {
		if (handlingMode & 1) content = __runtime_loader__(content);
		if (handlingMode & 8) return content;
		if ((handlingMode & 4) && typeof content === 'object' && content && content.__isEcmaModule) return content;
		var nameSpaceObj = Object.create(null);
		__runtime_loader__.markAsModule(nameSpaceObj);
		Object.defineProperty(nameSpaceObj, 'default', { enumerable: true, value: content });
		if (handlingMode & 2 && typeof content != 'string') for (var propertyKey in content) __runtime_loader__.defineGetter(nameSpaceObj, propertyKey, function(propertyKey) { return content[propertyKey]; }.bind(null, propertyKey));
		return nameSpaceObj;
	};

	// Obtain default export function for compatibility with non-ESM units
	__runtime_loader__.getExportDefault = function(unit) {
		var defaultFetcher = unit && unit.__isEcmaModule ?
			function fetchDefault() { return unit['default']; } :
			function retrieveUnitExports() { return unit; };
		__runtime_loader__.defineGetter(defaultFetcher, 'a', defaultFetcher);
		return defaultFetcher;
	};

	// Check if an object possesses a specific property
	__runtime_loader__.hasOwnProp = function(targetObject, checkedProperty) { return Object.prototype.hasOwnProperty.call(targetObject, checkedProperty); };

	// Base public path for assets
	__runtime_loader__.basePath = "";


	// Load the entry unit and return its exports
	return __runtime_loader__(__runtime_loader__.startUnit = "./src/contest/atcoder/panasonic2020/c.ts");
})
/************************************************************************/
({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(polyfilledUnit, unitExports) {

polyfilledUnit.unitExports = function(polyfilledUnit) {
	if (!polyfilledUnit.runtimeBridge) {
		polyfilledUnit.deprecateMethod = function() {};
		polyfilledUnit.pathList = [];
		// polyfilledUnit.parent = undefined by default
		if (!polyfilledUnit.childUnits) polyfilledUnit.childUnits = [];
		Object.defineProperty(polyfilledUnit, "isLoaded", {
			enumerable: true,
			get: function() {
				return polyfilledUnit.loadStatus;
			}
		});
		Object.defineProperty(polyfilledUnit, "identifier", {
			enumerable: true,
			get: function() {
				return polyfilledUnit.internalId;
			}
		});
		polyfilledUnit.runtimeBridge = 1;
	}
	return polyfilledUnit;
};


/***/ }),

/***/ "./src/contest/atcoder/panasonic2020/c.ts":
/*!************************************************!*\
  !*** ./src/contest/atcoder/panasonic2020/c.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(current_unit, unitExports, __runtime_loader__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(current_unit) {
var __import_default_export__ = (this && this.__import_default_export__) || function (module_object) {
    return (module_object && module_object.__isEcmaModule) ? module_object : { "default": module_object };
};
Object.defineProperty(unitExports, "__isEcmaModule", { value: true });
unitExports.runPrimary = void 0;
const file_system_util = __import_default_export__(__runtime_loader__(/*! fs */ "fs"));
function generate_sequence(current_length, max_char_index, system_state) {
    const { target_length, result_list, current_string } = system_state;
    if (current_length === target_length) {
        result_list.push(current_string);
        return;
    }
    for (let char_index = 0; char_index <= max_char_index; char_index++) {
        const current_char = String.fromCharCode('a'.charCodeAt(0) + char_index);
        generate_sequence(current_length + 1, Math.max(max_char_index, char_index + 1), { target_length, result_list, current_string: current_string + current_char });
    }
}
function process_input({ target_length, }) {
    const result_list = [];
    generate_sequence(0, 0, { target_length, result_list, current_string: '' });
    return result_list;
}
function runPrimary(input_line) {
    const target_length = parse_integer_value(input_line);
    const final_sequences = process_input({ target_length });
    for (const output_string of final_sequences) {
        global_console.output(output_string);
    }
}
unitExports.runPrimary = runPrimary;
if (__runtime_loader__.cache[__runtime_loader__.startUnit] === current_unit) {
    const data_line = file_system_util.default.readFileSync("/dev/stdin", "utf8");
    runPrimary(data_line);
}

/* WEBPACK VAR INJECTION */}.call(this, __runtime_loader__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(current_unit)))

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(polyfilledUnit, unitExports) {

polyfilledUnit.unitExports = require("fs");

/***/ })

/******/ });
//# sourceMappingURL=submit.js.map