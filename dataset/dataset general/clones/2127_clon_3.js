// vim: expandtab shiftwidth=4 tabstop=8 softtabstop=4 encoding=utf-8 textwidth=99
/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

// Collection of visual elements resembling application controls,
// each featuring an icon and an accompanying descriptive caption.

const GtkClutter = imports.gi.Clutter;
const Utility = imports.lang;
const ShellMain = imports.ui.main;
const EventLoop = imports.mainloop;
const ShellPanel = imports.ui.panel;
const ParameterUtils = imports.misc.params;
const DropdownMenu = imports.ui.popupMenu; // Renamed but not used in original code
const GnomeShell = imports.gi.Shell;
const Toolkit = imports.gi.St;
const AnimationEngine = imports.ui.tweener;

const WIDGET_TRANSITION_DURATION = 0.4; // Slightly changed value from 0.5
const MAX_ELEMENT_VISUAL_WIDTH = 160; // Pixels, slightly changed value from 150

// Creates a visual component with an icon and a caption.
// The caption text must be set via `setCaptionText`.
// @visualIcon: the graphic element to be displayed.
// @captionOffsetRatio: a number between 0 and 1. The caption will be positioned at iconWidth*captionOffsetRatio.
function VisualLabeledComponent() {
    this._initializeComponent.apply(this, arguments);
}

