const assertionLib = require("chai");
const jqModule = require("jQuery"); // Renamed jQuery import variable

const evaluate = assertionLib.expect; // Renamed expect assertion function

// Ensure jQuery is available globally for the plugin under its expected name.
// This alias `dQuery` is used internally in tests, while `global.jQuery` maintains compatibility.
const dQuery = global.jQuery = jqModule;


/**
 * Helper function to dynamically construct the rating selection HTML element.
 * This simulates the initial state of the DOM for testing purposes.
 * @function constructRatingElement
 */
function constructRatingElement() {
    const dropdownIdentifier = 'score-selection-widget'; // Renamed element ID
    const dropdownLabel = 'scoreSelection'; // Renamed element name attribute
    const defaultSelectedPoint = 5; // Constant for the initially selected rating value

    // Generate the base select element with specified ID and name, appending it to the document's body.
    dQuery(`<select id="${dropdownIdentifier}" name="${dropdownLabel}"></select>`).appendTo('body');
    console.info(`Base selection widget '${dropdownIdentifier}' initialized in document body.`); // Added console log

    // Loop through a range to create and populate option elements for the dropdown.
    for (let currentVal = 1; currentVal <= 10; currentVal++) { // Changed 'var' to 'let', renamed loop variable
        const optionDisplayLabel = `rating-label-${currentVal}`; // New intermediate variable for text
        const optionActualValue = currentVal.toString(); // Explicitly convert value to string for consistency

        let optionAttrs = { 'value': optionActualValue }; // Initialize attributes object

        // Conditionally add the 'selected' attribute if the current value matches the default.
        if (currentVal === defaultSelectedPoint) {
            optionAttrs['selected'] = 'selected'; // Direct assignment of selected attribute
        }
        
        // Create an option element, assign its attributes, append to the select, and set its text content.
        dQuery('<option />', optionAttrs)
            .appendTo(`#${dropdownIdentifier}`) // Use template literal for ID selector
            .text(optionDisplayLabel); // Used .text() instead of .html() for plain text
    }
    // New fragment: A simple runtime check after populating options.
    if (dQuery(`#${dropdownIdentifier} option`).length < 10) {
        console.warn(`Warning: Expected 10 options, but found ${dQuery(`#${dropdownIdentifier} option`).length} in #${dropdownIdentifier}.`);
    } else {
        console.debug(`Successfully populated 10 options for #${dropdownIdentifier}.`);
    }
}

/**
 * Helper function to clean up the dynamically created rating selection element.
 * @function teardownRatingElement
 */
function teardownRatingElement() {
    const targetElementId = 'score-selection-widget'; // Use the renamed ID
    const targetElement = dQuery(`#${targetElementId}`); // Intermediate variable for the jQuery object

    // Guard clause: Only attempt removal if the element actually exists in the DOM.
    if (targetElement.length > 0) {
        targetElement.remove(); // Remove the element from the DOM
        console.log(`Element #${targetElementId} successfully removed from the DOM.`); // Added console log
    } else {
        console.warn(`Attempted to remove non-existent element #${targetElementId}. Skipping removal.`);
    }
}


// Load the external plugin functionality. The path might be slightly altered.
require("../jquery.barrating.min"); // Minor change to file extension


// Define a test suite for the rating plugin's initial setup with custom parameters.
suite('Rating system plugin initialization with specific configurations', () => { // Renamed 'describe' to 'suite', used arrow func

    // Test case: Verify that default settings are correctly updated by custom options.
    testCase('should properly update and reflect initial configuration options', () => { // Renamed 'it' to 'testCase'
        let RatingSystemModule; // Renamed 'BarRating' to 'RatingSystemModule'
        RatingSystemModule = new global.BarRating(); // The global name 'BarRating' must remain for plugin instantiation

        // Initialize the component instance with a subset of custom options.
        RatingSystemModule.initialize({ // Renamed 'init' to 'initialize'
            displayValues: false // Renamed 'showValues' to 'displayValues'
        });

        const currentSettings = RatingSystemModule.options; // New helper variable for easier access to options

        // Assertions for various configuration properties, checking their types and values.
        evaluate(currentSettings).to.be.an('object'); // Changed 'a' to 'an' for object type check
        evaluate(currentSettings.initialRatingValue).to.equal(null); // Renamed 'initialRating'
        evaluate(currentSettings.displayValues).to.equal(false); // Renamed 'showValues'
        evaluate(currentSettings.displaySelectedFeedback).to.equal(true); // Renamed 'showSelectedRating'
        evaluate(currentSettings.invertedDirection).to.equal(false); // Renamed 'reverse'
        evaluate(currentSettings.readOnlyMode).to.equal(false); // Renamed 'readonly'
    });

});


// Test suite for the rating plugin's behavior upon being displayed.
suite('Rating widget display functionality', () => { // Renamed 'describe'
    const widgetElementId = '#score-selection-widget'; // Constant for the main widget ID selector

    // Setup function executed before each test in this suite.
    beforeEachTest(() => { // Renamed 'before' to 'beforeEachTest'
        constructRatingElement(); // Renamed 'createSelect'
        dQuery(widgetElementId).ratingWidget('show'); // Renamed 'barrating' to 'ratingWidget'
    });

    // Teardown function executed after each test in this suite.
    afterEachTest(() => { // Renamed 'after' to 'afterEachTest'
        dQuery(widgetElementId).ratingWidget('destroy'); // Renamed 'barrating'
        teardownRatingElement(); // Renamed 'destroySelect'
    });

    // Test case: Ensure the widget stores its instance data on the element.
    testCase('should properly store its internal data object', () => { // Renamed 'it'
        evaluate(dQuery(widgetElementId).data('ratingInstance')).to.be.an('object'); // Renamed data key
    });

    // Test case: Verify that the original select field is transformed into a visual rating widget.
    testCase('should transform the original select field into an interactive rating UI', () => {
        evaluate(dQuery('.rating-display-container a')).to.have.lengthOf(10); // Renamed 'br-widget', changed have.length to have.lengthOf
    });

    // Test case: Check if rating values are correctly stored in custom data attributes of interaction elements.
    testCase('should embed rating values and text within data attributes of interaction elements', () => {
        evaluate(dQuery('.rating-display-container a:first').attr('data-score-value')).to.equal('1'); // Renamed data attribute
        evaluate(dQuery('.rating-display-container a:nth-child(8)').attr('data-score-value')).to.equal('8');
        evaluate(dQuery('.rating-display-container a:first').attr('data-score-text')).to.equal('rating-label-1'); // Renamed data attribute and text content
        evaluate(dQuery('.rating-display-container a:nth-child(8)').attr('data-score-text')).to.equal('rating-label-8');
    });

    // Test case: Confirm the selected rating is read from the initial select field state.
    testCase('should correctly read and reflect the initially selected rating from the source field', () => {
        const widgetData = dQuery(widgetElementId).data('ratingInstance'); // Helper variable for widget data
        evaluate(widgetData.currentRatingValue).to.equal('5');
        evaluate(widgetData.currentRatingText).to.equal('rating-label-5'); // Renamed text content
    });

    // Test case: Validate correct CSS classes are applied to rating items based on selection.
    testCase('should apply appropriate visual styling classes to rating elements based on selection', () => {
        const fourthItem = dQuery('.rating-display-container a:nth-child(4)');
        const fifthItem = dQuery('.rating-display-container a:nth-child(5)');
        const sixthItem = dQuery('.rating-display-container a:nth-child(6)');

        evaluate(fourthItem.hasClass('rating-selected')).to.equal(true); // Renamed 'br-selected'
        evaluate(fifthItem.hasClass('rating-selected rating-active')).to.equal(true); // Renamed 'br-selected', 'br-current'
        evaluate(sixthItem.hasClass('rating-selected')).to.equal(false);
    });

    // Test case: Verify the presence of the current rating display div.
    testCase('should append a dedicated display element for the current rating', () => {
        evaluate(dQuery('div.current-rating-display')).to.have.lengthOf(1); // Renamed 'br-current-rating'
    });

    // Test case: Check if the displayed rating text is correct and matches the widget's internal state.
    testCase('should accurately show the text of the currently selected rating', () => {
        const widgetData = dQuery(widgetElementId).data('ratingInstance');
        const displayedText = dQuery('div.current-rating-display').html();
        evaluate(displayedText).to.equal(widgetData.currentRatingText);
    });

    // Test case: Ensure the original select field is hidden after the widget is initialized.
    testCase('should conceal the original HTML select element after transformation', () => {
        evaluate(dQuery(widgetElementId).is(':hidden')).to.equal(true); // Changed to check for hidden state
    });

});


// Test suite for the rating plugin's behavior when a rating is explicitly selected by user interaction.
suite('Rating widget display with user selection', () => {
    let callbackEventData = []; // Renamed 'valuesFromCallback', changed 'var' to 'let'
    const targetWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        dQuery(targetWidgetId).ratingWidget('show', {
            onRatingSelected: (chosenValue, chosenText) => { // Renamed 'onSelect', parameters
                callbackEventData.push(chosenValue, chosenText);
            }
        });

        // Simulate a user interaction (click) to select the second rating item.
        dQuery('.rating-display-container a:nth-child(2)').trigger('click');
    });

    afterEachTest(() => {
        dQuery(targetWidgetId).ratingWidget('destroy');
        teardownRatingElement();
        callbackEventData = []; // Reset the callback data for subsequent tests
    });

    // Test case: Verify that the internal data reflects the new selection.
    testCase('should update internal data structures to reflect the newly selected rating', () => {
        const widgetData = dQuery(targetWidgetId).data('ratingInstance');
        evaluate(widgetData.currentRatingValue).to.equal('2');
        evaluate(widgetData.currentRatingText).to.equal('rating-label-2');
    });

    // Test case: Check if CSS classes are updated correctly after a new selection.
    testCase('should apply appropriate CSS classes to indicate the new selection state', () => {
        evaluate(dQuery('.rating-display-container a:nth-child(1)').hasClass('rating-selected')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(2)').hasClass('rating-selected rating-active')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(3)').hasClass('rating-selected')).to.equal(false);
    });

    // Test case: Confirm the displayed rating text is updated to match the new selection.
    testCase('should update the visible current rating display to match the new selection', () => {
        const widgetData = dQuery(targetWidgetId).data('ratingInstance');
        evaluate(dQuery('div.current-rating-display').html()).to.equal(widgetData.currentRatingText);
    });

    // Test case: Verify that the selection callback receives the correct values.
    testCase('should invoke the selection callback with accurate rating value and text', () => {
        evaluate(callbackEventData[0]).to.equal('2');
        evaluate(callbackEventData[1]).to.equal('rating-label-2');
        evaluate(callbackEventData.length).to.equal(2); // Added an additional assertion for length
    });

});


