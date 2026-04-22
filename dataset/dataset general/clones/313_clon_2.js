//  --------------------------------------------------  Text Editor Initialization Logic
jQuery( 'div#editor textarea' )
  .ckeditor(
    function( textComponent ) {

      var editorCore = jQuery( textComponent )
        .ckeditorGet();


      editorCore
        .getCommand( 'save' )
        .exec = function( activeEditor ) {

          jQuery
            .ajax({
              url: 'data/ajax/' + jQuery( 'div#editor input#editor-target' )
                .val(),
              cache: false,
              dataType: 'json',
              data: {
                content: jQuery( 'div#editor textarea' )
                  .val(),
                type: 'edit'
              },
              type: 'POST',
              success: function( apiResponse ) {
                presentMessage(
                  apiResponse.msg,
                  'PHP',
                  apiResponse.status
                    ? 'alert-success'
                    : 'alert-danger'
                );
              },
              error: function( ajaxRequest, httpStatus ) {
                presentMessage(
                  httpStatus,
                  'AJAX',
                  'alert-danger'
                );
              }
            });

        };


      editorCore
        .getCommand( 'save' )
        .enable();

    }
  );


//  --------------------------------------------------  User Interface Button Actions
jQuery( 'a#editor-close-button' )
  .click(
    function( clickEvent ) {

      jQuery( 'div#editor' )
        .hide();

    }
  );