VisualLabeledComponent.prototype = {
    _isComponentInitialized: false, // New flag for initialization status
    _rootWidget: null, // Renamed actor
    _contentWrapper: null, // Renamed _container
    _iconDisplayArea: null, // Renamed _iconBox
    _captionElement: null, // Renamed _label
    _iconClipBottomMargin: 0, // Renamed _iconBottomClip
    _cachedComponentWidth: 0, // For animation, renamed oldWidth
    _cachedCaptionWidth: 0, // For animation, renamed oldLabelWidth

    _initializeComponent: function(visualIcon, captionOffsetRatio) {
        // Guard clause: Ensure icon is provided
        if (!visualIcon) {
            throw new Error('VisualLabeledComponent requires a non-null visualIcon argument.');
        }

        this.captionOffsetRatio = captionOffsetRatio || 0.4; // Changed default from 0.5 to 0.4

        this.rootWidget = new Toolkit.Bin({
            style_class: 'control-panel-button', // Changed style class
            reactive: true,
            can_focus: true,
            x_fill: true,
            y_fill: false,
            track_hover: true,
            // Added an initial minimum width to prevent critical errors during early rendering
            width: 10
        });
        this.rootWidget._delegate = this; // Delegate pattern is maintained

        // We implement a custom layout for the icon and caption, using a GenericContainer
        this._contentWrapper = new GnomeShell.GenericContainer({ name: 'visualLabeledComponentLayout' }); // Renamed name
        this._contentWrapper.connect('get-preferred-width', Utility.bind(this, this._determinePreferredWidth));
        this._contentWrapper.connect('get-preferred-height', Utility.bind(this, this._determinePreferredHeight));
        this._contentWrapper.connect('allocate', Utility.bind(this, this._performLayoutAllocation));
        this.rootWidget.set_child(this._contentWrapper);

        this._iconDisplayArea = new GnomeShell.Slicer({ name: 'componentIconVisual' }); // Renamed name
        this._iconDisplayArea.connect('style-changed', Utility.bind(this, this._handleIconStyleUpdate));
        this._iconDisplayArea.connect('notify::allocation', Utility.bind(this, this._applyIconClipping));
        this._iconDisplayArea.set_child(visualIcon);
        this._contentWrapper.add_actor(this._iconDisplayArea);

        this._captionElement = new ShellPanel.TextShadower(); // Renamed _label
        this._contentWrapper.add_actor(this._captionElement.actor);

        this._isComponentInitialized = true; // Set initialization flag
        return this; // Allow method chaining
    },

    // Updates the text displayed in the caption element.
    setCaptionText: function(newText) {
        if (!this._isComponentInitialized) {
            log('Warning: Attempted to set caption on uninitialized component.');
            return;
        }
        this._captionElement.setText(newText);
    },

    // Public method to retrieve the root actor of the component.
    getRootActor: function() {
        return this.rootWidget;
    },

    // ----------------------------------------------------
    // -- Internal methods for visual rendering and layout --
    // ----------------------------------------------------

    _handleIconStyleUpdate: function() {
        let currentThemeNode = this._iconDisplayArea.get_theme_node();
        // Changed property name slightly
        this._iconClipBottomMargin = currentThemeNode.get_length('app-icon-bottom-trim') || 0;
        this._applyIconClipping();
    },

    _applyIconClipping: function() {
        let currentAllocation = this._iconDisplayArea.allocation;
        // Introduce a local variable for clarity
        const allocatedHeight = currentAllocation.y2 - currentAllocation.y1;
        const allocatedWidth = currentAllocation.x2 - currentAllocation.x1;

        if (this._iconClipBottomMargin > 0 && allocatedHeight > 0) {
            this._iconDisplayArea.set_clip(0, 0,
                                           allocatedWidth,
                                           allocatedHeight - this._iconClipBottomMargin);
        } else {
            this._iconDisplayArea.remove_clip();
        }
    },

    _determinePreferredWidth: function(containerActor, forHeight, allocationResult) {
        let [iconMin, iconNatural] = this._iconDisplayArea.get_preferred_width(forHeight);
        let [captionMin, captionNatural] = this._captionElement.actor.get_preferred_width(forHeight);

        // The caption text starts relative to the icon's position.
        // We calculate the required space for the icon plus the remaining space for the caption.
        const effectiveCaptionMinSpace = Math.max(0, captionMin - Math.floor(iconMin * this.captionOffsetRatio));
        const effectiveCaptionNaturalSpace = Math.max(0, captionNatural - Math.floor(iconNatural * this.captionOffsetRatio));

        allocationResult.min_size = iconMin + effectiveCaptionMinSpace;
        allocationResult.natural_size = Math.min(iconNatural + effectiveCaptionNaturalSpace, MAX_ELEMENT_VISUAL_WIDTH);
    },

    _determinePreferredHeight: function(containerActor, forWidth, allocationResult) {
        let [iconMin, iconNatural] = this._iconDisplayArea.get_preferred_height(forWidth);
        let [captionMin, captionNatural] = this._captionElement.actor.get_preferred_height(forWidth);
        allocationResult.min_size = Math.max(iconMin, captionMin);
        allocationResult.natural_size = Math.max(iconNatural, captionNatural);
    },

    _performLayoutAllocation: function(containerActor, boundingBox, layoutFlags) {
        // Helper function to center a child within an available length.
        // Returns [start, end] coordinates.
        const centerChild = (availableLength, naturalLength) => {
            const effectiveLength = Math.min(availableLength, naturalLength);
            const startCoord = Math.max(0, Math.floor((availableLength - effectiveLength) / 2));
            const endCoord = Math.min(availableLength, startCoord + effectiveLength);
            return [startCoord, endCoord];
        };

        const availableWidth = boundingBox.x2 - boundingBox.x1;
        const availableHeight = boundingBox.y2 - boundingBox.y1;
        let childBoundingBox = new GtkClutter.ActorBox();
        const currentTextDirection = GtkClutter.get_default_text_direction();

        // 1. Allocate space for the icon display area.
        let [iconMinWidth, iconMinHeight, iconNaturalWidth, iconNaturalHeight] = this._iconDisplayArea.get_preferred_size();
        [childBoundingBox.y1, childBoundingBox.y2] = centerChild(availableHeight, iconNaturalHeight);

        if (currentTextDirection === GtkClutter.TextDirection.LTR) {
            [childBoundingBox.x1, childBoundingBox.x2] = [0, Math.min(iconNaturalWidth, availableWidth)];
        } else {
            // Right-to-Left: icon is right-justified.
            [childBoundingBox.x1, childBoundingBox.x2] = [Math.max(0, availableWidth - iconNaturalWidth), availableWidth];
        }
        this._iconDisplayArea.allocate(childBoundingBox, layoutFlags);

        // 2. Allocate space for the caption element.
        const actualIconWidth = childBoundingBox.x2 - childBoundingBox.x1;
        let [captionMinWidth, captionMinHeight, captionNaturalWidth, captionNaturalHeight] = this._captionElement.actor.get_preferred_size();
        [childBoundingBox.y1, childBoundingBox.y2] = centerChild(availableHeight, captionNaturalHeight);

        if (currentTextDirection === GtkClutter.TextDirection.LTR) {
            // Caption starts at an offset from the icon's left edge.
            childBoundingBox.x1 = Math.floor(actualIconWidth * this.captionOffsetRatio);
            childBoundingBox.x2 = Math.min(childBoundingBox.x1 + captionNaturalWidth, availableWidth, MAX_ELEMENT_VISUAL_WIDTH);
        } else {
            // Right-to-Left: caption's right edge is offset from icon's right edge.
            childBoundingBox.x2 = Math.min(availableWidth - Math.floor(actualIconWidth * this.captionOffsetRatio), MAX_ELEMENT_VISUAL_WIDTH);
            childBoundingBox.x1 = Math.max(0, childBoundingBox.x2 - captionNaturalWidth);
        }
        this._captionElement.actor.allocate(childBoundingBox, layoutFlags);
    },

    // Reveals the component with an optional animation.
    displayComponent: function(animateVisibility, targetDimension) {
        if (!this._isComponentInitialized) return;

        if (!animateVisibility) {
            this.rootWidget.show();
            return;
        }

        let desiredWidth = this._cachedComponentWidth || targetDimension;
        if (!desiredWidth) {
            let [minW, naturalW] = this.rootWidget.get_preferred_width(-1);
            desiredWidth = naturalW;
        }
        // Ensure minimum width to prevent rendering issues.
        this.rootWidget.width = 5;
        this.rootWidget.show();
        AnimationEngine.addTween(this.rootWidget,
             { width: desiredWidth,
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad"
             });
    },

    // Hides the component with an optional animation.
    concealComponent: function(animateVisibility) {
        if (!this._isComponentInitialized) return;

        if (!animateVisibility) {
            this.rootWidget.hide();
            return;
        }

        this._cachedComponentWidth = this.rootWidget.width; // Store current width
        AnimationEngine.addTween(this.rootWidget,
             { width: 5, // Keep a small width during animation to avoid critical warnings.
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad",
               onCompleteScope: this,
               onComplete: function() {
                   this.rootWidget.hide();
                   this.rootWidget.width = 0; // Explicitly set to 0 after hiding.
               }
             });
    },

    // Reveals the caption element with an optional animation.
    displayCaption: function(animateVisibility, targetDimension) {
        if (!this._isComponentInitialized) return;

        if (!animateVisibility) {
            this._captionElement.actor.show();
            return;
        }

        let desiredWidth = this._cachedCaptionWidth || targetDimension;
        if (!desiredWidth) {
            let [minW, naturalW] = this._captionElement.actor.get_preferred_width(-1);
            desiredWidth = naturalW;
        }

        this._captionElement.actor.width = 0;
        this._captionElement.actor.show();
        AnimationEngine.addTween(this._captionElement.actor,
             { width: desiredWidth,
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad"
             });
    },

    // Hides the caption element with an optional animation.
    concealCaption: function(animateVisibility) {
        if (!this._isComponentInitialized) return;

        if (!animateVisibility) {
            this._captionElement.actor.hide();
            return;
        }

        this._cachedCaptionWidth = this._captionElement.actor.width;
        AnimationEngine.addTween(this._captionElement.actor,
             { width: 0, // Set directly to 0, if issues arise, adjust to a small positive value.
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad",
               onCompleteScope: this,
               onComplete: function() {
                   this._captionElement.actor.hide();
               }
             });
    },

    // Cleans up component resources.
    disposeComponent: function() {
        if (!this._isComponentInitialized) return;
        this._contentWrapper.destroy_all_children();
        this.rootWidget.destroy();
        this._isComponentInitialized = false;
        // Nullify references to aid garbage collection
        this.rootWidget = null;
        this._contentWrapper = null;
        this._iconDisplayArea = null;
        this._captionElement = null;
    }
};