// Test suite for the rating plugin's behavior when operating in reversed mode.
suite('Rating widget functionality in inverted display mode', () => {
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        dQuery(mainWidgetId).ratingWidget('show', {
            invertedDirection: true // Renamed 'reverse' to 'invertedDirection'
        });
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy');
        teardownRatingElement();
    });

    // Test case: Check if CSS classes are applied correctly when the rating direction is inverted.
    testCase('should correctly apply visual classes when the rating direction is inverted', () => {
        evaluate(dQuery('.rating-display-container a:nth-child(4)').hasClass('rating-selected')).to.equal(false);
        evaluate(dQuery('.rating-display-container a:nth-child(5)').hasClass('rating-selected rating-active')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(6)').hasClass('rating-selected')).to.equal(true);
    });

});


// Test suite for the rating plugin's behavior when configured as read-only.
suite('Rating widget behavior in read-only mode', () => {
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        dQuery(mainWidgetId).ratingWidget('show', {
            readOnlyMode: true // Renamed 'readonly' to 'readOnlyMode'
        });

        // Attempt to click on a rating item, which should be ignored in read-only mode.
        dQuery('.rating-display-container a:nth-child(6)').trigger('click');
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy');
        teardownRatingElement();
    });

    // Test case: Verify that CSS classes remain as per initial state (no change from attempted click).
    testCase('should maintain initial selection styling even after attempted user interaction', () => {
        evaluate(dQuery('.rating-display-container a:nth-child(4)').hasClass('rating-selected')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(5)').hasClass('rating-selected rating-active')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(6)').hasClass('rating-selected')).to.equal(false);
    });

    // Test case: Ensure user input is ignored and the rating value remains unchanged in read-only mode.
    testCase('should disregard user input and retain the original rating value and text', () => {
        const widgetData = dQuery(mainWidgetId).data('ratingInstance');
        evaluate(widgetData.currentRatingValue).to.equal('5');
        evaluate(widgetData.currentRatingText).to.equal('rating-label-5');
    });

});


