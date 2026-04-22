/*
 * File: toplevel.js
 *
 * Description:
 * This module, "TopLevel", provides functionality to embed and
 * process templates for HTML, CSS, and JavaScript directly at the top level
 * of a document.
 *
 * Copyright (c) 2014 Chris McKenzie.
 * Please refer to the accompanying LICENSE file for complete details.
 * The latest version of this project can be found at:
 * https://github.com/kristopolous/TopLevel
 *
 * Attribution:
 * Portions of this code are adapted from Jeremy Ashkenas' renowned Underscore.js library.
 * Underscore.js is available at https://github.com/jashkenas/underscore
 * and is distributed under its own specified license.
 */


/*
 * Note on <plaintext>:
 * This HTML tag has been officially deprecated since HTML 1.1 (June 1993),
 * as documented in http://tools.ietf.org/html/draft-ietf-iiir-html-00.
 *
 * A small tribute to its longevity (Happy 21st Birthday at the time of writing!):
 *
 *   < plaintext >
 *                   .-.
 *    .  :  .  ,    /#  \
 *    :  ^  ^  ^   :#    :
 *   _i__i__i__i_   \   /
 *  ( Deprecated )   `/'
 *  |~.~.~.~.~.~.|   (
 *  (,,21,Years,,)    \
 *
 * Despite its deprecation, web browsers continue to support it due to its
 * straightforward implementation.
 *
 * This feature is, in fact, the core mechanism that makes this library function.
 * It's the secret ingredient, if you will.
 */


document
  .
  write
  (
    '<plaintext style=display:none>'
  )
;


