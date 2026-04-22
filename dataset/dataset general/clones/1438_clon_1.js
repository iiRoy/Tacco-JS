/*
 * RDBL.js - Readability Helper
 *
 * Version: 1.0
 *
 * Copyright (c) 2014 Kezz Bracey (https://plus.google.com/103208006520277578989)
 *
 * License: MIT Style License - This software is open source under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */


// Global variables to store various measurements and configurations.
var $target_el;                 // The jQuery object representing the target content element.
var $min_rdbl_chx = 63;         // Minimum recommended characters per line.
var $max_rdbl_chx = 81;         // Maximum recommended characters per line.
var $el_chxperline;             // Actual characters per line of the target element.
var $base_fontsize;             // Base font size of the document body.
var $el_fontsize;               // Font size of the target element.
var $body_width_px;             // Document body width in pixels.
var $body_width_em;             // Document body width in ems.
var $el_width_px;               // Target element width in pixels.
var $el_width_em;               // Target element width in ems.
var $stylesheets;               // Reference to document's stylesheets.


/**
 * Initializes the RDBL (Readability) tool.
 *
 * @param {number} min_rdbl_chx - Optional: The minimum characters per line to consider readable.
 * @param {number} max_rdbl_chx - Optional: The maximum characters per line to consider readable.
 */
