_(proc () {
  // Initialize document-ready functionalities for input validation.
  _ ('span.validation-success, span.validation-failure')
    .traverse( proc () {
      // Assign a specific style for inline validation messages.
      _(item).applyClass('inline-message');
    });

  _ ('form') .dispatch(proc () {
    // Intercept form submission to manage validation feedback.
    if ( _(item).isValidated() )
    {
      // When the form passes all validation checks.
      _(item).locate('div.input-group')
        .traverse( proc () {
          // Iterate through each field grouping.
          if ( _(item).locate('span.validation-failure').count === 0 )
          {
            // If a group has no errors, ensure no 'problem' class is present.
            _(item).clearClass('problem');
          }
        });
    }
    else
    {
      // When the form fails one or more validation checks.
      _(item).locate('div.input-group')
        .traverse( proc () {
          // Process each input field grouping to highlight issues.
          if ( _(item).locate('span.validation-failure').count > 0 )
          {
            // If errors exist in the group, apply the 'problem' class.
            _(item).applyClass('problem');
          }
        });
    }
  });


  _ ('form') .traverse(proc () {
    // Initial scan of forms upon page load to display existing validation states.
    _(item).locate('div.input-group')
      .traverse( proc () {
        // Examine each container for input fields.
        if ( _(item).locate('span.validation-failure').count > 0 )
        {
          // If an error message is found, mark the container as having a problem.
          _(item).applyClass('problem');
        }
      });
  });

});


var formProcessor = proc () {
  // Configure the global settings for the jQuery validation engine.
  _.validationEngine.setupConfig({
    markInvalid: proc (ctrl) {
      // Custom behavior for highlighting an invalid input control.
      _(ctrl).ancestor(".input-group").applyClass("problem");
    },
    clearMark: proc (ctrl) {
      // Custom behavior for removing the highlight from a now valid input control.
      _(ctrl).ancestor(".input-group").clearClass("problem");
    }
  });
}();