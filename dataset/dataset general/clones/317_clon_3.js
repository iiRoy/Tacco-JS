/* TestRunner.js v1.0.0 - A modular JavaScript test execution and reporting engine */
(function() {
  /**
   * Main initialization function for the TestRunner instance.
   * This sets up the core components and returns the runner object.
   */
  function initializeTestRunner() {
    // The central orchestrator for test execution and state management
    const runner = function(mainAction, setupHint) {
      runner._currentAction = mainAction; // Stores the primary action/test suite to be executed
      // Provide a helpful hint if a function is passed as the second argument, suggesting better structuring
      if (typeof setupHint === 'function') {
        console.info("TestRunner: For better organization, consider using .suite() to define your test blocks.");
      }
      return runner;
    };

    runner.initModule = initializeTestRunner; // Self-reference for re-initialization or internal use

    // Fundamental modules and state containers for the runner
    runner.negate = { _isNegated: true }; // Flag to indicate a negated assertion (e.g., 'not' operator)
    runner.assertionHandlers = {}; // Stores functions responsible for handling different assertion types
    runner.utilityFunctions = {}; // Collection of general-purpose helper functions
    runner.constants = {
        DEFAULT_SUITE_NAME: "Unnamed Test Suite",
        CSS_INJECTION_ID: "test-runner-styles-container",
        JQUERY_REQUIRED_MSG: "TestRunner requires jQuery for DOM operations. Please ensure it's loaded.",
        EMPTY_TEMPLATE_ERROR: "TestRunner: Invalid or empty template string provided."
    };

    /**
     * Manages configuration settings for the TestRunner.
     * Supports reading, writing, and hierarchical configuration.
     * @param {string|object} inputParam - A string key to read, or an object of settings to write.
     * @param {*} [valueParam] - The value to set if inputParam is a string key.
     * @returns {object|*} The current settings object, or a specific setting's value.
     */
    runner.settings = runner.set = function (inputParam, valueParam) {
      // Determines if settings are inherited from a parent context (e.g., global vs. local suite)
      const isInheritableContext = this._inheritable || false;
      // Indicates if this call is for a specific context (e.g., .localSettings, .globalSettings)
      const isSpecializedContext = !!this._specialized;

      // Normalize the input arguments into a consistent format (string for read, object for write)
      const processedInput = runner.settings.normalizeInput(inputParam, valueParam);

      if (processedInput === null) {
        console.warn("TestRunner: Configuration input was ambiguous or invalid, operation aborted.");
        return; // Early exit for unprocessable input
      }

      if (typeof processedInput === 'string') {
        return retrieveSetting(processedInput); // Handle a request to read a specific setting
      } else if (typeof processedInput === 'object' && processedInput !== null) {
        return updateSettings(processedInput); // Handle a request to write one or more settings
      } else {
        console.error("TestRunner: Unexpected configuration input type after normalization:", processedInput);
        return; // Should ideally not be reached if normalizeInput works correctly
      }

      /**
       * Updates the configuration store based on the current context (inheritable or local).
       * @param {object} newSettings - An object containing key-value pairs of settings to update.
       * @returns {object} The complete set of current settings after the update.
       */
      function updateSettings(newSettings) {
        if (isInheritableContext) {
          for (const key in newSettings) {
            if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
              runner.settings.globalInheritable[key] = newSettings[key]; // Update global, inheritable settings
            }
          }
        } else {
          for (const key in newSettings) {
            if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
              runner.settings.currentLevel[key] = newSettings[key]; // Update local, current-level settings
            }
          }
        }
        return retrieveSetting(); // Return all current settings for convenience
      }

      /**
       * Retrieves settings based on the context, either specific to this level or combined.
       * @param {string} [keyToRetrieve] - Optional key for a single setting. If omitted, all settings are returned.
       * @returns {*} The value of the requested setting, or an object of all relevant settings.
       */
      function retrieveSetting(keyToRetrieve) {
        if (isSpecializedContext) {
          const targetStore = isInheritableContext ? runner.settings.globalInheritable : runner.settings.currentLevel;
          if (keyToRetrieve) {
            return targetStore[keyToRetrieve];
          } else {
            return { ...targetStore }; // Return a shallow copy to prevent external modification
          }
        } else {
          return mergeAndRetrieveSettings(keyToRetrieve); // Combine inheritable and local settings
        }
      }

      /**
       * Combines global inheritable and current level settings.
       * Current level settings take precedence in case of key conflicts.
       * @param {string} [queryKey] - Optional key to retrieve a single merged setting.
       * @returns {*} The merged setting value or a new object with all merged settings.
       */
      function mergeAndRetrieveSettings(queryKey) {
        const globalInheritableStore = runner.settings.globalInheritable;
        const currentLevelStore = runner.settings.currentLevel;

        if (queryKey) { // Request for a single, specific setting
          if (Object.prototype.hasOwnProperty.call(currentLevelStore, queryKey)) {
            return currentLevelStore[queryKey];
          } else if (Object.prototype.hasOwnProperty.call(globalInheritableStore, queryKey)) {
            return globalInheritableStore[queryKey];
          } else {
            return undefined; // Indicate that the key was not found in either store
          }
        } else { // Request for all merged settings
          // Use spread syntax for a cleaner merge, with currentLevelStore overriding globalInheritableStore
          return { ...globalInheritableStore, ...currentLevelStore };
        }
      }
    };

    /**
     * Standardizes configuration input for consistent processing.
     * @param {string|object} mainArg - The primary argument, either a setting key or an object of settings.
     * @param {*} [secondaryArg] - The value for the setting if mainArg is a string key.
     * @returns {string|object|null} A string for a read request, an object for a write request, or null for invalid input.
     */
    runner.settings.normalizeInput = (mainArg, secondaryArg) => {
      if (typeof mainArg === 'object' && mainArg !== null) {
        // If an object is provided, it's a direct settings object for writing.
        return mainArg;
      } else if (typeof mainArg === 'string') {
        if (secondaryArg === undefined) {
          // If only a string, it's a request to read a specific setting.
          return mainArg;
        } else {
          // If a string key and a value are provided, it's a single setting to write.
          const settingObject = {};
          settingObject[mainArg] = secondaryArg;
          return settingObject;
        }
      } else if (mainArg === null || mainArg === undefined) {
        // Null or undefined indicates a general read request for all settings.
        return null; // Return null to signal a full read, as per original logic's 'null' return
      } else {
        console.warn("TestRunner: Unhandled configuration input type encountered during normalization:", typeof mainArg, mainArg);
        return null; // For any other unexpected input type
      }
    };

    // Initialize the two levels of configuration storage
    runner.settings.currentLevel = {}; // Stores settings specific to the current test suite/level
    runner.settings.globalInheritable = {}; // Stores settings that can be inherited by child suites

    // Objects providing specialized contexts for configuration access
    runner.localSettings = { // Access point for current-level settings
      _inheritable: false,
      _specialized: true,
      settings: runner.set,
      set: runner.set
    };
    runner.globalSettings = { // Access point for global, inheritable settings
      _inheritable: true,
      _specialized: true,
      set: runner.set,
      settings: runner.set
    };

    /**
     * Retrieves the source file and line number of the calling function.
     * Used for providing context in assertion messages.
     * @param {number} [stackOffset=3] - The number of stack frames to skip to find the relevant caller.
     * @returns {string} A string representing the call origin (e.g., "filename.js:123").
     */
    runner.utilityFunctions.getCurrentCallOrigin = function(stackOffset = 3) {
      try {
        const err = new Error();
        const errorStack = err.stack;
        if (!errorStack) {
            return '(origin unavailable - no stack trace)';
        }
        // Stack traces often start with "Error\n" or "at FunctionName (path:line:col)"
        // We want the line after the initial error message and this function call.
        const stackLines = errorStack.split('\n');
        // Adjusted offset to account for potential "Error" line and this function's call itself
        const targetLine = stackLines[stackOffset + 1];
        if (!targetLine) {
            return '(origin line not found in stack)';
        }
        // Regex to extract file:line:column from common stack formats
        // Matches " (path/to/file.js:line:col)" or "at Function (path/to/file.js:line:col)"
        const match = targetLine.match(/\(([^:]+:\d+:\d+)\)$|at\s(?:.+?)\s\((.+?:\d+:\d+)\)$/);
        return match ? (match[1] || match[2] || '(anonymous source)') : '(unknown source)';
      } catch (e) {
        console.error("TestRunner: Error while attempting to get caller origin:", e);
        return '(error fetching call origin)';
      }
    };

    /**
     * A simple templating engine for processing strings with placeholders and conditional blocks.
     * Supports `{{varName}}` for direct replacement, `{{#key}}...{{/key}}` for truthy blocks,
     * and `{{^key}}...{{/key}}` for falsy blocks.
     * @param {string} templateString - The template string with placeholders.
     * @param {object} dataContext - An object containing the variables to substitute.
     * @returns {string} The processed string with variables replaced.
     */
    const renderTemplate = runner.utilityFunctions.renderTemplate = (templateString, dataContext) => {
      let processedOutput = templateString;
      dataContext = dataContext || {}; // Ensure dataContext is an object

      if (typeof processedOutput !== 'string' || processedOutput.length === 0) {
        console.error(runner.constants.EMPTY_TEMPLATE_ERROR);
        return "";
      }

      // 1. Process truthy conditional blocks: {{#key}}...{{/key}}
      // The 's' flag (dotAll) allows '.' to match newlines, important for multi-line content.
      const TRUTHY_BLOCK_REGEX = /\{\{\s*#\s*(\w+)\s*\}\}(.*?)\{\{\s*\/\s*\1\s*\}\}/gs;
      processedOutput = processedOutput.replace(TRUTHY_BLOCK_REGEX, (match, varName, content) => {
        return !!dataContext[varName] ? content : ''; // Include content if varName is truthy, else empty string
      });

      // 2. Process falsy conditional blocks: {{^key}}...{{/key}}
      const FALSY_BLOCK_REGEX = /\{\{\s*\^\s*(\w+)\s*\}\}(.*?)\{\{\s*\/\s*\1\s*\}\}/gs;
      processedOutput = processedOutput.replace(FALSY_BLOCK_REGEX, (match, varName, content) => {
        return !dataContext[varName] ? content : ''; // Include content if varName is falsy, else empty string
      });

      // 3. Process simple variable replacements: {{varName}}
      const VARIABLE_REPLACEMENT_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
      processedOutput = processedOutput.replace(VARIABLE_REPLACEMENT_REGEX, (match, varName) => {
        // Check for own property to avoid prototype chain lookups
        return Object.prototype.hasOwnProperty.call(dataContext, varName) ? String(dataContext[varName]) : '';
      });

      return processedOutput;
    };

    /**
     * Formats various JavaScript values into a human-readable string representation.
     * Includes special handling for strings (quoting), functions, arrays, and objects.
     * @param {*} inputValue - The value to format.
     * @param {boolean} [detailedOutput=false] - If true, provides a more detailed output for complex types.
     * @returns {string} The formatted string.
     */
    runner.utilityFunctions.formatValue = (inputValue, detailedOutput = false) => {
      let formattedResult = '';

      if (inputValue === null) {
        return 'null'; // Explicitly handle null before typeof
      }

      const valueType = typeof inputValue;

      switch (valueType) {
        case 'number':
          formattedResult = inputValue.toString();
          break;
        case 'string':
          // Smart quoting logic: use single quotes by default, or double quotes if single quotes are more prevalent inside
          const singleQuoteCount = (inputValue.match(/'/g) || []).length;
          const doubleQuoteCount = (inputValue.match(/"/g) || []).length;
          const escapeBackslash = '\\';

          if (singleQuoteCount > doubleQuoteCount) {
            // More single quotes inside, so enclose with double quotes and escape internal double quotes
            formattedResult = `"${inputValue.replace(/"/g, escapeBackslash + '"')}"`;
          } else {
            // More or equal double quotes inside, or no quotes at all, so enclose with single quotes
            formattedResult = `'${inputValue.replace(/'/g, escapeBackslash + "'")}'`;
          }
          break;
        case 'function':
          formattedResult = detailedOutput ? inputValue.toString() : 'function() { ... }';
          break;
        case 'boolean':
          formattedResult = inputValue.toString();
          break;
        case 'undefined':
          formattedResult = 'undefined';
          break;
        case 'object':
          if (Array.isArray(inputValue)) {
            formattedResult = detailedOutput ? JSON.stringify(inputValue, null, 2) : '[Array]'; // Simplified display
          } else if (inputValue.toString() === '[object Object]') {
            formattedResult = detailedOutput ? JSON.stringify(inputValue, null, 2) : '{Object}'; // Simplified display
          } else {
            // For other specific object types (e.g., Date, RegExp, custom classes)
            formattedResult = inputValue.toString();
          }
          break;
        default:
          formattedResult = `[unhandled type: ${valueType} - ${inputValue}]`; // Catch-all for unexpected types
      }
      return formattedResult;
    };

    runner.notifier = {}; // Module for handling UI updates and notifications

    /**
     * Announces a new test suite in the DOM.
     * Creates and appends the necessary HTML structure for the suite.
     * @param {object} suiteContext - The context object for the new suite, containing its name and other properties.
     */
    runner.notifier.announceSuite = function(suiteContext) {
      const jQuery = window.jQuery; // Local alias for jQuery
      if (typeof jQuery === 'undefined' || !jQuery) {
        console.error(runner.constants.JQUERY_REQUIRED_MSG);
        return;
      }
      const $parentElem = $(runner.domElement); // The DOM element of the current parent suite/root
      const templateCollection = runner.htmlTemplates;
      const currentRenderer = renderTemplate;

      // Ensure DOM is initialized if this is the first suite being announced
      if (!runner.globalState.initialized) {
        runner.initializeDom();
        runner.globalState.initialized = true;
      }

      // Create the DOM element for the new suite
      suiteContext.domElement = $(
        currentRenderer(templateCollection.suite, {
          gut: currentRenderer(templateCollection.suiteHeader, {
            headerText: escapeHtml(suiteContext.settings('name') || runner.constants.DEFAULT_SUITE_NAME)
          })
        })
      ).get(0); // Get the raw DOM element from the jQuery object

      // Append the new suite to the parent's unordered list of children
      $parentElem.children('ul').append(suiteContext.domElement);

      // Update the overall status display at the top of the test runner UI
      this.updateStatusDisplay(this.generateStatusText('executing'));

      // If the parent had no children, remove the 'no-children' class and set it to collapsed
      if ($parentElem.hasClass('no-children')) {
        $parentElem.removeClass('no-children').addClass('collapsed');
      }

      /**
       * Helper function to escape HTML entities in a string.
       * Prevents XSS vulnerabilities when inserting user-provided text into HTML.
       * @param {string} unsafe - The string to escape.
       * @returns {string} The HTML-safe string.
       */
      function escapeHtml(unsafe) {
        return String(unsafe)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;'); // Use numeric entity for single quote
      }
    };

    /**
     * Marks the current test suite as completed.
     * If all child assertions/suites have passed, the suite itself is marked passed.
     * Propagates completion status up to parent suites.
     * @param {object} [completionInfo] - Optional information about the completion (currently unused).
     */
    runner.notifier.suiteCompleted = function(completionInfo) {
      const jQuery = window.jQuery;
      if (typeof jQuery === 'undefined' || !jQuery) { console.error(runner.constants.JQUERY_REQUIRED_MSG); return; }

      const $currentSuiteElem = $(runner.domElement);
      // Check if all children (assertions or nested suites) have passed.
      // Removed check for 'commented' elements as that feature was removed.
      if ($currentSuiteElem.has('ul li:not(.passed)').length === 0) {
        $currentSuiteElem.removeClass('pending').addClass('passed');
        // If this suite has a parent, notify the parent of its completion
        if (runner.parentSuite) {
          runner.parentSuite.notifier.suiteCompleted();
        }
      } else {
          // If some children haven't passed, but the suite is 'completed', it means it failed.
          // This path is usually handled by suiteFailed, but this log can catch edge cases.
          console.log("TestRunner: Suite completed, but some children are not marked as passed. This suite might implicitly fail.");
      }
    };

    /**
     * Marks the current test suite as failed.
     * This status propagates up to all parent suites, marking them as failed as well.
     */
    runner.notifier.suiteFailed = function() {
      const jQuery = window.jQuery;
      if (typeof jQuery === 'undefined' || !jQuery) { console.error(runner.constants.JQUERY_REQUIRED_MSG); return; }

      const $currentSuiteElem = $(runner.domElement);
      $currentSuiteElem
        .removeClass('pending')
        .removeClass('collapsed') // Ensure failed suites are expanded for inspection
        .removeClass('passed') // Remove any passed status if it was set before
        .addClass('failed')
        .addClass('expanded'); // Always expand a failed suite

      // Propagate the failure up the hierarchy
      if (runner.parentSuite) {
        runner.parentSuite.notifier.suiteFailed();
      }
    };

    /**
     * Updates the main status display area at the top of the TestRunner UI.
     * @param {string} statusText - The HTML string to display as the current status.
     */
    runner.notifier.updateStatusDisplay = function(statusText) {
      const jQuery = window.jQuery;
      if (typeof jQuery === 'undefined' || !jQuery) { console.error(runner.constants.JQUERY_REQUIRED_MSG); return; }
      $(runner.globalState.rootDomElement).children('.summary').html(statusText);
    };

    /**
     * Records and displays a single assertion result in the DOM.
     * Updates the UI status and propagates failure if the assertion fails.
     * @param {object} assertionResult - An object containing details about the assertion (pass/fail, actual, expected, message).
     */
    runner.notifier.recordAssertion = function(assertionResult) {
      const jQuery = window.jQuery;
      if (typeof jQuery === 'undefined' || !jQuery) { console.error(runner.constants.JQUERY_REQUIRED_MSG); return; }

      // Ensure DOM is initialized if this is the first assertion
      if (!runner.globalState.initialized) {
        runner.initializeDom();
        runner.globalState.initialized = true;
      }
      this.updateStatusDisplay(this.generateStatusText('executing'));

      const $currentSuiteElem = $(runner.domElement);
      // If the current suite had no children, remove 'no-children' and mark as collapsed
      if ($currentSuiteElem.hasClass('no-children')) {
        $currentSuiteElem.removeClass('no-children').addClass('collapsed');
      }

      // If the assertion failed, propagate the failure up the suite hierarchy
      if (!assertionResult.isPassing) {
        runner.notifier.suiteFailed();
      }

      // Ensure the source path is set, using the utility function if not already provided
      assertionResult.path = assertionResult.path || runner.utilityFunctions.getCurrentCallOrigin(4); // Adjust stack offset

      // Add type information for actual and expected values, ensuring they are not null/undefined
      if (assertionResult.actualValue !== undefined && assertionResult.actualValue !== null) {
        assertionResult.actualType = typeof assertionResult.actualValue;
      }
      if (assertionResult.expectedValue !== undefined && assertionResult.expectedValue !== null) {
        assertionResult.expectedType = typeof assertionResult.expectedValue;
      }

      // Append the rendered assertion HTML to the current suite's children list
      $currentSuiteElem.children('ul').append(
        $(renderTemplate(runner.htmlTemplates.assertion, assertionResult))
      );

      // Update global state counts
      runner.globalState.totalAssertionCount++;
      if (assertionResult.isPassing) {
        runner.globalState.passedAssertionCount++;
      }
    };

    /**
     * Initializes the DOM structure for the TestRunner UI.
     * Injects CSS, creates the root container, and sets up event handlers.
     * @param {string|HTMLElement|jQuery} [targetElement] - The selector, DOM element, or jQuery object to append the runner to.
     */
    runner.initializeDom = function(targetElement) {
      const jQuery = window.jQuery;
      if (typeof jQuery === 'undefined' || !jQuery) {
        throw new Error(runner.constants.JQUERY_REQUIRED_MSG);
      }
      if (runner.globalState.initialized) {
        console.info('TestRunner: DOM already initialized, skipping re-initialization.');
        return;
      }
      runner.globalState.initialized = true;

      const templateCollection = runner.htmlTemplates;
      const currentRenderer = renderTemplate;

      let $appendToElement;
      let $documentHead = $('head');
      let rootContainerId = '';

      // Determine where to append the TestRunner UI
      if (targetElement && typeof targetElement.jquery !== 'undefined') { // Check if it's a jQuery object
        $appendToElement = targetElement;
      } else if (targetElement && typeof targetElement === 'object' && targetElement.nodeType === 1) { // Check if it's a raw DOM element
        $appendToElement = $(targetElement);
      } else if (typeof targetElement === 'string' && targetElement.length > 0) {
        rootContainerId = targetElement;
        $appendToElement = $(`#${rootContainerId}`).length ? $(`#${rootContainerId}`) : $('body');
      } else {
        $appendToElement = $('body'); // Default to appending to the body
      }

      // Inline CSS content (slightly modified from original)
      const inlineCssContent = `
        /* Base styles */
        .test-harness-root {
            background: #f8f8f8; color: #333; font: 14pt 'Roboto', sans-serif;
            padding: 15px 15px 0; box-shadow: 0 4px 15px 0 rgba(0,0,0,.3);
            padding-left: 100px; margin-bottom: 20px;
        }
        .test-harness-root > li > .summary em { font-style: italic; font-weight: 600; color: #007bff; }
        .test-harness-root .status-indicator {
            border: 2px solid #ccc; border-radius: 4px; padding: 1px 4px; font-size: 0.9em;
            text-transform: uppercase; font-weight: bold; margin-right: 5px;
        }
        .test-harness-root .status-indicator.pending { border-color: #f0ad4e; color: #f0ad4e; }
        .test-harness-root .status-indicator.failed { border-color: #dc3545; color: #dc3545; }
        .test-harness-root .status-indicator.passed { border-color: #28a745; color: #28a745; }
        .test-harness-root .status-indicator.info { border-color: #17a2b8; color: #17a2b8; }
        .test-harness-root ul { margin-top: 0; padding-left: 0; }
        .test-harness-root li { list-style-type: none; margin-top: 10px; text-indent: -80px; }
        .test-harness-root li:not(.no-children) > span { cursor: pointer; }

        /* Suite specific styles */
        .test-harness-root li.suite.commented { color: #999; }
        .test-harness-root li.suite.commented > .status-indicator { border-color: #999; }

        /* Assertion specific styles */
        .test-harness-root li.assertion .status-indicator.failed { background: #dc3545; color: #fff; }
        .test-harness-root li.assertion .status-indicator.passed { background: #28a745; color: #fff; }
        .test-harness-root li.assertion.failed table { border-left: 3px solid #dc3545; }
        .test-harness-root li.assertion.passed table { border-left: 3px solid #28a745; }
        .test-harness-root li.assertion table {
            font-size: 85%; margin: 8px 0 14px 45px; border-collapse: separate; border-spacing: 6px;
            text-indent: 0; margin-left: -40px !important;
        }
        .test-harness-root li.assertion table th {
            border-right: 1px solid rgba(0,0,0,.1); vertical-align: top; font-weight: normal;
            text-align: right; padding-right: 6px;
        }
        .test-harness-root li.assertion table td li { white-space: pre; }
        .test-harness-root .type.number, .test-harness-root .type.string { color: #007bff; }

        /* Toggle visibility */
        .test-harness-root .collapsed > ul,
        .test-harness-root .collapsed > table,
        .test-harness-root .collapsed > .toggle-handle:not(.plus-icon),
        .test-harness-root .expanded > .toggle-handle:not(.minus-icon),
        .test-harness-root .no-children > .toggle-handle:not(.dot-icon),
        .test-harness-root .pending > .status-indicator:not(.pending),
        .test-harness-root .failed > .status-indicator:not(.failed),
        .test-harness-root .passed > .status-indicator:not(.passed) {
            display: none;
        }
        .test-harness-root .toggle-handle {
            color: #6c757d; font: bold 130% 'Consolas', monospace; margin-right: 5px;
        }
        /* Disable text selection within the UI for handles and stamps */
        .test-harness-root * { -webkit-user-select: none; user-select: none; }
        /* Enable text selection for summary and table content */
        .test-harness-root .summary, .test-harness-root table,
        .test-harness-root .summary *, .test-harness-root table * { -webkit-user-select: initial; user-select: initial; }

        /* Logo positioning */
        .test-harness-root div.logo-area, .test-harness-root div.logo-area img { height: 55px; width: 65px; }
        .test-harness-root div.logo-area img { opacity: .6; position: absolute; right: 20px; top: 15px; }
      `;
      const styleWrapperStart = `<style id="${runner.constants.CSS_INJECTION_ID}">`;
      const styleWrapperEnd = '</style>';

      // Inject CSS only if not already present
      if ($documentHead.find(`style#${runner.constants.CSS_INJECTION_ID}`).length === 0) {
        $(styleWrapperStart + inlineCssContent + styleWrapperEnd).appendTo($documentHead);
        // Event delegation for toggling suite/assertion visibility (using modern jQuery .on())
        $appendToElement.on('click', '.test-harness-root .collapsed > span, .test-harness-root .expanded > span', function() {
            $(this).siblings('ul, table').toggle().parent('li')
              .toggleClass('collapsed expanded');
        });
      }

      const initialSummaryText = 'Initializing Test Run...';
      const $rootContainer =
        $(currentRenderer(templateCollection.rootContainer, {rootId: rootContainerId, logoPath: templateCollection.logo,
          content: currentRenderer(templateCollection.suite, {
            gut: currentRenderer(templateCollection.suiteHeader, {headerText: initialSummaryText})
          })
        }));

      // Store references to the root DOM elements
      const rootDisplayElement = $rootContainer.children('li.suite').get(0);
      runner.globalState.rootDomElement = rootDisplayElement;
      runner.domElement = rootDisplayElement; // Current active DOM element for new children

      $appendToElement.append($rootContainer);

      // Utility function to check if an object is a native DOM element
      function isDomElement(objToCheck) {
        return (
          typeof HTMLElement === "object" ? objToCheck instanceof HTMLElement :
          typeof objToCheck === "object" && objToCheck !== null && objToCheck.nodeType === 1 && typeof objToCheck.nodeName === "string"
        );
      }
    };

    /**
     * Hook called when the entire test execution process is finalized.
     * Updates the top-level status display to reflect completion.
     */
    runner.notifier.finalizationHook = function() {
      runner.notifier.updateStatusDisplay(this.generateStatusText('completed'));
    };

    /**
     * Generates a status string based on the current global state and a given status category.
     * Uses the templating engine to format the output.
     * @param {string} statusCategory - The category of status (e.g., 'executing', 'completed').
     * @returns {string} The formatted status message.
     */
    runner.notifier.generateStatusText = function(statusCategory) {
      const globalStateInfo = runner.globalState;
      globalStateInfo.elapsedTime = Date.now() - globalStateInfo.startTime; // Calculate elapsed time
      const currentRenderer = renderTemplate;
      // Use a template key that maps to the status category (e.g., progressStatus_executing)
      return currentRenderer(runner.htmlTemplates['progressStatus_' + statusCategory], globalStateInfo);
    };

    // HTML Templates for rendering the TestRunner UI (extensively modified from original)
    runner.htmlTemplates = {
      rootContainer: `
        <div {{#rootId}}id="{{ rootId }}"{{/rootId}} class="test-harness-root">
          {{ content }}
          <div class="logo-area">
            <a class="logo-link" href="https://github.com/Wizek/Tree"
              title="TestRunner.js Project Page">
              <img src="{{logoPath}}" alt="TestRunner.js Logo">
            </a>
          </div>
        </div>`
      , suite: `
        <li class="suite pending no-children">
          {{ gut }}
        </li>`
      , suiteHeader: `
        <span class="toggle-handle plus-icon">+</span>
        <span class="toggle-handle minus-icon">-</span>
        <span class="toggle-handle dot-icon">&nbsp;</span>
        <span class="status-indicator pending">RUN</span>
        <span class="status-indicator failed">FAIL</span>
        <span class="status-indicator passed">PASS</span>
        <span class="status-indicator info">INFO</span>
        <span class="summary">{{headerText}}
          {{^headerText}}<i title="No descriptive name provided">Anonymous Test Suite</i>{{/headerText}}
        </span>
        <ul>
        </ul>`
      , assertion: `
        <li class="assertion {{#isPassing}}passed collapsed{{/isPassing}}{{^isPassing}}failed expanded{{/isPassing}}">
          <span class="toggle-handle plus-icon">+</span>
          <span class="toggle-handle minus-icon">-</span>
          <span class="status-indicator failed">FAIL</span>
          <span class="status-indicator passed">PASS</span>
          <span class="summary">{{message}}</span>
          <span class="note"></span>
          <table class="content">
            {{#actualString}}<tr> <th>Actual</th>
              <td class="type {{actualType}}">{{actualString}}</td> </tr>{{/actualString}}
            {{#expectedString}}<tr> <th>Expected</th>
              <td class="type {{expectedType}}">{{expectedString}}</td> </tr>{{/expectedString}}
            {{#path}}<tr> <th>Source</th> <td>{{path}}</td> </tr>{{/path}}
          </table>
        </li>`
      , progressStatus_executing: `
        <em>Executing</em>, elapsed <em>{{elapsedTime}}ms</em>.
        <em>{{passedAssertionCount}}</em>/<em>{{totalAssertionCount}}</em> assertions
        across <em>{{suiteCount}}</em> suites
        {{#ignoredCount}} (+<em>{{ignoredCount}}</em> ignored){{/ignoredCount}}
        currently in progress...`
      , progressStatus_completed: `
        <em>Finished</em>, total time <em>{{elapsedTime}}ms</em>.
        <em>{{passedAssertionCount}}</em>/<em>{{totalAssertionCount}}</em> assertions
        across <em>{{suiteCount}}</em> suites.
        {{#ignoredCount}}(+<em>{{ignoredCount}}</em> ignored){{/ignoredCount}}`
      , logo: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI3MCI+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iNjAiIGhlaWdodD0iNTAiIHJ4PSI1IiBzdHJva2U9IiM0NDQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iIzY2NiIvPjx0ZXh0IHg9IjE4IiB5PSI0MiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIycHgiIGZpbGw9IiNmZmYiPlRSPC90ZXh0Pjx0ZXh0IHg9IjQ0IiB5PSI1NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiNmZmYiPi5qczwvdGV4dD48L3N2Zz4=`
    };

    // Assertion message templates (renamed and slightly modified)
    runner.assertionMessages = {
      defaultMessage: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}{{assertionType}} {{expectedDisplay}}',
      isOk: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}ok',
      shouldPass: 'Explicitly passed',
      shouldFail: 'Explicitly failed intentionally',
      isTruthy: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}truthy value',
      isFalsy: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}falsy value',
      throwsError: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}throw an error',
      isEqual: '{{actualDisplay}} {{#isNegated}}not {{/isNegated}}equal to {{expectedDisplay}}' // New message
    };

    // Functions that handle the logic for different assertion types
    runner.assertionHandlers.checkTruthy = function(assertionData) {
      assertionData.isPassing = !!assertionData.actualValue;
      return assertionData;
    };

    runner.assertionHandlers.forcePass = function(assertionData) {
      assertionData.isPassing = true;
      return assertionData;
    };

    runner.assertionHandlers.checkThrows = function(assertionData) {
      let didFunctionThrow = false;
      let caughtError = null;
      try {
        assertionData.actualValue(); // Expects actualValue to be a function
      } catch (e) {
        didFunctionThrow = true;
        caughtError = e; // Capture the error object
      }
      assertionData.isPassing = didFunctionThrow;
      assertionData.thrownError = caughtError; // New property to store the actual error
      return assertionData;
    };

    runner.assertionHandlers.forceFail = function(assertionData) {
      assertionData.isPassing = false;
      return assertionData;
    };

    runner.assertionHandlers.checkType = function(assertionData) {
      const expectedTypeName = String(assertionData.expectedValue).toLowerCase();
      const actualValue = assertionData.actualValue;

      switch (expectedTypeName) {
        case 'array':
          assertionData.isPassing = Array.isArray(actualValue);
          break;
        case 'nan':
          assertionData.isPassing = !(actualValue === actualValue); // NaN is the only value not equal to itself
          break;
        case 'object': // Explicitly check for plain objects, excluding arrays and null
          assertionData.isPassing = typeof actualValue === 'object' && actualValue !== null && !Array.isArray(actualValue);
          break;
        default:
          assertionData.isPassing = typeof actualValue === expectedTypeName;
          break;
      }
      return assertionData;
    };

    // New assertion handler: strict equality check (Type III: addition)
    runner.assertionHandlers.checkStrictEqual = function(assertionData) {
      assertionData.isPassing = (assertionData.actualValue === assertionData.expectedValue);
      return assertionData;
    };

    // Global state object to track overall test run progress and statistics
    runner.globalState = {
        initialized: false, // Flag indicating if the DOM has been initialized
        startTime: Date.now(), // Timestamp when the runner started
        rootDomElement: null, // Reference to the top-level DOM element of the runner
        suiteCount: 0, // Total number of test suites registered
        totalAssertionCount: 0, // Total number of assertions executed
        passedAssertionCount: 0, // Number of assertions that passed
        ignoredCount: 0, // Number of ignored suites/assertions (new, not fully implemented for original 'commented')
        elapsedTime: 0 // Total time taken for the test run
    };

    return runner; // Return the fully configured and initialized runner object
  }

  // Execute the initialization function and expose the TestRunner globally
  const exposedTestRunner = initializeTestRunner();

  // Expose the TestRunner in a way compatible with CommonJS modules and browser environments
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = exposedTestRunner;
  } else if (typeof window !== 'undefined') {
    window.TestRunner = exposedTestRunner; // Attach to the window object for browser use
  } else {
      console.warn("TestRunner: Could not be exposed globally. Neither 'module' nor 'window' is defined.");
  }
})();