/*
*   This file is a Type I clone
*   of the original JavaScript code.
*
*   It maintains exact logical and structural
*   equivalence to the source.
*
*   Changes are strictly limited to
*   whitespace and comments.
*
*   Copyright Notice:
*   (c) 2010 Sam Collett - http://www.texotela.co.uk
*   Licensed under MIT (http://www.opensource.org/licenses/mit-license.php)
*   and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*
*   Version: 1.0 (Clone)
*
*/
; ( function ( $ ) {

    // This section defines a jQuery plugin for displaying content in an iframe within a UI dialog.

    $.fn.dialogIframe = function (  options  )
    {
        // Extend default options with any provided by the user.
        options = $.extend( { } ,  $.fn.dialogIframe.defaults ,  options  );


        // Attach a click event handler to the selected elements.
        $( this ).click(

            function (  e  )
            {
                var el = this; // Store the clicked element.

                e.preventDefault( ); // Prevent the default link behavior.


                var title = el.title; // Get the title from the element's 'title' attribute.

                // If no title attribute, use the element's text content.
                if ( ! title.length )
                {
                    title = $( el ).text( );
                }

                // Construct the dialog with an embedded iframe.
                var dialog = $( "<div id = 'iframedialog'><iframe /></div>" )

                    .find( "iframe" ) // Target the newly created iframe.
                        .attr(
                            {
                                "frameBorder" :  0 ,
                                "width"       :  "100%" ,
                                "height"      :  "100%" ,
                                "scrolling"   :  "auto" ,
                                "src"         :  el.href
                            }
                        )
                    .end( ) // Go back to the original div element.

                    .dialog( // Initialize the jQuery UI dialog.
                        {
                            title  :  title ,
                            height :  options.height ,
                            width  :  options.width
                        }
                    )
                    // Remove default padding from the dialog content area.
                    .find( ".ui-dialog-content" ).css( "padding" ,  0 ).end( );
            }
        );
    };

    // Define default settings for the dialogIframe plugin.
    $.fn.dialogIframe.defaults =
    {
        width  :  500 ,
        height :  400
    };

} ) ( jQuery ); // End of the immediately invoked function expression.