class DynamicHeaderEffectController {
  constructor(baseElement, customSettings = {}) {
    this.rootElement = baseElement;
    this.configuration = Object.assign({}, DynamicHeaderEffectController.defaultConfiguration, customSettings);

    this.visualStyleLayers = {};
    this.layerDimensions = { topOffset: 0, currentHeight: 0 };
    this.pageSections = []; // DOM elements with data-header-style
    this.sectionMetrics = []; // Processed data for each page section

    this.currentScrollPosition = 0;
    this.totalPageHeight = 0;
    this.cssTransformProperty = this.detectCssTransformSupport();

    this.animationLoopId = null; // For requestAnimationFrame cancellation
    this.resizeDebounceId = null; // For debouncing resize events
    this.mutationRecalculateTimer = null; // For debouncing mutation observer

    this.initializeEffectLogic();
  }

  static defaultConfiguration = {
    outerLayerClass: 'visualWrapper',
    innerContentHolderClass: 'visualContent',
    defaultFallbackClass: 'defaultStyle',
    styleNamePrefix: ''
  };

  initializeEffectLogic() {
    this.currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.totalPageHeight = document.body.scrollHeight || document.documentElement.scrollHeight;

    this.performInitialSetup();

    window.addEventListener('resize', this.handleWindowResize.bind(this));
    // No explicit scroll listener needed if rAF loop handles updates
    // The original's setInterval for _recalculateSections is replaced by MutationObserver
    this.setupContentMutationObserver();

    this.startContinuousUpdateLoop();
  }

  performInitialSetup() {
    this.layerDimensions = {
      topOffset: 0,
      currentHeight: this.rootElement.offsetHeight
    };

    this.pageSections = Array.from(document.querySelectorAll('[data-header-style]'));
    this.sectionMetrics = [];

    this.prepareHeaderLayers();
    this.updateAllSectionMetrics();
    this.adjustRootLayerHeight();
    this.determineVisibleLayers();
    this.applyLayerStyling();
  }

  handleWindowResize() {
    clearTimeout(this.resizeDebounceId);
    this.resizeDebounceId = setTimeout(() => {
      this.reassessLayoutDimensions();
    }, 150); // Debounce resize events
  }

  reassessLayoutDimensions() {
    this.updateAllSectionMetrics();
    this.adjustRootLayerHeight();
    this.determineVisibleLayers();
    this.applyLayerStyling();
  }

  detectCssTransformSupport() {
    const potentialProperties = ['transform', 'webkitTransform', 'mozTransform', 'oTransform', 'msTransform'];
    const testDiv = document.createElement('div');
    for (const prop of potentialProperties) {
      if (testDiv.style[prop] !== undefined) {
        return prop;
      }
    }
    return false;
  }

  measureLayerHeight() {
    let maximumDimension = 0;
    const styleWrappers = this.rootElement.querySelectorAll(`> .${this.configuration.outerLayerClass}`);
    if (styleWrappers.length) {
      styleWrappers.forEach(wrapper => {
        const innerElement = wrapper.querySelector(`> .${this.configuration.innerContentHolderClass}`);
        let currentDimension = 0;

        if (innerElement) {
          innerElement.style.bottom = 'auto'; // Temporarily adjust to get full height
          innerElement.style.overflow = 'auto'; // Original had this for chrome 41 issue
          currentDimension = innerElement.offsetHeight;
          innerElement.style.bottom = '0';
        } else {
          wrapper.style.bottom = 'auto';
          currentDimension = wrapper.offsetHeight;
          wrapper.style.bottom = '0';
        }
        if (currentDimension > maximumDimension) {
          maximumDimension = currentDimension;
        }
      });
    } else {
      maximumDimension = this.rootElement.offsetHeight;
    }
    return maximumDimension;
  }

