/*
 *
 *	SurveyUIEnhancer - A refined UI for LimeSurvey
 *	(c) 2023 - 2024 Modern Survey Solutions (MSS)
 *	Based on original work by mofog (http://mofog.github.io/BootstrapForLimeSurvey)
 *
 */

// Define a global utility object for DOM manipulation, mimicking jQuery's '$'
// This will be assigned to window.lsUIUtil once the external library is loaded.
// The external library (e.g., jQuery) is expected to be loaded by LimeSurvey itself.

(function pollForSurveyResources() {
    // Attempt to initialize UI enhancements after a short delay,
    // retrying if the necessary 'lsUIUtil' (jQuery) is not yet available.
    const retryIntervalMs = 150; // Milliseconds to wait before retrying
    let retryAttempts = 0;
    const maxRetries = 20; // Maximum number of retries (approx 3 seconds total)

    const checkAndInit = () => {
        // Ensure the global utility object is defined (e.g., jQuery is loaded)
        if (typeof window.lsUIUtil !== 'undefined' && window.lsUIUtil.fn && window.lsUIUtil.fn.jquery) {
            window.lsUIUtil(document).ready(() => {
                // All core UI setup functions are called here.
                // These functions aim to standardize and enhance the LimeSurvey interface.

                // Initialize custom modal dialogs to replace native browser alerts/confirms
                initializeCustomAlert();
                initializeCustomConfirm();

                // Apply general UI fixes and styling adjustments across the survey
                harmonizeSurveyInterface();

                // Configure and display the survey progress bar
                configureSurveyProgress();

                // Arrange the question navigation index (if present)
                arrangeQuestionNavigation();

                // Style individual question groups
                styleQuestionSections();

                // Format various answer input elements
                formatResponseElements();

                // Prepare the reset survey form functionality
                prepareSurveyReset();

                // Display privacy-related information prominently
                displayPrivacyDetails();

                // Integrate the 'save' survey option
                integrateSaveOption();

                // Integrate the 'load' survey option
                integrateLoadOption();

                // Set up the user registration form
                setupUserRegistration();

                // Refine the display of the survey list
                refineSurveyList();

                // Process and format token-related messages (e.g., survey expiration)
                processTokenNotifications();

                // Finally, reveal the main content area after all styling is applied
                const mainContentArea = window.lsUIUtil('.surveyContentContainer');
                if (mainContentArea.length) {
                    mainContentArea.css('visibility', 'visible');
                    mainContentArea.css('opacity', '1'); // Fade in effect
                } else {
                    console.warn('SurveyUIEnhancer: Main content container not found.');
                }

                // Scroll to the first error message or to the top of the page
                const errorElements = window.lsUIUtil('.mandatoryErrorIndicator');
                if (errorElements.length > 0) {
                    const firstErrorParent = errorElements.first().closest('.form-group, .question-wrapper');
                    if (firstErrorParent.length) {
                        window.lsUIUtil('html, body').animate({
                            scrollTop: firstErrorParent.offset().top - 70 // Offset for fixed header
                        }, 200); // Small animation for better UX
                    }
                } else {
                    window.lsUIUtil('html, body').animate({
                        scrollTop: 0 // Scroll to top if no errors
                    }, 200);
                }
            });
        } else if (retryAttempts < maxRetries) {
            // If lsUIUtil is not ready, retry after the interval
            retryAttempts++;
            setTimeout(checkAndInit, retryIntervalMs);
        } else {
            console.error('SurveyUIEnhancer: Failed to load lsUIUtil (jQuery) after multiple attempts. UI enhancements may not apply.');
        }
    };

    // Start the polling process
    setTimeout(checkAndInit, retryIntervalMs);
})();

/**
 * Replaces standard LimeSurvey buttons with Bootstrap-styled equivalents.
 * @param {string} originalSelector - The jQuery selector for the original button.
 * @param {string} newButtonClass - Additional Bootstrap classes for the new button.
 * @param {string} accessKey - The access key for the button, if any.
 * @param {string} role - The ARIA role for the button.
 * @returns {boolean} True if a button was replaced, false otherwise.
 */
