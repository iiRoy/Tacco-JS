const testReportStore = [];
let currentTestCategory = '';

const assertionUtility = {
    verifyTruth: (condition, message) => {
        if (!condition) {
            testReportStore.push({ category: currentTestCategory, description: message, outcome: false });
            throw new Error(`Verification failed: ${message}`);
        } else {
            testReportStore.push({ category: currentTestCategory, description: message, outcome: true });
        }
    },
    verifyEquality: (actual, expected, message) => {
        if (actual !== expected) {
            testReportStore.push({ category: currentTestCategory, description: `${message} (Expected: ${expected}, Actual: ${actual})`, outcome: false });
            throw new Error(`Verification failed: ${message}`);
        } else {
            testReportStore.push({ category: currentTestCategory, description: message, outcome: true });
        }
    },
    verifyFalsehood: (condition, message) => assertionUtility.verifyTruth(!condition, message),
    verifyCount: (actual, expected, message) => assertionUtility.verifyEquality(actual, expected, message)
};

const acquireFixtureElement = () => {
    let fixtureDiv = document.getElementById('test-fixture');
    if (!fixtureDiv) {
        fixtureDiv = document.createElement('div');
        fixtureDiv.id = 'test-fixture';
        document.body.appendChild(fixtureDiv);
    }
    fixtureDiv.innerHTML = ''; // Reset for each test
    return fixtureDiv;
};

const presentTestSummary = () => {
    console.log('\n--- Comprehensive Test Summary ---');
    let totalAssertions = testReportStore.length;
    let successfulAssertions = testReportStore.filter(r => r.outcome).length;
    let failedAssertions = totalAssertions - successfulAssertions;

    console.log(`\nTotal Verifications: ${totalAssertions}, Successful: ${successfulAssertions}, Failed: ${failedAssertions}`);

    testReportStore.forEach(r => {
        console.log(`${r.outcome ? '✅' : '❌'} [${r.category}] ${r.description}`);
    });
    console.log('--------------------------------\n');
};

const defineTestCategory = (categoryName, scenarios) => {
    currentTestCategory = categoryName;
    console.log(`\n--- Initiating Test Category: ${categoryName} ---`);
    for (const scenarioName in scenarios) {
        console.log(`  Executing scenario: ${scenarioName}`);
        try {
            scenarios[scenarioName]();
            console.log(`  ✅ Scenario completed: ${scenarioName}`);
        } catch (e) {
            console.error(`  ❌ Scenario failed: ${scenarioName} - ${e.message}`);
        }
    }
};

const globalMenuManager = {
    activeDisplayElements: new Set(),
    globalInteractionListenersAttached: false,
    attachedElementHandlers: new Map() // Maps trigger element to its listeners
};

const dispatchLifecycleEvent = (element, eventName, details = {}) => {
    const customEvt = new CustomEvent(eventName, { bubbles: true, detail: details });
    element.dispatchEvent(customEvt);
};

const concealAllDisplayElements = (exceptionElement = null) => {
    globalMenuManager.activeDisplayElements.forEach(displayEl => {
        if (displayEl !== exceptionElement) {
            dispatchLifecycleEvent(displayEl, 'pane:commencing_hide');
            displayEl.classList.remove('visible-pane');
            globalMenuManager.activeDisplayElements.delete(displayEl);
            dispatchLifecycleEvent(displayEl, 'pane:completed_hide');
        }
    });
};

const handleOverallPageInteraction = (e) => {
    let shouldConceal = true;
    if (e.type === 'click') {
        // If click is inside any active display element, don't conceal all.
        // This is crucial for allowing item clicks to close only their own pane.
        for (const displayEl of globalMenuManager.activeDisplayElements) {
            if (displayEl.contains(e.target)) {
                shouldConceal = false;
                break;
            }
        }
    } else if (e.type === 'keydown' && e.key === 'Escape') {
        shouldConceal = true; // Escape always closes all
    }

    if (shouldConceal) {
        concealAllDisplayElements();
    }
};

