// This file contains all the JavaScript code for the Noise Texture Generator application.
// It includes global settings, core noise generation logic, UI interactions,
// and download functionalities.

// ========================================================================
//  Global Variables and Application Settings Initialization
// ========================================================================

// --- Canvas Support Check ---
// We first perform a crucial check to determine if the HTML5 canvas element
// is supported by the user's browser. Modernizr is used for this feature detection.
if ( Modernizr.canvas )
{
        // If canvas is indeed supported, we proceed to create a new canvas element.
        var canvas = document.createElement( 'canvas' ) ;

        // Subsequently, we obtain its 2D rendering context, which is essential
        // for all drawing operations that follow.
        var ctx    = canvas.getContext( '2d' ) ;
}


// --- Download Attribute Feature Detection ---
/**
 * There is a new attribute named 'download' available on anchor (<a>) tags
 * in modern web browsers. This attribute allows developers to enforce the
 * download of a resource specified in the 'href' attribute, rather than
 * navigating to it.
 *
 * For detailed information, please refer to the official WHATWG specification:
 * @see http://developers.whatwg.org/links.html#downloading-resources
 *
 * Discussions and related issues for this project can be found here:
 * @link https://github.com/andrewckor/Noise-texture-generator/issues/1
 *
 * This 'neatDownload' variable will be true if the 'download' attribute is supported.
 * If this feature is not supported by the browser, a fallback behavior will be
 * implemented to handle downloads.
 */
var neatDownload = ( 'download' in document.createElement( 'a' ) ) ;


// --- Local Storage Support Check ---
// We also verify if the browser supports localStorage.
// LocalStorage is utilized to enhance usability and provide application memory
// by persisting user settings across sessions.
var localStorageExists = Modernizr.localstorage ;


// ========================================================================
//  Main Noise Generation Function
// ========================================================================

// This is the core function responsible for generating the noise texture
// on the canvas based on provided parameters.
var generateNoise = function ( opacity ,  density )
{
        // If the browser does not support the HTML5 canvas,
        // this function cannot perform its task.
        if ( ! Modernizr.canvas )
        {
                // In such a scenario, we simply return false, indicating failure.
                return false ;
        }

        // Declare variables for loop counters (x, y) and potential color components (r, g, b).
        var x ;
        var y ;
        var r ,  g ,  b ;

        // Assign the input opacity to a local variable.
        var currentOpacity = opacity ;

        // Ensure the density is an integer and defaults to 1 if not provided or invalid.
        var effectiveDensity = Math.floor( density ) || 1 ;

        // Set the width of the canvas element based on the value from the 'x_size_input' field.
        canvas.width  =  parseInt( $('.x_size_input').val() ) ;

        // Set the height of the canvas element based on the value from the 'y_size_input' field.
        canvas.height =  parseInt( $('.y_size_input').val() ) ;

        /*
         * The following lines are commented out. They could be used to fill
         * the entire canvas with a solid color before drawing noise,
         * but are currently inactive.
         * ctx.fillStyle = '#' + $('.color_input').val();
         * ctx.fillRect(0, 0, canvas.width, canvas.height);
         */

        // Begin the nested loops to iterate through the canvas area and draw individual noise pixels.
        // The outer loop handles the horizontal (X) axis.
        for ( x = 0 ;  x < canvas.width ;  x += effectiveDensity )
        {
                // The inner loop handles the vertical (Y) axis for each step on the X-axis.
                for ( y = 0 ;  y < canvas.height ;  y += effectiveDensity )
                {
                        // Generate a random number between 0 and 255 (inclusive) for grayscale intensity.
                        var number = Math.floor( Math.random() * 256 ) ;

                        // Set the fill style for the context to an RGBA color.
                        // The random number is used for red, green, and blue components,
                        // creating a grayscale effect, combined with the specified opacity.
                        ctx.fillStyle = 'rgba(' + number + ',' + number + ',' + number + ',' + currentOpacity + ')' ;

                        // Draw a single 1x1 pixel rectangle at the current (x, y) coordinate.
                        ctx.fillRect( x ,  y ,  1 ,  1 ) ;
                }
        }

        // After generating the noise, update the background CSS property of the '.final_noise' element.
        // This sets the generated canvas image (converted to a PNG data URL) as the background,
        // centered and repeating, with the user-selected base color.
        $('.final_noise').css( 'background' , 'url(' + canvas.toDataURL( 'image/png' ) + ') center center repeat #' + $('.color_input').val() ) ;

        // Check if an 'applyNoise' function is defined elsewhere in the script.
        if ( typeof applyNoise == 'function' )
        {
                // If it exists, call it to perform any subsequent processing or updates.
                applyNoise() ;
        }
}