function replaceSurveyButton(originalSelector, newButtonClass, accessKey = '', role = 'button') {
    const originalButton = window.lsUIUtil(originalSelector);
    if (originalButton.length === 0) {
        return false; // No button found to replace
    }

    const buttonText = originalButton.text().trim();
    const isDisabled = originalButton.prop('disabled') || originalButton.attr('aria-disabled') === 'true';
    const disabledAttr = isDisabled ? 'disabled aria-disabled="true"' : 'aria-disabled="false"';
    const buttonValue = originalButton.attr('value') || '';
    const buttonName = originalButton.attr('name') || '';
    const buttonId = originalButton.attr('id') || '';
    const dataAttrs = originalButton.data(); // Get all data attributes

    // Construct data attributes string
    let dataAttrString = '';
    for (const key in dataAttrs) {
        if (Object.prototype.hasOwnProperty.call(dataAttrs, key)) {
            dataAttrString += `data-${key}="${dataAttrs[key]}" `;
        }
    }

    const newButtonHtml = `
        <button type="submit"
                id="${buttonId}"
                value="${buttonValue}"
                name="${buttonName}"
                accesskey="${accessKey}"
                class="submit btn btn-default navbar-btn ${newButtonClass}"
                role="${role}"
                ${disabledAttr}
                ${dataAttrString}>
            ${buttonText}
        </button>
    `;

    originalButton.replaceWith(newButtonHtml);
    return true;
}

/**
 * Applies general UI fixes and styling adjustments to standardize the survey interface.
 */
function harmonizeSurveyInterface() {
    // --- Navigation Buttons ---
    replaceSurveyButton('#moveprevbtn', 'btn-default', 'p');
    replaceSurveyButton('#movenextbtn', 'btn-primary', 'n');
    replaceSurveyButton('#movesubmitbtn', 'btn-success', 'l');

    // Handle the alternative 'movesubmit' button that might appear
    const altSubmitButton = window.lsUIUtil('button[value="movesubmit"][name="move"]');
    if (altSubmitButton.length > 0) {
        replaceSurveyButton('button[value="movesubmit"][name="move"]', 'btn-success btn-block');
    }

    // --- Action Buttons (Clear, Load, Save) ---
    replaceSurveyButton('#clearall', 'btn-default', '', 'button'); // No specific accesskey, role is already button
    replaceSurveyButton('#loadallbtn', 'btn-default', '', 'button');
    replaceSurveyButton('#saveallbtn', 'btn-default', '', 'button');

    // --- General Form Element Styling ---
    window.lsUIUtil('button:not(.btn)').addClass('btn btn-default'); // Ensure all buttons have base Bootstrap styles
    window.lsUIUtil('select').addClass('form-control');
    window.lsUIUtil('textarea').addClass('form-control');
    window.lsUIUtil('input[type="text"]:not(.form-control), input[type="email"]:not(.form-control), input[type="password"]:not(.form-control), input[type="number"]:not(.form-control)').addClass('form-control');

    // --- Navbar Styling ---
    window.lsUIUtil('.languagechanger').addClass('navbar-btn');
    window.lsUIUtil('.navbar-header.pull-left').css('padding-top', '0px');
    window.lsUIUtil('.navbar-toggle').css('z-index', '9999');
    window.lsUIUtil('.navbar button').addClass('navbar-btn'); // Buttons within navbar

    // --- Error Message Styling ---
    const oldErrorParagraphs = window.lsUIUtil('p.error');
    if (oldErrorParagraphs.length > 0) {
        oldErrorParagraphs.each((_idx, el) => {
            const errorElement = window.lsUIUtil(el);
            const errorHtml = errorElement.html();
            // Replace with a Bootstrap text-warning class
            errorElement.replaceWith(`<p class="text-warning survey-error-message">${errorHtml}</p>`);
        });
    }
}

