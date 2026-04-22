/*
 * This JavaScript file contains client-side validation logic and
 * jQuery setup for form interactions. It ensures that validation
 * messages are styled correctly and that form submission reflects
 * the validation state visually.
 */

// Execute code when the DOM is fully loaded and ready
$(  function  ()   {

    // --- Section 1: Initial Styling for Validation Messages ---
    // Target all span elements used for validation messages (valid or error)
    // and apply a specific CSS class for inline help.
    $( 'span.field-validation-valid, span.field-validation-error' ) . each (  function  ()  {
        // Add the 'help-inline' class to each matching element.
        $( this ) . addClass ( 'help-inline' ) ;
    } ) ;


    // --- Section 2: Form Submission Handler ---
    // Intercept form submissions to dynamically update error states.
    $( 'form' ) . submit (  function  ()   {

        // Store a reference to the current form for efficiency
        var  currentForm  =  $( this ) ;

        // Check if the form passes client-side validation rules.
        if  (  currentForm . valid ()  )   {

            // If the form is valid, iterate through its control groups.
            currentForm . find ( 'div.control-group' ) . each (  function  ()   {
                // For each control group, check if there are any validation errors within it.
                // If no errors are found (length is 0), remove the 'error' class.
                if  (  $( this ) . find ( 'span.field-validation-error' ) . length  ==  0  )   {
                    $( this ) . removeClass ( 'error' ) ;
                }
            } ) ;

        }
        else   {

            // If the form is NOT valid, iterate through its control groups again.
            currentForm . find ( 'div.control-group' ) . each (  function  ()   {
                // If validation errors ARE found within a control group (length > 0),
                // add the 'error' class to highlight the invalid fields.
                if  (  $( this ) . find ( 'span.field-validation-error' ) . length  >  0  )   {
                    $( this ) . addClass ( 'error' ) ;
                }
            } ) ;

        }

        // Allow the form to proceed with its default submission behavior
        // (or prevent it if validation failed and the form is not set to submit).
        // Note: The original code does not explicitly return true/false,
        // which might lead to default form submission unless prevented elsewhere.
        // Assuming validation framework handles prevention on valid() == false.

    } ) ;


    // --- Section 3: Initial Form Error State Setup ---
    // This block runs once on page load to set initial error states
    // based on any pre-existing server-side validation errors.
    $( 'form' ) . each (  function  ()   {

        // Iterate over each form found on the page.
        $( this ) . find ( 'div.control-group' ) . each (  function  ()   {
            // For each control group, if it contains a validation error span,
            // apply the 'error' class to visually mark the group.
            if  (  $( this ) . find ( 'span.field-validation-error' ) . length  >  0  )   {
                $( this ) . addClass ( 'error' ) ;
            }
        } ) ;

    } ) ;

} ) ; // End of document ready function


// --- Section 4: jQuery Validation Plugin Defaults ---
// This is an Immediately Invoked Function Expression (IIFE)
// to encapsulate page-specific validation settings.
var  page  =  (  function  ()   {

    // Override default settings for the jQuery Validation plugin.
    $. validator . setDefaults (  {
        // Custom highlight function:
        // When an element fails validation, find its closest '.control-group' parent
        // and add the 'error' class to it.
        highlight:  function  (  element  )   {
            $( element ) . closest ( ".control-group" ) . addClass ( "error" ) ;
        } ,

        // Custom unhighlight function:
        // When an element passes validation (or is corrected), find its closest
        // '.control-group' parent and remove the 'error' class.
        unhighlight:  function  (  element  )   {
            $( element ) . closest ( ".control-group" ) . removeClass ( "error" ) ;
        }
    } ) ;

} ) () ; // End of IIFE for page validation settings