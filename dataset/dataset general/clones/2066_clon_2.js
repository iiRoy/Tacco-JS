;(function(GraphLib, jQuery){
/* Module: Drag and Drop Utilities for Visual Elements */
  var DRAG_IDENTIFIER_KEY = "drag_data_payload"; /* Key for storing drag information */

  function handleDragStart(eventData) {
    eventData = eventData || window.event; /* Standardize event object */
    var transferPayload = eventData.dataTransfer;
    var visualNode = eventData.target;
    transferPayload.setData("text", visualNode.getAttribute(DRAG_IDENTIFIER_KEY));
  }

  function generateDraggableImage(domContainer, assetPath, displayCaption, itemDetails) {
    var elementImage = document.createElement("img");
    elementImage.src = assetPath;
    elementImage.setAttribute("draggable", "true");
    elementImage.setAttribute("title", displayCaption);
    itemDetails = itemDetails || {};
    if (!itemDetails.image && (!itemDetails.type || itemDetails.type == "Node")) {
      itemDetails.image = assetPath;
    }
    itemDetails.label = itemDetails.label || displayCaption;
    itemDetails.title = displayCaption;
    elementImage.setAttribute(DRAG_IDENTIFIER_KEY, JSON.stringify(itemDetails));
    elementImage.ondragstart = handleDragStart;
    domContainer.appendChild(elementImage);
    return elementImage;
  }
  GraphLib.generateDraggableImage = generateDraggableImage;

  function assembleControls(actionDefinitions, toolContainer, executionContext, stackVertically, isToggleable) {
    for (var propName in actionDefinitions) {
      var controlConfig = actionDefinitions[propName];
      if (GraphLib.isArr(controlConfig)) { /* Check if it's an array for a button group */
        buildControlGroup(controlConfig, toolContainer, executionContext, stackVertically, isToggleable);
        continue;
      }
      toolContainer.appendChild(craftInteractiveButton(controlConfig, executionContext));
    }
  }
  function buildControlGroup(controlConfig, toolContainer, executionContext, stackVertically, isToggleable){
    var groupContainer = document.createElement("div");
    groupContainer.className = stackVertically ? "btn-group-vertical" : "btn-group";
    if (isToggleable !== false) {
      groupContainer.setAttribute("data-toggle", "buttons");
    }
    for (var idx = 0, len = controlConfig.length; idx < len; idx++) {
      if (!controlConfig[idx].type && isToggleable !== false) {
        controlConfig[idx].type = 'radio';
      }
      groupContainer.appendChild(craftInteractiveButton(controlConfig[idx], executionContext));
    }
    toolContainer.appendChild(groupContainer);
  }
  function craftInteractiveButton(controlConfig, executionContext) {
    if (controlConfig.type == "search") {
      var wrapperDiv = document.createElement("div");
      wrapperDiv.style.display = "inline-block";
      wrapperDiv.style.verticalAlign = "middle";
      wrapperDiv.innerHTML = '<div class="input-group input-group-sm" style="width: 150px;">\
            <input type="text" class="form-control" placeholder="' + (controlConfig.placeholder || '') + '">\
                <span class="input-group-btn">\
                    <div class="btn btn-default" type="button"></div>\
                </span>\
            </div>';
      var searchField = wrapperDiv.getElementsByTagName("input")[0];
      if (controlConfig.id) {
        searchField.id = controlConfig.id;
      }
      var triggerElement = jQuery(wrapperDiv).find('.btn')[0];
      if (controlConfig.iconClass) {
        var iconDisplay = document.createElement('div');
        jQuery(iconDisplay).addClass(controlConfig.iconClass);
        triggerElement.appendChild(iconDisplay);
      } else if (controlConfig.name) {
        triggerElement.appendChild(document.createTextNode(" " + controlConfig.name));
      }
      controlConfig.input = searchField;
      if (controlConfig.search) {
        var resetSearchState = function () {
          controlConfig.searchInfo = null;
        }
        var executeSearchOperation = function (isPrevious) {
          var currentInput = searchField.value;
          if (!currentInput) {
            resetSearchState();
            return;
          }
          if (!controlConfig.searchInfo || controlConfig.searchInfo.value != currentInput) {
            var searchResults = controlConfig.search(currentInput, controlConfig);
            if (!searchResults || !searchResults.length) {
              resetSearchState();
              return;
            }
            controlConfig.searchInfo = {value: currentInput, result: searchResults};
          }
          advanceSelection(isPrevious);
        }
        var advanceSelection = function (isPrevious) {
          if (!(controlConfig.select instanceof Function) || !controlConfig.searchInfo || !controlConfig.searchInfo.result || !controlConfig.searchInfo.result.length) {
            return;
          }
          var currentSearchState = controlConfig.searchInfo;
          var searchResults = controlConfig.searchInfo.result;
          if (searchResults.length == 1) {
            controlConfig.select(searchResults[0], 0);
            return;
          }
          if (currentSearchState.index === undefined) {
            currentSearchState.index = 0;
          } else {
            currentSearchState.index += isPrevious ? -1 : 1;
            if (currentSearchState.index < 0) {
              currentSearchState.index += searchResults.length;
            }
            currentSearchState.index %= searchResults.length;
          }
          if (controlConfig.select(searchResults[currentSearchState.index], currentSearchState.index) === false) {
            controlConfig.searchInfo = null;
            executeSearchOperation();
          }
          ;
        }
        searchField.onkeydown = function (eventObj) {
          if (eventObj.keyCode == 27) { /* Escape key */
            resetSearchState();
            searchField.value = "";
            GraphLib.haltEvent(eventObj);
            return;
          }
          if (eventObj.keyCode == 13) { /* Enter key */
            executeSearchOperation(eventObj.shiftKey);
          }
        }
        triggerElement.onclick = function (eventObj) {
          executeSearchOperation();
        }
      }
      return wrapperDiv;
    }
    if (controlConfig.type == "input") {
      var contentBlock = document.createElement("div");
      contentBlock.style.display = "inline-block";
      contentBlock.style.verticalAlign = "middle";
      contentBlock.innerHTML = '<div class="input-group input-group-sm" style="width: 150px;">\
            <input type="text" class="form-control">\
                <span class="input-group-btn">\
                    <button class="btn btn-default" type="button"></button>\
                </span>\
            </div>';
      var textInput = contentBlock.getElementsByTagName("input")[0];
      var actionButton = contentBlock.getElementsByTagName("button")[0];
      actionButton.innerHTML = controlConfig.name;
      controlConfig.input = textInput;
      if (controlConfig.action) {
        actionButton.onclick = function (eventObj) {
          controlConfig.action.call(executionContext || window.activeGraph, eventObj, controlConfig);
        }
      }
      return contentBlock;
    } else if (controlConfig.type == "select") {
      var selectContainer = document.createElement("select");
      selectContainer.className = "form-control";
      var choiceList = controlConfig.options;
      choiceList.forEach(function (optionValue) {
        var selectOption = document.createElement("option");
        selectOption.innerHTML = optionValue;
        selectOption.value = optionValue;
        selectContainer.appendChild(selectOption);
      });
      selectContainer.value = controlConfig.value;
      if (controlConfig.action) {
        selectContainer.onValueChange = function (eventObj) { /* Custom event for value change */
          controlConfig.action.call(executionContext || window.activeGraph, eventObj, controlConfig);
        }
      }
      return selectContainer;
    }
    var controlLabel;
    if (!controlConfig.type) {
      controlLabel = document.createElement("div");
    } else {
      controlLabel = document.createElement("label");
      var inputElement = document.createElement("input");
      controlConfig.input = inputElement;
      inputElement.setAttribute('type', controlConfig.type);
      controlLabel.appendChild(inputElement);
      if (controlConfig.selected) {
        inputElement.setAttribute('checked', 'checked');
        if (controlConfig.type == 'radio') {
          controlLabel.className += " active";
        }
      }
    }
    controlLabel.className += " btn btn-default btn-sm";
    if (controlConfig.icon) {
      var graphicIcon = document.createElement('img');
      graphicIcon.src = controlConfig.icon;
      controlLabel.appendChild(graphicIcon);
    } else if (controlConfig.iconClass) {
      var visualIcon = document.createElement('div');
      jQuery(visualIcon).addClass(controlConfig.iconClass);
      controlLabel.appendChild(visualIcon);
    } else if (controlConfig.name) {
      controlLabel.appendChild(document.createTextNode(" " + controlConfig.name));
    }
    if (controlConfig.name) {
      controlLabel.setAttribute("title", controlConfig.name);
    }
    if (controlConfig.action) {
      controlLabel.onclick = function (eventObj) {
        controlConfig.action.call(executionContext || window.activeGraph, eventObj, controlConfig);
      }
    }
    return controlLabel;
  }

  function constructToolPalette(visualGraph, toolContainer, userDefinedButtons){
    /* Internal helper function to resolve graph instance */
    function retrieveGraphReference(){
      if(visualGraph instanceof GraphLib.Graph){
        return visualGraph;
      }
      return visualGraph(); /* Assume it's a function if not an instance */
    }
    /* Action handler to modify graph interaction behavior */
    function adjustInteractionBehavior(eventObj, controlConfig, behaviorSettings) {
      retrieveGraphReference().interactionMode = controlConfig.value;
      retrieveGraphReference().interactionProperties = behaviorSettings || controlConfig;
    }

    var paletteItems = {
      interactionModes: [
        {
          displayText: 'Default Mode',
          settingValue: GraphLib.Constants.INTERACTION_MODE_DEFAULT,
          initiallyChecked: true,
          iconStyleClass: 'icon toolbar-default',
          clickHandler: adjustInteractionBehavior
        },
        {
          displayText: 'Selection Mode',
          settingValue: GraphLib.Constants.INTERACTION_MODE_SELECTION,
          iconStyleClass: 'icon toolbar-rectangle_selection',
          clickHandler: adjustInteractionBehavior
        },
        {
          displayText: 'Navigation Mode',
          settingValue: GraphLib.Constants.INTERACTION_MODE_VIEW,
          iconStyleClass: 'icon toolbar-pan',
          clickHandler: adjustInteractionBehavior
        }
      ],
      zoomControls: [
        {
          displayText: 'Zoom In', iconStyleClass: 'icon toolbar-zoomin', clickHandler: function () {
          retrieveGraphReference().zoomIn()
        }
        },
        {
          displayText: 'Zoom Out', iconStyleClass: 'icon toolbar-zoomout', clickHandler: function () {
          retrieveGraphReference().zoomOut()
        }
        },
        {
          displayText: 'Actual Size', iconStyleClass: 'icon toolbar-zoomreset', clickHandler: function () {
          retrieveGraphReference().scale = 1;
        }
        },
        {
          displayText: 'Fit to View', iconStyleClass: 'icon toolbar-overview', clickHandler: function () {
          retrieveGraphReference().zoomToOverview()
        }
        }
      ],
      elementCreation: [
        {
          displayText: 'Create Link',
          settingValue: GraphLib.Constants.INTERACTION_MODE_CREATE_EDGE,
          iconStyleClass: 'icon toolbar-edge',
          clickHandler: adjustInteractionBehavior
        },
        //{
        //  displayText: 'Create Curve',
        //  settingValue: GraphLib.Constants.INTERACTION_MODE_CREATE_SIMPLE_EDGE,
        //  iconStyleClass: 'icon toolbar-edge_flex',
        //  clickHandler: adjustInteractionBehavior,
        //  uiClass: FlexibleEdgeUI
        //},
        {
          displayText: 'Create L-Link',
          settingValue: GraphLib.Constants.INTERACTION_MODE_CREATE_SIMPLE_EDGE,
          iconStyleClass: 'icon toolbar-edge_VH',
          clickHandler: adjustInteractionBehavior,
          edgeType: GraphLib.Constants.EDGE_TYPE_VERTICAL_HORIZONTAL
        },
        {
          displayText: 'Create Polygon',
          settingValue: GraphLib.Constants.INTERACTION_MODE_CREATE_SHAPE,
          iconStyleClass: 'icon toolbar-polygon',
          clickHandler: adjustInteractionBehavior
        },
        {
          displayText: 'Create Line',
          settingValue: GraphLib.Constants.INTERACTION_MODE_CREATE_LINE,
          iconStyleClass: 'icon toolbar-line',
          clickHandler: adjustInteractionBehavior
        }
      ],
      searchFeature: {
        displayText: 'Locate', placeholder: 'Element Name', iconStyleClass: 'icon toolbar-search', type: 'search', id: 'lookup_input',
        search: function (searchName, controlConfig) {
          var matchedItems = [];
          var pattern = new RegExp(searchName, 'i');
          retrieveGraphReference().forEach(function (graphElement) {
            if (graphElement.name && pattern.test(graphElement.name)) {
              matchedItems.push(graphElement.id);
            }
          });
          return matchedItems;
        }, select: function (resultEntry) {
          resultEntry = retrieveGraphReference().graphModel.getById(resultEntry);
          if (!resultEntry) {
            return false;
          }
          retrieveGraphReference().setSelection(resultEntry);
          retrieveGraphReference().sendToTop(resultEntry);
          var elementBounds = retrieveGraphReference().getUIBounds(resultEntry);
          if (elementBounds) {
            retrieveGraphReference().centerTo(elementBounds.cx, elementBounds.cy, Math.max(2, retrieveGraphReference().scale), true);
          }
        }
      },
      exportAction: {
        displayText: 'Export Image', iconStyleClass: 'icon toolbar-print', clickHandler: function(){
          GraphLib.displayExportDialog(retrieveGraphReference());
        }
      }
    };
    if(userDefinedButtons){
      for(var keyIndex in userDefinedButtons){
        paletteItems[keyIndex] = userDefinedButtons[keyIndex]; /* Merge user-defined items */
      }
    }
    assembleControls(paletteItems, toolContainer, this, false, false);
    return toolContainer;
  }
  GraphLib.constructToolPalette = constructToolPalette;
  GraphLib.buildControlGroup = buildControlGroup;
})(GraphLib, jQuery);