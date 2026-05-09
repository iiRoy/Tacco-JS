const shop_schedule_processor = require('./opening_hours.js');

let checker_instance = new timing_verification_system();

checker_instance.include_scenario(
  'Temporal periods',
  [
    '10:00-12:00',
    '10:00-11:00,11:00-12:00',
    '10:00-11:00;11:00-12:00',
    '10:00-14:00;12:00-14:00 off',
    '10:00-12:00;10:30-11:30',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 10:00', '2012.10.01 12:00'],
    ['2012.10.02 10:00', '2012.10.02 12:00'],
    ['2012.10.03 10:00', '2012.10.03 12:00'],
    ['2012.10.04 10:00', '2012.10.04 12:00'],
    ['2012.10.05 10:00', '2012.10.05 12:00'],
    ['2012.10.06 10:00', '2012.10.06 12:00'],
    ['2012.10.07 10:00', '2012.10.07 12:00'],
  ],
  1000 * 60 * 60 * 2 * 7,
  true
);

checker_instance.include_scenario(
  'Spanning Midnight Periods',
  [
    '22:00-02:00',
    '22:00-26:00',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 00:00', '2012.10.01 02:00'],
    ['2012.10.01 22:00', '2012.10.02 02:00'],
    ['2012.10.02 22:00', '2012.10.03 02:00'],
    ['2012.10.03 22:00', '2012.10.04 02:00'],
    ['2012.10.04 22:00', '2012.10.05 02:00'],
    ['2012.10.05 22:00', '2012.10.06 02:00'],
    ['2012.10.06 22:00', '2012.10.07 02:00'],
    ['2012.10.07 22:00', '2012.10.08 00:00'],
  ],
  1000 * 60 * 60 * 4 * 7,
  true
);

checker_instance.include_scenario(
  'Daily designations',
  [
    'Mo,Th,Sa,Su 10:00-12:00',
    'Mo,Th,Sa-Su 10:00-12:00',
    'Th,Sa-Mo 10:00-12:00',
    '10:00-12:00; Tu-We 00:00-24:00 off; Fr 00:00-24:00 off',
    '10:00-12:00; Tu-We off; Fr off',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 10:00', '2012.10.01 12:00'],
    ['2012.10.04 10:00', '2012.10.04 12:00'],
    ['2012.10.06 10:00', '2012.10.06 12:00'],
    ['2012.10.07 10:00', '2012.10.07 12:00'],
  ],
  1000 * 60 * 60 * 2 * 4,
  true
);

checker_instance.include_scenario(
  'Absent time data',
  [
    'Mo,We',
    'Mo-We; Tu off',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 0:00', '2012.10.02 0:00'],
    ['2012.10.03 0:00', '2012.10.04 0:00'],
  ],
  1000 * 60 * 60 * 24 * 2,
  true
);

checker_instance.include_scenario(
  'Cross-day periods with weekdays',
  [
    'We 22:00-02:00',
    'We 22:00-26:00',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.03 22:00', '2012.10.04 02:00'],
  ],
  1000 * 60 * 60 * 4,
  true
);

checker_instance.include_scenario(
  'Complete operational span',
  [
    '00:00-24:00',
    'Mo-Su 00:00-24:00',
    'Tu-Mo 00:00-24:00',
    'We-Tu 00:00-24:00',
    'Th-We 00:00-24:00',
    'Fr-Th 00:00-24:00',
    'Sa-Fr 00:00-24:00',
    'Su-Sa 00:00-24:00',
    '24/7',
    'Jan-Dec', /* Actual week stability varies, additional logic needed for this check */
    'Feb-Jan', /* Actual week stability varies, additional logic needed for this check */
    'Jan 01-Dec 31', /* Actual week stability varies, additional logic needed for this check */
    'week 1-54', /* Actual week stability varies, additional logic needed for this check */
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 0:00', '2012.10.08 0:00'],
  ],
  1000 * 60 * 60 * 24 * 7,
  undefined
);

checker_instance.include_scenario(
  'All-day alias usage',
  [
    'Mo,We 24/7',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 0:00', '2012.10.02 0:00'],
    ['2012.10.03 0:00', '2012.10.04 0:00'],
  ],
  1000 * 60 * 60 * 24 * 2,
  true
);

