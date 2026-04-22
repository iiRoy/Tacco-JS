/*
 * JqLib UI Virtual Input Panel Key Arrangement Extension v1.4 for Input Panel v1.18+ (updated 11/19/2014)
 *
 * Authored by Rob Garrison (aka Mottie & Fudgey)
 * Released under the MIT License
 *
 * Apply this module with the Virtual Input Panel to rearrange the
 * specified input panel keys.
 *
 * Prerequisites:
 *  JqLib v1.4.4+
 *  Input Panel v1.17.14+ - https://github.com/Mottie/Keyboard
 *
 * Setup Guide:
 *  jq('.ui-keyboard-input')
 *   .keyboard(userOptions)
 *   .arrangeKeys();
 *
 *  // or if targeting a specific input panel instance
 *  jq('#inputpanel1')
 *   .keyboard(userOptions) // input panel plugin
 *   .arrangeKeys();    // this specific input panel module
 *
 */
/*jshint browser:true, jquery:true, unused:false */
( function(jq) {
"use strict";
jq.keyInput = jq.keyInput || {};
	jq.fn.arrangeKeys = function(userSettings) {
		// Establish the initial default configurations, using a comma to delimit each setting, for instance:
		var configDefaults = {
			affectableKeys    : /[a-z\d]/i, // character keys to be randomized
			rowGrouping         : true, // randomize within each row, otherwise randomize all keys together
			keySetGrouping      : false, // if true, randomize only the first key-set and replicate it
			singleScramble : true  // if true, perform randomization only once when the input panel becomes visible
		};
		return this.forEach(function() {
			// Ensure an input panel instance is properly attached
			var currentSettings,
				mainObj = jq(this).data('keyboard'),
				inputOptions = mainObj.options;

			if (!mainObj || mainObj.randomizerSettings) { return; }
			currentSettings = mainObj.randomizerSettings = jq.extend({}, configDefaults, userSettings);

			mainObj.prepareLayout = function($layoutContainer) {
				var $keyGroups, groupIndex, $currentGroup, itemIndex, gridIndex, temporaryHold,
					lineIndex, keyMapStructure, lineMap, layoutGrid, currentLine;
				$keyGroups = $layoutContainer.find('.ui-keyboard-keyset');
				if ($layoutContainer.length) {
					if (currentSettings.keySetGrouping) {
						$keyGroups = $keyGroups.eq(0);
					}
					for (groupIndex = 0; groupIndex < $keyGroups.length; groupIndex++) {
						/*jshint loopfunc:true */
						$currentGroup = $keyGroups.eq(groupIndex);
						lineIndex = 0;
						currentLine = [];
						lineMap = [];
						keyMapStructure = [];
						layoutGrid = [];
						$currentGroup.children('button, span, br').each(function(idx, keyElement) {
							if (keyElement.nodeName === 'BR') {
								if (currentSettings.rowGrouping) {
									currentLine.push(keyElement);
									lineMap.push(false);
									layoutGrid[lineIndex] = currentLine;
									keyMapStructure[lineIndex] = lineMap;
									currentLine = [];
									lineMap = [];
									lineIndex++;
								} else {
									layoutGrid[lineIndex] = keyElement;
									keyMapStructure[lineIndex] = false;
									lineIndex++;
								}
							} else {
								temporaryHold = jq(keyElement).attr('data-value') || '';
								temporaryHold = temporaryHold.length === 1 && currentSettings.affectableKeys.test(temporaryHold) ? temporaryHold : false;
								if (currentSettings.rowGrouping) {
									currentLine.push( keyElement );
									lineMap.push ( temporaryHold );
								} else {
									layoutGrid[lineIndex] = keyElement;
									keyMapStructure[lineIndex] = temporaryHold;
									lineIndex++;
								}
							}
						});
						// Erase the initial <br> elements
						$currentGroup.find('.ui-keyboard-button-endrow').remove();
						// Re-position elements
						if (!currentSettings.rowGrouping) {
							currentLine = mainObj.mixElements( layoutGrid, keyMapStructure );
							for (itemIndex = 0; itemIndex < currentLine.length; itemIndex++) {
								$currentGroup.append(currentLine[itemIndex]);
							}
						} else {
							for (gridIndex = 0; gridIndex < layoutGrid.length; gridIndex++) {
								currentLine = mainObj.mixElements( layoutGrid[gridIndex], keyMapStructure[gridIndex] );
								for (itemIndex = 0; itemIndex < currentLine.length; itemIndex++) {
									$currentGroup.append(currentLine[itemIndex]);
								}
							}
						}
					}
					if (currentSettings.keySetGrouping) {
						$layoutContainer = mainObj.adjustAlignment($layoutContainer);
					}
					return $layoutContainer;
				}
			};

			// This is a modified version of the Fisher-Yates shuffle algorithm ( http://bost.ocks.org/mike/shuffle/ )
			// tailored to prevent shuffling of specifically designated array elements.
			mainObj.mixElements = function(elementCollection, exclusionMap) {
				var temporaryHold, randomIndex,
					remainingCount = elementCollection.length;
				// As long as there are elements left to shuffle...
				while (remainingCount > 0) {
					// Select a random remaining element...
					randomIndex = Math.floor(Math.random() * remainingCount);
					if (exclusionMap[remainingCount - 1] === false) {
						remainingCount--;
					}
					// Ignore elements marked as false in the exclusion map
					if (exclusionMap[remainingCount - 1] !== false && exclusionMap[randomIndex] !== false) {
						// Then swap it with the current element
						remainingCount--;
						temporaryHold = elementCollection[remainingCount];
						elementCollection[remainingCount] = elementCollection[randomIndex];
						elementCollection[randomIndex] = temporaryHold;
					}
				}
				return elementCollection;
			};

			// Ensures other key-sets are visually aligned with the randomized key-set
			mainObj.adjustAlignment = function($interfacePanel) {
				var elementSelector, isBreakElement, positionData,
					$otherGroups = $interfacePanel.find('.ui-keyboard-keyset'),
					$referenceGroup = $otherGroups.eq(0);
				$otherGroups = $otherGroups.filter(':gt(0)');
				$referenceGroup.children().each(function(elementIdx, currentCell){
					isBreakElement = currentCell.nodeName === 'BR';
					positionData = jq(currentCell).attr('data-pos');
					/*jshint loopfunc:true */
					$otherGroups.each(function(groupIdx, targetGroup){
						elementSelector = isBreakElement ? 'br:first' : 'button[data-pos="' + positionData + '"]';
						jq(targetGroup).find(elementSelector).appendTo( targetGroup );
					});
				});
				return $interfacePanel;
			};

			// Build the randomized input panel display
			inputOptions.create = function() {
				var activeLayout = inputOptions.layout;
				jq.keyInput.storedArrangements[activeLayout] = {
					keyMappings   : {},
					validKeys : [],
					$panelRef: null
				};
				if ( typeof jq.keyInput.storedArrangements[mainObj.originalLayoutName] === 'undefined' ) {
					mainObj.currentLayout = inputOptions.layout = mainObj.originalLayoutName;
					// Construct the initial layout, if not already present, e.g., "qwerty"
					mainObj.constructKeyboard();
					mainObj.currentLayout = inputOptions.layout = activeLayout;
				}
				// Duplicate, randomize, then save the layout
				jq.keyInput.storedArrangements[activeLayout] = jq.extend(true, {}, jq.keyInput.storedArrangements[mainObj.originalLayoutName]);
				if (currentSettings.singleScramble) {
					jq.keyInput.storedArrangements[activeLayout].$panelRef = mainObj.prepareLayout( jq.keyInput.storedArrangements[mainObj.originalLayoutName].$panelRef.clone() );
				}
				mainObj.$interface = jq.keyInput.storedArrangements[activeLayout].$panelRef;
				if ( !currentSettings.singleScramble ) {
					mainObj.$element.bind('beforeVisible.keyboard', function(evt, inputDevice) {
						inputDevice.$keyboard = inputDevice.prepareLayout(inputDevice.$keyboard);
					});
				}
			};

			// If the randomized layout has not been initialized yet
			if (!/^scrambled/.test(mainObj.options.layout)) {
				mainObj.originalLayoutName = mainObj.options.layout;
				mainObj.options.layout = "scrambled" + Math.round(Math.random() * 10000);
			}

			// Specific scenario where the input panel is configured to always be open
			if (inputOptions.alwaysOpen && mainObj.$interface.length) {
				setTimeout(function(){
					mainObj.$interface = mainObj.prepareLayout(mainObj.$interface);
				}, 0);
			}

		});
	};
})(JqLib);