const initiateNavigationalPane = (triggerNode, paneNode, options = {}) => {
    const activationProcessor = (e) => {
        e.preventDefault(); // Stop default browser context menu
        e.stopPropagation(); // Prevent event from bubbling up to document immediately

        if (triggerNode.hasAttribute('data-state') && triggerNode.getAttribute('data-state') === 'inactive') {
            return;
        }
        if (triggerNode.classList.contains('inactive-control')) {
            return;
        }

        if (options.onInitiate) {
            options.onInitiate();
        }

        // Only hide other panes if this one is about to open and we want exclusive display.
        // The original tests imply multiple panes can be open. So, don't automatically close others here.
        // Global click handler will take care of closing all.

        dispatchLifecycleEvent(paneNode, 'pane:commencing_show');
        paneNode.classList.add('visible-pane');
        globalMenuManager.activeDisplayElements.add(paneNode);
        dispatchLifecycleEvent(paneNode, 'pane:completed_show');

        // Basic positioning
        paneNode.style.position = 'absolute';
        paneNode.style.left = `${e.clientX}px`;
        paneNode.style.top = `${e.clientY}px`;
    };

    const choiceProcessor = (e) => {
        if (e.target.tagName === 'A' && e.target.closest('.panel-options')) {
            e.stopPropagation(); // Prevent document click from closing immediately

            if (options.onSelection) {
                options.onSelection(e.target);
            }

            const clickedPane = e.target.closest('.visible-pane');
            if (clickedPane) {
                dispatchLifecycleEvent(clickedPane, 'pane:commencing_hide');
                clickedPane.classList.remove('visible-pane');
                globalMenuManager.activeDisplayElements.delete(clickedPane);
                dispatchLifecycleEvent(clickedPane, 'pane:completed_hide');
            }
        }
    };

    triggerNode.addEventListener('contextmenu', activationProcessor);
    paneNode.addEventListener('click', choiceProcessor);

    globalMenuManager.attachedElementHandlers.set(triggerNode, { activationProcessor, choiceProcessor, paneNode });

    if (!globalMenuManager.globalInteractionListenersAttached) {
        document.addEventListener('click', handleOverallPageInteraction);
        document.addEventListener('keydown', handleOverallPageInteraction);
        globalMenuManager.globalInteractionListenersAttached = true;
    }

    return triggerNode;
};

// Helper to create DOM elements from HTML string
const produceElementFromMarkup = (htmlString) => {
    const temporalDiv = document.createElement('div');
    temporalDiv.innerHTML = htmlString.trim();
    return temporalDiv.firstChild;
};

