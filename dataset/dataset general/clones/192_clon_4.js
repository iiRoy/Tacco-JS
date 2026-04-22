// Global variables for configuration, equivalent to active_window and resolve_url
const initialActiveFormIdentifier = 'first_tab_panel'; // Placeholder for the active_window value
const remoteDataRetrievalEndpoint = '/data/fetch/'; // Placeholder for resolve_url

// Class to manage a custom modal window, replacing jQuery UI Dialog
class CustomOverlayPanel {
    constructor(panelId, settings) {
        this.elementReference = document.getElementById(panelId);
        if (!this.elementReference) {
            console.error(`Overlay panel with ID '${panelId}' not found.`);
            return;
        }
        this.elementReference.style.width = settings.horizontalDimension + 'px';
        this.elementReference.style.height = settings.verticalDimension + 'px';
        if (!settings.initialVisibility) { // Equivalent to autoOpen: false
            this.elementReference.style.display = 'none';
        }
        this.elementReference.setAttribute('aria-modal', 'true');
        this.elementReference.setAttribute('role', 'dialog');
    }

    reveal() {
        this.elementReference.style.display = 'block';
        this.elementReference.setAttribute('aria-hidden', 'false');
    }

    conceal() {
        this.elementReference.style.display = 'none';
        this.elementReference.setAttribute('aria-hidden', 'true');
    }
}

// Class to manage a custom tabbed interface, replacing jQuery UI Tabs
class TabbedContentManager {
    constructor(containerId, configuration) {
        this.parentContainer = document.getElementById(containerId);
        if (!this.parentContainer) {
            console.error(`Tab container with ID '${containerId}' not found.`);
            return;
        }
        this.tabHeaders = Array.from(this.parentContainer.querySelectorAll('[role="tablist"] > li'));
        this.contentPanels = Array.from(this.parentContainer.querySelectorAll('[role="tabpanel"]'));
        this.currentActivePanelId = configuration.startingTab;

        this.tabHeaders.forEach(header => {
            header.addEventListener('click', this.activatePanelFromClick.bind(this));
        });

        this.setInitialActivePanel(this.currentActivePanelId);
    }

    activatePanelFromClick(event) {
        const clickedHeader = event.currentTarget;
        const panelToActivateId = clickedHeader.getAttribute('aria-controls');
        this.setInitialActivePanel(panelToActivateId);
    }

    setInitialActivePanel(panelId) {
        this.tabHeaders.forEach(header => {
            const isHeaderForActivePanel = header.getAttribute('aria-controls') === panelId;
            header.setAttribute('aria-selected', String(isHeaderForActivePanel));
            header.setAttribute('tabindex', isHeaderForActivePanel ? '0' : '-1');
            if (isHeaderForActivePanel) {
                header.classList.add('selected-tab');
            } else {
                header.classList.remove('selected-tab');
            }
        });

        this.contentPanels.forEach(panel => {
            const isPanelActive = panel.id === panelId;
            panel.style.display = isPanelActive ? 'block' : 'none';
            panel.setAttribute('aria-hidden', String(!isPanelActive));
        });
        this.currentActivePanelId = panelId;
    }
}

// Class to manage custom hover-info displays, replacing jQuery UI Tooltip
class HoverInformationDisplay {
    constructor(containerId, targetSelector) {
        this.baseContainer = document.getElementById(containerId);
        if (!this.baseContainer) {
            console.error(`Container for hover info with ID '${containerId}' not found.`);
            return;
        }
        this.targetSelector = targetSelector;
        this.activeInfoBox = null;

        this.baseContainer.addEventListener('mouseover', this.displayInfo.bind(this));
        this.baseContainer.addEventListener('mouseout', this.hideInfo.bind(this));
    }

    displayInfo(event) {
        const interactiveElement = event.target.closest(this.targetSelector);
        if (interactiveElement && interactiveElement.hasAttribute('title')) {
            const contentText = interactiveElement.getAttribute('title');
            interactiveElement.dataset.originalTitle = contentText; // Store original title
            interactiveElement.removeAttribute('title'); // Hide native tooltip

            this.activeInfoBox = document.createElement('div');
            this.activeInfoBox.className = 'custom-hover-feedback';
            this.activeInfoBox.textContent = contentText;
            document.body.appendChild(this.activeInfoBox);

            // Position the info box relative to the hovered element
            const rectDimensions = interactiveElement.getBoundingClientRect();
            this.activeInfoBox.style.position = 'absolute';
            this.activeInfoBox.style.left = `${rectDimensions.left + window.scrollX}px`;
            this.activeInfoBox.style.top = `${rectDimensions.bottom + window.scrollY + 8}px`; // Offset slightly below
            this.activeInfoBox.style.zIndex = '10000'; // High z-index to ensure visibility
        }
    }

    hideInfo(event) {
        if (this.activeInfoBox) {
            const interactiveElement = event.target.closest(this.targetSelector);
            if (interactiveElement && interactiveElement.dataset.originalTitle) {
                interactiveElement.setAttribute('title', interactiveElement.dataset.originalTitle); // Restore original title
                delete interactiveElement.dataset.originalTitle;
            }
            this.activeInfoBox.remove();
            this.activeInfoBox = null;
        }
    }
}

