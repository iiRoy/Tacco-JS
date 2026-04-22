;(function(AppCore, DomUtil){
  const DATA_TAG_SOURCE_INFO = "dndPayload"; // Using data-* attribute name convention

  // Helper for drag start events
  function handleDragStartEvent(eventObject) {
    eventObject = eventObject || window.event;
    const transferPayload = eventObject.dataTransfer;
    const visualAsset = eventObject.target;
    // Use dataset for custom data attributes
    transferPayload.setData("text/plain", visualAsset.dataset[DATA_TAG_SOURCE_INFO]);
  }

  // Composes a draggable image element
  function composeDraggableImage(destinationElement, sourcePath, displayCaption, payloadInfo) {
    const visualAsset = document.createElement("img");
    visualAsset.src = sourcePath;
    visualAsset.setAttribute("draggable", "true");
    visualAsset.setAttribute("title", displayCaption);

    payloadInfo = payloadInfo || {};
    // Different logic for default values
    if (!payloadInfo.imageSource && (!payloadInfo.kind || payloadInfo.kind === "Node")) { // Renamed properties
      payloadInfo.imageSource = sourcePath;
    }
    payloadInfo.displayLabel = payloadInfo.displayLabel || displayCaption; // Renamed properties
    payloadInfo.captionText = displayCaption; // Renamed 'title' to 'captionText' in payload

    // Store payload directly in dataset
    visualAsset.dataset[DATA_TAG_SOURCE_INFO] = JSON.stringify(payloadInfo);
    visualAsset.addEventListener("dragstart", handleDragStartEvent); // Use addEventListener
    destinationElement.appendChild(visualAsset);
    return visualAsset;
  }
  AppCore.composeDraggableImage = composeDraggableImage; // Exported function

  // Factory for search components
  function createSearchComponent(elementConfig, contextObject) {
    const containerWrapper = document.createElement("div");
    containerWrapper.style.display = "inline-block";
    containerWrapper.style.verticalAlign = "middle";
    // Use template literal for innerHTML
    containerWrapper.innerHTML = `
      <div class="input-group input-group-sm" style="width: 150px;">
        <input type="text" class="form-control" placeholder="${elementConfig.inputHint || ''}">
        <span class="input-group-btn">
          <button class="btn btn-default" type="button"></button>
        </span>
      </div>`;

    const entryField = containerWrapper.querySelector("input");
    if (elementConfig.componentId) { // Renamed id
      entryField.id = elementConfig.componentId;
    }
    const actionButton = containerWrapper.querySelector(".btn"); // Use querySelector

    if (elementConfig.iconClassIdentifier) { // Renamed iconClass
      const visualIcon = document.createElement('div');
      visualIcon.classList.add(...elementConfig.iconClassIdentifier.split(' ')); // Use classList.add
      actionButton.appendChild(visualIcon);
    } else if (elementConfig.displayLabel) { // Renamed name
      actionButton.appendChild(document.createTextNode(" " + elementConfig.displayLabel));
    }

    elementConfig.entryField = entryField; // Storing reference
    if (elementConfig.searchOperation) { // Renamed search
      let currentSearchContext = null; // Encapsulate search state

      const resetSearchState = () => {
        currentSearchContext = null;
      };

      const executeSearchOperation = (isPreviousDirection) => {
        const currentValue = entryField.value;
        if (!currentValue) {
          resetSearchState();
          return;
        }
        if (!currentSearchContext || currentSearchContext.currentValue !== currentValue) {
          const searchOutcome = elementConfig.searchOperation(currentValue, elementConfig);
          if (!searchOutcome || !searchOutcome.length) {
            resetSearchState();
            return;
          }
          currentSearchContext = { currentValue: currentValue, searchOutcome: searchOutcome, resultIndex: undefined };
        }
        advanceSearchResult(isPreviousDirection);
      };

      const advanceSearchResult = (isPreviousDirection) => {
        if (!(elementConfig.selectionHandler instanceof Function) || !currentSearchContext || !currentSearchContext.searchOutcome || !currentSearchContext.searchOutcome.length) {
          return;
        }
        const searchOutcome = currentSearchContext.searchOutcome;
        if (searchOutcome.length === 1) {
          elementConfig.selectionHandler(searchOutcome[0], 0);
          return;
        }

        if (currentSearchContext.resultIndex === undefined) {
          currentSearchContext.resultIndex = 0;
        } else {
          currentSearchContext.resultIndex += isPreviousDirection ? -1 : 1;
          if (currentSearchContext.resultIndex < 0) {
            currentSearchContext.resultIndex += searchOutcome.length;
          }
          currentSearchContext.resultIndex %= searchOutcome.length;
        }

        if (elementConfig.selectionHandler(searchOutcome[currentSearchContext.resultIndex], currentSearchContext.resultIndex) === false) {
          currentSearchContext = null; // Reset if selection fails
          executeSearchOperation();
        }
      };

      entryField.addEventListener("keydown", (eventObject) => { // addEventListener
        if (eventObject.keyCode === 27) { // Escape
          resetSearchState();
          entryField.value = "";
          if (AppCore.stopEvent) AppCore.stopEvent(eventObject); // Assuming AppCore.stopEvent exists
          return;
        }
        if (eventObject.keyCode === 13) { // Enter
          executeSearchOperation(eventObject.shiftKey);
        }
      });
      actionButton.addEventListener("click", () => { // addEventListener
        executeSearchOperation();
      });
    }
    return containerWrapper;
  }

  // Factory for input field with button
  function createInputFieldWithButton(elementConfig, contextObject) {
    const containerWrapper = document.createElement("div");
    containerWrapper.style.display = "inline-block";
    containerWrapper.style.verticalAlign = "middle";
    containerWrapper.innerHTML = `
      <div class="input-group input-group-sm" style="width: 150px;">
        <input type="text" class="form-control">
        <span class="input-group-btn">
          <button class="btn btn-default" type="button"></button>
        </span>
      </div>`;
    const entryField = containerWrapper.querySelector("input");
    const actionButton = containerWrapper.querySelector("button");
    actionButton.textContent = elementConfig.displayLabel; // Renamed name
    elementConfig.entryField = entryField;
    if (elementConfig.triggerAction) { // Renamed action
      actionButton.addEventListener("click", (eventObject) => { // addEventListener
        elementConfig.triggerAction.call(contextObject || window.graph, eventObject, elementConfig);
      });
    }
    return containerWrapper;
  }

  // Factory for dropdown select
  function createDropdown(elementConfig, contextObject) {
    const selectionControl = document.createElement("select");
    selectionControl.classList.add("form-control");
    const dropdownOptions = elementConfig.choiceOptions; // Renamed options
    dropdownOptions.forEach((optionValue) => {
      const optionElement = document.createElement("option");
      optionElement.textContent = optionValue;
      optionElement.value = optionValue;
      selectionControl.appendChild(optionElement);
    });
    selectionControl.value = elementConfig.initialValue; // Renamed value
    if (elementConfig.triggerAction) { // Renamed action
      // Original had onValueChange, which is not a standard DOM event. Assuming it meant 'change'.
      selectionControl.addEventListener("change", (eventObject) => { // addEventListener, use 'change'
        elementConfig.triggerAction.call(contextObject || window.graph, eventObject, elementConfig);
      });
    }
    return selectionControl;
  }

  // Factory for generic buttons (radio, checkbox, simple button)
  function createGenericButton(elementConfig, contextObject) {
    let controlLabel;
    let actionButtonElement; // Can be input for radio/checkbox or just a generic div
    const controlKind = elementConfig.controlKind; // Renamed type

    if (!controlKind) { // Default button (div)
      controlLabel = document.createElement("div");
    } else { // Radio/Checkbox (label with input)
      controlLabel = document.createElement("label");
      actionButtonElement = document.createElement("input");
      elementConfig.entryField = actionButtonElement; // Store reference
      actionButtonElement.setAttribute('type', controlKind);
      controlLabel.appendChild(actionButtonElement);
      if (elementConfig.isSelected) { // Renamed selected
        actionButtonElement.setAttribute('checked', 'checked');
        if (controlKind === 'radio') {
          controlLabel.classList.add("active");
        }
      }
    }
    controlLabel.classList.add("btn", "btn-default", "btn-sm"); // Add multiple classes
    if (elementConfig.visualIconPath) { // Renamed icon
      const visualIcon = document.createElement('img');
      visualIcon.src = elementConfig.visualIconPath;
      controlLabel.appendChild(visualIcon);
    } else if (elementConfig.iconClassIdentifier) { // Renamed iconClass
      const visualIcon = document.createElement('div');
      visualIcon.classList.add(...elementConfig.iconClassIdentifier.split(' '));
      controlLabel.appendChild(visualIcon);
    } else if (elementConfig.displayLabel) { // Renamed name
      controlLabel.appendChild(document.createTextNode(" " + elementConfig.displayLabel));
    }
    if (elementConfig.displayLabel) {
      controlLabel.setAttribute("title", elementConfig.displayLabel);
    }
    if (elementConfig.triggerAction) { // Renamed action
      controlLabel.addEventListener("click", (eventObject) => { // addEventListener
        elementConfig.triggerAction.call(contextObject || window.graph, eventObject, elementConfig);
      });
    }
    return controlLabel;
  }

  // Dispatcher for control element generation
  const controlElementGenerators = {
    "search": createSearchComponent,
    "input": createInputFieldWithButton,
    "select": createDropdown,
    "default": createGenericButton // Fallback for undefined type
  };

  // Generates a single control element based on configuration
  function generateControlElement(elementConfig, contextObject) {
    const generator = controlElementGenerators[elementConfig.controlKind || "default"];
    return generator(elementConfig, contextObject);
  }

  // Forms a group of controls (buttons)
  function formControlGroup(groupConfig, controlContainer, contextObject, isVerticalLayout, isTogglableMode){
    const groupElement = document.createElement("div");
    groupElement.classList.add(isVerticalLayout ? "btn-group-vertical" : "btn-group"); // Use classList.add
    if (isTogglableMode !== false) {
      groupElement.setAttribute("data-toggle", "buttons");
    }
    groupConfig.forEach((individualControlConfig) => { // Use forEach
      if (!individualControlConfig.controlKind && isTogglableMode !== false) {
        individualControlConfig.controlKind = 'radio';
      }
      groupElement.appendChild(generateControlElement(individualControlConfig, contextObject));
    });
    controlContainer.appendChild(groupElement);
  }
  AppCore.formControlGroup = formControlGroup; // Exported

  // Assembles a collection of controls
  function assembleControls(controlDefinitions, controlContainer, contextObject, isVerticalLayout, isTogglableMode) {
    // Iterate over object keys and values
    Object.keys(controlDefinitions).forEach((key) => {
      const currentDefinition = controlDefinitions[key];
      if (Array.isArray(currentDefinition)) { // Use native Array.isArray
        formControlGroup(currentDefinition, controlContainer, contextObject, isVerticalLayout, isTogglableMode);
      } else {
        controlContainer.appendChild(generateControlElement(currentDefinition, contextObject));
      }
    });
  }

  // Constructs the application panel (toolbar)
  function constructApplicationPanel(targetCanvas, controlContainer, additionalControls){
    // Helper to retrieve graph instance
    const retrieveCanvasInstance = () => {
      if(targetCanvas && targetCanvas instanceof AppCore.Graph){ // Assuming AppCore.Graph exists
        return targetCanvas;
      }
      return targetCanvas(); // If it's a function
    };

    // Helper to adjust graph interaction
    const adjustInteractionBehavior = (eventObject, elementConfig, interactionAttributes) => {
      retrieveCanvasInstance().interactionMode = elementConfig.value;
      retrieveCanvasInstance().interactionProperties = interactionAttributes || elementConfig;
    };

    let baseControlSet = {
      interactionModes: [
        {
          displayLabel: 'Default Mode', // Renamed name
          value: AppCore.Consts.INTERACTION_MODE_DEFAULT,
          isSelected: true, // Renamed selected
          iconClassIdentifier: 'icon toolbar-default', // Renamed iconClass
          triggerAction: adjustInteractionBehavior // Renamed action
        },
        {
          displayLabel: 'Selection Mode',
          value: AppCore.Consts.INTERACTION_MODE_SELECTION,
          iconClassIdentifier: 'icon toolbar-rectangle_selection',
          triggerAction: adjustInteractionBehavior
        },
        {
          displayLabel: 'View Mode',
          value: AppCore.Consts.INTERACTION_MODE_VIEW,
          iconClassIdentifier: 'icon toolbar-pan',
          triggerAction: adjustInteractionBehavior
        }
      ],
      canvasZoom: [ // Renamed zoom
        {
          displayLabel: 'Zoom In', iconClassIdentifier: 'icon toolbar-zoomin', triggerAction: function () {
          retrieveCanvasInstance().zoomIn()
        }
        },
        {
          displayLabel: 'Zoom Out', iconClassIdentifier: 'icon toolbar-zoomout', triggerAction: function () {
          retrieveCanvasInstance().zoomOut()
        }
        },
        {
          displayLabel: 'Actual Size', iconClassIdentifier: 'icon toolbar-zoomreset', triggerAction: function () {
          retrieveCanvasInstance().scale = 1;
        }
        },
        {
          displayLabel: 'Fit View', iconClassIdentifier: 'icon toolbar-overview', triggerAction: function () {
          retrieveCanvasInstance().zoomToOverview()
        }
        }
      ],
      editTools: [ // Renamed editor
        {
          displayLabel: 'Create Link',
          value: AppCore.Consts.INTERACTION_MODE_CREATE_EDGE,
          iconClassIdentifier: 'icon toolbar-edge',
          triggerAction: adjustInteractionBehavior
        },
        {
          displayLabel: 'Create L-Link',
          value: AppCore.Consts.INTERACTION_MODE_CREATE_SIMPLE_EDGE,
          iconClassIdentifier: 'icon toolbar-edge_VH',
          triggerAction: adjustInteractionBehavior,
          edgeKind: AppCore.Consts.EDGE_TYPE_VERTICAL_HORIZONTAL // Renamed edgeType
        },
        {
          displayLabel: 'Create Polygon',
          value: AppCore.Consts.INTERACTION_MODE_CREATE_SHAPE,
          iconClassIdentifier: 'icon toolbar-polygon',
          triggerAction: adjustInteractionBehavior
        },
        {
          displayLabel: 'Create Line',
          value: AppCore.Consts.INTERACTION_MODE_CREATE_LINE,
          iconClassIdentifier: 'icon toolbar-line',
          triggerAction: adjustInteractionBehavior
        }
      ],
      itemSearch: { // Renamed search
        displayLabel: 'Locate', inputHint: 'Name', iconClassIdentifier: 'icon toolbar-search', controlKind: 'search', componentId: 'locator_input', // Renamed properties
        searchOperation: function (searchName, elementConfig) { // Renamed search
          const searchOutcome = [];
          const namePattern = new RegExp(searchName, 'i');
          retrieveCanvasInstance().forEach(function (entity) {
            if (entity.name && namePattern.test(entity.name)) {
              searchOutcome.push(entity.id);
            }
          });
          return searchOutcome;
        }, selectionHandler: function (itemIdentifier) { // Renamed select
          let foundItem = retrieveCanvasInstance().graphModel.getById(itemIdentifier);
          if (!foundItem) {
            return false;
          }
          retrieveCanvasInstance().setSelection(foundItem);
          retrieveCanvasInstance().sendToTop(foundItem);
          const itemBounds = retrieveCanvasInstance().getUIBounds(foundItem);
          if (itemBounds) {
            retrieveCanvasInstance().centerTo(itemBounds.cx, itemBounds.cy, Math.max(2, retrieveCanvasInstance().scale), true);
          }
        }
      },
      dataExport: { // Renamed export
        displayLabel: 'Export Image', iconClassIdentifier: 'icon toolbar-print', triggerAction: function(){
          if (AppCore.displayExportPanel) AppCore.displayExportPanel(retrieveCanvasInstance()); // Assuming AppCore.showExportPanel
        }
      }
    };
    if(additionalControls){
      Object.keys(additionalControls).forEach(key => { // Use Object.keys and forEach
        baseControlSet[key] = additionalControls[key];
      });
    }
    assembleControls(baseControlSet, controlContainer, this, false, false);
    return controlContainer;
  }
  AppCore.constructApplicationPanel = constructApplicationPanel;
})(Q, jQuery);