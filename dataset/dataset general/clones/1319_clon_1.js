function getURLParameterByName(  url,  name ) {
  /*
   * This function extracts the value of a URL parameter by its name.
   * It takes the full URL and the parameter name as input.
   * Special characters in the name are escaped for regex matching.
   * Returns the decoded parameter value or null if not found.
   */

  // Escape special characters in the parameter name for regex
  name  =  name.replace(  /[\[]/  ,  "\\\["  ).replace(  /[\]]/  ,  "\\\]"  )  ;

  // Construct the regex string to find the parameter
  var regexS  =  "[\\?&]"  +  name  +  "=([^&#]*)"  ;

  // Create a new regular expression object
  var regex   =  new RegExp(  regexS  )  ;

  // Execute the regex on the URL to find matches
  var results =  regex.exec(  url  )  ;


  // Check if any results were found
  if  (  results  ==  null  )
    return  null  ;
  else
    // Decode the URI component and replace plus signs with spaces
    return  decodeURIComponent(  results[1].replace(  /\+/g  ,  " "  )  )  ;
}




function addURLParam(  url  ,  key  ,  value  ) {
  // This utility function adds or updates a URL parameter.
  // It handles escaping of key and value, and correctly places
  // the parameter with '?' or '&' separator.

  // Escape the key and value to ensure they are URL-safe
  key   =  escape(  key  )  ;
  value =  escape(  value  )  ;


  // Define a regular expression to find existing parameters
  var re  =  new RegExp(  "([?|&])"  +  key  +  "=.*?(&|$)"  ,  "i"  )  ,
      // Determine the correct separator for the new parameter
      separator =  url.indexOf(  '?'  )  !==  -1  ?  "&"  :  "?"  ;

  // Check if the parameter already exists in the URL
  if  (  url.match(  re  )  )
    // If it exists, replace its value
    return  url.replace(  re  ,  '$1'  +  key  +  "="  +  value  +  '$2'  )  ;
  else
    // If it doesn't exist, append it to the URL
    return  url  +  separator  +  key  +  "="  +  value  ;
}




function getInnerMostText(  node  ) {
  // Recursively finds the innermost non-whitespace text content of a DOM node.
  // Useful for extracting visible text from complex HTML structures.

  if  (  node.nodeType  ==  3  ) { // Node is a Text node
    // Filter out text nodes that contain only whitespace characters
    if  (  !  /^\s*$/.test(  node.data  )  ) {
      return  node.data  ;
    }
  }
  else if  (  node.hasChildNodes()  ) { // Node has children
    // Iterate through all child nodes
    for  (  var i  =  0  ,  len  =  node.childNodes.length  ;  i  <  len  ;  ++i  ) {
      // Recursively call this function for each child
      var text  =  getInnerMostText(  node.childNodes[i]  )  ;
      // If valid text is found, return it immediately
      if  (  text  !=  null  )
        return  text  ;
    }
    // No valid text found in any child
    return  null  ;
  }
  else
    // Node has no children and is not a text node with content
    return  null  ;
}




function endsWith(  str  ,  suffix  ) {
  // Checks if a string ends with a specified suffix.
  // Returns true if it does, false otherwise.
  return  str.indexOf(  suffix  ,  str.length  -  suffix.length  )  !==  -1  ;
}




function replaceOpenGraphTags(  ) {
  // This function modifies 'a' tags that link to Facebook's uiserver.php.
  // It extracts a 'redirect_uri' parameter and uses it to update the link,
  // making it directly point to the target and open in a new tab.

  // Select all anchor tags whose href attribute contains "connect/uiserver.php"
  var links  =  document.querySelectorAll(  'a[href*="connect/uiserver.php"]'  )  ;


  // Loop through each found link
  for  (  var i  =  0  ;  i  <  links.length  ;  i++  ) {
    // Get the 'redirect_uri' parameter from the current link's href
    var redirectURI  =  getURLParameterByName(  links[i].getAttribute(  'href'  )  ,  "redirect_uri"  )  ;

    // If a redirect URI is found
    if  (  redirectURI  ) {
      // Update the link's href to the extracted redirect URI
      links[i].setAttribute(  'href'  ,  redirectURI  )  ;
      // Remove the 'rel' attribute, often used for noopener/noreferrer
      links[i].removeAttribute(  'rel'  )  ;
      // Set the target attribute to '_blank' to open in a new tab
      links[i].setAttribute(  'target'  ,  '_blank'  )  ;
    }
  }
}




