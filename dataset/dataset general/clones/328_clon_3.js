// RichContentEditor, version 2.0.1
//
// Author: Visionary Devs (http://www.visionarydevs.com)
//
// Contributors:
//   A diverse team of innovators, dedicated to enhancing web content management.
//
// RichContentEditor is freely distributable under the terms of an MIT-style license.
// For details, see the project's official repository: https://github.com/visionarydevs/richcontenteditor

// Ensure required external libraries are present for proper operation.
if (typeof Ajax.InPlaceEditor === 'undefined') {
  console.error("RichContentEditor Initialization Error: 'script.aculo.us' controls.js library is not detected. Please ensure it's loaded.");
  throw new Error("Missing Dependency: Ajax.InPlaceEditor");
}
if (typeof tinyMCE === 'undefined') {
  console.error("RichContentEditor Initialization Error: Moxiecode's 'tiny_mce.js' library is not found. Proper TinyMCE setup is essential.");
  throw new Error("Missing Dependency: tinyMCE");
}

// Intercept TinyMCE's editor registration to attach custom event hooks.
(function() {
  const originalAddEditor = tinymce.EditorManager.add;
  tinymce.EditorManager.add = function(editorInstance) {
    editorInstance.onInit.add(function(initializedEditor) {
      // Trigger a custom event on the DOM element when the RTE is ready.
      // This allows external components to react to the editor's initialization.
      $(initializedEditor.id).fire('rte:initialized', initializedEditor);
    });
    // Call the original TinyMCE method to ensure normal editor registration proceeds.
    return originalAddEditor(editorInstance);
  };
})();

/**
 * @class Ajax.RichContentEditor
 * @augments Ajax.InPlaceEditor
 * @description
 * Extends the basic InPlaceEditor functionality to incorporate a TinyMCE rich text editor.
 * Provides advanced features like dynamic sizing, external content loading, and TinyMCE save integration.
 */
