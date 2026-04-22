jQuery(function() {
    /*
     * This module orchestrates the interactive manipulation of a 3D perspective display.
     * It initiates rotation values from designated HTML form inputs and dynamically updates
     * these transformations based on user interactions with range sliders and pointer events
     * (mouse movements or touch gestures).
     */

    // Define a constant object to encapsulate the current angular orientation components.
    // These values represent rotations around the X, Y, and Z axes, respectively,
    // and are initially populated from input elements found within the document.
    const currentOrientation = {};

    // Retrieve the initial rotational value for the X-axis.
    // If the corresponding input field is empty or provides no value, it defaults to 0 degrees.
    currentOrientation.xRotation = jQuery("input[name=x_axis]").val() || 0;

    // Retrieve the initial rotational value for the Y-axis.
    // Defaults to 0 degrees if the input is not explicitly set.
    currentOrientation.yRotation = jQuery("input[name=y_axis]").val() || 0;

    // Retrieve the initial rotational value for the Z-axis.
    // Defaults to 0 degrees if the input is not explicitly set.
    currentOrientation.zRotation = jQuery("input[name=z_axis]").val() || 0;


    // Apply the initial computed rotation values to the visual element targeted by the '.perspective' class.
    // This block constructs CSS transform strings for various browser engines.
    jQuery(".perspective").css(
        {
            // WebKit-specific transform property, ensuring compatibility with browsers like Chrome and Safari.
            "-webkit-transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
            // Mozilla-specific transform property, for Firefox compatibility.
            "-moz-transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
            // Standard CSS transform property, for modern browser support.
            "transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)"
        }
    );


    // Establish an event listener that activates upon changes to any HTML input element
    // designated as a 'range' type. This allows users to manually adjust rotation angles.
    jQuery("input[type=range]").on("change", function() {
        // Obtain the 'name' attribute from the specific range input that initiated this event.
        // This attribute helps identify which rotational axis (X, Y, or Z) needs updating.
        const axisIdentifier = jQuery(this).attr("name");
        // Capture the new numerical value provided by the range slider.
        const newAxisValue = jQuery(this).val();

        // Update the corresponding rotational component within the 'currentOrientation' object.
        // The update is conditional based on the 'name' attribute of the changed input.
        if (axisIdentifier === "x_axis") {
            currentOrientation.xRotation = newAxisValue;
        }
        else if (axisIdentifier === "y_axis") {
            currentOrientation.yRotation = newAxisValue;
        }
        else if (axisIdentifier === "z_axis") {
            currentOrientation.zRotation = newAxisValue;
        }

        // Following the update of rotation values, re-apply the full set of CSS transforms.
        // This action renders the visual element with its newly adjusted orientation.
        jQuery(".perspective").css(
            {
                "-webkit-transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
                "-moz-transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
                "transform": "rotateX(" + currentOrientation.xRotation + "deg) rotateY(" + currentOrientation.yRotation + "deg) rotateZ(" + currentOrientation.zRotation + "deg)"
            }
        );

    });


    // Declare two numerical constants that are present in the script's scope
    // but are not actively used in any calculations or logic within this current implementation.
    const unusedFactor = 1e-2; // Represents a small decimal value (0.01).
    const fixedOffset = 10.0;   // Represents the integer 10 as a floating-point number.


    // Attach comprehensive event listeners to the document's <body> element for
    // both 'mousemove' and 'touchstart' events. This enables an interactive 3D effect
    // where the display element rotates in response to the user's pointer movement.
    jQuery("body").on("mousemove touchstart", function(interactionEvent) {
        // Determine the horizontal center point of the entire document viewport.
        const pageMidX = jQuery(document).width() / 2.0;
        // Determine the vertical center point of the entire document viewport.
        const pageMidY = jQuery(document).height() / 2.0;

        // Extract the current X-coordinate of the user's pointer.
        // This logic gracefully handles both mouse events (pageX) and touch events (touches[0].pageX).
        const currentPointerX = interactionEvent.pageX || (interactionEvent.originalEvent.touches && interactionEvent.originalEvent.touches[0].pageX);
        // Extract the current Y-coordinate of the user's pointer,
        // similarly handling both mouse and touch input.
        const currentPointerY = interactionEvent.pageY || (interactionEvent.originalEvent.touches && interactionEvent.originalEvent.touches[0].pageY);

        // Calculate a dynamic X-axis rotation angle. This calculation is proportional to
        // the vertical distance of the pointer from the page's center, scaled by 55 degrees.
        const computedRotX = ((pageMidY - currentPointerY) / pageMidY) * 55;
        // Calculate a dynamic Y-axis rotation angle. This calculation is proportional to
        // the horizontal distance of the pointer from the page's center, scaled by -50 degrees.
        const computedRotY = ((pageMidX - currentPointerX) / pageMidX) * (-50);

        // Apply the newly computed dynamic X and Y rotations.
        // The Z-axis rotation remains fixed at its last value from the range slider input.
        jQuery(".perspective").css(
            {
                "-webkit-transform": "rotateX(" + computedRotX + "deg) rotateY(" + computedRotY + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
                "-moz-transform": "rotateX(" + computedRotX + "deg) rotateY(" + computedRotY + "deg) rotateZ(" + currentOrientation.zRotation + "deg)",
                "transform": "rotateX(" + computedRotX + "deg) rotateY(" + computedRotY + "deg) rotateZ(" + currentOrientation.zRotation + "deg)"
            }
        );
    });
});