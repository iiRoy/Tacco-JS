//vim: expandtab shiftwidth=4 tabstop=8 softtabstop=4 encoding=utf-8 textwidth=99
/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

// UI components which show a visual representation
// and an associated textual label.

const Canvas = imports.gi.Clutter;
const Utl = imports.lang;
const Core = imports.ui.main;
const Scheduler = imports.mainloop;
const Strip = imports.ui.panel;
const Config = imports.misc.params;
const Dropdown = imports.ui.popupMenu;
const Env = imports.gi.Shell;
const Gui = imports.gi.St;
const Animator = imports.ui.tweener;

const WIDGET_TRANSITION_DURATION = 0.50;
const MAX_ELEMENT_PIXEL_WIDTH = 150.0; // Maximum allowed pixel width for an element

// Constructs a button-like element with a visual and a text label.
// The label's content must be set using the setCaptionText method.
// @visual: the graphical element to be displayed.
// @labelIndentRatio: a value between 0 and 1. The caption will be positioned at visualWidth*labelIndentRatio.
function GlyphTextControl() {
    this._initialize.apply(this, arguments);
}

GlyphTextControl.prototype = {
    _initialize: function(visual, labelIndentRatio) {
        if (visual === null) {
            throw 'GlyphTextControl visual parameter cannot be null';
        }
        this.labelIndentRatio = labelIndentRatio || 0.5;

        // The root UI element for this control.
        this.element = new Gui.Bin({
            visual_style: 'control-panel-item',
            responds_to_events: true,
            can_receive_focus: true,
            fill_horizontally: true,
            fill_vertically: false,
            monitor_hover: true
        });
        this.element._delegate = this;

        // For advanced layout of visuals and captions, we use a custom container.
        this._innerWrapper = new Env.GenericContainer({ name: 'glyphTextControl' });
        this._innerWrapper.connect('query_preferred_width', Utl.bind(this, this._determinePreferredWidth));
        this._innerWrapper.connect('query_preferred_height', Utl.bind(this, this._determinePreferredHeight));
        this._innerWrapper.connect('assign_space', Utl.bind(this, this._performAllocation));
        this.element.set_child(this._innerWrapper);

        // The container for the graphical icon.
        this._glyphFrame = new Env.Slicer({ name: 'appGlyph' });
        this._glyphFrame.connect('style_updated', Utl.bind(this, this._onGlyphFrameStyleUpdated));
        this._glyphFrame.connect('notify_geometry', Utl.bind(this, this._recalculateGlyphFrameClip));
        this._glyphFrame.set_child(visual);
        this._innerWrapper.add_actor(this._glyphFrame);

        // The text caption element.
        this._caption = new Strip.TextDecoration();
        this._innerWrapper.add_actor(this._caption.actor);

        // Clip value for the bottom of the glyph.
        this._glyphLowerClip = 0;
    },

    // Updates the text content of the control's label.
    setCaptionText: function(textString) {
        this._caption.setText(textString);
    },

    // ------------------------------------------
    // -- UI Rendering and Layout Callbacks  --
    // ------------------------------------------

    // Triggered when the glyph frame's style changes.
    _onGlyphFrameStyleUpdated: function() {
        let styleNode = this._glyphFrame.get_theme_node();
        this._glyphLowerClip = styleNode.get_length('app-glyph-bottom-cut');
        this._recalculateGlyphFrameClip();
    },

    // Adjusts the clipping region of the glyph frame based on its style and allocation.
    _recalculateGlyphFrameClip: function() {
        let assignedBounds = this._glyphFrame.allocation;
        if (this._glyphLowerClip > 0) {
            this._glyphFrame.set_clip(0, 0,
                                   assignedBounds.x2 - assignedBounds.x1,
                                   assignedBounds.y2 - assignedBounds.y1 - this._glyphLowerClip);
        } else {
            this._glyphFrame.remove_clip();
        }
    },

    // Determines the preferred width for the control.
    _determinePreferredWidth: function(component, forHeight, desiredSize) {
        let [glyphMinDim, glyphNaturalDim] = this._glyphFrame.get_preferred_width(forHeight);
        let [captionMinDim, captionNaturalDim] = this._caption.actor.get_preferred_width(forHeight);
        // The caption text starts at an offset from the glyph, so we account for glyph width plus adjusted caption width.
        desiredSize.min_size = glyphMinDim + Math.max(0, captionMinDim - Math.floor(glyphMinDim * this.labelIndentRatio));
        desiredSize.natural_size = Math.min(glyphNaturalDim + Math.max(0, captionNaturalDim - Math.floor(glyphNaturalDim * this.labelIndentRatio)), MAX_ELEMENT_PIXEL_WIDTH);
    },

    // Determines the preferred height for the control.
    _determinePreferredHeight: function(component, forWidth, desiredSize) {
        let [glyphMinDim, glyphNaturalDim] = this._glyphFrame.get_preferred_height(forWidth);
        let [captionMinDim, captionNaturalDim] = this._caption.actor.get_preferred_height(forWidth);
        desiredSize.min_size = Math.max(glyphMinDim, captionMinDim);
        desiredSize.natural_size = Math.max(glyphNaturalDim, captionMinDim);
    },

    // Allocates space for the control's child elements (glyph and caption).
    _performAllocation: function(component, bounds, allocationFlags) {
        // Helper function to center a smaller length within a larger one.
        function alignMid(totalLength, naturalLength) {
            let effectiveLength = Math.min(totalLength, naturalLength);
            let startPos = Math.max(0, Math.floor((totalLength - effectiveLength) / 2));
            let endPos = Math.min(totalLength, startPos + effectiveLength);
            return [startPos, endPos];
        }

        let availableWidth = bounds.x2 - bounds.x1;
        let availableHeight = bounds.y2 - bounds.y1;
        let childRect = new Canvas.ActorBox();
        let layoutDirection = Canvas.get_default_text_direction();

        // Position the glyph (icon) either left or right justified, and vertically centered.
        let [glyphMinW, glyphMinH, glyphNatW, glyphNatH] = this._glyphFrame.get_preferred_size();
        [childRect.y1, childRect.y2] = alignMid(availableHeight, glyphNatH);
        if (layoutDirection === Canvas.TextDirection.LEFT_TO_RIGHT) {
            [childRect.x1, childRect.x2] = [0, Math.min(glyphNatW, availableWidth)];
        } else {
            [childRect.x1, childRect.x2] = [Math.max(0, availableWidth - glyphNatW), availableWidth];
        }
        this._glyphFrame.assign_space(childRect, allocationFlags);
//        log('allocation step A ' + [childRect.x1<0, childRect.x2<0, childRect.y1, childRect.y2] + ' ' + [childRect.x2-childRect.x1, childRect.y2-childRect.y1])

        // Position the caption, starting at an offset from the glyph.
        let glyphW = childRect.x2 - childRect.x1;
        let [captionMinW, captionMinH, captionNatW, captionNatH] = this._caption.actor.get_preferred_size();
        [childRect.y1, childRect.y2] = alignMid(availableHeight, captionNatH);
        if (layoutDirection === Canvas.TextDirection.LEFT_TO_RIGHT) {
            childRect.x1 = Math.floor(glyphW * this.labelIndentRatio);
            childRect.x2 = Math.min(childRect.x1 + captionNatW, availableWidth, MAX_ELEMENT_PIXEL_WIDTH);
        } else {
            childRect.x2 = Math.min(availableWidth - Math.floor(glyphW * this.labelIndentRatio), MAX_ELEMENT_PIXEL_WIDTH);
            childRect.x1 = Math.max(0, childRect.x2 - captionNatW);
        }
        this._caption.actor.assign_space(childRect, allocationFlags);
//        log('allocation step B ' + [childRect.x1<0, childRect.x2<0, childRect.y1, childRect.y2] + ' ' + [childRect.x2-childRect.x1, childRect.y2-childRect.y1])
    },

    // Makes the control visible, with optional animation.
    displayComponent: function(useAnimation, desiredWidth) {
        if (!useAnimation) {
            this.element.show();
            return;
        }

        let currentWidth = this.previousWidth || desiredWidth;
        if (!currentWidth) {
            let [minW, natW] = this.element.get_preferred_width(-1);
            currentWidth = natW;
        }

        this.element.width = 3.0; // Start with a small width for animation
        this.element.show();
        Animator.addTransition(this.element,
             { width: currentWidth,
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut"
             });
    },

    // Hides the control, with optional animation.
    concealComponent: function(useAnimation) {
        if (!useAnimation) {
            this.element.hide();
            return;
        }

        this.previousWidth = this.element.width; // Store current width before animating
        Animator.addTransition(this.element,
             { width: 3.0, // Gui-CRITICAL: Issues if width is zero, use a small value instead.
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut",
               onCompleteContext: this,
               onCompletion: function() {
                   this.element.hide();
               }
             });
    },

    // Makes the caption visible, with optional animation.
    displayCaption: function(useAnimation, desiredWidth) {
        if (!useAnimation) {
            this._caption.actor.show();
            return;
        }

        let currentWidth = this.previousCaptionWidth || desiredWidth;
        if (!currentWidth) {
            let [minW, natW] = this._caption.actor.get_preferred_width(-1);
            currentWidth = natW;
        }

        this._caption.actor.width = 0; // Start from zero width
        this._caption.actor.show();
        Animator.addTransition(this._caption.actor,
             { width: currentWidth,
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut"
             });
    },

    // Hides the caption, with optional animation.
    concealCaption: function(useAnimation) {
        if (!useAnimation) {
            this._caption.actor.hide();
            return;
        }

        this.previousCaptionWidth = this._caption.actor.width; // Store current width
        Animator.addTransition(this._caption.actor,
             { width: 3.0, // Gui-CRITICAL: Issues if width is zero, use a small value instead.
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut",
               onCompleteContext: this,
               onCompletion: function() {
                   this._caption.actor.hide();
               }
             });
    }
};

