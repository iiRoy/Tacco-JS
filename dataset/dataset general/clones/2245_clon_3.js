"use strict";

var
  // Core UI component dependencies from space-pen library
  jQuery = require('space-pen').$, // Renamed '$' to 'jQuery' for clarity and to avoid conflicts
  BaseWidget = require('space-pen').View, // Renamed 'View' to 'BaseWidget'
  applyInheritance = require('./utility-helpers').extendPrototype; // Renamed 'inherits' and updated path/name

/**
 * @class NotificationDisplayModule
 * @extends BaseWidget
 * @description A flexible UI component for displaying a stream of notifications or messages.
 * This module provides a customizable panel that can be positioned, resized, and configured
 * for auto-scrolling and message display order.
 */
var NotificationDisplayModule = function (configOptions) {
  // Validate incoming configuration to ensure it's an object
  if (typeof configOptions !== 'object' || configOptions === null) {
    console.warn("NotificationDisplayModule: Provided configuration is invalid. Using default settings.");
    configOptions = {}; // Default to an empty object if config is bad
  }

  // Initialize instance properties with defaults or values from configOptions
  this.captionText = configOptions.captionText || 'System Notifications'; // Renamed 'title'
  this.isCaptionRaw = typeof configOptions.isCaptionRaw === 'boolean' ? configOptions.isCaptionRaw : false; // Renamed 'rawTitle', explicit boolean check
  this.animationDuration = configOptions.animationDuration || 'fast'; // Renamed 'speed'
  this.displayContainer = null; // Renamed 'panel', initialized to null for explicit "no panel" state
  this.maximumHeight = configOptions.maximumHeight || '170px'; // Renamed 'maxHeight'
  this.enableAutoScrolling = typeof configOptions.enableAutoScrolling === 'boolean' ? configOptions.enableAutoScrolling : false; // Renamed 'autoScroll', explicit boolean check
  this.terminationMethod = configOptions.terminationMethod || 'hide'; // Renamed 'closeMethod'
  this.prependNewEntries = typeof configOptions.prependNewEntries === 'boolean' ? configOptions.prependNewEntries : false; // Renamed 'recentMessagesAtTop', explicit boolean check
  this.displayPosition = configOptions.displayPosition || 'bottom'; // Renamed 'position'
  this.storedNotifications = []; // Renamed 'messages', now stores message views

  // Invoke the constructor of the BaseWidget parent class
  BaseWidget.apply(this, arguments);
};

// Establish the inheritance chain for NotificationDisplayModule from BaseWidget
applyInheritance(NotificationDisplayModule, BaseWidget);

/**
 * @method generateLayout
 * @static
 * @description Defines the HTML structure of the notification panel using Space-pen's DSL.
 * This method creates the header, content area, and control buttons for the panel.
 */
