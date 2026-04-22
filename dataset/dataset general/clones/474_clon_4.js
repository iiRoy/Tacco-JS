if (window.logger === undefined) {
  window.logger = {
    toggle: () => {},
    move: () => {},
    resize: () => {},
    clear: () => {},
    verb: () => {},
    data: () => {},
    warn: () => {},
    fail: () => {},
    measure: () => {}
  };
}

const utilityKit = {
  deepMerge: (target, source) => {
    const output = { ...target
    };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!(key in target))
            Object.assign(output, {
              [key]: source[key]
            });
          else
            output[key] = utilityKit.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, {
            [key]: source[key]
          });
        }
      });
    }
    return output;
  },
  elementValue: (element, content) => {
    if (element.value !== undefined) {
      if (content === undefined) return element.value;
      element.value = content;
    } else {
      if (content === undefined) return element.textContent || '';
      element.innerHTML = content;
    }
  },
  splitBySeparator: (text, separator) => {
    const parts = text.split(new RegExp(separator + '\\s*'));
    return parts.filter(part => part.length > 0);
  },
  emitEvent: (element, eventName, detail) => {
    const customEvent = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(customEvent);
    return customEvent;
  }
};

const controlKeys = {
  TOP: 38,
  BOTTOM: 40,
  ERASE: 46,
  JUMP: 9,
  ENTER: 13,
  MODIFIER: 16,
  ESCAPE: 27,
  PARTITION: 188,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  BACKSPACE: 8,
  SPACE_BAR: 32,
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39,
  AT_SIGN: 50,
  HASH_TAG: 34,
  CURRENCY: 52,
  SEMI_COLON: 59
};

const defaultSettings = {
  termKey: 'value',
  delayMs: 400,
  maximumItems: 10,
  inputClass: 'suggestion-input',
  resultFormatter: (record) => record.value,
  editableResultFormatter: (record) => `<a contenteditable="false" href="#" tabindex="-1" >@${record.value}</a>&nbsp;`,
  highlightMatcher: (value, query) => {
    if (!query) return value;
    const regex = new RegExp(`(${query})`, 'gi');
    return value.replace(regex, '<strong>$1</strong>');
  },
  matchFormatter: (record) => record.value,
  itemFormatter: (record) => record.value,
  hotkeyMode: false,
  multiSelect: false,
  multiSeparator: ',',
  minCharsForSearch: 1,
  supressReturnKey: false,
  startMessage: null,
  cacheEnabled: true,
  requestMethod: 'GET',
  sourceUrl: null,
  localData: null,
  displayWidth: null,
  displayOffsetLeft: null,
  loadingClass: 'loading-suggestions'
};

class DataStore {
  constructor(optionsRef) {
    this.entries = {};
    this.options = optionsRef;
    this.populate();
  }

  store(query, data) {
    if (!this.options.cacheEnabled) return;
    this.entries[query] = data;
  }

  retrieve(query) {
    if (!this.options.cacheEnabled) return null;
    return this.entries[query] || null;
  }

  clearAll() {
    this.entries = {};
  }

  populate() {
    if (this.options.localData && Array.isArray(this.options.localData)) {
      this.options.localData.forEach(item => {
        const key = this.options.matchFormatter(item).toLowerCase();
        if (!this.entries[key]) {
          this.entries[key] = {
            data: [item],
            value: this.options.resultFormatter(item),
            result: this.options.matchFormatter(item)
          };
        }
      });
    }
  }
}

class SelectorDisplay {
  constructor(inputElement, optionsRef, itemSelectionCallback, configRef) {
    this.input = inputElement;
    this.settings = optionsRef;
    this.onItemSelected = itemSelectionCallback;
    this.internalConfig = configRef;
    this.isVisible = false;
    this.currentSelectionIndex = -1;
    this.items = [];
    this.container = document.createElement('div');
    this.container.className = 'suggestion-results';
    this.container.style.position = 'absolute';
    this.container.style.display = 'none';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);

    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('mouseover', (e) => {
      const itemElement = e.target.closest('.suggestion-item');
      if (itemElement) {
        this.highlightItem(Array.from(this.container.children).indexOf(itemElement));
      }
    });

    this.container.addEventListener('mousedown', () => {
      this.internalConfig.mouseDownOnSelect = true;
    });

