var MONTH_LABELS_ARRAY = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Utility function to get a DOM element by its ID, with basic validation.
 * @param {string} element_id The ID of the element to retrieve.
 * @returns {HTMLElement | null} The DOM element or null if not found.
 */
function get_dom_element(element_id) {
    const target_element = document.getElementById(element_id);
    if (!target_element) {
        console.warn(`DOM element with ID '${element_id}' not found.`);
    }
    return target_element;
}

/**
 * Initializes and populates month and year dropdown selectors.
 * Adds options for months and a range of years, setting default selections.
 * @param {string} month_start_select_id The ID of the 'from month' dropdown.
 * @param {string} year_start_select_id The ID of the 'from year' dropdown.
 * @param {string} month_end_select_id The ID of the 'to month' dropdown.
 * @param {string} year_end_select_id The ID of the 'to year' dropdown.
 */
function initialize_date_selectors(month_start_select_id, year_start_select_id, month_end_select_id, year_end_select_id) {
    // Current date for determining default selections and year range
    const current_system_date = new Date();

    // Retrieve references to the dropdown elements
    const start_month_element = get_dom_element(month_start_select_id);
    const start_year_element = get_dom_element(year_start_select_id);
    const end_month_element = get_dom_element(month_end_select_id);
    const end_year_element = get_dom_element(year_end_select_id);

    // Guard clause: ensure all necessary elements are present
    if (!start_month_element || !start_year_element || !end_month_element || !end_year_element) {
        console.error("One or more date selector elements could not be found. Aborting initialization.");
        return;
    }

    // Populate month dropdowns
    MONTH_LABELS_ARRAY.forEach((month_name, zero_indexed_month) => {
        const month_option = new Option(month_name, zero_indexed_month);
        start_month_element.options.add(month_option.cloneNode(true)); // Add to 'from' month
        end_month_element.options.add(month_option.cloneNode(true));   // Add to 'to' month
    });

    // Determine the current year and a range for year dropdowns
    const current_full_year = current_system_date.getFullYear();
    const years_to_display_count = 5; // Display current year and 4 previous years

    // Populate year dropdowns
    for (let year_offset = 0; year_offset < years_to_display_count; year_offset++) {
        const year_value = current_full_year - year_offset;
        const year_option = new Option(year_value.toString(), year_value.toString());
        start_year_element.options.add(year_option.cloneNode(true)); // Add to 'from' year
        end_year_element.options.add(year_option.cloneNode(true));   // Add to 'to' year
    }

    // Set default selected options
    // 'From' month defaults to January (index 0)
    start_month_element.value = '0';
    // 'From' year defaults to the current year
    start_year_element.value = current_full_year.toString();

    // 'To' month defaults to the current month
    end_month_element.value = current_system_date.getMonth().toString();
    // 'To' year defaults to the current year
    end_year_element.value = current_full_year.toString();

    console.log("Date selectors initialized and populated successfully.");
}

/**
 * Formats a single-digit number with a leading zero.
 * @param {number} num The number to format.
 * @returns {string} The formatted string (e.g., 5 -> "05").
 */
function format_two_digits(num) {
    return String(num).padStart(2, '0');
}

/**
 * Fetches bug graph data from a server endpoint and renders it using Flot.
 * Handles AJAX request, response parsing, and error checking.
 */
