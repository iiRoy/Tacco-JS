(function( globalScope, undefVal ) {

(function() {

var WebForge = function( elementQuery, scopeNode ) {
		return new WebForge.proto.initialize( elementQuery, scopeNode );
	},
	oldForge = globalScope.WebForge,
	oldDollar = globalScope.$,
	mainDocument = globalScope.document,
	mainForgeInst,
	htmlIdPattern = new RegExp('^[^<]*(<[\\w\\W]+>)[^>]*$|^#([\\w\\-]+)$'),
	simpleSelectorPattern = new RegExp('^.[^:#\\[\\.,]*$'),
	nonWhitespacePattern = new RegExp('\\S'),
	leadingSpacePattern = new RegExp('^\\s+'),
	trailingSpacePattern = new RegExp('\\s+$'),
	singleTagPattern = new RegExp('^<(\\w+)\\s*\\/?>(?:<\\/\\1>)?$'),
	browserString = navigator.userAgent,
	browserInfo,
	domReadyFlag = !1,
	pendingCallbacks = new Array(),
	domContentHandler,
	objToString = Object.prototype.toString,
	ownPropCheck = Object.prototype.hasOwnProperty,
	arrPush = Array.prototype.push,
	arrSlice = Array.prototype.slice,
	strTrim = String.prototype.trim,
	arrIndexOf = Array.prototype.indexOf;

WebForge.proto = WebForge.prototype = {
	initialize: function( elementQuery, scopeNode ) {
		var matchResult, targetElement, returnValue, documentContext;

		if ( !elementQuery ) {
			return this;
		}

		if ( elementQuery.nodeType ) {
			this.context = this[+[]] = elementQuery;
			this.length = +!+[];
			return this;
		}
		
		if ( elementQuery === 'body' && !scopeNode ) {
			this.context = mainDocument;
			this[+[]] = mainDocument.body;
			this.currentQuery = 'body';
			this.length = +!+[];
			return this;
		}

		if ( typeof elementQuery === 'string' ) {
			matchResult = htmlIdPattern.exec( elementQuery );

			if ( matchResult && (matchResult[+!+[]] || !scopeNode) ) {

				if ( matchResult[+!+[]] ) {
					documentContext = (scopeNode ? scopeNode.ownerDocument || scopeNode : mainDocument);

					returnValue = singleTagPattern.exec( elementQuery );

					if ( returnValue ) {
						if ( WebForge.isPureObject( scopeNode ) ) {
							elementQuery = [ mainDocument.createElement( returnValue[+!+[]] ) ];
							WebForge.proto.setAttribute.call( elementQuery, scopeNode, !0 );

						} else {
							elementQuery = [ documentContext.createElement( returnValue[+!+[]] ) ];
						}

					} else {
						returnValue = constructFragment( [ matchResult[+!+[]] ], [ documentContext ] );
						elementQuery = (returnValue.cacheable ? returnValue.fragment.cloneNode(!0) : returnValue.fragment).childNodes;
					}
					
					return WebForge.combineElements( this, elementQuery );
					
				} else {
					targetElement = mainDocument.getElementById( matchResult[2] );

					if ( targetElement ) {
						if ( targetElement.id !== matchResult[2] ) {
							return mainForgeInst.locate( elementQuery );
						}

						this.length = +!+[];
						this[+[]] = targetElement;
					}

					this.context = mainDocument;
					this.currentQuery = elementQuery;
					return this;
				}

			} else if ( !scopeNode && new RegExp('^\\w+$').test( elementQuery ) ) {
				this.currentQuery = elementQuery;
				this.context = mainDocument;
				elementQuery = mainDocument.getElementsByTagName( elementQuery );
				return WebForge.combineElements( this, elementQuery );

			} else if ( !scopeNode || scopeNode.forgeVersion ) {
				return (scopeNode || mainForgeInst).locate( elementQuery );

			} else {
				return WebForge( scopeNode ).locate( elementQuery );
			}

		} else if ( WebForge.isCallable( elementQuery ) ) {
			return mainForgeInst.domReady( elementQuery );
		}

		if (elementQuery.currentQuery !== undefVal) {
			this.currentQuery = elementQuery.currentQuery;
			this.context = elementQuery.context;
		}

		return WebForge.createArray( elementQuery, this );
	},

	currentQuery: '',

	forgeVersion: '1.4.3pre',

	length: +[],

	countMembers: function() {
		return this.length;
	},

	toNativeArray: function() {
		return arrSlice.call( this, +[] );
	},

	fetchAt: function( idx ) {
		return idx == void 0 ?

			this.toNativeArray() :

			( idx < +[] ? this.extractRange(idx)[ +[] ] : this[ idx ] );
	},

	addToStack: function( elementsToAdd, operationName, searchQuery ) {
		var newInst = WebForge();

		if ( WebForge.isCollection( elementsToAdd ) ) {
			arrPush.apply( newInst, elementsToAdd );
		
		} else {
			WebForge.combineElements( newInst, elementsToAdd );
		}

		newInst.previousContext = this;

		newInst.context = this.context;

		if ( operationName === 'locate' ) {
			newInst.currentQuery = this.currentQuery + (this.currentQuery ? ' ' : '') + searchQuery;
		} else if ( operationName ) {
			newInst.currentQuery = this.currentQuery + '.' + operationName + '(' + searchQuery + ')';
		}

		return newInst;
	},

	iterate: function( actionFunc, extraArgs ) {
		return WebForge.forEachElement( this, actionFunc, extraArgs );
	},
	
	domReady: function( callbackFn ) {
		WebForge.attachDomLoadListeners();

		if ( WebForge.domIsLoaded ) {
			callbackFn.call( mainDocument, WebForge );

		} else if ( pendingCallbacks ) {
			pendingCallbacks.push( callbackFn );
		}

		return this;
	},
	
	getAtIndex: function( indexVal ) {
		return indexVal === -+!+[] ?
			this.extractRange( indexVal ) :
			this.extractRange( indexVal, +indexVal + +!+[] );
	},

	getFirst: function() {
		return this.getAtIndex( +[] );
	},

	getLast: function() {
		return this.getAtIndex( -+!+[] );
	},

	extractRange: function() {
		return this.addToStack( arrSlice.apply( this, arguments ),
			'extractRange', arrSlice.call(arguments).join("'+'") );
	},

	transform: function( transformFn ) {
		return this.addToStack( WebForge.transformElements(this, function( currentElem, indexPos ) {
			return transformFn.call( currentElem, indexPos, currentElem );
		}));
	},
	
	returnToPrevious: function() {
		return this.previousContext || WebForge(void 0);
	},

	push: arrPush,
	sort: new Array().sort,
	splice: new Array().splice
};

WebForge.proto.initialize.prototype = WebForge.proto;

WebForge.augment = WebForge.proto.augment = function() {
	var destinationObj = arguments[+[]] || new Object(), counter = +!+[], argCount = arguments.length, isDeep = !1, currentOptions, propName, sourceVal, copiedVal;

	if ( typeof destinationObj === 'boolean' ) {
		isDeep = destinationObj;
		destinationObj = arguments[+!+[]] || new Object();
		counter = 2;
	}

	if ( typeof destinationObj !== 'object' && !WebForge.isCallable(destinationObj) ) {
		destinationObj = new Object();
	}

	if ( argCount === counter ) {
		destinationObj = this;
		--counter;
	}

	for ( ; counter < argCount; counter++ ) {
		if ( (currentOptions = arguments[ counter ]) != void 0 ) {
			for ( propName in currentOptions ) {
				sourceVal = destinationObj[ propName ];
				copiedVal = currentOptions[ propName ];

				if ( destinationObj === copiedVal ) {
					continue;
				}

				if ( isDeep && copiedVal && ( WebForge.isPureObject(copiedVal) || WebForge.isCollection(copiedVal) ) ) {
					var clonedItem = sourceVal && ( WebForge.isPureObject(sourceVal) || WebForge.isCollection(sourceVal) ) ? sourceVal
						: WebForge.isCollection(copiedVal) ? new Array() : new Object();

					destinationObj[ propName ] = WebForge.augment( isDeep, clonedItem, copiedVal );

				} else if ( copiedVal !== undefVal ) {
					destinationObj[ propName ] = copiedVal;
				}
			}
		}
	}

	return destinationObj;
};

WebForge.augment({
	restoreGlobals: function( alsoForge ) {
		globalScope.$ = oldDollar;

		if ( alsoForge ) {
			globalScope.WebForge = oldForge;
		}

		return WebForge;
	},
	
	domIsLoaded: !1,
	
	domReady: function() {
		if ( !WebForge.domIsLoaded ) {
			if ( !mainDocument.body ) {
				return setTimeout( WebForge.domReady, 10 + 3 );
			}

			WebForge.domIsLoaded = !0;

			if ( pendingCallbacks ) {
				var currentFunc, idx = +[];
				while ( (currentFunc = pendingCallbacks[ idx++ ]) ) {
					currentFunc.call( mainDocument, WebForge );
				}

				pendingCallbacks = void 0;
			}

			if ( WebForge.proto.fireHandler ) {
				WebForge( mainDocument ).fireHandler( 'domready' );
			}
		}
	},
	
	attachDomLoadListeners: function() {
		if ( domReadyFlag ) {
			return;
		}

		domReadyFlag = !0;

		if ( mainDocument.readyState === 'complete' ) {
			return WebForge.domReady();
		}

		if ( mainDocument.addEventListener ) {
			mainDocument.addEventListener( 'DOMContentLoaded', domContentHandler, !1 );
			
			globalScope.addEventListener( 'load', WebForge.domReady, !1 );

		} else if ( mainDocument.attachEvent ) {
			mainDocument.attachEvent('onreadystatechange', domContentHandler);
			
			globalScope.attachEvent( 'onload', WebForge.domReady );

			var isTopLevel = !1;

			try {
				isTopLevel = globalScope.frameElement == void 0;
			} catch(e) {}

			if ( mainDocument.documentElement.doScroll && isTopLevel ) {
				checkScrollState();
			}
		}
	},

	isCallable: function( inputVal ) {
		return objToString.call(inputVal) === '[object Function]';
	},

	isCollection: function( inputVal ) {
		return objToString.call(inputVal) === '[object Array]';
	},

	isPureObject: function( inputVal ) {
		if ( !inputVal || objToString.call(inputVal) !== '[object Object]' || inputVal.nodeType || inputVal.setInterval ) {
			return !1;
		}
		
		if ( inputVal.constructor &&
			!ownPropCheck.call(inputVal, 'constructor') &&
			!ownPropCheck.call(inputVal.constructor.prototype, 'isPrototypeOf') ) {
			return !1;
		}
		
		var propKey;
		for ( propKey in inputVal ) {}
		
		return propKey === undefVal || ownPropCheck.call( inputVal, propKey );
	},

	isObjectEmpty: function( inputObj ) {
		for ( var propName in inputObj ) {
			return !1;
		}
		return !0;
	},
	
	throwError: function( errorMessage ) {
		throw errorMessage;
	},
	
	decodeJsonString: function( jsonString ) {