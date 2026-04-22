// ==UserScript==
// @name          GitHub: Enhanced Change Visualization
// @namespace     https://www.example.com/user-scripts/
// @description   Improves readability of multi-line diffs on GitHub by highlighting internal changes.
// @include       https://github.com/*/commit*
// @include       http://github.com/*/commit*
// @version       2.1.5 // Version tracking for internal comparator library
// @grant         none
// ==/UserScript==

(function run_script_in_isolated_scope() { // Encapsulates script execution

  /**
   * Initializes the enhancement process.
   * Defers the initial scan and sets up a listener for dynamic content loading.
   */
  function initialize_content_processing() {
    // Defer initial processing to ensure DOM is ready and avoid blocking.
    setTimeout(() => {
      apply_diff_enhancements();
    }, 10); // Small delay instead of 0 to ensure all initial rendering is done

    // Bind to DOM insertions to handle dynamically loaded diffs (e.g., infinite scroll)
    // Using a more robust event delegation if jQuery is available.
    if (typeof jQuery !== 'undefined') {
      jQuery(document).on('DOMNodeInserted', debounce_function(apply_diff_enhancements, 150));
    } else {
      // Fallback for environments without jQuery, or if we want to avoid it.
      // This is less efficient but ensures functionality.
      document.addEventListener('DOMNodeInserted', debounce_function(apply_diff_enhancements, 150), false);
    }
  }

  /**
   * Creates a debounced version of a function, delaying its execution.
   * The function will only be called after a specified delay since the last invocation.
   * @param {Function} callback The function to debounce.
   * @param {number} [delay_ms=120] The number of milliseconds to wait before invoking the callback.
   * @returns {Function} The debounced function.
   */
  function debounce_function(callback, delay_ms) {
    let timeout_id;
    let last_context;
    let last_arguments;

    const execute_callback = () => {
      timeout_id = null;
      callback.apply(last_context, last_arguments);
    };

    delay_ms = delay_ms || 120; // Default debounce delay

    return function(...args) {
      last_context = this;
      last_arguments = args;
      if (timeout_id) {
        clearTimeout(timeout_id);
      }
      timeout_id = setTimeout(execute_callback, delay_ms);
    };
  }

  /**
   * Scans for and enhances all un-processed diff sections on the page.
   */
  function apply_diff_enhancements() {
    const processed_class_marker = 'enhanced-diff-applied';
    const diff_containers = document.querySelectorAll(`.file:not(.${processed_class_marker})`);

    if (diff_containers.length === 0) {
      return; // No new diffs to process
    }

    diff_containers.forEach(container_element => {
      process_single_diff_file(container_element);
      container_element.classList.add(processed_class_marker);
    });
  }

  /**
   * Processes a single file's diff to highlight internal changes within lines.
   * @param {HTMLElement} file_element The DOM element representing a single file's diff.
   */
  function process_single_diff_file(file_element) {
    // Collect all relevant line elements within the file diff.
    const all_line_elements = Array.from(file_element.querySelectorAll('.data.highlight pre div'))
                               .filter(line_div => !line_div.querySelector('.inner-change-mark'));

    if (all_line_elements.length === 0) {
      return; // No lines to process or already processed.
    }

    // Extract class names to identify line types (added, deleted, context).
    const line_classification_array = all_line_elements.map(elem => elem.className);

    // Identify contiguous blocks of changes suitable for detailed diffing.
    const change_blocks = analyze_diff_structure(line_classification_array);

    // Create an instance of the text comparison engine.
    const comparator_instance = new TextComparator();

    // Apply detailed changes to each identified block.
    for (const block_info of change_blocks) {
      apply_block_level_changes(block_info, all_line_elements, comparator_instance);
    }
  }

  /**
   * Applies detailed character-level diffs within a specific chunk of changes.
   * @param {Object} block_data Information about the diff block (deleted/inserted line indices).
   * @param {Array<HTMLElement>} line_elements An array of all relevant line DOM elements.
   * @param {TextComparator} comparator The text comparison engine instance.
   */
  function apply_block_level_changes(block_data, line_elements, comparator) {
    /**
     * Extracts the text content of a line, removing the leading diff indicator (+, -, space).
     * @param {number} line_index The index of the line element in `line_elements`.
     * @returns {string} The cleaned text content of the line.
     */
    const get_clean_line_text = (line_index) => {
      const line_elem = line_elements[line_index];
      return line_elem ? line_elem.textContent.substring(1) : ''; // Drop leading char
    };

    /**
     * Prepares the "before" and "after" texts for comparison.
     * @param {Object} current_block The current diff block data.
     * @returns {[string, string]} An array containing the concatenated deleted and inserted texts.
     */
    const prepare_comparison_texts = (current_block) => {
      const deleted_text = current_block.deleted_indices.map(get_clean_line_text).join('\n');
      const inserted_text = current_block.inserted_indices.map(get_clean_line_text).join('\n');
      return [deleted_text, inserted_text];
    };

    const [original_text, revised_text] = prepare_comparison_texts(block_data);
    const comparison_result = comparator.compare_texts(original_text, revised_text);

    // Reconstruct and update the DOM for deleted lines.
    const deleted_dom_fragments = build_line_fragments('-', comparison_result.filter(item => item[0] <= 0));
    for (let k = 0; k < block_data.deleted_indices.length; k++) {
      const target_row = line_elements[block_data.deleted_indices[k]];
      if (target_row && deleted_dom_fragments[k]) {
        target_row.replaceChild(deleted_dom_fragments[k], target_row.firstChild);
      }
    }

    // Reconstruct and update the DOM for inserted lines.
    const inserted_dom_fragments = build_line_fragments('+', comparison_result.filter(item => item[0] >= 0));
    for (let k = 0; k < block_data.inserted_indices.length; k++) {
      const target_row = line_elements[block_data.inserted_indices[k]];
      if (target_row && inserted_dom_fragments[k]) {
        target_row.replaceChild(inserted_dom_fragments[k], target_row.firstChild);
      }
    }
  }

  /**
   * Reconstructs an array of document fragments for lines based on detailed diff results.
   * @param {string} line_prefix The prefix character for each line ('+' or '-').
   * @param {Array<Array>} detailed_diff The character-level diff array.
   * @returns {Array<DocumentFragment>} An array of document fragments, one for each line.
   */
  function build_line_fragments(line_prefix, detailed_diff) {
    const output_fragments = [create_document_fragment()]; // Start with an empty fragment for the first line
    let current_diff_item_idx = 0;
    let current_diff_segment;

    while ((current_diff_segment = detailed_diff[current_diff_item_idx++])) {
      const is_change = current_diff_segment[0] !== TextComparator.Operation.EQUAL; // True if delete/insert
      const segment_text_lines = current_diff_segment[1].split('\n');

      // Process the first part of the segment and append to the current fragment.
      let last_fragment = output_fragments.pop();
      last_fragment.appendChild(
        is_change ? create_span_with_class(segment_text_lines.shift(), 'inner-change-mark') : create_text_node(segment_text_lines.shift())
      );
      output_fragments.push(last_fragment);

      // For any remaining lines in this segment, create new fragments.
      for (const segment_line_text of segment_text_lines) {
        output_fragments.push(create_document_fragment_with_content(
          is_change ? create_span_with_class(segment_line_text, 'inner-change-mark') : create_text_node(segment_line_text)
        ));
      }
    }
    // Prepend the line_prefix to each generated fragment.
    return output_fragments.map(fragment => {
      const container = create_document_fragment_with_content(create_text_node(line_prefix));
      container.appendChild(fragment);
      return container;
    });
  }

  /**
   * Represents a contiguous block of diff changes.
   * @constructor
   */
  function ChangeBlock() {
    this.deleted_indices = []; // Indices of deleted lines within this block.
    this.inserted_indices = []; // Indices of inserted lines within this block.
    this.delete_sections_count = 0; // Number of distinct deletion segments.
    this.insert_sections_count = 0; // Number of distinct insertion segments.
    this.current_segment_type = ''; // 'd' for delete, 'i' for insert.
  }

  /**
   * Analyzes the line classification array to identify valid change blocks.
   * A valid block has exactly one deletion section and one insertion section.
   * @param {Array<string>} classifications An array of class names for each line.
   * @returns {Array<ChangeBlock>} An array of identified change blocks.
   */
  function analyze_diff_structure(classifications) {
    const found_blocks = [];
    let current_block = null;

    /**
     * Adds the current block to the list if it meets the criteria.
     * Resets `current_block` after adding.
     */
    const finalize_block = () => {
      if (current_block && current_block.delete_sections_count === 1 && current_block.insert_sections_count === 1) {
        // Clean up internal tracking properties before storing.
        delete current_block.current_segment_type;
        delete current_block.insert_sections_count;
        delete current_block.delete_sections_count;
        found_blocks.push(current_block);
      }
    };

    for (let line_idx = 0; line_idx < classifications.length; line_idx++) {
      const line_type_class = classifications[line_idx];

      switch (line_type_class) {
        case 'gc': // GitHub context line (diff header)
          finalize_block(); // Finalize any pending block.
          current_block = new ChangeBlock(); // Start a new block.
          break;

        case 'gd': // GitHub deleted line
          if (!current_block) { // Handle case where diff starts directly with gd/gi without gc
            current_block = new ChangeBlock();
          }
          current_block.deleted_indices.push(line_idx);
          if (current_block.current_segment_type !== 'd') {
            current_block.current_segment_type = 'd';
            current_block.delete_sections_count++;
          }
          break;

        case 'gi': // GitHub inserted line
          if (!current_block) { // Handle case where diff starts directly with gd/gi without gc
            current_block = new ChangeBlock();
          }
          current_block.inserted_indices.push(line_idx);
          if (current_block.current_segment_type !== 'i') {
            current_block.current_segment_type = 'i';
            current_block.insert_sections_count++;
          }
          break;

        default: // Other lines (e.g., context lines, unchanged lines)
          if (current_block) {
            current_block.current_segment_type = ''; // Reset segment type
          }
          break;
      }
    }
    finalize_block(); // Don't forget the last block!
    return found_blocks;
  }

  // --- DOM Utility Functions ---

  /**
   * Creates a plain text node.
   * @param {string} content The text content.
   * @returns {Text} A new Text node.
   */
  function create_text_node(content) {
    return document.createTextNode(content);
  }

  /**
   * Creates an empty DocumentFragment.
   * @returns {DocumentFragment} A new DocumentFragment.
   */
  function create_document_fragment() {
    return document.createDocumentFragment();
  }

  /**
   * Creates a DocumentFragment and appends a child node to it.
   * @param {Node} child_node The node to append.
   * @returns {DocumentFragment} A new DocumentFragment with the child.
   */
  function create_document_fragment_with_content(child_node) {
    const fragment = document.createDocumentFragment();
    if (child_node) {
      fragment.appendChild(child_node);
    }
    return fragment;
  }

  /**
   * Creates a span element with specified text content and a class.
   * @param {string} content The text content for the span.
   * @param {string} class_name The class name to apply.
   * @returns {HTMLSpanElement} A new span element.
   */
  function create_span_with_class(content, class_name) {
    const span_elem = document.createElement('span');
    span_elem.textContent = content; // Using textContent for security and simplicity
    span_elem.className = class_name;
    return span_elem;
  }


  // --- Text Comparison Engine (based on google-diff-match-patch) ---
  // Renamed to TextComparator to avoid conflicts and provide clearer context.

  const TextComparator = (function() {

    /**
     * @fileoverview Computes text differences for highlighting.
     * @author original: fraser@google.com (Neil Fraser), adapted for this script.
     */

    /**
     * Constructor for the text comparison utility.
     * @constructor
     */
    function Comparator() {
      // Configurable parameters for the comparison algorithm.
      // These can be adjusted for performance vs. accuracy.
      this.comparison_timeout_seconds = 1.0; // Max time for diff computation.
      this.edit_operation_cost = 4;        // Cost of a single edit.
    }

    /**
     * Defines the types of operations in a diff result.
     * @enum {number}
     */
    Comparator.Operation = {
      DELETE: -1,
      INSERT: 1,
      EQUAL: 0
    };

    /**
     * Computes the differences between two strings.
     * Handles common prefixes/suffixes for efficiency before detailed comparison.
     * @param {string} old_content The first string (original).
     * @param {string} new_content The second string (revised).
     * @param {boolean} [use_line_mode=true] Optional: if true, uses a faster line-level diff first.
     * @param {number} [specific_deadline] Internal parameter: time by which computation must finish.
     * @returns {Array<Array>} An array of diff tuples, e.g., [[-1, 'old'], [1, 'new'], [0, 'common']].
     */
    Comparator.prototype.compare_texts = function(old_content, new_content, use_line_mode, specific_deadline) {
      if (typeof specific_deadline === 'undefined') {
        specific_deadline = (this.comparison_timeout_seconds <= 0) ?
                            Number.MAX_VALUE :
                            Date.now() + this.comparison_timeout_seconds * 1000;
      }

      // Input validation.
      if (old_content === null || new_content === null) {
        console.error('Null input to compare_texts.');
        return [];
      }

      // Early exit if texts are identical.
      if (old_content === new_content) {
        return old_content ? [[Comparator.Operation.EQUAL, old_content]] : [];
      }

      if (typeof use_line_mode === 'undefined') {
        use_line_mode = true;
      }

      // Trim common prefix for speed.
      let common_prefix_len = this.find_common_prefix_length(old_content, new_content);
      let common_prefix_str = old_content.substring(0, common_prefix_len);
      old_content = old_content.substring(common_prefix_len);
      new_content = new_content.substring(common_prefix_len);

      // Trim common suffix for speed.
      let common_suffix_len = this.find_common_suffix_length(old_content, new_content);
      let common_suffix_str = old_content.substring(old_content.length - common_suffix_len);
      old_content = old_content.substring(0, old_content.length - common_suffix_len);
      new_content = new_content.substring(0, new_content.length - common_suffix_len);

      // Perform the core diff on the remaining middle parts.
      let diff_results = this.compute_core_diff(old_content, new_content, use_line_mode, specific_deadline);

      // Restore prefix and suffix.
      if (common_prefix_str) {
        diff_results.unshift([Comparator.Operation.EQUAL, common_prefix_str]);
      }
      if (common_suffix_str) {
        diff_results.push([Comparator.Operation.EQUAL, common_suffix_str]);
      }
      this.merge_adjacent_diffs(diff_results);
      return diff_results;
    };

    /**
     * Computes the diff between two texts, assuming no common prefix or suffix.
     * @param {string} text_a The first string.
     * @param {string} text_b The second string.
     * @param {boolean} line_based_optimization Flag to use line-level diff first.
     * @param {number} deadline Time by which computation must finish.
     * @returns {Array<Array>} Array of diff tuples.
     * @private
     */
    Comparator.prototype.compute_core_diff = function(text_a, text_b, line_based_optimization, deadline) {
      // Trivial cases.
      if (!text_a) {
        return [[Comparator.Operation.INSERT, text_b]];
      }
      if (!text_b) {
        return [[Comparator.Operation.DELETE, text_a]];
      }

      // Check for half-match (one text is a substring of the other).
      const half_match_data = this.find_half_match(text_a, text_b);
      if (half_match_data) {
        const [a1, a2, b1, b2, common_middle] = half_match_data;
        const diffs_a = this.compare_texts(a1, b1, line_based_optimization, deadline);
        const diffs_b = this.compare_texts(a2, b2, line_based_optimization, deadline);
        return diffs_a.concat([[Comparator.Operation.EQUAL, common_middle]], diffs_b);
      }

      // Line-mode optimization for long texts.
      if (line_based_optimization && text_a.length > 100 && text_b.length > 100) {
        return this.process_line_mode(text_a, text_b, deadline);
      }

      // Fallback to the bisection algorithm.
      return this.bisection_diff(text_a, text_b, deadline);
    };

    /**
     * Performs a line-level diff, then refines character-by-character.
     * @param {string} text_a The first string.
     * @param {string} text_b The second string.
     * @param {number} deadline Time by which computation must finish.
     * @returns {Array<Array>} Array of diff tuples.
     * @private
     */
    Comparator.prototype.process_line_mode = function(text_a, text_b, deadline) {
      const line_mapping_result = this.map_lines_to_chars(text_a, text_b);
      let char_text_a = line_mapping_result[0];
      let char_text_b = line_mapping_result[1];
      const line_array = line_mapping_result[2];

      let diffs = this.bisection_diff(char_text_a, char_text_b, deadline);

      this.map_chars_to_lines(diffs, line_array);
      this.cleanup_semantic(diffs); // Refine diff for readability.

      // Rediff blocks that were identified as replacements.
      diffs.push([Comparator.Operation.EQUAL, '']); // Sentinel value.
      let current_pointer = 0;
      let deleted_count = 0;
      let inserted_count = 0;
      let deleted_content = '';
      let inserted_content = '';

      while (current_pointer < diffs.length) {
        const current_diff_segment = diffs[current_pointer];
        switch (current_diff_segment[0]) {
          case Comparator.Operation.INSERT:
            inserted_count++;
            inserted_content += current_diff_segment[1];
            break;
          case Comparator.Operation.DELETE:
            deleted_count++;
            deleted_content += current_diff_segment[1];
            break;
          case Comparator.Operation.EQUAL:
            if (deleted_count >= 1 && inserted_count >= 1) {
              // Found a replacement block, re-diff character-by-character.
              const refined_diff_block = this.compare_texts(deleted_content, inserted_content, false, deadline);
              const splice_start_idx = current_pointer - deleted_count - inserted_count;
              diffs.splice(splice_start_idx, deleted_count + inserted_count, ...refined_diff_block);
              current_pointer = splice_start_idx + refined_diff_block.length; // Adjust pointer.
            }
            // Reset counters for the next block.
            inserted_count = 0;
            deleted_count = 0;
            deleted_content = '';
            inserted_content = '';
            break;
        }
        current_pointer++;
      }
      diffs.pop(); // Remove the sentinel.
      return diffs;
    };


    /**
     * Implements Myers's bisection algorithm to find the shortest edit script.
     * @param {string} primary_text The first string.
     * @param {string} secondary_text The second string.
     * @param {number} process_deadline Time by which computation must finish.
     * @returns {Array<Array>} Array of diff tuples.
     * @private
     */
    Comparator.prototype.bisection_diff = function(primary_text, secondary_text, process_deadline) {
      const len1 = primary_text.length;
      const len2 = secondary_text.length;
      const max_diagonal_distance = Math.ceil((len1 + len2) / 2);
      const v_offset = max_diagonal_distance;
      const v_array_size = 2 * max_diagonal_distance + 1; // Array to store furthest x-position for each diagonal k.

      // Initialize two arrays for forward and reverse paths.
      const forward_path = new Array(v_array_size).fill(-1);
      const reverse_path = new Array(v_array_size).fill(-1);

      forward_path[v_offset + 1] = 0; // Start at (0,0) -> k=1, x=0
      reverse_path[v_offset + 1] = len1; // Start at (len1, len2) -> k=1, x=len1

      const delta = len1 - len2;
      const odd_delta = (delta % 2 !== 0); // True if total path length is odd.

      let k_start_fwd = 0; // Start of k-loop for forward path
      let k_end_fwd = 0;   // End of k-loop for forward path
      let k_start_rev = 0; // Start of k-loop for reverse path
      let k_end_rev = 0;   // End of k-loop for reverse path

      for (let d = 0; d < max_diagonal_distance; d++) {
        if (Date.now() > process_deadline) {
          break; // Timeout reached.
        }

        // Forward path computation.
        for (let k = -d + k_start_fwd; k <= d - k_end_fwd; k += 2) {
          const k_idx = v_offset + k;
          let x_pos;

          if (k === -d || (k !== d && forward_path[k_idx - 1] < forward_path[k_idx + 1])) {
            x_pos = forward_path[k_idx + 1]; // Move down (insert)
          } else {
            x_pos = forward_path[k_idx - 1] + 1; // Move right (delete)
          }
          let y_pos = x_pos - k;

          // Extend diagonal as long as content matches.
          while (x_pos < len1 && y_pos < len2 && primary_text.charAt(x_pos) === secondary_text.charAt(y_pos)) {
            x_pos++;
            y_pos++;
          }
          forward_path[k_idx] = x_pos;

          // Check for overlap with reverse path.
          if (odd_delta && (k >= (delta - d + 1)) && (k <= (delta + d - 1)) && (reverse_path[k_idx - delta] !== -1)) {
            const rev_x = reverse_path[k_idx - delta];
            if (x_pos >= rev_x) {
              // Path collision found.
              return this.build_diff_from_bisect(primary_text, secondary_text, x_pos, y_pos, deadline);
            }
          }
        }

        // Adjust k-loop bounds for forward path.
        if (forward_path[v_offset + d] === -1) {
          k_start_fwd += 2;
        }
        if (forward_path[v_offset - d] === -1) {
          k_end_fwd += 2;
        }

        // Reverse path computation.
        for (let k = -d + k_start_rev; k <= d - k_end_rev; k += 2) {
          const k_idx = v_offset + k;
          let x_pos;

          if (k === -d || (k !== d && reverse_path[k_idx - 1] < reverse_path[k_idx + 1])) {
            x_pos = reverse_path[k_idx + 1]; // Move up (insert)
          } else {
            x_pos = reverse_path[k_idx - 1] + 1; // Move left (delete)
          }
          let y_pos = x_pos - k;

          // Extend diagonal as long as content matches.
          while (x_pos > 0 && y_pos > 0 && primary_text.charAt(x_pos - 1) === secondary_text.charAt(y_pos - 1)) {
            x_pos--;
            y_pos--;
          }
          reverse_path[k_idx] = x_pos;

          // Check for overlap with forward path.
          if (!odd_delta && (k >= (delta - d)) && (k <= (delta + d)) && (forward_path[k_idx + delta] !== -1)) {
            const fwd_x = forward_path[k_idx + delta];
            if (fwd_x >= x_pos) {
              // Path collision found.
              return this.build_diff_from_bisect(primary_text, secondary_text, fwd_x, fwd_x - (k + delta), deadline);
            }
          }
        }

        // Adjust k-loop bounds for reverse path.
        if (reverse_path[v_offset + d] === -1) {
          k_start_rev += 2;
        }
        if (reverse_path[v_offset - d] === -1) {
          k_end_rev += 2;
        }
      }

      // Should not happen, but if no path found within max_diagonal_distance
      return [[Comparator.Operation.DELETE, primary_text], [Comparator.Operation.INSERT, secondary_text]];
    };

    /**
     * Constructs the diff array from the bisection point.
     * @param {string} text_a First string.
     * @param {string} text_b Second string.
     * @param {number} x The x-coordinate of the bisect point.
     * @param {number} y The y-coordinate of the bisect point.
     * @param {number} deadline Time by which computation must finish.
     * @returns {Array<Array>} Array of diff tuples.
     * @private
     */
    Comparator.prototype.build_diff_from_bisect = function(text_a, text_b, x, y, deadline) {
      const sub_diff_1 = this.compare_texts(text_a.substring(0, x), text_b.substring(0, y), false, deadline);
      const sub_diff_2 = this.compare_texts(text_a.substring(x), text_b.substring(y), false, deadline);
      return sub_diff_1.concat(sub_diff_2);
    };

    /**
     * Locates the length of the common prefix for two strings.
     * @param {string} s1 The first string.
     * @param {string} s2 The second string.
     * @returns {number} The length of the common prefix.
     * @private
     */
    Comparator.prototype.find_common_prefix_length = function(s1, s2) {
      let min_len = Math.min(s1.length, s2.length);
      for (let i = 0; i < min_len; i++) {
        if (s1.charAt(i) !== s2.charAt(i)) {
          return i;
        }
      }
      return min_len;
    };

    /**
     * Locates the length of the common suffix for two strings.
     * @param {string} s1 The first string.
     * @param {string} s2 The second string.
     * @returns {number} The length of the common suffix.
     * @private
     */
    Comparator.prototype.find_common_suffix_length = function(s1, s2) {
      let s1_len = s1.length;
      let s2_len = s2.length;
      let min_len = Math.min(s1_len, s2_len);
      for (let i = 1; i <= min_len; i++) {
        if (s1.charAt(s1_len - i) !== s2.charAt(s2_len - i)) {
          return i - 1;
        }
      }
      return min_len;
    };

    /**
     * Merges adjacent diff entries for cleaner output.
     * @param {Array<Array>} diff_array The diff array to clean.
     * @private
     */
    Comparator.prototype.merge_adjacent_diffs = function(diff_array) {
      if (!diff_array || diff_array.length === 0) {
        return;
      }

      let current_idx = 1; // Start from the second element.
      while (current_idx < diff_array.length) {
        const prev_op = diff_array[current_idx - 1][0];
        const current_op = diff_array[current_idx][0];

        if (prev_op === current_op) {
          // Merge identical adjacent operations.
          diff_array[current_idx - 1][1] += diff_array[current_idx][1];
          diff_array.splice(current_idx, 1);
        } else if (prev_op === Comparator.Operation.EQUAL && current_idx + 1 < diff_array.length &&
                   current_op !== Comparator.Operation.EQUAL &&
                   diff_array[current_idx + 1][0] !== Comparator.Operation.EQUAL) {
          // If sequence is EQUAL, DELETE/INSERT, DELETE/INSERT, try to merge.
          // This part is simplified from original d-m-p to avoid overly complex semantic cleanup
          // which is often handled by cleanup_semantic() later.
          current_idx++; // Skip complex merges for now.
        } else {
          current_idx++;
        }
      }
    };


    /**
     * Finds a 'half-match' where a significant portion of one text is common
     * to the other, potentially split.
     * @param {string} t1 First string.
     * @param {string} t2 Second string.
     * @returns {Array<string>|null} Array of [text1_a, text1_b, text2_a, text2_b, common_middle] or null.
     * @private
     */
    Comparator.prototype.find_half_match = function(t1, t2) {
      const long_text = t1.length > t2.length ? t1 : t2;
      const short_text = t1.length > t2.length ? t2 : t1;
      if (long_text.length < 10 || short_text.length < 1) { // Min length for half-match to be useful
        return null;
      }

      function check_match(long_str, short_str, start_idx) {
        const end_idx = long_str.indexOf(short_str, start_idx);
        if (end_idx !== -1) {
          return [long_str.substring(0, end_idx), long_str.substring(end_idx + short_str.length)];
        }
        return null;
      }

      // Check if short_text is a substring of long_text.
      let match_result = check_match(long_text, short_text, 0);
      if (match_result) {
        const [part_a, part_b] = match_result;
        if (t1.length > t2.length) { // t1 was long_text
          return [part_a, part_b, '', '', short_text];
        } else { // t2 was long_text
          return ['', '', part_a, part_b, short_text];
        }
      }
      return null;
    };


    /**
     * Converts a text into a sequence of unique characters representing lines,
     * and stores the full lines in a separate array.
     * This speeds up line-level diffing.
     * @param {string} text_a First text.
     * @param {string} text_b Second text.
     * @returns {Array<string|Array<string>>} [chars_a, chars_b, line_array].
     * @private
     */
    Comparator.prototype.map_lines_to_chars = function(text_a, text_b) {
      const line_array = []; // Contains each line as a string.
      const line_hash = {};  // Maps line string to its unique char representation.
      let current_char_code = 0;

      function get_char_for_line(line_str) {
        if (!line_hash.hasOwnProperty(line_str)) {
          line_hash[line_str] = String.fromCharCode(current_char_code++);
          line_array.push(line_str); // Store the actual line.
        }
        return line_hash[line_str];
      }

      const chars_a = text_a.split('\n').map(get_char_for_line).join('');
      const chars_b = text_b.split('\n').map(get_char_for_line).join('');

      return [chars_a, chars_b, line_array];
    };

    /**
     * Converts a character-based diff back to a line-based diff using the
     * original line array.
     * @param {Array<Array>} diffs The character-based diff array.
     * @param {Array<string>} line_array The array of original lines.
     * @private
     */
    Comparator.prototype.map_chars_to_lines = function(diffs, line_array) {
      for (const diff_item of diffs) {
        const text_chars = diff_item[1];
        const lines = [];
        for (const char_code_str of text_chars) {
          const line_index = char_code_str.charCodeAt(0);
          lines.push(line_array[line_index]);
        }
        diff_item[1] = lines.join('\n');
      }
    };

    /**
     * Reduces the number of changes by eliminating trivial equalities.
     * E.g., [[-1, "a"], [1, "b"], [0, "c"], [-1, "d"], [1, "e"]]
     * becomes [[-1, "ade"], [1, "bce"]] if "c" was a typo.
     * @param {Array<Array>} diffs The diff array to clean.
     * @private
     */
    Comparator.prototype.cleanup_semantic = function(diffs) {
      if (diffs.length === 0) {
        return;
      }

      let changes_found = false;
      let pointer = 1;
      while (pointer < diffs.length - 1) { // Don't look at first or last element for now.
        if (diffs[pointer - 1][0] === Comparator.Operation.EQUAL &&
            diffs[pointer + 1][0] === Comparator.Operation.EQUAL) {
          // Potential candidate for a semantic merge.
          const current_equal_text = diffs[pointer][1];
          const prev_equal_text = diffs[pointer - 1][1];
          const next_equal_text = diffs[pointer + 1][1];

          // Check if merging the current non-equal block into surrounding equals
          // would result in a shorter or more semantically meaningful diff.
          // This is a simplified version of the original d-m-p's cleanup_semantic.
          // The original is quite complex. For Type III, I'll simplify it.
          if (current_equal_text.length < this.edit_operation_cost) { // If the "equal" block is very small.
            // Try to merge.
            if (diffs[pointer][0] === Comparator.Operation.INSERT && diffs[pointer + 1][0] === Comparator.Operation.DELETE) {
              // This is a common pattern for "moved" text.
              // For simplicity, we just merge the small equal into surrounding changes.
              // A more robust implementation would check for actual moves.
              diffs[pointer - 1][1] += current_equal_text + diffs[pointer + 1][1];
              diffs.splice(pointer, 2);
              changes_found = true;
              pointer--; // Re-evaluate the new combined block.
            } else if (diffs[pointer][0] === Comparator.Operation.DELETE && diffs[pointer + 1][0] === Comparator.Operation.INSERT) {
              diffs[pointer - 1][1] += current_equal_text + diffs[pointer + 1][1];
              diffs.splice(pointer, 2);
              changes_found = true;
              pointer--;
            }
          }
        }
        pointer++;
      }

      if (changes_found) {
        this.merge_adjacent_diffs(diffs); // Re-merge after cleaning.
      }
    };


    return Comparator;
  })(); // End of TextComparator IIFE

  // Kick off the process.
  initialize_content_processing();

})(); // End of run_script_in_isolated_scope IIFE