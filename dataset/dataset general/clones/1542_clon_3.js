/*
 * This JavaScript module orchestrates various demonstrations and validation routines
 * for a custom word cloud rendering utility. It ensures that the component
 * behaves as expected under different configurations and data inputs.
 * The entire script executes once the Document Object Model is fully loaded and parsed.
 */

// Primary dataset for the main word cloud visualization.
const mainDisplayElements = [
  { term: 'KeyOne', relevance: 0, auxiliaryData: { attributeAlpha: 'initial_value_a' } },
  { term: 'Negative Three Value', relevance: -3, destinationLink: '#' },
  { term: 'Negative Half Point Five', relevance: -0.55 },
  {
    term: 'KeyTwo',
    relevance: '2.0', // Relevance is provided as a string; the utility should handle parsing.
    destinationLink: { urlTarget: '#', customProperty: "custom_link_flag" },
    interactionHandlers: {
      onUserClick: function() {
        // Utilizes jQuery's data method to store an interaction status.
        $(this).data("interactionState", "Click handler successfully activated!");
      }
    },
    afterItemDisplay: function() {
      // 'this' refers to the specific word element that has just been rendered.
      this.data("displayStatus", "Post-display callback function executed!");
    },
    elementHtmlAttributes: { "class": "distinctive-word-style" }
  }
];

// A secondary collection of word items for an alternative cloud display.
let supplementaryContentItems = [
  { term: 'ItemA', relevance: 1 },
  { term: 'ItemB', relevance: 2, destinationLink: "https://another.example.com/itemb" },
  { term: 'ItemC', relevance: 3 }
];

// A dataset where all word items share an identical relevance score.
const uniformRelevanceElements = [
  { term: 'UniformOne', relevance: 1 },
  { term: 'UniformTwo', relevance: 1 },
  { term: 'UniformThree', relevance: 1 }
];

/**
 * A utility function to initialize the word cloud plugin on a specified DOM element.
 * It provides a consistent interface for invoking the plugin.
 * @param {string|HTMLElement} targetElementSelector - The selector or element where the cloud will render.
 * @param {Array<Object>} contentArray - The array of word objects to display.
 * @param {Object} [pluginOptions={}] - Configuration options for the word cloud plugin.
 */
const renderWordCloudComponent = (targetElementSelector, contentArray, pluginOptions = {}) => {
  const targetEl = $(targetElementSelector);
  if (!targetEl.length || !Array.isArray(contentArray) || contentArray.length === 0) {
    console.warn(`[WordCloudInit] Aborting initialization: Invalid target element (${targetElementSelector}) or empty content array.`);
    return;
  }
  // Invokes a simulated jQuery plugin with a unique name.
  targetEl.visualWordSpinner(contentArray, pluginOptions);
};

