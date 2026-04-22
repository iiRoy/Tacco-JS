function obtainCaretPosition(targetField) {
    let currentPosition = 0;
    if (document.selection) {
        targetField.focus();
        const textRange = document.selection.createRange();
        textRange.moveStart('character', -targetField.value.length);
        currentPosition = textRange.text.length;
    } else if (targetField.selectionStart || targetField.selectionStart === 0) {
        currentPosition = targetField.selectionStart;
    }
    return currentPosition;
}

function generatePredictionField(sourceInput) {
    const predictionInput = document.createElement('input');
    predictionInput.className = 'autocomplete-prediction-hint';
    predictionInput.type = 'text';
    predictionInput.autocomplete = 'off';
    predictionInput.spellcheck = false;
    predictionInput.disabled = true;

    const computedStyles = window.getComputedStyle(sourceInput);
    const relevantStyles = [
        'padding', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight',
        'wordSpacing', 'letterSpacing', 'textIndent', 'textRendering', 'textTransform', 'width'
    ];

    relevantStyles.forEach(prop => {
        predictionInput.style[prop] = computedStyles[prop];
    });
    predictionInput.style.color = '#888';
    predictionInput.style.position = 'absolute';
    predictionInput.style.backgroundColor = 'transparent';

    return predictionInput;
}

function startsWithText(mainString, prefixString) {
    return mainString.startsWith(prefixString);
}

class AutocompleteCoreState {
    constructor(config = {}) {
        this.currentQueryValue = '';
        this.currentSuggestions = [];
        this.currentSelectedIndex = -1;
        this.shouldShowSuggestions = false;
        this.completionTriggers = {
            allowRightArrow: true,
            allowTab: true
        };
        this.boundModelPath = null;
        this.uniqueIdentifierKey = null;

        this._fetchSuggestions = config.fetchSuggestions || (() => Promise.resolve([]));
        this._formatSuggestionForDisplay = config.formatSuggestion || ((s) => s ? s.toString() : '');
        this._extractCompletionValue = config.extractCompletionValue || ((s) => s);
        this._templateResolver = config.templateResolver || (() => null);

        Object.assign(this, config.initialState);

        this.onStateChangeCallback = null;
        this.suggestionContainerElement = null; // Reference to the DOM element for suggestions
    }

    updateQueryAndFetch(newQuery) {
        this.currentQueryValue = newQuery;
        this._fetchSuggestions(newQuery).then(suggestions => {
            this.setSuggestions(suggestions);
            this.shouldShowSuggestions = true;
            this.notifyChange();
        }).catch(error => {
            console.error("Failed to fetch suggestions:", error);
            this.setSuggestions([]);
            this.notifyChange();
        });
    }

    setSuggestions(suggestions) {
        this.currentSuggestions = suggestions;
        if (this.currentSuggestions.length === 0) {
            this.currentSelectedIndex = -1;
        } else if (this.currentSelectedIndex >= this.currentSuggestions.length) {
            this.currentSelectedIndex = this.currentSuggestions.length - 1;
        } else if (this.currentSelectedIndex === -1 && this.currentSuggestions.length > 0) {
            this.currentSelectedIndex = 0;
        }
    }

    adjustSelection(delta) {
        if (this.currentSuggestions.length === 0) {
            this.currentSelectedIndex = -1;
            return;
        }
        let newIndex = this.currentSelectedIndex + delta;
        if (newIndex < 0) {
            newIndex = this.currentSuggestions.length - 1;
        } else if (newIndex >= this.currentSuggestions.length) {
            newIndex = 0;
        }
        this.currentSelectedIndex = newIndex;
        this.notifyChange();
    }

    selectSpecificIndex(index) {
        if (this.currentSuggestions.length === 0 || index < 0 || index >= this.currentSuggestions.length) {
            this.currentSelectedIndex = -1;
        } else {
            this.currentSelectedIndex = index;
        }
        this.notifyChange();
    }

    attemptInputCompletion() {
        if (this.currentSelectedIndex > -1 && this.currentSuggestions.length > 0) {
            const selectedItem = this.currentSuggestions[this.currentSelectedIndex];
            this.currentQueryValue = this._formatSuggestionForDisplay(selectedItem);
            this.shouldShowSuggestions = false;
            this.notifyChange();
            return true;
        }
        return false;
    }