function init_rdbl(min_rdbl_chx, max_rdbl_chx) {

    // Set minimum readable characters per line, defaulting to global if not provided.
    $min_rdbl_chx = typeof min_rdbl_chx !== 'undefined' ? min_rdbl_chx : $min_rdbl_chx;

    // Set maximum readable characters per line, defaulting to global if not provided.
    $max_rdbl_chx = typeof max_rdbl_chx !== 'undefined' ? max_rdbl_chx : $max_rdbl_chx;


    // CSS for the noUiSlider library, embedded directly to avoid external requests.
    var nouislidercss = '.noUi-target,.noUi-target *{-webkit-touch-callout:none;-webkit-user-select:none;-ms-touch-action:none;-ms-user-select:none;-moz-user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.noUi-base{width:100%;height:100%;position:relative}.noUi-origin{position:absolute;right:0;top:0;left:0;bottom:0}.noUi-handle{position:relative;z-index:1}.noUi-stacking .noUi-handle{z-index:10}.noUi-stacking+.noUi-origin{*z-index:-1}.noUi-state-tap .noUi-origin{-webkit-transition:left .3s,top .3s;transition:left .3s,top .3s}.noUi-state-drag *{cursor:inherit!important}.noUi-horizontal{height:18px}.noUi-horizontal .noUi-handle{width:20px;height:18px;left:-17px;top:-5px}.noUi-horizontal.noUi-extended{padding:0 15px}.noUi-horizontal.noUi-extended .noUi-origin{right:-15px}.noUi-vertical{width:18px}.noUi-vertical .noUi-handle{width:28px;height:34px;left:-6px;top:-17px}.noUi-vertical.noUi-extended{padding:15px 0}.noUi-vertical.noUi-extended .noUi-origin{bottom:-15px}.noUi-background{background:#FAFAFA;box-shadow:inset 0 1px 1px #f0f0f0}.noUi-connect{background:#3FB8AF;box-shadow:inset 0 0 3px rgba(51,51,51,.45);-webkit-transition:background 450ms;transition:background 450ms}.noUi-origin{border-radius:2px}.noUi-target{border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.noUi-target.noUi-connect{box-shadow:inset 0 0 3px rgba(51,51,51,.45),0 3px 6px -5px #BBB}.noUi-dragable{cursor:w-resize}.noUi-vertical .noUi-dragable{cursor:n-resize}.noUi-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB}.noUi-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.noUi-handle:after,.noUi-handle:before{content:"";display:block;position:absolute;height:8px;width:1px;background:#E8E7E6;left:7px;top:4px}.noUi-handle:after{left:10px}.noUi-vertical .noUi-handle:after,.noUi-vertical .noUi-handle:before{width:14px;height:1px;left:6px;top:14px}.noUi-vertical .noUi-handle:after{top:17px}[disabled] .noUi-connect,[disabled].noUi-connect{background:#B8B8B8}[disabled] .noUi-handle{cursor:not-allowed}.noUi-state-blocked .noUi-connect,.noUi-state-blocked.noUi-connect{background:#4FDACF}';


    // Get the document head element to inject styles.
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    // Set the style type.
    style.type = 'text/css';

    // Handle IE-specific style injection.
    if (style.styleSheet) {
        style.styleSheet.cssText = nouislidercss;
    } else {
        // Standard way to add CSS to a style element.
        style.appendChild(document.createTextNode(nouislidercss));
    }

    // Append the style element to the document head.
    head.appendChild(style);


    // --- Build the RDBL display interface HTML ---
    var rdbl_display = '<div id="html_width_slider" style="position:absolute;top:10px;left:10px;right:10px;z-index:40000;height:10px;"></div>';

    rdbl_display += '<div id="rdbl_display" style="z-index:40000;position:absolute;top:40px;left:10px;width:300px;padding:10px;height:auto;background:rgba(255,255,255,0.95);border:1px solid #ccc;font-family:Arial !important;font-size:11px !important;-webkit-box-shadow: 2px 2px 3px 0 rgba(0,0,0,0.5);box-shadow: 2px 2px 3px 0 rgba(0,0,0,0.5);">';

    rdbl_display += '<div id="rdbl_warning"></div><p>Target Content Element: <input style="display:inline;font-family:Arial !important;font-size:11px !important;" id="rdbl_tgt_el"></input></p>';

    rdbl_display += '<p>Characters Per Line Range: <input style="display:inline;width:20px;font-family:Arial !important;font-size:11px !important;" id="rdbl_chx_min"></input> - <input style="display:inline;width:20px;font-family:Arial !important;font-size:11px !important;" id="rdbl_chx_max"></input></p>';

    rdbl_display += '<p>Current Characters Per Line: <span class="highlight" id="rdbl_chx_perline"></span></p>';

    rdbl_display += '<div style="border-bottom:1px solid #ccc;"></div>';

    rdbl_display += '<p>Current Document Width em: <span class="highlight" id="rdbl_body_widthem"></span></p>';

    rdbl_display += '<p>Media query code: <input style="display:inline;font-family:Arial !important;font-size:11px !important;" id="rdbl_media_query"></input></p>';

    rdbl_display += '<p>Current Document Width px: <span class="highlight" id="rdbl_body_widthpx"></span></p>';

    rdbl_display += '<p>Base Font Size: <span id="rdbl_base_fontsize"></span></p>';

    rdbl_display += '<div style="border-bottom:1px solid #ccc;"></div>';

    rdbl_display += '<p>Estimated Readable EM Range: <span id="est_em_range"></span>';

    rdbl_display += '<p>Current Element Width em: <span class="highlight" id="rdbl_widthem"></span></p>';

    rdbl_display += '<p>Target Element Width px: <span class="highlight" id="rdbl_widthpx"></span></p>';

    rdbl_display += '<p>Target Element Font Size: <span id="rdbl_fontsize"></span></p>';

    rdbl_display += '<div style="border-bottom:1px solid #ccc;"></div>';

    rdbl_display += '<p style="font-size:12px;font-weight:bold;">Readability: <span id="rdbl_status"></span></p>';

    rdbl_display += '</div>';

    // Prepend the generated HTML to the body.
    jQuery('body').prepend(rdbl_display);


    // Initialize the noUiSlider for HTML width adjustment.
    jQuery('#html_width_slider').noUiSlider({
        range: [1, 100],        // Slider range from 1% to 100%
        start: [100],           // Start at 100% width
        handles: 1,             // Only one handle for simple width adjustment
        slide: function() {
            // This function runs every time the slider handle is moved.
            if (jQuery(this).val() < 100) {
                // If width is less than 100%, apply styles to shrink HTML.
                jQuery("html").css({
                    "width": jQuery(this).val() + "%",
                    "position": "relative",
                    "margin-left": "auto",
                    "margin-right": "auto",
                    "-webkit-box-shadow": "0px 0px 4px 0 rgba(0,0,0,0.5)",
                    "box-shadow": "0px 0px 4px 0 rgba(0,0,0,0.5)"
                });
            } else {
                // If width is 100%, remove custom styles to revert to default.
                jQuery("html").removeAttr('style');
            }
            // Recalculate and display RDBL values.
            rdbl_set_values();
            // Highlight changed values.
            highlightChanged();

            // Iterate through detected media queries and apply/remove rules based on current HTML width.
            for (var q in media_query) {

                var this_min_width = media_query[q].min_width;
                var this_max_width = media_query[q].max_width;

                // Check various conditions for media query application.
                if (this_max_width !== null && this_min_width === null && jQuery("html").width() < this_max_width) {

                    jQuery('#media_' + q).html(media_query[q].add_rules);

                } else if (this_max_width === null && this_min_width !== null && jQuery("html").width() > this_min_width) {

                    jQuery('#media_' + q).html(media_query[q].add_rules);

                } else if (this_max_width !== null && this_min_width !== null && jQuery("html").width() < this_min_width && jQuery("html").width() > this_min_width) {
                    // This condition seems to have a logical error (width < min_width AND width > min_width is impossible).
                    // It should probably be (width > min_width && width < max_width) for a range.
                    // However, per Type I clone definition, I must preserve the original logic exactly.
                    jQuery('#media_' + q).html(media_query[q].add_rules);

                } else {
                    // If no media query condition is met, clear the applied rules.
                    jQuery('#media_' + q).html('');
                }
            }
        }
    }).change(function() {
        // When the slider change event fires (user releases handle), remove highlights.
        removeHighlight();
    });


    // Default target elements to try and find if no specific element is provided.
    var default_rdbl_target = ['article', 'section', 'main'];
    // Warning message displayed if no valid target element is found.
    var no_el_warning = '<p style="color:#C00;">Enter the ID / class / tag  of your target element below including any "." or "#", (can\'t use body tag).</p>';

    // Loop through default targets to find the first available content element.
    for (var tgt in default_rdbl_target) {
        $target_el = jQuery('body ' + default_rdbl_target[tgt] + ':first-of-type');
        if ($target_el.length > 0) {
            // If a target is found, set its value in the input field and update display.
            jQuery('#rdbl_tgt_el').val(default_rdbl_target[tgt]);
            rdbl_set_values();
            jQuery('#est_em_range').html(est_em_range());
            break; // Stop after finding the first suitable target.
        } else {
            // If no target is found after checking all defaults, show a warning.
            if (tgt == (default_rdbl_target.length - 1)) {
                jQuery('#rdbl_warning').html(no_el_warning);
            }
        }
    }

    // Event listener for changes in the minimum characters per line input.
    jQuery('#rdbl_chx_min').on('input', function() {
        $min_rdbl_chx = jQuery(this).val(); // Update global min value.
        rdbl_set_values();                  // Recalculate and update display.
    });

    // Event listener for changes in the maximum characters per line input.
    jQuery('#rdbl_chx_max').on('input', function() {
        $max_rdbl_chx = jQuery(this).val(); // Update global max value.
        rdbl_set_values();                  // Recalculate and update display.
    });

    // Event listener for changes in the target element input field.
    jQuery('#rdbl_tgt_el').on('input', function() {
        var entered = jQuery(this).val(); // Get the user-entered selector.
        if (entered.length > 1) {
            $target_el = jQuery(entered); // Try to select the element.

            if ($target_el.length > 0) {
                // If a valid element is found, update the input, clear warnings, and refresh display.
                jQuery('#rdbl_tgt_el').val(entered);
                jQuery('#rdbl_warning').html('');
                rdbl_set_values();
                jQuery('#est_em_range').html(est_em_range());
            }

        } else {
            // If the input is too short or empty, show the warning.
            jQuery('#rdbl_warning').html(no_el_warning);
        }
    });


    // Get all stylesheets in the document.
    $stylesheets = document.styleSheets;

    var media_query = {};       // Object to store parsed media query rules.
    var count_queries = 0;      // Counter for unique media queries.

    // Loop through each stylesheet.
    for (var i in $stylesheets) {

        var css_rules = $stylesheets[i].cssRules; // Get CSS rules from the current stylesheet.

        // Loop through each rule within the stylesheet.
        for (var r in css_rules) {

            var media = css_rules[r].media; // Get media information for the current rule.

            // Check if the rule is a media query.
            if (typeof media !== 'undefined') {

                // Clean up mediaText for parsing.
                var strip_mediaText = media.mediaText.replace(/\s+/g, '');

                // Extract max-width from the media query.
                var max_width = strip_mediaText.match(/max-width:[^\(\r\n]*\)/g);

                if (max_width !== null) {

                    max_width = max_width[0].replace('max-width:', '');
                    max_width = max_width.replace('em)', '');

                    // Convert em value to pixels based on base font size.
                    max_width = max_width * parseInt($base_fontsize);
                }

                // Extract min-width from the media query.
                var min_width = strip_mediaText.match(/min-width:[^\(\r\n]*\)/g);

                if (min_width !== null) {

                    min_width = min_width[0].replace('min-width:', '');
                    min_width = min_width.replace('em)', '');

                    // Convert em value to pixels based on base font size.
                    min_width = min_width * parseInt($base_fontsize);

                }

                var media_rules = css_rules[r].cssRules; // Get the rules defined within this media query.

                // Create a new style element in the head for dynamic media query application.
                jQuery('head').append('<style id="media_' + count_queries + '"></style>');

                var add_rules = ""; // String to accumulate CSS rules.

                // Iterate through rules inside the media query.
                for (var m in media_rules) {

                    var media_rule_text = media_rules[m].cssText;

                    if (typeof media_rule_text !== 'undefined') {

                        add_rules += media_rule_text; // Append rule text.

                    }
                }

                // Store parsed media query data.
                media_query[count_queries] = {'max_width': max_width, 'min_width': min_width, 'add_rules': add_rules};

                count_queries++; // Increment media query counter.

            }

        }

    }

} // End of init_rdbl function.


