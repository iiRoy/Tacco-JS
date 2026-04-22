if (typeof window.tinymce !== 'object' || typeof window.tinymce.EditorManager !== 'object') {
  throw "RichTextEditor requires TinyMCE library and proper initialization.";
}

const tinymceOriginalAdd = window.tinymce.EditorManager.add;
window.tinymce.EditorManager.add = function(instance) {
  instance.onInit.add(function(editor) {
    const targetDomElement = document.getElementById(editor.id);
    if (targetDomElement) {
      targetDomElement.dispatchEvent(new CustomEvent('custom-tiny-init', { detail: editor }));
    }
  });
  return tinymceOriginalAdd(instance);
};

class CoreInlineEditor {
  constructor(elementReference, dataEndpoint, generalConfiguration) {
    this.dataEndpoint = dataEndpoint;
    this.targetElement = elementReference;
    this.mainConfiguration = {};
    this.componentRegistry = {};
    this.editingForm = null;
    this.originalStyleSnapshot = null;

    // Initial configuration for bound methods, will be re-bound after full config merge
    this.submissionAction = this.processFormSubmission.bind(this);
    this.cancelAction = this.processFormCancellation.bind(this);
    this.requestFailureAction = this.handleDataRequestFailure.bind(this);
    this.completionAction = this.handleDataRequestCompletion.bind(this);
    this.finalizationAction = this.wrapUpEditing.bind(this);

    this.mainConfiguration = Object.assign({}, CoreInlineEditor.standardOptions, CoreInlineEditor.standardCallbacks, generalConfiguration);

    this.establishEventListeners();
  }

  establishEventListeners() {
    // Base InPlaceEditor typically observes clicks on the target element
    // this.targetElement.addEventListener('click', this.activateEditMode.bind(this));
  }

  getCurrentContent() {
    return this.targetElement.innerHTML;
  }