/**
 * Configures and updates the survey progress bar display.
 */
function configureSurveyProgress() {
    const progressWrapper = window.lsUIUtil('#progress-wrapper');
    if (progressWrapper.length === 0) {
        // No progress bar wrapper found, exit early.
        return;
    }

    progressWrapper.hide(); // Initially hide the wrapper

    const updateAttemptLimit = 5; // Max attempts to find and update the progress bar
    let currentAttempt = 0;

    const performProgressUpdate = () => {
        const progressBarElement = window.lsUIUtil('#progress-wrapper #progressbar');

        if (progressBarElement.hasClass('ui-progressbar')) {
            const currentProgressValue = parseInt(progressBarElement.attr('aria-valuenow'), 10);

            if (isNaN(currentProgressValue) || currentProgressValue < 0 || currentProgressValue > 100) {
                console.warn('SurveyUIEnhancer: Invalid progress bar value detected:', progressBarElement.attr('aria-valuenow'));
                // Attempt to set a default or handle gracefully
                const safeProgressValue = Math.max(0, Math.min(100, currentProgressValue || 0));
                updateProgressBarUI(safeProgressValue);
            } else {
                updateProgressBarUI(currentProgressValue);
            }

            // Ensure the progress container is visible
            window.lsUIUtil('.progress').show();

            // Adjust padding for the question index if it exists, to accommodate the progress bar
            const questionIndex = window.lsUIUtil('#index');
            if (questionIndex.length > 0) {
                questionIndex.css('padding-top', '40px');
            }
        } else if (currentAttempt < updateAttemptLimit) {
            // Progress bar not yet initialized by LimeSurvey, retry
            currentAttempt++;
            setTimeout(performProgressUpdate, 100); // Wait a bit longer
        } else {
            console.warn('SurveyUIEnhancer: Progress bar element not found or not initialized after multiple attempts.');
        }
    };

    const updateProgressBarUI = (value) => {
        const progressBarDisplay = window.lsUIUtil('.progress .progress-bar');
        if (progressBarDisplay.length > 0) {
            progressBarDisplay.attr('aria-valuenow', value);
            progressBarDisplay.css('width', `${value}%`);
            progressBarDisplay.find('.sr-only').text(`${value}% Complete`);
            // Add a visible percentage if it's not zero
            if (value > 0 && progressBarDisplay.find('span.visible-percentage').length === 0) {
                progressBarDisplay.append(`<span class="visible-percentage">${value}%</span>`);
            } else if (value > 0) {
                progressBarDisplay.find('span.visible-percentage').text(`${value}%`);
            }
        }
    };

    // Start the update process
    setTimeout(performProgressUpdate, 50); // Initial check after a small delay
}


/**
 * Arranges the question navigation index into a structured sidebar.
 */
function arrangeQuestionNavigation() {
    const questionIndex = window.lsUIUtil('#index');
    if (questionIndex.length === 0) {
        return; // No question index found, exit early.
    }

    const surveyContainer = window.lsUIUtil('#limesurvey');
    if (surveyContainer.length === 0) {
        console.warn('SurveyUIEnhancer: LimeSurvey container (#limesurvey) not found for question index arrangement.');
        return;
    }

    // Wrap main content and append index to a sidebar
    surveyContainer.unwrap(); // Remove any existing wrapper around #limesurvey
    surveyContainer.children().wrapAll('<div class="col-md-8 content-col"></div>');
    surveyContainer.find('.content-col').after('<div class="col-md-4 index-col"></div>');
    questionIndex.appendTo('.index-col');

    // Reformat index header
    const indexHeader = questionIndex.find('h2');
    if (indexHeader.length) {
        indexHeader.replaceWith(`<h1>${indexHeader.html()}</h1>`);
    }

    // Apply Bootstrap panel styling to the index container
    questionIndex.find('.container')
        .removeClass('container')
        .addClass('panel-body')
        .wrap('<div class="panel panel-default survey-index-panel"></div>');

    // Clean up redundant row classes within the index
    questionIndex.find('div.row').removeClass('row');
    questionIndex.find('ol li.row').removeClass('row');

    // Apply status classes to list items
    questionIndex.find('ol li').addClass('text-success'); // Default to success
    questionIndex.find('ol li.missing').removeClass('text-success').addClass('text-muted'); // Missing questions
    questionIndex.find('ol li.current').removeClass('text-success').removeClass('text-muted').addClass('text-primary'); // Current question

    // Enhance question number display
    questionIndex.find('.hdr').append('. ');

    // Style spans within the index
    questionIndex.find('span').addClass('text-success');
    questionIndex.find('.current span').removeClass('text-success').addClass('text-primary');
    questionIndex.find('.current span').next().removeClass('text-success').addClass('text-primary');

    // Hide input elements within the index (if any)
    questionIndex.find('input').hide();

    // Remove navigation buttons from the index to prevent jumping, especially in "complete" mode.
    // This is a design choice to enforce linear progression or rely on main navigation buttons.
    questionIndex.find('button').remove();
    console.info('SurveyUIEnhancer: Question index buttons removed to enforce survey flow.');
}