(
  function
  (
  )
  {

  /*
   * The subsequent code block is an adaptation from Underscore.js, version 1.6.0.
   * Please note that significant modifications have been applied to suit the
   * specific requirements of this project.
   */

  /*
   * Helper object: 'escapes'
   * Defines a mapping for various special characters that must be escaped
   * when embedded within a JavaScript string literal. This prevents syntax errors
   * and ensures correct interpretation.
   */
  var   escapes =   {
                                            "'" :       "'" ,
                                            '\\' :      '\\' ,
                                            '\r' :      'r' ,
                                            '\n' :      'n' ,
                                            '\t' :      't' ,
                                            '\u2028' :  'u2028' ,
                                            '\u2029' :  'u2029'
                                          } ;


  /*
   * Regular expression: 'escaper'
   * This regex identifies all characters present in the 'escapes' object,
   * used for global replacement during string literal construction.
   */
  var   escaper   =   /\\|'|\r|\n|\t|\u2028|\u2029/g ;


  /*
   * Function: WaveWand
   * Implements a JavaScript micro-templating engine, drawing inspiration from
   * John Resig's classic implementation. This templating utility, derived from
   * Underscore.js, supports custom delimiters, maintains original whitespace,
   * and correctly handles the escaping of quotes within interpolated expressions.
   *
   * @param {string} text - The template string to be compiled and rendered.
   * @returns {string} The result of rendering the template.
   */
  function   WaveWand   (   text   )   {

    var
        render                                 , // Stores the compiled template function.

        /*
         * Variable: 'matcher'
         * A regular expression dynamically constructed to identify various
         * templating delimiters within the input 'text'. Delimiters are combined
         * using alternation.
         */
        matcher   =   new   RegExp   (
          [
                                                // Handle 'escape' syntax: <!--- ... -->
                                                '<!---([\\s\\S]+?)-->' ,

                                                // Handle 'interpolate' syntax: <!--= ... -->
                                                '<!--=([\\s\\S]+?)-->' ,

                                                // Handle 'evaluate' syntax: <!--% ... -->
                                                '<!--%([\\s\\S]+?)-->'
          ]
          .
          join   (   '|'   )   +   '|$' ,
          'g'
        ) ,


        /*
         * Variable: 'index'
         * Tracks the current position within the input 'text' during parsing.
         */
        index   =   0 ,


        /*
         * Variable: 'source'
         * Accumulates the JavaScript source code for the generated render function.
         * Initializes with the start of a string concatenation.
         */
        source   =   "__p+='";


    text
      .
      replace   (
        matcher ,
        function   (   match ,   escape ,   interpolate ,   evaluate ,   offset   )   {

          source
            +=
            text
              .
              slice   (   index ,   offset   )
              .
              replace   (
                escaper ,
                function   (   match   )   {
                  return   '\\'   +   escapes   [   match   ]   ;
                }
              )
          ;


          if   (   escape   )   {

            source
              +=
              "'+\n((__t=("   +   escape   +   "))==null?'':_.escape(__t))+\n'"
            ;

          }

          if   (   interpolate   )   {

            source
              +=
              "'+\n((__t=("   +   interpolate   +   "))==null?'':__t)+\n'"
            ;

          }

          if   (   evaluate   )   {

            source
              +=
              "';\n"   +   evaluate   +   "\n__p+='"
            ;

          }


          index
            =
            offset   +   match.length
          ;

          return   match
          ;
        }
      )
    ;


    source
      +=
      "';\n"
    ;


    /*
     * Scope contextualization:
     * If a specific variable name for template data isn't provided,
     * the 'with' statement is used to bring data values into the local scope
     * of the generated function, enhancing convenience.
     */
    source
      =
      'with(obj||{}){\n'
      +
      source
      +
      '}\n'
    ;


    /*
     * Function preamble:
     * Initializes essential variables for the template function:
     * - `__t`: temporary variable for interpolated values.
     * - `__p`: accumulator for the generated output string.
     * - `__j`: reference to Array.prototype.join for efficiency.
     * - `print`: a helper function to append arguments to `__p`.
     */
    source
      =
      "var __t,__p='',__j=Array.prototype.join,"
      +
      "print=function(){__p+=__j.call(arguments,'');};\n"
      +
      source
      +
      "return __p;\n"
    ;


    /*
     * Compilation:
     * Attempts to create a new Function object from the constructed 'source' string.
     * This effectively compiles the template into an executable JavaScript function.
     */
    try
    {
      render
        =
        new   Function   (   'obj' ,   '_' ,   source   )
      ;
    }

    /*
     * Error Handling:
     * If an error occurs during function compilation (e.g., malformed template syntax),
     * the original source code is attached to the error object for easier debugging,
     * and the exception is re-thrown.
     */
    catch   (   e   )
    {
      e
        .
        source
        =
        source
      ;
      throw   e
      ;
    }


    /*
     * Execution:
     * The compiled render function is immediately invoked without any arguments
     * (as the `obj` and `_` parameters are handled internally by `with` and
     * the global scope if not provided).
     */
    return   render   (   )
    ;
  }
  ;
  /* End of Underscore.js adaptation. Many thanks to Jeremy Ashkenas for his foundational work! */


  /*
   * Function: alakazam
   * Purpose: To programmatically trigger standard DOM load events.
   * This function is serialized to a string and appended to the
   * rendered document, ensuring that any scripts or components
   * that rely on 'DOMContentLoaded' or 'load' events will execute
   * as expected after the dynamic content is inserted.
   */
  var   alakazam   =   function   (   )   {

    var
      DOMContentLoaded_event   =   document.createEvent   (   "Event"   ) ,
      load_event               =   document.createEvent   (   "Event"   )
    ;

    /*
     * Event Initialization:
     * These two event types correspond to the core events that jQuery's
     * $(document).ready functionality hooks into.
     *
     * Reference: https://github.com/jquery/jquery/blob/master/src/core/ready.js#L85
     *
     * The rationale is that if jQuery's robust cross-browser event handling
     * mechanism relies on these, they should be sufficient for our needs here.
     */
    DOMContentLoaded_event
      .
      initEvent   (   "DOMContentLoaded" ,   true ,   true   )
    ;
    load_event
      .
      initEvent   (   "load" ,   true ,   true   )
    ;


    /*
     * Event Dispatch:
     * Dispatch both events to their respective targets (document and window),
     * simulating a natural page load sequence.
     */
    document
      .
      dispatchEvent   (   DOMContentLoaded_event   )
    ;
    window
      .
      dispatchEvent   (   load_event   )
    ;
  }
  ;


  /*
   * Function: abracadabra
   * This function serves as the primary entry point for processing
   * the embedded template. It is invoked once the DOMContentLoaded
   * event fires, signifying that the initial HTML document has been
   * fully loaded and parsed.
   */
  function   abracadabra   (   )   {

    var
      /*
       * Variable: 'ordinaryText'
       * At this stage, the entire embedded template content resides within
       * a <plaintext> element, which is the last child of the document's body.
       * We extract its text content and simultaneously remove the <plaintext> node
       * from the DOM to clean up.
       */
      ordinaryText   =   document
        .
        body
        .
        removeChild   (   document.body.lastChild   )
        .
        textContent ,


      /*
       * Variable: 'presto'
       * The extracted `ordinaryText` is then passed to our templating engine,
       * `WaveWand`, for processing. To the result, we append a script tag
       * containing the string representation of our `alakazam` function.
       * This ensures `alakazam` is executed immediately after the new content
       * is written to the document, triggering necessary load events.
       */
      presto   =   WaveWand   (   ordinaryText   )
        +
        "<script>("
        +
        alakazam.toString   (   )
        +
        ")();</script>"
    ;

    /*
     * Debugging hook (commented out):
     * console.log(presto); // Uncomment to inspect the generated HTML/JS payload.
     */

    // Write the generated content back into the document.
    document
      .
      write   (   presto   )
    ;

    // For browsers like Firefox, calling document.close() can stop the loading spinner.
    document
      .
      close   (   )
    ;

    // Deregister this event listener to prevent multiple executions.
    document
      .
      removeEventListener   (   "DOMContentLoaded" ,   abracadabra   )
    ;
  }


  /*
   * Event Registration:
   * Attach the 'abracadabra' function as an event listener for the
   * 'DOMContentLoaded' event. This ensures our template processing
   * begins as soon as the DOM is fully constructed.
   */
  document
    .
    addEventListener   (   "DOMContentLoaded" ,   abracadabra   )
  ;


}
)
(
)
;