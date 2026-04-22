const createBoundProcessor = (funcSource, contextObject, ...initialArguments) => {
  if (typeof funcSource !== "function") {
    throw new TypeError("Processor is not a function.");
  }

  const intermediaryOperation = function () {};
  const boundProcessor = function (...invocationArguments) {
    const finalArguments = initialArguments.concat(invocationArguments);
    return Reflect.apply(funcSource,
                         (this instanceof intermediaryOperation)
                           ? this
                           : (contextObject || window),
                         finalArguments);
  };

  if (funcSource.prototype) {
    intermediaryOperation.prototype = funcSource.prototype;
  }
  boundProcessor.prototype = new intermediaryOperation();

  return boundProcessor;
};

const PresentationManager = (() => {
  let globalIdentifierCounter = 0; // Not strictly used in this clone due to modern DOM querying
  const whitespacePattern = /\s+/;
  const temporaryArray = [''];

  const convertCollectionToArray = (collectionItem) => {
    return Array.from(collectionItem || []);
  };

  const locateElementByUniqueId = (elementId) => {
    return (typeof elementId === 'string') ? document.getElementById(elementId) : elementId;
  };

  const selectSingleElement = (selectorExpression, contextNode = document) => {
    return selectMultipleElements(selectorExpression, contextNode)[0];
  };

  const selectMultipleElements = (selectorExpression, contextNode = document) => {
    if (!selectorExpression) { return []; }
    if (typeof selectorExpression !== 'string') { return convertCollectionToArray(selectorExpression); }

    let actualContext = contextNode;
    if (typeof contextNode === 'string') {
      actualContext = locateElementByUniqueId(contextNode);
      if (!actualContext) { return []; }
    }

    return convertCollectionToArray(actualContext.querySelectorAll(selectorExpression));
  };

  const parseStringIntoWords = (inputString) => {
    if (typeof inputString === 'string' || inputString instanceof String) {
      if (inputString.indexOf(' ') < 0) {
        temporaryArray[0] = inputString;
        return temporaryArray;
      } else {
        return inputString.split(whitespacePattern);
      }
    }
    return inputString;
  };

  const stripWhitespace = (textString) => {
    return textString.trim();
  };

  const addDisplayClass = (targetNode, classIdentifier) => {
    parseStringIntoWords(classIdentifier).forEach(singleClass => {
      if (singleClass) {
        targetNode.classList.add(singleClass);
      }
    });
  };

  const removeDisplayClass = (targetNode, classIdentifier) => {
    if (classIdentifier !== undefined) {
      parseStringIntoWords(classIdentifier).forEach(singleClass => {
        if (singleClass) {
          targetNode.classList.remove(singleClass);
        }
      });
    } else {
      targetNode.className = '';
    }
  };

  const toggleDisplayClass = (targetNode, classIdentifier) => {
    targetNode.classList.toggle(stripWhitespace(classIdentifier));
  };

  const detectCssCapability = (styleProperty) => {
    const testElement = document.createElement('div');
    const vendorPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
    let capabilityExists = false;

    const capitalizeFirstLetter = (all, firstChar) => firstChar.toUpperCase();
    const camelCaseProperty = styleProperty.replace(/^(.)/, capitalizeFirstLetter).replace(/-([a-z])/ig, capitalizeFirstLetter);

    capabilityExists = styleProperty in testElement.style;

    if (!capabilityExists) {
      for (const prefix of vendorPrefixes) {
        if (`${prefix}${camelCaseProperty}` in testElement.style) {
          capabilityExists = true;
          break;
        }
      }
    }

    document.documentElement.classList.add(`${capabilityExists ? '' : 'no-'}${styleProperty.replace(/-/g, '')}`);
    return capabilityExists;
  };

  const supportsTransitions = detectCssCapability('transition');

  let animationDisabled = false;
  let notesHidden = false;

  class VisualSection {
    constructor(sectionElement, sectionIndex) {
      this.pageElement = sectionElement;
      this.pageIndex = sectionIndex + 1;
      this.animationSequence = [];
      this.hasBeenViewed = false;
      this.currentVisualState = '';

      const noteContent = selectSingleElement('.note > section', sectionElement);
      this.spokenNotes = noteContent ? noteContent.innerHTML : '';

      if (this.pageElement) {
        addDisplayClass(this.pageElement, 'visual-section distant-visual-section');
      }

      this.initializePageCounter();
      this.prepareAnimationSteps();
    }

    stateDefinitions = [
      'distant-visual-section', 'far-past-visual',
      'past-visual', 'current-visual', 'future-visual',
      'far-future-visual', 'distant-visual-section'
    ];

    setVisualStatus(statusIndicator) {
      const targetStatus = typeof statusIndicator === 'string' ? statusIndicator : this.stateDefinitions[statusIndicator];

      if (targetStatus === 'current-visual' && !this.hasBeenViewed) {
        this.hasBeenViewed = true;
        this.prepareAnimationSteps();
      }

      removeDisplayClass(this.pageElement, this.stateDefinitions.join(' '));
      addDisplayClass(this.pageElement, targetStatus);
      this.currentVisualState = targetStatus;

      setTimeout(() => this.executeAutoAnimations(), 400);

      if (targetStatus === 'current-visual') {
        this.onPageActivated();
      } else {
        this.onPageDeactivated();
      }
    }

    onPageActivated() {
      this.triggerCustomAction('onload');
      this.revealEmbeddedContent();
    }

    onPageDeactivated() {
      this.triggerCustomAction('onunload');
      this.concealEmbeddedContent();
    }

    triggerCustomAction(actionName) {
      const actionSource = this.pageElement.getAttribute(actionName);
      if (actionSource) {
        const actionFunction = new Function(actionSource);
        actionFunction.call(this.pageElement);
      }
    }

    revealEmbeddedContent() {
      const embeddedFrames = selectMultipleElements('iframe', this.pageElement);
      setTimeout(() => {
        embeddedFrames.forEach(frame => {
          const sourceAttribute = frame.getAttribute('_src');
          if (sourceAttribute && sourceAttribute.length) {
            frame.src = sourceAttribute;
          }
        });
      }, 0);
    }

    concealEmbeddedContent() {
      const embeddedFrames = selectMultipleElements('iframe', this.pageElement);
      setTimeout(() => {
        embeddedFrames.forEach(frame => {
          const sourceAttribute = frame.getAttribute('_src');
          if (sourceAttribute && sourceAttribute.length) {
            frame.src = '';
          }
        });
      }, 250);
    }

    initializePageCounter() {
      if (!this.pageIndex || !this.pageElement) { return; }
      const counterElement = document.createElement('span');
      counterElement.className = 'counter';
      this.pageElement.appendChild(counterElement);
    }

    prepareAnimationSteps() {
      this.animationSequence = [];
      if (animationDisabled) { return; }
      if (this.pageElement) {
        this.animationSequence = selectMultipleElements('[data-build] > *', this.pageElement);
      }
      this.animationSequence.forEach(element => {
        addDisplayClass(element, 'to-build');
      });
    }

    executeAutoAnimations() {
      if (this.currentVisualState !== 'current-visual') {
        return;
      }

      const nextAutoIndex = this.animationSequence.findIndex(node => node.hasAttribute('data-auto'));

      if (nextAutoIndex >= 0) {
        const [animatedElement] = this.animationSequence.splice(nextAutoIndex, 1);

        const transitionEndHandler = (event) => {
          animatedElement.removeEventListener('transitionend', transitionEndHandler);
          animatedElement.removeEventListener('webkitTransitionEnd', transitionEndHandler);
          animatedElement.removeEventListener('oTransitionEnd', transitionEndHandler);
          this.executeAutoAnimations();
        };

        if (supportsTransitions) {
          animatedElement.addEventListener('transitionend', transitionEndHandler);
          animatedElement.addEventListener('webkitTransitionEnd', transitionEndHandler);
          animatedElement.addEventListener('oTransitionEnd', transitionEndHandler);
          removeDisplayClass(animatedElement, 'to-build');
        } else {
          setTimeout(() => {
            removeDisplayClass(animatedElement, 'to-build');
            this.executeAutoAnimations();
          }, 400);
        }
      }
    }

    retrieveSpokenNotes() {
      return this.spokenNotes;
    }

    advanceNextAnimation() {
      if (!this.animationSequence.length) {
        return false;
      }
      removeDisplayClass(this.animationSequence.shift(), 'to-build');
      return true;
    }
  }

  class PresentationConductor {
    constructor(pageElements) {
      this.presentationPages = pageElements.map((element, index) => {
        return new VisualSection(element, index);
      });

      this.globalPageIndexDisplay = selectSingleElement('#presentation-counter');
      this.menuPageIndexDisplay = selectSingleElement('#slide-no');
      this.speakerNotesContainer = selectSingleElement('#speaker-note');
      this.helpOverlay = selectSingleElement('#help');
      this.styleSheets = selectMultipleElements('.theme');

      let initialPageId = window.location.hash;
      try {
        this.activePageId = initialPageId ? initialPageId.substring(1) : "landing-slide";
      } catch (e) {
        this.activePageId = "landing-slide";
      }

      if (!selectSingleElement('#' + this.activePageId)) {
        alert('The format of the permalinks have recently changed. If you are coming ' +
              'here from an old external link it\'s very likely you will land to the wrong slide');
        this.activePageId = "landing-slide";
      }

      document.addEventListener('keydown', (e) => this.handleKeyboardInput(e), false);
      document.addEventListener('touchstart', (e) => this.onGestureStart(e), false);
      document.addEventListener('touchend', (e) => this.onGestureEnd(e), false);
      window.addEventListener('popstate', (e) => {
        if (e.state) { this.navigateToPage(e.state, true); }
      }, false);

      selectSingleElement('#left-init-key').addEventListener('click', () => this.moveToNextPage(), false);

      selectMultipleElements('#nav-prev, #nav-next').forEach(element => {
        element.addEventListener('click', createBoundProcessor(this.onNavigationClick, this), false);
      });
      selectMultipleElements('menu button').forEach(element => {
        element.addEventListener('click', createBoundProcessor(this.onCommandClick, this), false);
      });

      this.refreshDisplay();
    }

    activePageId = 0;
    touchStartCoordinate = 0;

    getCurrentPageIndex() {
      const currentPage = this.presentationPages.find(page => page.pageElement.id === this.activePageId);
      return currentPage ? currentPage.pageIndex : null;
    }

    refreshDisplay(targetPageIdentifier, avoidHistoryPush) {
      const currentSectionIndex = this.getCurrentPageIndex();
      let newSectionIndex = currentSectionIndex;

      if (targetPageIdentifier) {
        this.activePageId = targetPageIdentifier;
        newSectionIndex = this.getCurrentPageIndex();

        if (Math.abs(currentSectionIndex - newSectionIndex) > 1) {
          for (let i = currentSectionIndex - 4; i < currentSectionIndex + 3; i++) {
            if (this.presentationPages[i]) {
              this.presentationPages[i].setVisualStatus(0);
            }
          }
        }
      }

      const rootHtmlElement = document.documentElement;
      const visibleElement = document.elementFromPoint(rootHtmlElement.clientWidth / 2, rootHtmlElement.clientHeight / 2);

      if (visibleElement && !visibleElement.classList.contains('slides')) {
        if (this.globalPageIndexDisplay) {
          this.globalPageIndexDisplay.textContent = newSectionIndex;
        }
        if (this.menuPageIndexDisplay) {
          this.menuPageIndexDisplay.textContent = newSectionIndex;
        }
      }

      if (this.speakerNotesContainer) {
        const currentVisualSection = this.presentationPages[newSectionIndex - 1];
        if (currentVisualSection) {
          this.speakerNotesContainer.innerHTML = currentVisualSection.retrieveSpokenNotes();
        }
      }

      if (history.pushState) {
        if (!avoidHistoryPush) {
          history.pushState(this.activePageId, `Page ${this.activePageId}`, `#${this.activePageId}`);
        }
      } else {
        window.location.hash = this.activePageId;
      }

      for (let i = newSectionIndex - 4; i < newSectionIndex + 3; i++) {
        if (this.presentationPages[i]) {
          this.presentationPages[i].setVisualStatus(i - (newSectionIndex - 1));
        }
      }
    }

    moveToNextPage() {
      const currentSection = this.presentationPages[this.getCurrentPageIndex() - 1];
      if (!currentSection || !currentSection.advanceNextAnimation()) {
        const nextElement = selectSingleElement('#' + this.activePageId + ' + .visual-section');
        this.refreshDisplay(nextElement ? nextElement.id : this.activePageId);
      }
    }

    moveToPreviousPage() {
      const currentSectionIndex = this.getCurrentPageIndex();
      const previousElement = selectSingleElement(`.visual-section:nth-child(${currentSectionIndex - 1})`);
      this.refreshDisplay(previousElement ? previousElement.id : this.activePageId);
    }

    navigateToPage(pageIdentifier, avoidHistoryPush) {
      this.refreshDisplay(pageIdentifier, avoidHistoryPush);
    }

    displaySpeakerNotes() {
      if (notesHidden) { return; }
      if (this.speakerNotesContainer) {
        this.speakerNotesContainer.style.display = 'block';
        this.speakerNotesContainer.classList.toggle('invisible');
      }
    }

    togglePerspectiveView() {
      toggleDisplayClass(document.body, 'three-d');
    }

    toggleCodeHighlighting() {
      const highlightLink = selectSingleElement('#prettify-link');
      if (highlightLink) {
        highlightLink.disabled = !highlightLink.disabled;
        sessionStorage.setItem('highlightOn', !highlightLink.disabled);
      }
    }

    cycleVisualTheme() {
      let activeSheetIndex = 0;
      while (activeSheetIndex < this.styleSheets.length && this.styleSheets[activeSheetIndex].disabled) {
        activeSheetIndex++;
      }

      if (activeSheetIndex < this.styleSheets.length) {
        this.styleSheets[activeSheetIndex].disabled = true;
      }

      const nextSheetIndex = (activeSheetIndex + 1) % this.styleSheets.length;
      const nextSheet = this.styleSheets[nextSheetIndex];
      if (nextSheet) {
        nextSheet.disabled = false;
        sessionStorage.setItem('theme', nextSheet.getAttribute('href').split('/').pop());
      }
    }

    toggleHelpVisibility() {
      this.helpOverlay.style.display = 'block';
      this.helpOverlay.classList.toggle('invisible');
    }

    openSourceView() {
      window.open(`view-source:${window.location.href}`);
    }

    handleKeyboardInput(event) {
      if (/^(input|textarea)$/i.test(event.target.nodeName) || event.target.isContentEditable) {
        return;
      }

      const actionMap = {
        37: () => this.moveToPreviousPage(),
        39: () => this.moveToNextPage(),
        32: () => this.moveToNextPage(),
        48: () => this.toggleHelpVisibility(),
        51: () => this.togglePerspectiveView(),
        72: () => this.toggleCodeHighlighting(),
        78: () => this.displaySpeakerNotes(),
        83: () => this.openSourceView(),
        84: () => this.cycleVisualTheme()
      };

      const action = actionMap[event.keyCode];
      if (action) {
        action();
      }
    }

    onGestureStart(event) {
      this.touchStartCoordinate = event.touches[0].pageX;
    }

    onGestureEnd(event) {
      const swipeDistance = this.touchStartCoordinate - event.changedTouches[0].pageX;
      const MIN_SWIPE_THRESHOLD = 150;
      if (swipeDistance > MIN_SWIPE_THRESHOLD) {
        this.moveToNextPage();
      } else if (swipeDistance < -MIN_SWIPE_THRESHOLD) {
        this.moveToPreviousPage();
      }
    }

    onNavigationClick(event) {
      const targetId = event.currentTarget.id;
      if (targetId === 'nav-prev') {
        this.moveToPreviousPage();
      } else if (targetId === 'nav-next') {
        this.moveToNextPage();
      }
    }

    onCommandClick(event) {
      const button = event.currentTarget;
      const actionType = button.dataset.action;
      switch (actionType) {
        case 'help': this.toggleHelpVisibility(); break;
        case '3d': this.togglePerspectiveView(); break;
        case 'highlight': this.toggleCodeHighlighting(); break;
        case 'notes': this.displaySpeakerNotes(); break;
        case 'source': this.openSourceView(); break;
        case 'theme': this.cycleVisualTheme(); break;
        default: console.warn('Unknown menu command:', actionType);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const slideElements = selectMultipleElements('.slide');
    new PresentationConductor(slideElements);
  });
})();