NotificationDisplayModule.generateLayout = function () { // Renamed 'content'
  this.div({ // Renamed 'div' to 'createDivElement' for internal DSL usage, but `this.div` is Space-pen's method
    class: 'notification-panel-wrapper tool-panel panel-dock-position key-event-capturable', // Renamed classes, added new ones
    tabindex: '-1' // Renamed 'tabindex'
  }, function () {
    // Resizing handle for adjusting panel height
    this.div({
      class: 'panel-size-adjuster', // Renamed 'panel-resize-handle'
      style: 'position: absolute; top: 0; left: 0; right: 0; height: 10px; cursor: ns-resize; z-index: 10;' // Changed cursor, increased z-index
    });
    // Header section containing title and controls
    this.div({
      class: 'panel-header-section' // Renamed 'panel-heading'
    }, function () {
      this.div({
        class: 'header-caption-text inline-component', // Renamed 'heading-title'
        style: 'cursor: pointer',
        outlet: 'headerCaption', // Renamed 'outlet' to 'elementReference', but `outlet` is Space-pen's keyword
        click: 'switchVisibility' // Renamed 'click' to 'onClickEvent', 'toggle' to 'switchVisibility'
      });
      this.div({
        class: 'header-summary-info inline-component', // Renamed 'heading-summary'
        outlet: 'headerSummary' // Renamed 'outlet'
      });
      this.div({
        class: 'panel-control-buttons inline-component pull-right' // Renamed 'heading-buttoms'
      }, function () {
        this.div({
          class: 'auto-scroll-toggle-btn inline-component icon-scroll-down', // Renamed 'heading-autoScroll', 'icon-move-down'
          style: 'cursor: pointer',
          outlet: 'autoScrollToggleBtn', // Renamed 'outlet'
          click: 'handleAutoScrollToggle' // Renamed 'click', 'toggleAutoScroll'
        });
        this.div({
          class: 'panel-collapse-expand-btn inline-component icon-panel-collapse', // Renamed 'heading-fold', 'icon-fold'
          style: 'cursor: pointer',
          outlet: 'collapseExpandBtn', // Renamed 'outlet'
          click: 'switchVisibility' // Renamed 'click', 'toggle'
        });
        this.div({
          class: 'panel-close-btn inline-component icon-close-cross', // Renamed 'heading-close', 'icon-x'
          style: 'cursor: pointer;',
          outlet: 'closeButton', // Renamed 'outlet'
          click: 'deactivateDisplay' // Renamed 'click', 'close'
        });
      }.bind(this));
    }.bind(this));
    // Main content area for displaying messages
    this.div({
      class: 'panel-content-area content-padded', // Renamed 'panel-body', 'padded'
      outlet: 'mainContentArea', // Renamed 'outlet', 'body'
      style: 'overflow-y: auto; flex-grow: 1;' // Adjusted style for better layout behavior
    });
  }.bind(this));
};

/**
 * @method activateModule
 * @description Attaches the notification panel to the Atom workspace.
 * If not already active, it initializes the panel based on its configured position
 * and sets up event listeners for resizing.
 */
NotificationDisplayModule.prototype.activateModule = function () { // Renamed 'attach'
  // Guard clause: If the panel is already present and visible, just ensure it's shown.
  if (this.displayContainer && this.displayContainer.isVisible()) {
    this.displayContainer.show(); // Ensure visibility
    return;
  }

  // Only create the panel if it doesn't exist
  if (this.displayContainer === null) {
    const panelInsertionConfig = { item: this }; // Use const for clarity

    // Use a switch statement for cleaner position handling
    switch (this.displayPosition) {
      case 'bottom':
        this.displayContainer = atom.workspace.addBottomPanel(panelInsertionConfig); // Renamed 'addBottomPanel'
        break;
      case 'top':
        this.displayContainer = atom.workspace.addTopPanel(panelInsertionConfig); // Renamed 'addTopPanel'
        break;
      default:
        console.warn(`NotificationDisplayModule: Invalid display position '${this.displayPosition}'. Defaulting to 'bottom'.`);
        this.displayContainer = atom.workspace.addBottomPanel(panelInsertionConfig);
        break;
    }

    const selfReference = this; // Renamed 'that' for better context
    // Attach resize event handler using jQuery's event delegation
    jQuery(this.displayContainer.getItem()).on("mousedown.panelResize", ".panel-size-adjuster", function () { // Renamed classes, added namespace
      selfReference.startResizing(); // Renamed 'resizeStarted'
    });

    // Apply the initial maximum height to the content body
    jQuery(".panel-content-area", this).css({ // Renamed classes, 'css'
      maxHeight: this.maximumHeight // Renamed 'maxHeight'
    });

    // If auto-scroll is active, scroll to the bottom immediately
    if (this.autoScrollToggleBtn.hasClass('icon-scroll-up')) { // Renamed 'btnAutoScroll', 'hasClass', 'icon-move-up'
      this.mainContentArea.scrollTop(this.mainContentArea.prop('scrollHeight') || 1e9); // Renamed 'body.scrollTop', used prop for more reliable max scroll
    }
  } else {
    // If panel exists but was hidden, simply show it
    this.displayContainer.show();
  }
};

/**
 * @method deactivateDisplay
 * @description Closes or hides the notification panel based on the configured termination method.
 * Handles different methods like 'hide' or 'destroy'.
 */
