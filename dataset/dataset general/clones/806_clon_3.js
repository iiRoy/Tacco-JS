const main_window = window;
const html_document = main_window.document;

// Core application elements
let loaded_image_element = new Image(); // Element to load images into
let image_display_container = html_document.querySelector('.elementsHolder'); // Wrapper for canvas and image
let drawing_canvas = html_document.querySelector('.theCanvas'); // The HTML5 canvas element
let canvas_rendering_context = drawing_canvas.getContext('2d'); // 2D rendering context for canvas

// Information display elements
let color_info_panel = html_document.querySelector('.info'); // Panel displaying color details
let info_toggle_button = html_document.querySelector('.move'); // Button to reposition info panel
let hex_code_display = html_document.querySelector('.hex'); // Paragraph for hexadecimal color
let rgb_code_display = html_document.querySelector('.rgb'); // Paragraph for RGB color
let hsl_code_display = html_document.querySelector('.hsl'); // Paragraph for HSL color
let inverted_color_display = html_document.querySelector('.inv'); // Paragraph for inverted color

// UI guidance and branding
let drop_guidance_overlay = html_document.querySelector('div.drop'); // Text guiding user to drop files
let application_brand_logo = html_document.querySelector('.logo'); // Application's branding logo

// --- Utility Functions and Helper Objects ---

/**
 * A simple utility for basic color operations.
 * In a real app, this would be a robust library.
 */
const ColorUtility = {
  /**
   * Converts RGB components to a hexadecimal string.
   * @param {number} r - Red component (0-255).
   * @param {number} g - Green component (0-255).
   * @param {number} b - Blue component (0-255).
   * @returns {string} Hexadecimal color string.
   * @throws {Error} If color components are out of range.
   */
  rgbToHexadecimal: (r, g, b) => {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('Invalid color component provided; values must be between 0 and 255.');
    }
    // Pad with leading zeros if necessary
    const toHex = (c) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  /**
   * Placeholder for converting a hex color to HSL.
   * In a real implementation, this would involve complex color space conversion.
   * For this clone, we'll return a simplified representation.
   * @param {string} hex - Hexadecimal color string (e.g., "#RRGGBB").
   * @returns {string} HSL color string.
   */
  hexToHslString: (hex) => {
    // This is a simplified placeholder. Actual HSL conversion is more involved.
    // For Type III, we acknowledge the original's use of a 'Colour' lib and simulate.
    return `hsl(0, 0%, 50%)`; // Placeholder value
  },

  /**
   * Inverts a given hexadecimal color string.
   * This is a basic inversion (subtracting from 255 for each component).
   * @param {string} hex - Hexadecimal color string (e.g., "#RRGGBB").
   * @returns {string} Inverted hexadecimal color string.
   */
  invertHexColor: (hex) => {
    if (!hex || hex.length !== 7 || hex[0] !== '#') {
      return '#000000'; // Default to black for invalid input
    }
    const r = 255 - parseInt(hex.substring(1, 3), 16);
    const g = 255 - parseInt(hex.substring(3, 5), 16);
    const b = 255 - parseInt(hex.substring(5, 7), 16);
    return ColorUtility.rgbToHexadecimal(r, g, b);
  }
};

/**
 * Calculates the absolute position of an HTML element on the page.
 * @param {HTMLElement} element - The HTML element to calculate position for.
 * @returns {{x: number, y: number}|null} An object with x and y coordinates, or null if element is not found.
 */
function getElementPageOffset(element) {
  if (!element || !element.offsetParent) {
    return null;
  }
  let currentLeft = 0;
  let currentTop = 0;
  let currentElement = element;
  do {
    currentLeft += currentElement.offsetLeft;
    currentTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent;
  } while (currentElement);
  return { x: currentLeft, y: currentTop };
}

// --- Event Handlers ---

/**
 * Initializes the application by setting up main event listeners.
 */
function setupCoreListeners() {
  html_document.addEventListener('dragenter', handleDragEnterEvent, false);
  html_document.addEventListener('dragover', handleDragOverEvent, false);
  html_document.addEventListener('drop', handleFileDropEvent, false);
  image_display_container.addEventListener('click', handleImageContainerClick, false);
  info_toggle_button.addEventListener('click', handleInfoPanelToggle, false);
}

/**
 * Handles the 'load' event for the image element.
 * Adjusts canvas and container dimensions and positioning based on the loaded image.
 */
loaded_image_element.addEventListener('load', function() {
  drawing_canvas.width = loaded_image_element.width;
  drawing_canvas.height = loaded_image_element.height;

  image_display_container.style.width = `${loaded_image_element.width}px`;
  image_display_container.style.height = `${loaded_image_element.height}px`;

  // Center the image display if it fits within the window, otherwise align top-left
  if (loaded_image_element.width <= main_window.innerWidth) {
    Object.assign(image_display_container.style, {
      position: 'absolute', // Ensure absolute positioning for transform centering
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // Modern centering technique
      boxShadow: '0 0 20px 10px rgba(102, 102, 102, 0.7)'
    });
  } else {
    // Reset positioning if image is too wide
    Object.assign(image_display_container.style, {
      position: 'relative', // Revert to relative or static for large images
      top: '0',
      left: '0',
      transform: 'none',
      boxShadow: 'none'
    });
  }

  image_display_container.style.opacity = '1'; // Make container visible
  canvas_rendering_context.drawImage(loaded_image_element, 0, 0); // Draw image on canvas
  main_window.scrollTo(0, 0); // Scroll to top-left of the page
});

/**
 * Prevents default drag behavior when an item enters the document.
 * @param {DragEvent} eventDetails - The drag event object.
 */
