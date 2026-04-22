class ContentModifier {
    #settings;
    #logger;
    #syntaxRules;
    #actionToolbar;
    #promptHandler;

    constructor(initialConfig = {}) {
        this.#settings = new ConfigurationManager(initialConfig);
        this.#logger = new ActivityLogger(this.#settings.retrieve().debugMode);
        this.#syntaxRules = new SyntaxRuleManager(this.#logger, this.#settings.retrieve().excludedSyntaxes);
        this.#actionToolbar = new ActionToolbar(this.#logger, this.#syntaxRules);
        this.#promptHandler = new PromptDecorator(this.#logger);

        this.#logger.record('ContentModifier initialized');
        this.#setupCoreFunctionality();
    }

    #setupCoreFunctionality() {
        if (this.#checkUiPresence('mainPanel')) {
            if (this.#checkUiPresence('headingDisplay')) {
                this.#applyStyle('#modification-heading-field', 'active');
            }

            if (this.#checkUiPresence('summaryInput')) {
                this.#promptHandler.attach('#modification-summary-input');
                this.#addEvent('#modification-form', 'submit', this.#handleSubmit.bind(this));
            }

            if (this.#checkUiPresence('collapsibleSections')) {
                this.#addEventAll('.collapsible-section .toggle-button', 'click', this.#handleSectionToggle.bind(this));
            }

            if (this.#checkUiPresence('previewAction')) {
                this.#addEvent('#modification-preview-button', 'click', this.#handlePreview.bind(this));
            }

            if (this.#checkUiPresence('actionToolbar')) {
                const contentArea = this.#getUiElement('#modification-content-area');
                if (contentArea && contentArea.dataset.syntaxVariant) {
                    this.#settings.update({ syntaxVariant: contentArea.dataset.syntaxVariant });
                }
                this.#syntaxRules.setActiveVariant(this.#settings.retrieve().syntaxVariant, () => {
                    this.#actionToolbar.refreshButtons();
                    if (this.#checkUiPresence('formatSelector')) {
                        this.#updateFormatSelector();
                    }
                    if (this.#checkUiPresence('assistancePanel')) {
                        this.#hideAssistancePanel();
                    }
                });
            }
        }
    }

    #handleSubmit(event) {
        event.preventDefault();
        this.#promptHandler.clearAll();
        this.#logger.record('Submitting form');
        const formElement = this.#getUiElement('#modification-form');
        if (formElement) {
            formElement.removeEventListener('submit', this.#handleSubmit.bind(this));
            formElement.submit();
        }
    }

    #handleSectionToggle(event) {
        event.preventDefault();
        const parentSection = event.target.closest('.collapsible-section');
        if (parentSection) {
            parentSection.classList.toggle('expanded');
            parentSection.classList.toggle('collapsed');
        }
    }

    #handlePreview(event) {
        event.preventDefault();
        const formElement = this.#getUiElement('#modification-form');
        if (!formElement) return;

        const originalAction = formElement.action;
        const originalTarget = formElement.target;

        formElement.action = event.target.href || '/review';
        formElement.target = '_blank';
        formElement.submit();

        formElement.action = originalAction;
        formElement.target = originalTarget;
    }

    #updateFormatSelector() {
        const selector = this.#getUiElement('#modification-format-selector select');
        if (selector) {
            const currentVariant = this.#syntaxRules.getActiveVariant();
            const options = selector.querySelectorAll('option');
            options.forEach(option => {
                option.selected = (option.value === currentVariant);
            });
            this.#addEvent(selector, 'change', this.#handleFormatChange.bind(this));
        }
    }

    #handleFormatChange(event) {
        this.#settings.update({ syntaxVariant: event.target.value });
        this.#syntaxRules.setActiveVariant(event.target.value, () => {
            this.#actionToolbar.refreshButtons();
        });
    }

    #hideAssistancePanel() {
        const panel = this.#getUiElement('#modification-assistance-panel');
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('jaws');
        }
    }

    #checkUiPresence(feature) {
        const elements = {
            mainPanel: '#modification-container',
            headingDisplay: '#modification-heading-field',
            summaryInput: 'input#modification-summary-input',
            collapsibleSections: '.collapsible-section',
            formatSelector: '#modification-format-selector select',
            actionToolbar: '#modification-action-bar',
            previewAction: '#modification-preview-button',
            assistancePanel: '#modification-assistance-panel',
        };

        const selector = elements[feature];
        if (!selector) return false;

        switch (feature) {
            case 'mainPanel':
                return !!this.#getUiElement(selector) && !!this.#getUiElement('#modification-content-area');
            case 'headingDisplay':
                return this.#settings.retrieve().isNewContent;
            case 'collapsibleSections':
                return !!this.#getUiElement('.collapsible-section.collapsed') || !!this.#getUiElement('.collapsible-section.expanded');
            case 'actionToolbar':
                return this.#settings.retrieve().toolbarEnabled && !!this.#getUiElement(selector);
            case 'summaryInput':
                return !!this.#getUiElement(selector);
            default:
                return !!this.#getUiElement(selector);
        }
    }

    #getUiElement(selector) {
        return document.querySelector(selector);
    }

    #getUiElements(selector) {
        return document.querySelectorAll(selector);
    }

    #addEvent(selector, eventType, handler) {
        const element = this.#getUiElement(selector);
        if (element) {
            element.addEventListener(eventType, handler);
        }
    }

    #addEventAll(selector, eventType, handler) {
        const elements = this.#getUiElements(selector);
        elements.forEach(element => {
            element.addEventListener(eventType, handler);
        });
    }

    #applyStyle(selector, className, add = true) {
        const element = this.#getUiElement(selector);
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }
}