  activateEditMode(eventTrigger) {
    if (this.editingForm) return;

    this.originalStyleSnapshot = window.getComputedStyle(this.targetElement).backgroundColor || 'transparent';
    this.targetElement.style.backgroundColor = this.mainConfiguration.highlightColor;
    this.targetElement.style.visibility = 'hidden';

    this.editingForm = document.createElement('form');
    this.editingForm.id = this.mainConfiguration.formIdentifier || `inline-editor-form-${Math.random().toString(36).substring(2, 11)}`;
    this.editingForm.className = this.mainConfiguration.formLayoutClass;
    this.editingForm.style.position = 'absolute';
    this.editingForm.style.top = `${this.targetElement.offsetTop}px`;
    this.editingForm.style.left = `${this.targetElement.offsetLeft}px`;
    this.editingForm.style.width = `${this.targetElement.offsetWidth}px`;
    this.editingForm.style.height = `${this.targetElement.offsetHeight}px`;
    this.editingForm.style.zIndex = '9999';

    this.targetElement.parentNode.insertBefore(this.editingForm, this.targetElement.nextSibling);

    this.editingForm.addEventListener('submit', this.submissionAction);
    this.editingForm.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelAction(e);
      }
    });

    this.constructEditorField();
    this.constructControlElements();

    if (this.mainConfiguration.fetchContentUrl && !this.mainConfiguration.useRichEditorSave) {
      this.retrieveExternalContent();
    }
  }

  constructEditorField() {
    // This is a placeholder, expected to be overridden by derived classes.
    // Base InPlaceEditor might create a simple input field here.
  }

  constructControlElements() {
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = this.mainConfiguration.saveButtonLabel;
    submitBtn.className = this.mainConfiguration.saveButtonClass;
    this.editingForm.appendChild(submitBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = this.mainConfiguration.cancelButtonLabel;
    cancelBtn.className = this.mainConfiguration.cancelButtonClass;
    cancelBtn.addEventListener('click', this.cancelAction);
    this.editingForm.appendChild(cancelBtn);

    this.componentRegistry.submitButton = submitBtn;
    this.componentRegistry.cancelButton = cancelBtn;
  }

  retrieveExternalContent() {
    if (!this.mainConfiguration.fetchContentUrl) return;

    this.editingForm.classList.add(this.mainConfiguration.loadingLayoutClass);
    if (this.componentRegistry.editorInput) {
      this.componentRegistry.editorInput.disabled = true;
    }

    const queryParams = new URLSearchParams({ editorId: this.targetElement.id });
    const requestUrl = `${this.mainConfiguration.fetchContentUrl}?${queryParams.toString()}`;

    fetch(requestUrl, { method: 'GET' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        return response.text();
      })
      .then(contentPayload => {
        this.editingForm.classList.remove(this.mainConfiguration.loadingLayoutClass);
        if (this.mainConfiguration.stripFetchedContentTags) {
          contentPayload = contentPayload.replace(/<[^>]*>?/gm, '');
        }
        if (this.componentRegistry.editorInput) {
          this.componentRegistry.editorInput.value = contentPayload;
          this.componentRegistry.editorInput.disabled = false;
        }
        this.postFieldInitialization();
      })
      .catch(error => {
        console.error("Error fetching external content:", error);
        this.handleDataRequestFailure(error);
      })
      .finally(() => {
        this.handleDataRequestCompletion();
      });
  }

  postFieldInitialization() {
    // Placeholder, expected to be overridden by derived classes for specific post-creation logic.
  }

  processFormSubmission(event) {
    event.preventDefault();
    this.editingForm.classList.add(this.mainConfiguration.savingLayoutClass);

    const formData = new FormData(this.editingForm);
    const requestPayload = new URLSearchParams(formData).toString();

    fetch(this.dataEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestPayload
      })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        return response.text();
      })
      .then(responseData => {
        this.targetElement.innerHTML = responseData;
        this.finalizationAction();
        if (typeof this.mainConfiguration.onSave === 'function') {
          this.mainConfiguration.onSave(this, responseData);
        }
      })
      .catch(error => {
        console.error("Error submitting form:", error);
        this.handleDataRequestFailure(error);
      })
      .finally(() => {
        this.handleDataRequestCompletion();
      });
  }

  processFormCancellation(event) {
    event.preventDefault();
    this.finalizationAction(true);
    if (typeof this.mainConfiguration.onCancel === 'function') {
      this.mainConfiguration.onCancel(this);
    }
  }

  handleDataRequestFailure(errorDetails) {
    this.editingForm.classList.add(this.mainConfiguration.failureLayoutClass);
    if (typeof this.mainConfiguration.onFailure === 'function') {
      this.mainConfiguration.onFailure(this, errorDetails);
    }
  }

  handleDataRequestCompletion() {
    this.editingForm.classList.remove(this.mainConfiguration.loadingLayoutClass);
    this.editingForm.classList.remove(this.mainConfiguration.savingLayoutClass);
    if (typeof this.mainConfiguration.onComplete === 'function') {
      this.mainConfiguration.onComplete(this);
    }
  }

  removeEditorForm() {
    if (this.editingForm && this.editingForm.parentNode) {
      this.editingForm.parentNode.removeChild(this.editingForm);
    }
    this.editingForm = null;
    this.targetElement.style.backgroundColor = this.originalStyleSnapshot;
    this.targetElement.style.visibility = 'visible';
  }

  wrapUpEditing(wasCancelled = false) {
    this.removeEditorForm();
  }
}

CoreInlineEditor.standardOptions = {
  highlightColor: '#ffff99',
  formIdentifierSuffix: 'standard-editor',
  formLayoutClass: 'core-inline-form',
  loadingLayoutClass: 'core-inline-loading',
  savingLayoutClass: 'core-inline-saving',
  failureLayoutClass: 'core-inline-failure',
  saveButtonLabel: 'Save Changes',
  cancelButtonLabel: 'Discard',
  saveButtonClass: 'core-save-button',
  cancelButtonClass: 'core-cancel-button',
  parameterFieldName: 'contentValue',
  stripFetchedContentTags: true,
  clickToEditMessage: 'Tap to modify...'
};

CoreInlineEditor.standardCallbacks = {
  onSave: (editor, response) => {},
  onCancel: (editor) => {},
  onFailure: (editor, error) => {},
  onComplete: (editor) => {}
};

