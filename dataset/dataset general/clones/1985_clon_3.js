(function (assetGen) {
  "use strict";

  // Initialize the configuration object if it doesn't exist.
  if (typeof assetGen.config === "undefined" || assetGen.config === null) {
    assetGen.config = {};
  }

  // Define the default properties for the asset generation module.
  const default_module_settings = {
    host_domain: "cdn.assetgen.io",
    element_tracking_class: "ag-image",
    enable_dynamic_resizing: true,
    allow_downscaling_on_resize: false,
    activate_pinch_zoom: false,
    picture_quality_percent: 85,
    pixel_alignment_factor: 10,
    use_https: false,
  };

  // Internal state variables related to window events.
  let is_viewport_resize_event_active = false;
  let resize_debounce_delay_ms = 250;
  let last_known_viewport_width = 0;


  /**
   * Helper function to merge properties from a source object into a target object.
   * Modifies the target object in place.
   * @param {object} destination_object - The object to merge into.
   * @param {object} source_object - The object containing new properties.
   * @returns {object} The modified destination object.
   */
  const update_settings_object = (destination_object, source_object) => {
    if (!destination_object || typeof destination_object !== 'object') {
      console.warn("Invalid destination object provided for settings update.");
      return {};
    }
    if (!source_object || typeof source_object !== 'object') {
      return destination_object;
    }
    // Using Object.assign for shallow merge, which is suitable for this type of config.
    Object.assign(destination_object, source_object);
    return destination_object;
  };


  /**
   * Main configuration object for the asset generation module.
   * This combines default settings with any user-provided overrides.
   * @type {object}
   */
  const current_module_settings = update_settings_object(
    {}, // Start with an empty object to avoid modifying default_module_settings directly.
    default_module_settings
  );
  // Merge user-defined configurations from the global assetGen object.
  update_settings_object(current_module_settings, assetGen.config);


  /**
   * Public method to update the module's configuration.
   * @param {object} new_options - An object containing new settings to merge.
   * @returns {object} The assetGen module instance for chaining.
   */
  assetGen.configure_module = (new_options) => {
    if (new_options && typeof new_options === 'object') {
      update_settings_object(current_module_settings, new_options);
    } else {
      console.warn("Attempted to configure module with invalid options. Please provide an object.");
    }
    return assetGen;
  };


  /**
   * A cross-browser implementation for retrieving elements by class name.
   * Provides a fallback for older browsers that do not support `document.getElementsByClassName`.
   * @param {string} class_name - The CSS class name to search for.
   * @returns {Array<HTMLElement>} An array of matching DOM elements.
   */
  const find_elements_by_class = (class_name) => {
    if (typeof document.getElementsByClassName !== "undefined") {
      return Array.from(document.getElementsByClassName(class_name));
    } else {
      const matching_elements = [];
      const class_regex = new RegExp(`(^|\\s)${class_name}(\\s|$)`);
      const all_document_elements = document.getElementsByTagName("*");

      for (let i = 0, total_elements = all_document_elements.length; i < total_elements; i++) {
        const current_element = all_document_elements[i];
        if (current_element.className && current_element.className.match(class_regex)) {
          matching_elements.push(current_element);
        }
      }
      return matching_elements;
    }
  };


  /**
   * Deconstructs a Uniform Resource Identifier (URI) string into its constituent parts.
   * Based on a robust URI parsing regex.
   * @param {string} uri_string - The URI string to parse.
   * @returns {object} An object containing various parsed URI components.
   */
  const decompose_uri_string = (uri_string) => {
    const uri_patterns = {
      keys: [ "full_source", "scheme", "authority_block", "user_info", "username", "password", "host_name", "port_number", "relative_path", "absolute_path", "directory_path", "file_name", "query_string", "fragment_anchor" ],
      query_parser: {
        name: "query_parameters",
        regex: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      main_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    };

    // Replace '@' with '%40' to prevent parsing issues with user:pass@host format.
    const normalized_uri_string = uri_string.replace(/@/g, "%40");
    const match_results = uri_patterns.main_parser.exec(normalized_uri_string);
    const parsed_components = {};
    let key_index = uri_patterns.keys.length;

    while (key_index--) {
      parsed_components[uri_patterns.keys[key_index]] = match_results[key_index] || "";
    }

    // Parse query string parameters.
    parsed_components[uri_patterns.query_parser.name] = {};
    parsed_components.query_string.replace(uri_patterns.query_parser.regex, (full_match, key, value) => {
      if (key) {
        parsed_components[uri_patterns.query_parser.name][key] = value;
      }
    });

    // Extract filename and extension.
    const file_parts = parsed_components.file_name.split(".");
    parsed_components.base_filename = file_parts[0];
    parsed_components.file_extension = (file_parts.length > 1 ? file_parts[file_parts.length - 1] : "");

    return parsed_components;
  };


  /**
   * Determines the appropriate URL protocol (http or https) based on the SSL setting.
   * @param {boolean} is_secure_connection - True if HTTPS should be used, false for HTTP.
   * @returns {string} The protocol string (e.g., "https://").
   */
  const determine_protocol_prefix = (is_secure_connection) => {
    return is_secure_connection ? "https://" : "http://";
  };


  /**
   * Constructs a remote image URL, handling potential protocol issues.
   * This is primarily used for fallback or external image processing.
   * @param {string} raw_url - The original URL string.
   * @returns {string} The processed remote image URL.
   */
  const construct_fallback_image_url = (raw_url) => {
    let image_path_segment;
    let protocol_match_index;
    let resultant_url;

    const parsed_uri_data = decompose_uri_string(raw_url);
    image_path_segment = parsed_uri_data.query_string ? parsed_uri_data.absolute_path + "?" + parsed_uri_data.query_string : parsed_uri_data.absolute_path;

    const protocol_search_regex = /(https?):|(\/\/)/;
    protocol_match_index = image_path_segment.search(protocol_search_regex);
    resultant_url = image_path_segment.substring(protocol_match_index);

    // Ensure a proper protocol prefix.
    if (!resultant_url.includes("://")) {
      resultant_url = resultant_url.replace("//", determine_protocol_prefix(current_module_settings.use_https));
    }
    if (resultant_url.charAt(0) === "/") {
      resultant_url = resultant_url.replace("/", determine_protocol_prefix(current_module_settings.use_https));
    }
    return resultant_url;
  };


  /**
   * Extracts the prefix path from a URL that would typically precede the image resource.
   * This is useful for identifying the base URL of the image server.
   * @param {string} full_url - The complete URL string.
   * @returns {string} The extracted prefix path.
   */
  const extract_asset_path_prefix = (full_url) => {
    const double_slash_marker = "//";
    const protocol_regex = /\/(https?):/;
    const last_double_slash_index = full_url.lastIndexOf(double_slash_marker);
    return full_url.slice(0, last_double_slash_index).replace(protocol_regex, "");
  };


  /**
   * Standardizes the image source path into a uniform format,
   * ensuring it correctly points to the asset server.
   * @param {string} source_path - The original image source string.
   * @param {string} target_server_host - The expected server host (e.g., cdn.assetgen.io).
   * @returns {string} The normalized image URL.
   */
  const normalize_source_path = (source_path, target_server_host) => {
    const double_slash_count = (source_path.match(/\/\//g) || []).length;

    if (double_slash_count > 1) {
      const parsed_data = decompose_uri_string(source_path);
      // If the authority doesn't match the expected server, rewrite it.
      return parsed_data.authority_block !== target_server_host
        ? source_path.replace(parsed_data.scheme + "://" + parsed_data.authority_block, determine_protocol_prefix(current_module_settings.use_https) + target_server_host)
        : source_path;
    }
    // If it's a relative path, prepend the full server URL.
    return determine_protocol_prefix(current_module_settings.use_https) + target_server_host + "/" + source_path;
  };


  /**
   * Checks if a given string contains any content enclosed in parentheses.
   * @param {string} input_string - The string to check.
   * @returns {boolean} True if parentheses are found with content, false otherwise.
   */
  const contains_parentheses = (input_string) => {
    const parentheses_regex = /\((.*?)\)/g;
    return parentheses_regex.test(input_string);
  };


  /**
   * Extracts all content found within parentheses in a string, returning them as a comma-separated string.
   * @param {string} input_string - The string to parse.
   * @returns {string} A string containing all captured contents, comma-separated.
   */
  const extract_content_in_parentheses = (input_string) => {
    const match_results = [];
    const parentheses_capture_regex = /\((.*?)\)/g;
    let current_match;
    while ((current_match = parentheses_capture_regex.exec(input_string)) !== null) {
      match_results.push(current_match[1].trim());
    }
    return match_results.join(",");
  };


  /**
   * Rounds a pixel size value up to the nearest multiple of a specified alignment factor.
   * @param {number} original_size - The initial pixel size.
   * @param {number} alignment_factor - The factor to round by (e.g., 10 for rounding to nearest 10).
   * @returns {number} The aligned pixel size.
   */
  const apply_pixel_alignment = (original_size, alignment_factor) => {
    if (alignment_factor <= 0) return original_size; // Avoid division by zero or negative factors
    return Math.ceil(original_size / alignment_factor) * alignment_factor;
  };


  /**
   * Determines if the current user agent corresponds to a device
   * that typically supports pinch-to-zoom (e.g., iOS devices).
   * @returns {boolean} True if the device is likely an iPhone, iPod, or iPad.
   */
  const check_pinch_zoom_device_support = () => {
    return (/iPhone|iPod|iPad/i).test(navigator.userAgent);
  };


  /**
   * Verifies if a given value is a valid finite number.
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is a number and not NaN or Infinity.
   */
  const is_numeric_value = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };


  /**
   * Formats a parameter key and value into a query string segment (e.g., "width=200").
   * Automatically extracts content from parentheses if present in the value.
   * @param {string} parameter_name - The name of the parameter.
   * @param {string} parameter_value - The value of the parameter.
   * @returns {string} The formatted parameter string.
   */
  const format_query_parameter = (parameter_name, parameter_value) => {
    if (contains_parentheses(parameter_value)) {
      return `${parameter_name}=${extract_content_in_parentheses(parameter_value)}`;
    }
    return `${parameter_name}=${parameter_value}`;
  };


  /**
   * Finds the last occurrence index of a string or regex match within an array.
   * @param {Array<string>} search_array - The array to search within.
   * @param {string} search_term_or_regex - The string or regex pattern to find.
   * @returns {number} The index of the last match, or -1 if not found.
   */
  const find_last_matching_index = (search_array, search_term_or_regex) => {
    let current_index = search_array.length;
    while (current_index--) {
      const array_item = search_array[current_index];
      if (search_term_or_regex === "") {
        if (array_item === "") {
          return current_index;
        }
      } else {
        try {
          const pattern_regex = new RegExp(search_term_or_regex);
          if (pattern_regex.test(array_item)) {
            return current_index;
          }
        } catch (e) {
          // If search_term_or_regex is not a valid regex, treat it as a literal string.
          if (array_item === search_term_or_regex) {
            return current_index;
          }
        }
      }
    }
    return -1;
  };


  /**
   * Calculates the current display zoom ratio relative to the screen width.
   * @returns {number} The zoom multiplier, or 1 if no zoom is detected.
   */
  const calculate_display_zoom_ratio = () => {
    // Avoid division by zero if window.innerWidth is somehow 0.
    if (window.innerWidth === 0) return 1;
    const zoom_multiplier = Math.round((screen.width / window.innerWidth) * 10) / 10;
    return zoom_multiplier <= 1 ? 1 : zoom_multiplier;
  };


  /**
   * Retrieves the effective pixel ratio for an element, preferring a data-dpi attribute
   * fallback to the device's pixel ratio.
   * @param {HTMLElement} target_element - The DOM element to inspect.
   * @returns {number} The determined pixel ratio. Defaults to 1 if no ratio can be found.
   */
  const determine_effective_pixel_ratio = (target_element) => {
    if (!target_element || typeof target_element.getAttribute !== 'function') {
      return 1;
    }
    const dpi_override_attr = target_element.getAttribute("data-dpi");
    const native_device_pixel_ratio = window.devicePixelRatio || 1;
    let final_dpi = is_numeric_value(dpi_override_attr) ? parseFloat(dpi_override_attr) : native_device_pixel_ratio;

    // Round non-integer DPIs to one decimal place for consistency.
    if (final_dpi % 1 !== 0) {
      final_dpi = parseFloat(final_dpi.toFixed(1));
    }
    return final_dpi;
  };


  /**
   * Obtains the server host associated with an element,
   * falling back to the global module configuration if not explicitly set.
   * @param {HTMLElement} target_element - The element to check for a custom server.
   * @returns {string} The server host string.
   */
  const retrieve_server_host = (target_element) => {
    if (!target_element || typeof target_element.getAttribute !== 'function') {
      return current_module_settings.host_domain;
    }
    return target_element.getAttribute("data-server") || current_module_settings.host_domain;
  };


  /**
   * Gets the tag name of a DOM element in lowercase.
   * @param {HTMLElement} target_element - The element whose tag name is required.
   * @returns {string} The lowercase tag name (e.g., "img", "div").
   */
  const get_element_tag_name_lowercase = (target_element) => {
    return target_element.tagName.toLowerCase();
  };


  /**
   * Fetches the current width of the browser viewport.
   * @returns {number} The viewport width in pixels. Defaults to 1024 if unable to determine.
   */
  const fetch_viewport_width = () => {
    return document.documentElement.clientWidth || (document.body && document.body.clientWidth) || 1024;
  };


  /**
   * Fetches the current height of the browser viewport.
   * @returns {number} The viewport height in pixels. Defaults to 768 if unable to determine.
   */
  const fetch_viewport_height = () => {
    return document.documentElement.clientHeight || (document.body && document.body.clientHeight) || 768;
  };


  /**
   * Retrieves the primary source attribute for an image element,
   * prioritizing `data-src` over `src`.
   * @param {HTMLElement} image_element - The image element.
   * @returns {string|null} The source URL string, or null if neither attribute is present.
   */
  const get_element_source_attribute = (image_element) => {
    if (!image_element || typeof image_element.getAttribute !== 'function') {
      return null;
    }
    return image_element.getAttribute("data-src") || image_element.getAttribute("src");
  };


  /**
   * Extracts the parameter key from a "key=value" string.
   * @param {string} param_string - The input string (e.g., "width=100").
   * @returns {string} The parameter key.
   */
  const extract_param_key = (param_string) => {
    const equals_index = param_string.indexOf("=");
    return equals_index !== -1 ? param_string.substring(0, equals_index) : param_string;
  };


  /**
   * Extracts the parameter value from a "key=value" string.
   * @param {string} param_string - The input string (e.g., "width=100").
   * @returns {string} The parameter value.
   */
  const extract_param_value = (param_string) => {
    const equals_index = param_string.indexOf("=");
    return equals_index !== -1 ? param_string.substring(equals_index + 1) : "";
  };


  /**
   * Temporarily applies CSS styles to an element, executes a callback, then restores original styles.
   * @param {HTMLElement} element - The element to modify.
   * @param {object} styles_to_apply - An object of CSS properties and values.
   * @param {function} callback - Function to execute while styles are applied.
   * @returns {*} The result of the callback function.
   */
  const with_temporary_styles = (element, styles_to_apply, callback) => {
    const original_styles = {};
    for (const prop in styles_to_apply) {
      if (styles_to_apply.hasOwnProperty(prop)) {
        original_styles[prop] = element.style[prop];
        element.style[prop] = styles_to_apply[prop];
      }
    }
    const result = callback();
    for (const prop in styles_to_apply) {
      if (styles_to_apply.hasOwnProperty(prop)) {
        element.style[prop] = original_styles[prop];
      }
    }
    return result;
  };


  /**
   * Calculates the computed pixel width and height of an HTML element.
   * Handles cases where elements are hidden or have no intrinsic size,
   * potentially falling back to parent dimensions or temporary style application.
   * @param {HTMLElement} target_element - The element for which to calculate dimensions.
   * @returns {object} An object with `width` and `height` properties.
   */
  const calculate_element_dimensions = (target_element) => {
    const dimensions = { width: 0, height: 0 };

    if (!target_element || target_element.nodeType !== 1) { // Ensure it's a valid element
      dimensions.width = fetch_viewport_width();
      dimensions.height = fetch_viewport_height();
      return dimensions;
    }

    dimensions.width = target_element.offsetWidth;
    dimensions.height = target_element.offsetHeight;

    // If element has valid dimensions, return them immediately.
    if (dimensions.width > 0 && dimensions.height > 0) {
      return dimensions;
    }

    // Special handling for images that might report 0 dimensions initially (e.g., `img` with `alt` but no `src`).
    // If an image has alt text but no `_ag_processed` flag, it might be a placeholder.
    if (get_element_tag_name_lowercase(target_element) === 'img' && target_element.alt && !target_element._ag_processed) {
      target_element._ag_processed = true; // Mark as processed for this check
      // Recursively check parent dimensions as a temporary measure.
      return calculate_element_dimensions(target_element.parentNode);
    }

    // If still no dimensions, try applying temporary styles to reveal size.
    const temp_display_styles = {
      position: "absolute",
      visibility: "hidden",
      display: "block"
    };

    const calculated_hidden_dims = with_temporary_styles(target_element, temp_display_styles, () => {
      return {
        width: target_element.offsetWidth,
        height: target_element.offsetHeight
      };
    });

    if (calculated_hidden_dims.width === 0 || calculated_hidden_dims.height === 0) {
      // If even with temporary styles, dimensions are 0, fall back to parent.
      return calculate_element_dimensions(target_element.parentNode);
    } else {
      return calculated_hidden_dims;
    }
  };


  /**
   * Creates a debounced version of a function that delays its execution.
   * Useful for events that fire rapidly, like window resizing.
   * @param {function} callback_function - The function to debounce.
   * @param {number} delay_milliseconds - The number of milliseconds to wait before executing.
   * @returns {function} The debounced function.
   */
  const throttle_function_call = (callback_function, delay_milliseconds) => {
    let timer_id;
    let execution_context;
    let execution_arguments;

    const delayed_execution = () => {
      timer_id = null;
      callback_function.apply(execution_context, execution_arguments);
    };

    return function (...args) {
      execution_context = this;
      execution_arguments = args;

      clearTimeout(timer_id);
      timer_id = setTimeout(delayed_execution, delay_milliseconds);
    };
  };

  // Expose some internal utilities for potential external use or debugging if needed.
  // This is a Type III addition, exposing a few more internal functions.
  assetGen.util = {
    findElementsByClass: find_elements_by_class,
    parseUri: decompose_uri_string,
    getProtocol: determine_protocol_prefix,
    getComputedPixelSize: calculate_element_dimensions,
    throttle: throttle_function_call
  };

  assetGen.settings = current_module_settings;

})(window.assetGen = window.assetGen || {});