class ConfigurationManager {
    #defaultSettings = {
        syntaxVariant: 'plainText',
        editMode: 'standard',
        isNewContent: false,
        toolbarEnabled: true,
        debugMode: false,
        excludedSyntaxes: []
    };
    #currentSettings = {};

    constructor(incomingSettings) {
        this.#currentSettings = { ...this.#defaultSettings, ...incomingSettings };
    }

    retrieve() {
        return { ...this.#currentSettings };
    }

    update(newSettings) {
        this.#currentSettings = { ...this.#currentSettings, ...newSettings };
    }
}

class ActivityLogger {
    #isEnabled = false;

    constructor(enabled) {
        this.#isEnabled = enabled;
    }

    record(message) {
        if (this.#isEnabled && typeof console !== 'undefined') {
            console.info(message);
        }
    }
}

class SyntaxRuleManager {
    static _pendingRules = {};
    static _baseGlobalRules = null;

    #activeVariant = '';
    #loadedVariants = new Set();
    #variantRules = {};
    #logger;
    #excludedList;

    constructor(logger, excludedList) {
        this.#logger = logger;
        this.#excludedList = excludedList;

        Object.keys(SyntaxRuleManager._pendingRules).forEach(name => {
            this.defineVariant(name, SyntaxRuleManager._pendingRules[name], true);
        });
        SyntaxRuleManager._pendingRules = {};
    }

    static registerGlobally(name, ruleObject) {
        if (typeof ruleObject === 'object' && ruleObject !== null) {
            SyntaxRuleManager._pendingRules[name] = ruleObject;
        } else {
            (new ActivityLogger(true)).record(`SyntaxRuleManager.registerGlobally: rules for ${name} are not an object`);
        }
    }
    
    static setBaseRules(baseObject) {
        if (typeof baseObject === 'object' && baseObject !== null) {
            SyntaxRuleManager._baseGlobalRules = baseObject;
        }
    }

    defineVariant(name, definitionObject, fromPending = false) {
        this.#activeVariant = name;
        this.#loadedVariants.add(name);
        let finalDefinition = definitionObject;

        if (SyntaxRuleManager._baseGlobalRules && !fromPending) {
            finalDefinition = { ...SyntaxRuleManager._baseGlobalRules, ...definitionObject };
        }

        this.#variantRules[name] = finalDefinition;
        this.#logger.record(`Defined syntax variant: ${name}`);
    }

    getActiveVariant() {
        return this.#activeVariant;
    }

