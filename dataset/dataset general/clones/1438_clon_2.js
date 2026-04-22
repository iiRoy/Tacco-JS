/*!
  Readeasy.js
  v2.0
  Copyright (c) 2024 Your Name (https://example.com)
  MIT License variant

  This software is provided under the terms of the MIT License.
  You are free to use, copy, modify, merge, publish, distribute,
  sublicense, and/or sell copies of this program,
  provided that the following conditions are met:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

var g_content_element;
var g_min_char_count = 63;
var g_max_char_count = 81;
var g_element_chars_per_line;
var g_base_font_size;
var g_element_font_size;
var g_viewport_width_px;
var g_viewport_width_em;
var g_element_width_px;
var g_element_width_em;
var g_style_collections;

function initialize_readability_tool(minimum_line_chars, maximum_line_chars) {

  // Set the minimum character count, using provided value or default if undefined.
  g_min_char_count = typeof minimum_line_chars !== 'undefined' ? minimum_line_chars : g_min_char_count;

  // Set the maximum character count, using provided value or default if undefined.
  g_max_char_count = typeof maximum_line_chars !== 'undefined' ? maximum_line_chars : g_max_char_count;

  // CSS for the noUiSlider library, embedded directly.
  var slider_styling_code = '.noUi-target,.noUi-target *{-webkit-touch-callout:none;-webkit-user-select:none;-ms-touch-action:none;-ms-user-select:none;-moz-user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.noUi-base{width:100%;height:100%;position:relative}.noUi-origin{position:absolute;right:0;top:0;left:0;bottom:0}.noUi-handle{position:relative;z-index:1}.noUi-stacking .noUi-handle{z-index:10}.noUi-stacking+.noUi-origin{*z-index:-1}.noUi-state-tap .noUi-origin{-webkit-transition:left .3s,top .3s;transition:left .3s,top .3s}.noUi-state-drag *{cursor:inherit!important}.noUi-horizontal{height:18px}.noUi-horizontal .noUi-handle{width:20px;height:18px;left:-17px;top:-5px}.noUi-horizontal.noUi-extended{padding:0 15px}.noUi-horizontal.noUi-extended .noUi-origin{right:-15px}.noUi-vertical{width:18px}.noUi-vertical .noUi-handle{width:28px;height:34px;left:-6px;top:-17px}.noUi-vertical.noUi-extended{padding:15px 0}.noUi-vertical.noUi-extended .noUi-origin{bottom:-15px}.noUi-background{background:#FAFAFA;box-shadow:inset 0 1px 1px #f0f0f0}.noUi-connect{background:#3FB8AF;box-shadow:inset 0 0 3px rgba(51,51,51,.45);-webkit-transition:background 450ms;transition:background 450ms}.noUi-origin{border-radius:2px}.noUi-target{border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.noUi-target.noUi-connect{box-shadow:inset 0 0 3px rgba(51,51,51,.45),0 3px 6px -5px #BBB}.noUi-dragable{cursor:w-resize}.noUi-vertical .noUi-dragable{cursor:n-resize}.noUi-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB}.noUi-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.noUi-handle:after,.noUi-handle:before{content:"";display:block;position:absolute;height:8px;width:1px;background:#E8E7E6;left:7px;top:4px}.noUi-handle:after{left:10px}.noUi-vertical .noUi-handle:after,.noUi-vertical .noUi-handle:before{width:14px;height:1px;left:6px;top:14px}.noUi-vertical .noUi-handle:after{top:17px}[disabled] .noUi-connect,[disabled].noUi-connect{background:#B8B8B8}[disabled] .noUi-handle{cursor:not-allowed}.noUi-state-blocked .noUi-connect,.noUi-state-blocked.noUi-connect{background:#4FDACF}';

  var doc_head = document.head || document.getElementsByTagName('head')[0];
  var new_style_block = document.createElement('style');

  new_style_block.type = 'text/css';
  if (new_style_block.styleSheet) {
    new_style_block.styleSheet.cssText = slider_styling_code;
  } else {
    new_style_block.appendChild(document.createTextNode(slider_styling_code));
  }

  doc_head.appendChild(new_style_block);

  // Construct the HTML for the readability analysis panel.
  var tool_interface_html = '<div id="page_sizing_control" style="position:absolute;top:10px;left:10px;right:10px;z-index:40000;height:10px;"></div>';

  tool_interface_html += '<div id="readability_panel" style="z-index:40000;position:absolute;top:40px;left:10px;width:300px;padding:10px;height:auto;background:rgba(255,255,255,0.95);border:1px solid #ccc;font-family:Arial !important;font-size:11px !important;-webkit-box-shadow: 2px 2px 3px 0 rgba(0,0,0,0.5);box-shadow: 2px 2px 3px 0 rgba(0,0,0,0.5);">';

  tool_interface_html += '<div id="panel_alert"></div><p>Target Content Element: <input style="display:inline;font-family:Arial !important;font-size:11px !important;" id="content_selector_input"></input></p>';

  tool_interface_html += '<p>Characters Per Line Range: <input style="display:inline;width:20px;font-family:Arial !important;font-size:11px !important;" id="min_chars_input"></input> - <input style="display:inline;width:20px;font-family:Arial !important;font-size:11px !important;" id="max_chars_input"></input></p>';

  tool_interface_html += '<p>Current Characters Per Line: <span class="emphasized_value" id="current_chars_display"></span></p>';

  tool_interface_html += '<div style="border-bottom:1px solid #ccc;"></div>';

  tool_interface_html += '<p>Current Document Width em: <span class="emphasized_value" id="viewport_em_display"></span></p>';

  tool_interface_html += '<p>Media query code: <input style="display:inline;font-family:Arial !important;font-size:11px !important;" id="media_query_output"></input></p>';

  tool_interface_html += '<p>Current Document Width px: <span class="emphasized_value" id="viewport_px_display"></span></p>';

  tool_interface_html += '<p>Base Font Size: <span id="base_font_display"></span></p>';

  tool_interface_html += '<div style="border-bottom:1px solid #ccc;"></div>';

  tool_interface_html += '<p>Estimated Readable EM Range: <span id="estimated_em_range_display"></span>';

  tool_interface_html += '<p>Current Element Width em: <span class="emphasized_value" id="element_em_display"></span></p>';

  tool_interface_html += '<p>Target Element Width px: <span class="emphasized_value" id="element_px_display"></span></p>';

  tool_interface_html += '<p>Target Element Font Size: <span id="element_font_display"></span></p>';

  tool_interface_html += '<div style="border-bottom:1px solid #ccc;"></div>';

  tool_interface_html += '<p style="font-size:12px;font-weight:bold;">Readability: <span id="readability_status_display"></span></p>';

  tool_interface_html += '</div>';

  jQuery('body').prepend(tool_interface_html);

  // Initialize the width adjustment slider.
  jQuery('#page_sizing_control').noUiSlider({
    range: [1, 100],
    start: [100],
    handles: 1,
    slide: function() {
      if (jQuery(this).val() < 100) {
        jQuery("html").css({
          "width": jQuery(this).val() + "%",
          "position": "relative",
          "margin-left": "auto",
          "margin-right": "auto",
          "-webkit-box-shadow": "0px 0px 4px 0 rgba(0,0,0,0.5)",
          "box-shadow": "0px 0px 4px 0 rgba(0,0,0,0.5)"
        });
      } else {
        jQuery("html").removeAttr('style'); // Revert to default full width.
      }
      update_display_metrics();
      emphasize_updates();

      // Apply media queries based on current HTML width.
      for (var query_key in media_rule_map) {

        var current_min_width = media_rule_map[query_key].min_width;
        var current_max_width = media_rule_map[query_key].max_width;
        var current_html_width = jQuery("html").width();

        // Check various media query conditions.
        if (current_max_width !== null && current_min_width === null && current_html_width < current_max_width) {
          jQuery('#style_block_' + query_key).html(media_rule_map[query_key].add_rules);
        } else if (current_max_width === null && current_min_width !== null && current_html_width > current_min_width) {
          jQuery('#style_block_' + query_key).html(media_rule_map[query_key].add_rules);
        } else if (current_max_width !== null && current_min_width !== null && current_html_width < current_max_width && current_html_width > current_min_width) {
          // This condition seems to have a logical error in the original (should be min < html_width < max)
          // Keeping the original logic for Type II clone.
          jQuery('#style_block_' + query_key).html(media_rule_map[query_key].add_rules);
        } else {
          jQuery('#style_block_' + query_key).html(''); // Remove rules if condition not met.
        }
      }
    }
  }).change(function() {
    clear_emphasis(); // Clear highlighting after slider change.
  });

  // Define default elements to target for readability analysis.
  var default_content_selectors = ['article', 'section', 'main'];
  var no_element_message = '<p style="color:#C00;">Enter the ID / class / tag of your target element below including any "." or "#", (cannot use body tag).</p>';

  // Attempt to find a suitable target element automatically.
  for (var selector_idx in default_content_selectors) {
    g_content_element = jQuery('body ' + default_content_selectors[selector_idx] + ':first-of-type');
    if (g_content_element.length > 0) {
      jQuery('#content_selector_input').val(default_content_selectors[selector_idx]);
      update_display_metrics();
      jQuery('#estimated_em_range_display').html(estimate_em_range());
      break; // Found one, stop searching.
    } else {
      if (selector_idx == (default_content_selectors.length - 1)) {
        jQuery('#panel_alert').html(no_element_message); // Show warning if no element found.
      }
    }
  }

  // Event listener for minimum characters input.
  jQuery('#min_chars_input').on('input', function() {
    g_min_char_count = jQuery(this).val();
    update_display_metrics();
  });

  // Event listener for maximum characters input.
  jQuery('#max_chars_input').on('input', function() {
    g_max_char_count = jQuery(this).val();
    update_display_metrics();
  });

  // Event listener for target element input.
  jQuery('#content_selector_input').on('input', function() {
    var user_input_selector = jQuery(this).val();
    if (user_input_selector.length > 1) {
      g_content_element = jQuery(user_input_selector);

      if (g_content_element.length > 0) {
        jQuery('#content_selector_input').val(user_input_selector);
        jQuery('#panel_alert').html(''); // Clear any previous warnings.
        update_display_metrics();
        jQuery('#estimated_em_range_display').html(estimate_em_range());
      }

    } else {
      jQuery('#panel_alert').html(no_element_message); // Show warning if input is too short.
    }
  });

  g_style_collections = document.styleSheets; // Get all stylesheets.

  var media_rule_map = {}; // Object to store parsed media queries.
  var query_counter = 0; // Counter for unique media query IDs.

  // Iterate through all stylesheets.
  for (var sheet_index in g_style_collections) {

    var style_rules = g_style_collections[sheet_index].cssRules;

    // Iterate through rules within each stylesheet.
    for (var rule_index in style_rules) {

      var media_info = style_rules[rule_index].media;

      if (typeof media_info !== 'undefined') { // Check if it's a media rule.

        var clean_media_text = media_info.mediaText.replace(/\s+/g, '');

        var max_width_val = clean_media_text.match(/max-width:[^\(\r\n]*\)/g);

        if (max_width_val !== null) {
          max_width_val = max_width_val[0].replace('max-width:', '');
          max_width_val = max_width_val.replace('em)', '');
          max_width_val = parseFloat(max_width_val) * parseFloat(g_base_font_size); // Convert em to px.
        }

        var min_width_val = clean_media_text.match(/min-width:[^\(\r\n]*\)/g);

        if (min_width_val !== null) {
          min_width_val = min_width_val[0].replace('min-width:', '');
          min_width_val = min_width_val.replace('em)', '');
          min_width_val = parseFloat(min_width_val) * parseFloat(g_base_font_size); // Convert em to px.
        }

        var inner_media_rules = style_rules[rule_index].cssRules;
        jQuery('head').append('<style id="style_block_' + query_counter + '"></style>'); // Create dynamic style block.

        var generated_rules_string = "";

        // Collect all CSS rules within the media query.
        for (var inner_rule_index in inner_media_rules) {
          var rule_content_text = inner_media_rules[inner_rule_index].cssText;
          if (typeof rule_content_text !== 'undefined') {
            generated_rules_string += rule_content_text;
          }
        }

        // Store the parsed media query data.
        media_rule_map[query_counter] = {
          'max_width': max_width_val,
          'min_width': min_width_val,
          'add_rules': generated_rules_string
        };

        query_counter++;
      }
    }
  }
}

// Function to refresh and display all readability metrics.
function update_display_metrics() {

  jQuery('#min_chars_input').val(g_min_char_count);
  jQuery('#max_chars_input').val(g_max_char_count);

  jQuery('#current_chars_display').html(calculate_average_line_chars());
  jQuery('#element_font_display').html(retrieve_element_font_size());
  jQuery('#base_font_display').html(retrieve_base_html_font_size());
  jQuery('#viewport_px_display').html(retrieve_viewport_width_pixels());

  var viewport_width_in_ems = retrieve_viewport_width_ems();
  jQuery('#viewport_em_display').html(viewport_width_in_ems);

  // Update media query suggestion.
  jQuery('#media_query_output').val('@media (max-width: ' + viewport_width_in_ems + 'em) { /*...*/ }');

  jQuery('#element_px_display').html(retrieve_element_width_pixels());
  jQuery('#element_em_display').html(retrieve_element_width_ems());
  jQuery('#readability_status_display').html(determine_readability_status());

}