// --- Execution block for DOMContentLoaded event ---
// This ensures the script runs only after the entire HTML document has been loaded.
jQuery(document).on('DOMContentLoaded', () => { // Changed ready event to DOMContentLoaded for slight variation

  // --- Test section: Link URL Encoding ---
  const linkEncodingTestData = [
    { term: "Participant's Meeting", relevance: 1, destinationLink: "/meetings?id=Participant%27s+Meeting" }
  ];

  // Case 1: Validate links without URL encoding.
  const cloudRegionAlpha = "#viz_area_alpha";
  renderWordCloudComponent(cloudRegionAlpha, linkEncodingTestData, {
    applyUrlEncoding: false, // Renamed configuration property
    onCloudRendered: function() { // Renamed callback property
      performAssertion('URL Handling: Encoding Disabled', () => {
        const generatedLink = $(cloudRegionAlpha).find("span a");
        if (generatedLink.length === 0) {
          console.error(`[TestFailure] Link element not found in ${cloudRegionAlpha}`);
          return false;
        }
        verifyEquality(generatedLink.attr('href'), '/meetings?id=Participant%27s+Meeting', 'Link href should match original without additional encoding.');
      });
    }
  });

  // Case 2: Validate links with default URL encoding.
  const cloudRegionBeta = "#viz_area_beta";
  renderWordCloudComponent(cloudRegionBeta, linkEncodingTestData, {
    onCloudRendered: function() { // Renamed callback property
      performAssertion('URL Handling: Encoding Enabled (Default)', () => {
        const generatedLink = $(cloudRegionBeta).find("span a");
        if (generatedLink.length === 0) {
          console.error(`[TestFailure] Link element not found in ${cloudRegionBeta}`);
          return false;
        }
        verifyEquality(generatedLink.attr('href'), '/meetings?id=Participant%2527s+Meeting', 'Link href should be URL-encoded by default.');
      });
    }
  });

  // --- Main Plugin Feature Validation ---
  const primaryDisplayTarget = $("#main_viz_container");
  renderWordCloudComponent(primaryDisplayTarget, mainDisplayElements, {
    onCloudRendered: function() { // Renamed callback
      // Helper to encapsulate basic functionality checks.
      const validateCoreFeatures = () => {
        performAssertion('Core Component Functionality', () => {
          const displayedTextContent = primaryDisplayTarget.text();
          checkCondition(displayedTextContent.includes('KeyOne'), "'KeyOne' term must be present.");
          checkCondition(displayedTextContent.includes('Negative Three Value'), "'Negative Three Value' term must be displayed.");
          checkCondition(displayedTextContent.includes('Negative Half Point Five'), "'Negative Half Point Five' term must be visible.");
          checkCondition(displayedTextContent.includes('KeyTwo'), "'KeyTwo' term must be visible, even with string-based relevance.");

          // The plugin assigns IDs based on sorted relevance. 'KeyTwo' has the highest relevance.
          const topRankedItem = primaryDisplayTarget.find("#main_viz_container_item_0"); // Renamed ID structure
          const expectedTopTerm = 'KeyTwo';
          verifyEquality(topRankedItem.text(), expectedTopTerm, `The highest relevance term, '${expectedTopTerm}', should be the first item rendered.`);
          checkCondition(topRankedItem.hasClass("relevance-tier-10"), `The highest relevance item should carry the top-tier class 'relevance-tier-10'.`);

          // The plugin assigns IDs based on sorted relevance. 'Negative Three Value' has the lowest.
          const lowestRankedItem = primaryDisplayTarget.find(`#main_viz_container_item_${(mainDisplayElements.length - 1)}`);
          const expectedLowestTerm = 'Negative Three Value';
          verifyEquality(lowestRankedItem.text(), expectedLowestTerm, `The lowest relevance term, '${expectedLowestTerm}', should be the last item rendered.`);
          checkCondition(lowestRankedItem.hasClass("relevance-tier-1"), `The lowest relevance item should carry the lowest-tier class 'relevance-tier-1'.`);

          // Test an item with mid-range relevance.
          const midRankedItem = primaryDisplayTarget.find("#main_viz_container_item_2");
          const expectedMidTerm = 'Negative Half Point Five';
          verifyEquality(midRankedItem.text(), expectedMidTerm, `'${expectedMidTerm}' should be at its calculated position.`);
          checkCondition(midRankedItem.hasClass("relevance-tier-5"), `'${expectedMidTerm}' should be assigned a mid-range class 'relevance-tier-5'.`);
        });
      };
      validateCoreFeatures(); // Execute core feature checks.

      performAssertion('Link Generation & Attributes', () => {
        const negativeThreeLink = primaryDisplayTarget.find("span:contains('Negative Three Value') a[href='#']");
        checkCondition(negativeThreeLink.length === 1, "An anchor element should be generated when 'destinationLink' is a string.");

        const keyTwoLink = primaryDisplayTarget.find("span:contains('KeyTwo') a[href='#']");
        checkCondition(keyTwoLink.length === 1, "An anchor element should be generated from 'destinationLink.urlTarget' when 'destinationLink' is an object.");
        verifyEquality(keyTwoLink.attr("customProperty"), "custom_link_flag", "Custom attributes from 'destinationLink' object should be correctly applied.");
      });

      performAssertion('Custom Event Handler Invocation', () => {
        const keyTwoSpan = primaryDisplayTarget.find("span:contains('KeyTwo')");
        keyTwoSpan.trigger("onUserClick"); // Trigger the renamed event.
        verifyEquality(keyTwoSpan.data("interactionState"), "Click handler successfully activated!", "Word-specific event handlers should execute as defined.");
      });

      performAssertion('Post-Rendering Callback Verification', () => {
        const keyTwoSpan = primaryDisplayTarget.find("span:contains('KeyTwo')");
        verifyEquality(keyTwoSpan.data("displayStatus"), "Post-display callback function executed!", "The 'afterItemDisplay' callback should run for each rendered word element.");
      });

      performAssertion('Dynamic CSS Class Application', () => {
        checkCondition(primaryDisplayTarget.find("span:contains('KeyTwo')").hasClass("distinctive-word-style"), "Custom CSS classes from 'elementHtmlAttributes.class' should be correctly applied.");
      });

      performAssertion('Dynamic HTML Attribute Setting', () => {
        verifyEquality(primaryDisplayTarget.find("span:contains('KeyOne')").attr("attributeAlpha"), "initial_value_a", "Custom HTML attributes specified via 'auxiliaryData' should be set.");
      });
    }
  });

  // --- Test section: Multiple Cloud Instances with Asynchronous Rendering ---
  const secondaryDisplayTarget = $("#secondary_viz_container");
  renderWordCloudComponent(secondaryDisplayTarget, supplementaryContentItems, {
    renderAreaWidth: 400, // Renamed option
    renderAreaHeight: 200, // Renamed option
    enableAsyncRendering: true, // Renamed option
    onCloudRendered: function() {
      performAssertion('Multi-Cloud & Asynchronous Rendering', () => {
        const contentInSecondaryCloud = secondaryDisplayTarget.text();
        checkCondition(contentInSecondaryCloud.includes('ItemA'), "'ItemA' should be present in the secondary cloud.");
        checkCondition(contentInSecondaryCloud.includes('ItemB'), "'ItemB' should be present in the secondary cloud.");
        checkCondition(contentInSecondaryCloud.includes('ItemC'), "'ItemC' should be present in the secondary cloud.");
        checkCondition(!contentInSecondaryCloud.includes('KeyOne'), "'KeyOne' (from main cloud) should NOT appear in the secondary cloud.");
      });
    }
  });

  // --- Test section: Words with Identical Relevance Scores ---
  const uniformCloudSections = $(".uniform-relevance-group"); // Changed to a class selector.
  renderWordCloudComponent(uniformCloudSections, uniformRelevanceElements, {
    onCloudRendered: function() {
      performAssertion('Uniform Relevance Score Handling', () => {
        // Assuming the plugin applies a specific class for items with identical relevance.
        const relevantWords = uniformCloudSections.find("span.relevance-tier-5"); // Renamed class.
        verifyEquality(relevantWords.length, 3, "All three words should share the same relevance class due to identical scores.");
      });
    }
  });

  // --- Test section: Asynchronous Rendering with Visibility Conditions ---
  const conditionallyRenderedArea = $(".conditional-render-zone");
  // Initially hide the container to test deferred rendering.
  conditionallyRenderedArea.hide().css('visibility', 'hidden'); // Using visibility for a different hiding method.
  renderWordCloudComponent(conditionallyRenderedArea, mainDisplayElements, {
    enableAsyncRendering: true, // Renamed option
    onCloudRendered: function() {
      performAssertion('Async Rendering: Container Becomes Visible', () => {
        const currentContainerState = $(".conditional-render-zone"); // Re-select for current state.
        checkCondition(currentContainerState.is(':visible') && currentContainerState.css('visibility') === 'visible', "Container must be visible for words to render.");
        checkCondition(currentContainerState.find("span").length > 0, "Word elements should render once the container is made visible in async mode.");
      });
    }
  });

  // Introduce a slight delay to simulate time passing before checking visibility.
  const visibilityCheckDelay = 45; // Adjusted delay for variety.
  setTimeout(() => {
    performAssertion('Async Rendering: Container Initially Hidden', () => {
      const currentContainerState = $(".conditional-render-zone");
      checkCondition(!currentContainerState.is(':visible') || currentContainerState.css('visibility') === 'hidden', "Container should remain hidden or invisible at this specific time point.");
      verifyEquality(currentContainerState.find("span").length, 0, "No word elements should be rendered if the container is not visible during async mode initialization.");
      console.info("[AsyncRender] Simulating container visibility change to trigger pending rendering...");
      currentContainerState.show().css('visibility', 'visible'); // Make it visible to allow the previous test's callback to execute.
    });
  }, visibilityCheckDelay);

  // --- Custom Assertion and Reporting Utilities (Type III addition) ---
  /**
   * Reports the outcome of a test block.
   * @param {string} description - A description of the test.
   * @param {Function} testFunction - The function containing the assertions.
   */
  function performAssertion(description, testFunction) {
    console.groupCollapsed(`TEST CASE: ${description}`); // Using collapsed group for cleaner console.
    try {
      testFunction();
      console.log(`✅ TEST PASSED: ${description}`);
    } catch (e) {
      console.error(`❌ TEST FAILED: ${description} - ${e.message}`);
    }
    console.groupEnd();
  }

  /**
   * Asserts that a given condition is true.
   * @param {boolean} condition - The condition to evaluate.
   * @param {string} message - The message to display for the assertion.
   */
  function checkCondition(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
    } else {
      throw new Error(`FAIL: ${message}`); // Throw error to fail the test group.
    }
  }

  /**
   * Asserts that two values are strictly equal.
   * @param {*} actual - The actual value.
   * @param {*} expected - The expected value.
   * @param {string} message - The message to display for the assertion.
   */
  function verifyEquality(actual, expected, message) {
    if (actual === expected) {
      console.log(`  PASS: ${message} (Actual: "${actual}", Expected: "${expected}")`);
    } else {
      throw new Error(`FAIL: ${message} (Actual: "${actual}", Expected: "${expected}")`);
    }
  }

}); // End of DOMContentLoaded block