    setActiveVariant(name, onCompleteCallback) {
        if (!this.isVariantLoaded(name)) {
            this.#activeVariant = null;
            this.loadVariant(name, (success) => {
                if (!success) {
                    this.#logger.record(`Failed to load syntax rules for ${name}. Defining empty.`);
                    this.defineVariant(name, {});
                }
                this.#activeVariant = name;
                if (typeof onCompleteCallback === 'function') {
                    onCompleteCallback();
                }
            });
        } else {
            this.#activeVariant = name;
            this.#logger.record(`Syntax variant ${name} already loaded.`);
            if (typeof onCompleteCallback === 'function') {
                onCompleteCallback();
            }
        }
    }

    getRuleFor(attribute, variantName = this.#activeVariant) {
        if (this.isVariantLoaded(variantName) &&
            this.#variantRules[variantName] &&
            typeof this.#variantRules[variantName][attribute] === 'object' &&
            this.#variantRules[variantName][attribute] !== null) {
            return this.#variantRules[variantName][attribute];
        }
        return null;
    }

    loadVariant(variantName, onComplete) {
        if (this.#excludedList.includes(variantName)) {
            this.#logger.record(`Syntax variant ${variantName} is blacklisted. Skipping load.`);
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
            return;
        }

        const scriptUri = `/assets/syntax-definitions/${variantName}.js`;
        this.#logger.record(`Attempting to load syntax definition from: ${scriptUri}`);

        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUri;
        scriptElement.async = true;

        scriptElement.onload = () => {
            this.#logger.record(`Successfully loaded syntax script: ${scriptUri}`);
            if (typeof onComplete === 'function') {
                onComplete(true);
            }
        };

        scriptElement.onerror = (e) => {
            this.#logger.record(`Error loading syntax script: ${scriptUri}. Error: ${e.message || 'Unknown'}`);
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
        };

        document.head.appendChild(scriptElement);
    }

    isVariantLoaded(variantName) {
        return this.#loadedVariants.has(variantName);
    }

    isVariantValid() {
        return this.#activeVariant !== null &&
               typeof this.#variantRules[this.#activeVariant] === 'object' &&
               this.#variantRules[this.#activeVariant] !== null;
    }
}

class ActionToolbar {
    #isActive = false;
    #logger;
    #syntaxRules;
    #contentEditor;

    constructor(logger, syntaxRules) {
        this.#logger = logger;
        this.#syntaxRules = syntaxRules;
        this.#contentEditor = document.querySelector('#modification-content-area');
    }

