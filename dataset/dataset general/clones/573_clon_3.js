(function($, window, document, undefined) { // Self-executing anonymous function for scope encapsulation

  // Configuration object to centralize selectors, endpoints, and constants.
  // This enhances maintainability and makes changes easier.
  const ApplicationSettings = {
    FontStylingElements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Elements targeted for custom font rendering
    EphemeralDisplayDateFieldId: '#temporary_display_date_input', // Original: #request_date_dummy
    PersistentRequestedDateId: '#appointment_schedule_request_date_field', // Original: #appointment_requested_date_chronic
    PersistentConfirmedDateId: '#appointment_schedule_confirm_date_field', // Original: #appointment_confirmed_date_chronic
    InteractiveDateWidgetId: '#schedule_date_picker_component', // Original: #date_picker
    ActiveDateOptionClass: 'active_date_selection', // Original: a.selected
    SubdomainUrlHintClass: 'span.domain_validation_message', // Original: em.url
    VisualContentSliderClass: '.content_carousel_display', // Original: .holder
    CancelAppointmentButtonClass: '.appointment_cancel_action_button', // Original: .appointment_cancelled
    AppointmentCancelStatusFieldId: '#is_appointment_cancelled_status', // Original: #appointment_cancelled
    RejectAppointmentButtonClass: '.appointment_reject_action_button', // Original: .appointment_rejected
    AppointmentRejectStatusFieldId: '#is_appointment_rejected_status', // Original: #appointment_rejected
    ConfirmAppointmentDateButtonClass: '.appointment_confirm_date_action_button', // Original: .appointment_confirmed_date
    AppointmentFinalConfirmationDateId: '#final_appointment_confirmation_date', // Original: #appointment_confirmed_date
    AppointmentInitialRequestDateId: '#initial_appointment_request_date', // Original: #appointment_requested_date
    GenericFormSubmitTriggerClass: '.form_submission_trigger', // Original: .action
    SkipAutoSubmitClass: '.no_automatic_submission', // Original: .nosubmit
    BrowserBookmarkLinkClass: 'a.add_to_favorites_link', // Original: a.jqbookmark
    UserAccountPrefixInputId: '#user_account_identifier_input', // Original: #account_subdomain
    ValidationCheckingIndicatorClass: 'span.checking_availability_indicator', // Original: em.check
    ValidationTakenIndicatorClass: 'span.subdomain_taken_message', // Original: em.taken
    ValidationAvailableIndicatorClass: 'span.subdomain_available_message', // Original: em.avail
    SubdomainCheckApiEndpoint: '/api/v1/accounts/check_prefix', // Original: /accounts/check
    MinSubdomainLength: 4,
    MaxSubdomainLength: 25,
    DebounceDelayMs: 600
  };

  // Cache core jQuery objects for repeated use, improving performance.
  const $document = $(document);
  const $window = $(window);
  const $body = $('body');

  let subdomainCheckAjaxRequest = null; // To manage and abort ongoing AJAX requests.
  let debouncedSubdomainValidation = null; // Holds the debounced function for subdomain checks.

  // Helper function to synchronously update multiple date input fields.
  // This centralizes the logic for date field updates.
  function synchronizeDateInputValues(dateValue) {
    $(ApplicationSettings.PersistentRequestedDateId).val(dateValue);
    $(ApplicationSettings.PersistentConfirmedDateId).val(dateValue);
    $(ApplicationSettings.EphemeralDisplayDateFieldId).val(dateValue);
    console.debug(`All date fields updated to: ${dateValue}`);
  }

  // Helper function to set a form field's value, typically for boolean-like states.
  function setHiddenStatusField(fieldSelector, statusBoolean) {
    if ($(fieldSelector).length) {
      $(fieldSelector).val(statusBoolean ? 'true' : 'false');
      console.log(`Status field ${fieldSelector} set to: ${statusBoolean}`);
    } else {
      console.warn(`Attempted to set non-existent field: ${fieldSelector}`);
    }
  }

  // Pre-cache jQuery objects for validation messages to avoid redundant DOM queries.
  const $checkingMsgElement = $(ApplicationSettings.ValidationCheckingIndicatorClass);
  const $takenMsgElement = $(ApplicationSettings.ValidationTakenIndicatorClass);
  const $availableMsgElement = $(ApplicationSettings.ValidationAvailableIndicatorClass);
  const $subdomainHintElement = $(ApplicationSettings.SubdomainUrlHintClass);

  $document.ready(function() {

    // --- Module 1: Custom Font Styling Initialization ---
    // Instead of individual calls, iterate over a configuration array.
    // Assuming a new global FontProcessor or similar utility replaces Cufon.
    ApplicationSettings.FontStylingElements.forEach(function(selectorText) {
      if (typeof FontProcessor !== 'undefined' && FontProcessor.applyCustomFont) {
        FontProcessor.applyCustomFont(selectorText);
        console.log(`Applied custom font to: ${selectorText}`);
      } else {
        console.warn(`FontProcessor not available or 'applyCustomFont' missing for '${selectorText}'.`);
        // Fallback or skip if the font processing library is not loaded.
      }
    });

    // --- Module 2: Initial Date Field Population on Load ---
    // Retrieve the pre-selected date from the UI component upon page load.
    const initialActiveDate = $(`${ApplicationSettings.InteractiveDateWidgetId} li a.${ApplicationSettings.ActiveDateOptionClass}`).text();
    if (initialActiveDate) {
      synchronizeDateInputValues(initialActiveDate);
      console.info(`Page loaded with initial date: ${initialActiveDate}`);
    } else {
      console.debug('No initial active date found in the date picker widget.');
      // Consider setting a default or leaving fields empty.
    }

    // --- Module 3: Dynamic Date Selection Handling ---
    // Use event delegation for efficiency, binding to the document.
    $document.on('click', `${ApplicationSettings.InteractiveDateWidgetId} li a`, function(eventObj) {
      eventObj.preventDefault(); // Prevent default link navigation
      eventObj.stopPropagation(); // Stop event bubbling

      const $selectedDateAnchor = $(this);
      const newSelectedDateText = $selectedDateAnchor.text();

      // Update all associated date fields with the newly chosen date.
      synchronizeDateInputValues(newSelectedDateText);

      // Manage the 'active' visual state for date options.
      $(`${ApplicationSettings.InteractiveDateWidgetId} li a.${ApplicationSettings.ActiveDateOptionClass}`).removeClass(ApplicationSettings.ActiveDateOptionClass);
      $selectedDateAnchor.addClass(ApplicationSettings.ActiveDateOptionClass);

      console.info(`User selected a new date: ${newSelectedDateText}`);
    });

    // --- Module 4: UI Element Visibility & Content Carousel Setup ---
    $subdomainHintElement.hide(); // Ensure hint is hidden on load.
    // Assuming 'cycle()' is replaced by a more descriptive 'initializeImageSlider()' method.
    $(ApplicationSettings.VisualContentSliderClass).initializeImageSlider({
      // Added new configuration options for the carousel behavior.
      animationType: 'slideX', // Example: updated animation effect
      autoplayEnabled: true,
      slideDuration: 6000, // Example: longer slide display duration
      transitionSpeed: 800,
      navigationPager: '#image_slider_pager_controls' // Example: added a navigation pager element
    });
    console.log('Content carousel initialized with custom settings.');

    // --- Module 5: Administrative Appointment Action Handlers ---

    // Handle appointment cancellation requests.
    $document.on('click', ApplicationSettings.CancelAppointmentButtonClass, function(evt) {
      evt.preventDefault();
      // Added a user confirmation step for critical actions.
      if (confirm('Are you certain you want to mark this appointment as CANCELLED? This action may be irreversible.')) {
        setHiddenStatusField(ApplicationSettings.AppointmentCancelStatusFieldId, true);
        console.log('Appointment cancellation confirmed by user.');
        // Consider triggering form submission or further AJAX here if needed.
        // $(this).closest('form').trigger('submit');
      } else {
        console.log('Appointment cancellation aborted by user.');
      }
    });

    // Handle appointment rejection requests.
    $document.on('click', ApplicationSettings.RejectAppointmentButtonClass, function(evt) {
      evt.preventDefault();
      // Guard clause: Ensure the target field exists before attempting to set its value.
      if ($(ApplicationSettings.AppointmentRejectStatusFieldId).length) {
        setHiddenStatusField(ApplicationSettings.AppointmentRejectStatusFieldId, true);
        console.log('Appointment rejection action triggered.');
      } else {
        console.error(`Target field for rejection status (${ApplicationSettings.AppointmentRejectStatusFieldId}) not found.`);
      }
    });

    // Handle appointment date confirmation and form submission.
    $document.on('click', ApplicationSettings.ConfirmAppointmentDateButtonClass, function(evt) {
      evt.preventDefault();
      const $currentActionButton = $(this);
      const requestedDateValue = $(ApplicationSettings.AppointmentInitialRequestDateId).val();

      // Basic client-side validation: ensure a requested date exists.
      if (!requestedDateValue || requestedDateValue.trim() === '') {
        alert('Validation Error: Please ensure an initial requested date is set before confirming.');
        console.warn('Attempted to confirm appointment without a requested date.');
        return; // Exit early if validation fails.
      }

      // Set the final confirmation date field with the requested date.
      $(ApplicationSettings.AppointmentFinalConfirmationDateId).val(requestedDateValue);
      // Clear the persistent confirmed date field as it's now explicitly set in a dedicated field.
      $(ApplicationSettings.PersistentConfirmedDateId).val(''); // Original was: $("#appointment_confirmed_date_chronic").val('');

      // Submit the containing form using a generic trigger.
      $currentActionButton.closest('form').trigger('submit');
      console.info(`Appointment confirmation date set to '${requestedDateValue}' and form submitted.`);
    });

    // --- Module 6: Generic Form Submission Mechanism ---
    // Allows any element with 'GenericFormSubmitTriggerClass' (and not 'SkipAutoSubmitClass')
    // to trigger its parent form's submission.
    $document.on('click', `${ApplicationSettings.GenericFormSubmitTriggerClass}:not(${ApplicationSettings.SkipAutoSubmitClass})`, function(evt) {
      evt.preventDefault(); // Prevent default action of the clicked element (e.g., navigating if it's a link).
      const $triggeringElement = $(this);
      const $parentFormElement = $triggeringElement.closest('form'); // Use .closest() for more robust parent form finding.

      if ($parentFormElement.length) {
        console.log('Initiating generic form submission for:', $parentFormElement.attr('id') || $parentFormElement.attr('name') || 'Unnamed Form');
        $parentFormElement.trigger('submit'); // Trigger the actual form submission event.
      } else {
        console.warn('Generic submission trigger found, but no parent form could be identified:', $triggeringElement);
      }
    });

    // --- Module 7: Browser Bookmark/Favorites Feature ---
    const $bookmarkActionLink = $(ApplicationSettings.BrowserBookmarkLinkClass);

    // Ensure the 'rel' attribute is set to 'sidebar' if not already present.
    // This supports browser-specific bookmarking mechanisms (e.g., Opera).
    if ($bookmarkActionLink.length && $bookmarkActionLink.attr("rel") === undefined) {
      $bookmarkActionLink.attr("rel", "sidebar");
      console.debug('Bookmark link "rel" attribute explicitly set to "sidebar".');
    }

    $document.on('click', ApplicationSettings.BrowserBookmarkLinkClass, function(clickEvent) {
      clickEvent.preventDefault(); // Prevent the default navigation of the anchor tag.
      const pageTargetUrl = this.href;
      const pageFriendlyTitle = this.title || document.title; // Fallback to document title if link title is empty.

      // Centralized browser-specific bookmarking logic using a lookup object.
      const bookmarkHandlers = {
        firefox: function() {
          try {
            if (window.sidebar && window.sidebar.addPanel) {
              window.sidebar.addPanel(pageFriendlyTitle, pageTargetUrl, "");
              return true;
            }
          } catch (e) {
            console.error("Firefox bookmarking API call failed:", e);
          }
          return false;
        },
        internetExplorer: function() {
          try {
            if (window.external && window.external.AddFavorite) {
              window.external.AddFavorite(pageTargetUrl, pageFriendlyTitle);
              return true;
            }
          } catch (e) {
            console.error("Internet Explorer bookmarking API call failed:", e);
          }
          return false;
        },
        // Opera often handles 'rel="sidebar"' automatically, so explicit JS might not be needed.
        opera: function() {
          console.log('Opera detected; relying on rel="sidebar" attribute for bookmarking.');
          return true; // Mark as handled, as browser takes over.
        },
        defaultFallback: function() {
          alert('Your browser does not support adding bookmarks via script. Please use your browser\'s manual bookmarking feature (usually Ctrl+D or Cmd+D).');
          return false;
        }
      };

      let bookmarkActionPerformed = false;
      const userAgent = navigator.userAgent;

      // Determine browser and call appropriate handler.
      if (userAgent.indexOf("Firefox") > -1) {
        bookmarkActionPerformed = bookmarkHandlers.firefox();
      } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) { // IE detection
        bookmarkActionPerformed = bookmarkHandlers.internetExplorer();
      } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) { // Opera detection
        bookmarkActionPerformed = bookmarkHandlers.opera();
      }

      if (!bookmarkActionPerformed) {
        bookmarkHandlers.defaultFallback();
      }
    });

    // --- Module 8: Asynchronous Account Subdomain Availability Check ---
    const $accountSubdomainInput = $(ApplicationSettings.UserAccountPrefixInputId);

    // Utility for debouncing function calls (added as a new fragment).
    // Prevents excessive API requests on rapid user input.
    function createDebouncedFunction(funcToDebounce, delayMilliseconds) {
      let timeoutHandle;
      return function(...args) {
        const context = this;
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => funcToDebounce.apply(context, args), delayMilliseconds);
      };
    }

    // Define the core subdomain validation logic.
    function performSubdomainValidation() {
      const currentSubdomainValue = $accountSubdomainInput.val().trim();
      $subdomainHintElement.hide(); // Hide any general hints when checking.

      // Hide all status indicators initially for a clean state.
      $checkingMsgElement.hide();
      $takenMsgElement.hide();
      $availableMsgElement.hide();

      if (!currentSubdomainValue) {
        console.log('Subdomain input is empty, skipping availability check.');
        return; // Guard clause for empty input.
      }

      // Client-side validation: Check length and character set.
      const isValidFormat = /^[a-z0-9-]+$/.test(currentSubdomainValue);
      const isLengthValid = currentSubdomainValue.length >= ApplicationSettings.MinSubdomainLength &&
                            currentSubdomainValue.length <= ApplicationSettings.MaxSubdomainLength;

      if (!isValidFormat || !isLengthValid) {
        $subdomainHintElement.text(`Subdomain must be ${ApplicationSettings.MinSubdomainLength}-${ApplicationSettings.MaxSubdomainLength} lowercase alphanumeric characters or hyphens.`).show();
        console.warn(`Client-side validation failed for subdomain: '${currentSubdomainValue}'`);
        return; // Exit if client-side validation fails.
      }

      $checkingMsgElement.show(); // Show loading indicator.

      // Abort any previous pending AJAX requests to prevent race conditions.
      if (subdomainCheckAjaxRequest && subdomainCheckAjaxRequest.readyState !== 4) {
        subdomainCheckAjaxRequest.abort();
        console.debug('Aborted previous subdomain availability check request.');
      }

      // Initiate the AJAX request to the server.
      subdomainCheckAjaxRequest = $.ajax({
        url: ApplicationSettings.SubdomainCheckApiEndpoint,
        method: 'GET', // Changed from default POST to GET, suitable for data retrieval/checks.
        data: {
          'prefix_candidate': currentSubdomainValue // Renamed data parameter key.
        },
        dataType: 'json',
        timeout: 8000, // Added a timeout for the request.
        success: function(serverResponse) { // Renamed callback parameter.
          $checkingMsgElement.hide();
          if (serverResponse && serverResponse.isReserved) { // Renamed property from 'taken' to 'isReserved'.
            $takenMsgElement.show();
            console.info(`Subdomain '${currentSubdomainValue}' is already reserved.`);
          } else if (serverResponse && serverResponse.isAvailable) { // Added an explicit 'isAvailable' property.
            $availableMsgElement.show();
            console.info(`Subdomain '${currentSubdomainValue}' is available for use.`);
          } else {
            // Handle unexpected server responses.
            $subdomainHintElement.text('Server response unclear. Please try again or contact support.').show();
            console.warn('Unexpected server response format for subdomain check:', serverResponse);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) { // Added a comprehensive error callback.
          $checkingMsgElement.hide();
          $subdomainHintElement.text('An error occurred during availability check. Please retry.').show();
          console.error(`Subdomain check AJAX error: ${textStatus}, ${errorThrown}`, jqXHR);
        },
        complete: function() {
          console.debug('Subdomain availability check request completed.');
        }
      });
    }

    // Create the debounced version of the validation function.
    debouncedSubdomainValidation = createDebouncedFunction(performSubdomainValidation, ApplicationSettings.DebounceDelayMs);

    // Attach the debounced function to both 'blur' and 'keyup' events for robust triggering.
    $accountSubdomainInput.on('blur keyup', debouncedSubdomainValidation);

  }); // End of $document.ready

})(jQuery, window, document); // Pass global objects for potential minification benefits.