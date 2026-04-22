"use strict";

// Core dependencies for UI rendering and inheritance
var jq = require('space-pen').$,
    BaseWidget = require('space-pen').View,
    extendPrototype = require('./utilities').inheritClass;

// Main UI component for displaying notifications
var NotificationPanelUI = function(settings) {
    // Initializing component properties from provided settings
    this.caption = settings.caption;
    this.isRawCaption = settings.isRawCaption || false;
    this.animationDuration = settings.animationDuration || 'fast';
    this.hostPanel = void 0; // Reference to the Atom panel instance
    this.maximumHeight = settings.maximumHeight || '170px';
    this.enableAutoScrolling = settings.enableAutoScrolling || false;
    this.dismissAction = settings.dismissAction || 'hide';
    this.newEntriesAtTop = settings.newEntriesAtTop || false;
    this.placement = settings.placement || 'bottom';
    this.entryLog = []; // Collection of message views currently displayed

    // Call the base widget constructor
    BaseWidget.apply(this, arguments);
};

// Establish inheritance from the BaseWidget
extendPrototype(NotificationPanelUI, BaseWidget);

// Static method to define the HTML structure of the panel
NotificationPanelUI.generateLayout = function() {
    this.createDiv({
        cssClass: 'app-message-panel tool-pane-component native-key-bindings',
        tabIndexValue: '-1'
    }, function() {
        // Resizing handle for adjusting panel height
        this.createDiv({
            cssClass: 'pane-resizer-bar',
            style: 'position: absolute; top: 0; left: 0; right: 0; height: 10px; cursor: row-resize; z-index: 3'
        });
        // Header section of the panel
        this.createDiv({
            cssClass: 'pane-header-area'
        }, function() {
            // Main title/caption of the panel
            this.createDiv({
                cssClass: 'header-caption inline-block',
                style: 'cursor: pointer',
                outputReference: 'mainCaption',
                onClickHandler: 'switchVisibility'
            });
            // Brief summary area
            this.createDiv({
                cssClass: 'header-brief-summary inline-block',
                outputReference: 'briefInfo'
            });
            // Container for control buttons
            this.createDiv({
                cssClass: 'header-control-buttons inline-block pull-right'
            }, function() {
                // Auto-scroll toggle button
                this.createDiv({
                    cssClass: 'header-autoscroll-control inline-block icon-arrow-down',
                    style: 'cursor: pointer',
                    outputReference: 'scrollToggleBtn',
                    onClickHandler: 'toggleAutomaticScrolling'
                });
                // Fold/unfold content button
                this.createDiv({
                    cssClass: 'header-fold-control inline-block icon-collapse',
                    style: 'cursor: pointer',
                    outputReference: 'foldToggleBtn',
                    onClickHandler: 'switchVisibility'
                });
                // Close panel button
                this.createDiv({
                    cssClass: 'header-dismiss-control inline-block icon-cancel',
                    style: 'cursor: pointer;',
                    outputReference: 'closeControlBtn',
                    onClickHandler: 'dismiss'
                });
            }.bind(this));
        }.bind(this));
        // Main content area for messages
        this.createDiv({
            cssClass: 'pane-main-body padded-content',
            outputReference: 'mainContentBody',
            style: 'overflow-y: scroll;'
        });
    }.bind(this));
};

// Method to attach and display the component
NotificationPanelUI.prototype.displayComponent = function() {
    // Only create and attach if not already present
    if (this.hostPanel === void 0) {
        // Determine panel placement
        if (this.placement === 'bottom') {
            this.hostPanel = globalWorkspace.appendBottomPane({
                item: this
            });
        } else if (this.placement === 'top') {
            this.hostPanel = globalWorkspace.appendTopPane({
                item: this
            });
        }

        var selfRef = this; // Capture 'this' for event handlers
        // Attach event listener for resize handle
        this.hostPanel.item.addEventListener("mousedown", ".pane-resizer-bar", function() {
            selfRef.startSizeAdjustment();
        });

        // Apply max height to the content body
        jq(".pane-main-body", this).applyStyle({
            maxHeight: this.maximumHeight
        });

        // Scroll to bottom if auto-scroll is active
        if (this.scrollToggleBtn.checkClass('icon-arrow-up')) {
            this.mainContentBody.scrollToPosition(1E10);
        }
    } else {
        // If already exists, just reveal it
        this.hostPanel.reveal();
    }
};

// Method to close or dismiss the panel
NotificationPanelUI.prototype.dismiss = function() {
    if (this.hostPanel !== void 0) {
        // Invoke the specified dismissal action
        this.hostPanel[this.dismissAction].invoke(this.hostPanel);
        // If the action is 'eradicate', clear the panel reference
        if (this.dismissAction === 'eradicate') {
            this.hostPanel = void 0;
        }
    }
};