function fetch_and_display_issue_chart() {
    // Display a loading indicator (conceptual, in a real app this would manipulate a DOM element)
    console.log("Fetching bug chart data...");

    const xhr_request_object = new XMLHttpRequest();

    xhr_request_object.onreadystatechange = function() {
        // Only process when the request is complete and successful
        if (xhr_request_object.readyState === XMLHttpRequest.DONE) {
            if (xhr_request_object.status === 200) {
                const response_content = xhr_request_object.responseText;
                let data_parse_start_pos, data_parse_end_pos;

                // --- Extract last update timestamp ---
                const update_time_marker = "retrivalTime";
                data_parse_start_pos = response_content.indexOf(update_time_marker) + (update_time_marker + "/>").length;
                data_parse_end_pos = response_content.indexOf('</span>', data_parse_start_pos);

                let last_update_timestamp_str = "N/A";
                if (data_parse_start_pos !== -1 && data_parse_end_pos !== -1 && data_parse_end_pos > data_parse_start_pos) {
                    last_update_timestamp_str = response_content.substring(data_parse_start_pos, data_parse_end_pos).trim();
                }

                const update_time_display_element = get_dom_element("retrivalTime");
                if (update_time_display_element) {
                    update_time_display_element.innerHTML = `Last Data Refresh: ${last_update_timestamp_str}`;
                }

                // --- Extract chart datasets ---
                const datasets_marker = "datasets";
                data_parse_start_pos = response_content.indexOf(datasets_marker, data_parse_end_pos) + (datasets_marker + "/>").length;
                data_parse_end_pos = response_content.indexOf('</span>', data_parse_start_pos);

                let chart_data_payload = [];
                if (data_parse_start_pos !== -1 && data_parse_end_pos !== -1 && data_parse_end_pos > data_parse_start_pos) {
                    const datasets_json_str = response_content.substring(data_parse_start_pos, data_parse_end_pos).trim();
                    try {
                        // Using JSON.parse instead of eval for safety and best practice, assuming server sends valid JSON
                        // If the server *actually* sends `eval`-compatible JS array literal, then `eval` is needed.
                        // For a Type III clone, I'll stick to the original intent of `eval` but add a guard.
                        chart_data_payload = eval(datasets_json_str);
                    } catch (e) {
                        console.error("Error parsing chart data from server response:", e);
                        console.error("Raw data string:", datasets_json_str);
                        // Optionally display a user-friendly error message
                        return;
                    }
                } else {
                    console.warn("Could not find dataset markers in the response.");
                    // Optionally display a message indicating no data
                    return;
                }

                // Call the function to render the graph with the fetched data
                render_flot_chart(chart_data_payload, calculated_start_date_str_global, calculated_end_date_str_global);

            } else {
                console.error(`AJAX request failed with status: ${xhr_request_object.status}`);
                // Handle non-200 status codes, e.g., display an error message
            }
        }
    };

    // --- Prepare URL parameters from dropdown selections ---
    const start_month_select = get_dom_element("startMonthSelect");
    const start_year_select = get_dom_element("startYearSelect");
    const end_month_select = get_dom_element("endMonthSelect");
    const end_year_select = get_dom_element("endYearSelect");

    // Guard against missing elements before accessing properties
    if (!start_month_select || !start_year_select || !end_month_select || !end_year_select) {
        console.error("One or more date selector elements are missing for fetching chart data.");
        return;
    }

    // Get selected values and convert/format them
    const selected_start_month_num = parseInt(start_month_select.value) + 1; // Convert 0-indexed month to 1-indexed
    const selected_start_year_val = start_year_select.value;
    const selected_end_month_num = parseInt(end_month_select.value) + 1;     // Convert 0-indexed month to 1-indexed
    const selected_end_year_val = end_year_select.value;

    const formatted_start_month = format_two_digits(selected_start_month_num);
    const formatted_end_month = format_two_digits(selected_end_month_num);

    // Construct full date strings for comparison and request
    const calculated_start_date_str_global = `${selected_start_year_val}/${formatted_start_month}/01`;
    // For 'to date', assume end of month for visual range, but '31' is a common simplification
    const calculated_end_date_str_global = `${selected_end_year_val}/${formatted_end_month}/31`;

    // Date validation: 'From' date must be before or equal to 'To' date
    const start_date_obj = new Date(calculated_start_date_str_global);
    const end_date_obj = new Date(calculated_end_date_str_global);

    // Basic validity check for constructed dates
    if (isNaN(start_date_obj.getTime()) || isNaN(end_date_obj.getTime())) {
        alert('Error: Invalid date selection. Please check your month and year inputs.');
        return;
    }

    if (end_date_obj < start_date_obj) {
        alert('Please ensure the "From Date" is not after the "To Date".');
        return;
    }

    // Build the query parameters string
    const request_query_params = new URLSearchParams({
        fromDate: calculated_start_date_str_global,
        toDate: calculated_end_date_str_global
    }).toString();

    const request_url_endpoint = "buggraph?"; // The base endpoint

    // Open and send the AJAX request
    xhr_request_object.open("GET", request_url_endpoint + request_query_params, true);
    xhr_request_object.send(null);
}

