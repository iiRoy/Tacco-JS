/* This file contains implementations for various button types within an application UI.
 * It defines components for displaying icons and labels, handling user interaction,
 * and managing visual states like focus and urgency.
 */

// Core UI libraries and utilities required for button functionality.
const Clutter = imports.gi.Clutter; // For scene graph and drawing.
const Lang = imports.lang;         // For language utilities like binding functions.
const Main = imports.ui.main;       // Main UI elements and global access.
const Mainloop = imports.mainloop;   // For managing event loops.
const Panel = imports.ui.panel;     // Panel-specific UI components.
const Params = imports.misc.params; // For parsing function parameters with defaults.
const PopupMenu = imports.ui.popupMenu; // For creating popup menus (though not directly used here, often related).
const Shell = imports.gi.Shell;     // Shell-specific functionalities, like window tracking.
const St = imports.gi.St;           // Scene Toolkit, for UI widgets.
const Tweener = imports.ui.tweener; // For animation effects.

// Animation duration for button transitions.
const BUTTON_BOX_ANIMATION_TIME = .5;
// Maximum allowed width for a button element in pixels.
const MAX_BUTTON_WIDTH          = 150;

/**
 *  A UI component designed to display both an icon and a label.
 *  The textual content of the label must be explicitly set via setText.
 *
 *  @param icon: The visual icon element to be displayed on the button.
 *  @param textOffsetFactor: A numeric value (0.0 to 1.0) dictating the label's horizontal
 *                           position relative to the icon's width.
 */
function IconLabelButton()
{
  // Call the initializer method with all provided arguments.
  this._init.apply(this, arguments);
}