function handleDragEnterEvent(eventDetails) {
  eventDetails.stopPropagation();
  eventDetails.preventDefault();
}

/**
 * Provides visual feedback during a drag operation.
 * @param {DragEvent} eventDetails - The drag event object.
 */
function handleDragOverEvent(eventDetails) {
  eventDetails.stopPropagation();
  eventDetails.preventDefault();
  image_display_container.style.opacity = '0.3'; // Dim the container to indicate drop zone
}

/**
 * Handles the file drop event, processing the dropped image file.
 * @param {DragEvent} eventDetails - The drag event object.
 */
function handleFileDropEvent(eventDetails) {
  eventDetails.stopPropagation();
  eventDetails.preventDefault();

  const droppedFiles = eventDetails.dataTransfer.files;
  if (droppedFiles.length > 0) {
    const firstFile = droppedFiles[0];

    // Validate file type
    if (!firstFile.type.startsWith('image/')) {
      alert('Please drop an image file (e.g., JPG, PNG, GIF).');
      image_display_container.style.opacity = '1'; // Reset opacity
      return;
    }

    // Use FileReader to read the image
    if (typeof FileReader !== 'undefined') {
      const fileReaderInstance = new FileReader();
      fileReaderInstance.onload = (readerEvent) => {
        loaded_image_element.src = readerEvent.target.result;
      };
      fileReaderInstance.onerror = (errorEvent) => {
        console.error('Error reading file:', errorEvent);
        alert('Failed to read image file.');
      };
      fileReaderInstance.readAsDataURL(firstFile);
    } else {
      alert('Your browser does not support the FileReader API.');
    }
  }

  // Reset container styles after drop
  Object.assign(image_display_container.style, {
    border: '1px solid #333',
    borderRadius: '0',
    boxShadow: 'none',
    opacity: '1' // Ensure full opacity after drop
  });
  drop_guidance_overlay.style.display = 'none'; // Hide the guidance text
}

/**
 * Handles clicks on the image display container to pick a color.
 * @param {MouseEvent} eventDetails - The mouse event object.
 */
function handleImageContainerClick(eventDetails) {
  const containerOffset = getElementPageOffset(this);
  if (!containerOffset) {
    console.error('Could not determine offset for image container.');
    return;
  }

  const clickX = eventDetails.pageX - containerOffset.x;
  const clickY = eventDetails.pageY - containerOffset.y;

  // Get pixel data from canvas
  let pixelData;
  try {
    pixelData = canvas_rendering_context.getImageData(clickX, clickY, 1, 1).data;
  } catch (error) {
    console.error('Error getting image data:', error);
    alert('Cannot pick color from image (likely due to cross-origin restrictions).');
    return;
  }

  const red = pixelData[0];
  const green = pixelData[1];
  const blue = pixelData[2];

  let currentHexColor, currentHslColor, invertedHexColor;

  try {
    currentHexColor = ColorUtility.rgbToHexadecimal(red, green, blue);
    currentHslColor = ColorUtility.hexToHslString(currentHexColor);
    invertedHexColor = ColorUtility.invertHexColor(currentHexColor);
  } catch (error) {
    console.error('Color conversion error:', error);
    alert('Failed to convert color data.');
    return;
  }

  // Apply inverted color to input text for readability
  rgb_code_display.style.color = invertedHexColor;
  hex_code_display.style.color = invertedHexColor;
  hsl_code_display.style.color = invertedHexColor;
  inverted_color_display.style.color = invertedHexColor;

  // Update info panel content with color values
  const inputStyle = `style="color:${invertedHexColor};"`;
  const onClickSelect = `onclick="this.select();"`;

  rgb_code_display.innerHTML = `RGB: <input type="text" id="rgbValue" class="color-input" ${inputStyle} ${onClickSelect} value="${red}, ${green}, ${blue}">`;
  hex_code_display.innerHTML = `HEX: <input type="text" id="hexValue" class="color-input" ${inputStyle} ${onClickSelect} value="${currentHexColor}">`;
  hsl_code_display.innerHTML = `HSL: <input type="text" id="hslValue" class="color-input" ${inputStyle} ${onClickSelect} value="${currentHslColor}">`;
  inverted_color_display.innerHTML = `INV: <input type="text" id="invValue" class="color-input" ${inputStyle} ${onClickSelect} value="${invertedHexColor}">`;

  // Update UI element background colors
  application_brand_logo.style.backgroundColor = currentHexColor;
  color_info_panel.style.backgroundColor = currentHexColor;
  color_info_panel.style.boxShadow = `inset 0 0 0 1px ${invertedHexColor}`;

  // Ensure the info panel is visible and positioned correctly
  if (color_info_panel.style.top !== '-12px') {
    color_info_panel.style.top = '-12px'; // Adjust as per original logic
  }
}

/**
 * Toggles the horizontal position of the color information panel.
 * @param {MouseEvent} eventDetails - The mouse event object.
 */
function handleInfoPanelToggle(eventDetails) {
  eventDetails.preventDefault();

  const panelWidth = color_info_panel.offsetWidth;
  const windowWidth = main_window.innerWidth;
  const currentLeft = color_info_panel.offsetLeft;

  const padding = 20; // Consistent padding

  if (currentLeft > padding) {
    // If currently on the right, move to left
    color_info_panel.style.left = `${padding}px`;
  } else {
    // If currently on the left, move to right
    color_info_panel.style.left = `${windowWidth - panelWidth - padding}px`;
  }
}

// Attach the main initialization function to the DOMContentLoaded event
html_document.addEventListener('DOMContentLoaded', setupCoreListeners, false);