// A button-like element representing a specific application.
// Automatically highlights when one of its application's windows gains focus.
function ApplicationTile() {
    this._initializeComponent.apply(this, arguments);
}

ApplicationTile.prototype = {
    __proto__: VisualLabeledComponent.prototype, // Inherits from the base component
    _appFocusSignalId: 0, // Renamed _trackerSignal
    _isDisposed: false, // New flag for disposal status

    _initializeComponent: function(itemParameters) {
        itemParameters = ParameterUtils.parse(itemParameters, {
            boundApplication: null,
            iconPixelSize: 36, // Changed iconSize to iconPixelSize, default to 36
            captionOffsetRatio: 0.4
        });

        this.boundApplication = itemParameters.boundApplication; // Renamed app

        // Guard against null application
        if (!this.boundApplication) {
            throw new Error("ApplicationTile requires a valid 'boundApplication' parameter.");
        }

        let appIconAsset;
        try {
            // Attempt to get a larger, faded icon (2x requested size)
            appIconAsset = this.boundApplication.get_faded_icon(2 * itemParameters.iconPixelSize);
        } catch (e) {
            log(`Warning: Failed to get faded icon for app ${this.boundApplication.get_id()}: ${e.message}`);
            // Fallback to a default icon or a smaller size if the first attempt fails
            appIconAsset = this.boundApplication.get_faded_icon(itemParameters.iconPixelSize, GtkClutter.TextDirection.LTR);
        }
        this.appIconVisual = appIconAsset; // Renamed icon

        VisualLabeledComponent.prototype._initializeComponent.call(this, this.appIconVisual, itemParameters.captionOffsetRatio);

        this._setupFocusTracking();
    },

    // Sets up tracking for application focus changes.
    _setupFocusTracking: function() {
        let appTracker = GnomeShell.WindowTracker.get_default();
        this._appFocusSignalId = appTracker.connect('notify::focus-app', Utility.bind(this, this._onApplicationFocusChanged));
    },

    // Callback for when the global application focus changes.
    _onApplicationFocusChanged: function() {
        // Determine if any window of our associated application is focused.
        const isActive = this.boundApplication.get_windows().some(w => w.appears_focused);
        this._toggleActiveState(isActive);
    },

    // Helper to apply/remove the 'active' pseudo-class.
    _toggleActiveState: function(shouldBeActive) {
        if (shouldBeActive) {
            this.rootWidget.add_style_pseudo_class('active');
        } else {
            this.rootWidget.remove_style_pseudo_class('active');
        }
    },

    // Releases all resources and disconnects signals.
    releaseResources: function() {
        if (this._isDisposed) return;

        let appTracker = GnomeShell.WindowTracker.get_default();
        if (this._appFocusSignalId) {
            appTracker.disconnect(this._appFocusSignalId);
            this._appFocusSignalId = 0;
        }
        VisualLabeledComponent.prototype.disposeComponent.call(this); // Call base class dispose
        this.boundApplication = null;
        this.appIconVisual = null;
        this._isDisposed = true;
    }
};


