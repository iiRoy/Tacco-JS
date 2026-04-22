/*
 * This JavaScript file presents a Type I clone of an original script.
 * A Type I clone means the code is functionally identical,
 * with the only permitted alterations being whitespace and comments.
 *
 * This particular script utilizes the jQuery library alongside a history management plugin
 * to facilitate dynamic content loading via AJAX, based on changes in the URL's hash fragment.
 */


// The primary execution block, ensuring that all DOM elements are fully loaded
// and ready before any JavaScript operations are performed.
jQuery (  document  ) . ready (  function  (  $  )  {

        // Definition of a local helper function named 'load'.
        // Its responsibility is to fetch and display HTML content dynamically.
        function   load   (   num   )   {
            // Targets the specific HTML element identified by the ID 'content'.
            // Subsequently, it loads an HTML file into this element.
            // The filename is constructed by appending ".html" to the 'num' parameter.
            $ ( '#content' ) . load ( num  +  ".html"  ) ;
        } // End of the 'load' function definition.


        // Initialization of the jQuery history plugin.
        // The anonymous function provided as an argument serves as a callback,
        // which is invoked whenever the browser's URL hash component changes.
        $.history.init (  function  (  url  )  {
                // Conditional logic to determine which content to load:
                // If the 'url' parameter (representing the hash) is an empty string,
                // it defaults to loading "1.html". Otherwise, it loads the content
                // corresponding to the actual 'url' value.
                load ( url  ==  ""  ?  "1"  :  url ) ;
            }
        ) ; // Conclusion of the $.history.init method call.


        // Attaches an event listener for 'click' events to all anchor tags ('a')
        // that are direct or indirect descendants of an element with the ID 'ajax-links'.
        // The '.live()' method ensures that this handler also applies to elements
        // that might be added to the DOM dynamically after initial page load.
        $ ( '#ajax-links a' ) . live ( 'click' ,  function  (  e  )  {
                // Declares a local variable 'url' and assigns it the value
                // of the 'href' attribute from the currently clicked anchor tag.
                var   url   =   $ ( this ) . attr ( 'href' ) ;

                // Modifies the 'url' variable to extract only the hash portion.
                // This regular expression removes any characters preceding and including the '#' symbol.
                url   =   url . replace ( /^.*#/,  '' ) ;

                // Instructs the history plugin to update the browser's URL hash
                // with the newly extracted 'url' value. This action will, in turn,
                // trigger the callback function defined within $.history.init.
                $ . history . load ( url ) ;

                // Prevents the browser's default behavior for a link click,
                // which would typically involve navigating to the 'href' URL.
                return   false ;
            }
        ) ; // Termination of the click event handler for '#ajax-links a'.

    }
) ; // Final closing bracket for the jQuery(document).ready block.

// This marks the end of the Type I cloned JavaScript code.
// No functional changes have been introduced; only superficial modifications.