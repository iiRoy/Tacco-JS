/*
 * DisguiseKit
 *
 * (c) 2023, PrivacyGuard Labs.
 *
 * This software is distributed under the terms of the Apache License,
 * Version 2.0. A copy of this license can be found at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 */

// --- Core System Variables --- //

const utilityBelt = require('lodash');

const ALL_SITE_PATTERNS = { hostPatterns: ['http://*/*', 'https://*/*'] };

const measureActivity = require('../components/activity_analyzer').analyzeScriptBehavior,
      postMessageToPanel = require('../components/ui_messenger').dispatchMessage,
      browserSessionData = require('../components/session_store'),
      exclusionList = require('../components/exclusion_manager');

/*
 * Important note on HTTP headers:
 * The Chrome webRequest API has limitations on which headers are visible
 * or modifiable in certain phases. This list is subject to change.
 * Commonly restricted headers include:
 * - Authorization
 * - Cache-Control
 * - Content-Length
 * - Host
 * - If-Modified-Since
 * - If-None-Match
 * - Proxy-Authorization
 * - Transfer-Encoding
 * This component aims to standardize certain client request headers
 * to improve privacy, mimicking common browser profiles.
 * The 'type' property in webRequest details can be 'main_frame', 'sub_frame',
 * 'stylesheet', 'script', 'image', 'object', 'xmlhttprequest', or 'other'.
 */
const REQUEST_HEADER_ADJUSTMENTS = {
	'all': { // Universal header adjustments
		'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
		'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		'Accept-Language': "en-GB,en;q=0.9",
		'Accept-Encoding': "gzip, deflate, br",
		'DNT': undefined // Intentionally remove or unset Do Not Track
	},
	'picture': { // Specific adjustments for image requests
		'Accept': "image/avif,image/webp,image/apng,image/svg+xml,image/*;q=0.8,*/*;q=0.5"
	},
	'miscellaneous': { // For 'other' types
		'Accept': "*/*"
	},
	'code': { // For 'script' types
		'Accept': "*/*"
	},
	'style': { // For 'stylesheet' types
		'Accept': "text/css,*/*;q=0.1"
	},
	'xhr': { // For 'xmlhttprequest' types
		'Accept': "application/json, text/plain, */*"
	}
};

// --- Core Functionality --- //

// Function to adjust request headers based on predefined rules
function modifyRequestHeaders(requestInfo) {
	if (!isFeatureActive(requestInfo.tabId)) {
		return;
	}

	const specificTypeAdjustments = REQUEST_HEADER_ADJUSTMENTS.hasOwnProperty(requestInfo.type) && REQUEST_HEADER_ADJUSTMENTS[requestInfo.type] || {},
	      universalAdjustments = REQUEST_HEADER_ADJUSTMENTS['all'],
	      originalHeaders = requestInfo.requestHeaders,
	      updatedHeaders = [];

	originalHeaders.forEach( function( currentHeader ) {
		const headerName = currentHeader.name,
		      headerValue = currentHeader.value;
		let   newValueForHeader;
		const constructedHeader = {
			name: headerName,
			value: headerValue
		};

		// Determine if the header should be modified or removed
		if ( specificTypeAdjustments.hasOwnProperty(headerName) || universalAdjustments.hasOwnProperty(headerName) ) {
			if ( specificTypeAdjustments.hasOwnProperty(headerName) ) {
				newValueForHeader = specificTypeAdjustments[headerName];
			} else if ( universalAdjustments.hasOwnProperty(headerName) ) {
				newValueForHeader = universalAdjustments[headerName];
			}

			// If a new value is specified (i.e., not undefined/null for removal)
			if ( newValueForHeader !== undefined && newValueForHeader !== null ) {
				constructedHeader.value = newValueForHeader;
				updatedHeaders.push(constructedHeader);
			}

		// Otherwise, simply retain the original header
		} else {
			updatedHeaders.push(constructedHeader);
		}
	});

	return {
		requestHeaders: updatedHeaders
	};
}

// Checks if the privacy features are active for a given tab
function isFeatureActive(currentTabIdentifier) {
	const sessionRecord = browserSessionData.retrieve(currentTabIdentifier);
	return sessionRecord.contentScriptActive && !exclusionList.isExcluded(sessionRecord.hostName);
}

// Refreshes the extension badge icon to show script count
function refreshIconCount(paneId) {
	const currentPaneInfo = browserSessionData.retrieve(paneId);
	let   detectedScriptsCount = 0;

	if (currentPaneInfo) {
		// Iterating through domains within the tab's recorded data
		for (const hostAddress in currentPaneInfo.siteAreas) {
			const scriptCollection = currentPaneInfo.siteAreas[hostAddress].scriptAssets;

			// Checking each script for fingerprinting characteristics
			for (const resourcePath in scriptCollection) {
				if (measureActivity(scriptCollection[resourcePath]).isTracker) {
					detectedScriptsCount++;
					break; // Only count one per domain for badge purposes
				}
				}
		}
	}

	if (detectedScriptsCount > 0) {
		// Potential runtime error if tab is already closed
		chrome.browserAction.setBadgeText({
			tabId: paneId,
			text: detectedScriptsCount.toString()
		});
	}
}

