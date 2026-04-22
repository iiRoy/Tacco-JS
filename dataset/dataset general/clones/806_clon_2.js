var topWindow = window; /* Access to the global browser window object */
var currentDocument = topWindow.document; /* Reference to the current HTML document */
var displayPic = currentDocument.createElement('img'); /* Image element to be displayed */
var displayArea = currentDocument.querySelector('.elementsHolder'); /* Main container for image and canvas */
var gfxCanvas = currentDocument.querySelector('.theCanvas'); /* The dedicated canvas for drawing */
var renderCtx = gfxCanvas.getContext('2d'); /* 2D drawing context for canvas operations */
var detailPanel = currentDocument.querySelector('.info'); /* Panel displaying color information */
var navArrow = currentDocument.querySelector('.move'); /* Interactive element to toggle info panel */
var hexValueText = currentDocument.querySelector('.hex'); /* Paragraph for hexadecimal color code */
var rgbValueText = currentDocument.querySelector('.rgb'); /* Paragraph for RGB color code */
var hslValueText = currentDocument.querySelector('.hsl'); /* Paragraph for HSL color code */
var invertedValueText = currentDocument.querySelector('.inv'); /* Paragraph for inverted color code */
var guideText = currentDocument.querySelector('div.drop'); /* Guiding text for drag-and-drop actions */
var appLogo = currentDocument.querySelector('.logo'); /* Application's branding logo element */
var zoomGlass = currentDocument.createElement('div'); /* Element intended for a magnifying glass feature */
var traceEnabled = false; /* Boolean flag to enable or disable debug logging */

// Register primary event listeners for initial setup
currentDocument.addEventListener('DOMContentLoaded', setupProgram, false);

// Function to initialize application components after DOM is fully loaded
function setupProgram() {
  currentDocument.addEventListener('dragenter', handleDragEntry, false); /* Event for file entering drop zone */
  currentDocument.addEventListener('dragover', handleDragHover, false); /* Event for file hovering over drop zone */
  currentDocument.addEventListener('drop', processDroppedFile, false); /* Event for file being dropped */
  displayArea.addEventListener('click', handleContainerClick, false); /* Event for user clicking the image area */
  navArrow.addEventListener('click', processNavClick, false); /* Event for user clicking the info panel arrow */

  zoomGlass.className = 'magnifierStyle'; /* Assign CSS class to the magnifying glass */
  //displayArea.appendChild(zoomGlass); // This line adds the magnifying glass to the display area

  if (traceEnabled) console.log('Application has been successfully initialized.');
}

// Event handler for when the image asset finishes loading
displayPic.addEventListener('load', function() {
  gfxCanvas.width = displayPic.width; /* Set canvas width to image width */
  gfxCanvas.height = displayPic.height; /* Set canvas height to image height */
  displayArea.style.width = displayPic.width + 'px'; /* Adjust container width */
  displayArea.style.height = displayPic.height + 'px'; /* Adjust container height */

  if (displayPic.width <= topWindow.innerWidth) {
    displayArea.style.top = '50%'; /* Center vertically */
    displayArea.style.left = '50%'; /* Center horizontally */
    displayArea.style.marginTop = -(displayPic.height / 2) + 'px'; /* Adjust margin for vertical centering */
    displayArea.style.marginLeft = -(displayPic.width / 2) + 'px'; /* Adjust margin for horizontal centering */
    displayArea.style.boxShadow = '0 0 20px 10px #666'; /* Apply a subtle shadow effect */
  } else {
    displayArea.style.marginTop = 0; /* Reset vertical margin */
    displayArea.style.marginLeft = 0; /* Reset horizontal margin */
    displayArea.style.top = 0; /* Position at top */
    displayArea.style.left = 0; /* Position at left */
  }
  displayArea.style.opacity = 1; /* Make the display area fully opaque */
  renderCtx.drawImage(displayPic, 0, 0); /* Draw the loaded image onto the canvas at (0,0) */
  topWindow.scrollTo(0, 0); /* Scroll the viewport to the very top-left */

  if (traceEnabled) console.log('Image asset has finished loading.');
  if (traceEnabled) console.log('Image pixel width: ' + displayPic.width);
  if (traceEnabled) console.log('Image pixel height: ' + displayPic.height);
});

// Handler for the 'dragenter' event, preventing default actions
function handleDragEntry(evtData) {
  evtData.stopPropagation(); /* Stop event propagation */
  evtData.preventDefault(); /* Prevent browser's default drag behavior */
  if (traceEnabled) console.log('Drag event initiated!');
}

// Handler for the 'dragover' event, providing visual feedback
function handleDragHover(evtData) {
  displayArea.style.opacity = 0.3; /* Temporarily reduce opacity for feedback */

  evtData.stopPropagation(); /* Halt event bubbling */
  evtData.preventDefault(); /* Disable default actions */
  if (traceEnabled) console.log('Drag event is in progress!');
}

// Handler for the 'drop' event, processing dropped files
function processDroppedFile(evtData) {
  var incomingFiles = evtData.dataTransfer.files; /* Retrieve files from the data transfer */
  if (incomingFiles.length > 0) {
    var firstFile = incomingFiles[0]; /* Get the first dropped file */
    if (typeof FileReader !== 'undefined') {
      var fileProcessor = new FileReader(); /* Create a new FileReader instance */
      fileProcessor.onload = function(loadEvent) {
        displayPic.src = loadEvent.target.result; /* Set the image source to the file's data URL */
      };
      fileProcessor.readAsDataURL(firstFile); /* Read the file content as a data URL */
    }
  }

  displayArea.style.border = '1px solid #333'; /* Set a solid border */
  displayArea.style.borderRadius = '0'; /* Remove any rounded corners */
  displayArea.style.boxShadow = 'none'; /* Clear any existing box shadow */
  guideText.style.display = 'none'; /* Hide the instructional guide text */

  evtData.stopPropagation(); /* Prevent further event propagation */
  evtData.preventDefault(); /* Suppress default browser handling */
  if (traceEnabled) console.log('File has been successfully dropped!');
}