    getCompletionValue() {
        if (this.currentSelectedIndex > -1 && this.currentSuggestions.length > 0) {
            return this._extractCompletionValue(this.currentSuggestions[this.currentSelectedIndex]);
        }
        return this.currentQueryValue;
    }

    getHintSuggestionText(force = false) {
        if (this.currentSuggestions.length === 0 || this.currentSelectedIndex === -1) return '';
        const selectedItem = this.currentSuggestions[this.currentSelectedIndex];
        const formattedText = this._formatSuggestionForDisplay(selectedItem);

        if (force || startsWithText(formattedText, this.currentQueryValue)) {
            return formattedText;
        }
        return '';
    }

    notifyChange() {
        if (this.onStateChangeCallback) {
            this.onStateChangeCallback();
        }
    }
}

class InputFieldManager {
    constructor(inputElement, stateModel, completionNotifier) {
        this.primaryInput = inputElement;
        this.state = stateModel;
        this.notifyCompletion = completionNotifier;

        this.predictionHint = generatePredictionField(inputElement);
        this.primaryInput.parentNode.insertBefore(this.predictionHint, this.primaryInput);

        this.attachEventHandlers();
        this.syncInputToState();
    }

    attachEventHandlers() {
        this.primaryInput.addEventListener('keydown', (e) => this.handleKeyDownEvent(e));
        this.primaryInput.addEventListener('keyup', (e) => this.handleKeyUpEvent(e));
        this.primaryInput.addEventListener('click', (e) => e.stopPropagation());
        this.primaryInput.addEventListener('blur', (e) => this.handleBlurEvent(e));
        document.addEventListener('click', (e) => this.handleDocumentClickEvent(e));
        this.primaryInput.addEventListener('input', (e) => {
            if (this.state.currentQueryValue !== this.primaryInput.value) {
                this.state.updateQueryAndFetch(this.primaryInput.value);
            }
        });
    }

    handleKeyDownEvent(e) {
        this.predictionHint.value = '';
        let handled = true;

        switch (e.keyCode) {
            case 40: // Down arrow
                if (this.state.currentSuggestions.length > 0) e.preventDefault();
                this.state.adjustSelection(1);
                break;
            case 38: // Up arrow
                if (this.state.currentSuggestions.length > 0) e.preventDefault();
                this.state.adjustSelection(-1);
                break;
            case 13: // Enter
                e.preventDefault();
                if (this.state.attemptInputCompletion()) {
                    this.notifyCompletion('enterPress', this.state.getCompletionValue(), this.state.boundModelPath);
                }
                break;
            case 39: // Right arrow
                if (!this.state.completionTriggers.allowRightArrow) { handled = false; break; }
                if (obtainCaretPosition(this.primaryInput) < this.primaryInput.value.length) { handled = false; break; }
                e.preventDefault();
                this.state.getHintSuggestionText(true);
                if (this.state.attemptInputCompletion()) {
                    this.notifyCompletion('rightArrowPress', this.state.getCompletionValue(), this.state.boundModelPath);
                }
                break;
            case 9: // Tab
                if (!this.state.completionTriggers.allowTab) { handled = false; break; }
                if (this.state.currentSelectedIndex > -1) {
                    e.preventDefault();
                    if (this.state.attemptInputCompletion()) {
                        this.notifyCompletion('tabPress', this.state.getCompletionValue(), this.state.boundModelPath);
                    }
                } else {
                    this.state.shouldShowSuggestions = false;
                }
                break;
            default:
                handled = false;
        }
        if (handled) this.state.notifyChange();
    }

    handleKeyUpEvent(e) {
        const navigationKeys = [40, 38, 13, 39, 9, 27];
        if (navigationKeys.includes(e.keyCode)) return;

        // The input event listener handles general text changes and query updates.
        // This keyup is primarily for ensuring hint text is updated if a non-navigation key was pressed,
        // but the input event already triggered a state update.
        // So, we just ensure the UI reflects the state.
        this.state.notifyChange();
    }

    handleBlurEvent(e) {
        setTimeout(() => {
            this.state.shouldShowSuggestions = false;
            this.state.notifyChange();
        }, 25);
    }