// ========================================================================
//  jQuery Plugin: toCustomCheckbox
// ========================================================================

// This is a custom jQuery plugin designed to transform standard HTML checkboxes
// into visually customized checkbox elements, while maintaining their native functionality.
$.fn.toCustomCheckbox = function ( )
{
        // Store a reference to the jQuery collection of checkboxes
        // that this plugin was called upon.
        var theCheckboxes = this ;

        // Iterate over each individual checkbox element within the collection.
        theCheckboxes.each( function ( )
        {
                // Cache the current jQuery object for the checkbox being processed,
                // improving performance by avoiding repeated selections.
                var $this = $( this ) ;

                // Wrap the original checkbox element with a new <span> tag.
                // This span will serve as the visual container for the custom checkbox.
                $this.wrap( '<span>' ) ;

                // Get a reference to the newly created parent span.
                // This is our 'customCheckbox' container.
                var customCheckbox = $this.parent( ) ;

                // Apply the 'custom-checkbox' class to the wrapper span.
                // Also, set inline styles for positioning and overflow to prepare it
                // for the custom visual appearance.
                customCheckbox.addClass( 'custom-checkbox' ) .css( { 'position' : 'relative' , 'overflow' : 'hidden' } ) ;

                // Style the actual, native checkbox element to make it
                // visually hidden but still fully interactive.
                // It is positioned absolutely to cover its parent, with zero opacity.
                $this.css( {
                        'position'  : 'absolute' ,
                        'top'       : 0 ,
                        'right'     : 0 ,
                        'bottom'    : 0 ,
                        'left'      : 0 ,
                        'opacity'   : 0
                } ) ;

                // Check the initial state of the native checkbox.
                if ( $this.is( ':checked' ) )
                {
                        // If it's checked, add the 'is-checked' class to the custom wrapper
                        // to visually represent its checked state.
                        customCheckbox.addClass( 'is-checked' ) ;
                }

                // Attach an event listener to the native checkbox's 'change' event.
                $this.on( 'change' , function ( )
                {
                        // When the checkbox's state changes, toggle the 'is-checked' class
                        // on the custom wrapper to update its visual appearance.
                        customCheckbox.toggleClass( 'is-checked' ) ;
                } ) ;
        } ) ;

        // Return the original jQuery collection to allow for method chaining.
        return this ;
} ;


// ========================================================================
//  Noise Slider Initialization and Settings Management
// ========================================================================

// Define and initialize the jQuery UI slider elements used in the application.
// 'sliderMain' controls the noise opacity, and 'sliderDensity' controls the density.
var sliderMain    = $( "#slider" ) ;
var sliderDensity = $( "#slider-dens" ) ;

// A variable to keep track of the current schema version for application settings.
// This is used for migration purposes if settings structure changes.
var currentSchemaVersion = '2.1b' ;

// Establish the default settings for the application.
// These values are used as a baseline or if no saved settings are found.
var settings = {
        opacity         : 0.05 ,                              // Default noise opacity
        density         : 1 ,                                 // Default noise density
        color           : 'f34379' ,                          // Default background color (hex code)
        width           : $('.x_size_input').val() ,          // Initial canvas width from input
        height          : $('.y_size_input').val() ,          // Initial canvas height from input
        transparency    : $('#transparent-noise').is(':checked') ? true : false , // Initial transparency state
        fileprefix      : 'noisy-texture' ,                   // Prefix for downloaded filenames
        forcedownload   : false ,                             // Flag to force base64 file download (experimental)
        schemaversion   : currentSchemaVersion                // Current schema version of these settings
} ;

