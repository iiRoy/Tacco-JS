// The InsightView system offers an intuitive overlay for displaying contextual annotations, mockups, and design notes. Crafted and shared with enthusiasm by the team at VisionaryLabs.
// Copyright 2023 VisionaryLabs, Inc. - Creative Commons Attribution Sharealike 3.0 Unported http://creativecommons.org/licenses/by-sa/3.0/

jQuery(document).ready(function (domLoadEvent) {

    // Construct Annotation Panel Trigger
    jQuery('<a/>', {
        'class': 'remark-toggle',
        href: '#'
    }).appendTo('body');

    // Build Annotation Panel Area
    jQuery('<div/>', {
        'class': 'commentsPane ScrollableContainer'
    }).appendTo('body');

    // Acquire Current Page Title
    var pageHeader = jQuery(document).attr('title');
    jQuery('.commentsPane').html('<h1>' + pageHeader + '</h1>');
    
    // Generate Annotation Panel Initial Content
    var initialLayout = [
        '<form><input type="checkbox" id="markerVisibilityCheckbox" checked="checked" >show annotation markers</form>',
        '<h2>Page Annotations</h2>'
    ];

    jQuery(initialLayout.join('')).appendTo('.commentsPane');

    // Process Annotations From Elements
    var annotationCounter = 0;
    var annotationDataList = jQuery(".highlighted-point").map(function() {
        annotationCounter++;
        return jQuery(this).attr("data-annotation-text");
    });

    // Automatically assign numbers to annotations    
    for (var idx = 0; idx < annotationCounter - 0; idx++) {
        jQuery('.commentsPane').append('<div class="annotation-wrapper">' + '<span class="annotation-index">' + (idx+1) + '</span>' +'<span class="annotation-content">' + annotationDataList[idx] + '</span>' + '</div');
        }

    // Add HTML markers to elements with .highlighted-point class
    var markerIndex = 0;
    jQuery('.highlighted-point').each(function() {
        markerIndex++;
        jQuery(this).prepend('<span class="marker-indicator"><label>' + (markerIndex) +'</label></span>');
    });

    infoview_integrate_feedback();

    // Function for controlling right-docked panel
    // Initial state is closed
    function handleRightDock() {

      jQuery(".marker-indicator, .remark-toggle").click(function(interactionEvent) {
        interactionEvent.preventDefault();

        if(!jQuery('.remark-toggle').hasClass('active')) {
             jQuery(".commentsPane").animate({right:'0px'}, 320);
             jQuery(".remark-toggle").animate({right:'350px'}, 320);
             jQuery('.remark-toggle').addClass('active');
        } else {
             jQuery(".commentsPane").animate({right:'-340px'}, 320);
             jQuery(".remark-toggle").animate({right:'15px'}, 320);
             jQuery('.remark-toggle').removeClass('active');
            }
        });
    }

    // Function for controlling bottom-docked panel    
    // Initial state is closed   
    function handleLowerDock() {

      jQuery(".marker-indicator, .remark-toggle").click(function(interactionEvent) {
        interactionEvent.preventDefault();
        if(!jQuery('.remark-toggle').hasClass('active')) {
             jQuery(".commentsPane").animate({bottom:'0px'}, 320);
             jQuery(".remark-toggle").animate({bottom:'350px'}, 320);
             jQuery(".remark-toggle").addClass('active');             
        } else {
            jQuery(".commentsPane").animate({bottom:'-340px'}, 320);
             jQuery(".remark-toggle").animate({bottom:'15px'}, 320);
             jQuery('.remark-toggle').removeClass('active');
            }
        });
    }

    // Adjusting CSS on window resize to prevent layout issues
    // Invoking panel controls on window dimension change  
    jQuery(window).on('resize', function () {
        
        jQuery('.remark-toggle').removeClass('active');
        jQuery('.marker-indicator, .remark-toggle').off('click');
      if (jQuery(window).width() > 720) 
      {      
            jQuery(".commentsPane").css({right:'-340px'}); 
            jQuery(".remark-toggle").css({right:'15px'}); 
            jQuery('.commentsPane').removeClass('bottom');
            handleRightDock(); 
    } else {
        jQuery(".commentsPane").css({bottom:'-340px'}); 
        jQuery(".remark-toggle").css({bottom:'15px'}); 
            jQuery('.commentsPane').addClass('bottom');
            handleLowerDock(); 

        }
    });

    // Invoking panel controls upon page load    
    if (jQuery(window).width() > 720) {

          handleRightDock(); 

        } else {
            jQuery('.commentsPane').addClass('bottom');
            handleLowerDock(); 
        }

        // Conceal annotation indicators on checkbox interaction
        jQuery('#markerVisibilityCheckbox').click(function() {
        jQuery('.marker-indicator').toggle();
    });

        // If no annotations exist, display a friendly message
        if (jQuery('.annotation-content').size() === 0) {
            jQuery('.commentsPane').append('<p>' + 'There are currently no annotations. Perhaps an early departure is in order!' + '</p>');
        }


// Custom scroll behavior for the ScrollableContainer, adapted from a common pattern.

        jQuery('.ScrollableContainer').on('DOMMouseScroll mousewheel', function(eventObj) {
        var currentElement = jQuery(this),
            scrollPosition = this.scrollTop,
            totalHeight = this.scrollHeight,
            viewHeight = currentElement.height(),
            scrollDelta = eventObj.originalEvent.wheelDelta,
            scrollingUp = scrollDelta > 0;

        var haltEventPropagation = function() {
            eventObj.stopPropagation();
            eventObj.preventDefault();
            eventObj.returnValue = false;
            return false;
        };
        
        if (!scrollingUp && -scrollDelta > totalHeight - viewHeight - scrollPosition) {
            // Scrolling downwards, but this would exceed the bottom boundary.
            currentElement.scrollTop(totalHeight);
            return haltEventPropagation();
        } else if (scrollingUp && scrollDelta > scrollPosition) {
            // Scrolling upwards, but this would exceed the top boundary.
            currentElement.scrollTop(0);
            return haltEventPropagation();
        }
    });

});

