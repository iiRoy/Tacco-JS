/**
 * jQuery Twitter Bootstrap Theme Switcher v1.1.5
 *
 * This is a JavaScript library that provides theme switching capabilities
 * for Bootstrap-based web applications. It allows users to dynamically
 * change the visual theme of their site.
 *
 * Project Home: https://github.com/jguadagno/bootstrapThemeSwitcher
 *
 * Copyright (c) 2014, Joseph Guadagno
 *
 * License: Licensed under the MIT License.
 *          For full license details, please refer to:
 *          https://github.com/twbs/bootstrap/blob/master/LICENSE
 *
 * This file contains the core logic for the Bootstrap Theme Switcher plugin.
 * It integrates with jQuery to provide an easy-to-use API for theme management.
 */
;
( function ( $, window, document, undefined ) {

    // Enforce strict mode for cleaner code and fewer errors.
    "use strict";

    // Store a reference to the original `$.fn.bootstrapThemeSwitcher`
    // to allow for `noConflict()` functionality later.
    var old = $.fn.bootstrapThemeSwitcher;


    // Define the main constructor for the BootstrapThemeSwitcher plugin.
    // This function initializes a new instance of the theme switcher.
    var BootstrapThemeSwitcher = function ( element, options ) {

        // Store the jQuery-wrapped DOM element that the plugin is attached to.
        this.$element = $( element );

        // Merge default settings with user-provided options.
        // This ensures all necessary settings are available,
        // prioritizing user preferences.
        this.settings = $.extend(
            {},
            $.fn.bootstrapThemeSwitcher.defaults,
            options
        );

        // Initialize an empty array to hold the list of available themes.
        this.themesList = [];

        // Immediately fetch the themes when the instance is created.
        this.getThemes();

        // Return the instance for chaining.
        return this;

    }; // End of BootstrapThemeSwitcher constructor.


    // Define the prototype methods for the BootstrapThemeSwitcher.
    // These methods provide the core functionality of the plugin.
    BootstrapThemeSwitcher.prototype = {

        /**
         * Clears the contents of the element that the plugin is attached to.
         * This can be useful before repopulating the theme list.
         */
        clear: function () {

            // Log a message to the console for debugging purposes.
            console.log( 'bootstrapThemeSwitcher.clear' );

            // Iterate over each selected element and empty its contents.
            return this.$element.each( function () {

                // 'this' inside 'each' refers to the DOM element,
                // so we need to access the stored jQuery element.
                this.$element.empty();

            } );

        }, // End of clear method.


        /**
         * Forces an update of the theme list, typically by re-fetching
         * themes and repopulating the control.
         */
        update: function () {

            // Log the update action.
            console.log( 'bootstrapThemeSwitcher.update' );

            // Re-fetch the themes, which will also re-add them to the control.
            this.getThemes();

        }, // End of update method.


        /**
         * Switches the current Bootstrap theme to the specified one.
         * This involves updating the CSS link in the document head.
         *
         * @param {string} name - The name of the theme (e.g., "Cerulean").
         * @param {string} cssFile - The URL of the CSS file for the theme.
         */
        switchTheme: function ( name, cssFile ) {

            // Log the theme switch attempt with the theme name and CSS file.
            console.log( 'bootstrapThemeSwitcher.switchTheme: name: "' + name + '", cssFile: "' + cssFile + '"' );

            // Get a jQuery reference to the current element.
            var $this = $( this );

            // Retrieve the current settings for this specific instance,
            // merging defaults with any data attributes on the element.
            var settings = $.extend(
                {},
                $.fn.bootstrapThemeSwitcher.defaults,
                $this.data( 'bootstrapThemeSwitcher' )
            );


            // Get the ID that will be used for the theme CSS link.
            var id = settings.cssThemeLink;


            // If no CSS file is provided, use the default CSS file from settings.
            if ( cssFile === undefined ) {
                cssFile = this.settings.defaultCssFile;
            }

            // If no theme name is provided, use the CSS file name as the theme name.
            if ( name === undefined ) {
                name = cssFile;
            }


            // Remove any existing Bootstrap stylesheet links that are NOT
            // the designated theme link (identified by 'id').
            // This prevents duplicate or conflicting Bootstrap styles.
            $( 'head link[href*="bootstrap.min.css"][id!="' + id + '"]' ).remove();


            // Construct the selector for the theme CSS link.
            var selector = '#' + id;

            // Try to find the existing theme CSS link in the document head.
            var cssLink = $( selector );


            // If the theme CSS link does not exist, create and insert it.
            if ( cssLink.length === 0 ) {

                // Generate the HTML for the new CSS link element.
                var cssLinkHtml = "<link rel='stylesheet' id='" + id + "' href='" + cssFile + "' type='text/css' />";

                // Find the first existing stylesheet link in the head.
                var firstCssLink = $( 'head link[rel="stylesheet"]:first' );

                // If there are no other stylesheets, append the new link to the head.
                if ( firstCssLink.length === 0 ) {

                    $( 'head' ).append( cssLinkHtml );

                } else {

                    // Otherwise, insert the new link before the first existing stylesheet.
                    // This often helps with CSS specificity and loading order.
                    firstCssLink.before( cssLinkHtml );

                }

                // Update the cssLink variable to reference the newly created element.
                cssLink = $( selector );

            }

            // Update the 'href' attribute of the theme CSS link to point to the new theme's CSS file.
            cssLink.attr( 'href', cssFile );


            // Check if the theme selection should be saved to a cookie.
            if ( settings.saveToCookie ) {

                // Warn if jQuery.cookie plugin is not present but saving to cookie is enabled.
                if ( $.cookie === undefined ) {

                    console.warn( 'bootstrapThemeSwitcher: saveToCookie is set to true but jQuery.cookie is not present. Cannot save theme to cookie.' );

                    // Exit the function as cookie saving is not possible.
                    return;

                }

                // Save the theme name to a cookie.
                $.cookie( settings.cookieThemeName, name, {
                    expires: settings.cookieExpiration,
                    path: settings.cookiePath
                } );

                // Save the theme CSS file URL to a cookie.
                $.cookie( settings.cookieThemeCss, cssFile, {
                    expires: settings.cookieExpiration,
                    path: settings.cookiePath
                } );

            }

        }, // End of switchTheme method.


        /**
         * Loads the theme preferences from cookies and applies them.
         * Requires the jQuery.cookie plugin.
         *
         * @param {object} options - Optional settings to override defaults for this operation.
         */
        loadThemeFromCookie: function ( options ) {

            // Check if jQuery.cookie plugin is available.
            if ( $.cookie === undefined ) {

                console.warn( 'bootstrapThemeSwitcher: loadThemeFromCookie was called but jQuery.cookie is not present. Cannot load theme from cookie.' );

                // Exit if cookie plugin is missing.
                return;

            }

            // Merge current settings with any provided options.
            var settings = $.extend(
                {},
                $.fn.bootstrapThemeSwitcher.defaults,
                options
            );

            // Retrieve the theme name from the cookie.
            var themeName = $.cookie( settings.cookieThemeName );

            // Retrieve the theme CSS file URL from the cookie.
            var themeCss = $.cookie( settings.cookieThemeCss );

            // Apply the loaded theme using the switchTheme method.
            this.switchTheme( themeName, themeCss );

        }, // End of loadThemeFromCookie method.


        /**
         * Adds a new theme to the internal list of themes.
         * This method allows for dynamic addition of themes.
         *
         * @param {string} name - The display name of the theme.
         * @param {string} cssFile - The URL of the theme's CSS file.
         * @param {number} [start=0] - The index at which to start changing the array.
         * @param {number} [deleteCount=0] - The number of elements to remove from the array.
         */
        addTheme: function ( name, cssFile, start, deleteCount ) {

            // Provide default values for 'start' if not specified.
            if ( start === undefined ) {
                start = 0;
            }

            // Provide default values for 'deleteCount' if not specified.
            if ( deleteCount === undefined ) {
                deleteCount = 0;
            }

            // Use Array.prototype.splice to add the new theme object
            // into the themesList at the specified position.
            this.themesList.splice( start, deleteCount, {
                name: name,
                cssCdn: cssFile
            } );

            // After adding the theme, update the control (e.g., dropdown or list).
            this.addThemesToControl();

        }, // End of addTheme method.


        /**
         * Populates the plugin's associated control element (e.g., UL or SELECT)
         * with the list of available themes.
         */
        addThemesToControl: function () {

            // --- Input Validation and Error Handling ---

            // Ensure the element is defined before proceeding.
            if ( this.$element === undefined ) {
                console.error( 'bootstrapThemeSelector: addThemesToControl: Element is undefined. Cannot add themes.' );
                return;
            }

            // Ensure the themes list is defined.
            if ( this.themesList === undefined ) {
                console.error( 'bootstrapThemeSelector: addThemesToControl: Themes is undefined. No themes to add.' );
                return;
            }

            // --- Bootswatch Exclusion Logic ---

            // Check if any Bootswatch themes should be excluded.
            if ( this.settings.excludeBootswatch ) {

                var excludeBootswatchs;

                // Determine if the exclusion string contains multiple themes.
                if ( this.settings.excludeBootswatch.indexOf( "," ) !== -1 ) {

                    // Split the string into an array if comma-separated.
                    excludeBootswatchs = this.settings.excludeBootswatch.split( ',' );

                } else {

                    // Otherwise, create an array with a single exclusion.
                    excludeBootswatchs = [];
                    excludeBootswatchs.push( this.settings.excludeBootswatch );

                }


                // Create a temporary copy of the themes list for filtering.
                var tempThemeList = this.themesList;

                // Iterate over the temporary list to remove excluded themes.
                $.each( tempThemeList, function ( i, value ) {

                    // Ensure the theme object and its name property exist.
                    if ( value && value.name ) {

                        // Check if the current theme's name is in the exclusion list.
                        if ( jQuery.inArray( value.name, excludeBootswatchs ) !== -1 ) {

                            // Remove the theme from the temporary list.
                            tempThemeList.splice( i, 1 );

                        }

                    }

                } );

                // Update the main themesList with the filtered list.
                this.themesList = tempThemeList;

            } // End of Bootswatch exclusion logic.


            // Store a reference to 'this' (the BootstrapThemeSwitcher instance)
            // for use within nested functions.
            var base = this;

            // --- Populate Control Based on Element Type ---

            // If the element is an unordered list (UL).
            if ( this.$element.is( 'ul' ) ) {

                console.log( 'bootstrapThemeSelector: UL element selected. Populating list items.' );

                // Clear any existing list items.
                this.$element.empty();

                var cssClass;

                // Iterate over each theme in the themesList.
                $.each( this.themesList, function ( i, value ) {

                    // Initialize cssClass to null.
                    cssClass = null;

                    // Check if the current theme matches the one stored in the cookie.
                    // If so, mark it as 'active'.
                    if ( value.name === $.cookie( 'bootstrapTheme.name' ) ) {
                        cssClass = "active";
                    }

                    // Create a new list item (LI) element.
                    var li = $( "<li />" )
                        // Set the class attribute (e.g., 'active' if applicable).
                        .attr( "class", cssClass )
                        // Append an anchor tag with the theme name.
                        .append( "<a href='#'>" + value.name + "</a>" )
                        // Attach a click event handler to the list item.
                        .on( 'click', function () {

                            // Switch the theme when clicked.
                            base.switchTheme( value.name, value.cssCdn );

                            // Remove the "active" class from all siblings within the parent UL.
                            $( this ).parent().find( "li" ).removeClass( "active" );

                            // Add the "active" class to the currently clicked list item.
                            $( this ).addClass( "active" );

                        } );

                    // Append the newly created list item to the UL element.
                    base.$element.append( li );

                } ); // End of $.each for UL elements.

            } else if ( this.$element.is( 'select' ) ) { // If the element is a dropdown (SELECT).

                console.log( 'bootstrapThemeSelector: SELECT element selected. Populating options.' );

                // Clear any existing options.
                this.$element.empty();

                var optionSelectedMarker;

                // Iterate over each theme in the themesList.
                $.each( this.themesList, function ( i, value ) {

                    // Initialize optionSelectedMarker to null.
                    optionSelectedMarker = null;

                    // Check if the current theme matches the one stored in the cookie.
                    // If so, mark it as 'selected'.
                    if ( value.name === $.cookie( 'bootstrapTheme.name' ) ) {
                        optionSelectedMarker = "selected";
                    }

                    // Append a new option element to the select box.
                    base.$element.append(
                        "<option " + optionSelectedMarker + " value='" + value.cssCdn + "'>" + value.name + "</option>"
                    );

                } ); // End of $.each for SELECT elements.


                // Attach a change event handler to the select box.
                this.$element.on( 'change', function () {

                    // Get the currently selected option.
                    var optionSelected = $( "option:selected", this );

                    // Switch the theme based on the selected option's text and value.
                    base.switchTheme( optionSelected.text(), optionSelected.val() );

                } );

            } else {

                // If the element is neither a UL nor a SELECT, log a warning.
                console.warn( 'bootstrapThemeSelector only works with ul or select elements. Current element type is not supported.' );

            }

        }, // End of addThemesToControl method.


        /**
         * Fetches the list of available themes.
         * It can retrieve themes from a local JSON feed or from the Bootswatch API.
         */
        getThemes: function () {

            // Store a reference to 'this' (the BootstrapThemeSwitcher instance).
            var base = this;

            // --- Local Feed Processing ---

            // Check if a local feed URL is provided in the settings.
            if ( this.settings.localFeed !== null && this.settings.localFeed !== '' ) {

                // Make an AJAX request to fetch the local JSON file.
                $.ajax( {
                    url: this.settings.localFeed,
                    async: false, // Make the request synchronous.
                    dataType: 'json', // Expect JSON data.
                    success: function ( data ) {

                        // If the request is successful, update the themesList.
                        base.themesList = data.themes;

                        // Then, add these themes to the control element.
                        base.addThemesToControl();

                    },
                    error: function ( jqXHR, textStatus, errorThrown ) {

                        // Log an error message if the local feed retrieval fails.
                        console.error( "Failed to retrieve the local feed from '" + base.settings.localFeed + "'. Status: " + textStatus + ", Error: " + errorThrown );

                    }

                } ); // End of local feed AJAX call.

                // Exit the function if a local feed was processed.
                return;

            } // End of local feed block.


            // --- Bootswatch API Processing (if no local feed) ---

            // Make an AJAX request to the Bootswatch API.
            $.ajax( {
                url: this.settings.bootswatchApiUrl + "/" + this.settings.bootswatchApiVersion,
                async: false, // Make the request synchronous.
                dataType: 'json', // Expect JSON data.
                success: function ( data ) {

                    // Check if the 'themes' property exists in the returned data.
                    if ( data.themes === undefined ) {
                        // If not, return null, indicating no themes were found.
                        return null;
                    }

                    // Update the themesList with data from Bootswatch.
                    base.themesList = data.themes;

                    // Add a 'default' theme option at the beginning of the list.
                    // This often corresponds to the standard Bootstrap theme.
                    base.themesList.splice( 0, 0, {
                        name: 'default',
                        cssCdn: base.settings.defaultCssFile
                    } );

                    // After populating the themesList, update the control element.
                    base.addThemesToControl();

                }

            } ); // End of Bootswatch API AJAX call.

        }, // End of getThemes method.


        /**
         * Getter/setter for the themesList.
         *
         * @param {Array} [newThemeList] - Optional array of new themes to set.
         * @returns {Array|undefined} The current themesList if no argument is provided,
         *                            otherwise undefined after setting the new list.
         */
        themes: function ( newThemeList ) {

            // If no argument is provided, act as a getter.
            if ( newThemeList === undefined ) {

                // Return the current list of themes.
                return this.themesList;

            } else {

                // If an argument is provided, act as a setter.
                // TODO: Consider adding logic here to update the associated control
                //       after the themesList has been changed.
                this.themesList = newThemeList;

            }

        } // End of themes getter/setter method.

    }; // End of BootstrapThemeSwitcher.prototype.


    // --- jQuery Plugin Definition ---

    // Define the jQuery plugin method `bootstrapThemeSwitcher`.
    // This allows users to initialize and interact with the plugin using jQuery.
    $.fn.bootstrapThemeSwitcher = function ( option ) {

        // Capture any additional arguments passed to the plugin method.
        var args = Array.prototype.slice.call( arguments, 1 );

        // Variable to store the return value of called methods.
        var methodReturn;

        // Get a jQuery object for the current element(s).
        var $this = $( this );

        // Retrieve the plugin instance data associated with the element.
        var data = $this.data( 'bootstrapThemeSwitcher' );

        // Determine options, merging with any provided object.
        var options = typeof option === 'object' && option;

        // If no plugin instance exists for this element, create a new one.
        if ( !data ) {

            // Store the new instance on the element's data.
            $this.data( 'bootstrapThemeSwitcher', ( data = new BootstrapThemeSwitcher( this, options ) ) );

        }

        // If the 'option' argument is a string, it means a method is being called.
        if ( typeof option === 'string' ) {

            // Call the specified method on the plugin instance,
            // passing any additional arguments.
            methodReturn = data[ option ].apply( data, args );

        }

        // Return either the jQuery object (for chaining) or the method's return value.
        return ( methodReturn === undefined ) ? $this : methodReturn;

    }; // End of $.fn.bootstrapThemeSwitcher plugin definition.


    // --- Plugin Defaults ---

    // Define the default settings for the BootstrapThemeSwitcher plugin.
    // These can be overridden during initialization or via data attributes.
    $.fn.bootstrapThemeSwitcher.defaults = {

        cssThemeLink: 'bootstrapTheme', // ID for the dynamically injected CSS link.
        saveToCookie: true, // Whether to save the selected theme to a cookie.
        cookieThemeName: 'bootstrapTheme.name', // Name of the cookie for the theme name.
        cookieThemeCss: 'boostrapTheme.css', // Name of the cookie for the theme CSS URL.
        cookieExpiration: 7, // Days until the theme cookie expires.
        cookiePath: '/', // Path for the theme cookie.
        defaultCssFile: '//netdna.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css', // Default Bootstrap CSS file.
        bootswatchApiUrl: 'http://api.bootswatch.com', // URL for the Bootswatch API.
        bootswatchApiVersion: '3', // Bootswatch API version to use.
        loadFromBootswatch: true, // Whether to load themes from Bootswatch API (deprecated, use localFeed or excludeBootswatch).
        localFeed: '', // URL for a local JSON feed of themes.
        excludeBootswatch: '' // Comma-separated list of Bootswatch themes to exclude.

    }; // End of defaults.


    // --- Constructor Reference ---

    // Make the BootstrapThemeSwitcher constructor publicly accessible.
    // This can be useful for extending the plugin or creating instances manually.
    $.fn.bootstrapThemeSwitcher.Constructor = BootstrapThemeSwitcher;


    // --- No Conflict Mode ---

    // Provide a noConflict method to prevent conflicts with other jQuery plugins
    // that might use the same namespace.
    $.fn.bootstrapThemeSwitcher.noConflict = function () {

        // Restore the original `$.fn.BootstrapThemeSwitcher` if it existed.
        $.fn.BootstrapThemeSwitcher = old;

        // Return the current plugin definition to allow for chaining.
        return this;

    }; // End of noConflict method.


// Pass jQuery, window, document, and undefined to the IIFE.
} )( jQuery, window, document );