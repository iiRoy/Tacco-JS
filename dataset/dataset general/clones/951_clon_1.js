/*
 * This file contains the core JavaScript logic for the Metaframe notation layer.
 *
 * Metaframe provides an intuitive way to convey meta-knowledge directly within
 * wireframes, mockups, and design compositions.
 *
 * Developed and openly shared by the dedicated team at Elliance.
 * Copyright (c) 2013 Elliance, Inc. All rights reserved.
 *
 * This work is licensed under the Creative Commons Attribution Sharealike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/
 * or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

$(document).ready(
  function () {

    // Initialize the Notes Tab UI element
    $(
      '<a/>',
      {
        'class': 'notes-tab', // Assign CSS class for styling
        href:    '#'          // Placeholder link
      }
    ).appendTo(
      'body'
    ); // Append the tab to the document body


    // Initialize the Notes Panel UI element
    $(
      '<div/>',
      {
        'class': 'notes Scrollable' // Assign classes for styling and scroll behavior
      }
    ).appendTo(
      'body'
    ); // Append the panel to the document body


    // Retrieve the current page's title for display
    var vTitle = $(this).attr('title');

    // Populate the notes panel with the page title
    $('.notes').html(
      '<h1>' + vTitle + '</h1>'
    );


    // Define static content for the Notes Panel
    var structure = [
      '<form><input type="checkbox" id="noteBox" checked="checked" >show note markers</form>',
      '<h2>Page Notes</h2>'
    ];

    // Add the static structure to the notes panel
    $(
      structure.join('')
    ).appendTo(
      '.notes'
    );


    // Process and generate notes from elements marked with '.notation'
    var noteCount = 0; // Counter for the number of notes

    // Map over all elements with the 'notation' class to extract their 'note' attribute
    var tn_array = $(".notation").map(
      function() {
        noteCount++; // Increment count for each found notation
        return $(this).attr("note"); // Return the value of the 'note' attribute
      }
    );


    // Loop through the collected notes to auto-number and display them
    for (
      var i = 0;
      i < noteCount - 0; // Iterate through all notes
      i++
    ) {
      $('.notes').append(
        '<div class="note-holder">'
        + '<span class="note-count">' + (i + 1) + '</span>' // Display note number
        + '<span class="note-body">' + tn_array[i] + '</span>' // Display note content
        + '</div'
      );
    }


    // Add visual anchors to elements marked with '.notation'
    var noteNum = 0; // Counter for anchor numbering

    $('.notation').each(
      function() {
        noteNum++; // Increment anchor number
        $(this).prepend(
          '<span class="notes-anchor"><figure>' + (noteNum) + '</figure></span>'
        ); // Prepend the anchor to the notation element
      }
    );


    // Invoke the function to embed additional comments functionality
    metaframe_embed_comments();


    // Function definition for controlling the right-aligned panel
    // The panel starts in a closed (hidden) position by default
    function OverlayControlright() {

      $(".notes-anchor, .notes-tab").click(
        function(e) {
          e.preventDefault(); // Prevent default link behavior

          // Check if the notes tab is currently open
          if (
            !$('.notes-tab').hasClass('open')
          ) {
            // If closed, open the notes panel and tab
            $(".notes").animate({right:'0px'},    300); // Slide panel into view
            $(".notes-tab").animate({right:'340px'}, 300); // Slide tab to new position
            $('.notes-tab').addClass('open');              // Mark tab as open
          } else {
            // If open, close the notes panel and tab
            $(".notes").animate({right:'-330px'}, 300); // Slide panel out of view
            $(".notes-tab").animate({right:'10px'},  300); // Slide tab back to original position
            $('.notes-tab').removeClass('open');           // Mark tab as closed
          }
        }
      );
    }


    // Function definition for controlling the bottom-aligned panel
    // The panel also starts in a closed position
    function OverlayControldown() {

      $(".notes-anchor, .notes-tab").click(
        function(e) {
          e.preventDefault(); // Prevent default link behavior

          // Check if the notes tab is currently open
          if (
            !$('.notes-tab').hasClass('open')
          ) {
            // If closed, open the notes panel and tab
            $(".notes").animate({bottom:'0px'},    300); // Slide panel into view
            $(".notes-tab").animate({bottom:'340px'}, 300); // Slide tab to new position
            $(".notes-tab").addClass('open');              // Mark tab as open
          } else {
            // If open, close the notes panel and tab
            $(".notes").animate({bottom:'-330px'}, 300); // Slide panel out of view
            $(".notes-tab").animate({bottom:'10px'},  300); // Slide tab back to original position
            $('.notes-tab').removeClass('open');           // Mark tab as closed
          }
        }
      );
    }


    // Handle window resize events to adjust panel positioning and controls
    // This prevents layout issues ("jankiness") on window resizing
    $(window).on(
      'resize',
      function () {

        $('.notes-tab').removeClass('open'); // Ensure tab is closed on resize
        $('.notes-anchor, .notes-tab').unbind('click'); // Remove existing click handlers

        // Determine panel orientation based on window width
        if (
          $(window).width() > 700
        ) {
          // For wider screens, use right-aligned panel
          $(".notes").css({right:'-330px'}); // Reset right panel position
          $(".notes-tab").css({right:'10px'}); // Reset right tab position
          $('.notes').removeClass('bottom'); // Remove bottom-alignment class
          OverlayControlright(); // Apply right panel controls
        } else {
          // For narrower screens, use bottom-aligned panel
          $(".notes").css({bottom:'-330px'}); // Reset bottom panel position
          $(".notes-tab").css({bottom:'10px'}); // Reset bottom tab position
          $('.notes').addClass('bottom'); // Add bottom-alignment class
          OverlayControldown(); // Apply bottom panel controls
        }
      }
    );


    // Invoke initial controls based on window width when the page loads
    if (
      $(window).width() > 700
    ) {
      OverlayControlright(); // Apply right panel controls for wide screens
    } else {
      $('.notes').addClass('bottom'); // Apply bottom-alignment class for narrow screens
      OverlayControldown(); // Apply bottom panel controls for narrow screens
    }


    // Toggle visibility of note anchors when the checkbox is clicked
    $('#noteBox').click(
      function() {
        $('.notes-anchor').toggle(); // Show or hide note anchors
      }
    );


    // Display a message if no notes are found on the page
    if (
      $('.note-body').size() === 0
    ) {
      $('.notes').append(
        '<p>' + 'There are no notes yet. I guess you can go home early today!' + '</p>'
      );
    }


    // Implement a scrollable hack to prevent body scrolling when a scrollable element is at its limits.
    // This solution was adapted from http://jsfiddle.net/TroyAlford/4wrxq/1/
    $('.Scrollable').on(
      'DOMMouseScroll mousewheel',
      function(ev) {
        var $this    = $(this),
            scrollTop  = this.scrollTop,
            scrollHeight = this.scrollHeight,
            height   = $this.height(),
            delta    = ev.originalEvent.wheelDelta,
            up       = delta > 0;

        // Function to prevent default scroll behavior
        var prevent = function() {
          ev.stopPropagation();
          ev.preventDefault();
          ev.returnValue = false;
          return false;
        };

        // Check if scrolling down past the bottom
        if (
          !up && -delta > scrollHeight - height - scrollTop
        ) {
          $this.scrollTop(scrollHeight); // Scroll to bottom
          return prevent();             // Prevent further scrolling
        }
        // Check if scrolling up past the top
        else if (
          up && delta > scrollTop
        ) {
          $this.scrollTop(0); // Scroll to top
          return prevent();  // Prevent further scrolling
        }
      }
    );

  }
);


/*
 * metaframe_embed_comments function
 *
 * This function is responsible for drawing the metaframe comments functionality onto the page.
 * It requires specific data attributes on the <body> tag to configure its behavior.
 *
 * Configuration Options:
 *
 * 1. To show the comment submission form and display notes:
 *    Include the 'data-metaframe-form' attribute on the <body> tag.
 *    Its value should be the URL of the file that accepts form input (e.g., a backend endpoint).
 *
 * 2. To specify a custom notes file (overrides default 'comments.csv'):
 *    Set the 'data-metaframe-comments' attribute on the <body> tag to the full filename.
 *    If omitted, 'comments.csv' is assumed. This is useful for multiple pages with distinct comments.
 *
 * 3. To display only existing notes (without a submission form):
 *    Include the 'data-metaframe-csv' attribute on the <body> tag.
 *    Specify the CSV filename (e.g., 'comments.csv').
 *
 * Form Handlers Provided:
 * Several example form handlers are included with this code distribution:
 * - metaframe-form-submit.aspx (for ASP.NET environments)
 * - metaframe-form-submit.php (for PHP environments)
 */
