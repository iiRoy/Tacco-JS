document.exitFullscreen = document.webkitCancelFullScreen ||
                            document.mozCancelFullScreen;

/**
 * @class
 * @param {HTMLElement} containerElement The main container for the presentation views.
 */
function PresentationViewer(containerElement) {
  this.currentViewIndex_ = 0;
  this.previousViewIndex_ = 0;
  this.displaySettings_ = null;
  this.mainContainer = containerElement || document.querySelector('presentation');
  this.displayUnits = [];
  this.presentationControl = null;

  // Obtain the starting view from the browser's URL hash.
  this.retrieveCurrentViewFromURL_();

  // Execute the content-ready handler directly, as feature detection libraries
  // might not be fully loaded until after the DOM is ready.
  this.onContentReady_.bind(this)();
}

/**
 * @constant
 * @private
 * An array of CSS classes representing the state of each display unit relative to the current one.
 */
PresentationViewer.prototype.VIEW_STATUS_CLASSES_ = [
  'long-ago', 'past-unit', 'active-unit', 'next-unit', 'distant-future'];

/**
 * @constant
 * @private
 * The relative path to the CSS theme directory.
 */
PresentationViewer.prototype.STYLE_FOLDER_PATH_ = 'theme/styles/';

/**
 * @private
 * Reads the current view number from the URL hash and updates the internal index.
 */
PresentationViewer.prototype.retrieveCurrentViewFromURL_ = function() {
  var unitIdentifier = parseInt(document.location.hash.slice(1));

  if (unitIdentifier) {
    this.currentViewIndex_ = unitIdentifier - 1;
  } else {
    this.currentViewIndex_ = 0;
  }
};

/**
 * @param {number} unitIndex The number of the view to load.
 */
PresentationViewer.prototype.displayUnit = function(unitIndex) {
  if (unitIndex) {
    this.currentViewIndex_ = unitIndex - 1;
    this.refreshDisplayUnits_();
  }
};

/**
 * @private
 * @param {Event} eventObject The DOMContentLoaded event.
 * Handles actions to be performed once the document's DOM is fully loaded.
 */
PresentationViewer.prototype.onContentReady_ = function(eventObject) {
  // document.body.classList.add('loaded'); // Mark body as loaded for template styling.

  this.displayUnits = this.mainContainer.querySelectorAll('section:not([hidden]):not(.background-layer)');

  // Apply specific styles if the device is a smartphone.
  if (FeatureDetect.mediaQuery('only screen and (max-device-width: 480px)')) {
    // var deviceStyle = document.createElement('link');
    // deviceStyle.rel = 'stylesheet';
    // deviceStyle.type = 'text/css';
    // deviceStyle.href = this.STYLE_FOLDER_PATH_ + 'mobile.css';
    // document.querySelector('head').appendChild(deviceStyle);

    // Widescreen layout is not necessary on mobile devices.
    this.mainContainer.classList.remove('wide-display-mode');
  }

  this.loadPresentationConfig_(PRESENTATION_SETUP);
  this.registerEventHandlers_();
  this.refreshDisplayUnits_();

  // Attach view numbers and total count metadata to each view element.
  var selfRef = this;
  for (var k = 0, currentUnit; currentUnit = this.displayUnits[k]; ++k) {
    currentUnit.dataset.unitNumber = k + 1;
    currentUnit.dataset.totalUnits = this.displayUnits.length;

    currentUnit.addEventListener('click', function(clickEvent) {
      if (document.body.classList.contains('summary-mode')) {
        selfRef.displayUnit(this.dataset.unitNumber);
        clickEvent.preventDefault();
        window.setTimeout(function() {
          selfRef.toggleSummary();
        }, 500);
      }
    }, false);
  }

  // This must be initialized after `registerEventHandlers_()` because it relies
  // on the keydown listener. Also, skip for touch-enabled devices.
  if (!FeatureDetect.hasTouch) {
    this.presentationControl = new PresentationController(this);
    if (this.presentationControl.isSecondaryWindow) {
      document.body.classList.add('secondary-view');
    }
  }
};

/**
 * @private
 * Registers various event listeners for keyboard, history, and transitions.
 */
