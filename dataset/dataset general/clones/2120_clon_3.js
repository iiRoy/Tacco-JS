/*
 * @module PresentationView
 * @description Manages interactive presentation display and navigation logic.
 * @license MIT
 */

// Polyfill for exiting fullscreen mode across browsers.
// Ensure consistent behavior for fullscreen exit operations.
document.exitPresentationView = document.webkitExitFullscreen ||
                                document.mozCancelFullScreen ||
                                document.msExitFullscreen ||
                                document.exitFullscreen;

/**
 * @class PresentationDisplayManager
 * @param {HTMLElement} rootNode The main container element for the presentation slides.
 * @description Constructs a new PresentationDisplayManager instance.
 */
function PresentationDisplayManager(rootNode) {
  // Initialize internal state variables for the presentation.
  this.activePageIndex = 0; // The index of the currently displayed slide/page.
  this.lastPageIndex = 0; // Stores the index of the previously active slide/page.
  this.appSettings = null; // Configuration object loaded from external sources.
  this.mainContainer = rootNode || document.querySelector('slides'); // The DOM element holding all presentation pages.
  this.presentationPages = []; // Collection of individual slide elements.
  this.remoteControl = null; // Instance of a remote controller for presentation (e.g., popup window).
  this.isInitialized = false; // Flag to indicate if the manager has completed its initial setup.

  // If no root node is provided and 'slides' element is not found, throw an error.
  if (!this.mainContainer) {
    console.error("PresentationDisplayManager: Root container element 'slides' not found.");
    throw new Error("Missing presentation root container.");
  }

  // Attempt to load the initial page based on the URL hash.
  this.determineInitialPage();

  // Defer DOM-dependent initializations until the document is fully loaded.
  // Using a direct call with bind here ensures execution context is correct.
  this.initializeOnReady();
}

/**
 * @const
 * @private
 * @description CSS classes used to visually position slides relative to the active one.
 */
PresentationDisplayManager.prototype.PAGE_VISIBILITY_STATES = [
  'far-behind', 'behind', 'active', 'ahead', 'far-ahead'
];

/**
 * @const
 * @private
 * @description Base path for presentation-specific CSS assets.
 */
PresentationDisplayManager.prototype.STYLE_ASSET_PATH = 'presentation/styles/';

/**
 * @private
 * @description Extracts the starting page number from the URL hash.
 * If no valid number is found, defaults to the first page.
 */
PresentationDisplayManager.prototype.determineInitialPage = function() {
  const urlHash = document.location.hash.substring(1); // Get hash without '#'
  const pageNumberFromHash = parseInt(urlHash, 10);

  // Validate if the parsed hash is a positive integer.
  if (Number.isInteger(pageNumberFromHash) && pageNumberFromHash > 0) {
    this.activePageIndex = pageNumberFromHash - 1; // Convert to 0-based index.
    console.debug(`Initial page set from URL hash: ${this.activePageIndex + 1}`);
  } else {
    this.activePageIndex = 0; // Default to the very first page.
    console.debug('No valid page hash found; starting at page 1.');
  }
};

/**
 * @param {number} targetPageIdx The 1-based index of the page to navigate to.
 * @description Navigates the presentation to a specific page index.
 * Optionally refreshes the display.
 */
PresentationDisplayManager.prototype.jumpToPage = function(targetPageIdx) {
  // Validate the input: ensure it's a number and within valid bounds.
  if (typeof targetPageIdx !== 'number' || !Number.isInteger(targetPageIdx) || targetPageIdx < 1) {
    console.warn(`Attempted to jump to invalid page index: ${targetPageIdx}`);
    return;
  }

  const requestedIndex = targetPageIdx - 1; // Convert to 0-based index.

  // Only update if the requested page is different and within bounds.
  if (this.activePageIndex !== requestedIndex && requestedIndex >= 0 && requestedIndex < this.presentationPages.length) {
    this.activePageIndex = requestedIndex;
    console.info(`Jumping to page: ${targetPageIdx}`);
    this.refreshPageDisplay();
  } else if (this.activePageIndex === requestedIndex) {
    console.log(`Already on page: ${targetPageIdx}`);
  } else {
    console.warn(`Requested page ${targetPageIdx} is out of bounds.`);
  }
};

/**
 * @private
 * @description Executes core initialization tasks once the DOM is fully loaded.
 * This includes finding slides, detecting device capabilities, loading config,
 * and setting up event listeners.
 */
