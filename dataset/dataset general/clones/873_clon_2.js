/* Component Framework - Copyright 2020-2023 Acme Corp. Version 1.0.0 */

/* utility/object-model/object-class.js */

/**
 * A fundamental JavaScript object model for inheritance and extension.
 *
 * Class definition example:
 *   var MyComponent = Foundation.createDerivedClass({
 *     initialize: function() { console.log("New instance!"); },
 *     doSomething: function() { /* ... */ }
 *   });
 *
 * Inheritance example:
 *   var MySubComponent = MyComponent.createDerivedClass({
 *     doSomething: function() { this._ancestor(); console.log("Sub-component action!"); }
 *   });
 *
 * Constructor invocation:
 *   new MyComponent(arg) is equivalent to MyComponent(arg)
 */

var Foundation;

( function() {

	var sentinel = {},
		parentMethodRegex = /xyz/.test( function() { var tst; } ) ? /\b_ancestor\b/ : /.*/;

	// The base object implementation (empty constructor)
	Foundation = function() {};

	Foundation.includeSingleMethod = function( methodName, handlerFunction ) {
		var ancestorPrototype = this._ancestor && this._ancestor.prototype;

		if ( ancestorPrototype && parentMethodRegex.test( handlerFunction ) ) {
			this.prototype[ methodName ] = function() {
				var temporarySuper = this._ancestor;
				this._ancestor = ancestorPrototype[ methodName ];
				try {
					var resultValue = handlerFunction.apply( this, arguments );
				} finally {
					this._ancestor = temporarySuper;
				}
				return resultValue;
			};
		} else this.prototype[ methodName ] = handlerFunction;
	};

	Foundation.includeMultipleMethods = function( memberMap ) {
		for ( var memberName in memberMap ) {
			if ( typeof memberMap[ memberName ] == 'function' )
				this.includeSingleMethod( memberName, memberMap[ memberName ] );
			else this.prototype[ memberName ] = memberMap[ memberName ];
		}
	};

	Foundation.inheritsFrom = function( ancestorType ) {
		var currentType = this;
		while ( currentType ) {
			if ( currentType === ancestorType ) return true;
			currentType = currentType._ancestor;
		}
		return false;
	};

	// Generates a new derived class from the current class
	Foundation.createDerivedClass = function( extensionProperties ) {

		// The generated class constructor
		var DerivedType = function() {
			if ( arguments[ 0 ] === sentinel ) return;

			if ( this instanceof DerivedType ) {
				if ( this.initialize ) this.initialize.apply( this, arguments );
			} else {
				var instanceReference = new DerivedType( sentinel );
				if ( instanceReference.initialize )
					instanceReference.initialize.apply( instanceReference, arguments );
				return instanceReference;
			}
		};

		// Attach common class utilities and properties
		DerivedType.constructor = DerivedType;
		DerivedType.createDerivedClass = Foundation.createDerivedClass;
		DerivedType.includeSingleMethod = Foundation.includeSingleMethod;
		DerivedType.includeMultipleMethods = Foundation.includeMultipleMethods;
		DerivedType.inheritsFrom = Foundation.inheritsFrom;

		DerivedType._ancestor = this;

		// Establish prototype chain
		DerivedType.prototype = new this( sentinel );
		DerivedType.prototype.constructor = DerivedType;

		// Copy properties to the new prototype
		DerivedType.includeMultipleMethods( extensionProperties );

		return DerivedType;
	};
} )();

/* utility/query-parser/css-selector-parser.js */