PresentationViewer.prototype.registerEventHandlers_ = function() {
  document.addEventListener('keydown', this.onDocumentKeyPress_.bind(this), false);
  window.addEventListener('popstate', this.onHistoryStateChange_.bind(this), false);

  // var transitionEndEventNames = {
  //   'WebkitTransition': 'webkitTransitionEnd',
  //   'MozTransition': 'transitionend',
  //   'OTransition': 'oTransitionEnd',
  //   'msTransition': 'MSTransitionEnd',
  //   'transition': 'transitionend'
  // };
  //
  // // Determine the correct vendor-prefixed transitionEnd event name.
  // window.transitionEndEventName = transitionEndEventNames[
  //     FeatureDetect.prefixedProperty('transition')];
  //
  // // Once views have finished transitioning, initiate iframe loading.
  // // Note: This only monitors the main view transition, not any nested build animations.
  // this.mainContainer.addEventListener(transitionEndEventName, function(event) {
  //     this.activateUnitIframes_(this.currentViewIndex_);
  // }.bind(this), false);

  // document.addEventListener('viewenter', function(viewEvent) {
  //   var activeView = viewEvent.target;
  //   window.setTimeout(function() {
  //     this.activateUnitIframes_(viewEvent.viewNumber);
  //     this.activateUnitIframes_(viewEvent.viewNumber + 1);
  //   }.bind(this), 300);
  // }.bind(this), false);
};

/**
 * @private
 * @param {PopStateEvent} historyEvent The popstate event object.
 * Handles changes in the browser's history state.
 */
PresentationViewer.prototype.onHistoryStateChange_ = function(historyEvent) {
  if (historyEvent.stateData != null) {
    this.currentViewIndex_ = historyEvent.stateData;
    this.refreshDisplayUnits_(true);
  }
};

/**
 * @param {KeyboardEvent} keyEvent The keyboard event object.
 * Handles keyboard input for navigation and presentation controls.
 */
PresentationViewer.prototype.onDocumentKeyPress_ = function(keyEvent) {
  if (/^(input|textarea)$/i.test(keyEvent.target.tagName) ||
      keyEvent.target.contentEditable) {
    return;
  }

  // If this is a secondary window (e.g., presenter notes), forward key presses to the main window.
  if (this.presentationControl && this.presentationControl.isSecondaryWindow) {
    this.presentationControl.sendMessage({keyIdentifier: keyEvent.keyCode});
  }

  switch (keyEvent.keyCode) {
    case 13: // Enter key
      if (document.body.classList.contains('summary-mode')) {
        this.toggleSummary();
      }
      break;

    case 39: // Right arrow key
    case 32: // Spacebar
    case 34: // Page Down key
      this.advanceUnit();
      keyEvent.preventDefault();
      break;

    case 37: // Left arrow key
    case 8: // Backspace key
    case 33: // Page Up key
      this.retreatUnit();
      keyEvent.preventDefault();
      break;

    case 40: // Down arrow key
      this.advanceUnit();
      keyEvent.preventDefault();
      break;

    case 38: // Up arrow key
      this.retreatUnit();
      keyEvent.preventDefault();
      break;

    case 72: // H key: Toggle code highlighting
      document.body.classList.toggle('code-highlight-enabled');
      break;

    case 79: // O key: Toggle overview/summary mode
      this.toggleSummary();
      break;

    case 80: // P key
      if (this.presentationControl && this.presentationControl.isSecondaryWindow) {
        document.body.classList.toggle('speaker-notes-visible');
      } else if (this.presentationControl && !this.presentationControl.secondaryWindow) {
        document.body.classList.toggle('speaker-notes-visible');
      }
      break;

    case 82: // R key
      // TODO: Implement refresh functionality for the main presentation when the secondary window is refreshed.
      break;

    case 27: // ESC key: Hide notes and highlighting
      document.body.classList.remove('speaker-notes-visible');
      document.body.classList.remove('code-highlight-enabled');

      if (document.body.classList.contains('summary-mode')) {
        this.toggleSummary();
      }
      break;

    case 70: // F key: Toggle fullscreen mode
       // Only respond to 'f' when the target is the document body.
       // Avoid interfering with browser's native fullscreen shortcut (Cmd/Ctrl+Shift+F).
      if (keyEvent.target == document.body && !(keyEvent.shiftKey && keyEvent.metaKey)) {
        if (document.isMozFullscreen !== undefined && !document.isMozFullscreen) {
          document.body.requestMozFullscreen(DomElement.ENABLE_KEYBOARD_INTERACTION);
        } else if (document.isWebkitFullscreen !== undefined && !document.isWebkitFullscreen) {
          document.body.requestWebkitFullscreen(DomElement.ENABLE_KEYBOARD_INTERACTION);
        } else {
          document.exitFullscreen();
        }
      }
      break;

    case 87: // W key: Toggle widescreen layout
      // Only respond to 'w' when the target is the document body.
      if (keyEvent.target == document.body && !(keyEvent.shiftKey && keyEvent.metaKey)) {
        this.mainContainer.classList.toggle('wide-display-mode');
      }
      break;
  }
};

