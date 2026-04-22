/* This script prepares the sharing interface upon document loading. */
document
  .addEventListener(
    'DOMContentLoaded',
    function (loadEvent) {
      const   exitButtonElement   =   document.querySelector('.close-window')    ;
      const   shareLinkField      =   document.querySelector('input')           ;

      exitButtonElement.addEventListener(
        'click',
        function(mouseEvent)
        {
          window.close();
        }
      );

      shareLinkField.addEventListener(
        'click',
        function(focusEvent)
        {
          shareLinkField.select();
        }
      );
    }
  )
;