function metaframe_embed_comments() {
    var csv_filename = $('meta[name="metaframe-csv"]').attr('content');
    var form_action  = $('meta[name="metaframe-form"]').attr('content');
    var these_comments = []; // Placeholder for external comments, if any.

    // If neither form action nor CSV filename is provided,
    // it implies comments functionality is not desired.
    if (
      form_action === undefined && csv_filename === undefined
    ) {
        return; // Exit the function early.
        // We are not showing comments because explicit instructions indicate not to!
    }

    // Set a default CSV filename if a form is provided but no specific CSV is mentioned.
    if (csv_filename === undefined) {
        csv_filename = 'comments.csv'; // Default filename for comments data.
    }

    // Append the base structure for comments to the notes panel.
    $('.notes').append(
      get_structure_html()
    );

    // Attempt to pre-fill the user field from session storage.
    if (sessionStorage.getItem("metaframe_user")) {
        // The original code had a commented-out line here,
        // so we will keep it commented out to preserve behavior.
        // $('#metaframe-user').val(decodeURIComponent(sessionStorage.getItem("metaframe_user")));
    }

    // Set up the comment display and submission handlers.
    var comments_handler = metaframe_comments_handler(
      {
        csv_filename: csv_filename,     // The CSV file to load comments from.
        form_action:  form_action,      // The URL to submit new comments to.
        external_comments: these_comments // Any pre-existing comments.
      }
    );

    // Attach the submit event handler for the comment form.
    $('.mf-comment-form').on(
      'submit',
      metaframe_submit(
        {
          comments_handler: comments_handler, // The handler for managing comments.
          csv_filename:     csv_filename,     // The CSV file name.
          form_action:      form_action       // The form action URL.
        }
      )
    );

    // Enable Shift + Enter to submit the comment form.
    $('.mf-comment-form').on(
      'keypress',
      function () {
        if (event.keyCode == 13 && event.shiftKey) {
            $(this).trigger('submit'); // Trigger form submission.
        }
      }
    );

    // Call the comment handler once to load the initial set of comments.
    // Afterwards, reload comments periodically (every 10 minutes) to keep them fresh.
    // This might be overkill but ensures timely updates if multiple users are active.
    comments_handler.load();
    setInterval(
      comments_handler.load,
      10 * 60 * 1000 // 10 minutes in milliseconds.
    );

    // Check if the URL hash requests a comment download.
    if (window.location.hash === '#downloadcomments') {
        generate_and_download_csv();
    }


    // Helper function to generate the HTML structure for comments section.
    function get_structure_html() {
        var structure = '<h2 class="mf-comments-header">Comments</h2>';

        // Include the form if a form_action is specified.
        if (form_action) {
            structure +=
                '<form method="post" id="metaframe-form" class="mf-comment-form">' +
                '<div id="metaframe-form-error"></div>' +
                '<input id="metaframe-user" type="text" placeholder="Name" />' +
                '<textarea id="metaframe-comment" placeholder="Comment"></textarea>' +
                '<input type="submit" value="Submit" />' +
                '<span class="shift-enter-submit">Press Shift + Enter to Submit</span>' +
                '</form>';
        }
        structure += '<div class="mf-comments"></div>'; // Container for displaying comments.
        return structure;
    }


    // Helper function to generate and trigger the download of comments as a CSV file.
    function generate_and_download_csv() {
        setTimeout(
          function () {
            var comments = comments_handler.get(); // Retrieve all comments.
            for (
              var i = 0;
              i < comments.length;
              i++
            ) {
                console.log(i); // Log current iteration (for debugging).
                comments[i] = '"' + comments[i].join('","') + '"'; // Format row as CSV string.
                comments[i].replace(/\<br\/\>/g, '\n'); // Replace HTML line breaks with newlines.
            }
            var comments_string = comments.join('\n'); // Join all rows with newlines.

            // The following code for file download is noted to be potentially problematic
            // and might require further research into HTML5 FileSave API for robust behavior.
            window.location.href = "data:text/csv," + encodeURIComponent(comments_string);
          },
          1000 // Delay the download by 1 second.
        );
    }
}


