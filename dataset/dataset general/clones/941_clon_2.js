/*
 * This module works with CSS to provide a workaround for 'object-fit: contain'
 * and 'vh' unit compatibility issues in older browsers.
 */

// Establish a feature detection mechanism to check image scaling capabilities
var FeatureDetector = FeatureDetector || {};
FeatureDetector.registerTest('image-scale-percent-height', function () {
  // Grab references to the document's root and body elements
  let docRoot = document.querySelector('html');
  let docBody = document.body;

  // Store initial style values to restore them later, ensuring no side effects
  const initialRootHeight = docRoot.style.height;
  const initialBodyHeight = docBody.style.height;

  // Temporarily set the document and body heights to full viewport for testing
  docRoot.style.height = '100%';
  docBody.style.height = '100%';

  // Create a dummy image element for the test
  let testPicture = document.createElement('img');
  // Use a tiny transparent GIF as the source to avoid network requests
  testPicture.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; /* 1x1 transparent pixel */
  testPicture.style.height = '100%';

  // Append the test image to the document body
  docBody.appendChild(testPicture);

  // Determine if the computed height of the image matches the viewport height
  // This indicates if percentage height scaling is working as expected
  const testOutcome = (parseInt(window.getComputedStyle(testPicture).height) === window.innerHeight);

  // Clean up: remove the test image from the DOM
  docBody.removeChild(testPicture);

  // Restore original styles
  docRoot.style.height = initialRootHeight;
  docBody.style.height = initialBodyHeight;

  // Return the result of the feature detection
  return testOutcome;
});


(function () {
  /*
   * This self-executing function manages dynamic image resizing
   * based on viewport dimensions.
   */

  const adjustImageDimensions = function () {
    /*
     * Iterates through designated visual panels containing images
     * and applies a 'portrait-layout' class if the image's aspect
     * ratio is less than the viewport's constrained ratio.
     */
    let visualPanels = document.querySelectorAll('.visual-panel');
    let totalPanels = visualPanels.length;

    for (let currentIdx = 0; currentIdx < totalPanels; ++currentIdx) {
      const currentPanel = visualPanels[currentIdx];
      let currentImage = currentPanel.querySelector('img');

      // Calculate the image's intrinsic aspect ratio from data attributes
      const imageAspectRatio = parseInt(currentImage.dataset.width, 10) / parseInt(currentImage.dataset.height, 10);

      // Determine the constraining aspect ratio of the viewport, with a slight vertical offset
      const viewportAspectRatioLimit = window.innerWidth / (window.innerHeight * 0.92);

      // Compare ratios to decide if the 'portrait-layout' class should be applied
      if (imageAspectRatio < viewportAspectRatioLimit) {
        currentPanel.classList.add('portrait-layout');
      } else {
        currentPanel.classList.remove('portrait-layout');
      }
    }
  };

  // Execute the sizing function once on page load
  adjustImageDimensions();

  // Attach event listeners to re-run the sizing logic on viewport changes
  window.addEventListener('resize', adjustImageDimensions, {
    passive: true
  });
  window.addEventListener('orientationchange', adjustImageDimensions, {
    passive: true
  });

})();