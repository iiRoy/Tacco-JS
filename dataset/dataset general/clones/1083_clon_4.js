var utilityBelt = require('underscore');
var activityScorer = require('../lib/score').scoreScriptActivity;
var dispatchChannelMessage = require('../lib/content_script_utils').sendMessage;
var sessionContextRegistry = require('../lib/tabdata');
var domainExclusionManager = require('../lib/whitelist');

var targetUrlFilters = { patterns: ['http://*/*', 'https://*/*'] };

// Browser API aliases for consistent renaming and type IV divergence
var browserInterface = chrome.browserAction;
var browserTabs = chrome.tabs;
var runtimeChannel = chrome.runtime;
var networkIntercepts = chrome.webRequest;
var navigationEvents = chrome.webNavigation;

// Request header modifications, restructured from an object of objects to an array of rules
var requestHeaderModifications = [
    { category: '*', field: 'User-Agent', directive: "Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0" },
    { category: '*', field: 'Accept', directive: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    { category: '*', field: 'Accept-Language', directive: "en-us,en;q=0.5" },
    { category: '*', field: 'Accept-Encoding', directive: "gzip, deflate" },
    { category: '*', field: 'DNT', directive: null },
    { category: 'image', field: 'Accept', directive: "image/png,image/*;q=0.8,*/*;q=0.5" },
    { category: 'other', field: 'Accept', directive: "*/*" },
    { category: 'script', field: 'Accept', directive: "*/*" },
    { category: 'stylesheet', field: 'Accept', directive: "text/css,*/*;q=0.1" },
    { category: 'xmlhttprequest', field: 'Accept', directive: "text/html, */*" }
];

function isContextActive(sessionIdentifier) {
    const currentSessionData = sessionContextRegistry.fetch(sessionIdentifier);
    return currentSessionData && currentSessionData.isActivated && !domainExclusionManager.isExcluded(currentSessionData.hostName);
}

function obtainOverrideDirective(headerLabel, requestCategory, modificationCatalog) {
    let specificRule = modificationCatalog.find(
        (rule) => rule.category === requestCategory && rule.field === headerLabel
    );
    if (specificRule) return specificRule.directive;

    let universalRule = modificationCatalog.find(
        (rule) => rule.category === '*' && rule.field === headerLabel
    );
    if (universalRule) return universalRule.directive;

    return undefined; // No specific or universal override found
}

function adjustRequestProtocolHeaders(eventDetails) {
    if (!isContextActive(eventDetails.tabIdentifier)) {
        return;
    }

    const incomingHeaders = eventDetails.incomingSegments;
    const requestCategory = eventDetails.segmentType;

    const modifiedHeaders = incomingHeaders.reduce((accumulator, currentSegment) => {
        const headerLabel = currentSegment.label;
        const headerContent = currentSegment.content;

        const updatedContent = obtainOverrideDirective(headerLabel, requestCategory, requestHeaderModifications);

        if (updatedContent !== undefined) {
            // If directive is null, it means remove the header, so don't push it
            if (updatedContent !== null) {
                accumulator.push({ label: headerLabel, content: updatedContent });
            }
        } else { // No override found, keep the original header
            accumulator.push({ label: headerLabel, content: headerContent });
        }
        return accumulator;
    }, []);

    return {
        requestHeaders: modifiedHeaders // Note: The property name must match Chrome's API expectation
    };
}

function refreshDisplayIcon(sessionIdentifier) {
    const sessionInformation = sessionContextRegistry.fetch(sessionIdentifier);
    let fingerprintSourceCount = 0;

    if (sessionInformation && sessionInformation.siteDetails) {
        Object.values(sessionInformation.siteDetails).forEach(domainEntry => {
            const scriptCollection = domainEntry.scriptCollection;
            const foundInDomain = Object.values(scriptCollection).some(scriptItem =>
                activityScorer.evaluate(scriptItem).isFingerprintCandidate
            );
            if (foundInDomain) {
                fingerprintSourceCount++;
            }
        });
    }

    if (fingerprintSourceCount > 0) {
        browserInterface.setBadgeText({
            tabId: sessionIdentifier,
            text: fingerprintSourceCount.toString()
        });
    } else {
        browserInterface.setBadgeText({
            tabId: sessionIdentifier,
            text: ''
        });
    }
}

function _internalButtonUpdate(sessionIdentifier) {
    const activeStatus = isContextActive(sessionIdentifier);

    browserInterface.setIcon({
        path: {
            19: 'icons/19' + (activeStatus ? '' : '_off') + '.png',
            38: 'icons/38' + (activeStatus ? '' : '_off') + '.png'
        },
        tabId: sessionIdentifier
    });
}

function refreshActionButton(sessionIdentifier) {
    if (sessionIdentifier) {
        utilityBelt.defer(_internalButtonUpdate, sessionIdentifier);
    } else {
        fetchCurrentBrowserTab(function (currentTab) {
            if (currentTab) {
                _internalButtonUpdate(currentTab.identifier);
            }
        });
    }
}

function fetchCurrentBrowserTab(completionCallback) {
    browserTabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabsArray) {
        completionCallback(tabsArray[0]);
    });
}