// Applies a temporary highlight to updated display elements.
function emphasize_updates() {
  jQuery('.emphasized_value').css('background-color', '#FF0');
}

// Removes the temporary highlight.
function clear_emphasis() {
  jQuery('.emphasized_value').css('background-color', 'none');
}

// Refreshes only the viewport width values.
function refresh_viewport_metrics() {
  jQuery('#viewport_px_display').html(retrieve_viewport_width_pixels());
  jQuery('#viewport_em_display').html(retrieve_viewport_width_ems());
}

// Calculates the average number of characters per line for the target element.
function calculate_average_line_chars() {
  var first_paragraph_element = jQuery(g_content_element).children('p:first');
  if (first_paragraph_element.length === 0) {
    return "N/A"; // No paragraph found.
  }
  var paragraph_content = first_paragraph_element.html();
  var paragraph_height = first_paragraph_element.height();
  var paragraph_offset_top = Math.floor(first_paragraph_element.offset().top);
  var computed_line_height = parseInt(first_paragraph_element.css('line-height'));

  if (isNaN(computed_line_height) || computed_line_height === 0) {
    // Fallback if line-height is 'normal' or 0
    computed_line_height = parseInt(first_paragraph_element.css('font-size')) * 1.2; // Common default
  }

  var number_of_lines = paragraph_height / computed_line_height;
  var effective_line_count = (number_of_lines > 1) ? (number_of_lines - 1) : number_of_lines; // Exclude last partial line.
  var trim_threshold = effective_line_count * computed_line_height + paragraph_offset_top;

  var content_words = paragraph_content.split(" ");
  var modified_paragraph_html = "";
  for (var i = 0; i < content_words.length; i++) {
    modified_paragraph_html += '<span class="word_span_element">' + content_words[i] + '</span> ';
  }
  first_paragraph_element.html(modified_paragraph_html);

  var accumulated_full_lines = "";
  jQuery('.word_span_element').each(function(index) {
    var current_word_top = Math.floor(jQuery(this).position().top);
    var current_word_text = jQuery(this).html();
    if (current_word_top < trim_threshold) {
      accumulated_full_lines += current_word_text + " ";
    }
  });

  var total_chars_in_lines = accumulated_full_lines.length;
  g_element_chars_per_line = Math.floor(total_chars_in_lines / effective_line_count);

  first_paragraph_element.html(paragraph_content); // Restore original paragraph HTML.
  return g_element_chars_per_line;
}