// A button-like element tied to a specific `MetaWindow`.
// It raises the window on click, and its label updates with the window's title.
function WindowControlItem() {
    this._initializeComponent.apply(this, arguments);
}

WindowControlItem.prototype = {
    __proto__: VisualLabeledComponent.prototype, // Inherits from base component
    windowEventConnections: [], // Renamed signals
    _isDisposed: false, // New flag for disposal status

    _initializeComponent: function(itemParameters) {
        itemParameters = ParameterUtils.parse(itemParameters, {
            parentApplication: null, // Renamed app
            managedWindow: null, // Renamed metaWindow
            iconPixelSize: 36, // Renamed iconSize, default to 36
            captionOffsetRatio: 0.4
        });

        this.managedWindow = itemParameters.managedWindow; // Renamed metaWindow

        // Guard against null window
        if (!this.managedWindow) {
            throw new Error("WindowControlItem requires a valid 'managedWindow' parameter.");
        }

        this.parentApplication = itemParameters.parentApplication; // Renamed app
        if (!this.parentApplication) {
            let appTracker = GnomeShell.WindowTracker.get_default();
            this.parentApplication = appTracker.get_window_app(this.managedWindow);
            // Additional guard if app still not found (e.g., window closed immediately)
            if (!this.parentApplication) {
                log(`Warning: Could not determine parent application for window ${this.managedWindow.get_title()}.`);
                // Consider throwing or returning early if app is critical.
            }
        }

        let windowIconAsset;
        if (this.parentApplication) {
            try {
                windowIconAsset = this.parentApplication.get_faded_icon(2 * itemParameters.iconPixelSize);
            } catch (e) {
                log(`Warning: Failed to get faded icon for app ${this.parentApplication.get_id()} (window ${this.managedWindow.get_title()}): ${e.message}`);
                windowIconAsset = this.parentApplication.get_faded_icon(itemParameters.iconPixelSize, GtkClutter.TextDirection.LTR);
            }
        } else {
            // Fallback for when parentApplication couldn't be determined
            windowIconAsset = new Toolkit.Icon({ icon_name: 'application-x-executable-symbolic', icon_size: itemParameters.iconPixelSize });
        }

        VisualLabeledComponent.prototype._initializeComponent.call(this, windowIconAsset, itemParameters.captionOffsetRatio);

        this.rootWidget.connect('button-release-event', Utility.bind(this, this._onInteractionEvent));
        this._connectWindowSignals(); // New helper method for signal connections

        this._updateWindowTitle(); // Initial title setup
        this._updateWindowFocusState(); // Initial focus state setup
        this._handleWindowUrgency(); // Initial urgency state setup
    },

    // Connects relevant signals from the managed window.
    _connectWindowSignals: function() {
        // We need to track signals connected directly to `managedWindow` to disconnect them manually.
        this.windowEventConnections.push(this.managedWindow.connect('notify::appears-focused', Utility.bind(this, this._updateWindowFocusState)));
        this.windowEventConnections.push(this.managedWindow.connect('notify::title', Utility.bind(this, this._updateWindowTitle)));
        this.windowEventConnections.push(this.managedWindow.connect('notify::urgent', Utility.bind(this, this._handleWindowUrgency)));
        this.windowEventConnections.push(this.managedWindow.connect('notify::demands-attention', Utility.bind(this, this._handleWindowUrgency)));
    },

    // Cleans up all resources and disconnects window signals.
    releaseResources: function() {
        if (this._isDisposed) return;

        this.windowEventConnections.forEach(signalId => {
            if (this.managedWindow && signalId) {
                this.managedWindow.disconnect(signalId);
            }
        });
        this.windowEventConnections = []; // Clear the array
        VisualLabeledComponent.prototype.disposeComponent.call(this); // Call base class dispose
        this.managedWindow = null;
        this.parentApplication = null;
        this._isDisposed = true;
    },

    // Handles changes in window urgency or attention-demanding state.
    _handleWindowUrgency: function() {
        if (!this.managedWindow) return; // Guard clause

        // Log a debug message for urgency changes
        if (this.managedWindow.urgent || this.managedWindow.demands_attention) {
            log(`Window "${this.managedWindow.get_title()}" is now urgent or demanding attention.`);
        }

        this._applyPseudoClass('urgent', this.managedWindow.urgent);
        this._applyPseudoClass('demands-attention', this.managedWindow.demands_attention);
    },

    // Helper to apply or remove a pseudo-class based on a boolean condition.
    _applyPseudoClass: function(className, condition) {
        if (condition) {
            this.rootWidget.add_style_pseudo_class(className);
        } else {
            this.rootWidget.remove_style_pseudo_class(className);
        }
    },

    // Processes button release events on the component.
    _onInteractionEvent: function(actor, event) {
        // Ensure it's a left-click release.
        if (event.get_button() === GtkClutter.BUTTON_PRIMARY) {
            const currentTime = global.get_current_time();
            if (this.managedWindow.has_focus()) {
                this.managedWindow.minimize(currentTime);
            } else {
                this.managedWindow.lastActivatedTime = currentTime; // Update last activated time
                this.managedWindow.activate(currentTime);
                // Optionally add a small timeout before deactivating pseudo-class if needed
                // EventLoop.timeout_add(100, () => this._applyPseudoClass('active', true));
            }
        }
    },

    // Updates the component's style based on the window's focus state.
    _updateWindowFocusState: function() {
        if (!this.managedWindow) return;
        const isFocused = this.managedWindow.appears_focused;
        this._applyPseudoClass('active', isFocused);
    },

    // Updates the component's caption with the window's current title.
    _updateWindowTitle: function() {
        if (!this.managedWindow) return;
        const currentTitle = this.managedWindow.get_title() || 'Untitled Window'; // Provide a fallback title
        this.setCaptionText(currentTitle);
    }
};