    this.container.addEventListener('mouseup', (e) => {
      this.internalConfig.mouseDownOnSelect = false;
      const itemElement = e.target.closest('.suggestion-item');
      if (itemElement) {
        this.onItemSelected();
        this.hide();
      }
    });
  }

  show() {
    if (!this.isVisible && (this.items.length > 0 || this.settings.startMessage)) {
      const inputRect = this.input.getBoundingClientRect();
      this.container.style.top = `${inputRect.bottom + window.scrollY}px`;
      this.container.style.left = `${inputRect.left + window.scrollX}px`;
      if (this.settings.displayWidth > 0) {
        this.container.style.width = `${this.settings.displayWidth}px`;
      } else {
        this.container.style.width = `${inputRect.width}px`;
      }
      if (this.settings.displayOffsetLeft !== null) {
        this.container.style.left = `${this.settings.displayOffsetLeft}px`;
      }

      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
    this.currentSelectionIndex = -1;
  }

  emptyList() {
    this.container.innerHTML = '';
    this.items = [];
    this.currentSelectionIndex = -1;
  }

  display(results, query) {
    this.emptyList();
    if (!results || results.length === 0) {
      if (this.settings.startMessage) {
        const msg = document.createElement('div');
        msg.className = 'suggestion-message';
        msg.textContent = this.settings.startMessage;
        this.container.appendChild(msg);
        this.show();
      } else {
        this.hide();
      }
      return;
    }

    this.items = results.slice(0, this.settings.maximumItems);
    this.items.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'suggestion-item';
      let formattedHtml = this.settings.itemFormatter(item.data[0]);
      if (query) {
        formattedHtml = this.settings.highlightMatcher(formattedHtml, query);
      }
      itemElement.innerHTML = formattedHtml;
      this.container.appendChild(itemElement);
    });

    if (this.items.length > 0) {
      this.highlightItem(0);
      this.show();
    } else {
      this.hide();
    }
  }

  highlightItem(index) {
    if (this.currentSelectionIndex !== -1 && this.container.children[this.currentSelectionIndex]) {
      this.container.children[this.currentSelectionIndex].classList.remove('selected');
    }
    if (this.container.children[index]) {
      this.container.children[index].classList.add('selected');
      this.currentSelectionIndex = index;
      this.scrollIntoView(this.container.children[index]);
    }
  }

  scrollIntoView(element) {
    if (element) {
      const containerRect = this.container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (elementRect.bottom > containerRect.bottom) {
        this.container.scrollTop += elementRect.bottom - containerRect.bottom;
      } else if (elementRect.top < containerRect.top) {
        this.container.scrollTop -= containerRect.top - elementRect.top;
      }
    }
  }

  moveSelection(direction) {
    if (!this.isVisible || this.items.length === 0) return;

    let newIndex = this.currentSelectionIndex + direction;
    if (newIndex < 0) newIndex = this.items.length - 1;
    if (newIndex >= this.items.length) newIndex = 0;

    this.highlightItem(newIndex);
  }

  prev() {
    this.moveSelection(-1);
  }

  next() {
    this.moveSelection(1);
  }

  pageUp() {
    this.moveSelection(-Math.floor(this.settings.maximumItems / 2));
  }

  pageDown() {
    this.moveSelection(Math.floor(this.settings.maximumItems / 2));
  }

  selected() {
    if (this.currentSelectionIndex !== -1 && this.items.length > this.currentSelectionIndex) {
      return this.items[this.currentSelectionIndex];
    }
    return null;
  }

  destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

class SuggestionEngine {
  constructor(element, initialOptions) {
    this.inputElement = element;
    this.config = utilityKit.deepMerge(defaultSettings, initialOptions);

    const isUrlSource = typeof initialOptions === 'string';
    this.config.sourceUrl = isUrlSource ? initialOptions : this.config.sourceUrl;
    this.config.localData = isUrlSource ? null : this.config.localData;
    this.config.delayMs = isUrlSource ? defaultSettings.delayMs : 10;
    this.config.maximumItems = (initialOptions && !initialOptions.scroll) ? 10 : 150;

    this.config.resultFormatter = this.config.resultFormatter || ((rec) => rec[this.config.termKey]);
    this.config.highlightMatcher = this.config.highlightMatcher || ((val) => val);
    this.config.matchFormatter = this.config.matchFormatter || ((rec) => rec[this.config.termKey]);
    this.config.itemFormatter = this.config.itemFormatter || ((rec) => rec[this.config.termKey]);

    this.searchTimer = null;
    this.lastKnownValue = '';
    this.hasInputFocus = 0;
    this.keySequence = [];
    this.hotkeyActive = this.config.hotkeyMode ? false : true;
    this.preventFormSubmission = false;
    this.cursorStartPos = 0;

    this.dataCache = new DataStore(this.config);
    this.uiSelector = new SelectorDisplay(this.inputElement, this.config, () => this.applySelection(), {
      mouseDownOnSelect: false
    });

    this.initializeInput();
    this.setupEventListeners();
  }