PresentationDisplayManager.prototype.initializeOnReady = function() {
  if (this.isInitialized) {
    console.warn('PresentationDisplayManager already initialized.');
    return;
  }

  // Populate the collection of presentation pages.
  this.presentationPages = Array.from(this.mainContainer.querySelectorAll('slide:not([hidden]):not(.backdrop)'));

  // Adapt presentation layout for mobile devices if detected.
  const isMobileDevice = window.matchMedia('only screen and (max-device-width: 480px)').matches;
  if (isMobileDevice) {
    console.log('Mobile device detected, adapting layout.');
    // Remove widescreen class for better mobile viewing.
    this.mainContainer.classList.remove('layout-widescreen');
    // Consider adding a mobile-specific class to the body if needed for further styling.
    document.body.classList.add('mobile-presentation-mode');
  }

  // Load external configuration and apply its settings.
  // Assuming SLIDE_CONFIG is a globally available configuration object.
  this.processConfiguration(typeof SLIDE_CONFIG !== 'undefined' ? SLIDE_CONFIG : {});

  // Set up all necessary event listeners for user interaction.
  this.setupInputListeners();

  // Ensure the initial slide display is correct.
  this.refreshPageDisplay();

  // Add metadata to each slide for navigation and display purposes.
  this.presentationPages.forEach((pageElement, index) => {
    pageElement.dataset.pageId = index + 1;
    pageElement.dataset.totalPageCount = this.presentationPages.length;

    // Add click listener for overview mode interaction.
    pageElement.addEventListener('click', (clickEvt) => {
      if (document.body.classList.contains('overview-active')) {
        const clickedPageNum = parseInt(pageElement.dataset.pageId, 10);
        if (!isNaN(clickedPageNum)) {
          this.jumpToPage(clickedPageNum);
          clickEvt.preventDefault();
          // Delay overview toggle slightly to allow page transition to start.
          window.setTimeout(() => this.toggleOverviewMode(), 500);
        }
      }
    }, false);
  });

  // Initialize a remote controller if not a touch device.
  // Assuming 'Modernizr' is available for feature detection.
  if (typeof Modernizr !== 'undefined' && !Modernizr.touch) {
    // Assuming SlideController is defined globally or imported.
    if (typeof SlideController !== 'undefined') {
      this.remoteControl = new SlideController(this);
      if (this.remoteControl.isRemoteWindow) {
        document.body.classList.add('remote-popup-active');
        console.info('Presentation is running as a remote control popup.');
      }
    } else {
      console.warn('SlideController not found, remote control functionality disabled.');
    }
  } else {
    console.log('Touch device detected or Modernizr not available, skipping SlideController setup.');
  }

  this.isInitialized = true;
  console.info('PresentationDisplayManager initialized successfully.');
};

/**
 * @private
 * @description Binds global event listeners for keyboard input and browser history changes.
 */
PresentationDisplayManager.prototype.setupInputListeners = function() {
  // Guard against duplicate listener setup.
  if (this.listenersAttached) {
    console.warn('Event listeners already attached.');
    return;
  }

  document.addEventListener('keydown', this.handleGlobalKeyPress.bind(this), false);
  window.addEventListener('popstate', this.handleHistoryNavigation.bind(this), false);
  this.listenersAttached = true;
  console.debug('Global input listeners attached.');
};

/**
 * @private
 * @param {PopStateEvent} historyEvent The popstate event object.
 * @description Handles browser history navigation (back/forward button presses).
 * Updates the current slide based on the history state.
 */
PresentationDisplayManager.prototype.handleHistoryNavigation = function(historyEvent) {
  const eventStateData = historyEvent.state;
  if (eventStateData !== null && typeof eventStateData === 'number') {
    this.activePageIndex = eventStateData; // State directly holds 0-based index.
    this.refreshPageDisplay(true); // True to indicate no new history entry needed.
    console.log(`Navigated to page ${this.activePageIndex + 1} via history.`);
  } else {
    console.debug('Popstate event with no valid page state data.');
  }
};

/**
 * @param {KeyboardEvent} keyboardEvent The keyboard event object.
 * @description Processes keyboard input for presentation navigation and control.
 */