Ajax.RichContentEditor = Class.create(Ajax.InPlaceEditor, {
  /**
   * Initializes a new RichContentEditor instance.
   * @param {HTMLElement|string} targetElement - The DOM element to transform into an editable region.
   * @param {string} dataEndpointUrl - The URL for fetching/saving content via AJAX.
   * @param {Object} editorConfiguration - Configuration options for the base InPlaceEditor.
   * @param {Object} rteCoreSettings - Specific settings for the TinyMCE instance.
   */
  initialize: function(targetElement, dataEndpointUrl, editorConfiguration, rteCoreSettings) {
    if (!targetElement) {
      console.error("RichContentEditor: Target element is undefined. Initialization aborted.");
      return;
    }
    if (!dataEndpointUrl || typeof dataEndpointUrl !== 'string') {
      console.warn("RichContentEditor: Data endpoint URL is invalid or missing. Ensure proper AJAX communication.");
    }

    this.dataEndpointUrl = dataEndpointUrl;
    this.domTarget = $(targetElement); // Convert to Prototype Element
    this._managedDomElements = {}; // Stores references to dynamically created elements.

    this.setupBaseConfiguration(); // Prepare inherited options
    this.rteCoreSettings = Object.clone(rteCoreSettings || {}); // Deep clone TinyMCE settings

    // Merge provided options into the instance's runtime configuration.
    Object.extend(this.runtimeConfig, editorConfiguration || {});

    this.configureRteSaveBehavior(); // Setup TinyMCE save/cancel callbacks

    // Determine the form's unique identifier.
    if (!this.runtimeConfig.formId && this.domTarget.id) {
      this.runtimeConfig.formId = this.domTarget.id + '-' + this.runtimeConfig.formIdIdentifierSuffix;
      // If an element with this ID already exists, clear the formId to avoid conflicts.
      if ($(this.runtimeConfig.formId)) {
        this.runtimeConfig.formId = '';
        this.logMessage("Form ID conflict detected, proceeding without explicit formId.");
      }
    }

    // Set up the external activation trigger if specified.
    if (this.runtimeConfig.activationTrigger) {
      this.runtimeConfig.activationTrigger = $(this.runtimeConfig.activationTrigger);
      if (!Object.isElement(this.runtimeConfig.activationTrigger)) {
        this.logMessage("Provided activationTrigger is not a valid DOM element. Disabling external control.");
        this.runtimeConfig.triggerOnlyMode = false;
      }
    } else {
      this.runtimeConfig.triggerOnlyMode = false; // No external trigger, so cannot be trigger-only.
    }

    this._initialBgColor = this.domTarget.getStyle('background-color') || 'transparent';
    this.domTarget.title = this.runtimeConfig.activationTooltip;

    // Bind event handlers to the instance for correct 'this' context.
    this._cancelOperationHandler = this.handleFormCancellation.bind(this);
    this._completionCallback = (this.runtimeConfig.onComplete || Prototype.emptyFunction).bind(this);
    this._ajaxFailureHandler = this.handleAJAXFailure.bind(this);
    this._submissionHandler = this.handleFormSubmission.bind(this);
    this._cleanupHandler = this.wrapUp.bind(this);

    this.attachEventHandlers(); // Register necessary listeners.

    // Automatically enter edit mode if content is empty and option is enabled.
    if (this.runtimeConfig.activateOnEmptyContent && this.retrieveContent().strip().empty()) {
      this.enterEditMode();
    }
    this.logMessage("RichContentEditor initialized successfully for element: " + this.domTarget.id);
  },

  /**
   * Overrides the base createControl method to conditionally skip control creation
   * if TinyMCE save integration is enabled (as TinyMCE handles its own buttons).
   * @param {string} controlType - Type of control (e.g., 'okButton', 'cancelButton').
   * @param {Function} eventHandler - The function to call when the control is activated.
   * @param {string} additionalStyles - Extra CSS classes for the control.
   */
  createControl: function($super, controlType, eventHandler, additionalStyles) {
    if (this.runtimeConfig.enableRteSaveIntegration) {
      this.logMessage("Skipping creation of standard control: " + controlType + " due to TinyMCE save integration.");
      return; // TinyMCE will manage its own save/cancel buttons.
    }
    $super(controlType, eventHandler, additionalStyles);
  },

  /**
   * Creates the textarea element that will host the TinyMCE editor.
   * Overrides the base method to use Prototype's Element constructor and custom options.
   */
  createEditField: function() {
    const currentConfig = this.runtimeConfig;
    let initialFieldContent = (currentConfig.externalContentUrl ? currentConfig.loadingText : this.retrieveContent());

    let textAreaElement = new Element('textarea', {
      id: this.domTarget.id + '-' + currentConfig.rteFieldIdentifierSuffix,
      name: currentConfig.submissionFieldName,
      className: currentConfig.rteFieldStylingClass,
      value: initialFieldContent // Content directly assigned, no HTML conversion needed initially.
    });

    // Set dimensions; these might be overridden by TinyMCE settings later.
    textAreaElement.writeAttribute({
      rows: 5, // Default rows
      cols: 60 // Default columns
    });

    this._managedDomElements.rteTextArea = textAreaElement;

    // If content needs to be loaded externally, initiate the AJAX request.
    if (currentConfig.externalContentUrl) {
      this.fetchExternalContent();
    }

    // Append the textarea to the form.
    try {
      this._form.appendChild(this._managedDomElements.rteTextArea);
    } catch (e) {
      console.error("RichContentEditor: Failed to append textarea to form.", e);
    }
    this.logMessage("Rich text area created with ID: " + textAreaElement.id);
  },

  /**
   * Enters the edit mode, hides the original element, and initializes TinyMCE.
   * @param {Event} [activationEvent] - The event that triggered edit mode entry.
   */
  enterEditMode: function($super, activationEvent) {
    this.logMessage("Entering rich edit mode...");
    // If auto-resizing is enabled, capture the target element's dimensions first.
    let targetDimensions;
    if (this.runtimeConfig.autoAdjustRteSize) {
      targetDimensions = this.domTarget.getDimensions();
    }

    $super(activationEvent); // Call the base InPlaceEditor's enterEditMode.

    // Instantiate TinyMCE editor.
    this.activeRteInstance = new tinymce.Editor(this._managedDomElements.rteTextArea.id, this.rteCoreSettings, tinymce.EditorManager);

    // Attach a handler for TinyMCE's init event.
    this.activeRteInstance.onInit.add(function(editorContext) {
      // If the form is currently in a loading state, show TinyMCE's progress indicator.
      if (this._form.hasClassName(this.runtimeConfig.loadStateClass)) {
        editorContext.setProgressState(1); // Show progress bar
      }
      this.logMessage("TinyMCE editor initialized for ID: " + editorContext.id);
    }.bind(this));

    // Link the TinyMCE instance back to this RichContentEditor instance.
    this.activeRteInstance.associatedEditor = this;

    // Apply dynamic sizing if configured.
    if (this.runtimeConfig.autoAdjustRteSize && targetDimensions) {
      this.activeRteInstance.settings.height = targetDimensions.height;
      this.activeRteInstance.settings.width = targetDimensions.width;
      this.logMessage(`RTE size adjusted to target element dimensions: ${targetDimensions.width}x${targetDimensions.height}`);
    }

    // Render the TinyMCE editor.
    this.activeRteInstance.render();
  },

  /**
   * Retrieves the current HTML content from the target DOM element.
   * @returns {string} The inner HTML content, stripped and unescaped.
   */
  retrieveContent: function() {
    // Return the content, ensuring it's trimmed and HTML entities are decoded.
    return this.domTarget.innerHTML.strip().unescapeHTML();
  },

  /**
   * Handles AJAX failure, logging the error and restoring the original content in the RTE.
   * @param {Object} xhrResponse - The XMLHttpRequest object from the failed request.
   */
  handleAJAXFailure: function($super, xhrResponse) {
    console.error("RichContentEditor: AJAX request failed.", xhrResponse);
    $super(xhrResponse); // Call the base class's failure handler.
    // Restore the editor's content to its original state from the DOM target.
    if (this.activeRteInstance) {
      this.activeRteInstance.setContent(this.domTarget.innerHTML);
    }
  },

  /**
   * Handles the form submission event, ensuring TinyMCE content is saved before submission.
   * @param {Event} submitEvent - The event object from the form submission.
   */
  handleFormSubmission: function($super, submitEvent) {
    if (this.activeRteInstance) {
      this.activeRteInstance.save(); // Instruct TinyMCE to save its content to the textarea.
      this.logMessage("TinyMCE content saved to textarea before form submission.");
    }
    $super(submitEvent); // Call the base class's submission handler.
    return true;
  },

  /**
   * Removes the rich text editor instance and cleans up the form.
   */
  removeForm: function($super) {
    this.logMessage("Initiating form cleanup and RTE removal.");
    if (this.activeRteInstance) {
      try {
        this.activeRteInstance.remove(); // Destroy the TinyMCE instance.
        this.logMessage("TinyMCE instance successfully removed.");
      } catch (e) {
        console.warn("RichContentEditor: Error while removing TinyMCE instance:", e);
      }
    }
    $super(); // Call the base class's form removal method.
  },

  /**
   * Fetches content from an external URL to populate the rich text editor.
   */
  fetchExternalContent: function() {
    const currentConfig = this.runtimeConfig;
    if (!currentConfig.externalContentUrl) {
      console.warn("RichContentEditor: Cannot fetch external content, externalContentUrl is not configured.");
      return;
    }

    this._form.addClassName(currentConfig.loadStateClass);
    this._managedDomElements.rteTextArea.disabled = true; // Disable textarea during loading.

    let requestOptions = Object.extend({
      method: 'get'
    }, currentConfig.xhrRequestConfig);

    Object.extend(requestOptions, {
      parameters: 'targetEditorIdentifier=' + encodeURIComponent(this.domTarget.id),
      onComplete: function() {
        if (this.activeRteInstance) {
          this.activeRteInstance.setProgressState(0); // Hide TinyMCE progress indicator.
        }
        this.logMessage("External content request completed.");
      }.bind(this),
      onSuccess: function(responseObject) {
        this._form.removeClassName(currentConfig.loadStateClass);
        let contentText = responseObject.responseText;

        // Optionally strip HTML tags from the loaded text.
        if (currentConfig.removeHtmlTagsFromLoadedText) {
          contentText = contentText.replace(/<[^>]*>?/gm, ''); // Regex-based strip tags.
        }

        this._managedDomElements.rteTextArea.value = contentText;
        if (this.activeRteInstance) {
          this.activeRteInstance.setContent(contentText); // Set content in TinyMCE.
        }
        this._managedDomElements.rteTextArea.disabled = false; // Re-enable textarea.
        this.finalizeFieldSetup(); // Perform post-processing.
        this.logMessage("External content loaded and applied.");
      }.bind(this),
      onFailure: this._ajaxFailureHandler
    });

    new Ajax.Request(this.dataEndpointUrl, requestOptions);
  },

  /**
   * Performs post-creation setup actions on the rich text editor field,
   * such as focusing or selecting all content, once TinyMCE is fully initialized.
   */
  finalizeFieldSetup: function() {
    const actionOnInit = this.runtimeConfig.postCreationFocusAction;
    const textAreaId = this._managedDomElements.rteTextArea.id;

    // Observe the custom 'rte:initialized' event fired by our TinyMCE override.
    $(textAreaId).observe('rte:initialized', function(event) {
      const editorContext = event.memo; // The TinyMCE editor instance.
      if (!editorContext || !actionOnInit) {
        return;
      }

      // Use a switch statement for cleaner action handling.
      switch (actionOnInit) {
        case 'focus':
          editorContext.focus();
          this.logMessage("Editor focused after initialization.");
          break;
        case 'activate':
          editorContext.execCommand('SelectAll');
          this.logMessage("All content selected after initialization.");
          break;
        default:
          this.logMessage("No specific post-creation action defined or recognized.");
          break;
      }
    }.bind(this));
  },

  /**
   * Configures TinyMCE's save and cancel callbacks if save integration is enabled.
   * Validates TinyMCE configuration to ensure the 'save' plugin and button are present.
   */
  configureRteSaveBehavior: function() {
    const config = this.runtimeConfig;
    const rteConfig = this.rteCoreSettings;

    if (!config.enableRteSaveIntegration) {
      this.logMessage("TinyMCE save integration is disabled.");
      return;
    }

    // If the theme is 'simple', TinyMCE save integration is not typically supported.
    if (rteConfig.editorTheme === 'simple') {
      config.enableRteSaveIntegration = false;
      this.logMessage("TinyMCE 'simple' theme detected; save integration disabled as it's not applicable.");
      return;
    }

    // Validate that the TinyMCE 'save' plugin is enabled and a save button is configured in the toolbars.
    const hasSaveButton = [rteConfig.toolbarConfig1, rteConfig.toolbarConfig2, rteConfig.toolbarConfig3]
      .some(toolbar => toolbar && toolbar.match(/(^|,)save(,|$)/));
    const hasSavePlugin = rteConfig.enabledPlugins && rteConfig.enabledPlugins.match(/(^|,)save(,|$)/);

    if (!hasSaveButton || !hasSavePlugin) {
      console.error("RichContentEditor Configuration Error: TinyMCE 'save' option requires the 'save' plugin to be enabled and a 'save' button present in at least one toolbar configuration (e.g., theme_advanced_buttons1).");
      throw new Error("TinyMCE Save Integration Misconfiguration");
    }

    // Assign custom callbacks for TinyMCE's save and cancel events.
    if (config.onRteSaveTriggered) {
      rteConfig.saveCallbackHandler = config.onRteSaveTriggered;
    }
    if (config.onRteCancelTriggered) {
      rteConfig.cancelCallbackHandler = config.onRteCancelTriggered;
    }
    this.logMessage("TinyMCE save/cancel callbacks configured.");
  },

  /**
   * Prepares the instance's runtime options by cloning global defaults and applying extra settings.
   */
  setupBaseConfiguration: function() {
    this.runtimeConfig = Object.clone(Ajax.RichContentEditor.GlobalDefaults);
    Object.extend(this.runtimeConfig, Ajax.RichContentEditor.DefaultEventHandlers);

    // Apply any additional default settings that might be defined (e.g., from subclasses).
    [this._additionalDefaultSettings].flatten().compact().each(function(extraSettings) {
      Object.extend(this.runtimeConfig, extraSettings);
    }.bind(this));
    this.logMessage("Base configuration initialized.");
  },

  /**
   * Helper for conditional console logging.
   * @param {string} message - The message to log.
   * @param {string} [level='log'] - The console method to use (e.g., 'log', 'debug', 'warn').
   */
  logMessage: function(message, level = 'log') {
    if (this.runtimeConfig && this.runtimeConfig.enableDebugLogging) {
      console[level](`[RCE - ${this.domTarget ? this.domTarget.id : 'N/A'}] ${message}`);
    }
  }
});

