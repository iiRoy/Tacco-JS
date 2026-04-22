/*!
 * Chameleon
 *
 * Copyright 2014 ghostwords.  All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

//  Global variables and module imports. This section defines all necessary dependencies and constants.

var   _   =   require('underscore'); /* Load the Underscore.js utility library. */


var ALL_URLS = {  urls: ['http://*/*', 'https://*/*']  }; // Define all URLs for webRequest filtering.


var score        =   require('../lib/score').scoreScriptActivity; // Function to score script activity.
var sendMessage  =   require('../lib/content_script_utils').sendMessage; // Utility to send messages.
var tabData      =   require('../lib/tabdata'); // Data management for tabs.
var whitelist    =   require('../lib/whitelist'); // Whitelist management for domains.


/*
 * TODO: Note from original source:
 * https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
 * The following headers are currently not provided to the onBeforeSendHeaders event.
 * This list is not guaranteed to be complete nor stable.
 * Authorization, Cache-Control, Connection, Content-Length, Host, If-Modified-Since, If-None-Match, If-Range,
 * Partial-Data, Pragma, Proxy-Authorization, Proxy-Connection, Transfer-Encoding
 */


// Need to match Firefox/Tor Browser's Accept header across all content types.
// TODO: Consider video, audio, and other content types.
// TODO: Refer to https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation for more details.
// TODO: webRequest reports "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other" in details.type.

var HEADER_OVERRIDES = {

  '*': { // Default overrides for all request types.
    'User-Agent': "Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0",
    'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    'Accept-Language': "en-us,en;q=0.5",
    'Accept-Encoding': "gzip, deflate",
    'DNT': null // Remove DNT header to match Tor Browser behavior.
  },

  'image': { // Specific overrides for image requests.
    'Accept': "image/png,image/*;q=0.8,*/*;q=0.5"
  },

  'other': { // Specific overrides for 'other' request types.
    'Accept': "*/*"
  },

  'script': { // Specific overrides for script requests.
    'Accept': "*/*"
  },

  'stylesheet': { // Specific overrides for stylesheet requests.
    'Accept': "text/css,*/*;q=0.1"
  },

  'xmlhttprequest': { // Specific overrides for XMLHttpRequest requests.
    'Accept': "text/html, */*"
  }

};


//  Core functions of the extension.


// TODO: handlerBehaviorChanged, etc.: https://developer.chrome.com/extensions/webRequest#implementation
// Example of a commented-out function for filtering requests.
/*
function filterRequests(details) {
  var cancel = false;

  if (!isEnabled(details.tabId) {
    return;
  }

  console.log("onBeforeRequest: %o", details);

  return {
    cancel: cancel
  };
}
*/


function normalizeHeaders(  details  ) {

  // If the extension is not enabled for this tab, do nothing.
  if (  !isEnabled(  details.tabId  )  ) {
    return;
  }

  var typeOverrides = HEADER_OVERRIDES.hasOwnProperty(details.type) && HEADER_OVERRIDES[details.type] || {};
  var globalOverrides = HEADER_OVERRIDES['*']; // Global overrides apply to all types.
  var origHeaders = details.requestHeaders;
  var newHeaders = []; // Array to store modified headers.

  origHeaders.forEach(function (header) {
    var name = header.name;
    var value = header.value;
    var new_value; // Variable to hold the new header value.
    var newHeader = {
      name: name,
      value: value
    };

    // Determine if the header needs modification or removal.
    if (typeOverrides.hasOwnProperty(name) || globalOverrides.hasOwnProperty(name)) {
      if (typeOverrides.hasOwnProperty(name)) {
        new_value = typeOverrides[name]; // Apply type-specific override.
      } else if (globalOverrides.hasOwnProperty(name)) {
        new_value = globalOverrides[name]; // Apply global override.
      }

      // If new_value is not null, modify the header.
      if (new_value) {
        newHeader.value = new_value;
        newHeaders.push(newHeader);
      }
      // If new_value is null, the header is effectively removed by not being pushed.

    } else {
      // If no override, just copy the original header.
      newHeaders.push(newHeader);
    }
  });

  return {
    requestHeaders: newHeaders // Return the modified headers.
  };
}


function isEnabled(  tab_id  ) {
  // Check if the extension is active for the given tab and not whitelisted.
  var data = tabData.get(tab_id);
  return data.injected && !whitelist.whitelisted(data.hostname);
}


function updateBadge(  tab_id  ) {
  var data = tabData.get(tab_id);
  var count = 0; // Initialize counter for fingerprinters.

  if (data) {
    // No need for hasOwnProperty loop checks in this specific context,
    // as `domains` is expected to be an object from `tabData`.
    for (var domain in data.domains) { // jshint ignore:line
      var scripts = data.domains[domain].scripts; // Get scripts for the current domain.

      for (var url in scripts) {
        // If a script is identified as a fingerprinter, increment count and break.
        if (score(scripts[url]).fingerprinter) {
          count++;
          break; // Only count one fingerprinter per domain for badge.
        }
      }
    }
  }

  if (count) {
    // TODO: Handle "Unchecked runtime.lastError while running browserAction.setBadgeText: No tab with id: XXX."
    chrome.browserAction.setBadgeText({
      tabId: tab_id,
      text: count.toString() // Display the count on the badge.
    });
  }
}