PresentationDisplayManager.prototype.handleGlobalKeyPress = function(keyboardEvent) {
  const targetElement = keyboardEvent.target;
  const isInputOrEditable = targetElement.matches('input, textarea') || targetElement.isContentEditable;

  // Ignore key presses if focus is within an input field or editable area.
  if (isInputOrEditable) {
    return;
  }

  // If this is a remote control popup, forward key events to the main presentation.
  if (this.remoteControl && this.remoteControl.isRemoteWindow) {
    this.remoteControl.sendMessage({keyCode: keyboardEvent.keyCode});
    return; // Don't process locally if acting as a remote.
  }

  const bodyClasses = document.body.classList;

  switch (keyboardEvent.keyCode) {
    case 13: // Enter key
      if (bodyClasses.contains('overview-active')) {
        this.toggleOverviewMode();
      }
      break;

    case 39: // Right arrow
    case 32: // Spacebar
    case 34: // Page Down
    case 40: // Down arrow
      this.advancePage();
      keyboardEvent.preventDefault(); // Prevent default browser scroll.
      break;

    case 37: // Left arrow
    case 8:  // Backspace
    case 33: // Page Up
    case 38: // Up arrow
      this.regressPage();
      keyboardEvent.preventDefault(); // Prevent default browser scroll.
      break;

    case 72: // H key: Toggle code highlighting
      bodyClasses.toggle('code-highlight-active');
      break;

    case 79: // O key: Toggle overview mode
      this.toggleOverviewMode();
      break;

    case 80: // P key: Toggle speaker notes visibility
      // Only toggle notes if a controller exists, regardless of popup status.
      // The original logic was a bit convoluted, simplifying.
      if (this.remoteControl) {
        bodyClasses.toggle('speaker-notes-visible');
      }
      break;

    case 27: // ESC key: Reset view (hide notes, highlighting, exit overview)
      bodyClasses.remove('speaker-notes-visible');
      bodyClasses.remove('code-highlight-active');
      if (bodyClasses.contains('overview-active')) {
        this.toggleOverviewMode();
      }
      break;

    case 70: // F key: Toggle fullscreen mode
      // Ensure keypress is on the body and not part of a browser shortcut.
      if (targetElement === document.body && !(keyboardEvent.shiftKey && keyboardEvent.metaKey)) {
        this.handleFullscreenToggle();
      }
      break;

    case 87: // W key: Toggle widescreen layout
      // Ensure keypress is on the body.
      if (targetElement === document.body) {
        this.mainContainer.classList.toggle('layout-widescreen');
      }
      break;

    case 82: // R key: (Currently unimplemented, placeholder)
      // TODO: Implement refresh logic for main slides when remote is refreshed.
      console.log('R key pressed - refresh functionality (TBD).');
      break;

    default:
      // console.log(`Unhandled key code: ${keyboardEvent.keyCode}`);
      break;
  }
};

/**
 * @private
 * @description Manages entering and exiting fullscreen mode.
 */
PresentationDisplayManager.prototype.handleFullscreenToggle = function() {
  const doc = document;
  const body = doc.body;

  // Check for existing fullscreen state using standard and vendor-prefixed properties.
  const isCurrentlyFullscreen = doc.fullscreenElement ||
                                doc.mozFullScreenElement ||
                                doc.webkitFullscreenElement ||
                                doc.msFullscreenElement;

  if (!isCurrentlyFullscreen) {
    // Request fullscreen, prioritizing standard API then vendor prefixes.
    if (body.requestFullscreen) {
      body.requestFullscreen();
    } else if (body.mozRequestFullScreen) {
      body.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); // Mozilla specific option.
    } else if (body.webkitRequestFullScreen) {
      body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); // Webkit specific option.
    } else if (body.msRequestFullscreen) {
      body.msRequestFullscreen();
    }
    console.info('Attempting to enter fullscreen mode.');
  } else {
    // Exit fullscreen.
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.webkitCancelFullScreen) {
      doc.webkitCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
    console.info('Exiting fullscreen mode.');
  }
};


/**
 * @private
 * @description Applies CSS transforms to position slides for the overview mode.
 */
PresentationDisplayManager.prototype.applyOverviewLayout = function() {
  const isOverviewActive = document.body.classList.contains('overview-active');
  const transformPropertyName = typeof Modernizr !== 'undefined' ? Modernizr.prefixed('transform') : 'transform';

  this.presentationPages.forEach((pageEl, index) => {
    // Only apply transform if overview mode is active. Reset otherwise.
    pageEl.style[transformPropertyName] = isOverviewActive ?
      `translateZ(-2500px) translateX(${ (index - this.activePageIndex) * 105 }%)` : '';
  });
  console.debug(`Overview layout ${isOverviewActive ? 'applied' : 'removed'}.`);
};