// metaframe_submit function
// Handles the submission of new comments via the comment form.
function metaframe_submit(props) {
    var my = props; // Store properties passed to the function.

    return function (e) {
        e.preventDefault(); // Prevent the default form submission behavior.

        var data        = {},
            error       = false,
            form        = $('#metaframe-form'),
            form_user   = $('#metaframe-user'),
            form_comment = $('#metaframe-comment');

        // Encode and retrieve user and comment data from form fields.
        data.user    = encodeURIComponent(form_user.val());
        data.comment = encodeURIComponent(form_comment.val());

        // Validate form input: ensure both fields are filled.
        if (data.user === '' || data.comment === '') {
            error = "Please fill in all fields."; // Set error message.
            form.addClass('error');              // Add error class to form.
        } else {
            form.removeClass('error');           // Remove error class if valid.
        }

        // If an error exists, display it and stop submission.
        if (error) {
            $('#metaframe-form-error').html(error); // Display error message.
            return;                               // Stop further execution.
        } else {
            $('#metaframe-form-error').html(""); // Clear any previous error messages.
        }

        // Clear form fields and set focus after successful validation.
        $('#metaframe-user').val('');
        $('#metaframe-user').focus();
        $('#metaframe-comment').val('');

        // Generate timestamp for the new comment.
        var now        = new Date();
        var now_minutes = now.getMinutes();

        if (now_minutes < 10) {
            now_minutes = "0" + now_minutes; // Pad minutes with a leading zero if less than 10.
        }

        data.timestamp = (now.getMonth() + 1) + "/" + now.getDate() + "/" +
            now.getFullYear() + " " + now.getHours() + ":" + now_minutes +
            " GMT" + now.getTimezoneOffset() / 60 * -1; // Format timestamp.

        data.page         = window.location.pathname; // Get current page path.
        data.csv_filename = my.csv_filename;          // Assign CSV filename from properties.

        // Add the new comment to the local comments handler and draw it.
        my.comments_handler.add(data);

        // Send the new comment data to the server via AJAX.
        $.ajax(
          {
            url:  my.form_action, // Server endpoint for submission.
            type: 'POST',         // HTTP method.
            data: data            // Data to send.
          }
        )
        .done(
          function () {
            // On successful submission:
            // my.comments_handler.load(); // The original code had this commented out.
            sessionStorage.setItem("metaframe_user", data.user); // Store user in session storage.
          }
        );
    };
}