checker_instance.include_scenario(
  'Restricted weekday definitions',
  [
    'We[4,5] 10:00-12:00',
    'We[4-5] 10:00-12:00',
    'We[4],We[5] 10:00-12:00',
    'We[4] 10:00-12:00; We[-1] 10:00-12:00',
    'We[-1,-2] 10:00-12:00',
  ],
  '2012.10.01 0:00',
  '2012.11.01 0:00',
  [
    ['2012.10.24 10:00', '2012.10.24 12:00'],
    ['2012.10.31 10:00', '2012.10.31 12:00'],
  ],
  1000 * 60 * 60 * 2 * 2,
  false
);

checker_instance.include_scenario(
  'Exceptional directives',
  [
    'Mo-Fr 10:00-16:00; We 12:00-18:00'
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 10:00', '2012.10.01 16:00'],
    ['2012.10.02 10:00', '2012.10.02 16:00'],
    ['2012.10.03 12:00', '2012.10.03 18:00'], /* Note: Not 10:00-18:00 */
    ['2012.10.04 10:00', '2012.10.04 16:00'],
    ['2012.10.05 10:00', '2012.10.05 16:00'],
  ],
  1000 * 60 * 60 * 6 * 5,
  true
);

checker_instance.include_scenario(
  'Monthly spans',
  [
    'Nov-Feb 00:00-24:00',
    'Jan,Feb,Nov,Dec 00:00-24:00',
    '00:00-24:00; Mar-Oct off',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.01 00:00', '2012.03.01 00:00'],
    ['2012.11.01 00:00', '2013.01.01 00:00'],
  ],
  1000 * 60 * 60 * 24 * (31 + 29 + 30 + 31),
  false
);

checker_instance.include_scenario(
  'Weekly series',
  [
    'week 1,3 00:00-24:00',
    'week 1-3/2 00:00-24:00',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.01 00:00', '2012.01.02 00:00'],
    ['2012.01.09 00:00', '2012.01.16 00:00'],
  ],
  1000 * 60 * 60 * 24 * (1 + 7),
  false
);

checker_instance.include_scenario(
  'Alternate weekly series',
  [
    'week 2,4 00:00-24:00',
    'week 2-4/2 00:00-24:00',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.02 00:00', '2012.01.09 00:00'],
    ['2012.01.16 00:00', '2012.01.23 00:00'],
  ],
  1000 * 60 * 60 * 24 * (7 + 7),
  false
);

checker_instance.include_scenario(
  'Week range boundaries',
  [
    'week 2-54 00:00-24:00',
    'week 2-57',
  ],
  '2012.01.01 0:00',
  '2014.01.01 0:00',
  [
    ['2012.01.02 00:00', '2013.01.01 00:00'],
    ['2013.01.07 00:00', '2014.01.01 00:00'],
  ],
  1000 * 60 * 60 * 24 * 724,
  false
);

checker_instance.include_scenario(
  'Day-of-month ranges',
  [
    'Jan 23-31 00:00-24:00; Feb 1-12 00:00-24:00',
    'Jan 23-Feb 12 00:00-24:00',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.23 0:00', '2012.02.13 00:00'],
  ],
  1000 * 60 * 60 * 24 * 21,
  false
);

checker_instance.include_scenario(
  'Cross-year day-of-month ranges',
  [
    'Dec 31-Jan 01',
  ],
  '2012.01.01 0:00',
  '2014.01.01 0:00',
  [
    ['2012.01.01 0:00', '2012.01.02 00:00'],
    ['2012.12.31 0:00', '2013.01.02 00:00'],
    ['2013.12.31 0:00', '2014.01.01 00:00'],
  ],
  1000 * 60 * 60 * 24 * 4,
  false
);

checker_instance.include_scenario(
  'Recurring day-of-month patterns (1)',
  [
    'Jan 01-31/8 00:00-24:00',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.01 0:00', '2012.01.02 00:00'],
    ['2012.01.09 0:00', '2012.01.10 00:00'],
    ['2012.01.17 0:00', '2012.01.18 00:00'],
    ['2012.01.25 0:00', '2012.01.26 00:00'],
  ],
  1000 * 60 * 60 * 24 * 4,
  false
);

