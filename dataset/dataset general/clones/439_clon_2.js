/*
 *  ========================================================================
 *  Application's Core Variables and Initial Environment Checks
 *  ========================================================================
 */

/*
 *  This segment checks for the availability of the HTML5 canvas element,
 *  which is essential for the graphical operations within this program.
 */
if  (   FeatureDetector.canvas  )   {
    var renderSurface = document.createElement('canvas')  ;
    var drawingContext = renderSurface.getContext (  '2d'  ) ;
}

/**
 *  Modern web browsers provide a 'download' attribute for HTML anchor elements.
 *  This attribute allows web developers to suggest or force a file download
 *  when a user clicks on a link, rather than merely navigating to the resource.
 *
 *  For further details, consult the WHATWG specification:
 *  http://developers.whatwg.org/links.html#downloading-resources
 *  Related discussion: https://github.com/andrewckor/Noise-texture-generator/issues/1
 *
 *  In scenarios where this feature is not supported by the browser,
 *  a fallback mechanism will be employed to handle file saving.
 */
var hasDownloadAttribute = ( 'download' in document.createElement('a') ) ;


/*
 *  Verification of local storage support. This capability is used to persist
 *  user preferences and application state, thereby improving the user experience
 *  and maintaining data across browsing sessions.
 */
var isPersistentStorageAvailable = FeatureDetector.localstorage;


/*
 *  ========================================================================
 *  Primary Routine for Generating the Visual Noise Pattern
 *  ========================================================================
 */
var synthesizePattern = function ( alphaLevel , pixelDensity ) {

    // If the canvas API is not available, the pattern generation cannot proceed.
    if  ( ! FeatureDetector.canvas  )   {
        return false ;
    }

    var coordX, coordY, // Iterators for the X and Y coordinates on the canvas.
        redComp, greenComp, blueComp; // Placeholder variables for color components (currently unused).

    var currentAlpha = alphaLevel; // Assign the input alpha value to a local variable.
    var currentDensity = Math.floor( pixelDensity ) || 1 ; // Ensure density is an integer, defaulting to 1.

    // Set the dimensions of the rendering surface based on values from user input fields.
    renderSurface.width = parseInt( $( '.width-input-field' ).val() ) ;
    renderSurface.height = parseInt( $( '.height-input-field' ).val() ) ;

    /*
     *  The following code block is commented out and serves as an example
     *  for filling the entire canvas with a solid background color.
     *  It is not active in the current noise generation algorithm.
     *
     *  drawingContext.fillStyle = '#' + $( '.color-selection-field' ).val() ;
     *  drawingContext.fillRect( 0, 0, renderSurface.width, renderSurface.height ) ;
     */

    // Loop through the canvas area, applying noise pixels at specified intervals.
    for ( coordX = 0; coordX < renderSurface.width; coordX += currentDensity ) {
        for ( coordY = 0; coordY < renderSurface.height; coordY += currentDensity ) {

            // Generate a random integer between 0 and 255 for grayscale intensity.
            var randomValue = Math.floor( Math.random() * 256 ) ;
            // Set the fill style using RGBA, where R, G, B are identical for grayscale,
            // and A is the provided alpha transparency level.
            drawingContext.fillStyle = 'rgba(' + randomValue + ',' + randomValue + ',' + randomValue + ',' + currentAlpha + ')' ;
            // Draw a single 1x1 pixel at the current coordinates.
            drawingContext.fillRect( coordX, coordY, 1, 1 ) ;

        }
    }

    // Update the visual background of the designated output area.
    // The canvas content is converted to a PNG Data URL and set as a repeating background image.
    $( '.output-display-area' ).css( 'background','url(' + renderSurface.toDataURL( 'image/png' ) + ') center center repeat #' + $( '.color-selection-field' ).val() ) ;

    // If the function for finalizing and rendering the image is available, invoke it.
    if ( typeof renderFinalImage === 'function' ) {
        renderFinalImage();
    }
};


/*
 *  ========================================================================
 *  jQuery Extension for Styling Custom Checkbox Inputs
 *  ========================================================================
 */