// Define global default options and event handlers for the RichContentEditor.
Object.extend(Ajax.RichContentEditor, {
  // Inherit and extend default options from the base InPlaceEditor.
  GlobalDefaults: Object.extend(Object.clone(Ajax.InPlaceEditor.BaseDefaults), {
    rteFieldStylingClass: 'rte-content-field', // CSS class for the textarea.
    postCreationFocusAction: 'focus', // Action to perform after editor creation: 'focus' or 'activate'.
    editorFormCssClass: 'rich-editor-form', // CSS class for the editor form.
    formIdIdentifierSuffix: 'rte-edit-form', // Suffix for generating the form's ID.
    loadStateClass: 'rte-loading-content', // CSS class applied during external content loading.
    saveStateClass: 'rte-saving-content', // CSS class applied during content saving.
    rteFieldIdentifierSuffix: 'rte-textarea', // Suffix for the TinyMCE textarea ID.
    enableRteSaveIntegration: false, // Enable TinyMCE's internal save/cancel buttons.
    autoAdjustRteSize: false, // Automatically resize TinyMCE to match the target element's dimensions.
    activationTooltip: 'Click to edit rich content', // Tooltip text for the editable element.
    removeHtmlTagsFromLoadedText: false, // Whether to strip HTML from externally loaded text.
    activateOnEmptyContent: false, // Automatically enter edit mode if the element has no content.
    enableDebugLogging: false // Enable verbose logging for debugging purposes.
  }),

  // Inherit and extend default callback functions.
  DefaultEventHandlers: Object.extend(Object.clone(Ajax.InPlaceEditor.BaseCallbacks), {
    /**
     * Default callback for TinyMCE's save event. Triggers the RichContentEditor's submission.
     * @param {tinymce.Editor} editorInst - The TinyMCE editor instance.
     */
    onRteSaveCallback: function(editorInst) {
      editorInst.associatedEditor._submissionHandler();
    },
    /**
     * Default callback for TinyMCE's cancel event. Triggers the RichContentEditor's cancellation.
     * @param {tinymce.Editor} editorInst - The TinyMCE editor instance.
     */
    onRteCancelCallback: function(editorInst) {
      editorInst.associatedEditor._cancelOperationHandler();
    }
  })
});