// Retrieves the font size of the target element.
function retrieve_element_font_size() {
  g_element_font_size = g_content_element.css('font-size');
  return g_element_font_size;
}

// Retrieves the width in pixels of the target element.
function retrieve_element_width_pixels() {
  g_element_width_px = g_content_element.css('width');
  return g_element_width_px;
}

// Calculates and retrieves the width in ems of the target element.
function retrieve_element_width_ems() {
  g_element_width_em = parseFloat(g_element_width_px) / parseFloat(g_element_font_size);
  g_element_width_em = Math.floor(g_element_width_em * 1000) / 1000; // Round to 3 decimal places.
  return g_element_width_em;
}

// Retrieves the base font size of the HTML body.
function retrieve_base_html_font_size() {
  g_base_font_size = jQuery('body').css('font-size');
  return g_base_font_size;
}

// Retrieves the width in pixels of the document body (viewport).
function retrieve_viewport_width_pixels() {
  g_viewport_width_px = jQuery('body').css('width');
  return g_viewport_width_px;
}

// Calculates and retrieves the width in ems of the document body (viewport).
function retrieve_viewport_width_ems() {
  g_viewport_width_em = parseFloat(g_viewport_width_px) / parseFloat(g_base_font_size);
  g_viewport_width_em = Math.floor(g_viewport_width_em * 1000) / 1000; // Round to 3 decimal places.
  return g_viewport_width_em;
}

// Estimates the readable EM range based on current metrics.
function estimate_em_range() {
  var ems_per_character = g_element_width_em / g_element_chars_per_line;
  var estimated_minimum_ems = ems_per_character * g_min_char_count;
  var estimated_maximum_ems = ems_per_character * g_max_char_count;
  return (Math.floor(estimated_minimum_ems * 1000) / 1000) + 'em - ' + (Math.floor(estimated_maximum_ems * 1000) / 1000) + 'em';
}

// Determines and returns the readability status.
function determine_readability_status() {
  if (g_element_chars_per_line < g_min_char_count) {
    return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO NARROW&nbsp;</span>';
  } else if (g_element_chars_per_line > g_max_char_count) {
    return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO WIDE&nbsp;</span>';
  } else {
    return '<span style="font-weight:bold;background-color:#72BF00;color:#FFF;">&nbsp;IN RANGE&nbsp;</span>';
  }
}