    activate() {
        this.#logger.record('Activating action toolbar');
        const actionButtons = document.querySelectorAll('#modification-action-bar .action-trigger');

        actionButtons.forEach(button => {
            const ruleDefinition = this.#syntaxRules.getRuleFor(button.id);
            if (ruleDefinition) {
                button.addEventListener('click', this.#handleButtonClick.bind(this));
                button.classList.remove('inactive');
            } else if (button.id !== 'action-help') {
                button.classList.add('inactive');
                button.removeEventListener('click', this.#handleButtonClick.bind(this));
            }
        });

        const toolbar = document.querySelector('#modification-action-bar');
        if (toolbar) toolbar.classList.add('active');
        this.#isActive = true;
    }

    deactivate() {
        const actionButtons = document.querySelectorAll('#modification-action-bar .action-trigger');
        actionButtons.forEach(button => {
            button.removeEventListener('click', this.#handleButtonClick.bind(this));
        });
        const toolbar = document.querySelector('#modification-action-bar');
        if (toolbar) toolbar.classList.remove('active');
        this.#isActive = false;
    }

    refreshButtons() {
        this.deactivate();
        this.activate();
    }

    #handleButtonClick(event) {
        event.preventDefault();
        const rule = this.#syntaxRules.getRuleFor(event.currentTarget.id);
        if (rule) {
            this.#executeAction(rule);
        }
    }

    #executeAction(ruleObject) {
        if (!this.#contentEditor) {
            this.#logger.record('Content editor element not found for action.');
            return;
        }

        const editorText = this.#contentEditor.value;
        const { start, end } = this.#getSelectionRange(this.#contentEditor);
        let selectedText = editorText.substring(start, end);
        let replacementText = selectedText;

        if (ruleObject.transformation && typeof ruleObject.transformation === 'function') {
            ruleObject.transformation(editorText, selectedText, this.#contentEditor);
            return;
        }

        let searchPattern = /([^\n]+)/gi;
        if (ruleObject.searchPattern && typeof ruleObject.searchPattern === 'object') {
            this.#logger.record('Using custom search pattern.');
            searchPattern = ruleObject.searchPattern;
        }
        this.#logger.record(`Replacement text is "${replacementText}"`);

        if (ruleObject.substitution && typeof ruleObject.substitution === 'string') {
            this.#logger.record(`Running substitution - using "${ruleObject.substitution}"`);
            replacementText = replacementText.replace(searchPattern, ruleObject.substitution);
            replacementText = replacementText.replace(/\$[\d]/g, '');
        }

        this.#replaceSelectionText(this.#contentEditor, replacementText, start, end);

        if (ruleObject.cursorOffset !== undefined) {
             const newCursorPos = start + ruleObject.cursorOffset;
             this.#setSelectionRange(this.#contentEditor, newCursorPos, newCursorPos);
        } else if (ruleObject.selectNewText) {
             this.#setSelectionRange(this.#contentEditor, start, start + replacementText.length);
        } else {
             this.#setSelectionRange(this.#contentEditor, start + replacementText.length, start + replacementText.length);
        }
    }

    #getSelectionRange(textarea) {
        return { start: textarea.selectionStart, end: textarea.selectionEnd };
    }

    #replaceSelectionText(textarea, newText, selectionStart, selectionEnd) {
        const val = textarea.value;
        textarea.value = val.substring(0, selectionStart) + newText + val.substring(selectionEnd, val.length);
    }

    #setSelectionRange(textarea, start, end) {
        textarea.focus();
        textarea.setSelectionRange(start, end);
    }
}

class PromptDecorator {
    #logger;
    #managedInputs = new Set();

    constructor(logger) {
        this.#logger = logger;
    }

    attach(selector) {
        const inputElement = document.querySelector(selector);
        if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
            this.#logger.record(`PromptDecorator: Element for selector ${selector} not found or not an input.`);
            return;
        }

        const placeholderText = inputElement.getAttribute('placeholder');
        if (!placeholderText) {
            this.#logger.record(`PromptDecorator: No placeholder attribute found for ${selector}.`);
            return;
        }

        inputElement.dataset.originalPlaceholder = placeholderText;
        inputElement.addEventListener('focus', this.#handleFocus.bind(this));
        inputElement.addEventListener('blur', this.#handleBlur.bind(this));

        if (!inputElement.value) {
            inputElement.classList.add('placeholder-active');
        }

        this.#managedInputs.add(inputElement);
        this.#logger.record(`Attached prompt decorator to ${selector}`);
    }

    #handleFocus(event) {
        const input = event.target;
        input.setAttribute('placeholder', '');
        input.classList.remove('placeholder-active');
    }

    #handleBlur(event) {
        const input = event.target;
        if (!input.value) {
            input.setAttribute('placeholder', input.dataset.originalPlaceholder);
            input.classList.add('placeholder-active');
        }
    }

    clearAll() {
        this.#managedInputs.forEach(input => {
            if (input.value === input.dataset.originalPlaceholder) {
                input.value = '';
            }
            input.removeAttribute('placeholder');
            input.classList.remove('placeholder-active');
            input.removeEventListener('focus', this.#handleFocus.bind(this));
            input.removeEventListener('blur', this.#handleBlur.bind(this));
        });
        this.#managedInputs.clear();
        this.#logger.record('Cleared all prompt decorators.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContentModifier();
});

window.ContentManagement = window.ContentManagement || {};
window.ContentManagement.registerSyntax = (variantName, ruleObject) => {
    SyntaxRuleManager.registerGlobally(variantName, ruleObject);
};
window.ContentManagement.BaseWikiRules = (baseObject) => {
    SyntaxRuleManager.setBaseRules(baseObject);
};