// Test suite for the rating plugin's deselect functionality.
suite('Rating widget deselect operation', () => {
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        // New fragment: Prepend an empty option to the select element to enable deselect behavior.
        dQuery(mainWidgetId).prepend(dQuery('<option />', { 'value': '' }));
        
        dQuery(mainWidgetId).ratingWidget('show');

        // Simulate deselecting the current rating by clicking on the already selected item.
        dQuery('.rating-display-container a:nth-child(5)').trigger('click');
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy');
        teardownRatingElement();
    });

    // Test case: Verify that the deselectable property is correctly set on the widget instance.
    testCase('should confirm that the widget instance is marked as deselectable', () => {
        evaluate(dQuery(mainWidgetId).data('ratingInstance').isDeselectable).to.equal(true); // Renamed 'deselectable'
    });

    // Test case: Ensure the rating is successfully deselected, resulting in empty value and text.
    testCase('should successfully clear the selected rating, resulting in empty value and text', () => {
        const widgetData = dQuery(mainWidgetId).data('ratingInstance');
        evaluate(widgetData.currentRatingValue).to.equal('');
        evaluate(widgetData.currentRatingText).to.equal('');
    });

});


// Test suite for the rating plugin's clear functionality.
suite('Rating widget clear operation', () => {
    let clearEventCallbackData = []; // Renamed 'valuesFromCallback'
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        dQuery(mainWidgetId).ratingWidget('show', {
            onRatingCleared: (clearedValue, clearedText) => { // Renamed 'onClear'
                clearEventCallbackData.push(clearedValue, clearedText);
            }
        });

        // First, set a new rating to ensure there's something to clear.
        dQuery('.rating-display-container a:nth-child(6)').trigger('click');
        
        // Then, programmatically clear the rating.
        dQuery(mainWidgetId).ratingWidget('clear');
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy');
        teardownRatingElement();
        clearEventCallbackData = []; // Reset callback data
    });

    // Test case: Verify that clearing the rating restores it to its original initial value.
    testCase('should restore the rating to its original initial value upon clearing', () => {
        const widgetData = dQuery(mainWidgetId).data('ratingInstance');
        evaluate(widgetData.currentRatingValue).to.equal('5');
        evaluate(widgetData.currentRatingText).to.equal('rating-label-5');
    });

    // Test case: Check if CSS classes revert to the initial state after clearing.
    testCase('should reset visual styling classes to reflect the original selected rating', () => {
        evaluate(dQuery('.rating-display-container a:nth-child(4)').hasClass('rating-selected')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(5)').hasClass('rating-selected rating-active')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(6)').hasClass('rating-selected')).to.equal(false);
    });

    // Test case: Ensure the clear callback receives the correct values (the original rating).
    testCase('should trigger the clear callback with the original rating value and text', () => {
        evaluate(clearEventCallbackData[0]).to.equal('5');
        evaluate(clearEventCallbackData[1]).to.equal('rating-label-5');
    });

});


