(function(jq) {
  /*
   * This file contains a suite of unit tests for the 'scrollNav' jQuery plugin.
   * It leverages a custom QUnit-like testing framework for assertions.
   *
   * Testing assertions reference (conceptual, not actual QUnit):
   *   assertCount(expectedAssertions) - Declares the number of assertions expected.
   *   isTrue(value, [message]) - Asserts that a value is truthy.
   *   isEqualTo(actual, expected, [message]) - Asserts loose equality.
   *   isNotEqualTo(actual, expected, [message]) - Asserts loose inequality.
   *   isDeeplyEqualTo(actual, expected, [message]) - Asserts deep equality for objects.
   *   isNotDeeplyEqualTo(actual, expected, [message]) - Asserts deep inequality for objects.
   *   isStrictlyEqualTo(actual, expected, [message]) - Asserts strict equality.
   *   isNotStrictlyEqualTo(actual, expected, [message]) - Asserts strict inequality.
   *   throwsError(block, [expected], [message]) - Asserts that a function throws an error.
   */

  // --- Core Plugin Functionality Tests ---
  testGroup('core plugin mechanics', {
    // This function executes prior to each test within this specific group.
    prepareModuleContext: function() {
      const testFixtureSelector = '#qunit-fixture';
      this.targetElements = jq(testFixtureSelector);

      // Validate that our target fixture exists before proceeding.
      if (!this.targetElements.length) {
        console.error('Test fixture not found: ' + testFixtureSelector);
        throw new Error('QUnit fixture element is missing!');
      }

      this.initialDOMSnapshot = this.targetElements.prop('innerHTML'); // Capture initial state of the fixture content.
      console.log('Core module: DOM snapshot taken before plugin init.');

      // Initialize the plugin without specific options for basic tests.
      this.pluginInstance = this.targetElements.scrollNav({}); // Pass an empty options object.
      this.activePluginCount = jq('.scroll-nav').length; // Count instances by checking for a common class.

      // Attempt to destroy the plugin immediately after creation.
      this.targetElements.scrollNav('destroy');
      this.remainingPluginCount = jq('.scroll-nav').length; // Count instances after destruction.
      this.finalDOMSnapshot = this.targetElements.prop('innerHTML'); // Capture final state of the fixture content.
      console.log('Core module: Plugin initialized and then destroyed for setup.');
    },
    // No explicit teardown here, as the plugin is destroyed within the setup.
    // The previous test run should have cleaned up sufficiently.
    cleanupModuleContext: function() {
      // Any additional global cleanup for this module could go here,
      // but is currently not required as per the original design intent.
    }
  });

  verify('plugin initialization returns chainable jQuery object', function() {
    assertCount(1);
    // Verifies that the plugin returns the original jQuery object, enabling method chaining.
    isStrictlyEqualTo(this.pluginInstance, this.targetElements, 'Plugin must return the jQuery object it was called on for chaining purposes.');
  });

  verify('correct number of plugin instances created', function() {
    assertCount(1);
    const expectedInstanceCount = 1;
    // Checks if exactly one instance of the scrollNav plugin is recognized in the DOM.
    isStrictlyEqualTo(this.activePluginCount, expectedInstanceCount, 'Expected a single active instance of the scrollNav plugin.');
  });

  verify('plugin is successfully destroyable', function() {
    assertCount(1);
    const zeroInstancesExpected = 0;
    // Confirms that all traces of the plugin, including its DOM elements, are removed after calling 'destroy'.
    isStrictlyEqualTo(this.remainingPluginCount, zeroInstancesExpected, 'No plugin-related elements should remain after calling the destroy method.');
  });

  verify('DOM content is reset to original state after destruction', function() {
    assertCount(1);
    // This assertion checks if the inner HTML of the fixture is identical before plugin initialization
    // and after its destruction, implying a clean removal of all plugin-introduced wrappers and elements.
    isStrictlyEqualTo(this.initialDOMSnapshot, this.finalDOMSnapshot, 'Fixture content must be identical before initialization and after destruction, indicating proper cleanup.');
  });

  // --- Section Handling Tests ---
  testGroup('section processing', {
    prepareModuleContext: function() {
      this.targetElements = jq('#qunit-fixture');
      // A quick check to ensure the fixture is available.
      if (this.targetElements.length === 0) {
        console.error('Fixture element missing for sections module tests.');
        return;
      }
      this.processedSections = this.targetElements.scrollNav().children();
      console.log('Sections module: Plugin initialized and sections extracted.');
    },
    cleanupModuleContext: function() {
      this.targetElements.scrollNav('destroy'); // Ensure a clean slate for subsequent tests.
      console.log('Sections module: Plugin destroyed after tests.');
    }
  });

  verify('correct total number of main sections identified', function() {
    assertCount(1);
    const expectedSectionCount = 2;
    // The plugin should correctly identify and wrap the primary sections.
    isStrictlyEqualTo(this.processedSections.length, expectedSectionCount, 'Expected two main sections to be generated by the plugin.');
  });

  verify('first main section contains expected number of children', function() {
    assertCount(1);
    const firstSectionChildren = this.processedSections.eq(0).children();
    // Validates the structural integrity of the first generated section.
    isStrictlyEqualTo(firstSectionChildren.length, 6, 'The first section should correctly contain six child elements.');
  });

  verify('second main section contains expected number of children', function() {
    assertCount(1);
    const secondSectionChildren = this.processedSections.eq(1).children();
    // Validates the structural integrity of the second generated section.
    isStrictlyEqualTo(secondSectionChildren.length, 6, 'The second section should correctly contain six child elements.');
  });

  verify('first main section has the correct HTML tag', function() {
    assertCount(1);
    const currentSectionTagName = this.processedSections.eq(0).prop('tagName');
    // Ensures the plugin wraps sections with the appropriate semantic tag.
    isStrictlyEqualTo(currentSectionTagName, 'SECTION', 'The first main section element must be a <SECTION> tag.');
  });

  verify('second main section has the correct HTML tag', function() {
    assertCount(1);
    const currentSectionTagName = this.processedSections.eq(1).prop('tagName');
    // Ensures the plugin consistently uses the correct semantic tag for all main sections.
    isStrictlyEqualTo(currentSectionTagName, 'SECTION', 'The second main section element must also be a <SECTION> tag.');
  });

  verify('first main section possesses the correct identifier', function() {
    assertCount(1);
    const currentSectionIdentifier = this.processedSections.eq(0).attr('id');
    // Checks if the plugin assigns predictable and unique IDs to sections.
    isStrictlyEqualTo(currentSectionIdentifier, 'scrollNav-1', 'The ID of the first section should be "scrollNav-1".');
  });

  verify('second main section possesses the correct identifier', function() {
    assertCount(1);
    const currentSectionIdentifier = this.processedSections.eq(1).attr('id');
    // Checks if the plugin assigns predictable and unique IDs to subsequent sections.
    isStrictlyEqualTo(currentSectionIdentifier, 'scrollNav-2', 'The ID of the second section should be "scrollNav-2".');
  });

  verify('first main section has the correct CSS class', function() {
    assertCount(1);
    const currentSectionCssClass = this.processedSections.eq(0).attr('class');
    // Verifies that the default CSS class is applied to the main sections.
    isStrictlyEqualTo(currentSectionCssClass, 'scroll-nav__section', 'The first main section should have the default class "scroll-nav__section".');
  });

  // --- Sub-section Handling Tests ---
  testGroup('sub-section processing', {
    prepareModuleContext: function() {
      this.targetElements = jq('#qunit-fixture');
      // Define configuration for sub-sections.
      const pluginConfiguration = {
        mainSectionsSelector: 'h2',
        secondarySectionsSelector: 'h3',
        displayHeadline: true
      };
      this.navigationPlugin = this.targetElements.scrollNav(pluginConfiguration);
      this.processedSections = this.navigationPlugin.children();
      console.log('Sub-sections module: Plugin initialized with specific selectors.');
    },
    cleanupModuleContext: function() {
      this.targetElements.scrollNav('destroy');
      console.log('Sub-sections module: Plugin destroyed after tests.');
    }
  });

  verify('correct total number of sub-sections within the first main section', function() {
    assertCount(2);
    const subSectionElements = this.processedSections.eq(0).find('.scroll-nav__sub-section');
    // Ensures that the plugin correctly identifies and wraps sub-sections based on provided selectors.
    isStrictlyEqualTo(subSectionElements.length, 2, 'The first main section should contain exactly two sub-sections.');
    isTrue(subSectionElements.length > 0, 'Sub-sections must be present in the first main section.');
  });

  // --- Navigation Generation Tests ---
  testGroup('navigation element generation', {
    prepareModuleContext: function() {
      this.targetElements = jq('#qunit-fixture');
      this.navigationPlugin = this.targetElements.scrollNav();
      this.processedSections = this.navigationPlugin.children();
      this.generatedNavigation = this.navigationPlugin.siblings('nav');
      // Log a warning if the navigation element is not found, indicating a potential setup issue.
      if (this.generatedNavigation.length === 0) {
        console.warn('Navigation element could not be found in the DOM after plugin initialization.');
      }
      console.log('Navigation module: Plugin initialized and navigation elements extracted.');
    },
    cleanupModuleContext: function() {
      this.targetElements.scrollNav('destroy');
      console.log('Navigation module: Plugin destroyed after tests.');
    }
  });

  verify('navigation element is successfully inserted into the DOM', function() {
    assertCount(1);
    // Checks for the existence of the generated navigation container.
    isTrue(this.generatedNavigation.length > 0, 'A navigation element should be present in the DOM.');
  });

  verify('navigation element has the correct default CSS class', function() {
    assertCount(1);
    const navigationCssClass = this.generatedNavigation.attr('class');
    // Confirms that the main navigation wrapper applies the expected styling class.
    isStrictlyEqualTo(navigationCssClass, 'scroll-nav', 'The primary navigation element should have the class "scroll-nav".');
  });

  verify('navigation wrapper div has the correct default CSS class', function() {
    assertCount(1);
    const wrapperCssClass = this.generatedNavigation.children('div').attr('class');
    // Verifies that the internal wrapper element within the navigation also has the correct class.
    isStrictlyEqualTo(wrapperCssClass, 'scroll-nav__wrapper', 'The navigation wrapper div should possess the class "scroll-nav__wrapper".');
  });

  verify('first navigation link displays the correct text content', function() {
    assertCount(1);
    const sectionHeadingText = this.processedSections.eq(0).children().eq(0).text().trim(); // Trim whitespace for robust comparison.
    const navigationLinkText = this.generatedNavigation.find('li').eq(0).text().trim(); // Trim whitespace.
    // The text of the navigation link should correspond to the heading of its associated section.
    isStrictlyEqualTo(navigationLinkText, sectionHeadingText, 'The first navigation link text must accurately reflect its corresponding section heading.');
  });

  verify('second navigation link displays the correct text content', function() {
    assertCount(1);
    const sectionHeadingText = this.processedSections.eq(1).children().eq(0).text().trim();
    const navigationLinkText = this.generatedNavigation.find('li').eq(1).text().trim();
    // The text of the second navigation link should also match its respective section heading.
    isStrictlyEqualTo(navigationLinkText, sectionHeadingText, 'The second navigation link text must accurately reflect its corresponding section heading.');
  });

  verify('first navigation link has the correct URL (href attribute)', function() {
    assertCount(1);
    const sectionIdentifier = this.processedSections.eq(0).attr('id');
    const navigationLinkHref = this.generatedNavigation.find('li').eq(0).find('a').attr('href');
    // Navigation links should point to their associated section IDs using a hash reference.
    isStrictlyEqualTo(navigationLinkHref, '#' + sectionIdentifier, 'The first navigation link URL should correctly point to its section ID: #' + sectionIdentifier + '.');
  });

  verify('second navigation link has the correct URL (href attribute)', function() {
    assertCount(1);
    const sectionIdentifier = this.processedSections.eq(1).attr('id');
    const navigationLinkHref = this.generatedNavigation.find('li').eq(1).find('a').attr('href');
    // The second navigation link should also correctly reference its section ID.
    isStrictlyEqualTo(navigationLinkHref, '#' + sectionIdentifier, 'The second navigation link URL should correctly point to its section ID: #' + sectionIdentifier + '.');
  });

  // --- Custom Options Tests ---
  testGroup('custom options application', {
    prepareModuleContext: function() {
      this.targetElements = jq('#qunit-fixture');
      const customCssBaseName = 'nav-test-custom'; // Define a custom class name.
      this.navigationPlugin = this.targetElements.scrollNav({
        baseCssClass: customCssBaseName // Apply the custom base class via options.
      });
      this.generatedNavigation = this.navigationPlugin.siblings('nav');
      this.processedSections = this.navigationPlugin.children();
      console.log('Options module: Plugin initialized with a custom base CSS class.');
    },
    cleanupModuleContext: function() {
      this.targetElements.scrollNav('destroy');
      console.log('Options module: Plugin destroyed after tests.');
    }
  });

  verify('navigation element correctly applies custom base class', function() {
    assertCount(1);
    const navigationCssClass = this.generatedNavigation.attr('class');
    // Checks if the custom class name provided in options is used for the main navigation.
    isStrictlyEqualTo(navigationCssClass, 'nav-test-custom', 'The navigation element should adopt the custom base class "nav-test-custom".');
  });

  verify('navigation wrapper div correctly applies custom class extension', function() {
    assertCount(1);
    const wrapperCssClass = this.generatedNavigation.children('div').attr('class');
    // Verifies that the custom base class extends correctly to the internal wrapper element.
    isStrictlyEqualTo(wrapperCssClass, 'nav-test-custom__wrapper', 'The navigation wrapper should use the extended custom class "nav-test-custom__wrapper".');
  });

  verify('first main section correctly applies custom class extension', function() {
    assertCount(1);
    const currentSectionCssClass = this.processedSections.eq(0).attr('class');
    // Confirms that the custom base class also applies correctly to the generated section elements.
    isStrictlyEqualTo(currentSectionCssClass, 'nav-test-custom__section', 'The first main section should use the extended custom class "nav-test-custom__section".');
  });

  // --- Callback Functionality Tests ---
  testGroup('plugin callback execution', {
    prepareModuleContext: function() {
      this.targetElements = jq('#qunit-fixture');
      const bodyReference = jq('body'); // Cache jQuery body reference.
      const initTriggerClass = 'init-triggered';
      const renderCompletionClass = 'render-completed';

      // Initialize the plugin with custom callback functions.
      this.navigationPlugin = this.targetElements.scrollNav({
        onInitialization: function() {
          bodyReference.addClass(initTriggerClass); // Add class on init.
          console.log('Callback: onInitialization fired.');
        },
        onRenderingComplete: function() {
          bodyReference.addClass(renderCompletionClass); // Add class on render.
          console.log('Callback: onRenderingComplete fired.');
        },
        onDestruction: function() {
          bodyReference.removeClass(initTriggerClass + ' ' + renderCompletionClass); // Remove classes on destroy.
          console.log('Callback: onDestruction fired.');
        }
      });

      this.hasInitialClass = bodyReference.hasClass(initTriggerClass); // Check init class state.
      this.hasRenderedClass = bodyReference.hasClass(renderCompletionClass); // Check render class state.

      this.targetElements.scrollNav('destroy'); // Manually destroy the plugin.

      this.initialClassAfterDestroy = bodyReference.hasClass(initTriggerClass); // Check init class state after destroy.
      this.renderedClassAfterDestroy = bodyReference.hasClass(renderCompletionClass); // Check render class state after destroy.
      console.log('Callbacks module: Plugin initialized, callbacks checked, and plugin destroyed.');
    },
    // No explicit cleanupModuleContext needed as all cleanup is handled within the setup's onDestroy callback.
    cleanupModuleContext: function() {
      // All necessary DOM cleanup and state reset is managed by the onDestroy callback.
      // No further actions are required here to prevent interference with other tests.
    }
  });

  verify('onInitialization callback successfully executed', function() {
    assertCount(1);
    // Verifies that the onInitialization callback was triggered, indicated by a class on the body.
    isStrictlyEqualTo(this.hasInitialClass, true, 'The "init-triggered" class should be present on the body, confirming onInitialization callback execution.');
  });

  verify('onRenderingComplete callback successfully executed', function() {
    assertCount(1);
    // Verifies that the onRenderingComplete callback was triggered.
    isStrictlyEqualTo(this.hasRenderedClass, true, 'The "render-completed" class should be present on the body, confirming onRenderingComplete callback execution.');
  });

  verify('onDestruction callback successfully executed and cleaned up', function() {
    assertCount(2);
    // Asserts that the classes added by initialization and rendering callbacks are removed after destruction.
    isStrictlyEqualTo(this.initialClassAfterDestroy, false, 'The "init-triggered" class must be absent from the body after plugin destruction.');
    isStrictlyEqualTo(this.renderedClassAfterDestroy, false, 'The "render-completed" class must be absent from the body after plugin destruction.');
  });

}(jQuery));