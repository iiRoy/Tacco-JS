((domDocument) => {
  const applicationInitializer = () => {

    // Utility function to attach event listeners to multiple elements
    const attachDomEvent = (targetSelector, eventType, handlerFunction) => {
      const selectedElements = domDocument.querySelectorAll(targetSelector);
      selectedElements.forEach(element => element.addEventListener(eventType, handlerFunction));
    };

    // Utility function to control element visibility
    const controlElementDisplay = (targetSelector, shouldBeVisible, displayMode = 'inline-block') => {
      const elementNode = domDocument.querySelector(targetSelector);
      if (elementNode) {
        elementNode.style.display = shouldBeVisible ? displayMode : 'none';
      }
    };

    // 1. Cufon Font Replacement for Headings
    const headingTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    headingTypes.forEach(tagIdentifier => {
      if (typeof Cufon !== 'undefined' && Cufon.replace) {
        Cufon.replace(tagIdentifier);
      }
    });

    // 2. Initialize Date Input Fields from Selected Date Picker Item
    const retrieveCurrentSelectedDate = () => {
      const chosenDateAnchor = domDocument.querySelector('#date_picker li a.selected');
      return chosenDateAnchor ? chosenDateAnchor.textContent.trim() : '';
    };

    const initialDateSelection = retrieveCurrentSelectedDate();
    if (initialDateSelection) {
      const requestDateInput = domDocument.getElementById('request_date_dummy');
      const requestedChronicDateInput = domDocument.getElementById('appointment_requested_date_chronic');
      const confirmedChronicDateInput = domDocument.getElementById('appointment_confirmed_date_chronic');

      if (requestDateInput) requestDateInput.value = initialDateSelection;
      if (requestedChronicDateInput) requestedChronicDateInput.value = initialDateSelection;
      if (confirmedChronicDateInput) confirmedChronicDateInput.value = initialDateSelection;
    }

    // 3. Date Picker Item Click Handler
    attachDomEvent('#date_picker li a', 'click', (eventObject) => {
      eventObject.preventDefault(); // Stop default anchor behavior

      const clickedElementValue = eventObject.currentTarget.textContent.trim();

      const updateTargetA = domDocument.getElementById('appointment_requested_date_chronic');
      const updateTargetB = domDocument.getElementById('appointment_confirmed_date_chronic');
      const updateTargetC = domDocument.getElementById('request_date_dummy');

      if (updateTargetA) updateTargetA.value = clickedElementValue;
      if (updateTargetB) updateTargetB.value = clickedElementValue;
      if (updateTargetC) updateTargetC.value = clickedElementValue;

      const previouslyMarked = domDocument.querySelector('#date_picker li a.selected');
      if (previouslyMarked) {
        previouslyMarked.classList.remove('selected');
      }
      eventObject.currentTarget.classList.add('selected');
    });

    // 4. Hide URL Indicator Element
    controlElementDisplay('em.url', false);

    // 5. Initialize jQuery Cycle Plugin for Slideshows
    const slideshowElement = domDocument.querySelector('.holder');
    if (slideshowElement && typeof jQuery !== 'undefined' && jQuery.fn && jQuery.fn.cycle) {
      jQuery(slideshowElement).cycle(); // Requires jQuery to be present
    }

    // 6. Admin Appointment Interaction Handlers
    attachDomEvent('.appointment_cancelled', 'click', (interactionEvent) => {
      interactionEvent.preventDefault();
      const cancellationStatusField = domDocument.getElementById('appointment_cancelled');
      if (cancellationStatusField) cancellationStatusField.value = 'true';
    });

    attachDomEvent('.appointment_rejected', 'click', (interactionEvent) => {
      interactionEvent.preventDefault();
      const rejectionStatusField = domDocument.getElementById('appointment_rejected');
      if (rejectionStatusField) rejectionStatusField.value = 'true';
    });

    attachDomEvent('.appointment_confirmed_date', 'click', (interactionEvent) => {
      interactionEvent.preventDefault();
      const confirmationDateField = domDocument.getElementById('appointment_confirmed_date');
      const initialRequestedDateField = domDocument.getElementById('appointment_requested_date');
      const chronicConfirmationDateField = domDocument.getElementById('appointment_confirmed_date_chronic');

      if (confirmationDateField && initialRequestedDateField) {
        confirmationDateField.value = initialRequestedDateField.value;
      }
      if (chronicConfirmationDateField) {
        chronicConfirmationDateField.value = '';
      }

      const containingFormNode = interactionEvent.currentTarget.closest('form');
      if (containingFormNode) {
        containingFormNode.submit();
      }
    });

    // 7. Generic Form Submission Trigger (.action elements)
    const formActionElements = Array.from(domDocument.querySelectorAll('.action'));
    formActionElements
      .filter(actionNode => !actionNode.classList.contains('nosubmit'))
      .forEach(submitTrigger => {
        submitTrigger.addEventListener('click', (submissionEvent) => {
          submissionEvent.preventDefault();
          const formToSubmit = submissionEvent.currentTarget.closest('form');
          if (formToSubmit) {
            formToSubmit.submit();
          }
        });
      });

    // 8. Browser Bookmarking Feature
    const bookmarkActionLink = domDocument.querySelector('a.jqbookmark');
    if (bookmarkActionLink) {
      if (window.opera) {
        const currentRelAttributeValue = bookmarkActionLink.getAttribute('rel');
        if (currentRelAttributeValue !== '') { // Replicates original jQuery attr() behavior
          bookmarkActionLink.setAttribute('rel', 'sidebar');
        }
      }

      bookmarkActionLink.addEventListener('click', (bookmarkActionEvent) => {
        bookmarkActionEvent.preventDefault();

        const pageResourceURL = bookmarkActionLink.href;
        const pageResourceTitle = bookmarkActionLink.title;

        if (window.sidebar && typeof window.sidebar.addPanel === 'function') { // For Mozilla Firefox
          window.sidebar.addPanel(pageResourceTitle, pageResourceURL, "");
        } else if (window.external && typeof window.external.AddFavorite === 'function') { // For Internet Explorer
          window.external.AddFavorite(pageResourceURL, pageResourceTitle);
        } else if (window.opera) { // For Opera 7+ (rel="sidebar" handles it without JS)
          // No explicit JavaScript action needed here.
        } else { // For other browsers
          alert('Unfortunately, this browser does not support the requested action, please bookmark this page manually.');
        }
      });
    }

    // 9. Subdomain Availability Check on Input Blur
    const subdomainInputFieldElement = domDocument.getElementById('account_subdomain');
    if (subdomainInputFieldElement) {
      subdomainInputFieldElement.addEventListener('blur', async (focusLossEvent) => {
        const enteredSubdomain = focusLossEvent.currentTarget.value.trim();

        controlElementDisplay('em.url', false); // Hide the URL indicator

        if (enteredSubdomain === '') {
          return;
        }

        const checkingStatusIndicator = domDocument.querySelector('em.check');
        const takenStatusIndicator = domDocument.querySelector('em.taken');
        const availableStatusIndicator = domDocument.querySelector('em.avail');

        // Reset all status indicators before new check
        controlElementDisplay('em.check', false);
        controlElementDisplay('em.taken', false);
        controlElementDisplay('em.avail', false);

        controlElementDisplay('em.check', true); // Show 'checking' status

        try {
          const requestParameters = new URLSearchParams({ subdomain: enteredSubdomain });
          const networkFetchResponse = await fetch(`/accounts/check?${requestParameters.toString()}`);

          if (!networkFetchResponse.ok) {
            throw new Error(`HTTP status error: ${networkFetchResponse.status}`);
          }

          const responsePayloadData = await networkFetchResponse.json();

          controlElementDisplay('em.check', false); // Hide 'checking' status

          if (responsePayloadData.taken) {
            controlElementDisplay('em.taken', true);
          } else {
            controlElementDisplay('em.avail', true);
          }
        } catch (processingError) {
          console.error('Subdomain validation operation failed:', processingError);
          controlElementDisplay('em.check', false); // Hide 'checking' status on error
          // Optionally, display an error message to the user
        }
      });
    }
  };

  // Execute the initializer once the DOM is fully loaded
  if (domDocument.readyState === 'loading') {
    domDocument.addEventListener('DOMContentLoaded', applicationInitializer);
  } else {
    applicationInitializer(); // DOM is already ready
  }
})(document);