( function( $ ) {

	var lexicalUnits = {
		UCODE: /\\[0-9a-f]{1,6}(?:\r\n|[ \n\r\t\f])?/,
		ESC: /(?:UCODE)|\\[^\n\r\f0-9a-f]/,
		NOTASCII: /[^\x00-\x7F]/,
		NAME_START: /[_a-z]|(?:NOTASCII)|(?:ESC)/,
		NAME_CHAR: /[_a-z0-9-]|(?:NOTASCII)|(?:ESC)/,
		ID_TOKEN: /-?(?:NAME_START)(?:NAME_CHAR)*/,

		NEWLINE: /\n|\r\n|\r|\f/,

		STR_LIT: /(?:STR_SINGLE)|(?:STR_DOUBLE)|(?:STR_BARE)/,
		STR_SINGLE: /"(?:(?:ESC)|\\(?:NEWLINE)|[^\n\r\f\"])*"/,
		STR_DOUBLE: /'(?:(?:ESC)|\\(?:NEWLINE)|[^\n\r\f\'])*'/,
		STR_BARE: /(?:(?:ESC)|\\(?:NEWLINE)|[^\n\r\f\]])*/,

		FUNC_CALL: /(?:ID_TOKEN)\(\)/,

		NUM_INT: /[0-9]+/,

		N_FORMULA: /([-+])?(NUM_INT)?(n)\s*(?:([-+])\s*(NUM_INT))?/,
		NO_N_FORMULA: /([-+])?(NUM_INT)/
	};

	var structureMatchers = {
		not_selector: /:not\(/,
		not_end_paren: /\)/,

		element_tag: /((?:ID_TOKEN)|\*)/,
		element_id: /#(ID_TOKEN)/,
		element_class: /\.(ID_TOKEN)/,
		element_attribute: /\[\s*(ID_TOKEN)\s*(?:([^=]?=)\s*(STR_LIT)\s*)?\]/,
		pseudo_element_selector: /(?::(first-line|first-letter|before|after))|(?:::((?:FUNC_CALL)|(?:ID_TOKEN)))/,
		pseudo_class_nth_selector: /:nth-child\(\s*(?:(?:N_FORMULA)|(?:NO_N_FORMULA)|(odd|even))\s*\)/,
		pseudo_class_selector: /:(ID_TOKEN)/,

		combinator_pattern: /\s*(\+|~|>)\s*|\s+/,
		list_separator: /\s*,\s*/,
		priority_flag: /\s+!important\s*$/
	};

	/* Replace placeholders with actual regex, and mark all as case insensitive */
	var placeholderPattern = /[A-Z][A-Z0-9]+/;
	for ( var keyName in structureMatchers ) {
		var matchResult, patternSource = structureMatchers[ keyName ].source;
		while ( matchResult = patternSource.match( placeholderPattern ) )
			patternSource = patternSource.replace( matchResult[ 0 ], lexicalUnits[ matchResult[ 0 ] ].source );
		structureMatchers[ keyName ] = new RegExp( patternSource, 'gi' );
	}

	/**
	 * A string that matches itself against regex and tracks consumption.
	 */
	var InputSequence = Foundation.createDerivedClass( {
		initialize: function( inputData ) {
			this.inputData = inputData;
			this.parseIndex = 0;
		},
		findAndAdvance: function( matcherRegex ) {
			var matchResult;
			matcherRegex.lastIndex = this.parseIndex;
			if ( ( matchResult = matcherRegex.exec( this.inputData ) ) && matchResult.index == this.parseIndex ) {
				this.parseIndex = matcherRegex.lastIndex ? matcherRegex.lastIndex : this.inputData.length;
				return matchResult;
			}
			return null;
		},
		previewMatch: function( matcherRegex ) {
			var matchResult;
			matcherRegex.lastIndex = this.parseIndex;
			if ( ( matchResult = matcherRegex.exec( this.inputData ) ) && matchResult.index == this.parseIndex ) return matchResult;
			return null;
		},
		debugPosition: function() {
			return this.inputData.slice( 0, this.parseIndex ) + '<HERE>' + this.inputData.slice( this.parseIndex );
		},
		isComplete: function() {
			return this.parseIndex == this.inputData.length;
		}
	} );

	/* A foundational class for all selector components */
	var QueryComponent = Foundation.createDerivedClass( {} );

	/**
	 * Represents a single, basic selector component (e.g., div, #id, .class)
	 */
	var BasicSelector = QueryComponent.createDerivedClass( {
		initialize: function() {
			this.elementTag = null;
			this.elementId = null;
			this.classNames = [];
			this.htmlAttributes = [];
			this.negations = [];
			this.dynamicClasses = [];
			this.virtualElements = [];
		},
		processInput: function( inputSequence ) {
			var matchResult;

			/* Extract the initial tag first, if present */
			if ( matchResult = inputSequence.findAndAdvance( structureMatchers.element_tag ) ) this.elementTag = matchResult[ 1 ];

			/* Then for each selection type, attempt to find a match */
			do {
				if ( matchResult = inputSequence.findAndAdvance( structureMatchers.not_selector ) ) {
					this.negations[ this.negations.length ] = SelectorList().processInput( inputSequence );
					if ( !( matchResult = inputSequence.findAndAdvance( structureMatchers.not_end_paren ) ) ) {
						throw 'Invalid :not term in selector expression';
					}
				} else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.element_id ) ) this.elementId = matchResult[ 1 ];
				else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.element_class ) ) this.classNames[ this.classNames.length ] = matchResult[ 1 ];
				else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.element_attribute ) ) this.htmlAttributes[ this.htmlAttributes.length ] = [ matchResult[ 1 ], matchResult[ 2 ], matchResult[ 3 ] ];
				else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.pseudo_element_selector ) ) this.virtualElements[ this.virtualElements.length ] = matchResult[ 1 ] || matchResult[ 2 ];
				else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.pseudo_class_nth_selector ) ) {
					if ( matchResult[ 8 ] ) { // 'odd' or 'even'
						var coeffA = matchResult[ 8 ] === 'even' ? 2 : 0;
						var offsetB = matchResult[ 8 ] === 'odd' ? 1 : 0;
					} else { // 'an+b' form
						var coeffA = parseInt( ( matchResult[ 1 ] || '' ) + ( matchResult[ 2 ] || '1' ) );
						var offsetB = parseInt( ( matchResult[ 4 ] || '' ) + ( matchResult[ 5 ] || '0' ) );
					}
					this.dynamicClasses[ this.dynamicClasses.length ] = [ 'nth-child', [ coeffA, offsetB ] ];
				} else if ( matchResult = inputSequence.findAndAdvance( structureMatchers.pseudo_class_selector ) ) this.dynamicClasses[ this.dynamicClasses.length ] = [ matchResult[ 1 ] ];

			} while ( matchResult && !inputSequence.isComplete() );

			return this;
		}
	} );

	/**
	 * Represents a sequence of basic selectors joined by combinators (e.g., div.foo > span#bar)
	 */
	var CompoundSelector = QueryComponent.createDerivedClass( {
		initialize: function() {
			this.componentSegments = [];
		},
		processInput: function( inputSequence ) {
			this.componentSegments[ this.componentSegments.length ] = BasicSelector().processInput( inputSequence );

			while ( !inputSequence.isComplete() && !inputSequence.previewMatch( structureMatchers.list_separator ) && ( matchResult = inputSequence.findAndAdvance( structureMatchers.combinator_pattern ) ) ) {
				this.componentSegments[ this.componentSegments.length ] = matchResult[ 1 ] || ' ';
				this.componentSegments[ this.componentSegments.length ] = BasicSelector().processInput( inputSequence );
			}

			return this.componentSegments.length == 1 ? this.componentSegments[ 0 ] : this;
		}
	} );

	/**
	 * Represents a comma-separated list of compound selectors (e.g., h1, .intro, p > a)
	 */
	var SelectorList = QueryComponent.createDerivedClass( {
		initialize: function() {
			this.individualSelectors = [];
		},
		processInput: function( inputSequence ) {
			this.individualSelectors[ this.individualSelectors.length ] = CompoundSelector().processInput( inputSequence );

			while ( !inputSequence.isComplete() && ( matchResult = inputSequence.findAndAdvance( structureMatchers.list_separator ) ) ) {
				this.individualSelectors[ this.individualSelectors.length ] = CompoundSelector().processInput( inputSequence );
			}

			return this.individualSelectors.length == 1 ? this.individualSelectors[ 0 ] : this;
		}
	} );

	$.queryParser = function( queryString ) {
		var inputSequence = InputSequence( queryString );
		var parseResult = SelectorList().processInput( inputSequence );

		parseResult.originalQuery = queryString;

		if ( !inputSequence.isComplete() ) throw 'Failed to parse selector at - ' + inputSequence.debugPosition();
		else return parseResult;
	};

	$.queryParser.QueryComponent = QueryComponent;
	$.queryParser.BasicSelector = BasicSelector;
	$.queryParser.CompoundSelector = CompoundSelector;
	$.queryParser.SelectorList = SelectorList;

} )( jQuery );