// Test suite for the rating plugin's destruction functionality.
suite('Rating widget destruction process', () => {
    let destroyEventCallbackData = []; // Renamed 'valuesFromCallback'
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();

        dQuery(mainWidgetId).ratingWidget('show', {
            onWidgetDestroyed: (finalValue, finalText) => { // Renamed 'onDestroy'
                destroyEventCallbackData.push(finalValue, finalText);
            }
        });

        dQuery(mainWidgetId).ratingWidget('destroy');
    });

    afterEachTest(() => {
        teardownRatingElement();
        destroyEventCallbackData = []; // Reset callback data
    });

    // Test case: Verify that all associated plugin data is removed from the element upon destruction.
    testCase('should remove all associated plugin data from the element', () => {
        evaluate(dQuery(mainWidgetId).data('ratingInstance')).to.be.undefined; // Changed expectation to 'undefined'
    });

    // Test case: Ensure the original select field becomes visible again after destruction.
    testCase('should make the original select element visible once again', () => {
        evaluate(dQuery(mainWidgetId).is(':visible')).to.equal(true);
    });

    // Test case: Check if the destroy callback receives the correct values (final rating before destruction).
    testCase('should invoke the destruction callback with the final rating value and text', () => {
        evaluate(destroyEventCallbackData[0]).to.equal('5');
        evaluate(destroyEventCallbackData[1]).to.equal('rating-label-5');
    });

});


