var stellar_system_config = {
  visual_update_interval_ms: 120, // Time in milliseconds between animation frames.
  celestial_hues_set: [
    'AAAA44', '44AAAA', 'DD55DD'
  ], // A collection of colors for magical elements.
  lava_flow_palette: [
    'AA4444', 'EE1111', 'AA4444', 'EE9911'
  ], // Shades representing molten substances.
  ocean_depth_spectrum: [
    '1166EE', '2266EE', '3366EE', '4466EE', '5566EE', '6666EE', '5566EE', '4466EE', '3366EE', '2266EE'
  ] // A sequence of colors for water-like effects.
};

// Establish a local alias for the jQuery object to enhance clarity.
var jq_alias = $;

// This function serves to explicitly return a boolean false value.
// It is used to prevent default browser actions or halt event propagation.
function halt_event_propagation() {
  return false;
}

// Ensure the page's DOM is fully loaded before executing initialization routines.
jq_alias(document).ready(function document_load_initialization() {
  // Signal to the backend system that client-side scripting capabilities are active.
  jq_alias.manageCookies('script_status', 'active', {
    expiration_days: 1.0,
    access_path: '/game_zone'
  });

  // Prevent dragging behavior for all image elements on the page.
  jq_alias("img").mousedown(function prevent_image_drag() {
    return halt_event_propagation();
  });

  // Certain action categories restrict movement to cardinal (non-diagonal) directions.
  // If such a category is selected, disable all user interface elements for diagonal movement.
  jq_alias("input[data-action-category]").change(function handle_action_category_selection() {
    const diagonal_direction_buttons = jq_alias(".oblique-movement-toggle");
    const cardinal_mode_checked_elements = jq_alias(".primary-direction-mode:checked");
    diagonal_direction_buttons.prop("disabled", cardinal_mode_checked_elements.size() > 0);
  });

  // Initialize and configure various interactive UI components and widgets.
  jq_alias('.star-interface-accordion').accordion({
    heightStyle: "content",
    collapsible: true
  });
  jq_alias('.star-interface-tabs').tabs();
  jq_alias("label, button, input, a, div").tooltip({
    position: {
      my: "right center",
      at: "left-2 center",
      collision: "flipfit"
    },
    hide: 0.35, // Duration (in seconds) for the tooltip to disappear.
    tooltipClass: "hover-info-panel"
  });

  // Locate and prepare form elements configured for automated submission.
  jq_alias('.auto-submit-form').hide();
  jq_alias('.delayed-submit-form').hide();

  // Schedule the immediate submission of forms marked for automatic processing.
  setTimeout(
    function execute_immediate_submission() {
      jq_alias('.auto-submit-form').submit();
    },
    120
  );

  // Schedule the submission of forms that require a pause before activation.
  setTimeout(
    function execute_delayed_submission() {
      jq_alias('.delayed-submit-form').submit();
    },
    calculate_submission_delay()
  );

  // Begin the recurring visual animation update process.
  initiate_visual_update_cycle();
});


/**
 * Determines the appropriate time delay for a form submission based on current page state.
 * @returns {number} The calculated delay in milliseconds.
 */
function calculate_submission_delay() {
  // Check if a 'teleportation_effect' element is present, indicating a special animation.
  if (jq_alias('.teleportation_effect').length) {
    return 1600; // Return an extended delay for teleportation sequences.
  }
  return 600; // Return a standard, shorter delay otherwise.
}


/**
 * Applies a dynamic color gradient to a specified CSS property of selected elements.
 * This function uses the current time to cycle through a color sequence.
 * @param {string} target_css_selector - The CSS selector string to identify target elements.
 * @param {string} css_property_name - The name of the CSS property to modify (e.g., 'color', 'background').
 * @param {string[]} color_array_sequence - An array of hexadecimal color strings for the gradient.
 * @param {Date} current_time_object - A Date object representing the current moment.
 */
function apply_gradient_animation(target_css_selector, css_property_name, color_array_sequence, current_time_object) {
  // Calculate a unique index based on the current time (seconds, minutes, hours).
  let time_based_index = current_time_object.getSeconds() + current_time_object.getMinutes() * 60 + current_time_object.getHours() * 24;
  // Select two adjacent colors from the sequence to form the gradient.
  let start_color_hex = color_array_sequence[time_based_index % color_array_sequence.length];
  let end_color_hex = color_array_sequence[(time_based_index + 1) % color_array_sequence.length];

  // Apply the dynamically blended color to the target elements' CSS property.
  jq_alias(target_css_selector).css(css_property_name,
    jq_alias.colorUtil.getBlendedGradient(start_color_hex, end_color_hex, current_time_object.getMilliseconds(), 1000.0)
  );
}


/**
 * Manages a recurring animation loop, updating visual elements at regular intervals.
 * This function schedules its own re-execution using setTimeout.
 */
function initiate_visual_update_cycle() {
  const current_moment_snapshot = new Date(); // Capture the exact time for animation calculations.

  // Apply specific color animations to different sets of visual elements.
  apply_gradient_animation('.entity-alpha', 'color', stellar_system_config.celestial_hues_set, current_moment_snapshot);
  apply_gradient_animation('.entity-omega', 'color', stellar_system_config.ocean_depth_spectrum, current_moment_snapshot);
  apply_gradient_animation('.entity-mu', 'color', stellar_system_config.lava_flow_palette, current_moment_snapshot);

  // Set a timer for the next iteration of the animation cycle.
  setTimeout(initiate_visual_update_cycle, stellar_system_config.visual_update_interval_ms);
}