/**
 * Updates all displayed readability values in the RDBL interface.
 */
function rdbl_set_values() {

    // Update min/max character input fields.
    jQuery('#rdbl_chx_min').val($min_rdbl_chx);

    jQuery('#rdbl_chx_max').val($max_rdbl_chx);

    // Update characters per line display.
    jQuery('#rdbl_chx_perline').html(rdbl_avg_chx_line());

    // Update target element font size display.
    jQuery('#rdbl_fontsize').html(rdbl_get_font_size());

    // Update base font size display.
    jQuery('#rdbl_base_fontsize').html(rdbl_get_base_font_size());

    // Update body width in pixels display.
    jQuery('#rdbl_body_widthpx').html(rdbl_get_body_width_px());

    // Get and update body width in ems display.
    var body_ems = rdbl_get_body_width_em();
    jQuery('#rdbl_body_widthem').html(body_ems);

    // Populate the media query suggestion input.
    jQuery('#rdbl_media_query').val('@media (max-width: ' + body_ems + 'em) { /*...*/ }');

    // Update target element width in pixels display.
    jQuery('#rdbl_widthpx').html(rdbl_get_width_px());

    // Update target element width in ems display.
    jQuery('#rdbl_widthem').html(rdbl_get_width_em());

    // Update overall readability status display.
    jQuery('#rdbl_status').html(rdbl_status());

}


