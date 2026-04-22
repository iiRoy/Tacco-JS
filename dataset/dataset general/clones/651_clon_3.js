(function(mainModuleFactory){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=mainModuleFactory()}else if(typeof define==="function"&&define.amd){define([],mainModuleFactory)}else{var globalScope;if(typeof window!=="undefined"){globalScope=window}else if(typeof global!=="undefined"){globalScope=global}else if(typeof self!=="undefined"){globalScope=self}else{globalScope=this}globalScope.ShareButton = mainModuleFactory()}})(function(){var moduleDefinition, currentModule, exportedValues; // Renamed define, module, exports for clarity
function generateComponentStyles(styleConfiguration){
    // This function builds the CSS string for the sharing component based on provided options.
    // It targets specific elements using the component's unique selector.
    const targetSelector = styleConfiguration.elementIdentifier;
    let cssOutput = '';

    // Common transform origin for social icons
    cssOutput += `${targetSelector} .social-panel.bottom, ${targetSelector} .social-panel.top {
        -webkit-transform-origin: 0 0;
        -moz-transform-origin: 0 0;
        -o-transform-origin: 0 0;
        transform-origin: 0 0; /* Standard property */
    }`;

    // Main component wrapper styling
    cssOutput += `${targetSelector} {
        width: 92px;
        height: 20px;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }`;

    // Font icon styling (using Entypo font)
    cssOutput += `${targetSelector} [class*="icon-"]:before {
        font-family: entypo, sans-serif;
    }`;

    // Label (button) styling
    cssOutput += `${targetSelector} label.share-trigger {
        font-size: 16px;
        cursor: pointer;
        margin: 0;
        padding: 5px 10px;
        border-radius: 5px;
        background: #a29baa;
        color: #333;
        transition: all .3s ease;
    }`;
    cssOutput += `${targetSelector} label.share-trigger:hover {
        opacity: .8;
    }`;
    cssOutput += `${targetSelector} label.share-trigger span {
        text-transform: uppercase;
        font-size: .9em;
        font-family: Lato, sans-serif;
        font-weight: 700;
        -webkit-font-smoothing: antialiased;
        padding-left: 6px;
    }`;

    // Social panel initial state
    cssOutput += `${targetSelector} .social-panel {
        opacity: 0;
        transition: all .4s ease;
        margin-left: -15px;
        visibility: hidden;
    }`;

    // Specific panel positions
    cssOutput += `${targetSelector} .social-panel.top {
        margin-top: -80px;
    }`;
    cssOutput += `${targetSelector} .social-panel.bottom {
        margin-top: 5px;
    }`;
    cssOutput += `${targetSelector} .social-panel.middle.left, ${targetSelector} .social-panel.middle.right {
        -ms-transform-origin: 5% 50%;
        transform-origin: 5% 50%;
        -webkit-transform-origin: 5% 50%;
        -moz-transform-origin: 5% 50%;
        -o-transform-origin: 5% 50%;
    }`;
    cssOutput += `${targetSelector} .social-panel.middle {
        margin-top: -34px;
    }`;
    cssOutput += `${targetSelector} .social-panel.middle.right {
        margin-left: 105px;
    }`;
    cssOutput += `${targetSelector} .social-panel.count-1.center, ${targetSelector} .social-panel.count-1.left, ${targetSelector} .social-panel.right {
        margin-left: 14px;
    }`;
    cssOutput += `${targetSelector} .social-panel.loading {
        transition: none !important;
    }`;

    // Network count specific widths
    const networkWidths = {
        '1': '60px',
        '2': '120px',
        '3': '180px',
        '4': '240px',
        '5': '300px'
    };
    const networkMargins = {
        '1': { center: '14px', left: '14px', middleLeft: '-70px' },
        '2': { center: '-13px', left: '-44px', middleLeft: '-130px' },
        '3': { center: '-45px', left: '-102px', middleLeft: '-190px' },
        '4': { center: '-75px', left: '162px', middleLeft: '-250px' },
        '5': { center: '-105px', left: '-225px', middleLeft: '-320px' }
    };

    for (let count = 1; count <= 5; count++) {
        const width = networkWidths[count];
        cssOutput += `${targetSelector} .social-panel.count-${count}, ${targetSelector} .social-panel.count-${count} ul { width: ${width}; }`;
        if (networkMargins[count]) {
            Object.keys(networkMargins[count]).forEach(position => {
                const margin = networkMargins[count][position];
                cssOutput += `${targetSelector} .social-panel.count-${count}.${position} { margin-left: ${margin}; }`;
            });
        }
    }

    // Active state for social panel
    cssOutput += `${targetSelector} .social-panel.active {
        opacity: 1;
        transition: all .4s ease;
        visibility: visible;
    }`;

    // Active state transforms
    cssOutput += `${targetSelector} .social-panel.active.top {
        -webkit-transform: scale(1) translateY(-10px);
        -moz-transform: scale(1) translateY(-10px);
        -o-transform: scale(1) translateY(-10px);
        -ms-transform: scale(1) translateY(-10px);
        transform: scale(1) translateY(-10px);
    }`;
    cssOutput += `${targetSelector} .social-panel.active.bottom {
        -webkit-transform: scale(1) translateY(15px);
        -moz-transform: scale(1) translateY(15px);
        -o-transform: scale(1) translateY(15px);
        -ms-transform: scale(1) translateY(15px);
        transform: scale(1) translateY(15px);
    }`;
    cssOutput += `${targetSelector} .social-panel.active.middle.right {
        -webkit-transform: scale(1) translateX(10px);
        -moz-transform: scale(1) translateX(10px);
        -o-transform: scale(1) translateX(10px);
        -ms-transform: scale(1) translateX(10px);
        transform: scale(1) translateX(10px);
    }`;
    cssOutput += `${targetSelector} .social-panel.active.middle.left {
        -webkit-transform: scale(1) translateX(-10px);
        -moz-transform: scale(1) translateX(-10px);
        -o-transform: scale(1) translateX(-10px);
        -ms-transform: scale(1) translateX(-10px);
        transform: scale(1) translateX(-10px);
    }`;

    // List styling for network icons
    cssOutput += `${targetSelector} .social-panel ul {
        position: relative;
        left: 0;
        right: 0;
        height: 46px;
        color: #fff;
        margin: auto;
        padding: 0;
        list-style: none;
    }`;
    cssOutput += `${targetSelector} .social-panel ul li {
        font-size: 20px;
        cursor: pointer;
        width: 60px;
        margin: 0;
        padding: 12px 0;
        text-align: center;
        float: left;
        display: none; /* Hidden by default, overridden by network specific display */
        height: 22px;
        position: relative;
        z-index: 2;
        -webkit-box-sizing: content-box;
        -moz-box-sizing: content-box;
        box-sizing: content-box;
        transition: all .3s ease;
    }`;
    cssOutput += `${targetSelector} .social-panel ul li:hover {
        color: rgba(0,0,0,.5);
    }`;

    // Network specific background colors and display states
    const networkColors = {
        'facebook': '#3b5998',
        'twitter': '#6cdfea',
        'google_plus': '#e34429',
        'pinterest': '#c5282f',
        'email': '#42c5b0'
    };

    Object.keys(networkColors).forEach(networkKey => {
        const networkDisplay = styleConfiguration.networkDisplayStatus[networkKey] || 'none'; // Use explicit config
        cssOutput += `${targetSelector} .social-panel li[data-network="${networkKey}"] {
            background: ${networkColors[networkKey]};
            display: ${networkDisplay};
        }`;
    });

    return cssOutput;
}

// Polyfill for classList if not supported by the browser
if ((!("classList" in document.documentElement)) && Object.defineProperty && typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "classList", {
    get: function() {
      const currentElement = this;
      const classListUpdater = function(actionFunction) {
        return function(classValue) {
          let currentClasses = currentElement.className.split(/\s+/).filter(Boolean); // Filter out empty strings
          const classIndex = currentClasses.indexOf(classValue);
          actionFunction(currentClasses, classIndex, classValue);
          currentElement.className = currentClasses.join(" ");
        };
      };

      const classListAPI = {
        add: classListUpdater(function(classesArray, idx, val) {
          if (idx === -1) classesArray.push(val);
        }),
        remove: classListUpdater(function(classesArray, idx) {
          if (idx !== -1) classesArray.splice(idx, 1);
        }),
        toggle: classListUpdater(function(classesArray, idx, val) {
          if (idx !== -1) {
            classesArray.splice(idx, 1);
          } else {
            classesArray.push(val);
          }
        }),
        contains: function(classValue) {
          return currentElement.className.split(/\s+/).filter(Boolean).includes(classValue);
        },
        item: function(position) {
          return currentElement.className.split(/\s+/).filter(Boolean)[position] || null;
        }
      };

      Object.defineProperty(classListAPI, "length", {
        get: function() {
          return currentElement.className.split(/\s+/).filter(Boolean).length;
        }
      });
      return classListAPI;
    }
  });
}

// Custom String prototype method for RFC3986 encoding
String.prototype.toUriComponentSafe = function() {
  const rawString = this.toString();
  if (!rawString) return ''; // Guard clause for empty/null strings
  const uriEncoded = encodeURIComponent(rawString);
  // Specific replacements for characters not encoded by encodeURIComponent but reserved in RFC3986
  return uriEncoded.replace(/[!'()*]/g, function(charToReplace) {
    return "%" + charToReplace.charCodeAt(0).toString(16).toUpperCase(); // Ensure uppercase hex
  });
};

const UtilityToolkit = (function() {
  // A collection of utility functions for DOM manipulation and data handling
  function UtilityToolkit() {
      // Constructor is intentionally empty as methods are on prototype
  }

  /**
   * Deep merges properties from source object(s) into a target object.
   * @param {object} target - The object to merge into.
   * @param {object} source - The object(s) to merge from.
   * @param {boolean} [shouldOverwrite=false] - If true, existing properties in target will be overwritten.
   */
  UtilityToolkit.prototype.mergeObjects = function(target, source, shouldOverwrite = false) {
    if (!target || typeof target !== 'object') {
        console.warn("Invalid target object provided for mergeObjects.", target);
        return target;
    }
    if (!source || typeof source !== 'object') {
        // If source is not an object, there's nothing to merge from.
        return target;
    }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const targetHasProp = Object.prototype.hasOwnProperty.call(target, key);
        const isSourcePropObject = typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key]);

        if (targetHasProp && isSourcePropObject) {
          // Recursively merge if both target and source properties are objects
          this.mergeObjects(target[key], source[key], shouldOverwrite);
        } else {
          // Assign if overwrite is allowed or target doesn't have the property
          if (shouldOverwrite || !targetHasProp) {
            target[key] = source[key];
          }
        }
      }
    }
    return target; // Return target for chaining or direct use
  };

  UtilityToolkit.prototype.concealElement = function(domElement) {
    if (domElement) domElement.style.display = "none";
  };

  UtilityToolkit.prototype.revealElement = function(domElement) {
    if (domElement) domElement.style.display = "block";
  };

  UtilityToolkit.prototype.hasClassPresent = function(domElement, className) {
    return domElement && domElement.classList ? domElement.classList.contains(className) : false;
  };

  UtilityToolkit.prototype.appendClass = function(domElement, className) {
    if (domElement && domElement.classList) domElement.classList.add(className);
  };

  UtilityToolkit.prototype.removeClassEntry = function(domElement, className) {
    if (domElement && domElement.classList) domElement.classList.remove(className);
  };

  UtilityToolkit.prototype.isUriFormatted = function(inputString) {
    if (typeof inputString !== 'string' || inputString.length === 0) return false;
    try {
        const decoded = decodeURIComponent(inputString);
        return decoded !== inputString; // If decoding changes it, it was encoded.
    } catch (e) {
        return false; // Malformed URI component
    }
  };

  UtilityToolkit.prototype.uriEncodeValue = function(inputString) {
    if (typeof inputString === "undefined" || this.isUriFormatted(inputString)) {
      return inputString;
    } else {
      return inputString.toUriComponentSafe();
    }
  };

  UtilityToolkit.prototype.openPopupWin = function(targetUrl, queryParameters) {
    // Default parameters for the popup window
    const defaultPopupSettings = {
      width: 500,
      height: 350
    };

    // Ensure queryParameters is an object
    queryParameters = queryParameters || {};

    // Calculate center position for the popup
    const popupLeft = (screen.width / 2) - (defaultPopupSettings.width / 2);
    const popupTop = (screen.height / 2) - (defaultPopupSettings.height / 2);

    // Build the query string from parameters
    const queryStringParts = Object.keys(queryParameters).map(paramKey => {
      const paramValue = queryParameters[paramKey];
      // Encode each value using the custom URI encoder
      return `${paramKey}=${this.uriEncodeValue(paramValue)}`;
    });

    let fullQueryString = queryStringParts.join('&');
    if (fullQueryString) {
        fullQueryString = "?" + fullQueryString;
    }

    // Define window features string
    const windowFeatures = [
      'toolbar=no', 'location=no', 'status=no', 'menubar=no',
      'scrollbars=yes', 'resizable=yes',
      `left=${popupLeft}`, `top=${popupTop}`,
      `width=${defaultPopupSettings.width}`, `height=${defaultPopupSettings.height}`
    ].join(',');

    // Open the new window
    return window.open(targetUrl + fullQueryString, 'socialShareWindow', windowFeatures);
  };

  return UtilityToolkit;

})();
var SocialInteractionManager,
  // Helper for prototypal inheritance, often used in CoffeeScript compiled output
  inheritsFrom = function(childClass, parentClass) {
    for (var propKey in parentClass) {
      if (Object.prototype.hasOwnProperty.call(parentClass, propKey)) childClass[propKey] = parentClass[propKey];
    }
    function tempConstructor() { this.constructor = childClass; }
    tempConstructor.prototype = parentClass.prototype;
    childClass.prototype = new tempConstructor();
    childClass.__super__ = parentClass.prototype;
    return childClass;
  };