class RichTextInlineEditor extends CoreInlineEditor {
  constructor(elementRef, contentSrcUrl, generalEditorSettings, richEditorSpecificSettings) {
    super(elementRef, contentSrcUrl, {}); // Pass empty config, will be populated by initializeConfiguration

    this._additionalSettings = null; // Mimics _extraDefaultOptions

    this.initializeConfiguration(generalEditorSettings); // This now fully sets `this.mainConfiguration`

    this.richEditorSpecificSettings = Object.assign({}, richEditorSpecificSettings);
    this.currentRichTextInstance = null;

    this.configureRichEditorSaveLogic();

    if (!this.mainConfiguration.formIdentifier && this.targetElement.id) {
      let potentialId = `${this.targetElement.id}-${this.mainConfiguration.formIdentifierSuffix}`;
      if (!document.getElementById(potentialId)) {
        this.mainConfiguration.formIdentifier = potentialId;
      }
    }

    if (this.mainConfiguration.externalController) {
      this.mainConfiguration.externalController = document.getElementById(this.mainConfiguration.externalController);
    }
    if (!this.mainConfiguration.externalController) {
      this.mainConfiguration.externalControllerOnly = false;
    }

    this.targetElement.title = this.mainConfiguration.clickToEditMessage;

    if (this.mainConfiguration.editWhenContentIsEmpty && this.getCurrentContent().length === 0) {
      this.activateEditMode();
    }
  }

  initializeConfiguration(providedSettings) {
    let mergedConfig = {};

    Object.assign(mergedConfig, CoreInlineEditor.standardOptions);
    Object.assign(mergedConfig, CoreInlineEditor.standardCallbacks);

    Object.assign(mergedConfig, RichTextInlineEditor.standardOptions);
    Object.assign(mergedConfig, RichTextInlineEditor.standardCallbacks);

    if (this._additionalSettings) {
      Object.assign(mergedConfig, this._additionalSettings);
    }

    Object.assign(mergedConfig, providedSettings || {});

    this.mainConfiguration = mergedConfig;

    // Re-bind actions as `mainConfiguration` has been fully updated
    this.submissionAction = this.processFormSubmission.bind(this);
    this.cancelAction = this.processFormCancellation.bind(this);
    this.requestFailureAction = this.handleDataRequestFailure.bind(this);
    this.completionAction = this.handleDataRequestCompletion.bind(this);
    this.finalizationAction = this.wrapUpEditing.bind(this);
  }

  constructControlElements() {
    if (!this.mainConfiguration.useRichEditorSave) {
      super.constructControlElements();
    }
  }

  constructEditorField() {
    const contentForField = (this.mainConfiguration.fetchContentUrl ? this.mainConfiguration.loadingMessage : this.getCurrentContent());
    const richEditorTextArea = document.createElement('textarea');
    richEditorTextArea.id = `${this.targetElement.id}-${this.mainConfiguration.textAreaIdSuffix}`;
    richEditorTextArea.rows = 3;
    richEditorTextArea.cols = 40;
    richEditorTextArea.name = this.mainConfiguration.parameterFieldName;
    richEditorTextArea.value = contentForField;
    richEditorTextArea.className = this.mainConfiguration.editorFieldClass;

    this.componentRegistry.editorInput = richEditorTextArea;
    this.editingForm.appendChild(richEditorTextArea);

    if (this.mainConfiguration.fetchContentUrl) {
      // This call will be overridden by RichTextInlineEditor's own retrieveExternalContent
      // but it's important that this method is called here as in the original flow.
      this.retrieveExternalContent();
    }
  }

  activateEditMode(triggerEvent) {
    let elementDimensions = null;
    if (this.mainConfiguration.matchTargetSize) {
      elementDimensions = this.targetElement.getBoundingClientRect();
    }

    super.activateEditMode(triggerEvent);

    this.currentRichTextInstance = new tinymce.Editor(this.componentRegistry.editorInput.id, this.richEditorSpecificSettings);

    this.currentRichTextInstance.onInit.add((editorInstance) => {
      if (this.editingForm.classList.contains(this.mainConfiguration.loadingLayoutClass)) {
        editorInstance.setProgressState(1);
      }
    });
    this.currentRichTextInstance.customReferenceToParent = this;

    if (this.mainConfiguration.matchTargetSize && elementDimensions) {
      this.currentRichTextInstance.settings.height = elementDimensions.height;
      this.currentRichTextInstance.settings.width = elementDimensions.width;
    }

    this.currentRichTextInstance.render();
  }

  handleDataRequestFailure(responseObject) {
    super.handleDataRequestFailure(responseObject);
    this.currentRichTextInstance.setContent(this.targetElement.innerHTML);
  }

  processFormSubmission(event) {
    this.currentRichTextInstance.save();
    super.processFormSubmission(event);
  }