  prepareHeaderLayers() {
    const { outerLayerClass, innerContentHolderClass, defaultFallbackClass } = this.configuration;

    this.visualStyleLayers = {};
    this.visualStyleLayers[defaultFallbackClass] = { domElement: null, innerElement: null, sourceDirection: '', revealProgress: 0.0 };

    this.pageSections.forEach(element => {
      const styleIdentifier = element.dataset.headerStyle;
      if (typeof styleIdentifier === 'string' && styleIdentifier.trim() !== '') {
        this.visualStyleLayers[styleIdentifier.trim()] = { domElement: null, innerElement: null, sourceDirection: '', revealProgress: 0.0 };
      }
    });

    Object.assign(this.rootElement.style, {
      position: 'fixed', top: '0', left: '0', right: '0', overflow: 'hidden'
    });
    this.adjustRootLayerHeight();

    let allContainerWrappers = Array.from(this.rootElement.querySelectorAll(`> .${outerLayerClass}`));
    let defaultContainerInstance = allContainerWrappers.find(el => el.classList.contains(defaultFallbackClass));

    if (!defaultContainerInstance) {
      if (allContainerWrappers.length > 0) {
        defaultContainerInstance = allContainerWrappers[0].cloneNode(true);
        defaultContainerInstance.classList.remove(...Array.from(defaultContainerInstance.classList).filter(cls => cls !== outerLayerClass));
        defaultContainerInstance.classList.add(defaultFallbackClass);
        this.rootElement.appendChild(defaultContainerInstance);
      } else {
        const contentNodes = Array.from(this.rootElement.childNodes);
        defaultContainerInstance = document.createElement('div');
        defaultContainerInstance.classList.add(outerLayerClass, defaultFallbackClass);
        contentNodes.forEach(node => defaultContainerInstance.appendChild(node));
        this.rootElement.appendChild(defaultContainerInstance);
      }
      allContainerWrappers.push(defaultContainerInstance);
    }
    this.visualStyleLayers[defaultFallbackClass].domElement = defaultContainerInstance;

    const baseContainerTemplate = defaultContainerInstance.cloneNode(true);
    baseContainerTemplate.classList.remove(defaultFallbackClass);

    for (const styleName in this.visualStyleLayers) {
      if (!this.visualStyleLayers.hasOwnProperty(styleName)) continue;

      let currentLayerDom = this.visualStyleLayers[styleName].domElement;

      if (!currentLayerDom) {
        currentLayerDom = allContainerWrappers.find(el => el.classList.contains(styleName));
        if (!currentLayerDom) {
          currentLayerDom = baseContainerTemplate.cloneNode(true);
          currentLayerDom.classList.add(styleName);
          this.rootElement.appendChild(currentLayerDom);
        }
        this.visualStyleLayers[styleName].domElement = currentLayerDom;
      }

      Object.assign(currentLayerDom.style, {
        position: 'absolute', overflow: 'hidden', top: '0', left: '0', right: '0', bottom: '0'
      });
      if (this.cssTransformProperty) {
        currentLayerDom.style[this.cssTransformProperty] = 'translateZ(0)';
      }

      let contentInnerDom = currentLayerDom.querySelector(`> .${innerContentHolderClass}`);
      if (!contentInnerDom) {
        const nodesToWrap = Array.from(currentLayerDom.childNodes).filter(node =>
          node.nodeType === Node.ELEMENT_NODE && (!node.classList || !node.classList.contains(innerContentHolderClass))
        );
        contentInnerDom = document.createElement('div');
        contentInnerDom.classList.add(innerContentHolderClass);
        nodesToWrap.forEach(child => contentInnerDom.appendChild(child));
        currentLayerDom.appendChild(contentInnerDom);
      }
      this.visualStyleLayers[styleName].innerElement = contentInnerDom;

      Object.assign(contentInnerDom.style, {
        position: 'absolute', overflow: 'hidden', top: '0', left: '0', right: '0', bottom: '0'
      });
      if (this.cssTransformProperty) {
        contentInnerDom.style[this.cssTransformProperty] = 'translateZ(0)';
      }
    }

    allContainerWrappers.forEach(wrapper => {
      let isManaged = false;
      for (const styleName in this.visualStyleLayers) {
        if (this.visualStyleLayers.hasOwnProperty(styleName) && wrapper === this.visualStyleLayers[styleName].domElement) {
          isManaged = true;
          break;
        }
      }
      wrapper.style.display = isManaged ? '' : 'none';
    });
  }