// Utility for checking HTTP method safety (CSRF)
const isOperationSecure = (methodType) => {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(methodType));
};

// Utility for retrieving cookie values
const retrieveSecureCredential = (credentialName) => {
    const allCredentials = document.cookie.split(';').map(segment => segment.trim());
    const matchedCredential = allCredentials.find(segment => segment.startsWith(`${credentialName}=`));
    if (matchedCredential) {
        return decodeURIComponent(matchedCredential.substring(credentialName.length + 1));
    }
    return null;
};

// Custom fetch wrapper to include CSRF token, replacing $.ajaxSetup
const executeNetworkRequest = async (resourceURL, requestOptions = {}) => {
    const effectiveOptions = { ...requestOptions };
    effectiveOptions.headers = new Headers(requestOptions.headers || {});

    if (!isOperationSecure(effectiveOptions.method || 'GET')) {
        const securityToken = retrieveSecureCredential('csrftoken'); // Uses the same cookie name
        if (securityToken) {
            effectiveOptions.headers.set('X-CSRFToken', securityToken);
        }
    }

    return fetch(resourceURL, effectiveOptions);
};

// Function to toggle the visibility of search forms with animation
const adjustFormSectionVisibility = (animationDuration = 200) => {
    const controlSwitch = document.getElementById('toggle_button_control'); // Corresponds to #button
    const mainFormRegion = document.getElementById('main_form_area'); // Corresponds to #forms
    const additionalDomainFields = document.querySelectorAll('.domain_extra_elements'); // Corresponds to .domain_nonweb
    const additionalPdnFields = document.querySelectorAll('.pdns_extra_elements'); // Corresponds to .pdns_nonweb

    if (!controlSwitch || !mainFormRegion) {
        console.warn('Missing essential elements for form visibility toggle.');
        return;
    }

    const isCurrentlyExpanded = controlSwitch.classList.contains('icon-collapse-state'); // Corresponds to ui-icon-minus

    if (!isCurrentlyExpanded) {
        controlSwitch.classList.remove('icon-expand-state'); // ui-icon-plus
        controlSwitch.classList.add('icon-collapse-state'); // ui-icon-minus
        mainFormRegion.style.transition = `max-height ${animationDuration}ms ease-in-out, opacity ${animationDuration}ms ease-in-out`;
        mainFormRegion.style.maxHeight = `${mainFormRegion.scrollHeight}px`; // Animate to full height
        mainFormRegion.style.opacity = '1';
        mainFormRegion.style.overflow = 'visible'; // Allow content to be visible during/after transition
        mainFormRegion.setAttribute('aria-hidden', 'false');

        additionalDomainFields.forEach(el => el.style.display = 'block');
        additionalPdnFields.forEach(el => el.style.display = 'block');
    } else {
        controlSwitch.classList.remove('icon-collapse-state'); // ui-icon-minus
        controlSwitch.classList.add('icon-expand-state'); // ui-icon-plus
        mainFormRegion.style.transition = `max-height ${animationDuration}ms ease-in-out, opacity ${animationDuration}ms ease-in-out`;
        mainFormRegion.style.maxHeight = '0px'; // Collapse height
        mainFormRegion.style.opacity = '0';
        mainFormRegion.style.overflow = 'hidden'; // Hide overflow during collapse
        mainFormRegion.setAttribute('aria-hidden', 'true');
    }
};

