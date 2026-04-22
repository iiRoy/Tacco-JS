// This module obtains the central point coordinates from a displayed graphic,
// designed to be adapted for diverse application requirements.

(function(jQ) {
    jQ(document).ready(function() {

        // Declare various variables for image and UI elements
        var initialGraphic;
        var _datasetField;
        var _cascadingStyleField;
        var _focalRegions;
        var _focalGraphics;
        var _utilityDisplay;

        // This object maintains key properties related to the image's focal point.
        var focalProps = {
            horiz: 0,
            vert: 0,
            widthVal: 0,
            heightVal: 0
        };

        // Inner function to set up the helper utility.
        (function() {

            // Initialize configuration parameters and DOM references.
            initialGraphic = '../assets/images/urban_scene.jpg';
            _datasetField = jQ('.utility-panel-data-attribute');
            _cascadingStyleField = jQ('.utility-panel-css-value');
            _utilityDisplay = jQ('img.utility-panel-display, img.overlay-target');

            // Construct grid elements for visual representation.
            for (var k = 1; k < 10; k++) {
                jQ('#DisplayAreas').append('<section id="Area' + k + '" class="focalpoint-box"><picture/></section>');
            }
            // Cache references to the container elements and their child images.
            _focalRegions = jQ('.focalpoint-box');
            _focalGraphics = jQ('.focalpoint-box picture');

            // Load the default image into the system.
            loadPicture(initialGraphic);

        })();

        // -------------------------------------------------------------

        // Function: loadPicture(graphicSource)
        // Assigns a new image for the demonstration, requiring its URI.

        // -------------------------------------------------------------

        function loadPicture(graphicSource) {
            // Temporarily create an image element to ascertain its dimensions once loaded.
            jQ("<img/>")
                .attr("src", graphicSource)
                .on('load', function() { // Use .on('load') for consistency
                    focalProps.widthVal = this.naturalWidth; // Using naturalWidth/Height for original dimensions
                    focalProps.heightVal = this.naturalHeight;

                    // Update the source of the thumbnail within the graphical user interface.
                    _utilityDisplay.attr('src', graphicSource);

                    // Apply the new image source to all focal point graphic elements.
                    _focalGraphics.attr('src', graphicSource);

                    // Configure the initial state of the focal point container elements.

                    // -------------------------------------------------------------
                    // Developer Note:
                    // Setting these properties directly via 'attr' is primarily for visual
                    // inspection in the DOM. The core functionality relies on jQuery's .data()
                    // method, as demonstrated in subsequent assignments.
                    // -------------------------------------------------------------
                    _focalRegions.attr({
                        'data-focal-x': focalProps.horiz,
                        'data-focal-y': focalProps.vert,
                        'data-picture-w': focalProps.widthVal,
                        'data-picture-h': focalProps.heightVal
                    });

                    // -------------------------------------------------------------
                    // These .data() assignments are critical for the plugin's operation.
                    // -------------------------------------------------------------
                    _focalRegions.data('focalX', focalProps.horiz);
                    _focalRegions.data('focalY', focalProps.vert);
                    _focalRegions.data('pictureW', focalProps.widthVal);
                    _focalRegions.data('pictureH', focalProps.heightVal);

                    // Execute the focal point plugin for the first time with the new image.
                    jQ('.focalpoint-box').adjustFocalPoint(); // Renamed plugin function

                    // Refresh the displayed data attributes for the user.
                    outputDatasetValues();

                });
        }

        // -------------------------------------------------------------

        // Routine to update and display the current data attributes to the user.

        // -------------------------------------------------------------

        function outputDatasetValues() {
            _datasetField.val('data-focal-x="' + focalProps.horiz.toFixed(2) + '" data-focal-y="' + focalProps.vert.toFixed(2) + '" data-picture-w="' + focalProps.widthVal + '" data-picture-h="' + focalProps.heightVal + '"');
        }

        // -------------------------------------------------------------

        // Event binding for clicks on the utility image.
        // This calculates and applies new focal point and CSS3 properties based on click position.

        // -------------------------------------------------------------

        _utilityDisplay.on('click', function(evt) {

            var picWidth = jQ(this).width();
            var picHeight = jQ(this).height();

            // Compute the new focal point coordinates relative to the image.
            var offsetHoriz = evt.pageX - jQ(this).offset().left;
            var offsetVert = evt.pageY - jQ(this).offset().top;
            var newFocalX = (offsetHoriz / picWidth - .5) * 2;
            var newFocalY = (offsetVert / picHeight - .5) * -2;
            focalProps.horiz = newFocalX;
            focalProps.vert = newFocalY;

            // Transcribe the updated values into the input field.
            outputDatasetValues();

            // Trigger an update to all focal point elements.
            refreshFocalSpot();

            // Determine background-position percentages for CSS.
            var percentHoriz = (offsetHoriz / picWidth) * 100;
            var percentVert = (offsetVert / picHeight) * 100;
            var bgPositionString = percentHoriz.toFixed(0) + '% ' + percentVert.toFixed(0) + '%';
            var bgStyleDeclaration = 'background-position: ' + bgPositionString + ';';
            _cascadingStyleField.val(bgStyleDeclaration);

            // Position a visual crosshair marker at the calculated focal point.
            jQ('.crosshair').css({
                'top': percentVert + '%',
                'left': percentHoriz + '%'
            });
        });

        // -------------------------------------------------------------

        // Handle image source changes via paste or blur events.
        // When a new image URI is provided, it will be used for the demonstration.

        // -------------------------------------------------------------

        jQ('input.utility-control-source').on('paste blur', function(evt) {
            var inputElement = this;
            setTimeout(function() {
                var currentText = jQ(inputElement).val();
                loadPicture(currentText);
            }, 100);
        });

        // -------------------------------------------------------------

        // Function: refreshFocalSpot()
        // This routine is responsible for updating the visual focal point.

        // -------------------------------------------------------------

        function refreshFocalSpot() {
            // -------------------------------------------------------------
            // Reminder:
            // Direct 'attr' modifications are mostly for debugging / inspection purposes.
            // They are not essential for the plugin's internal mechanics.
            // -------------------------------------------------------------
            _focalRegions.attr({
                'data-focal-x': focalProps.horiz,
                'data-focal-y': focalProps.vert
            });
            // -------------------------------------------------------------
            // These .data() updates are absolutely necessary for functionality.
            // -------------------------------------------------------------
            _focalRegions.data('focalX', focalProps.horiz);
            _focalRegions.data('focalY', focalProps.vert);
            _focalRegions.adjustFocalPoint(); // Renamed plugin method
        };
    });
}(jQuery));