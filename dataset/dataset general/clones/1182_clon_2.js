/*******************************************************
    * jQuery module
    * Intelligent Background Image Scaling Tool
    * Crafted by A.N. Other (http://anotherdeveloper.com)
    * License: Free to use, provided original attribution remains intact
*******************************************************/

(function(jQuery) {

    // Global Configuration Object
    var bgsys = { };

    // Define the jQuery extension
    jQuery.fn.superScaler = function(settings) {

        // Assign incoming settings to the global configuration
        bgsys = settings;

        // If the image source is a single string, convert it to an array.
        // This prepares for potential future slideshow functionality.
        if (!jQuery.isArray(bgsys.pictureSource)) {
            var tempPic = bgsys.pictureSource;
            bgsys.pictureSource = [tempPic];
        }

        // Create a temporary image element to load the source and get dimensions.
        jQuery("<picture/>").attr("source", bgsys.pictureSource[0]).on("load", function() {
            bgsys.naturalWidth = this.width;
            bgsys.naturalHeight = this.height;

            // Append a unique container div to the document body.
            jQuery("body").append('<div id="bg_scale_container"></div>');

            // Insert the background image into its newly created container.
            jQuery("#bg_scale_container").html('<img src="' + bgsys.pictureSource[0] + '" width="' + bgsys.naturalWidth + '" height="' + bgsys.naturalHeight + '">');

            // Initially hide the container to prevent visual glitches during setup.
            jQuery("#bg_scale_container").css("visibility","hidden");

            // Temporarily hide body overflow to manage scrollbars during sizing.
            jQuery("body").css({
                "overflow":"hidden"
            });

            // Trigger the initial image dimension adjustment.
            adjustPictureDimensions();
        });
    };

    // Attach an event listener for window resizing.
    jQuery(window).on("resize", function() {
        adjustPictureDimensions();
    });

    // Core function to adjust background image dimensions and position
    function adjustPictureDimensions() {

        // Apply essential CSS properties to the background container.
        jQuery("#bg_scale_container").css({
            "position":"fixed",
            "top":"0px",
            "left":"0px",
            "z-index":"-1",
            "overflow":"hidden",
            "width":jQuery(window).width() + "px",
            "height":jQuery(window).height() + "px",
            "opacity" : bgsys.alphaValue
        });

        // Ensure the contained image is positioned relatively within its parent.
        jQuery("#bg_scale_container").children('img').css("position", "relative");

        // Retrieve current dimensions of the image within the container.
        var currentImgW = jQuery("#bg_scale_container").children('img').width();
        var currentImgH = jQuery("#bg_scale_container").children('img').height();

        // Determine scaling based on window aspect ratio.
        if (jQuery(window).width() > jQuery(window).height()) {
            // Window is wider than it is tall.
            if (currentImgW > currentImgH) {
                // Image is also wider than tall (landscape).
                var aspectRatio = currentImgW / currentImgH;
                jQuery("#bg_scale_container").children('img').css("width", jQuery(window).width() + "px");
                jQuery("#bg_scale_container").children('img').css("height", Math.round(jQuery(window).width() * (1 / aspectRatio)));

                var calculatedHeight = Math.round(jQuery(window).width() * (1 / aspectRatio));

                if(calculatedHeight < jQuery(window).height()) {
                    // If scaling by width makes it too short, scale by height instead.
                    var aspectRatio = currentImgH / currentImgW;
                    jQuery("#bg_scale_container").children('img').css("height", jQuery(window).height());
                    jQuery("#bg_scale_container").children('img').css("width", Math.round(jQuery(window).height() * (1 / aspectRatio)));
                }
            } else {
                // Image is taller than wide (portrait) or square.
                var aspectRatio = currentImgH / currentImgW;
                jQuery("#bg_scale_container").children('img').css("height", jQuery(window).height());
                jQuery("#bg_scale_container").children('img').css("width", Math.round(jQuery(window).height() * (1 / aspectRatio)));
            }
        } else {
            // Window is taller than it is wide, or square.
            var aspectRatio = currentImgH / currentImgW;
            jQuery("#bg_scale_container").children('img').css("height", jQuery(window).height());
            jQuery("#bg_scale_container").children('img').css("width", Math.round(jQuery(window).height() * (1 / aspectRatio)));
        }

        // Apply centering logic if enabled in settings.
        if (typeof(bgsys.centeringEnabled) === 'undefined' || bgsys.centeringEnabled) {
            if (jQuery("#bg_scale_container").children('img').width() > jQuery(window).width()) {
                var offsetX = (jQuery("#bg_scale_container").children('img').width() - jQuery(window).width()) / 2;
                jQuery("#bg_scale_container").children('img').css({
                    "top"  : 0,
                    "left" : -offsetX
                });
            }
            if (jQuery("#bg_scale_container").children('img').height() > jQuery(window).height()) {
                var offsetY = (jQuery("#bg_scale_container").children('img').height() - jQuery(window).height()) / 2;
                jQuery("#bg_scale_container").children('img').css({
                    "left" : 0,
                    "top"  : -offsetY
                });
            }
        }

        // Make the background visible after all sizing and positioning is complete.
        jQuery("#bg_scale_container").css({
            "visibility" : "visible"
        });

        // Restore body overflow to its default behavior.
        jQuery("body").css({
            "overflow":"auto"
        });

    }
})(jQuery);