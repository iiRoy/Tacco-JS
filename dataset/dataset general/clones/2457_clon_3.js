// This module manages the dynamic content display for the browser extension's popup interface,
// fetching analyzed page data and rendering it into a user-friendly format.

// Helper function to securely retrieve data from the extension's background page for the active tab.
function fetchActiveTabAnalysis(processDataCallback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            console.error('No active tab identified for data retrieval.');
            processDataCallback(null); // Signal no data
            return;
        }

        const focusedTab = tabs[0];
        const extensionBackgroundPage = chrome.extension.getBackgroundPage();

        if (!extensionBackgroundPage || !extensionBackgroundPage.technologyData) {
            console.error('Background page or core analysis data not accessible.');
            processDataCallback(null); // Signal no data
            return;
        }

        processDataCallback(extensionBackgroundPage.technologyData[focusedTab.id]);
    });
}

// Global reference to the main container where detailed information rows are appended.
const pageDetailsContainer = document.getElementById("detail");

/**
 * Constructs and appends a new table row to the primary details container.
 * @param {string} labelI18nKey - Internationalization message key for the row's label.
 * @param {string} mainContentHtml - HTML string for the primary content cell.
 * @param {string} [additionalContentHtml=''] - Optional HTML string for a secondary content cell.
 * @param {number} [mainCellColspan=1] - Number of columns the primary content cell should span.
 */
function createAndAppendDetailRow(labelI18nKey, mainContentHtml, additionalContentHtml = '', mainCellColspan = 1) {
    const dataRow = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.innerHTML = `<strong>${chrome.i18n.getMessage(labelI18nKey)}</strong>`;

    const primaryDataCell = document.createElement('td');
    primaryDataCell.setAttribute("colspan", String(mainCellColspan));
    primaryDataCell.innerHTML = mainContentHtml;

    dataRow.appendChild(labelCell);
    dataRow.appendChild(primaryDataCell);

    // Only add a secondary cell if colspan is 1 and additional content is provided.
    if (mainCellColspan === 1 && additionalContentHtml) {
        const secondaryDataCell = document.createElement('td');
        secondaryDataCell.innerHTML = additionalContentHtml;
        dataRow.appendChild(secondaryDataCell);
    }

    if (pageDetailsContainer) {
        pageDetailsContainer.appendChild(dataRow);
    } else {
        console.error("Target details container element not found for appending rows.");
    }
}

/**
 * Generates the HTML for an icon, potentially embedded within an anchor tag if a URL is present.
 * Includes basic validation for the URL.
 * @param {object} itemDetails - Object containing 'icon', 'title', and optionally 'url' properties.
 * @param {string} iconDirectoryPath - Base path for the icon images (e.g., "flags/", "icons/").
 * @param {boolean} [displayTitleText=true] - Flag to determine if the item's title text should appear next to the icon.
 * @returns {string} The complete HTML string for the icon display.
 */
function constructIconLinkHtml(itemDetails, iconDirectoryPath, displayTitleText = true) {
    const iconSource = `${iconDirectoryPath}${itemDetails.icon || 'default.png'}`; // Fallback icon
    const imageElementHtml = `<img class="img" width="19px" height="19px" src="${iconSource}" title="${itemDetails.title || ''}" loading="lazy">`;

    let contentFragment = imageElementHtml;
    if (displayTitleText && itemDetails.title) {
        contentFragment += `&nbsp;${itemDetails.title}`;
    }

    if (itemDetails.url && typeof itemDetails.url === 'string' && itemDetails.url.startsWith('http')) {
        return `<a href="${itemDetails.url}" target="_blank" rel="noopener noreferrer">${contentFragment}</a>`;
    }
    return contentFragment;
}