checker_instance.include_scenario(
  'Recurring day-of-month patterns (2)',
  [
    'Jan 10-31/7',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.10 0:00', '2012.01.11 00:00'],
    ['2012.01.17 0:00', '2012.01.18 00:00'],
    ['2012.01.24 0:00', '2012.01.25 00:00'],
    ['2012.01.31 0:00', '2012.02.01 00:00'],
  ],
  1000 * 60 * 60 * 24 * 4,
  false
);

checker_instance.include_scenario(
  'Rule selector sequence',
  [
    'Feb week 6',
    'week 6 Feb',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.02.01 0:00', '2012.02.06 00:00'],
  ],
  1000 * 60 * 60 * 24 * 5,
  false
);

checker_instance.include_scenario(
  'Rule selector arrangement',
  [
    'Feb week 7',
    'week 7 Feb',
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.02.06 0:00', '2012.02.13 00:00'],
  ],
  1000 * 60 * 60 * 24 * 7,
  false
);

checker_instance.include_scenario(
  'Input flexibility: case and spacing',
  [
    '   mo,    Tu, wE,   TH    12:00 - 20:00  ; 14:00-16:00    Off  ',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 12:00', '2012.10.01 14:00'],
    ['2012.10.01 16:00', '2012.10.01 20:00'],
    ['2012.10.02 12:00', '2012.10.02 14:00'],
    ['2012.10.02 16:00', '2012.10.02 20:00'],
    ['2012.10.03 12:00', '2012.10.03 14:00'],
    ['2012.10.03 16:00', '2012.10.03 20:00'],
    ['2012.10.04 12:00', '2012.10.04 14:00'],
    ['2012.10.04 16:00', '2012.10.04 20:00'],
  ],
  1000 * 60 * 60 * 6 * 4,
  true
);

checker_instance.include_scenario(
  'Input flexibility: time delimiter',
  [
    '10.00-12.00',
    '10.00-11.00,11.00-12.00',
    '10.00-11.00;11.00-12.00',
    '10.00-14.00;12.00-14.00 off',
    '10.00-12.00;10.30-11.30',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 10:00', '2012.10.01 12:00'],
    ['2012.10.02 10:00', '2012.10.02 12:00'],
    ['2012.10.03 10:00', '2012.10.03 12:00'],
    ['2012.10.04 10:00', '2012.10.04 12:00'],
    ['2012.10.05 10:00', '2012.10.05 12:00'],
    ['2012.10.06 10:00', '2012.10.06 12:00'],
    ['2012.10.07 10:00', '2012.10.07 12:00'],
  ],
  1000 * 60 * 60 * 2 * 7,
  true
);

checker_instance.include_scenario(
  'Extended complex monthday ranges',
  [
    'Jan 23-31,Feb 1-12 00:00-24:00',
    'Jan 23-Feb 11,Feb 12 00:00-24:00',
    mark_as_omitted('Jan 23-30,31-Feb 1-2,3-12 12 00:00-24:00'),
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.23 0:00', '2012.02.13 00:00'],
  ],
  1000 * 60 * 60 * 24 * 21,
  false
);

checker_instance.include_scenario(
  'Extended missing time range delimiters',
  [
    'Mo 12:00-14:00 16:00-18:00 20:00-22:00',
  ],
  '2012.10.01 0:00',
  '2012.10.08 0:00',
  [
    ['2012.10.01 12:00', '2012.10.01 14:00'],
    ['2012.10.01 16:00', '2012.10.01 18:00'],
    ['2012.10.01 20:00', '2012.10.01 22:00'],
  ],
  1000 * 60 * 60 * 6,
  true
);

checker_instance.include_scenario(
  'Selector merging (week + day/monthday)',
  [
    'week 3 We', /* week + weekday */
    'week 3 Jan 11-Jan 11', /* week + monthday */
    'week 3 Jan 11', /* week + monthday */
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.11 0:00', '2012.01.12 00:00'],
  ],
  1000 * 60 * 60 * 24,
  false
);

checker_instance.include_scenario(
  'Selector merging (week + month, month + monthday)',
  [
    'week 3 Jan', /* week + month */
    'Jan-Feb Jan 9-Jan 15', /* month + monthday */
    'Jan-Feb Jan 9-15', /* month + monthday */
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.09 0:00', '2012.01.16 00:00'],
  ],
  1000 * 60 * 60 * 24 * 7,
  false
);

