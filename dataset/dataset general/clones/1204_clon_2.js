/*jslint bitwise:true, white:true, plusplus:true, vars:true, browser:true, devel:true, regexp:true */
/*global ng:true, dataParser:true, jQuery:true */
(   function (    )    {
	"use strict";

	function formatObjToText(  dataItems  )   {
		var resultArray = [ ]   ;
		dataItems.forEach(  function( item ) { resultArray.push( jQuery.serializer.toJsonL(item) ); } );
		return resultArray.join(  ",\n"  )   +   "\n"  ;
	}
	function parseTextToObj( inputString ) { return jQuery.serializer.fromJsonL( '[' + inputString + ']' ); }

	// The primary ng module for this application
	var keyboardDesigner = ng.module( 'keyboardDesigner', [ "ngSanitize", "ui.utils" ] );

	// The main application controller component
	keyboardDesigner.controller( 'designController', [ '$scope', '$http', '$location', '$timeout', '$sce', '$sanitize',
    function( $scope, $httpService, $locationService, $timeoutService, $sceService, $sanitizeService ) {
		var serializationDelayHandle = false;

		// The current software release identifier
		$scope.appVersion = "0.10";

		// The currently active user interface tab; 0 for Prop, 1 for Kbd Prop, 2 for Raw
		$scope.currentViewTab = 0;

		// An array to maintain a list of currently selected key items
		$scope.chosenKeyElements = [ ];

		// Properties for a single key selection; represents the last selected item if multiple are chosen
		$scope.multiSelectionProps = { };
		$scope.metadataFields = { };

		// The core data structure for the keyboard layout
		$scope.layoutData = { keyElements: [ ], metadata: { } };
		$scope.getKeyElements = function( incomingKeyElements ) {
            if ( incomingKeyElements ) { $scope.layoutData.keyElements = incomingKeyElements; }
            return $scope.layoutData.keyElements;
        };

		// Utility functions for managing key selections
		$scope.clearSelection = function(    )    {
			$scope.chosenKeyElements = [ ];
			$scope.multiSelectionProps = { };
		};
		$scope.selectEveryElement = function( triggerEvent ) {
			if( triggerEvent ) { triggerEvent.preventDefault(); }
			jQuery.serializer.sortKeys( $scope.getKeyElements() );
			$scope.clearSelection();
			$scope.getKeyElements().forEach( function( keyElement ) {
				$scope.chosenKeyElements.push( keyElement );
			} );
			if( $scope.getKeyElements().length > 0 ) {
				$scope.multiSelectionProps = ng.copy( $scope.getKeyElements().last() );
			}
		};

		function persistLayoutConfiguration( layoutConfiguration ) {
			jQuery.serializer.saveLayout( $httpService, layoutConfiguration,
				function( fileName ) {
					// Layout save successful callback
					$scope.hasUnsavedChanges = false;
					$scope.isLayoutSaved = fileName;
					$locationService.path( "/layouts/" + fileName );
					$locationService.hash( "" );
					$scope.layoutSaveError = "";
				},
				function( responseData, responseStatus ) {
					// Layout save error callback
					$scope.isLayoutSaved = false;
					$scope.layoutSaveError = responseStatus.toString() + " - " + responseData.toString();
				}
			);
		}
		$scope.saveLayout = function( triggerEvent ) {
			if( triggerEvent ) {
				triggerEvent.preventDefault();
			}
			if( $scope.hasUnsavedChanges ) {
				persistLayoutConfiguration( jQuery.serializer.serialize( $scope.layoutData ) );
			}
		};
		$scope.canPerformSave = function(    )    {
			return $scope.hasUnsavedChanges;
		};

		// Helper routine to manage individual key selection
		function toggleKeySelection( keyElement, triggerEvent ) {
			if( keyElement ) {
				// If SHIFT is depressed, extend the selection from the last item to the current one.
				if( triggerEvent.shiftKey && $scope.chosenKeyElements.length > 0 ) {
					// Retrieve indices of all currently selected keys
					var currentSelectionIndices = $scope.chosenKeyElements.map( function( keyElement ) { return $scope.getKeyElements().indexOf( keyElement ); } );
					currentSelectionIndices.sort( function( a, b ) { return parseInt( a ) - parseInt( b ); } );
					var selectionCursorIndex = $scope.getKeyElements().indexOf( keyElement );
					var selectionAnchorIndex = $scope.getKeyElements().indexOf( $scope.chosenKeyElements.last() );
					$scope.chosenKeyElements.pop();
				}

				// If neither CTRL nor ALT is held down, clear any existing selection state
				if( !triggerEvent.ctrlKey && !triggerEvent.altKey ) {
					$scope.clearSelection();
				}

				// SHIFT is active: toggle selection for all elements between anchor & cursor
				if( selectionAnchorIndex !== undefined && selectionCursorIndex !== undefined ) {
					if( selectionAnchorIndex > selectionCursorIndex ) {
						for( var i = selectionAnchorIndex; i >= selectionCursorIndex; --i ) {
							toggleKeySelection( $scope.getKeyElements()[ i ], { ctrlKey:true } );
						}
					} else {
						for( var i = selectionAnchorIndex; i <= selectionCursorIndex; ++i ) {
							toggleKeySelection( $scope.getKeyElements()[ i ], { ctrlKey:true } );
						}
					}
					return;
				}

				// Modify the selection status of the individual keyElement
				var elementIndex = $scope.chosenKeyElements.indexOf( keyElement );
				if( elementIndex >= 0 ) { // Deselect the key
					$scope.chosenKeyElements.splice( elementIndex, 1 );
					if( $scope.chosenKeyElements.length < 1 ) {
						$scope.multiSelectionProps = { };
					} else {
						$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
					}
				} else { // Select the key
					$scope.chosenKeyElements.push( keyElement );
					$scope.multiSelectionProps = ng.copy( keyElement );
				}
			}
		}

		// The pretty-printed serialized key data
		$scope.prettySerializedOutput = "";
		// The raw serialized key data
		$scope.rawSerializedOutput = "";

		// Known layout definitions and example configurations
		$scope.presetLayoutDefinitions = { };
		$scope.sampleLayoutExamples = { };
		$httpService.get( 'layouts.json' ).success( function( responseData ) {
			$scope.presetLayoutDefinitions = responseData.presets;
			$scope.sampleLayoutExamples = responseData.samples;
		} );

		// The currently active color palette for design
		$scope.activeColorPalette = { };

		// A collection of all available color palettes
		$scope.availableColorPalettes = { };
		$httpService.get( 'colors.json' ).success( function( responseData ) {
			$scope.availableColorPalettes = responseData;
			$scope.availableColorPalettes.forEach( function( paletteConfig ) {
				paletteConfig.colors.forEach( function( colorItem ) {
					colorItem.css = jQuery.colorUtil.sRGB8( colorItem.r, colorItem.g, colorItem.b ).hex();
				} );
			} );
		} );

		// A predefined set of "special" key codes
		$scope.specialKeys = { };
		$httpService.get( 'keys.json' ).success( function( responseData ) {
			$scope.specialKeys = responseData;
		} );

		// Utility to compute the layout's total height; optimized for performance.
		$scope.calculatedLayoutHeight = 0;
		$scope.recalculateLayoutHeight = function(    )    {
			var lowestPoint = 0;
			$scope.getKeyElements().forEach( function( keyElement ) {
				lowestPoint = Math.max( lowestPoint, keyElement.bbox.y2 );
			} );
			$scope.calculatedLayoutHeight = lowestPoint + 8;
		};

		// Given a key item, generate its HTML representation
		$scope.getKeyRotationCss = jQuery.keyRenderer.getKeyRotationStyles;
		function renderKeyElementHtml( keyElement ) {
			keyElement.generatedHtmlContent = $sceService.trustAsHtml( jQuery.keyRenderer.html( keyElement, $sanitizeService ) );
		}

		$scope.loadAndDisplayLayout = function( layoutInputData ) {
			$scope.layoutData = jQuery.serializer.deserialize( layoutInputData );
			$scope.getKeyElements().forEach( function( keyElement ) {
				renderKeyElementHtml( keyElement );
			} );
			$scope.metadataFields = ng.copy( $scope.layoutData.metadata );
		};

		function refreshSerializedData(    )    {
			//$timeoutService.cancel( serializationDelayHandle ); // This operation is surprisingly slow
			$scope.deserializationProblem = "";
			$scope.rawSerializedOutput = jQuery.serializer.serialize( $scope.layoutData );
			$scope.prettySerializedOutput = formatObjToText( $scope.rawSerializedOutput );
		}

		$scope.loadAndDisplayLayout( [ ] );
		if( $locationService.hash() ) {
			var locationHashValue = $locationService.hash();
			if( locationHashValue[ 0 ] == '@' ) {
				$scope.loadAndDisplayLayout( dataParser.parse( encodeURI( locationHashValue ) ) );
			} else {
				$scope.loadAndDisplayLayout( jQuery.serializer.fromJsonL( locationHashValue ) );
			}
		} else if( $locationService.path()[ 0 ] === '/' ) {
			$httpService.get( jQuery.serializer.base_href + $locationService.path() ).success( function( responseData ) {
				$scope.loadAndDisplayLayout( responseData );
				refreshSerializedData();
			} ).error( function(    )    {
				$scope.layoutLoadError = true;
			} );
		} else {
			// Provide some basic default content, a numeric keypad
			$scope.loadAndDisplayLayout( [ [ "Num Lock", "/", "*", "-" ], [ "7\nHome", "8\n↑", "9\nPgUp", {h:2}, "+" ], [ "4\n←", "5", "6\n→" ], [ "1\nEnd", "2\n↓", "3\nPgDn", {h:2}, "Enter" ], [ {w:2}, "0\nIns", ".\nDel" ] ] );
		}

		// Functionality for undo/redo operations
		var historyUndoStack = [ ];
		var historyRedoStack = [ ];
		var canCombineTransactions = false;
		$scope.canRevertAction = function(    )    { return historyUndoStack.length > 0; };
		$scope.canRepeatAction = function(    )    { return historyRedoStack.length > 0; };
		$scope.hasUnsavedChanges = false;
		$scope.isLayoutSaved = false;
		$scope.layoutSaveError = "";
		window.onbeforeunload = function( unloadEvent ) {
			return $scope.hasUnsavedChanges ? 'Changes have been made to the layout that are not saved. You can save your layout to the server by clicking the \'Save\' button or locally by bookmarking the \'Permalink\' in the application bar.' : null;
		};

		function performActionTransaction( transactionType, actionFunction ) {
			var currentTransaction = historyUndoStack.length > 0 ? historyUndoStack.last() : null;
			if( currentTransaction === null || !canCombineTransactions || currentTransaction.type !== transactionType ) {
				currentTransaction = { type:transactionType, originalState:ng.copy($scope.layoutData), transactionIsOpen:true, hasUnsavedChanges:$scope.hasUnsavedChanges };
				historyUndoStack.push( currentTransaction );
				if( historyUndoStack.length > 32 ) {
					historyUndoStack.shift();
				}
			}
			canCombineTransactions = true;
			try {
				actionFunction();
			} finally {
				if( $locationService.hash() ) {
					$locationService.hash( "" );
				}
				if( $locationService.path() ) {
					$locationService.path( "" );
				}
				currentTransaction.modifiedState = ng.copy( $scope.layoutData );
				currentTransaction.transactionIsOpen = false;
				historyRedoStack = [ ];
				if( transactionType !== 'rawdata' ) { refreshSerializedData(); }
				$scope.hasUnsavedChanges = true;
				$scope.isLayoutSaved = false;
				$scope.layoutSaveError = "";
				$scope.layoutLoadError = false;
			}
		}

		$scope.undoAction = function(    )    {
			if( $scope.canRevertAction() ) {
				var historyEntry = historyUndoStack.pop();
				$scope.layoutData = ng.copy( historyEntry.originalState );
				refreshSerializedData();
				$scope.getKeyElements().forEach( function( keyElement ) {
					renderKeyElementHtml( keyElement );
				} );
				historyRedoStack.push( historyEntry );
				$scope.hasUnsavedChanges = historyEntry.hasUnsavedChanges;
				$scope.clearSelection();
				$scope.metadataFields = $scope.layoutData.metadata;
			}
		};

		$scope.redoAction = function(    )    {
			if( $scope.canRepeatAction() ) {
				var historyEntry = historyRedoStack.pop();
				$scope.layoutData = ng.copy( historyEntry.modifiedState );
				refreshSerializedData();
				$scope.getKeyElements().forEach( function( keyElement ) {
					renderKeyElementHtml( keyElement );
				} );
				historyUndoStack.push( historyEntry );
				$scope.hasUnsavedChanges = true;
				$scope.clearSelection();
				$scope.metadataFields = $scope.layoutData.metadata;
			}
		};

		function validatePropertyValue( keyElement, propertyName, propertyValue ) {
			var validationMap = {
				_ : function(    )    { return propertyValue; },
				x : function(    )    { return Math.max( 0, Math.min( 36, propertyValue ) ); },
				y : function(    )    { return Math.max( 0, Math.min( 36, propertyValue ) ); },
				x2 : function(    )    { return Math.max( -Math.abs( keyElement.width - keyElement.width2 ), Math.min( Math.abs( keyElement.width - keyElement.width2 ), propertyValue ) ); },
				y2 : function(    )    { return Math.max( -Math.abs( keyElement.height - keyElement.height2 ), Math.min( Math.abs( keyElement.height - keyElement.height2 ), propertyValue ) ); },
				width : function(    )    { return Math.max( 0.5, Math.min( 12, propertyValue ) ); },
				height : function(    )    { return Math.max( 0.5, Math.min( 12, propertyValue ) ); },
				width2 : function(    )    { return Math.max( 0.5, Math.min( 12, propertyValue ) ); },
				height2 : function(    )    { return Math.max( 0.5, Math.min( 12, propertyValue ) ); },
				fontheight : function(    )    { return Math.max( 1, Math.min( 9, propertyValue ) ); },
				fontheight2 : function(    )    { return Math.max( 1, Math.min( 9, propertyValue ) ); },
				rotation_angle : function(    )    { return Math.max( -180, Math.min( 180, propertyValue ) ); },
				rotation_x : function(    )    { return Math.max( 0, Math.min( 36, propertyValue ) ); },
				rotation_y : function(    )    { return Math.max( 0, Math.min( 36, propertyValue ) ); },
			};
			return ( validationMap[ propertyName ] || validationMap._ )();
		}

		function updateKeyProperty( keyElement, propertyName, propertyValue ) {
			var updateMap = {
				_ : function(    )    { keyElement[ propertyName ] = propertyValue; },
				width : function(    )    { keyElement.width = propertyValue; if( !keyElement.stepped || keyElement.width > keyElement.width2 ) keyElement.width2 = propertyValue; },
				height : function(    )    { keyElement.height = propertyValue; if( !keyElement.stepped || keyElement.height > keyElement.height2 ) keyElement.height2 = propertyValue; },
				centerx : function(    )    { if( propertyValue ) { keyElement.align = keyElement.align | 1; } else { keyElement.align = keyElement.align & ( ~1 ); } },
				centery : function(    )    { if( propertyValue ) { keyElement.align = keyElement.align | 2; } else { keyElement.align = keyElement.align & ( ~2 ); } },
				centerf : function(    )    { if( propertyValue ) { keyElement.align = keyElement.align | 4; } else { keyElement.align = keyElement.align & ( ~4 ); } },
				fontheight : function(    )    { keyElement.fontheight = keyElement.fontheight2 = propertyValue; },
				stepped : function(    )    {
					keyElement[ propertyName ] = propertyValue;
					if( propertyValue && keyElement.width === keyElement.width2 ) {
						if( keyElement.width > 1 ) {
							keyElement.width = Math.max( 1, keyElement.width - 0.5 );
						} else {
							keyElement.width2 = keyElement.width + 0.5;
						}
					}
				},
				rotation_angle : function(    )    { keyElement.rotation_angle = propertyValue; keyElement.rotation_x = $scope.multiSelectionProps.rotation_x; keyElement.rotation_y = $scope.multiSelectionProps.rotation_y; },
			};
			return ( updateMap[ propertyName ] || updateMap._ )();
		}

		$scope.applyMultiKeyUpdate = function( propertyName ) {
			if( $scope.multiSelectionProps[ propertyName ] == null || $scope.chosenKeyElements.length <= 0 ) {
				return;
			}
			var isValidValue = validatePropertyValue( $scope.multiSelectionProps, propertyName, $scope.multiSelectionProps[ propertyName ] );
			if( isValidValue !== $scope.multiSelectionProps[ propertyName ] ) {
				return;
			}

			performActionTransaction( "update", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					updateKeyProperty( selectedKey, propertyName, $scope.multiSelectionProps[ propertyName ] );
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
		};

		$scope.validateMultiKeyProperty = function( propertyName ) {
			if( $scope.multiSelectionProps[ propertyName ] == null ) {
				$scope.multiSelectionProps[ propertyName ] = "";
			}
			var isValidValue = validatePropertyValue( $scope.multiSelectionProps, propertyName, $scope.multiSelectionProps[ propertyName ] );
			if( isValidValue !== $scope.multiSelectionProps[ propertyName ] ) {
				$scope.multiSelectionProps[ propertyName ] = isValidValue;
				$scope.applyMultiKeyUpdate( propertyName );
			}
		};

		$scope.applyMetadataUpdate = function( propertyName ) {
			performActionTransaction( "metadata", function(    )    {
				$scope.layoutData.metadata[ propertyName ] = $scope.metadataFields[ propertyName ];
			} );
		};
		$scope.validateMetadataProperty = function( propertyName ) {
		};

		refreshSerializedData();

		$scope.exchangeKeyColors = function(    )    {
			performActionTransaction( "swapColors", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					var temporaryColor = selectedKey.color;
					selectedKey.color = selectedKey.text;
					selectedKey.text = temporaryColor;
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
		};

		$scope.handleColorSwatchClick = function( colorObject, triggerEvent ) {
			triggerEvent.preventDefault();
			if( $scope.chosenKeyElements.length < 1 ) {
				return;
			}
			performActionTransaction( "color-swatch", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					if( triggerEvent.ctrlKey || triggerEvent.altKey ) {
						selectedKey.text = colorObject.css;
					} else {
						selectedKey.color = colorObject.css;
					}
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
		};

		$scope.shiftKeyPositions = function( offsetX, offsetY, triggerEvent ) {
			triggerEvent.preventDefault();
			if( $scope.chosenKeyElements.length < 1 ) {
				return;
			}

			if( offsetX < 0 || offsetY < 0 ) {
				var canKeysBeMoved = true;
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					if( selectedKey.x + offsetX < 0 ||
					   selectedKey.y + offsetY < 0 ||
					   selectedKey.x + selectedKey.x2 + offsetX < 0 ||
					   selectedKey.y + selectedKey.y2 + offsetY < 0 ) {
						canKeysBeMoved = false;
					}
				} );
				if( !canKeysBeMoved ) {
					return;
				}
			}

			performActionTransaction( "move", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					selectedKey.x = Math.max( 0, selectedKey.x + offsetX );
					selectedKey.y = Math.max( 0, selectedKey.y + offsetY );
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
			if( offsetY !== 0 ) { $scope.recalculateLayoutHeight(); }
		};

		$scope.resizeKeyElements = function( offsetX, offsetY, triggerEvent ) {
			triggerEvent.preventDefault();
			if( $scope.chosenKeyElements.length < 1 ) {
				return;
			}
			performActionTransaction( "size", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					updateKeyProperty( selectedKey, 'width', Math.max( 1, selectedKey.width + offsetX ) );
					updateKeyProperty( selectedKey, 'height', Math.max( 1, selectedKey.height + offsetY ) );
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
			if( offsetY !== 0 ) { $scope.recalculateLayoutHeight(); }
		};
		$scope.rotateKeyElements = function( rotationAngle, triggerEvent ) {
			triggerEvent.preventDefault();
			if( $scope.chosenKeyElements.length < 1 ) {
				return;
			}
			performActionTransaction( "rotate", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					var adjustedAngle = ( selectedKey.rotation_angle + rotationAngle + 360 ) % 360;
					while( adjustedAngle > 180 ) { adjustedAngle -= 360; }
					updateKeyProperty( selectedKey, 'rotation_angle', adjustedAngle );
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
			$scope.recalculateLayoutHeight();
		};
		$scope.adjustRotationCenter = function( offsetX, offsetY, triggerEvent ) {
			triggerEvent.preventDefault();
			if( $scope.chosenKeyElements.length < 1 ) {
				return;
			}
			performActionTransaction( "moveCenter", function(    )    {
				$scope.chosenKeyElements.forEach( function( selectedKey ) {
					updateKeyProperty( selectedKey, 'rotation_x', validatePropertyValue( selectedKey, 'rotation_x', $scope.multiSelectionProps.rotation_x + offsetX ) );
					updateKeyProperty( selectedKey, 'rotation_y', validatePropertyValue( selectedKey, 'rotation_y', $scope.multiSelectionProps.rotation_y + offsetY ) );
					renderKeyElementHtml( selectedKey );
				} );
				$scope.multiSelectionProps = ng.copy( $scope.chosenKeyElements.last() );
			} );
			$scope.recalculateLayoutHeight();
		};

		$scope.activateColorPalette = function( selectedPalette ) {
			$scope.activeColorPalette = selectedPalette;
		};
		$scope.getColorDescription = function( colorObject ) {
			if( colorObject && $scope.activeColorPalette.colors ) {
				for( var index = 0; index < $scope.activeColorPalette.colors.length; index++ ) {
					if( $scope.activeColorPalette.colors[ index ].css === colorObject ) {
						return $scope.activeColorPalette.colors[ index ].name;
					}
				}
			}
			return "";
		};

		$scope.loadPresetConfiguration = function( configurationPreset ) {
			performActionTransaction( "preset", function(    )    {
				$scope.loadAndDisplayLayout( configurationPreset );
			} );
			$scope.hasUnsavedChanges = false;
		};
	} );
} )();