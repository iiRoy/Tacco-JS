var win = window,
    doc = win.document,
    img = document.createElement('img'),
    eh = document.querySelector('.elementsHolder');      // This variable holds the main container for the canvas and other UI elements.
    cnv = doc.querySelector('.theCanvas');                // This is the canvas DOM element itself.
    c = cnv.getContext('2d'),                           // The 2D rendering context for the canvas.
    info = doc.querySelector('.info'),                     // This element displays color information.
    arrow = doc.querySelector('.move'),                     // This is the clickable arrow for repositioning the info box.
    ihex = doc.querySelector('.hex'),                      // Paragraph to display HEX color.
    irgb = doc.querySelector('.rgb'),                      // Paragraph to display RGB color.
    ihsl = doc.querySelector('.hsl'),                      // Paragraph to display HSL color.
    iinv = doc.querySelector('.inv'),                      // Paragraph to display inverted color.
    helpr = doc.querySelector('div.drop');                  // This div provides initial guidance to the user.
    logo = doc.querySelector('.logo'),                     // The application's logo element.
    mGlass = doc.createElement('div'),                       // Placeholder for a magnifying glass feature (future).
    dbg = false;                                          // A flag to enable or disable debug messages in the console.

// Global Event Listeners Setup
// The 'DOMContentLoaded' event ensures the script runs after the HTML is fully loaded and parsed.
doc.addEventListener('DOMContentLoaded', init, false);

// Initialization function, called once the DOM is ready.
function init() {
    // Event listeners for drag-and-drop functionality.
    doc.addEventListener('dragenter', dragEnter, false);    // When an item is dragged into the document's area.
    doc.addEventListener('dragover', dragOver, false);      // While an item is being dragged over the document.
    doc.addEventListener('drop', drop, false);              // When an item is dropped onto the document.

    // Event listeners for user interaction with the UI.
    eh.addEventListener('click', ehClick, false);           // Handles clicks on the main elements holder to select colors.
    arrow.addEventListener('click', arrowClick, false);     // Handles clicks on the arrow to move the info box.

    // Assign a CSS class to the magnifying glass element.
    mGlass.className = 'mGlass';
    // eh.appendChild(mGlass); // Uncomment this line to add the magnifying glass to the DOM.

    // Log an initialization message if debug mode is active.
    if (dbg) {
        console.log('Application initialized successfully.');
    }
}


// Event listener for when the image finishes loading.
img.addEventListener('load', function() {
    // Set canvas dimensions to match the loaded image.
    cnv.width = img.width;
    cnv.height = img.height;

    // Adjust the container's size to fit the image.
    eh.style.width = img.width + 'px';
    eh.style.height = img.height + 'px';

    // Center the image container if it fits within the window.
    if (img.width <= window.innerWidth) {
        eh.style.top = '50%';
        eh.style.left = '50%';
        eh.style.marginTop = -(img.height / 2) + 'px';
        eh.style.marginLeft = -(img.width / 2) + 'px';
        eh.style.boxShadow = '0 0 20px 10px #666'; // Add a subtle shadow.
    } else {
        // If the image is wider than the window, align to top-left.
        eh.style.marginTop = 0;
        eh.style.marginLeft = 0;
        eh.style.top = 0;
        eh.style.left = 0;
    }

    // Make the image container fully visible.
    eh.style.opacity = 1;

    // Draw the loaded image onto the canvas.
    c.drawImage(img, 0, 0);

    // Scroll to the top-left of the window.
    window.scrollTo(0, 0);

    // Debug logs for image loading status and dimensions.
    if (dbg) {
        console.log('Image has finished loading.');
    }
    if (dbg) {
        console.log('Image width: ' + img.width + 'px');
    }
    if (dbg) {
        console.log('Image height: ' + img.height + 'px');
    }
});


// Handler for the 'dragenter' event.
function dragEnter(e) {
    e.stopPropagation(); // Prevents the event from bubbling up the DOM tree.
    e.preventDefault();  // Prevents the default browser action (e.g., opening the file).
    if (dbg) {
        console.log('Drag operation entered the drop zone.');
    }
}


// Handler for the 'dragover' event.
function dragOver(e) {
    eh.style.opacity = 0.3; // Temporarily reduce opacity to indicate drop zone.

    e.stopPropagation();
    e.preventDefault();
    if (dbg) {
        console.log('Item is being dragged over the drop zone.');
    }
}