/*
 * metaframe_comments_handler function
 *
 * This function returns an object with methods to retrieve and update comments
 * displayed on the page. Comments are managed within a closure, meaning
 * the best practice is to call this function once, store its returned object,
 * and then use that object for all subsequent updates and retrievals.
 *
 * @param {object} props - Properties object containing configuration for the handler.
 * @param {string} props.csv_filename - The name of the CSV file from which to load comments.
 * @param {string} props.form_action - The URL endpoint for submitting new comments.
 * @param {Array} props.external_comments - An optional array of comments to initialize with.
 *
 * @returns {object} An object with `load`, `get`, and `add` methods for comment management.
 */
function metaframe_comments_handler(props) {
    var comments = [], // Private array to store comments.
        my       = props; // Store properties for internal use.

    // Define column keys for easy access to comment data fields.
    my.column_key = { 'comment': 0, 'user': 1, 'timestamp': 2, 'page': 3, 'spacer': 4 };


    // Helper function to format an individual column's content.
    function format_col(cur_col, index) {
        var remove_quotes_pattern = /^"|"?/g; // Regex to remove surrounding quotes.
        var line_break_pattern    = /\n/g;   // Regex to find newline characters.

        var new_col = cur_col.replace(remove_quotes_pattern, ''); // Remove quotes.
        new_col = decodeURIComponent(new_col);                 // Decode URI components.

        // If it's the comment column, replace newlines with HTML break tags.
        if (index === my.column_key['comment']) {
            new_col = new_col.replace(line_break_pattern, '<br/>');
        }
        return new_col; // Return the formatted column.
    }


    // Recursive helper function to format each column within a row.
    function format_row(cur_row, index) {
        index = index || 0; // Initialize index if not provided.
        var new_row = [];   // Array to hold formatted columns.

        if (index >= cur_row.length) {
            return new_row; // Base case: all columns processed.
        }

        new_row.push(format_col(cur_row[index], index)); // Format current column and add.
        // Recursively call for the next column and concatenate results.
        return new_row.concat(format_row(cur_row, (index + 1)));
    }


    // Checks if a given comment row already exists in the `comments` array.
    function is_in_comments(cur_row) {
        var result = search_comments(cur_row); // Perform a search.
        if (result.length > 0) {
            return true; // Found a match.
        }
        return false; // No match found.
    }


    // Recursive helper function to search for a specific row within the `comments` array.
    // It compares rows by joining their elements into a string, which is simple but effective for this data.
    function search_comments(row, index) {
        index = index || 0; // Initialize index.
        var matches = [];   // Array to store matching rows.

        if (index >= comments.length) {
            return matches; // Base case: end of comments array.
        }

        // Compare current row with existing comment row.
        if (row.join(',') == comments[index].join(',')) {
            matches.push(row); // Add to matches if they are identical.
        }
        // Recursively search the rest of the comments and concatenate results.
        return matches.concat(search_comments(row, (index + 1)));
    }


    // Recursive helper function to parse raw CSV rows into formatted comment objects.
    // It filters comments relevant to the current page and adds new ones.
    function parse_csv_rows(csv_rows, index) {
        index = index || 0; // Initialize index.
        var rows_to_return = []; // Array to hold parsed and filtered rows.

        if (index >= csv_rows.length) {
            return rows_to_return; // Base case: all CSV rows processed.
        }

        var cur_row = csv_rows[index]; // Get the current CSV row string.
        cur_row = cur_row.split('","'); // Split the row by '","' to get columns.

        // Skip malformed rows (e.g., empty or with insufficient columns).
        if (cur_row.length <= 1) {
            return rows_to_return; // Skip this row.
        }

        cur_row = format_row(cur_row); // Format the columns in the current row.

        // Check if the comment is new and belongs to the current page.
        if (
          !is_in_comments(cur_row) && cur_row[my.column_key['page']] == window.location.pathname
        ) {
            rows_to_return.push(cur_row); // Add to list if it's a new comment for this page.
        }
        // Recursively process the rest of the CSV rows.
        return rows_to_return.concat(parse_csv_rows(csv_rows, (index + 1)));
    }


    // Recursive helper function to build DOM elements for comments.
    function build_comments_elements(comments_to_draw, index) {
        index = index || 0; // Initialize index.
        var new_elements = []; // Array to hold new jQuery elements.

        if (index >= comments_to_draw.length) {
            return new_elements; // Base case: all comments processed.
        }

        var new_element = document.createElement('div'); // Create a new div element.
        new_element = $(new_element);                    // Wrap it with jQuery.
        new_element.addClass('metaframe_new_comment');   // Add a class for styling.

        // Populate the element with comment details.
        new_element.html(
            '<span class="mf-comment">'        + comments_to_draw[index][my.column_key['comment']]   + '</span>' +
            '<span class="mf-comment-user">'   + comments_to_draw[index][my.column_key['user']]      + '</span>' +
            '<span class="mf-comment-timestamp">' + comments_to_draw[index][my.column_key['timestamp']] + '</span>'
        );
        new_elements.push(new_element); // Add the new element to the array.

        // Recursively build elements for the remaining comments.
        return new_elements.concat(
            build_comments_elements(comments_to_draw, (index + 1))
        );
    }


    // Recursive helper function to show comment elements by prepending them to the display area.
    function show_comments_elements(comments_elements, index) {
        index = index || 0; // Initialize index.
        console.log("showing comment " + index); // Log for debugging purposes.

        if (index >= comments_elements.length) {
            return; // Base case: all elements shown.
        }

        comments_elements[index].prependTo('.mf-comments'); // Prepend the current element.
        return show_comments_elements(comments_elements, index + 1); // Recursively show next.
    }


    // Driver function to initiate drawing new comments on the page.
    function draw_new_comments(comments_to_draw, index) {
        var comments_elements = build_comments_elements(comments_to_draw); // Build elements.
        show_comments_elements(comments_elements);                         // Display them.
    }


    // Main function to draw comments from a raw CSV string.
    function draw_comments_csv(csv) {
        console.log("drawing"); // Log status.
        // First, parse the CSV string.
        var csv_rows = csv.split("\n"); // Split into individual rows.
        var comments_to_draw = parse_csv_rows(csv_rows); // Parse and filter rows.

        draw_new_comments(comments_to_draw); // Draw the newly parsed comments.
        comments = comments.concat(comments_to_draw); // Add new comments to the internal store.
    }


    // Public interface for the comments handler.
    return {
        // Method to load comments from the configured CSV file.
        load: function update_comments() {
            $.ajax(
              {
                'url':         my.csv_filename, // URL of the CSV file.
                'contentType': 'text/csv'       // Specify content type.
              }
            ).done(draw_comments_csv); // Call draw_comments_csv on success.
        },
        // Method to retrieve all currently stored comments.
        get: function get_comments() {
            return comments; // Return the internal comments array.
        },
        // Method to add a new comment programmatically.
        add: function add_comment(data) {
            var new_comment = [
                data.comment,   // Comment text.
                data.user,      // User who posted the comment.
                data.timestamp, // Timestamp of the comment.
                data.page       // Page where the comment was made.
            ];
            comments.push(new_comment); // Add the new comment to the internal array.
            draw_new_comments([format_row(new_comment)]); // Draw the new comment on the page.
        }
    };

}