  removeEditorForm() {
    try {
      this.currentRichTextInstance.remove();
    } catch (e) { /* swallow error */ }
    super.removeEditorForm();
  }

  retrieveExternalContent() {
    this.editingForm.classList.add(this.mainConfiguration.loadingLayoutClass);
    this.componentRegistry.editorInput.disabled = true;

    const requestOpts = { method: 'get' };
    Object.assign(requestOpts, this.mainConfiguration.ajaxOptions);

    const queryParams = new URLSearchParams({ editorId: this.targetElement.id });
    const requestUrl = `${this.mainConfiguration.fetchContentUrl}?${queryParams.toString()}`;

    fetch(requestUrl, requestOpts)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        return response.text();
      })
      .then(contentResponse => {
        this.editingForm.classList.remove(this.mainConfiguration.loadingLayoutClass);
        let processedContent = contentResponse;
        if (this.mainConfiguration.stripFetchedContentTags) {
          processedContent = processedContent.replace(/<[^>]*>?/gm, '');
        }
        this.componentRegistry.editorInput.value = processedContent;
        this.currentRichTextInstance.setContent(processedContent);
        this.componentRegistry.editorInput.disabled = false;
        this.postFieldInitialization();
      })
      .catch(error => {
        console.error("Error loading external content for rich editor:", error);
        this.requestFailureAction(error);
      })
      .finally(() => {
        this.completionAction();
      });
  }

  postFieldInitialization() {
    document.getElementById(this.componentRegistry.editorInput.id).addEventListener('custom-tiny-init', (event) => {
      const editorInstance = event.detail;
      const postCreationAction = this.mainConfiguration.fieldSetupAction;
      if (postCreationAction === 'focus') {
        editorInstance.focus();
      } else if (postCreationAction === 'activate') {
        editorInstance.execCommand('SelectAll');
      }
    });
  }

  configureRichEditorSaveLogic() {
    if (this.mainConfiguration.useRichEditorSave) {
      if (this.richEditorSpecificSettings.theme === 'simple') {
        this.mainConfiguration.useRichEditorSave = false;
        return;
      }

      const checkButton = (buttons) => buttons && buttons.split(',').some(btn => btn.trim() === 'save');
      const hasSaveButton = checkButton(this.richEditorSpecificSettings.theme_advanced_buttons1) ||
        checkButton(this.richEditorSpecificSettings.theme_advanced_buttons2) ||
        checkButton(this.richEditorSpecificSettings.theme_advanced_buttons3);

      const hasSavePlugin = this.richEditorSpecificSettings.plugins &&
        this.richEditorSpecificSettings.plugins.split(',').some(plugin => plugin.trim() === 'save');

      if (!(hasSaveButton && hasSavePlugin)) {
        throw "RichTextInlineEditor's useRichEditorSave option requires 'save' button and 'save' plugin in TinyMCE configuration.";
      }

      if (this.mainConfiguration.onRichEditorSave) {
        this.richEditorSpecificSettings.save_onsavecallback = (ed) => {
          this.mainConfiguration.onRichEditorSave(ed);
        };
      }
      if (this.mainConfiguration.onRichEditorCancel) {
        this.richEditorSpecificSettings.save_oncancelcallback = (ed) => {
          this.mainConfiguration.onRichEditorCancel(ed);
        };
      }
    }
  }
}

Object.assign(RichTextInlineEditor, {
  standardOptions: Object.assign({}, CoreInlineEditor.standardOptions, {
    editorFieldClass: 'rich-text-input',
    fieldSetupAction: 'focus',
    formLayoutClass: 'rich-inline-form',
    formIdentifierSuffix: 'rich-text-editor',
    loadingLayoutClass: 'rich-inline-loading',
    savingLayoutClass: 'rich-inline-saving',
    textAreaIdSuffix: 'rich-text-area',
    useRichEditorSave: false,
    matchTargetSize: false,
    editWhenContentIsEmpty: false,
    loadingMessage: 'Loading content...'
  }),
  standardCallbacks: Object.assign({}, CoreInlineEditor.standardCallbacks, {
    onRichEditorSave: function(editorInstance) {
      editorInstance.customReferenceToParent.submissionAction();
    },
    onRichEditorCancel: function(editorInstance) {
      editorInstance.customReferenceToParent.cancelAction();
    }
  })
});