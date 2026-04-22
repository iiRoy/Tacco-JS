//
// PageNavigator
//
// A utility for managing client-side page navigation without full reloads.
// Mimics browser history behavior using AJAX and HTML5 History API.
//
// Author: Michele Salvini (original concept)
// Adapted by: AI Assistant (Type III clone)
//
// Dependencies: jQuery (or a compatible DOM manipulation library)

function PageNavigator(options, domLib) {
  // Initial check for History API support. If not available,
  // the instance might not function as expected for pushState/popstate.
  if (!this.checkHistoryAPI()) {
    console.warn("History API not supported. PageNavigator functionality will be limited.");
    return this;
  }

  const instance = this;
  const config = options || {};

  // Ensure a DOM library is provided or globally available.
  instance.$ = domLib || window.jQuery || window.$;
  if (!instance.$ || typeof instance.$.ajax !== 'function') {
    throw new Error("PageNavigator requires a DOM library with AJAX capabilities (e.g., jQuery).");
  }

  instance.navigationEnabled = true;
  instance.settings = {};
  instance.eventCallbacks = {};
  instance.pageCache = {};

  // Define the list of events that can be hooked into.
  const definedEventTypes = [
    "beforeNavigation",
    "contentRequestInitiated",
    "contentReadyForDisplay",
    "contentIntegrationComplete",
    "navigationFinalized",
    "navigationErrorOccurred"
  ];

  // Initialize event callbacks from provided options.
  definedEventTypes.forEach(function (eventType) {
    instance.eventCallbacks[eventType] = (typeof config[eventType] !== "function") ? function () { /* no-op */ } : config[eventType];
  });

  // Default settings, can be overridden by options.
  const defaultSettings = {
    rootDomain: window.location.host
  };

  Object.keys(defaultSettings).forEach(function (settingKey) {
    if (config[settingKey] !== undefined) {
      instance.settings[settingKey] = config[settingKey];
    } else {
      instance.settings[settingKey] = defaultSettings[settingKey];
    }
  });

  // Set the initial URL in the settings.
  instance.updateSetting('currentUrl', window.location.href);

  // Configure browser history popstate event listener.
  window.onpopstate = function (popStateEvent) {
    if (popStateEvent && popStateEvent.state && popStateEvent.state.url) {
      instance.handleUrlChange(popStateEvent.state.url, true, popStateEvent.state.auxiliaryData);
    }
  };

  // Store the initial page state in browser history.
  window.history.pushState({ url: window.location.href, auxiliaryData: {} }, '', window.location.href);

  return this;
}

//
// Core Utility Methods

PageNavigator.prototype.checkHistoryAPI = function () {
  return (typeof window.history !== "undefined" && typeof window.history.pushState === "function");
};

PageNavigator.prototype.retrieveCachedPage = function (pageUrl) {
  if (this.pageCache.hasOwnProperty(pageUrl)) {
    return this.pageCache[pageUrl];
  }
  return null; // Use null instead of false for "not found"
};

PageNavigator.prototype.storePageInCache = function (pageUrl, pageData) {
  this.pageCache[pageUrl] = pageData;
  return this;
};

//
// Event Handling & Navigation Flow

PageNavigator.prototype.navigationFinalized = function (navContext) {
  const instance = this;
  instance.navigationEnabled = true;
  instance.eventCallbacks.navigationFinalized(navContext);
};

PageNavigator.prototype.contentIntegrationComplete = function (navContext) {
  const instance = this;
  let executionDelay = instance.eventCallbacks.contentIntegrationComplete(navContext);
  if (typeof executionDelay !== "number" || executionDelay < 0) {
    executionDelay = 0;
  }

  setTimeout(function () {
    instance.navigationFinalized(navContext);
  }, executionDelay);
};

PageNavigator.prototype.navigationErrorOccurred = function (navContext) {
  this.navigationEnabled = true;
  this.eventCallbacks.navigationErrorOccurred(navContext); // Explicitly call the hook even if it's a no-op
};