/**
 * @description Toggles the presentation's overview mode on or off.
 */
PresentationDisplayManager.prototype.toggleOverviewMode = function() {
  document.body.classList.toggle('overview-active');
  this.applyOverviewLayout();
  console.info(`Overview mode toggled to: ${document.body.classList.contains('overview-active')}`);
};

/**
 * @private
 * @param {Object} appConfigData The configuration object for the presentation.
 * @description Loads and applies various settings from the presentation configuration.
 */
PresentationDisplayManager.prototype.processConfiguration = function(appConfigData) {
  // Validate input configuration.
  if (!appConfigData || typeof appConfigData !== 'object') {
    console.warn('No valid application configuration data provided.');
    return;
  }

  this.appSettings = appConfigData;
  const configSettings = this.appSettings.settings || {};

  // Apply presentation theme(s).
  this.applyThemeStyles(configSettings.theme || []);

  // Set a custom favicon if specified.
  if (configSettings.favIcon) {
    this.setupFavicon(configSettings.favIcon);
  }

  // Initialize syntax highlighting (e.g., Google Code Prettify).
  // Default to on if not explicitly set to false.
  if (configSettings.usePrettify !== false && typeof prettyPrint === 'function') {
    prettyPrint();
    console.debug('Code prettify enabled.');
  } else if (configSettings.usePrettify !== false) {
    console.warn('prettyPrint function not found, syntax highlighting might not work.');
  }

  // Load analytics script if configured.
  if (configSettings.analytics) {
    this.initAnalytics();
  }

  // Inject custom web fonts.
  if (configSettings.fonts && Array.isArray(configSettings.fonts) && configSettings.fonts.length > 0) {
    this.injectWebFonts(configSettings.fonts);
  }

  // Prepare incremental builds within slides. Default to on.
  if (configSettings.useBuilds !== false) {
    this.prepareIncrementalBuilds();
  }

  // Update document title and elements based on config.
  if (configSettings.title) {
    document.title = configSettings.title.replace(/<br\/?>/g, ' ') + ' - Enhanced Presentation System';
    const titleElement = document.querySelector('[data-config-title]');
    if (titleElement) {
      titleElement.innerHTML = configSettings.title;
    }
  }

  if (configSettings.subtitle) {
    const subtitleElement = document.querySelector('[data-config-subtitle]');
    if (subtitleElement) {
      subtitleElement.innerHTML = configSettings.subtitle;
    }
  }

  // Process presenter information.
  if (this.appSettings.presenters && Array.isArray(this.appSettings.presenters)) {
    this.renderPresenterInfo(this.appSettings.presenters);
  }

  // Create navigation click areas. Default to enabled.
  if (configSettings.enableNavigationAreas !== false) {
    this.createNavigationClickAreas();
  }

  // Enable touch gestures for navigation if on a touch device.
  if (typeof Modernizr !== 'undefined' && Modernizr.touch && configSettings.enableTouchGestures !== false) {
    this.setupTouchGestures();
  }
  console.info('Configuration processed and applied.');
};

/**
 * @private
 * @param {Array<Object>} presenterDetails Array of presenter objects.
 * @description Renders presenter contact and name information into designated DOM elements.
 */
PresentationDisplayManager.prototype.renderPresenterInfo = function(presenterDetails) {
  const contactInfoDisplay = document.querySelector('[data-config-contact]');
  const speakerNameDisplay = document.querySelector('[data-config-presenter]');
  let presenterHtml = [];
  let contactHtml = [];

  if (presenterDetails.length === 1) {
    const primarySpeaker = presenterDetails[0];
    presenterHtml.push(`${primarySpeaker.name} <br> ${primarySpeaker.company || ''}`);

    const generateLink = (label, url, prefix = '') => url ?
      `<span>${label}</span><a href="${prefix}${url}">${url.replace(/https?:\/\//, '')}</a>` : '';

    contactHtml.push(generateLink('g+', primarySpeaker.gplus));
    contactHtml.push(generateLink('twitter', primarySpeaker.twitter, 'https://twitter.com/'));
    contactHtml.push(generateLink('www', primarySpeaker.www));
    contactHtml.push(generateLink('github', primarySpeaker.github));

    if (contactInfoDisplay) {
      contactInfoDisplay.innerHTML = contactHtml.filter(Boolean).join('<br>');
    }
  } else if (presenterDetails.length > 1) {
    presenterDetails.forEach(speaker => {
      presenterHtml.push(`${speaker.name} - ${speaker.company || ''}`);
    });
    if (contactInfoDisplay) {
      contactInfoDisplay.innerHTML = presenterHtml.join('<br>'); // For multiple, just list names/companies.
    }
  }

  if (speakerNameDisplay) {
    speakerNameDisplay.innerHTML = presenterHtml.join('<br>');
  }
  console.debug('Presenter information rendered.');
};

