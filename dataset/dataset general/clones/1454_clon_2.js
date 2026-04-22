let anchorNodes = document.getElementById('primaryNavigation').getElementsByTagName('a'); /* Obtain all anchor elements found within the main navigation area */

// Parse the current URL to isolate its significant path component.
// This regular expression captures the final path segment, disregarding any subsequent hash identifier.
let currentPageIdentifier = document.location.href.match(/([^\/]+)\/(#.+)?$/)[1];

/* Commence iteration over every collected navigation link */
for (let linkIndex = 0; linkIndex < anchorNodes.length; linkIndex++)
{
  // Attempt to extract a comparable segment from the current anchor's 'href' attribute.
  // The pattern seeks a sequence of non-slash characters immediately followed by a slash.
  let hrefMatcher = anchorNodes[linkIndex].href.match(/([^\/]+)\/$/);

  // Establish the identifying string for the target link.
  // If a segment was successfully extracted, use it; otherwise, default to an empty string.
  let targetLinkIdentifier = (hrefMatcher) ? hrefMatcher[1] : '';

  // Evaluate if the current page's identifier corresponds with the link's target identifier.
  if (currentPageIdentifier === targetLinkIdentifier)
  {
    // Upon successful match, assign a distinct class name to the parent of the active link.
    anchorNodes[linkIndex].parentNode.className = 'activeSelection';

    // Prepend a Unicode character (a right-pointing guillemet) before the matched link for visual emphasis.
    anchorNodes[linkIndex].parentNode.insertBefore(document.createTextNode("\u203a "), anchorNodes[linkIndex]);

    // Terminate the loop prematurely, as the relevant link has been identified and processed.
    break;
  }
}