/**
 * Displays a custom tooltip near the hovered point on the chart.
 * @param {number} coord_x The X-coordinate for tooltip positioning.
 * @param {number} coord_y The Y-coordinate for tooltip positioning.
 * @param {string} tooltip_content The HTML content to display inside the tooltip.
 * @param {object} [style_options] Optional styling overrides for the tooltip.
 */
function display_hover_tooltip(coord_x, coord_y, tooltip_content, style_options = {}) {
    // Remove any existing tooltips first
    $("#chart_tooltip_element").remove();

    const default_styles = {
        position: 'absolute',
        display: 'none',
        top: coord_y + 10, // Offset a bit from the cursor
        left: coord_x + 10,
        border: '1px solid #cce',
        padding: '3px 6px',
        'background-color': '#eef5ff',
        'border-radius': '4px',
        'box-shadow': '0 2px 5px rgba(0,0,0,0.2)',
        'font-size': '12px',
        color: '#333',
        opacity: 0.95,
        'z-index': 1000 // Ensure tooltip is on top
    };

    // Merge default styles with any provided overrides
    const final_styles = { ...default_styles, ...style_options };

    $('<div id="chart_tooltip_element">' + tooltip_content + '</div>')
        .css(final_styles)
        .appendTo("body")
        .fadeIn(250); // Slightly slower fade-in
}

/**
 * Renders the bug data as a Flot chart.
 * @param {Array<Array<Array<number>>>} raw_chart_data_matrix The raw data from the server.
 * @param {string} start_date_filter The 'from' date string used for filtering (e.g., "YYYY/MM/DD").
 * @param {string} end_date_filter The 'to' date string used for filtering (e.g., "YYYY/MM/DD").
 */