/**
 * @private
 * @description Creates left and right click areas for slide navigation.
 */
PresentationDisplayManager.prototype.createNavigationClickAreas = function() {
  const createArea = (id, handler) => {
    const navAreaDiv = document.createElement('div');
    navAreaDiv.classList.add('slide-navigation-area');
    navAreaDiv.id = id;
    navAreaDiv.addEventListener('click', handler.bind(this), false);
    this.mainContainer.appendChild(navAreaDiv);
  };

  createArea('prev-slide-click-area', this.regressPage);
  createArea('next-slide-click-area', this.advancePage);
  console.debug('Slide navigation click areas created.');
};

/**
 * @private
 * @description Sets up Hammer.js for touch-based slide navigation.
 */
PresentationDisplayManager.prototype.setupTouchGestures = function() {
  if (typeof Hammer === 'undefined') {
    console.warn('Hammer.js not found, touch gestures cannot be enabled.');
    return;
  }

  // Prevent default mobile zoom/scroll behavior to ensure smooth slide swiping.
  window.addEventListener('touchstart', (touchEvt) => touchEvt.preventDefault(), { passive: false });

  const touchGestureRecognizer = new Hammer(this.mainContainer);
  touchGestureRecognizer.get('swipe').set({ direction: Hammer.DIRECTION_ALL }); // Enable all swipe directions.

  touchGestureRecognizer.on('swipe', (swipeEvt) => {
    if (swipeEvt.direction === Hammer.DIRECTION_RIGHT || swipeEvt.direction === Hammer.DIRECTION_DOWN) {
      this.regressPage();
    } else if (swipeEvt.direction === Hammer.DIRECTION_LEFT || swipeEvt.direction === Hammer.DIRECTION_UP) {
      this.advancePage();
    }
    console.debug(`Swipe gesture detected: ${swipeEvt.direction}`);
  });
  console.info('Touch gestures enabled for navigation.');
};

/**
 * @private
 * @param {Array<string>} fontFamilies An array of font family names to load from Google Fonts.
 * @description Dynamically injects a stylesheet link for specified Google Fonts.
 */
PresentationDisplayManager.prototype.injectWebFonts = function(fontFamilies) {
  if (!Array.isArray(fontFamilies) || fontFamilies.length === 0) {
    console.warn('No font families provided for injection.');
    return;
  }
  const fontLinkElement = document.createElement('link');
  fontLinkElement.rel = 'stylesheet';
  fontLinkElement.type = 'text/css'; // Explicitly set type.
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  fontLinkElement.href = `${protocol}://fonts.googleapis.com/css?family=${fontFamilies.join('|')}&v2`;
  document.head.appendChild(fontLinkElement);
  console.debug(`Web fonts loaded: ${fontFamilies.join(', ')}`);
};

/**
 * @private
 * @description Advances to the next item in an incremental build list on the current slide.
 * If no more items to build, returns false.
 * @returns {boolean} True if an item was built, false otherwise.
 */
PresentationDisplayManager.prototype.advanceIncrementalBuild = function() {
  const currentSlideView = this.presentationPages[this.activePageIndex];
  if (!currentSlideView) {
    return false; // No current slide.
  }

  let nextItemToBuild = currentSlideView.querySelector('.incremental-step-pending');
  let currentlyBuiltItem = currentSlideView.querySelector('.incremental-step-active');

  // If there's an active item, move it to a faded state if applicable.
  if (currentlyBuiltItem) {
    currentlyBuiltItem.classList.remove('incremental-step-active');
    if (currentlyBuiltItem.classList.contains('fade-out-on-build')) {
      currentlyBuiltItem.classList.add('incremental-step-faded');
    }
  }

  // If no more items to build, reset any faded items and indicate completion.
  if (!nextItemToBuild) {
    currentSlideView.querySelectorAll('.incremental-step-faded').forEach(item => {
      item.classList.remove('incremental-step-faded');
    });
    console.debug(`No more incremental builds on page ${this.activePageIndex + 1}.`);
    return false;
  }

  // Activate the next item.
  nextItemToBuild.classList.remove('incremental-step-pending');
  nextItemToBuild.classList.add('incremental-step-active');
  console.debug(`Advanced incremental build on page ${this.activePageIndex + 1}.`);
  return true;
};

