(function() {

  const baseConfig = {
    rangeIndicators: {
      'lessThan100': '',
      'lessThan240': '',
      'lessThan320': '',
      'lessThan500': '',
      'lessThan640': '',
      'lessThan1024': '',
    },
    lineHeight: 120,
    maximumLineHeight: 0,
    spacing: 1,
    boundary: -1,
    finalLineBehavior: 'noAdjust',
    adjustmentThreshold: 0.75,
    fixedDimension: false,
    awaitVisualsLoad: true,
    displayOverlays: true,
    animateCSS: false,
    visualAnimationDuration: 500,
    overlaySettings: {
      animationDuration: 500,
      visibleLevel: 0.7,
      hiddenLevel: 0.0
    },
    groupRelation: null,
    linkTarget: null,
    fileExtensionPattern: /\.[^.\\/]+$/,
    refreshInterval: 100,
    randomizeOrder: false
  };

  function stringEndsWith(fullString, endPart) {
    return fullString.indexOf(endPart, fullString.length - endPart.length) !== -1;
  }

  function trimStringEnd(fullString, endPart) {
    return fullString.substring(0, fullString.length - endPart.length);
  }

  function observeVisualLoad(sourcePath, completionCallback) {
    const temporaryImage = new Image();
    temporaryImage.onload = () => completionCallback(true);
    temporaryImage.onerror = () => completionCallback(false);
    temporaryImage.src = sourcePath;
  }

  class PhotoGridManager {

    constructor(containerElement, initialConfig) {
      if (!containerElement) {
        throw new Error("Container element not provided for PhotoGridManager.");
      }
      this.containerElement = containerElement;
      this.config = this.mergeConfigurations(baseConfig, initialConfig);

      this.itemElements = Array.from(this.containerElement.querySelectorAll('a, div')).filter(el => el.querySelector('img'));
      if (this.config.randomizeOrder) {
        this.itemElements.sort(() => Math.random() - 0.5);
      }

      this.processedItemIndex = -1;
      this.currentSegment = { items: [], totalRatio: 0, cumulativeWidth: 0 };
      this.currentYCoordinate = this.effectiveBoundary();
      this.containerWidth = 0;

      this.layoutProcessHandle = null;
      this.yieldCounter = 0;
      this.yieldLimit = 1;

      this.resizeMonitorHandle = null;

      this.spinnerState = {
        active: false,
        element: null,
        points: null,
        animationTimer: null,
        phase: 0,
        slotDuration: 100
      };

      this.setupInitialState();
      this.validateConfiguration();
      this.initiateLayoutProcessing(false);
      this.monitorContainerResizing();
    }

    mergeConfigurations(defaults, overrides) {
      const merged = { ...defaults };
      for (const key in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, key)) {
          if (typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key]) && typeof merged[key] === 'object') {
            merged[key] = { ...merged[key], ...overrides[key] };
          } else {
            merged[key] = overrides[key];
          }
        }
      }
      return merged;
    }

    effectiveBoundary() {
      return this.config.boundary >= 0 ? this.config.boundary : this.config.spacing;
    }

    validateConfiguration() {
      const cfg = this.config;

      function ensureNumeric(parentObj, propName) {
        if (typeof parentObj[propName] === 'string') {
          parentObj[propName] = parseFloat(parentObj[propName]);
          if (isNaN(parentObj[propName])) throw new Error(`Invalid numeric value for ${propName}`);
        } else if (typeof parentObj[propName] !== 'number' || isNaN(parentObj[propName])) {
          throw new Error(`${propName} must be a number`);
        }
      }

      if (typeof cfg.rangeIndicators !== 'object' || cfg.rangeIndicators === null) {
        throw new Error('rangeIndicators must be an object');
      }
      for (const key in cfg.rangeIndicators) {
        if (typeof cfg.rangeIndicators[key] !== 'string') {
          throw new Error(`rangeIndicators.${key} must be a string`);
        }
      }

      ensureNumeric(cfg, 'lineHeight');
      ensureNumeric(cfg, 'maximumLineHeight');
      if (cfg.maximumLineHeight > 0 && cfg.maximumLineHeight < cfg.lineHeight) {
        cfg.maximumLineHeight = cfg.lineHeight;
      }

      ensureNumeric(cfg, 'spacing');
      ensureNumeric(cfg, 'boundary');

      if (!['noAdjust', 'adjust', 'hide'].includes(cfg.finalLineBehavior)) {
        throw new Error('finalLineBehavior must be "noAdjust", "adjust" or "hide"');
      }

      ensureNumeric(cfg, 'adjustmentThreshold');
      if (cfg.adjustmentThreshold < 0 || cfg.adjustmentThreshold > 1) {
        throw new Error('adjustmentThreshold must be between 0 and 1');
      }

      if (typeof cfg.fixedDimension !== 'boolean') {
        throw new Error('fixedDimension must be a boolean');
      }
      if (typeof cfg.awaitVisualsLoad !== 'boolean') {
        throw new Error('awaitVisualsLoad must be a boolean');
      }
      if (typeof cfg.displayOverlays !== 'boolean') {
        throw new Error('displayOverlays must be a boolean');
      }
      if (typeof cfg.animateCSS !== 'boolean') {
        throw new Error('animateCSS must be a boolean');
      }

      ensureNumeric(cfg, 'visualAnimationDuration');

      if (typeof cfg.overlaySettings !== 'object' || cfg.overlaySettings === null) {
        throw new Error('overlaySettings must be an object');
      }
      ensureNumeric(cfg.overlaySettings, 'animationDuration');
      ensureNumeric(cfg.overlaySettings, 'visibleLevel');
      ensureNumeric(cfg.overlaySettings, 'hiddenLevel');

      if (cfg.groupRelation !== null && typeof cfg.groupRelation !== 'string') {
        throw new Error('groupRelation must be a string or null');
      }
      if (cfg.linkTarget !== null && typeof cfg.linkTarget !== 'string') {
        throw new Error('linkTarget must be a string or null');
      }
      if (!(cfg.fileExtensionPattern instanceof RegExp)) {
        throw new Error('fileExtensionPattern must be a RegExp object');
      }
      ensureNumeric(cfg, 'refreshInterval');
      if (typeof cfg.randomizeOrder !== 'boolean') {
        throw new Error('randomizeOrder must be a boolean');
      }
    }

    deriveSizeKey(visualWidth, visualHeight) {
      const longestSide = Math.max(visualWidth, visualHeight);
      if (longestSide <= 100) return this.config.rangeIndicators.lessThan100;
      if (longestSide <= 240) return this.config.rangeIndicators.lessThan240;
      if (longestSide <= 320) return this.config.rangeIndicators.lessThan320;
      if (longestSide <= 500) return this.config.rangeIndicators.lessThan500;
      if (longestSide <= 640) return this.config.rangeIndicators.lessThan640;
      return this.config.rangeIndicators.lessThan1024;
    }

    findAppliedTag(sourceString) {
      let emptyTagFound = false;
      for (const key in this.config.rangeIndicators) {
        const tag = this.config.rangeIndicators[key];
        if (tag.length === 0) {
          emptyTagFound = true;
          continue;
        }
        if (stringEndsWith(sourceString, tag)) {
          return tag;
        }
      }
      if (emptyTagFound) return "";
      throw new Error(`Unknown tag for ${sourceString}`);
    }

    generateOptimizedSource(originalSource, visualWidth, visualHeight) {
      const matchResult = originalSource.match(this.config.fileExtensionPattern);
      const fileExtension = matchResult ? matchResult[0] : '';
      let processedSource = originalSource.replace(this.config.fileExtensionPattern, '');
      processedSource = trimStringEnd(processedSource, this.findAppliedTag(processedSource));
      processedSource += this.deriveSizeKey(visualWidth, visualHeight) + fileExtension;
      return processedSource;
    }

    handleOverlayDisplayActivation(event) {
      const overlayElement = event.currentTarget.querySelector('.caption');
      if (!overlayElement) return;

      if (this.config.animateCSS) {
        overlayElement.classList.add('caption-visible');
        overlayElement.classList.remove('caption-hidden');
      } else {
        this.animateOpacity(overlayElement, this.config.overlaySettings.visibleLevel, this.config.overlaySettings.animationDuration);
      }
    }

    handleOverlayDisplayDeactivation(event) {
      const overlayElement = event.currentTarget.querySelector('.caption');
      if (!overlayElement) return;

      if (this.config.animateCSS) {
        overlayElement.classList.remove('caption-visible');
        overlayElement.classList.add('caption-hidden');
      } else {
        this.animateOpacity(overlayElement, this.config.overlaySettings.hiddenLevel, this.config.overlaySettings.animationDuration);
      }
    }

    animateOpacity(element, targetOpacity, duration) {
      if (element._animationFrame) {
        cancelAnimationFrame(element._animationFrame);
      }
      const startOpacity = parseFloat(element.style.opacity || '0');
      const startTime = performance.now();

      const performAnimation = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        element.style.opacity = startOpacity + (targetOpacity - startOpacity) * progress;

        if (progress < 1) {
          element._animationFrame = requestAnimationFrame(performAnimation);
        } else {
          element._animationFrame = null;
        }
      };
      element._animationFrame = requestAnimationFrame(performAnimation);
    }

    revealVisual(itemElement, completionCallback) {
      if (this.config.animateCSS) {
        itemElement.classList.add('entry-visible');
        completionCallback();
      } else {
        this.animateOpacity(itemElement, 1.0, this.config.visualAnimationDuration);
        setTimeout(completionCallback, this.config.visualAnimationDuration);
      }
    }

    concealVisualInstantly(itemElement) {
      if (this.config.animateCSS) {
        itemElement.classList.remove('entry-visible');
      } else {
        this.animateOpacity(itemElement, 0, 0);
      }
    }

    extractMainVisual(itemElement) {
      let visual = itemElement.querySelector('img');
      if (!visual) {
        visual = itemElement.querySelector('a > img');
      }
      return visual;
    }

    positionAndStyleItem(itemElement, xCoord, yCoord, visualWidth, visualHeight, segmentHeight) {
      const mainVisual = this.extractMainVisual(itemElement);
      mainVisual.style.width = `${visualWidth}px`;
      mainVisual.style.height = `${visualHeight}px`;
      mainVisual.style.marginLeft = `${-visualWidth / 2}px`;
      mainVisual.style.marginTop = `${-visualHeight / 2}px`;

      itemElement.style.width = `${visualWidth}px`;
      itemElement.style.height = `${segmentHeight}px`;
      itemElement.style.top = `${yCoord}px`;
      itemElement.style.left = `${xCoord}px`;

      const currentVisualSrc = mainVisual.src;
      const optimizedVisualSrc = this.generateOptimizedSource(currentVisualSrc, visualWidth, visualHeight);

      mainVisual.onerror = () => {
        mainVisual.src = mainVisual._originalSrc;
      };

      const visualData = mainVisual._visualData;
      const loadOptimized = () => {
        if (currentVisualSrc !== optimizedVisualSrc) {
          mainVisual.src = optimizedVisualSrc;
        }
      };

      if (visualData && visualData.status === 'skipped') {
        observeVisualLoad(currentVisualSrc, (success) => {
          if (success) {
            this.revealVisual(itemElement, loadOptimized);
            visualData.status = 'loaded';
          } else {
            visualData.status = 'error';
          }
        });
      } else {
        this.revealVisual(itemElement, loadOptimized);
      }

      let overlayEvents = itemElement._overlayEvents;
      if (this.config.displayOverlays) {
        let overlayElement = itemElement.querySelector('.caption');
        if (!overlayElement) {
          const captionText = mainVisual.alt || itemElement.title;
          if (captionText) {
            overlayElement = document.createElement('div');
            overlayElement.className = 'caption';
            overlayElement.textContent = captionText;
            itemElement.appendChild(overlayElement);
          }
        }

        if (overlayElement) {
          if (!this.config.animateCSS) {
            this.animateOpacity(overlayElement, this.config.overlaySettings.hiddenLevel, this.config.visualAnimationDuration);
          }
          if (!overlayEvents) {
            overlayEvents = {
              enter: this.handleOverlayDisplayActivation.bind(this),
              leave: this.handleOverlayDisplayDeactivation.bind(this)
            };
            itemElement.addEventListener('mouseenter', overlayEvents.enter);
            itemElement.addEventListener('mouseleave', overlayEvents.leave);
            itemElement._overlayEvents = overlayEvents;
          }
        }
      } else {
        if (overlayEvents) {
          itemElement.removeEventListener('mouseenter', overlayEvents.enter);
          itemElement.removeEventListener('mouseleave', overlayEvents.leave);
          delete itemElement._overlayEvents;
        }
      }
    }

    calculateSegmentDimensions(segmentItems, isFinalSegment) {
      const cfg = this.config;
      let currentItemRatioSum = 0;

      for (const item of segmentItems) {
        const visual = this.extractMainVisual(item);
        const visualData = visual._visualData;
        currentItemRatioSum += visualData.width / visualData.height;
      }

      const availableSpace = this.containerWidth - 2 * this.effectiveBoundary() - ((segmentItems.length - 1) * cfg.spacing);
      let calculatedLineHeight = availableSpace / currentItemRatioSum;
      const segmentTotalWidth = currentItemRatioSum * cfg.lineHeight; // Used for justification threshold
      const needsAdjustment = (segmentTotalWidth / availableSpace) > cfg.adjustmentThreshold;

      let shouldAdjust = true;

      if (isFinalSegment && cfg.finalLineBehavior === 'hide' && !needsAdjustment) {
        for (const item of segmentItems) {
          this.concealVisualInstantly(item);
        }
        return { minimumHeight: -1 };
      }

      if (isFinalSegment && !needsAdjustment && cfg.finalLineBehavior === 'noAdjust') {
        shouldAdjust = false;
      }

      let minCalculatedHeight = 0;
      let remainingAvailableSpace = availableSpace;

      for (let i = 0; i < segmentItems.length; i++) {
        const item = segmentItems[i];
        const visual = this.extractMainVisual(item);
        const visualData = visual._visualData;
        const itemRatio = visualData.width / visualData.height;

        let newVisualWidth, newVisualHeight;
        if (shouldAdjust) {
          newVisualWidth = (i === segmentItems.length - 1) ? remainingAvailableSpace : calculatedLineHeight * itemRatio;
          newVisualHeight = calculatedLineHeight;
        } else {
          newVisualWidth = cfg.lineHeight * itemRatio;
          newVisualHeight = cfg.lineHeight;
        }

        remainingAvailableSpace -= Math.round(newVisualWidth);
        visualData.computedWidth = Math.round(newVisualWidth);
        visualData.computedHeight = Math.ceil(newVisualHeight);
        if (i === 0 || minCalculatedHeight > newVisualHeight) {
          minCalculatedHeight = newVisualHeight;
        }
      }

      if (cfg.fixedDimension && minCalculatedHeight > cfg.lineHeight) {
        minCalculatedHeight = cfg.lineHeight;
      }

      return { minimumHeight: minCalculatedHeight, doAdjust: shouldAdjust };
    }

    resetArrangementState() {
      this.processedItemIndex = -1;
      this.currentSegment = { items: [], totalRatio: 0, cumulativeWidth: 0 };
      this.currentYCoordinate = this.effectiveBoundary();
    }

    renderSegment(segmentItems, isFinalSegment) {
      const cfg = this.config;
      const segmentResults = this.calculateSegmentDimensions(segmentItems, isFinalSegment);
      let segmentActualHeight = segmentResults.minimumHeight;

      if (isFinalSegment && cfg.finalLineBehavior === 'hide' && segmentActualHeight === -1) {
        this.currentSegment = { items: [], totalRatio: 0, cumulativeWidth: 0 };
        return;
      }

      if (cfg.maximumLineHeight > 0 && cfg.maximumLineHeight < segmentActualHeight) {
        segmentActualHeight = cfg.maximumLineHeight;
      } else if (cfg.maximumLineHeight === 0 && (1.5 * cfg.lineHeight) < segmentActualHeight) {
        segmentActualHeight = 1.5 * cfg.lineHeight;
      }

      let currentXCoordinate = this.effectiveBoundary();

      for (const item of segmentItems) {
        const visual = this.extractMainVisual(item);
        const visualData = visual._visualData;
        this.positionAndStyleItem(item, currentXCoordinate, this.currentYCoordinate, visualData.computedWidth, visualData.computedHeight, segmentActualHeight);
        currentXCoordinate += visualData.computedWidth + cfg.spacing;
      }

      this.containerElement.style.height = `${this.currentYCoordinate + segmentActualHeight + this.effectiveBoundary() + (this.spinnerState.active ? this.spinnerState.element.offsetHeight : 0)}px`;

      if (!isFinalSegment || (segmentActualHeight <= cfg.lineHeight && segmentResults.doAdjust)) {
        this.currentYCoordinate += segmentActualHeight + cfg.spacing;
        this.currentSegment = { items: [], totalRatio: 0, cumulativeWidth: 0 };
        this.containerElement.dispatchEvent(new CustomEvent('gridRowRendered'));
      }
    }

    monitorContainerResizing() {
      this.resizeMonitorHandle = setInterval(() => {
        const currentContainerWidth = parseInt(this.containerElement.offsetWidth, 10);
        if (this.containerWidth !== currentContainerWidth) {
          this.containerWidth = currentContainerWidth;
          this.resetArrangementState();
          this.initiateLayoutProcessing(true);
        }
      }, this.config.refreshInterval);
    }

    activateIndicatorMotion() {
      clearInterval(this.spinnerState.animationTimer);
      this.spinnerState.animationTimer = setInterval(() => {
        if (this.spinnerState.phase < this.spinnerState.points.length) {
          this.spinnerState.points[this.spinnerState.phase].style.opacity = 1;
        } else {
          this.spinnerState.points[this.spinnerState.phase - this.spinnerState.points.length].style.opacity = 0;
        }
        this.spinnerState.phase = (this.spinnerState.phase + 1) % (this.spinnerState.points.length * 2);
      }, this.spinnerState.slotDuration);
    }

    haltIndicatorMotion() {
      clearInterval(this.spinnerState.animationTimer);
      this.spinnerState.animationTimer = null;
    }

    stopLayoutProcessingTimer() {
      this.yieldCounter = 0;
      if (this.layoutProcessHandle !== null) {
        clearTimeout(this.layoutProcessHandle);
      }
    }

    initiateLayoutProcessing(isRecalculation) {
      this.stopLayoutProcessingTimer();
      this.layoutProcessHandle = setTimeout(() => {
        this.processVisualItems(isRecalculation);
      }, 1);
      this.processVisualItems(isRecalculation);
    }

    processVisualItems(isRecalculation) {
      const cfg = this.config;

      for (let i = this.processedItemIndex + 1; i < this.itemElements.length; i++) {
        const currentItem = this.itemElements[i];
        const mainVisual = this.extractMainVisual(currentItem);
        const visualData = mainVisual._visualData;

        if (visualData && (visualData.status === 'loaded' || visualData.status === 'skipped')) {
          const isFinalItem = i >= this.itemElements.length - 1;
          const currentItemRatio = visualData.width / visualData.height;

          const potentialAvailableWidth = this.containerWidth - 2 * this.effectiveBoundary() - (this.currentSegment.items.length * cfg.spacing);
          const potentialCombinedRatio = this.currentSegment.totalRatio + currentItemRatio;

          if (potentialAvailableWidth / potentialCombinedRatio < cfg.lineHeight) {
            this.renderSegment(this.currentSegment.items, isFinalItem);
            if (++this.yieldCounter >= this.yieldLimit) {
              this.initiateLayoutProcessing(isRecalculation);
              return;
            }
            this.currentSegment = { items: [], totalRatio: 0, cumulativeWidth: 0 };
          }

          this.currentSegment.items.push(currentItem);
          this.currentSegment.totalRatio += currentItemRatio;
          this.currentSegment.cumulativeWidth += currentItemRatio * cfg.lineHeight;
          this.processedItemIndex = i;

        } else if (visualData && visualData.status !== 'error') {
          return;
        }
      }

      if (this.currentSegment.items.length > 0) {
        this.renderSegment(this.currentSegment.items, true);
      }

      if (this.spinnerState.active) {
        this.spinnerState.active = false;
        this.containerElement.style.height = `${this.containerElement.offsetHeight - this.spinnerState.element.offsetHeight}px`;
        this.spinnerState.element.remove();
        this.haltIndicatorMotion();
      }

      this.stopLayoutProcessingTimer();

      const eventType = isRecalculation ? 'gridResized' : 'gridCompleted';
      this.containerElement.dispatchEvent(new CustomEvent(eventType));
    }

    setupInitialState() {
      this.containerElement.style.position = 'relative';
      this.containerElement.style.overflow = 'hidden';

      this.itemElements.forEach(item => {
        item.style.position = 'absolute';
        item.style.overflow = 'hidden';
        if (!this.config.animateCSS) {
          item.style.opacity = 0;
        }

        const mainVisual = this.extractMainVisual(item);
        if (mainVisual) {
          mainVisual.style.position = 'absolute';
          mainVisual.style.top = '50%';
          mainVisual.style.left = '50%';
          mainVisual.style.transform = 'translate(-50%, -50%)';

          mainVisual._originalSrc = mainVisual.src;
          mainVisual._visualData = {
            width: mainVisual.naturalWidth,
            height: mainVisual.naturalHeight,
            status: 'pending',
            computedWidth: 0,
            computedHeight: 0
          };

          if (this.config.groupRelation) {
            const anchor = item.tagName === 'A' ? item : item.querySelector('a');
            if (anchor) anchor.setAttribute('rel', this.config.groupRelation);
          }
          if (this.config.linkTarget) {
            const anchor = item.tagName === 'A' ? item : item.querySelector('a');
            if (anchor) anchor.setAttribute('target', this.config.linkTarget);
          }

          if (mainVisual.naturalWidth && mainVisual.naturalHeight) {
            mainVisual._visualData.status = 'skipped';
          } else if (this.config.awaitVisualsLoad) {
            observeVisualLoad(mainVisual.src, (success) => {
              if (success) {
                mainVisual._visualData.width = mainVisual.naturalWidth;
                mainVisual._visualData.height = mainVisual.naturalHeight;
                mainVisual._visualData.status = 'loaded';
              } else {
                mainVisual._visualData.status = 'error';
              }
              this.initiateLayoutProcessing(false);
            });
          } else {
            mainVisual._visualData.width = mainVisual.width || this.config.lineHeight;
            mainVisual._visualData.height = mainVisual.height || this.config.lineHeight;
            mainVisual._visualData.status = 'skipped';
          }
        }
      });

      const spinnerDiv = document.createElement('div');
      spinnerDiv.className = 'jg-spinner-clone';
      spinnerDiv.style.textAlign = 'center';
      spinnerDiv.style.marginTop = '10px';
      spinnerDiv.style.marginBottom = '10px';
      for (let i = 0; i < 3; i++) {
        const point = document.createElement('span');
        point.textContent = '.';
        point.style.opacity = 0;
        point.style.display = 'inline-block';
        point.style.fontSize = '2em';
        point.style.lineHeight = '0';
        point.style.margin = '0 2px';
        spinnerDiv.appendChild(point);
      }
      this.containerElement.appendChild(spinnerDiv);
      this.spinnerState.element = spinnerDiv;
      this.spinnerState.points = Array.from(spinnerDiv.children);
      this.spinnerState.active = true;
      this.activateIndicatorMotion();

      this.containerWidth = parseInt(this.containerElement.offsetWidth, 10);
    }
  }

  window.initPhotoGrid = function(selector, options) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => new PhotoGridManager(el, options));
  };

})();