/*
*   License information for this utility.
*
*   Copyright (c) 2009 - 2015, Evan Jehu
*   All rights reserved.
*
*   Redistribution and use in source and binary forms, with or without
*   modification, are permitted provided that the following conditions are met:
*       * Redistributions of source code must retain the above copyright
*         notice, this list of conditions and the following disclaimer.
*       * Redistributions in binary form must reproduce the above copyright
*         notice, this list of conditions and the following disclaimer in the
*         documentation and/or other materials provided with the distribution.
*       * Neither the name of the author nor the
*         names of its contributors may be used to endorse or promote products
*         derived from this software without specific prior written permission.
*
*   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
*   ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
*   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
*   DISCLAIMED. IN NO EVENT SHALL EVAN JEHU BE LIABLE FOR ANY
*   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
*   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
*   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
*   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
*   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
*   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var openPages = [];
var recentlyClosedPages = [];
var savedLinks = [];

var loggingEnabled = retrieveLoggingStatus();

var webUrlPattern = /^https?:\/\/.*/;
function isOnlineResource(resourceIdentifier) {
  return webUrlPattern.exec(resourceIdentifier);
}

/**
 * Basic logging utility to centralize output for all components,
 * invoked from another module (e.g., UI.js) via appBackground.outputMessage(...)
 */
function outputMessage() {
  if (loggingEnabled) {
    console.log.apply(console, Array.prototype.slice.call(arguments));
  }
}

function KeyboardCombo(settings) {
  this.controlKey = settings.controlKey || false;
  this.shiftKey = settings.shiftKey || false;
  this.altKey = settings.altKey || false;
  this.metaKey = settings.metaKey || false;
  this.mainKey = settings.mainKey || '';
}
KeyboardCombo.prototype.getLayout = function() {
  return (this.altKey ? "alt_" : "") +
         (this.metaKey ? "command_" : "") +
         (this.controlKey ? "ctrl_" : "") +
         (this.shiftKey ? "shift_" : "") +
         (this.mainKey);
};

function retrieveLoggingStatus() {
  var settingValue = localStorage["debug_?"];
  return settingValue ? settingValue == 'true' : false;
}

/**
 * Adjusts the logging flag. This function can be called from the background page's
 * JavaScript console to toggle logging. The preference is stored in local storage.
 * To enable logging temporarily, type 'loggingEnabled = true' in the console.
 */
function updateLoggingStatus(newValue) {
  loggingEnabled = newValue;
  localStorage["debug_?"] = newValue;
}

function getRecentPageCapacity() {
  var settingValue = localStorage["closed_tabs_size"];
  return settingValue ? parseInt(settingValue, 10) || 0 : 10;
}

function setRecentPageCapacity(newValue) {
  localStorage["closed_tabs_size"] = newValue;
  adjustRecentPageList();
}

function getNavigationLook() {
  return localStorage["next_prev_style"];
}

function setNavigationLook(newValue) {
  localStorage["next_prev_style"] = newValue;
}

function getScrollJumpAmount() {
  return localStorage["pageup_pagedown_skip_size"] || 5;
}

function setScrollJumpAmount(newValue) {
  localStorage["pageup_pagedown_skip_size"] = newValue;
}

function displayDeveloperTools() {
  var settingValue = localStorage["include_dev_tools"];
  return settingValue ? settingValue == 'true' : false;
}

function setDisplayDeveloperTools(newValue) {
  localStorage["include_dev_tools"] = newValue;
}

function displayResourceLocators() {
  var settingValue = localStorage["show_urls"];
  return settingValue ? settingValue == 'true' : true;
}

function setDisplayResourceLocators(newValue) {
  localStorage["show_urls"] = newValue;
}

function searchResourceLocators() {
  var settingValue = localStorage["search_urls"];
  return settingValue ? settingValue == 'true' : false;
}

function setSearchResourceLocators(newValue) {
  localStorage["search_urls"] = newValue;
}

function displayPageCounter() {
  var settingValue = localStorage["show_tab_count"];
  return settingValue ? settingValue == 'true' : true;
}

function setDisplayPageCounter(newValue) {
  localStorage["show_tab_count"] = newValue;
  refreshBadgeIndicator(openPages.length);
}

function displayHoverHints() {
  var settingValue = localStorage["show_tooltips"];
  return settingValue ? settingValue == 'true' : true;
}

function setDisplayHoverHints(newValue) {
  localStorage["show_tooltips"] = newValue;
}

function displaySiteIcons() {
  var settingValue = localStorage["show_favicons"];
  return settingValue ? settingValue == 'true' : true;
}

