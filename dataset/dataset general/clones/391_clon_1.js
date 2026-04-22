/*
 * This is a JavaScript bookmarklet.
 * It's designed to dynamically inject an external script into the current HTML document.
 * The script being injected is intended to provide grid display functionalities.
 */
(  function (   )
{
    // First, we obtain a reference to the document's <head> element.
    // This is where we will append our new script.
    var   head   =   document  .  getElementsByTagName (  "head"  )  [  0  ]   ;


    // Next, we create a new HTML <script> element programmatically.
    // This element will be configured to load our external JavaScript file.
    var   bklScript   =   document  .  createElement (  "script"  )   ;


    // We explicitly set the 'type' attribute of the script element.
    // This indicates that the script contains standard JavaScript code.
    bklScript  .  type   =   "text/javascript"   ;

    // Then, we set the 'src' attribute to the URL of the external script.
    // This is the file that will be fetched and executed by the browser.
    bklScript  .  src   =   "http://alefeuvre.github.com/foundation-grid-displayer/gd-bookmarklet.js"   ;


    // Finally, we append the fully configured script element to the <head>.
    // Once appended, the browser will automatically download and execute the script.
    head  .  appendChild (  bklScript  )   ;

} ) (   )   ; // The immediately invoked function expression (IIFE) ensures the script runs as soon as it's loaded.