function updateButton(  tab_id  ) {

  // Inner helper function to set the button icon based on enabled status.
  function _updateButton(  tab_id  ) {
    var enabled = isEnabled(tab_id);

    // TODO: Handle "Unchecked runtime.lastError while running browserAction.setIcon: No tab with id: XXX."
    chrome.browserAction.setIcon({
      path: {
        19: 'icons/19' + (enabled ? '' : '_off') + '.png', // Icon for 19x19 pixels.
        38: 'icons/38' + (enabled ? '' : '_off') + '.png' // Icon for 38x38 pixels.
      },
      tabId: tab_id
    });
  }

  // If a tab_id is provided, defer the update.
  if (tab_id) {
    _.defer(_updateButton, tab_id);
  } else {
    // If no tab_id, get the current active tab and then update.
    getCurrentTab(function (tab) {
      _updateButton(tab.id);
    });
  }
}


function getCurrentTab(  callback  ) {
  // Queries for the currently active tab in the last focused window.
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function (tabs) {
    callback(tabs[0]); // Pass the first (and only) active tab to the callback.
  });
}


function getPanelData(  tab  ) {
  // Extends tab data with additional properties for the panel.
  return _.extend(tabData.get(tab.id) || {}, {
    invalid_page: (
      tab.url.indexOf('http') !== 0 || // Check if URL starts with 'http'.
      tab.url.indexOf('https://chrome.google.com/webstore/') === 0 // Check for Chrome Web Store URL.
    ),
    whitelisted: whitelist.whitelisted(tab.id) // Check if the tab's domain is whitelisted.
  });
}


function onMessage(  request, sender, sendResponse  ) {
  var response = {}; // Initialize an empty response object.

  if (request.name == 'trapped') {
    // If the request is for trapped scripts.
    if (_.isArray(request.message)) {
      request.message.forEach(function (msg) {
        tabData.record(sender.tab.id, msg); // Record each message if it's an array.
      });
    } else {
      tabData.record(sender.tab.id, request.message); // Record a single message.
    }

    updateBadge(sender.tab.id); // Update the badge for the sender's tab.

    // Message the popup to rerender with the latest data.
    getCurrentTab(function (tab) {
      // But only if this message is for the currently active tab.
      if (tab.id == sender.tab.id) {
        sendMessage('panelData', getPanelData(tab));
      }
    });

  } else if (request.name == 'panelLoaded') {
    // If the panel has loaded and is requesting data.
    getCurrentTab(function (tab) {
      sendResponse(getPanelData(tab)); // Send panel data as response.
    });

    // We will send the response asynchronously, so return true.
    return true;

  } else if (request.name == 'panelToggle') {
    // If the panel requests to toggle the whitelist status.
    whitelist.toggle(request.message.hostname);
    updateButton(); // Update the browser action button.
  }

  sendResponse(response); // Send the response (synchronously for non-panelLoaded requests).
}


function onNavigation(  details  ) {
  var tab_id = details.tabId; // Get the tab ID from navigation details.

  // Only process top-level page navigations.
  if (details.frameId !== 0 || tab_id < 1) {
    return;
  }

  tabData.init(tab_id, details.url); // Initialize tab data for the new navigation.
  updateButton(tab_id); // Update the button icon.
  updateBadge(tab_id); // Update the badge text.
}


//  Extension initialization and event listeners setup.

// TODO: Track all scripts (including ones loaded via XHR).
/*
chrome.webRequest.onResponseStarted.addListener(
  function (details) { console.log(details); },
  _.extend(ALL_URLS, { types: ['script', 'xmlhttprequest'] }),
  ['responseHeaders']
);
*/

// TODO: Filter out known fingerprinters.
/*
chrome.webRequest.onBeforeRequest.addListener(
  filterRequests,
  ALL_URLS,
  ["blocking"]
);
*/

// TODO: Investigate "Tor Browser rejects web fonts? "downloadable font: download not allowed (font-family: "Open Sans" style:normal weight:normal stretch:normal src index:1): status=2147500037"".

// Abort injecting the content script when Chameleon is disabled or whitelisted.
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    var tab_id = details.tabId; // Retrieve the tab ID.

    if (whitelist.whitelisted(tab_id)) {
      // If whitelisted, redirect to a blank script to prevent injection.
      // We redirect instead of cancelling because cancelling can cause pages to hang.
      // TODO: Gmail: Refused to load the script 'data:text/javascript,' because it violates the following Content Security Policy directive: "script-src 'unsafe-inline' 'unsafe-eval' 'self'".
      return {
        redirectUrl: 'data:text/javascript,'
      };

    } else {
      // If not whitelisted, mark as injected and update the button.
      tabData.get(tab_id).injected = true;
      updateButton(tab_id);
    }
  },
  {
    urls: [
      'chrome-extension://' + chrome.runtime.id + '/js/builds/injected.min.js'
    ]
  },
  ["blocking"] // Use blocking to allow synchronous modification of the request.
);


// Listener for modifying outgoing request headers.
chrome.webRequest.onBeforeSendHeaders.addListener(
  normalizeHeaders, // Function to call for header normalization.
  ALL_URLS, // Apply to all configured URLs.
  ["blocking", "requestHeaders"] // Blocking allows modification, requestHeaders provides headers.
);


// TODO: Set plugins to "ask by default" for enhanced privacy.


// Listen for messages from content scripts, popups, etc.
chrome.runtime.onMessage.addListener(onMessage);


// Clear tab data when a tab is closed.
chrome.tabs.onRemoved.addListener(tabData.clear);


// Listen for committed navigations to initialize tab data.
chrome.webNavigation.onCommitted.addListener(onNavigation);


// Periodically clean up orphan tab data (every five minutes).
// TODO: Consider switching to chrome.alarms for more robust scheduling.
setInterval(tabData.clean, 300000); // 300000 milliseconds = 5 minutes.