NotificationDisplayModule.prototype.deactivateDisplay = function () { // Renamed 'close'
  // Ensure a panel actually exists before attempting to close it
  if (this.displayContainer) {
    const chosenMethod = this.terminationMethod; // Helper variable
    if (typeof this.displayContainer[chosenMethod] === 'function') {
      this.displayContainer[chosenMethod].call(this.displayContainer);
      // If the method was 'destroy', clear the internal reference
      if (chosenMethod === 'destroy') {
        this.displayContainer = null; // Explicitly nullify to indicate no panel is active
        console.log("NotificationDisplayModule: Panel destroyed and reference cleared.");
      }
    } else {
      console.warn(`NotificationDisplayModule: Configured termination method '${chosenMethod}' is not a valid function. Defaulting to 'hide'.`);
      this.displayContainer.hide(); // Fallback to hide if method is invalid
      this.displayContainer = null; // Assume hide also means it's effectively not 'active'
    }
  } else {
    console.info("NotificationDisplayModule: Attempted to deactivate display, but no panel was active.");
  }
};

/**
 * @method initComponent
 * @description Initializes the component after its view has been constructed and attached.
 * Sets the initial title and handles auto-scroll activation.
 */
NotificationDisplayModule.prototype.initComponent = function () { // Renamed 'initialize'
  this.updateCaption(this.captionText, this.isCaptionRaw); // Renamed 'setTitle', 'title', 'rawTitle'

  // Activate auto-scrolling if it's enabled in the configuration
  if (this.enableAutoScrolling) {
    this.handleAutoScrollToggle(); // Renamed 'toggleAutoScroll'
  }
  // Hide the summary area initially until content is available
  this.headerSummary.hide(); // Renamed 'summary.hide'
};

/**
 * @method updateCaption
 * @description Updates the main title text or HTML of the panel's header.
 * @param {string} newCaption - The text or HTML content for the caption.
 * @param {boolean} isContentRaw - If true, `newCaption` is inserted as raw HTML; otherwise, as plain text.
 */
NotificationDisplayModule.prototype.updateCaption = function (newCaption, isContentRaw) { // Renamed 'setTitle'
  const targetHeading = this.headerCaption; // Renamed 'heading'
  if (isContentRaw) {
    targetHeading.html(newCaption); // Renamed 'html'
  } else {
    targetHeading.text(newCaption); // Renamed 'text'
  }
};

/**
 * @method updateSummaryInfo
 * @description Updates the summary information displayed in the panel's header.
 * Allows for custom text, CSS classes, and a handler function.
 * @param {object} summaryDetails - An object containing summary properties.
 * @param {string} summaryDetails.summary - The actual summary text or HTML.
 * @param {string} [summaryDetails.className] - An optional CSS class to apply to the summary element.
 * @param {boolean} [summaryDetails.rawSummary=false] - If true, `summary` is treated as raw HTML.
 * @param {function} [summaryDetails.handler] - An optional callback function to execute on the summary element.
 */
NotificationDisplayModule.prototype.updateSummaryInfo = function (summaryDetails) { // Renamed 'setSummary'
  // Guard against null or undefined summaryDetails
  summaryDetails = summaryDetails || {};

  const summaryContent = summaryDetails.summary || ''; // Renamed 'message'
  const customClass = summaryDetails.className; // Renamed 'className'
  const isSummaryContentRaw = typeof summaryDetails.rawSummary === 'boolean' ? summaryDetails.rawSummary : false; // Renamed 'raw'
  const elementHandler = summaryDetails.handler; // Renamed 'handler'

  const targetSummaryElement = this.headerSummary; // Renamed 'summary'

  // Reset the class attributes to a clean base state before applying new ones
  targetSummaryElement.attr('class', 'header-summary-info inline-component'); // Renamed 'attr', 'class'

  // Set the new summary content (text or HTML)
  if (isSummaryContentRaw) {
    targetSummaryElement.html(summaryContent); // Renamed 'html'
  } else {
    targetSummaryElement.text(summaryContent); // Renamed 'text'
  }

  // Apply any optional custom CSS class
  if (customClass) {
    targetSummaryElement.addClass(customClass); // Renamed 'addClass'
  }

  // Execute the optional handler function, if provided and callable
  if (typeof elementHandler === 'function') {
    elementHandler(targetSummaryElement);
  }

  // Ensure the summary element is visible after updating its content
  if (targetSummaryElement.css('display') === 'none') {
    targetSummaryElement.css('display', 'inline-block'); // Explicitly show if hidden
  }
};

