// This file contains a collection of predefined HTML/Pug snippets.
// It's designed to be used within a code editor or similar environment
// to quickly insert common HTML structures.

/*
 * Configuration for JSLint, ensuring code quality standards.
 * - vars: true (allow multiple var statements in a function)
 * - plusplus: true (allow ++ and -- operators)
 * - devel: true (allow development console functions like console.log)
 * - nomen: true (allow dangling _ in identifiers)
 * - regexp: true (allow . and [^...] in regular expressions)
 * - indent: 4 (expect 4-space indentation)
 * - maxerr: 50 (maximum number of errors before JSLint gives up)
 */
/*
 * Global variables declared to prevent JSLint warnings.
 * - define: AMD define function
 * - brackets: Brackets editor global object (if applicable)
 * - window: Browser window object
 */

define (  function   ( require,  exports,  module ) { // Begin module definition

  'use strict' ; // Enforce strict mode for better error handling and cleaner code.

  // --- HTML Snippet Definitions ---
  // This object stores various Pug/HTML snippets as key-value pairs.
  // Each key is a shorthand, and its value is the corresponding snippet string.
  var  snippets  =
  {
    itemt   :   'itemtype="http://schema.org/*"'   , // Schema.org itemtype attribute placeholder
    data    :   'data-*=""'                        , // Generic HTML5 data attribute
    aria    :   'aria-*=""'                        , // Accessibility (ARIA) attribute placeholder
    a       :   'a(href="")'                       , // Basic anchor (hyperlink) element
    at      :   'a(href="", target="_blank")'      , // Anchor with target="_blank" for new tab/window
    img     :   'img(src="", width="", height="", alt="")', // Image element with essential attributes
    script  :   'script(type="text/javascript", src="")', // JavaScript script element
    link    :   'link(rel="stylesheet", type="text/css", href="")', // CSS stylesheet link element
    form    :   'form(id="", name="", action="", method="")', // Form element with common attributes
    inp     :   'input(type="text", placeholder="")'       , // Text input field
    inpe    :   'input(type="email", placeholder="")'      , // Email input field
    inptel  :   'input(type="tel", placeholder="")'        , // Telephone input field
    inpd    :   'input(type="date", placeholder="")'       , // Date input field
    inpdt   :   'input(type="datetime", placeholder="")'   , // Datetime input field (deprecated in HTML5)
    inpdtl  :   'input(type="datetime-local", placeholder="")', // Local datetime input field
    inpti   :   'input(type="time", placeholder="")'       , // Time input field
    inpdm   :   'input(type="month", placeholder="")'      , // Month input field
    inpw    :   'input(type="week", placeholder="")'       , // Week input field
    inpc    :   'input(type="color", value="")'            , // Color picker input field
    inpn    :   'input(type="number", value="", min="", max="", step="")', // Number input field with range options
    inpr    :   'input(type="range", value="", min="", max="", step="")', // Range slider input field
    inpurl  :   'input(type="url", placeholder="")'        , // URL input field
    inps    :   'input(type="search", placeholder="")'     , // Search input field
    textarea:   'textarea(placeholder="")'                 , // Textarea element
    button  :   'button(type="button") button'             , // Generic button element
    submit  :   'input(type="submit", value="submit")'       // Submit button input
  } ;

  // --- HTML5 Document Template Snippet ---
  // This multi-line string defines a basic HTML5 document structure
  // using Pug (formerly Jade) syntax, which will be converted to HTML.
  snippets.temp  =
      'doctype html' // Specifies HTML5 document type
    + '\nhtml'       // Root HTML element
    + '\n  head(lang="en")' // Head section with language attribute
    + '\n    title Document' // Page title
    + '\n    meta(http-equiv="content-type", content="text/html; charset=UTF-8")' // Character set meta tag
    + '\n    meta(name="description", content="")' // Description meta tag for SEO
    + '\n    meta(name="keywords", content="")'    // Keywords meta tag for SEO
    + '\n    link(rel="stylesheet", href="")'      // Link to an external stylesheet
    + '\n  body'                                   // Body section of the document
    + '\n    script(src="")'                       ; // Link to an external JavaScript file

  // Export the 'snippets' object so it can be used by other modules.
  module.exports  =  snippets ;

} ) ; // End of module definition.

// This marks the end of the snippet collection file.
// Feel free to add more snippets or modify existing ones as needed.
// Last updated: 2023-10-27