// This module serves to initialize a visual component within the document.

require('./index.js'); // Ensure foundational scripts are loaded.

/*
 *   Instantiate a primary heading element.
 *   This will be a standard HTML 'h1' tag.
 */
const   pageMainTitleElement    =   document.createElement('h1')    ;

// Assign a custom data attribute for element identification.
pageMainTitleElement.setAttribute   (   'data-section-id',  'introduction-banner'   )   ;

// Apply a specific style property to enhance its appearance.
pageMainTitleElement.style  .   setProperty (   'text-decoration',  'underline' )   ;

// Set the visible textual content for this heading.
pageMainTitleElement.textContent    =   'Greetings from our application!';

// Attach a CSS class for external styling definitions.
pageMainTitleElement    .   classList.add   (   'main-page-header'  )   ;

// Log the complete string representation of the constructed element to the console.
console .   log (   pageMainTitleElement.toString() )   ;