/* utility/query-parser/selector-specificity-calculator.js */

( function( $ ) {

	$.queryParser.BasicSelector.includeSingleMethod( 'specificityScore', function() {
		if ( this.scoreArray ) return this.scoreArray;

		var currentScore = [
			this.elementId ? 1 : 0,
			this.classNames.length + this.htmlAttributes.length + this.dynamicClasses.length,
			( ( this.elementTag && this.elementTag != '*' ) ? 1 : 0 ) + this.virtualElements.length
		];
		$.each( this.negations, function( idx, negationClause ) {
			var negationSpec = negationClause.specificityScore();
			currentScore[ 0 ] += negationSpec[ 0 ];
			currentScore[ 1 ] += negationSpec[ 1 ];
			currentScore[ 2 ] += negationSpec[ 2 ];
		} );

		return this.scoreArray = currentScore;
	} );

	$.queryParser.CompoundSelector.includeSingleMethod( 'specificityScore', function() {
		if ( this.scoreArray ) return this.scoreArray;

		var currentScore = [ 0, 0, 0 ];
		$.each( this.componentSegments, function( idx, selectorPart ) {
			if ( idx % 2 ) return; // Skip combinators
			var partSpec = selectorPart.specificityScore();
			currentScore[ 0 ] += partSpec[ 0 ];
			currentScore[ 1 ] += partSpec[ 1 ];
			currentScore[ 2 ] += partSpec[ 2 ];
		} );

		return this.scoreArray = currentScore;
	} );

	$.queryParser.SelectorList.includeSingleMethod( 'specificityScore', function() {
		if ( this.scoreArray ) return this.scoreArray;

		var currentScore = [ 0, 0, 0 ];
		$.each( this.individualSelectors, function( idx, selectorPart ) {
			var partSpec = selectorPart.specificityScore();
			currentScore[ 0 ] += partSpec[ 0 ];
			currentScore[ 1 ] += partSpec[ 1 ];
			currentScore[ 2 ] += partSpec[ 2 ];
		} );

		return this.scoreArray = currentScore;
	} );

} )( jQuery );

