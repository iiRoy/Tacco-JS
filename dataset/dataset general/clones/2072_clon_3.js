// A derivative work based on Pleft, originally Copyright 2009-2011 Sander Dijkhuis.
// This modified component is distributed under the terms of the GNU General Public License v3 or later.
// For full license details, refer to <http://www.gnu.org/licenses/>.

// This module manages the interactive event scheduling interface,
// handling data loading, user interaction, and persistence of availability choices.

(function($) { // Encapsulates code within an Immediately Invoked Function Expression (IIFE)
  'use strict'; // Enforce stricter parsing and error handling

  // --- Configuration Constants ---
  const MAX_PERSON_LABEL_LEN = 19;    // Maximum display length for attendee names in the list.
  const MAX_NOTE_CONTENT_LEN = 500;   // Maximum length for user-provided comments/notes on availability.
  const AUTO_SAVE_DELAY_MS = 5000;    // Delay in milliseconds before an automatic save is triggered.

  // Define CSS class mappings for various availability states.
  const AVAILABILITY_STATUS_CLASSES = {
    '-1': 'status-no',    // Class for 'Not Available'
    '0': 'status-maybe',  // Class for 'Maybe Available' or undecided
    '1': 'status-yes'     // Class for 'Fully Available'
  };

  // --- Module-level Variables ---
  let eventTimeSlots;       // An array storing the unique identifiers of all proposed time slots.
  let deferralHandle = null; // Stores the timeout ID for the deferred saving operation.

  // --- Event Handlers and Initial Setup ---

  /**
   * Binds to the window's 'beforeunload' event to ensure any pending data is saved.
   * Performs a synchronous save if an auto-save was scheduled.
   */
  $(window).on('beforeunload', function() {
    if (deferralHandle) {
      persistUserChoices(false); // Perform synchronous save to block unload until complete.
      // Clear the timeout to prevent a redundant async save.
      clearTimeout(deferralHandle);
      deferralHandle = null;
    }
    // No return value needed to prompt user; modern browsers handle this differently.
  });

  /**
   * Attaches a click handler to the manual save button, triggering an asynchronous save.
   */
  $('.save-controls button').on('click', function() {
    persistUserChoices(true); // Trigger an immediate, asynchronous save.
  });

  // Initially hide all main content sections to prevent a Flash Of Unstyled Content (FOUC)
  // while data is loading and the UI is being constructed.
  $('.overview-container > *').hide();

  /**
   * Initiates the AJAX request to fetch event data from the server.
   * Displays an error message if data loading fails.
   */
  $.ajax({
    type: 'GET',
    url: '/event-data?session_id=' + window.eventIdentifier, // Use a renamed query parameter for clarity.
    dataType: 'json',
    success: function(retrievedPayload) {
      console.log("Event data loaded successfully.");
      processAndDisplayEvent(retrievedPayload);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Failed to load event data:", textStatus, errorThrown, jqXHR.responseText);
      $('.not-found-message').show(); // Display a user-friendly 'not found' message.
      $('.sidebar-assistance, .event-interface').hide(); // Hide interactive elements.
    }
  });

  // --- Core Functions ---

  /**
   * Orchestrates the display of event details based on fetched data.
   * This function populates the UI with event metadata, participant lists, and time slots.
   * @param {object} eventPayload - The data object containing event metadata, dates, and participants.
   */
  function processAndDisplayEvent(eventPayload) {
    // --- Input Validation Guard Clause ---
    if (!eventPayload || !eventPayload.meta || !eventPayload.dates || !eventPayload.people) {
      console.error("Invalid or incomplete event payload received. Cannot display event.");
      $('.not-found-message').show();
      $('.sidebar-assistance, .event-interface').hide();
      return;
    }

    let currentUserId = -1; // Stores the array index of the current user for initial selection.

    /**
     * Helper function to visually highlight a selected item in a list and clear existing availability displays.
     * @param {HTMLElement} selectedElement - The DOM element to be highlighted.
     */
    function highlightSelection(selectedElement) {
      $('.event-interface .selector-list li').removeClass('active-selection'); // Remove highlight from all.
      $(selectedElement).addClass('active-selection'); // Apply highlight to the clicked item.
      $('.event-interface .availability-display').empty(); // Clear previous availability views.
    }

    // After successful data load and initial processing, show the main interface.
    $('.sidebar-assistance, .event-interface').show();

    // Populate event description and update the document title.
    $('.event-interface .event-description').html(eventPayload.meta.description);
    document.title = `Event Scheduler · ${eventPayload.meta.title}`; // Using template literal.

    // Initialize administrative tools based on user permissions.
    setupAdminControls(eventPayload);

    // Extract and store unique identifiers for all proposed time slots.
    eventTimeSlots = [];
    eventPayload.dates.forEach(slot => {
      eventTimeSlots.push(slot.id);
    });

    // --- Populate Participants Section ---
    const participantSelector = $('.event-interface .attendees .selector-list');
    participantSelector.empty(); // Clear any existing participant entries.

    eventPayload.people.forEach((attendee, index) => {
      let personName = attendee.name;
      // Truncate long names for display purposes.
      if (personName.length > MAX_PERSON_LABEL_LEN) {
        personName = personName.substring(0, MAX_PERSON_LABEL_LEN - 2) + '…';
      }

      // Process raw availability data into a more usable array format.
      const rawAvailability = eventPayload.availability[attendee.id] || {};
      const processedAvailability = eventTimeSlots.map(slotId => rawAvailability[slotId] || []);

      const individualEntry = {
        label: personName,
        timeSlotStatus: processedAvailability,
        isCurrentUser: attendee.id === eventPayload.invitee // Determines if this participant is the current user.
      };

      const listItemElem = $('<li>')
        .text(personName)
        .data('attendeeInfo', individualEntry) // Store full participant info as jQuery data.
        .appendTo(participantSelector);

      if (individualEntry.isCurrentUser) {
        listItemElem.addClass('current-user'); // Add a specific class for the current user.
        currentUserId = index; // Record the index of the current user.
      }
    });

    /**
     * Handles participant selection clicks.
     * Displays a detailed availability bubble for the selected person across all time slots.
     */
    $('.event-interface .attendees .selector-list li').on('click', function() {
      const clickedItem = this;
      highlightSelection(clickedItem);

      let selectedPersonIndex = 0;
      // Determine the index of the clicked participant.
      $('.event-interface .attendees .selector-list li').each(function(i) {
        if (this === clickedItem) {
          selectedPersonIndex = i;
          return false; // Break the jQuery .each loop.
        }
      });

      // Create an info bubble for the selected participant.
      const infoBubble = $('<div class="attendee-bubble info-bubble">')
        .appendTo('.event-interface .availability-display');
      const pointerIndicator = $('<div class="bubble-arrow">')
        .css('margin-top', 5 + selectedPersonIndex * 40) // Position arrow dynamically.
        .appendTo(infoBubble);
      infoBubble.css('min-height', 5 + selectedPersonIndex * 40 + 12); // Adjust bubble height.

      const attendeeData = $(this).data('attendeeInfo'); // Retrieve participant data.

      // Generate and append availability UI for each time slot for this participant.
      $('.event-interface .time-slots .selector-list li').each(function(i) {
        generateAvailabilityUI(attendeeData, i).appendTo(infoBubble);
      });
    });

    // --- Populate Proposed Dates (Time Slots) Section ---
    const dateSelector = $('.event-interface .time-slots .selector-list');
    dateSelector.empty(); // Clear any existing date entries.

    eventTimeSlots.forEach((slotId, index) => {
      const slotDetails = eventPayload.dates.find(d => d.id === slotId); // Find full slot details.
      if (!slotDetails) {
        console.warn(`Details for time slot ID ${slotId} not found.`);
        return; // Skip if details are missing.
      }

      const timeSlotMetrics = { // Initialize metrics for this time slot.
        displayString: slotDetails.s,
        yesCount: 0,
        noCount: 0
      };

      const displayContent = $('<span>').text(timeSlotMetrics.displayString);
      $('<span class="progress-bar">').appendTo(displayContent); // Add a placeholder for the progress bar.

      const listItemElem = $('<li>')
        .html(displayContent)
        .data('slotMetrics', timeSlotMetrics) // Store metrics as jQuery data.
        .appendTo(dateSelector);

      // Aggregate availability counts ('yes'/'no') for this time slot from all participants.
      $('.event-interface .attendees .selector-list li').each(function() {
        const individual = $(this).data('attendeeInfo');
        const currentAvailability = individual.timeSlotStatus[index];
        if (currentAvailability && currentAvailability.length > 0) {
          if (currentAvailability[0] === 1) {
            timeSlotMetrics.yesCount++;
          } else if (currentAvailability[0] === -1) {
            timeSlotMetrics.noCount++;
          }
        }
      });

      refreshProgressBar(listItemElem); // Update the visual progress bar for this time slot.
    });

    /**
     * Handles time slot selection clicks.
     * Displays a detailed availability bubble for the selected time slot across all participants.
     */
    $('.event-interface .time-slots .selector-list li').on('click', function() {
      const clickedItem = this;
      highlightSelection(clickedItem);

      let selectedDateIdx = 0;
      // Determine the index of the clicked time slot.
      $('.event-interface .time-slots .selector-list li').each(function(i) {
        if (this === clickedItem) {
          selectedDateIdx = i;
          return false;
        }
      });

      // Clear any previously displayed info bubbles to prevent stacking.
      $('.event-interface .availability-display .info-bubble').remove();

      // For each participant, generate and display their availability for the selected time slot.
      $('.event-interface .attendees .selector-list li').each(function() {
        const infoBubble = $('<div class="date-bubble info-bubble">')
          .appendTo('.event-interface .availability-display');
        $('<div class="bubble-arrow">').appendTo(infoBubble);
        const attendeeData = $(this).data('attendeeInfo');
        generateAvailabilityUI(attendeeData, selectedDateIdx).appendTo(infoBubble);
      });
    });

    // --- Initial UI State ---
    // Trigger a click event on the current user's entry to show their availability by default.
    if (currentUserId !== -1) {
      $('.event-interface .attendees .selector-list li:eq(' + currentUserId + ')').trigger('click');
    } else {
      // Fallback: If no current user is identified, select the first participant.
      console.warn("Current user not found in participant list. Selecting first participant as default.");
      $('.event-interface .attendees .selector-list li:first').trigger('click');
    }
  }

  /**
   * Persists the current user's availability choices to the server.
   * @param {boolean} isAsyncOperation - True for asynchronous (non-blocking) save, false for synchronous (blocking).
   */
  function persistUserChoices(isAsyncOperation) {
    // Clear any existing deferred save to ensure only the latest changes are saved.
    if (deferralHandle) {
      clearTimeout(deferralHandle);
      deferralHandle = null;
    }

    const currentUserElement = $('.event-interface .selector-list .current-user');
    if (currentUserElement.length === 0) {
      console.warn("Cannot save: Current user element not found in the DOM.");
      return; // Exit if the current user's UI element is missing.
    }

    const currentUserInfo = currentUserElement.data('attendeeInfo');
    if (!currentUserInfo || !currentUserInfo.timeSlotStatus) {
      console.warn("Cannot save: Current user availability data is incomplete or missing.");
      return; // Exit if user data is malformed.
    }

    const availabilityRecords = [];
    currentUserInfo.timeSlotStatus.forEach((statusArray, index) => {
      const slotId = eventTimeSlots[index];
      const statusValue = statusArray[0] || 0; // Default status to '0' (maybe).
      const commentText = statusArray[1] || ''; // Default comment to empty string.
      // Format each record as a string "slotId:status:comment\n".
      availabilityRecords.push(`${slotId}:${statusValue}:${commentText}\n`);
    });

    // If there are no records to save, and it's a synchronous operation (e.g., beforeunload),
    // we can skip the AJAX call.
    if (availabilityRecords.length === 0 && !isAsyncOperation) {
      console.log("No availability records to save; skipping synchronous persistence.");
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/update-availability', // Renamed endpoint for setting availability.
      async: isAsyncOperation,
      data: {
        eventId: window.eventIdentifier, // Pass the event identifier.
        availabilityData: availabilityRecords.join('') // Send all records as a single string.
      },
      success: function() {
        const now = new Date();
        // Format the current time for display (HH:MM:SS).
        const formattedTime = [
          String(now.getHours()).padStart(2, '0'), ':',
          String(now.getMinutes()).padStart(2, '0'), ':',
          String(now.getSeconds()).padStart(2, '0')
        ].join('');
        // Update the status message in the UI.
        $('.event-interface .status-message').text(`${_i18n_('Auto-saved on')} ${formattedTime}.`);
        $('.event-interface .save-controls button').prop('disabled', true); // Disable button after save.
        console.log("User availability saved successfully.");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to save user availability:", textStatus, errorThrown, jqXHR.responseText);
        $('.event-interface .status-message').text(`${_i18n_('Save failed.')} ${_i18n_('Please try again.')}`);
        // Optionally, re-enable the button or provide retry option.
      }
    });
  }

  /**
   * Updates the visual progress bar for a given time slot item to reflect participant responses.
   * @param {jQuery} timeSlotItemElem - The jQuery object for the list item representing the time slot.
   */
  function refreshProgressBar(timeSlotItemElem) {
    const slotMetrics = timeSlotItemElem.data('slotMetrics');
    if (!slotMetrics) {
      console.warn("Cannot refresh progress bar: Time slot metrics missing.");
      return; // Guard clause for missing data.
    }

    const totalBarWidth = 100; // Use 100 for percentage-based width.
    const numberOfAttendees = $('.event-interface .attendees .selector-list li').length;

    if (numberOfAttendees === 0) {
      // If no attendees, set bar to full default width.
      timeSlotItemElem.find('.progress-bar').css({ borderLeftWidth: 0, borderRightWidth: 0, width: totalBarWidth });
      return;
    }

    // Calculate widths based on percentages of 'yes' and 'no' responses.
    const yesPercentage = (slotMetrics.yesCount / numberOfAttendees);
    const noPercentage = (slotMetrics.noCount / numberOfAttendees);

    const leftWidth = yesPercentage * totalBarWidth;
    const rightWidth = noPercentage * totalBarWidth;
    let middleWidth = totalBarWidth - leftWidth - rightWidth;

    // Adjust for potential floating point inaccuracies or if total exceeds 100.
    if (middleWidth < 0) {
      middleWidth = 0; // Clamp to zero if negative.
      console.warn("Adjusted negative middle width in progress bar to 0 due to calculation.");
    }

    timeSlotItemElem.find('.progress-bar').css({
      borderLeftWidth: leftWidth,
      borderRightWidth: rightWidth,
      width: middleWidth
    });
  }

  /**
   * Schedules a delayed save operation for user choices.
   * If a save is already scheduled, it clears the old one and sets a new timer.
   */
  function schedulePersistence() {
    if (deferralHandle) {
      clearTimeout(deferralHandle); // Clear any existing timeout.
    }
    // Schedule a new save after a period of inactivity.
    deferralHandle = setTimeout(() => { persistUserChoices(true); }, AUTO_SAVE_DELAY_MS);
    $('.save-controls button').prop('disabled', false); // Enable the manual save button.
  }

  /**
   * Generates the UI element for viewing or editing a person's availability for a specific time slot.
   * This function dynamically creates either an editable form (for the current user)
   * or a read-only display (for other participants).
   * @param {object} individualEntry - The participant's data object.
   * @param {number} timeSlotIndex - The array index of the specific time slot.
   * @returns {jQuery} The generated UI element (a div containing availability controls/display).
   */
  function generateAvailabilityUI(individualEntry, timeSlotIndex) {
    const uiContainer = $('<div class="availability-item">'); // Main container for this availability view.

    // Retrieve current availability status and comment for the given time slot.
    // Default to [0, ''] if no data exists.
    const currentAvailabilityState = individualEntry.timeSlotStatus[timeSlotIndex] || [0, ''];
    let statusValue = currentAvailabilityState[0];
    let commentContent = currentAvailabilityState[1];

    /**
     * Helper function to handle changes in availability toggle buttons.
     * Updates UI, underlying data, and schedules a save.
     */
    const handleToggleChange = function() {
      const clickedToggle = $(this);
      uiContainer.find('.status-toggle').removeClass('is-checked'); // Remove 'checked' state from all toggles.
      clickedToggle.addClass('is-checked'); // Apply 'checked' state to the clicked toggle.

      const newStatus = clickedToggle.data('status-value');
      if (newStatus === statusValue) {
        return; // If status hasn't changed, do nothing.
      }

      const previousStatus = statusValue; // Store previous status for updating counts.
      statusValue = newStatus; // Update the local status variable.

      // Update the overall time slot metrics (yes/no counts) for the progress bar.
      const selectedDateItem = $('.event-interface .time-slots li:eq(' + timeSlotIndex + ')');
      const timeSlotMetrics = selectedDateItem.data('slotMetrics');

      if (timeSlotMetrics) {
        // Decrement count for the old status.
        if (previousStatus === 1) timeSlotMetrics.yesCount--;
        if (previousStatus === -1) timeSlotMetrics.noCount--;

        // Increment count for the new status.
        if (statusValue === 1) timeSlotMetrics.yesCount++;
        if (statusValue === -1) timeSlotMetrics.noCount++;

        refreshProgressBar(selectedDateItem); // Refresh the progress bar visually.
      } else {
        console.warn("Time slot metrics not found for updating progress bar.");
      }

      // Update the main container's CSS class to reflect the new availability status.
      uiContainer.removeClass(AVAILABILITY_STATUS_CLASSES[previousStatus]);
      uiContainer.addClass(AVAILABILITY_STATUS_CLASSES[statusValue]);

      // Update the underlying data structure that will be sent to the server.
      individualEntry.timeSlotStatus[timeSlotIndex][0] = statusValue;

      schedulePersistence(); // Plan to save the updated choices.
    };

    // --- Current User's Editable Availability Form ---
    if (individualEntry.isCurrentUser) {
      uiContainer.addClass('editable-form'); // Add class to style as an editable form.

      const optionGroup = $('<div class="status-options">').appendTo(uiContainer); // Container for status toggles.
      const toggleButtons = [
        $('<div class="status-toggle label-yes">'),
        $('<div class="status-toggle label-maybe">'),
        $('<div class="status-toggle label-no">')
      ];

      toggleButtons.forEach((btn, i) => {
        const value = 1 - i; // Map index to status: 0->1(yes), 1->0(maybe), 2->-1(no).
        btn.data('status-value', value)
           .appendTo(optionGroup)
           .on('click', handleToggleChange); // Attach handler.
      });

      // Set the initial 'checked' state for the toggle buttons based on current status.
      let foundInitialStatus = false;
      for (let j = 0; j < toggleButtons.length; j++) {
        if (statusValue === (1 - j)) {
          toggleButtons[j].addClass('is-checked');
          foundInitialStatus = true;
          break;
        }
      }
      if (!foundInitialStatus) {
        // If no status is explicitly set or recognized, default to 'maybe'.
        toggleButtons[1].addClass('is-checked');
        statusValue = 0; // Ensure data reflects this default.
        individualEntry.timeSlotStatus[timeSlotIndex][0] = statusValue;
        console.info("Defaulting current user's availability to 'maybe'.");
      }

      uiContainer.addClass(AVAILABILITY_STATUS_CLASSES[statusValue]); // Apply initial status class to container.

      // Create and configure the comment input area.
      const commentInputArea = $('<textarea class="note-input">')
        .keydown(function(event) {
          // Prevent default Enter key behavior (e.g., form submission) unless Shift is pressed.
          if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            // Optionally, trigger blur to save changes immediately.
            $(this).trigger('blur');
          }
        })
        .on('input blur', function() { // Use 'input' for real-time changes, 'blur' for final save.
          let currentComment = this.value;
          // Truncate comment if it exceeds max length.
          if (currentComment.length > MAX_NOTE_CONTENT_LEN) {
            this.value = currentComment.substring(0, MAX_NOTE_CONTENT_LEN);
            currentComment = this.value; // Update variable after truncation.
            console.warn("Comment truncated to maximum allowed length.");
          }
          // Only update data and schedule save if the comment has actually changed.
          if (individualEntry.timeSlotStatus[timeSlotIndex][1] !== currentComment) {
            individualEntry.timeSlotStatus[timeSlotIndex][1] = currentComment;
            schedulePersistence();
          }
        })
        .appendTo(uiContainer)
        .val(commentContent); // Populate with existing comment.
    } else {
      // --- Read-Only Display for Other Participants ---
      uiContainer.addClass('read-only-display'); // Add class to style as a static display.

      const statusDisplay = $('<div class="status-indicator">').appendTo(uiContainer);
      const commentDisplay = $('<div class="comment-text">').appendTo(uiContainer);

      if (currentAvailabilityState && currentAvailabilityState.length > 0) {
        uiContainer.addClass(AVAILABILITY_STATUS_CLASSES[statusValue]);
        // Dynamically create a label class based on the status.
        $('<div>').addClass('label-' + AVAILABILITY_STATUS_CLASSES[statusValue].replace('status-', ''))
          .appendTo(statusDisplay);
        commentDisplay.text(commentContent || ''); // Display comment, or empty string if none.
      } else {
        // If no availability data, display as 'maybe' with a placeholder comment.
        statusValue = 0; // Default to 'maybe'.
        uiContainer.addClass(AVAILABILITY_STATUS_CLASSES[statusValue]);
        $('<div class="label-maybe">').appendTo(statusDisplay);
        commentDisplay.text(`[${_i18n_('Not provided yet.')}]`); // Updated placeholder message.
      }
    }
    return uiContainer;
  }

  /**
   * Initializes administrative and event management features based on user permissions.
   * This includes forms for proposing dates, inviting participants, and managing invitations.
   * @param {object} eventPayload - The full event data object.
   */
  function setupAdminControls(eventPayload) {
    const eventCreatorId = eventPayload.meta.initiator;
    const currentSessionUserId = eventPayload.user;
    const canProposeMore = eventPayload.meta.proposeMore; // Flag from server indicating if more dates can be proposed.
    const isCreator = (eventCreatorId === currentSessionUserId); // Check if the current user is the event creator.

    // --- Common Setup for Admin Forms ---
    // Pre-fill event ID for proposal and invitation forms.
    $('.propose-date-form input[name=eventId]').val(window.eventIdentifier);
    $('.invite-participant-form input[name=eventId]').val(window.eventIdentifier);

    // --- Propose Another Date Feature ---
    if (!isCreator && !canProposeMore) {
      // Hide the propose date form if not the creator and not explicitly allowed.
      $('.propose-date-form').hide();
    }

    // --- Creator-Specific Tools ---
    if (isCreator) {
      // Resend Invitations Form:
      $('.resend-invitations-form input[name=eventId]').val(window.eventIdentifier);
      const inviteeSelect = $('.resend-invitations-form select[name=inviteeId]');
      eventPayload.people.forEach(person => {
        // Populate dropdown with other participants, excluding the current invitee (self).
        if (person.id !== eventPayload.invitee) {
          $('<option>').val(person.id).text(person.name)
            .appendTo(inviteeSelect);
        }
      });
      // Disable resend options if there's only one participant (the creator themselves).
      if (eventPayload.people.length <= 1) {
        $('.resend-invitations-form select, .resend-invitations-form button').prop('disabled', true);
      }

      // Invite Another Participant Form: (setup already done above)

      // Display Email Addresses of all Invitees:
      const emailRecipientList = eventPayload.addresses.join(', '); // Join addresses into a comma-separated string.
      const emailTextarea = $('.email-addresses-display textarea');
      emailTextarea.val(emailRecipientList);
      // Disable textarea if there's only one participant (no other emails to show).
      if (eventPayload.people.length <= 1) {
        emailTextarea.prop('disabled', true);
      }
    } else {
      // Hide all creator-specific tools for non-creators.
      $('.resend-invitations-form, .email-addresses-display, .invite-participant-form')
        .hide();
    }

    // --- Universal Form Submission Handler for Admin Tools ---
    $('.tool-form').on('submit', function(event) {
      event.preventDefault(); // Prevent default browser form submission.

      const submissionForm = $(this);
      const submitButton = submissionForm.find('button[type="submit"]');
      const successMessage = submissionForm.find('.action-success-msg');
      const errorMessage = submissionForm.find('.action-error-msg');

      submitButton.prop('disabled', true); // Disable button to prevent multiple submissions.
      successMessage.text(''); // Clear previous messages.
      errorMessage.text('');

      $.ajax({
        type: 'POST',
        url: submissionForm.attr('action'), // Use the form's action attribute as the URL.
        data: submissionForm.serialize(), // Serialize form data for submission.
        success: function() {
          successMessage.text(_i18n_('Operation successful!'));
          submitButton.prop('disabled', false); // Re-enable button.
          // Reload the page for specific forms that require a fresh data load.
          if (submissionForm.hasClass('invite-participant-form') ||
              submissionForm.hasClass('propose-date-form')) {
            location.reload();
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("Admin tool submission failed:", textStatus, errorThrown, jqXHR.responseText);
          errorMessage.text(_i18n_('An unexpected error occurred.'));
          submitButton.prop('disabled', false); // Re-enable button.
        }
      });
    });
  }

  // --- Internationalization Placeholder ---
  /**
   * Placeholder function for internationalization (i18n).
   * In a real application, this would typically be provided by a dedicated i18n library
   * that translates text based on the user's locale.
   * For this clone, it simply returns the input text.
   * @param {string} text - The text string to be translated.
   * @returns {string} The (untranslated) text string.
   */
  function _i18n_(text) {
    return text;
  }

})(jQuery); // Pass jQuery object into the IIFE to alias it as '$' within the module.