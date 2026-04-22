(function (jq) {
  "use strict";

  // Ensure the virtual input namespace exists within jQuery
  jq.virtualInput = jq.virtualInput || {};

  /**
   * Extends jQuery's functionality to enable key randomization for virtual keyboards.
   * This method configures and applies scrambling logic to a selected virtual keyboard instance.
   *
   * @param {object} customConfiguration - Optional settings to override the default randomization behavior.
   * @returns {jQuery} The jQuery object to allow for method chaining.
   */
  jq.fn.initKeyRandomizer = function (customConfiguration) {
    // Define standard configuration settings for key randomization
    const initialConfig = {
      keyPatternFilter: /[a-z\d]/i, // Regular expression to identify keys eligible for scrambling
      randomizeByRow: true, // If true, keys are shuffled within each row; otherwise, all eligible keys are shuffled together.
      mainLayoutOnly: false, // If true, only the first keyset (main layout) is scrambled, and others mirror it.
      executeOnce: true // If true, randomization occurs only when the keyboard is first made visible.
    };

    // Iterate over each selected element to apply the randomizer
    return this.each(function () {
      const hostElement = jq(this);
      const keyboardInstance = hostElement.data('keyboard'); // Retrieve the associated virtual keyboard instance

      // Pre-check: Ensure a keyboard instance is present and not already configured for scrambling
      if (!keyboardInstance || keyboardInstance.randomizerActive) {
        // console.warn("Virtual keyboard instance not found or randomizer already active on element:", hostElement);
        return; // Exit if no keyboard or already initialized
      }

      // Merge default settings with user-provided options
      const activeRandomizerConfig = Object.assign({}, initialConfig, customConfiguration);
      keyboardInstance.randomizerConfig = activeRandomizerConfig; // Store config on the instance
      keyboardInstance.randomizerActive = true; // Mark as active

      // A utility function to generate a unique ID for dynamic layout names
      const generateUniqueLayoutId = () => `shuffled-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // --- Internal utility functions for the keyboard instance ---

      /**
       * Shuffles an array of elements based on a corresponding map,
       * ensuring certain elements (marked as false in the map) are not moved.
       * Implements a modified Fisher-Yates shuffle algorithm.
       *
       * @param {Array<HTMLElement>} elementsToShuffle - The array of DOM elements to be randomized.
       * @param {Array<string|boolean>} shuffleMap - A parallel array indicating which elements are eligible (string) or fixed (false).
       * @returns {Array<HTMLElement>} The shuffled array of elements.
       */
      keyboardInstance.performShuffle = function (elementsToShuffle, shuffleMap) {
        const eligibleIndices = [];
        for (let i = 0; i < elementsToShuffle.length; i++) {
          if (shuffleMap[i] !== false) {
            eligibleIndices.push(i);
          }
        }

        // Perform Fisher-Yates shuffle only on eligible indices
        for (let i = eligibleIndices.length - 1; i > 0; i--) {
          const randomIndexInEligible = Math.floor(Math.random() * (i + 1));

          const actualIndex1 = eligibleIndices[i];
          const actualIndex2 = eligibleIndices[randomIndexInEligible];

          // Swap elements in the main array using their actual indices
          const temp = elementsToShuffle[actualIndex1];
          elementsToShuffle[actualIndex1] = elementsToShuffle[actualIndex2];
          elementsToShuffle[actualIndex2] = temp;
        }

        return elementsToShuffle;
      };

      /**
       * Aligns the layout of secondary keysets to match the scrambled primary keyset.
       * This ensures consistency across different keyboard layers (e.g., shift, symbols).
       *
       * @param {jQuery} virtualKeyboardContainer - The main jQuery object representing the virtual keyboard.
       * @returns {jQuery} The modified virtual keyboard container.
       */
      keyboardInstance.synchronizeLayout = function (virtualKeyboardContainer) {
        const keySetCollection = virtualKeyboardContainer.find('.ui-keyboard-keyset');
        const primaryKeySet = keySetCollection.eq(0); // The first keyset serves as the reference layout

        // Filter out the primary keyset to process only secondary ones
        const secondaryKeySets = keySetCollection.filter(':gt(0)');

        // Iterate through each element of the primary keyset
        primaryKeySet.children().each(function (idx, primaryElement) {
          const isLineBreak = primaryElement.tagName === 'BR';
          const dataPosition = jq(primaryElement).attr('data-pos'); // Retrieve position attribute

          // For each secondary keyset, find and append the corresponding element
          secondaryKeySets.each(function (secIdx, secondaryKeySet) {
            let elementSelector;
            if (isLineBreak) {
              elementSelector = 'br:first'; // For line breaks, just grab the first available
            } else {
              elementSelector = `button[data-pos="${dataPosition}"]`; // For buttons, match by data-pos
            }
            jq(secondaryKeySet).find(elementSelector).appendTo(secondaryKeySet);
          });
        });
        return virtualKeyboardContainer;
      };

      /**
       * Orchestrates the key scrambling process for a given keyboard layout.
       * This function builds the internal representation of the keyboard and then shuffles keys.
       *
       * @param {jQuery} currentKeyboardElement - The jQuery object of the keyboard layout to be scrambled.
       * @returns {jQuery} The scrambled keyboard layout element.
       */
      keyboardInstance.applyKeyScramble = function (currentKeyboardElement) {
        // console.log("Applying key scramble to keyboard element.");
        const keySetElements = currentKeyboardElement.find('.ui-keyboard-keyset');

        // Determine which keysets to process based on configuration (all or just the main one)
        const targetKeySets = activeRandomizerConfig.mainLayoutOnly ? keySetElements.eq(0) : keySetElements;

        // Iterate through each target keyset to scramble its contents
        targetKeySets.each(function (sectionIndex, currentKeySet) {
          const activeKeyContainer = jq(currentKeySet);
          let currentRowElements = [];
          let rowContentMap = [];
          let currentOverallLayout = [];
          let overallContentMap = [];
          let currentRowIndex = 0;

          // Process each child element (button, span, br) within the keyset
          Array.from(activeKeyContainer.children()).forEach(element => {
            if (element.tagName === 'BR') { // Handle line break elements
              if (activeRandomizerConfig.randomizeByRow) {
                // If scrambling by row, add the <br> to the current row and then finalize the row
                currentRowElements.push(element);
                rowContentMap.push(false); // Mark line breaks as non-shufflable
                currentOverallLayout[currentRowIndex] = currentRowElements;
                overallContentMap[currentRowIndex] = rowContentMap;
                currentRowElements = []; // Reset for next row
                rowContentMap = [];
                currentRowIndex++;
              } else {
                // If not scrambling by row, add <br> directly to overall layout
                currentOverallLayout[currentRowIndex] = element;
                overallContentMap[currentRowIndex] = false;
                currentRowIndex++;
              }
            } else { // Handle key elements (buttons, spans)
              const elementValue = jq(element).attr('data-value') || '';
              // Check if the key's value matches the filter pattern for scrambling
              const isShufflable = elementValue.length === 1 && activeRandomizerConfig.keyPatternFilter.test(elementValue) ? elementValue : false;

              if (activeRandomizerConfig.randomizeByRow) {
                currentRowElements.push(element);
                rowContentMap.push(isShufflable);
              } else {
                currentOverallLayout[currentRowIndex] = element;
                overallContentMap[currentRowIndex] = isShufflable;
                currentRowIndex++;
              }
            }
          });

          // If randomizeByRow is true and there are remaining elements in the last row, process them
          if (activeRandomizerConfig.randomizeByRow && currentRowElements.length > 0) {
            currentOverallLayout[currentRowIndex] = currentRowElements;
            overallContentMap[currentRowIndex] = rowContentMap;
          }

          // Remove original <br> elements to re-insert them correctly after shuffling
          activeKeyContainer.find('.ui-keyboard-button-endrow').remove();

          // Re-map and re-append keys based on shuffling strategy
          if (!activeRandomizerConfig.randomizeByRow) {
            // Shuffle all eligible keys in the entire keyset
            const shuffledElements = keyboardInstance.performShuffle(currentOverallLayout, overallContentMap);
            shuffledElements.forEach(item => activeKeyContainer.append(item));
          } else {
            // Shuffle keys row by row
            currentOverallLayout.forEach((rowElements, rowIdx) => {
              const shuffledRow = keyboardInstance.performShuffle(rowElements, overallContentMap[rowIdx]);
              shuffledRow.forEach(item => activeKeyContainer.append(item));
            });
          }
        });

        // If only the main keyset was scrambled, synchronize other keysets to match it
        if (activeRandomizerConfig.mainLayoutOnly) {
          keyboardInstance.synchronizeLayout(currentKeyboardElement);
        }
        return currentKeyboardElement;
      };

      // --- Override the keyboard's layout creation mechanism ---

      // Store the original layout name for reference before modifying it
      if (!/^shuffled-/.test(keyboardInstance.options.layout)) {
        keyboardInstance.initialLayoutName = keyboardInstance.options.layout;
        // Assign a unique scrambled layout name to prevent conflicts
        keyboardInstance.options.layout = generateUniqueLayoutId();
      }

      // Augment the keyboard's internal `create` function to handle scrambled layouts
      keyboardInstance.options.layoutCreationHandler = function () {
        const currentLayoutName = keyboardInstance.options.layout;
        // console.log(`Handling layout creation for: ${currentLayoutName}`);

        // Initialize layout cache entry if it doesn't exist
        jq.virtualInput.cachedLayoutDefinitions[currentLayoutName] = {
          keyToValueMap: {},
          validInputKeys: [],
          keyboardDomElement: null
        };

        // If the original layout hasn't been built yet, build it first
        if (typeof jq.virtualInput.cachedLayoutDefinitions[keyboardInstance.initialLayoutName] === 'undefined') {
          // Temporarily revert to original layout name to build it
          keyboardInstance.layout = keyboardInstance.options.layout = keyboardInstance.initialLayoutName;
          keyboardInstance.buildKeyboard(); // Call the original build method
          // Restore the scrambled layout name
          keyboardInstance.layout = keyboardInstance.options.layout = currentLayoutName;
        }

        // Clone the original layout definition and apply scrambling
        // Using Object.assign({}, ...) for a shallow clone of the layout definition object itself,
        // then handling the deep clone of the DOM element separately for clarity.
        const originalLayoutDef = jq.virtualInput.cachedLayoutDefinitions[keyboardInstance.initialLayoutName];
        jq.virtualInput.cachedLayoutDefinitions[currentLayoutName] = Object.assign({}, originalLayoutDef);


        if (activeRandomizerConfig.executeOnce) {
          // If scrambling once, clone the original DOM element and scramble it
          const clonedKeyboardDom = originalLayoutDef.keyboardDomElement.clone();
          jq.virtualInput.cachedLayoutDefinitions[currentLayoutName].keyboardDomElement = keyboardInstance.applyKeyScramble(clonedKeyboardDom);
        }

        keyboardInstance.keyboardDomElement = jq.virtualInput.cachedLayoutDefinitions[currentLayoutName].keyboardDomElement;

        // If not executing once, scramble every time the keyboard becomes visible
        if (!activeRandomizerConfig.executeOnce) {
          // Unbind any previous handlers to prevent duplicate execution, then bind
          hostElement.off('beforeVisible.virtualInputRandomizer').on('beforeVisible.virtualInputRandomizer', function (event, kbInstance) {
            // console.log("Scrambling keyboard layout before visibility.");
            kbInstance.keyboardDomElement = kbInstance.applyKeyScramble(kbInstance.keyboardDomElement);
          });
        }
      };

      // Special handling for keyboards configured to always be open
      if (keyboardInstance.options.persistentDisplayMode && keyboardInstance.keyboardDomElement && keyboardInstance.keyboardDomElement.length) {
        // Defer scrambling to allow the initial keyboard rendering to complete
        // console.log("Applying scramble to always-open keyboard after initial render.");
        setTimeout(() => {
          keyboardInstance.keyboardDomElement = keyboardInstance.applyKeyScramble(keyboardInstance.keyboardDomElement);
        }, 0);
      }
    }); // End of each() iteration for selected elements
  }; // End of jq.fn.initKeyRandomizer plugin definition
})(jQuery); // Pass jQuery object to the IIFE for scope encapsulation