/**
 * Styles individual question groups.
 */
function styleQuestionSections() {
    const questionGroups = window.lsUIUtil('.group');
    if (questionGroups.length === 0) {
        return; // No question groups found.
    }

    questionGroups.each((_idx, groupEl) => {
        const currentGroup = window.lsUIUtil(groupEl);

        // Reset any inline font styling that might interfere with Bootstrap
        currentGroup.find('span').css({
            'font': '',
            'font-family': '',
            'font-variant': '',
            'font-size': '',
            'font-stretch': ''
        });

        // Append a dot to question numbers for better readability
        const questionNumber = currentGroup.find('.question-number');
        if (questionNumber.length && questionNumber.html().trim()) {
            questionNumber.append('. ');
        }

        // Style question codes as Bootstrap badges
        const questionCode = currentGroup.find('.question-code');
        if (questionCode.length && questionCode.html().trim()) {
            questionCode.addClass('badge bg-secondary'); // Using Bootstrap 5 class
        }
    });
}

/**
 * Formats various answer input elements for better presentation.
 */
function formatResponseElements() {
    const answerContainer = window.lsUIUtil('.answer');
    if (answerContainer.length === 0) {
        return; // No answer container found.
    }

    // Style help text for answers
    answerContainer.find('.tip').addClass('text-muted small');

    // Style unordered lists within answers
    answerContainer.find('.answer ul').addClass('list-unstyled');

    // Dynamic column layout for answer lists
    answerContainer.find('.answer ul').each((_idx, ulEl) => {
        const currentUl = window.lsUIUtil(ulEl);
        const listItems = currentUl.children('li');
        const itemCount = listItems.length;

        if (itemCount === 0) return;

        let colWidth = 12; // Default to full width

        if (itemCount > 0 && itemCount < 13) {
            colWidth = Math.floor(12 / itemCount);
            if (colWidth < 1) colWidth = 1; // Minimum column width
        } else if (itemCount >= 13 && itemCount <= 24) {
            // For more items, try 2 columns
            colWidth = 6;
        } else if (itemCount > 24) {
            // For many items, try 3 columns
            colWidth = 4;
        }

        // Wrap list items in a row and then individual columns
        listItems.wrapAll('<div class="row response-options-row"></div>');
        currentUl.find('.response-options-row > li').wrap(`<div class="col-md-${colWidth}"></div>`);
    });

    // Reformat radio button lists
    answerContainer.find('.radio-list .radio-item').each((_idx, itemEl) => {
        const radioItem = window.lsUIUtil(itemEl);
        const otherTextLabel = radioItem.children('label[for$="othertext"]');
        if (otherTextLabel.length) {
            otherTextLabel.addClass("othertext-label");
        }

        const inputElement = radioItem.children('input');
        if (inputElement.length) {
            inputElement.removeAttr('class'); // Remove any default LimeSurvey classes

            // Prepend input to its corresponding label, but exclude 'othertext' labels
            // which might have different styling needs.
            const targetLabel = radioItem.children('label:not(.othertext-label)');
            if (targetLabel.length) {
                inputElement.prependTo(targetLabel);
            }
        }
        // Wrap the label (now containing the input) in a Bootstrap radio div
        radioItem.children('label').wrap('<div class="form-check" style="padding-right: 20px;"></div>');
        radioItem.find('.form-check > label').addClass('form-check-label');
        radioItem.find('.form-check > label > input').addClass('form-check-input');
    });

    // Remove empty text nodes from hidden radio labels (clean up for accessibility)
    answerContainer.find('.radio-list .radio-item div.form-check label.hide').contents().filter(function() {
        return this.nodeType === 3 && this.nodeValue.trim() === ''; // Only remove empty text nodes
    }).remove();
    // Unwrap inputs that were hidden and now have no label text
    answerContainer.find('.radio-list .radio-item div.form-check label.hide input').unwrap();

    // Style text inputs
    answerContainer.find('input:text:not(.form-control)').addClass('form-control');

    // Style tables within answers
    const answerTables = answerContainer.find('table');
    if (answerTables.length) {
        answerTables.wrap('<div class="table-responsive"></div>');
        answerTables.addClass('table table-striped table-hover table-condensed');
        // Replace table header cells with <th> for semantic correctness
        answerTables.find('thead tr td').replaceWith('<th>&nbsp;</th>');
    }

    // Replace help image with Bootstrap icon
    answerContainer.find('.survey-question-help > img').replaceWith('<span class="glyphicon glyphicon-info-sign pull-left survey-help-icon">&nbsp;</span>');

    // Reformat mandatory error messages
    const errorStrongElements = answerContainer.find('strong .mandatoryErrorIndicator');
    if (errorStrongElements.length) {
        errorStrongElements.unwrap(); // Remove strong tag around error
    }
    answerContainer.find('.mandatoryErrorIndicator').addClass('text-danger');
    answerContainer.find('.text-danger br').remove(); // Remove line breaks within error messages

    // File upload button styling
    const uploadButton = answerContainer.find('.upload');
    if (uploadButton.length > 0) {
        // Ensure it's inside a valid parent before unwrapping 'h2'
        const parentH2 = uploadButton.closest('h2');
        if (parentH2.length) {
             uploadButton.unwrap('h2');
        }
        uploadButton.addClass('btn btn-primary file-upload-btn');
    }

    // Sub-questions list styling (checkboxes/radios)
    const subquestionsList = answerContainer.find('.subquestions-list');
    if (subquestionsList.length > 0) {
        subquestionsList.find('li').each((_idx, liEl) => {
            const currentLi = window.lsUIUtil(liEl);
            const inputCheckbox = currentLi.children('input[type="checkbox"], input[type="radio"]');
            const labelElement = currentLi.children('label');

            if (inputCheckbox.length && labelElement.length) {
                // Move input inside label for Bootstrap styling
                inputCheckbox.prependTo(labelElement);
                // Wrap the label (with input) in a form-check div
                if (!labelElement.hasClass('slider-label')) { // Exclude slider labels
                    labelElement.wrap('<div class="form-check subquestion-item"></div>');
                    labelElement.addClass('form-check-label');
                    inputCheckbox.addClass('form-check-input');
                }
            }

            // Handle span.option for sub-questions if present
            const optionSpan = currentLi.children('span.option');
            if (optionSpan.length) {
                const optionInput = optionSpan.children('input[type="checkbox"], input[type="radio"]');
                const optionLabel = optionSpan.children('label');
                if (optionInput.length && optionLabel.length) {
                    optionInput.prependTo(optionLabel);
                    optionLabel.wrap('<div class="form-check subquestion-option"></div>');
                    optionLabel.addClass('form-check-label');
                    optionInput.addClass('form-check-input');
                }
            }
        });
    }
}