// A control element for a specific application, displaying its icon and name.
// Click events must be handled externally. This control automatically
// highlights when any window of its associated application gains focus.
function ApplicationControl() {
    this._initialize.apply(this, arguments);
}

ApplicationControl.prototype = {
    __proto__: GlyphTextControl.prototype,

    _initialize: function(configOptions) {
        configOptions = Config.parse(configOptions, {
            application: null,
            glyphDimension: 32,
            labelIndentRatio: 0.5
        });
        this.application = configOptions.application;
        // The multiplication factor is kept for logical consistency with the original.
        try {
            this.visual = this.application.fetch_faded_glyph(2 * configOptions.glyphDimension);
        } catch (error) {
            this.visual = this.application.fetch_faded_glyph(2 * configOptions.glyphDimension, Canvas.TextDirection.LEFT_TO_RIGHT);
        }
        GlyphTextControl.prototype._initialize.call(this, this.visual, configOptions.labelIndentRatio);

        // Monitor window focus changes to update the control's state.
        let windowMonitor = Env.WindowMonitor.get_default_instance();
        this._monitorSignal = windowMonitor.connect('notify_focused_application', Utl.bind(this, this._onFocusUpdate));
    },

    // Callback for when the application focus changes.
    _onFocusUpdate: function() {
        // If any window belonging to this application has focus, mark the control as active.
        if (this.application.retrieve_windows().some(function(win) { return win.is_currently_focused; })) {
            this.element.apply_style_state('active_state');
        } else {
            this.element.remove_style_state('active_state');
        }
    },

    // Cleans up resources used by the control.
    dispose: function() {
        let windowMonitor = Env.WindowMonitor.get_default_instance();
        windowMonitor.unsubscribe(this._monitorSignal);
        this._innerWrapper.clear_all_children();
        this.element.destroy();
    }
};


