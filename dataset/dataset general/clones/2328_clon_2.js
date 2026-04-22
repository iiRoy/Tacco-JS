/*
 * This script manages asynchronous page loading and navigation
 * to provide a smoother user experience without full page reloads.
 */
document. addEventListener(   'DOMContentLoaded',  function(  )  {
  // Initialize link handlers once the DOM is fully loaded.
  updateNavigationHandlers(  ) ;
}  ) ;

function updateNavigationHandlers(  )  {
  // Select all anchor elements on the page.
  var hyperlinks =   document.querySelectorAll(  'a'  )  ;

  for  (   let idx = 0;   idx  <  hyperlinks.length;   idx++  )  {
    let currentLink = hyperlinks[idx] ;
    // Attach a click listener to each link to intercept navigation.
    currentLink.addEventListener("click"  , handlePageTransition  ,  false  ) ;
  }
}

function handlePageTransition(  domEvent  )  {
  // Prevent the default browser navigation behavior.
  domEvent.preventDefault(  ) ;
  var targetUrl  =   this.href ; // Get the target URL from the clicked link.

  // Create a new XMLHttpRequest object for fetching content.
  var xhrRequest =   new XMLHttpRequest(  ) ;
  xhrRequest.open(  "GET"  ,  targetUrl  ,  true  ) ; // Configure the request.
  xhrRequest.send(  ) ; // Send the asynchronous request.

  // Define the callback for when the request's state changes.
  xhrRequest.onreadystatechange =   function(  )  {
    // Check if the request is complete and successful (HTTP 200 OK).
    if  (   xhrRequest.readyState  ===  4   &&   xhrRequest.status  ===  200   )  {
      let mainContentElement =   document.querySelector(  'body'  )  ;
      // Extract only the body content from the received HTML.
      let newMainContent =   extractMainBodyHtml(  xhrRequest.responseText  ) ;

      // Initiate a transition: move the current body out of view.
      mainContentElement.addEventListener(  'webkitTransitionEnd'  ,  shiftContentRight  ,  false  ) ;
      mainContentElement.style.left =   "-100%" ; // Start the visual shift.
      // Set up a listener for browser history navigation (back/forward buttons).
      window.addEventListener(  "popstate"  ,  manageHistoryPop  ) ;

      // Function to handle the first stage of content transition (moving right).
      function shiftContentRight(  evtObj  )  {
        let mainContentElement =   document.querySelector(  'body'  ) ;
        mainContentElement.removeEventListener(  'webkitTransitionEnd'  ,  shiftContentRight  ,  false  ) ;
        // After moving right, prepare to fade out and shift again.
        mainContentElement.addEventListener(  'webkitTransitionEnd'  ,  restoreContentCenter  ,  false  ) ;
        mainContentElement.style.opacity =   0 ; // Make content transparent.
        mainContentElement.style.left =   "100%" ; // Shift off-screen to the right.
      }

      // Function to handle the second stage of content transition (restoring to center).
      function restoreContentCenter(  evtObj  )  {
        let mainContentElement =   document.querySelector(  'body'  ) ;
        mainContentElement.removeEventListener(  'webkitTransitionEnd'  ,  restoreContentCenter  ,  false  ) ;
        mainContentElement.innerHTML =   newMainContent ; // Replace content with the new page's body.
        // Update browser history with the new URL without reloading.
        history.pushState(  null  ,  null  ,  targetUrl  ) ;
        mainContentElement.style.opacity =   1 ; // Make content visible.
        mainContentElement.style.left =   0 ; // Bring content to the center.
        updateNavigationHandlers(  ) ; // Re-attach event listeners for new content.
      }

      // Function to handle browser history popstate event (back/forward button).
      function manageHistoryPop(  e  )  {
        // Create a new request to fetch the content for the historical state.
        var xhrHistoryRequest =   new XMLHttpRequest(  ) ;
        xhrHistoryRequest.open(  "GET"  ,  location.pathname  ,  true  ) ; // Fetch current path's content.
        xhrHistoryRequest.send(  ) ;

        xhrHistoryRequest.onreadystatechange =   function(  )  {
          let historyMainElement =   document.querySelector(  'body'  ) ;
          let historyMainContent =   extractMainBodyHtml(  xhrHistoryRequest.responseText  ) ;
          // Start transition for history navigation: move current content out.
          historyMainElement.addEventListener(  'webkitTransitionEnd'  ,  shiftContentLeft  ,  false  ) ;
          historyMainElement.style.left =   "100%" ; // Shift off-screen to the right.

          // Function to bring content back to center after history navigation.
          function recenterContentFromHistory(  evtObj  )  {
            let mainContentElement =   document.querySelector(  'body'  ) ;
            mainContentElement.removeEventListener(  'webkitTransitionEnd'  ,  recenterContentFromHistory  ,  false  ) ;
            mainContentElement.innerHTML =   historyMainContent ; // Replace with historical content.
            mainContentElement.style.opacity =   1 ; // Make visible.
            mainContentElement.style.left =   0 ; // Center it.
            updateNavigationHandlers(  ) ; // Re-attach event listeners.
          }

          // Function to shift content left during history navigation.
          function shiftContentLeft(  evtObj  )  {
            let mainContentElement =   document.querySelector(  'body'  ) ;
            mainContentElement.removeEventListener(  'webkitTransitionEnd'  ,  shiftContentLeft  ,  false  ) ;
            // After shifting left, prepare to recenter.
            mainContentElement.addEventListener(  'webkitTransitionEnd'  ,  recenterContentFromHistory  ,  false  ) ;
            mainContentElement.style.opacity =   0 ; // Make transparent.
            mainContentElement.style.left =   "-100%" ; // Shift off-screen to the left.
          }
        }
      }
    }
  }
}

// Utility function to extract the content within the <body> tags from a full HTML string.
function extractMainBodyHtml(  fullHtmlString  )  {
  let bodyTagStartIndex =   fullHtmlString.indexOf(  "<body"  ) ;
  let contentStartIndex =   fullHtmlString.indexOf(  ">"  ,  bodyTagStartIndex  )   +   1 ;
  let contentEndIndex =   fullHtmlString.indexOf(  "</body"  ,  contentStartIndex  ) ;
  return   fullHtmlString.slice(  contentStartIndex  ,  contentEndIndex  ) ;
}