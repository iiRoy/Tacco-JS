(function (globalJQuery) {

  "use strict"; // Strict mode enabled

  // --- Utility for detecting CSS animation completion events ---

  globalJQuery(function () {

    const _getAnimationCompletionEventName = function () {
      const _testElement = document.createElement('pseudo');
      const _eventMappings = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
      };

      return Object.keys(_eventMappings).find(propName => {
        if (_testElement.style[propName] !== undefined) {
          return true;
        }
        return false;
      }) ? _eventMappings[Object.keys(_eventMappings).find(propName => _testElement.style[propName] !== undefined)] : undefined;
    };

    const _completionEvent = _getAnimationCompletionEventName();

    globalJQuery.support.cssTransitionEnd = _completionEvent && {
      completion: _completionEvent
    };

  });

  // --- Overlay Window (Modal) Component ---

  class DialogBox {
    constructor(domNode, settings) {
      this.configuration = settings;
      this.domElement = globalJQuery(domNode);
      this.domElement.on('click.dismiss.overlayBox', '[data-dismiss="modal"]', this.conceal.bind(this));
      if (this.configuration.remote) {
        this.domElement.find('.modal-body').load(this.configuration.remote);
      }
      this.isVisible = false;
      this.overlayBackdrop = null;
    }

    alternateVisibility() {
      return this[this.isVisible ? 'conceal' : 'display']();
    }

    display() {
      const _self = this;
      const _displayEvent = globalJQuery.Event('displayRequest');

      this.domElement.trigger(_displayEvent);

      if (this.isVisible || _displayEvent.isDefaultPrevented()) {
        return;
      }

      globalJQuery('body').addClass('modal-open');
      this.isVisible = true;
      this._monitorKeyboard();

      this._createOrUpdateBackdrop(function () {
        const _isAnimated = globalJQuery.support.cssTransitionEnd && _self.domElement.hasClass('fade');

        if (!_self.domElement.parent().length) {
          _self.domElement.appendTo(document.body);
        }

        _self.domElement.show();

        if (_isAnimated) {
          _self.domElement[0].offsetWidth; // Force reflow
        }

        _self.domElement
          .addClass('in')
          .attr('aria-hidden', false)
          .focus();

        _self._constrainFocus();

        if (_isAnimated) {
          _self.domElement.one(globalJQuery.support.cssTransitionEnd.completion, function () {
            _self.domElement.trigger('displayed');
          });
        } else {
          _self.domElement.trigger('displayed');
        }
      });
    }

    conceal(eventData) {
      if (eventData) {
        eventData.preventDefault();
      }

      const _self = this;
      const _concealEvent = globalJQuery.Event('concealRequest');

      this.domElement.trigger(_concealEvent);

      if (!this.isVisible || _concealEvent.isDefaultPrevented()) {
        return;
      }

      this.isVisible = false;
      globalJQuery('body').removeClass('modal-open');
      this._monitorKeyboard(); // Disable keyboard handling
      globalJQuery(document).off('focusin.overlayBox');

      this.domElement
        .removeClass('in')
        .attr('aria-hidden', true);

      if (globalJQuery.support.cssTransitionEnd && this.domElement.hasClass('fade')) {
        this._initiateConcealmentWithAnimation();
      } else {
        this._finalizeConcealment();
      }
    }

    _constrainFocus() {
      const _self = this;
      globalJQuery(document).on('focusin.overlayBox', function (eventData) {
        if (_self.domElement[0] !== eventData.target && !_self.domElement.has(eventData.target).length) {
          _self.domElement.focus();
        }
      });
    }

    _monitorKeyboard() {
      const _self = this;
      if (this.isVisible && this.configuration.keyboard) {
        this.domElement.on('keyup.dismiss.overlayBox', function (eventData) {
          if (eventData.which === 27) { // ESC key
            _self.conceal();
          }
        });
      } else if (!this.isVisible) {
        this.domElement.off('keyup.dismiss.overlayBox');
      }
    }

    _initiateConcealmentWithAnimation() {
      const _self = this;
      const _animationTimeout = setTimeout(function () {
        _self.domElement.off(globalJQuery.support.cssTransitionEnd.completion);
        _self._finalizeConcealment();
      }, 500); // Bootstrap default timeout

      this.domElement.one(globalJQuery.support.cssTransitionEnd.completion, function () {
        clearTimeout(_animationTimeout);
        _self._finalizeConcealment();
      });
    }

    _finalizeConcealment() {
      this.domElement
        .hide()
        .trigger('hidden');

      this._createOrUpdateBackdrop();
    }

    _removeBackdropElement() {
      this.overlayBackdrop.remove();
      this.overlayBackdrop = null;
    }

    _createOrUpdateBackdrop(completionCallback) {
      const _self = this;
      const _animationClass = this.domElement.hasClass('fade') ? 'fade' : '';

      if (this.isVisible && this.configuration.backdrop) {
        const _performAnimation = globalJQuery.support.cssTransitionEnd && _animationClass;

        this.overlayBackdrop = globalJQuery('<div class="modal-backdrop ' + _animationClass + '" />')
          .appendTo(document.body);

        if (this.configuration.backdrop !== 'static') {
          this.overlayBackdrop.on('click.dismiss.overlayBox', this.conceal.bind(this));
        }

        if (_performAnimation) {
          this.overlayBackdrop[0].offsetWidth; // Force reflow
        }

        this.overlayBackdrop.addClass('in');

        if (_performAnimation) {
          this.overlayBackdrop.one(globalJQuery.support.cssTransitionEnd.completion, completionCallback);
        } else {
          completionCallback();
        }

      } else if (!this.isVisible && this.overlayBackdrop) {
        this.overlayBackdrop.removeClass('in');

        if (globalJQuery.support.cssTransitionEnd && this.domElement.hasClass('fade')) {
          this.overlayBackdrop.one(globalJQuery.support.cssTransitionEnd.completion, this._removeBackdropElement.bind(this));
        } else {
          this._removeBackdropElement();
        }

      } else if (completionCallback) {
        completionCallback();
      }
    }
  }

  // --- Overlay Window (Modal) jQuery Plugin ---

  globalJQuery.fn.overlayBox = function (option) {
    return this.each(function () {
      const _currentElement = globalJQuery(this);
      let _instance = _currentElement.data('overlayBoxInstance');
      const _combinedOptions = globalJQuery.extend({}, globalJQuery.fn.overlayBox.defaults, _currentElement.data(), typeof option === 'object' && option);

      if (!_instance) {
        _currentElement.data('overlayBoxInstance', (_instance = new DialogBox(this, _combinedOptions)));
      }
      if (typeof option === 'string') {
        _instance[option]();
      } else if (_combinedOptions.show) {
        _instance.display();
      }
    });
  };

  globalJQuery.fn.overlayBox.defaults = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  globalJQuery.fn.overlayBox.Constructor = DialogBox;

  // --- Overlay Window (Modal) Data-API ---

  globalJQuery(function () {
    globalJQuery('body').on('click.overlayBox.dataApi', '[data-toggle="modal"]', function (eventData) {
      const _triggerElement = globalJQuery(this);
      const _targetHref = _triggerElement.attr('href');
      const _targetElement = globalJQuery(_triggerElement.attr('data-target') || (_targetHref && _targetHref.replace(/.*(?=#[^\s]+$)/, '')));
      const _actionOption = _targetElement.data('overlayBoxInstance') ? 'alternateVisibility' : globalJQuery.extend({
        remote: !/#/.test(_targetHref) && _targetHref
      }, _targetElement.data(), _triggerElement.data());

      eventData.preventDefault();

      _targetElement
        .overlayBox(_actionOption)
        .one('hidden', function () {
          _triggerElement.focus();
        });
    });
  });

  // --- Pulldown Menu (Dropdown) Component ---

  const _pulldownSelector = '[data-toggle=dropdown]';

  class PulldownMenu {
    constructor(domNode) {
      const _menuElement = globalJQuery(domNode);
      _menuElement.on('click.pulldown.dataApi', this.switchState.bind(this));
      globalJQuery('html').on('click.pulldown.dataApi', function () {
        _menuElement.parent().removeClass('open');
      });
    }

    switchState(eventData) {
      const _trigger = globalJQuery(this);
      let _parentContainer;
      let _currentlyActive;

      if (_trigger.is('.disabled, :disabled')) {
        return;
      }

      _parentContainer = _resolveParentContainer(_trigger);
      _currentlyActive = _parentContainer.hasClass('open');

      _clearAllPulldowns();

      if (!_currentlyActive) {
        _parentContainer.toggleClass('open');
        _trigger.focus();
      }

      return false;
    }

    handleKeyPress(eventData) {
      let _currentTrigger;
      let _menuItems;
      let _focusedItem;
      let _parentContainer;
      let _currentlyActive;
      let _itemIndex;

      if (!/(38|40|27)/.test(eventData.keyCode)) {
        return;
      }

      _currentTrigger = globalJQuery(this);

      eventData.preventDefault();
      eventData.stopPropagation();

      if (_currentTrigger.is('.disabled, :disabled')) {
        return;
      }

      _parentContainer = _resolveParentContainer(_currentTrigger);
      _currentlyActive = _parentContainer.hasClass('open');

      if (!_currentlyActive || (_currentlyActive && eventData.keyCode === 27)) {
        return _currentTrigger.trigger('click'); // Simulates click for ESC key
      }

      _menuItems = globalJQuery('[role=menu] li:not(.divider) a', _parentContainer);

      if (!_menuItems.length) {
        return;
      }

      _itemIndex = _menuItems.index(_menuItems.filter(':focus'));

      if (eventData.keyCode === 38 && _itemIndex > 0) { // Up arrow
        _itemIndex--;
      }
      if (eventData.keyCode === 40 && _itemIndex < _menuItems.length - 1) { // Down arrow
        _itemIndex++;
      }
      if (_itemIndex < 0) { // If no item was focused or index is -1
        _itemIndex = 0;
      }

      _menuItems
        .eq(_itemIndex)
        .focus();
    }
  }

  function _clearAllPulldowns() {
    _resolveParentContainer(globalJQuery(_pulldownSelector))
      .removeClass('open');
  }

  function _resolveParentContainer(_childElement) {
    let _targetSelector = _childElement.attr('data-target');
    let _resolvedParent;

    if (!_targetSelector) {
      _targetSelector = _childElement.attr('href');
      _targetSelector = _targetSelector && /#/.test(_targetSelector) && _targetSelector.replace(/.*(?=#[^\s]*$)/, '');
    }

    _resolvedParent = globalJQuery(_targetSelector);
    if (!_resolvedParent.length) {
      _resolvedParent = _childElement.parent();
    }

    return _resolvedParent;
  }

  // --- Pulldown Menu (Dropdown) jQuery Plugin ---

  globalJQuery.fn.pulldownMenu = function (option) {
    return this.each(function () {
      const _element = globalJQuery(this);
      let _instance = _element.data('pulldownMenuInstance');
      if (!_instance) {
        _element.data('pulldownMenuInstance', (_instance = new PulldownMenu(this)));
      }
      if (typeof option === 'string') {
        _instance[option].call(_element);
      }
    });
  };

  globalJQuery.fn.pulldownMenu.Constructor = PulldownMenu;

  // --- Apply to standard pulldown elements ---

  globalJQuery(function () {
    globalJQuery('html')
      .on('click.pulldown.dataApi touchstart.pulldown.dataApi', _clearAllPulldowns);
    globalJQuery('body')
      .on('click.pulldown touchstart.pulldown.dataApi', '.dropdown form', function (eventData) {
        eventData.stopPropagation();
      })
      .on('click.pulldown.dataApi touchstart.pulldown.dataApi', _pulldownSelector, PulldownMenu.prototype.switchState)
      .on('keydown.pulldown.dataApi touchstart.pulldown.dataApi', _pulldownSelector + ', [role=menu]', PulldownMenu.prototype.handleKeyPress);
  });


  // --- Navigation Tracker (Scrollspy) Component ---

  class NavigationTracker {
    constructor(trackedElement, options) {
      const _processScroll = this.updateActiveState.bind(this);
      let _anchorLink;
      this.trackerOptions = globalJQuery.extend({}, globalJQuery.fn.navigationTracker.defaults, options);
      this.scrollSource = globalJQuery(trackedElement).is('body') ? globalJQuery(window) : globalJQuery(trackedElement);
      this.scrollSource.on('scroll.tracker.dataApi', _processScroll);
      this.linkIdentifier = (this.trackerOptions.target || ((_anchorLink = globalJQuery(trackedElement).attr('href')) && _anchorLink.replace(/.*(?=#[^\s]+$)/, '')) || '') + ' .nav li > a';
      this.documentBody = globalJQuery('body');
      this.sectionBoundaryMap = []; // Stores boundary info {top, bottom, id}
      this.activeTarget = null;
      this.scrolling = false;

      this.recalculatePositions();
      this.updateActiveState();
    }

    recalculatePositions() {
      const _self = this;
      const _scrollOffset = this.scrollSource.is(globalJQuery(window)) ? 0 : this.scrollSource.offset().top;
      const _offsetCorrection = this.trackerOptions.offset || 0;

      this.sectionBoundaryMap = [];
      this.scrollSource.find(this.linkIdentifier).map(function () {
        const _element = globalJQuery(this);
        const _href = _element.data('target') || _element.attr('href');
        if (!/^#\w/.test(_href)) return null; // Skip invalid hrefs

        const _target = globalJQuery(_href);
        if (!_target.length) return null;

        return {
          top: _target.offset().top - _scrollOffset - _offsetCorrection,
          id: _href
        };
      })
      .filter(entry => entry !== null)
      .sort((a, b) => a.top - b.top)
      .forEach((entry, idx, arr) => {
        // Calculate bottom based on next element's top or document height
        entry.bottom = (idx + 1 < arr.length) ? arr[idx + 1].top : this.documentBody.height();
        _self.sectionBoundaryMap.push(entry);
      });
    }

    updateActiveState() {
      if (this.scrolling) return; // Prevent multiple updates during one scroll
      this.scrolling = true;

      requestAnimationFrame(() => {
        const _scrollTop = this.scrollSource.scrollTop();
        const _scrollHeight = this.scrollSource[0].scrollHeight || this.documentBody[0].scrollHeight;
        const _viewportHeight = this.scrollSource.height();
        const _maxScroll = _scrollHeight - _viewportHeight;

        let _newActiveTarget;

        if (_scrollTop >= _maxScroll) {
          // If at the very bottom, activate the last item
          _newActiveTarget = this.sectionBoundaryMap.length ? this.sectionBoundaryMap[this.sectionBoundaryMap.length - 1].id : null;
        } else {
          _newActiveTarget = this.sectionBoundaryMap.find(entry => _scrollTop >= entry.top && _scrollTop < entry.bottom)?.id;
        }

        if (_newActiveTarget && this.activeTarget !== _newActiveTarget) {
          this._activateTarget(_newActiveTarget);
        } else if (!_newActiveTarget && this.activeTarget) {
          this._deactivateCurrentTarget();
        }
        this.scrolling = false;
      });
    }

    _activateTarget(targetId) {
      this._deactivateCurrentTarget();

      this.activeTarget = targetId;

      const _selector = this.linkIdentifier + '[href="' + targetId + '"]';
      const _parentList = globalJQuery(_selector).parent('li');

      _parentList.addClass('active');
      _parentList.parent('.dropdown-menu').length && _parentList.closest('li.dropdown').addClass('active');

      this.scrollSource.trigger('activate.tracker', targetId);
    }

    _deactivateCurrentTarget() {
      if (!this.activeTarget) return;

      const _selector = this.linkIdentifier + '[href="' + this.activeTarget + '"]';
      const _parentList = globalJQuery(_selector).parent('li');

      _parentList.removeClass('active');
      _parentList.parent('.dropdown-menu').length && _parentList.closest('li.dropdown').removeClass('active');
      this.activeTarget = null;
    }
  }

  // --- Navigation Tracker (Scrollspy) jQuery Plugin ---

  globalJQuery.fn.navigationTracker = function (option) {
    return this.each(function () {
      const _element = globalJQuery(this);
      let _instance = _element.data('navigationTrackerInstance');
      const _options = typeof option === 'object' && option;

      if (!_instance) {
        _element.data('navigationTrackerInstance', (_instance = new NavigationTracker(this, _options)));
      }
      if (typeof option === 'string') {
        _instance[option]();
      }
    });
  };

  globalJQuery.fn.navigationTracker.defaults = {
    offset: 10
  };

  globalJQuery.fn.navigationTracker.Constructor = NavigationTracker;


  // --- Apply to standard scrollspy elements ---

  globalJQuery(function () {
    globalJQuery('[data-spy="scroll"]').each(function () {
      const _element = globalJQuery(this);
      _element.navigationTracker(_element.data());
    });
  });

}(window.jQuery));