/**
 * @private
 * Adjusts the position of presentation views when in summary mode.
 */
PresentationViewer.prototype.centerSummaryView_ = function() {
  var inSummary = document.body.classList.contains('summary-mode');

  for (var k = 0, unitElem; unitElem = this.displayUnits[k]; k++) {
    unitElem.style[FeatureDetect.prefixedProperty('transform')] = inSummary ?
        'translateZ(-2500px) translate(' + (( k - this.currentViewIndex_ ) * 105) +
                                       '%, 0%)' : '';
  }
};

/**
 * Toggles the presentation's summary (overview) mode.
 */
PresentationViewer.prototype.toggleSummary = function() {
  document.body.classList.toggle('summary-mode');

  this.centerSummaryView_();
};

/**
 * @private
 * @param {Object} presentationConfig The configuration object for the presentation.
 * Loads and applies presentation settings from the provided configuration.
 */
PresentationViewer.prototype.loadPresentationConfig_ = function(presentationConfig) {
  if (!presentationConfig) {
    return;
  }

  this.displaySettings_ = presentationConfig;

  var options = this.displaySettings_.options;

  this.applyTheme_(options.visualTheme || []);

  if (options.shortcutIcon) {
    this.addShortcutIcon_(options.shortcutIcon);
  }

  // Code highlighting. Enabled by default.
  if (!!!('enableCodeHighlighting' in options) || options.enableCodeHighlighting) {
    highlightCode();
  }

  if (options.enableAnalytics) {
    this.initAnalytics_();
  }

  if (options.customFonts) {
    this.addCustomFonts_(options.customFonts);
  }

  // Build steps within views. Enabled by default.
  if (!!!('enableBuildSteps' in options) || options.enableBuildSteps) {
    this.createBuildSequences_();
  }

  if (options.presentationTitle) {
    document.title = options.presentationTitle.replace(/<br\/?>/, ' ') + ' - Open Web Camp IV ApplicationCache Presentation';
    document.querySelector('[data-setup-title]').innerHTML = options.presentationTitle;
  }

  if (options.presentationSubtitle) {
    document.querySelector('[data-setup-subtitle]').innerHTML = options.presentationSubtitle;
  }

  if (this.displaySettings_.presentersInfo) {
    var presenterList = this.displaySettings_.presentersInfo;
    var contactDetailsArea = document.querySelector('[data-setup-contact]');

    var htmlContent = [];
    if (presenterList.length == 1) {
      var person = presenterList[0];

      htmlContent = [person.fullName, person.organization].join('<br>');

      var googlePlusLink = person.googlePlusLink ? '<span>g+</span><a href="' + person.googlePlusLink +
          '">' + person.googlePlusLink.replace(/https?:\/\//, '') + '</a>' : '';

      var twitterHandle = person.twitterHandle ? '<span>twitter</span>' +
          '<a href="http://twitter.com/' + person.twitterHandle + '">' +
          person.twitterHandle + '</a>' : '';

      var websiteURL = person.websiteURL ? '<span>www</span><a href="' + person.websiteURL +
                        '">' + person.websiteURL.replace(/https?:\/\//, '') + '</a>' : '';

      var githubProfile = person.githubProfile ? '<span>github</span><a href="' + person.githubProfile +
          '">' + person.githubProfile.replace(/https?:\/\//, '') + '</a>' : '';

      var contactInfoHtml = [googlePlusLink, twitterHandle, websiteURL, githubProfile].join('<br>');

      if (contactDetailsArea) {
        contactDetailsArea.innerHTML = contactInfoHtml;
      }
    } else {
      for (var j = 0, person; person = presenterList[j]; ++j) {
        htmlContent.push(person.fullName + ' - ' + person.organization);
      }
      htmlContent = htmlContent.join('<br>');
      contactDetailsArea.innerHTML = htmlContent;
    }

    var presenterInfoArea = document.querySelector('[data-setup-presenter]');
    if (presenterInfoArea) {
      document.querySelector('[data-setup-presenter]').innerHTML = htmlContent;
    }
  }

  /* Left/Right tap areas for navigation. Enabled by default. */
  if (!!!('activateNavigationAreas' in options) || options.activateNavigationAreas) {
    var navArea = document.createElement('div');
    navArea.classList.add('navigation-zone');
    navArea.id = 'previous-unit-zone';
    navArea.addEventListener('click', this.retreatUnit.bind(this), false);
    this.mainContainer.appendChild(navArea);

    var navArea = document.createElement('div');
    navArea.classList.add('navigation-zone');
    navArea.id = 'next-unit-zone';
    navArea.addEventListener('click', this.advanceUnit.bind(this), false);
    this.mainContainer.appendChild(navArea);
  }

  if (FeatureDetect.hasTouch && (!!!('activateTouchGestures' in options) ||
      options.activateTouchGestures)) {
    var instance = this;

    // This prevents mobile device zooming but also fixes iOS's scroll overflow issue.
    window.addEventListener('touchstart', function(touchEvent) {
      touchEvent.preventDefault();
    }, false);

    var gestureRecognizer = new GestureRecognizer(this.mainContainer);
    gestureRecognizer.onGestureEnd = function(gestureEvent) {
      if (gestureEvent.direction == 'right' || gestureEvent.direction == 'down') {
        instance.retreatUnit();
      } else if (gestureEvent.direction == 'left' || gestureEvent.direction == 'up') {
        instance.advanceUnit();
      }
    };
  }
};

/**
 * @private
 * @param {Array.<string>} fontFamilies An array of font family names to load.
 * Adds custom fonts by dynamically creating a stylesheet link.
 */
PresentationViewer.prototype.addCustomFonts_ = function(fontFamilies) {
  var fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://fonts.googleapis.com/css?family=' + fontFamilies.join('|') + '&v2';
  document.querySelector('head').appendChild(fontLink);
};

/**
 * @private
 * Advances to the next item in a build sequence within the current view.
 * @returns {boolean} True if a next item was built, false otherwise.
 */
PresentationViewer.prototype.processNextBuildStep_ = function() {
  var currentDisplayUnit = this.displayUnits[this.currentViewIndex_];
  var nextSequenceItem = currentDisplayUnit.querySelector('.to-be-sequenced');
  var currentSequenceItem = currentDisplayUnit.querySelector('.sequence-active');

  if (currentSequenceItem) {
    currentSequenceItem.classList.remove('sequence-active');
    if (currentSequenceItem.classList.contains('fading-effect')) {
      currentSequenceItem.classList.add('sequence-faded');
    }
  }

  if (!nextSequenceItem) {
    var fadedItems = currentDisplayUnit.querySelectorAll('.sequence-faded');
    for (var l = 0, fadedItem; fadedItem = fadedItems[l]; l++) {
      fadedItem.classList.remove('sequence-faded');
    }
    return false;
  }

  nextSequenceItem.classList.remove('to-be-sequenced');
  nextSequenceItem.classList.add('sequence-active');

  return true;
};

/**
 * @param {boolean=} omitHistoryPush Optional. If true, the slide change will not be pushed to browser history.
 * Navigates to the previous presentation view.
 */
PresentationViewer.prototype.retreatUnit = function(omitHistoryPush) {
  if (this.currentViewIndex_ > 0) {
    var pageBodyClasses = document.body.classList;
    pageBodyClasses.remove('code-highlight-enabled');

    // Turn off speaker notes if visible when moving backward in the main presentation.
    // If this is the presenter notes window, keep them visible.
    if (this.presentationControl && !this.presentationControl.isSecondaryWindow) {
      pageBodyClasses.remove('speaker-notes-visible');
    } else if (!this.presentationControl) {
      pageBodyClasses.remove('speaker-notes-visible');
    }

    this.previousViewIndex_ = this.currentViewIndex_--;

    this.refreshDisplayUnits_(omitHistoryPush);
  }
};

/**
 * @param {boolean=} omitHistoryPush Optional. If true, the slide change will not be pushed to browser history.
 * Navigates to the next presentation view or advances a build step within the current view.
 */
PresentationViewer.prototype.advanceUnit = function(omitHistoryPush) {
  if (!document.body.classList.contains('summary-mode') && this.processNextBuildStep_()) {
    return;
  }

  if (this.currentViewIndex_ < this.displayUnits.length - 1) {
    var pageBodyClasses = document.body.classList;
    pageBodyClasses.remove('code-highlight-enabled');

    // Turn off speaker notes if visible when advancing in the main presentation.
    // If this is the presenter notes window, keep them visible.
    if (this.presentationControl && !this.presentationControl.isSecondaryWindow) {
      pageBodyClasses.remove('speaker-notes-visible');
    } else if (!this.presentationControl) {
      pageBodyClasses.remove('speaker-notes-visible');
    }

    this.previousViewIndex_ = this.currentViewIndex_++;

    this.refreshDisplayUnits_(omitHistoryPush);
  }
};

/* View Event Dispatching */

/**
 * Dispatches a custom event when a view enters or leaves.
 *
 * @param {string} eventType The type of event to trigger
 *     (e.g., 'viewenter', 'viewleave').
 * @param {number} viewNumber The index of the view involved in the event.
 */