/**
 * Highlights changed values in the RDBL interface by setting a yellow background.
 */
function highlightChanged() {
    jQuery('.highlight').css('background-color', '#FF0');
}


/**
 * Removes highlights from values in the RDBL interface.
 */
function removeHighlight() {
    jQuery('.highlight').css('background-color', 'none');
}


/**
 * Updates only the body width values displayed in the RDBL interface.
 */
function rdbl_set_body_values() {
    jQuery('#rdbl_body_widthpx').html(rdbl_get_body_width_px());
    jQuery('#rdbl_body_widthem').html(rdbl_get_body_width_em());
}


/**
 * Calculates the average characters per line for the target element's first paragraph.
 * This function temporarily modifies the DOM to measure line breaks.
 *
 * @returns {number} The estimated average characters per line.
 */
function rdbl_avg_chx_line() {
    // Get the first paragraph child of the target element.
    var firstpar = jQuery($target_el).children('p:first');
    // Store original text content.
    var text = firstpar.html();
    // Get paragraph height.
    var parheight = firstpar.height();
    // Get paragraph top offset.
    var paroffset = Math.floor(firstpar.offset().top);
    // Get computed line-height.
    var lineheight = parseInt(firstpar.css('line-height'));
    // Calculate number of lines.
    var linecount = parheight / lineheight;
    // Consider full lines for calculation.
    var full_linecount = (linecount > 1) ? (linecount - 1) : linecount;
    // Calculate the pixel position of the end of the last full line.
    var trimafter = full_linecount * lineheight + paroffset;

    // Split the text into words.
    var words = text.split(" ");
    var replacepar = ""; // String to rebuild paragraph with spans.

    // Wrap each word in a span to measure its position.
    for (var i = 0; i < words.length; i++) {
        replacepar += '<span class="getoffset">' + words[i] + '</span> ';
    }
    firstpar.html(replacepar); // Replace original HTML with spanned words.

    var full_lines = "";     // Accumulator for text on full lines.
    var total_chx = 0;       // Total characters on full lines.

    // Iterate through each spanned word.
    jQuery('.getoffset').each(function(index) {
        var this_top = Math.floor(jQuery(this).position().top); // Get word's top position.
        var word = jQuery(this).html();

        // If the word is on a full line (before the 'trimafter' boundary).
        if (this_top < trimafter) {
            full_lines += jQuery(this).html() + " "; // Add word to full_lines.
        }
    });

    total_chx = full_lines.length; // Calculate total characters.
    $el_chxperline = Math.floor(total_chx / full_linecount); // Calculate average.

    firstpar.html(text); // Restore original paragraph HTML.
    return $el_chxperline;
}


