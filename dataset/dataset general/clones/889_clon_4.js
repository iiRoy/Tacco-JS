var inputControlState = {};

var applicationGlobalFlags = {
  gameCommenced: false
};

var userDeviceIdentifier = navigator.userAgent;
var isTabletDevice = userDeviceIdentifier.includes('iPad');

function handleTouchInput(evt) {
  evt.preventDefault();

  if (evt.type !== 'touchend') {
    Object.keys(inputControlState).forEach(function(stateKey) {
      inputControlState[stateKey] = false;
    });
  }

  var currentTouchPoints = (evt.type === 'touchend') ? evt.changedTouches : evt.touches;

  for (var touchIndex = 0; touchIndex < currentTouchPoints.length; touchIndex++) {
    var touchedElement = document.elementFromPoint(currentTouchPoints[touchIndex].pageX, currentTouchPoints[touchIndex].pageY);

    if (touchedElement && touchedElement.id) {
      inputControlState[touchedElement.id] = (evt.type !== 'touchend');
    }
  }
}

function blockBrowserDefaultActions(evt) {
  evt.preventDefault();
}

function initializeTabletInterface() {
  if (!isTabletDevice) {
    return;
  }

  var leftControlPanel = document.getElementById('left-controls');
  var rightControlPanel = document.getElementById('right-controls');
  var mainGameContainer = document.getElementById('game-container');
  var renderCanvas = document.getElementById('canvas');
  var pageBody = document.body;
  var pageHead = document.head;

  if (leftControlPanel) leftControlPanel.style.display = 'block';
  if (rightControlPanel) rightControlPanel.style.display = 'block';

  document.querySelectorAll('body > *').forEach(function(childNode) {
    childNode.style.display = 'none';
  });

  pageBody.style.margin = '0px';
  pageBody.style.backgroundColor = 'black';
  if (mainGameContainer) {
    if (mainGameContainer.parentNode) {
      mainGameContainer.parentNode.removeChild(mainGameContainer);
    }
    pageBody.prepend(mainGameContainer);
  }

  if (mainGameContainer) {
    mainGameContainer.style.width = '1024px';
    mainGameContainer.style.marginTop = '26px';
    mainGameContainer.style.display = 'block';
  }

  if (renderCanvas) {
    renderCanvas.setAttribute('width', '1020');
    renderCanvas.setAttribute('height', '660');
    renderCanvas.style.backgroundColor = 'white';
    renderCanvas.style.margin = '0 1';
  }

  var viewportMeta = document.createElement('meta');
  viewportMeta.setAttribute('name', 'viewport');
  viewportMeta.setAttribute('content', 'width=device-width; height=device-height; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;');
  if (pageHead) {
    pageHead.prepend(viewportMeta);
  }

  var eventsToMonitor = ['touchstart', 'touchmove', 'touchend'];
  if (leftControlPanel) {
    eventsToMonitor.forEach(function(eventType) {
      leftControlPanel.addEventListener(eventType, handleTouchInput, { passive: false });
    });
  }
  if (rightControlPanel) {
    eventsToMonitor.forEach(function(eventType) {
      rightControlPanel.addEventListener(eventType, handleTouchInput, { passive: false });
    });
  }

  document.addEventListener('touchstart', function(touchEvent) {
    applicationGlobalFlags.gameCommenced = true;
  }, { once: true });

  var eventsToPreventDefaults = ['gesturestart', 'gesturechange', 'gestureend', 'touchstart', 'touchmove', 'touchend'];
  eventsToPreventDefaults.forEach(function(eventType) {
    document.addEventListener(eventType, blockBrowserDefaultActions, { passive: false });
  });
}

document.addEventListener('DOMContentLoaded', initializeTabletInterface);