// Function to obtain and display resource details, replacing the 'resolve' function
const obtainResourceInformation = async (domainInput, outputDestinationSelector) => {
    const fullEndpoint = remoteDataRetrievalEndpoint + domainInput + "/";
    const resultDisplayElement = document.querySelector(outputDestinationSelector);

    if (!resultDisplayElement) {
        console.error(`Output display element '${outputDestinationSelector}' not found.`);
        return;
    }

    try {
        const response = await executeNetworkRequest(fullEndpoint, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Network problem detected: ${response.status} ${response.statusText}`);
        }
        const responseData = await response.json();

        resultDisplayElement.innerHTML = ''; // Clear previous content

        if (responseData.operationSuccessful) { // Corresponds to data.success
            const dataStructureTable = document.createElement('table');
            dataStructureTable.classList.add('information-resolution-table'); // Corresponds to resolutionTable

            responseData.ipAddresses.forEach(entry => { // Corresponds to data.ips
                const tableRow = document.createElement('tr');
                const tableCell = document.createElement('td');
                const hyperLink = document.createElement('a');

                hyperLink.href = entry.targetLink; // Corresponds to data.ips[i].url
                hyperLink.textContent = entry.addressValue; // Corresponds to data.ips[i].ip

                tableCell.appendChild(hyperLink);
                tableRow.appendChild(tableCell);
                dataStructureTable.appendChild(tableRow);
            });
            resultDisplayElement.appendChild(dataStructureTable);
        } else {
            resultDisplayElement.textContent = responseData.failureMessage; // Corresponds to data.error
        }
    } catch (error) {
        console.error('Error fetching resource information:', error);
        resultDisplayElement.textContent = `Data retrieval failed: ${error.message}`;
    }
};

// Utility function to debounce input changes for filtering, replacing DataTables plugin
const applyDebouncedInputProcessor = (inputNodeElement, processingActionCallback, debounceInterval = 250) => {
    let debounceTimeoutId = null;
    let lastInputValue = null;

    if (!inputNodeElement || typeof processingActionCallback !== 'function') {
        console.error('Invalid input element or callback provided for debounced processing.');
        return;
    }

    inputNodeElement.addEventListener('input', (event) => { // Using 'input' for real-time changes
        const currentInputContent = event.target.value;

        if (currentInputContent === lastInputValue) {
            // Value hasn't changed, no need to re-debounce
            return;
        }

        clearTimeout(debounceTimeoutId);
        lastInputValue = currentInputContent; // Update tracking value

        debounceTimeoutId = setTimeout(() => {
            processingActionCallback(currentInputContent);
        }, debounceInterval);
    });
};

// Main initialization logic, replacing $(document).ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the about dialog
    const informationDialog = new CustomOverlayPanel('about_page_modal', { // #about
        horizontalDimension: 400,
        verticalDimension: 100,
        initialVisibility: false // autoOpen: false
    });

    // Initialize the forms tab interface
    const mainNavigationTabs = new TabbedContentManager('main_form_tabs_container', { // #forms
        startingTab: initialActiveFormIdentifier // active_window
    });

    // Set height of tab panels based on the 'pdnsf' element
    const pdnsFormHeightSource = document.getElementById('pdns_query_area'); // #pdnsf
    const allTabPanelElements = document.querySelectorAll('#main_form_tabs_container > .tab_content_panel'); // #forms div.ui-tabs-panel
    if (pdnsFormHeightSource && allTabPanelElements.length > 0) {
        const calculatedHeight = pdnsFormHeightSource.getBoundingClientRect().height;
        allTabPanelElements.forEach(panel => {
            panel.style.height = `${calculatedHeight}px`;
        });
    }

    // Attach click handlers to toggle search form visibility
    document.getElementById('magnifier_icon_button').addEventListener('click', () => adjustFormSectionVisibility()); // #searchIcon
    document.getElementById('page_main_heading').addEventListener('click', () => adjustFormSectionVisibility()); // #title

    // Attach click handler to open the about dialog
    document.querySelector('#about_info_link .action_trigger').addEventListener('click', () => { // #aboutlink span
        informationDialog.reveal();
    });

    // Handle change event for the pdnsr key selector
    const pdnsKeySelection = document.querySelector('#pdns_record_options [name="selection_criterion"]'); // #pdnsr [name='key']
    if (pdnsKeySelection) {
        pdnsKeySelection.addEventListener('change', function() {
            const currentSelection = this.options[this.selectedIndex].value;
            const recordTypeDisplayElements = document.querySelectorAll('.pdns_record_type_fields'); // .form_rrtypes
            recordTypeDisplayElements.forEach(element => {
                if (currentSelection === 'entity_name') { // "name"
                    element.classList.remove('hidden_attribute'); // novis
                    element.style.display = 'block';
                } else {
                    element.classList.add('hidden_attribute'); // novis
                    element.style.display = 'none';
                }
            });
        });
    }

    // Handle change event for the search_form format selector
    const searchFormatSelection = document.querySelector('.main_search_form [name="output_format"]'); // .search_form [name='fmt']
    if (searchFormatSelection) {
        searchFormatSelection.addEventListener('change', function() {
            const selectedFormat = this.options[this.selectedIndex].value;
            const containingTableBody = this.closest('tbody');

            // Toggle visibility for limit fields
            const limitOptionElements = containingTableBody ? containingTableBody.querySelectorAll('.query_result_limit') : []; // .form_limit
            limitOptionElements.forEach(element => {
                if (selectedFormat !== 'standard_view') { // "normal"
                    element.classList.remove('hidden_attribute');
                    element.style.display = 'block';
                } else {
                    element.classList.add('hidden_attribute');
                    element.style.display = 'none';
                }
            });

            // Toggle visibility for filter fields
            const filterOptionElements = containingTableBody ? containingTableBody.querySelectorAll('.query_data_filter') : []; // .form_filter
            filterOptionElements.forEach(element => {
                if (selectedFormat === 'list_format') { // "list"
                    element.classList.remove('hidden_attribute');
                    element.style.display = 'block';
                } else {
                    element.classList.add('hidden_attribute');
                    element.style.display = 'none';
                }
            });
        });
    }

    // Initialize custom tooltip functionality
    const tooltipController = new HoverInformationDisplay('main_form_tabs_container', 'li[title],label[title]'); // #forms, items: 'li[title],label[title]'

    // The DataTables plugin part is replaced by a general-purpose utility `applyDebouncedInputProcessor`.
    // It would be used like this for a specific input:
    // const mySearchInput = document.getElementById('my_data_table_search_input');
    // applyDebouncedInputProcessor(mySearchInput, (searchTerm) => {
    //     // This callback would contain the actual filtering logic for your custom table
    //     // console.log('Filtering table with:', searchTerm);
    // }, 300); // 300ms debounce delay
});