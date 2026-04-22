// This module provides functionality to search for subdomains using Bing.
// Note: Current implementation only processes the first page of search results.
// Future improvements might include parsing multiple search result pages (e.g., 1-4).


  var   cheerio    =  require (   'cheerio'   ) ;
  var   request    =  require (   'request'   ) ;
  var   url        =  require (   'url'       ) ;
  var   _          =  require (   'lodash'    ) ;
  var   events     =  require (   'events'    ) ;


// Extend String prototype with an 'endsWith' method for convenience.
// This checks if a string ends with a given suffix.
String . prototype . endsWith = function ( suffix )
{
    return   this . indexOf ( suffix ,   this . length   -   suffix . length )   !==   -1 ;
} ;


// The main export function to find subdomains for a given domain name.
exports . find   =   function ( domainName )
{

  // Create a new EventEmitter instance to signal events.
  var   EE   =   new   events . EventEmitter ( ) ;

  // Initiate an HTTP request to Bing search.
  // The query uses the 'domain:' dork to find relevant results.
  request ( 'http://www.bing.com/search?count=50&q=domain:'   +   domainName ,   function ( err ,   res ,   body )
  {
    // Load the HTML body into Cheerio for DOM manipulation.
    $   =   cheerio . load ( body ) ;

    // Initialize an empty list to store discovered subdomains.
    var   list   =   [ ] ;

    // Iterate over each anchor tag ('a') found in the HTML.
    $ ( 'a' ) . each ( function ( i ,   el )
    {
      // Extract the 'href' attribute from the current element.
      var   link   =   el . attribs . href ;

      // Skip if the link is null or undefined.
      if   ( ! link )
      {
        return ;
      }

      // Parse the URL to get the host.
      var   host   =   url . parse ( link ) . host ;

      // Check if host exists, ends with the target domain, and is not already in the list.
      if   ( host   &&   host . endsWith ( '.'   +   domainName )   &&   list . indexOf ( host )   ===   -1 )
      {
        // Add the unique host to our list.
        list . push ( host ) ;

        // Emit a 'subdomain' event with the newly found host.
        EE . emit ( 'subdomain' ,   host ) ;
      }
    } ) ;


    // Ensure the list contains only unique subdomains.
    // This step might be redundant if the `indexOf` check is robust, but good for certainty.
    list   =   _ . uniq ( list ) ;

    // Emit an 'end' event, signaling completion and providing the final list of subdomains.
    EE . emit ( 'end' ,   list ) ;
  } ) ;

  // Return the EventEmitter instance immediately, allowing callers to subscribe to events.
  return   EE ;
} ;