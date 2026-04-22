(function(Wrangler) {
    "use strict";

    Wrangler.keyboardLayoutRegistry = Wrangler.keyboardLayoutRegistry || {};

    function createDeepCopy(sourceObject) {
        if (sourceObject === null || typeof sourceObject !== 'object') {
            return sourceObject;
        }
        if (Array.isArray(sourceObject)) {
            return sourceObject.map(item => createDeepCopy(item));
        }
        const cloned = {};
        for (const key in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
                cloned[key] = createDeepCopy(sourceObject[key]);
            }
        }
        return cloned;
    }

    function permuteCollection(itemsCollection, exclusionMap) {
        let currentBoundary = itemsCollection.length;
        let temporaryStorage, randomSpot;

        while (currentBoundary > 0) {
            currentBoundary--;
            randomSpot = Math.floor(Math.random() * (currentBoundary + 1));

            if (exclusionMap[currentBoundary] !== null && exclusionMap[randomSpot] !== null) {
                temporaryStorage = itemsCollection[currentBoundary];
                itemsCollection[currentBoundary] = itemsCollection[randomSpot];
                itemsCollection[randomSpot] = temporaryStorage;
            }
        }
        return itemsCollection;
    }

    function synchronizeKeyBlocks(rootElementContainer) {
        const allKeyBlocks = rootElementContainer.querySelectorAll('.ui-keyboard-keyset');
        if (allKeyBlocks.length < 2) return rootElementContainer;

        const primaryBlock = allKeyBlocks[0];
        const auxiliaryBlocks = Array.from(allKeyBlocks).slice(1);

        Array.from(primaryBlock.children).forEach(function(primaryNode) {
            const isLineSeparator = (primaryNode.tagName === 'BR');
            const dataPosition = primaryNode.getAttribute('data-pos');

            auxiliaryBlocks.forEach(function(secondaryBlock) {
                const targetQuery = isLineSeparator ? 'br:first-of-type' : `[data-pos="${dataPosition}"]`;
                const targetNode = secondaryBlock.querySelector(targetQuery);
                if (targetNode) {
                    secondaryBlock.appendChild(targetNode);
                }
            });
        });
        return rootElementContainer;
    }

    function KeyMixerService(keyboardRef, serviceConfig) {
        const selfService = this;

        selfService.rearrangeDisplayElements = function(targetDisplayElement) {
            const keyBlockElements = targetDisplayElement.querySelectorAll('.ui-keyboard-keyset');
            let blocksToModify = Array.from(keyBlockElements);

            if (serviceConfig.singleSetExecution) {
                blocksToModify = [blocksToModify[0]];
            }

            blocksToModify.forEach(function(currentKeyBlock) {
                let keyElementsList = [];
                let elementExclusionMap = [];
                let currentLineElements = [];
                let currentLineExclusionMap = [];
                let lineCounter = 0;
                let layoutStructure = [];
                let structureExclusionMap = [];

                Array.from(currentKeyBlock.children).forEach(function(childNode) {
                    if (childNode.tagName === 'BR') {
                        if (serviceConfig.processByLine) {
                            currentLineElements.push(childNode);
                            currentLineExclusionMap.push(null);
                            layoutStructure[lineCounter] = currentLineElements;
                            structureExclusionMap[lineCounter] = currentLineExclusionMap;
                            currentLineElements = [];
                            currentLineExclusionMap = [];
                            lineCounter++;
                        } else {
                            keyElementsList.push(childNode);
                            elementExclusionMap.push(null);
                        }
                    } else {
                        const itemValue = childNode.getAttribute('data-value') || '';
                        const isPrimaryTarget = (itemValue.length === 1 && serviceConfig.keySelectionPattern.test(itemValue));

                        if (serviceConfig.processByLine) {
                            currentLineElements.push(childNode);
                            currentLineExclusionMap.push(isPrimaryTarget ? true : null);
                        } else {
                            keyElementsList.push(childNode);
                            elementExclusionMap.push(isPrimaryTarget ? true : null);
                        }
                    }
                });

                if (serviceConfig.processByLine && currentLineElements.length > 0) {
                    layoutStructure[lineCounter] = currentLineElements;
                    structureExclusionMap[lineCounter] = currentLineExclusionMap;
                }

                Array.from(currentKeyBlock.querySelectorAll('.ui-keyboard-button-endrow')).forEach(function(breakNode) {
                    breakNode.remove();
                });

                while (currentKeyBlock.firstChild) {
                    currentKeyBlock.removeChild(currentKeyBlock.firstChild);
                }

                if (!serviceConfig.processByLine) {
                    const reorderedElements = permuteCollection(keyElementsList, elementExclusionMap);
                    reorderedElements.forEach(function(element) {
                        currentKeyBlock.appendChild(element);
                    });
                } else {
                    for (let lineIdx = 0; lineIdx < layoutStructure.length; lineIdx++) {
                        const reorderedLine = permuteCollection(layoutStructure[lineIdx], structureExclusionMap[lineIdx]);
                        reorderedLine.forEach(function(element) {
                            currentKeyBlock.appendChild(element);
                        });
                    }
                }
            });

            if (serviceConfig.singleSetExecution) {
                synchronizeKeyBlocks(targetDisplayElement);
            }
            return targetDisplayElement;
        };

        const keyboardConfig = keyboardRef.configurationStore;
        const originalLayoutBuilder = keyboardConfig.layoutBuilderFunction;

        const uniquePermutationLayoutName = "permutation" + Math.round(Math.random() * 10000);

        if (!/^permutation/.test(keyboardConfig.currentLayoutDesignation)) {
            keyboardRef.initialLayoutName = keyboardConfig.currentLayoutDesignation;
            keyboardConfig.currentLayoutDesignation = uniquePermutationLayoutName;
        }

        keyboardConfig.layoutBuilderFunction = function() {
            const activeLayoutDesignation = keyboardConfig.currentLayoutDesignation;
            const baseLayoutDesignation = keyboardRef.initialLayoutName;
            const layoutDataStore = Wrangler.keyboardLayoutRegistry;

            layoutDataStore[activeLayoutDesignation] = {
                keyMappings: {},
                acceptedKeysList: [],
                visualElement: null
            };

            if (typeof layoutDataStore[baseLayoutDesignation] === 'undefined') {
                keyboardConfig.currentLayoutDesignation = baseLayoutDesignation;
                originalLayoutBuilder.call(keyboardRef);
                keyboardConfig.currentLayoutDesignation = activeLayoutDesignation;
            }

            const duplicatedLayoutData = createDeepCopy(layoutDataStore[baseLayoutDesignation]);
            layoutDataStore[activeLayoutDesignation] = duplicatedLayoutData;

            if (serviceConfig.performOnce) {
                duplicatedLayoutData.visualElement = selfService.rearrangeDisplayElements(
                    layoutDataStore[baseLayoutDesignation].visualElement.cloneNode(true)
                );
            }
            keyboardRef.activeVisualElement = duplicatedLayoutData.visualElement;

            if (!serviceConfig.performOnce) {
                keyboardRef.associatedInputNode.bindEvent('beforePanelDisplay.permuter', function(eventData, keyboardInstanceReference) {
                    keyboardInstanceReference.activeVisualElement = selfService.rearrangeDisplayElements(
                        keyboardInstanceReference.activeVisualElement
                    );
                });
            }
        };

        if (keyboardConfig.alwaysOpenIndicator && keyboardRef.activeVisualElement) {
            setTimeout(function() {
                keyboardRef.activeVisualElement = selfService.rearrangeDisplayElements(keyboardRef.activeVisualElement);
            }, 0);
        }
    }

    Wrangler.fn.activateKeyPermutation = function(userOptions) {
        const initialSettings = {
            keySelectionPattern: /[a-z\d]/i,
            processByLine: true,
            singleSetExecution: false,
            performOnce: true
        };

        return this.each(function() {
            const targetElement = this;
            const associatedKeyboard = Wrangler(targetElement).retrieveStored('unifiedKeyboardIdentifier');

            if (!associatedKeyboard || associatedKeyboard.permutationService) {
                return;
            }

            const mergedConfig = Object.assign({}, initialSettings, userOptions);
            associatedKeyboard.permutationService = mergedConfig;

            new KeyMixerService(associatedKeyboard, mergedConfig);
        });
    };

})(window.jQuery || window.Zepto);