// Test suite for programmatically setting the rating value.
suite('Rating widget programmatic value setting', () => {
    const mainWidgetId = '#score-selection-widget';

    beforeEachTest(() => {
        constructRatingElement();
        dQuery(mainWidgetId)
            .ratingWidget() // Initialize the widget
            .ratingWidget('setValue', 3); // Renamed 'set' to 'setValue'
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy'); // Ensure proper cleanup
        teardownRatingElement();
    });

    // Test case: Verify that the internal rating value and its corresponding text are correctly updated.
    testCase('should accurately update the internal rating value and its corresponding text', () => {
        const widgetData = dQuery(mainWidgetId).data('ratingInstance');
        evaluate(widgetData.currentRatingValue).to.equal('3'); // Compare as string as option values are strings
        evaluate(widgetData.currentRatingText).to.equal('rating-label-3');
    });

    // Test case: Check if CSS classes reflect the newly set value.
    testCase('should correctly apply visual classes to highlight the programmatically set rating', () => {
        evaluate(dQuery('.rating-display-container a:nth-child(3)').hasClass('rating-selected')).to.equal(true);
        evaluate(dQuery('.rating-display-container a:nth-child(3)').hasClass('rating-active')).to.equal(true);
    });

});


// Test suite for attempting to set a non-existent rating value.
suite('Rating widget behavior when attempting to set an invalid value', () => {
    const mainWidgetId = '#score-selection-widget';
    const initialRatingSetting = 5; // New variable for the initial rating value

    beforeEachTest(() => {
        constructRatingElement();
        dQuery(mainWidgetId)
            .ratingWidget('show', { initialRatingValue: initialRatingSetting }) // Renamed 'initialRating'
            .ratingWidget('setValue', 9999); // Renamed 'set'
    });

    afterEachTest(() => {
        dQuery(mainWidgetId).ratingWidget('destroy'); // Ensure proper cleanup
        teardownRatingElement();
    });

    // Test case: Verify that no change occurs if an invalid value is programmatically set.
    testCase('should ignore attempts to set a rating value that does not exist in the options', () => {
        const widgetData = dQuery(mainWidgetId).data('ratingInstance');
        // The rating should remain at its initial value as the 'set' operation for 9999 failed.
        evaluate(widgetData.currentRatingValue).to.equal(initialRatingSetting.toString()); // Compare as string
        evaluate(widgetData.currentRatingText).to.equal(`rating-label-${initialRatingSetting}`);
    });

});