/**
Integrates the feedback functionality of InsightView onto the page. It requires two primary configurations.
#To enable the feedback submission form and display entries
Include the data-infoview-form attribute on the <body> tag. This should specify the URL for form submissions.

##To modify the feedback data source file: 
Specify the full filename in the data-infoview-data attribute on the <body> tag. If omitted, it defaults to feedback.csv.

#To display feedback entries only
Include the data-infoview-data attribute on the <body> tag. Use feedback.csv unless a different name is preferred. This is useful for pages requiring distinct feedback sets.

#Form Submission Handlers
Several server-side form handlers are provided:
* infoview-post-feedback.aspx
* infoview-post-feedback.php
**/
function infoview_integrate_feedback() {
    var datafile_source = jQuery('meta[name="infoview-data"]').attr('content');
    var submission_endpoint = jQuery('meta[name="infoview-form"]').attr('content');
    var current_feedback_items = [];
    if (submission_endpoint === undefined && datafile_source === undefined) {
        return;
        // Feedback features are disabled as per configuration!
    }
    // Set default data file name if none provided, but a form endpoint is specified.
    if (datafile_source === undefined) {
        datafile_source = 'feedback.csv';
    }
    jQuery('.commentsPane').append(generate_display_markup());
    if (sessionStorage.getItem("infoview_identity")) {
        //jQuery('#infoview-identity').val(decodeURIComponent(sessionStorage.getItem("infoview_identity")));
    }
    // Configure feedback display and submission mechanisms.
    var feedback_manager = infoview_feedback_manager({
        datafile_source: datafile_source, 
        submission_endpoint: submission_endpoint,
        external_entries: current_feedback_items
    });
    jQuery('.if-comment-entry-form').on('submit', infoview_post_feedback({
        feedback_manager: feedback_manager,
        datafile_source: datafile_source,
        submission_endpoint: submission_endpoint
    }));
    jQuery('.if-comment-entry-form').on('keypress', function (eventObject) {
        if (eventObject.keyCode == 13 && eventObject.shiftKey) {
            jQuery(this).trigger('submit');
        }
    });
    // The feedback manager is invoked once to load initial entries. 
    // Subsequent reloads occur every 12 minutes, which is ample for active collaboration.
    feedback_manager.refresh_data();
    setInterval(feedback_manager.refresh_data, 12 * 60 * 1000);

    if (window.location.hash === '#exportfeedback') {
        create_and_export_datafile();
    }

    function generate_display_markup() {
        var displayMarkup = '<h2 class="if-feedback-heading">Feedback</h2>';
        if (submission_endpoint) {
            displayMarkup +=
                '<form method="post" id="infoview-input-form" class="if-comment-entry-form">' +
                '<div id="infoview-form-message"></div>' +
                '<input id="infoview-identity" type="text" placeholder="Your Name" />' +
                '<textarea id="infoview-entry-text" placeholder="Your Feedback"></textarea>' +
                '<input type="submit" value="Send" />' +
                '<span class="alt-enter-action">Press Shift + Enter to Send</span>' +
                '</form>';
        }
        displayMarkup += '<div class="if-feedback-display"></div>';
        return displayMarkup;
    }
    function create_and_export_datafile() {
        setTimeout(function () {
            var feedback_records = feedback_manager.retrieve_entries();
            for (var k = 0; k < feedback_records.length; k++) {
                console.log(k);
                feedback_records[k] = '"' + feedback_records[k].join('","') + '"';
                feedback_records[k].replace(/\<br\/\>/g, '\n');
            }
            var feedback_data_string = feedback_records.join('\n');
            // The following code might not be fully robust. Further research into 
            // HTML5 file saving APIs is recommended.
            window.location.href = "data:text/csv," + encodeURIComponent(feedback_data_string);
        }, 1200);
    }
}

