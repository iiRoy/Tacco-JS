// This section initializes core application components.
var input = new Input();  // Handles user input operations.
var converter = new Converter(); // Manages conversion logic.
var previews = new Previews(); // Controls preview displays.


// This function synchronizes the scroll position between two elements.
// It takes two HTML elements as arguments: 'th' (the source) and 'other' (the target).
var syncScroll = function(th, other)
{
    // Update the vertical scroll position of the 'other' element to match 'th'.
    other.scrollTop  =  th.scrollTop;

    // Update the horizontal scroll position of the 'other' element to match 'th'.
    other.scrollLeft = th.scrollLeft;
}; // End of syncScroll function definition.


// --- Event Listeners for Input Handling ---

// Attaches an event listener to the input field's 'change' event.
// When the input field's value changes (e.g., a file is selected),
// the 'loadFromField' method of the 'input' object is called.
input.getField().addEventListener('change', input.loadFromField);

// Sets up a 'dragover' event listener for the input area.
// This prevents the default browser behavior for drag-and-drop,
// allowing custom handling. The 'false' indicates event bubbling.
input.getArea().addEventListener('dragover', input.areaDragOverHandler, false);

// Configures a 'drop' event listener for the input area.
// When a file is dropped onto the area, 'loadFromArea' is invoked.
// Again, 'false' for event bubbling.
input.getArea().addEventListener('drop', input.loadFromArea, false);


// --- Scroll Synchronization for Preview Panes ---

// Attaches a 'scroll' event listener to the "preview-source" element.
// When the source preview scrolls, the 'syncScroll' function is called
// to synchronize it with the "preview-result" element.
document.getElementById("preview-source").addEventListener('scroll', function()
    {
        // Call the scroll synchronization utility.
        syncScroll(this, document.getElementById("preview-result"));
    }
); // Closing bracket for addEventListener and function.

// Attaches a 'scroll' event listener to the "preview-result" element.
// This ensures two-way synchronization: if the result preview scrolls,
// the source preview is updated accordingly.
document.getElementById("preview-result").addEventListener('scroll', function()
    {
        // Execute the scroll synchronization logic.
        syncScroll(this, document.getElementById("preview-source"));
    }
);


// --- Event Listeners for Converter Actions ---

// Binds the 'click' event of the converter's create button
// to the 'convert' method of the converter object.
converter.getCreateButton().addEventListener('click', converter.convert);

// Binds the 'click' event of the converter's full screen button
// to the 'fullScreen' method of the converter object.
converter.getFullScreenButton().addEventListener('click', converter.fullScreen);