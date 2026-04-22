/**
 * Pick-a-Color JS v1.1.5
 *
 * Copyright 2013 Lauren Sperber and Broadstreet Ads
 *
 * This software is licensed under the MIT License.
 * For full details, see: https://github.com/lauren/pick-a-color/blob/master/LICENSE
 */
;( function ( $ ) {

    "use strict" ; /* Enforce strict mode for cleaner code. */

    $.fn.pickAColor = function ( options ) {

        // ====================================================================
        // Detect browser and device capabilities to optimize interaction.
        // ====================================================================

        var supportsTouch = 'ontouchstart' in window , // True if touch events are supported.
            smallScreen = ( parseInt( $( window ).width(), 10 ) < 767 ) ? true : false , // Check if screen width is less than 767px.
            supportsLocalStorage = 'localStorage' in window && window.localStorage !== null &&
                                   typeof JSON === 'object' , // Local Storage requires JSON object.
            isIELT10 = document.all && ! window.atob , // Special check for Internet Explorer versions less than 10.
            myCookies = document.cookie , // Access browser cookies.
            tenYearsInMilliseconds = 315360000000 , // A long time for cookie expiration.

            // Define event names based on touch support for cross-device compatibility.
            startEvent    = supportsTouch ? "touchstart.pickAColor"  : "mousedown.pickAColor" ,
            moveEvent     = supportsTouch ? "touchmove.pickAColor"   : "mousemove.pickAColor" ,
            endEvent      = supportsTouch ? "touchend.pickAColor"    : "mouseup.pickAColor" ,
            clickEvent    = supportsTouch ? "touchend.pickAColor"    : "click.pickAColor" ,
            dragEvent     = "dragging.pickAColor" , // Custom event for ongoing drag.
            endDragEvent  = "endDrag.pickAColor" ; // Custom event for drag completion.


        // ====================================================================
        // Plugin settings and default options.
        // ====================================================================

        var settings = $.extend( {} , {
            showSpectrum          : true , // Display the color spectrum for selection.
            showSavedColors       : true , // Allow users to save and recall colors.
            saveColorsPerElement  : false , // Save colors uniquely for each input element.
            fadeMenuToggle        : true , // Use fade effect for dropdown menu opening/closing.
            showAdvanced          : true , // Show advanced HSL color controls.
            showBasicColors       : true , // Display a palette of predefined basic colors.
            showHexInput          : true , // Show the hexadecimal input field.
            basicColors           : { // Predefined basic color values (hexadecimal).
                white     : 'fff' ,
                red       : 'f00' ,
                orange    : 'f60' ,
                yellow    : 'ff0' ,
                green     : '008000' ,
                blue      : '00f' ,
                purple    : '800080' ,
                black     : '000'
            }
        } , options ) ;

        // Override showBasicColors if both advanced and basic are disabled.
        // Ensures at least one color selection method is available.
        if ( ! settings.showAdvanced && ! settings.showBasicColors ) {
            settings.showBasicColors = true ;
        }

        // Determine if tabs are needed based on which sections are enabled.
        var useTabs = ( settings.showSavedColors && settings.showAdvanced ) ||
                      ( settings.showBasicColors && settings.showSavedColors ) ||
                      ( settings.showBasicColors && settings.showAdvanced ) ;


        // ====================================================================
        // Markup generation for the color picker interface.
        // ====================================================================

        var markupAfterInput = function () {

            var $markup             = $( "<div>" ).addClass( "btn-group" ) ,
                $dropdownButton     = $( "<button type='button'>" ).addClass( "btn color-dropdown dropdown-toggle" ) ,
                $dropdownColorPreview = $( "<span>" ).addClass( "color-preview current-color" ) ,
                $dropdownCaret      = $( "<span>" ).addClass( "caret" ) ,
                $dropdownContainer  = $( "<div>" ).addClass( "color-menu dropdown-menu" ) ;

            // Adjust dropdown button and container classes if hex input is hidden.
            if ( ! settings.showHexInput ) {
                $dropdownButton.addClass( "no-hex" ) ;
                $dropdownContainer.addClass( "no-hex" ) ;
            }

            // Append preview and caret to the dropdown button, then button to main markup.
            $markup.append( $dropdownButton.append( $dropdownColorPreview ).append( $dropdownCaret ) ) ;

            // Add 'small' class to container if no tabs and no spectrum are shown.
            if ( ! useTabs && ! settings.showSpectrum ) {
                $dropdownContainer.addClass( "small" ) ;
            }

            // If tabs are enabled, build the tab navigation.
            if ( useTabs ) {
                var $tabContainer = $( "<div>" ).addClass( "color-menu-tabs" ) ;

                if ( settings.showBasicColors ) {
                    $tabContainer.append( $( "<span>" ).addClass( "basicColors-tab tab tab-active" ).
                                  append( $( "<a>" ).text( "Basic Colors" ) ) ) ;
                }

                if ( settings.showSavedColors ) {
                    // Set 'tab-active' class based on whether basic colors are also shown.
                    settings.showBasicColors ? $tabContainer.append( $( "<span>" ).
                    addClass( "savedColors-tab tab" ).append( $( "<a>" ).text( "Saved Colors" ) ) ) :
                    $tabContainer.append( $( "<span>" ).addClass( "savedColors-tab tab tab-active" ).
                    append( $( "<a>" ).text( "Saved Colors" ) ) ) ;
                }

                if ( settings.showAdvanced ) {
                    $tabContainer.append( $( "<span>" ).addClass( "advanced-tab tab" ).
                    append( $( "<a>" ).text( "Advanced" ) ) ) ;
                }

                $dropdownContainer.append( $tabContainer ) ;
            }

            // If basic colors are enabled, generate their content.
            if ( settings.showBasicColors ) {
                var $basicColors = $( "<div>" ).addClass( "basicColors-content active-content" ) ;

                if ( settings.showSpectrum ) {
                    $basicColors.append( $( "<h6>" ).addClass( "color-menu-instructions" ).
                                  text( "Tap spectrum or drag band to change color" ) ) ;
                }

                var $listContainer = $( "<ul>" ).addClass( "basic-colors-list" ) ;

                $.each( settings.basicColors , function ( index , value ) {
                    var $thisColor      = $( "<li>" ).addClass( "color-item" ) ,
                        $thisLink       = $( "<a>" ).addClass( index + " color-link" ) ,
                        $colorPreview   = $( "<span>" ).addClass( "color-preview " + index ) ,
                        $colorLabel     = $( "<span>" ).addClass( "color-label" ).text( index ) ;

                    $thisLink.append( $colorPreview , $colorLabel ) ;
                    $colorPreview.append() ; // Empty append for consistency, no actual content here.

                    // Ensure the color value starts with a '#'
                    if ( value[0] !== '#' ) {
                        value = '#' + value ;
                    }
                    $colorPreview.css( 'background-color' , value ) ;

                    // If spectrum is enabled, add spectrum elements for each basic color.
                    if ( settings.showSpectrum ) {
                        var $thisSpectrum = $( "<span>" ).addClass( "color-box spectrum-" + index ) ;

                        // Special IE LT 10 spectrum rendering.
                        if ( isIELT10 ) {
                            $.each( [ 0 , 1 ] , function ( i ) {
                                if ( value !== "fff" && index !== "000" )
                                $thisSpectrum.append( $( "<span>" ).addClass( index + "-spectrum-" + i +
                                " ie-spectrum" ) ) ;
                            } ) ;
                        }

                        var $thisHighlightBand = $( "<span>" ).addClass( "highlight-band" ) ;

                        $.each( [ 0 , 1 , 2 ] , function () {
                            $thisHighlightBand.append( $( "<span>" ).addClass( "highlight-band-stripe" ) ) ;
                        } ) ;
                        $thisLink.append( $thisSpectrum.append( $thisHighlightBand ) ) ;
                    }
                    $listContainer.append( $thisColor.append( $thisLink ) ) ;
                } ) ;
                $dropdownContainer.append( $basicColors.append( $listContainer ) ) ;
            }

            // If saved colors are enabled, generate their content.
            if ( settings.showSavedColors ) {
                var activeClass = settings.showBasicColors ? 'inactive-content' : 'active-content' ,
                    $savedColors = $( "<div>" ).addClass( "savedColors-content" ).addClass( activeClass ) ;

                $savedColors.append( $( "<p>" ).addClass( "saved-colors-instructions" ).
                text( "Type in a color or use the spectrums to lighten or darken an existing color." ) ) ;
                $dropdownContainer.append( $savedColors ) ;
            }

            // If advanced controls are enabled, generate their content.
            if ( settings.showAdvanced ) {
                var activeClass = settings.showBasicColors || settings.showSavedColors ? 'inactive-content' : 'active-content' ;
                var $advanced       = $( "<div>" ).addClass( "advanced-content" ).addClass( activeClass ).
                                      append( $( "<h6>" ).addClass( "advanced-instructions" ).text( "Tap spectrum or drag band to change color" ) ) ,
                    $advancedList   = $( "<ul>" ).addClass( "advanced-list" ) ,
                    $hueItem        = $( "<li>" ).addClass( "hue-item" ) ,
                    $hueContent     = $( "<span>" ).addClass( "hue-text" ).
                                      text( "Hue: " ).append( $( "<span>" ).addClass( "hue-value" ).text( "0" ) ) ;
                var $hueSpectrum = $( "<span>" ).addClass( "color-box spectrum-hue" ) ;

                // IE LT 10 specific rendering for hue spectrum.
                if ( isIELT10 ) {
                    $.each( [ 0 , 1 , 2 , 3 , 4 , 5 , 6 ] , function ( i ) {
                        $hueSpectrum.append( $( "<span>" ).addClass( "hue-spectrum-" + i +
                        " ie-spectrum hue" ) ) ;
                    } ) ;
                }

                var $hueHighlightBand = $( "<span>" ).addClass( "highlight-band" ) ;

                $.each( [ 0 , 1 , 2 ] , function () {
                    $hueHighlightBand.append( $( "<span>" ).addClass( "highlight-band-stripe" ) ) ;
                } ) ;
                $advancedList.append( $hueItem.append( $hueContent ).append( $hueSpectrum.append( $hueHighlightBand ) ) ) ;

                var $lightnessItem      = $( "<li>" ).addClass( "lightness-item" ) ,
                    $lightnessSpectrum  = $( "<span>" ).addClass( "color-box spectrum-lightness" ) ,
                    $lightnessContent   = $( "<span>" ).addClass( "lightness-text" ).
                                          text( "Lightness: " ).append( $( "<span>" ).addClass( "lightness-value" ).text( "50%" ) ) ;

                // IE LT 10 specific rendering for lightness spectrum.
                if ( isIELT10 ) {
                    $.each( [ 0 , 1 ] , function ( i ) {
                        $lightnessSpectrum.append( $( "<span>" ).addClass( "lightness-spectrum-" + i +
                        " ie-spectrum" ) ) ;
                    } ) ;
                }

                var $lightnessHighlightBand = $( "<span>" ).addClass( "highlight-band" ) ;

                $.each( [ 0 , 1 , 2 ] , function () {
                    $lightnessHighlightBand.append( $( "<span>" ).addClass( "highlight-band-stripe" ) ) ;
                } ) ;
                $advancedList.append( $lightnessItem.
                    append( $lightnessContent ).append( $lightnessSpectrum.append( $lightnessHighlightBand ) ) ) ;

                var $saturationItem       = $( "<li>" ).addClass( "saturation-item" ) ,
                    $saturationSpectrum   = $( "<span>" ).addClass( "color-box spectrum-saturation" ) ;

                // IE LT 10 specific rendering for saturation spectrum.
                if ( isIELT10 ) {
                    $.each( [ 0 , 1 ] , function ( i ) {
                        $saturationSpectrum.append( $( "<span>" ).addClass( "saturation-spectrum-" + i +
                        " ie-spectrum" ) ) ;
                    } ) ;
                }

                var $saturationHighlightBand = $( "<span>" ).addClass( "highlight-band" ) ;

                $.each( [ 0 , 1 , 2 ] , function () {
                    $saturationHighlightBand.append( $( "<span>" ).addClass( "highlight-band-stripe" ) ) ;
                } ) ;

                var $saturationContent = $( "<span>" ).addClass( "saturation-text" ).
                                         text( "Saturation: " ).append( $( "<span>" ).addClass( "saturation-value" ).text( "100%" ) ) ;
                $advancedList.append( $saturationItem.append( $saturationContent ).append( $saturationSpectrum.
                    append( $saturationHighlightBand ) ) ) ;

                var $previewItem = $( "<li>" ).addClass( "preview-item" ).append( $( "<span>" ).
                                   addClass( "preview-text" ).text( "Preview" ) ) ,
                    $preview = $( "<span>" ).addClass( "color-preview advanced" ).
                               append( "<button class='color-select btn btn-mini advanced' type='button'>Select</button>" ) ;

                $advancedList.append( $previewItem.append( $preview ) ) ;
                $dropdownContainer.append( $advanced.append( $advancedList ) ) ;
            }

            $markup.append( $dropdownContainer ) ; // Add the completed dropdown container to the main markup.
            return $markup ; // Return the generated jQuery object.
        } ;

        // Internal variables for color management.
        var myColorVars = {} ;

        // Internal variables for styling and layout.
        var myStyleVars = {
            rowsInDropdown     : 8 ,
            maxColsInDropdown  : 2
        } ;

        // Handle saved colors logic if the feature is enabled.
        if ( settings.showSavedColors ) { // If we're saving colors...
            var allSavedColors = [] ; // Initialize an array for all saved colors.

            if ( supportsLocalStorage && localStorage.allSavedColors ) { // Look for them in LocalStorage first.
                allSavedColors = JSON.parse( localStorage.allSavedColors ) ;
            } else if ( myCookies.match( "pickAColorSavedColors-allSavedColors=" ) ) { // If not in LS, check cookies.
                var theseCookies = myCookies.split( ";" ) ; // Split cookies into an array.

                $.each( theseCookies , function ( index ) { // Iterate through cookies to find the savedColors cookie.
                    if ( theseCookies[ index ].match( "pickAColorSavedColors-allSavedColors=" ) ) {
                        allSavedColors = theseCookies[ index ].split( "=" )[ 1 ].split( "," ) ; // Extract and split colors.
                    }
                } ) ;
            }
        }


        // ====================================================================
        // Core methods for plugin functionality.
        // ====================================================================

        var methods = {

            // Initializes each pick-a-color instance.
            initialize: function ( index ) {
                var $thisEl     = $( this ) ,
                    $thisParent ,
                    myId        ,
                    defaultColor ;

                // If no name attribute, create one using the index.
                if ( ! $thisEl.attr( "name" ) ) {
                    $thisEl.attr( "name" , "pick-a-color-" + index ) ;
                }
                myId = $thisEl.attr( "name" ) ;

                // Enforce Bootstrap-like ID and class for styling.
                $thisEl.attr( "id" , "appendedPrependedDropdownButton" ) ;
                $thisEl.addClass( "pick-a-color" ) ;

                // Convert default color to a valid hex value and update input.
                myColorVars.defaultColor = tinycolor( $thisEl.val() ).toHex() ;
                myColorVars.typedColor = myColorVars.defaultColor ;
                $thisEl.val( myColorVars.defaultColor ) ;

                // Wrap the input field with necessary markup.
                $( $thisEl ).wrap( '<div class="input-prepend input-append pick-a-color-markup" id="' + myId + '">' ) ;
                $thisParent = $( $thisEl.parent() ) ;

                // Add hex symbol and the generated color picker markup.
                settings.showHexInput ? $thisParent.prepend( '<span class="hex-pound">#</span>' ).append( markupAfterInput() )
                    : $thisParent.append( markupAfterInput() ) ; ;

                // Hide the input field if showHexInput is false.
                if ( ! settings.showHexInput ) {
                    $thisEl.attr( "type" , "hidden" ) ;
                }
            } ,

            // Updates the color preview swatch.
            updatePreview: function ( $thisEl ) {
                myColorVars.typedColor = tinycolor( $thisEl.val() ).toHex() ;
                $thisEl.siblings( ".btn-group" ).find( ".current-color" ).css( "background-color" ,
                    "#" + myColorVars.typedColor ) ;
            } ,

            // Handles the click event for the preview button.
            // Must be called with apply and an arguments array like [{thisEvent}].
            pressPreviewButton: function () {
                var thisEvent = arguments[ 0 ].thisEvent ;
                thisEvent.stopPropagation() ; // Prevent event bubbling.
                methods.toggleDropdown( thisEvent.target ) ;
            } ,

            // Opens the color picker dropdown menu.
            openDropdown: function ( button , menu ) {

                $( ".color-menu" ).each( function () { // Check all other color menus.
                    var $thisEl = $( this ) ;

                    if ( $thisEl.css( "display" ) === "block" ) { // If another menu is open,
                        var thisColorPreviewButton = $thisEl.parents( ".btn-group" ) ; // Find its button.
                        methods.closeDropdown( thisColorPreviewButton , $thisEl ) ; // Close it.
                    }
                } ) ;

                // Apply fade effect if enabled and not on touch device.
                if ( settings.fadeMenuToggle && ! supportsTouch ) {
                    $( menu ).fadeIn( "fast" ) ;
                } else {
                    $( menu ).show() ;
                }

                $( button ).addClass( "open" ) ; // Add 'open' class to the button.
            } ,

            // Closes the color picker dropdown menu.
            closeDropdown: function ( button , menu ) {

                // Apply fade effect if enabled and not on touch device.
                if ( settings.fadeMenuToggle && ! supportsTouch ) {
                    $( menu ).fadeOut( "fast" ) ;
                } else {
                    $( menu ).css( "display" , "none" ) ;
                }

                $( button ).removeClass( "open" ) ; // Remove 'open' class from the button.
            } ,

            // Closes the dropdown if it's currently open.
            // Can only be called with apply; requires an arguments array like: [{button, menu}].
            closeDropdownIfOpen: function () {
                var button = arguments[ 0 ].button ,
                    menu = arguments[ 0 ].menu ;

                if ( menu.css( "display" ) === "block" ) {
                    methods.closeDropdown( button , menu ) ;
                }
            } ,

            // Toggles the visibility of the dropdown menu.
            toggleDropdown: function ( element ) {
                var $container = $( element ).parents( ".pick-a-color-markup" ) ,
                    $button    = $container.find( ".btn-group" ) ,
                    $menu      = $container.find( ".color-menu" ) ;

                if ( $menu.css( "display" ) === "none" ) {
                    methods.openDropdown( $button , $menu ) ;
                } else {
                    methods.closeDropdown( $button , $menu ) ;
                }
            } ,

            // Makes tab elements interactive.
            tabbable: function () {
                var $this_el     = $( this ) ,
                    $myContainer = $this_el.parents( ".pick-a-color-markup" ) ;

                $this_el.click( function () {
                    var $this_el = $( this ) ,
                    // Interpret the associated content class from the tab class and get that content div.
                        contentClass = $this_el.attr( "class" ).split( " " )[ 0 ].split( "-" )[ 0 ] + "-content" ,
                        myContent = $this_el.parents( ".dropdown-menu" ).find( "." + contentClass ) ;

                    if ( ! $this_el.hasClass( "tab-active" ) ) { // If the clicked tab is not already active:
                        $myContainer.find( ".tab-active" ).removeClass( "tab-active" ) ; // Deactivate current active tab.
                        // Toggle visibility of active content.
                        $myContainer.find( ".active-content" ).
                            removeClass( "active-content" ).addClass( "inactive-content" ) ;
                        $this_el.addClass( "tab-active" ) ; // Make current tab active.
                        $( myContent ).addClass( "active-content" ).removeClass( "inactive-content" ) ; // Make its content active.
                    }
                } ) ;
            } ,

            // Calculates the color multiplier based on spectrum type and band position.
            // Takes a color and the current position of the color band.
            // Returns the value by which the color should be multiplied to get the highlighted color.
            getColorMultiplier: function ( spectrumType , position , tab ) {
                // Position of the color band as a percentage of the width of the color box.
                var spectrumWidth = ( tab === "basic" ) ? parseInt( $( ".color-box" ).first().width() , 10 ) :
                                    parseInt( $( ".advanced-list" ).find( ".color-box" ).first().width() , 10 ) ;

                // Fallback width if it's not set correctly (e.g., hidden element).
                if ( spectrumWidth === 0 ) {
                    if ( tab === "basic" ) {
                        spectrumWidth = supportsTouch ? 160 : 200 ;
                    } else {
                        spectrumWidth = supportsTouch ? 160 : 300 ;
                    }
                }

                var halfSpectrumWidth = spectrumWidth / 2 ,
                    percentOfBox = position / spectrumWidth ;

                // For spectrums that lighten and darken, recalculate percent of box relative
                // to the half of spectrum the highlight band is currently in.
                if ( spectrumType === "bidirectional" ) {
                    return ( percentOfBox <= 0.5 ) ?
                           ( 1 - ( position / halfSpectrumWidth ) ) / 2 : // Darken on left half.
                           -( ( position - halfSpectrumWidth ) / halfSpectrumWidth ) / 2 ; // Lighten on right half.
                } else {
                    return ( spectrumType === "darkenRight" ) ? -( percentOfBox / 2 ) : ( percentOfBox / 2 ) ;
                }
            } ,

            // Modifies HSL lightness based on a multiplier.
            // Reference: Less.js modifyHSLLightness function.
            modifyHSLLightness: function ( HSL , multiplier ) {
                var hsl = HSL ;
                hsl.l += multiplier ; // Adjust lightness value.
                hsl.l = Math.min( Math.max( 0 , hsl.l ) , 1 ) ; // Clamp lightness between 0 and 1.
                return tinycolor( hsl ).toHslString() ; // Convert back to HSL string.
            } ,

            // Defines the boundaries within which an element can be moved horizontally.
            getMoveableArea: function ( $element ) {
                var dimensions = {} ,
                    $elParent = $element.parent() ,
                    myWidth = $element.outerWidth() ,
                    parentWidth = $elParent.width() , // Parent width without padding/border.
                    parentLocation = $elParent.offset() ;

                dimensions.minX = parentLocation.left ; // Leftmost boundary.
                dimensions.maxX = parentWidth - myWidth ; // Rightmost boundary, considering element's own width.
                return dimensions ;
            } ,

            // Moves the highlight band horizontally based on mouse/touch input.
            moveHighlightBand: function ( $highlightBand , moveableArea , e ) {
                var hbWidth             = $( ".highlight-band" ).first().outerWidth() ,
                    threeFourthsHBWidth = hbWidth * 0.75 , // Offset to center highlight band.
                    mouseX              = supportsTouch ? e.originalEvent.pageX : e.pageX , // Get mouse or touch X coordinate.
                    newPosition         = mouseX - moveableArea.minX - threeFourthsHBWidth ; // Calculate new position relative to parent.

                // Constrain the new position within the defined moveable area.
                newPosition = Math.max( 0 , ( Math.min( newPosition , moveableArea.maxX ) ) ) ;

                $highlightBand.css( "position" , "absolute" ) ; // Ensure absolute positioning for `left` property.
                $highlightBand.css( "left" , newPosition ) ; // Apply the new position.
            } ,

            // Makes an element horizontally draggable.
            horizontallyDraggable: function () {
                $( this ).on( startEvent , function ( event ) {
                    event.preventDefault() ; // Prevent default browser behavior (e.g., text selection).
                    var $this_el = $( event.delegateTarget ) ;

                    // Change cursor style to indicate dragging.
                    $this_el.css( "cursor" , "-webkit-grabbing" ) ;
                    $this_el.css( "cursor" , "-moz-grabbing" ) ;

                    var dimensions = methods.getMoveableArea( $this_el ) ; // Get draggable boundaries.

                    $( document ).on( moveEvent , function ( e ) {
                        $this_el.trigger( dragEvent ) ; // Trigger custom drag event.
                        methods.moveHighlightBand( $this_el , dimensions , e ) ; // Move the highlight band.
                    } ).on( endEvent , function( event ) {
                        $( document ).off( moveEvent ) ; // Unbind move event for desktop.
                        $( document ).off( dragEvent ) ; // Unbind custom drag event.
                        // Reset cursor style.
                        $this_el.css( "cursor" , "-webkit-grab" ) ;
                        $this_el.css( "cursor" , "-moz-grab" ) ;
                        $this_el.trigger( endDragEvent ) ; // Trigger custom end drag event.
                        $( document ).off( endEvent ) ; // Unbind end event.
                    } ) ;
                } ).on( endEvent , function( event ) {
                    event.stopPropagation() ; // Stop event propagation for mobile.
                    $( document ).off( moveEvent ) ; // Unbind move event for mobile.
                    $( document ).off( dragEvent ) ; // Unbind custom drag event.
                } ) ;
            } ,

            // Modifies the appearance of the highlight band based on color and spectrum type.
            modifyHighlightBand: function ( $highlightBand , colorMultiplier , spectrumType ) {
                var darkGrayHSL         = { h: 0 , s:0 , l: 0.05 } , // HSL for dark gray.
                    bwMidHSL            = { h: 0 , s:0 , l: 0.5 } , // HSL for mid-gray (for B&W spectrums).
                    // Change to color of band is opposite of change to color of spectrum.
                    hbColorMultiplier   = - colorMultiplier ,
                    hbsColorMultiplier  = hbColorMultiplier * 10 , // Multiplier for stripes to ensure black/white.
                    $hbStripes          = $highlightBand.find( ".highlight-band-stripe" ) ,
                    newBandColor        = ( spectrumType === "lightenRight" ) ? // Determine new band color.
                                          methods.modifyHSLLightness( bwMidHSL , hbColorMultiplier ) :
                                          methods.modifyHSLLightness( darkGrayHSL , hbColorMultiplier ) ;

                $highlightBand.css( "border-color" , newBandColor ) ; // Apply new border color.
                $hbStripes.css( "background-color" , newBandColor ) ; // Apply new background color to stripes.
            } ,

            // Calculates the color currently highlighted by the band.
            // Must be called with apply and expects an arguments array like:
            // [{type: "basic"}] or [{type: "advanced", hsl: {h,s,l}}].
            calculateHighlightedColor: function () {
                var $thisEl         = $( this ) ,
                    hbWidth         = $( ".highlight-band" ).first().outerWidth() ,
                    halfHBWidth     = hbWidth / 2 , // Half width of the highlight band.
                    tab             = arguments[ 0 ].type ; // Determine if it's a "basic" or "advanced" tab.

                if ( tab === "basic" ) {
                    // Get the class of the parent color box and slice off "spectrum".
                    var $this_parent    = $thisEl.parent() ,
                        colorName       = $this_parent.attr( "class" ).split( "-" )[ 2 ] ,
                        colorHex        = settings.basicColors[ colorName ] ,
                        colorHsl        = tinycolor( colorHex ).toHsl() ;

                    var spectrumType ;
                    switch( colorHex ) { // Determine spectrum type based on basic color.
                        case "fff" :
                            spectrumType = "darkenRight" ;
                            break ;
                        case "000" :
                            spectrumType = "lightenRight" ;
                            break ;
                        default :
                            spectrumType = "bidirectional" ;
                    }
                } else { // Advanced tab logic.
                    // Re-set current L value to 0.5 because the color multiplier lightens
                    // and darkens against the baseline value.
                    var colorHsl            = { "h": arguments[ 0 ].hsl.h , "l": 0.5 , "s": arguments[ 0 ].hsl.s } ,
                        currentHue          = arguments[ 0 ].hsl.h ,
                        currentSaturation   = arguments[ 0 ].hsl.s ,
                        spectrumType        = "bidirectional" ,
                        $advancedContainer  = $thisEl.parents( ".advanced-list" ) ,
                        $advancedPreview    = $advancedContainer.find( ".color-preview" ) ,
                        $hueSpectrum        = $advancedContainer.find( ".spectrum-hue" ) ,
                        $saturationSpectrum = $advancedContainer.find( ".spectrum-saturation" ) ,
                        $lightnessValue     = $advancedContainer.find( ".lightness-value" ) ;
                }

                // Midpoint of the current left position of the color band.
                var highlightBandLocation   = parseInt( $thisEl.css( "left" ) , 10 ) + halfHBWidth ,
                    colorMultiplier         = methods.getColorMultiplier( spectrumType , highlightBandLocation , tab ) ,
                    highlightedColor        = methods.modifyHSLLightness( colorHsl , colorMultiplier ) ,
                    highlightedHex          = "#" + tinycolor( highlightedColor ).toHex() ;