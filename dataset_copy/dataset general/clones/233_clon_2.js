( function () {
    "use strict";
    /*
     *  OneTimeBinding - Zero overhead data binding for AngularJS applications
     *  @version v0.3.3
     *  @projectLink https://github.com/Pasvaz/bindonce
     *  @author Pasquale Vazzana <pasqualevazzana@gmail.com>
     *  @licence MIT License, http://www.opensource.org/licenses/MIT
     */

    var oneTimeBindMod = angular.module( 'pasvaz.bindonce', [] );

    oneTimeBindMod.directive( 'singlePass', function () {
        // Helper function to convert various values to a boolean.
        var convertToBool = function ( valInput ) {
            if ( valInput && valInput.length !== 0 ) {
                var stringLowered = angular.lowercase( "" + valInput );
                valInput = !( stringLowered === 'f' || stringLowered === '0' || stringLowered === 'false' || stringLowered === 'no' || stringLowered === 'n' || stringLowered === '[]' );
            } else {
                valInput = false;
            }
            return valInput;
        };

        // Detect Internet Explorer version for specific workarounds.
        var legacyBrowserID = parseInt( ( /msie (\d+)/.exec( angular.lowercase( navigator.userAgent ) ) || [] )[ 1 ], 10 );
        if ( isNaN( legacyBrowserID ) ) {
            legacyBrowserID = parseInt( ( /trident\/.*; rv:(\d+)/.exec( angular.lowercase( navigator.userAgent ) ) || [] )[ 1 ], 10 );
        }

        var singlePassDirectiveDef = {
            restrict: "AM", // Attribute or Element
            controller: [ '$scope', '$element', '$attrs', '$interpolate', function ( currentScope, currentElement, currentAttributes, stringInterpolator ) {
                // Manages element visibility based on attribute and value.
                var displayToggleHandler = function ( targetElem, attrKey, attrValue ) {
                    var visibleStyle = ( attrKey === 'show' ) ? '' : 'none';
                    var hiddenStyle = ( attrKey === 'hide' ) ? '' : 'none';
                    targetElem.css( 'display', convertToBool( attrValue ) ? visibleStyle : hiddenStyle );
                };
                // Applies CSS classes to an element.
                var styleClassApplier = function ( targetElem, classValue ) {
                    if ( angular.isObject( classValue ) && !angular.isArray( classValue ) ) {
                        var collectedClasses = [];
                        angular.forEach( classValue, function ( isApplied, classKey ) {
                            if ( isApplied ) collectedClasses.push( classKey );
                        } );
                        classValue = collectedClasses;
                    }
                    if ( classValue ) {
                        targetElem.addClass( angular.isArray( classValue ) ? classValue.join( ' ' ) : classValue );
                    }
                };
                // Handles transclusion (inserting content).
                var embedContent = function ( contentTranscluder, childScope ) {
                    contentTranscluder.transclude( childScope, function ( clonedNodes ) {
                        var parentContainer = contentTranscluder.element.parent();
                        var lastNodeInTranscluder = contentTranscluder.element && contentTranscluder.element[ contentTranscluder.element.length - 1 ];
                        var actualParentNode = parentContainer && parentContainer[ 0 ] || lastNodeInTranscluder && lastNodeInTranscluder.parentNode;
                        var insertBeforeNode = ( lastNodeInTranscluder && lastNodeInTranscluder.nextSibling ) || null;
                        angular.forEach( clonedNodes, function ( domNode ) {
                            actualParentNode.insertBefore( domNode, insertBeforeNode );
                        } );
                    } );
                };

                // The main controller logic unit.
                var controlUnit = {
                    observationStopper: undefined, // Function to deregister the watcher.
                    operationQueue: [],            // List of pending binding operations.
                    collectionName: currentAttributes.boName, // Group name for this binder.
                    domNode: currentElement,       // The element associated with this directive.
                    executed: false,               // Flag indicating if binders have run.

                    // Adds a new binding operation to the queue.
                    addOperation: function ( bindingOperation ) {
                        this.operationQueue.push( bindingOperation );

                        // If already processed (e.g., late binding in nested structures), run immediately.
                        if ( this.executed ) {
                            this.processOperations();
                        }
                    },

                    // Sets up a watcher on the binding expression.
                    initiateObserver: function ( bindingExpression ) {
                        var selfReference = this;
                        this.observationStopper = currentScope.$watch( bindingExpression, function ( newValue ) {
                            if ( newValue === undefined ) return; // Ignore undefined values.
                            selfReference.terminateObserver(); // Stop watching once a value is received.
                            selfReference.verifyOneTimeBind( newValue ); // Process the binding.
                        }, true );
                    },

                    // Checks if the value is a promise and waits for it to resolve.
                    verifyOneTimeBind: function ( potentialPromise ) {
                        var selfReference = this, promiseCallback = ( potentialPromise.$promise ) ? potentialPromise.$promise.then : potentialPromise.then;
                        // For Angular 1.2+, promises are not undefined until resolved.
                        if ( typeof promiseCallback === 'function' ) {
                            promiseCallback( function () {
                                selfReference.processOperations(); // Run operations after promise resolution.
                            } );
                        } else {
                            selfReference.processOperations(); // Run immediately if not a promise.
                        }
                    },

                    // Removes the watcher if it exists.
                    terminateObserver: function () {
                        if ( this.observationStopper !== undefined ) {
                            this.observationStopper();
                            this.observationStopper = undefined;
                        }
                    },

                    // Executes all pending binding operations.
                    processOperations: function () {
                        while ( this.operationQueue.length > 0 ) {
                            var currentOperation = this.operationQueue.shift();
                            // Skip if group names don't match.
                            if ( this.collectionName && this.collectionName != currentOperation.collectionName ) continue;
                            var evaluatedValue = currentOperation.currentScope.$eval( ( currentOperation.interpolated ) ? stringInterpolator( currentOperation.valueExpression ) : currentOperation.valueExpression );
                            switch ( currentOperation.attributeKey ) {
                                case 'boIf':
                                    if ( convertToBool( evaluatedValue ) ) {
                                        embedContent( currentOperation, currentOperation.currentScope.$new() );
                                    }
                                    break;
                                case 'boSwitch':
                                    var matchingEmbeds, switchControl = currentOperation.controlInstances[ 0 ];
                                    if ( ( matchingEmbeds = switchControl.cases[ '!' + evaluatedValue ] || switchControl.cases[ '?' ] ) ) {
                                        currentOperation.currentScope.$eval( currentOperation.currentAttributes.change );
                                        angular.forEach( matchingEmbeds, function ( singleEmbed ) {
                                            embedContent( singleEmbed, currentOperation.currentScope.$new() );
                                        } );
                                    }
                                    break;
                                case 'boSwitchWhen':
                                    var controlRef = currentOperation.controlInstances[ 0 ];
                                    controlRef.cases[ '!' + currentOperation.currentAttributes.boSwitchWhen ] = ( controlRef.cases[ '!' + currentOperation.currentAttributes.boSwitchWhen ] || [] );
                                    controlRef.cases[ '!' + currentOperation.currentAttributes.boSwitchWhen ].push( { transclude: currentOperation.transcluder, element: currentOperation.domNode } );
                                    break;
                                case 'boSwitchDefault':
                                    var controlRefDefault = currentOperation.controlInstances[ 0 ];
                                    controlRefDefault.cases[ '?' ] = ( controlRefDefault.cases[ '?' ] || [] );
                                    controlRefDefault.cases[ '?' ].push( { transclude: currentOperation.transcluder, element: currentOperation.domNode } );
                                    break;
                                case 'hide':
                                case 'show':
                                    displayToggleHandler( currentOperation.domNode, currentOperation.attributeKey, evaluatedValue );
                                    break;
                                case 'class':
                                    styleClassApplier( currentOperation.domNode, evaluatedValue );
                                    break;
                                case 'text':
                                    currentOperation.domNode.text( evaluatedValue );
                                    break;
                                case 'html':
                                    currentOperation.domNode.html( evaluatedValue );
                                    break;
                                case 'style':
                                    currentOperation.domNode.css( evaluatedValue );
                                    break;
                                case 'disabled':
                                    currentOperation.domNode.prop( 'disabled', evaluatedValue );
                                    break;
                                case 'src':
                                    currentOperation.domNode.attr( currentOperation.attributeKey, evaluatedValue );
                                    if ( legacyBrowserID ) currentOperation.domNode.prop( 'src', evaluatedValue );
                                    break;
                                case 'attr':
                                    angular.forEach( currentOperation.currentAttributes, function ( attrVal, attrName ) {
                                        var newAttrKey, newValueExpr;
                                        if ( attrName.match( /^boAttr./ ) && currentOperation.currentAttributes[ attrName ] ) {
                                            newAttrKey = attrName.replace( /^boAttr/, '' ).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
                                            newValueExpr = currentOperation.currentScope.$eval( currentOperation.currentAttributes[ attrName ] );
                                            currentOperation.domNode.attr( newAttrKey, newValueExpr );
                                        }
                                    } );
                                    break;
                                case 'href':
                                case 'alt':
                                case 'title':
                                case 'id':
                                case 'value':
                                    currentOperation.domNode.attr( currentOperation.attributeKey, evaluatedValue );
                                    break;
                            }
                        }
                        this.executed = true; // Mark as processed.
                    }
                };

                angular.extend( this, controlUnit ); // Attach controller logic to instance.
            } ],

            link: function ( currentScope, elementNode, elementAttributes, singlePassCtrl ) {
                var initialValue = elementAttributes.singlePass && currentScope.$eval( elementAttributes.singlePass );
                if ( initialValue !== undefined ) {
                    singlePassCtrl.verifyOneTimeBind( initialValue ); // Process immediately if a value is present.
                } else {
                    singlePassCtrl.initiateObserver( elementAttributes.singlePass ); // Set up a watcher.
                    elementNode.bind( "$destroy", singlePassCtrl.terminateObserver ); // Clean up watcher on destroy.
                }
            }
        };

        return singlePassDirectiveDef;
    } );

    // Register various sub-directives for one-time binding.
    angular.forEach(
        [
            { directiveName: 'boShow', attribute: 'show' },
            { directiveName: 'boHide', attribute: 'hide' },
            { directiveName: 'boClass', attribute: 'class' },
            { directiveName: 'boText', attribute: 'text' },
            { directiveName: 'boBind', attribute: 'text' }, // Alias for boText
            { directiveName: 'boHtml', attribute: 'html' },
            { directiveName: 'boSrcI', attribute: 'src', interpolate: true },
            { directiveName: 'boSrc', attribute: 'src' },
            { directiveName: 'boHrefI', attribute: 'href', interpolate: true },
            { directiveName: 'boHref', attribute: 'href' },
            { directiveName: 'boAlt', attribute: 'alt' },
            { directiveName: 'boTitle', attribute: 'title' },
            { directiveName: 'boId', attribute: 'id' },
            { directiveName: 'boStyle', attribute: 'style' },
            { directiveName: 'boDisabled', attribute: 'disabled' },
            { directiveName: 'boValue', attribute: 'value' },
            { directiveName: 'boAttr', attribute: 'attr' },

            { directiveName: 'boIf', transclude: 'element', terminal: true, priority: 1000 },
            { directiveName: 'boSwitch', require: 'boSwitch', controller: function () { this.cases = {}; } },
            { directiveName: 'boSwitchWhen', transclude: 'element', priority: 800, require: '^boSwitch' },
            { directiveName: 'boSwitchDefault', transclude: 'element', priority: 800, require: '^boSwitch' }
        ],
        function ( configEntry ) {
            var subDirectivePrecedence = 200;
            return oneTimeBindMod.directive( configEntry.directiveName, function () {
                var directiveDefinition = {
                    priority: configEntry.priority || subDirectivePrecedence,
                    transclude: configEntry.transclude || false,
                    terminal: configEntry.terminal || false,
                    require: [ '^singlePass' ].concat( configEntry.require || [] ),
                    controller: configEntry.controller,
                    compile: function ( templateNode, templateAttributes, transcludeFn ) {
                        return function ( currentScope, elementNode, elementAttributes, ctrlInstances ) {
                            var parentSinglePassCtrl = ctrlInstances[ 0 ];
                            var groupIdentifier = elementAttributes.boParent;
                            if ( groupIdentifier && parentSinglePassCtrl.collectionName !== groupIdentifier ) {
                                var currentCheckingElement = parentSinglePassCtrl.domNode.parent();
                                parentSinglePassCtrl = undefined;
                                var ancestorCtrlValue;

                                // Traverse up the DOM to find the correct parent controller by group name.
                                while ( currentCheckingElement[ 0 ].nodeType !== 9 && currentCheckingElement.length ) {
                                    if ( ( ancestorCtrlValue = currentCheckingElement.data( '$bindonceController' ) )
                                        && ancestorCtrlValue.collectionName === groupIdentifier ) {
                                        parentSinglePassCtrl = ancestorCtrlValue;
                                        break;
                                    }
                                    currentCheckingElement = currentCheckingElement.parent();
                                }
                                if ( !parentSinglePassCtrl ) {
                                    throw new Error( "No matching one-time bind controller found for group: " + groupIdentifier );
                                }
                            }

                            // Add the current binding operation to the controller's queue.
                            parentSinglePassCtrl.addOperation( {
                                domNode: elementNode,
                                attributeKey: configEntry.attribute || configEntry.directiveName,
                                currentAttributes: elementAttributes,
                                valueExpression: elementAttributes[ configEntry.directiveName ],
                                interpolated: configEntry.interpolate,
                                collectionName: groupIdentifier,
                                transcluder: transcludeFn,
                                controlInstances: ctrlInstances.slice( 1 ),
                                currentScope: currentScope
                            } );
                        };
                    }
                };

                return directiveDefinition;
            } );
        }
    )
} )();