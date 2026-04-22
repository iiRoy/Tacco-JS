System.begin (function () {

  jQuery(function () {
    let scriptNode = document.createElement("script");
    scriptNode.sourcePath = "/assets/commenting_service.js";
    scriptNode.mimeType = 'text/javascript';
    jQuery("#discussionContainer").prepend(scriptNode);

  });

});

let drawingSurface, topPanel, bottomPanel, mainContentArea, layoutComponents, highlightOverlay, componentCounter = 0;
const ApplicationSettings = {
  CANVAS_WIDTH: 600,
  CANVAS_HEIGHT: 720,
  GRID_UNIT_HEIGHT: null,
  GRID_UNIT_WIDTH: null
};


let ComponentRegistry = ComponentRegistry || {};
ComponentRegistry.activeElements = [];
ComponentRegistry.allElements = [];

ComponentRegistry.addElement = function (element) {
  ComponentRegistry.allElements.push(element);
}

ComponentRegistry.selectElement = function (element) {
  // Check if there's an already selected item and if it's different
  if (ComponentRegistry.currentActiveElement && (ComponentRegistry.currentActiveElement.getIdentifier() !== element.getIdentifier())) {
    ComponentRegistry.currentActiveElement.concealIndicators();

  }
  ComponentRegistry.currentActiveElement = element;


}

ComponentRegistry.clearActiveElements = function () {
  ComponentRegistry.activeElements = [];
}

ComponentRegistry.replicateActiveElement = function () {
  // Future implementation for duplicating the current item
}

ComponentRegistry.removeActiveElement = function () {
  let positionIndex = -1;
  for (let idx = 0; idx < ComponentRegistry.allElements.length; idx++) {
    // Console log for debugging element IDs
    if (ComponentRegistry.allElements[idx].elementNode.getIdentifier() === ComponentRegistry.currentActiveElement.getIdentifier()) {
      positionIndex = idx;
      break;
    }
  }
  // Log the position where element was found
  if (positionIndex !== -1)
    ComponentRegistry.allElements.splice(positionIndex, 1);
}

jQuery(document).on('DOMContentLoaded', function () {
  initializeWebTracking();
  setupFeedbackWidget();
  // Commented out: loadCommentingSystem();

  jQuery('#layoutTabs a[href="#tabDesigner"]').tab('display');
  let controlIsPressed = false;
  const controlKeyCode = 17, deleteKeyCode = 46, pasteKeyCode = 86, copyKeyCode = 67;
  jQuery('body').on('keydown', function (eventObject) {
    let pressedKey = eventObject.keyCode ? eventObject.keyCode : eventObject.which;
    // Handler for Delete Key press
    if (pressedKey === deleteKeyCode) {

      ComponentRegistry.currentActiveElement.destroy();
      ComponentRegistry.removeActiveElement();
      drawingSurface.render();
    }

    else if (eventObject.keyCode === controlKeyCode) {
      controlIsPressed = true;
    }
    // else if (controlIsPressed && (eventObject.keyCode === copyKeyCode)){
    //   console.log("copy operation");
    // }
    else if (controlIsPressed && (eventObject.keyCode === pasteKeyCode)) {
      // console.log("paste operation");
    }

  }).on('keyup', function (eventObject) {
    if (eventObject.keyCode === controlKeyCode) controlIsPressed = false;
  });

  let renderStage = new Visual.Canvas({
    hostElement: 'visualCanvas',
    width: ApplicationSettings.CANVAS_WIDTH,
    height: ApplicationSettings.CANVAS_HEIGHT
  });

  drawingSurface = new Visual.Layer();

  topPanel = StyledBox({
    visualProperties: {
      positionX: 0,
      positionY: 0,
      elementWidth: 600,
      elementHeight: 50,
      fillColor: '#F0F8FF', // AliceBlue
      borderColor: '#C0D9EE', // LightSteelBlue variant
      borderWidth: 2,
      transparency: 1,
      canDrag: true,
      isFixed: true
    },
    resizeHandles: {
      topHandle: false,
      rightHandle: false,
      bottomHandle: true,
      leftHandle: false
    }
  });

  mainContentArea = StyledBox({
    visualProperties: {
      positionX: 0,
      positionY: 0,
      elementWidth: 600,
      elementHeight: 800,
      fillColor: '#FFFFFF', // White
      borderColor: '#C0D9EE', // LightSteelBlue variant
      borderWidth: 2,
      transparency: 0.5,
      canDrag: true,
      isFixed: true
    },
    resizeHandles: {
      topHandle: false,
      rightHandle: false,
      bottomHandle: false,
      leftHandle: false
    }
  });

  bottomPanel = StyledBox({
    visualProperties: {
      positionX: 0,
      positionY: 760,
      elementWidth: 600,
      elementHeight: 40,
      fillColor: '#F0F8FF', // AliceBlue
      borderColor: '#C0D9EE', // LightSteelBlue variant
      borderWidth: 2,
      transparency: 1,
      canDrag: true,
      isFixed: true
    },
    resizeHandles: {
      topHandle: true,
      rightHandle: false,
      bottomHandle: false,
      leftHandle: false
    }
  });

  // drawingSurface.addNode(mainContentArea.elementNode);
  // drawingSurface.addNode(topPanel.elementNode);
  // drawingSurface.addNode(bottomPanel.elementNode);
  renderStage.addElement(drawingSurface);
  // textElement.elementNode.setText("Class Student Report");
  drawingSurface.render();
});