// Main function to populate the popup's content based on analyzed page data.
function initializePopupContent() {
    fetchActiveTabAnalysis((analysisResult) => {
        if (!analysisResult) {
            if (pageDetailsContainer) {
                pageDetailsContainer.innerHTML = `<tr><td colspan="3" class="no-data-msg">${chrome.i18n.getMessage("noDataAvailable")}</td></tr>`;
            }
            return;
        }

        // --- IP Address Information ---
        if (analysisResult.ipAddressDetails) {
            const ipData = analysisResult.ipAddressDetails;
            const countryIdentifier = ipData.CountryCode ? ipData.CountryCode.toLowerCase() : 'unknown';
            const flagIconHtml = `<img class="img" width="19px" height="19px" src="flags/${countryIdentifier}.gif" title="${ipData.CountryName || 'Unknown Country'}" loading="lazy">`;
            const primaryIpDisplay = `${flagIconHtml} ${ipData.Ip || 'IP Not Found'}`;
            const secondaryIpDisplay = `${ipData.City || 'N/A'}, ${ipData.RegionName || 'N/A'}, ${ipData.CountryName || 'N/A'}`;
            createAndAppendDetailRow("ipAddressLabel", primaryIpDisplay, secondaryIpDisplay);
        }

        // --- Web Technology Stack ---
        if (analysisResult.webTechnologyInfo) {
            const techStack = analysisResult.webTechnologyInfo;
            const primaryTechContent = constructIconLinkHtml(techStack, "icons/", false); // Title in tooltip
            const secondaryTechContent = techStack.result && techStack.result.length > 0 ? techStack.result[0] : techStack.title || 'Info N/A';
            createAndAppendDetailRow("webTechnologyLabel", primaryTechContent, secondaryTechContent);
        }

        // --- Web Server Details ---
        if (analysisResult.serverSoftwareInfo) {
            const serverSoftware = analysisResult.serverSoftwareInfo;
            const primaryServerContent = constructIconLinkHtml(serverSoftware, "icons/", false);
            const secondaryServerContent = serverSoftware.result && serverSoftware.result.length > 0 ? serverSoftware.result[0] : serverSoftware.title || 'Info N/A';
            createAndAppendDetailRow("webServerLabel", primaryServerContent, secondaryServerContent);
        }

        // --- Operating System Information ---
        if (analysisResult.operatingSystemInfo) {
            const osDetails = analysisResult.operatingSystemInfo;
            const primaryOsContent = constructIconLinkHtml(osDetails, "icons/", false);
            const secondaryOsContent = osDetails.result && osDetails.result.length > 0 ? osDetails.result[0] : osDetails.title || 'Info N/A';
            createAndAppendDetailRow("operatingSystemLabel", primaryOsContent, secondaryOsContent);
        }

        // --- Frontend Libraries ---
        if (analysisResult.clientSideLibs && analysisResult.clientSideLibs.length > 0) {
            const libraryHtmlSegments = analysisResult.clientSideLibs.map(lib => constructIconLinkHtml(lib, "icons/", true));
            createAndAppendDetailRow("frontendLibrariesLabel", libraryHtmlSegments.join('&nbsp;&nbsp;'), '', 2);
        }

        // --- Web Applications ---
        if (analysisResult.webApplications && analysisResult.webApplications.length > 0) {
            const applicationHtmlSegments = analysisResult.webApplications.map(app => constructIconLinkHtml(app, "icons/", true));
            createAndAppendDetailRow("webApplicationsLabel", applicationHtmlSegments.join('&nbsp;&nbsp;'), '', 2);
        }
    });
}

// References to elements for raw header display management.
const rawHeaderDisplayArea = document.getElementById('headerDebugArea');
const headerToggleControl = document.getElementById('headerDisplayToggle');

let isHeaderPanelVisible = false; // Internal state to track header visibility.

/**
 * Toggles the visibility of the raw header information panel.
 * This function also updates the toggle button's appearance and ensures data availability.
 */
function manageHeaderPanelVisibility() {
    fetchActiveTabAnalysis((analysisResult) => {
        if (!analysisResult || !analysisResult.rawHeaders) {
            console.warn('No raw header data found for the current page.');
            // Visually indicate that the toggle is inactive if no data.
            if (headerToggleControl) {
                headerToggleControl.style.opacity = '0.4';
                headerToggleControl.style.cursor = 'default';
                headerToggleControl.removeEventListener('click', manageHeaderPanelVisibility);
            }
            if (rawHeaderDisplayArea) {
                rawHeaderDisplayArea.style.display = 'none';
            }
            return;
        }

        isHeaderPanelVisible = !isHeaderPanelVisible; // Invert current visibility state

        if (rawHeaderDisplayArea && headerToggleControl) {
            if (isHeaderPanelVisible) {
                rawHeaderDisplayArea.innerText = analysisResult.rawHeaders;
                rawHeaderDisplayArea.style.display = 'block'; // Show the panel
                headerToggleControl.innerHTML = '<i class="icon-eye-close"></i>'; // Change icon to 'hide'
            } else {
                rawHeaderDisplayArea.style.display = 'none'; // Hide the panel
                headerToggleControl.innerHTML = '<i class="icon-eye-open"></i>'; // Change icon to 'show'
            }
        }
    });
}

/**
 * Applies internationalized strings to various UI elements across the popup.
 * Ensures elements exist before attempting to modify them.
 */
function applyInterfaceLocalization() {
    const categoryLabel = document.getElementById('categoryTabLabel');
    if (categoryLabel) categoryLabel.innerText = chrome.i18n.getMessage("tabCategory");

    const technologyLabel = document.getElementById('techTabLabel');
    if (technologyLabel) technologyLabel.innerText = chrome.i18n.getMessage("tabTechnology");

    const detailLabel = document.getElementById('detailTabLabel');
    if (detailLabel) detailLabel.innerText = chrome.i18n.getMessage("tabDetail");

    const optionsBtn = document.getElementById('optionsButton');
    if (optionsBtn) optionsBtn.setAttribute("title", chrome.i18n.getMessage("btnOptions"));

    if (headerToggleControl) headerToggleControl.setAttribute("title", chrome.i18n.getMessage("btnShowHeader"));

    const cloudSearchButton = document.getElementById('cloudSearchBtn');
    if (cloudSearchButton) cloudSearchButton.setAttribute("title", chrome.i18n.getMessage("btnCloudSearch"));

    const issueButton = document.getElementById('issueReportBtn');
    if (issueButton) issueButton.setAttribute("title", chrome.i18n.getMessage("btnIssue"));
}

// Event listener to trigger initialization once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    initializePopupContent();
    applyInterfaceLocalization();

    // Attach the event listener for the header visibility toggle button.
    if (headerToggleControl) {
        headerToggleControl.addEventListener('click', manageHeaderPanelVisibility);
    }
});