/*
 * This software is licensed under the MIT License.
 * Original source: http://www.opensource.org/licenses/mit-license.php
 * Copyright (c) 2012 High Integrity Design, LLC.
 * Website: http://www.highintegritydesign.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * --- Module Description ---
 * This script is designed to enhance the default ExpressionEngine contact form
 * by converting its submission mechanism to use AJAX, providing a smoother
 * user experience without full page reloads.
 * *****************************************************************************
 */

// This block ensures that the entire DOM is loaded and ready before any
// JavaScript code attempts to interact with it.
$( document ).ready( function()
{

  // This is a utility function responsible for displaying feedback messages
  // to the user within a designated area on the webpage.
  // @param {string} message - The textual content to be shown to the user.
  function displayAjaxMessage ( message )
  {
    // Set the inner HTML of the element identified by "#ajax-message"
    // to the provided 'message' string.
    $( "#ajax-message" ) . html( message );

    // Animate the "#ajax-message" element to fade into view over
    // a duration of 1000 milliseconds (1 second).
    $( "#ajax-message" ) . fadeIn( 1000 );
  }


  // Attach a custom event handler to the submission event of the contact form.
  // By convention, ExpressionEngine's contact form often has the ID "contact_form".
  $( "#contact_form" ) . submit( function( event )
  {
    // Prevent the default browser action for form submission,
    // which would typically cause a full page refresh.
    event . preventDefault();

    // Immediately hide any previously displayed AJAX messages to clear the slate
    // for new feedback.
    $( "#ajax-message" ) . hide();


    // Initiate an asynchronous HTTP (AJAX) request to submit the form data.
    // This allows for dynamic content updates without reloading the page.
    $ . ajax(
    {
      // The target URL for the AJAX request; in this case, the current page.
      url: "/",

      // Specify the HTTP request method as POST.
      type: "post",

      // Indicate that the expected response from the server will be HTML content.
      dataType: "html",

      // Serialize the data from the current form (this) into a URL-encoded string
      // suitable for submission.
      data: $( this ) . serialize(),


      // Define the callback function to be executed if the AJAX request fails
      // due to network issues, server errors, etc.
      error: function ( jqXHR, textStatus, errorThrown )
      {
        // Display a generic error message to the user, suggesting a fallback action.
        displayAjaxMessage( "Sorry, there was an error submitting your form. Please call me at 999-999-9999 and I'll be glad to assist you." );
      },


      // Define the callback function to be executed upon a successful AJAX response.
      // This function will parse the returned HTML to determine the outcome.
      success: function ( html, textStatus, jqXHR )
      {
        // Check if the returned HTML content contains the string "<title>Error</title>".
        // This is a common indicator from ExpressionEngine that an error occurred.
        if ( html . match( /<title>Error<\/title>/ ) )
        {
          // If an error page is detected, attempt to extract the specific error message.
          // ExpressionEngine typically places these messages within the first list item
          // of an unordered list in its error templates.
          var error = $( html ) . find( 'ul li:first' ) . text();

          // Depending on the specific error text, provide tailored feedback to the user.
          if ( error == "A valid sender email is required" )
          {
            displayAjaxMessage( "Please enter your email address." );
          }
          else if ( error == "Email Message is Required" )
          {
            displayAjaxMessage( "Please enter a message." );
          }
        }
        else // If the error title is not found, assume the form submission was successful.
        {
          // Display a positive confirmation message to the user.
          displayAjaxMessage( "Thanks for contacting me!" );
        }
      } // End of the 'success' callback function.

    } ); // End of the $.ajax() call.
  } ); // End of the form 'submit' event handler.

} ); // End of the $(document).ready() block.