PageNavigator.prototype.loadTargetPageContent = function (navContext) {
  const instance = this;
  let preLoadDelay = instance.eventCallbacks.contentRequestInitiated(navContext);
  if (typeof preLoadDelay !== "number" || preLoadDelay < 0) {
    preLoadDelay = 0;
  }

  setTimeout(function () {
    if (navContext.fromCache) {
      let readyDelay = instance.eventCallbacks.contentReadyForDisplay(navContext);
      if (typeof readyDelay !== "number" || readyDelay < 0) {
        readyDelay = 0;
      }

      setTimeout(function () {
        instance.contentIntegrationComplete(navContext);
      }, readyDelay);
    } else {
      instance.$.ajax({
        url: navContext.destinationUrl,
        method: 'GET',
        dataType: 'text',
        error: function (xhr, status, error) {
          console.error("AJAX navigation error:", status, error, xhr);
          navContext.errorMessage = error;
          let errorDelay = instance.eventCallbacks.navigationErrorOccurred(navContext);
          if (typeof errorDelay !== "number" || errorDelay < 0) {
            errorDelay = 0;
          }

          setTimeout(function () {
            instance.navigationErrorOccurred(navContext);
          }, errorDelay);
        },
        success: function (receivedContent) {
          const customContentRegex = /<!--PN_START-->((.|[\n\r])*)<!--PN_END-->/im;
          const fullBodyRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
          const bodyClassRegex = /<body[^>]*class="([^"]*)"/im;
          const titleRegex = /<title[^>]*>((.|[\n\r])*)<\/title>/im;

          let extractedContent = '';
          let pageTitle = '';
          let bodyClasses = '';

          const customMatch = customContentRegex.exec(receivedContent);
          if (customMatch && customMatch[1]) {
            extractedContent = customMatch[1];
          } else {
            const bodyMatch = fullBodyRegex.exec(receivedContent);
            if (bodyMatch && bodyMatch[1]) {
              extractedContent = bodyMatch[1];
            }
          }

          const bodyClassMatch = bodyClassRegex.exec(receivedContent);
          if (bodyClassMatch && bodyClassMatch[1]) {
            bodyClasses = bodyClassMatch[1];
          }

          const titleMatch = titleRegex.exec(receivedContent);
          if (titleMatch && titleMatch[1]) {
            pageTitle = titleMatch[1].trim();
          }

          navContext.previousTitle = document.title;
          navContext.newTitle = pageTitle;
          navContext.pageData = extractedContent;
          navContext.targetBodyClasses = bodyClasses;

          instance.storePageInCache(navContext.destinationUrl, {
            content: extractedContent,
            pageTitle: pageTitle,
            bodyClasses: bodyClasses
          });

          let readyDelay = instance.eventCallbacks.contentReadyForDisplay(navContext);
          if (typeof readyDelay !== "number" || readyDelay < 0) {
            readyDelay = 0;
          }

          setTimeout(function () {
            instance.contentIntegrationComplete(navContext);
          }, readyDelay);
        }
      });
    }
  }, preLoadDelay);
};

PageNavigator.prototype.handleUrlChange = function (targetUrl, isBrowserHistoryEvent, auxiliaryData) {
  // If History API is not supported, fall back to full page reload.
  if (!this.checkHistoryAPI()) {
    window.location.href = targetUrl;
    return;
  }

  const instance = this;
  if (!instance.navigationEnabled) {
    return; // Prevent multiple simultaneous navigations.
  }

  const currentDomain = instance.getSetting('rootDomain');
  // Check if the target URL is for the same domain to prevent external navigations.
  const domainRegex = new RegExp(`^(https?://)?${currentDomain.replace(/\./g, '\\.')}(/|$)`, 'i');
  if (!domainRegex.test(targetUrl)) {
    window.location.href = targetUrl;
    return;
  }

  const currentActiveUrl = instance.getSetting('currentUrl');
  if (currentActiveUrl !== targetUrl) {
    instance.navigationEnabled = false; // Disable navigation until current one completes.

    const navigationContext = {
      sourceUrl: currentActiveUrl,
      destinationUrl: targetUrl,
      statePayload: auxiliaryData || {}
    };

    let initialDelay = instance.eventCallbacks.beforeNavigation(navigationContext);
    if (initialDelay === false) {
      instance.navigationEnabled = true; // Re-enable if hook explicitly cancels navigation.
      return;
    }
    if (typeof initialDelay !== "number" || initialDelay < 0) {
      initialDelay = 0;
    }

    setTimeout(function () {
      instance.updateSetting('currentUrl', targetUrl);

      // Update browser history only if not triggered by a popstate event.
      if (!isBrowserHistoryEvent) {
        window.history.pushState({ url: targetUrl, auxiliaryData: auxiliaryData || {} }, '', targetUrl);
      }

      navigationContext.fromCache = false;
      const cachedPage = instance.retrieveCachedPage(navigationContext.destinationUrl);

      if (cachedPage) {
        navigationContext.fromCache = true;
        navigationContext.pageData = cachedPage.content;
        navigationContext.newTitle = cachedPage.pageTitle;
        navigationContext.targetBodyClasses = cachedPage.bodyClasses;
      }

      instance.loadTargetPageContent(navigationContext);
    }, initialDelay);
  }
};

PageNavigator.prototype.createLinkClickHandler = function (pageNavInstance, customPayload) {
  // If the navigation instance doesn't support history API, return a dummy handler.
  if (!pageNavInstance.checkHistoryAPI()) {
    return function (event) {
      // Allow default link behavior if API not supported.
    };
  }

  return function (event) {
    // Prevent default link behavior if event is provided and supports it.
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const targetLinkElement = this; // 'this' refers to the clicked anchor element.
    const destinationHref = targetLinkElement.href;

    pageNavInstance.handleUrlChange(destinationHref, false, customPayload);
  };
};

//
// Settings Management

PageNavigator.prototype.getSetting = function (settingKey) {
  if (this.settings.hasOwnProperty(settingKey)) {
    return this.settings[settingKey];
  }
  return null;
};

PageNavigator.prototype.updateSetting = function (settingKey, value) {
  const instance = this;
  let settingsToUpdate = {};

  if (typeof settingKey === "string") {
    settingsToUpdate[settingKey] = value;
  } else if (typeof settingKey === "object" && settingKey !== null) {
    settingsToUpdate = settingKey;
  } else {
    // Invalid input for updateSetting, perhaps log a warning or throw an error.
    console.warn("Invalid input for updateSetting. Expected string or object.");
    return instance;
  }

  Object.keys(settingsToUpdate).forEach(function (key) {
    const newValue = settingsToUpdate[key];
    if (typeof newValue === "function") {
      // If the new value is a function, call it with the current setting value.
      instance.settings[key] = newValue(instance.settings[key]);
    } else if (newValue !== undefined) {
      // Otherwise, directly assign the new value.
      instance.settings[key] = newValue;
    }
  });

  return instance;
};