$.fn.activateCustomToggle = function() {

    var inputElements = this; // Store a reference to the collection of selected elements.

    inputElements.each( function() {
        /* Optimize performance by caching the current jQuery object. */
        var $currentElement = $( this ) ;

        /* Enclose the native checkbox element within a new span tag. */
        $currentElement.wrap( '<span>' ) ;

        /* Retrieve a reference to the newly created parent span, which serves as the visual toggle container. */
        var styledToggle = $currentElement.parent() ;

        /* Apply a custom class and specific inline styles to the toggle container. */
        styledToggle.addClass( 'custom-toggle-box' ).css( { 'position' : 'relative', 'overflow' : 'hidden' } ) ;

        /* Style the actual HTML checkbox to be completely transparent and positioned directly over its container, effectively hiding it visually while keeping it functional. */
        $currentElement.css( {
            'position'  : 'absolute',
            'top'       : 0,
            'right'     : 0,
            'bottom'    : 0,
            'left'      : 0,
            'opacity'   : 0
        } ) ;

        // If the original checkbox is found to be checked initially, apply a corresponding class to the custom toggle.
        if ( $currentElement.is( ':checked' ) ) {
            styledToggle.addClass( 'is-selected' ) ;
        }

        /* Attach an event handler to the native checkbox's 'change' event. */
        $currentElement.on( 'change', function() {
            // Toggle the 'is-selected' class on the custom toggle container to reflect the checkbox's state.
            styledToggle.toggleClass( 'is-selected' ) ;
        } ) ;

    } ) ;

    /* Return the original jQuery object to facilitate method chaining. */
    return this ;
};




/*
 *  ========================================================================
 *  Application Settings, Sliders, and User Interface Event Handlers
 *  ========================================================================
 */

/*
 *  Define jQuery objects for the primary opacity control slider and the pixel density control slider.
 */
var primarySlider = $( "#main-control-slider" ) ;
var densitySlider = $( "#density-control-slider" ) ;

// A string representing the current version of the application's configuration schema.
var currentConfigurationVersion = '2.1b' ;

/*
 *  Default configuration parameters for the application.
 *  These values are utilized when no saved settings are found or for new settings.
 */
var applicationConfig = {
    alpha               :   0.05,
    pixelDensitySetting :   1,
    primaryColor        :   'f34379',
    outputWidth         :   parseInt( $( '.width-input-field' ).val() ),
    outputHeight        :   parseInt( $( '.height-input-field' ).val() ),
    isTransparent       :   $( '#transparent-background-toggle' ).is( ':checked' ) ? true : false,
    outputPrefix        :   'pattern-output',
    forceBinaryDownload :   false, // Option to enable experimental base64 file download.
    configVersion       :   currentConfigurationVersion,
};

// Check if the browser supports persistent storage (localStorage).
if ( isPersistentStorageAvailable ) {

    var localStoreRef = window.localStorage; // Acquire a reference to the browser's localStorage object.

    // Attempt to retrieve previously saved application settings from localStorage.
    if ( localStoreRef.getItem( 'appConfiguration' ) ) {

        var previousConfig = JSON.parse( localStoreRef.getItem( 'appConfiguration' ) ) ;

        // Execute a migration check to ensure compatibility with the current schema version.
        if ( typeof previousConfig.configVersion === 'undefined' ||
             previousConfig.configVersion !== currentConfigurationVersion
        ) {
            // If the stored configuration is outdated or lacks a version,
            // update it by incorporating new default settings.
            for ( var configKey in applicationConfig ) {
                if ( typeof previousConfig[configKey] === 'undefined' ) {
                    previousConfig[configKey] = applicationConfig[configKey] ;
                }
            }
            // Update the schema version of the migrated configuration.
            previousConfig.configVersion = currentConfigurationVersion ;
            // Save the updated configuration back into localStorage.
            localStoreRef.setItem( 'appConfiguration', JSON.stringify( previousConfig ) ) ;

        }

        // Apply the loaded or migrated configuration settings to the application.
        applicationConfig = previousConfig ;

    } else {

        // If no saved settings are found, store the default application configuration in localStorage.
        localStoreRef.setItem( 'appConfiguration', JSON.stringify( applicationConfig ) ) ;
    }

}

/*
 *  Initialize the jQueryUI slider for controlling the main opacity level.
 */
primarySlider.slider( {
        range: "min",
        value: applicationConfig.alpha,
        min: 0,
        max: 1,
        step: 0.01,
        slide: function( eventObject, uiObject ) {
            // When the slider moves, regenerate the noise pattern with the new opacity value.
            synthesizePattern( uiObject.value, densitySlider.slider('value') ) ;
            storeConfiguration( 'alpha', uiObject.value ) ; // Persist the updated setting.
        }
} ) ;


/*
 *  Initialize the jQueryUI slider for controlling the pixel density of the noise.
 */
densitySlider.slider( {
        range: "min",
        value: applicationConfig.pixelDensitySetting,
        min: 1,
        max: 10,
        step: 0.1,
        slide: function( eventObject, uiObject ) {
            // When the slider moves, regenerate the noise pattern with the new density value.
            synthesizePattern( primarySlider.slider('value'), uiObject.value ) ;
            storeConfiguration( 'pixelDensitySetting', uiObject.value ) ; // Persist the updated setting.
        }
} ) ;


/*
 *  Set the initial values of the input fields based on the application's loaded configuration.
 */