// Prototype methods for IconLabelButton.
IconLabelButton.prototype = {
  /**
   *  Initializes a new instance of IconLabelButton.
   *  Performs essential setup for the button's visual components and behavior.
   */
  _init: function (icon, textOffsetFactor)
  {
    // Ensure that an icon is provided; it's a mandatory argument.
    if(icon==null)
    {
      throw'IconLabelButton icon argument must be non-null'; // Error if icon is missing.
    }
    // Set the text offset factor, defaulting to 0.5 if not provided.
    this.textOffsetFactor = textOffsetFactor||0.5;

    // Create the main actor for the button, a St.Bin with specific styling and properties.
    this.actor = new St.Bin({
      style_class: 'panel-button', // CSS class for styling.
      reactive: true,              // Allows interaction (e.g., clicks).
      can_focus: true,             // Can receive keyboard focus.
      x_fill: true,                // Fills available horizontal space.
      y_fill: false,               // Does not fill vertical space.
      track_hover: true            // Tracks mouse hover state.
    });
    // Assign this object as the delegate for the actor.
    this.actor._delegate = this;

    /*
     *  Utilize a Shell.GenericContainer for custom layout management.
     *  This allows precise control over icon and label positioning.
     */
    this._container = new Shell.GenericContainer({name: 'iconLabelButton'});
    // Connect signals for custom size calculation and allocation.
    this._container.connect('get-preferred-width', Lang.bind(this, this._getPreferredWidth));
    this._container.connect('get-preferred-height', Lang.bind(this, this._getPreferredHeight));
    this._container.connect('allocate', Lang.bind(this, this._allocate));
    // Set the custom container as the child of the main button actor.
    this.actor.set_child(this._container);

    // Create the icon box using Shell.Slicer, which can clip content.
    this._iconBox = new Shell.Slicer({name: 'appMenuIcon'});
    // Update icon clipping when its style changes.
    this._iconBox.connect('style-changed', Lang.bind(this, this._onIconBoxStyleChanged));
    // Update icon clipping when its allocation changes.
    this._iconBox.connect('notify::allocation', Lang.bind(this, this._updateIconBoxClip));
    // Place the provided icon inside the icon box.
    this._iconBox.set_child(icon);
    // Add the icon box to the custom container.
    this._container.add_actor(this._iconBox);

    // Initialize the label using Panel.TextShadower for visual effects.
    this._label = new Panel.TextShadower();
    // Add the label's actor to the custom container.
    this._container.add_actor(this._label.actor);

    // Initialize the icon bottom clip value.
    this._iconBottomClip = 0;
  },

  /**
   * Sets the text content for the button's label.
   * @param text The string to display as the label.
   */
  setText: function(text) {
    this._label.setText(text);
  },

  // ----------------------------------------------------
  // -- Callback functions for visual rendering updates --
  // ----------------------------------------------------

  /**
   *  Handles changes in the icon box's style.
   *  Retrieves and applies the 'app-icon-bottom-clip' style property.
   */
  _onIconBoxStyleChanged: function() {
    let node = this._iconBox.get_theme_node(); // Get the theme node.
    this._iconBottomClip = node.get_length('app-icon-bottom-clip'); // Extract clip length.
    this._updateIconBoxClip(); // Apply the new clip.
  },

  /**
   *  Updates the clipping region of the icon box.
   *  This is used to visually "clip" the bottom of the icon if specified by style.
   */
  _updateIconBoxClip: function() {
    let allocation = this._iconBox.allocation; // Get the current allocation box.
    if(this._iconBottomClip>0) {
      // Apply clipping if a clip value is set.
      this._iconBox.set_clip(0, 0,
                             allocation.x2-allocation.x1, // Full width.
                             allocation.y2-allocation.y1-this._iconBottomClip); // Clipped height.
    }
    else
    {
      // Remove any existing clipping if no clip value.
      this._iconBox.remove_clip();
    }
  },

  /**
   *  Calculates the preferred width for the button's container.
   *  Considers both the icon and the label's width requirements.
   */
  _getPreferredWidth: function(actor, forHeight, alloc) {
    let [iconMinSize, iconNaturalSize] = this._iconBox.get_preferred_width(forHeight);
    let [labelMinSize, labelNaturalSize] = this._label.actor.get_preferred_width(forHeight);
    // The label text starts relative to the icon, so allocate space accordingly.
    alloc.min_size = iconMinSize + Math.max(0, labelMinSize - Math.floor(iconMinSize * this.textOffsetFactor));
    alloc.natural_size = Math.min(iconNaturalSize + Math.max(0, labelNaturalSize - Math.floor(iconNaturalSize * this.textOffsetFactor)), MAX_BUTTON_WIDTH);
  },

  /**
   *  Calculates the preferred height for the button's container.
   *  Determined by the maximum height needed by either the icon or the label.
   */
  _getPreferredHeight: function(actor, forWidth, alloc) {
    let [iconMinSize, iconNaturalSize] = this._iconBox.get_preferred_height(forWidth);
    let [labelMinSize, labelNaturalSize] = this._label.actor.get_preferred_height(forWidth);
    // The preferred height is the maximum of the icon's and label's preferred heights.
    alloc.min_size = Math.max(iconMinSize, labelMinSize);
    alloc.natural_size = Math.max(iconNaturalSize, labelMinSize);
  },

  /**
   *  Allocates space for the icon and label within the button's container.
   *  This custom allocation logic positions the icon and then the label.
   */
  _allocate: function(actor, box, flags) {
    // Helper function to center an element within a given length.
    function center(length, naturalLength) {
      let maxLength = Math.min(length, naturalLength);
      let x1 = Math.max(0, Math.floor((length - maxLength) / 2));
      let x2 = Math.min(length, x1 + maxLength);
      return [x1, x2];
    }
    let allocWidth = box.x2 - box.x1; // Total allocated width.
    let allocHeight = box.y2 - box.y1; // Total allocated height.
    let childBox = new Clutter.ActorBox(); // Box for child actors.
    let direction = Clutter.get_default_text_direction(); // Text direction (LTR/RTL).

    // Position the icon: left/right-justified horizontally, centered vertically.
    let [iconMinWidth, iconMinHeight, iconNaturalWidth, iconNaturalHeight] = this._iconBox.get_preferred_size();
    [childBox.y1, childBox.y2] = center(allocHeight, iconNaturalHeight); // Vertical centering.
    if(direction==Clutter.TextDirection.LTR) {
      [childBox.x1, childBox.x2] = [0, Math.min(iconNaturalWidth, allocWidth)]; // Left-justified.
    } else {
      [childBox.x1, childBox.x2] = [Math.max(0, allocWidth - iconNaturalWidth), allocWidth]; // Right-justified.
    }
    this._iconBox.allocate(childBox, flags); // Allocate space for the icon.

    // Position the label: starts offset from the icon, centered vertically.
    let iconWidth = childBox.x2 - childBox.x1; // Actual width of the icon.
    let [minWidth, minHeight, naturalWidth, naturalHeight] = this._label.actor.get_preferred_size();
    [childBox.y1, childBox.y2] = center(allocHeight, naturalHeight); // Vertical centering for label.
    if(direction==Clutter.TextDirection.LTR) {
      childBox.x1 = Math.floor(iconWidth * this.textOffsetFactor); // Label start offset.
      childBox.x2 = Math.min(childBox.x1 + naturalWidth, allocWidth, MAX_BUTTON_WIDTH); // Ensure it doesn't exceed bounds.
    } else {
      childBox.x2 = Math.min(allocWidth - Math.floor(iconWidth * this.textOffsetFactor), MAX_BUTTON_WIDTH); // Label end offset for RTL.
      childBox.x1 = Math.max(0, childBox.x2 - naturalWidth); // Calculate start from end.
    }
    this._label.actor.allocate(childBox, flags); // Allocate space for the label.
  },

  /**
   *  Displays the button, optionally with an animation.
   *  @param animate If true, the button will animate its appearance.
   *  @param targetWidth The final width if animating; otherwise, preferred width is used.
   */
  show: function(animate, targetWidth) {
    if(!animate) {
      this.actor.show(); // Just show instantly.
      return;
    }

    let width = this.oldWidth||targetWidth; // Use old width or target width.
    if(!width) {
      let [minWidth, naturalWidth] = this.actor.get_preferred_width(-1);
      width = naturalWidth; // Fallback to natural width.
    }

    this.actor.width = 3; // Start from a small width for animation.
    this.actor.show();    // Make visible to start animation.
    Tweener.addTween(this.actor,
      {
        width: width,
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad"
      }
    );
  },

  /**
   *  Hides the button, optionally with an animation.
   *  @param animate If true, the button will animate its disappearance.
   */
  hide: function(animate) {
    if(!animate) {
      this.actor.hide(); // Hide instantly.
      return;
    }

    this.oldWidth = this.actor.width; // Store current width for potential undo.
    Tweener.addTween(this.actor,
      {
        width: 3,        /* A small width is used instead of 0 to avoid
                          * Clutter-CRITICAL warnings about negative width. */
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad",
        onCompleteScope: this,
        onComplete: function() {
          this.actor.hide(); // Hide completely after animation.
        }
      }
    );
  },

  /**
   *  Displays the button's label, optionally with an animation.
   *  @param animate If true, the label will animate its appearance.
   *  @param targetWidth The final width if animating; otherwise, preferred width is used.
   */
  showLabel: function(animate, targetWidth) {
    if(!animate) {
      this._label.actor.show(); // Show label instantly.
      return;
    }

    let width = this.oldLabelWidth||targetWidth; // Use old label width or target.
    if(!width) {
      let [minWidth, naturalWidth] = this._label.actor.get_preferred_width(-1);
      width = naturalWidth; // Fallback to natural width.
    }

    this._label.actor.width = 0; // Start from zero width.
    this._label.actor.show();    // Make visible.
    Tweener.addTween(this._label.actor,
      {
        width: width,
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad"
      }
    );
  },

  /**
   *  Hides the button's label, optionally with an animation.
   *  @param animate If true, the label will animate its disappearance.
   */
  hideLabel: function(animate) {
    if(!animate) {
      this._label.actor.hide(); // Hide label instantly.
      return;
    }

    this.oldLabelWidth = this._label.actor.width; // Store current width.
    Tweener.addTween(this._label.actor,
      {
        width: 3,        /* Similar to button hide, use a small width to prevent
                          * Clutter-CRITICAL warnings. */
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad",
        onCompleteScope: this,
        onComplete: function() {
          this._label.actor.hide(); // Hide completely after animation.
        }
      }
    );
  }
};

