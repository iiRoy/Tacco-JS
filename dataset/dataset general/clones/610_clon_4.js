const jsonDisplayComponent = (function() {
    function createStructureEntry(entryKey, entryValue, entryType, nestingLevel) {
        const entryWrapper = document.createElement('div');
        entryWrapper.style.marginLeft = `${nestingLevel * 18}px`; // Indentation

        const keyLabel = document.createElement('span');
        keyLabel.style.fontWeight = 'bold';
        keyLabel.textContent = entryKey ? `${entryKey}: ` : '';

        entryWrapper.appendChild(keyLabel);

        if (entryType === 'object' || entryType === 'array') {
            const toggleElement = document.createElement('span');
            toggleElement.textContent = entryType === 'object' ? `{...}` : `[...]`;
            toggleElement.style.cursor = 'pointer';
            toggleElement.style.color = '#007bff'; // Blue for interactivity
            toggleElement.onclick = function() {
                const childContainer = entryWrapper.querySelector('.structure-child-container');
                if (childContainer) {
                    const isHidden = childContainer.style.display === 'none';
                    childContainer.style.display = isHidden ? 'block' : 'none';
                    toggleElement.textContent = isHidden ? (entryType === 'object' ? `{...}` : `[...]`) : (entryType === 'object' ? `{}` : `[]`);
                }
            };
            entryWrapper.appendChild(toggleElement);

            const childContainer = document.createElement('div');
            childContainer.className = 'structure-child-container';
            childContainer.style.display = 'block'; // Initially expanded
            
            // To mimic the original's likely behavior of only showing {...} for objects
            // and then expanding, we can set this to 'none' and update the toggle text
            // However, for divergent syntax, let's start expanded and make it collapsible.
            // A more direct clone of JSONView would start collapsed.
            // Let's make it start collapsed.
            childContainer.style.display = 'none';
            toggleElement.textContent = entryType === 'object' ? `{...}` : `[...]`;

            for (const subKey in entryValue) {
                childContainer.appendChild(renderValueNode(subKey, entryValue[subKey], nestingLevel + 1));
            }
            entryWrapper.appendChild(childContainer);
        } else {
            const valueSpan = document.createElement('span');
            valueSpan.textContent = JSON.stringify(entryValue);
            valueSpan.style.color = entryType === 'string' ? '#28a745' : (entryType === 'number' ? '#dc3545' : '#6f42c1'); // Green, Red, Purple for different types
            entryWrapper.appendChild(valueSpan);
        }
        return entryWrapper;
    }

    function renderValueNode(nodeKey, nodeValue, currentLevel) {
        const valueDataType = typeof nodeValue;
        if (nodeValue === null) return createStructureEntry(nodeKey, 'null', 'null', currentLevel);
        if (Array.isArray(nodeValue)) return createStructureEntry(nodeKey, nodeValue, 'array', currentLevel);
        if (valueDataType === 'object') return createStructureEntry(nodeKey, nodeValue, 'object', currentLevel);
        return createStructureEntry(nodeKey, nodeValue, valueDataType, currentLevel);
    }

    return {
        displayStructuredContent: function(sourceData, targetElement) {
            targetElement.innerHTML = '';
            if (sourceData === undefined || sourceData === null) {
                targetElement.innerHTML = '<p>No structured data provided for display.</p>';
                return;
            }
            targetElement.appendChild(renderValueNode(null, sourceData, 0));
        }
    };
})();

class ApiInteractionController {
    constructor(configuration) {
        this.serviceBaseAddress = configuration.serviceBaseAddress;
        this.pathExtension = configuration.pathExtension;
        this.preferredResponseFormat = configuration.preferredResponseFormat;
        this.defaultRequestHeaders = configuration.defaultRequestHeaders;

        this.progressIndicator = document.getElementById('loading');
        this.navigationMenu = document.getElementById('sidebar');
        this.outputArea = document.getElementById('result');
        this.urlEntryField = document.getElementById('apiurl');
        this.methodSelectionField = document.getElementById('requestmethod');
        this.submissionActionForm = document.querySelector('form');

        this.initializeEventBindings();
        this.processInitialPageState();
    }

    showProgress() {
        if (this.progressIndicator) {
            this.progressIndicator.style.display = 'block';
        }
    }

    hideProgress() {
        if (this.progressIndicator) {
            this.progressIndicator.style.display = 'none';
        }
    }

    markActiveLink(targetAnchor) {
        const currentlyActive = this.navigationMenu.querySelectorAll('a.active');
        currentlyActive.forEach(link => link.classList.remove('active'));
        if (targetAnchor) {
            targetAnchor.classList.add('active');
        }
    }

    async performApiCall(requestResource, httpMethod, payloadData = {}) {
        this.showProgress();
        this.outputArea.innerHTML = ''; // Clear prior results

        const completeEndpoint = this.serviceBaseAddress + requestResource + this.pathExtension;
        const fetchOptions = {
            method: httpMethod,
            headers: { ...this.defaultRequestHeaders }
        };

        if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && Object.keys(payloadData).length > 0) {
            fetchOptions.body = JSON.stringify(payloadData);
            fetchOptions.headers['Content-Type'] = 'application/json';
        }

