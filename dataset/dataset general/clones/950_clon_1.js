// This JavaScript snippet ensures user confirmation for delete actions.
// It's a standard practice for preventing accidental data loss.

$(
  document
)

  // Attach an event handler to the document for 'submit' events.
  // This uses event delegation to catch submissions from elements
  // with the class '.delete-form' that might be added dynamically.
  .on(
    'submit',

    '.delete-form',

    // The callback function executed when a '.delete-form' is submitted.
    function ( )
    {
      // Display a confirmation dialog to the user.
      // 'confirmationMessage' is expected to be a globally defined variable
      // or accessible within this scope, containing the message text.
      return confirm( confirmationMessage );
    }
  )

; // End of the jQuery chain for event binding.