/**
 *  Represents a button specifically tied to an application.
 *  It displays an app icon and label, and automatically highlights
 *  when a window of its associated application gains focus.
 */
function AppButton() {
  this._init.apply(this, arguments); // Initialize using base constructor.
}

// AppButton inherits from IconLabelButton.
AppButton.prototype = {
  __proto__: IconLabelButton.prototype, // Prototype chain setup.

  /**
   *  Initializes an AppButton instance.
   *  @param params An object containing initialization parameters like 'app' and 'iconSize'.
   */
  _init: function(params) {
    // Parse parameters, providing default values.
    params = Params.parse(params, {
      app: null,
      iconSize: 32,
      textOffsetFactor: 0.5
    });

    this.app = params.app; // Store the associated application object.
    // Attempt to get a faded icon for the application.
    // The icon size is doubled for potential high-DPI display.
    try {
      this.icon = this.app.get_faded_icon(2*params.iconSize);
    } catch(e) {
      // Fallback for cases where get_faded_icon might require text direction.
      this.icon = this.app.get_faded_icon(2*params.iconSize, Clutter.TextDirection.LTR);
    }
    // Call the base IconLabelButton constructor.
    IconLabelButton.prototype._init.call(this, this.icon, params.textOffsetFactor);

    // Track window focus changes to update button state.
    let tracker = Shell.WindowTracker.get_default();
    this._trackerSignal = tracker.connect('notify::focus-app', Lang.bind(this, this._onFocusChange));
  },

  /**
   *  Callback executed when the application focus changes.
   *  Updates the button's style based on whether its associated app is focused.
   */
  _onFocusChange: function() {
    // Check if any window of this application is focused.
    if(this.app.get_windows().some(function(w){return w.appears_focused;})) {
      this.actor.add_style_pseudo_class('active'); // Add 'active' style.
    } else {
      this.actor.remove_style_pseudo_class('active'); // Remove 'active' style.
    }
  },

  /**
   *  Cleans up resources used by the AppButton.
   *  Disconnects signals and destroys actors.
   */
  destroy: function() {
    let tracker = Shell.WindowTracker.get_default();
    tracker.disconnect(this._trackerSignal); // Disconnect focus tracking signal.
    this._container.destroy_all_children();  // Destroy child actors in container.
    this.actor.destroy();                    // Destroy the main actor.
  }
};