  initializeInput() {
    this.inputElement.setAttribute('autocomplete', 'off');
    this.inputElement.classList.add(this.config.inputClass);

    if (this.inputElement.value === undefined && this.config.displayWidth < 1) {
      const parent = this.inputElement.parentElement;
      if (parent) {
        const grandParent = parent.parentElement;
        if (grandParent) {
          this.config.displayWidth = grandParent.offsetWidth;
          this.config.displayOffsetLeft = grandParent.getBoundingClientRect().left + window.scrollX;
        }
      }
    }
  }

  setupEventListeners() {
    const keyEvent = navigator.userAgent.includes('Opera') ? 'keypress' : 'keydown';
    this.boundKeyHandler = this.processKeyInput.bind(this);
    this.inputElement.addEventListener(keyEvent, this.boundKeyHandler);

    this.boundFocusHandler = this.gainFocus.bind(this);
    this.inputElement.addEventListener('focus', this.boundFocusHandler);

    this.boundBlurHandler = this.loseFocus.bind(this);
    this.inputElement.addEventListener('blur', this.boundBlurHandler);

    this.boundClickHandler = this.handleInputClick.bind(this);
    this.inputElement.addEventListener('click', this.boundClickHandler);

    this.inputElement.addEventListener('itemSelected', () => {
      this.hasInputFocus = 0;
      this.hideResultsImmediately();
    });
    this.inputElement.addEventListener('searchTriggered', (e) => this.performSearch(e.detail));
    this.inputElement.addEventListener('clearCache', () => this.dataCache.clearAll());
    this.inputElement.addEventListener('updateSettings', (e) => {
      this.config = utilityKit.deepMerge(this.config, e.detail);
      if ("localData" in e.detail) this.dataCache.populate();
    });
    this.inputElement.addEventListener('deactivate', () => this.destroy());
    this.inputElement.addEventListener('noMatchFound', () => {
      window.logger.data('No match found event triggered.');
    });

    if (navigator.userAgent.includes('Opera') && this.inputElement.form) {
      this.boundFormSubmit = (e) => {
        if (this.preventFormSubmission) {
          e.preventDefault();
          this.preventFormSubmission = false;
        }
      };
      this.inputElement.form.addEventListener('submit', this.boundFormSubmit);
    }
  }

  processKeyInput(event) {
    this.hasInputFocus = 1;
    const currentKey = event.keyCode || event.which;
    window.logger.verb(`Key press: ${currentKey}`);

    this.keySequence.push(currentKey);
    if (this.keySequence.length > 3) this.keySequence.shift();

    if (this.config.hotkeyMode && !this.hotkeyActive) {
      const prevKey = this.keySequence[this.keySequence.length - 2];
      const prePrevKey = this.keySequence[this.keySequence.length - 3];
      if (currentKey === controlKeys.AT_SIGN && event.shiftKey && (prePrevKey === controlKeys.SPACE_BAR || prePrevKey === undefined)) {
        this.hotkeyActive = true;
        window.logger.data('Suggestion engine now active in Hotkey mode');
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.handleChange(true), this.config.delayMs);
      }
      return;
    }