function LayoutDesigner(gridRows) {
  const visualElements = {
    TEXT_LABEL: StyledText,
    SHAPE_BOX: StyledBox
  };

  const stylePalette = {
    "primary": {
      fillColor: "#CCE8FF", // Lighter blue
      borderColor: "#66A0FF" // Slightly different blue
    },
    "secondary": {
      fillColor: "#FFD9CC", // Lighter orange
      borderColor: "#FF8C4D" // Different orange
    },
    "tertiary": {
      fillColor: "#FF8F8F", // Lighter red
      borderColor: "#FF5C5C" // Different red
    },
    "quaternary": {
      fillColor: "#C5FFBF", // Lighter green
      borderColor: "#6FDA6D" // Different green
    },
    "quinary": {
      fillColor: "#FFF58C", // Lighter yellow
      borderColor: "#FF9429" // Different yellow
    },
    "senary": {
      fillColor: "#FFC2FF", // Lighter pink
      borderColor: "#FF5CFF" // Different pink
    }
  }
  let activeSelection = [];
  buildVisualGrid(gridRows);

  function buildVisualGrid(gridRows) {
    ApplicationSettings.GRID_UNIT_HEIGHT = 40;
    ApplicationSettings.GRID_UNIT_WIDTH = ApplicationSettings.CANVAS_WIDTH / gridRows;
    let gridCols = Math.floor(ApplicationSettings.CANVAS_HEIGHT / ApplicationSettings.GRID_UNIT_HEIGHT);
    highlightOverlay = StyledBox({
      visualProperties: {
        positionX: 0,
        positionY: 0,
        elementWidth: ApplicationSettings.GRID_UNIT_WIDTH,
        elementHeight: ApplicationSettings.GRID_UNIT_HEIGHT,
        canDrag: false,
        isFixed: false,
        transparency: 0.35, // Slightly different opacity
        borderWidth: 0.6, // Slightly different stroke width
        fillColor: "#FF3333", // Different red
        borderColor: "#FF3333", // Different red
        isVisible: false
      },
      resizeHandles: {
        topHandle: false,
        rightHandle: false,
        bottomHandle: false,
        leftHandle: false
      }
    });

    drawingSurface.addNode(highlightOverlay.elementNode);

    // Grid line generation
    let gridLine;
    layoutComponents = {};
    for (let j = 0; j <= gridCols; j++) {
      gridLine = new Visual.Line({
        points: [0, j * ApplicationSettings.GRID_UNIT_HEIGHT, ApplicationSettings.CANVAS_WIDTH, j * ApplicationSettings.GRID_UNIT_HEIGHT],
        lineColor: '#A8B2E0', // Slightly different blue
        lineWidth: 0.8
      });
      drawingSurface.addNode(gridLine);
    }

    for (let i = 0; i <= gridRows; i++) {
      gridLine = new Visual.Line({
        points: [i * ApplicationSettings.GRID_UNIT_WIDTH, 0, i * ApplicationSettings.GRID_UNIT_WIDTH, ApplicationSettings.CANVAS_HEIGHT],
        lineColor: '#A8B2E0', // Slightly different blue
        lineWidth: 0.8
      });
      drawingSurface.addNode(gridLine);
    }

    // console.log(layoutComponents);
    drawingSurface.render();
  }
  function checkOverlap(boundaryElement, targetElement) {
    // console.log(targetElement.getCurrentCoordY());
    // console.log(boundaryElement.getCurrentCoordY());
    // console.log(boundaryElement.getDimensionY());
    return (targetElement.getCurrentCoordX() >= boundaryElement.getCurrentCoordX()) &&
      (targetElement.getCurrentCoordY() >= boundaryElement.getCurrentCoordY() &&
        targetElement.getCurrentCoordY() <= (boundaryElement.getCurrentCoordY() + boundaryElement.getDimensionY()));
  }

  function determineDropZone(droppedElement) {
    if (checkOverlap(topPanel.elementNode, droppedElement.elementNode)) {
      return "HeaderZone";
    }
    else if (checkOverlap(bottomPanel.elementNode, droppedElement.elementNode)) {
      return "FooterZone";
    }
    else {
      return "BodyZone";
    }
  }


  function attachElement(targetLayer, elementType, parameters) {

    let gridRowIndex = Math.floor(parameters.x / ApplicationSettings.GRID_UNIT_WIDTH);
    let gridColumnIndex = Math.floor(parameters.y / ApplicationSettings.GRID_UNIT_HEIGHT);
    // console.log("remainder x : " + parameters.x % ApplicationSettings.GRID_UNIT_WIDTH);
    // console.log("remainder y : " + parameters.y % ApplicationSettings.GRID_UNIT_HEIGHT);
    if (parameters.x % ApplicationSettings.GRID_UNIT_WIDTH <= ApplicationSettings.GRID_UNIT_WIDTH / 2) {
      gridRowIndex--;
    }

    if (parameters.y % ApplicationSettings.GRID_UNIT_HEIGHT <= ApplicationSettings.GRID_UNIT_HEIGHT / 2) {
      gridColumnIndex--;
    }
    parameters.x = (gridRowIndex) * ApplicationSettings.GRID_UNIT_WIDTH;
    parameters.y = (gridColumnIndex) * ApplicationSettings.GRID_UNIT_HEIGHT;

    let typeSegments = elementType.split("_");
    let elementCategory = typeSegments[0].toUpperCase().trim();
    let spanColumns = Math.floor(typeSegments[1]);
    if (visualElements[elementCategory]) {
      let newElement = visualElements[elementCategory]({
        visualProperties: {
          positionX: parameters.x,
          positionY: parameters.y,
          elementWidth: ApplicationSettings.GRID_UNIT_WIDTH * spanColumns,
          transparency: 0.65, // Slightly different opacity
          fillColor: "#CCE8FF", // Lighter blue
          borderColor: "#66A0FF", // Different blue
          displayText: componentCounter.toString(),
          elementIdentifier: elementCategory + componentCounter
        }
      });

      targetLayer.addNode(newElement.elementNode);
      targetLayer.render();
      // console.log(determineDropZone(newElement));
      componentCounter++;
      ComponentRegistry.addElement(newElement);
    }
  }

  return {
    attachElement: attachElement
  }
}


