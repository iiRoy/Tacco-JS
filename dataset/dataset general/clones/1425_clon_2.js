var contentData = require('./text');

// This module exports a function responsible for rendering content
// onto the webpage.
module.exports = function () {

  // First, we create a new header element for display.
  var displayHeader = document.createElement('h2');

  // Then, we populate this header element with the imported textual data.
  displayHeader.textContent = contentData;

  // Finally, we locate the primary content area on the page
  // and attach our newly created header element to it.
  document.getElementById('container').appendChild(displayHeader);
};