  determineVisibleLayers() {
    this.currentScrollPosition = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    this.currentScrollPosition = Math.max(this.currentScrollPosition, 0);
    this.totalPageHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
    this.currentScrollPosition = Math.min(this.currentScrollPosition, this.totalPageHeight - window.innerHeight);

    const currentHeaderHeight = this.layerDimensions.currentHeight;
    let headerViewStart = this.currentScrollPosition + this.layerDimensions.topOffset;
    let headerViewEnd = headerViewStart + currentHeaderHeight;

    if (typeof window.getComputedStyle === 'function') {
      const computedStyle = window.getComputedStyle(this.rootElement);
      let topValue = 0.0;
      let transformYValue = 0.0;

      if (this.cssTransformProperty && computedStyle[this.cssTransformProperty]) {
        const transformMatrix = computedStyle[this.cssTransformProperty].match(/(-?[0-9\.]+)/g);
        if (transformMatrix && transformMatrix.length >= 6 && !isNaN(parseFloat(transformMatrix[5]))) {
          transformYValue = parseFloat(transformMatrix[5]);
        }
      }
      if (computedStyle.top && computedStyle.top.indexOf('px') >= 0 && !isNaN(parseFloat(computedStyle.top))) {
        topValue = parseFloat(computedStyle.top);
      }
      headerViewStart += topValue + transformYValue;
      headerViewEnd += topValue + transformYValue;
    }

    for (const styleName in this.visualStyleLayers) {
      if (this.visualStyleLayers.hasOwnProperty(styleName)) {
        this.visualStyleLayers[styleName].sourceDirection = '';
        this.visualStyleLayers[styleName].revealProgress = 0.0;
      }
    }

    this.sectionMetrics.forEach(section => {
      if (headerViewEnd >= section.startPosition && headerViewStart <= section.endPosition) {
        this.visualStyleLayers[section.styleName].isVisible = true;

        if (headerViewStart >= section.startPosition && headerViewEnd <= section.endPosition) {
          this.visualStyleLayers[section.styleName].sourceDirection = 'top';
          this.visualStyleLayers[section.styleName].revealProgress += 1.0;
        } else if (headerViewEnd > section.endPosition && headerViewStart < section.endPosition) {
          this.visualStyleLayers[section.styleName].sourceDirection = 'top';
          this.visualStyleLayers[section.styleName].revealProgress = 1.0 - (headerViewEnd - section.endPosition) / currentHeaderHeight;
        } else if (headerViewEnd > section.startPosition && headerViewStart < section.startPosition) {
          if (this.visualStyleLayers[section.styleName].sourceDirection === 'top') {
            this.visualStyleLayers[section.styleName].revealProgress += (headerViewEnd - section.startPosition) / currentHeaderHeight;
          } else {
            this.visualStyleLayers[section.styleName].sourceDirection = 'bottom';
            this.visualStyleLayers[section.styleName].revealProgress = (headerViewEnd - section.startPosition) / currentHeaderHeight;
          }
        }
      }
    });
  }

  applyLayerStyling() {
    const defaultStyleId = this.configuration.defaultFallbackClass;
    if (!this.visualStyleLayers[defaultStyleId]) { return; }

    let accumulatedProgress = 0.0;
    let lastActiveStyle = '';

    for (const styleName in this.visualStyleLayers) {
      if (this.visualStyleLayers.hasOwnProperty(styleName) && this.visualStyleLayers[styleName].sourceDirection !== '') {
        accumulatedProgress += this.visualStyleLayers[styleName].revealProgress;
        lastActiveStyle = styleName;
      }
    }

    if (accumulatedProgress < 1.0) {
      if (this.visualStyleLayers[defaultStyleId].sourceDirection === '') {
        this.visualStyleLayers[defaultStyleId].sourceDirection = (this.visualStyleLayers[lastActiveStyle] && this.visualStyleLayers[lastActiveStyle].sourceDirection === 'top') ? 'bottom' : 'top';
        this.visualStyleLayers[defaultStyleId].revealProgress = 1.0 - accumulatedProgress;
      } else {
        this.visualStyleLayers[defaultStyleId].revealProgress += (1.0 - accumulatedProgress);
      }
    }

    for (const styleName in this.visualStyleLayers) {
      if (!this.visualStyleLayers.hasOwnProperty(styleName)) continue;

      const layerData = this.visualStyleLayers[styleName];
      if (!layerData.domElement || !layerData.innerElement) continue;

      if (layerData.sourceDirection === '') {
        // Hide inactive layers completely off-screen
        if (this.cssTransformProperty) {
          layerData.domElement.style[this.cssTransformProperty] = 'translateY(-110%) translateZ(0)';
          layerData.innerElement.style[this.cssTransformProperty] = 'translateY(110%) translateZ(0)';
        } else {
          layerData.domElement.style.top = '-110%';
          layerData.innerElement.style.top = '110%';
        }
        continue;
      }

      let percentOffset = (1.0 - layerData.revealProgress) * 100.0;

      if (layerData.sourceDirection === 'top') {
        if (this.cssTransformProperty) {
          layerData.domElement.style[this.cssTransformProperty] = `translateY(-${percentOffset}%) translateZ(0)`;
          layerData.innerElement.style[this.cssTransformProperty] = `translateY(+${percentOffset}%) translateZ(0)`;
        } else {
          layerData.domElement.style.top = `-${percentOffset}%`;
          layerData.innerElement.style.top = `+${percentOffset}%`;
        }
      } else { // sourceDirection === 'bottom'
        if (this.cssTransformProperty) {
          layerData.domElement.style[this.cssTransformProperty] = `translateY(+${percentOffset}%) translateZ(0)`;
          layerData.innerElement.style[this.cssTransformProperty] = `translateY(-${percentOffset}%) translateZ(0)`;
        } else {
          layerData.domElement.style.top = `+${percentOffset}%`;
          layerData.innerElement.style.top = `-${percentOffset}%`;
        }
      }
    }
  }