// Initialization routine for the component
NotificationPanelUI.prototype.setupComponent = function() {
    this.setCaption(this.caption, this.isRawCaption);
    if (this.enableAutoScrolling) {
        this.toggleAutomaticScrolling();
    }
    this.briefInfo.conceal(); // Hide the summary by default
};

// Sets the panel's main caption
NotificationPanelUI.prototype.setCaption = function(newCaption, unescapedHtml) {
    if (unescapedHtml) {
        this.mainCaption.setHtmlContent(newCaption);
    } else {
        this.mainCaption.setTextContent(newCaption);
    }
};

// Updates the brief summary section
NotificationPanelUI.prototype.updateOverview = function(overviewData) {
    var itemText = overviewData.summary,
        styleClass = overviewData.styleClass,
        isRawHtml = overviewData.isRawHtml || false,
        callbackFn = overviewData.callbackFn || void 0;

    // Reset existing class attributes on the summary element
    this.briefInfo.setAttribute('cssClass', 'header-brief-summary inline-block');
    // Set the new summary content
    if (isRawHtml) {
        this.briefInfo.setHtmlContent(itemText);
    } else {
        this.briefInfo.setTextContent(itemText);
    }
    // Add custom style class if provided
    if (styleClass) {
        this.briefInfo.addStyleClass(styleClass);
    }
    // Execute callback function if available
    if (callbackFn) {
        callbackFn(this.briefInfo);
    }
};

// Toggles the visibility of the main content body and summary
NotificationPanelUI.prototype.switchVisibility = function() {
    // Toggle the fold/unfold icon
    this.foldToggleBtn.toggleStyleClass('icon-collapse, icon-expand');
    // Toggle the main content body's visibility with animation
    this.mainContentBody.toggle(this.animationDuration);

    // Special handling for summary visibility, as .toggle() might not achieve 'inline-block'
    if (this.briefInfo.applyStyle('display') === 'none') {
        this.briefInfo.applyStyle('display', 'inline-block');
    } else {
        this.briefInfo.conceal();
    }
};

// Clears all messages from the panel
NotificationPanelUI.prototype.resetContents = function() {
    this.entryLog = [];
    this.mainContentBody.clearChildren();
};

// Adds a new message view to the panel
NotificationPanelUI.prototype.appendEntry = function(entryView) {
    // If this is the first message and it has a summary, update the panel's summary
    if (this.entryLog.length === 0 && entryView.retrieveSummary) {
        this.updateOverview(entryView.retrieveSummary());
    }
    // Insert message based on order preference
    if (this.newEntriesAtTop) {
        this.mainContentBody.prependContent(entryView);
    } else {
        this.mainContentBody.appendContent(entryView);
    }
    this.entryLog.push(entryView);
};

// Adjusts the scroll position based on auto-scroll setting
NotificationPanelUI.prototype.adjustScrollPosition = function() {
    if (this.scrollToggleBtn.checkClass('icon-arrow-up')) {
        this.mainContentBody.scrollToPosition(1E10);
    } else {
        this.mainContentBody.scrollToPosition(0);
    }
};

// Toggles the automatic scrolling behavior
NotificationPanelUI.prototype.toggleAutomaticScrolling = function() {
    // Flip the auto-scroll icon
    this.scrollToggleBtn.toggleStyleClass('icon-arrow-up');
    this.adjustScrollPosition();
};

// Initiates the panel resizing process
NotificationPanelUI.prototype.startSizeAdjustment = function() {
    // Disable user selection during resize to prevent text highlighting
    jq(this).applyStyle({
        userSelectionProperty: 'none'
    });

    // Attach global mouse move and mouse up listeners
    jq(docObject).addEventListener('mouseMoveEvent', {
        instancePtr: this
    }, this.performSizeAdjustment);
    jq(docObject).addEventListener('mouseUpEvent', {
        instancePtr: this
    }, this.endSizeAdjustment);
};

// Ends the panel resizing process
NotificationPanelUI.prototype.endSizeAdjustment = function(eventObj) {
    // Re-enable user selection
    jq(eventObj.eventData.instancePtr).applyStyle({
        userSelectionProperty: ''
    });

    // Remove event listeners
    jq(docObject).removeEventListener('mouseMoveEvent', this.performSizeAdjustment);
    jq(docObject).removeEventListener('mouseUpEvent', this.endSizeAdjustment);
};

// Performs the actual resizing of the panel
NotificationPanelUI.prototype.performSizeAdjustment = function(eventObj) {
    var mainContentElement = jq(".pane-main-body", eventObj.eventData.instancePtr),
        headerHeightValue = jq(".pane-header-area", eventObj.eventData.instancePtr).height(),
        calculatedHeight = jq(docObject.body).height() - eventObj.pageCoordY - headerHeightValue - 30;

    // Apply the new max height to the content body
    mainContentElement.applyStyle({
        maxHeight: calculatedHeight
    });
};

// Export the main component
module.exports = NotificationPanelUI;