checker_instance.include_scenario(
  'Selector merging (month + day, day + monthday)',
  [
    'Jan We', /* month + weekday */
    'Jan 2-27 We', /* weekday + monthday */
    'Dec 30-Jan 27 We', /* weekday + monthday */
  ],
  '2012.01.01 0:00',
  '2013.01.01 0:00',
  [
    ['2012.01.04 0:00', '2012.01.05 00:00'],
    ['2012.01.11 0:00', '2012.01.12 00:00'],
    ['2012.01.18 0:00', '2012.01.19 00:00'],
    ['2012.01.25 0:00', '2012.01.26 00:00'],
  ],
  1000 * 60 * 60 * 24 * 4,
  false
);

// Execute all registered validation cases and exit with appropriate status
process.exit(checker_instance.perform_validation() ? 0 : 1);

/*
 * ======================================================================
 *  Validation Framework Implementation
 * ======================================================================
 */
function timing_verification_system() {
  // Collection to store all test cases
  const validation_items = [];

  /**
   * Executes a single validation scenario.
   * @param {string} scenario_label - Descriptive name for the test.
   * @param {string|Array} data_string - The rule string(s) to be parsed.
   * @param {string} start_point - Start date string for interval calculation.
   * @param {string} end_point - End date string for interval calculation.
   * @param {Array} anticipated_ranges - Expected open intervals.
   * @param {number} expected_length - Expected total open duration.
   * @param {boolean} stable_week_flag - Expected week stability flag.
   * @returns {boolean} True if the test passed, false otherwise.
   */
  function evaluate_scenario(scenario_label, data_string, start_point, end_point, anticipated_ranges, expected_length, stable_week_flag) {
    let case_omitted = typeof data_string !== 'string';
    if (case_omitted) {
      case_omitted = data_string[1]; /* Get the reason for ignoring */
      data_string = data_string[0]; /* Get the actual rule string */
    }

    let processor_obj, time_segments, total_span, cyclic_stability,
      segments_match, span_correct, stability_correct, failure_status = true;

    try {
      processor_obj = new shop_schedule_processor(data_string);

      time_segments = processor_obj.getOpenIntervals(new Date(start_point), new Date(end_point));
      total_span = processor_obj.getOpenDuration(new Date(start_point), new Date(end_point));
      cyclic_stability = processor_obj.isWeekStable();

      segments_match = typeof anticipated_ranges === 'undefined' || time_segments.length === anticipated_ranges.length;
      span_correct = typeof expected_length === 'undefined' || total_span === expected_length;
      stability_correct = typeof stable_week_flag === 'undefined' || cyclic_stability === stable_week_flag;

      failure_status = false; /* No crash occurred */
    } catch (error_obj) {
      failure_status = error_obj; /* Store the error */
    }

    /* Check if the actual intervals match the expected ones */
    if (segments_match) {
      for (let segment_index = 0; segment_index < time_segments.length; segment_index++) {
        const predicted_begin = new Date(anticipated_ranges[segment_index][0]);
        const predicted_end = new Date(anticipated_ranges[segment_index][1]);

        if (time_segments[segment_index][0].getTime() !== predicted_begin.getTime() ||
          time_segments[segment_index][1].getTime() !== predicted_end.getTime()) {
          segments_match = false; /* Mismatch found */
          break; /* Exit loop early */
        }
      }
    }

    let outcome_success = false;
    let log_message = `"${scenario_label}" for "${data_string}": `;
    if (segments_match && span_correct && stability_correct) {
      log_message += '[1;32mSUCCESS[0m';
      if (case_omitted) {
        log_message += ', [1;33malso omitted, please review as it now passes![0m';
      }
      outcome_success = true;
    } else if (case_omitted) {
      log_message += `[1;33mSKIPPED[0m, justification: ${case_omitted}`;
      outcome_success = true;
    } else if (failure_status) {
      log_message += `[1;35mCRITICAL ERROR[0m, details: ${failure_status}`;
    } else {
      log_message += '[1;31mFAILURE[0m';
      if (!span_correct) {
        log_message += `, incorrect duration: ${total_span}, anticipated ${expected_length}`;
      }
      if (!segments_match) {
        log_message += `,\n  mismatched intervals: \n${render_duration_segments(time_segments)}\n  expected:\n${render_duration_segments(anticipated_ranges)}`;
      }
      if (!stability_correct) {
        log_message += `, incorrect cyclic stability flag: ${cyclic_stability}, anticipated ${stable_week_flag}`;
      }
    }

    console.log(log_message);
    return outcome_success;
  }

  /**
   * Converts an array of time intervals into a human-readable string.
   * @param {Array<Array<Date>>} time_segments - The array of [start, end] date objects.
   * @returns {string} Formatted string representation of intervals.
   */
  function render_duration_segments(time_segments) {
    let result_string = '';

    if (time_segments.length === 0) {
      return '(empty)';
    }

    for (let segment_index = 0; segment_index < time_segments.length; segment_index++) {
      const begin_time = display_calendar_entry(time_segments[segment_index][0]);
      const end_time = display_calendar_entry(time_segments[segment_index][1]);

      if (segment_index !== 0) {
        result_string += '\n';
      }

      result_string += `[ ${begin_time} -- ${end_time} ]`;
    }

    return result_string;
  }

  /**
   * Formats a Date object into a "YYYY.MM.DD HH:mm" string.
   * @param {Date|string} current_date_obj - The date object or string to format.
   * @returns {string} Formatted date string.
   */
  function display_calendar_entry(current_date_obj) {
    if (typeof current_date_obj === 'string') {
      return current_date_obj;
    }

    let output_str = '';
    output_str += current_date_obj.getFullYear() + '.';
    output_str += ('0' + (current_date_obj.getMonth() + 1)).slice(-2) + '.'; /* Pad month with leading zero */
    output_str += ('0' + current_date_obj.getDate()).slice(-2) + ' '; /* Pad day with leading zero */
    output_str += ('0' + current_date_obj.getHours()).slice(-2) + ':'; /* Pad hour with leading zero */
    output_str += ('0' + current_date_obj.getMinutes()).slice(-2); /* Pad minute with leading zero */
    return output_str;
  }

  /**
   * Executes all registered test cases.
   * @returns {boolean} True if all tests passed, false otherwise.
   */
  this.perform_validation = function() {
    let successful_count = 0;
    for (let current_test_idx = 0; current_test_idx < validation_items.length; current_test_idx++) {
      if (evaluate_scenario(
          validation_items[current_test_idx][0],
          validation_items[current_test_idx][1],
          validation_items[current_test_idx][2],
          validation_items[current_test_idx][3],
          validation_items[current_test_idx][4],
          validation_items[current_test_idx][5],
          validation_items[current_test_idx][6]
        )) {
        successful_count++;
      }
    }

    console.log(`${successful_count}/${validation_items.length} validation cases succeeded`);

    return successful_count === validation_items.length;
  };

  /**
   * Adds a new test case or multiple test cases to the collection.
   * @param {string} scenario_label - Name of the test scenario.
   * @param {string|Array<string>} input_data_set - The rule string(s).
   * @param {string} start_point - Start date string.
   * @param {string} end_point - End date string.
   * @param {Array} anticipated_ranges - Expected time intervals.
   * @param {number} expected_length - Expected total duration.
   * @param {boolean} stable_week_flag - Expected week stability.
   */
  this.include_scenario = function(scenario_label, input_data_set, start_point, end_point, anticipated_ranges, expected_length, stable_week_flag) {
    if (typeof input_data_set === 'string') {
      validation_items.push([scenario_label, input_data_set, start_point, end_point, anticipated_ranges, expected_length, stable_week_flag]);
    } else {
      for (let data_item_idx = 0; data_item_idx < input_data_set.length; data_item_idx++) {
        validation_items.push([scenario_label, input_data_set[data_item_idx], start_point, end_point, anticipated_ranges, expected_length, stable_week_flag]);
      }
    }
  };
}

/**
 * Helper function to mark a test case as ignored.
 * @param {string} rule_value - The rule string to be ignored.
 * @param {string} [ignore_reason='not yet implemented'] - The reason for ignoring.
 * @returns {Array} A tuple containing the rule and the reason for ignoring.
 */
function mark_as_omitted(rule_value, ignore_reason) {
  if (typeof ignore_reason === 'undefined') {
    ignore_reason = 'not yet implemented';
  }
  return [rule_value, ignore_reason];
}