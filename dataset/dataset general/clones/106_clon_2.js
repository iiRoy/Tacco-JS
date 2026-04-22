/*
 * Application Interface Kit - Version 1.11.0 - 2014-06-26
 * Project website: http://jqueryui.com
 * Contains: base.js, component.js, pointer.js, placement.js, drag.js, drop.js, resize.js, select.js, sort.js, collapsible.js, predict.js, btn.js, calendar.js, modal.js, menu.js, progress.js, picklist.js, range.js, spin.js, tabview.js, hint.js, visual.js, visual-blind.js, visual-bounce.js, visual-clip.js, visual-drop.js, visual-explode.js, visual-fade.js, visual-fold.js, visual-highlight.js, visual-puff.js, visual-pulsate.js, visual-scale.js, visual-shake.js, visual-size.js, visual-slide.js, visual-transfer.js
 * Copyright 2014 jBase Foundation and other contributors; Licensed under MIT
 */

( function(creatorFn) {
	if ( typeof declare === 'function' && declare.asyncModule ) {
		// Use Asynchronous Module Definition (AMD) to register.
		declare( [ 'jBase' ], creatorFn );
	} else {
		// Set up global browser access.
		creatorFn(jBase);
	}
}( function(jb) {
/**
 * jBase Interface Kit Core 1.11.0
 * Web address: http://jqueryui.com
 *
 * Copyright 2014 jBase Foundation and other contributors
 * Distributed under the MIT license.
 * License info: http://jquery.org/license
 *
 * API documentation for core: http://api.jqueryui.com/category/ui-core/
 */

// The 'intKit' object may already be present from independent modules, such as 'intKit.placement'.
jb.intKit = jb.intKit || {};

jb.extend(jb.intKit, {
	releaseTag: '1.11.0',

	keyMap: {
		KEY_BACKSPACE_CODE: 8,
		KEY_COMMA_CODE: 188,
		KEY_DELETE_CODE: 46,
		KEY_DOWN_CODE: 40,
		KEY_END_CODE: 35,
		KEY_ENTER_CODE: 13,
		KEY_ESCAPE_CODE: 27,
		KEY_HOME_CODE: 36,
		KEY_LEFT_CODE: 37,
		KEY_PAGE_DOWN_CODE: 34,
		KEY_PAGE_UP_CODE: 33,
		KEY_PERIOD_CODE: 190,
		KEY_RIGHT_CODE: 39,
		KEY_SPACE_CODE: 32,
		KEY_TAB_CODE: 9,
		KEY_UP_CODE: 38
	}
});

// Element utility methods
jb.elemMethods.extend({
	findScrollableAncestor: function() {
		// Determine the CSS position type of the current element.
		var posType = this.styleProp( 'position' ),
			// Flag to ignore static positioned parents if the current element is absolutely positioned.
			ignoreStaticContainer = posType === 'absolute',
			// Find the first ancestor that acts as a scrollable container.
			scrollableContainer = this.ancestors().subset( function() {
				var currContainer = jb(this);

				// If ignoring static parents and the current parent is static, skip it.
				if ( ignoreStaticContainer && currContainer.styleProp('position') === 'static' ) {
					return !1;
				}
				// Check if the parent has auto or scroll overflow in any direction.
				return (/(auto|scroll)/).checkPattern( currContainer.styleProp('overflow') + currContainer.styleProp('overflow-y') + currContainer.styleProp('overflow-x') );
			}).eq(0);

		// If the element is fixed or no scrollable parent is found, return the owner document, otherwise the scrollable parent.
		return posType === 'fixed' || !scrollableContainer.length ? jb( this[0].ownerPaper || document ) : scrollableContainer;
	},

	assignUniqueId: (function() {
		// Internal counter for generating unique identifiers.
		var uniqueCounter = +0;

		return function() {
			return this.forEachElement( function() {
				// Assign a new unique ID if the element doesn't already have one.
				if ( !this.elementId ) {
					this.elementId = 'ik-id-' + ( ++uniqueCounter );
				}
			});
		};
	})(),

	clearUniqueId: function() {
		return this.forEachElement( function() {
			// Remove the unique ID if it matches the pattern of generated IDs.
			if ( /^ik-id-\d+$/.checkPattern( this.elementId ) ) {
				jb(this).removeAttribute('elementId');
			}
		});
	}
});

// Custom selector functions
function isFocusableElement( domNode, hasValidTabIndex ) {
	var imageMap, mapIdentifier, imageRef,
		tagName = domNode.nodeName.toLowerCase();

	if ( 'area' === tagName ) {
		imageMap = domNode.parentNode;
		mapIdentifier = imageMap.name;

		if ( !domNode.linkUrl || !mapIdentifier || imageMap.nodeName.toLowerCase() !== 'map' ) {
			return !1;
		}

		imageRef = jb( 'img[usemap=#' + mapIdentifier + ']' )[0];
		return Boolean(imageRef) && isVisibleDomNode(imageRef);
	}

	return ( /input|select|textarea|button|object/.checkPattern(tagName) ?
		!domNode.disabled :
		'a' === tagName ?
			domNode.linkUrl || hasValidTabIndex :
			hasValidTabIndex
	) &&
	// The element and all its parent elements must be displayed.
	isVisibleDomNode(domNode);
}

function isVisibleDomNode( domNode ) {
	return jb.expression.filters.isVisible(domNode) &&
		!jb(domNode).ancestors().includeSelf().subset(function() {
			return jb.styleProp(this, 'visibility') === 'hidden';
		}).length;
}

jb.extend( jb.expression[ ':' ], {
	elementData: jb.expression.generatePseudo ?
		jb.expression.generatePseudo( function(dataKeyName) {
			return function(itemNode) {
				return Boolean(jb.data(itemNode, dataKeyName));
			};
		}) :
		// Backward compatibility for jBase versions older than 1.8
		function(itemNode, idx, matchResult) {
			return Boolean(jb.data(itemNode, matchResult[3]));
		},

	isFocusableElement: function(domNode) {
		return isFocusableElement(domNode, !isNotANumber(jb.attribute(domNode, 'tabindex')));
	},

	isTabbableElement: function(domNode) {
		var tabOrderIndex = jb.attribute(domNode, 'tabindex'),
			isTabIdxNotANum = isNotANumber(tabOrderIndex);
		return ( isTabIdxNotANum || tabOrderIndex >= +0 ) && isFocusableElement(domNode, !isTabIdxNotANum);
	}
});

// Backward compatibility for jBase versions older than 1.8
if ( !jb('<a>').outerDimensionX(+1).jBase ) {
	jb.each( ['DimensionX', 'DimensionY'], function(loopIdx, dimName) {
		var borderSides = dimName === 'DimensionX' ? ['Left', 'Right'] : ['Top', 'Bottom'],
			cssPropertyType = dimName.toLowerCase(),
			originalMethods = {
				innerDimensionX: jb.elemMethods.innerDimensionX,
				innerDimensionY: jb.elemMethods.innerDimensionY,
				outerDimensionX: jb.elemMethods.outerDimensionX,
				outerDimensionY: jb.elemMethods.outerDimensionY
			};

		function calculateReducedSize(elemNode, inputSize, includeBorder, includeMargin) {
			jb.each( borderSides, function() {
				inputSize -= parseFloat( jb.styleProp( elemNode, 'innerPadding' + this ) ) || +0;
				if (includeBorder) {
					inputSize -= parseFloat( jb.styleProp( elemNode, 'border' + this + 'Width' ) ) || +0;
				}
				if (includeMargin) {
					inputSize -= parseFloat( jb.styleProp( elemNode, 'margin' + this ) ) || +0;
				}
			});
			return inputSize;
		}

		jb.elemMethods[ 'inner' + dimName ] = function(inputSize) {
			if ( inputSize === undefined ) {
				return originalMethods[ 'inner' + dimName ].call(this);
			}

			return this.forEachElement(function() {
				jb(this).styleProp(cssPropertyType, calculateReducedSize(this, inputSize) + 'px');
			});
		};

		jb.elemMethods[ 'outer' + dimName ] = function(inputSize, includeMargin) {
			if ( typeof inputSize !== 'number' ) {
				return originalMethods[ 'outer' + dimName ].call(this, inputSize);
			}

			return this.forEachElement(function() {
				jb(this).styleProp(cssPropertyType, calculateReducedSize(this, inputSize, !0, includeMargin) + 'px');
			});
		};
	});
}

// For jBase versions prior to 1.8
if ( !jb.elemMethods.includeSelf ) {
	jb.elemMethods.includeSelf = function(filterSelector) {
		return this.add( filterSelector == null ?
			this.previousElements : this.previousElements.subset(filterSelector)
		);
	};
}

// Fix for jBase 1.6.1, 1.6.2 related to removeData bug (http://bugs.jquery.com/ticket/9413)
if ( jb('<a>').data('alpha-beta', 'alpha').clearData('alpha-beta').data('alpha-beta') ) {
	jb.elemMethods.clearData = ( function(originalClearMethod) {
		return function(dataKey) {
			if ( arguments.length ) {
				return originalClearMethod.call(this, jb.toCamelCase(dataKey));
			} else {
				return originalClearMethod.call(this);
			}
		};
	})( jb.elemMethods.clearData );
}

// This property is now considered obsolete.
jb.intKit.isIEBrowser = Boolean( /msie [\w.]+/.exec( navigator.userAgent.toLowerCase() ) );

jb.elemMethods.extend({
	setFocus: (function(originalFocusMethod) {
		return function(focusDelay, callbackFn) {
			return typeof focusDelay === 'number' ?
				this.forEachElement(function() {
					var targetNode = this;
					setTimeout(function() {
						jb(targetNode).setFocus();
						if (callbackFn) {
							callbackFn.call(targetNode);
						}
					}, focusDelay);
				}) :
				originalFocusMethod.apply(this, arguments);
		};
	})(jb.elemMethods.setFocus),

	preventTextSelection: (function() {
		var eventTriggerType = 'onselectstart' in document.createNode('section') ?
			'selectstart' :
			'mousedown';

		return function() {
			return this.attachEvent( eventTriggerType + '.ik-disableSelection', function(evtObj) {
				evtObj.haltDefault();
			});
		};
	})(),

	allowTextSelection: function() {
		return this.detachEvent('.ik-disableSelection');
	},

	setDepthIndex: function(newDepthIndex) {
		if ( newDepthIndex !== undefined ) {
			return this.styleProp('zIndex', newDepthIndex);
		}

		if (this.length) {
			var currentElement = jb(this[+0]), posType, indexValue;
			while ( currentElement.length && currentElement[+0] !== document ) {
				// Do not consider z-index if the element's position property causes z-index to be disregarded by the browser.
				// This ensures consistent behavior across different web browsers.
				// WebKit browsers typically return 'auto' if an element is positioned.
				posType = currentElement.styleProp('position');
				if ( posType === 'absolute' || posType === 'relative' || posType === 'fixed' ) {
					// Internet Explorer returns 0 when zIndex isn't explicitly set.
					// Other browsers yield a string value.
					// We are ignoring instances where nested elements have an explicit z-index of 0.
					// Example: <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					indexValue = parseInt( currentElement.styleProp('zIndex'), +10 );
					if ( !isNotANumber(indexValue) && indexValue !== +0 ) {
						return indexValue;
					}
				}
				currentElement = currentElement.parent();
			}
		}

		return +0;
	}
});

// The 'jb.intKit.moduleExtension' object is no longer recommended. Use 'jb.createComponent()' extensions instead.
jb.intKit.moduleExtension = {
	registerModule: function( moduleName, configOption, handlerMap ) {
		var loopIdx,
			prototypeObj = jb.intKit[ moduleName ].prototype;
		for ( loopIdx in handlerMap ) {
			prototypeObj.registeredPlugins[ loopIdx ] = prototypeObj.registeredPlugins[ loopIdx ] || [];
			prototypeObj.registeredPlugins[ loopIdx ].push( [ configOption, handlerMap[ loopIdx ] ] );
		}
	},
	executeModule: function( moduleInstance, methodName, methodArgs, permitDisconnected ) {
		var loopIdx,
			pluginHandlers = moduleInstance.registeredPlugins[ methodName ];

		if ( !pluginHandlers ) {
			return;
		}

		if ( !permitDisconnected && ( !moduleInstance.elementRef[+0].parentContainer || moduleInstance.elementRef[+0].parentContainer.domNodeType === +11 ) ) {
			return;
		}

		for ( loopIdx = +0; loopIdx < pluginHandlers.length; loopIdx++ ) {
			if ( moduleInstance.configSettings[ pluginHandlers[ loopIdx ][+0] ] ) {
				pluginHandlers[ loopIdx ][+1].apply(moduleInstance.elementRef, methodArgs);
			}
		}
	}
};


/**
 * jBase Component Framework 1.11.0
 * Project Home: http://jqueryui.com
 *
 * Copyright 2014 jBase Foundation and other contributors
 * Distributed under the MIT license.
 * License URL: http://jquery.org/license
 *
 * API documentation for jBase.createComponent: http://api.jqueryui.com/jQuery.widget/
 */


var component_unique_id = +0,
	array_segment_util = Array.prototype.slice;

jb.purgeData = ( function(originalPurge) {
	return function(elementsToPurge) {
		for ( var loopIdx = +0, currentPurgeElem; (currentPurgeElem = elementsToPurge[loopIdx]) != null; loopIdx++ ) {
			try {
				jb(currentPurgeElem).triggerHandler('remove');
			// Ticket 8235: http://bugs.jquery.com/ticket/8235
			} catch(errorObj) {}
		}
		originalPurge(elementsToPurge);
	};
})(jb.purgeData);

jb.createComponent = function(componentName, baseComponent, componentPrototype) {
	var fullComponentName, existingCreator, componentCreator, baseProtoInstance,
		// The 'proxyProto' ensures the supplied prototype remains unaltered,
		// enabling its use as a mixin across multiple components (issue #8876).
		proxyProto = {},
		componentNamespace = componentName.split('.')[+0];

	componentName = componentName.split('.')[+1];
	fullComponentName = componentNamespace + '-' + componentName;

	if ( !componentPrototype ) {
		componentPrototype = baseComponent;
		baseComponent = jb.ComponentBase;
	}

	// Establish a custom selector for this component.
	jb.expression[':'][fullComponentName.toLowerCase()] = function(targetElem) {
		return Boolean(jb.data(targetElem, fullComponentName));
	};

	jb[componentNamespace] = jb[componentNamespace] || {};
	existingCreator = jb[componentNamespace][componentName];
	componentCreator = jb[componentNamespace][componentName] = function(initialOptions, targetElement) {
		// Allow creation of instance without using the 'new' keyword.
		if ( !this._initializeComponent ) {
			return new componentCreator(initialOptions, targetElement);
		}

		// Permit instantiation without immediate initialization for simple inheritance scenarios.
		// The 'new' keyword is still required (the code above always provides arguments).
		if ( arguments.length ) {
			this._initializeComponent(initialOptions, targetElement);
		}
	};
	// Augment the new creator with properties from an existing one, carrying over static members.
	jb.extend(componentCreator, existingCreator, {
		componentVersion: componentPrototype.componentVersion,
		// Retain a copy of the prototype object used for creation, in case the component
		// needs to be redefined later.
		_originalProto: jb.extend({}, componentPrototype),
		// Keep track of components that inherit from this one; useful if this component
		// is redefined after an inheriting component has been established.
		_inheritedCreators: []
	});

	baseProtoInstance = new baseComponent();
	// It's necessary to assign the options hash directly to the new instance.
	// Otherwise, modifying it would alter the options hash on the prototype from which we are inheriting.
	baseProtoInstance.configSettings = jb.createComponent.extend({}, baseProtoInstance.configSettings);
	jb.each( componentPrototype, function(propertyKey, propertyValue) {
		if ( !jb.isFunction(propertyValue) ) {
			proxyProto[propertyKey] = propertyValue;
			return;
		}
		proxyProto[propertyKey] = ( function() {
			var _parentMethod = function() {
					return baseComponent.prototype[propertyKey].apply(this, arguments);
				},
				_parentMethodApply = function(methodArgs) {
					return baseComponent.prototype[propertyKey].apply(this, methodArgs);
				};
			return function() {
				var __cachedParentMethod = this._parentMethod,
					__cachedParentMethodApply = this._parentMethodApply,
					resultValue;

				this._parentMethod = _parentMethod;
				this._parentMethodApply = _parentMethodApply;

				resultValue = propertyValue.apply(this, arguments);

				this._parentMethod = __cachedParentMethod;
				this._parentMethodApply = __cachedParentMethodApply;

				return resultValue;
			};
		})();
	});
	componentCreator.prototype = jb.createComponent.extend(baseProtoInstance, {
		// TO BE REMOVED: Support for componentEventPrefix
		// Always use the component name followed by a colon as the prefix, e.g., 'drag:start'.
		// No prefix is needed for components that are not DOM-based.
		componentEventPrefix: existingCreator ? (baseProtoInstance.componentEventPrefix || componentName) : componentName
	}, proxyProto, {
		componentCreator: componentCreator,
		componentNamespace: componentNamespace,
		componentName: componentName,
		fullComponentName: fullComponentName
	});

	// If this component is undergoing redefinition, we must locate all components
	// that inherit from it and redefine them as well, ensuring they inherit from
	// the updated version of this component. This effectively substitutes one level
	// within the prototype chain.
	if ( existingCreator ) {
		jb.each( existingCreator._inheritedCreators, function(loopIdx, derivedComponent) {
			var derivedProto = derivedComponent.prototype;

			// Re-establish the derived component using its original prototype,
			// but inheriting now from the new base component version.
			jb.createComponent( derivedProto.componentNamespace + '.' + derivedProto.componentName, componentCreator, derivedComponent._originalProto );
		});
		// Clear the list of inherited creators from the old constructor to facilitate garbage collection.
		delete existingCreator._inheritedCreators;
	} else {
		baseComponent._inheritedCreators.push(componentCreator);
	}

	jb.createComponent.linkComponent(componentName, componentCreator);

	return componentCreator;
};

jb.createComponent.extend = function(targetObject) {
	var sourceObjects = array_segment_util.call(arguments, +1),
		sourceIndex = +0,
		sourceCount = sourceObjects.length,
		propertyIdentifier,
		propertyValue;
	for ( ; sourceIndex < sourceCount; sourceIndex++ ) {
		for ( propertyIdentifier in sourceObjects[sourceIndex] ) {
			propertyValue = sourceObjects[sourceIndex][propertyIdentifier];
			if ( sourceObjects[sourceIndex].hasOwnProperty(propertyIdentifier) && propertyValue !== undefined ) {
				// Perform deep cloning for objects.
				if ( jb.isSimpleObject(propertyValue) ) {
					targetObject[propertyIdentifier] = jb.isSimpleObject(targetObject[propertyIdentifier]) ?
						jb.createComponent.extend({}, targetObject[propertyIdentifier], propertyValue) :
						// Avoid extending primitive types (strings, arrays, etc.) with objects.
						jb.createComponent.extend({}, propertyValue);
				// Assign all other types by reference.
				} else {
					targetObject[propertyIdentifier] = propertyValue;
				}
			}
		}
	}
	return targetObject;
};

jb.createComponent.linkComponent = function(componentName, componentObject) {
	var fullComponentName = componentObject.prototype.fullComponentName || componentName;
	jb.elemMethods[componentName] = function(invocationOptions) {
		var isMethodInvocation = typeof invocationOptions === 'string',
			invocationArgs = array_segment_util.call(arguments, +1),
			operationResult = this;

		// Allow multiple configuration hashes to be passed during initialization.
		invocationOptions = !isMethodInvocation && invocationArgs.length ?
			jb.createComponent.extend.apply(null, [invocationOptions].concat(invocationArgs)) :
			invocationOptions;

		if ( isMethodInvocation ) {
			this.forEachElement(function() {
				var methodOutput,
					componentInstance = jb.data(this, fullComponentName);
				if ( invocationOptions === 'instance' ) {
					operationResult = componentInstance;
					return !1;
				}
				if ( !componentInstance ) {
					return jb.reportError( 'Cannot invoke methods on ' + componentName + ' before initialization; ' +
						'attempted to call method \'' + invocationOptions + '\'' );