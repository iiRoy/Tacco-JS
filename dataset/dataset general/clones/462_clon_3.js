(function (verifyAssertion) {
  // Comprehensive test suite for the AccessibilityPanel component, focusing on its core functionalities.
  // This suite ensures the component behaves as expected under various configurations and user interactions.
  describe('AccessibilityPanel Component Suite', function() {

    // Increase the test timeout to accommodate potential animation delays or complex setup.
    this.timeout(2000);

    // Define constants for the panel's root container and assistive text.
    const panelContainerId = '#mainPanelArea';
    const assistiveTextForToggle = 'Descriptive Toggle Text';

    // Default configuration object for the AccessibilityPanel.
    // This object defines the selectors, classes, and behaviors for a standard panel.
    var defaultPanelConfig = {
      rootElementSelector: panelContainerId,
      panelItemClass: '.accPanelUnit',
      itemHeaderClass: '.accPanelUnitHeader',
      collapsibleContentClass: '.accPanelUnitContent',
      activeContentClass: 'activeAccPanelUnit',
      toggleAssistiveText: assistiveTextForToggle,
      animationDurationMs: 150 // Slightly different speed
    };

    // Cleans up the panel container by removing all its child elements.
    // This ensures a fresh state for each test.
    const resetPanelArea = function() {
      $(panelContainerId).html(''); // Using .html('') instead of .empty()
    };

    // Generates the basic HTML structure for the panel component.
    // It creates 5 panel items, each with a header and collapsible content.
    const createPanelStructure = function() {
      resetPanelArea(); // Ensure a clean slate before generation.

      const targetContainer = $(panelContainerId);
      if (!targetContainer.length) {
        // Adding a guard clause for robustness
        console.warn(`Target container ${panelContainerId} not found for markup generation.`);
        return;
      }

      const panelItemsFragment = $(document.createDocumentFragment());

      // Iterate to create multiple panel items.
      Array.from({ length: 5 }).forEach((_, i) => {
        const panelRow = $('<li>', {
          'class': 'accPanelUnit',
          'id': `${panelContainerId.substring(1)}-item-${i}` // Add ID for individual rows
        });

        // Create and append the header element.
        $('<div>', {
          'class': 'accPanelUnitHeader',
          'aria-expanded': 'false', // Add ARIA attributes
          'aria-controls': `${panelContainerId.substring(1)}-content-${i}`,
          'text': `Section Heading ${i + 1}` // Different text style
        }).appendTo(panelRow);

        // Create and append the collapsible content area.
        $('<div>', {
          'class': 'accPanelUnitContent',
          'id': `${panelContainerId.substring(1)}-content-${i}`,
          'aria-hidden': 'true', // Add ARIA attributes
          'text': `Details for Section ${i + 1}. This is some sample content.`
        }).appendTo(panelRow);

        panelItemsFragment.append(panelRow);
      });

      targetContainer.append(panelItemsFragment); // Append fragment once for performance
      console.log(`Generated ${5} panel items in ${panelContainerId}`); // New fragment: console log
    };

    // Helper function to verify the visibility state of a specific panel item.
    // It checks the header, hidden content, and CSS classes.
    const verifyPanelItemState = function(panelInstance, itemIndex, expectVisible) {
      if (itemIndex < 0 || itemIndex >= panelInstance._panelItems.length) {
        console.warn(`Invalid itemIndex: ${itemIndex}. Skipping visibility check.`);
        return; // Guard clause for invalid index
      }

      const itemElement = panelInstance.fetchRowElement(itemIndex);
      const contentArea = panelInstance._retrieveContentArea(itemIndex);
      const headerElement = itemElement.find(panelInstance.options.itemHeaderClass);

      // Assertions for header visibility (show/hide labels)
      verifyAssertion(headerElement.find(panelInstance._showToggleLabelSelector).is(":visible")).to.be(!expectVisible);
      verifyAssertion(headerElement.find(panelInstance._hideToggleLabelSelector).is(":visible")).to.be(expectVisible);

      // Assertions for content area visibility and class presence
      verifyAssertion(contentArea.is(":visible")).to.be(expectVisible);
      verifyAssertion(contentArea.hasClass(panelInstance._activeContentClass)).to.be(expectVisible);
      verifyAssertion(headerElement.attr('aria-expanded')).to.equal(expectVisible.toString()); // ARIA attribute check
      verifyAssertion(contentArea.attr('aria-hidden')).to.equal((!expectVisible).toString()); // ARIA attribute check
    };

    // Setup and teardown hooks for each test.
    beforeEach(createPanelStructure);
    afterEach(resetPanelArea);

    // --- Panel Component Initialization Tests ---
    describe('Panel Component Initialization', function() {
      it('should throw errors for invalid configuration parameters', function() {
        let errorCounter = 0;

        // Test cases for various invalid configurations.
        const invalidConfigs = [
          {
            expectedErrorMessage: 'Root element selector not found or invalid',
            config: {
              rootElementSelector: undefined,
              panelItemClass: '.accPanelUnit',
              itemHeaderClass: '.accPanelUnitHeader',
              collapsibleContentClass: '.accPanelUnitContent',
              activeContentClass: 'activeAccPanelUnit'
            }
          },
          {
            expectedErrorMessage: 'No panel items found with selector',
            config: {
              rootElementSelector: '#mainPanelArea',
              panelItemClass: 'non-existent-class',
              itemHeaderClass: '.accPanelUnitHeader',
              collapsibleContentClass: '.accPanelUnitContent',
              activeContentClass: 'activeAccPanelUnit'
            }
          },
          {
            expectedErrorMessage: 'No header elements found within panel items',
            config: {
              rootElementSelector: '#mainPanelArea',
              panelItemClass: '.accPanelUnit',
              itemHeaderClass: 'invalid-header-selector',
              collapsibleContentClass: '.accPanelUnitContent',
              activeContentClass: 'activeAccPanelUnit'
            }
          },
          {
            expectedErrorMessage: 'No collapsible content areas found within panel items',
            config: {
              rootElementSelector: '#mainPanelArea',
              panelItemClass: '.accPanelUnit',
              itemHeaderClass: '.accPanelUnitHeader',
              collapsibleContentClass: 'bad-content-selector',
              activeContentClass: 'activeAccPanelUnit'
            }
          }
        ];

        // Iterate through invalid configurations and expect errors.
        invalidConfigs.forEach(function(invalidConfig) {
          try {
            new AccessibilityPanel(invalidConfig.config);
            // This line should not be reached if an error is thrown
            verifyAssertion.fail('Expected an error, but none was thrown for config: ' + JSON.stringify(invalidConfig.config));
          } catch (issue) {
            errorCounter++;
            verifyAssertion(issue.message).to.include(invalidConfig.expectedErrorMessage);
          }
        });

        verifyAssertion(errorCounter).to.equal(invalidConfigs.length);
      });

      // --- Valid Configuration and Instantiation Tests ---
      describe('Valid Configuration and Instantiation', function() {
        // Helper to check for the presence of the search input.
        const checkSearchPresence = (panelInstance) => {
          const searchElement = panelInstance.mainElement.find('.accPanelSearchBox');
          return searchElement.length > 0 && searchElement.is(':visible'); // Check visibility too
        };

        it('should initialize with default settings and structure', function() {
          const myPanel = new AccessibilityPanel(defaultPanelConfig);
          let hiddenToggleLabel, headerContentSpan, itemRow;

          // Verify the root element's ID.
          verifyAssertion(myPanel.mainElement.attr('id')).to.equal('mainPanelArea');
          // Verify the count of collapsible content areas.
          verifyAssertion(myPanel._collapsibleContentElements.length).to.equal(5);
          // Verify search input presence (default is true).
          verifyAssertion(checkSearchPresence(myPanel)).to.be.true;
          // Verify no content areas are visible initially.
          verifyAssertion(myPanel.mainElement.find(`.${myPanel._activeContentClass}:visible`).length).to.equal(0);

          // Get a specific row element and verify its initial state.
          itemRow = myPanel.fetchRowElement(1); // Second item (index 1)
          verifyAssertion(itemRow.find(`.${myPanel._activeContentClass}:visible`).length).to.equal(0);

          // Use the helper to check overall visibility.
          verifyPanelItemState(myPanel, 1, false);

          // Verify header text and hidden label content.
          headerContentSpan = itemRow.find('.accPanelItemHeaderText');
          hiddenToggleLabel = itemRow.find('.accPanelItemHeaderLinkHiddenLabel');

          verifyAssertion(headerContentSpan).to.have.lengthOf(1);
          verifyAssertion(headerContentSpan.text()).to.equal('Section Heading 2'); // Matches generated text

          verifyAssertion(hiddenToggleLabel).to.have.lengthOf(1);
          verifyAssertion(hiddenToggleLabel.text()).to.equal(assistiveTextForToggle);
        });

        it('should apply custom theme classes correctly', function() {
          // Clone options and add a custom theme.
          const customConfig = { ...defaultPanelConfig, themeName: 'brandTheme' }; // Using spread syntax for cloning

          const themedPanel = new AccessibilityPanel(customConfig);
          const themedRow = themedPanel.fetchRowElement(1);

          // Verify custom theme classes are applied to header and content areas.
          verifyAssertion(themedRow.find('.accPanelUnitHeader').hasClass('brandTheme-accPanel-header')).to.be.true;
          verifyAssertion(themedRow.find('.accPanelUnitContent').hasClass('brandTheme-accPanel-area')).to.be.true;
        });

        it('should omit search functionality when configured', function() {
          // Clone options and disable search.
          const customConfig = { ...defaultPanelConfig, enableSearch: false };

          const noSearchPanel = new AccessibilityPanel(customConfig);

          // Verify the search input is not present.
          verifyAssertion(checkSearchPresence(noSearchPanel)).to.be.false;
        });
      });
    });

    // --- Content Filtering Mechanism Tests ---
    describe('Content Filtering Mechanism', function() {
      it('should filter items based on header text', function() {
        const searchablePanel = new AccessibilityPanel(defaultPanelConfig);
        const panelRoot = searchablePanel.mainElement;
        const searchInputBox = panelRoot.find('.accPanelSearchBox');

        // Helper function to simulate typing and check results.
        const simulateSearchInput = (searchText, expectedVisibleCount) => {
          searchInputBox.val(searchText);
          searchInputBox.trigger('keyup'); // Simulate keyup event

          verifyAssertion(panelRoot.find('.accPanelUnit').filter(':visible').length).to.equal(expectedVisibleCount);

          // Check for "no results" message if no rows are visible.
          if (expectedVisibleCount === 0) {
            verifyAssertion(panelRoot.find('#mainPanelArea-noMatchesFound').length > 0).to.be.true;
          } else {
            verifyAssertion(panelRoot.find('#mainPanelArea-noMatchesFound').length > 0).to.be.false; // Ensure it's hidden otherwise
          }
        };

        verifyAssertion(searchInputBox.length).to.be.greaterThan(0); // Ensure search box exists

        simulateSearchInput('Nonexistent Query', 0); // No matching items
        simulateSearchInput('Section Heading 4', 1); // Only one item matches (index 3)
        simulateSearchInput('', 5); // All items visible when search is cleared
      });

      it('should filter items based on all content when enableFullTextSearch is enabled', function() {
        // Clone options and enable full-text search.
        const customConfig = { ...defaultPanelConfig, enableFullTextSearch: true };

        const fullSearchPanel = new AccessibilityPanel(customConfig);
        const panelRoot = fullSearchPanel.mainElement;
        const searchInputBox = panelRoot.find('.accPanelSearchBox');

        // Helper function (re-used, but contextually different)
        const simulateSearchInput = (searchText, expectedVisibleCount) => {
          searchInputBox.val(searchText);
          searchInputBox.trigger('keyup');

          verifyAssertion(panelRoot.find('.accPanelUnit').filter(':visible').length).to.equal(expectedVisibleCount);

          if (expectedVisibleCount === 0) {
            verifyAssertion(panelRoot.find('#mainPanelArea-noMatchesFound').length > 0).to.be.true;
          } else {
            verifyAssertion(panelRoot.find('#mainPanelArea-noMatchesFound').length > 0).to.be.false;
          }
        };

        verifyAssertion(searchInputBox.length).to.be.greaterThan(0);

        simulateSearchInput('Nonexistent Query', 0);
        simulateSearchInput('Details for Section 4', 1); // Matches content of item 3
        simulateSearchInput('', 5);
      });
    });

    // --- Public API Tests ---

    describe('Expansion Routines (Public & Internal)', function() {
      it('should expand a specified panel item', function(completionCallback) {
        // Clone options and set a custom callback for content reveal.
        const customConfig = { ...defaultPanelConfig };
        customConfig.onContentReveal = function(revealedElement) {
          verifyAssertion(revealedElement).to.have.lengthOf(1);
          verifyPanelItemState(myPanel, 2, true); // Verify item 2 is visible
          completionCallback(); // Signal test completion
        };

        const myPanel = new AccessibilityPanel(customConfig);

        verifyPanelItemState(myPanel, 2, false); // Ensure item 2 is initially hidden

        myPanel.expandItem(2); // Call the public method to expand
      });

      it('should collapse others when "showOne" is true and a new item expands', function(completionCallback) {
        // Default config has showOne implicitly true (or not false)
        const myPanel = new AccessibilityPanel(defaultPanelConfig);

        verifyPanelItemState(myPanel, 2, false); // Item 2 initially hidden

        // Intercept internal reveal/hide callbacks to track sequence.
        let revealHideSequence = 0;
        myPanel._internalOnReveal = function() {
          revealHideSequence++;
          if (revealHideSequence === 1) { // First reveal (item 2)
            verifyPanelItemState(myPanel, 2, true);
            myPanel.expandItem(3); // Expand item 3, which should collapse item 2
          } else if (revealHideSequence === 3) { // Third event (item 3 reveal)
            // After item 2 hides and item 3 reveals
            verifyPanelItemState(myPanel, 2, false);
            verifyPanelItemState(myPanel, 3, true);
            completionCallback();
          }
        };
        myPanel._internalOnHide = function() {
          revealHideSequence++;
          if (revealHideSequence === 2) { // Second event (item 2 hide)
            verifyPanelItemState(myPanel, 2, false);
          }
        };

        myPanel.expandItem(2);
      });

      it('should allow multiple items to be open when "allowMultipleOpen" is true', function(completionCallback) {
        // Clone options and explicitly allow multiple open items.
        const customConfig = { ...defaultPanelConfig, allowMultipleOpen: true };

        const myPanel = new AccessibilityPanel(customConfig);

        verifyPanelItemState(myPanel, 2, false); // Item 2 initially hidden
        verifyPanelItemState(myPanel, 3, false); // Item 3 initially hidden

        let revealCount = 0;
        myPanel._internalOnReveal = function() {
          revealCount++;
          if (revealCount === 1) { // First reveal (item 2)
            verifyPanelItemState(myPanel, 2, true);
            myPanel.expandItem(3); // Expand item 3, item 2 should remain open
          } else if (revealCount === 2) { // Second reveal (item 3)
            verifyPanelItemState(myPanel, 2, true); // Both should be open
            verifyPanelItemState(myPanel, 3, true);
            completionCallback();
          }
        };

        myPanel.expandItem(2);
      });
    });

    it('should collapse a specified panel item', function(completionCallback) {
      // Clone options and set a custom callback for content hide.
      const customConfig = { ...defaultPanelConfig };
      customConfig.onContentHide = function(hiddenElement) {
        verifyAssertion(hiddenElement).to.have.lengthOf(1);
        verifyPanelItemState(myPanel, 2, false); // Verify item 2 is hidden
        completionCallback();
      };

      const myPanel = new AccessibilityPanel(customConfig);

      // First, ensure the item is expanded so we can collapse it.
      myPanel._internalOnReveal = function() {
        verifyPanelItemState(myPanel, 2, true);
        myPanel.collapseItem(2); // Call the public method to collapse
      };

      myPanel.expandItem(2);
    });

    it('should toggle the visibility of a panel item', function(completionCallback) {
      // Clone options and set custom callbacks for show/hide events.
      const customConfig = { ...defaultPanelConfig };
      customConfig.onContentHide = function(hiddenElement) {
        verifyPanelItemState(myPanel, 2, false); // After toggle, it should be hidden
        completionCallback();
      };
      customConfig.onContentReveal = function(revealedElement) {
        verifyPanelItemState(myPanel, 2, true); // After first toggle, it should be visible
        myPanel.toggleItem(2); // Toggle again to hide
      };

      const myPanel = new AccessibilityPanel(customConfig);
      verifyPanelItemState(myPanel, 2, false); // Ensure initially hidden

      myPanel.toggleItem(2); // First toggle to show
    });

    it('should retrieve the correct panel item element via fetchRowElement()', function() {
      const myPanel = new AccessibilityPanel(defaultPanelConfig);
      let itemElement;

      // Test with an invalid index.
      itemElement = myPanel.fetchRowElement(-1);
      verifyAssertion(itemElement).to.be.undefined;

      // Test with a valid index.
      itemElement = myPanel.fetchRowElement(2); // Third item (index 2)
      verifyAssertion(itemElement).to.exist; // Use .to.exist for jQuery objects
      verifyAssertion(itemElement[0].id).to.equal('mainPanelArea-item-2'); // Check the generated ID
    });

    // --- Internal/Private Methods Tests ---

    it('should collapse all open items via _hideAllItems()', function(completionCallback) {
      const customConfig = { ...defaultPanelConfig, allowMultipleOpen: true }; // Allow multiple for this test
      let eventCounter = 0;

      customConfig.onContentHide = function(hiddenElement) {
        eventCounter++;
        if (eventCounter === 4) { // Two reveals + two hides = 4 events
          verifyPanelItemState(myPanel, 2, false);
          verifyPanelItemState(myPanel, 3, false);
          completionCallback();
        }
      };
      customConfig.onContentReveal = function(revealedElement) {
        eventCounter++;
        if (eventCounter === 2) { // After both 2 and 3 have revealed
          // New intermediate step: a short delay to ensure both are fully shown before collapsing
          setTimeout(() => {
            verifyPanelItemState(myPanel, 2, true);
            verifyPanelItemState(myPanel, 3, true);
            myPanel._hideAllItems(); // Call the internal method
          }, 50); // Small delay
        }
      };

      const myPanel = new AccessibilityPanel(customConfig);

      verifyPanelItemState(myPanel, 2, false);
      verifyPanelItemState(myPanel, 3, false);

      myPanel.expandItem(2);
      myPanel.expandItem(3);
    });

    it('should retrieve the collapsible content area via _retrieveContentArea()', function() {
      const myPanel = new AccessibilityPanel(defaultPanelConfig);
      let contentArea;

      // Test with an invalid index.
      contentArea = myPanel._retrieveContentArea(-1);
      verifyAssertion(contentArea).to.be.undefined;

      // Test with a valid index.
      contentArea = myPanel._retrieveContentArea(1); // Second item (index 1)
      verifyAssertion(contentArea).to.exist;
      verifyAssertion(contentArea.is(":visible")).to.be.false; // Should be hidden initially
      verifyAssertion(contentArea.attr('id')).to.equal('mainPanelArea-content-1'); // Check ID
    });

  });
})(chai.expect);