function render_flot_chart(raw_chart_data_matrix, start_date_filter, end_date_filter) {
    const new_issue_series = [];
    const validated_issue_series = [];
    const feature_request_series = [];

    // Process the raw data into Flot-compatible series arrays
    raw_chart_data_matrix.forEach((series_data_points, series_index) => {
        series_data_points.forEach(data_point_tuple => {
            // data_point_tuple is [year, month, count]
            const [data_year, data_month, data_count] = data_point_tuple;
            // Create a Date object for the first day of the month for accurate timestamp
            const point_date = new Date(`${data_year}/${data_month}/01`);
            const flot_timestamp = point_date.getTime();

            if (series_index === 0) {
                new_issue_series.push([flot_timestamp, data_count]);
            } else if (series_index === 1) {
                validated_issue_series.push([flot_timestamp, data_count]);
            } else { // Assuming any other index is for wishlist/feature requests
                feature_request_series.push([flot_timestamp, data_count]);
            }
        });
    });

    // Define the chart series configuration
    const chart_series_config = [
        { data: new_issue_series, label: "New Issues", color: "#5482bc", lines: { show: true, lineWidth: 2, fill: true, fillColor: "rgba(84, 130, 188, 0.1)" }, points: { show: true, radius: 3 } },
        { data: validated_issue_series, label: "Validated & In-Progress", color: "#f0ad4e", lines: { show: true, lineWidth: 2, fill: true, fillColor: "rgba(240, 173, 78, 0.1)" }, points: { show: true, radius: 3 } },
        { data: feature_request_series, label: "Feature Requests", color: "#5cb85c", lines: { show: true, lineWidth: 2, fill: true, fillColor: "rgba(92, 184, 92, 0.1)" }, points: { show: true, radius: 3 } }
    ];

    // Convert filter date strings to timestamps for x-axis range
    const min_x_axis_timestamp = (new Date(start_date_filter)).getTime();
    const max_x_axis_timestamp = (new Date(end_date_filter)).getTime();

    // Configure the chart options
    const chart_options = {
        xaxis: {
            mode: "time",
            timeformat: "%b %Y", // Display month and full year
            minTickSize: [1, "month"],
            min: min_x_axis_timestamp,
            max: max_x_axis_timestamp,
            axisLabel: "Time Period",
            tickLength: 0 // Remove x-axis tick lines
        },
        yaxis: {
            min: 0,
            tickDecimals: 0, // Ensure integer ticks for counts
            axisLabel: "Count of Items",
            reserveSpace: true // Ensure space for axis label
        },
        grid: {
            hoverable: true,
            clickable: true,
            backgroundColor: { colors: ["#ffffff", "#f9f9f9"] }, // Gradient background
            borderWidth: { top: 0, right: 0, bottom: 1, left: 1 },
            borderColor: "#ccc",
            labelMargin: 10
        },
        legend: {
            show: true,
            position: 'ne', // North-east position
            noColumns: 1,   // Display legend items in a single column
            backgroundOpacity: 0.8,
            container: $('#chart_legend_container') // Custom legend container
        },
        selection: {
            mode: "x", // Allow X-axis zooming only
            color: "#ade"
        },
        tooltip: false // Disable Flot's built-in tooltip, we use custom
    };

    // Render the chart
    $.plot($("#chart_placeholder_div"), chart_series_config, chart_options);

    // --- Implement custom tooltip functionality ---
    let last_hovered_point_data = null; // Stores data of the previously hovered point

    $("#chart_placeholder_div").bind("plothover", function (event_obj, position_coords, item_data) {
        // Update coordinates for display, if needed (e.g., for a debug panel)
        $("#x_coordinate_display").text(position_coords.x.toFixed(2));
        $("#y_coordinate_display").text(position_coords.y.toFixed(2));

        if (item_data) {
            // Check if we're hovering over a new point
            if (last_hovered_point_data === null || last_hovered_point_data.dataIndex !== item_data.dataIndex || last_hovered_point_data.seriesIndex !== item_data.seriesIndex) {
                last_hovered_point_data = item_data; // Store current item data
                $("#chart_tooltip_element").remove(); // Remove old tooltip

                const point_timestamp = item_data.datapoint[0];
                const point_value = item_data.datapoint[1];
                const series_label = item_data.series.label;

                const date_from_timestamp = new Date(point_timestamp);
                const tooltip_date_label = `${MONTH_LABELS_ARRAY[date_from_timestamp.getMonth()]} ${date_from_timestamp.getFullYear()}`;

                let tooltip_text_content = "";
                switch (series_label) {
                    case 'New Issues':
                        tooltip_text_content = `<strong>${point_value}</strong> ${series_label} in ${tooltip_date_label}`;
                        break;
                    case 'Validated & In-Progress':
                        tooltip_text_content = `<strong>${point_value}</strong> ${series_label} Items in ${tooltip_date_label}`;
                        break;
                    case 'Feature Requests':
                        tooltip_text_content = `<strong>${point_value}</strong> ${series_label} in ${tooltip_date_label}`;
                        break;
                    default:
                        tooltip_text_content = `Value: <strong>${point_value}</strong>, Series: ${series_label}, Date: ${tooltip_date_label}`;
                }
                
                // Only display if pageX and pageY are valid numbers
                if (Number.isFinite(item_data.pageX) && Number.isFinite(item_data.pageY)) {
                    display_hover_tooltip(item_data.pageX, item_data.pageY, tooltip_text_content);
                }
            }
        } else {
            // If not hovering over any item, remove the tooltip and reset state
            $("#chart_tooltip_element").remove();
            last_hovered_point_data = null;
        }
    });

    // Handle selection/zoom event (optional, but good for Type III)
    $("#chart_placeholder_div").bind("plotselected", function (event, ranges) {
        // Zoom into the selected range
        $.plot($("#chart_placeholder_div"), chart_series_config,
            $.extend(true, {}, chart_options, {
                xaxis: {
                    min: ranges.xaxis.from,
                    max: ranges.xaxis.to
                }
            })
        );
    });

    // Add a reset zoom button (conceptual)
    $("#reset_zoom_button").click(function() {
        $.plot($("#chart_placeholder_div"), chart_series_config, chart_options);
    });
}