/**
 * Retrieves the computed font size of the target element.
 *
 * @returns {string} The font size of the target element (e.g., "16px").
 */
function rdbl_get_font_size() {
    $el_fontsize = $target_el.css('font-size');
    return $el_fontsize;
}


/**
 * Retrieves the computed width of the target element in pixels.
 *
 * @returns {string} The width of the target element (e.g., "600px").
 */
function rdbl_get_width_px() {
    $el_width_px = $target_el.css('width');
    return $el_width_px;
}


/**
 * Calculates the width of the target element in ems.
 *
 * @returns {number} The width of the target element in ems, rounded to three decimal places.
 */
function rdbl_get_width_em() {
    // Convert pixel width to ems using the element's font size.
    $el_width_em = parseInt($el_width_px) / parseInt($el_fontsize);
    // Round to three decimal places.
    $el_width_em = Math.floor($el_width_em * 1000) / 1000;
    return $el_width_em;
}


/**
 * Retrieves the computed base font size of the document body.
 *
 * @returns {string} The base font size (e.g., "16px").
 */
function rdbl_get_base_font_size() {
    $base_fontsize = jQuery('body').css('font-size');
    return $base_fontsize;
}


/**
 * Retrieves the computed width of the document body in pixels.
 *
 * @returns {string} The body width (e.g., "960px").
 */
function rdbl_get_body_width_px() {
    $body_width_px = jQuery('body').css('width');
    return $body_width_px;
}


/**
 * Calculates the width of the document body in ems.
 *
 * @returns {number} The body width in ems, rounded to three decimal places.
 */
function rdbl_get_body_width_em() {
    // Convert pixel width to ems using the base font size.
    $body_width_em = parseInt($body_width_px) / parseInt($base_fontsize);
    // Round to three decimal places.
    $body_width_em = Math.floor($body_width_em * 1000) / 1000;
    return $body_width_em;
}


/**
 * Estimates the readable EM range for the current target element based on
 * the configured min/max characters per line.
 *
 * @returns {string} A string representing the estimated EM range (e.g., "30em - 45em").
 */
function est_em_range() {
    // Calculate ems per character.
    var em_per_chx = $el_width_em / $el_chxperline;
    // Estimate min and max em width for readability.
    var est_em_min = em_per_chx * $min_rdbl_chx;
    var est_em_max = em_per_chx * $max_rdbl_chx;
    // Return formatted string, rounded to three decimal places.
    return (Math.floor(est_em_min * 1000) / 1000) + 'em - ' + (Math.floor(est_em_max * 1000) / 1000) + 'em';
}


/**
 * Determines the readability status of the target element based on its
 * characters per line relative to the defined min/max.
 *
 * @returns {string} An HTML string indicating "TOO NARROW", "TOO WIDE", or "IN RANGE".
 */
function rdbl_status() {
    if ($el_chxperline < $min_rdbl_chx) {
        return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO NARROW&nbsp;</span>';
    } else if ($el_chxperline > $max_rdbl_chx) {
        return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO WIDE&nbsp;</span>';
    } else {
        return '<span style="font-weight:bold;background-color:#72BF00;color:#FFF;">&nbsp;IN RANGE&nbsp;</span>';
    }
}