    handleDocumentClickEvent(e) {
        if (!this.primaryInput.contains(e.target) && !this.predictionHint.contains(e.target) && this.state.suggestionContainerElement && !this.state.suggestionContainerElement.contains(e.target)) {
            this.state.shouldShowSuggestions = false;
            this.state.notifyChange();
        }
    }

    syncInputToState() {
        this.primaryInput.value = this.state.currentQueryValue;
        const hintText = this.state.getHintSuggestionText();
        this.predictionHint.value = hintText;
        this.predictionHint.style.display = this.state.shouldShowSuggestions && hintText ? 'block' : 'none';

        const inputRect = this.primaryInput.getBoundingClientRect();
        const inputParentRect = this.primaryInput.parentNode.getBoundingClientRect();
        this.predictionHint.style.top = `${inputRect.top - inputParentRect.top}px`;
        this.predictionHint.style.left = `${inputRect.left - inputParentRect.left}px`;
        this.predictionHint.style.width = `${inputRect.width}px`;
        this.predictionHint.style.height = `${inputRect.height}px`;
    }
}

class SuggestionListRenderer {
    constructor(containerElement, stateModel, selectionNotifier) {
        this.container = containerElement;
        this.state = stateModel;
        this.notifySelection = selectionNotifier;

        this.state.suggestionContainerElement = containerElement;

        this.container.style.display = 'none';
        this.container.classList.add('autocomplete-suggestions-list');
    }

    renderSuggestions() {
        this.container.innerHTML = '';

        if (!this.state.shouldShowSuggestions || this.state.currentSuggestions.length === 0) {
            this.container.style.display = 'none';
            return;
        }

        this.container.style.display = 'block';

        const fragment = document.createDocumentFragment();
        this.state.currentSuggestions.forEach((suggestion, index) => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-suggestion-index', index);
            listItem.classList.add('autocomplete-suggestion-item');

            if (index === this.state.currentSelectedIndex) {
                listItem.classList.add('selected');
            }

            listItem.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.notifySelection(index);
            });

            listItem.addEventListener('mouseover', () => {
                this.state.selectSpecificIndex(index);
            });

            const templateOutput = this.state._templateResolver(suggestion, this.state.boundModelPath);
            if (templateOutput) {
                if (typeof templateOutput === 'string') {
                    listItem.innerHTML = templateOutput;
                } else if (templateOutput instanceof HTMLElement) {
                    listItem.appendChild(templateOutput);
                }
            } else {
                const textSpan = document.createElement('span');
                textSpan.textContent = this.state._formatSuggestionForDisplay(suggestion);
                listItem.appendChild(textSpan);
            }
            fragment.appendChild(listItem);
        });
        this.container.appendChild(fragment);
    }
}

class AutocompleteSystemOrchestrator {
    constructor(inputElement, suggestionListElement, config = {}) {
        this.inputElement = inputElement;
        this.suggestionListElement = suggestionListElement;

        this.state = new AutocompleteCoreState(config);
        this.state.onStateChangeCallback = () => this.updateComponents();

        this.inputManager = new InputFieldManager(
            this.inputElement,
            this.state,
            (trigger, value, model) => this.dispatchCompletionEvent(trigger, value, model)
        );

        this.suggestionRenderer = new SuggestionListRenderer(
            this.suggestionListElement,
            this.state,
            (index) => this.handleSuggestionClick(index)
        );

        this.updateComponents();
    }

    updateComponents() {
        this.inputManager.syncInputToState();
        this.suggestionRenderer.renderSuggestions();
    }

    handleSuggestionClick(index) {
        this.state.selectSpecificIndex(index);
        if (this.state.attemptInputCompletion()) {
            this.dispatchCompletionEvent('clickSelection', this.state.getCompletionValue(), this.state.boundModelPath);
        }
    }

    dispatchCompletionEvent(trigger, value, modelPath) {
        const completionEvent = new CustomEvent('completionOccurred', {
            bubbles: true,
            detail: {
                value: value,
                triggeredBy: trigger,
                model: modelPath
            }
        });
        this.inputElement.dispatchEvent(completionEvent);
    }
}