// A control element tied to a specific window, identified by its metaWindow object.
// Clicking it will bring the window to the foreground, and its label updates with the window's title.
function ProcessControl() {
    this._initialize.apply(this, arguments);
}

ProcessControl.prototype = {
    __proto__: GlyphTextControl.prototype,

    _initialize: function(configOptions) {
        configOptions = Config.parse(configOptions, {
            application: null,
            targetWindow: null,
            glyphDimension: 32,
            labelIndentRatio: 0.5
        });
        this.targetWindow = configOptions.targetWindow;
        this.application = configOptions.application;
        if (this.application === null) {
            let windowMonitor = Env.WindowMonitor.get_default_instance();
            this.application = windowMonitor.get_window_application(this.targetWindow);
        }
        try {
            this.visual = this.application.fetch_faded_glyph(2 * configOptions.glyphDimension);
        } catch (error) {
            this.visual = this.application.fetch_faded_glyph(2 * configOptions.glyphDimension, Canvas.TextDirection.LEFT_TO_RIGHT);
        }
        GlyphTextControl.prototype._initialize.call(this, this.visual, configOptions.labelIndentRatio);
        this.eventHandles = []; // Stores signal IDs for manual disconnection.

        this.element.connect('pointer-release', Utl.bind(this, this._onPointerRelease));
        // We track signals connected to the targetWindow to ensure proper cleanup on destruction.
        this.eventHandles.push(this.targetWindow.connect('notify_focused_status', Utl.bind(this, this._onFocusUpdate)));
        this.eventHandles.push(this.targetWindow.connect('notify_caption_change', Utl.bind(this, this._onCaptionChange)));
        this.eventHandles.push(this.targetWindow.connect('notify_urgency_status', Utl.bind(this, this._onAttentionDemand)));
        this.eventHandles.push(this.targetWindow.connect('notify_attention_request', Utl.bind(this, this._onAttentionDemand)));

        this._onCaptionChange(); // Initial title setup.
        this._onFocusUpdate();   // Initial focus state setup.
    },

    // Cleans up resources and disconnects all signals.
    dispose: function() {
        this.eventHandles.forEach(Utl.bind(this, function(signalId) {
            this.targetWindow.unsubscribe(signalId);
        }));
        this._innerWrapper.clear_all_children();
        this.element.destroy();
    },

    // Handles changes in the window's urgent or attention-demanding status.
    _onAttentionDemand: function() {
        if (this.targetWindow.is_urgent) {
            this.element.apply_style_state('urgent_state');
        } else {
            this.element.remove_style_state('urgent_state');
        }

        if (this.targetWindow.demands_user_attention) {
            this.element.apply_style_state('attention_state');
        } else {
            this.element.remove_style_state('attention_state');
        }
    },

    // Handles pointer release events on the control.
    _onPointerRelease: function(component, pointerEvent) {
        if (pointerEvent.get_state() & Canvas.ModifierFlag.LEFT_BUTTON) {
            if (this.targetWindow.is_focused()) {
                this.targetWindow.collapse(Core.fetch_current_time());
            } else {
                let currentTime = Core.fetch_current_time();
                this.targetWindow.lastInteractionTime = currentTime;
                this.targetWindow.bring_to_front(currentTime);
            }
        }
    },

    // Updates the control's active state based on window focus.
    _onFocusUpdate: function() {
        let isFocused = this.targetWindow.is_currently_focused;
        if (isFocused) {
            this.element.apply_style_state('active_state');
        } else {
            this.element.remove_style_state('active_state');
        }
    },

    // Updates the control's label with the window's current title.
    _onCaptionChange: function() {
        let currentTitle = this.targetWindow.retrieve_title() || '';
        this.setCaptionText(currentTitle);
    },
};