/**
 * Prepares the survey reset form elements.
 */
function prepareSurveyReset() {
    window.lsUIUtil('.clearall-results-restart a').addClass('btn btn-primary btn-lg');
    window.lsUIUtil('.clearall-results-close a').addClass('btn btn-danger btn-lg');
}

/**
 * Extracts and displays privacy information in a Bootstrap panel.
 */
function displayPrivacyDetails() {
    const privacyDiv = window.lsUIUtil('div.privacy');
    if (privacyDiv.length === 0) {
        return;
    }

    const panelHeading = privacyDiv.find('.panel-heading h3');
    const panelBody = privacyDiv.find('.panel-body');
    const bodySpan = panelBody.find('span');

    if (panelHeading.length && bodySpan.length) {
        panelHeading.html(bodySpan.html()); // Move content from span to heading
        bodySpan.remove(); // Remove the original span
    }

    panelBody.find('br').remove(); // Remove line breaks

    // Wrap remaining content in a paragraph
    const currentBodyContent = panelBody.html().trim();
    if (currentBodyContent) {
        panelBody.empty().append(`<p>${currentBodyContent}</p>`);
    } else {
        panelBody.append('<p>No additional privacy information available.</p>');
    }
}

/**
 * Helper function to process and reformat generic form tables (save, load, register).
 * @param {string} formSelector - Selector for the main form container (e.g., '.save-form').
 * @param {string} targetContainerClass - Class for the new Bootstrap-styled container.
 * @param {string} submitButtonId - ID of the submit button to style.
 */