    const keyActions = {
      [controlKeys.TOP]: () => this.uiSelector.isVisible ? this.uiSelector.prev() : this.handleChange(true),
      [controlKeys.BOTTOM]: () => this.uiSelector.isVisible ? this.uiSelector.next() : this.handleChange(true),
      [controlKeys.PAGE_UP]: () => this.uiSelector.isVisible ? this.uiSelector.pageUp() : this.handleChange(true),
      [controlKeys.PAGE_DOWN]: () => this.uiSelector.isVisible ? this.uiSelector.pageDown() : this.handleChange(true),
      [controlKeys.ENTER]: () => {
        if (this.applySelection()) {
          if (this.config.supressReturnKey) event.preventDefault();
          this.preventFormSubmission = true;
          this.hideResultsImmediately();
          if (this.config.hotkeyMode || this.config.multiSelect) return false;
        } else {
          window.logger.data('No suggestion found. Triggering noMatchFound event.');
          utilityKit.emitEvent(this.inputElement, 'noMatchFound', {});
          this.hideResultsImmediately();
          if (this.config.supressReturnKey) event.preventDefault();
        }
      },
      [controlKeys.JUMP]: () => {
        if (this.applySelection()) {
          this.preventFormSubmission = true;
          this.hideResultsImmediately();
          if (this.config.hotkeyMode || this.config.multiSelect) return false;
        } else {
          this.hideResultsImmediately();
        }
      },
      [controlKeys.RIGHT_ARROW]: () => {
        if (this.applySelection()) {
          this.preventFormSubmission = true;
          this.hideResultsImmediately();
          if (this.config.hotkeyMode || this.config.multiSelect) return false;
        } else {
          this.hideResultsImmediately();
        }
      },
      [controlKeys.SEMI_COLON]: () => {
        if (this.config.multiSelect && this.config.multiSeparator.trim() === ';' && this.applySelection()) {
          this.preventFormSubmission = true;
          this.hideResultsImmediately();
          return false;
        } else {
          this.hideResultsImmediately();
        }
      },
      [controlKeys.PARTITION]: () => {
        if (this.config.multiSelect && this.config.multiSeparator.trim() === ',' && this.applySelection()) {
          this.preventFormSubmission = true;
          this.hideResultsImmediately();
          return false;
        } else {
          this.hideResultsImmediately();
        }
      },
      [controlKeys.ESCAPE]: () => this.uiSelector.hide(),
      [controlKeys.ERASE]: () => {
        this.uiSelector.hide();
        return;
      }
    };