/**
 *  A button linked to a specific metaWindow.
 *  Clicking it raises the window, and its label dynamically updates
 *  with the window's title.
 */
function WindowButton() {
  this._init.apply(this, arguments); // Initialize using base constructor.
}

// WindowButton inherits from IconLabelButton.
WindowButton.prototype = {
  __proto__: IconLabelButton.prototype, // Set up prototype inheritance.

  /**
   *  Initializes a WindowButton instance.
   *  @param params An object containing 'app', 'metaWindow', 'iconSize', etc.
   */
  _init: function(params) {
    // Parse parameters, providing default values for robustness.
    params = Params.parse(params, {
      app: null,
      metaWindow: null,
      iconSize: 32,
      textOffsetFactor: 0.5
    });

    this.metaWindow = params.metaWindow; // Store the associated window object.
    this.app = params.app;               // Store the associated app object.
    if(this.app==null) {
      let tracker = Shell.WindowTracker.get_default();
      this.app = tracker.get_window_app(this.metaWindow); // Get app from window if not provided.
    }
    // Retrieve the application icon, handling potential errors.
    try {
      this.icon = this.app.get_faded_icon(2*params.iconSize);
    } catch(e) {
      this.icon = this.app.get_faded_icon(2*params.iconSize, Clutter.TextDirection.LTR);
    }
    // Call the base IconLabelButton constructor for core setup.
    IconLabelButton.prototype._init.call(this, this.icon, params.textOffsetFactor);
    this.signals = []; // Array to store signal IDs for manual disconnection.

    // Connect button release event for window interaction.
    this.actor.connect('button-release-event', Lang.bind(this, this._onButtonRelease));
    // Connect to various metaWindow signals to update button state.
    this.signals.push(this.metaWindow.connect('notify::appears-focused', Lang.bind(this, this._onFocusChange)));
    this.signals.push(this.metaWindow.connect('notify::title', Lang.bind(this, this._onTitleChange)));
    this.signals.push(this.metaWindow.connect('notify::urgent', Lang.bind(this, this._onAttentionRequest)));
    this.signals.push(this.metaWindow.connect('notify::demands-attention', Lang.bind(this, this._onAttentionRequest)));

    this._onTitleChange();    // Initial title update.
    this._onFocusChange();    // Initial focus state update.
  },

  /**
   *  Destroys the WindowButton and cleans up its associated resources.
   *  This includes disconnecting all metaWindow signals.
   */
  destroy: function() {
    // Disconnect all manually connected signals from the metaWindow.
    this.signals.forEach(Lang.bind(this, function(s) {
      this.metaWindow.disconnect(s);
    }));
    this._container.destroy_all_children(); // Clean up child actors.
    this.actor.destroy();                   // Destroy the main button actor.
  },

  /**
   *  Handles attention requests (urgent or demands-attention) from the metaWindow.
   *  Applies corresponding pseudo-classes to the button's actor.
   */
  _onAttentionRequest: function() {
    if(this.metaWindow.urgent) {
      this.actor.add_style_pseudo_class('urgent'); // Mark as urgent.
    } else {
      this.actor.remove_style_pseudo_class('urgent'); // Remove urgent status.
    }

    if(this.metaWindow.demands_attention) {
      this.actor.add_style_pseudo_class('demands-attention'); // Mark as demanding attention.
    } else {
      this.actor.remove_style_pseudo_class('demands-attention'); // Remove demanding attention status.
    }
  },

  /**
   *  Handles button release events on the button's actor.
   *  Activates or minimizes the associated metaWindow.
   *  @param actor The actor that received the event.
   *  @param event The Clutter event object.
   */
  _onButtonRelease: function(actor, event) {
    // Check if the primary mouse button (BUTTON1) was released.
    if(event.get_state()&Clutter.ModifierType.BUTTON1_MASK) {
      if(this.metaWindow.has_focus()) {
        this.metaWindow.minimize(global.get_current_time()); // Minimize if already focused.
      } else {
        let time = global.get_current_time(); // Get current time for activation.
        this.metaWindow.lastActivatedTime = time; // Update last activated time.
        this.metaWindow.activate(time);           // Activate the window.
      }
    }
  },

  /**
   *  Updates the button's active state based on whether its metaWindow is focused.
   */
  _onFocusChange: function() {
    let focused = this.metaWindow.appears_focused; // Check window focus.
    if(focused) {
      this.actor.add_style_pseudo_class('active'); // Add 'active' style if focused.
    } else {
      this.actor.remove_style_pseudo_class('active'); // Remove 'active' style.
    }
  },

  /**
   *  Updates the button's label with the current title of its metaWindow.
   */
  _onTitleChange: function() {
    let title = this.metaWindow.get_title()||''; // Get window title, default to empty string.
    this.setText(title); // Set the button's label text.
  },
};