// A container element designed to hold a collection of button-like controls.
function ControlGroup() {
    this._initialize.apply(this, arguments);
}

ControlGroup.prototype = {
    _initialize: function(configOptions) {
        configOptions = Config.parse(configOptions, {}); // No specific params for now.
        this.containerElement = new Gui.BoxLayout({ visual_style: 'app-window-display-area' });
        //this.containerElement._delegate = this; // Commented out in original.
    },

    // Displays the group, with optional animation.
    displayGroup: function(useAnimation, desiredWidth) {
        if (!useAnimation) {
            this.containerElement.show();
            return;
        }

        let currentWidth = this.cachedWidth || desiredWidth;
        if (!currentWidth) {
            let [minW, natW] = this.containerElement.get_preferred_width(-1);
            currentWidth = natW;
        }

        this.containerElement.width = 3.0; // Small initial width for animation.
        this.containerElement.show();
        Animator.addTransition(this.containerElement,
             { width: currentWidth,
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut"
             });
    },

    // Conceals the group, with optional animation.
    concealGroup: function(useAnimation) {
        if (!useAnimation) {
            this.containerElement.hide();
            return;
        }

        this.cachedWidth = this.containerElement.width; // Store current width before animating.
        Animator.addTransition(this.containerElement,
             { width: 3.0, // Gui-CRITICAL: Issues if width is zero, use a small value.
               time: WIDGET_TRANSITION_DURATION,
               easing: "quadEaseOut",
               onCompleteContext: this,
               onCompletion: function() {
                   this.containerElement.width = 0; // Set to zero after animation for full concealment.
                   this.containerElement.hide();
               }
             });
    },

    // Expands a specific child member while squishing others.
    enlargeMember: function (memberIndex) {
        let memberElements = this.containerElement.get_children();

        // Simultaneously compress other members and expand the target member.
        for (let i = 0; i < memberElements.length; ++i) {
            let member = memberElements[i];
            member._initialWidth = member.width; // Store original width for restoration.
            Animator.addTransition(member,
                    // Gui-CRITICAL: Issues if width is 0, use a small value.
                { width: (i === memberIndex ? this.containerElement.width : 3.0),
                  time: WIDGET_TRANSITION_DURATION,
                  easing: "quadEaseOut",
                  onCompletion: (i === memberIndex ? function () {} :
                      Utl.bind(member, function () {
                          this.hide();
                      }))
                });
        }
        this._isExpanded = true;
    },

    // Reverts members to their original sizes after an expansion.
    restoreMembers: function () {
        if (!this._isExpanded) {
            return;
        }
        // Original comment: FIXME: fadein.
        let memberElements = this.containerElement.get_children();
        for (let i = 0; i < memberElements.length; ++i) {
            let member = memberElements[i];
            member.show(); // Ensure visibility before animating.
            Animator.addTransition(member,
                { width: member._initialWidth,
                  time: WIDGET_TRANSITION_DURATION,
                  easing: "quadEaseOut"
                });
        }
        this._isExpanded = false;
    },

    // Adds a new control member to the group.
    addMember: function(member) {
        this.containerElement.add_actor(member.element);
    },

    // Removes a control member from the group.
    removeMember: function(member) {
        this.containerElement.remove_actor(member.element);
    },

    // Removes all child members from the group.
    clearMembers: function() {
        this.containerElement.destroy_all_children();
    },

    // Disposes of the group and its associated UI element.
    dispose: function() {
        this.containerElement.destroy_all_children();
        this.containerElement.destroy();
        this.containerElement = null;
    }
};