/**
 * @param {boolean} [suppressHistoryUpdate=false] If true, prevents pushing a new state to history.
 * @description Navigates to the previous slide in the presentation.
 */
PresentationDisplayManager.prototype.regressPage = function(suppressHistoryUpdate = false) {
  // Ensure we are not on the first slide.
  if (this.activePageIndex <= 0) {
    console.log('Already on the first page, cannot regress further.');
    return;
  }

  const bodyClasses = document.body.classList;
  bodyClasses.remove('code-highlight-active'); // Turn off code highlighting.

  // Remove speaker notes visibility if not a remote control popup.
  const isRemote = this.remoteControl && this.remoteControl.isRemoteWindow;
  if (!isRemote) {
    bodyClasses.remove('speaker-notes-visible');
  }

  this.lastPageIndex = this.activePageIndex; // Store current index before decrementing.
  this.activePageIndex--; // Move to the previous page.

  console.info(`Regressing to page: ${this.activePageIndex + 1}`);
  this.refreshPageDisplay(suppressHistoryUpdate);
};

/**
 * @param {boolean} [suppressHistoryUpdate=false] If true, prevents pushing a new state to history.
 * @description Navigates to the next slide in the presentation.
 */
PresentationDisplayManager.prototype.advancePage = function(suppressHistoryUpdate = false) {
  // If in overview mode, disable it first before advancing.
  if (document.body.classList.contains('overview-active')) {
    this.toggleOverviewMode();
    return;
  }

  // Try to advance an incremental build first.
  if (this.advanceIncrementalBuild()) {
    return; // If an item was built, stay on the same slide.
  }

  // If no more builds, proceed to the next slide, if available.
  if (this.activePageIndex >= this.presentationPages.length - 1) {
    console.log('Already on the last page, cannot advance further.');
    return;
  }

  const bodyClasses = document.body.classList;
  bodyClasses.remove('code-highlight-active'); // Turn off code highlighting.

  // Remove speaker notes visibility if not a remote control popup.
  const isRemote = this.remoteControl && this.remoteControl.isRemoteWindow;
  if (!isRemote) {
    bodyClasses.remove('speaker-notes-visible');
  }

  this.lastPageIndex = this.activePageIndex; // Store current index before incrementing.
  this.activePageIndex++; // Move to the next page.

  console.info(`Advancing to page: ${this.activePageIndex + 1}`);
  this.refreshPageDisplay(suppressHistoryUpdate);
};

/* --- Placeholder/Stub Methods (original code called these but didn't define them) --- */

/**
 * @private
 * @param {boolean} [doNotPushToHistory=false] If true, prevents pushing a new state to history.
 * @description Updates the visual state of all slides based on the activePageIndex.
 * This method is crucial for applying CSS classes that position slides.
 */
PresentationDisplayManager.prototype.refreshPageDisplay = function(doNotPushToHistory = false) {
  this.presentationPages.forEach((page, index) => {
    const distanceFromActive = index - this.activePageIndex;
    const absDistanceFromActive = Math.abs(distanceFromActive);

    // Remove all previous positioning classes.
    this.PAGE_VISIBILITY_STATES.forEach(className => page.classList.remove(className));

    // Apply new positioning class based on distance.
    let newClass = '';
    if (absDistanceFromActive >= 2) {
      newClass = distanceFromActive < 0 ? 'far-behind' : 'far-ahead';
    } else if (absDistanceFromActive === 1) {
      newClass = distanceFromActive < 0 ? 'behind' : 'ahead';
    } else { // absDistanceFromActive === 0
      newClass = 'active';
    }
    page.classList.add(newClass);

    // Apply aria-hidden for accessibility for non-active slides.
    page.setAttribute('aria-hidden', newClass !== 'active');
  });

  // Update URL hash and browser history unless suppressed.
  if (!doNotPushToHistory) {
    const pageNumForHash = this.activePageIndex + 1;
    window.history.pushState(this.activePageIndex, `Page ${pageNumForHash}`, `#${pageNumForHash}`);
  }

  // Trigger custom events for slide transitions.
  this.dispatchSlideEvent('pagechange', this.activePageIndex + 1, this.lastPageIndex + 1);
  this.dispatchSlideEvent('pageenter', this.activePageIndex + 1);
  this.dispatchSlideEvent('pageleave', this.lastPageIndex + 1);

  // Consider enabling iframes or other heavy content for active and adjacent slides.
  this.activateContentForVisiblePages(this.activePageIndex);
  this.activateContentForVisiblePages(this.activePageIndex + 1); // Pre-load next slide's content.

  console.log(`Display refreshed. Current page: ${this.activePageIndex + 1}`);
};