// Check if the browser supports local storage before attempting to use it.
if ( localStorageExists )
{
        // Get a reference to the browser's local storage object.
        var ls = window.localStorage ;

        // Attempt to retrieve previously saved settings from local storage.
        if ( ls.getItem( 'settings' ) )
        {
                // If settings are found, parse the JSON string back into a JavaScript object.
                oldSettings = JSON.parse( ls.getItem( 'settings' ) ) ;

                // Perform a migration check: if the stored settings' schema version is undefined
                // or differs from the current schema version, update them.
                if ( typeof oldSettings.schemaversion === 'undefined' ||
                     oldSettings.schemaversion !== currentSchemaVersion
                )
                {
                        // Iterate through the properties of the current default 'settings' object.
                        for ( var prop in settings )
                        {
                                // If a property from the default settings is missing in the old (stored) settings,
                                // add it to 'oldSettings' with its default value.
                                if ( typeof oldSettings[prop] === 'undefined' )
                                {
                                        oldSettings[prop] = settings[prop] ;
                                }
                        }
                        // Update the schema version of the migrated settings to the current version.
                        oldSettings.schemaversion = currentSchemaVersion ;
                        // Save the updated and migrated settings back to local storage.
                        ls.setItem( 'settings' , JSON.stringify( oldSettings ) ) ;
                }

                // Assign the (potentially migrated) old settings as the active 'settings' for the application.
                settings = oldSettings ;
        }
        else
        {
                // If no settings are found in local storage, save the default 'settings' object.
                ls.setItem( 'settings' , JSON.stringify( settings ) ) ;
        }
}

// Initialize the main opacity slider using the jQuery UI Slider widget.
sliderMain.slider( {
        range : "min" ,                                // The slider will have a single handle.
        value : settings.opacity ,                     // Set the initial value from application settings.
        min   : 0 ,                                    // Minimum allowed opacity value.
        max   : 1 ,                                    // Maximum allowed opacity value.
        step  : 0.01 ,                                 // Increment/decrement step for the slider.
        slide : function ( event , ui )                // Callback function executed during slider movement.
        {
                // When the slider is moved, regenerate the noise texture
                // using the new opacity value and the current density slider value.
                generateNoise( ui.value , sliderDensity.slider( 'value' ) ) ;
                // Persist the updated opacity setting to local storage.
                setSettings( 'opacity' , ui.value ) ;
        }
} ) ;

// Initialize the density slider using the jQuery UI Slider widget.
sliderDensity.slider( {
        range : "min" ,                                // The slider will have a single handle.
        value : settings.density ,                     // Set the initial value from application settings.
        min   : 1 ,                                    // Minimum allowed density value.
        max   : 10 ,                                   // Maximum allowed density value.
        step  : 0.1 ,                                  // Increment/decrement step for the slider.
        slide : function ( event , ui )                // Callback function executed during slider movement.
        {
                // When the slider is moved, regenerate the noise texture
                // using the current opacity slider value and the new density value.
                generateNoise( sliderMain.slider( 'value' ) , ui.value ) ;
                // Persist the updated density setting to local storage.
                setSettings( 'density' , ui.value ) ;
        }
} ) ;

// Apply the default or loaded settings values to the respective UI input fields.
// Set the color input field's value.
$('.color_input').val( settings.color ) ;
// Set the canvas width input field's value.
$('.x_size_input').val( settings.width ) ;
// Set the canvas height input field's value.
$('.y_size_input').val( settings.height ) ;

// If transparency is enabled in the settings, visually mark the 'transparent-noise' checkbox as checked.
if ( settings.transparency )
{
        $('#transparent-noise').attr( 'checked' , true ) ;
}


