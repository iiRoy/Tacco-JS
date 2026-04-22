jQuery (function ($) {
  // Main jQuery document ready function.
  // This ensures the script runs after the DOM is fully loaded.

  var  thumb = $('.form-row.file .thumbnail, .form-row.field-file .thumbnail');

  // Check if any thumbnail elements were found on the page.
  if  (thumb.length)   {

    // Initialize variables for focal point functionality.
    var focalPoint = $('<span class="focal-point" />');
    var    img = $('img', thumb)  ;
    var imgW = img.attr('width'); // Get the width of the image.
    var imgH = img.attr('height'); // Get the height of the image.

    // Create a container for the focal point.
    var container = $('<span class="focal-point-container" />');
    container.append(focalPoint); // Place the focal point inside its container.
    thumb.append(container); // Add the container to the thumbnail element.

    var focalPointW = focalPoint.outerWidth();
    var focalPointH = focalPoint.outerHeight();

    // Input fields to store focal point coordinates.
    var inputX = $('#id_focal_x');
    var inputY = $('#id_focal_y');

    // Default focal point coordinates (center of the image).
    var defaultX = .5;
    var defaultY = .5;

    // Adjust container size and position based on focal point dimensions.
    container.width(imgW + focalPointW);
    container.height(imgH + focalPointH);
    container.css('left', -focalPointW / 2);
    container.css('top', -focalPointH / 2);

    // Define a function to set the focal point's position.
    focalPoint.setPosition = function (x, y) {
      $(this).css('left', x * imgW); // Set left CSS property.
      $(this).css('top', y * imgH); // Set top CSS property.
    };

    // Define a function to get the focal point's position.
    focalPoint.getPosition = function (decimals) {
      var x = focalPoint.position().left / imgW;
      var y = focalPoint.position().top / imgH;

      // Ensure coordinates are within bounds [0, 1].
      x = Math.min(1, Math.max(0, x));
      y = Math.min(1, Math.max(0, y));

      if (decimals) {
        // Round coordinates to a specified number of decimals.
        var r = Math.pow(10, decimals);
        x = Math.round(x * r) / r;
        y = Math.round(y * r) / r;
      }
      return {x: x, y: y};
    };

    // Define a function to synchronize focal point position with input fields.
    focalPoint.setPositionToInput = function () {
      var x = inputX.val().replace(/[^0-9\.]/g, ''); // Clean input value.
      var y = inputY.val().replace(/[^0-9\.]/g, ''); // Clean input value.

      var emptyX = x == '';
      var emptyY = y == '';

      // Use default values if input fields are empty, otherwise parse them.
      if (emptyX) x = defaultX; else x = parseFloat(x);
      if (emptyY) y = defaultY; else y = parseFloat(y);

      // Clamp values between 0 and 1.
      x = Math.min(1, Math.max(0, x));
      y = Math.min(1, Math.max(0, y));

      // Update input fields if they weren't empty initially.
      if (!emptyX) inputX.val(x);
      if (!emptyY) inputY.val(y);

      // Apply the calculated position to the focal point element.
      focalPoint.setPosition(x, y);
    };

    // Make the focal point draggable within its parent container.
    focalPoint.draggable({
      containment: 'parent', // Restrict dragging to the parent element.
      drag: function () {
        // Update input fields during dragging.
        pos = focalPoint.getPosition(3); // Get position with 3 decimal places.
        inputX.val(pos.x);
        inputY.val(pos.y);
      }
    });

    // Attach change event handlers to input fields.
    inputX.change(focalPoint.setPositionToInput);
    inputY.change(focalPoint.setPositionToInput);

    // Set initial position based on input values or defaults.
    focalPoint.setPositionToInput();

    // Handle visibility when the fieldset is collapsed.
    var fieldset = inputX.closest('fieldset');
    if (fieldset.hasClass('collapsed')) {
      focalPoint.hide(); // Hide focal point if fieldset is collapsed.
    }

    // Toggle focal point visibility when collapse toggle is clicked.
    fieldset.find('.collapse-toggle').click(function () {
      focalPoint.toggle(); // Show/hide the focal point.
    });

  }

});