// This file contains the Bender class definition and its factory function.
// It is designed to manage dynamic stylesheet switching based on user preferences or device type.

/**
 * @class Bender
 * @param {string} id - The unique identifier for this Bender instance, often used for cookie names and element IDs.
 * @description
 *  The Bender constructor initializes a new instance for managing styles.
 */
function   Bender ( id )
{
   // Initialize instance variables:
   // self: A reference to the current Bender instance for use in nested functions.
   // styles: An object to store style names mapped to their hrefs.
   // keys: An array to keep track of added style names.
   // mobile: Stores the style name designated for mobile devices, if any.
   var   self   =   this  ,
         styles =  {}    ,
         keys   =  []    ,
         mobile ;


   /**
    * Sets the active stylesheet by updating the href of a link element.
    * @param {string} style - The name of the style to apply.
    */
   this.set = function ( style )
   {
      // Locate the link element by its ID and update its href attribute.
      document
         .getElementById ( id )
         .href = styles [ style ] ;
   }


   /**
    * Chooses a style, saves it to a cookie, and then applies it.
    * @param {string} style - The name of the style to choose and apply.
    */
   this.choose = function ( style )
   {
      // Save the chosen style in a cookie for persistence.
      // The cookie name is "bender-" followed by the instance ID.
      // It's valid for the entire site path and expires in 30 days.
      $
         .cookie ( "bender-" + id ,   style ,   {   path: '/' ,   expires: 30   } ) ;


      // Apply the selected style to the document.
      self
         .set ( style ) ;
   }


   /**
    * Adds a new style definition to Bender's internal registry.
    * @param {string} style - The unique name for this style.
    * @param {string} href - The URL of the stylesheet file.
    * @param {string} [auto] - Optional. If "auto-mobile", this style is considered for mobile auto-detection.
    * @returns {Bender} The current Bender instance for chaining.
    */
   this.add = function ( style ,   href ,   auto )
   {
      // Add the style name to the list of available keys.
      keys = keys
                .concat ( style ) ;


      // Store the href associated with the style name.
      styles [ style ] = href ;


      // Check if this style should be automatically applied for mobile devices.
      if   ( auto == "auto-mobile" )
      {
         mobile = style ; // Mark this style as the mobile default.
      }


      return self ; // Allow method chaining.
   }


   /**
    * Attaches click event handlers to elements corresponding to each registered style key.
    * When clicked, the respective style is chosen and applied.
    */
   this.clicks = function ( )
   {
      // Iterate over all registered style keys.
      keys
         .forEach (
             function ( key )
             {
                // For each key, find the element with an ID matching the key
                // and attach a click event listener.
                $ ( "#" + key )
                   .click ( function ( e )
                   {
                      e
                         .preventDefault ( ) ; // Prevent default link behavior.
                      self
                         .choose ( key ) ;     // Apply the style associated with the clicked element.
                   } ) ;
             }
         ) ;
   }


   /**
    * Installs Bender: checks for a previously selected style, applies a mobile style if detected,
    * and returns the clicks function for further setup.
    * @returns {function} The `clicks` function, which can be called to attach event listeners.
    */
   this.install = function ( )
   {
      // Try to retrieve a previously selected style from a cookie.
      var   selected   =   $
                               .cookie ( "bender-" + id ) ;


      // If a style was previously selected and saved in a cookie:
      if   ( selected )
      {
         self
            .set ( selected ) ; // Apply that style.
      }
      // If no style was selected, but a mobile-specific style was registered:
      else   if   ( mobile )
      {
         // Check if the user agent indicates a mobile or Android device.
         if   ( navigator
                    .userAgent
                    .toLowerCase ( )
                    .match ( /mobile|android/ ) )
         {
            self
               .set ( mobile ) ; // Apply the designated mobile style.
         }
      }


      // Return the clicks function, allowing the caller to chain its execution.
      return self
                 .clicks ;
   }
} ;


/**
 * @function bender
 * @param {string} id - The unique identifier for the Bender instance.
 * @returns {Bender} A new instance of the Bender class.
 * @description
 *  Factory function to create a new Bender instance, providing a more convenient
 *  way to instantiate the class without using the 'new' keyword directly.
 */
function   bender ( id )
{
   // Simply return a new Bender object.
   return   new   Bender ( id ) ;
}