function addStoryTitlesToFBAppURLs(  ) {
  // This function enhances Facebook app links by embedding their text content
  // (which often serves as a title) as a URL parameter. This helps in later
  // redirecting to a search based on this title if needed.

  var urlsToTitles  =  {}  ; // Object to store URLs mapped to their titles
  // Select all anchor tags whose href attribute contains "apps.facebook.com"
  var links         =  document.querySelectorAll(  'a[href*="apps.facebook.com"]'  )  ;

  // First pass: Collect titles for each unique URL
  for  (  var i  =  0  ;  i  <  links.length  ;  i++  ) {
    // Get the innermost text content of the link element
    var title  =  getInnerMostText(  links[i]  )  ;
    // If a title exists and is reasonably long
    if  (  title  &&  title.length  >  2  ) {
      // If the title ends with "...", truncate it
      if  (  endsWith(  title  ,  "..."  )  )
        title  =  title.substring(  0  ,  title.lastIndexOf(  "..."  )  )  ;
      // Store the title associated with its URL
      urlsToTitles[links[i].getAttribute(  'href'  )  ]  =  title  ;
    }
  }

  // Second pass: Update the href attributes with the collected titles
  for  (  var i  =  0  ;  i  <  links.length  ;  i++  ) {
    var url    =  links[i].getAttribute(  'href'  )  ;
    var title  =  urlsToTitles[url]  ;

    // If a title was found for this URL
    if  (  title  ) {
      // Add the title as a 'redirectTitle' parameter to the URL
      links[i].setAttribute(  'href'  ,  addURLParam(  url  ,  "redirectTitle"  ,  title  )  )  ;
      // Set the target attribute to '_blank' to open in a new tab
      links[i].setAttribute(  'target'  ,  '_blank'  )  ;
    }
  }
}




function checkForOpenGraphOAuth(  ) {
  // This function intercepts Facebook OAuth dialogs or uiserver pages.
  // It attempts to redirect directly to the 'redirect_uri' if certain conditions are met,
  // or performs a Google search using a 'redirectTitle' if available.
  // It also includes a basic loop detection mechanism using localStorage.

  var lastFBPageAccessedString  =  "lastFBPageAccessed"  ;

  // Check if the current URL is the same as the last accessed Facebook page
  var isLooping  =  localStorage.getItem(  lastFBPageAccessedString  )  ==  document.URL  ;
  // Store the current URL as the last accessed Facebook page
  localStorage.setItem(  lastFBPageAccessedString  ,  document.URL  )  ;

  // Check if the current URL is a Facebook OAuth or uiserver dialog
  if  (  document.URL.indexOf(  "dialog/oauth"  )  !==  -1  ||  document.URL.indexOf(  "connect/uiserver"  )  !==  -1  ) {
    // Extract parameters from the current URL
    var redirectURI   =  getURLParameterByName(  document.URL  ,  "redirect_uri"  )  ;
    // Extract 'redirectTitle' from the redirectURI itself
    var redirectTitle =  getURLParameterByName(  redirectURI  ,  "redirectTitle"  )  ;
    var scope         =  getURLParameterByName(  document.URL  ,  "scope"  )  ;

    // Check conditions for redirection:
    // 1. redirectURI exists AND scope includes "publish_actions"
    // OR
    // 2. redirectTitle exists
    if  (  (  redirectURI  &&  scope  &&  scope.indexOf(  "publish_actions"  )  !==  -1  )  ||  redirectTitle  ) {
      // If redirectURI is not a Facebook app URL AND not in a loop
      if  (  redirectURI.indexOf(  "apps.facebook.com"  )  ===  -1  &&  (  !  isLooping  )  )
        // Redirect to the parsed URI
        window.location  =  redirectURI  ;
      else if  (  redirectTitle  )
        // If a redirectTitle exists, perform a Google "I'm Feeling Lucky" search
        window.location  =  "https://www.google.com/search?btnI&q="  +  unescape(  redirectTitle  )  ;
    }
  }
}


// --- Execute initial checks and set up event listeners ---

// Perform the Open Graph OAuth check immediately upon script load
checkForOpenGraphOAuth(  )  ;

// Wait for the DOM content to be fully loaded before running initial modifications
document.addEventListener(  'DOMContentLoaded'  ,  function  (  evt  ) {
  // Initial run of the link modification functions
  replaceOpenGraphTags(  )  ;
  addStoryTitlesToFBAppURLs(  )  ;

  // Set up event listeners for DOM changes to re-run the modification functions
  // This ensures dynamic content or content loaded after initial DOMContentLoaded is also processed.
  document.addEventListener(  'DOMSubtreeModified'  ,  replaceOpenGraphTags  ,  false  )  ;
  document.addEventListener(  'DOMSubtreeModified'  ,  addStoryTitlesToFBAppURLs  ,  false  )  ;

}  ,  false  )  ;