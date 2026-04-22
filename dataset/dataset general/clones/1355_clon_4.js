'use strict';

// Constants for configuration, replacing 'mySite'
const DATA_GATEWAY_URL_BASE = 'http://dev-headless-drupal-8.gotpantheon.com/node/';
const API_ACCEPT_HEADER = 'application/hal+json';

// --- Application State Management (replaces $scope for data model) ---
// This object holds the current data that needs to be displayed and
// provides a simple observer pattern to notify UI components of changes.
const coreApplicationData = {
    activeContent: {
        'descriptionField': [{'value': 'This information is embedded within the client-side script, not retrieved from a remote server.'}],
        'mainHeadline': [{'value': 'Decoupled CMS + Frontend Framework'}],
        'contentBody': [{'value': '<p>This demonstration illustrates the integration of a dynamic front-end (a JavaScript framework) with a Drupal-powered back-end to deliver a rich user experience. Interact with the number input below to load different content items.</p>'}]
    },
    // List of functions to call when activeContent changes
    stateChangeSubscribers: [],
    // Method to register a callback for state changes
    registerForUpdates(callback) {
        this.stateChangeSubscribers.push(callback);
    },
    // Method to notify all registered callbacks
    broadcastUpdate() {
        this.stateChangeSubscribers.forEach(callback => callback(this.activeContent));
    },
    // Method to update the content and trigger a broadcast
    updateActiveContent(newContent) {
        this.activeContent = newContent;
        this.broadcastUpdate();
    }
};

// --- DOM Manipulation Utilities (replaces general jQuery usage) ---
// Provides functions for interacting with the document's structure and content.
const documentInterface = {
    obtainElement(cssSelector) {
        return document.querySelector(cssSelector);
    },
    updateElementText(cssSelector, newText) {
        const targetElement = this.obtainElement(cssSelector);
        if (targetElement) {
            targetElement.textContent = newText;
        }
    },
    updateElementHTML(cssSelector, newHTML) {
        const targetElement = this.obtainElement(cssSelector);
        if (targetElement) {
            targetElement.innerHTML = newHTML;
        }
    },
    makeVisible(cssSelector) {
        const targetElement = this.obtainElement(cssSelector);
        if (targetElement) {
            targetElement.style.display = 'block'; // Assuming block display is appropriate
        }
    },
    conceal(cssSelector) {
        const targetElement = this.obtainElement(cssSelector);
        if (targetElement) {
            targetElement.style.display = 'none';
        }
    },
    // Renders the current content from coreApplicationData to specific UI elements
    renderContentToUI(contentItem) {
        this.updateElementHTML('.content-disclaimer', contentItem.descriptionField[0].value);
        this.updateElementHTML('.content-title', contentItem.mainHeadline[0].value);
        this.updateElementHTML('.content-body', contentItem.contentBody[0].value);
    }
};

// Subscribe the UI renderer to state changes
coreApplicationData.registerForUpdates(documentInterface.renderContentToUI.bind(documentInterface));

// --- Remote Data Acquisition (replaces Angular $resource) ---
// Handles fetching data from the API endpoint using the modern Fetch API.
const remoteDataGateway = {
    async retrieveContentPiece(contentKey) {
        try {
            const response = await fetch(`${DATA_GATEWAY_URL_BASE}${contentKey}`, {
                headers: {
                    'Accept': API_ACCEPT_HEADER
                }
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const rawData = await response.json();
            // Map incoming API fields to our internal data model fields
            return {
                descriptionField: rawData.disclaimer || [{value: 'No disclaimer provided.'}],
                mainHeadline: rawData.title || [{value: 'Untitled Entry'}],
                contentBody: rawData.body || [{value: '<p>No content body available.</p>'}]
            };
        } catch (error) {
            console.error('Failed to fetch remote content:', error);
            // Provide a fallback structure in case of network or parsing errors
            return {
                descriptionField: [{value: 'Error occurred while loading.'}],
                mainHeadline: [{value: `Load Error: Item ${contentKey}`}],
                contentBody: [{value: `<p>Failed to retrieve content. Details: ${error.message}</p>`}]
            };
        }
    }
};

// --- Core Application Workflow (replaces NodeLoader controller logic) ---
// Contains the main business logic for content loading and UI flow.
const applicationFlowManager = {
    // Replaces the 'loadNode' helper function
    async fetchAndPresentContent(identifier, completionHandler) {
        const retrievedItem = await remoteDataGateway.retrieveContentPiece(identifier);
        coreApplicationData.updateActiveContent(retrievedItem); // This triggers UI update via subscriber
        if (typeof completionHandler === 'function') {
            completionHandler(identifier);
        }
    },

    // Replaces '$scope.start'
    initiateApplicationExperience() {
        documentInterface.updateElementText('.startup-indicator', 'Loading initial content...');
        this.fetchAndPresentContent(1, () => {
            documentInterface.conceal('.startup-indicator');
            documentInterface.makeVisible('.dynamic-content-area');

            // --- Slider Plugin Integration (assumes jQuery and slider plugin are present) ---
            // The original uses jQuery for this specific plugin, so this part remains
            // dependent on jQuery, but integrated into the new structure.
            jQuery('.content-selector-widget').slider(
                {'tooltip': 'show',
                 'min': 1,
                 'max': 5,
                 'value': 1}
            ).on('slideStop', (eventData) => {
                const selectedValue = eventData['value'];
                // Ensure the value is a valid positive integer before processing
                if (Number.isInteger(selectedValue) && selectedValue > 0) {
                    this.fetchAndPresentContent(selectedValue);
                }
            });
        });
    },

    // Replaces '$scope.jump'
    directContentSelection(identifier) {
        this.fetchAndPresentContent(identifier);
    }
};

// --- Application Bootstrap (replaces Angular module declaration and bootstrap) ---
// The main entry point for the application, executed once the DOM is ready.
function commenceApplicationOperations() {
    // Initial rendering of the default content
    documentInterface.renderContentToUI(coreApplicationData.activeContent);

    // Attach event listener to the "start" button
    const activateButton = documentInterface.obtainElement('.start-interaction-button');
    if (activateButton) {
        activateButton.addEventListener('click', () => {
            applicationFlowManager.initiateApplicationExperience();
        });
    }

    // Expose the direct content selection function globally for potential external calls
    // (e.g., from other scripts or browser console, mimicking $scope.jump being public)
    window.contentNavigationHook = applicationFlowManager.directContentSelection.bind(applicationFlowManager);
}

// Start the application once the entire DOM is loaded
document.addEventListener('DOMContentLoaded', commenceApplicationOperations);