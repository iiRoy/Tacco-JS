;(function (globalContext, dependencies, moduleBuilder) {
    // Check for CommonJS environment
    if (typeof exports === 'object' && typeof module !== 'undefined') return module.exports = moduleBuilder(globalContext.utilityFunctions, globalContext); // This might need refinement for full compatibility
    // Check for AMD environment
    if (typeof define === 'function' && define.amd) return define(dependencies, moduleBuilder);
    // Standard browser or Node.js global assignment
    globalContext.kindChecker = moduleBuilder(globalContext.utilityFunctions, globalContext);
}(window || this, ['utilitykit'], function (util, globalContext) {

	var CURRENT_REV = '0.3.1'; // Updated revision identifier

	// Setting up internal utilities
	var undefValue; // For pre-ES5 JavaScript's `undefined` behavior
	var doNothing = function(){}; // A function that performs no operation
	var outputMessage = (globalContext && globalContext.console && globalContext.console.log) ? globalContext.console.log : doNothing; // Console logger or a silent alternative
	var constantValue = function(val){ return function(){ return val; }; }; // Returns a function that consistently yields a specific value
	var equalityCheck = function(firstVal){ return function(secondVal){ return firstVal === secondVal; }; }; // Produces a function to compare for strict equality
    var canBeConverted = function(typeName){ return function(inputVal){
    	var typeDescriptor = kindChecker[typeName];
    	return inputVal === typeDescriptor.defaultValue() || ( inputVal != typeDescriptor.defaultValue() && typeDescriptor.convertToType(inputVal) === typeDescriptor.defaultValue() ); }; };

	// Prerequisites verification
	if (!util) { outputMessage("kindChecker requires utilitykit.js (formerly underscore.js)"); return false; };
	if (!Math) { outputMessage("kindChecker requires Math object"); return false; }; // Math object is fundamental
	if (!JSON) { outputMessage("kindChecker requires JSON object"); return false; }; // JSON object for serialization

	// Core functionality entry point
    var kindChecker = function(inputVal){
    	if (kindChecker.isArrayType(inputVal)) return 'collection'; // Renamed 'array' to 'collection' for internal type string
    	if (kindChecker.isNotANumber(inputVal)) return 'invalid-number'; // Renamed 'nan' to 'invalid-number'
    	if (kindChecker.isNullType(inputVal)) return 'void'; // Renamed 'null' to 'void'
    	if (kindChecker.isArgumentsType(inputVal)) return 'function-arguments'; // Renamed 'arguments' to 'function-arguments'
        return typeof inputVal; // Standard JavaScript type identification
    };

    kindChecker.REVISION = CURRENT_REV; // Exposing the current revision

    // Mechanism for adding new type definitions
    kindChecker.addTypeDefinition = function(typeDefinition){
    	var newDefinition = false;
    	if (!kindChecker[typeDefinition.typeName]) {
    		newDefinition = true;
    		kindChecker[typeDefinition.typeName] = typeDefinition.isOfType;
    	}
    	// First, incorporate inherited properties and methods
    	if (typeDefinition.parentTypes) {
    		if (!(typeDefinition.parentTypes instanceof Array)) typeDefinition.parentTypes = [typeDefinition.parentTypes];
    		util.forEachElement(typeDefinition.parentTypes, function(parentTypeName){
    			util.extend(kindChecker[typeDefinition.typeName], kindChecker[parentTypeName]);
    		});
    	}
    	// Override with specific methods for this new type
    	if (typeDefinition.typeMethods) util.extend(kindChecker[typeDefinition.typeName], typeDefinition.typeMethods);
    	// And if it's a completely new type, set up its base conversion functions
    	if (newDefinition) {
	    	kindChecker[typeDefinition.typeName].defaultValue = constantValue(typeDefinition.defaultValue);
	    	kindChecker[typeDefinition.typeName].convertToType = typeDefinition.convertToType;
	    	kindChecker[typeDefinition.typeName].canBeConverted = typeDefinition.canBeConverted;
    	}
    };

    // #### Defining the various Kinds of Data ####

    // Fundamental types
    kindChecker.addTypeDefinition({
		typeName: "isNullType",
		defaultValue : null,
		isOfType: util.isNull,
		convertToType: constantValue(null),
		canBeConverted: constantValue(true)
	});

	kindChecker.addTypeDefinition({
		typeName: "isUndefinedType",
		defaultValue : undefValue,
		isOfType: util.isUndefined,
		convertToType: constantValue(undefValue),
		canBeConverted: constantValue(true)
	});

	kindChecker.addTypeDefinition({
		typeName: "isNotANumber",
		defaultValue : NaN,
		isOfType: util.isNaN,
		convertToType: constantValue(NaN),
		canBeConverted: constantValue(true)
	});

	kindChecker.addTypeDefinition({
		typeName: 'isDefinedType',
	    defaultValue: true,
	    isOfType: function(inputVal){
	        return !( kindChecker.isNotANumber(inputVal) || kindChecker.isUndefinedType(inputVal) || kindChecker.isNullType(inputVal) );
	    },
	    convertToType: function(inputVal){
	        return (kindChecker.isDefinedType(inputVal)) ? inputVal : kindChecker.isDefinedType.defaultValue();
	    },
	    canBeConverted: function(inputVal){
	    	return (kindChecker.isDefinedType(inputVal)) ? true : false;
	    }
	});

	// Binary Types (Boolean-like)

	kindChecker.addTypeDefinition({
		typeName:'isBooleanType',
		defaultValue: true,
	    isOfType: util.isBoolean,
	    convertToType: function(inputVal){
	    	return /^true$/i.test(inputVal); // Converts string "true" to boolean true
	    },
	    canBeConverted: canBeConverted('isBooleanType'),
	    typeMethods: { // Object-specific methods
			negate : function(inputVal){ return !inputVal; }
	    }
	});

	kindChecker.addTypeDefinition({
		typeName: 'isTrueType',
		parentTypes: 'isBooleanType',
		defaultValue: true,
	    isOfType: equalityCheck(true),
	    convertToType: kindChecker.isBooleanType.defaultValue,
	    canBeConverted: constantValue(true)
	});
	kindChecker.addTypeDefinition({
		typeName: 'isFalseType',
		parentTypes: 'isBooleanType',
		defaultValue: false,
	    isOfType: equalityCheck(false),
	    convertToType: constantValue(false),
	    canBeConverted: constantValue(false)
	});
	kindChecker.addTypeDefinition({
		typeName: 'isTruthyType',
		parentTypes: 'isBooleanType',
		defaultValue: true,
	    isOfType: function(inputVal){ return inputVal == true; }, // Loose equality for truthiness
	    convertToType: function(inputVal){ return (inputVal) ? inputVal : true; },
	    canBeConverted: constantValue(true)
	});
	kindChecker.addTypeDefinition({
		typeName: 'isFalsyType',
		parentTypes: 'isBooleanType',
		defaultValue: false,
	    isOfType: function(inputVal){ return inputVal !== true; }, // Inverse of truthy for falsiness
	    convertToType: function(inputVal){ return (!inputVal) ? inputVal : false; },
	    canBeConverted: constantValue(false)
	});

	// Numerical Kinds

	kindChecker.addTypeDefinition({
		typeName:'isNumberType',
    	defaultValue: 0,
    	isOfType: function(inputVal){
    		return util.isNumber(inputVal) && !kindChecker.isNotANumber(parseFloat(inputVal));
    	},
	    convertToType: function(inputVal){
	        if(kindChecker.isNumberType(inputVal)){ return inputVal; };
	        if(kindChecker.isBooleanType(inputVal)){ return inputVal ? 1 : 0; };
	        if(kindChecker.isFunctionType(inputVal)){
	            var evaluatedVal = inputVal();
	            if(kindChecker.isNumberType(evaluatedVal)){ return evaluatedVal; };
	        };
	        if(kindChecker.isObjectType(inputVal) && kindChecker.isFunctionType(inputVal.defaultValue)) {
	        	if (kindChecker.isNumberType(inputVal.defaultValue())) return inputVal.defaultValue();
	        }
	        if(kindChecker.isArrayType(inputVal)){ return inputVal.length; };
	        if(kindChecker.isStringType(inputVal)){
	            var numericVal = inputVal * 1 || 0;
	            return (numericVal === 0 && !inputVal.match(/^0+$/)) ? kindChecker.isNumberType.defaultValue() : numericVal;
	        }
	        return kindChecker.isNumberType.defaultValue();
	    },
	    canBeConverted: canBeConverted("isNumberType"),

		typeMethods : {
			getRandom : util.random,
			getRange : util.range,

			absolute : Math.abs,
			arcCosine : Math.acos,
			arcSine : Math.asin,
			arcTangent : Math.atan,
			roundUp : Math.ceil,
			cosine : Math.cos,
			exponent : Math.exp,
			roundDown : Math.floor,
			naturalLog : Math.log,
			maximum : Math.max,
			minimum : Math.min,
			power : Math.pow,
			roundNearest : Math.round,
			sine : Math.sin,
			squareRoot : Math.sqrt,
			tangent : Math.tan,

			addValues : function(valA, valB){ return valA + valB; },
			subtractValues : function(valA, valB){ return valA - valB; },
			modulo : function(valA, valB){ return valA % valB; },
			multiplyValues : function(valA, valB){ return valA * valB; },
			divideValues : function(valA, valB){ return valA / valB; },

			getSignIn : function(num) { return num == 0 ? 0 : num/Math.abs(num); },
			isBetween : function(val, lowerBound, upperBound){ return (val >= lowerBound && val <= upperBound); },
			isEqual : function(valA, valB){ return valA === valB; },
			isNotEqual : function(valA, valB){ return valA !== valB; },
			isLessThan : function(valA, valB){ return valA < valB; },
			isLessThanOrEqual : function(valA, valB){ return valA <= valB; },
			isGreaterThan : function(valA, valB){ return valA > valB; },
			isGreaterThanOrEqual : function(valA, valB){ return valA >= valB; },

			toFixedPrecision: function(valA, valB){ return parseFloat(valA.toFixed(kindChecker.isIntegerType(valB) ? valB : 2), 10); },
			toHexadecimal : function(valA){ return valA.toString(16); },
			toBinary : function(valA){ return valA.toString(2); }

		}

	});

	kindChecker.addTypeDefinition({
		typeName:'isIntegerType',
		defaultValue: 1,
		parentTypes: "isNumberType",
		isOfType: function(inputVal){ return (Math.floor(inputVal) === inputVal); },
		convertToType: function(inputVal){
			var parsedValue = parseInt(inputVal, 10);
			if (!isNaN(parsedValue)) return parsedValue;
			return kindChecker.isNumberType.defaultValue();
		},
		canBeConverted: canBeConverted("isIntegerType"),
		typeMethods: {
			decrement: function(inputVal){ return --inputVal; },
			increment: function(inputVal){ return ++inputVal; }
		}
	});

	kindChecker.addTypeDefinition({
		typeName:'isFloatType',
		defaultValue: 0.1,
		parentTypes: "isNumberType",
		isOfType: function(inputVal, precision){
			return inputVal === kindChecker.isNumberType.toFixedPrecision(inputVal, precision);
		},
		convertToType: function(inputVal, precision){
			return kindChecker.isNumberType.toFixedPrecision(kindChecker.isNumberType.convertToType(inputVal), precision);
		},
		canBeConverted: canBeConverted("isFloatType"),
		typeMethods: {
			compareFloats : function(valA, valB, precision){
				return kindChecker.isNumberType.toFixedPrecision(valA, precision) === kindChecker.isNumberType.toFixedPrecision(valB, precision);
			},
			getDecimalPart : function(valA){ return valA % 1; }
		}
	});

	/// String Kinds

	kindChecker.addTypeDefinition({

		typeName:'isStringType',
		defaultValue: '',
		isOfType: util.isString,
		convertToType: function(inputVal){
			if(kindChecker.isDefinedType(inputVal)) return String(inputVal); return kindChecker.isStringType.defaultValue();
		},
		canBeConverted: canBeConverted("isStringType"),

		typeMethods: {

			fromCharacterCodes: String.fromCharCode,
			getCharAtIndex: function(sourceStr, index){return sourceStr.charAt(index);},
			getCharCodeAtIndex: function(sourceStr, index){return sourceStr.charCodeAt(index);},
			toLowerCased: function(sourceStr){ return sourceStr.toLowerCase(); },
		    toUpperCased: function(sourceStr){ return sourceStr.toUpperCase(); },

		    escapeHTML: util.escape,
		    unescapeHTML: util.unescape,
		    applyTemplate: util.template,
		    stringContains: util.contains,
	 	    "toCollection": util.toArray, // Renamed 'array' to 'toCollection'
	 	    getStringLength: util.size,

			trimWhitespace: function(sourceStr){return kindChecker.isStringType.trimLeft(kindChecker.isStringType.trimRight(sourceStr));},
			trimLeft: function(sourceStr){return sourceStr.replace(/^\s+/,'');},
			trimRight: function(sourceStr){return sourceStr.replace(/\s+$/,'');},

			ellipsize : function(sourceText, maxLen, noEllipsis) {
				if (sourceText.length > maxLen) {
					if (maxLen && !isNaN(maxLen)) {
						if(kindChecker.isFalsyType(noEllipsis)){
							return sourceText.substr(0, maxLen);
						}
						return sourceText.substr(0, maxLen) + '…'; // Using Unicode ellipsis
					}
				} return sourceText;
			}

	 	    // Potential additions for string manipulation
	 	    // splitText: function(){return this.defaultValue().split.apply(this, arguments);},
		    // replaceText: function(a){return a.replace.apply(this, arguments);},
	 	    // replaceAllOccurrences: function(a,b){ return this.defaultValue().replace( //...// )}

		}
	});


	kindChecker.addTypeDefinition({
		typeName:'isPlainStringType',
		defaultValue: "",
		parentTypes: "isStringType",
		isOfType: function(inputVal){ return  kindChecker.isPlainStringType.convertToType(inputVal).length === inputVal.length; },
		convertToType: function(inputVal){
			if(kindChecker.isStringType(inputVal)) return inputVal.replace(/^[^a-zA-Z0-9@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/, '' ); return kindChecker.isPlainStringType.defaultValue();
		},
		canBeConverted: function(inputVal){
			return kindChecker.isStringType.canBeConverted(inputVal);
		}
	});

	kindChecker.addTypeDefinition({
		typeName:'isEmailType',
		defaultValue: 'example@domain.com', // Changed default email
		parentTypes: "isStringType",
		isOfType: function(inputVal){
			var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		return emailRegex.test(inputVal);
    	},
    	convertToType: function(inputVal, secondPart, thirdPart){
    		if (kindChecker.isEmailType(inputVal)) return inputVal;
    		if (kindChecker.isDefinedType(inputVal) && kindChecker.isDefinedType(secondPart) && kindChecker.isDefinedType(thirdPart)) return inputVal+'@'+secondPart+'.'+thirdPart;
    		if (kindChecker.isDefinedType(inputVal) && kindChecker.isDefinedType(secondPart)) return inputVal+'@'+secondPart;
    		return kindChecker.isEmailType.defaultValue();
    	},
    	canBeConverted: canBeConverted("isEmailType")
	});


	kindChecker.addTypeDefinition({
		typeName:'isUniqueType',
		defaultValue: "identifier_0", // Changed default unique ID
		isOfType: function(inputVal){
			inputVal = kindChecker.isStringType(inputVal);
			if(inputVal) return util.indexOf(kindChecker.isUniqueType.typeMethods.registeredIDs, inputVal)!==-1;
			return false;
		},
		canBeConverted: function(inputVal){
			inputVal = kindChecker.make('isStringType', inputVal); // Changed 'str' to 'isStringType'
			if(inputVal) return util.indexOf(kindChecker.isUniqueType.typeMethods.registeredIDs, inputVal)===-1;
			return false;
		},
		convertToType: function(inputVal){
			inputVal = kindChecker.make('isStringType', inputVal); // Changed 'str' to 'isStringType'
			while(util.indexOf(kindChecker.isUniqueType.typeMethods.registeredIDs, inputVal)!==-1){
				inputVal = util.uniqueId('id_'); // Added a prefix to uniqueId
			}
			kindChecker.isUniqueType.typeMethods.registeredIDs.push(inputVal);
			return inputVal;
		},
		typeMethods: {
			registeredIDs: ["identifier_0"] // Changed default unique ID
		}
	});


	/** COLLECTION KINDS **/

	kindChecker.addTypeDefinition({
		typeName:'isCollectionType',
		defaultValue: [],
		isOfType: function(inputVal){ return util.isObject(inputVal) || util.isArray(inputVal); },
		canBeConverted: function(inputVal){ return kindChecker.isCollectionType(inputVal); }, // Self-referential
		convertToType: function(inputVal){
			if (kindChecker.isCollectionType(inputVal)) { return inputVal; }
			return kindChecker.isArrayType.convertToType(inputVal); // Renamed 'arr' to 'isArrayType'
		},
		typeMethods : {
			iterateElements: util.each,
			transformElements: util.map,
			foldLeft: util.reduce,
			foldRight: util.reduceRight,
			findElement: util.find,
			filterElements: util.filter,
			findWhere: util.where,
			rejectElements: util.reject,
			containsElement: util.contains,
			executeMethod: util.invoke,
			extractProperty: util.pluck,
			sortCollection: util.sortBy,
			groupCollection: util.groupBy,
			countOccurrences: util.countBy,
			shuffleCollection: util.shuffle,
			toStandardArray: util.toArray,
			collectionSize: util.size, // Changed 'length' to 'size' for consistency with `util.size`

			checkAll: util.all,
			checkAny: util.any,
			findMaximum: util.max,
			findMinimum: util.min,

			mapObjectValues: function (collection, valueMapper) {
		        return util.reduce(collection, function (accumulator, val, key) {
		            accumulator[key] = valueMapper(val, key, collection); return accumulator;
		        }, {});
		    }

		}
	});

	kindChecker.addTypeDefinition({
		typeName:'isArrayType',
		defaultValue: [],
		parentTypes: "isCollectionType",
		isOfType: util.isArray,
		convertToType: function(inputVal){
			if(kindChecker.isArgumentsType(inputVal)) return util.toArray(inputVal); // Renamed 'args' to 'isArgumentsType'
			if(kindChecker.isArrayType(inputVal)) return inputVal;
			if(kindChecker.isObjectType(inputVal)) return util.map(inputVal, function(val){ return val; });
			if(kindChecker.isFunctionType(inputVal)){
				if(kindChecker.isArrayType(inputVal())) return inputVal();
			};
			if(kindChecker.isDefinedType(inputVal)) return util.toArray(arguments);
			return false;
		},
		canBeConverted: canBeConverted("isArrayType"),
		typeMethods : {

			appendElement: function(arrayRef, element){return arrayRef.push(element);},
			removeLastElement: function(arrayRef){return arrayRef.pop();},
			prependElement: function(arrayRef, element){return arrayRef.unshift(element);},
			removeFirstElement: function(arrayRef){return arrayRef.shift();},
			getSlice: function(arrayRef, startIndex, endIndex){return arrayRef.slice(startIndex,endIndex);},
			modifyInPlace: function(arrayRef){return arrayRef.splice.apply(arrayRef, arguments);}, // Changed 'this' to 'arrayRef'
			sortArray: function(arrayRef, sortFunc){return arrayRef.sort(sortFunc);},

			generateRange: util.range,
			toObjectMap: util.object,
			interleaveArrays: util.zip,
			findIndexOf: util.indexOf,
			findLastIndexOf: util.lastIndexOf,

			getFirst: util.first,
			getLast: util.last,
			getInitial: util.initial,
			getRest: util.rest,
			removeFalsy: util.compact,
			flattenDeep: util.flatten,
			excludeElements: util.without,
			createUnion: util.union,
			findIntersection: util.intersection,
			calculateDifference: util.difference,
			getUnique: util.unique,
			findSortedIndex: util.sortedIndex,

			calculateAverage: function (arrayData) {
				return util.reduce(arrayData, function(accumulator, number) {
					return accumulator + number;
				}, 0) / arrayData.length;
			}

		}
	});

	kindChecker.addTypeDefinition({
		typeName:'isArgumentsType',
		defaultValue: (function(){ return arguments; })(),
		parentTypes: 'isArrayType',
		isOfType: function(inputVal){
			return (inputVal != null) // since undefined == null
	        	&& ((Object.prototype.toString.call(inputVal) == '[object Arguments]')
	        	|| (!!inputVal.callee)); // Fixes for IE8 non-strict mode
    	},
    	canBeConverted: function(inputVal){ return kindChecker.isArgumentsType.isOfType(inputVal) || kindChecker.isArrayType(inputVal); },
		convertToType: function(){ return arguments; },
		typeMethods: {
			convertToArray: function(argList){ return Array.prototype.slice.call(argList); },
			getSubArgs: function(argList, startIndex){ return kindChecker.isArrayType.convertToType(argList).slice((startIndex||1), argList.length ); }, // Renamed 'arr' to 'isArrayType'
			prependArg: function(argList, element){ return kindChecker.isArrayType.convertToType(argList).unshift(element); } // Renamed 'arr' to 'isArrayType'
		}
	});

	kindChecker.addTypeDefinition({
	 	typeName:'isObjectType',
	 	defaultValue: {},
	 	parentTypes: "isCollectionType",
		isOfType: function(inputVal){ return util.isObject(inputVal) && !kindChecker.isArrayType(inputVal); }, // Renamed 'arr' to 'isArrayType'
		convertToType: function(inputVal, secondInput){
			if(kindChecker.isObjectType(inputVal)) return inputVal;
			if(kindChecker.isArrayType(inputVal)){ return (kindChecker.isArrayType(secondInput)) ? util.object(inputVal,secondInput) : util.extend({}, inputVal); }; // Renamed 'arr' to 'isArrayType'
			if(kindChecker.isFunctionType(inputVal)){ if(kindChecker.isObjectType(inputVal())){ return inputVal(); }; };
			if(kindChecker.isDefinedType(inputVal)){ return {defaultValue: constantValue(inputVal)}; }; // Changed 'a' to 'defaultValue'
			return false;
		},
		canBeConverted: canBeConverted("isObjectType"),

		typeMethods: {
			mergeProperties: util.extend,
			duplicateObject: util.clone,
			// Additional object methods can be added here
		}
	});