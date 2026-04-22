/*
 * This is an adaptation of John Resig's Micro-Templating engine.
 * Original source: http://ejohn.org/blog/javascript-micro-templating/
 * Adapted by Greg Borenstein (http://ideasfordozens.com) in February 2009.
 * MIT License applies.
 *
 * This utility provides simple JavaScript templating capabilities within the jQuery namespace.
 */
jQuery . srender = function ( template , data , target )
{
  jQuery . srender . cache = { } ; /* Initialize the cache for compiled templates. */

  // The 'target' parameter is optional.
  // If a DOM element is provided, the processed template result will be inserted into it.
  // Otherwise, the template's output will simply be returned as a string.

  if ( jQuery . srender . cache [ template ] )
  {
    fn = jQuery . srender . cache [ template ] ; // Retrieve cached function if available.
  }
  else
  {
    /*
     * If the template is not in the cache, we need to compile it into a reusable function.
     * This function will then be stored in the cache for future use, improving performance.
     */
    fn = jQuery . srender . cache [ template ] = new Function
    (
      "obj" ,
      "var p = [] , print = function ( ) { p . push . apply ( p , arguments ) ; } ;" +

      // Introduce the data object's properties as local variables within the template scope
      // using the 'with' statement. (Note: 'with' is generally discouraged but used here
      // for template convenience, as per the original design.)
      "with ( obj ) { p . push ( '" +

      // Begin the process of converting the template string into executable JavaScript code.
      // This involves several 'replace' and 'split/join' operations to handle template syntax.
      template
        . replace ( /[\r\t\n]/g , " " )       // Replace newlines, tabs, and carriage returns with spaces.
        . split ( "<%" ) . join ( "\t" )       // Mark template delimiters.
        . replace ( /((^|%>)[^\t]*)'/g , "$1\r" ) // Escape single quotes outside of script blocks.
        . replace ( /\t=(.*?)%>/g , "',$1,'" )    // Handle output expressions like <%= ... %>.
        . split ( "\t" ) . join ( "') ;" )     // Close previous p.push and open new script block.
        . split ( "%>" ) . join ( "p . push ( '" ) // Close script block and open new p.push.
        . split ( "\r" ) . join ( "\\'" )      // Restore escaped single quotes.

      + "') ; } return p . join ( '' ) ;" // Finalize the function body string.
    ) ;
  }

  // Determine whether to populate a target element or simply return the rendered string.
  if ( target )
  {
    target . html ( fn ( data ) ) ; // Insert the rendered content into the target element.
    return false ;                  // Indicate that the content was handled internally.
  }
  else
  {
    return fn ( data ) ; // Return the rendered template as a string.
  }
} ;

/*
 * This commented-out block represents an alternative or earlier version of a templating
 * mechanism, possibly from the same author or a related project. It is kept here for
 * historical context or potential future reference, but is not active in the current code.
 *
 * ( function ( ) {
 *   var cache = { } ;
 *
 *   this . tmpl = function tmpl ( str , data ) {
 *     // This section aims to either retrieve a template from cache,
 *     // load it from a DOM element, or compile it if new.
 *     var fn = ! / \W / . test ( str ) ?
 *       cache [ str ] = cache [ str ] ||
 *         tmpl ( document . getElementById ( str ) . innerHTML ) :
 *
 *       // If the template is a raw string, compile it on the fly.
 *       new Function ( "obj" ,
 *         "var p = [] , print = function ( ) { p . push . apply ( p , arguments ) ; } ;" +
 *
 *         // Use 'with' to bring data properties into scope.
 *         "with ( obj ) { p . push ( '" +
 *
 *         // Template string processing logic, similar to the main srender function.
 *         str
 *           . replace ( /[\r\t\n]/g , " " )
 *           . split ( "<%" ) . join ( "\t" )
 *           . replace ( /((^|%>)[^\t]*)'/g , "$1\r" )
 *           . replace ( /\t=(.*?)%>/g , "',$1,'" )
 *           . split ( "\t" ) . join ( "') ;" )
 *           . split ( "%>" ) . join ( "p . push ( '" )
 *           . split ( "\r" ) . join ( "\\'" )
 *         + "') ; } return p . join ( '' ) ;" ) ;
 *
 *     // Provide basic currying: if data is supplied, execute; otherwise, return the function.
 *     return data ? fn ( data ) : fn ;
 *   } ;
 * } ) ( ) ;
 */