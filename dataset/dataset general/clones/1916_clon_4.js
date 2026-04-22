(function() {
  // --- Helper functions to replicate jQuery behaviors ---

  // Replicates $(element).wrap(wrapperHtml)
  function encaseElement(outerMarkup, targetElement) {
    const parentNode = targetElement.parentNode;
    if (!parentNode) return;
    const temporaryContainer = document.createElement('div');
    temporaryContainer.innerHTML = outerMarkup;
    const wrapper = temporaryContainer.firstChild;
    if (!wrapper) return;

    parentNode.insertBefore(wrapper, targetElement);
    wrapper.appendChild(targetElement);
  }

  // Replicates $(element).unwrap()
  function removeContainer(targetElement) {
    const currentParent = targetElement.parentNode;
    if (currentParent && currentParent.parentNode) {
      currentParent.parentNode.replaceChild(targetElement, currentParent);
    }
  }

  // Replicates $(element).offset()
  function obtainOffset(targetElement) {
    const boundingBox = targetElement.getBoundingClientRect();
    return {
      top: boundingBox.top + window.scrollY,
      left: boundingBox.left + window.scrollX,
      width: boundingBox.width,
      height: boundingBox.height
    };
  }

  // Replicates $(element).hide()
  function concealElement(targetElement) {
    targetElement.style.display = 'none';
  }

  // Safely calls jQuery plugins if jQuery and the plugin are available.
  // This is crucial for "equivalent functionality" when the original code relies on external jQuery plugins.
  function invokeJQueryPlugin(selector, pluginName, ...args) {
    if (typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn[pluginName] === 'function') {
      window.jQuery(selector)[pluginName](...args);
    }
  }

  // --- Main application logic ---

  // Image caption and media overlay processing
  document.querySelectorAll('.article-entry').forEach((contentBlock, blockIndex) => {
    contentBlock.querySelectorAll('img').forEach(displayImage => {
      // Check if the image's parent is already a media overlay container
      if (displayImage.parentNode && displayImage.parentNode.classList.contains('fancybox')) {
        return;
      }

      const captionText = displayImage.alt;

      // Add caption if alt text exists
      if (captionText) {
        const descriptionSpan = document.createElement('span');
        descriptionSpan.classList.add('caption');
        descriptionSpan.textContent = captionText;
        displayImage.insertAdjacentElement('afterend', descriptionSpan);
      }

      // Wrap image in a media overlay link
      const imageSource = displayImage.getAttribute('src');
      const linkMarkup = `<a href="${imageSource}" title="${captionText}" class="fancybox"></a>`;
      encaseElement(linkMarkup, displayImage);
    });

    // Set media overlay group relation
    contentBlock.querySelectorAll('.fancybox').forEach(mediaLink => {
      mediaLink.setAttribute('rel', `media-group-${blockIndex}`);
    });
  });

  // Activate media overlays via the external plugin (e.g., Fancybox)
  invokeJQueryPlugin('.fancybox', 'fancybox');

  // Remove search input attribute for styling/behavior
  document.querySelectorAll('input[type="search"]').forEach(searchField => {
    searchField.removeAttribute('results');
  });

  // Prepare images for deferred loading
  document.querySelectorAll('.article-entry img').forEach(visualContent => {
    visualContent.setAttribute('data-url', visualContent.getAttribute('src'));
    visualContent.removeAttribute('src');
    visualContent.classList.add('scrollLoading');
    encaseElement('<div class="img-wrap"></div>', visualContent);
  });

  // --- Initial window animation effects ---
  function commenceViewAnimation() {
    const headerElement = document.getElementById('header');
    const mainContainer = document.querySelector('#wrap > .outer');
    const footerElement = document.getElementById('footer');

    if (headerElement) headerElement.classList.add('open');
    if (mainContainer) mainContainer.classList.add('open');
    if (footerElement) footerElement.classList.add('open');
  }

  // --- Activate deferred image loading ---
  function manageImageLazyLoad() {
    document.querySelectorAll('.scrollLoading').forEach(lazyImage => {
      // Initialize the external scroll loading plugin for each image
      invokeJQueryPlugin(lazyImage, 'scrollLoading');

      // Handle image completion or load event to unwrap
      if (lazyImage.complete) {
        removeContainer(lazyImage);
      } else {
        lazyImage.addEventListener('load', () => {
          removeContainer(lazyImage);
        });
      }
    });
  }

  // Schedule initial animations and lazy loading activation
  setTimeout(commenceViewAnimation, 1);
  setTimeout(manageImageLazyLoad, 500);

  // --- Share box functionality ---
  const pageBody = document.body;

  // Close any open share boxes when clicking anywhere on the body
  pageBody.addEventListener('click', () => {
    document.querySelectorAll('.article-share-box.on').forEach(activeBox => {
      activeBox.classList.remove('on');
    });
  });

  // Handle clicks on share links (delegated event)
  pageBody.addEventListener('click', (event) => {
    const clickTarget = event.target.closest('.article-share-link');
    if (!clickTarget) return;

    event.stopPropagation();

    const resourceAddress = clickTarget.dataset.url;
    const encodedResourceAddress = encodeURIComponent(resourceAddress);
    const uniqueKey = `share-container-${clickTarget.dataset.id}`;
    const positionData = obtainOffset(clickTarget);

    let popupContainer = document.getElementById(uniqueKey);

    if (popupContainer) {
      if (popupContainer.classList.contains('on')) {
        popupContainer.classList.remove('on');
        return;
      }
    } else {
      // Construct the share box HTML
      const markupString = `
        <div id="${uniqueKey}" class="article-share-box">
          <input class="article-share-input" value="${resourceAddress}" readonly>
          <div class="article-share-links">
            <a href="https://twitter.com/intent/tweet?url=${encodedResourceAddress}" class="article-share-twitter" target="_blank" title="Twitter"></a>
            <a href="https://www.facebook.com/sharer.php?u=${encodedResourceAddress}" class="article-share-facebook" target="_blank" title="Facebook"></a>
            <a href="http://pinterest.com/pin/create/button/?url=${encodedResourceAddress}" class="article-share-pinterest" target="_blank" title="Pinterest"></a>
            <a href="https://plus.google.com/share?url=${encodedResourceAddress}" class="article-share-google" target="_blank" title="Google+"></a>
          </div>
        </div>
      `;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = markupString.trim();
      popupContainer = tempDiv.firstChild;
      pageBody.appendChild(popupContainer);
    }

    // Hide any other active share boxes before showing the current one
    document.querySelectorAll('.article-share-box.on').forEach(otherBox => {
      if (otherBox !== popupContainer) {
        concealElement(otherBox);
        otherBox.classList.remove('on');
      }
    });

    // Position and display the current share box
    popupContainer.style.top = `${positionData.top + 25}px`;
    popupContainer.style.left = `${positionData.left}px`;
    popupContainer.style.display = ''; // Ensure it's visible
    popupContainer.classList.add('on');
  });

  // Prevent closing when clicking inside the share box itself (delegated event)
  pageBody.addEventListener('click', (event) => {
    if (event.target.closest('.article-share-box')) {
      event.stopPropagation();
    }
  });

  // Select input text when clicking the share input field (delegated event)
  pageBody.addEventListener('click', (event) => {
    const inputField = event.target.closest('.article-share-box-input');
    if (inputField && inputField.tagName === 'INPUT') {
      inputField.select();
    }
  });

  // Open share links in a new window (delegated event)
  pageBody.addEventListener('click', (event) => {
    const shareLink = event.target.closest('.article-share-box-link');
    if (!shareLink) return;

    event.preventDefault();
    event.stopPropagation();

    window.open(shareLink.href, `share-window-${Date.now()}`, 'width=500,height=450');
  });

  // --- Search box toggling ---
  const searchToggleButton = document.getElementById('nav-search-btn');
  const searchFormWrapper = document.getElementById('search-form-wrap');
  const mainNavigation = document.getElementById('main-nav');

  if (searchToggleButton && searchFormWrapper && mainNavigation) {
    searchToggleButton.addEventListener('click', () => {
      searchFormWrapper.classList.toggle('on');
      mainNavigation.classList.toggle('off');
    });
  }

  // Close search box when clicking outside
  const outerWrapper = document.querySelector('#wrap > .outer');
  if (outerWrapper && searchFormWrapper && mainNavigation) {
    outerWrapper.addEventListener('click', () => {
      searchFormWrapper.classList.remove('on');
      mainNavigation.classList.remove('off');
    });
  }

  // --- Mobile navigation toggling ---
  const mobileNavToggleButton = document.getElementById('main-nav-toggle');
  const mobileNavigation = document.getElementById('mobile-nav');

  if (mobileNavToggleButton && mobileNavigation) {
    mobileNavToggleButton.addEventListener('click', () => {
      mobileNavigation.classList.toggle('off');
    });
  }

})();