function processGenericFormTable(formSelector, targetContainerClass, submitButtonId) {
    const formContainer = window.lsUIUtil(formSelector);
    if (formContainer.length === 0) {
        return;
    }

    formContainer.find('input:text, input:password').addClass('form-control');
    formContainer.find(`#${submitButtonId}`).addClass('btn btn-primary');

    const newBootstrapContainer = window.lsUIUtil(`<div class="${targetContainerClass}"></div>`);
    // Append the new container either after the form, or within the form if it's a sub-element.
    if (formContainer.is('form')) {
        formContainer.append(newBootstrapContainer);
    } else {
        formContainer.after(newBootstrapContainer);
    }


    const formRows = formContainer.find('tr');
    if (formRows.length > 0) {
        formRows.each((index, rowEl) => {
            const row = window.lsUIUtil(rowEl);
            const labelCell = row.children('td').eq(0);
            const fieldCell = row.children('td').eq(1);

            if (labelCell.length && fieldCell.length) {
                const labelHtml = labelCell.html().trim();
                const fieldHtml = fieldCell.html().trim();

                // Only process if label doesn't contain an image and field has content
                if (labelHtml.indexOf('<img') === -1 && fieldHtml) {
                    const cleanLabel = labelHtml.endsWith(':') ? labelHtml.slice(0, -1) : labelHtml;
                    const formGroup = window.lsUIUtil(`<div class="form-group form-field-${index}"></div>`);

                    // Use Bootstrap's label class
                    formGroup.append(`<label class="form-label">${cleanLabel}</label>`);
                    formGroup.append(fieldHtml);

                    newBootstrapContainer.append(formGroup);
                }
            }
        });
    }

    // Remove the original table structure after processing
    formContainer.find('table').remove();
    // Remove the original form container itself if it's not the parent of the new container.
    // This assumes the original form container is just a wrapper for the table.
    if (!formContainer.is('form')) {
        formContainer.remove();
    }
}

/**
 * Integrates the 'save' survey option by reformatting its UI.
 */
function integrateSaveOption() {
    processGenericFormTable('.save-form', 'save-form-bootstrap', 'savebutton');
}

/**
 * Integrates the 'load' survey option by reformatting its UI.
 */
function integrateLoadOption() {
    processGenericFormTable('.load-form', 'load-form-bootstrap', 'loadbutton');
}

/**
 * Sets up the user registration form with Bootstrap styling.
 */