// ========================================================================
//  Color Picker and Initial Noise Generation
// ========================================================================

// Enable the ColorPicker plugin for the '.color_input' field.
$('.color_input').ColorPicker( {
        color    : '#' + settings.color ,                 // Set the initial color for the picker.
        onShow   : function ( colpkr )                    // Callback when the color picker is shown.
        {
                $( colpkr ).fadeIn( 500 ) ;                // Fade in the color picker UI.
                return false ;                             // Prevent default event.
        } ,
        onHide   : function ( colpkr )                    // Callback when the color picker is hidden.
        {
                $( colpkr ).fadeOut( 500 ) ;               // Fade out the color picker UI.
                return false ;                             // Prevent default event.
        } ,
        onChange : function ( hsb , hex , rgb )           // Callback when the color selection changes.
        {
                $('.color_input').val( hex ) ;             // Update the input field with the new hex color.
                // Regenerate the noise using current slider values (opacity and density) and the new color.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ;
                setSettings( 'color' , hex ) ;             // Persist the new color setting.
        }
} ) ;

// Attach an event listener to the '.color_input' for the 'change' event.
// This typically fires when the input loses focus and its value has changed.
$('.color_input').on( 'change' , function ( )
{
        // Regenerate the noise with the updated color from the input field.
        generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ;
        setSettings( 'color' , $( this ).val() ) ; // Persist the color setting.
        // Re-set the input value, potentially to normalize it after user input.
        var thisValue = $( this ).val() ;
        $( this ).val( thisValue ) ;
} ) ;

// Attach an event listener to the '.color_input' for the 'keyup' event.
// This allows for real-time updates as the user types a color value.
$('.color_input').on( 'keyup' , function ( )
{
        // Regenerate the noise instantly with the color typed by the user.
        generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ;
        setSettings( 'color' , $( this ).val() ) ; // Persist the color setting.
} ) ;

// When the web page finishes loading, execute the noise generation function
// for the very first time using the current slider values (default or loaded).
generateNoise( sliderMain.slider( 'value' ) , sliderDensity.slider( 'value' ) ) ;


// ========================================================================
//  Canvas Size Input Validation (Keyup Event)
// ========================================================================

// Monitor the 'keyup' event on the X-size input field to validate user input
// in real-time and ensure it stays within desirable limits.
$('.x_size_input').on( 'keyup' , function ( )
{
        // Retrieve the current value entered by the user.
        var currentValue = $( this ).val() ;

        // Check if the parsed integer value of the input exceeds the maximum allowed size (300).
        if ( parseInt( currentValue ) > 300 )
        {
                $( this ).val( '300' ) ;                                     // Cap the value at 300.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'width' , 300 ) ;                               // Update the width setting.
        }
        // Otherwise, check if the parsed integer value falls below the minimum allowed size (0).
        else if ( parseInt( currentValue ) < 0 )
        {
                $( this ).val( '30' ) ;                                      // Set a default minimum value of 30.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'width' , 30 ) ;                                // Update the width setting.
        }
} ) ;

// Monitor the 'keyup' event on the Y-size input field to validate user input
// in real-time and ensure it stays within desirable limits.
$('.y_size_input').on( 'keyup' , function ( )
{
        // Retrieve the current value entered by the user.
        var currentValue = $( this ).val() ;

        // Check if the parsed integer value of the input exceeds the maximum allowed size (300).
        if ( parseInt( currentValue ) > 300 )
        {
                $( this ).val( '300' ) ;                                     // Cap the value at 300.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'height' , 300 ) ;                              // Update the height setting.
        }
        // Otherwise, check if the parsed integer value falls below the minimum allowed size (0).
        else if ( parseInt( currentValue ) < 0 )
        {
                $( this ).val( '30' ) ;                                      // Set a default minimum value of 30.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'height' , 30 ) ;                               // Update the height setting.
        }
} ) ;


