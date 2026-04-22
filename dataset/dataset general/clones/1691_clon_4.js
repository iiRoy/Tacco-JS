(function() {
    class TestAutomationModule {
        constructor() {
            this.interfaceElements = {}; // To store references to frequently accessed DOM nodes

            // Map keyboard event key codes to corresponding action methods
            this.keyboardActionRegistry = new Map([
                [83, this.revealInterfaceOverlay], // S
                [115, this.revealInterfaceOverlay], // s
                [72, this.hideInterfaceOverlay], // H
                [104, this.hideInterfaceOverlay], // h
                [191, this.toggleInterfaceMenu], // ?
                [47, this.toggleInterfaceMenu], // /
                [65, this.activateAllTestsLink], // A
                [97, this.activateAllTestsLink], // a
                [84, this.toggleTestResultDisplay], // T
                [116, this.toggleTestResultDisplay] // t
            ]);
        }

        // Constructs the entire QUnit interface using DOM manipulation
        constructDisplay() {
            const documentBody = document.body;

            // Main wrapper for the entire test interface
            const primaryContainer = document.createElement('div');
            primaryContainer.id = 'test-system-root'; // Unique root ID

            // --- Menu Component ---
            const menuPanel = document.createElement('div');
            menuPanel.id = 'qunit-menu';
            const menuItemsList = document.createElement('ul');
            menuItemsList.className = 'qunit-menu';

            const createMenuEntry = (label, hotkey = '') => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<b>${hotkey ? hotkey + ' - ' : ''}</b>${label}`;
                return listItem;
            };

            menuItemsList.appendChild(createMenuEntry('Shortcuts (shift + ):', ''));
            menuItemsList.appendChild(createMenuEntry('shows/hides the menu', '?'));
            menuItemsList.appendChild(createMenuEntry('shows qunit overlay', 's'));
            menuItemsList.appendChild(createMenuEntry('hides qunit overlay', 'h'));
            menuItemsList.appendChild(createMenuEntry('runs all tests', 'a'));
            menuItemsList.appendChild(createMenuEntry('shows/hides tests', 't'));
            menuPanel.appendChild(menuItemsList);
            this.interfaceElements.menuComponent = menuPanel;

            // --- Results Component ---
            const resultsPanel = document.createElement('div');
            resultsPanel.id = 'qunit-results';
            const headingOne = document.createElement('h1');
            headingOne.id = 'qunit-header';
            headingOne.textContent = 'Results';
            const headingTwoBanner = document.createElement('h2');
            headingTwoBanner.id = 'qunit-banner';
            const headingTwoUserAgent = document.createElement('h2');
            headingTwoUserAgent.id = 'qunit-userAgent';
            const lineBreak = document.createElement('br');
            const progressIndicator = document.createElement('img');
            progressIndicator.id = 'qunit-loading';
            progressIndicator.src = '/images/i_loading_bar.gif';
            progressIndicator.alt = 'loading';
            const testOutputList = document.createElement('ol');
            testOutputList.id = 'qunit-tests';

            resultsPanel.append(headingOne, headingTwoBanner, headingTwoUserAgent, lineBreak, progressIndicator, testOutputList);
            this.interfaceElements.resultsComponent = resultsPanel;
            this.interfaceElements.loadingAnimation = progressIndicator;
            this.interfaceElements.bannerArea = headingTwoBanner;
            this.interfaceElements.testOutputList = testOutputList;


            // --- Overlay Component (main interactive panel) ---
            const overlayPanel = document.createElement('div');
            overlayPanel.id = 'qunit-overlay';

            const testConfigurationOptions = document.createElement('div');
            testConfigurationOptions.id = 'qunit-test-options';
            const optionsGroup = document.createElement('ul');
            optionsGroup.className = 'qunit';

            const firstOptionItem = document.createElement('li');
            firstOptionItem.className = 'first';
            const runAllLink = document.createElement('a');
            runAllLink.id = 'qunit-all-tests';
            runAllLink.href = '#';
            runAllLink.textContent = 'Run All Tests';
            firstOptionItem.appendChild(runAllLink);
            this.interfaceElements.allTestsTrigger = runAllLink;

            const lastOptionItem = document.createElement('li');
            lastOptionItem.className = 'last';
            // $collection is an external variable, assumed to be an HTML string
            lastOptionItem.innerHTML = `Or Choose A Test: ${$collection}`;
            this.interfaceElements.testSelectionContainer = lastOptionItem;

            optionsGroup.append(firstOptionItem, lastOptionItem);
            testConfigurationOptions.appendChild(optionsGroup);

            const navigationImage = document.createElement('img');
            navigationImage.src = '/images/bg_secondaryNav_right.gif';
            testConfigurationOptions.appendChild(navigationImage);

            overlayPanel.appendChild(testConfigurationOptions);
            overlayPanel.appendChild(this.interfaceElements.menuComponent);

            const logoDisplay = document.createElement('div');
            logoDisplay.id = 'qunit-logo';
            logoDisplay.innerHTML = `JavaScript testing powered by: <a href="http://docs.jquery.com/QUnit">
                <img src="/images/l_qunit.png" alt="qunit" border="0"></a>`;
            overlayPanel.appendChild(logoDisplay);

            primaryContainer.append(overlayPanel, this.interfaceElements.resultsComponent);

            const floatClearDiv = document.createElement('div');
            floatClearDiv.style.clear = 'both';
            primaryContainer.appendChild(floatClearDiv);

            documentBody.insertBefore(primaryContainer, documentBody.firstChild);
            this.interfaceElements.overlayPanel = overlayPanel;
            this.interfaceElements.mainRootContainer = primaryContainer;
        }

        // Generic function to set display style
        updateDisplayState(element, state) {
            element.style.display = state;
        }

        // Generic function to toggle display state
        toggleDisplayState(element) {
            if (element.style.display === 'none') {
                this.updateDisplayState(element, 'block');
            } else {
                this.updateDisplayState(element, 'none');
            }
        }

        // Animates element height using CSS transitions
        transitionElementHeight(element, desiredHeight, duration = 500) {
            element.style.transition = `height ${duration / 1000}s ease-in-out`;
            element.style.height = desiredHeight;

            // Remove transition property after completion to prevent interference
            const transitionEndHandler = () => {
                element.style.transition = '';
                element.removeEventListener('transitionend', transitionEndHandler);
            };
            element.addEventListener('transitionend', transitionEndHandler);
        }

        // --- Keyboard Event Handling Methods ---
        handleKeyboardEvent(eventData) {
            const currentlyFocused = document.activeElement;
            const focusedTagName = currentlyFocused ? currentlyFocused.tagName : '';

            if (focusedTagName === 'INPUT' || focusedTagName === 'TEXTAREA') {
                return; // Ignore input in text fields
            }

            if (eventData.shiftKey) {
                const actionMethod = this.keyboardActionRegistry.get(eventData.keyCode || eventData.charCode);
                if (actionMethod) {
                    eventData.preventDefault();
                    actionMethod.call(this); // Execute the mapped method
                }
            }
        }

        revealInterfaceOverlay() {
            this.updateDisplayState(this.interfaceElements.overlayPanel, 'block');
        }

        hideInterfaceOverlay() {
            if (parseInt(this.interfaceElements.resultsComponent.style.height, 10) > 0) {
                this.transitionElementHeight(this.interfaceElements.resultsComponent, '0px');
            }
            this.updateDisplayState(this.interfaceElements.overlayPanel, 'none');
        }

        toggleInterfaceMenu() {
            this.updateDisplayState(this.interfaceElements.overlayPanel, 'block');
            this.toggleDisplayState(this.interfaceElements.menuComponent);
        }

        activateAllTestsLink() {
            this.interfaceElements.allTestsTrigger.dispatchEvent(new Event('click'));
        }

        toggleTestResultDisplay() {
            const currentResultHeight = parseInt(this.interfaceElements.resultsComponent.style.height, 10);
            if (currentResultHeight > 0) {
                this.transitionElementHeight(this.interfaceElements.resultsComponent, '0px');
            } else {
                this.updateDisplayState(this.interfaceElements.overlayPanel, 'block');
                this.transitionElementHeight(this.interfaceElements.resultsComponent, '400px');
            }
        }
        // --- End Keyboard Event Handling Methods ---

        // Dynamically adds a JavaScript file to the document head
        attachScriptFile(scriptName) {
            const newScript = document.createElement('script');
            newScript.setAttribute("type", "text/javascript");
            newScript.setAttribute("src", `/javascripts/tests/${scriptName}?${Math.floor(Math.random() * 11)}`);
            document.head.appendChild(newScript);
        }

        // Removes a dynamically loaded JavaScript file
        detachScriptFile(scriptName) {
            document.head.querySelectorAll('script').forEach(scriptNode => {
                if (scriptNode.src && scriptNode.src.includes(scriptName)) {
                    scriptNode.parentNode.removeChild(scriptNode);
                }
            });
        }

        // Sets up the UI for displaying test results
        prepareResultsDisplay() {
            this.updateDisplayState(this.interfaceElements.overlayPanel, 'block');
            // Clear previous test results
            this.interfaceElements.testOutputList.querySelectorAll('li').forEach(item => item.remove());
            const oldTestResultElement = document.getElementById('qunit-testresult');
            if (oldTestResultElement) {
                oldTestResultElement.remove();
            }

            this.interfaceElements.bannerArea.className = ''; // Clear classes
            this.updateDisplayState(this.interfaceElements.resultsComponent, 'block');
            this.transitionElementHeight(this.interfaceElements.resultsComponent, '400px');
            this.updateDisplayState(this.interfaceElements.loadingAnimation, 'block');
        }

        // Initiates the QUnit test execution flow
        commenceTestProcessing() {
            // `init()` and `start()` are QUnit global functions.
            if (typeof init === 'function') {
                init();
            }

            // `tests` is an external global variable (array of strings) populated by loaded scripts.
            if (typeof tests !== 'undefined' && Array.isArray(tests)) {
                tests.forEach(testIdentifier => {
                    const testFunction = window[testIdentifier];
                    if (typeof testFunction === 'function') {
                        testFunction(testFunction); // Replicates the original's `test(test)` behavior
                    } else {
                        console.warn(`Test function "${testIdentifier}" not found in global scope.`);
                    }
                });
            }
            this.updateDisplayState(this.interfaceElements.loadingAnimation, 'none');
            if (typeof start === 'function') {
                start();
            }
        }

        // Main initialization entry point for the module
        startup() {
            this.constructDisplay();

            this.updateDisplayState(this.interfaceElements.resultsComponent, 'none');
            this.updateDisplayState(this.interfaceElements.loadingAnimation, 'none');
            this.transitionElementHeight(this.interfaceElements.resultsComponent, '0px', 1); // Instant hide
            this.toggleDisplayState(this.interfaceElements.menuComponent); // Initial toggle for menu

            // Determine event type for keyboard listeners (Firefox specific handling)
            const keyEventName = navigator.userAgent.includes('Firefox') ? 'keypress' : 'keydown';
            document.addEventListener(keyEventName, this.handleKeyboardEvent.bind(this));

            const testSelectionDropdown = document.getElementById('qunit-test-select');
            if (testSelectionDropdown) {
                testSelectionDropdown.addEventListener('change', () => {
                    window.tests = {}; // Clear global tests object
                    // $list is an external variable (array of filenames)
                    if (Array.isArray($list)) {
                        $list.forEach(file => this.detachScriptFile(file));
                    }

                    if (testSelectionDropdown.value !== "all") {
                        this.attachScriptFile(testSelectionDropdown.value);
                    } else {
                        if (Array.isArray($list)) {
                            $list.forEach(file => this.attachScriptFile(file));
                        }
                    }
                    this.prepareResultsDisplay();
                    setTimeout(() => this.commenceTestProcessing(), 2000);
                });
            }

            this.interfaceElements.allTestsTrigger.addEventListener('click', (ev) => {
                ev.preventDefault();
                if (testSelectionDropdown) {
                    Array.from(testSelectionDropdown.options).forEach(opt => {
                        if (opt.textContent.toLowerCase().includes('all')) {
                            opt.selected = true;
                        }
                    });
                    testSelectionDropdown.dispatchEvent(new Event('change')); // Trigger change event
                }
            });

            // $autohide is an external variable
            if (window.$autohide === "true") {
                this.toggleDisplayState(this.interfaceElements.overlayPanel);
            }
        }
    }

    // Initialize the system once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        const testingSystem = new TestAutomationModule();
        testingSystem.startup();
    });
})();