function setDisplaySiteIcons(newValue) {
  localStorage["show_favicons"] = newValue;
}

function getSearchProviderUrl() {
  return localStorage["search_string"] || 'http://www.google.com/search?q=%s';
}

function setSearchProviderUrl(newValue) {
  localStorage["search_string"] = newValue;
}

function getCustomStyling() {
  return localStorage["custom_css"] || '';
}

function setCustomStyling(newValue) {
  localStorage["custom_css"] = newValue;
}

function getActivationBinding() {
  return retrieveKeyBinding("key_popup", "");
}
function clearLegacyActivationBinding() {
  localStorage["key_popup"] = null;
}

function isPageRelevant(currentPage) {
  return !(!displayDeveloperTools() && /chrome-devtools:\/\//.exec(currentPage.url));
}

function retrieveKeyBinding(storageKey, defaultVal) {
  var combo = null;
  if (localStorage[storageKey]) {
    combo = new KeyboardCombo(JSON.parse(localStorage[storageKey]));
  } else {
    combo = new KeyboardCombo(defaultVal);
  }
  return combo;
}

function storeKeyBinding(storageLabel, combo) {
  localStorage[storageLabel] = JSON.stringify(combo);
}

function getClosePageBinding() {
  return retrieveKeyBinding("close_tab_popup", {controlKey:true, mainKey:"d"});
}

function setClosePageBinding(combo) {
  return storeKeyBinding("close_tab_popup", combo);
}

function getCloseAllPagesBinding() {
  return retrieveKeyBinding("close_all_tabs_popup", {controlKey:true, shiftKey:true, mainKey:"d"});
}

function setCloseAllPagesBinding(combo) {
  return storeKeyBinding("close_all_tabs_popup", combo);
}

function adjustRecentPageList() {
  recentlyClosedPages.splice(getRecentPageCapacity());
}

function addRecentlyClosedPage(currentPage) {
  if (isOnlineResource(currentPage.url)) {
    // outputMessage("adding page " + currentPage.id + " to recentlyClosedPages array " + currentPage.url);
    recentlyClosedPages.unshift({url:currentPage.url, title:currentPage.title, favIconUrl:currentPage.favIconUrl});
  }
  adjustRecentPageList();
}

/**
 * Searches the global array of open pages for an entry with the given pageId
 * and returns its zero-based index, or -1 if not found.
 *
 * @param pageId The identifier of the page to search for.
 * @returns The index of the page, or -1.
 */
function findPageIndexById(pageId) {
  for (var idx = 0; idx < openPages.length; idx++) {
    if (pageId === openPages[idx].id) {
      return idx;
    }
  }
  return -1;
}

function findPageIndexByUrl(pageCollection, resourceIdentifier) {
  for (var idx = 0; idx < pageCollection.length; idx++) {
    if (resourceIdentifier === pageCollection[idx].url) {
      return idx;
    }
  }
  return -1;
}

function initializeBadgeDisplay() {
  // Sets the background color for the extension's badge icon
  chrome.browserAction.setBadgeBackgroundColor({color:[32, 7, 114, 255]});
  refreshBadgeIndicator(0);
}

/**
 * Updates the numerical indicator shown on the extension's badge/icon,
 * reflecting the count of currently open pages.
 *
 * @param indicatorValue The new numerical value for the badge.
 */
function refreshBadgeIndicator(indicatorValue) {
  if (displayPageCounter()) {
    chrome.browserAction.setBadgeText({text: indicatorValue + ""});
  } else {
    chrome.browserAction.setBadgeText({text: ""});
  }
}

/**
 * Moves the page identified by pageId to the beginning of the global list of open pages.
 *
 * @param pageId The identifier of the page to reorder.
 */
function reorderPageList(pageId) {
  var foundIndex = findPageIndexById(pageId);
  // outputMessage('reordering page for', pageId, 'index', foundIndex);
  if (foundIndex >= 0) {
    var movedPage = openPages[foundIndex];
    openPages.splice(foundIndex, 1);
    openPages.unshift(movedPage);
  }
}

function reorderPagesList(pageCollection) {
  for (var counter = pageCollection.length - 1; counter >= 0; counter--) {
    reorderPageList(pageCollection[counter].id);
  }
}

function registerPage(currentPage) {
  if (isPageRelevant(currentPage)) {
    outputMessage('registering page', currentPage.id);
    openPages.push(currentPage);
  }
}

function handleRemovedPages(pageIdentifiers, completionHandler) {
  for (var counter = 0; counter < pageIdentifiers.length; counter++) {
    var pageId = pageIdentifiers[counter];
    var foundIndex = findPageIndexById(pageId);
    if (foundIndex >= 0) {
      var removedPage = openPages[foundIndex];
      addRecentlyClosedPage(removedPage);
      openPages.splice(foundIndex, 1);
      refreshBadgeIndicator(openPages.length);
    } else {
      outputMessage("handleRemovedPages, unable to remove page", pageId, ", page not found in open page list ", openPages);
    }
  }
  if (completionHandler) {
    completionHandler();
  }
}

function activatePage(targetPageId, completionHandler) {
  chrome.tabs.get(targetPageId, function(currentPage) {
    chrome.windows.update(currentPage.windowId, {focused:true}, function() {
      chrome.tabs.update(currentPage.id, {selected:true});
      if (completionHandler) {
        completionHandler();
      }
    });
  });
}

function walkBookmarkTree(nodeElement, collectedBookmarks) {
  if (nodeElement.url != null) {
    collectedBookmarks.push(nodeElement);
    return collectedBookmarks;
  }

  if (nodeElement.children == null) {
    return;
  }

  for (var idx = 0; idx < nodeElement.children.length; idx++) {
    var childElement = nodeElement.children[idx];
    walkBookmarkTree(childElement, collectedBookmarks);
  }

  return collectedBookmarks;
}

function getAllBookmarks(completionHandler) {
  chrome.bookmarks.getTree(function(bookmarkTree) {
    savedLinks = walkBookmarkTree(bookmarkTree[0], []);
    completionHandler(savedLinks);
  });
}

function configureBookmarks() {
  getAllBookmarks(function(bookmarkResults) {
    savedLinks = bookmarkResults;
  });
}

function startupApplication() {
  // Resets the application's internal state containers
  openPages = [];
  recentlyClosedPages = [];
  savedLinks = [];

  // Initializes the visual badge icon
  initializeBadgeDisplay();

  // Enumerates and records all currently open pages across all browser windows
  chrome.windows.getAll({populate:true}, function(browserWindows) {
    for (var idx = 0; idx < browserWindows.length; idx++) {
      var windowPages = browserWindows[idx].tabs;

      for (var counter = 0; counter < windowPages.length; counter++) {
        registerPage(windowPages[counter]);
      }

      refreshBadgeIndicator(openPages.length);
    }

    // Ensures the currently active page is at the top of the internal list
    chrome.tabs.query({currentWindow:true, active:true}, function(pageCollection) {
      outputMessage('initial selected page', pageCollection);
      reorderPagesList(pageCollection);
    });
  });

  // Attaches a listener to capture pages as they are closed
  chrome.tabs.onRemoved.addListener(function(pageId) {
    handleRemovedPages([pageId], null);
  });

  // Attaches a listener to capture pages as they are newly created
  chrome.tabs.onCreated.addListener(function(currentPage) {
    if (!isPageRelevant(currentPage)) {
      return;
    }
    // outputMessage('created page', currentPage, 'selected page is ', activePage);

    // If the newly created page matches a recently closed one, remove it from that list
    var foundIndex = findPageIndexByUrl(recentlyClosedPages, currentPage.url);
    if (foundIndex >= 0) {
      recentlyClosedPages.splice(foundIndex, 1);
    }

    var newListLength = openPages.unshift(currentPage);
    refreshBadgeIndicator(newListLength);
    reorderPageList(currentPage.id);
  });

  chrome.tabs.onUpdated.addListener(function(pageId, updateDetails, currentPage) {
    // outputMessage('onPageUpdated page', currentPage.id, pageId);
    openPages[findPageIndexById(pageId)] = currentPage;
  });

  chrome.tabs.onActivated.addListener(function(activationInfo) {
    // outputMessage('onPageActivated page', activationInfo.tabId);
    reorderPageList(activationInfo.tabId);
  });

  chrome.windows.onFocusChanged.addListener(function(browserWindowId) {
    if (browserWindowId != chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({windowId:browserWindowId, active:true}, function(pageCollection) {
        // outputMessage('onFocusAltered page', pageCollection);
        reorderPagesList(pageCollection);
      });
    }
  });

  chrome.bookmarks.onCreated.addListener(function() {configureBookmarks();});
  chrome.bookmarks.onRemoved.addListener(function() {configureBookmarks();});
  chrome.bookmarks.onChanged.addListener(function() {configureBookmarks();});
  chrome.bookmarks.onMoved.addListener(function() {configureBookmarks();});

  configureBookmarks();
}

startupApplication();