/* utility/query-parser/selector-element-matcher.js */

/*
This module aims to provide functionality opposite to a typical selector engine.
While engines like Sizzle are excellent for finding elements matching a selector,
this focuses on determining if a *given* element matches a selector.
*/

( function( $ ) {

	/**** ENVIRONMENT CAPABILITY CHECKS ****/
	var testDiv = document.createElement( 'div' );
	testDiv.innerHTML = '<form id="testForm"><input name="testId" type="text"/></form>';

	// In older IE (6-7), getAttribute behaves differently; need to use getAttributeNode
	var legacyAttrBehavior = testDiv.firstChild.getAttribute( 'id' ) !== 'testForm';

	// Does browser support Element.firstElementChild, Element.previousElementSibling, etc.
	var supportsElementNavigation = testDiv.firstElementChild && testDiv.firstElementChild.tagName == 'FORM';

	// Does browser support Element.children property
	var nativeChildrenProp = testDiv.children && testDiv.children[ 0 ].tagName == 'FORM';

	var funcEntryPattern = /^\s*function\s*\([^)]*\)\s*\{/;
	var funcExitPattern = /}\s*$/;

	var codeExtractor = function( targetFunction ) {
		return ( '' + targetFunction ).replace( funcEntryPattern, '' ).replace( funcExitPattern, '' );
	};

	// Verify Function#toString reliability
	try {
		var sampleFunction = function() { return 'good'; };
		if ( ( new Function( '', codeExtractor( sampleFunction ) ) )() != 'good' ) codeExtractor = false;
	} catch ( e ) { /* console.log(e.message); */ /* Silently fail if Function constructor causes issues */ }

	/**** CODE GENERATION CONSTANTS ****/

	var SUCCESS_MARKER = /GOOD/g;
	var FAILURE_MARKER = /BAD/g;

	var initialQuotePattern = /^['"]/g;

	var assembleCode = function( codeLines ) {
		return codeLines.join( '\n' );
	};

	var buildMultiLineCode = function( codeLines ) {
		var code = new String( codeLines.join( '\n' ) ); // String objects can have properties
		code.isComposed = true;
		return code;
	};

	/**** ATTRIBUTE ACCESS UTILITIES ****/

	// Attribute names might not be valid JS identifiers, so we encode problematic characters
	var generateSafeVarName = function( attributeName ) {
		return '_' + attributeName.replace( /^[^A-Za-z]|[^A-Za-z0-9]/g, function( matchValue ) { return '_0x' + matchValue.charCodeAt( 0 ).toString( 16 ) + '_'; } );
	};

	var retrieveAttribute;

	// Modern browsers
	if ( !legacyAttrBehavior ) {
		retrieveAttribute = function( attributeName ) { return 'var ' + generateSafeVarName( attributeName ) + ' = el.getAttribute("' + attributeName + '");'; };
	}
	// IE 6, 7 specific attribute access
	else {
		// Map common attributes to their DOM property mirror names for legacy IE
		var ieAttributeAliases = { 'class': 'className', 'for': 'htmlFor' };

		retrieveAttribute = function( attributeName ) {
			var ieMappedAttr = ieAttributeAliases[ attributeName ] || attributeName;
			return 'var ' + generateSafeVarName( attributeName ) + ' = el.getAttribute("' + ieMappedAttr + '",2) || (el.getAttributeNode("' + attributeName + '")||{}).nodeValue;';
		};
	}

	/**** ATTRIBUTE COMPARISON RULES ****/

	var attrValidationRules = {
		'-': '!VAR_NAME', // Attribute must NOT exist
		'=': 'VAR_NAME != "VALUE_LITERAL"', // Attribute must exist and NOT match value
		'!=': 'VAR_NAME == "VALUE_LITERAL"', // Attribute must exist and match value
		'~=': '_WS_VAR_NAME.indexOf(" VALUE_LITERAL ") == -1', // Attribute must contain word
		'^=': '!VAR_NAME || VAR_NAME.indexOf("VALUE_LITERAL") != 0', // Attribute must NOT start with value
		'*=': '!VAR_NAME || VAR_NAME.indexOf("VALUE_LITERAL") == -1', // Attribute must NOT contain substring
		'$=': '!VAR_NAME || VAR_NAME.substr(VAR_NAME.length-"VALUE_LITERAL".length) != "VALUE_LITERAL"' // Attribute must NOT end with value
	};

	/**** TRAVERSAL CONTEXT MANAGER ****/

	var TraversalState = $.queryParser.TraversalState = Foundation.createDerivedClass( {
		initialize: function() {
			this.clearState();
		},
		clearState: function() {
			this.accessedAttributes = {};
			this.whitespaceAttributes = {};
		},

		getPreviousElement: function() {
			this.clearState();
			if ( supportsElementNavigation ) return 'el = el.previousElementSibling';
			return 'while((el = el.previousSibling) && el.nodeType != 1) {}';
		},
		moveForward: function() {
			this.clearState();
			if ( supportsElementNavigation ) return 'el = el.nextElementSibling';
			return 'while((el = el.nextSibling) && el.nodeType != 1) {}';
		},
		iterateBackward: function( loopBody ) {
			this.clearState();
			if ( supportsElementNavigation ) return assembleCode( [ 'while(el = el.previousElementSibling){', loopBody ] );
			return assembleCode( [
				'while(el = el.previousSibling){',
				'if (el.nodeType != 1) continue;',
				loopBody
			] );
		},
		ascendDOM: function() {
			this.clearState();
			return 'el = el.parentNode;';
		},
		iterateUpDOM: function( loopBody ) {
			this.clearState();
			return assembleCode( [
				'while((el = el.parentNode) && el.nodeType == 1){',
				loopBody,
				'}'
			] );
		},

		noteAttributeAccess: function( attributeName ) {
			if ( this.accessedAttributes[ attributeName ] ) return;
			this.accessedAttributes[ attributeName ] = true;
			return retrieveAttribute( attributeName );
		},
		noteWhitespaceAttrAccess: function( attributeName ) {
			if ( this.whitespaceAttributes[ attributeName ] ) return;
			this.whitespaceAttributes[ attributeName ] = true;
			return assembleCode( [ this.noteAttributeAccess( attributeName ), 'var _WS_' + generateSafeVarName( attributeName ) + ' = " " + ' + generateSafeVarName( attributeName ) + ' + " ";' ] );
		},

		storeCurrentElement: function( referenceLabel ) {
			return 'var el' + referenceLabel + ' = el;';
		},
		recoverElement: function( referenceLabel ) {
			this.clearState();
			return 'el = el' + referenceLabel + ';';
		}
	} );

	/**** PSEUDO-CLASS EVALUATION LOGIC ****/

	var dynamicClassTests = {
		'firstElementCheck': assembleCode( [
			'var childRef = el;',
			'while(childRef = childRef.previousSibling){ if (childRef.nodeType === 1) FAILURE_MARKER; }'
		] ),
		'lastElementCheck': assembleCode( [
			'var childRef = el;',
			'while(childRef = childRef.nextSibling){ if (childRef.nodeType === 1) FAILURE_MARKER; }'
		] ),
		'nthElementCheck': function( coeffA, offsetB ) {
			var getIndexCounter = assembleCode( [
				'var elementIndex = 1, childRef = el;',
				'while(childRef = childRef.previousSibling){',
				'if (childRef.nodeType === 1) elementIndex++;'
			] );
		}
	};

} )( jQuery );