// Handler for click events on the image display area
function handleContainerClick(evtData) {
  var elementPosition = locateElementPosition(this); /* Determine the clicked element's position */
  var clickX = evtData.pageX - elementPosition.x; /* Calculate X-coordinate relative to element */
  var clickY = evtData.pageY - elementPosition.y; /* Calculate Y-coordinate relative to element */
  var clickCoords = 'x=' + clickX + ', y=' + clickY; /* String representation of click coordinates */
  var pixelData = renderCtx.getImageData(clickX, clickY, 1, 1).data; /* Get raw pixel data at click point */
  var hexColor = '#' + ('000000' + convertRgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6); /* Convert RGB to padded HEX */
  var hslColor = ColorUtil(hexColor).toHslFormat(); /* Convert HEX to HSL using ColorUtil library */
  var invertedColor = ColorUtil(hexColor).reverseColor().toTextFormat(); /* Get the inverted color */

  rgbValueText.style.color = invertedColor; /* Set RGB text color to inverted color */
  hexValueText.style.color = invertedColor; /* Set HEX text color to inverted color */
  hslValueText.style.color = invertedColor; /* Set HSL text color to inverted color */
  invertedValueText.style.color = invertedColor; /* Set inverted text color to inverted color */

  rgbValueText.innerHTML = 'rgb: ' + '<input type="text" id="rgbInput" class="rgbField" style="color:' + invertedColor + ';" onclick="this.select();" value="' + pixelData[0] + ',' + pixelData[1] + ',' + pixelData[2] + '">';
  hexValueText.innerHTML = 'hex: ' + '<input type="text" id="hexInput" class="hexField" style="color:' + invertedColor + ';" onclick="this.select();" value="' + hexColor + '">';
  hslValueText.innerHTML = 'hsl: ' + '<input type="text" id="hslInput" class="hslField" style="color:' + invertedColor + ';" onclick="this.select();" value="' + hslColor + '">';
  invertedValueText.innerHTML = 'inv: ' + '<input type="text" id="invInput" class="invField" style="color:' + invertedColor + ';" onclick="this.select();" value="' + invertedColor + '">';

  appLogo.style.backgroundColor = hexColor; /* Update the logo's background color */
  detailPanel.style.backgroundColor = hexColor; /* Update the info panel's background color */
  detailPanel.style.boxShadow = 'inset 0 0 0 1px ' + invertedColor; /* Add an inset shadow to the panel */

  if (detailPanel.style.top !== '-12px') {
    detailPanel.style.top = '-12px'; /* Adjust the info panel's vertical position */
  }

  if (traceEnabled) console.log('Image display area was clicked!');
}

// Converts RGB color components to a hexadecimal string
function convertRgbToHex(redComp, greenComp, blueComp) {
  if (redComp > 255 || greenComp > 255 || blueComp > 255) {
    throw 'Invalid color component value detected!'; /* Throw error for out-of-range values */
  }
  if (traceEnabled) console.log('RGB values successfully converted to Hexadecimal.');

  return ((redComp << 16) | (greenComp << 8) | blueComp).toString(16); /* Bitwise conversion to hex string */
}

// Finds the absolute position (offset from document top-left) of an HTML element
function locateElementPosition(targetElement) {
  var currentLeft = 0;
  var currentTop = 0;
  if (targetElement.offsetParent) {
    do {
      currentLeft += targetElement.offsetLeft; /* Add element's left offset */
      currentTop += targetElement.offsetTop; /* Add element's top offset */
    } while (targetElement == targetElement.offsetParent); /* Loop through parent elements */
    return {
      x: currentLeft,
      y: currentTop
    }; /* Return calculated coordinates */
  }
  return undefined; /* Return undefined if no offset parent is found */
}

// Handler for click events on the navigation arrow, repositioning the info panel
function processNavClick(evtData) {
  evtData.preventDefault(); /* Stop the default action of the event */
  if (detailPanel.offsetLeft > 20) {
    detailPanel.style.left = 20 + 'px'; /* Move the panel to a fixed left position */
  } else {
    detailPanel.style.left = (topWindow.innerWidth - (detailPanel.offsetWidth + 20)) + 'px'; /* Move panel to the right side */
  }

  if (traceEnabled) console.log('Info panel left coordinate: ' + detailPanel.offsetLeft);
}

// Retrieves the absolute offset coordinates of a given element
function retrieveElementOffset(currentElement) {
  var offsetX = 0;
  var offsetY = 0;
  while (currentElement && !isNaN(currentElement.offsetLeft) && !isNaN(currentElement.offsetTop)) {
    offsetX += currentElement.offsetLeft - currentElement.scrollLeft; /* Accumulate left offset, adjust for scroll */
    offsetY += currentElement.offsetTop - currentElement.scrollTop; /* Accumulate top offset, adjust for scroll */
    currentElement = currentElement.parentNode; /* Move to the next parent element */
  }
  return {
    top: offsetY,
    left: offsetX
  }; /* Return the total top and left offsets */
}