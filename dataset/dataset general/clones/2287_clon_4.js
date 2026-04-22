(function (globalReference) {
  'use strict';

  // --- Configuration Constants and Utility Functions ---
  const DIALOG_ELEMENT_ID_ATTRIBUTE = 'dialog-unit-id';
  const DIALOG_OPEN_TRIGGER_ATTRIBUTE = 'open-dialog-target';
  const DIALOG_REMOTE_CONTENT_ATTRIBUTE = 'remote-content-url';

  const OVERLAY_LAYER_CLASS = 'ui-modal-backdrop-layer';
  const DISMISS_ACTION_BUTTON_CLASS = 'close-dialog-button';
  const CURRENTLY_ACTIVE_DIALOG_CLASS = 'active-dialog-instance';
  const MOTION_IN_CLASS = 'motion-initiating';
  const MOTION_OUT_CLASS = 'motion-terminating';
  const SLIDE_MOTION_CLASS = 'has-slide-motion'; // For 'fadeAndSlide'
  const FADE_MOTION_CLASS = 'has-fade-motion'; // For 'fadeOnly'

  const KEYBOARD_ESCAPE_CODE = 27;

  // Custom Event Identifiers
  const EVENT_DIALOG_DISPLAY_START = 'dialog:displaying';
  const EVENT_DIALOG_DISPLAY_END = 'dialog:displayed';
  const EVENT_DIALOG_HIDE_START = 'dialog:concealing';
  const EVENT_DIALOG_HIDE_END = 'dialog:concealed';

  /**
   * Finds the closest ancestor element matching a selector.
   * @param {HTMLElement} element The starting element.
   * @param {string} selector The CSS selector to match.
   * @returns {HTMLElement|null} The closest matching ancestor or null.
   */
  function findClosestParent(element, selector) {
    if (!element || !selector) return null;
    return element.closest(selector);
  }

  /**
   * Retrieves a data attribute value from an element.
   * @param {HTMLElement} element The element to query.
   * @param {string} attributeName The name of the data attribute (e.g., 'dialog-unit-id').
   * @returns {string|null} The attribute value or null if not found.
   */
  function retrieveElementDataAttribute(element, attributeName) {
    return element.getAttribute(`data-${attributeName}`);
  }

  /**
   * Sets a data attribute value on an element.
   * @param {HTMLElement} element The element to modify.
   * @param {string} attributeName The name of the data attribute.
   * @param {string} value The value to set.
   */
  function assignElementDataAttribute(element, attributeName, value) {
    element.setAttribute(`data-${attributeName}`, value);
  }

  /**
   * Dispatches a custom event on an element.
   * @param {HTMLElement} element The element to dispatch the event on.
   * @param {string} eventName The name of the custom event.
   * @param {object} [detail={}] Custom data for the event.
   */
  function triggerElementEvent(element, eventName, detail = {}) {
    const event = new CustomEvent(eventName, { bubbles: true, detail });
    element.dispatchEvent(event);
  }

  /**
   * Applies a CSS class to an element and waits for its transition to complete.
   * @param {HTMLElement} element The element to animate.
   * @param {string} className The class to add/remove.
   * @param {number} durationMs The duration of the transition in milliseconds.
   * @param {boolean} [removeInstead=false] If true, removes the class instead of adding it.
   * @returns {Promise<void>} A promise that resolves when the transition ends or a timeout occurs.
   */
  async function animateClassChange(element, className, durationMs, removeInstead = false) {
    if (!element) return;
    return new Promise(resolve => {
      let transitionFinished = false;
      const transitionEndHandler = (e) => {
        if (e.target === element) {
          element.removeEventListener('transitionend', transitionEndHandler);
          element.style.transitionDuration = ''; // Clean up inline style
          transitionFinished = true;
          resolve();
        }
      };

      element.style.transitionDuration = `${durationMs}ms`;
      if (removeInstead) {
        element.classList.remove(className);
      } else {
        element.classList.add(className);
      }

      element.addEventListener('transitionend', transitionEndHandler);

      // Fallback for scenarios where transitionend might not fire (e.g., display: none to block)
      setTimeout(() => {
        if (!transitionFinished) {
          element.removeEventListener('transitionend', transitionEndHandler);
          element.style.transitionDuration = '';
          resolve();
        }
      }, durationMs + 100); // A small buffer
    });
  }

  // --- Dialog Instance Class (Manages individual modal behavior) ---
  class DialogInstanceUnit {
    constructor(dialogHTMLElement, managerDefaultOptions) {
      if (!(dialogHTMLElement instanceof HTMLElement)) {
        throw new Error("DialogInstanceUnit requires an HTMLElement.");
      }
      this.dialogElement = dialogHTMLElement;
      this.isInteractionBlocked = false; // Renamed from locked/isProcessing

      this.activeOptions = {
        entryMotionType: 'fadeAndSlide', // 'fadeAndSlide', 'fadeOnly', 'noMotion'
        motionDuration: 250,
        dismissOnBackgroundClick: true,
        dismissOnEscapePress: true,
        closeButtonClass: DISMISS_ACTION_BUTTON_CLASS,
        overlayClass: OVERLAY_LAYER_CLASS,
        onDisplayBegin: () => {},
        onDisplayComplete: () => {},
        onHideBegin: () => {},
        onHideComplete: () => {},
        onRemoteContentSuccess: null,
        overlayReference: null // Reference to the overlay element
      };

      Object.assign(this.activeOptions, managerDefaultOptions);
      this.synchronizeElementAttributes(); // Apply data attributes from the dialog element
    }

    /**
     * Parses and applies data attributes from the dialog element to its active options.
     */
    synchronizeElementAttributes() {
      for (const key in this.activeOptions) {
        const kebabCaseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const dataValue = retrieveElementDataAttribute(this.dialogElement, kebabCaseKey);
        if (dataValue !== null) {
          if (dataValue === 'true') this.activeOptions[key] = true;
          else if (dataValue === 'false') this.activeOptions[key] = false;
          else if (!isNaN(Number(dataValue)) && key === 'motionDuration') this.activeOptions[key] = Number(dataValue);
          else this.activeOptions[key] = dataValue;
        }
      }
    }

    /**
     * Stores initial positioning data (e.g., top offset) for animations.
     */
    cachePositioningDetails() {
      if (retrieveElementDataAttribute(this.dialogElement, 'initial-top') === null) {
        // Temporarily display to get accurate dimensions without showing it
        const originalDisplay = this.dialogElement.style.display;
        const originalVisibility = this.dialogElement.style.visibility;
        this.dialogElement.style.display = 'block';
        this.dialogElement.style.visibility = 'hidden';

        const computedStyle = getComputedStyle(this.dialogElement);
        const initialTopValue = parseFloat(computedStyle.top) || 0;
        assignElementDataAttribute(this.dialogElement, 'initial-top', initialTopValue);
        assignElementDataAttribute(this.dialogElement, 'vertical-boundary', this.dialogElement.offsetHeight + initialTopValue);

        this.dialogElement.style.display = originalDisplay;
        this.dialogElement.style.visibility = originalVisibility;
      }
    }

    /**
     * Displays the dialog with optional runtime overrides.
     * @param {object} [runtimeOverrides={}] Options to override for this specific display action.
     */
    async display(runtimeOverrides = {}) {
      if (this.isInteractionBlocked || this.dialogElement.classList.contains(CURRENTLY_ACTIVE_DIALOG_CLASS)) return;

      this.isInteractionBlocked = true;
      Object.assign(this.activeOptions, runtimeOverrides);

      triggerElementEvent(this.dialogElement, EVENT_DIALOG_DISPLAY_START);
      this.activeOptions.onDisplayBegin(this.dialogElement);

      const activeDialog = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
      if (activeDialog && activeDialog !== this.dialogElement) {
        AppComponents.dialogBox.hide(activeDialog); // Request manager to dismiss other dialog
      }

      this.cachePositioningDetails();
      await this.regulateOverlayVisibility(true);
      await this.revealDialogElement();

      this.dialogElement.classList.add(CURRENTLY_ACTIVE_DIALOG_CLASS);
      this.isInteractionBlocked = false;

      this.startMediaPlayback();
      triggerElementEvent(this.dialogElement, EVENT_DIALOG_DISPLAY_END);
      this.activeOptions.onDisplayComplete(this.dialogElement);
    }

    /**
     * Hides the dialog.
     */
    async hide() {
      if (this.isInteractionBlocked || !this.dialogElement.classList.contains(CURRENTLY_ACTIVE_DIALOG_CLASS)) return;

      this.isInteractionBlocked = true;

      triggerElementEvent(this.dialogElement, EVENT_DIALOG_HIDE_START);
      this.activeOptions.onHideBegin(this.dialogElement);

      this.stopMediaPlayback();
      await this.concealDialogElement();
      await this.regulateOverlayVisibility(false);

      this.dialogElement.classList.remove(CURRENTLY_ACTIVE_DIALOG_CLASS);
      this.isInteractionBlocked = false;

      triggerElementEvent(this.dialogElement, EVENT_DIALOG_HIDE_END);
      this.activeOptions.onHideComplete(this.dialogElement);
    }

    /**
     * Applies CSS to reveal the dialog element with animation.
     */
    async revealDialogElement() {
      this.dialogElement.style.display = 'block';
      this.dialogElement.style.visibility = 'visible';

      this.dialogElement.classList.add(FADE_MOTION_CLASS); // Always include fade transition

      if (/fadeAndSlide/i.test(this.activeOptions.entryMotionType)) {
        const initialTop = parseFloat(retrieveElementDataAttribute(this.dialogElement, 'initial-top'));
        const verticalBoundary = parseFloat(retrieveElementDataAttribute(this.dialogElement, 'vertical-boundary'));
        this.dialogElement.style.top = `${window.pageYOffset - verticalBoundary}px`;
        this.dialogElement.style.opacity = '0';
        this.dialogElement.classList.add(SLIDE_MOTION_CLASS);
        await animateClassChange(this.dialogElement, MOTION_IN_CLASS, this.activeOptions.motionDuration);
        this.dialogElement.style.top = `${window.pageYOffset + initialTop}px`;
        this.dialogElement.style.opacity = '1';
      } else if (/fadeOnly/i.test(this.activeOptions.entryMotionType)) {
        this.dialogElement.style.opacity = '0';
        await animateClassChange(this.dialogElement, MOTION_IN_CLASS, this.activeOptions.motionDuration);
        this.dialogElement.style.opacity = '1';
      } else {
        this.dialogElement.style.opacity = '1';
      }
      this.dialogElement.classList.remove(MOTION_IN_CLASS);
    }

    /**
     * Applies CSS to conceal the dialog element with animation.
     */
    async concealDialogElement() {
      if (/fadeAndSlide/i.test(this.activeOptions.entryMotionType)) {
        const verticalBoundary = parseFloat(retrieveElementDataAttribute(this.dialogElement, 'vertical-boundary'));
        await animateClassChange(this.dialogElement, MOTION_OUT_CLASS, this.activeOptions.motionDuration);
        this.dialogElement.style.top = `${-window.pageYOffset - verticalBoundary}px`;
        this.dialogElement.style.opacity = '0';
      } else if (/fadeOnly/i.test(this.activeOptions.entryMotionType)) {
        await animateClassChange(this.dialogElement, MOTION_OUT_CLASS, this.activeOptions.motionDuration);
        this.dialogElement.style.opacity = '0';
      } else {
        this.dialogElement.style.opacity = '0';
      }

      this.dialogElement.style.visibility = 'hidden';
      this.dialogElement.style.display = 'none';
      this.dialogElement.classList.remove(MOTION_OUT_CLASS, SLIDE_MOTION_CLASS, FADE_MOTION_CLASS);
      this.dialogElement.style.top = ''; // Clean up dynamic top
    }

    /**
     * Manages the visibility of the overlay layer.
     * @param {boolean} makeVisible True to show, false to hide.
     */
    async regulateOverlayVisibility(makeVisible) {
      let overlay = this.activeOptions.overlayReference;
      if (!overlay) {
        overlay = document.querySelector(`.${this.activeOptions.overlayClass}`);
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = this.activeOptions.overlayClass;
          document.body.appendChild(overlay);
        }
        this.activeOptions.overlayReference = overlay;
      }

      const overlayMotionDuration = this.activeOptions.motionDuration / 2;

      if (makeVisible) {
        if (!overlay.classList.contains(CURRENTLY_ACTIVE_DIALOG_CLASS)) {
          overlay.style.display = 'block';
          overlay.style.visibility = 'visible'; // Ensure visibility for transition
          await animateClassChange(overlay, MOTION_IN_CLASS, overlayMotionDuration);
          overlay.classList.add(CURRENTLY_ACTIVE_DIALOG_CLASS);
        }
      } else {
        const otherActiveDialogs = document.querySelectorAll(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}:not([data-${DIALOG_ELEMENT_ID_ATTRIBUTE}="${retrieveElementDataAttribute(this.dialogElement, DIALOG_ELEMENT_ID_ATTRIBUTE)}"])`);
        if (otherActiveDialogs.length === 0) {
          if (overlay.classList.contains(CURRENTLY_ACTIVE_DIALOG_CLASS)) {
            await animateClassChange(overlay, MOTION_OUT_CLASS, overlayMotionDuration);
            overlay.classList.remove(CURRENTLY_ACTIVE_DIALOG_CLASS);
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
          }
        }
      }
      overlay.classList.remove(MOTION_IN_CLASS, MOTION_OUT_CLASS); // Clean up overlay classes
    }

    /**
     * Starts playback for any video media within the dialog.
     */
    startMediaPlayback() {
      const mediaWrapper = this.dialogElement.querySelector('.responsive-media-wrapper');
      const mediaFrame = mediaWrapper ? mediaWrapper.querySelector('iframe') : null;

      if (mediaFrame) {
        const storedSource = mediaFrame.getAttribute('data-media-source');
        if (typeof storedSource === 'string' && storedSource !== mediaFrame.src) {
          mediaFrame.src = storedSource;
        } else {
          // Reload current source if no stored source or it's already current
          const currentSrc = mediaFrame.src;
          mediaFrame.src = 'about:blank'; // Clear to force reload
          mediaFrame.src = currentSrc;
        }
        if (mediaWrapper) mediaWrapper.style.display = 'block';
      }
    }

    /**
     * Stops playback for any video media within the dialog.
     */
    stopMediaPlayback() {
      const mediaWrapper = this.dialogElement.querySelector('.responsive-media-wrapper');
      const mediaFrame = mediaWrapper ? mediaWrapper.querySelector('iframe') : null;

      if (mediaFrame) {
        mediaFrame.setAttribute('data-media-source', mediaFrame.src); // Store current source
        mediaFrame.src = 'about:blank'; // Stop playback
        if (mediaWrapper) mediaWrapper.style.display = 'none';
      }
    }

    /**
     * Recalculates layout-dependent properties, especially for positioning.
     */
    recalculateLayout() {
      this.cachePositioningDetails();
      if (this.dialogElement.classList.contains(CURRENTLY_ACTIVE_DIALOG_CLASS)) {
        const initialTop = parseFloat(retrieveElementDataAttribute(this.dialogElement, 'initial-top'));
        this.dialogElement.style.top = `${window.pageYOffset + initialTop}px`;
      }
    }
  }

  // --- Global Modal Manager (Handles all dialog instances and global events) ---
  class GlobalModalManager {
    constructor() {
      this.managedDialogUnits = new Map(); // Map: dialog ID -> DialogInstanceUnit
      this.globalConfiguration = {
        entryMotionType: 'fadeAndSlide',
        motionDuration: 250,
        dismissOnBackgroundClick: true,
        dismissOnEscapePress: true,
        closeButtonClass: DISMISS_ACTION_BUTTON_CLASS,
        overlayClass: OVERLAY_LAYER_CLASS,
        onDisplayBegin: () => {},
        onDisplayComplete: () => {},
        onHideBegin: () => {},
        onHideComplete: () => {},
        onRemoteContentSuccess: null,
        init: true // Mimics Foundation's init return
      };
      this.attachGlobalEventHandlers();
    }

    /**
     * Initializes the module, discovering existing dialogs and applying global configuration.
     * @param {object} [options={}] Global options to apply.
     * @returns {GlobalModalManager} Returns itself for chaining.
     */
    initializeModule(options = {}) {
      Object.assign(this.globalConfiguration, options);
      document.querySelectorAll('.modal-dialog-component').forEach(element => {
        const dialogIdentifier = element.id || `unit-${Math.random().toString(36).substr(2, 9)}`;
        assignElementDataAttribute(element, DIALOG_ELEMENT_ID_ATTRIBUTE, dialogIdentifier);
        if (!this.managedDialogUnits.has(dialogIdentifier)) {
          this.managedDialogUnits.set(dialogIdentifier, new DialogInstanceUnit(element, this.globalConfiguration));
        }
      });
      return this;
    }

    /**
     * Attaches global event listeners for triggers, dismissals, and window changes.
     */
    attachGlobalEventHandlers() {
      document.body.addEventListener('click', this.handleTriggerActivation.bind(this));
      document.body.addEventListener('click', this.handleDismissalAttempt.bind(this));
      document.body.addEventListener('keyup', this.handleEscapeKeyEvent.bind(this));
      window.addEventListener('resize', this.handleWindowLayoutRecalculation.bind(this));
      window.addEventListener('scroll', this.handleWindowLayoutRecalculation.bind(this));
    }

    /**
     * Removes all global event listeners.
     */
    removeGlobalEventHandlers() {
      document.body.removeEventListener('click', this.handleTriggerActivation.bind(this));
      document.body.removeEventListener('click', this.handleDismissalAttempt.bind(this));
      document.body.removeEventListener('keyup', this.handleEscapeKeyEvent.bind(this));
      window.removeEventListener('resize', this.handleWindowLayoutRecalculation.bind(this));
      window.removeEventListener('scroll', this.handleWindowLayoutRecalculation.bind(this));
      this.managedDialogUnits.clear();
    }

    /**
     * Handles clicks on elements designated to open dialogs.
     * @param {Event} event The click event.
     */
    handleTriggerActivation(event) {
      const activator = findClosestParent(event.target, `[data-${DIALOG_OPEN_TRIGGER_ATTRIBUTE}]`);
      if (activator) {
        event.preventDefault();
        const targetDialogId = retrieveElementDataAttribute(activator, DIALOG_OPEN_TRIGGER_ATTRIBUTE);
        const dialogUnit = this.managedDialogUnits.get(targetDialogId);

        if (dialogUnit && !dialogUnit.isInteractionBlocked) {
          const remoteContentSource = retrieveElementDataAttribute(activator, DIALOG_REMOTE_CONTENT_ATTRIBUTE);
          if (remoteContentSource) {
            this.loadRemoteContent(dialogUnit, remoteContentSource).then(() => {
              dialogUnit.display();
            }).catch(error => console.error('Failed to load dialog remote content:', error));
          } else {
            dialogUnit.display();
          }
        }
      }
    }

    /**
     * Handles clicks that might dismiss a dialog (e.g., close button, overlay).
     * @param {Event} event The click event.
     */
    handleDismissalAttempt(event) {
      const currentActiveDialog = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
      if (!currentActiveDialog) return;

      const dialogUnit = this.managedDialogUnits.get(retrieveElementDataAttribute(currentActiveDialog, DIALOG_ELEMENT_ID_ATTRIBUTE));
      if (!dialogUnit || dialogUnit.isInteractionBlocked) return;

      const isCloseControl = findClosestParent(event.target, `.${dialogUnit.activeOptions.closeButtonClass}`);
      const isOverlayClick = event.target.classList.contains(dialogUnit.activeOptions.overlayClass);

      if (isCloseControl || (isOverlayClick && dialogUnit.activeOptions.dismissOnBackgroundClick)) {
        event.preventDefault();
        dialogUnit.hide();
      }
    }

    /**
     * Handles the Escape key press to dismiss the active dialog.
     * @param {KeyboardEvent} event The keyup event.
     */
    handleEscapeKeyEvent(event) {
      if (event.which === KEYBOARD_ESCAPE_CODE) {
        const currentActiveDialog = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
        if (!currentActiveDialog) return;

        const dialogUnit = this.managedDialogUnits.get(retrieveElementDataAttribute(currentActiveDialog, DIALOG_ELEMENT_ID_ATTRIBUTE));
        if (dialogUnit && !dialogUnit.isInteractionBlocked && dialogUnit.activeOptions.dismissOnEscapePress) {
          dialogUnit.hide();
        }
      }
    }

    /**
     * Handles window resize and scroll events to recalibrate dialog layout.
     */
    handleWindowLayoutRecalculation() {
      const currentActiveDialog = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
      if (currentActiveDialog) {
        const dialogUnit = this.managedDialogUnits.get(retrieveElementDataAttribute(currentActiveDialog, DIALOG_ELEMENT_ID_ATTRIBUTE));
        if (dialogUnit) {
          dialogUnit.recalculateLayout();
        }
      }
    }

    /**
     * Public method to request displaying a specific dialog.
     * @param {string} dialogId The ID of the dialog to display.
     * @param {object} [options={}] Runtime options for this display action.
     */
    requestDisplay(dialogId, options) {
      const dialogUnit = this.managedDialogUnits.get(dialogId);
      if (dialogUnit) {
        const activatorElement = document.querySelector(`[data-${DIALOG_OPEN_TRIGGER_ATTRIBUTE}="${dialogId}"]`);
        const remoteContentSource = activatorElement ? retrieveElementDataAttribute(activatorElement, DIALOG_REMOTE_CONTENT_ATTRIBUTE) : null;

        if (remoteContentSource) {
          this.loadRemoteContent(dialogUnit, remoteContentSource).then(() => {
            dialogUnit.display(options);
          }).catch(error => console.error('Failed to load dialog remote content:', error));
        } else {
          dialogUnit.display(options);
        }
      } else {
        console.warn(`Dialog with ID "${dialogId}" not found for display request.`);
      }
    }

    /**
     * Public method to request hiding a specific dialog.
     * @param {HTMLElement|string|null} dialogTarget The dialog element, its ID, or null to hide the active dialog.
     */
    requestHide(dialogTarget) {
      let targetElement = dialogTarget;
      if (typeof dialogTarget === 'string') {
          targetElement = document.getElementById(dialogTarget);
      } else if (!dialogTarget) {
          targetElement = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
      }

      if (targetElement) {
        const dialogUnit = this.managedDialogUnits.get(retrieveElementDataAttribute(targetElement, DIALOG_ELEMENT_ID_ATTRIBUTE));
        if (dialogUnit) {
          dialogUnit.hide();
        }
      }
    }

    /**
     * Fetches remote content and injects it into the dialog.
     * @param {DialogInstanceUnit} dialogUnit The dialog instance to update.
     * @param {string} url The URL to fetch content from.
     * @returns {Promise<void>} A promise that resolves when content is loaded.
     */
    async loadRemoteContent(dialogUnit, url) {
      if (!url) return Promise.resolve();

      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          dialogUnit.dialogElement.innerHTML = data;
          if (typeof dialogUnit.activeOptions.onRemoteContentSuccess === 'function') {
            dialogUnit.activeOptions.onRemoteContentSuccess(data);
          }
          dialogUnit.recalculateLayout();
        });
    }

    /**
     * Retrieves a dialog instance by its ID.
     * @param {string} dialogId The ID of the dialog.
     * @returns {DialogInstanceUnit|undefined} The dialog instance or undefined if not found.
     */
    getDialogInstance(dialogId) {
      return this.managedDialogUnits.get(dialogId);
    }
  }

  // --- Global Entry Point for External Interactions ---
  // This object mimics the structure and public interface of the original jQuery plugin.
  const GlobalComponentInterface = {
    moduleName: 'dialogBox',
    versionNumber: '1.0.0', // My distinct version
    isInteractionBlocked: false, // Global lock, though specific dialogs have their own
    moduleSettings: {
      entryMotionType: 'fadeAndSlide',
      motionDuration: 250,
      dismissOnBackgroundClick: true,
      dismissOnEscapePress: true,
      closeButtonClass: DISMISS_ACTION_BUTTON_CLASS,
      overlayClass: OVERLAY_LAYER_CLASS,
      onDisplayBegin: () => {},
      onDisplayComplete: () => {},
      onHideBegin: () => {},
      onHideComplete: () => {},
      onRemoteContentSuccess: null,
      init: true // Mimics Foundation's init return value
    },

    /**
     * The primary entry point, mimicking Foundation's `init` method.
     * Handles initial configuration and command execution.
     * @param {HTMLElement|string|object} targetContext The element, dialog ID, or options object.
     * @param {string|object} [commandOrConfig] The command string ('open', 'close') or configuration object.
     * @param {object} [commandParameters] Additional parameters for commands.
     * @returns {*} Typically returns `true` (mimicking Foundation's `init` return).
     */
    bootstrap: function (targetContext, commandOrConfig, commandParameters) {
      if (!globalReference._modalManagerSingleton) {
        globalReference._modalManagerSingleton = new GlobalModalManager();
        globalReference._modalManagerSingleton.initializeModule(this.moduleSettings);
      }

      const manager = globalReference._modalManagerSingleton;

      if (typeof commandOrConfig === 'object') {
        // Initial configuration call (e.g., Foundation.libs.reveal.init(scope, { options }))
        Object.assign(this.moduleSettings, commandOrConfig);
        manager.initializeModule(this.moduleSettings);
      } else if (typeof commandOrConfig === 'string') {
        // Method call (e.g., $(element).foundation('reveal', 'close'))
        let dialogIdentifier;
        if (targetContext instanceof HTMLElement) {
          dialogIdentifier = retrieveElementDataAttribute(targetContext, DIALOG_ELEMENT_ID_ATTRIBUTE);
        } else if (typeof targetContext === 'string') { // If an ID string is passed as context
          dialogIdentifier = targetContext;
        }

        // If no specific dialog ID from context, try to get the currently active one
        if (!dialogIdentifier) {
            const activeDialog = document.querySelector(`.${CURRENTLY_ACTIVE_DIALOG_CLASS}`);
            if (activeDialog) dialogIdentifier = retrieveElementDataAttribute(activeDialog, DIALOG_ELEMENT_ID_ATTRIBUTE);
        }

        const dialogUnit = dialogIdentifier ? manager.getDialogInstance(dialogIdentifier) : null;

        if (!dialogUnit && (commandOrConfig === 'open' || commandOrConfig === 'display')) {
            // If opening and target is not a dialog, try to find a dialog using the targetContext as an ID
            dialogIdentifier = targetContext;
            const potentialDialog = document.getElementById(dialogIdentifier);
            if (potentialDialog) {
                assignElementDataAttribute(potentialDialog, DIALOG_ELEMENT_ID_ATTRIBUTE, dialogIdentifier);
                manager.managedDialogUnits.set(dialogIdentifier, new DialogInstanceUnit(potentialDialog, manager.globalConfiguration));
                dialogUnit = manager.getDialogInstance(dialogIdentifier);
            }
        }


        if (!dialogUnit) {
            console.warn(`No dialog instance found for target context: ${dialogIdentifier || targetContext}.`);
            return;
        }

        switch (commandOrConfig) {
          case 'display':
          case 'open':
            manager.requestDisplay(dialogIdentifier, commandParameters);
            break;
          case 'hide':
          case 'close':
            manager.requestHide(dialogUnit.dialogElement); // Pass the element to ensure specific closing
            break;
          case 'recalculateLayout':
          case 'reflow': // Alias for original
            dialogUnit.recalculateLayout();
            break;
          case 'off':
            manager.removeGlobalEventHandlers();
            // Optionally, clear all dialog instances from the manager
            manager.managedDialogUnits.clear();
            break;
          default:
            console.warn(`Unknown command "${commandOrConfig}" for dialogBox module.`);
        }
      } else {
        // Initial setup without specific options or commands (e.g., Foundation.libs.reveal.init(scope))
        manager.initializeModule(this.moduleSettings);
      }
      return this.moduleSettings.init; // Mimic original's return
    },

    // Public methods for direct calls, mimicking Foundation.libs.reveal.open() etc.
    display: function(dialogElementOrId, runtimeOptions) {
        if (!globalReference._modalManagerSingleton) {
            globalReference._modalManagerSingleton = new GlobalModalManager();
            globalReference._modalManagerSingleton.initializeModule(this.moduleSettings);
        }
        let dialogIdentifier;
        if (dialogElementOrId instanceof HTMLElement) {
            dialogIdentifier = retrieveElementDataAttribute(dialogElementOrId, DIALOG_ELEMENT_ID_ATTRIBUTE);
        } else {
            dialogIdentifier = dialogElementOrId;
        }
        if (dialogIdentifier) {
            globalReference._modalManagerSingleton.requestDisplay(dialogIdentifier, runtimeOptions);
        } else {
            console.error("Invalid dialog target for 'display' method.");
        }
    },
    hide: function(dialogElementOrId) {
        if (!globalReference._modalManagerSingleton) {
            globalReference._modalManagerSingleton = new GlobalModalManager();
            globalReference._modalManagerSingleton.initializeModule(this.moduleSettings);
        }
        globalReference._modalManagerSingleton.requestHide(dialogElementOrId);
    },
    recalculateLayout: function(dialogElementOrId) {
        if (!globalReference._modalManagerSingleton) {
            globalReference._modalManagerSingleton = new GlobalModalManager();
            globalReference._modalManagerSingleton.initializeModule(this.moduleSettings);
        }
        let dialogIdentifier;
        if (dialogElementOrId instanceof HTMLElement) {
            dialogIdentifier = retrieveElementDataAttribute(dialogElementOrId, DIALOG_ELEMENT_ID_ATTRIBUTE);
        } else {
            dialogIdentifier = dialogElementOrId;
        }
        const dialogUnit = dialogIdentifier ? globalReference._modalManagerSingleton.getDialogInstance(dialogIdentifier) : null;
        if (dialogUnit) {
            dialogUnit.recalculateLayout();
        } else {
            console.warn(`No dialog instance found for recalibrate target: ${dialogIdentifier || dialogElementOrId}.`);
        }
    }
  };

  if (!globalReference.AppComponents) {
    globalReference.AppComponents = {};
  }
  globalReference.AppComponents.dialogBox = GlobalComponentInterface;

})(this);