// ========================================================================
//  Canvas Size Input Validation (Change Event)
// ========================================================================

// Attach a 'change' event listener to the X-size input field.
// This event typically fires when the input element loses focus and its value has been altered.
// If the canvas size is changed by the user, a new noise canvas is generated.
$('.x_size_input').change( function ( )
{
        // Get the current value from the input field.
        var currentValue = $( this ).val() ;
        // Immediately update the 'width' setting in local storage.
        setSettings( 'width' , currentValue ) ;

        // Re-apply the validation logic for the X-size.
        if ( parseInt( currentValue ) > 300 )
        {
                $( this ).val( '300' ) ;                                     // Cap the value.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'width' , 300 ) ;                               // Update setting.
        }
        else if ( parseInt( currentValue ) < 0 )
        {
                $( this ).val( '30' ) ;                                      // Set minimum value.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'width' , 30 ) ;                                // Update setting.
        }

        // After any adjustments (or if none were needed), regenerate the noise
        // to reflect the finalized canvas width.
        generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ;
} ) ;

// Attach a 'change' event listener to the Y-size input field.
// This event typically fires when the input element loses focus and its value has been altered.
// If the canvas size is changed by the user, a new noise canvas is generated.
$('.y_size_input').change( function ( )
{
        // Get the current value from the input field.
        var currentValue = $( this ).val() ;
        // Immediately update the 'height' setting in local storage.
        setSettings( 'height' , currentValue ) ;

        // Re-apply the validation logic for the Y-size.
        if ( parseInt( currentValue ) > 300 )
        {
                $( this ).val( '300' ) ;                                     // Cap the value.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'height' , 300 ) ;                              // Update setting.
        }
        else if ( parseInt( currentValue ) < 0 )
        {
                $( this ).val( '30' ) ;                                      // Set minimum value.
                generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ; // Regenerate noise.
                setSettings( 'height' , 30 ) ;                               // Update setting.
        }

        // After any adjustments (or if none were needed), regenerate the noise
        // to reflect the finalized canvas height.
        generateNoise( sliderMain.slider( 'value' ) , sliderMain.slider( 'value' ) ) ;
} ) ;


// ========================================================================
//  Custom Checkboxes and Settings Management Function
// ========================================================================

// Apply the custom checkbox styling plugin to all checkbox input elements
// found on the page.
$( 'input[type=checkbox]' ).toCustomCheckbox() ;

// Attach a 'change' event listener to the specific 'transparent-noise' checkbox.
$('#transparent-noise').on( 'change' , function ( )
{
        // Based on the checked state of the checkbox, update the 'transparency'
        // setting in the application's configuration.
        $( this ).is( ':checked' ) ? setSettings( 'transparency' , true ) : setSettings( 'transparency' , false ) ;
} ) ;

// This is a helper function designed to update a specific application setting
// and then persist the entire 'settings' object to local storage.
var setSettings = function ( key , value )
{
        // Only attempt to save settings if local storage is available in the browser.
        if ( localStorageExists )
        {
                // Update the specified 'key' with the new 'value' within the 'settings' object.
                settings[key] = value ;
                // Convert the entire 'settings' object to a JSON string and save it
                // under the 'settings' key in local storage.
                ls.setItem( 'settings' , JSON.stringify( settings ) ) ;
        }
} ;


// ========================================================================
//  Noise Application and Download Logic
// ========================================================================

