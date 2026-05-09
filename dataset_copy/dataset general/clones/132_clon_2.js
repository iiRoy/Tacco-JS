var dataHandler = new DataProcessor();
var transformer = new FormatTransformer();
var displayPanes = new ViewPanes();

/**
 * Synchronizes the scroll positions of two scrollable HTML elements.
 * @param {HTMLElement} currentElement - The primary element whose scroll position is to be mirrored.
 * @param {HTMLElement} targetElement - The secondary element that will adopt the primary element's scroll position.
 */
var alignViewports = function ( currentElement, targetElement )
{
 targetElement.scrollTop = currentElement.scrollTop;
 targetElement.scrollLeft = currentElement.scrollLeft;
};

// Configure input mechanisms for content acquisition.
// Attach an event listener to the file input element to handle file selection.
dataHandler.getFileInput().addEventListener('change', dataHandler.ingestFromFileInput);

// Set up the drag-and-drop area for file handling.
dataHandler.getDropZone().addEventListener('dragover', dataHandler.dropZoneDragOverProcessor, false);
dataHandler.getDropZone().addEventListener('drop', dataHandler.ingestFromDropZone, false);

// Implement synchronized scrolling between the source and result display areas.
// When the source content view scrolls, update the result view.
document.getElementById("preview-source").addEventListener('scroll', function() {
    alignViewports(this, document.getElementById("preview-result"));
});

// When the result content view scrolls, update the source view.
document.getElementById("preview-result").addEventListener('scroll', function() {
    alignViewports(this, document.getElementById("preview-source"));
});

// Attach event listeners for content transformation and display options.
// Hook up the primary processing button to trigger content transformation.
transformer.getProcessButton().addEventListener('click', transformer.transformContent);
// Link the full-screen toggle button to expand/collapse the display.
transformer.getExpandViewButton().addEventListener('click', transformer.toggleExpandedView);