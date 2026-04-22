(function(GraphCore, JQAlias) {
  // Core functionality for managing interactive UI elements, including drag-and-drop and toolbar controls.
  // This module enhances user interaction within a graph visualization application.

  // Key for storing drag-and-drop metadata on DOM elements.
  var DATA_TRANSFER_ATTRIBUTE_KEY = "dragPayloadData";

  /**
   * Handles the 'dragstart' event for a draggable element.
   * Serializes element-specific data and attaches it to the dataTransfer object.
   * @param {Event} dragEvent - The DOM drag event object.
   */
  function handleDragInitiation(dragEvent) {
    dragEvent = dragEvent || window.event; // Ensure event object exists
    if (!dragEvent || !dragEvent.target) {
      console.warn("Drag event or target missing.");
      return;
    }

    var eventTarget = dragEvent.target;
    var transferAgent = dragEvent.dataTransfer;

    // Retrieve the custom data stored in a data attribute.
    var payloadString = eventTarget.dataset[DATA_TRANSFER_ATTRIBUTE_KEY];
    if (payloadString) {
      transferAgent.setData("text/plain", payloadString); // Use 'text/plain' as a standard MIME type
    } else {
      console.warn("No drag payload found on element:", eventTarget);
    }
    // Optionally, set a drag image
    // transferAgent.setDragImage(eventTarget, 0, 0);
  }

  /**
   * Constructs and appends an image element configured for drag-and-drop operations.
   * @param {HTMLElement} containerElem - The parent DOM element to which the image will be appended.
   * @param {string} imagePath - The URL for the image source.
   * @param {string} displayTitle - The tooltip title for the image.
   * @param {object} customPayload - An object containing additional data to be transferred during drag.
   * @returns {HTMLImageElement} The newly created and configured image element.
   */
  function generateDraggableImage(containerElem, imagePath, displayTitle, customPayload) {
    if (!containerElem || !(containerElem instanceof HTMLElement)) {
      console.error("Invalid container element provided.");
      return null;
    }

    var newImageElement = new Image(); // Using Image constructor
    newImageElement.src = imagePath;
    newImageElement.setAttribute("draggable", "true"); // Explicitly make it draggable
    newImageElement.title = displayTitle; // Set tooltip via property

    // Prepare the drag payload data
    var processedPayload = customPayload || {};
    if (!processedPayload.imageRef && (!processedPayload.category || processedPayload.category === "DefaultNode")) {
      processedPayload.imageRef = imagePath; // Default image reference
    }
    if (!processedPayload.labelTxt) {
      processedPayload.labelTxt = displayTitle; // Default label text
    }
    processedPayload.displayTitle = displayTitle; // Ensure title is in payload

    try {
      // Store the stringified payload in a 'data-' attribute for easy retrieval
      newImageElement.dataset[DATA_TRANSFER_ATTRIBUTE_KEY] = JSON.stringify(processedPayload);
    } catch (error) {
      console.error("Failed to stringify drag payload:", error);
      return null;
    }

    newImageElement.addEventListener("dragstart", handleDragInitiation); // Attach event listener
    containerElem.appendChild(newImageElement); // Append to the specified parent
    return newImageElement;
  }
  GraphCore.generateDraggableImage = generateDraggableImage; // Expose to global API

  /**
   * Iterates through a collection of button definitions and renders them into a toolbar.
   * Supports individual buttons and nested button groups.
   * @param {object} controlDefinitions - An object mapping button identifiers to their configurations.
   * @param {HTMLElement} targetToolbarContainer - The DOM element where buttons will be added.
   * @param {object} executionContext - The 'this' context for button actions.
   * @param {boolean} isVerticalArrangement - True if button groups should be vertical.
   * @param {boolean} enableToggleBehavior - True if buttons within groups should have togglable states.
   */
  function layoutToolbarControls(controlDefinitions, targetToolbarContainer, executionContext, isVerticalArrangement, enableToggleBehavior) {
    if (!controlDefinitions || typeof controlDefinitions !== 'object') {
      console.warn("No valid control definitions provided for toolbar layout.");
      return;
    }

    for (var key in controlDefinitions) {
      if (!Object.prototype.hasOwnProperty.call(controlDefinitions, key)) {
        continue; // Skip inherited properties
      }
      var currentControlInfo = controlDefinitions[key];

      if (Array.isArray(currentControlInfo)) {
        // If it's an array, it represents a button group
        createButtonCluster(currentControlInfo, targetToolbarContainer, executionContext, isVerticalArrangement, enableToggleBehavior);
      } else {
        // Otherwise, it's a single button/control
        var singleButtonElement = constructInteractiveElement(currentControlInfo, executionContext);
        if (singleButtonElement) {
          targetToolbarContainer.appendChild(singleButtonElement);
        }
      }
    }
  }

  /**
   * Creates a container for a group of buttons, applying styling and optional toggling behavior.
   * @param {Array<object>} groupConfiguration - An array of button definitions for this group.
   * @param {HTMLElement} parentToolbar - The toolbar element to which this group will be appended.
   * @param {object} actionContext - The 'this' context for button actions.
   * @param {boolean} stackedLayout - If true, applies vertical group styling.
   * @param {boolean} canBeToggled - If true, enables data-toggle="buttons" functionality.
   * @returns {HTMLElement} The created button group div.
   */
  function createButtonCluster(groupConfiguration, parentToolbar, actionContext, stackedLayout, canBeToggled) {
    var buttonGroupDiv = document.createElement("div");
    buttonGroupDiv.className = stackedLayout ? "btn-group-vertical" : "btn-group";

    // Add data attribute for toggling behavior, unless explicitly disabled
    if (canBeToggled !== false) {
      buttonGroupDiv.dataset.toggle = "buttons";
    }

    // Populate the button group with individual controls
    for (var i = 0; i < groupConfiguration.length; i++) {
      var btnConfig = groupConfiguration[i];
      // Ensure radio button type for togglable buttons if not specified
      if (!btnConfig.type && canBeToggled !== false) {
        btnConfig.type = 'radio';
      }
      var buttonElement = constructInteractiveElement(btnConfig, actionContext);
      if (buttonElement) {
        buttonGroupDiv.appendChild(buttonElement);
      }
    }
    parentToolbar.appendChild(buttonGroupDiv);
    return buttonGroupDiv;
  }
  GraphCore.createButtonCluster = createButtonCluster; // Expose as well

  /**
   * Dynamically creates various types of interactive UI elements (buttons, inputs, selects) based on configuration.
   * @param {object} controlConfig - The configuration object for the control element.
   * @param {object} executionContext - The 'this' context for any associated actions.
   * @returns {HTMLElement} The generated DOM element for the control.
   */
  function constructInteractiveElement(controlConfig, executionContext) {
    const defaultScope = executionContext || window.graph; // Fallback to global graph object

    // Helper to create an icon element
    const appendIcon = (targetElement, config) => {
      if (config.iconPath) {
        let iconImg = new Image();
        iconImg.src = config.iconPath;
        targetElement.appendChild(iconImg);
      } else if (config.iconCSSClass) {
        let iconDiv = document.createElement('div');
        JQAlias(iconDiv).addClass(config.iconCSSClass); // Using jQuery for class manipulation
        targetElement.appendChild(iconDiv);
      }
    };

    switch (controlConfig.type) {
      case "search":
        var searchWrapper = document.createElement("div");
        searchWrapper.style.cssText = "display: inline-block; vertical-align: middle;"; // Inline styles for component layout
        searchWrapper.innerHTML = `
          <div class="input-group input-group-sm" style="width: 150px;">
            <input type="text" class="form-control" placeholder="${controlConfig.hintText || ''}">
            <span class="input-group-btn">
              <button class="btn btn-default" type="button"></button>
            </span>
          </div>`;
        var searchInput = searchWrapper.querySelector("input");
        if (controlConfig.elementId) {
          searchInput.id = controlConfig.elementId;
        }
        var searchButton = searchWrapper.querySelector(".btn");

        appendIcon(searchButton, { iconCSSClass: controlConfig.iconCSSClass });
        if (!controlConfig.iconCSSClass && controlConfig.labelName) {
          searchButton.appendChild(document.createTextNode(" " + controlConfig.labelName));
        }

        controlConfig.linkedInput = searchInput; // Store reference to input element

        if (controlConfig.searchAction) {
          let lastSearchValue = null;
          let currentSearchResult = null;
          let currentIndex = -1;

          const resetSearchState = () => {
            lastSearchValue = null;
            currentSearchResult = null;
            currentIndex = -1;
            // Optionally, clear input visually
            // if (searchInput) searchInput.value = "";
          };

          const performSearchOperation = (isReverse = false) => {
            const queryValue = searchInput.value.trim();
            if (!queryValue) {
              resetSearchState();
              return;
            }

            // Perform search only if query value has changed
            if (queryValue !== lastSearchValue || !currentSearchResult) {
              const searchResults = controlConfig.searchAction(queryValue, controlConfig);
              if (!searchResults || searchResults.length === 0) {
                resetSearchState();
                return;
              }
              lastSearchValue = queryValue;
              currentSearchResult = searchResults;
              currentIndex = 0; // Reset index for new search
            }

            if (!currentSearchResult || currentSearchResult.length === 0) {
              return; // No results found
            }

            // Navigate through results
            if (currentSearchResult.length === 1) {
              currentIndex = 0;
            } else {
              currentIndex += isReverse ? -1 : 1;
              if (currentIndex < 0) {
                currentIndex += currentSearchResult.length; // Wrap around for previous
              }
              currentIndex %= currentSearchResult.length; // Wrap around for next
            }

            // Execute selection callback
            if (controlConfig.selectCallback && controlConfig.selectCallback instanceof Function) {
              const selectedItem = currentSearchResult[currentIndex];
              // If selectCallback returns false, it signals to clear search (e.g., item not found anymore)
              if (controlConfig.selectCallback(selectedItem, currentIndex) === false) {
                resetSearchState();
                performSearchOperation(isReverse); // Re-run search in case of invalid item
              }
            }
          };

          // Attach event listeners
          searchInput.addEventListener("keydown", (keyboardEvent) => {
            if (keyboardEvent.key === "Escape") {
              resetSearchState();
              searchInput.value = "";
              GraphCore.stopEventPropagation(keyboardEvent); // Assuming GraphCore has this utility
              return;
            }
            if (keyboardEvent.key === "Enter") {
              performSearchOperation(keyboardEvent.shiftKey); // Shift+Enter for previous
              GraphCore.stopEventPropagation(keyboardEvent);
            }
          });

          searchButton.addEventListener("click", () => performSearchOperation(false)); // Default to next
        }
        return searchWrapper;

      case "input":
        var inputWrapper = document.createElement("div");
        inputWrapper.style.cssText = "display: inline-block; vertical-align: middle;";
        inputWrapper.innerHTML = `
          <div class="input-group input-group-sm" style="width: 150px;">
            <input type="text" class="form-control">
            <span class="input-group-btn">
              <button class="btn btn-default" type="button"></button>
            </span>
          </div>`;
        var textInput = inputWrapper.querySelector("input");
        var attachedButton = inputWrapper.querySelector("button");
        attachedButton.textContent = controlConfig.labelName || "Action"; // Use textContent for safety

        controlConfig.linkedInput = textInput; // Store reference

        if (controlConfig.actionHandler) {
          attachedButton.addEventListener("click", (clickEvent) => {
            controlConfig.actionHandler.call(defaultScope, clickEvent, controlConfig);
          });
        }
        return inputWrapper;

      case "select":
        var selectDropdown = document.createElement("select");
        selectDropdown.classList.add("form-control");
        var dropdownOptions = controlConfig.optionsList;
        if (Array.isArray(dropdownOptions)) {
          dropdownOptions.forEach((optionValue) => {
            var optElement = document.createElement("option");
            optElement.textContent = optionValue; // Use textContent for safety
            optElement.value = optionValue;
            selectDropdown.appendChild(optElement);
          });
        }
        selectDropdown.value = controlConfig.initialValue || ""; // Set initial selection

        if (controlConfig.changeAction) {
          selectDropdown.addEventListener("change", (changeEvent) => {
            controlConfig.changeAction.call(defaultScope, changeEvent, controlConfig);
          });
        }
        return selectDropdown;

      default: // Default button or label type
        var controlLabelElement;
        var associatedInput = null;

        if (!controlConfig.type) { // Simple label or div
          controlLabelElement = document.createElement("div");
        } else { // Radio, checkbox, etc.
          controlLabelElement = document.createElement("label");
          associatedInput = document.createElement("input");
          controlConfig.linkedInput = associatedInput; // Store reference to input
          associatedInput.setAttribute('type', controlConfig.type);
          controlLabelElement.appendChild(associatedInput);

          if (controlConfig.isSelected) {
            associatedInput.setAttribute('checked', 'checked');
            if (controlConfig.type === 'radio') {
              controlLabelElement.classList.add("active"); // Bootstrap active class for radio buttons
            }
          }
        }

        controlLabelElement.classList.add("btn", "btn-default", "btn-sm"); // Apply common button classes

        appendIcon(controlLabelElement, { iconPath: controlConfig.iconPath, iconCSSClass: controlConfig.iconCSSClass });

        if (controlConfig.labelName) {
          // Add text content only if no icon or if text is explicitly desired alongside icon
          if (!controlConfig.iconPath && !controlConfig.iconCSSClass || controlConfig.showLabelWithIcon) {
            controlLabelElement.appendChild(document.createTextNode(" " + controlConfig.labelName));
          }
          controlLabelElement.setAttribute("title", controlConfig.labelName); // Tooltip
        }

        if (controlConfig.actionHandler) {
          controlLabelElement.addEventListener("click", (clickEvent) => {
            controlConfig.actionHandler.call(defaultScope, clickEvent, controlConfig);
          });
        }
        return controlLabelElement;
    }
  }

  /**
   * Initializes and populates a toolbar with a predefined set of controls and optional custom additions.
   * @param {Function|object} graphProvider - A function that returns the graph instance, or the instance itself.
   * @param {HTMLElement} toolbarElement - The DOM element designated as the toolbar container.
   * @param {object} extraControls - An object containing additional button configurations to merge.
   * @returns {HTMLElement} The populated toolbar element.
   */
  function initializeApplicationToolbar(graphProvider, toolbarElement, extraControls) {

    // Internal helper to consistently retrieve the graph instance.
    function retrieveGraphContext() {
      if (graphProvider && typeof graphProvider.interactionMode !== 'undefined') { // Check for common graph property
        return graphProvider; // It's already the graph instance
      }
      if (typeof graphProvider === 'function') {
        return graphProvider(); // Call the function to get the instance
      }
      console.error("Invalid graph provider. Must be a Graph instance or a function returning one.");
      return null;
    }

    // Internal helper to configure the graph's interaction mode.
    function configureInteractionBehavior(eventData, controlInfo, specificProperties) {
      const activeGraph = retrieveGraphContext();
      if (activeGraph) {
        activeGraph.interactionMode = controlInfo.value;
        // Merge specific properties or use the controlInfo directly
        activeGraph.interactionProperties = specificProperties || controlInfo;
      }
    }

    // Default predefined toolbar buttons configuration.
    var standardControls = {
      interactionModes: [
        {
          labelName: 'Default Mode',
          value: GraphCore.Consts.INTERACTION_MODE_DEFAULT,
          isSelected: true,
          iconCSSClass: 'app-icon toolbar-default-pointer',
          actionHandler: configureInteractionBehavior
        },
        {
          labelName: 'Selection Box',
          value: GraphCore.Consts.INTERACTION_MODE_SELECTION,
          iconCSSClass: 'app-icon toolbar-rectangle-select',
          actionHandler: configureInteractionBehavior
        },
        {
          labelName: 'Pan View',
          value: GraphCore.Consts.INTERACTION_MODE_VIEW,
          iconCSSClass: 'app-icon toolbar-hand-pan',
          actionHandler: configureInteractionBehavior
        }
      ],
      viewControls: [
        {
          labelName: 'Zoom In', iconCSSClass: 'app-icon toolbar-magnify-plus', actionHandler: function () {
            const currentGraph = retrieveGraphContext();
            currentGraph && currentGraph.zoomIn();
          }
        },
        {
          labelName: 'Zoom Out', iconCSSClass: 'app-icon toolbar-magnify-minus', actionHandler: function () {
            const currentGraph = retrieveGraphContext();
            currentGraph && currentGraph.zoomOut();
          }
        },
        {
          labelName: 'Actual Size', iconCSSClass: 'app-icon toolbar-zoom-fit', actionHandler: function () {
            const currentGraph = retrieveGraphContext();
            if (currentGraph) currentGraph.scale = 1;
          }
        },
        {
          labelName: 'Fit to View', iconCSSClass: 'app-icon toolbar-overview-fit', actionHandler: function () {
            const currentGraph = retrieveGraphContext();
            currentGraph && currentGraph.zoomToOverview();
          }
        }
      ],
      creationTools: [
        {
          labelName: 'Create Link',
          value: GraphCore.Consts.INTERACTION_MODE_CREATE_EDGE,
          iconCSSClass: 'app-icon toolbar-edge-connect',
          actionHandler: configureInteractionBehavior
        },
        {
          labelName: 'Create L-Edge',
          value: GraphCore.Consts.INTERACTION_MODE_CREATE_SIMPLE_EDGE,
          iconCSSClass: 'app-icon toolbar-edge-vh',
          actionHandler: configureInteractionBehavior,
          edgeType: GraphCore.Consts.EDGE_TYPE_VERTICAL_HORIZONTAL // Custom property
        },
        {
          labelName: 'Draw Polygon',
          value: GraphCore.Consts.INTERACTION_MODE_CREATE_SHAPE,
          iconCSSClass: 'app-icon toolbar-polygon-draw',
          actionHandler: configureInteractionBehavior
        },
        {
          labelName: 'Draw Line',
          value: GraphCore.Consts.INTERACTION_MODE_CREATE_LINE,
          iconCSSClass: 'app-icon toolbar-line-draw',
          actionHandler: configureInteractionBehavior
        }
      ],
      globalSearch: {
        labelName: 'Find Element', hintText: 'Search by Name', iconCSSClass: 'app-icon toolbar-search-icon', type: 'search', elementId: 'main_search_input',
        searchAction: function (queryText, searchControlInfo) {
          const graphRef = retrieveGraphContext();
          if (!graphRef) return [];
          const matchedElementIds = [];
          const searchPattern = new RegExp(queryText, 'i'); // Case-insensitive regex

          graphRef.forEach(function (element) {
            if (element.name && searchPattern.test(element.name)) {
              matchedElementIds.push(element.id);
            }
          });
          return matchedElementIds;
        },
        selectCallback: function (elementIdentifier) {
          const graphRef = retrieveGraphContext();
          if (!graphRef) return false;

          const targetElement = graphRef.graphModel.getById(elementIdentifier);
          if (!targetElement) {
            console.warn("Search result element not found:", elementIdentifier);
            return false; // Signal to clear search info
          }

          graphRef.setSelection(targetElement); // Select the element
          graphRef.sendToTop(targetElement); // Bring to front

          const elementBounds = graphRef.getUIBounds(targetElement);
          if (elementBounds) {
            // Center view on element, ensuring a minimum zoom level
            graphRef.centerTo(elementBounds.cx, elementBounds.cy, Math.max(2, graphRef.scale), true);
          }
          return true;
        }
      },
      exportImage: {
        labelName: 'Export Image', iconCSSClass: 'app-icon toolbar-export-image', actionHandler: function () {
          const graphRef = retrieveGraphContext();
          graphRef && GraphCore.displayExportDialog(graphRef); // Assuming GraphCore has this utility
        }
      }
    };

    // Merge any custom controls provided by the user.
    if (extraControls && typeof extraControls === 'object') {
      Object.assign(standardControls, extraControls); // Merge properties
    }

    // Render all controls into the toolbar.
    layoutToolbarControls(standardControls, toolbarElement, this, false, false);
    return toolbarElement;
  }

  GraphCore.initializeApplicationToolbar = initializeApplicationToolbar; // Expose main toolbar creator

  // Placeholder for a utility function that might be part of GraphCore
  if (!GraphCore.stopEventPropagation) {
    GraphCore.stopEventPropagation = function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (e && e.preventDefault) e.preventDefault();
      e.cancelBubble = true;
      return false;
    };
  }

})(window.Q, window.jQuery);