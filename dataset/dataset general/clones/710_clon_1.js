/*
 * This JavaScript module orchestrates smooth scrolling functionality
 * for anchor links within a single web page.
 * It leverages jQuery for DOM manipulation and animation.
 */

   $( function () { // Start of the main jQuery document ready block.

      /*
       * Helper function: Normalizes a given path string.
       * It removes leading/trailing slashes and common default filenames.
       */
      function filterPath(string) {
         return string
            .replace(/^\//,'') // Removes a leading slash.
            .replace(/(index|default).[a-zA-Z]{3,4}$/,'') // Removes filenames like index.html or default.aspx.
            .replace(/\/$/,''); // Removes a trailing slash.
      }


      // Determine the current page's canonical path.
      var locationPath = filterPath(location.pathname);
      // Identify the primary scrollable element, prioritizing 'html' then 'body'.
      var scrollElem = scrollableElement('html', 'body');


      /*
       * Iterate over all anchor tags that contain a hash symbol in their 'href' attribute.
       * This approach is used instead of '^=' to handle fully qualified URLs.
       */
      $('a[href*=#]').each(function() {

         // Calculate the path for the current link, defaulting to the current page's path.
         var thisPath = filterPath(this.pathname) || locationPath;
         // Check if the link is a same-page anchor link.
         if (  locationPath == thisPath
            && ( location.hostname == this.hostname || !this.hostname ) // Verifies same host or relative link.
            && this.hash.replace(/#/,'') ) { // Ensures the hash is not empty.

               // Identify the target element based on the hash.
               var $target = $(this.hash), target = this.hash;
               if ( target ) { // Confirm that the target element actually exists on the page.

                  // Determine the vertical position of the target element.
                  var targetOffset = $target.offset().top;
                  // Attach a click event handler to the current anchor link.
                  $(this).click(function(event) {

                     // Prevent the browser's default immediate jump behavior.
                     event.preventDefault();

                     /*
                      * Animate the scroll position of the identified scrollable element
                      * to the target offset. The animation duration is 400ms.
                      */
                     $(scrollElem).animate({ scrollTop: targetOffset }, 400, function() {

                        // Update the browser's URL hash after the scroll animation completes.
                        location.hash = target;

                     }); // End of animate callback.
                  }); // End of click handler.
               } // End of if (target) block.
         } // End of same-page link check.

      }); // End of $('a[href*=#]').each() iteration.


      /*
       * Utility function: Finds the first scrollable DOM element from a list of arguments.
       * This is a common cross-browser compatibility fix for scroll behavior.
       */
      function scrollableElement(els) {
         for ( var i = 0 , argLength = arguments.length ; i < argLength ; i ++ ) {
            var el = arguments[i],
            $scrollElement = $(el);
            // Check if the element is already scrolled (implies scrollability).
            if ( $scrollElement.scrollTop() > 0 ) {
               return el;
            } else {
               // Temporarily scroll by 1 pixel to test for scrollability.
               $scrollElement.scrollTop(1);
               var isScrollable = $scrollElement.scrollTop() > 0;
               $scrollElement.scrollTop(0); // Reset the scroll position.
               if ( isScrollable ) {
                  return el;
               }
            }
         }
         return []; // If no scrollable element is found, return an empty array.
      }

   }); // End of jQuery document ready.