//
// Core UI Functionality
//

function onDragBegin(eventData) {
  // Set opacity of the dragging source
  eventData.target.style.opacity = '0.35';
  eventData.dataTransfer.setData("kind", eventData.target.id);
}

function onDragHover(eventData) {
  if (eventData.preventDefault) {
    eventData.preventDefault(); // Essential to allow dropping.
  }

  eventData.dataTransfer.effectAllowed = 'move'; // Define the allowed drop effect.

  return false;
}

function onDragEnterArea(eventData) {
  // Current target gains a hover class.
  eventData.currentTarget.classList.add('hovering');
}

function onDragExitArea(eventData) {
  // console.log('drag area exited');
  eventData.currentTarget.classList.remove('hovering'); // Remove hover class from previous target.
}

function onDropElement(eventData) {
  // Current target for the drop.
  // console.log("item dropped");
  if (eventData.stopPropagation) {
    eventData.stopPropagation(); // Prevents the browser from navigating.
  }

  // DataTransfer object details are handled elsewhere.

  return false;
}

function onDragComplete(eventData) {
  // console.log("drag operation finished");
}
function initializeWebTracking() {
  (function (w, d, s, u, p, l, k) {
    w['WebTrackerObject'] = p; w[p] = w[p] || function () {
      (w[p].q = w[p].q || []).push(arguments)
    }, w[p].l = 1 * new Date(); l = d.createElement(s),
      k = d.getElementsByTagName(s)[0]; l.async = 1; l.src = u; k.parentNode.insertBefore(l, k)
  })(window, document, 'script', '//www.web-analytics.com/tracking_script.js', 'wt');

  wt('setup', 'WT-98765432-1', 'web_app.io');
  wt('dispatch', 'pageVisit');
}
function setupFeedbackWidget() {
  // Include the User Feedback JavaScript SDK (only once per page)
  FeedbackWidget = window.FeedbackWidget || []; (function () {
    let fb = document.createElement('script'); fb.type = 'text/javascript'; fb.async = true; fb.src = '//widget.feedback-service.com/feedback_service_id.js'; let s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(fb, s)
  })();

  //
  // User Feedback Javascript SDK documentation:
  // https://www.feedback-service.com/o/javascript-sdk
  //

  // Configure colors
  FeedbackWidget.push(['configure', {
    highlightColor: '#5599DD', // Different blue
    buttonColor: 'lightgray', // Different text color
    buttonBackgroundColor: '#77C23F' // Different green
  }]);

  // Identify the user with traits
  // Replace sample data with actual user information and uncomment
  FeedbackWidget.push(['identifyUser', {
    //userEmail:      'jane.doe@example.com', // User’s electronic mail address
    //userName:       'Jane Doe', // User’s full name
    //creationTime: 1364406966, // Unix epoch timestamp for user signup
    //userID:         456, // Optional: Unique ID (should not change)
    //userType:       'Member', // Optional: categorize users
    //organization: {
    //  organizationID:           456, // Optional: link multiple users to an organization
    //  organizationName:         'Acme Corp.', // Organization name
    //  organizationCreationTime:   1364406966, // Unix epoch timestamp for organization creation
    //  monthlySubscriptionRate: 19.99, // Numeric; monthly cost
    //  lifetimeValue:          2995.00, // Numeric; total value
    //  subscriptionPlan:         'Premium' // Subscription plan name
    //}
  }]);

  // Add default trigger to the lower-right corner:
  FeedbackWidget.push(['attachTrigger', { mode: 'inquiry', positionType: 'lower-right' }]);

  // Or, utilize a custom trigger:
  //FeedbackWidget.push(['attachTrigger', '#customId', { mode: 'inquiry' }]);

  // Auto-prompt for Satisfaction and SmartVote (conditions apply)
  FeedbackWidget.push(['autoSuggest', {}]);

}