  updateAllSectionMetrics() {
    this.totalPageHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
    this.sectionMetrics = this.pageSections.map(element => {
      const bounds = element.getBoundingClientRect();
      return {
        domElement: element,
        styleName: element.dataset.headerStyle,
        startPosition: bounds.top + window.pageYOffset,
        endPosition: bounds.top + window.pageYOffset + element.offsetHeight
      };
    });
  }

  adjustRootLayerHeight() {
    this.layerDimensions.currentHeight = this.measureLayerHeight();
    this.rootElement.style.height = `${this.layerDimensions.currentHeight}px`;
  }

  startContinuousUpdateLoop() {
    const updateTick = () => {
      this.determineVisibleLayers();
      this.applyLayerStyling();
      this.animationLoopId = requestAnimationFrame(updateTick);
    };
    this.animationLoopId = requestAnimationFrame(updateTick);
  }

  setupContentMutationObserver() {
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }
    const observerConfig = { attributes: true, childList: true, subtree: true };
    this.contentObserver = new MutationObserver(this.handleContentMutations.bind(this));
    this.contentObserver.observe(document.body, observerConfig);
  }

  handleContentMutations(mutationRecords, observer) {
    let requiresLayoutReassessment = false;
    for (const record of mutationRecords) {
      if (record.type === 'childList' || (record.type === 'attributes' && record.attributeName === 'style')) {
        // Simple check, could be optimized to check only relevant nodes
        requiresLayoutReassessment = true;
        break;
      }
    }
    if (requiresLayoutReassessment) {
      clearTimeout(this.mutationRecalculateTimer);
      this.mutationRecalculateTimer = setTimeout(() => {
        this.reassessLayoutDimensions();
      }, 100); // Debounce mutations
    }
  }

  cleanupEffect() {
    if (this.animationLoopId) {
      cancelAnimationFrame(this.animationLoopId);
    }
    clearTimeout(this.resizeDebounceId);
    clearTimeout(this.mutationRecalculateTimer);
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }

    Object.assign(this.rootElement.style, {
      position: '', top: '', left: '', right: '', overflow: '', height: ''
    });

    for (const styleName in this.visualStyleLayers) {
      if (this.visualStyleLayers.hasOwnProperty(styleName)) {
        const layerData = this.visualStyleLayers[styleName];
        if (layerData.domElement) {
          Object.assign(layerData.domElement.style, {
            position: '', overflow: '', top: '', left: '', right: '', bottom: '', display: ''
          });
          if (this.cssTransformProperty) layerData.domElement.style[this.cssTransformProperty] = '';
        }
        if (layerData.innerElement) {
          Object.assign(layerData.innerElement.style, {
            position: '', overflow: '', top: '', left: '', right: '', bottom: ''
          });
          if (this.cssTransformProperty) layerData.innerElement.style[this.cssTransformProperty] = '';
        }
      }
    }
    // More complex cleanup (e.g., unwrapping content) is omitted for brevity and to avoid destructive changes.
  }
}

// Global exposure and auto-initialization mechanism
(function () {
  if (typeof window.requestAnimationFrame === 'undefined') {
    window.requestAnimationFrame = function (callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
    window.cancelAnimationFrame = function (id) {
      window.clearTimeout(id);
    };
  }

  window.DynamicHeaderEffectController = DynamicHeaderEffectController;

  document.addEventListener('DOMContentLoaded', () => {
    const headerTargets = document.querySelectorAll('[data-dynamic-header-init]');
    headerTargets.forEach(targetElement => {
      if (!targetElement.__effectInstance__) { // Prevent double initialization
        targetElement.__effectInstance__ = new DynamicHeaderEffectController(targetElement, {});
      }
    });
  });
})();