        try {
            const serverResponse = await fetch(completeEndpoint, fetchOptions);

            if (serverResponse.ok) {
                if (serverResponse.status === 204) {
                    jsonDisplayComponent.displayStructuredContent({}, this.outputArea);
                    this.outputArea.innerHTML += '<p>Server responded with no content. (HTTP Status: ' + serverResponse.status + ' – ' + serverResponse.statusText + ')</p>';
                } else {
                    const responseBody = await serverResponse.json();
                    jsonDisplayComponent.displayStructuredContent(responseBody, this.outputArea);
                }
            } else {
                const errorPayload = await serverResponse.text();
                let structuredError;
                try {
                    structuredError = JSON.parse(errorPayload);
                } catch (parsingError) {
                    structuredError = { message: errorPayload, statusCode: serverResponse.status, statusText: serverResponse.statusText };
                }
                jsonDisplayComponent.displayStructuredContent(structuredError, this.outputArea);
                this.outputArea.innerHTML += `<p style="color: #dc3545;">Request failed: ${serverResponse.status} ${serverResponse.statusText}</p>`;
            }
        } catch (connectivityError) {
            jsonDisplayComponent.displayStructuredContent({ issue: connectivityError.message, category: 'Network Failure' }, this.outputArea);
            this.outputArea.innerHTML += `<p style="color: #dc3545;">A network or connectivity issue occurred: ${connectivityError.message}</p>`;
        } finally {
            this.hideProgress();
        }
    }

    initializeEventBindings() {
        this.navigationMenu.addEventListener('click', this.handleNavigationLinkActivation.bind(this));
        this.submissionActionForm.addEventListener('submit', this.handleFormSubmissionAttempt.bind(this));
        window.addEventListener('popstate', this.handleBrowserHistoryChange.bind(this));
    }

    handleNavigationLinkActivation(browserEvent, preventHistoryUpdate = false) {
        const clickedAnchor = browserEvent.target.closest('a');
        if (!clickedAnchor) return;

        browserEvent.preventDefault();

        if (this.progressIndicator.style.display === 'none' || !this.progressIndicator) {
            this.markActiveLink(clickedAnchor);

            const resourcePath = clickedAnchor.getAttribute('href');
            const requestVerb = (clickedAnchor.dataset.requestmethod || 'get').toLowerCase();
            const dataToInclude = JSON.parse(clickedAnchor.dataset.extradata || '{}');

            this.urlEntryField.value = this.serviceBaseAddress + resourcePath;
            this.methodSelectionField.value = requestVerb.toUpperCase();

            if (!preventHistoryUpdate) {
                history.pushState({ pathId: resourcePath, verbType: requestVerb }, `Viewing ${resourcePath}`, `#${requestVerb}|${resourcePath}`);
            }
            this.performApiCall(resourcePath, requestVerb, dataToInclude);
        }
    }

    handleFormSubmissionAttempt(browserEvent, preventHistoryUpdate = false) {
        browserEvent.preventDefault();

        const currentUrlInput = this.urlEntryField.value;
        if (currentUrlInput.startsWith(this.serviceBaseAddress)) {
            const resourcePath = currentUrlInput.replace(this.serviceBaseAddress, '');
            const requestVerb = this.methodSelectionField.value.toLowerCase();

            const matchingLink = this.navigationMenu.querySelector(`a[href="${resourcePath}"][data-requestmethod="${requestVerb}"]`);
            this.markActiveLink(matchingLink);

            if (!preventHistoryUpdate) {
                history.pushState({ pathId: resourcePath, verbType: requestVerb }, `Form submitted for ${resourcePath}`, `#${requestVerb}|${resourcePath}`);
            }
            // Form submission in original doesn't pass extraData from form fields, so pass empty object.
            this.performApiCall(resourcePath, requestVerb, {});
        } else {
            alert('Security restriction: You are only permitted to make requests to ' + this.serviceBaseAddress);
        }
    }

    handleBrowserHistoryChange(browserEvent) {
        browserEvent.preventDefault();
        this.markActiveLink(null); // Clear all active states

        const historyStateData = browserEvent.state;
        if (historyStateData && historyStateData.pathId) {
            this.urlEntryField.value = this.serviceBaseAddress + historyStateData.pathId;
            this.methodSelectionField.value = historyStateData.verbType.toUpperCase();
            this.handleFormSubmissionAttempt({ preventDefault: () => {} }, true); // Simulate form submit, prevent new history entry
        }
        // If no state, it's a direct navigation or initial load without a specific history entry.
        // The initial page state processing handles this.
    }

    processInitialPageState() {
        const currentWindowHash = window.location.hash;
        if (currentWindowHash && currentWindowHash.includes('|')) {
            const hashSegments = currentWindowHash.substring(1).split('|');
            if (hashSegments.length === 2) {
                const methodFromHash = hashSegments[0].toLowerCase();
                const pathFromHash = hashSegments[1];

                this.urlEntryField.value = this.serviceBaseAddress + pathFromHash;
                this.methodSelectionField.value = methodFromHash.toUpperCase();
                this.handleFormSubmissionAttempt({ preventDefault: () => {} }, true); // Simulate form submit
            }
        } else {
            const initialLink = this.navigationMenu.querySelector('a:first-of-type');
            if (initialLink) {
                // Simulate click on the first link, preventing history push
                this.handleNavigationLinkActivation({
                    target: initialLink,
                    preventDefault: () => {}
                }, true);
            }
        }
    }
}

// Global configuration for the API service.
// These values would typically be provided by the environment or a separate config file.
const serviceConfiguration = {
    serviceBaseAddress: 'http://example.com/api/', // Placeholder: Replace with actual base URL
    pathExtension: '', // Placeholder: Replace with actual API URL suffix if any (e.g., '/v1')
    preferredResponseFormat: 'json', // Corresponds to original 'apiDataType'
    defaultRequestHeaders: {} // Placeholder: Replace with actual extra headers if any (e.g., { 'Authorization': 'Bearer token' })
};

// Initialize the API interaction controller once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    new ApiInteractionController(serviceConfiguration);
});