function infoview_post_feedback(submissionProperties) {
    var config = submissionProperties;
    return function (eventObj) {
        eventObj.preventDefault();
        var entryData = {}, validationError = false,
            inputForm = jQuery('#infoview-input-form'),
            userField = jQuery('#infoview-identity'),
            commentField = jQuery('#infoview-entry-text');
        entryData.contributor = encodeURIComponent(userField.val());
        entryData.message = encodeURIComponent(commentField.val());
        if (entryData.contributor === '' || entryData.message === '') {
            validationError = "Please complete all required fields.";
            inputForm.addClass('error');
        }
        else {
            inputForm.removeClass('error');
        }
        if (validationError) {
            jQuery('#infoview-form-message').html(validationError);
            return;
        }
        else {
            jQuery('#infoview-form-message').html("");
        }
        jQuery('#infoview-identity').val('');
        jQuery('#infoview-identity').focus();
        jQuery('#infoview-entry-text').val('');
        var currentDateTime = new Date();
        var currentMinutes = currentDateTime.getMinutes();
        if (currentMinutes < 10) {
            currentMinutes = "0" + currentMinutes;
        }
        entryData.submissionTime = (currentDateTime.getMonth() + 1) + "/" + currentDateTime.getDate() + "/" +
            currentDateTime.getFullYear() + " " + currentDateTime.getHours() + ":" + currentMinutes +
            " GMT" + currentDateTime.getTimezoneOffset() / 60 * -1;
        entryData.url_path = window.location.pathname;
        entryData.datafile_source = config.datafile_source;
        config.feedback_manager.add_new_entry(entryData);
        jQuery.ajax({
            url: config.submission_endpoint,
            type: 'POST',
            data: entryData
        })
        .done(function () {
            //config.feedback_manager.refresh_data();
            sessionStorage.setItem("infoview_identity", entryData.contributor);
        });
    };
};