    if (keyActions[currentKey]) {
      event.preventDefault();
      keyActions[currentKey]();
    } else {
      if (this.hotkeyActive) {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.handleChange(), this.config.delayMs);
      }
    }
  }

  gainFocus() {
    window.logger.verb('Input element gained focus');
    this.hasInputFocus++;
    if (this.hotkeyActive && this.config.hotkeyMode) {
      this.handleChange(true);
    } else if (!this.config.hotkeyMode) {
      if (!this.hotkeyActive) this.hotkeyActive = true;
      this.handleChange(true);
    }
  }

  loseFocus() {
    this.hasInputFocus = 0;
    if (!this.uiSelector.internalConfig.mouseDownOnSelect) {
      this.hideResults();
    }
  }

  handleInputClick() {
    if (this.hasInputFocus++ > 1 && !this.uiSelector.isVisible) {
      this.handleChange(true);
    }
  }

  handleChange(skipPreviousValueCheck = false) {
    if (this.keySequence[this.keySequence.length - 1] === controlKeys.ERASE) {
      this.uiSelector.hide();
      return;
    }

    let currentInputContent = utilityKit.elementValue(this.inputElement);
    if (!skipPreviousValueCheck && currentInputContent === this.lastKnownValue) {
      return;
    }

    currentInputContent = this.extractSearchQuery(currentInputContent);
    this.lastKnownValue = currentInputContent;
    window.logger.verb(`Change detected, query: ${currentInputContent}`);

    if (currentInputContent.length >= this.config.minCharsForSearch) {
      this.inputElement.classList.add(this.config.loadingClass);
      if (!this.config.matchCase) currentInputContent = currentInputContent.toLowerCase();
      this.fetchData(currentInputContent, (data) => this.handleDataResponse(data, currentInputContent), () => this.hideResultsImmediately());
    } else {
      window.logger.verb('Query too short');
      this.stopLoadingIndicator();
      if (this.config.startMessage !== null) {
        this.uiSelector.emptyList();
        this.uiSelector.display({}, null);
        this.uiSelector.show();
      } else {
        this.uiSelector.hide();
      }
    }
  }

  extractSearchQuery(fullContent) {
    if (this.config.multiSelect) {
      const parts = utilityKit.splitBySeparator(fullContent, this.config.multiSeparator);
      return parts[parts.length - 1] || '';
    } else if (this.config.hotkeyMode) {
      const hotkeyIndex = fullContent.lastIndexOf('@');
      if (hotkeyIndex !== -1) {
        if (this.inputElement.value === undefined) {
          this.cursorStartPos = this.getContentEditableCursorPosition();
          return fullContent.substring(hotkeyIndex + 1, this.cursorStartPos);
        } else {
          const inputCursorPos = this.inputElement.selectionStart;
          this.cursorStartPos = inputCursorPos;
          return fullContent.substring(hotkeyIndex + 1, inputCursorPos);
        }
      }
    }
    return fullContent;
  }

  fetchData(query, successCallback, errorCallback) {
    const cached = this.dataCache.retrieve(query);
    if (cached) {
      successCallback(cached);
      return;
    }

    if (this.config.localData) {
      const filtered = this.config.localData.filter(item => {
        const matchValue = this.config.matchFormatter(item);
        return this.config.matchCase ? matchValue.includes(query) : matchValue.toLowerCase().includes(query.toLowerCase());
      }).map(item => ({
        data: [item],
        value: this.config.resultFormatter(item),
        result: this.config.matchFormatter(item)
      }));
      this.dataCache.store(query, filtered);
      successCallback(filtered);
    } else if (this.config.sourceUrl) {
      const params = new URLSearchParams({
        q: query
      });
      fetch(`${this.config.sourceUrl}?${params.toString()}`, {
          method: this.config.requestMethod
        })
        .then(response => {
          if (!response.ok) throw new Error('Network response not ok.');
          return response.json();
        })
        .then(data => {
          const formattedData = data.map(item => ({
            data: [item],
            value: this.config.resultFormatter(item),
            result: this.config.matchFormatter(item)
          }));
          this.dataCache.store(query, formattedData);
          successCallback(formattedData);
        })
        .catch(err => {
          window.logger.fail('Data fetch error:', err);
          errorCallback();
        })
        .finally(() => this.stopLoadingIndicator());
    } else {
      errorCallback();
      this.stopLoadingIndicator();
    }
  }

  handleDataResponse(response, query) {
    this.stopLoadingIndicator();
    if (this.hasInputFocus) {
      this.uiSelector.display(response, query);
    } else {
      this.hideResultsImmediately();
    }
  }

  stopLoadingIndicator() {
    this.inputElement.classList.remove(this.config.loadingClass);
  }

  hideResults() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!this.uiSelector.internalConfig.mouseDownOnSelect) {
        this.uiSelector.hide();
      }
    }, 150);
  }

  hideResultsImmediately() {
    clearTimeout(this.searchTimer);
    this.uiSelector.hide();
  }

  applySelection() {
    const selectedItem = this.uiSelector.selected();
    if (!selectedItem) return false;

    let newValue = selectedItem.result;
    this.lastKnownValue = newValue;

    if (this.config.multiSelect) {
      let currentContent = utilityKit.elementValue(this.inputElement);
      let words = utilityKit.splitBySeparator(currentContent, this.config.multiSeparator);
      const separatorLength = this.config.multiSeparator.length;

      const inputCursor = this.inputElement.selectionStart || currentContent.length;
      let wordIndex = 0;
      let progress = 0;
      for (let i = 0; i < words.length; i++) {
        progress += words[i].length;
        if (inputCursor <= progress) {
          wordIndex = i;
          break;
        }
        progress += separatorLength;
      }
      words[wordIndex] = newValue;
      newValue = words.join(this.config.multiSeparator);
      newValue += this.config.multiSeparator;

    } else if (this.config.hotkeyMode) {
      this.hotkeyActive = false;
      let currentContent = utilityKit.elementValue(this.inputElement);
      const hotkeyIndex = currentContent.lastIndexOf('@');
      if (hotkeyIndex !== -1) {
        currentContent = currentContent.substring(0, hotkeyIndex);
      } else {
        currentContent = '';
      }

      const formattedResult = this.inputElement.value === undefined ? this.config.editableResultFormatter(selectedItem.data[0]) : selectedItem.value;
      newValue = currentContent + formattedResult;

      if (this.inputElement.value === undefined) {
        newValue += '<span id="cursorMarker">—</span>';
      }
    }

    utilityKit.elementValue(this.inputElement, newValue);
    this.hideResultsImmediately();
    utilityKit.emitEvent(this.inputElement, 'itemSelected', [selectedItem.data, selectedItem.value]);

    if (this.config.hotkeyMode && this.inputElement.value === undefined) {
      this.restoreContentEditableCursor();
    }
    return true;
  }

  getContentEditableCursorPosition() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(this.inputElement);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  restoreContentEditableCursor() {
    setTimeout(() => {
      const marker = this.inputElement.querySelector('#cursorMarker');
      if (marker) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(marker);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('delete', false, null);
      }
    }, 10);
  }

  performSearch(callback) {
    const query = this.extractSearchQuery(utilityKit.elementValue(this.inputElement));
    this.fetchData(query, (results) => {
      const foundResult = results && results.length > 0 ? results[0] : null;
      if (typeof callback === "function") {
        callback(foundResult);
      } else {
        utilityKit.emitEvent(this.inputElement, 'itemSelected', foundResult ? [foundResult.data, foundResult.value] : null);
      }
    }, () => {
      if (typeof callback === "function") callback(null);
    });
  }

  destroy() {
    this.inputElement.removeEventListener(navigator.userAgent.includes('Opera') ? 'keypress' : 'keydown', this.boundKeyHandler);
    this.inputElement.removeEventListener('focus', this.boundFocusHandler);
    this.inputElement.removeEventListener('blur', this.boundBlurHandler);
    this.inputElement.removeEventListener('click', this.boundClickHandler);
    this.inputElement.removeEventListener('itemSelected', () => {});
    this.inputElement.removeEventListener('searchTriggered', () => {});
    this.inputElement.removeEventListener('clearCache', () => {});
    this.inputElement.removeEventListener('updateSettings', () => {});
    this.inputElement.removeEventListener('deactivate', () => {});
    this.inputElement.removeEventListener('noMatchFound', () => {});

    if (this.inputElement.form && this.boundFormSubmit) {
      this.inputElement.form.removeEventListener('submit', this.boundFormSubmit);
    }
    this.uiSelector.destroy();
    clearTimeout(this.searchTimer);
    this.inputElement.classList.remove(this.config.inputClass);
    this.inputElement.removeAttribute('autocomplete');
  }
}

