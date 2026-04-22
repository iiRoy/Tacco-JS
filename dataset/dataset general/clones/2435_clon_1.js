//
// FILE: jQuery.ptTileSelect.js - A Time Selection Plugin for jQuery
//
// This script provides a user-friendly popup for time input into form fields.
// It allows users to easily select hours and minutes from a visual interface.
//
// @fileOverview
// This is a jQuery plugin designed to enhance form inputs by providing a graphical
// time picker. It replaces the need for manual time entry, improving UX.
//
// @version 0.8  - Current stable release.
// @author  Paul Tavares, www.purtuga.com - Original developer and maintainer.
// @see     http://pttimeselect.sourceforge.net - Official project page.
// @author  Trey Brister, www.web-standard-design.com - Contributor, feature enhancements.
// @see     http://facebook.com/designtips/ - Trey's design tips.
//
// @requires jQuery {@link http://www.jquery.com} - Core dependency.
//
//
// LICENSE INFORMATION:
//
//  Copyright (c) 2007 Paul T. (purtuga.com)
//  This software is dual-licensed under two open source licenses:
//
//  -   MIT License
//      <http://www.opensource.org/licenses/mit-license.php>
//
//  -   GPL License (GNU General Public License)
//      <http://www.opensource.org/licenses/gpl-license.php>
//
//  Users are free to choose the license that best suits their project.
//  No need to contact the author for usage under these terms.
//
//
// INSTALLATION INSTRUCTIONS:
//
// To integrate this plugin, include the provided CSS and JS files in your HTML.
// Ensure that `jquery.js` is loaded first, followed by jQuery UI stylesheet (JS not needed).
// All files should be placed within the `<head>` section of your document.
//
// Example of correct inclusion order:
//
// |    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
// |    <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.22/themes/redmond/jquery-ui.css" />
// |
// |    <link rel="stylesheet" type="text/css" href="jquery.ptTimeSelect.css" />
// |    <script type="text/javascript" src="jquery.ptTimeSelect.js"></script>
// |
//
// USAGE GUIDANCE:
//
//     -    Refer to the documentation for <$(ele).ptTimeSelect()> for detailed usage examples.
//
//
//
// LAST UPDATE DETAILS:
//
//         - $Date: 2013/11/30 20:40:21 $ - Date of last modification.
//         - $Author: Trey Brister  $    - Last person to commit changes.
//         - $Revision: 1.9 $            - Version control revision number.
//

