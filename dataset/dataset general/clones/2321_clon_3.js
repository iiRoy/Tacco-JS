(() => {
  // Ensure jQuery is loaded before proceeding with DOM manipulation.
  // This is a new fragment for robustness.
  if (typeof jQuery === 'undefined') {
    console.warn('jQuery not found. Script functionality may be limited.');
    return;
  }

  /**
   * Main script execution block, runs when the DOM is fully loaded.
   * Original creation date: early 2014.
   * This script handles various UI adjustments and interactive elements for a survey application.
   * @param {jQuery} $ The jQuery object, aliased for local use.
   */
  jQuery(document).ready(($appRoot) => {
    // --- Section 1: Initial UI Adjustments based on Configuration ---

    // Scenario: Language selector visibility check.
    // If fewer than two language options are available, hide the language selection UI.
    // Also, adjust the main project title area to occupy full width.
    const languageOptionCount = $appRoot('select.locale-switcher-dropdown option').length;

    if (languageOptionCount < 2) {
      $appRoot('div.language-selection-widget').hide(); // Hide the entire widget
      const $projectNameDisplay = $appRoot('div.project-header-title');
      if ($projectNameDisplay.length) { // Guard clause: ensure element exists
        $projectNameDisplay.removeClass('col-md-8').addClass('col-md-12');
        console.debug('Language widget hidden and project title width adjusted.');
      }
    }

    // --- Section 2: Element Caching and Initial State Setup ---

    // Cache frequently used jQuery objects for performance and readability.
    // Using `let` for variables that might be reassigned or for clarity.
    let currentMainHeading = $appRoot('section.main-content-block h1.content-group-title');
    let interactiveFormInputs = $appRoot('td > label + input[type="radio"], td > label + input[type="checkbox"]');

    // --- Section 3: Conditional UI Hiding ---

    // Check if the current page is a registration form.
    // If it is, hide any progress indicators that might be present, as they are not relevant here.
    if ($appRoot('form.registration-workflow-form').length > 0) {
      $appRoot('div.progress-display-bar').css('display', 'none'); // Using CSS property directly
      console.info('Progress bar concealed on registration page.');
    }

    // --- Section 4: Initial Input State Synchronization ---

    // Iterate through all identified interactive form inputs (radio/checkboxes).
    // For any input that is already checked on page load, apply an "active" class to its preceding label.
    interactiveFormInputs.each(function(_idx, inputElement) {
      const $currentInput = $appRoot(inputElement);
      // Using `prop('checked')` for boolean attribute.
      if ($currentInput.prop('checked')) {
        // Add class to the associated label element.
        $currentInput.prev('label').addClass('is-selected');
        console.log(`Initial state: Input with name "${$currentInput.attr('name')}" was checked.`);
      }
    });

    // --- Section 5: Custom Progress Bar Initialization (if applicable) ---

    // Event listener for a custom progress bar component.
    // When the 'progressbarcreate' event fires, update a custom display element
    // with the current progress width.
    $appRoot("#survey-progress-meter").on("progressbarcreate", function(evt, _uiData) {
      const $thisProgressBar = $appRoot(this); // Reference to the progress bar container
      const currentProgressWidth = $thisProgressBar.find('.ui-progressbar-value').css('width');
      const $targetDisplayBar = $appRoot('#custom-progress-visual .progress-segment');

      // Only proceed if the target display bar exists.
      if ($targetDisplayBar.length) {
        $targetDisplayBar.text(currentProgressWidth); // Set text content
        $targetDisplayBar.css({
          width: currentProgressWidth
        }); // Apply CSS width
        console.info(`Progress meter updated to: ${currentProgressWidth}`);
      } else {
        console.warn('Target progress display element not found: #custom-progress-visual .progress-segment');
      }
    });

    // --- Section 6: Centralized Input Interaction Handler ---

    /**
     * Helper function to manage the visual state of radio/checkbox labels.
     * Removes 'is-selected' class from siblings or group members, then adds it to the target.
     * @param {jQuery} $targetInput The jQuery object of the clicked input.
     * @param {boolean} isFlexColumn Indicates if the input is part of a flexible column layout.
     * @param {string|null} inputName The 'name' attribute of the input, for group selection.
     */
    const updateInputSelectionVisual = ($targetInput, isFlexColumn, inputName) => {
      const $parentRow = $targetInput.parents('tr:first'); // Get the closest table row

      if (!isFlexColumn) {
        // Standard row-based selection: remove 'is-selected' from all labels in this row.
        $parentRow.find('label').removeClass('is-selected');
      } else if (inputName) {
        // Column-based selection: remove 'is-selected' from all labels associated with inputs of the same name.
        $appRoot(`input[name="${inputName}"]`).prev('label').removeClass('is-selected');
      }
      // Finally, add 'is-selected' to the label preceding the clicked input.
      $targetInput.prev('label').addClass('is-selected');
    };

    // Event delegation for all radio/checkbox inputs within table cells.
    // This handles general single-choice or multi-choice questions.
    $appRoot('table.response-table').on('click', 'td > label + input[type="radio"], td > label + input[type="checkbox"]', function(event) {
      const $activatedInput = $appRoot(event.target);

      // Early exit if the activated element is not an input or is disabled.
      if (!$activatedInput.is('input') || $activatedInput.is(':disabled')) {
        console.debug('Clicked element is not a valid input or is disabled.');
        return;
      }

      const $questionContainer = $activatedInput.closest('div[id^="q_"]'); // Find the parent question div
      const isFlexibleColumnLayout = $questionContainer.hasClass('flexible-column-arrangement');
      const isDualScaleQuestion = $questionContainer.hasClass('flexible-dual-scale');

      // If it's a dual-scale question, its handling might be specific (handled by separate listeners).
      // Here, we can choose to skip or apply general logic. For Type III, let's allow it to proceed
      // but ensure its specific handlers are still distinct.
      if (isDualScaleQuestion) {
        console.log('Skipping general handler for dual-scale question, specific handler will take over.');
        // We could also call a dedicated function here if it was meant to be shared.
        // For now, let's ensure the toggle happens generally but specific handlers might re-toggle.
      }

      const inputElementName = $activatedInput.prop('name'); // Get the name attribute
      updateInputSelectionVisual($activatedInput, isFlexibleColumnLayout, inputElementName);
      console.log(`General input toggle: ${inputElementName} state updated.`);
    });

    // --- Section 7: Specific Handler for Dual-Scale Array Questions ---

    /**
     * Dedicated event handler for dual-scale array question inputs.
     * This function is similar to the general one but might have nuances specific to dual-scale UIs.
     * @param {Event} event The DOM event object.
     */
    const handleDualScaleFieldSelection = (event) => {
      const $chosenInput = $appRoot(event.target);

      // Validate the input element before proceeding.
      if (!$chosenInput.is('input') || !$chosenInput.is('[type="radio"]')) {
        console.warn('Attempted to handle non-radio input in dual-scale handler.');
        return;
      }

      const $containingResponseArea = $chosenInput.parents('tr:first');
      const $questionBlock = $chosenInput.closest('div[id^="q_"]');
      const isDualScaleMode = $questionBlock.hasClass('flexible-dual-scale');

      if (!isDualScaleMode) {
        // If for some reason this handler is called on a non-dual-scale, fallback to row-based.
        $containingResponseArea.find('label').removeClass('is-selected');
      } else {
        // In dual-scale, selection is usually per-column (inputs with same name).
        const itemIdentifier = $chosenInput.prop('name');
        $appRoot(`input[name="${itemIdentifier}"]`).prev('label').removeClass('is-selected');
      }
      // Apply the 'is-selected' class to the current input's label.
      $chosenInput.prev('label').addClass('is-selected');
      console.debug(`Dual-scale input event processed for ${$chosenInput.attr('id')}.`);
    };

    // Bind click events to inputs specifically within dual-scale answer cells.
    // Using event delegation on a common parent if possible, but for specific classes, direct binding is also common.
    $appRoot('td.response-group-alpha > label + input').on('click', handleDualScaleFieldSelection);
    $appRoot('td.response-group-beta > label + input').on('click', handleDualScaleFieldSelection);

    // --- Section 8: Content Visibility Toggles ---

    // Hide the group header if its content is empty.
    // Using `text().trim()` for accurate content check, ignoring whitespace.
    if (currentMainHeading.length && currentMainHeading.text().trim().length === 0) {
      currentMainHeading.parent().hide(); // Hide the parent container of the empty heading.
      console.info('Empty group heading container has been hidden.');
    }

    // Iterate through all span elements within panel titles.
    // If a span is empty (contains no visible text), hide that span.
    $appRoot('.panel-component-header span.display-text').each(function() {
      const $thisSpan = $appRoot(this);
      if ($thisSpan.text().trim() === '') {
        $thisSpan.hide();
        console.debug(`Hidden an empty panel title span: ${$thisSpan.attr('class')}`);
      }
    });

    // --- Section 9: Dynamic Footer Injection ---

    // Append a custom footer block to the main content area.
    // This provides branding and links. Using template literals for multi-line string.
    const footerContentHtml = `
      <div class="row-flex-wrapper">
          <div class="application-info-section">
              <p>This adaptable survey template is thoughtfully developed by the team at <a href="http://www.toolsforresearch.com/limesurvey-responsive-template" target="_blank" rel="noopener noreferrer">Research Toolkit Co.</a></p>
              <a target="_blank" rel="noopener noreferrer" href="http://www.toolsforresearch.com/limesurvey-responsive-template">
                <img class="corporate-brand-logo mx-auto d-block" width="250"
                     src="data:image/png;base64,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"
                     alt="Research Toolkit Co. Logo">
              </a>
          </div>
      </div>
    `;
    $appRoot('main.primary-content-area > div.page-layout-container').append(footerContentHtml);
    console.log('Branding footer has been appended to the page.');

    // --- Section 10: Index Page Specific Class Modifications ---

    // For the main application index page, apply specific styling classes.
    // This involves adding a 'homepage-entry' class to the index element itself
    // and adjusting classes on its direct child elements for layout.
    const $mainIndexElement = $appRoot('#main-app-index-page');
    if ($mainIndexElement.length) {
      $mainIndexElement.addClass('homepage-entry');
      // Update children classes.
      $mainIndexElement.children().removeClass('page-layout-container').addClass('homepage-content-wrapper');
      console.log('Index page styling classes applied.');
    } else {
      console.debug('Main index element #main-app-index-page not found.');
    }
  }); // End of jQuery ready function.

})(); // End of IIFE (Immediately Invoked Function Expression) for scope encapsulation.