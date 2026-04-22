/* This is a comment block for the first event handler.
 * It demonstrates a basic modal setup with jQuery.
 */
$( document ).on( 'click' , '#basic-example' , function (   ) {
  // Handler function for the basic example button.
  $. modal ( {
    title : "Example title" , // Title of the modal window.
    content : "Here's some important message you must read." , // The main content displayed.
    buttons : [ // Array containing button configurations.
      {
        text : "Roger that" , // Text shown on the button.
        close : true         // Indicates that this button should close the modal.
      }
    ]
  } ) . modal ( 'show' ) ; // Chain to show the modal immediately after creation.
} ) ; // End of the first event handler.


/*
 * This section handles the click event for the 'full-example' button.
 * It showcases a more complex modal configuration with various options
 * and multiple custom buttons.
 */
$(  document  ).on( 'click'  ,  '#full-example'  ,  function (   )  {
  "use strict"  ; // Activates strict mode for better error-checking and safer coding.

    // Initialize the modal with a comprehensive set of options.
  $.  modal  (  {
    title  :  "Full example title"  ,  // Custom title for the full modal example.
    content  :  "<p>Rich content with some <strong>HTML</strong> tags <em>here</em> and <u>there</u></p>"  ,  // HTML-rich content.
    header  :  true  ,  // Display the modal header.
    footer  :  true  ,  // Display the modal footer.
    dispose  :  true  ,  // Ensure the modal is removed from DOM after closing.
    buttons  :  [  // Array of button objects for the modal footer.
      {
        text  :  "Yup, I got it"  ,  // Text for the first button.
        href  :  "#"  ,  // A dummy href attribute.
        classes  :  "btn-primary"  ,  // CSS classes for styling.
        click  :  function ( e )  {  // Custom click handler function.
          alert  (  "Seriously, I got it!"  )  ; // An alert box.
        }
      }  ,
      {
        text  :  "Get me out of here"  ,  // Text for the second button.
        href  :  "#"  ,  // Another dummy href.
        close  :  true  // This button will close the modal.
      }  ,
      {
        html  :  "<a href='#' data-dismiss='modal' class='btn btn-danger'>Danger, custom button</a>"  ,  // Full custom HTML for the button.
        text  :  "Achtung!"  ,  // Fallback text, might not be visible if html is fully used.
        classes  :  "btn-large"  ,  // Additional CSS classes.
        click  :  function (   )  {  // Custom click handler.
          alert  (  "Custom  button"  )  ; // Another alert.
        }
      }
    ]
  }  )  .  modal  (  'show'  )  ; // Display the fully configured modal.
}  )  ; // End of the second event handler.


// This is a jQuery document ready function.
// It executes its content once the DOM is fully loaded.
$(  function (   )  {
  // Check if the 'prettyPrint' function (from Google Code Prettify) exists globally.
  // If it does, call it to format any code blocks on the page.
  window  .  prettyPrint  &&  prettyPrint (   )
}  )  ; // End of the document ready block.