(function( $ ) {

    // Main jQuery library definition.
    // @see    http://jquery.com/
    // @name   jQuery
    // @class  jQuery Library - The global jQuery object.

    // jQuery 'fn' definition.
    // This is where all public plugin methods are attached.
    // @see         http://jquery.com/
    // @name        fn
    // @class       jQuery Library public method anchor
    // @memberOf    jQuery

    // Namespace for all properties and methods of the ptTimeSelect plugin.
    // @namespace   ptTimeSelect
    // @memberOf    jQuery
    jQuery.ptTimeSelect = {};

    // Version number of the ptTimeSelect plugin.
    jQuery.ptTimeSelect.version = "__BUILD_VERSION_NUMBER__";

    // Default options for the ptTimeSelect plugin.
    // These can be overridden globally or on a per-instance basis.
    // @type {Object} options
    // @memberOf jQuery.ptTimeSelect
    // @see jQuery.fn.ptTimeSelect
    jQuery.ptTimeSelect.options = {
        containerClass:     undefined, // Custom CSS class for the time selector container.
        containerWidth:     '22em',    // Width of the popup container.
        hoursLabel:         'Hour',    // Text label for the hours section.
        minutesLabel:       'Minutes', // Text label for the minutes section.
        setButtonLabel:     'Set',     // Text label for the "Set" button.
        popupImage:         undefined, // Image or HTML to display as a trigger for the popup.
        onFocusDisplay:     true,      // Whether to show the popup when the input field gains focus.
        zIndex:             10,        // Z-index for the popup container, controlling its stacking order.
        onBeforeShow:       undefined, // Callback function executed before the popup is displayed.
        onClose:            undefined  // Callback function executed after the popup is closed.
    };

    // Internal initialization method.
    // This function is called once when the page loads to set up the time selection UI elements in the DOM.
    // @private
    // @memberOf jQuery.ptTimeSelect
    // @return {undefined}
    jQuery.ptTimeSelect._ptTimeSelectInit = (function() {

        // Ensure the DOM is fully loaded before manipulating it.
        jQuery(document).ready(
            function() {
                // Check if the time selection container already exists in the document.
                if ( ! jQuery('#ptTimeSelectCntr').length ) {

                    // If not, append the entire HTML structure for the time picker to the body.
                    jQuery("body").append(
                            '<div id="ptTimeSelectCntr" class="ptTimeSelectCntr">'
                        +   '    <div class="ui-widget ui-widget-content ui-corner-all">'
                        +   '        <div class="ui-widget-header ui-corner-all">'
                        +   '            <div id="ptTimeSelectCloseCntr" style="float: right;">'
                        +   '                <a href="javascript: void(0);" onclick="jQuery.ptTimeSelect.closeCntr();" '
                        +   '                        onmouseover="jQuery(this).removeClass(\'ui-state-default\').addClass(\'ui-state-hover\');" '
                        +   '                        onmouseout="jQuery(this).removeClass(\'ui-state-hover\').addClass(\'ui-state-default\');"'
                        +   '                        class="ui-corner-all ui-state-default">'
                        +   '                    <span class="ui-icon ui-icon-circle-close">X</span>'
                        +   '                </a>'
                        +   '            </div>'
                        +   '            <div id="ptTimeSelectUserTime" style="float: left;">'
                        +   '                <span id="ptTimeSelectUserSelHr">1</span> : '
                        +   '                <span id="ptTimeSelectUserSelMin">00</span> '
                        +   '                <span id="ptTimeSelectUserSelAmPm">AM</span>'
                        +   '            </div>'
                        +   '            <br style="clear: both;" /><div></div>'
                        +   '        </div>'
                        +   '        <div class="ui-widget-content ui-corner-all">'
                        +   '            <div>'
                        +   '                 <div class="ptTimeSelectHrAmPmCntr">'
                        +   '                    <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);" '
                        +   '                    >AM</a>'
                        +   '                    <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);" '
                        +   '                    >PM</a>'
                        +   '                     <br style="clear: left;" /><div></div>'
                        +   '                 </div>'
                        +   '                 <div>'
                        +   '                    <div class="ptTimeColumn ptTimeColumnLeft">'
                        +   '					  	  <div class="ptTimeSelectTimeLabelsCntr">'
                        +   '                    		  <div class="ptTimeSelectLeftPane" style="text-align: center;" class="">Hour</div>'
                        +   '                		  </div>'
                        +   '                        <div class="ui-widget-content ptTimeSelectLeftPane">'
                        +   '                            <div class="ptTimeSelectHrCntr">'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">1</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">2</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">3</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">4</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">5</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">6</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">7</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">8</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">9</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">10</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">11</a>'
                        +   '                                <a class="ptTimeSelectHr ui-state-default" href="javascript: void(0);">12</a>'
                        +   '                                <br style="clear: left;" /><div></div>'
                        +   '                            </div>'
                        +   '                        </div>'
                        +   '                    </div>'
                        +   '                    <div class="ptTimeColumn ptTimeColumnRight">'
                        +   '                        <div class="ptTimeSelectTimeLabelsCntr">'
                        +   '                            <div class="ptTimeSelectRightPane" style="text-align: center;">Minutes</div>'
                        +   '                        </div>'
                        +   '                        <div class="ui-widget-content ptTimeSelectRightPane">'
                        +   '                            <div class="ptTimeSelectMinCntr">'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">00</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">05</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">10</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">15</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">20</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">25</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">30</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">35</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">40</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">45</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">50</a>'
                        +   '                                <a class="ptTimeSelectMin ui-state-default" href="javascript: void(0);">55</a>'
                        +   '                                <br style="clear: left;" /><div></div>'
                        +   '                            </div>'
                        +   '                        </div>'
                        +   '                    </div>'
                        +   '                </div>'
                        +   '            </div>'
                        +   '            <div style="clear: left;"></div>'
                        +   '        </div>'
                        +   '        <div id="ptTimeSelectSetButton">'
                        +   '            <a href="javascript: void(0);" onclick="jQuery.ptTimeSelect.setTime()"'
                        +   '                    onmouseover="jQuery(this).removeClass(\'ui-state-default\').addClass(\'ui-state-hover\');" '
                        +   '                        onmouseout="jQuery(this).removeClass(\'ui-state-hover\').addClass(\'ui-state-default\');"'
                        +   '                        class="ui-corner-all ui-state-default">'
                        +   '                SET'
                        +   '            </a>'
                        +   '            <br style="clear: both;" /><div></div>'
                        +   '        </div>'
                        +   '        <!--[if lte IE 6.5]>'
                        +   '            <iframe style="display:block; position:absolute;top: 0;left:0;z-index:-1;'
                        +   '                filter:Alpha(Opacity=\'0\');width:3000px;height:3000px"></iframe>'
                        +   '        <![endif]-->'
                        +   '    </div></div>'
                    );

                    // Cache the main container element for performance.
                    var e = jQuery('#ptTimeSelectCntr');

                    // Bind click events to minute selection elements.
                    e.find('.ptTimeSelectMin')
                        .bind("click", function() {
                            jQuery.ptTimeSelect.setMin( $(this).text() );
                        });

                    // Bind click events to hour selection elements.
                    e.find('.ptTimeSelectHr')
                        .bind("click", function() {
                            jQuery.ptTimeSelect.setHr( $(this).text() );
                        });

                    // Bind a global mousedown event to detect clicks outside the time picker,
                    // which should trigger its closure.
                    $(document).mousedown( jQuery.ptTimeSelect._doCheckMouseClick );
                } // End if (!jQuery('#ptTimeSelectCntr').length)
            } // End ready function
        ); // End jQuery(document).ready

    })(); // End jQuery.ptTimeSelectInit() - self-executing function


    /**
     * Sets the hour selected by the user on the popup display.
     * This function updates the visual representation of the chosen hour.
     *
     * @private
     * @param  {Integer}   h   -   Integer value representing the hour (1-12) or
     *                      the strings "AM" or "PM" for meridiem selection.
     * @return {undefined}
     *
     */
    jQuery.ptTimeSelect.setHr = function( h ) {
        // Determine if the input is an AM/PM selection or an hour value.
        if (    h.toLowerCase() == "am"
            ||  h.toLowerCase() == "pm"
        ) {
            // Update the AM/PM display.
            jQuery('#ptTimeSelectUserSelAmPm').empty().append( h );
        } else {
            // Update the hour display.
            jQuery('#ptTimeSelectUserSelHr').empty().append( h );
        }
    }; // END setHr() function


    /**
     * Sets the minutes selected by the user on the popup display.
     * This function updates the visual representation of the chosen minutes.
     *
     * @private
     * @param {Integer}    m   - Integer value representing the minutes (00, 05, ..., 55).
     * @return {undefined}
     */
    jQuery.ptTimeSelect.setMin = function( m ) {
        // Update the minutes display.
        jQuery('#ptTimeSelectUserSelMin').empty().append( m );
    }; // END setMin() function


    /**
     * Takes the time currently displayed in the popup and applies it to the
     * associated input field. It then closes the popup.
     *
     * @private
     * @return {undefined}
     */
    jQuery.ptTimeSelect.setTime = function() {
        // Construct the full time string from the displayed hour, minutes, and AM/PM.
        var tSel = jQuery('#ptTimeSelectUserSelHr').text()
                    + ":"
                    + jQuery('#ptTimeSelectUserSelMin').text()
                    + " "
                    + jQuery('#ptTimeSelectUserSelAmPm').text();

        // Get the input field that the time picker is currently active for.
        var input = jQuery(".isPtTimeSelectActive");
        // Store the original value of the input field.
        var tSelOrig = input.val();

        // Set the new time value to the input field.
        input.val( tSel );

        // If the new time is different from the original, trigger a 'change' event.
        if ( tSel != tSelOrig ) {
            input.trigger('change');
        }

        // Close the time picker container.
        this.closeCntr();

    }; // END setTime() function


    /**
     * Displays the time definition area on the page, positioned directly below
     * the input field that triggered it. It also applies custom styling based on
     * the options configured for the input element.
     *
     * @private
     * @param {Object} ele - The DOM element (input field) for which the time picker
     *                  will be displayed. This element's ID was set when
     *                  the ptTimeSelect() method was initially called.
     * @return {undefined}
     *
     */
    jQuery.ptTimeSelect.openCntr = function ( ele ) {
        // First, close any currently open time picker.
        jQuery.ptTimeSelect.closeCntr();

        // Remove the "active" class from any previously active input.
        jQuery(".isPtTimeSelectActive").removeClass("isPtTimeSelectActive");

        // Cache the time picker container and the triggering input element.
        var cntr            = jQuery("#ptTimeSelectCntr");
        var i               = jQuery(ele).eq(0).addClass("isPtTimeSelectActive"); // Add active class to current input.

        // Retrieve the options associated with this specific input field.
        var opt             = i.data("ptTimeSelectOptions");

        // Calculate the position for the popup.
        var style           = i.offset();
        style['z-index']    = opt.zIndex; // Apply the configured z-index.
        style.top           = (style.top + i.outerHeight()); // Position below the input field.

        // Apply custom width if specified in options.
        if ( opt.containerWidth ) {
            style.width = opt.containerWidth;
        }

        // Apply custom class if specified in options.
        if ( opt.containerClass ) {
            cntr.addClass( opt.containerClass );
        }

        // Apply the calculated styles to the container.
        cntr.css( style );

        // Initialize hour, minute, and meridiem values.
        var hr    = 1;
        var min   = '00';
        var tm    = 'AM';

        // Attempt to parse existing time from the input field.
        if ( i.val() ) {
            var re = /([0-9]{1,2}).*:.*([0-9]{2}).*(PM|AM)/i; // Regex to match time format.
            var match = re.exec( i.val() );
            if ( match ) {
                hr    = match[1] || 1;
                min   = match[2] || '00';
                tm    = match[3] || 'AM';
            }
        }

        // Update the displayed time in the popup with parsed or default values.
        cntr.find("#ptTimeSelectUserSelHr").empty().append( hr );
        cntr.find("#ptTimeSelectUserSelMin").empty().append( min );
        cntr.find("#ptTimeSelectUserSelAmPm").empty().append( tm );

        // Update labels for Hours and Minutes based on options.
        cntr.find(".ptTimeSelectTimeLabelsCntr .ptTimeSelectLeftPane")
            .empty().append( opt.hoursLabel );
        cntr.find(".ptTimeSelectTimeLabelsCntr .ptTimeSelectRightPane")
            .empty().append( opt.minutesLabel );

        // Update the text for the "Set" button.
        cntr.find("#ptTimeSelectSetButton a").empty().append( opt.setButtonLabel );

        // Execute the onBeforeShow callback if defined.
        if ( opt.onBeforeShow ) {
            opt.onBeforeShow( i, cntr );
        }

        // Display the time picker container with a slide-down animation.
        cntr.slideDown("fast");

    }; // END openCntr()


    /**
     * Closes (hides) the time picker popup container.
     *
     * @private
     * @param {Object} i    -   Optional. The input field for which the
     *                          container is being closed. If not provided, it
     *                          will attempt to find the currently active input.
     * @return {undefined}
     */
    jQuery.ptTimeSelect.closeCntr = function( i ) {
        // Get the time picker container element.
        var e = $("#ptTimeSelectCntr");

        // Only proceed if the container is currently visible.
        if ( e.is(":visible") == true ) {

            // Special check for IE (versions <= 6.5) due to rendering quirks.
            // If the element's offsetWidth and offsetHeight are both 0, it means it's not truly visible.
            if ( jQuery.support.tbody == false ) { // jQuery.support.tbody is a proxy for IE quirksmode.
                if ( !(e[0].offsetWidth > 0) && !(e[0].offsetHeight > 0) ) {
                    return; // Exit if not truly visible.
                }
            }

            // Hide the container, remove any custom classes, and reset its width.
            jQuery('#ptTimeSelectCntr')
                .css("display", "none")
                .removeClass()
                .css("width", "");

            // If an input 'i' was not explicitly passed, find the active one.
            if ( !i ) {
                i = $(".isPtTimeSelectActive");
            }

            // If an active input is found, remove its active class and call the onClose callback.
            if ( i ) {
                var opt = i.removeClass("isPtTimeSelectActive") // Remove active class.
                            .data("ptTimeSelectOptions");      // Retrieve options.
                if ( opt && opt.onClose ) {
                    opt.onClose( i ); // Execute onClose callback.
                }
            }
        }
        return; // Function completes.
    }; // END closeCntr()


    /**
     * Event handler for global mouse clicks.
     * This function checks if a click occurred outside the time picker popup
     * or its associated input field, and if so, closes the popup.
     *
     * @private
     * @param {jQuery.Event} ev -    The event object passed by jQuery's event system.
     * @return {undefined}
     */
    jQuery.ptTimeSelect._doCheckMouseClick = function( ev ) {
        // If the time picker container is not visible, there's nothing to close.
        if ( !$("#ptTimeSelectCntr:visible").length ) {
            return;
        }

        // Check if the click target is NOT inside the time picker container
        // AND if the target is NOT the currently active input field.
        if (   !jQuery(ev.target).closest("#ptTimeSelectCntr").length
            && jQuery(ev.target).not("input.isPtTimeSelectActive").length
        ) {
            jQuery.ptTimeSelect.closeCntr(); // Close the time picker.
        }

    }; // END jQuery.ptTimeSelect._doCheckMouseClick


    /**
     * FUNCTION: $().ptTimeSelect()
     * Attaches a ptTimeSelect widget to each matched element in the jQuery selection.
     * Matched elements must be input fields that can accept a value.
     * When an element receives focus, a time selection popup will be displayed,
     * allowing the user to define a time.
     *
     * @memberOf jQuery
     *
     * PARAMETERS:
     *
     * @param {Object}      [opt] - An object containing options to customize the time selection widget.
     *
     * @param {String}      [opt.containerClass=""] - An additional CSS class to be applied to the popup widget's container.
     *
     * @param {String}      [opt.containerWidth=""] - A CSS width value (e.g., '200px', '22em') for the popup container.
     *
     * @param {String}      [opt.hoursLabel="Hours"] - The text label displayed above the hours selection pane.
     *
     * @param {String}      [opt.minutesLabel="Minutes"] - The text label displayed above the minutes selection pane.
     *
     * @param {String}      [opt.setButtonLabel="Set"] - The text label for the button that applies the selected time.
     *
     * @param {String}      [opt.popupImage=""] - An HTML string (e.g., `<img>` tag, or plain text like "Time")
     *      that will be appended next to each input field. Clicking this element will
     *      open the time selection widget. If empty, no trigger image is added.
     *
     * @param {Integer}     [opt.zIndex=10] - The CSS `z-index` property for the popup widget,
     *      controlling its stacking order relative to other elements.
     *
     * @param {Function}    [opt.onBeforeShow=undefined] - A callback function invoked just before the widget
     *      becomes visible to the user. This function receives two arguments:
     *      1) The input field as a jQuery object, and
     *      2) The popup widget container as a jQuery object.
     *
     * @param {Function}    [opt.onClose=undefined] - A callback function invoked after the popup widget
     *      has been closed (hidden). This function receives one argument:
     *      1) The input field as a jQuery object.
     *
     * @param {Boolean}     [opt.onFocusDisplay=true] - A boolean flag (true or false) indicating whether
     *      the popup should automatically display when the input field gains focus.
     *
     *
     * RETURN VALUE:
     * @return {jQuery} The original jQuery selection object, allowing for method chaining.
     *
     *
     *
     * EXAMPLE USAGE:
     * @example
     *  // Attach the time picker to an input with id 'fooTime'.
     *  $('#fooTime').ptTimeSelect();
     *
     */
    jQuery.fn.ptTimeSelect = function ( opt ) {
        // Iterate over each element in the jQuery selection.
        return this.each(function() {
            // Ensure the element is an input field. If not, skip it.
            if ( this.nodeName.toLowerCase() != 'input' ) {
                return this;
            }

            var e = jQuery(this);

            // If the element already has the ptTimeSelect plugin attached, skip it.
            if ( e.hasClass('hasPtTimeSelect') ) {
                return this;
            }

            // Create a new options object by merging defaults, global options, and instance-specific options.
            var thisOpt = {};
            thisOpt = $.extend( thisOpt, jQuery.ptTimeSelect.options, opt );

            // Mark the element as having the plugin and store its options.
            e.addClass('hasPtTimeSelect').data("ptTimeSelectOptions", thisOpt);

            // If a popup image or non-focus display is configured, create the trigger element.
            if ( thisOpt.popupImage || !thisOpt.onFocusDisplay ) {
                var img = jQuery('<span>&nbsp;</span><a href="javascript:void(0);" onclick="' +
                        'jQuery.ptTimeSelect.openCntr(jQuery(this).data(\'ptTimeSelectEle\'));">' +
                        thisOpt.popupImage + '</a>'
                    )
                    .data("ptTimeSelectEle", e); // Store a reference to the input element.
                e.after( img ); // Insert the trigger after the input field.
            }

            // If onFocusDisplay is true, bind the focus event to open the time picker.
            if ( thisOpt.onFocusDisplay ) {
                e.focus(function() {
                    jQuery.ptTimeSelect.openCntr( this );
                });
            }

            // Mobile compatibility: prevent virtual keyboard from appearing on focus/click/tap.
            $(this).on('focus click tap vclick', function ( event ) {
                event.stopImmediatePropagation(); // Stop other handlers from firing.
                event.preventDefault();           // Prevent default browser action (e.g., keyboard).

                $(this).blur(); // Remove focus from the input, effectively hiding the keyboard.
            });

            // Bind the keypress event to the document to allow setting time with the Enter key.
            $(document).keypress(function( pressedKey ) {
                var enterKey = 13;
                if ( pressedKey.which == enterKey ) {
                    jQuery.ptTimeSelect.setTime(); // Call setTime() when Enter is pressed.
                }
            });

            return this; // Allow chaining.
        });
    }; // End of jQuery.fn.ptTimeSelect

})(jQuery); // Pass jQuery object into the IIFE as '$'.