function setupUserRegistration() {
    processGenericFormTable('.register-form', 'register-form-bootstrap', 'registercontinue');
}

/**
 * Refines the display of the survey list.
 */
function refineSurveyList() {
    const surveyContacts = window.lsUIUtil('.survey-list-table .survey-contact');
    if (surveyContacts.length > 0) {
        surveyContacts.each((_idx, el) => {
            const contactElement = window.lsUIUtil(el);
            // Clean up spacing around parentheses
            contactElement.html(contactElement.html().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'));
        });
    }
}

/**
 * Processes and formats token-related messages.
 */
function processTokenNotifications() {
    const tokenMessageParagraph = window.lsUIUtil('p#tokenmessage');
    if (tokenMessageParagraph.length === 0) {
        return;
    }

    // Wrap the message in a Bootstrap 'well' for emphasis
    tokenMessageParagraph.wrap('<div class="well token-message-well"></div>');

    const errorMessageSpan = tokenMessageParagraph.find('span.error');
    if (errorMessageSpan.length) {
        // Convert error span to an H1 for prominence
        errorMessageSpan.replaceWith(`<h1>${errorMessageSpan.html()}</h1>`);
    }

    // Remove any orphaned <br> tags immediately following an H1 or other <br> tags
    tokenMessageParagraph.find('h1 + br, br + br').remove();

    // Clean up spacing around parentheses in the message content
    tokenMessageParagraph.html(tokenMessageParagraph.html().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'));
}

/**
 * Overrides the native `alert` function with a Bootstrap modal.
 */
function initializeCustomAlert() {
    const originalAlert = window.alert; // Store original for console logging
    window.alert = function(message) {
        originalAlert(message); // Still log to console for debugging

        const modalId = `customAlertModal-${Date.now()}`;
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}Label" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${modalId}Label">Survey Information</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>${message}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                  </div>
                </div>
              </div>
            </div>
        `;
        window.lsUIUtil('body').append(modalHtml);
        window.lsUIUtil(`#${modalId}`).modal('show');

        // Clean up modal from DOM after it's hidden
        window.lsUIUtil(`#${modalId}`).on('hidden.bs.modal', function() {
            window.lsUIUtil(this).remove();
        });
    };
}

/**
 * Overrides the native `confirm` function with a Bootstrap modal.
 */
function initializeCustomConfirm() {
    const originalConfirm = window.confirm; // Store original for console logging
    window.confirm = function(message) {
        originalConfirm(message); // Still log to console for debugging

        const modalId = `customConfirmModal-${Date.now()}`;
        const surveyIdValue = window.lsUIUtil('#sid').val(); // Get survey ID from a hidden input
        const restartUrl = surveyIdValue ? `index/sid/${surveyIdValue}/newtest/Y` : '#';

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}Label" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${modalId}Label">Confirmation Required</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <p>${message}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">
                        <span class="glyphicon glyphicon-thumbs-down"></span> No
                    </button>
                    <button type="button" class="btn btn-success" id="confirmActionBtn-${modalId}">
                        <span class="glyphicon glyphicon-thumbs-up"></span> Yes
                    </button>
                  </div>
                </div>
              </div>
            </div>
        `;
        window.lsUIUtil('body').append(modalHtml);
        window.lsUIUtil(`#${modalId}`).modal('show');

        // Attach event listener for the 'Yes' button
        window.lsUIUtil(`#confirmActionBtn-${modalId}`).on('click', function() {
            window.lsUIUtil(`#${modalId}`).modal('hide'); // Hide modal first
            if (restartUrl !== '#') {
                window.location.href = restartUrl; // Navigate on confirmation
            } else {
                console.warn('SurveyUIEnhancer: Could not determine survey restart URL.');
            }
        });

        // Clean up modal from DOM after it's hidden
        window.lsUIUtil(`#${modalId}`).on('hidden.bs.modal', function() {
            window.lsUIUtil(this).remove();
        });
    };
}