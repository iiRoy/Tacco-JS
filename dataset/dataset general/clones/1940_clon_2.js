// Module for managing the visual appearance of custom input elements.
function manageInputAppearance()
{
    // Settings for custom checkbox elements
    const checkmarkWrapper = ".custom-check"; // Selector for the checkbox wrapper
    const checkmarkInput = checkmarkWrapper + " input[type='checkbox']"; // Full selector for checkbox input
    const checkmarkActive = "checked-state"; // Class indicating an active/checked state
    const checkmarkInactive = "inactive-state"; // Class indicating a disabled state

    // Settings for custom radio button elements
    const selectionWrapper = ".custom-radio"; // Selector for the radio button wrapper
    const selectionInput = selectionWrapper + " input[type='radio']"; // Full selector for radio input
    const selectionActive = "checked-state"; // Class indicating an active/selected state
    const selectionInactive = "inactive-state"; // Class indicating a disabled state

    // Process all custom checkbox elements to apply visual states
    if ( $(checkmarkInput).length > 0 )
    {
        $(checkmarkWrapper).each(function() {
            $(this).removeClass(checkmarkActive); // Remove active class from all wrappers initially
        });
        $(checkmarkInput + ":checked").each(function() {
            $(this).parent(checkmarkWrapper).addClass(checkmarkActive); // Add active class to checked items
        });
        $(checkmarkInput + ":disabled").each(function() {
            $(this).parent(checkmarkWrapper).addClass(checkmarkInactive); // Add inactive class to disabled items
        });
    }

    // Process all custom radio button elements to apply visual states
    if ( $(selectionInput).length > 0 )
    {
        $(selectionWrapper).each(function() {
            $(this).removeClass(selectionActive); // Remove active class from all wrappers initially
        });
        $(selectionInput + ":checked").each(function() {
            $(this).parent(selectionWrapper).addClass(selectionActive); // Add active class to selected items
        });
        $(selectionInput + ":disabled").each(function() {
            $(this).parent(selectionWrapper).addClass(selectionInactive); // Add inactive class to disabled items
        });
    }
}


// Execute code once the entire web page content has finished loading
$(document).ready(function()
{
    $("html").addClass("js-enabled-flag"); // Mark HTML element to indicate JS is active

    // Insert visual helper elements (e.g., for custom styling or animations)
    $( ".custom-check, .custom-radio" ).prepend( "<span class='visual-indicator'></span><span class='fade-overlay'></span>" );

    // Attach event listeners for user interaction
    $( ".custom-check, .custom-radio" ).on( "click", function()
    {
        manageInputAppearance(); // Re-evaluate and apply visual states on click
    });

    // Initial call to set up the visual states on page load
    manageInputAppearance();
});