/**
 * @private
 * @param {string} eventName The name of the custom event to dispatch (e.g., 'pageenter').
 * @param {number} currentPageNum The 1-based number of the current page.
 * @param {number} [previousPageNum] The 1-based number of the previous page (optional).
 * @description Dispatches custom events for slide transitions.
 */
PresentationDisplayManager.prototype.dispatchSlideEvent = function(eventName, currentPageNum, previousPageNum) {
  const eventDetail = {
    bubbles: true,
    cancelable: true,
    detail: {
      pageNumber: currentPageNum,
      previousPageNumber: previousPageNum
    }
  };
  const customEvent = new CustomEvent(eventName, eventDetail);
  const targetPage = this.presentationPages[currentPageNum - 1];
  if (targetPage) {
    targetPage.dispatchEvent(customEvent);
  } else {
    document.dispatchEvent(customEvent); // Fallback to document if slide not found.
  }
};


/**
 * @private
 * @param {Array<string>} themeNames An array of theme CSS file names.
 * @description Loads specified CSS themes by injecting link elements.
 */
PresentationDisplayManager.prototype.applyThemeStyles = function(themeNames) {
  if (!Array.isArray(themeNames) || themeNames.length === 0) {
    console.debug('No themes specified to load.');
    return;
  }
  themeNames.forEach(theme => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = this.STYLE_ASSET_PATH + theme + '.css';
    document.head.appendChild(link);
    console.debug(`Theme '${theme}' loaded.`);
  });
};

/**
 * @private
 * @param {string} favIconUrl The URL to the favicon image.
 * @description Sets the presentation's favicon.
 */
PresentationDisplayManager.prototype.setupFavicon = function(favIconUrl) {
  if (!favIconUrl) {
    console.warn('No favicon URL provided.');
    return;
  }
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = favIconUrl;
  console.debug(`Favicon set to: ${favIconUrl}`);
};

/**
 * @private
 * @description Placeholder for loading analytics script (e.g., Google Analytics).
 */
PresentationDisplayManager.prototype.initAnalytics = function() {
  console.log('Analytics initialization placeholder. Implement actual analytics loading here.');
  // Example:
  // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  // })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  // ga('create', 'UA-XXXXX-Y', 'auto');
  // ga('send', 'pageview');
};

/**
 * @private
 * @description Placeholder for processing incremental build lists within slides.
 * This method typically scans slides for elements marked for staggered appearance.
 */
PresentationDisplayManager.prototype.prepareIncrementalBuilds = function() {
  this.presentationPages.forEach(page => {
    // Find all elements within this page that are part of an incremental build.
    // Mark them as pending.
    page.querySelectorAll('.build > *').forEach((item, index) => {
      item.classList.add('incremental-step-pending');
      // If it's the first item in a build, it might be visible initially or on first build.
      // For now, all start pending.
    });
  });
  console.debug('Incremental build lists prepared.');
};

/**
 * @private
 * @param {number} pageIndex The 0-based index of the page for which to activate content.
 * @description Activates embedded content (like iframes) for a given page.
 * This prevents loading all iframes at once for performance.
 */
PresentationDisplayManager.prototype.activateContentForVisiblePages = function(pageIndex) {
  const targetPage = this.presentationPages[pageIndex];
  if (!targetPage) {
    return;
  }
  targetPage.querySelectorAll('iframe[data-src]').forEach(iframe => {
    // Only load if not already loaded.
    if (!iframe.src) {
      iframe.src = iframe.dataset.src;
      iframe.removeAttribute('data-src'); // Prevent re-loading.
      console.debug(`Activated iframe content for page ${pageIndex + 1}.`);
    }
  });
};

/* --- End Placeholder Methods --- */