// Handler for the 'drop' event.
function drop(e) {
    var images = e.dataTransfer.files; // Get the files that were dropped.

    if (images.length > 0) {
        var theImage = images[0]; // Take the first dropped file.
        // Check if FileReader API is supported by the browser.
        if (typeof FileReader !== 'undefined') {
            var reader = new FileReader(); // Create a new FileReader instance.
            reader.onload = function(e) {
                img.src = e.target.result; // Set the image source to the data URL.
            };
            reader.readAsDataURL(theImage); // Read the image file as a data URL.
        }
    }

    // Reset styles after a successful drop.
    eh.style.border = '1px solid #333';
    eh.style.borderRadius = '0';
    eh.style.boxShadow = 'none';
    helpr.style.display = 'none'; // Hide the helper text.

    e.stopPropagation();
    e.preventDefault();
    if (dbg) {
        console.log('File successfully dropped and processed.');
    }
}


// Handler for click events on the main elements holder (eh).
function ehClick(e) {
    var pos = findPos(this), // Get the absolute position of the clicked element.
        x = e.pageX - pos.x, // Calculate X coordinate relative to the element.
        y = e.pageY - pos.y, // Calculate Y coordinate relative to the element.
        coord = 'x=' + x + ', y=' + y, // String representation of coordinates (not used in output).
        p = c.getImageData(x, y, 1, 1).data, // Get pixel data for the clicked point (RGBA array).
        hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6), // Convert RGB to HEX format.
        hsl = Colour(hex).toHSLString(), // Convert HEX to HSL string using a hypothetical 'Colour' library.
        inv = Colour(hex).invert().toString(); // Get inverted color string.

    // Set text color of info paragraphs to the inverted color for readability.
    irgb.style.color = inv;
    ihex.style.color = inv;
    ihsl.style.color = inv;
    iinv.style.color = inv;

    // Update inner HTML of info paragraphs with color values and interactive input fields.
    irgb.innerHTML = 'rgb: ' + '<input type="text" id="rgb" class="rgb" style=color:' + inv + ';" onclick="this.select();" value="' + p[0] + ',' + p[1] + ',' + p[2] + '">';
    ihex.innerHTML = 'hex: ' + '<input type="text" id="hex" class="hex" style=color:' + inv + ';" onclick="this.select();" value="' + hex + '">';
    ihsl.innerHTML = 'hsl: ' + '<input type="text" id="hsl" class="hsl" style=color:' + inv + ';" onclick="this.select();" value="' + hsl + '">';
    iinv.innerHTML = 'inv: ' + '<input type="text" id="inv" class="inv" style=color:' + inv + ';" onclick="this.select();" value="' + inv + '">';

    // Update background colors of logo and info box.
    logo.style.backgroundColor = hex;
    info.style.backgroundColor = hex;
    info.style.boxShadow = 'inset 0 0 0 1px ' + inv; // Add an inset shadow with the inverted color.

    // Position the info box. If it's not already at -12px top, move it there.
    if (info.style.top !== '-12px') {
        info.style.top = '-12px';
    }

    if (dbg) {
        console.log('Canvas clicked at coordinates: ' + x + ', ' + y);
    }
}


// Converts RGB color components to a hexadecimal string.
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) {
        throw 'Componente de cor inválido'; // Error message for invalid color component.
    }
    if (dbg) {
        console.log('RGB values converted to hexadecimal.');
    }
    // Perform bitwise operations to combine R, G, B into a single integer, then convert to base 16.
    return ((r << 16) | (g << 8) | b).toString(16);
}


// Helper function to find the absolute position of an element on the page.
function findPos(obj) {
    var curleft = 0,
        curtop = 0; // Initialize current left and top offsets.

    if (obj.offsetParent) { // Check if the element has an offset parent.
        do {
            curleft += obj.offsetLeft; // Add the element's left offset.
            curtop += obj.offsetTop;   // Add the element's top offset.
        } while (obj = obj.offsetParent); // Continue up the offsetParent chain.
        return {
            x: curleft,
            y: curtop
        }; // Return the total x and y offsets.
    }
    return undefined; // Return undefined if no offsetParent is found.
}


// Handler for clicks on the arrow element, used to toggle info box position.
function arrowClick(e) {
    e.preventDefault(); // Prevent default action (e.g., scrolling if it's a link).

    // Toggle the horizontal position of the info box.
    if (info.offsetLeft > 20) {
        info.style.left = 20 + 'px'; // Move to the left side.
    } else {
        // Move to the right side, accounting for window width and info box width.
        info.style.left = (win.innerWidth - (info.offsetWidth + 20)) + 'px';
    }

    if (dbg) {
        console.log('Info box left position: ' + info.offsetLeft + 'px');
    }
}


// Another helper function to calculate an element's absolute offset.
function getOffset(el) {
    var _x = 0; // Initialize X offset.
    var _y = 0; // Initialize Y offset.
    // Loop through the element's parent chain as long as it exists and has valid offset properties.
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft; // Accumulate left offset, subtract scroll.
        _y += el.offsetTop - el.scrollTop;   // Accumulate top offset, subtract scroll.
        el = el.parentNode;                  // Move to the parent element.
    }
    return {
        top: _y,
        left: _x
    }; // Return the final calculated top and left offsets.
}