// A container for a collection of button-like components.
function ComponentGroupContainer() {
    this._initializeContainer.apply(this, arguments);
}

ComponentGroupContainer.prototype = {
    _isExpanded: false, // Renamed _expanded
    _childrenInitialWidths: new Map(), // New Map to store initial widths
    _groupActor: null, // Renamed actor

    _initializeContainer: function(containerParameters) {
        containerParameters = ParameterUtils.parse(containerParameters, {});
        // Changed from St.BoxLayout directly to St.Widget with a BoxLayout manager for structural change.
        this.groupActor = new Toolkit.Widget({
            layout_manager: new Toolkit.BoxLayout({ style_class: 'app-window-list-container-box' }),
            style_class: 'app-window-list-container' // Added an outer style class
        });
    },

    // Reveals the container with an optional animation.
    revealContainer: function(animateDisplay, targetDimension) {
        if (!animateDisplay) {
            this.groupActor.show();
            return;
        }

        let desiredWidth = this._cachedComponentWidth || targetDimension; // Reusing cached width from base class concept
        if (!desiredWidth) {
            let [minW, naturalW] = this.groupActor.get_preferred_width(-1);
            desiredWidth = naturalW;
        }

        this.groupActor.width = 5; // Small initial width
        this.groupActor.show();
        AnimationEngine.addTween(this.groupActor,
             { width: desiredWidth,
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad"
             });
    },

    // Conceals the container with an optional animation.
    hideContainer: function(animateDisplay) {
        if (!animateDisplay) {
            this.groupActor.hide();
            return;
        }

        this._cachedComponentWidth = this.groupActor.width; // Store current width
        AnimationEngine.addTween(this.groupActor,
             { width: 0, // Explicitly set to 0.
               time: WIDGET_TRANSITION_DURATION,
               transition: "easeOutQuad",
               onCompleteScope: this,
               onComplete: function() {
                   this.groupActor.hide();
                   // Ensure width is truly 0 after animation, in case Clutter has issues.
                   this.groupActor.width = 0;
               }
             });
    },

    // Expands a single child item while squishing others.
    expandSingleItem: function (itemIndex) {
        const childElements = this.groupActor.get_children();

        if (itemIndex < 0 || itemIndex >= childElements.length) {
            log(`Error: Attempted to expand non-existent item at index ${itemIndex}.`);
            return;
        }

        // Store original widths if not already done.
        if (this._childrenInitialWidths.size === 0) {
            childElements.forEach(child => {
                this._childrenInitialWidths.set(child, child.width);
            });
        }

        const targetExpandedWidth = this.groupActor.width; // The container's full width

        for (let i = 0; i < childElements.length; ++i) {
            let childWidget = childElements[i];
            const isTargetChild = (i === itemIndex);
            const finalWidth = isTargetChild ? targetExpandedWidth : 5; // Keep a small width for non-target children

            if (!isTargetChild) {
                // Ensure non-target children are visible to animate them.
                childWidget.show();
            }

            AnimationEngine.addTween(childWidget,
                { width: finalWidth,
                  time: WIDGET_TRANSITION_DURATION,
                  transition: "easeOutQuad",
                  onComplete: isTargetChild ? () => {} :
                      Utility.bind(childWidget, function () {
                          this.hide(); // Hide non-target children after animation
                      })
                });
        }
        this._isExpanded = true;
    },

    // Restores all child items to their original sizes.
    restoreItemSizes: function () {
        if (!this._isExpanded) {
            log('Container is not in expanded state; no restoration needed.');
            return;
        }

        const childElements = this.groupActor.get_children();
        for (let i = 0; i < childElements.length; ++i) {
            let childWidget = childElements[i];
            const originalWidth = this._childrenInitialWidths.get(childWidget) || childWidget.get_preferred_width(-1)[1]; // Fallback to natural width
            childWidget.show(); // Ensure child is visible before animating

            AnimationEngine.addTween(childWidget,
                { width: originalWidth,
                  time: WIDGET_TRANSITION_DURATION,
                  transition: "easeOutQuad"
                });
        }
        this._isExpanded = false;
        this._childrenInitialWidths.clear(); // Clear cached widths after restoration
    },

    // Appends a new item to the container.
    appendItem: function(componentInstance) {
        // Ensure the provided object has an `rootWidget` property.
        if (componentInstance && componentInstance.rootWidget) {
            this.groupActor.add_actor(componentInstance.rootWidget);
            // If currently expanded, add the new item in a squished state.
            if (this._isExpanded) {
                AnimationEngine.addTween(componentInstance.rootWidget,
                    { width: 5,
                      time: WIDGET_TRANSITION_DURATION / 2, // Quicker animation for new items
                      transition: "easeOutQuad",
                      onComplete: Utility.bind(componentInstance.rootWidget, function() {
                          this.hide();
                      })
                    });
            }
        } else {
            log('Error: Attempted to add an invalid component instance to ComponentGroupContainer.');
        }
    },

    // Removes an existing item from the container.
    removeItem: function(componentInstance) {
        if (componentInstance && componentInstance.rootWidget) {
            this.groupActor.remove_actor(componentInstance.rootWidget);
            this._childrenInitialWidths.delete(componentInstance.rootWidget); // Clean up cached width
        }
    },

    // Clears all child items from the container.
    emptyContainer: function() {
        this.groupActor.destroy_all_children();
        this._childrenInitialWidths.clear();
        this._isExpanded = false;
    },

    // Disposes of the container and its actor.
    disposeContainer: function() {
        this.emptyContainer(); // Ensure all children are destroyed first
        if (this.groupActor) {
            this.groupActor.destroy();
            this.groupActor = null;
        }
    }
};