/**
 *  A container designed to hold a collection of buttons,
 *  providing methods for managing their display and animation.
 */
function ButtonBox() {
  this._init.apply(this, arguments); // Initialize using the base constructor.
}

// Prototype methods for ButtonBox.
ButtonBox.prototype = {
  /**
   *  Initializes a new ButtonBox instance.
   *  Sets up the main actor as an St.BoxLayout.
   *  @param params An object for initialization parameters (currently unused).
   */
  _init: function(params) {
    params = Params.parse(params, {}); // Parse parameters (no specific ones defined yet).
    this.actor = new St.BoxLayout({style_class: 'app-window-list-box'}); // Create a horizontal box layout.
    // this.actor._delegate = this; // Delegate commented out, likely not needed for this container.
  },

  /**
   *  Displays the button box, optionally with an animation.
   *  @param animate If true, the box will animate its width.
   *  @param targetWidth The desired final width for the animation.
   */
  show: function(animate, targetWidth) {
    if(!animate) {
      this.actor.show(); // Show instantly if no animation requested.
      return;
    }

    let width = this.oldWidth||targetWidth; // Use stored width or provided target.
    if(!width) {
      let [minWidth, naturalWidth] = this.actor.get_preferred_width(-1);
      width = naturalWidth; // Default to natural width if no target or old width.
    }

    this.actor.width = 3; // Start from a small width for the animation effect.
    this.actor.show();    // Make the actor visible.
    Tweener.addTween(this.actor,
      {
        width: width,
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad"
      }
    );
  },

  /**
   *  Hides the button box, optionally with an animation.
   *  @param animate If true, the box will animate its width to a minimal size.
   */
  hide: function(animate) {
    if(!animate) {
      this.actor.hide(); // Hide instantly.
      return;
    }

    this.oldWidth = this.actor.width; // Store the current width before hiding.
    Tweener.addTween(this.actor,
      {
        width: 3,        /* Animating to a small positive width avoids
                          * Clutter-CRITICAL warnings when width becomes 0. */
        time: BUTTON_BOX_ANIMATION_TIME,
        transition: "easeOutQuad",
        onCompleteScope: this,
        onComplete: function() {
          this.actor.width = 0; // Set actual width to 0 after animation.
          this.actor.hide();    // Hide the actor completely.
        }
      }
    );
  },

  /**
   *  Expands a specific child button while squishing others.
   *  @param index The index of the child button to expand.
   */
  expandChild: function (index) {
    let children = this.actor.get_children(); // Get all child actors.

    /*
     *  Simultaneously expand the specified child and squish the others.
     *  This creates a visual effect where one button becomes prominent.
     */
    for(let i = 0; i<children.length; ++i) {
      let child = children[i];
      child._originalWidth = child.width; // Store original width for undo.
      Tweener.addTween(child,
        {
          // The target width is either the full box width (for expanded child)
          // or a minimal width (for squished children).
          width: (i===index?this.actor.width:3),
          time: BUTTON_BOX_ANIMATION_TIME,
          transition: "easeOutQuad",
          onComplete: (i===index?function(){}: // No action for expanded child.
            Lang.bind(child, function(){
              this.hide(); // Hide squished children after animation.
            }))
        }
      );
    }
    this._expanded = true; // Mark the box as expanded.
  },

  /**
   *  Reverts the expansion, restoring all child buttons to their original widths.
   */
  undoExpand: function () {
    if(!this._expanded) {
      return; // Do nothing if not currently expanded.
    }
    // FIXME: Consider adding a fade-in effect here for smoother transition.
    let children = this.actor.get_children(); // Get all child actors.
    for(let i = 0; i<children.length; ++i) {
      let child = children[i];
      child.show(); // Ensure all children are visible before animating.
      Tweener.addTween(child,
        {
          width: child._originalWidth, // Animate back to original width.
          time: BUTTON_BOX_ANIMATION_TIME,
          transition: "easeOutQuad"
        }
      );
    }
    this._expanded = false; // Reset the expanded state.
  },

  /**
   *  Adds a button to the button box.
   *  @param button The button object to add (its actor will be added).
   */
  add: function(button) {
    this.actor.add_actor(button.actor); // Add the button's actor to the box.
  },

  /**
   *  Removes a button from the button box.
   *  @param button The button object to remove.
   */
  remove: function(button) {
    this.actor.remove_actor(button.actor); // Remove the button's actor.
  },

  /**
   *  Removes all child buttons from the box.
   */
  clear: function() {
    this.actor.destroy_all_children(); // Destroy all child actors.
  },

  /**
   *  Destroys the ButtonBox and all its contents.
   */
  destroy: function() {
    this.actor.destroy_all_children(); // Destroy all children first.
    this.actor.destroy();              // Then destroy the main actor.
    this.actor = null;                 // Nullify the actor reference.
  }
};