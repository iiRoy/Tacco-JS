'use strict';

YUI.add('crop-box', function (Y) { // Start of the YUI module definition

  // Define the cropbox component using Y.Base.create for object-oriented structure
  Y.cropbox = Y.Base.create('crop-box', Y.Base, [],
    {
      // The initializer method, called when a new instance of cropbox is created
      initializer: function (options)
      {
        this.options = options; // Store the passed options for later use
        this.state = {};       // Initialize an empty object to hold internal state variables
        this.render();         // Call the render method to set up the initial UI
      }
      , // Comma separating initializer from render method

      // The render method is responsible for setting up DOM references
      render: function ()
      {
        var self = this; // Cache 'this' for use in event handlers and nested functions
        this.imageBox = Y.one(this.options.imageBox); // Get the main image container element
        this.thumbBox = this.imageBox.one(this.options.thumbBox); // Get the thumbnail display area element
        this.spinner = this.imageBox.one(this.options.spinner);   // Get the loading spinner element

        this.initObject(); // Proceed with further object initialization steps
        return this;       // Return 'this' to allow for method chaining
      }
      , // Comma separating render from initObject method

      // Initializes the image object and sets up its onload handler
      initObject: function()
      {
        var self = this; // Another reference to 'this' for the image onload callback
        this.spinner.show(); // Display the spinner while the image is loading

        this.image = new Image(); // Create a new HTML Image object
        this.image.onload = function() {
          self.spinner.hide(); // Hide the spinner once the image has finished loading
          self.setBackground(); // Set the background image based on the loaded image

          // Attach event listeners for user interaction on the imageBox
          self.imageBox.on('mousedown', self.imgMouseDown, self); // Handle mouse down for dragging
          self.imageBox.on('mousemove', self.imgMouseMove, self); // Handle mouse move for dragging
          // Attach a global mouseup listener to the body to stop dragging
          self.mouseup = Y.one('body').on('mouseup', self.imgMouseUp, self);

          // Check for browser-specific mouse wheel events for zooming
          Y.UA.gecko > 0 ?
            self.imageBox.on('DOMMouseScroll', self.zoomImage, self) : // Firefox-specific event
            self.imageBox.on('mousewheel', self.zoomImage, self);       // Webkit/IE-specific event
        };
        this.image.src = this.options.imgSrc; // Set the image source, which triggers the onload event
      }
      , // Comma separating initObject from setBackground method

      // Sets the background image style for the imageBox based on current zoom ratio
      setBackground: function()
      {
        // Initialize ratio to 1 if it hasn't been set yet
        if (!this.ratio) this.ratio = 1;

        // Calculate the scaled width and height of the image
        var w =  parseInt(this.image.width) * this.ratio;
        var h =  parseInt(this.image.height) * this.ratio;

        // Calculate padding to center the image within its box
        var pw = (this.imageBox.get('clientWidth') - w) / 2;
        var ph = (this.imageBox.get('clientHeight') - h) / 2;

        // Apply the calculated styles to the imageBox using setAttribute
        this.imageBox.setAttribute('style',
          'background-image: url(' + this.image.src + '); ' +
          'background-size: ' + w +'px ' + h + 'px; ' +
          'background-position: ' + pw + 'px ' + ph + 'px; ' +
          'background-repeat: no-repeat');
      }
      , // Comma separating setBackground from imgMouseDown method

      // Event handler for mouse down on the image box
      imgMouseDown: function(e)
      {
        e.stopImmediatePropagation(); // Stop the event from propagating further
        this.state.dragable = true;   // Set the drag state to true
        this.state.mouseX = e.clientX; // Record the initial mouse X position
        this.state.mouseY = e.clientY; // Record the initial mouse Y position
      }
      , // Comma separating imgMouseDown from imgMouseMove method

      // Event handler for mouse move on the image box (when dragging)
      imgMouseMove: function(e)
      {
        e.stopImmediatePropagation(); // Stop the event from propagating further
        if (this.state.dragable) // Only proceed if dragging is enabled
        {
          var x = e.clientX - this.state.mouseX; // Calculate the horizontal movement
          var y = e.clientY - this.state.mouseY; // Calculate the vertical movement

          // Get the current background position style and parse its values
          var bg = this.imageBox.getStyle('backgroundPosition').split(' ');

          var bgX = x + parseInt(bg[0]); // Calculate the new background X position
          var bgY = y + parseInt(bg[1]); // Calculate the new background Y position

          // Apply the new background position to the imageBox
          this.imageBox.setStyle('backgroundPosition', bgX +'px ' + bgY + 'px');

          this.state.mouseX = e.clientX; // Update mouse X for the next movement calculation
          this.state.mouseY = e.clientY; // Update mouse Y for the next movement calculation
        }
      }
      , // Comma separating imgMouseMove from imgMouseUp method

      // Event handler for mouse up (stops dragging)
      imgMouseUp: function(e)
      {
        e.stopImmediatePropagation(); // Stop the event from propagating further
        this.state.dragable = false;  // Set the drag state to false, ending the drag operation
      }
      , // Comma separating imgMouseUp from zoomImage method

      // Zooms the image in or out based on the mouse wheel delta
      zoomImage: function(e)
      {
        // Adjust the zoom ratio based on the wheel direction (positive for zoom in, negative for zoom out)
        e.wheelDelta > 0 ? this.ratio *= 1.1 : this.ratio *= 0.9;
        this.setBackground(); // Re-render the background with the new zoom ratio
      }
      , // Comma separating zoomImage from getDataURL method

      // Retrieves the cropped image as a Data URL string
      getDataURL: function ()
      {
        var self = this,
          width = this.thumbBox.get('clientWidth'),    // Get the target width for the cropped image
          height = this.thumbBox.get('clientHeight'),  // Get the target height for the cropped image
          canvas = document.createElement("canvas"),   // Create an off-screen canvas element
          dim = this.imageBox.getStyle('backgroundPosition').split(' '), // Current background position
          size = this.imageBox.getStyle('backgroundSize').split(' '),   // Current background size
          // Calculate the source rectangle (dx, dy, dw, dh) for drawing on the canvas
          dx = parseInt(dim[0]) - this.imageBox.get('clientWidth') / 2 + width / 2,
          dy = parseInt(dim[1]) - this.imageBox.get('clientHeight') / 2 + height / 2,
          dw = parseInt(size[0]), // Scaled width of the image
          dh = parseInt(size[1]), // Scaled height of the image
          sh = parseInt(this.image.height), // Original height of the image
          sw = parseInt(this.image.width);  // Original width of the image

        canvas.width = width;  // Set the canvas width to the target cropped width
        canvas.height = height; // Set the canvas height to the target cropped height
        var context = canvas.getContext("2d"); // Get the 2D rendering context of the canvas
        // Draw the image onto the canvas, performing the cropping and scaling
        context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
        var imageData = canvas.toDataURL('image/png'); // Get the image data as a PNG Data URL

        return imageData; // Return the generated Data URL
      }
      , // Comma separating getDataURL from getBlob method

      // Retrieves the cropped image as a Blob object
      getBlob: function()
      {
        var imageData = this.getDataURL(); // First, get the image data as a Data URL
        // Remove the data URI header to get just the base64 string
        var b64 = imageData.replace('data:image/png;base64,','');
        var binary = atob(b64); // Decode the base64 string into a binary string
        var array = []; // Initialize an array to store byte values
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i)); // Convert each character to its ASCII code (byte value)
        }
        // Create and return a new Blob object with the image data and specified MIME type
        return new Blob([new Uint8Array(array)], {type: 'image/png'});
      }
      , // Comma separating getBlob from zoomIn method

      // Zooms the image in by increasing the ratio
      zoomIn: function ()
      {
        this.ratio *= 1.1; // Increase the zoom ratio by 10%
        this.setBackground(); // Update the background image with the new ratio
      }
      , // Comma separating zoomIn from zoomOut method

      // Zooms the image out by decreasing the ratio
      zoomOut: function ()
      {
        this.ratio *= 0.9; // Decrease the zoom ratio by 10%
        this.setBackground(); // Update the background image with the new ratio
      }
      , // Comma separating zoomOut from destructor method

      // The destructor method for cleaning up resources when the component is destroyed
      destructor: function ()
      {
        // If the mouseup event listener was attached, detach it to prevent memory leaks
        if (this.mouseup) this.mouseup.detach();
      }
    });
}, '1.0', // Version number for the YUI module
{
  requires: [ 'node', 'base' ] // Specify required YUI modules: 'node' for DOM manipulation, 'base' for Y.Base
}); // End of YUI.add call