function createSuggestionInput(targetElement, sourceDataOrUrl, options = {}) {
  const settings = utilityKit.deepMerge(options, {
    sourceUrl: typeof sourceDataOrUrl === 'string' ? sourceDataOrUrl : null,
    localData: typeof sourceDataOrUrl === 'string' ? null : sourceDataOrUrl
  });

  if (NodeList.prototype.isPrototypeOf(targetElement) || Array.isArray(targetElement)) {
    const instances = [];
    targetElement.forEach(el => instances.push(new SuggestionEngine(el, settings)));
    return {
      instances: instances,
      onResult: (handler) => instances.forEach(inst => inst.inputElement.addEventListener('itemSelected', (e) => handler.apply(inst.inputElement, e.detail))),
      initiateSearch: (handler) => instances.forEach(inst => utilityKit.emitEvent(inst.inputElement, 'searchTriggered', handler)),
      invalidateCache: () => instances.forEach(inst => utilityKit.emitEvent(inst.inputElement, 'clearCache')),
      adjustOptions: (newOpts) => instances.forEach(inst => utilityKit.emitEvent(inst.inputElement, 'updateSettings', newOpts)),
      removeWidget: () => instances.forEach(inst => utilityKit.emitEvent(inst.inputElement, 'deactivate')),
      onNoMatch: (handler) => instances.forEach(inst => inst.inputElement.addEventListener('noMatchFound', handler))
    };
  } else if (targetElement instanceof Element) {
    const instance = new SuggestionEngine(targetElement, settings);
    return {
      instance: instance,
      onResult: (handler) => instance.inputElement.addEventListener('itemSelected', (e) => handler.apply(instance.inputElement, e.detail)),
      initiateSearch: (handler) => utilityKit.emitEvent(instance.inputElement, 'searchTriggered', handler),
      invalidateCache: () => utilityKit.emitEvent(instance.inputElement, 'clearCache'),
      adjustOptions: (newOpts) => utilityKit.emitEvent(instance.inputElement, 'updateSettings', newOpts),
      removeWidget: () => utilityKit.emitEvent(instance.inputElement, 'deactivate'),
      onNoMatch: (handler) => instance.inputElement.addEventListener('noMatchFound', handler)
    };
  } else {
    console.error("Invalid target element for suggestion input.");
    return null;
  }
}

const customSuggester = {
  create: createSuggestionInput
};