$( '.color-selection-field' ).val( applicationConfig.primaryColor ) ;
$( '.width-input-field' ).val( applicationConfig.outputWidth ) ;
$( '.height-input-field' ).val( applicationConfig.outputHeight ) ;
if ( applicationConfig.isTransparent ) {
    $( '#transparent-background-toggle' ).attr( 'checked', true ) ;
}

/*
 *  Activate the ColorPicker plugin for the color selection input field.
 */
$( '.color-selection-field' ).ColorPicker( {
    color: '#' + applicationConfig.primaryColor,
    onShow: function ( colorPickerElement ) {
        $( colorPickerElement ).fadeIn( 500 ) ; // Display the color picker with a fade-in effect.
        return false ;
    },
    onHide: function ( colorPickerElement ) {
        $( colorPickerElement ).fadeOut( 500 ) ; // Hide the color picker with a fade-out effect.
        return false ;
    },
    onChange: function ( hsbValue, hexValue, rgbValue ) {
        $( '.color-selection-field' ).val( hexValue ) ; // Update the input field with the selected hexadecimal color.
        // Regenerate the noise pattern using the new color and current slider values.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
        storeConfiguration( 'primaryColor', hexValue ) ; // Save the updated color setting.
    }
} ) ;

/*
 *  Monitor changes in the color input field (e.g., when a user manually enters or pastes a value).
 */
$( '.color-selection-field' ).on( 'change', function() {
    // Regenerate the noise pattern based on the new color and current slider values.
    synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
    storeConfiguration( 'primaryColor', $( this ).val() ) ; // Save the updated color.
    var fieldValue = $( this ).val() ;
    $( this ).val( fieldValue ) ; // Re-set the value (can be used for normalization).
} ) ;

/*
 *  Monitor real-time key presses in the color input field.
 */
$( '.color-selection-field' ).on( 'keyup', function() {
    // Regenerate the noise pattern as the user types a new color value.
    synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
    storeConfiguration( 'primaryColor', $( this ).val() ) ; // Save the color as it's being typed.
} ) ;

/*
 *  Upon the initial loading of the webpage, generate the noise pattern
 *  using the default or previously saved configuration settings.
 */
synthesizePattern( primarySlider.slider('value'), densitySlider.slider('value') ) ;


/*
 *  Event handler for keyup events on the width input field.
 *  This logic validates the user-entered width, ensuring it stays within defined bounds.
 */
$( '.width-input-field' ).on( 'keyup', function() {

    var elementValue = $( this ).val() ; // Fetch the current value from the input.

    if ( parseInt( elementValue ) > 300 ) {

        $( this ).val( '300' ) ; // Cap the width at 300 pixels.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
        storeConfiguration( 'outputWidth', 300 ) ; // Update the saved configuration.

    } else if ( parseInt( elementValue ) < 0 ) {

        $( this ).val( '30' ) ; // Set a minimum width of 30 pixels.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
        storeConfiguration( 'outputWidth', 30 ) ; // Update the saved configuration.

    }


} ) ;


/*
 *  Event handler for keyup events on the height input field.
 *  This logic validates the user-entered height, ensuring it stays within defined bounds.
 */
$( '.height-input-field' ).on( 'keyup', function() {

    var elementValue = $( this ).val() ; // Fetch the current value from the input.
    if ( parseInt( elementValue ) > 300 ) {

        $( this ).val( '300' ) ; // Cap the height at 300 pixels.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
        storeConfiguration( 'outputHeight', 300 ) ; // Update the saved configuration.

    } else if ( parseInt( elementValue ) < 0 ) {

        $( this ).val( '30' ) ; // Set a minimum height of 30 pixels.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
        storeConfiguration( 'outputHeight', 30 ) ; // Update the saved configuration.

    }


} ) ;


/*
 *  Event handler for 'change' events on the width input field.
 *  This triggers a re-generation of the canvas when the width input loses focus or value is committed.
 */
$( '.width-input-field' ).change( function() {

        var elementValue = $( this ).val() ;
        storeConfiguration( 'outputWidth', elementValue ) ; // Save the current width setting.

        if ( parseInt( elementValue ) > 300 ) {

            $( this ).val( '300' ) ;
            synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
            storeConfiguration( 'outputWidth', 300 ) ;

        } else if ( parseInt( elementValue ) < 0 ) {

            $( this ).val( '30' ) ;
            synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
            storeConfiguration( 'outputWidth', 30 ) ;

        }

        // Always regenerate the noise pattern after a dimension change.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
} ) ;

/*
 *  Event handler for 'change' events on the height input field.
 *  This triggers a re-generation of the canvas when the height input loses focus or value is committed.
 */
