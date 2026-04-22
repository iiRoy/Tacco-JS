(function (root) {

  const defaultConfiguration = {
    legacyBootstrapSupport: false,
    filterInputClearLabel: 'Show Everything',
    filterInputPlaceholderText: 'Search here',
    moveChosenLabel: 'Shift selected',
    moveAllItemsLabel: 'Shift all',
    removeChosenLabel: 'Unshift selected',
    removeAllItemsLabel: 'Unshift all',
    autoShiftOnSelect: true,
    retainSelectionAfterMove: false,
    rightPanelTitle: false,
    leftPanelTitle: false,
    helperFieldNameSuffix: '_auxiliary',
    minimumOptionHeight: 100,
    displayFilterControls: true,
    leftFilterCriterion: '',
    rightFilterCriterion: '',
    statusMessageFormat: 'Showing {0} items',
    statusMessageFilteredFormat: '<span class="label label-warning">Filtered</span> {0} of {1} items',
    statusMessageEmpty: 'No items',
    filterByValuesAttribute: false
  };

  const isMobileOSBug = /android/i.test(navigator.userAgent.toLowerCase());

  function interpolateText(templateString, replacements) {
    return templateString.replace(/\{(\d+)\}/g, (segment, index) => {
      return typeof replacements[index] !== 'undefined' ? replacements[index] : segment;
    });
  }

  class OptionPairSelector {
    constructor(targetElement, customOptions) {
      this.originalElement = targetElement;
      this.settings = { ...defaultConfiguration, ...customOptions };
      this.trackedOptions = [];
      this.interfaceComponents = {};
      this.totalOptionCount = 0;

      if (isMobileOSBug) {
        this.settings.autoShiftOnSelect = true;
      }

      this.initializeData();
      this.constructVisuals();
      this.attachListeners();
      this.hideOriginal();
      this.renderInterface();
    }

    initializeData() {
      Array.from(this.originalElement.options).forEach((opt, idx) => {
        this.trackedOptions.push({
          identifier: idx,
          value: opt.value,
          text: opt.textContent,
          originalSelected: opt.selected,
          currentlySelectedInHelper: false,
          assignedToRightPanel: opt.selected,
          hiddenByLeftFilter: false,
          hiddenByRightFilter: false
        });
        opt.dataset.clonedIdentifier = idx;
        this.totalOptionCount++;
      });
    }

    constructVisuals() {
      const containerDiv = document.createElement('div');
      containerDiv.className = 'enhanced-list-selector-wrapper';
      this.originalElement.parentNode.insertBefore(containerDiv, this.originalElement);

      const leftBox = this.createPanel(true);
      const rightBox = this.createPanel(false);

      containerDiv.appendChild(leftBox.panelElement);
      containerDiv.appendChild(rightBox.panelElement);

      this.interfaceComponents = {
        mainContainer: containerDiv,
        leftPanel: leftBox.panelElement,
        rightPanel: rightBox.panelElement,
        leftFilterInput: leftBox.filterInput,
        rightFilterInput: rightBox.filterInput,
        leftFilterClearBtn: leftBox.filterClearBtn,
        rightFilterClearBtn: rightBox.filterClearBtn,
        leftPanelLabel: leftBox.labelElement,
        rightPanelLabel: rightBox.labelElement,
        leftInfoSpan: leftBox.infoSpan,
        rightInfoSpan: rightBox.infoSpan,
        leftAuxiliarySelect: leftBox.auxiliarySelect,
        rightAuxiliarySelect: rightBox.auxiliarySelect,
        shiftRightBtn: leftBox.moveBtn,
        shiftLeftBtn: rightBox.moveBtn,
        shiftAllRightBtn: leftBox.moveAllBtn,
        shiftAllLeftBtn: rightBox.moveAllBtn,
        parentForm: leftBox.filterInput.form
      };

      this.setLeftPanelTitle(this.settings.leftPanelTitle);
      this.setRightPanelTitle(this.settings.rightPanelTitle);
      this.setFilterPlaceholders(this.settings.filterInputPlaceholderText);
      this.setFilterClearLabels(this.settings.filterInputClearLabel);
      this.setMoveChosenLabel(this.settings.moveChosenLabel);
      this.setMoveAllItemsLabel(this.settings.moveAllItemsLabel);
      this.setRemoveChosenLabel(this.settings.removeChosenLabel);
      this.setRemoveAllItemsLabel(this.settings.removeAllItemsLabel);
      this.setMinimumOptionHeight(this.settings.minimumOptionHeight);
      this.setHelperFieldNameSuffix(this.settings.helperFieldNameSuffix);
      this.displayFilterVisibility(this.settings.displayFilterControls);
      this.applyBootstrapCompatibility(this.settings.legacyBootstrapSupport);
    }

    createPanel(isLeftPanel) {
      const panelDiv = document.createElement('div');
      panelDiv.className = isLeftPanel ? 'selector-panel-left' : 'selector-panel-right';

      const label = document.createElement('label');
      const infoContainer = document.createElement('span');
      infoContainer.className = 'panel-info-area';
      const infoText = document.createElement('span');
      infoText.className = 'panel-info-display';
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'panel-clear-filter-btn';
      infoContainer.appendChild(infoText);
      infoContainer.appendChild(clearBtn);

      const filterInput = document.createElement('input');
      filterInput.type = 'text';
      filterInput.className = 'panel-filter-input';

      const btnGroup = document.createElement('div');
      btnGroup.className = 'panel-action-buttons';

      const moveBtn = document.createElement('button');
      moveBtn.type = 'button';
      moveBtn.className = isLeftPanel ? 'shift-right-one' : 'shift-left-one';
      const moveIcon = document.createElement('i');
      moveBtn.appendChild(moveIcon);

      const moveAllBtn = document.createElement('button');
      moveAllBtn.type = 'button';
      moveAllBtn.className = isLeftPanel ? 'shift-all-right' : 'shift-all-left';
      const moveAllIcon1 = document.createElement('i');
      const moveAllIcon2 = document.createElement('i');
      moveAllBtn.appendChild(moveAllIcon1);
      moveAllBtn.appendChild(moveAllIcon2);

      const auxiliarySelect = document.createElement('select');
      auxiliarySelect.multiple = true;
      auxiliarySelect.name = this.originalElement.name + (isLeftPanel ? '_nonselected' : '_selected') + this.settings.helperFieldNameSuffix;
      auxiliarySelect.id = `aux-select-${isLeftPanel ? 'left' : 'right'}-${this.originalElement.name || Math.random().toString(36).substring(7)}`;

      label.setAttribute('for', auxiliarySelect.id);

      panelDiv.appendChild(label);
      panelDiv.appendChild(infoContainer);
      panelDiv.appendChild(filterInput);
      btnGroup.appendChild(moveBtn);
      btnGroup.appendChild(moveAllBtn);
      panelDiv.appendChild(btnGroup);
      panelDiv.appendChild(auxiliarySelect);

      return {
        panelElement: panelDiv,
        labelElement: label,
        infoSpan: infoText,
        filterClearBtn: clearBtn,
        filterInput: filterInput,
        moveBtn: moveBtn,
        moveAllBtn: moveAllBtn,
        auxiliarySelect: auxiliarySelect
      };
    }

    attachListeners() {
      if (this.interfaceComponents.parentForm) {
        this.interfaceComponents.parentForm.addEventListener('submit', (e) => {
          if (document.activeElement === this.interfaceComponents.leftFilterInput ||
              document.activeElement === this.interfaceComponents.rightFilterInput) {
            e.preventDefault();
            document.activeElement.blur();
          }
        });
      }

      this.originalElement.addEventListener('listselector.refresh', (e) => {
        this.refreshContent(e.detail && e.detail.clearSelections);
      });

      this.interfaceComponents.leftFilterClearBtn.addEventListener('click', () => {
        this.setLeftFilter('', true);
      });
      this.interfaceComponents.rightFilterClearBtn.addEventListener('click', () => {
        this.setRightFilter('', true);
      });

      this.interfaceComponents.shiftRightBtn.addEventListener('click', () => {
        this.transferSelectedToRight();
      });
      this.interfaceComponents.shiftAllRightBtn.addEventListener('click', () => {
        this.transferAllToRight();
      });
      this.interfaceComponents.shiftLeftBtn.addEventListener('click', () => {
        this.returnSelectedToLeft();
      });
      this.interfaceComponents.shiftAllLeftBtn.addEventListener('click', () => {
        this.returnAllToLeft();
      });

      this.interfaceComponents.leftFilterInput.addEventListener('input', () => {
        this.applyFiltersAndRender();
      });
      this.interfaceComponents.rightFilterInput.addEventListener('input', () => {
        this.applyFiltersAndRender();
      });

      // Remove existing listeners before adding new ones to prevent duplicates on settings changes
      this.interfaceComponents.leftAuxiliarySelect.removeEventListener('change', this._boundLeftSelectChangeHandler);
      this.interfaceComponents.rightAuxiliarySelect.removeEventListener('change', this._boundRightSelectChangeHandler);
      this.interfaceComponents.leftAuxiliarySelect.removeEventListener('change', this._boundLeftHelperChangeHandler);
      this.interfaceComponents.rightAuxiliarySelect.removeEventListener('change', this._boundRightHelperChangeHandler);

      this._boundLeftSelectChangeHandler = () => this.transferSelectedToRight();
      this._boundRightSelectChangeHandler = () => this.returnSelectedToLeft();
      this._boundLeftHelperChangeHandler = (e) => this.handleHelperSelectChange(e, 'left');
      this._boundRightHelperChangeHandler = (e) => this.handleHelperSelectChange(e, 'right');

      if (this.settings.autoShiftOnSelect) {
        this.interfaceComponents.leftAuxiliarySelect.addEventListener('change', this._boundLeftSelectChangeHandler);
        this.interfaceComponents.rightAuxiliarySelect.addEventListener('change', this._boundRightSelectChangeHandler);
      }

      this.interfaceComponents.leftAuxiliarySelect.addEventListener('change', this._boundLeftHelperChangeHandler);
      this.interfaceComponents.rightAuxiliarySelect.addEventListener('change', this._boundRightHelperChangeHandler);
    }

    handleHelperSelectChange(event, panelSide) {
        const selectElement = event.target;
        Array.from(selectElement.options).forEach(option => {
            const currentOptionData = this.trackedOptions.find(opt => opt.identifier === parseInt(option.dataset.optionIdentifier));
            if (currentOptionData) {
                currentOptionData.currentlySelectedInHelper = option.selected;
            }
        });
    }

    hideOriginal() {
      this.originalElement.style.display = 'none';
    }

    renderInterface() {
      this.applyFilters();
      this.clearHelperSelects();

      let leftCount = 0;
      let rightCount = 0;
      let visibleLeftCount = 0;
      let visibleRightCount = 0;

      const rightOptions = [];
      const leftOptions = [];

      this.trackedOptions.forEach(optionData => {
        if (optionData.assignedToRightPanel) {
          rightCount++;
          if (!optionData.hiddenByRightFilter) {
            rightOptions.push(optionData);
            visibleRightCount++;
          }
        } else {
          leftCount++;
          if (!optionData.hiddenByLeftFilter) {
            leftOptions.push(optionData);
            visibleLeftCount++;
          }
        }
      });

      leftOptions.sort((a, b) => a.identifier - b.identifier);
      rightOptions.sort((a, b) => a.identifier - b.identifier);

      leftOptions.forEach(optionData => {
        this.interfaceComponents.leftAuxiliarySelect.appendChild(this.createOptionElement(optionData));
      });
      rightOptions.forEach(optionData => {
        this.interfaceComponents.rightAuxiliarySelect.appendChild(this.createOptionElement(optionData));
      });

      this.updateInfoDisplays(leftCount, visibleLeftCount, rightCount, visibleRightCount);
      this.dispatchCustomChangeEvent();
    }

    createOptionElement(optionData) {
      const optElement = document.createElement('option');
      optElement.value = optionData.value;
      optElement.textContent = optionData.text;
      optElement.selected = optionData.currentlySelectedInHelper;
      optElement.dataset.optionIdentifier = optionData.identifier;
      return optElement;
    }

    clearHelperSelects() {
      this.interfaceComponents.leftAuxiliarySelect.innerHTML = '';
      this.interfaceComponents.rightAuxiliarySelect.innerHTML = '';
    }

    applyFilters() {
      if (!this.settings.displayFilterControls) {
        this.trackedOptions.forEach(opt => {
          opt.hiddenByLeftFilter = false;
          opt.hiddenByRightFilter = false;
        });
        return;
      }

      const leftFilterText = this.interfaceComponents.leftFilterInput.value.trim();
      const rightFilterText = this.interfaceComponents.rightFilterInput.value.trim();
      const filterByValue = this.settings.filterByValuesAttribute;

      this.trackedOptions.forEach(optionData => {
        // Left panel filter logic
        let matchLeft = true;
        if (leftFilterText) {
          const regexLeft = new RegExp(leftFilterText, 'gi');
          if (filterByValue) {
            matchLeft = regexLeft.test(optionData.text) || regexLeft.test(optionData.value);
          } else {
            matchLeft = regexLeft.test(optionData.text);
          }
        }
        optionData.hiddenByLeftFilter = !matchLeft;

        // Right panel filter logic
        let matchRight = true;
        if (rightFilterText) {
          const regexRight = new RegExp(rightFilterText, 'gi');
          if (filterByValue) {
            matchRight = regexRight.test(optionData.text) || regexRight.test(optionData.value);
          } else {
            matchRight = regexRight.test(optionData.text);
          }
        }
        optionData.hiddenByRightFilter = !matchRight;
      });
    }

    applyFiltersAndRender() {
      this.applyFilters();
      this.renderInterface();
      this.updatePanelFilteredStatus();
    }

    updateInfoDisplays(totalLeft, visibleLeft, totalRight, visibleRight) {
      this.updatePanelInfo(this.interfaceComponents.leftInfoSpan, totalLeft, visibleLeft);
      this.updatePanelInfo(this.interfaceComponents.rightInfoSpan, totalRight, visibleRight);
      this.updatePanelFilteredStatus();
    }

    updatePanelInfo(infoSpan, totalItems, visibleItems) {
      let content = '';
      if (totalItems === 0) {
        content = this.settings.statusMessageEmpty;
      } else if (visibleItems === totalItems) {
        content = interpolateText(this.settings.statusMessageFormat, [visibleItems, totalItems]);
      } else {
        content = interpolateText(this.settings.statusMessageFilteredFormat, [visibleItems, totalItems]);
      }
      infoSpan.innerHTML = content;
    }

    updatePanelFilteredStatus() {
      const leftFilterText = this.interfaceComponents.leftFilterInput.value.trim();
      const rightFilterText = this.interfaceComponents.rightFilterInput.value.trim();

      this.interfaceComponents.leftPanel.classList.toggle('filtered-active', !!leftFilterText);
      this.interfaceComponents.rightPanel.classList.toggle('filtered-active', !!rightFilterText);
    }

    dispatchCustomChangeEvent() {
      const event = new CustomEvent('change', { bubbles: true });
      this.originalElement.dispatchEvent(event);
    }

    prepareForMove(panelSide) {
      if (this.settings.retainSelectionAfterMove === 'all' && !this.settings.autoShiftOnSelect) {
        this.syncHelperSelections();
      } else if (this.settings.retainSelectionAfterMove === 'moved' && !this.settings.autoShiftOnSelect) {
        if (panelSide === 'left') {
          this.syncHelperSelections('left');
        } else if (panelSide === 'right') {
          this.syncHelperSelections('right');
        }
      }
    }

    syncHelperSelections(panelSide = 'both') {
      if (panelSide === 'left' || panelSide === 'both') {
        Array.from(this.interfaceComponents.leftAuxiliarySelect.options).forEach(opt => {
          const optionData = this.trackedOptions.find(item => item.identifier === parseInt(opt.dataset.optionIdentifier));
          if (optionData) {
            optionData.currentlySelectedInHelper = opt.selected;
          }
        });
      }
      if (panelSide === 'right' || panelSide === 'both') {
        Array.from(this.interfaceComponents.rightAuxiliarySelect.options).forEach(opt => {
          const optionData = this.trackedOptions.find(item => item.identifier === parseInt(opt.dataset.optionIdentifier));
          if (optionData) {
            optionData.currentlySelectedInHelper = opt.selected;
          }
        });
      }
    }

    transferSelectedToRight() {
      this.prepareForMove('left');
      this.trackedOptions.forEach(optionData => {
        if (!optionData.assignedToRightPanel && optionData.currentlySelectedInHelper && !optionData.hiddenByLeftFilter) {
          optionData.assignedToRightPanel = true;
          optionData.currentlySelectedInHelper = false;
        }
      });
      this.renderInterface();
    }

    returnSelectedToLeft() {
      this.prepareForMove('right');
      this.trackedOptions.forEach(optionData => {
        if (optionData.assignedToRightPanel && optionData.currentlySelectedInHelper && !optionData.hiddenByRightFilter) {
          optionData.assignedToRightPanel = false;
          optionData.currentlySelectedInHelper = false;
        }
      });
      this.renderInterface();
    }

    transferAllToRight() {
      this.prepareForMove('left');
      this.trackedOptions.forEach(optionData => {
        if (!optionData.assignedToRightPanel && !optionData.hiddenByLeftFilter) {
          optionData.assignedToRightPanel = true;
          optionData.currentlySelectedInHelper = false;
        }
      });
      this.renderInterface();
    }

    returnAllToLeft() {
      this.prepareForMove('right');
      this.trackedOptions.forEach(optionData => {
        if (optionData.assignedToRightPanel && !optionData.hiddenByRightFilter) {
          optionData.assignedToRightPanel = false;
          optionData.currentlySelectedInHelper = false;
        }
      });
      this.renderInterface();
    }

    refreshContent(shouldClearSelections = false) {
      if (shouldClearSelections) {
        this.trackedOptions.forEach(opt => {
          opt.currentlySelectedInHelper = false;
        });
      }
      this.renderInterface();
    }

    applyBootstrapCompatibility(value, shouldRender = false) {
      this.settings.legacyBootstrapSupport = value;
      const mainContainer = this.interfaceComponents.mainContainer;
      const leftPanel = this.interfaceComponents.leftPanel;
      const rightPanel = this.interfaceComponents.rightPanel;
      const clearBtns = [this.interfaceComponents.leftFilterClearBtn, this.interfaceComponents.rightFilterClearBtn];
      const inputsAndSelects = [this.interfaceComponents.leftFilterInput, this.interfaceComponents.rightFilterInput, this.interfaceComponents.leftAuxiliarySelect, this.interfaceComponents.rightAuxiliarySelect];
      const allBtns = [
        this.interfaceComponents.shiftRightBtn, this.interfaceComponents.shiftLeftBtn,
        this.interfaceComponents.shiftAllRightBtn, this.interfaceComponents.shiftAllLeftBtn
      ];

      const moveRightIcons = [this.interfaceComponents.shiftRightBtn.querySelector('i'), this.interfaceComponents.shiftAllRightBtn.querySelectorAll('i')[0], this.interfaceComponents.shiftAllRightBtn.querySelectorAll('i')[1]];
      const moveLeftIcons = [this.interfaceComponents.shiftLeftBtn.querySelector('i'), this.interfaceComponents.shiftAllLeftBtn.querySelectorAll('i')[0], this.interfaceComponents.shiftAllLeftBtn.querySelectorAll('i')[1]];

      if (value) {
        mainContainer.classList.remove('row');
        mainContainer.classList.add('row-fluid', 'bs2compatible-clone');
        leftPanel.classList.remove('col-md-6');
        leftPanel.classList.add('span6');
        rightPanel.classList.remove('col-md-6');
        rightPanel.classList.add('span6');

        clearBtns.forEach(btn => {
          btn.classList.remove('btn-default', 'btn-xs');
          btn.classList.add('btn-mini');
        });
        inputsAndSelects.forEach(el => el.classList.remove('form-control'));
        allBtns.forEach(btn => btn.classList.remove('btn-default'));

        moveRightIcons.forEach(icon => {
          icon.classList.remove('glyphicon', 'glyphicon-arrow-right');
          icon.classList.add('icon-arrow-right');
        });
        moveLeftIcons.forEach(icon => {
          icon.classList.remove('glyphicon', 'glyphicon-arrow-left');
          icon.classList.add('icon-arrow-left');
        });

      } else {
        mainContainer.classList.remove('row-fluid', 'bs2compatible-clone');
        mainContainer.classList.add('row');
        leftPanel.classList.remove('span6');
        leftPanel.classList.add('col-md-6');
        rightPanel.classList.remove('span6');
        rightPanel.classList.add('col-md-6');

        clearBtns.forEach(btn => {
          btn.classList.remove('btn-mini');
          btn.classList.add('btn-default', 'btn-xs');
        });
        inputsAndSelects.forEach(el => el.classList.add('form-control'));
        allBtns.forEach(btn => btn.classList.add('btn-default'));

        moveRightIcons.forEach(icon => {
          icon.classList.remove('icon-arrow-right');
          icon.classList.add('glyphicon', 'glyphicon-arrow-right');
        });
        moveLeftIcons.forEach(icon => {
          icon.classList.remove('icon-arrow-left');
          icon.classList.add('glyphicon', 'glyphicon-arrow-left');
        });
      }
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setFilterClearLabels(value, shouldRender = false) {
      this.settings.filterInputClearLabel = value;
      this.interfaceComponents.leftFilterClearBtn.textContent = value;
      this.interfaceComponents.rightFilterClearBtn.textContent = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setFilterPlaceholders(value, shouldRender = false) {
      this.settings.filterInputPlaceholderText = value;
      this.interfaceComponents.leftFilterInput.placeholder = value;
      this.interfaceComponents.rightFilterInput.placeholder = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setMoveChosenLabel(value, shouldRender = false) {
      this.settings.moveChosenLabel = value;
      this.interfaceComponents.shiftRightBtn.title = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setMoveAllItemsLabel(value, shouldRender = false) {
      this.settings.moveAllItemsLabel = value;
      this.interfaceComponents.shiftAllRightBtn.title = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setRemoveChosenLabel(value, shouldRender = false) {
      this.settings.removeChosenLabel = value;
      this.interfaceComponents.shiftLeftBtn.title = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setRemoveAllItemsLabel(value, shouldRender = false) {
      this.settings.removeAllItemsLabel = value;
      this.interfaceComponents.shiftAllLeftBtn.title = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setAutoShiftOnSelect(value, shouldRender = false) {
      if (isMobileOSBug) {
        value = true;
      }
      this.settings.autoShiftOnSelect = value;
      this.attachListeners();
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setRetainSelectionAfterMove(value, shouldRender = false) {
      this.settings.retainSelectionAfterMove = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setRightPanelTitle(value, shouldRender = false) {
      this.settings.rightPanelTitle = value;
      this.interfaceComponents.rightPanelLabel.textContent = value === false ? '' : value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setLeftPanelTitle(value, shouldRender = false) {
      this.settings.leftPanelTitle = value;
      this.interfaceComponents.leftPanelLabel.textContent = value === false ? '' : value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setHelperFieldNameSuffix(value, shouldRender = false) {
      this.settings.helperFieldNameSuffix = value;
      this.interfaceComponents.leftAuxiliarySelect.name = this.originalElement.name + '_nonselected' + value;
      this.interfaceComponents.rightAuxiliarySelect.name = this.originalElement.name + '_selected' + value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setMinimumOptionHeight(value, shouldRender = false) {
      this.settings.minimumOptionHeight = value;
      this.interfaceComponents.leftAuxiliarySelect.style.minHeight = `${value}px`;
      this.interfaceComponents.rightAuxiliarySelect.style.minHeight = `${value}px`;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    displayFilterVisibility(value, shouldRender = false) {
      this.settings.displayFilterControls = value;
      const displayStyle = value ? '' : 'none';
      this.interfaceComponents.leftFilterInput.style.display = displayStyle;
      this.interfaceComponents.rightFilterInput.style.display = displayStyle;
      this.interfaceComponents.leftFilterClearBtn.style.display = displayStyle;
      this.interfaceComponents.rightFilterClearBtn.style.display = displayStyle;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setLeftFilter(value, shouldRender = false) {
      this.settings.leftFilterCriterion = value;
      this.interfaceComponents.leftFilterInput.value = value;
      if (shouldRender) this.applyFiltersAndRender();
      return this.originalElement;
    }

    setRightFilter(value, shouldRender = false) {
      this.settings.rightFilterCriterion = value;
      this.interfaceComponents.rightFilterInput.value = value;
      if (shouldRender) this.applyFiltersAndRender();
      return this.originalElement;
    }

    setStatusMessageFormat(value, shouldRender = false) {
      this.settings.statusMessageFormat = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setStatusMessageFilteredFormat(value, shouldRender = false) {
      this.settings.statusMessageFilteredFormat = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setStatusMessageEmpty(value, shouldRender = false) {
      this.settings.statusMessageEmpty = value;
      if (shouldRender) this.renderInterface();
      return this.originalElement;
    }

    setFilterByValuesAttribute(value, shouldRender = false) {
      this.settings.filterByValuesAttribute = value;
      if (shouldRender) this.applyFiltersAndRender();
      return this.originalElement;
    }
  }

  root.initializeOptionPairSelector = function (selector, options) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    elements.forEach(el => {
      if (!el.dataset.optionPairSelectorInitialized) {
        instances.push(new OptionPairSelector(el, options));
        el.dataset.optionPairSelectorInitialized = 'true';
      }
    });
    return instances.length === 1 ? instances[0] : instances;
  };

})(window);