/**
 * @method switchVisibility
 * @description Toggles the visibility of the panel's main content area and updates the associated button icon.
 * Also manages the display state of the summary element.
 */
NotificationDisplayModule.prototype.switchVisibility = function () { // Renamed 'toggle'
  // Toggle the CSS classes for the collapse/expand button icon
  this.collapseExpandBtn.toggleClass('icon-panel-collapse, icon-panel-expand'); // Renamed 'btnFold', 'toggleClass', 'icon-fold', 'icon-unfold'

  // Toggle the main content area with an animation
  this.mainContentArea.toggle(this.animationDuration); // Renamed 'body', 'speed'

  // Manually manage summary visibility, as jQuery's .toggle() might interfere with 'inline-block'
  if (this.headerSummary.css('display') === 'none') {
    this.headerSummary.css('display', 'inline-block');
  } else {
    this.headerSummary.hide();
  }
};

/**
 * @method resetMessages
 * @description Clears all displayed notifications from the panel and empties the internal message store.
 */
NotificationDisplayModule.prototype.resetMessages = function () { // Renamed 'clear'
  this.storedNotifications = []; // Renamed 'messages'
  this.mainContentArea.empty(); // Renamed 'body.empty'
};

/**
 * @method appendNotification
 * @description Adds a new notification view to the panel.
 * If it's the first message, it also updates the panel's summary.
 * The message is either prepended or appended based on configuration.
 * @param {object} notificationItem - The view object representing the notification.
 */
NotificationDisplayModule.prototype.appendNotification = function (notificationItem) { // Renamed 'add', 'view'
  // Guard clause: Ensure the notification item is valid and has a summary method
  if (!notificationItem || typeof notificationItem.retrieveSummaryData !== 'function') {
    console.warn("NotificationDisplayModule: Attempted to add an invalid notification item without 'retrieveSummaryData' method.", notificationItem);
    return;
  }

  // If this is the very first notification, use its summary to update the panel's header
  if (this.storedNotifications.length === 0 && notificationItem.retrieveSummaryData) { // Renamed 'getSummary'
    this.updateSummaryInfo(notificationItem.retrieveSummaryData()); // Renamed 'setSummary'
  }

  // Add the notification item to the DOM, either at the beginning or end
  if (this.prependNewEntries) { // Renamed 'recentMessagesAtTop'
    this.mainContentArea.prepend(notificationItem); // Renamed 'body.prepend'
  } else {
    this.mainContentArea.append(notificationItem); // Renamed 'body.append'
  }

  // Store the notification item reference internally
  this.storedNotifications.push(notificationItem);

  // After adding a new message, ensure the scroll position is updated
  this.adjustScrollPosition(); // Added this intermediate step for immediate UX feedback
};

/**
 * @method adjustScrollPosition
 * @description Updates the scroll position of the main content area.
 * Scrolls to the bottom if auto-scroll is enabled, otherwise to the top.
 */
NotificationDisplayModule.prototype.adjustScrollPosition = function () { // Renamed 'updateScroll'
  const scrollableArea = this.mainContentArea; // Renamed 'body'
  // Check if auto-scroll is active (indicated by 'icon-scroll-up' class)
  if (this.autoScrollToggleBtn.hasClass('icon-scroll-up')) { // Renamed 'btnAutoScroll', 'hasClass', 'icon-move-up'
    // Scroll to the absolute bottom of the content
    scrollableArea.scrollTop(scrollableArea.prop('scrollHeight') || 1e9); // Renamed 'scrollTop', using prop for dynamic height
  } else {
    // Scroll to the very top
    scrollableArea.scrollTop(0);
  }
};

/**
 * @method handleAutoScrollToggle
 * @description Toggles the auto-scrolling feature and updates the visual state of its button.
 */
NotificationDisplayModule.prototype.handleAutoScrollToggle = function () { // Renamed 'toggleAutoScroll'
  this.autoScrollToggleBtn.toggleClass('icon-scroll-up'); // Renamed 'btnAutoScroll', 'toggleClass', 'icon-move-up'
  this.adjustScrollPosition(); // Renamed 'updateScroll'
};