// Main test execution entry point
document.addEventListener('DOMContentLoaded', () => {

    const testFixture = acquireFixtureElement();

    defineTestCategory('interactive_pane_functionality', {

        'function_existence_check': () => {
            assertionUtility.verifyTruth(typeof initiateNavigationalPane === 'function', 'initiateNavigationalPane function is available');
        },

        'function_returns_original_element': () => {
            const containerDiv = document.createElement('div');
            const menuDiv = document.createElement('div');
            menuDiv.id = 'menu-alpha';
            containerDiv.appendChild(menuDiv);
            const returnedRef = initiateNavigationalPane(containerDiv, menuDiv);
            assertionUtility.verifyTruth(returnedRef === containerDiv, 'The same element reference is returned');
            // No need for explicit dispose for this simple test, fixture cleanup handles it.
        },

        'disabled_attribute_prevents_display': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel" data-state="inactive">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));

            assertionUtility.verifyFalsehood(navPanel.classList.contains('visible-pane'), 'visible-pane class not added due to inactive state attribute');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'disabled_class_prevents_display': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel" class="inactive-control">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));

            assertionUtility.verifyFalsehood(navPanel.classList.contains('visible-pane'), 'visible-pane class not added due to inactive-control class');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'right_click_activates_display': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));

            assertionUtility.verifyTruth(navPanel.classList.contains('visible-pane'), 'visible-pane class added to panel');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'page_click_hides_display': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyTruth(navPanel.classList.contains('visible-pane'), 'visible-pane class present after right click');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyFalsehood(navPanel.classList.contains('visible-pane'), 'visible-pane class removed after body click');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'page_click_hides_multiple_displays': () => {
            const markup = '<div>' +
                '<div data-action="interact" data-pane-id="#nav-panel-1">' +
                '  <div id="nav-panel-1" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '<div data-action="interact" data-pane-id="#nav-panel-2">' +
                '  <div id="nav-panel-2" class="panel-options"><ul><li><a href="#">Option Two</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controllers = wrapperElement.querySelectorAll('[data-action="interact"]');
            const firstController = controllers[0];
            const secondController = controllers[1];
            const panelOne = wrapperElement.querySelector('#nav-panel-1');
            const panelTwo = wrapperElement.querySelector('#nav-panel-2');

            initiateNavigationalPane(firstController, panelOne);
            initiateNavigationalPane(secondController, panelTwo);

            assertionUtility.verifyCount(controllers.length, 2, 'Two interactive controllers exist');

            // Open first panel
            firstController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyTruth(panelOne.classList.contains('visible-pane'), 'first panel is visible');
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 1, 'Only one panel is currently registered as active');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 0, 'All panels concealed after body click');

            // Open second panel
            secondController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyTruth(panelTwo.classList.contains('visible-pane'), 'second panel is visible');
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 1, 'Only one panel is currently registered as active');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 0, 'All panels concealed after body click');

            // Open both panels
            firstController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            secondController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 2, 'Both panels are active');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 0, 'Both panels concealed after body click');

            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'item_click_hides_only_its_display': () => {
            const markup = '<div>' +
                '<div data-action="interact" data-pane-id="#nav-panel-1">' +
                '  <div id="nav-panel-1" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '<div data-action="interact" data-pane-id="#nav-panel-2">' +
                '  <div id="nav-panel-2" class="panel-options"><ul><li><a href="#">Option Two</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controllers = wrapperElement.querySelectorAll('[data-action="interact"]');
            const firstController = controllers[0];
            const secondController = controllers[1];
            const panelOne = wrapperElement.querySelector('#nav-panel-1');
            const panelTwo = wrapperElement.querySelector('#nav-panel-2');

            initiateNavigationalPane(firstController, panelOne);
            initiateNavigationalPane(secondController, panelTwo);

            assertionUtility.verifyCount(controllers.length, 2, 'Two interactive controllers exist');

            // Open both panels
            firstController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            secondController.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 2, 'Both panels are active');

            // Click item in first panel
            const firstItem = panelOne.querySelector('a');
            firstItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 1, 'Only one panel remains active');
            assertionUtility.verifyFalsehood(panelOne.classList.contains('visible-pane'), 'First panel concealed');
            assertionUtility.verifyTruth(panelTwo.classList.contains('visible-pane'), 'Second panel still visible');

            // Click item in second panel
            const secondItem = panelTwo.querySelector('a');
            secondItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            assertionUtility.verifyCount(globalMenuManager.activeDisplayElements.size, 0, 'All panels concealed');
            assertionUtility.verifyFalsehood(panelTwo.classList.contains('visible-pane'), 'Second panel concealed');

            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'before_display_callback_invoked': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            let callbackInvocations = 0;
            const preDisplay = () => { callbackInvocations++; };

            initiateNavigationalPane(controller, navPanel, { 'onInitiate': preDisplay });

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));

            assertionUtility.verifyCount(callbackInvocations, 1, 'onInitiate callback was executed');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'on_item_selection_callback_invoked': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            let callbackInvocations = 0;
            const itemSelected = () => { callbackInvocations++; };

            initiateNavigationalPane(controller, navPanel, { 'onSelection': itemSelected });

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            navPanel.querySelector('a').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            assertionUtility.verifyCount(callbackInvocations, 1, 'onSelection callback was executed');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'show_hide_lifecycle_events_dispatched': async () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            let showInitiated = false;
            let hideInitiated = false;

            navPanel.addEventListener('pane:commencing_show', () => { showInitiated = true; });
            navPanel.addEventListener('pane:commencing_hide', () => { hideInitiated = true; });

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            await Promise.resolve(); // Allow event loop to process

            assertionUtility.verifyTruth(showInitiated, 'pane:commencing_show event dispatched');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve(); // Allow event loop to process

            assertionUtility.verifyTruth(hideInitiated, 'pane:commencing_hide event dispatched');

            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'shown_hidden_lifecycle_events_dispatched': async () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            let showCompleted = false;
            let hideCompleted = false;

            navPanel.addEventListener('pane:completed_show', () => { showCompleted = true; });
            navPanel.addEventListener('pane:completed_hide', () => { hideCompleted = true; });

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            await Promise.resolve(); // Allow event loop to process

            assertionUtility.verifyTruth(showCompleted, 'pane:completed_show event dispatched');

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve(); // Allow event loop to process

            assertionUtility.verifyTruth(hideCompleted, 'pane:completed_hide event dispatched');

            testFixture.innerHTML = '';
            concealAllDisplayElements();
        },

        'escape_key_hides_display': () => {
            const markup = '<div>' +
                '<div id="main-controller" data-action="interact" data-pane-id="#nav-panel">' +
                '  <div id="nav-panel" class="panel-options"><ul><li><a href="#">Option One</a></li></ul></div>' +
                '</div>' +
                '</div>';
            const wrapperElement = produceElementFromMarkup(markup);
            testFixture.appendChild(wrapperElement);

            const controller = wrapperElement.querySelector('[data-action="interact"]');
            const navPanel = wrapperElement.querySelector('#nav-panel');
            initiateNavigationalPane(controller, navPanel);

            controller.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
            assertionUtility.verifyTruth(navPanel.classList.contains('visible-pane'), 'visible-pane class present after right click');

            document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
            assertionUtility.verifyFalsehood(navPanel.classList.contains('visible-pane'), 'visible-pane class removed by Escape key press');
            testFixture.innerHTML = '';
            concealAllDisplayElements();
        }
    });

    presentTestSummary();
});