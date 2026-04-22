// This file orchestrates the loading of the Google Analytics tracking library.
// It initializes a global command queue and then asynchronously loads the analytics script.

// --- Part 1: Initialize the analytics command queue and push initial commands ---

// Define a unique global variable to hold analytics commands.
// If it already exists (e.g., from a previous script), use it; otherwise, create an empty array.
// We're using a slightly different global name for Type III variation.
var globalAnalyticsDataStack = window.globalAnalyticsDataStack || [];

// Assign a local alias for convenience to the global queue.
// This is an added intermediate step (Type III).
const trackingInstructionQueue = globalAnalyticsDataStack;

// Define the Google Analytics account identifier.
const analyticsAccountID = 'UA-19326313-14';

// Prepare the command for setting the account ID.
// This is an intermediate variable (Type III).
const setAccountCommand = ['_setAccount', analyticsAccountID];

// Prepare the command for tracking a page view.
// This is an intermediate variable (Type III).
const trackPageviewCommand = ['_trackPageview'];

// Add the prepared commands to the tracking queue.
trackingInstructionQueue.push(setAccountCommand);
trackingInstructionQueue.push(trackPageviewCommand);

// --- Part 2: Asynchronously load the Google Analytics script ---

// Execute an anonymous function immediately to encapsulate variables and avoid global pollution.
// The document object is passed as an argument for clarity and potential flexibility (Type III).
((hostDocument) => {
  // Define string constants for script attributes to improve readability and maintainability (Type III).
  const scriptTagIdentifier = 'script';
  const scriptMimeAttribute = 'text/javascript';
  const scriptLoadAsynchronously = true; // Use boolean instead of string 'true' for attribute (Type III).
  const scriptSourceURL = 'https://ssl.google-analytics.com/ga.js';

  // Create a new HTML script element.
  let dynamicScriptElement = hostDocument.createElement(scriptTagIdentifier);

  // Set the type attribute for the script.
  dynamicScriptElement.type = scriptMimeAttribute;

  // Set the asynchronous loading attribute.
  // Using setAttribute for variation (Type III).
  if (scriptLoadAsynchronously) {
    dynamicScriptElement.setAttribute('async', '');
  }

  // Assign the source URL for the analytics script.
  dynamicScriptElement.src = scriptSourceURL;

  // Find the first existing script element in the document.
  // This serves as a reference point for insertion.
  let referenceScriptNode = hostDocument.getElementsByTagName(scriptTagIdentifier)[0];

  // Determine the parent node for insertion.
  // This adds robustness by checking for the existence of referenceScriptNode (Type III guard clause).
  let targetParentNode;
  if (referenceScriptNode && referenceScriptNode.parentNode) {
    targetParentNode = referenceScriptNode.parentNode;
  } else if (hostDocument.head) { // Fallback to document head if no scripts or parent found.
    targetParentNode = hostDocument.head;
  } else if (hostDocument.body) { // Further fallback to document body.
    targetParentNode = hostDocument.body;
  }

  // Insert the newly created script element into the document.
  // This ensures the Google Analytics library is loaded.
  if (targetParentNode) {
    if (referenceScriptNode && referenceScriptNode.parentNode === targetParentNode) {
      // If we have a valid reference script and its parent, insert before it.
      targetParentNode.insertBefore(dynamicScriptElement, referenceScriptNode);
    } else {
      // Otherwise, append to the determined parent node (head or body).
      targetParentNode.appendChild(dynamicScriptElement);
    }
  } else {
    // console.warn("Could not find a suitable parent node to insert the analytics script.");
  }

})(document); // Pass the document object to the IIFE.