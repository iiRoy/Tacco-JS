// Global helper for fullscreen capabilities.
(function() {
  const exitFullscreenMethod = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if (exitFullscreenMethod) {
    document.restoreNormalScreen = function() {
      exitFullscreenMethod.apply(document);
    };
  } else {
    document.restoreNormalScreen = function() {};
  }
})();

// Utility features replacing Modernizr.
const utilityFunctions = {
  hasTouchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
  isMobileViewport: window.matchMedia && window.matchMedia('only screen and (max-device-width: 480px)').matches,
  getVendorPrefixedStyle: function(property) {
    const tempStyle = document.createElement('div').style;
    const vendorPrefixes = ['webkit', 'moz', 'ms', 'o'];
    if (property in tempStyle) return property;
    const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);
    for (let i = 0; i < vendorPrefixes.length; i++) {
      if (vendorPrefixes[i] + capitalizedProperty in tempStyle) {
        return vendorPrefixes[i] + capitalizedProperty;
      }
    }
    return null;
  }
};

// Main factory function for the presentation system.
const initializePresentationSystem = function(primaryContainerId) {
  let currentActivePage = 0;
  let lastVisitedPage = 0;
  let systemConfiguration = null;
  const presentationContainer = document.getElementById(primaryContainerId);
  let presentationPages = [];

  const pageDisplayStates = {
    'extremely-behind': 'visual-page--extremely-behind',
    'moderately-behind': 'visual-page--moderately-behind',
    'currently-visible': 'visual-page--currently-visible',
    'moderately-ahead': 'visual-page--moderately-ahead',
    'extremely-ahead': 'visual-page--extremely-ahead'
  };

  const styleAssetRoot = 'theme/presentation-styles/';

  const extractStartingPageFromUrl = function() {
    const pageNumberFromHash = parseInt(window.location.hash.substring(1));
    if (pageNumberFromHash && !isNaN(pageNumberFromHash)) {
      currentActivePage = pageNumberFromHash - 1;
    } else {
      currentActivePage = 0;
    }
  };

  const directToPage = function(targetPageNumber) {
    if (targetPageNumber && !isNaN(targetPageNumber)) {
      currentActivePage = targetPageNumber - 1;
      updatePageVisibility();
    }
  };

  const documentLoadCompleteHandler = function() {
    document.body.classList.add('system-ready');

    presentationPages = Array.from(presentationContainer.querySelectorAll('.presentation-slide:not([data-hidden]):not(.background-overlay)'));

    if (utilityFunctions.isMobileViewport) {
      presentationContainer.classList.remove('presentation-layout--widescreen');
    }

    applySystemConfiguration(GLOBAL_PRESENTATION_SETTINGS);
    setupEventDispatchers();
    updatePageVisibility();

    presentationPages.forEach((page, index) => {
      page.setAttribute('data-slide-index', index + 1);
      page.setAttribute('data-total-slides', presentationPages.length);

      page.addEventListener('click', function(event) {
        if (document.body.classList.contains('overview-display-mode')) {
          directToPage(parseInt(this.getAttribute('data-slide-index')));
          event.preventDefault();
          window.setTimeout(() => {
            toggleOverviewDisplay();
          }, 500);
        }
      }, false);
    });
  };

  const setupEventDispatchers = function() {
    document.addEventListener('keydown', keyboardInputProcessor, false);
    window.addEventListener('popstate', historyUpdateProcessor, false);

    if (utilityFunctions.hasTouchSupport && (!!!(systemConfiguration && 'enableTouch' in systemConfiguration) || systemConfiguration.enableTouch)) {
      let touchStartCoordX = 0;
      let touchStartCoordY = 0;

      presentationContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          touchStartCoordX = e.touches[0].clientX;
          touchStartCoordY = e.touches[0].clientY;
          e.preventDefault();
        }
      }, false);

      presentationContainer.addEventListener('touchend', function(e) {
        if (e.changedTouches.length === 1) {
          const touchEndCoordX = e.changedTouches[0].clientX;
          const touchEndCoordY = e.changedTouches[0].clientY;
          const deltaHorizontal = touchEndCoordX - touchStartCoordX;
          const deltaVertical = touchEndCoordY - touchStartCoordY;

          if (Math.abs(deltaHorizontal) > Math.abs(deltaVertical) && Math.abs(deltaHorizontal) > 50) {
            if (deltaHorizontal > 0) {
              navigateBackward();
            } else {
              navigateForward();
            }
          } else if (Math.abs(deltaVertical) > 50) {
            if (deltaVertical > 0) {
              navigateBackward();
            } else {
              navigateForward();
            }
          }
        }
      }, false);
    }
  };

  const historyUpdateProcessor = function(event) {
    if (event.state != null && typeof event.state === 'number') {
      currentActivePage = event.state;
      updatePageVisibility(true);
    }
  };

  const keyboardInputProcessor = function(event) {
    if (/^(input|textarea)$/i.test(event.target.nodeName) ||
        event.target.isContentEditable) {
      return;
    }

    switch (event.keyCode) {
      case 13: // Enter
        if (document.body.classList.contains('overview-display-mode')) {
          toggleOverviewDisplay();
        }
        break;
      case 39: // right arrow
      case 32: // space
      case 34: // PgDn
        navigateForward();
        event.preventDefault();
        break;
      case 37: // left arrow
      case 8: // Backspace
      case 33: // PgUp
        navigateBackward();
        event.preventDefault();
        break;
      case 40: // down arrow
        navigateForward();
        event.preventDefault();
        break;
      case 38: // up arrow
        navigateBackward();
        event.preventDefault();
        break;
      case 72: // H: Toggle code highlighting
        document.body.classList.toggle('code-syntax-highlight');
        break;
      case 79: // O: Toggle overview
        toggleOverviewDisplay();
        break;
      case 80: // P: Toggle presenter notes
        document.body.classList.toggle('presenter-speaker-notes');
        break;
      case 27: // ESC: Hide notes and highlighting
        document.body.classList.remove('presenter-speaker-notes');
        document.body.classList.remove('code-syntax-highlight');
        if (document.body.classList.contains('overview-display-mode')) {
          toggleOverviewDisplay();
        }
        break;
      case 70: // F: Toggle fullscreen
        if (event.target === document.body && !(event.shiftKey && event.metaKey)) {
          if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            document.restoreNormalScreen();
          } else {
            const requestFullscreenMethod = presentationContainer.requestFullscreen || presentationContainer.webkitRequestFullscreen || presentationContainer.mozRequestFullScreen || presentationContainer.msRequestFullscreen;
            if (requestFullscreenMethod) {
              requestFullscreenMethod.apply(presentationContainer, [Element.ALLOW_KEYBOARD_INPUT]);
            }
          }
        }
        break;
      case 87: // W: Toggle widescreen
        if (event.target === document.body && !(event.shiftKey && event.metaKey)) {
          presentationContainer.classList.toggle('presentation-layout--widescreen');
        }
        break;
    }
  };

  const adjustOverviewRendering = function() {
    const inOverviewMode = document.body.classList.contains('overview-display-mode');
    presentationPages.forEach((page, index) => {
      const transformCssProp = utilityFunctions.getVendorPrefixedStyle('transform');
      if (transformCssProp) {
        if (inOverviewMode) {
          const horizontalOffset = (index - currentActivePage) * 105;
          page.style[transformCssProp] = `translateZ(-2500px) translateX(${horizontalOffset}%)`;
          page.style.opacity = '1';
        } else {
          page.style[transformCssProp] = '';
          page.style.opacity = '';
        }
      }
    });
  };

  const toggleOverviewDisplay = function() {
    document.body.classList.toggle('overview-display-mode');
    adjustOverviewRendering();
    if (!document.body.classList.contains('overview-display-mode')) {
      updatePageVisibility();
    }
  };

  const applySystemConfiguration = function(configData) {
    if (!configData) return;

    systemConfiguration = configData.settings;

    loadThemeLinkedStyles(systemConfiguration.theme || []);
    if (systemConfiguration.favIcon) {
      addFavIconLink(systemConfiguration.favIcon);
    }

    if (!!!('usePrettify' in systemConfiguration) || systemConfiguration.usePrettify) {
      if (typeof prettyPrint === 'function') {
        prettyPrint();
      }
    }

    if (systemConfiguration.analytics) {
      injectAnalyticsCode();
    }

    if (systemConfiguration.fonts) {
      injectWebFonts(systemConfiguration.fonts);
    }

    if (!!!('useBuilds' in systemConfiguration) || systemConfiguration.useBuilds) {
      prepareIncrementalSlideElements();
    }

    if (systemConfiguration.title) {
      document.title = systemConfiguration.title.replace(/<br\/?>/g, ' ') + ' - Dynamic Presentation Platform';
      const mainTitleElement = document.querySelector('[data-system-title]');
      if (mainTitleElement) mainTitleElement.innerHTML = systemConfiguration.title;
    }

    if (systemConfiguration.subtitle) {
      const subTitleElement = document.querySelector('[data-system-subtitle]');
      if (subTitleElement) subTitleElement.innerHTML = systemConfiguration.subtitle;
    }

    if (configData.presenters) {
      const presenterDetails = configData.presenters;
      const contactDisplayArea = document.querySelector('[data-system-contact]');

      let presenterInfoHtml = [];
      if (presenterDetails.length === 1) {
        const p = presenterDetails[0];
        presenterInfoHtml.push(p.name, p.company);

        const socialLinkElements = [];
        if (p.gplus) socialLinkElements.push(`<span>Google+</span><a href="${p.gplus}">${p.gplus.replace(/https?:\/\//, '')}</a>`);
        if (p.twitter) socialLinkElements.push(`<span>Twitter</span><a href="http://twitter.com/${p.twitter}">${p.twitter}</a>`);
        if (p.www) socialLinkElements.push(`<span>Website</span><a href="${p.www}">${p.www.replace(/https?:\/\//, '')}</a>`);
        if (p.github) socialLinkElements.push(`<span>GitHub</span><a href="${p.github}">${p.github.replace(/https?:\/\//, '')}</a>`);

        if (contactDisplayArea) contactDisplayArea.innerHTML = socialLinkElements.join('<br>');
      } else {
        for (let i = 0, p; p = presenterDetails[i]; ++i) {
          presenterInfoHtml.push(`${p.name} - ${p.company}`);
        }
        if (contactDisplayArea) contactDisplayArea.innerHTML = presenterInfoHtml.join('<br>');
      }

      const presenterNameArea = document.querySelector('[data-system-presenter]');
      if (presenterNameArea) presenterNameArea.innerHTML = presenterInfoHtml.join('<br>');
    }

    if (!!!('enableSlideAreas' in systemConfiguration) || systemConfiguration.enableSlideAreas) {
      const previousArea = document.createElement('div');
      previousArea.classList.add('slide-nav-zone');
      previousArea.id = 'previous-slide-zone';
      previousArea.addEventListener('click', navigateBackward, false);
      presentationContainer.appendChild(previousArea);

      const nextArea = document.createElement('div');
      nextArea.classList.add('slide-nav-zone');
      nextArea.id = 'next-slide-zone';
      nextArea.addEventListener('click', navigateForward, false);
      presentationContainer.appendChild(nextArea);
    }
  };

  const loadThemeLinkedStyles = function(themes) {
    themes.forEach(themeName => {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = styleAssetRoot + themeName + '.css';
      document.head.appendChild(styleLink);
    });
  };

  const addFavIconLink = function(iconLocation) {
    const favIconLink = document.createElement('link');
    favIconLink.rel = 'shortcut icon';
    favIconLink.href = iconLocation;
    document.head.appendChild(favIconLink);
  };

  const injectAnalyticsCode = function() {
    const analyticsScript = document.createElement('script');
    analyticsScript.src = 'https://www.google-analytics.com/analytics.js';
    document.head.appendChild(analyticsScript);
  };

  const injectWebFonts = function(fontFamilies) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = (window.location.protocol === 'https:' ? 'https' : 'http') +
      '://fonts.googleapis.com/css?family=' + fontFamilies.join('|') + '&v2';
    document.head.appendChild(fontLink);
  };

  const prepareIncrementalSlideElements = function() {
    presentationPages.forEach(page => {
      const buildSteps = Array.from(page.querySelectorAll('[data-increment-order]'));
      buildSteps.forEach(item => {
        item.classList.add('incremental-step');
      });
      if (buildSteps.length > 0) {
        buildSteps[0].classList.add('incremental-step--upcoming');
      }
    });
  };

  const advanceIncrementalSlideElement = function() {
    const currentPage = presentationPages[currentActivePage];
    const currentBuildStep = currentPage.querySelector('.incremental-step--active');
    const nextBuildStep = currentPage.querySelector('.incremental-step--upcoming');

    if (currentBuildStep) {
      currentBuildStep.classList.remove('incremental-step--active');
      currentBuildStep.classList.add('incremental-step--completed');
    }

    if (!nextBuildStep) {
      return false;
    }

    nextBuildStep.classList.remove('incremental-step--upcoming');
    nextBuildStep.classList.add('incremental-step--active');

    const allBuildSteps = Array.from(currentPage.querySelectorAll('.incremental-step'));
    const currentStepIndex = allBuildSteps.indexOf(nextBuildStep);
    if (currentStepIndex > -1 && currentStepIndex + 1 < allBuildSteps.length) {
      allBuildSteps[currentStepIndex + 1].classList.add('incremental-step--upcoming');
    }

    return true;
  };

  const navigateBackward = function(preventHistoryUpdate = false) {
    if (currentActivePage > 0) {
      document.body.classList.remove('code-syntax-highlight');
      document.body.classList.remove('presenter-speaker-notes');

      lastVisitedPage = currentActivePage--;
      updatePageVisibility(preventHistoryUpdate);
    }
  };

  const navigateForward = function(preventHistoryUpdate = false) {
    if (!document.body.classList.contains('overview-display-mode') && advanceIncrementalSlideElement()) {
      return;
    }

    if (currentActivePage < presentationPages.length - 1) {
      document.body.classList.remove('code-syntax-highlight');
      document.body.classList.remove('presenter-speaker-notes');

      lastVisitedPage = currentActivePage++;
      updatePageVisibility(preventHistoryUpdate);
    }
  };

  const updatePageVisibility = function(suppressHistoryRecord = false) {
    presentationPages.forEach((page, index) => {
      const relativeDistance = index - currentActivePage;
      Object.values(pageDisplayStates).forEach(cls => page.classList.remove(cls));

      if (relativeDistance < -2) {
        page.classList.add(pageDisplayStates['extremely-behind']);
      } else if (relativeDistance === -2) {
        page.classList.add(pageDisplayStates['moderately-behind']);
      } else if (relativeDistance === -1) {
        page.classList.add(pageDisplayStates['moderately-behind']);
      } else if (relativeDistance === 0) {
        page.classList.add(pageDisplayStates['currently-visible']);
      } else if (relativeDistance === 1) {
        page.classList.add(pageDisplayStates['moderately-ahead']);
      } else if (relativeDistance === 2) {
        page.classList.add(pageDisplayStates['moderately-ahead']);
      } else if (relativeDistance > 2) {
        page.classList.add(pageDisplayStates['extremely-ahead']);
      }

      if (relativeDistance === 0) {
        page.removeAttribute('aria-hidden');
        page.setAttribute('tabindex', '0');
      } else {
        page.setAttribute('aria-hidden', 'true');
        page.setAttribute('tabindex', '-1');
      }
    });

    if (!suppressHistoryRecord) {
      window.history.pushState(currentActivePage, '', '#' + (currentActivePage + 1));
    }

    const currentPageElement = presentationPages[currentActivePage];
    if (currentPageElement) {
      const pageActiveEvent = new CustomEvent('pageActive', {
        detail: {
          pageNumber: currentActivePage + 1,
          pageElement: currentPageElement
        }
      });
      currentPageElement.dispatchEvent(pageActiveEvent);
    }

    const previousPageElement = presentationPages[lastVisitedPage];
    if (previousPageElement && lastVisitedPage !== currentActivePage) {
      const pageDeactiveEvent = new CustomEvent('pageDeactive', {
        detail: {
          pageNumber: lastVisitedPage + 1,
          pageElement: previousPageElement
        }
      });
      previousPageElement.dispatchEvent(pageDeactiveEvent);
    }
  };

  extractStartingPageFromUrl();
  document.addEventListener('DOMContentLoaded', documentLoadCompleteHandler);

  return {
    gotoPage: directToPage,
    nextSlide: navigateForward,
    previousSlide: navigateBackward,
    toggleOverviewMode: toggleOverviewDisplay,
    getCurrentSlideNumber: () => currentActivePage + 1,
    getTotalSlideCount: () => presentationPages.length
  };
};