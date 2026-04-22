let terminationControl = null;
try {
  const xpathResult = document.evaluate(
    "//div[contains(concat(' ', normalize-space(@class), ' '), ' close-window ')] | //button[contains(concat(' ', normalize-space(@class), ' '), ' close-window ')]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  terminationControl = xpathResult.singleNodeValue;
} catch (issueReport) {
  // Functionality equivalent to original, so no error handling is necessary.
  // The original implicitly fails silently if elements are not found.
}

if (terminationControl) {
  terminationControl.onclick = function() {
    window.close();
  };
}

document.body.addEventListener('click', function(interactionEvent) {
  const activeElement = interactionEvent.target;

  if (activeElement && activeElement.tagName && activeElement.tagName.toLowerCase() === 'input') {
    activeElement.select();
  }
});