// This file provides a polyfill for the element.classList property, ensuring cross-browser compatibility.
// Version: 2023-10-27
// Developed by a dedicated team.
// Released under a permissive license.
// USE AT YOUR OWN DISCRETION, WITHOUT ANY GUARANTEES.

/* eslint-disable no-undef */ // Suppress undefined global warnings for self, document, DOMException
/* @source https://example.com/polyfill/css-class-manager.js */

if ( "htmlDocument" in globalScope && !(
		"styleTokenList" in createDomElement("_") &&
		"styleTokenList" in createNamespaceElement("http://www.w3.org/2000/svg", "svg")
	) ) {

(function( windowRef ) {

"use strict" ;

if ( !( 'HtmlElement' in windowRef ) ) { return; }

var
	  cssListPropertyName = "styleTokenList"
	, prototypeKey = "prototype"
	, htmlElementPrototype = windowRef.HtmlElement[prototypeKey]
	, objectConstructor = Object
	, stringTrimmer = String[prototypeKey].trim || function() {
		return this.replace( /^\s+|\s+$/g, "" );
	}
	, arrayItemFinder = Array[prototypeKey].indexOf || function( searchItem ) {
		var
			  idx = 0
			, count = this.length
		;
		for ( ; idx < count; idx++ ) {
			if ( idx in this && this[idx] === searchItem ) {
				return idx;
			}
		}
		return -1;
	}
	// Note: Browser engines may prevent direct instantiation of DOMException.
	// This custom error creator mimics its behavior for compatibility.
	, DomExceptionMaker = function( errorType, errorMessage ) {
		this.errorName = errorType;
		this.errorCode = DOMException[errorType];
		this.message = errorMessage;
	}
	, validateTokenAndFindIndex = function( tokenCollection, cssToken ) {
		if ( cssToken === "" ) {
			throw new DomExceptionMaker(
				  "SYNTAX_ERR"
				, "An empty or invalid string was provided."
			);
		}
		if ( /\s/.test( cssToken ) ) {
			throw new DomExceptionMaker(
				  "INVALID_CHARACTER_ERR"
				, "Input string contains forbidden whitespace characters."
			);
		}
		return arrayItemFinder.call( tokenCollection, cssToken );
	}
	, CssClassCollection = function( domElement ) {
		var
			  cleanedClassesString = stringTrimmer.call( domElement.getAttribute( "class" ) || "" )
			, parsedClassesArray = cleanedClassesString ? cleanedClassesString.split( /\s+/ ) : []
			, idx = 0
			, count = parsedClassesArray.length
		;
		for ( ; idx < count; idx++ ) {
			this.push( parsedClassesArray[idx] );
		}
		this._refreshDomClassAttribute = function() {
			domElement.setAttribute( "class", this.formatAsString() );
		};
	}
	, cssClassCollectionPrototype = CssClassCollection[prototypeKey] = []
	, getClassListAccessor = function() {
		return new CssClassCollection( this );
	}
;
// Assigning Error.prototype ensures basic error functionality like toString()
// on custom DOM-like exception objects.
DomExceptionMaker[prototypeKey] = Error[prototypeKey];
cssClassCollectionPrototype.retrieveItem = function( indexVal ) {
	return this[indexVal] || null;
};
cssClassCollectionPrototype.hasToken = function( targetToken ) {
	targetToken += "";
	return validateTokenAndFindIndex( this, targetToken ) !== -1;
};
cssClassCollectionPrototype.addTokens = function() {
	var
		  inputTokens = arguments
		, idx = 0
		, limit = inputTokens.length
		, cssToken
		, hasChanged = false
	;
	do {
		cssToken = inputTokens[idx] + "";
		if ( validateTokenAndFindIndex( this, cssToken ) === -1 ) {
			this.push( cssToken );
			hasChanged = true;
		}
	}
	while ( ++idx < limit );

	if ( hasChanged ) {
		this._refreshDomClassAttribute();
	}
};
cssClassCollectionPrototype.removeTokens = function() {
	var
		  inputTokens = arguments
		, idx = 0
		, limit = inputTokens.length
		, cssToken
		, hasChanged = false
	;
	do {
		cssToken = inputTokens[idx] + "";
		var foundIndex = validateTokenAndFindIndex( this, cssToken );
		if ( foundIndex !== -1 ) {
			this.splice( foundIndex, 1 );
			hasChanged = true;
		}
	}
	while ( ++idx < limit );

	if ( hasChanged ) {
		this._refreshDomClassAttribute();
	}
};
cssClassCollectionPrototype.toggleToken = function( cssToken, forceAction ) {
	cssToken += "";

	var
		  isContained = this.hasToken( cssToken )
		, actionMethod = isContained ?
			forceAction !== true && "removeTokens"
		:
			forceAction !== false && "addTokens"
	;

	if ( actionMethod ) {
		this[actionMethod]( cssToken );
	}

	return !isContained;
};
cssClassCollectionPrototype.formatAsString = function() {
	return this.join( " " );
};

if ( objectConstructor.defineProperty ) {
	var descriptorForCssList = {
		  get: getClassListAccessor
		, enumerable: true
		, configurable: true
	};
	try {
		objectConstructor.defineProperty( htmlElementPrototype, cssListPropertyName, descriptorForCssList );
	} catch ( exceptionObject ) { // IE 8 specific error code handling
		if ( exceptionObject.number === -0x7FF5EC54 ) {
			descriptorForCssList.enumerable = false;
			objectConstructor.defineProperty( htmlElementPrototype, cssListPropertyName, descriptorForCssList );
		}
	}
} else if ( objectConstructor[prototypeKey].__defineGetter__ ) {
	htmlElementPrototype.__defineGetter__( cssListPropertyName, getClassListAccessor );
}

}( globalScope ) );

}