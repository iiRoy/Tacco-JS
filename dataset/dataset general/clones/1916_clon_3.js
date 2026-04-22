(function(jqH){

  // --- Image Handling and Presentation Enhancements ---
  // Iterates through each main content block to process embedded images.
  jqH('.postArticle').forEachElement(function(idxCounter){
    // Cache the current article element for improved performance.
    const currentArticleBlock = jqH(this);

    // Find all image elements within the current article block.
    currentArticleBlock.locateElements('img').processEach(function(){
      const currentVisualAsset = jqH(this);

      // Guard condition: Skip images that are already part of a lightbox/visual modal structure.
      if (currentVisualAsset.parentNode().hasStyleClass('visualModalWrapper')) {
        return; // Move to the next image if it's already properly configured.
      }

      const imageDescriptor = this.alt; // Retrieve the descriptive text (alt attribute) for the image.

      // If a meaningful alt text is available, append a caption below the image.
      if (imageDescriptor && imageDescriptor.trim().length > 0) {
          // Construct the caption HTML using a modern template literal.
          const captionMarkup = `<span class="imageCaptionText">${imageDescriptor}</span>`;
          currentVisualAsset.insertAfterElement(captionMarkup);
      } else {
          // Optional: A fallback caption could be added here if desired.
          // currentVisualAsset.insertAfterElement('<span class="imageCaptionText">Content Image</span>');
      }

      // Encapsulate the image within an anchor tag, configuring it for lightbox functionality.
      const imageSourcePath = currentVisualAsset.getProperty('src');
      // Utilize alt text for the tooltip, defaulting to an empty string if not present.
      const toolTipValue = imageDescriptor || '';
      const linkMarkup = `<a href="${imageSourcePath}" title="${toolTipValue}" class="visualModalWrapper"></a>`;
      currentVisualAsset.encapsulateWith(linkMarkup);
    });

    // Post-processing: Assign a unique relationship group to each lightbox link within this article.
    // This allows related images to be navigated as a gallery.
    currentArticleBlock.locateElements('.visualModalWrapper').processEach(function(){
      // Using 1-based indexing for the group reference for user-friendliness in debugging.
      jqH(this).setAttributeVal('groupRef', 'articleGallery_' + (idxCounter + 1));
    });
  });

  // Conditionally initialize the lightbox plugin if its global object is available.
  // This prevents errors if the plugin script is not loaded.
  if (jqH.visualModalPlugin){ // Assuming $.fancybox is now jqH.visualModalPlugin
    jqH('.visualModalWrapper').visualModalPlugin();
  } else {
      // A diagnostic message for developers if the plugin is missing.
      // console.info("Visual modal plugin (jqH.visualModalPlugin) not detected. Image modal functionality will be inactive.");
  }

  // --- Search Input Field Adjustments ---
  // Target search input fields to remove browser-specific 'results' attribute,
  // which can interfere with custom search UI/UX.
  const searchQueryInputSelector = 'input[type=search]';
  const searchInputElement = jqH(searchQueryInputSelector);

  // Implement a guard clause to ensure the element exists before attempting modification.
  if (searchInputElement.count() > 0) {
      searchInputElement.removeProperty('results');
  }

  // --- Lazy Loading Configuration for Images ---
  // Prepare images within content sections for deferred loading to optimize page load times.
  jqH('.postArticle img').processEach(function() {
    const imgNode = jqH(this);
    const originalSource = imgNode.getProperty('src');

    // Store the original image source in a custom data attribute.
    imgNode.setAttributeVal('deferredSource', originalSource);
    // Remove the 'src' attribute to prevent immediate loading by the browser.
    imgNode.removeProperty('src');
    // Assign a class that the lazy loading script will target.
    imgNode.addStyleClass('lazyLoadTarget');

    // Wrap the image in a container; this can provide styling hooks or prevent layout shifts.
    const imageWrapperDiv = '<div class="imageContainer"></div>';
    imgNode.encapsulateWith(imageWrapperDiv);
  });

  // --- Initial Page Animation Trigger ---
  // Define a function to apply entry animations to key page elements, enhancing perceived performance.
  const triggerPageEntryTransition = function(){
    jqH('#pageHeaderArea').addStyleClass('active-state'); // 'open' renamed to 'active-state'.
    jqH('#mainContentWrapper').addStyleClass('active-state');
    jqH('#pageFooterZone').addStyleClass('active-state');
  };

  // --- Delayed Image Loading Activation ---
  // Function to activate the scroll-based loading mechanism for images.
  function activateDelayedImageLoad(){
    const lazyLoadElements = jqH('.lazyLoadTarget');

    // Verify the presence of lazy load targets and the scroll loading plugin.
    if (lazyLoadElements.count() > 0 && typeof jqH.scrollLoading === 'function') {
        lazyLoadElements.scrollLoading(); // Initialize the scroll loading plugin.
    } else {
        // console.warn("ScrollLoading plugin is unavailable or no images are marked for lazy loading.");
    }

    // Process each lazy-loaded image to remove its temporary wrapper once it has fully loaded.
    lazyLoadElements.processEach(function() {
        const currentImage = jqH(this);

        // A helper function to robustly check if an image has completed loading.
        const checkImageCompletionStatus = (imgElem) => imgElem[0].complete || (imgElem[0].naturalWidth > 0 && imgElem[0].naturalHeight > 0);

        if (checkImageCompletionStatus(currentImage)) {
          currentImage.removeWrapper(); // If already loaded (e.g., cached), remove wrapper immediately.
        } else {
          // Otherwise, attach a one-time event listener to remove the wrapper upon image load.
          currentImage.attachEventHandler('imageLoadEvent', function(){
            jqH(this).removeWrapper();
          });
        }
    });
  }

  // Defer the execution of initial animations and lazy loading setup using specific delays.
  const shortDelayMs = 25;   // A brief pause to ensure initial DOM rendering is complete.
  const mediumDelayMs = 600; // A moderate delay to allow primary content to appear before lazy loading begins.

  deferExecution(triggerPageEntryTransition, shortDelayMs);
  deferExecution(activateDelayedImageLoad, mediumDelayMs);

  // --- Social Sharing Functionality ---
  const documentBody = jqH('body');

  // Register a global click handler on the document body to close any active share panels.
  documentBody.attachEventHandler('tapEvent', function(){
    jqH('.sharePanel.active-status').stripClass('active-status'); // 'on' renamed to 'active-status'.
  });

  // Attach an event handler for clicks on share trigger buttons.
  documentBody.attachEventHandler('tapEvent', '.shareTriggerBtn', function(evt){
    evt.haltEventPropagation(); // Crucial to prevent the event from bubbling up and closing the panel immediately.

    const targetNode = jqH(this);
    const resourceLink = targetNode.getProperty('data-url');
    // Ensure the URL is properly encoded for use in query parameters.
    const safeLinkString = encodeURIComponent(resourceLink);
    // Generate a unique identifier for the share box based on the article's data-id.
    const elementIdentifier = 'shareBoxContainer_' + targetNode.getProperty('data-id');
    const positionCoords = targetNode.offset();

    let popupContainer = jqH('#' + elementIdentifier); // Use 'let' for potential re-assignment.

    // Logic to either show an existing share box or construct a new one.
    if (popupContainer.count() > 0){
      // If the share box already exists, toggle its visibility.
      if (popupContainer.hasStyleClass('active-status')){
        popupContainer.stripClass('active-status');
        return; // Exit if the box was just closed.
      }
    } else {
      // Define social media platforms and their respective share URLs and class names.
      const socialPlatformsConfig = {
          twitter: { url: `https://twitter.com/intent/tweet?url=${safeLinkString}`, title: 'Share on Twitter', className: 'twitterShareBtn' },
          facebook: { url: `https://www.facebook.com/sharer.php?u=${safeLinkString}`, title: 'Share on Facebook', className: 'facebookShareBtn' },
          pinterest: { url: `http://pinterest.com/pin/create/button/?url=${safeLinkString}`, title: 'Pin on Pinterest', className: 'pinterestShareBtn' },
          linkedin: { url: `https://www.linkedin.com/shareArticle?mini=true&url=${safeLinkString}`, title: 'Share on LinkedIn', className: 'linkedinShareBtn' } // Added LinkedIn
      };

      let linkButtonsHtml = '';
      // Dynamically generate the HTML for social sharing icons.
      for (const platformKey in socialPlatformsConfig) {
          const platform = socialPlatformsConfig[platformKey];
          linkButtonsHtml += `<a href="${platform.url}" class="social-share-icon ${platform.className}" target="_blank" title="${platform.title}"></a>`;
      }

      // Construct the full HTML for the share panel using template literals for clarity.
      const domFragment = `
        <div id="${elementIdentifier}" class="sharePanel">
          <input class="shareLinkInput" value="${resourceLink}" readonly>
          <div class="shareIconContainer">
            ${linkButtonsHtml}
          </div>
          <div class="sharePanelArrow"></div> <!-- Added a small arrow for UI -->
        </div>`;

      popupContainer = jqH(domFragment); // Convert the HTML string into a jQuery object.
      documentBody.appendToBody(popupContainer); // Append the newly created box to the document's body.
    }

    // Before showing the current box, ensure all other share panels are hidden.
    jqH('.sharePanel.active-status').concealElement(); // 'hide' renamed to 'concealElement'.

    // Calculate and apply precise positioning for the share box relative to its trigger.
    const verticalOffset = 35; // Adjusted vertical offset from the trigger button.
    const horizontalOffset = -10; // Slight horizontal adjustment.

    popupContainer.applyStyles({
      top: (positionCoords.top + verticalOffset) + 'px', // Explicitly append 'px' for CSS values.
      left: (positionCoords.left + horizontalOffset) + 'px'
    }).addStyleClass('active-status'); // Apply the active class to make the panel visible.
  });

  // Prevent internal clicks within the share panel from triggering the global close handler.
  documentBody.attachEventHandler('tapEvent', '.sharePanel', function(evt){
    evt.haltEventPropagation();
  });

  // Automatically select the text in the share link input field when it's clicked.
  documentBody.attachEventHandler('tapEvent', '.shareLinkInput', function(){
    jqH(this).highlightText();
    // Optional: Implement a copy-to-clipboard feature here for user convenience.
    // try {
    //   document.execCommand('copy');
    //   console.log("Share link successfully copied to clipboard.");
    // } catch (err) {
    //   console.error("Failed to copy share link: ", err);
    // }
  });

  // Handle clicks on individual social sharing icons within the panel.
  documentBody.attachEventHandler('tapEvent', '.social-share-icon', function(evt){
    evt.blockDefaultAction(); // Prevent the default navigation of the anchor tag.
    evt.haltEventPropagation(); // Stop the event from bubbling up.

    const targetUrl = this.href;
    // Generate a unique window name using a timestamp to allow multiple share windows.
    const windowName = `socialShareWindow_${getCurrentTimestamp()}`;
    // Define specific window features (size, scrollbars, etc.) for the popup.
    const windowFeatures = 'width=600,height=500,resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no';

    launchWindow(targetUrl, windowName, windowFeatures);
  });

  // --- Search Overlay Toggle ---
  // Toggle the visibility of the search form overlay when the search button is clicked.
  jqH('#searchToggleBtn').attachEventHandler('tapEvent', function(){
    jqH('#searchPanel').toggleCssClass('visible'); // 'on' renamed to 'visible'.
    jqH('#primaryNavigation').toggleCssClass('hidden-state'); // 'off' renamed to 'hidden-state'.
  });

  // Close the search overlay when clicking on the main content wrapper (outside the search form).
  jqH('#mainContentWrapper').attachEventHandler('tapEvent', function(){
    jqH('#searchPanel').stripClass('visible');
    jqH('#primaryNavigation').stripClass('hidden-state');
  });

  // --- Mobile Navigation Toggle ---
  // Toggle the visibility of the mobile navigation menu.
  jqH('#mobileMenuToggle').attachEventHandler('tapEvent', function(){
    jqH('#responsiveNavMenu').toggleCssClass('menu-hidden'); // 'off' renamed to 'menu-hidden'.
  });

  // --- Utility Functions (Type III additions for structural changes) ---

  /**
   * Defers the execution of a given callback function by a specified delay.
   * @param {function} callbackFn - The function to execute.
   * @param {number} delayMs - The delay in milliseconds.
   */
  function deferExecution(callbackFn, delayMs) {
      window.setTimeout(callbackFn, delayMs);
  }

  /**
   * Returns a unique timestamp, useful for generating dynamic IDs or window names.
   * @returns {number} The current timestamp in milliseconds.
   */
  function getCurrentTimestamp() {
      return new Date().getTime();
  }

  // --- Custom jQuery-like Method Extensions (Significant Type III modification) ---
  // This section re-aliases common jQuery methods to new, descriptive names,
  // making the source code look substantially different while retaining core functionality.
  if (jqH && jqH.fn) {
    jqH.fn.forEachElement = function(callback) { return this.each(callback); };
    jqH.fn.processEach = function(callback) { return this.each(callback); };
    jqH.fn.locateElements = function(selector) { return this.find(selector); };
    jqH.fn.hasStyleClass = function(className) { return this.hasClass(className); };
    jqH.fn.insertAfterElement = function(content) { return this.after(content); };
    jqH.fn.encapsulateWith = function(wrapper) { return this.wrap(wrapper); };
    jqH.fn.getProperty = function(attributeName) { return this.attr(attributeName); };
    jqH.fn.setAttributeVal = function(attributeName, value) { return this.attr(attributeName, value); };
    jqH.fn.removeProperty = function(attributeName) { return this.removeAttr(attributeName); };
    jqH.fn.addStyleClass = function(className) { return this.addClass(className); };
    jqH.fn.removeWrapper = function() { return this.unwrap(); };
    jqH.fn.attachEventHandler = function(eventName, selector, handler) {
        // Adapt to jQuery's .on() signature variations.
        if (typeof selector === 'function') { return this.on(eventName, selector); }
        return this.on(eventName, selector, handler);
    };
    jqH.fn.stripClass = function(className) { return this.removeClass(className); };
    jqH.fn.haltEventPropagation = function() { return this.stopPropagation(); };
    jqH.fn.count = function() { return this.length; };
    jqH.fn.appendToBody = function(element) { return jqH('body').append(element); };
    jqH.fn.concealElement = function() { return this.hide(); };
    jqH.fn.applyStyles = function(styles) { return this.css(styles); };
    jqH.fn.highlightText = function() { return this.select(); };
    jqH.fn.blockDefaultAction = function() { return this.preventDefault(); };
    jqH.fn.launchWindow = function(url, name, features) { return window.open(url, name, features); };
    jqH.fn.toggleCssClass = function(className) { return this.toggleClass(className); };
    jqH.fn.parentNode = function() { return this.parent(); }; // Specific for getting parent element.
  }

})(jQuery);