// This function is responsible for applying the generated noise to a temporary canvas,
// handling background color if transparency is off, and preparing the image for download.
var applyNoise = function ( that )
{
        // Create a new HTML Image object.
        var realNoise = new Image() ;
        // Set the source of this image to the data URL of the main canvas,
        // which contains the generated noise.
        realNoise.src = canvas.toDataURL( 'image/png' ) ;

        // Define an onload event handler for the 'realNoise' image.
        // This ensures the image is fully loaded before drawing operations begin.
        realNoise.onload = function ( )
        {
                // Create a temporary canvas element and get its 2D rendering context.
                var tempCanvas = document.createElement( 'canvas' ) ;
                var tempctx    = tempCanvas.getContext( '2d' ) ;

                // Set the dimensions of the temporary canvas to match the main canvas.
                tempCanvas.width  = canvas.width ;
                tempCanvas.height = canvas.height ;

                // Check if the 'transparent-noise' checkbox is NOT checked.
                if ( ! $('#transparent-noise').is( ':checked' ) )
                {
                        // If transparency is not desired, fill the temporary canvas
                        // with the selected background color before drawing the noise.
                        tempctx.fillStyle = '#' + $('.color_input').val() ;
                        tempctx.fillRect( 0 , 0 , tempCanvas.width , tempCanvas.height ) ;
                }
                // Draw the generated noise image onto the temporary canvas.
                tempctx.drawImage( realNoise , 0 , 0 ) ;

                // Get the data URL of the final image from the temporary canvas in PNG format.
                var dataUrl = tempCanvas.toDataURL( 'image/png' ) ;

                // Store this data URL in the 'href' data attribute of the download button.
                $('.download_button').data( 'href' , dataUrl ) ;

                // --- Download Mechanism ---
                // This section handles the actual file download logic.
                if ( neatDownload )
                {
                        // If the browser supports the HTML5 'download' attribute,
                        // set the 'href' and 'download' attributes of the download button.
                        $('.download_button').attr( 'href' , dataUrl )
                                             // Generate a unique and descriptive filename based on current settings.
                                             .attr( 'download' ,
                                                     settings['fileprefix'] +
                                                     '-' + $('.x_size_input').val() + 'x' + $('.y_size_input').val() +
                                                     '-o' + sliderMain.slider( 'value' ) * 100 +
                                                     '-d' + sliderDensity.slider( 'value' ) * 10 +
                                                     '-c-' + $('.color_input').val() +
                                                     '-t' + ( $('#transparent-noise').is( ':checked' ) ? 1 : 0 ) +
                                                     '.png'
                                             ) ;
                }
                // If the 'download' attribute is NOT supported, and the 'that' parameter
                // (representing the clicked element) is provided.
                else if ( that )
                {
                        // Check for an experimental feature: 'forcedownload' setting.
                        // This is typically off by default.
                        if ( settings['forcedownload'] )
                        {
                                // If 'forcedownload' is enabled, convert the data URL to an octet-stream
                                // to explicitly prompt a file download.
                                var burl = dataUrl.replace( /^data:image\/[^;]/ , 'data:application/octet-stream' ) ;
                                location.href = burl ;
                        }
                        else
                        {
                                // As a fallback, navigate the browser to the data URL.
                                // This usually opens the image in a new browser tab or window.
                                window.location = $('.download_button').data( 'href' ) ;
                        }
                }
        } ;
} ;


// ========================================================================
//  Final Event Listeners and Initialization
// ========================================================================

// Attach a 'change' event listener to the 'transparent-noise' checkbox.
// When its state changes (checked/unchecked), re-apply the noise to update
// the preview and the download image.
$('#transparent-noise').on( 'change' , function ( )
{
        applyNoise() ;
} ) ;

// Immediately call the 'applyNoise' function upon script execution.
// This ensures that the download button is properly initialized with the
// current noise image when the page first loads.
applyNoise() ;

// Perform a final check for 'neatDownload' support at the start of the file.
if ( ! neatDownload )
{
        // If the HTML5 'download' attribute is not supported by the browser,
        // attach a custom click event handler to the download button.
        $('.download_button').on( 'click' , function ( e )
        {
                // Call 'applyNoise' with the clicked element ('this') as a parameter.
                // This enables the fallback download logic within the 'applyNoise' function.
                applyNoise( this ) ;
                // Prevent the default action of the anchor tag (which would normally
                // navigate to the 'href' URL, likely opening the data URL in a new tab).
                e.preventDefault() ;
        } ) ;
}