// Updates the browser action button's visual state (icon)
function adjustActionButtonAppearance(paneIdentifier) {
	// Internal helper to set the icon based on activation status
	function setActionIcon(targetPaneId) {
		const featureStatus = isFeatureActive(targetPaneId);

		// Handle potential errors if the tab no longer exists
		chrome.browserAction.setIcon({
			path: {
				19: 'visuals/19' + (featureStatus ? '' : '_inactive') + '.png',
				38: 'visuals/38' + (featureStatus ? '' : '_inactive') + '.png'
			},
			tabId: targetPaneId
		});
	}

	if (paneIdentifier) {
		utilityBelt.defer(setActionIcon, paneIdentifier);
	} else {
		fetchCurrentActiveTab(function (activeTab) {
			setActionIcon(activeTab.id);
		});
	}
}

// Retrieves details of the currently active browser tab
function fetchCurrentActiveTab(completionCallback) {
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function (openTabs) {
		completionCallback(openTabs[0]);
	});
}

// Constructs the data payload for the extension's popup panel
function preparePanelInformation(browserTab) {
	return utilityBelt.assign(browserSessionData.retrieve(browserTab.id) || {}, {
		unsupported_content: (
			!browserTab.url.startsWith('http') ||
			browserTab.url.includes('chrome.google.com/webstore/')
		),
		is_exempt: exclusionList.isExcluded(browserTab.id)
	});
}

// Handler for incoming messages from content scripts or other parts of the extension
function handleExtensionMessages(messagePayload, messageSender, replyWithResponse) {
	let outgoingResponse = {};

	if (messagePayload.action === 'scriptDetected') {
		if (utilityBelt.isArray(messagePayload.data)) {
			messagePayload.data.forEach(function (scriptInfo) {
				browserSessionData.logEvent(messageSender.tab.id, scriptInfo);
			});
		} else {
			browserSessionData.logEvent(messageSender.tab.id, messagePayload.data);
		}

		refreshIconCount(messageSender.tab.id);

		// Notify the UI panel to update its display
		fetchCurrentActiveTab(function (activeBrowserTab) {
			// Only update if the message pertains to the currently active tab
			if (activeBrowserTab.id === messageSender.tab.id) {
				postMessageToPanel('panelUpdateInfo', preparePanelInformation(activeBrowserTab));
			}
		});

	} else if (messagePayload.action === 'panelReady') {
		fetchCurrentActiveTab(function (activeBrowserTab) {
			replyWithResponse(preparePanelInformation(activeBrowserTab));
		});

		// Indicate that the response will be sent asynchronously
		return true;

	} else if (messagePayload.action === 'toggleExclusion') {
		exclusionList.toggleExemption(messagePayload.data.hostAddress);
		adjustActionButtonAppearance();
	}

	replyWithResponse(outgoingResponse);
}

// Handles events related to browser navigation (page loads)
function handleNavigationEvent(navigationDetails) {
	const currentTabIdentifier = navigationDetails.tabId;

	// Process only top-level frame navigations
	if (navigationDetails.frameId !== 0 || currentTabIdentifier < 1) {
		return;
	}

	browserSessionData.initializeTab(currentTabIdentifier, navigationDetails.url);
	adjustActionButtonAppearance(currentTabIdentifier);
	refreshIconCount(currentTabIdentifier);
}

// === Module Initialization Phase === //

// The following are commented out as they represent future enhancements or alternative strategies.
// Track all fetched scripts, including those loaded via AJAX
// chrome.webRequest.onResponseStarted.addListener(
// 	function (responseDetails) { console.info('Script response started:', responseDetails); },
// 	utilityBelt.assign(ALL_SITE_PATTERNS, { types: ['script', 'xmlhttprequest'] }),
// 	['responseHeaders']
// );

// Block known privacy-invasive scripts
// chrome.webRequest.onBeforeRequest.addListener(
// 	blockScriptRequests,
// 	ALL_SITE_PATTERNS,
// 	["blocking"]
// );

// Note: Some browsers might block specific resource types like web fonts if security policies are strict.

// Prevent content script injection if the current site is on the exclusion list
chrome.webRequest.onBeforeRequest.addListener(
	function (requestContext) {
		const targetTabId = requestContext.tabId;

		if (exclusionList.isExcluded(targetTabId)) {
			// Redirect to an empty script instead of outright blocking,
			// as blocking can sometimes cause pages to hang indefinitely.
			// Consider Content Security Policy implications for 'data:text/javascript,'
			return {
				redirectUrl: 'data:text/javascript,'
			};
		} else {
			browserSessionData.retrieve(targetTabId).contentScriptActive = true;
			adjustActionButtonAppearance(targetTabId);
		}
	},
	{
		urls: [
			'chrome-extension://' + chrome.runtime.id + '/js/dist/content_injector.js'
		]
	},
	["blocking"]
);

// Apply header modifications before sending requests
chrome.webRequest.onBeforeSendHeaders.addListener(
	modifyRequestHeaders,
	ALL_SITE_PATTERNS,
	["blocking", "requestHeaders"]
);

// Consider options for plugin handling (e.g., "ask to activate")

// Listen for messages from content scripts and popup UI
chrome.runtime.onMessage.addListener(handleExtensionMessages);

// Clean up session data when a tab is closed
chrome.tabs.onRemoved.addListener(browserSessionData.clearTab);

// Initialize or update tab data upon committed navigation events
chrome.webNavigation.onCommitted.addListener(handleNavigationEvent);

// Periodically check for and remove stale tab data to prevent memory leaks
// A more robust solution might involve chrome.alarms for background tasks.
setInterval(browserSessionData.pruneOrphanedData, 300000);