SocialInteractionManager = (function(baseUtilitiesClass) {
  inheritsFrom(SocialInteractionManager, baseUtilitiesClass);

  /**
   * Initializes a new SocialInteractionManager instance.
   * @param {string} targetSelector - CSS selector for the share component container.
   * @param {object} componentOptions - Configuration options for the component.
   */
  function SocialInteractionManager(targetSelector, componentOptions) {
    this.componentRootSelector = targetSelector; // Renamed element1 to componentRootSelector
    this.domElements = { // Renamed el to domElements
      headSection: document.head || document.getElementsByTagName('head')[0],
      bodySection: document.body || document.getElementsByTagName('body')[0]
    };

    // Default configuration for the sharing component
    this.componentConfig = { // Renamed config to componentConfig
      activeNetworkCount: 0, // Renamed enabled_networks
      currentProtocol: window.location.protocol === 'http:' || window.location.protocol === 'https:' ? '//' : 'https://', // Simpler protocol check
      pageUrl: window.location.href, // Renamed url
      shareCaption: null, // Renamed caption
      pageTitle: this.retrieveDefaultTitle(), // Renamed title, default_title
      pageImage: this.fetchDefaultImage(), // Renamed image, default_image
      pageDescription: this.getMetaDescription(), // Renamed description, default_description
      uiSettings: { // Renamed ui
        flyoutPosition: 'top center', // Renamed flyout
        buttonLabel: 'Share', // Renamed button_text
        useButtonFont: true, // Renamed button_font
        useIconFont: true // Renamed icon_font
      },
      debugMode: false, // Added new fragment: debug mode
      networkSettings: { // Renamed networks
        google_plus: {
          enabled: true,
          shareUrl: null // Renamed url
        },
        twitter: {
          enabled: true,
          shareUrl: null,
          shareDescription: null // Renamed description
        },
        facebook: {
          enabled: true,
          loadSDK: true, // Renamed load_sdk
          shareUrl: null,
          appId: null, // Renamed app_id
          shareTitle: null, // Renamed title
          shareCaption: null, // Renamed caption
          shareDescription: null, // Renamed description
          shareImage: null // Renamed image
        },
        pinterest: {
          enabled: true,
          shareUrl: null,
          shareImage: null,
          shareDescription: null
        },
        email: {
          enabled: true,
          mailSubject: null, // Renamed title
          mailBody: null // Renamed description
        },
        linkedin: { // Added a new network fragment
            enabled: false,
            shareUrl: null,
            shareTitle: null
        }
      }
    };

    // Initialize component with provided options
    this.initializeComponent(this.componentRootSelector, componentOptions);
    return this;
  }

  /**
   * Sets up the sharing component instances.
   * @param {string} selector - The CSS selector for components.
   * @param {object} options - Configuration options.
   */
  SocialInteractionManager.prototype.initializeComponent = function(selector, options) {
    const componentInstances = document.querySelectorAll(selector);

    if (componentInstances.length === 0) {
        if (this.componentConfig.debugMode) {
            console.warn(`[SocialInteractionManager] No elements found for selector: "${selector}". Skipping initialization.`);
        }
        return; // Guard clause for no elements
    }

    // Merge user options into the default configuration
    this.mergeObjects(this.componentConfig, options, true);

    // Apply global settings and normalize network configs
    this.establishGlobalSettings();
    this.sanitizeNetworkSettings();

    // Inject necessary external resources
    if (this.componentConfig.uiSettings.useIconFont) {
      this.embedIconStyles();
    }
    if (this.componentConfig.uiSettings.useButtonFont) {
      this.embedFontStyles();
    }
    if (this.componentConfig.networkSettings.facebook.enabled && this.componentConfig.networkSettings.facebook.loadSDK) {
      this.loadFacebookSDKScript();
    }

    // Configure each instance of the component
    Array.from(componentInstances).forEach((instanceElement, instanceIndex) => { // Refactored loop
      this.configureSingleInstance(instanceElement, instanceIndex);
    });

    if (this.componentConfig.debugMode) {
        console.log(`[SocialInteractionManager] Initialized ${componentInstances.length} component(s) for selector: "${selector}".`);
    }
  };

  /**
   * Configures a single instance of the sharing component.
   * @param {HTMLElement} instanceElement - The DOM element for this instance.
   * @param {number} instanceIndex - The index of this instance.
   */
  SocialInteractionManager.prototype.configureSingleInstance = function(instanceElement, instanceIndex) {
    this.concealElement(instanceElement); // Hide initially

    // Add a unique class for this instance
    const instanceClass = `sharer-instance-${instanceIndex}`;
    this.appendClass(instanceElement, instanceClass);

    // Temporarily set elementIdentifier for style generation
    this.componentConfig.elementIdentifier = `.${instanceClass}`;
    this.applyComponentStyles(instanceElement); // Inject instance-specific CSS
    delete this.componentConfig.elementIdentifier; // Clean up temp property

    this.renderComponentMarkup(instanceElement); // Inject HTML structure
    this.revealElement(instanceElement); // Show after setup

    const triggerLabel = instanceElement.querySelector("label.share-trigger");
    const socialPanel = instanceElement.querySelector(".social-panel");

    if (!triggerLabel || !socialPanel) {
        if (this.componentConfig.debugMode) {
            console.error(`[SocialInteractionManager] Missing trigger label or social panel for instance ${instanceIndex}.`);
        }
        return; // Guard against missing elements
    }

    // Add class for network count
    this.appendClass(socialPanel, `count-${this.componentConfig.activeNetworkCount}`);

    // Event listener for the main share button
    triggerLabel.addEventListener("click", () => {
      this.handleToggleEvent(socialPanel);
    });

    // Event listeners for individual network icons
    const networkListItems = instanceElement.querySelectorAll('ul li[data-network]');
    Array.from(networkListItems).forEach(networkItem => {
        networkItem.addEventListener("click", (event) => {
            // Stop propagation to prevent parent events if any
            event.stopPropagation();
            this.handleNetworkActivation(instanceElement, networkItem);
            this.handleCloseEvent(socialPanel); // Close panel after selection
        });
    });
  };

  /**
   * Toggles the visibility of the social sharing panel.
   * @param {HTMLElement} panelElement - The social panel DOM element.
   */
  SocialInteractionManager.prototype.handleToggleEvent = function(panelElement) {
    if (this.hasClassPresent(panelElement, "active")) {
      this.handleCloseEvent(panelElement);
    } else {
      this.handleOpenEvent(panelElement);
    }
  };

  /**
   * Opens the social sharing panel.
   * @param {HTMLElement} panelElement - The social panel DOM element.
   */
  SocialInteractionManager.prototype.handleOpenEvent = function(panelElement) {
    if (this.hasClassPresent(panelElement, "loading")) {
      this.removeClassEntry(panelElement, "loading");
    }
    this.appendClass(panelElement, "active");
  };

  /**
   * Closes the social sharing panel.
   * @param {HTMLElement} panelElement - The social panel DOM element.
   */
  SocialInteractionManager.prototype.handleCloseEvent = function(panelElement) {
    this.removeClassEntry(panelElement, "active");
  };

  /**
   * Handles the click event for a specific social network.
   * @param {HTMLElement} currentInstance - The overall component instance element.
   * @param {HTMLElement} networkElement - The clicked network list item.
   */
  SocialInteractionManager.prototype.handleNetworkActivation = function(currentInstance, networkElement) {
    const networkName = networkElement.getAttribute("data-network");
    if (!networkName) {
        if (this.componentConfig.debugMode) {
            console.warn("[SocialInteractionManager] Network element missing 'data-network' attribute.");
        }
        return;
    }

    this.executeNetworkHook("before", networkName, currentInstance);

    try {
        const activationMethod = this[`trigger${networkName.replace(/_(\w)/g, (match, p1) => p1.toUpperCase())}Share`];
        if (typeof activationMethod === 'function') {
            activationMethod.call(this);
        } else {
            if (this.componentConfig.debugMode) {
                console.warn(`[SocialInteractionManager] No activation method found for network: ${networkName}`);
            }
        }
    } catch (error) {
        if (this.componentConfig.debugMode) {
            console.error(`[SocialInteractionManager] Error activating ${networkName}:`, error);
        }
    }

    this.executeNetworkHook("after", networkName, currentInstance);
  };

  /**
   * Public method to open all share panels.
   */
  SocialInteractionManager.prototype.activateAll = function() {
    return this.processAllInstances("handleOpenEvent");
  };

  /**
   * Public method to close all share panels.
   */
  SocialInteractionManager.prototype.deactivateAll = function() {
    return this.processAllInstances("handleCloseEvent");
  };

  /**
   * Public method to toggle all share panels.
   */
  SocialInteractionManager.prototype.toggleAll = function() {
    return this.processAllInstances("handleToggleEvent");
  };

  /**
   * Helper to apply an action to all component instances.
   * @param {string} actionMethodName - The name of the method to call on each instance's panel.
   */
  SocialInteractionManager.prototype.processAllInstances = function(actionMethodName) {
    const allComponentElements = document.querySelectorAll(this.componentRootSelector);
    const results = [];
    Array.from(allComponentElements).forEach(instanceElem => {
      const socialPanel = instanceElem.querySelector(".social-panel");
      if (socialPanel && typeof this[actionMethodName] === 'function') {
        results.push(this[actionMethodName](socialPanel));
      }
    });
    return results;
  };

  // --- Network-specific sharing logic ---

  SocialInteractionManager.prototype.triggerFacebookShare = function() {
    const fbConfig = this.componentConfig.networkSettings.facebook;
    if (fbConfig.loadSDK) {
      if (!window.FB) {
        console.error("Facebook JS SDK not loaded. Cannot use FB.ui method for sharing.");
        return;
      }
      FB.ui({
        method: 'feed',
        name: fbConfig.shareTitle || this.componentConfig.pageTitle,
        link: fbConfig.shareUrl || this.componentConfig.pageUrl,
        picture: fbConfig.shareImage || this.componentConfig.pageImage,
        caption: fbConfig.shareCaption || this.componentConfig.shareCaption,
        description: fbConfig.shareDescription || this.componentConfig.pageDescription
      });
    } else {
      this.openPopupWin('https://www.facebook.com/sharer/sharer.php', {
        u: fbConfig.shareUrl || this.componentConfig.pageUrl
      });
    }
  };

  SocialInteractionManager.prototype.triggerTwitterShare = function() {
    const twitterConfig = this.componentConfig.networkSettings.twitter;
    this.openPopupWin('https://twitter.com/intent/tweet', {
      text: twitterConfig.shareDescription || this.componentConfig.pageDescription,
      url: twitterConfig.shareUrl || this.componentConfig.pageUrl
    });
  };

  SocialInteractionManager.prototype.triggerGooglePlusShare = function() {
    const gplusConfig = this.componentConfig.networkSettings.google_plus;
    this.openPopupWin('https://plus.google.com/share', {
      url: gplusConfig.shareUrl || this.componentConfig.pageUrl
    });
  };

  SocialInteractionManager.prototype.triggerPinterestShare = function() {
    const pinterestConfig = this.componentConfig.networkSettings.pinterest;
    this.openPopupWin('https://www.pinterest.com/pin/create/button', {
      url: pinterestConfig.shareUrl || this.componentConfig.pageUrl,
      media: pinterestConfig.shareImage || this.componentConfig.pageImage,
      description: pinterestConfig.shareDescription || this.componentConfig.pageDescription
    });
  };

  SocialInteractionManager.prototype.triggerEmailShare = function() {
    const emailConfig = this.componentConfig.networkSettings.email;
    const mailtoSubject = emailConfig.mailSubject || this.componentConfig.pageTitle;
    const mailtoBody = emailConfig.mailBody || this.componentConfig.pageDescription + '\n\n' + this.componentConfig.pageUrl; // Adding URL to body for email
    this.openPopupWin('mailto:', {
      subject: mailtoSubject,
      body: mailtoBody
    });
  };

  SocialInteractionManager.prototype.triggerLinkedinShare = function() { // New network share method
    const linkedinConfig = this.componentConfig.networkSettings.linkedin;
    this.openPopupWin('https://www.linkedin.com/shareArticle', {
        mini: true,
        url: linkedinConfig.shareUrl || this.componentConfig.pageUrl,
        title: linkedinConfig.shareTitle || this.componentConfig.pageTitle,
        summary: this.componentConfig.pageDescription,
        source: window.location.hostname
    });
  };

  // --- Resource Injection Methods ---

  SocialInteractionManager.prototype.embedIconStyles = function() {
    this.insertStylesheetLink("https://www.sharebutton.co/fonts/v2/entypo.min.css", 'share-icon-font');
  };

  SocialInteractionManager.prototype.embedFontStyles = function() {
    const fontUrl = `https://fonts.googleapis.com/css?family=Lato:900&text=${this.uriEncodeValue(this.componentConfig.uiSettings.buttonLabel)}`;
    this.insertStylesheetLink(fontUrl, 'share-button-font');
  };

  /**
   * Inserts a stylesheet link into the document head.
   * @param {string} url - The URL of the stylesheet.
   * @param {string} [idPrefix='share-style'] - Optional ID prefix for the link element.
   */
  SocialInteractionManager.prototype.insertStylesheetLink = function(url, idPrefix = 'share-style') {
    const existingLink = this.domElements.headSection.querySelector(`link[href="${url}"]`);
    if (!existingLink) {
      const styleLinkElement = document.createElement("link");
      styleLinkElement.setAttribute("rel", "stylesheet");
      styleLinkElement.setAttribute("href", url);
      styleLinkElement.setAttribute("id", `${idPrefix}-${Math.random().toString(36).substring(7)}`); // Unique ID
      this.domElements.headSection.appendChild(styleLinkElement);
    }
  };

  /**
   * Applies dynamic CSS rules for a specific component instance.
   * @param {HTMLElement} targetInstance - The component's root DOM element.
   */
  SocialInteractionManager.prototype.applyComponentStyles = function(targetInstance) {
    // Generate a unique identifier for this instance's styles
    const instanceUniqueSelector = `.${targetInstance.className.split(" ").join(".")}`;
    const metaIdentifier = `sharer-styles-${instanceUniqueSelector.replace(/\W/g, '_')}`; // Sanitize for meta name

    // Check if styles for this specific selector have already been injected
    if (!this.domElements.headSection.querySelector(`meta[name="${metaIdentifier}"]`)) {
      // Prepare config for style generation function
      const styleGenConfig = {
          elementIdentifier: instanceUniqueSelector,
          networkDisplayStatus: {}
      };
      // Populate network display statuses
      Object.keys(this.componentConfig.networkSettings).forEach(netKey => {
          styleGenConfig.networkDisplayStatus[netKey] = this.componentConfig.networkSettings[netKey].display;
      });

      const generatedCss = generateComponentStyles(styleGenConfig);
      const styleElement = document.createElement("style");
      styleElement.type = "text/css";
      styleElement.appendChild(document.createTextNode(generatedCss)); // More standard way

      this.domElements.headSection.appendChild(styleElement);

      // Add a meta tag to mark that styles for this selector have been injected
      const styleMarkerMeta = document.createElement("meta");
      styleMarkerMeta.setAttribute("name", metaIdentifier);
      this.domElements.headSection.appendChild(styleMarkerMeta);
    }
  };

  /**
   * Injects the HTML markup for the sharing component into the instance.
   * @param {HTMLElement} targetInstance - The component's root DOM element.
   */
  SocialInteractionManager.prototype.renderComponentMarkup = function(targetInstance) {
    // Using createElement and appendChild for better security and flexibility
    const labelElement = document.createElement('label');
    labelElement.className = 'icon-export share-trigger'; // Changed class name
    const spanText = document.createElement('span');
    spanText.textContent = this.componentConfig.uiSettings.buttonLabel;
    labelElement.appendChild(spanText);

    const socialPanelDiv = document.createElement('div');
    socialPanelDiv.className = `social-panel loading ${this.componentConfig.uiSettings.flyoutPosition}`; // Changed class name
    const ulList = document.createElement('ul');

    // Define network icons and data-network attributes
    const networkIcons = [
        { class: 'icon-pinterest', network: 'pinterest' },
        { class: 'icon-twitter', network: 'twitter' },
        { class: 'icon-facebook', network: 'facebook' },
        { class: 'icon-gplus', network: 'google_plus' }, // Changed to gplus for consistency
        { class: 'icon-paper-plane', network: 'email' },
        { class: 'icon-linkedin', network: 'linkedin' } // Added new network icon
    ];

    networkIcons.forEach(net => {
        const liItem = document.createElement('li');
        liItem.className = net.class;
        liItem.setAttribute('data-network', net.network);
        ulList.appendChild(liItem);
    });

    socialPanelDiv.appendChild(ulList);

    // Clear existing content and append new elements
    targetInstance.innerHTML = '';
    targetInstance.appendChild(labelElement);
    targetInstance.appendChild(socialPanelDiv);
  };

  /**
   * Injects the Facebook SDK script into the document body.
   */
  SocialInteractionManager.prototype.loadFacebookSDKScript = function() {
    const fbAppId = this.componentConfig.networkSettings.facebook.appId;
    // Check if FB SDK is already loaded or being loaded, and if app ID is present
    if (!window.FB && fbAppId && !this.domElements.bodySection.querySelector('#fb-root')) {
      const fbRootDiv = document.createElement("div");
      fbRootDiv.id = "fb-root";
      this.domElements.bodySection.appendChild(fbRootDiv);

      const fbScript = document.createElement("script");
      fbScript.async = true; // Added async attribute
      fbScript.defer = true; // Added defer attribute
      fbScript.text = `
        window.fbAsyncInit = function() {
          FB.init({
            appId: '${fbAppId}',
            status: true,
            xfbml: true,
            version: 'v12.0' // Specify a recent API version
          });
        };
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) { return; }
          js = d.createElement(s); js.id = id;
          js.src = "${this.componentConfig.currentProtocol}connect.facebook.net/en_US/sdk.js"; // Changed from all.js to sdk.js
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      `;
      this.domElements.bodySection.appendChild(fbScript);
    } else if (this.componentConfig.debugMode && !fbAppId) {
        console.warn("[SocialInteractionManager] Facebook SDK will not load without an 'appId' configured.");
    }
  };

  /**
   * Executes a custom hook function for a network.
   * @param {'before'|'after'} hookType - The type of hook ('before' or 'after').
   * @param {string} networkKey - The key of the network.
   * @param {HTMLElement} currentInstance - The DOM element of the current component instance.
   */
  SocialInteractionManager.prototype.executeNetworkHook = function(hookType, networkKey, currentInstance) {
    const networkSpecificSettings = this.componentConfig.networkSettings[networkKey];
    if (!networkSpecificSettings) return;

    const hookFunction = networkSpecificSettings[hookType];
    if (typeof hookFunction === "function") {
      const updatedOptions = hookFunction.call(networkSpecificSettings, currentInstance);
      if (typeof updatedOptions === "object" && updatedOptions !== null) {
        // Validate and apply updates from the hook
        const validatedUpdates = this.validateFilterUpdates(updatedOptions, networkKey);
        this.mergeObjects(networkSpecificSettings, validatedUpdates, true);
        this.sanitizeNetworkSettings(); // Re-sanitize after updates
      } else if (updatedOptions !== undefined) {
          if (this.componentConfig.debugMode) {
              console.warn(`[SocialInteractionManager] Hook for ${networkKey} (${hookType}) returned a non-object value. Updates ignored.`, updatedOptions);
          }
      }
    }
  };

  // --- Default Metadata Retrieval ---

  SocialInteractionManager.prototype.retrieveDefaultTitle = function() {
    let pageTitle = '';
    let metaTag = document.querySelector('meta[property="og:title"]') ||
                  document.querySelector('meta[name="twitter:title"]');
    if (metaTag && metaTag.getAttribute('content')) {
        pageTitle = metaTag.getAttribute('content');
    } else if (document.title) {
        pageTitle = document.title;
    }
    return pageTitle;
  };

  SocialInteractionManager.prototype.fetchDefaultImage = function() {
    let metaTag = document.querySelector('meta[property="og:image"]') ||
                  document.querySelector('meta[name="twitter:image"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  };

  SocialInteractionManager.prototype.getMetaDescription = function() {
    let metaTag = document.querySelector('meta[property="og:description"]') ||
                  document.querySelector('meta[name="twitter:description"]') ||
                  document.querySelector('meta[name="description"]');
    return metaTag ? metaTag.getAttribute('content') : '';
  };

  // --- Configuration Management ---

  SocialInteractionManager.prototype.establishGlobalSettings = function() {
    let activeNetworksCount = 0;
    Object.keys(this.componentConfig.networkSettings).forEach(networkKey => {
      const currentNetworkOpts = this.componentConfig.networkSettings[networkKey];

      // Ensure network-specific options inherit from global if not set
      Object.keys(this.componentConfig).forEach(globalOptKey => {
        // Skip networkSettings itself and uiSettings, debugMode as they are not global share properties
        if (globalOptKey === 'networkSettings' || globalOptKey === 'uiSettings' || globalOptKey === 'debugMode' || globalOptKey === 'elementIdentifier') {
            return;
        }
        // Only set if the network-specific option is null or undefined
        if (currentNetworkOpts[globalOptKey] === null || currentNetworkOpts[globalOptKey] === undefined) {
            currentNetworkOpts[globalOptKey] = this.componentConfig[globalOptKey];
        }
      });

      // Determine display status for CSS generation
      currentNetworkOpts.display = currentNetworkOpts.enabled ? 'block' : 'none';
      if (currentNetworkOpts.enabled) {
        activeNetworksCount++;
      }
    });
    this.componentConfig.activeNetworkCount = activeNetworksCount;
  };

  SocialInteractionManager.prototype.sanitizeNetworkSettings = function() {
    const fbSettings = this.componentConfig.networkSettings.facebook;
    if (!fbSettings.appId) {
      fbSettings.loadSDK = false; // Disable SDK loading if no app ID
    }

    const twitterSettings = this.componentConfig.networkSettings.twitter;
    if (typeof twitterSettings.shareDescription === 'string' && twitterSettings.shareDescription.length > 0 && !this.isUriFormatted(twitterSettings.shareDescription)) {
      twitterSettings.shareDescription = this.uriEncodeValue(twitterSettings.shareDescription);
    }

    // Ensure Facebook app ID is a string if provided as a number
    if (Number.isInteger(fbSettings.appId)) { // Use Number.isInteger for robustness
      fbSettings.appId = fbSettings.appId.toString();
    }
  };

  SocialInteractionManager.prototype.validateFilterUpdates = function(updatesObject, networkName) {
    const originalFbConfig = this.componentConfig.networkSettings.facebook;
    const validatedUpdates = { ...updatesObject }; // Create a shallow copy to modify

    // Specific warnings for Facebook SDK related changes
    if (networkName === 'facebook') {
        if (updatesObject.appId !== undefined && originalFbConfig.appId !== updatesObject.appId) {
            console.warn("[SocialInteractionManager] Facebook 'appId' cannot be changed after initialization. Update ignored.");
            delete validatedUpdates.appId;
        }
        if (updatesObject.loadSDK !== undefined && originalFbConfig.loadSDK !== updatesObject.loadSDK) {
            console.warn("[SocialInteractionManager] Facebook 'loadSDK' option cannot be changed after initialization. Update ignored.");
            delete validatedUpdates.loadSDK;
        }
    }
    return validatedUpdates;
  };

  return SocialInteractionManager;

})(UtilityToolkit);
 return SocialInteractionManager;
});