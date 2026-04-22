(function() {

    // A utility namespace for managing the diagnostic interface.
    // This module handles the dynamic generation of the testing dashboard,
    // keyboard shortcut processing, and script loading/unloading for test management.
    const TestDashboardManager = {

        // Internal configuration and state variables
        _config: {
            overlayVisible: false,
            menuVisible: false,
            resultsPanelHeight: 0,
            animationDurationMs: 450, // Slightly different animation speed
            loadingGifPath: '/assets/images/spinner.gif', // Changed image path
            qunitLogoPath: '/assets/images/qunit_logo_small.png', // Changed image path
            qunitDocLink: 'https://qunitjs.com/intro/', // Updated QUnit documentation link
            initialResultsHeight: '0px',
            expandedResultsHeight: '420px' // Slightly different expanded height
        },

        /**
         * Initializes the diagnostic interface by constructing and injecting
         * the necessary HTML elements into the document body.
         * This includes the test menu, results panel, and main overlay.
         */
        initializeInterface: function() {
            // Helper function to create HTML fragments more cleanly
            const buildHtmlFragment = (tag, id, classes = [], content = '') => {
                let classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
                return `<${tag} id="${id}"${classAttr}>${content}</${tag}>`;
            };

            // Generate HTML for the shortcut menu
            let shortcutMenuMarkup = '';
            shortcutMenuMarkup += buildHtmlFragment('div', 'diagnostic-shortcuts');
            shortcutMenuMarkup += `  <ul class="shortcut-list">`;
            shortcutMenuMarkup += `    <li><strong>Keyboard Controls (Shift + Key):</strong></li>`;
            shortcutMenuMarkup += `    <li><strong>?</strong> - Toggle shortcut menu visibility</li>`;
            shortcutMenuMarkup += `    <li><strong>O</strong> - Display test overlay</li>`;
            shortcutMenuMarkup += `    <li><strong>H</strong> - Conceal test overlay</li>`;
            shortcutMenuMarkup += `    <li><strong>R</strong> - Execute all tests</li>`;
            shortcutMenuMarkup += `    <li><strong>T</strong> - Toggle test results panel</li>`;
            shortcutMenuMarkup += `  </ul>`;
            shortcutMenuMarkup += `</div>`; // Close diagnostic-shortcuts div

            // Generate HTML for the test results section
            let testResultsMarkup = '';
            testResultsMarkup += buildHtmlFragment('section', 'test-output-area');
            testResultsMarkup += `  <h1 id="test-output-header">Diagnostic Results</h1>`;
            testResultsMarkup += `  <h2 id="test-summary-banner"></h2>`;
            testResultsMarkup += `  <h3 id="user-agent-info"></h3>`;
            testResultsMarkup += `  <br /><img id="loading-indicator" src="${this._config.loadingGifPath}" alt="Loading Tests">`;
            testResultsMarkup += `  <ol id="test-case-list"></ol>`;
            testResultsMarkup += `</section>`; // Close test-output-area section

            // Generate HTML for the main diagnostic overlay
            let primaryOverlayMarkup = '';
            primaryOverlayMarkup += buildHtmlFragment('div', 'diagnostic-main-overlay');
            primaryOverlayMarkup += `  <div id="test-control-options">`;
            primaryOverlayMarkup += `    <ul class="control-menu">`;
            primaryOverlayMarkup += `      <li class="first-item"><a id="run-all-tests-btn" href="#">Initiate All Tests</a></li>`;
            primaryOverlayMarkup += `      <li class="last-item">Select Specific Test Suite: <select id="test-suite-selector">${window._testCollections_ || ''}</select></li>`; // Using window._testCollections_ as placeholder
            primaryOverlayMarkup += `    </ul>`;
            primaryOverlayMarkup += `    <img src="/assets/images/nav_separator.png" alt="separator">`; // Changed image path
            primaryOverlayMarkup += `  </div>`; // Close test-control-options
            primaryOverlayMarkup += shortcutMenuMarkup; // Embed the shortcut menu
            primaryOverlayMarkup += `  <div id="framework-credits">`;
            primaryOverlayMarkup += `    JavaScript testing powered by: <a href="${this._config.qunitDocLink}">`;
            primaryOverlayMarkup += `    <img src="${this._config.qunitLogoPath}" alt="QUnit Framework" border="0"></a></div>`;
            primaryOverlayMarkup += `</div>`; // Close diagnostic-main-overlay
            primaryOverlayMarkup += testResultsMarkup; // Embed the results section
            primaryOverlayMarkup += `<div style="clear: both;"></div>`; // Clearfix equivalent

            // Prepend the generated HTML to the document body
            if (document.body) {
                $('body').prepend(primaryOverlayMarkup);
                console.info('Diagnostic UI elements injected into document.');
            } else {
                console.error('Document body not found, cannot initialize diagnostic interface.');
            }
        },

        /**
         * Processes keyboard events to trigger various diagnostic actions.
         * Only responds to events when the shift key is pressed and not within
         * an active text input field.
         * @param {KeyboardEvent} keyEvt - The keyboard event object.
         */
        handleKeyboardInput: function(keyEvt) {
            const activeElementTagName = document.activeElement ? document.activeElement.nodeName.toLowerCase() : '';
            const isInputActive = ['input', 'textarea'].includes(activeElementTagName);

            // Skip if an input field is focused
            if (isInputActive) {
                return;
            }

            // Proceed only if Shift key is pressed
            if (keyEvt.shiftKey) {
                const keyPressCode = keyEvt.keyCode || keyEvt.charCode; // Normalize key code
                const animationSpeed = this._config.animationDurationMs;
                const resultsPanel = $('#test-output-area');
                const mainOverlay = $('#diagnostic-main-overlay');
                const shortcutPanel = $('#diagnostic-shortcuts');

                // Determine action based on key code
                switch (keyPressCode) {
                    case 83: // S key (show overlay)
                    case 115:
                        mainOverlay.show();
                        this._config.overlayVisible = true;
                        console.log('Diagnostic overlay shown.');
                        break;
                    case 72: // H key (hide overlay)
                    case 104:
                        if (resultsPanel.height() > 0) {
                            resultsPanel.animate({
                                height: '0px'
                            }, animationSpeed);
                            this._config.resultsPanelHeight = 0;
                        }
                        mainOverlay.hide();
                        this._config.overlayVisible = false;
                        console.log('Diagnostic overlay hidden.');
                        break;
                    case 191: // ? key (toggle menu)
                    case 47:
                        mainOverlay.show(); // Ensure overlay is visible before toggling menu
                        shortcutPanel.toggle();
                        this._config.menuVisible = !this._config.menuVisible;
                        console.log(`Shortcut menu toggled. Visible: ${this._config.menuVisible}`);
                        break;
                    case 65: // A key (run all tests)
                    case 97:
                        $('#run-all-tests-btn').trigger('click');
                        console.log('Initiating all tests via shortcut.');
                        break;
                    case 84: // T key (toggle results panel)
                    case 116:
                        if (this._config.resultsPanelHeight > 0) {
                            resultsPanel.animate({
                                height: '0px'
                            }, animationSpeed);
                            this._config.resultsPanelHeight = 0;
                            console.log('Test results panel collapsed.');
                        } else {
                            mainOverlay.show(); // Ensure overlay is visible
                            resultsPanel.animate({
                                height: this._config.expandedResultsHeight
                            }, animationSpeed);
                            this._config.resultsPanelHeight = parseInt(this._config.expandedResultsHeight);
                            console.log('Test results panel expanded.');
                        }
                        break;
                    default:
                        // No specific action for other keys
                        break;
                }
            }
        },

        /**
         * Dynamically injects a JavaScript file into the document's head.
         * Includes a cache-busting parameter.
         * @param {string} scriptLocation - The URL of the JavaScript file to load.
         */
        injectScriptTag: function(scriptLocation) {
            if (!scriptLocation || typeof scriptLocation !== 'string') {
                console.warn('Invalid script location provided for injection.');
                return;
            }

            const scriptElement = document.createElement('script');
            scriptElement.setAttribute('type', 'text/javascript');
            // Use current timestamp for more unique cache busting
            scriptElement.setAttribute('src', `/js/test_suites/${scriptLocation}?v=${Date.now()}`);

            document.head.appendChild(scriptElement);
            console.debug(`Script "${scriptLocation}" injected into head.`);
        },

        /**
         * Removes dynamically loaded JavaScript files from the document.
         * Identifies scripts by their source attribute containing the provided identifier.
         * @param {string} scriptPartialName - A substring to identify the script's src attribute.
         */
        removeDynamicScript: function(scriptPartialName) {
            if (!scriptPartialName || typeof scriptPartialName !== 'string') {
                console.warn('Invalid script identifier provided for removal.');
                return;
            }

            const scriptTags = document.getElementsByTagName('script');
            // Iterate backwards to safely remove elements without affecting loop indices
            for (let i = scriptTags.length - 1; i >= 0; i--) {
                const currentScript = scriptTags[i];
                if (currentScript && currentScript.getAttribute('src') &&
                    currentScript.getAttribute('src').includes(scriptPartialName)) {
                    currentScript.parentNode.removeChild(currentScript);
                    console.debug(`Script "${scriptPartialName}" removed from DOM.`);
                }
            }
        },

        /**
         * Prepares the UI for displaying test results.
         * This involves clearing previous results, showing the loading indicator,
         * and animating the results panel into view.
         */
        prepareTestDisplay: function() {
            const resultsPanel = $('#test-output-area');
            const testCaseList = $('#test-case-list');
            const summaryBanner = $('#test-summary-banner');
            const loadingSpinner = $('#loading-indicator');
            const mainOverlay = $('#diagnostic-main-overlay');

            // Ensure main overlay is visible
            mainOverlay.show();
            this._config.overlayVisible = true;

            // Clear any old test results
            testCaseList.empty();
            summaryBanner.removeClass().text(''); // Clear text and remove all classes
            resultsPanel.show();
            resultsPanel.animate({
                height: this._config.expandedResultsHeight
            }, this._config.animationDurationMs);
            this._config.resultsPanelHeight = parseInt(this._config.expandedResultsHeight);
            loadingSpinner.show();
            console.log('Test display prepared and results panel expanded.');
        },

        /**
         * Executes the registered test functions.
         * Assumes 'tests' is a global object containing test function names
         * and 'start' is a global function to initiate QUnit.
         */
        initiateTestExecution: function() {
            const loadingSpinner = $('#loading-indicator');

            // Guard against missing 'tests' object or 'QUnit.start'
            if (typeof window.tests === 'object' && window.QUnit && typeof window.QUnit.start === 'function') {
                for (const testKey in window.tests) {
                    if (Object.prototype.hasOwnProperty.call(window.tests, testKey)) {
                        try {
                            const currentTestFunction = window.tests[testKey];
                            if (typeof currentTestFunction === 'function') {
                                currentTestFunction(); // Execute the test function directly
                            } else if (typeof currentTestFunction === 'string' && typeof window[currentTestFunction] === 'function') {
                                // Fallback for string-based function names (similar to original eval)
                                window[currentTestFunction]();
                            } else {
                                console.warn(`Test function for key "${testKey}" is not callable.`);
                            }
                        } catch (error) {
                            console.error(`Error executing test "${testKey}":`, error);
                        }
                    }
                }
                loadingSpinner.hide();
                window.QUnit.start(); // Trigger QUnit to begin reporting results
                console.info('All registered tests initiated.');
            } else {
                console.error('Cannot initiate tests: "tests" object or "QUnit.start" function not found or invalid.');
                loadingSpinner.hide(); // Hide spinner even on error
            }
        }
    };

    // Document ready block for initial setup and event binding
    $(document).ready(function() {
        console.group('Diagnostic Dashboard Initialization');

        TestDashboardManager.initializeInterface();

        const resultsArea = $('#test-output-area');
        const loadingIcon = $('#loading-indicator');
        const shortcutPanel = $('#diagnostic-shortcuts');
        const mainOverlay = $('#diagnostic-main-overlay');

        // Set initial UI states
        resultsArea.hide();
        loadingIcon.hide();
        // Animate results to 0 height to ensure proper initial state
        resultsArea.animate({
            height: TestDashboardManager._config.initialResultsHeight
        }, 1);
        shortcutPanel.hide(); // Menu should be hidden initially

        // Attach keyboard event listener
        // Using addEventListener for better practice, checking for keydown vs keypress
        // Keydown is generally preferred for system-wide shortcuts
        document.addEventListener('keydown', TestDashboardManager.handleKeyboardInput);
        console.debug('Keyboard event listener attached.');

        // Event handler for test suite selection
        $('#test-suite-selector').on('change', function() {
            console.log('Test suite selection changed.');
            // Assuming window._testSuiteList_ is available globally, similar to original $list
            const allTestFiles = window._testSuiteList_ || [];
            const selectedValue = $(this).val();

            // Clear previous test definitions
            window.tests = {};

            // Unload all previously loaded test scripts
            allTestFiles.forEach(function(testFile) {
                TestDashboardManager.removeDynamicScript(testFile);
            });

            // Load new test scripts based on selection
            if (selectedValue && selectedValue !== 'all') {
                TestDashboardManager.injectScriptTag(selectedValue);
            } else {
                allTestFiles.forEach(function(testFile) {
                    TestDashboardManager.injectScriptTag(testFile);
                });
            }

            // Prepare UI and schedule test execution
            TestDashboardManager.prepareTestDisplay();
            // Introduce a slightly longer delay to ensure scripts are parsed
            setTimeout(TestDashboardManager.initiateTestExecution, 2500);
        });
        console.debug('Test suite selector change listener attached.');

        // Event handler for "Run All Tests" button click
        $('#run-all-tests-btn').on('click', function(evt) {
            evt.preventDefault(); // Prevent default link behavior
            // Select the 'all' option and trigger change event
            const selectorElement = $('#test-suite-selector');
            selectorElement.find('option[value="all"]').prop('selected', true);
            selectorElement.trigger('change');
            console.log('"Run All Tests" button clicked, triggering selector change.');
        });
        console.debug('"Run All Tests" button click listener attached.');

        // Initial check for auto-hide feature (e.g., from a global config)
        // Assuming window._autoHideDashboard_ is available globally, similar to original $autohide
        if (window._autoHideDashboard_ === 'true') {
            mainOverlay.hide();
            TestDashboardManager._config.overlayVisible = false;
            console.log('Dashboard automatically hidden on load.');
        } else {
            mainOverlay.show(); // Ensure visible if not autohiding
            TestDashboardManager._config.overlayVisible = true;
            console.log('Dashboard visible by default.');
        }
        console.groupEnd();
    });

})();