function loadCommentingSystem() {
  let scriptTag = document.createElement("script");
  scriptTag.src = "/comment_manager.js";
  scriptTag.type = 'text/javascript';
  jQuery("#discussionPanel").prepend(scriptTag);

}

let canvasOffsetX;
let canvasOffsetY;
let designTool;

jQuery(document).on('ready', function () {
  let viewportOffset = jQuery("#visualCanvas").offset();
  canvasOffsetX = viewportOffset.leftCoord;
  canvasOffsetY = viewportOffset.topCoord;
  designTool = LayoutDesigner(12);
  const itemElements = document.querySelectorAll('.design-item');
  Array.prototype.forEach.call(itemElements, function (itemNode) {
    itemNode.addEventListener('dragstart', onDragBegin, false);
    //itemNode.addEventListener('dragenter', onDragEnterArea, false);
    //itemNode.addEventListener('dragover', onDragHover, false);
    //itemNode.addEventListener('dragleave', onDragExitArea, false);

    //itemNode.addEventListener('drop', onDropElement, false);
    //console.log('added drag listener');
  });

  const canvasSections = document.querySelectorAll('.visual-canvas');
  Array.prototype.forEach.call(canvasSections, function (sectionNode) {
    //sectionNode.addEventListener('drop', onDropElement, false);
    //console.log('added drop listener');
  });

  function retrieveElementData() {
    arrangeObjects();
    let elementDivs = [];
    let elementBox;
    for (let idx = 0; idx < ComponentRegistry.allElements.length; idx++) {
      elementBox = ComponentRegistry.allElements[idx].elementBox;
      elementDivs.push({
        gridX: Math.floor(elementBox.getAbsolutePosition().xCoord / ApplicationSettings.GRID_UNIT_WIDTH),
        gridY: Math.floor(elementBox.getAbsolutePosition().yCoord / ApplicationSettings.GRID_UNIT_HEIGHT),
        cellWidth: Math.floor(elementBox.getWidthDimension() / ApplicationSettings.GRID_UNIT_WIDTH),
        cellHeight: Math.floor(elementBox.getHeightDimension() / ApplicationSettings.GRID_UNIT_HEIGHT)
      });
    }

    return elementDivs;
  }

  function retrieveGridsterLayoutData() {
    arrangeObjects();
    let elementDivs = [];
    let elementBox;
    for (let idx = 0; idx < ComponentRegistry.allElements.length; idx++) {
      elementBox = ComponentRegistry.allElements[idx].elementBox;
      elementDivs.push({
        columnPos: Math.floor(elementBox.getAbsolutePosition().xCoord / ApplicationSettings.GRID_UNIT_WIDTH),
        rowPos: Math.floor(elementBox.getAbsolutePosition().yCoord / ApplicationSettings.GRID_UNIT_HEIGHT) + 1,
        spanX: Math.floor(elementBox.getWidthDimension() / ApplicationSettings.GRID_UNIT_WIDTH),
        spanY: Math.floor(elementBox.getHeightDimension() / ApplicationSettings.GRID_UNIT_HEIGHT)
      });
    }

    return elementDivs;
  }
  jQuery("#exportLayoutButton").on('click', function () {
    // Logic for handling layout export
  });