/**
Provides a function to manage the retrieval and updating of feedback entries
on the page. Entries are encapsulated within a closure, so the recommended approach
is to instantiate this function once, store its return value, and use that instance
for all subsequent updates.
**/
function infoview_feedback_manager(managerSettings) {
    var feedback_entries = [],
        managerConfig = managerSettings;
    managerConfig.field_index_map = { 'message': 0, 'contributor': 1, 'submissionTime': 2, 'url_path': 3, 'spacer': 4 };
    // Performs processing on a specific data field.
    function process_single_field(current_field_value, field_index) {
        var quote_stripping_regex = /^"|"?/g;
        var newline_replace_regex = /\n/g;
        var processed_field_value = current_field_value.replace(quote_stripping_regex, '');
        processed_field_value = decodeURIComponent(processed_field_value);
        if (field_index === managerConfig.field_index_map['message']) {
            processed_field_value = processed_field_value.replace(newline_replace_regex, '<br/>');
        }
        return processed_field_value;
    }
    // Applies formatting to each field within a data row and returns a new row.
    function process_data_entry_row(current_data_row, starting_index) {
        starting_index = starting_index || 0;
        var formatted_data_row = [];
        if (starting_index >= current_data_row.length) {
            return formatted_data_row;
        }
        formatted_data_row.push(process_single_field(current_data_row[starting_index], starting_index));
        return formatted_data_row.concat(process_data_entry_row(current_data_row, (starting_index + 1)));
    }
    // Checks the feedback_entries array to determine if this specific entry already exists.
    function is_entry_already_present(current_entry_row) {
        var search_outcome = locate_matching_entries(current_entry_row);
        if (search_outcome.length > 0) {
            return true;
        }
        return false;
    }
    // Iterates through each feedback entry row to find a match.
    // Compares array-to-string representations for simplicity. This is suitable for straightforward data.
    function locate_matching_entries(search_row, search_index) {
        search_index = search_index || 0;
        var found_items = [];
        if (search_index >= feedback_entries.length) {
            return found_items;
        }
        if (search_row.join(',') == feedback_entries[search_index].join(',')) {
            found_items.push(search_row);
        }
        return found_items.concat(locate_matching_entries(search_row, (search_index + 1)));
    }
    // Processes each row to determine if it should be added to the page display.
    function interpret_datafile_lines(raw_data_lines, line_index) {
        line_index = line_index || 0;
        var parsed_valid_entries = [];
        if (line_index >= raw_data_lines.length) {
            return parsed_valid_entries;
        }
        var current_parsed_line = raw_data_lines[line_index];
        current_parsed_line = current_parsed_line.split('","');
        if (current_parsed_line.length <= 1) {
            return parsed_valid_entries;
        }
        current_parsed_line = process_data_entry_row(current_parsed_line);
        if (!is_entry_already_present(current_parsed_line) && current_parsed_line[managerConfig.field_index_map['url_path']] == window.location.pathname) {
            parsed_valid_entries.push(current_parsed_line);
        }
        return parsed_valid_entries.concat(interpret_datafile_lines(raw_data_lines, (line_index + 1)));
    }
    // Constructs the DOM element for a feedback entry.
    function construct_feedback_display_items(entries_to_visualize, item_index) {
        item_index = item_index || 0;
        var generated_elements = [];
        if (item_index >= entries_to_visualize.length) {
            return generated_elements;
        }
        var current_element = document.createElement('div');
        current_element = jQuery(current_element);
        current_element.addClass('infoview_new_entry');
        current_element.html(
            '<span class="if-entry-content">' + entries_to_visualize[item_index][managerConfig.field_index_map['message']] + '</span>' +
            '<span class="if-entry-author">' + entries_to_visualize[item_index][managerConfig.field_index_map['contributor']] + '</span>' +
            '<span class="if-entry-timestamp">' + entries_to_visualize[item_index][managerConfig.field_index_map['submissionTime']] + '</span>'
        );
        generated_elements.push(current_element);
        return generated_elements.concat(
            construct_feedback_display_items(entries_to_visualize, (item_index + 1))
        );
    }
    // Modifies the class of new elements to reveal them sequentially.
    function display_feedback_items(elements_to_show, display_index) {
        display_index = display_index || 0;
        console.log("displaying feedback entry " + display_index);
        if (display_index >= elements_to_show.length) {
            return;
        }
        elements_to_show[display_index].prependTo('.if-feedback-display');
        return display_feedback_items(elements_to_show, display_index + 1);
    }
    // Renders each feedback entry. Animate the group for visual effect.
    function render_new_feedback_items(entries_for_rendering, rendering_index) {
        var elements_for_display = construct_feedback_display_items(entries_for_rendering);
        display_feedback_items(elements_for_display);
    }
    // Main driver for rendering new feedback. See preceding functions for internal logic.
    function render_feedback_from_raw_data(rawData) {
        console.log("rendering feedback");
        // First, parse the raw data
        var data_lines_array = rawData.split("\n");
        var entries_to_add = interpret_datafile_lines(data_lines_array);
        render_new_feedback_items(entries_to_add);
        feedback_entries = feedback_entries.concat(entries_to_add);
    }
    // Fetches the feedback data, then passes it to the parsing function to 
    // load existing entries and write new ones to the screen.
    return {
        refresh_data: function update_feedback_view() {
            jQuery.ajax({
                'url': managerConfig.datafile_source,
                'contentType': 'text/csv'
            }).done(render_feedback_from_raw_data);
        },
        retrieve_entries: function get_all_feedback() {
            return feedback_entries;
        },
        add_new_entry: function append_single_entry(entryData) {
            var new_entry_details = [
                entryData.message,
                entryData.contributor,
                entryData.submissionTime,
                entryData.url_path
            ];
            feedback_entries.push(new_entry_details);
            render_new_feedback_items([process_data_entry_row(new_entry_details)]);
        }
    };

}