/*
 * This is a zoinked module.
 * It detects scroll and adds a CSS class to the body.
 * Version: 1.0.0
 */

( function ( window, document, body, undefined ) {

    // Define the CSS class to be added.
    var  CSS_CLASS  =  "zoinked" ;


    /*
     * Main constructor function.
     * Initializes the scroll detection.
     */
    var  Z  =  function (  )  {
        // Ensure 'body' is properly set, falling back to document.body if needed.
        body  =  (  body  )  ?  body  :  document.body ;

        // Flag to track if the page has scrolled past a certain point.
        this.hasScrolled  =  false ;

        // Check for modern event listener support.
        if  (  window.addEventListener  )  {
            // Attach scroll event listener to the window.
            window.addEventListener (  "scroll" ,  this ,  false  ) ;
        }  else  {
            // If no modern support, attempt to load immediately.
            this.load (  ) ;
        }

    } ;


    // Prototype method for handling events.
    Z.prototype.handleEvent  =  function (  e  )  {

        // Check if the page has scrolled down more than 2 pixels.
        if  (  window.pageYOffset  >  2  )  {
            // Set the flag to true.
            this.hasScrolled  =  true ;

            // Remove the scroll event listener as it's no longer needed.
            window.removeEventListener (  "scroll" ,  this  ) ;

            // Trigger the load function to apply the CSS class.
            this.load (  ) ;
        }

    } ;


    /**
     * @function load
     * @description Applies the CSS_CLASS to the document body.
     * Handles different methods for adding classes.
     */
    Z.prototype.load  =  function (  )  {

        // Check for jQuery support.
        if  (  typeof  $  !==  "undefined"  )  {
            // Use jQuery to add the class.
            $ (  body  ) . addClass (  CSS_CLASS  ) ;
        }  else  if  (  document.body.classList  )  {
            // Use native classList API.
            body.classList . add (  CSS_CLASS  ) ;
        }  else  {
            // Fallback for older browsers: concatenate to className.
            body.className  +=  CSS_CLASS ;
        }

    } ;


    // Check for AMD loader (e.g., RequireJS).
    if  (  typeof  define  !==  "undefined"  )  {
        // Define the module for AMD.
        define (  [  ] ,  function (  )  {
            return  Z ;
        }  ) ;
    }  else  {
        // Expose Z globally if no AMD loader is found.
        window.Zoink  =  Z ;
    }

} ) ( window, document, document.body ) ; // Immediately invoked function expression end.