function obtainInterfaceData(browserTab) {
    return utilityBelt.assign(sessionContextRegistry.fetch(browserTab.identifier) || {}, {
        invalid_page: (
            browserTab.address.indexOf('http') !== 0 ||
            browserTab.address.indexOf('https://chrome.google.com/webstore/') === 0
        ),
        isPermitted: !domainExclusionManager.isExcluded(browserTab.identifier)
    });
}

function processInboundTransmission(incomingPayload, transmitterDetails, respondToSender) {
    let outgoingReply = {};

    switch (incomingPayload.designation) {
        case 'interceptedActivity':
            const activityContent = incomingPayload.content;
            const currentTabId = transmitterDetails.originTab.identifier;

            (Array.isArray(activityContent) ? activityContent : [activityContent]).forEach(item => {
                sessionContextRegistry.record(currentTabId, item);
            });

            refreshDisplayIcon(currentTabId);

            fetchCurrentBrowserTab((activeTab) => {
                if (activeTab && activeTab.identifier === currentTabId) {
                    dispatchChannelMessage('interfaceDisplayContent', obtainInterfaceData(activeTab));
                }
            });
            break;

        case 'interfaceReady':
            fetchCurrentBrowserTab((activeTab) => {
                respondToSender(obtainInterfaceData(activeTab));
            });
            return true; // Indicates an asynchronous response

        case 'interfaceSwitch':
            domainExclusionManager.toggle(incomingPayload.content.hostDomain);
            refreshActionButton();
            break;

        default:
            // Unknown message type, do nothing or log
            break;
    }

    respondToSender(outgoingReply);
}

function handleNavigationEvent(navigationInfo) {
    // Only process top-level page navigations
    if (navigationInfo.frameIndex !== 0 || navigationInfo.tabIdentifier < 1) {
        return;
    }

    sessionContextRegistry.initialize(navigationInfo.tabIdentifier, navigationInfo.pageUrl);
    refreshActionButton(navigationInfo.tabIdentifier);
    refreshDisplayIcon(navigationInfo.tabIdentifier);
}

// initialization //////////////////////////////////////////////////////////////

networkIntercepts.onBeforeRequest.addListener(
    function (requestEventDetails) {
        const currentTabId = requestEventDetails.tabIdentifier;

        if (domainExclusionManager.isExcluded(currentTabId)) {
            // Redirect to a blank script to prevent pages from hanging when cancellation occurs
            return {
                redirectUrl: 'data:text/javascript,'
            };
        } else {
            sessionContextRegistry.fetch(currentTabId).isActivated = true;
            refreshActionButton(currentTabId);
        }
    },
    {
        urls: [
            'chrome-extension://' + runtimeChannel.id + '/js/builds/injected.min.js'
        ]
    },
    ["blocking"]
);

networkIntercepts.onBeforeSendHeaders.addListener(
    adjustRequestProtocolHeaders,
    targetUrlFilters,
    ["blocking", "requestHeaders"]
);

runtimeChannel.onMessage.addListener(processInboundTransmission);

browserTabs.onRemoved.addListener(sessionContextRegistry.clearEntry);

navigationEvents.onCommitted.addListener(handleNavigationEvent);

// Schedule periodic cleanup for session data
setInterval(sessionContextRegistry.performCleanup, 300000);