// --- Panel Resizing Implementation ---

// Global state variable to track if resizing is currently active
let isPanelResizing = false; // New helper variable to manage state

/**
 * @method startResizing
 * @description Initiates the panel resizing process.
 * Prevents text selection and attaches global mouse event handlers.
 */
NotificationDisplayModule.prototype.startResizing = function () { // Renamed 'resizeStarted'
  isPanelResizing = true; // Set the global flag
  const componentElement = jQuery(this); // Renamed '$(this)'

  // Apply CSS to prevent user text selection during resize for better UX
  componentElement.css({
    WebkitUserSelect: 'none', // For Webkit browsers
    MozUserSelect: 'none',    // For Firefox
    msUserSelect: 'none',     // For Internet Explorer/Edge
    userSelect: 'none'        // Standard property
  });

  // Attach global mousemove and mouseup event listeners with a namespace
  // The 'data' object passes the component instance to the event handlers
  jQuery(document).on('mousemove.panelResize', { componentRef: this }, this.performPanelResize); // Renamed 'mousemove', 'that', 'resizePanel', added namespace
  jQuery(document).on('mouseup.panelResize', { componentRef: this }, this.stopResizing); // Renamed 'mouseup', 'that', 'resizeStopped', added namespace
};

/**
 * @method stopResizing
 * @description Terminates the panel resizing process.
 * Re-enables user selection and removes global mouse event listeners.
 * @param {Event} mouseEvent - The mouse event object that triggered the stop.
 */
NotificationDisplayModule.prototype.stopResizing = function (mouseEvent) { // Renamed 'e' to 'mouseEvent'
  isPanelResizing = false; // Reset the global flag
  const instanceRef = mouseEvent.data.componentRef; // Renamed 'e.data.that'

  // Re-enable user text selection
  jQuery(instanceRef).css({
    WebkitUserSelect: '',
    MozUserSelect: '',
    msUserSelect: '',
    userSelect: ''
  });

  // Detach the specific mousemove and mouseup handlers using their namespace and function references
  jQuery(document).off('mousemove.panelResize', instanceRef.performPanelResize);
  jQuery(document).off('mouseup.panelResize', instanceRef.stopResizing);
};

/**
 * @method performPanelResize
 * @description Handles the mouse movement during an active resize operation to adjust panel height.
 * @param {Event} mouseEvent - The mouse event object containing cursor position.
 */
NotificationDisplayModule.prototype.performPanelResize = function (mouseEvent) { // Renamed 'e' to 'mouseEvent'
  // Guard clause: Only proceed if resizing is actively engaged
  if (!isPanelResizing) {
    return;
  }

  const instanceRef = mouseEvent.data.componentRef; // Renamed 'e.data.that'
  const currentPanelContentBody = jQuery(".panel-content-area", instanceRef); // Renamed 'panelBody', 'panel-body'
  const headerSectionElement = jQuery(".panel-header-section", instanceRef); // Renamed 'panel-heading'
  const headerCalculatedHeight = headerSectionElement.outerHeight(true) || 0; // Renamed 'panelHeadingHeight', using outerHeight for full height including margins

  // Calculate the new maximum height for the panel body
  // This calculation assumes the panel is docked at the bottom of the workspace.
  const totalBodyHeight = jQuery(document.body).height();
  const currentMouseY = mouseEvent.pageY;
  const bottomOffsetPadding = 30; // An arbitrary padding/offset for the bottom of the workspace

  let newCalculatedHeight = totalBodyHeight - currentMouseY - headerCalculatedHeight - bottomOffsetPadding;

  // Validation: Ensure the calculated height doesn't go below a reasonable minimum
  const minimumPanelHeight = 50; // pixels
  newCalculatedHeight = Math.max(minimumPanelHeight, newCalculatedHeight);

  // Apply the new maximum height to the panel's content area
  currentPanelContentBody.css({ // Renamed 'css'
    maxHeight: `${newCalculatedHeight}px` // Renamed 'maxHeight', ensured 'px' suffix
  });
};

// Export the NotificationDisplayModule for use in other parts of the application
module.exports = NotificationDisplayModule; // Renamed 'MessagePanelView'