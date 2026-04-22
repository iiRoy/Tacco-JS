// Function binding implementation
if (!Function.prototype.bind) {
  Function.prototype.bind = function (contextObject) {
    if (typeof this !== "function") {
      // Throw an error if the target is not a callable function,
      // mimicking ECMAScript 5's internal IsCallable check.
      throw new TypeError("Function.prototype.bind - the entity attempting to be bound is not a function");
    }

    var arrayPortion = Array.prototype.slice,
        initialArguments = arrayPortion.call(arguments, 1),
        originalMethod = this,
        emptyConstructor = function () {},
        boundFunction = function () {
          return originalMethod.apply(this instanceof emptyConstructor
                                 ? this
                                 : contextObject || window,
                               initialArguments.concat(arrayPortion.call(arguments)));
        };

    emptyConstructor.prototype = this.prototype;
    boundFunction.prototype = new emptyConstructor();

    return boundFunction;
  };
}

(function() {
  var documentRef = document;
  var preventStepAnimations = false;
  var preventSpeakerNotes = false;

  var counterValue = 0;
  var whitespaceRegex = /\s+/, singleElementArray = [''];

  var convertToList = function(inputList) {
    return Array.prototype.slice.call(inputList || [], 0);
  };

  var getElementByIdentifier = function(identifierString) {
    if (typeof identifierString == 'string') { return documentRef.getElementById(identifierString); }
    return identifierString;
  };

  var findFirstElement = function(queryText, searchRoot) {
    return findAllElements(queryText, searchRoot)[0];
  }

  var findAllElements = function(queryText, searchRoot) {
    if (!queryText) { return []; }
    if (typeof queryText != 'string') { return convertToList(queryText); }
    if (typeof searchRoot == 'string') {
      searchRoot = getElementByIdentifier(searchRoot);
      if(!searchRoot){ return []; }
    }

    searchRoot = searchRoot || document;
    var isRootDocument = (searchRoot.nodeType == 9);
    var targetDocument = isRootDocument ? searchRoot : (searchRoot.ownerDocument || document);

    // Modify the selector to be relative to the root element's ID
    if (!isRootDocument || ('>~+'.indexOf(queryText.charAt(0)) >= 0)) {
      searchRoot.id = searchRoot.id || ('qUnique' + (counterValue++));
      queryText = '#' + searchRoot.id + ' ' + queryText;
    }
    // Prevent issues with trailing combinators like ".foo >"
    if ('>~+'.indexOf(queryText.slice(-1)) >= 0) { queryText += ' *'; }
    return convertToList(targetDocument.querySelectorAll(queryText));
  };

  var stringToWordArray = function(inputString) {
    if (typeof inputString == 'string' || inputString instanceof String) {
      if (inputString.indexOf(' ') < 0) {
        singleElementArray[0] = inputString;
        return singleElementArray;
      } else {
        return inputString.split(whitespaceRegex);
      }
    }
    return inputString;
  };

  // Polyfill for String.trim() method
  var stripWhitespace = function(inputStr) {
    return inputStr.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };

  var addCssClass = function(targetNode, cssClasses) {
    cssClasses = stringToWordArray(cssClasses);
    var currentClasses = ' ' + targetNode.className + ' ';
    for (var index = 0, lengthVal = cssClasses.length, currentClass; index < lengthVal; ++index) {
      currentClass = cssClasses[index];
      if (currentClass && currentClasses.indexOf(' ' + currentClass + ' ') < 0) {
        currentClasses += currentClass + ' ';
      }
    }
    targetNode.className = stripWhitespace(currentClasses);
  };

  var removeCssClass = function(targetNode, cssClasses) {
    var updatedClasses;
    if (cssClasses !== undefined) {
      cssClasses = stringToWordArray(cssClasses);
      updatedClasses = ' ' + targetNode.className + ' ';
      for (var index = 0, lengthVal = cssClasses.length; index < lengthVal; ++index) {
        updatedClasses = updatedClasses.replace(' ' + cssClasses[index] + ' ', ' ');
      }
      updatedClasses = stripWhitespace(updatedClasses);
    } else {
      updatedClasses = '';
    }
    if (targetNode.className != updatedClasses) {
      targetNode.className = updatedClasses;
    }
  };

  var toggleCssClass = function(targetNode, cssClasses) {
    var currentClasses = ' ' + targetNode.className + ' ';
    if (currentClasses.indexOf(' ' + stripWhitespace(cssClasses) + ' ') >= 0) {
      removeCssClass(targetNode, cssClasses);
    } else {
      addCssClass(targetNode, cssClasses);
    }
  };


  // Simplified Modernizr check based on a Gist
  var checkCssFeature = function(featureName) {

    var testElement = document.createElement('div');
    var vendorPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
    var featureSupported;
    var capitalizeMatch = function(fullMatch, charToCapitalize) {
          return charToCapitalize.toUpperCase();
        };
    var cssProperty;

    featureSupported = featureName in testElement.style;
    cssProperty = featureName.replace(/^(.)/, capitalizeMatch).replace(/-([a-z])/ig, capitalizeMatch);

    for (var lengthVal = vendorPrefixes.length; lengthVal--; ){
      if (featureSupported) {
        break;
      }
      featureSupported = vendorPrefixes[lengthVal] + cssProperty in testElement.style;
    }

    document.documentElement.className += ' ' + (featureSupported ? '' : 'no-') + featureName.replace(/-/g, '');
    return featureSupported;
  };

  var transitionIsSupported = checkCssFeature('transition');

  //
  // PresentationSlide class definition
  //
  var PresentationSlide = function(slideElement, slideIndex) {
    this._domElement = slideElement;
    var speakerCommentBlock = findFirstElement('.note > section', slideElement);
    if (this._presenterComment) {
      this._presenterComment = speakerCommentBlock ? speakerCommentBlock.innerHTML : '';
    }
    if (slideIndex >= 0) {
      this._slideNumber = slideIndex + 1;
    }
    if (this._domElement) {
      addCssClass(this._domElement, 'slide distant-slide');
    }
    this._createCounterDisplay();
    this._prepareAnimations();
  };

  PresentationSlide.prototype = {
    _domElement: null,
    _slideNumber: 0,
    _animationSequence: [],
    _hasBeenViewed: false,
    _currentDisplayState: '',
    _possibleStates: [ 'distant-slide', 'far-past',
               'past', 'current', 'future',
               'far-future', 'distant-slide' ],
    setVisualState: function(desiredState) {
      if (typeof desiredState != 'string') {
        desiredState = this._possibleStates[desiredState];
      }
      if (desiredState == 'current' && !this._hasBeenViewed) {
        this._hasBeenViewed = true;
        this._prepareAnimations();
      }
      removeCssClass(this._domElement, this._possibleStates);
      addCssClass(this._domElement, desiredState);
      this._currentDisplayState = desiredState;

      // Introduce a slight delay for automatic slide progression.
      // This would ideally be handled purely by CSS.
      var selfReference = this;
      setTimeout(function(){ selfReference._executeAutoAnimations(); } , 400);

      if (desiredState == 'current') {
        this._onSlideActivation();
      } else {
        this._onSlideDeactivation();
      }
    },
    _onSlideActivation: function() {
      this._triggerCustomEvent('onload');
      this._displayIframes();
    },
    _onSlideDeactivation: function() {
      this._triggerCustomEvent('onunload');
      this._concealIframes();
    },
    _triggerCustomEvent: function(eventName) {
      var eventCodeString = this._domElement.getAttribute(eventName);
      if (eventCodeString) {
        eventCodeString = '(function() { ' + eventCodeString + ' })';
        var eventFunction = eval(eventCodeString);
        eventFunction.call(this._domElement);
      }
    },
    _displayIframes: function() {
      var iframeElements = findAllElements('iframe', this._domElement);
      function activateIframes() {
        iframeElements.forEach(function(currentIframe) {
          var _sourceUrl = currentIframe.getAttribute('_src');
          if (_sourceUrl && _sourceUrl.length) {
            currentIframe.src = _sourceUrl;
          }
        });
      }
      setTimeout(activateIframes, 0);
    },
    _concealIframes: function() {
      var iframeElements = findAllElements('iframe', this._domElement);
      function deactivateIframes() {
        iframeElements.forEach(function(currentIframe) {
          var _sourceUrl = currentIframe.getAttribute('_src');
          if (_sourceUrl && _sourceUrl.length) {
            currentIframe.src = '';
          }
        });
      }
      setTimeout(deactivateIframes, 250);
    },
    _createCounterDisplay: function() {
      if(!this._slideNumber || !this._domElement) { return; }
      var counterSpan = documentRef.createElement('span');
      counterSpan.className = 'counter';
      this._domElement.appendChild(counterSpan);
    },
    _prepareAnimations: function() {
      this._animationSequence = [];
      if (preventStepAnimations) { return; }
      if (this._domElement) {
        this._animationSequence = findAllElements('[data-build] > *', this._domElement);
      }
      this._animationSequence.forEach(function(el) {
        addCssClass(el, 'to-build');
      });
    },
    _executeAutoAnimations: function() {
      if (this._currentDisplayState != 'current') {
        return;
      }
      // Locate the next auto-advancing element, remove it from the list, and process it.
      var animationIndex = -1;
      this._animationSequence.some(function(animationItem, itemIndex) {
        if (animationItem.hasAttribute('data-auto')) {
          animationIndex = itemIndex;
          return true;
        }
        return false;
      });
      if (animationIndex >= 0) {
        var animatedElement = this._animationSequence.splice(animationIndex, 1)[0];

        var selfReference = this;
        if (transitionIsSupported) {
          var transitionEndHandler = function(eventObject) {
            animatedElement.parentElement.removeEventListener('webkitTransitionEnd', transitionEndHandler, false);
            animatedElement.parentElement.removeEventListener('transitionend', transitionEndHandler, false);  // moz
            animatedElement.parentElement.removeEventListener('oTransitionEnd', transitionEndHandler, false);
            selfReference._executeAutoAnimations();
          };
          animatedElement.parentElement.addEventListener('webkitTransitionEnd', transitionEndHandler, false);
          animatedElement.parentElement.addEventListener('transitionend', transitionEndHandler, false);
          animatedElement.parentElement.addEventListener('oTransitionEnd', transitionEndHandler, false);
          removeCssClass(animatedElement, 'to-build');
        } else {
          setTimeout(function() {
            removeCssClass(animatedElement, 'to-build');
            selfReference._executeAutoAnimations();
          }, 400);
        }
      }
    },
    getPresenterComment: function() {
      return this._presenterComment;
    },
    advanceAnimation: function() {
      if (!this._animationSequence.length) {
        return false;
      }
      removeCssClass(this._animationSequence.shift(), 'to-build');
      return true;
    },
  };

  //
  // PresentationManager class for overall control
  //
  var PresentationManager = function(presentationSections) {
    this._displaySections = (presentationSections || []).map(function(sectionElement, sectionIndex) {
      return new PresentationSlide(sectionElement, sectionIndex);
    });
    var hashValue = window.location.hash;
    try {
      this.activeSectionId = hashValue;
    } catch (e) { /* suppress error */ }
    this.activeSectionId = (!this.activeSectionId) ? "landing-slide" : this.activeSectionId.replace('#', '');
    if (!findFirstElement('#' + this.activeSectionId)) {
      // If the section ID doesn't exist, it's likely an old permalink format.
      alert('The permalink structure has recently changed. If you arrived here ' +
             'from an old external link, you might be on the incorrect slide.');
      this.activeSectionId = "landing-slide";
    }
    var selfRef = this;
    documentRef.addEventListener('keydown',
        function(eventData) { selfRef.handleKeyboardInput(eventData); }, false);
    documentRef.addEventListener('touchstart',
        function(eventData) { selfRef.handleTouchBegin(eventData); }, false);
    documentRef.addEventListener('touchend',
        function(eventData) { selfRef.handleTouchFinish(eventData); }, false);
    window.addEventListener('popstate',
        function(eventData) { if (eventData.state) { selfRef.navigateToSection(eventData.state, true); } }, false);
    findFirstElement('#left-init-key').addEventListener('click',
        function() { selfRef.advanceToNext(); }, false);
    this._refreshDisplay();
    findAllElements('#nav-prev, #nav-next').forEach(function(el) {
      el.addEventListener('click', selfRef.onNavigationClick.bind(selfRef), false);
    });
    findAllElements('menu button').forEach(function(el) {
      el.addEventListener('click', selfRef.onControlClick.bind(selfRef), false);
    });
  };

  PresentationManager.prototype = {
    _mainDisplayCounter: findFirstElement('#presentation-counter'),
    _menuPageCounter: findFirstElement('#slide-no'),
    _presenterFeedback: findFirstElement('#speaker-note'),
    _assistancePanel: findFirstElement('#help'),
    _displaySections: [],
    _styleThemes: findAllElements('.theme'),
    _getPresentSectionIndex: function() {
      var managerInstance = this;
      var sectionNumber = null;
      findAllElements('.slide').forEach(function(slide, i) {
        if (slide.id == managerInstance.activeSectionId) {
          sectionNumber = i;
        }
      });
      return sectionNumber + 1;
    },
    _refreshDisplay: function(targetSectionIdentifier, skipHistoryPush) {
      // To prevent the counter from showing a slide number before content loads,
      // we check for visibility. Visibility check method from Stack Overflow.
      var currentSectionIndex = this._getPresentSectionIndex();

      if (targetSectionIdentifier) {
        var previousSectionIndex = currentSectionIndex;
        this.activeSectionId = targetSectionIdentifier;
        currentSectionIndex = this._getPresentSectionIndex();
        if (Math.abs(previousSectionIndex - currentSectionIndex) > 1) {
          // If the transition is not to an adjacent slide (prev/next),
          // clear the state around the original slide.
          for (var iterationIndex = previousSectionIndex; iterationIndex < previousSectionIndex + 7; iterationIndex++) {
            if (this._displaySections[iterationIndex-4]) {
              this._displaySections[iterationIndex-4].setVisualState(0);
            }
          }
        }
      }
      var documentRootElement = document.documentElement;
      var visibleElement = document.elementFromPoint( documentRootElement.clientWidth / 2, documentRootElement.clientHeight / 2);
      if (visibleElement && visibleElement.className != 'slides') {
        this._mainDisplayCounter.textContent = currentSectionIndex;
        if (this._menuPageCounter) {
          this._menuPageCounter.textContent = currentSectionIndex;
        }
      }
      if (this._presenterFeedback) {
        this._presenterFeedback.innerHTML = this._displaySections[currentSectionIndex - 1].getPresenterComment();
      }
      if (history.pushState) {
        if (!skipHistoryPush) {
          history.pushState(this.activeSectionId, 'Section ' + this.activeSectionId, '#' + this.activeSectionId);
        }
      } else {
        window.location.hash = this.activeSectionId;
      }
      for (var iterationIndex = currentSectionIndex; iterationIndex < currentSectionIndex + 7; iterationIndex++) {
        if (this._displaySections[iterationIndex-4]) {
          this._displaySections[iterationIndex-4].setVisualState(iterationIndex-currentSectionIndex);
        }
      }
    },

    activeSectionId: 0,
    advanceToNext: function() {
      if (!this._displaySections[this._getPresentSectionIndex() - 1].advanceAnimation()) {
        var nextSection = findFirstElement('#' + this.activeSectionId + ' + .slide');
        this._refreshDisplay((nextSection) ? nextSection.id : this.activeSectionId);
      }
    },
    returnToPrevious: function() {
      var previousSection = findFirstElement('.slide:nth-child(' + (this._getPresentSectionIndex()) + ')');
      this._refreshDisplay((previousSection) ? previousSection.id : this.activeSectionId);
    },
    navigateToSection: function(sectionIdentifier, skipHistoryPush) {
      this._refreshDisplay(sectionIdentifier, skipHistoryPush);
    },

    displayNotes: function() {
      if (preventSpeakerNotes) {
        return;
      }
      if (this._presenterFeedback) {
        this._presenterFeedback.style.display = 'block';
        this._presenterFeedback.classList.toggle('invisible');
      }
    },
    toggle3dView: function() {
      toggleCssClass(document.body, 'three-d');
    },
    toggleCodeHighlighting: function() {
      var prettifyLink = findFirstElement('#prettify-link');
      prettifyLink.disabled = !(prettifyLink.disabled);
      sessionStorage['highlightOn'] = !prettifyLink.disabled;
    },
    cycleTheme: function() {
      var currentSheetIndex = 0;
      while (this._styleThemes[currentSheetIndex].disabled) {
        currentSheetIndex++;
      }
      this._styleThemes[currentSheetIndex].disabled = true;
      var nextStyleSheet = this._styleThemes[(currentSheetIndex + 1) % this._styleThemes.length];
      nextStyleSheet.disabled = false;
      sessionStorage['theme'] = nextStyleSheet.getAttribute('href').split('/').pop();
    },
    toggleHelp: function() {
      this._assistancePanel.style.display = 'block';
      this._assistancePanel.classList.toggle('invisible');
    },
    showSourceCode: function() {
      window.open("view-source:" + window.location.href);
    },
    handleKeyboardInput: function(eventData) {
      if (/^(input|textarea)$/i.test(eventData.target.nodeName) || eventData.target.isContentEditable) {
        return;
      }
      switch (eventData.keyCode) {
        case 37:  // left arrow key
          this.returnToPrevious(); break;
        case 39:  // right arrow key
        case 32:  // space bar
          this.advanceToNext(); break;
        case 48:  // '0' key
          this.toggleHelp(); break;
        case 51:  // '3' key
          this.toggle3dView(); break;
        case 72:  // 'H' key
          this.toggleCodeHighlighting(); break;
        case 78:  // 'N' key
          this.displayNotes(); break;
        case 83:  // 'S' key
          this.showSourceCode(); break;
        case 84:  // 'T' key
          this.cycleTheme(); break;
      }
    },
    _touchStartPositionX: 0,
    handleTouchBegin: function(eventData) {
      this._touchStartPositionX = eventData.touches[0].pageX;
    },
    handleTouchFinish: function(eventData) {
      var swipeDelta = this._touchStartPositionX - eventData.changedTouches[0].pageX;
      var MIN_SWIPE_DISTANCE = 150;
      if (swipeDelta > MIN_SWIPE_DISTANCE) {
        this.advanceToNext();
      } else if (swipeDelta < -MIN_SWIPE_DISTANCE) {
        this.returnToPrevious();
      }
    },
  };