$( '.height-input-field' ).change( function() {

        var elementValue = $( this ).val() ;
        storeConfiguration( 'outputHeight', elementValue ) ; // Save the current height setting.

        if ( parseInt( elementValue ) > 300 ) {

            $( this ).val( '300' ) ;
            synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
            storeConfiguration( 'outputHeight', 300 ) ;

        } else if ( parseInt( elementValue ) < 0 ) {

            $( this ).val( '30' ) ;
            synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
            storeConfiguration( 'outputHeight', 30 ) ;

        }

        // Always regenerate the noise pattern after a dimension change.
        synthesizePattern( primarySlider.slider('value'), primarySlider.slider('value') ) ;
} ) ;


/*
 *  Apply the custom checkbox styling plugin to all standard checkbox input elements on the page.
 */
$( 'input[type="checkbox"]' ).activateCustomToggle() ;
// Attach a change listener to the transparency toggle checkbox.
$( '#transparent-background-toggle' ).on( 'change', function() {
    // Update the transparency setting in the configuration based on the checkbox's state.
    $( this ).is( ':checked' ) ? storeConfiguration( 'isTransparent', true ) : storeConfiguration( 'isTransparent', false ) ;
} ) ;


// This helper function saves a specific configuration key-value pair to localStorage.
var storeConfiguration = function( configKeyName, configValue ) {
    if ( isPersistentStorageAvailable ) {
        applicationConfig[configKeyName] = configValue ; // Update the in-memory configuration object.
        localStoreRef.setItem( 'appConfiguration', JSON.stringify( applicationConfig ) ) ; // Persist the updated object to localStorage.
    }
} ;


// This function is responsible for rendering the final composite image, ready for display or download.
var renderFinalImage = function( triggerElement ) {
    var generatedTexture = new Image() ;
    generatedTexture.src = renderSurface.toDataURL( 'image/png' ) ; // Obtain the Data URL of the generated noise pattern.

    generatedTexture.onload = function() {
        var intermediateCanvas = document.createElement('canvas') ; // Create a temporary canvas for compositing.
        var intermediateContext = intermediateCanvas.getContext('2d') ; // Get its 2D rendering context.

        intermediateCanvas.width = renderSurface.width ;   // Set the dimensions of the temporary canvas to match the noise canvas.
        intermediateCanvas.height = renderSurface.height ;

        // If the transparency toggle is not checked, fill the temporary canvas with the selected background color.
        if ( ! $( '#transparent-background-toggle' ).is( ':checked' ) ) {
            intermediateContext.fillStyle = '#' + $( '.color-selection-field' ).val() ;
            intermediateContext.fillRect( 0, 0, intermediateCanvas.width, intermediateCanvas.height ) ;
        }
        intermediateContext.drawImage( generatedTexture, 0, 0 ) ; // Draw the generated noise texture onto the intermediate canvas.

        var encodedImageData = intermediateCanvas.toDataURL( 'image/png' ) ; // Get the Data URL of the final composite image.

        // Store this Data URL in a data attribute of the download action button.
        $( '.download-action-button' )
            .data( 'href', encodedImageData ) ;

        // Logic to handle file download based on browser support for the 'download' attribute.
        if ( hasDownloadAttribute ) {
            $( '.download-action-button' )
                .attr( 'href', encodedImageData ) // Set the 'href' attribute to enable direct download.
                // Construct a unique filename based on the current application settings.
                .attr( 'download',
                    applicationConfig['outputPrefix'] +
                    '-' + $( '.width-input-field' ).val() + 'x' + $( '.height-input-field' ).val() +
                    '-a' + primarySlider.slider('value') * 100 +
                    '-d' + densitySlider.slider('value') * 10 +
                    '-c-' + $( '.color-selection-field' ).val() +
                    '-t' + ( $( '#transparent-background-toggle' ).is( ':checked' ) ? 1 : 0 ) +
                    '.png'
                ) ;
        } else if ( triggerElement ) {
            // This is an experimental feature to force base64 file download (disabled by default).
            if ( applicationConfig['forceBinaryDownload'] ) {
                var binaryDataURL = encodedImageData.replace( /^data:image\/[^;]/, 'data:application/octet-stream' ) ;
                location.href = binaryDataURL ; // Redirect the browser to force a download.
            } else {
                window.location = $( '.download-action-button' ).data( 'href' ) ; // Open the image in the current window.
            }
        }
    } ;
} ;


// Re-render the final image whenever the transparency toggle's state changes.
$( '#transparent-background-toggle' ).on( 'change', function() {
    renderFinalImage() ;
} ) ;

// Execute the final image rendering function once when the script initially loads.
renderFinalImage() ;

// If the browser does not natively support the HTML5 'download' attribute,
// attach a custom click handler to the download button to simulate the download behavior.
if ( ! hasDownloadAttribute ) {
    $( '.download-action-button' ).on( 'click', function( clickEvent ) {
        renderFinalImage( this ) ; // Pass the clicked button element as a reference.
        clickEvent.preventDefault() ; // Prevent the default link navigation action.
    } ) ;
}