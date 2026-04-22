const environmentChecks = (() => {
  const isTouchDevice = (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch));

  const checkTransformSupport = () => {
    const bodyStyle = document.body || document.documentElement;
    const styleProperty = bodyStyle.style;
    const propertyName = 'transition';
    if (typeof styleProperty[propertyName] === 'string') {
      return true;
    }

    const vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
    const capitalizedPropertyName = propertyName.charAt(0).toUpperCase() + propertyName.substr(1);
    for (let i = 0; i < vendorPrefixes.length; i++) {
      if (typeof styleProperty[vendorPrefixes[i] + capitalizedPropertyName] === 'string') {
        return true;
      }
    }
    return false;
  };

  return {
    touchEnabled: isTouchDevice,
    cssTransformCapable: checkTransformSupport(),
  };
})();

const styleApplier = {
  applyGeneralStyles: (element, styles) => {
    for (const prop in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, prop)) {
        element.style[prop] = styles[prop];
      }
    }
  },
  composeTransformStyle: (xCoord, yCoord) => {
    const transformValue = `translate3d(${xCoord}px, ${yCoord}px, 0)`;
    return {
      '-webkit-transform': transformValue,
      '-moz-transform': transformValue,
      '-ms-transform': transformValue,
      '-o-transform': transformValue,
      'transform': transformValue,
    };
  }
};

class ImageMagnifier {
  constructor(targetElement, configOptions) {
    this.hostElement = targetElement;
    this.displayImage = this.hostElement.querySelector('img');
    this.uniqueIdentifier = `magnifier-${Math.random().toString(36).substr(2, 9)}`;
    this.currentOperationalState = null; // null: uninitialized, 0: inactive, 1: active

    this.settings = {
      magnificationSize: 200,
      circularShape: true,
      highlightEffect: true,
      activationEvent: environmentChecks.touchEnabled ? 'touchstart' : 'click', // Default based on detection
      sourceAttribute: 'href',
      frameStyle: '5px solid #999',
      onMagnifierInitialize: null,
      onMagnifierStart: null,
      onMagnifierStop: null,
      fixedPositioning: false,
      fixedXCoord: 0,
      fixedYCoord: 0,
      ...configOptions
    };

    this.magnifierInternalData = {};

    this.interactionHandlers = {
      initialEngagement: this.handleInitialEngagement.bind(this),
      liveMovement: this.handleLiveMovement.bind(this),
      disengagement: this.handleDisengagement.bind(this),
      reEngagement: this.handleReEngagement.bind(this),
      preventDefaultClick: this.blockClickBehavior.bind(this)
    };

    this.initializeComponent();
  }

  initializeComponent() {
    this.prepareHostElement();
    this.constructMagnifierDisplay();
    this.applyInitialHostStyles();
    this.attachInteractionEvents();

    if (typeof this.settings.onMagnifierInitialize === 'function') {
      this.settings.onMagnifierInitialize(this.magnifierInternalData);
    }
  }

  prepareHostElement() {
    if (!this.hostElement.parentNode.classList.contains('magnifier-container')) {
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'magnifier-container';
      this.hostElement.parentNode.insertBefore(wrapperDiv, this.hostElement);
      wrapperDiv.appendChild(this.hostElement);
      this.hostWrapper = wrapperDiv; // Store reference to the new wrapper
    } else {
        this.hostWrapper = this.hostElement.parentNode; // Already wrapped
    }
  }

  constructMagnifierDisplay() {
    this.magnifierElement = document.createElement('div');
    this.magnifierElement.className = 'magnifier-viewport';
    this.magnifierElement.setAttribute('data-instance-id', this.uniqueIdentifier);

    const magnifiedImageSource = this.hostElement.getAttribute(this.settings.sourceAttribute) || this.displayImage.src;

    const imagePreloader = new Image();
    imagePreloader.src = magnifiedImageSource;
    imagePreloader.onload = () => {
      this.magnifierInternalData.magnifiedImage = {
        width: imagePreloader.width,
        height: imagePreloader.height
      };

      const [parsedFrameStyle, parsedFrameSize] = this.extractFrameDetails();
      this.magnifierInternalData.frame = {
        style: parsedFrameStyle,
        size: parsedFrameSize
      };

      this.magnifierElement.style.backgroundImage = `url(${magnifiedImageSource})`;
      this.magnifierElement.style.backgroundRepeat = 'no-repeat';
      this.magnifierElement.style.position = 'absolute';
      this.magnifierElement.style.visibility = 'hidden';
      this.magnifierElement.style.zIndex = '9999';

      styleApplier.applyGeneralStyles(this.magnifierElement, {
        height: `${this.settings.magnificationSize}px`,
        width: `${this.settings.magnificationSize}px`,
        borderRadius: this.getRoundedCorners(null, this.magnifierInternalData.frame.size),
        border: this.magnifierInternalData.frame.style,
        top: '0px',
        left: '0px',
      });

      if (this.settings.highlightEffect) {
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'magnifier-highlight-overlay';
        this.magnifierElement.appendChild(highlightSpan);
        this.applyHighlightOverlayStyles();
      }
      
      document.body.appendChild(this.magnifierElement);

      this.calculateMagnifierDimensions();
      this.magnifierElement.style.display = 'block';
      this.magnifierElement.style.top = '-9999px';
      this.magnifierElement.style.left = '-9999px';
    };
  }

  extractFrameDetails() {
    const rawStyle = this.settings.frameStyle.trim();
    const parts = rawStyle.split(' ');
    const size = parseFloat(parts[0]);
    const frameDimension = (parts.length > 2 && !isNaN(size)) ? size : 0;
    return [rawStyle, frameDimension];
  }

  getRoundedCorners(dimensionHint, frameSize) {
    if (!this.settings.circularShape) return '0';
    if (dimensionHint === undefined) return '100%';
    return `${(this.settings.magnificationSize / 2) + frameSize}px ${(this.settings.magnificationSize / 2) + frameSize}px 0px 0px`;
  }

  applyHighlightOverlayStyles() {
    if (!this.settings.highlightEffect || !this.magnifierElement.querySelector('.magnifier-highlight-overlay')) return;

    const highlightElement = this.magnifierElement.querySelector('.magnifier-highlight-overlay');
    styleApplier.applyGeneralStyles(highlightElement, {
      height: `${this.settings.magnificationSize / 2}px`,
      width: `${this.settings.magnificationSize - 10}px`,
      margin: '5px auto',
      borderRadius: this.getRoundedCorners(0),
      background: 'rgba(255,255,255,0.5)',
      display: 'block',
      position: 'relative'
    });
  }

  applyInitialHostStyles() {
    const originalImg = this.displayImage;
    const containerWrapper = this.hostWrapper;

    const initialMargin = {
      marginTop: originalImg.style.marginTop,
      marginRight: originalImg.style.marginRight,
      marginBottom: originalImg.style.marginBottom,
      marginLeft: originalImg.style.marginLeft,
    };
    const initialFloat = originalImg.style.float;

    originalImg.style.margin = '0px';

    styleApplier.applyGeneralStyles(containerWrapper, {
      display: 'block',
      height: `${originalImg.offsetHeight}px`,
      width: `${originalImg.offsetWidth}px`,
      position: 'relative',
      overflow: 'hidden',
      ...initialMargin,
      float: initialFloat,
    });

    const grandParent = containerWrapper.parentNode;
    if (grandParent && window.getComputedStyle(grandParent).textAlign === 'center' && initialFloat === 'none') {
      containerWrapper.style.marginRight = 'auto';
      containerWrapper.style.marginLeft = 'auto';
    }

    this.magnifierInternalData.originalImage = {
      width: originalImg.offsetWidth,
      height: originalImg.offsetHeight,
      offset: containerWrapper.getBoundingClientRect()
    };
  }

  calculateMagnifierDimensions() {
    const data = this.magnifierInternalData;
    const originalImg = data.originalImage;
    const magnifiedImg = data.magnifiedImage;
    const frameSize = data.frame.size;
    const viewportSize = this.settings.magnificationSize;

    data.calculated = {};
    data.calculated.fullViewportSize = viewportSize + (frameSize * 2);
    data.calculated.halfViewportSize = data.calculated.fullViewportSize / 2;
    
    data.calculated.ratioX = magnifiedImg.width / originalImg.width;
    data.calculated.ratioY = magnifiedImg.height / originalImg.height;

    data.calculated.magnifiedScrollLimitX = magnifiedImg.width - data.calculated.fullViewportSize;
    data.calculated.magnifiedScrollLimitY = magnifiedImg.height - data.calculated.fullViewportSize;

    data.calculated.viewportBoxMinX = 0;
    data.calculated.viewportBoxMaxX = originalImg.width - data.calculated.fullViewportSize;
    data.calculated.viewportBoxMinY = 0;
    data.calculated.viewportBoxMaxY = originalImg.height - data.calculated.fullViewportSize;
  }

  attachInteractionEvents() {
    if (this.settings.activationEvent === 'click' || this.settings.activationEvent === 'touchstart') {
      this.hostElement.addEventListener(this.settings.activationEvent, this.interactionHandlers.initialEngagement, { passive: false });
      if (this.hostElement.tagName === 'A') { // If it's a link, prevent default click
        this.hostElement.addEventListener('click', this.interactionHandlers.preventDefaultClick);
      }
    } else { // For 'mouseenter', 'mouseover', etc.
      this.hostElement.addEventListener(this.settings.activationEvent, this.interactionHandlers.reEngagement);
      this.hostElement.addEventListener(environmentChecks.touchEnabled ? 'touchmove' : 'mousemove', this.interactionHandlers.liveMovement);
      this.hostElement.addEventListener(environmentChecks.touchEnabled ? 'touchend' : 'mouseleave', this.interactionHandlers.disengagement);
    }
  }

  blockClickBehavior(e) {
    e.preventDefault();
  }

  handleInitialEngagement(e) {
    e.preventDefault();
    if (this.currentOperationalState === null || this.currentOperationalState === 0) {
      this.activateMagnifier();
      if (!environmentChecks.touchEnabled) {
        this.hostElement.removeEventListener(this.settings.activationEvent, this.interactionHandlers.initialEngagement);
        this.hostElement.removeEventListener('click', this.interactionHandlers.preventDefaultClick);
        this.hostElement.addEventListener('mouseenter', this.interactionHandlers.reEngagement);
        this.hostElement.addEventListener('mousemove', this.interactionHandlers.liveMovement);
        this.hostElement.addEventListener('mouseleave', this.interactionHandlers.disengagement);
      } else {
        this.updateMagnifierDisplay(e);
      }
    }
  }

  handleReEngagement() {
    if (this.currentOperationalState === null || this.currentOperationalState === 0) {
      this.activateMagnifier();
    }
  }

  handleDisengagement() {
    this.deactivateMagnifier();
  }

  activateMagnifier() {
    this.currentOperationalState = 1;
    this.magnifierElement.style.visibility = 'visible';
    this.hostElement.classList.remove('inactive-magnifier');
    this.hostElement.classList.add('active-magnifier');
    if (typeof this.settings.onMagnifierStart === 'function') {
      this.settings.onMagnifierStart(this.magnifierInternalData);
    }
  }

  deactivateMagnifier() {
    this.currentOperationalState = 0;
    this.magnifierElement.style.visibility = 'hidden';
    this.hostElement.classList.remove('active-magnifier');
    this.hostElement.classList.add('inactive-magnifier');
    if (typeof this.settings.onMagnifierStop === 'function') {
      this.settings.onMagnifierStop(this.magnifierInternalData);
    }
  }

  getPointerCoordinates(event) {
    const clientX = environmentChecks.touchEnabled ? event.touches[0].clientX : event.clientX;
    const clientY = environmentChecks.touchEnabled ? event.touches[0].clientY : event.clientY;
    return { clientX, clientY };
  }

  handleLiveMovement(e) {
    if (this.currentOperationalState === 1) {
      this.updateMagnifierDisplay(e);
    }
  }

  updateMagnifierDisplay(e) {
    const { clientX, clientY } = this.getPointerCoordinates(e);
    const { originalImage, calculated } = this.magnifierInternalData;
    const containerRect = originalImage.offset;

    let cursorXRelative = clientX - containerRect.left;
    let cursorYRelative = clientY - containerRect.top;

    if (this.settings.fixedPositioning) {
      this.magnifierElement.style.top = `${this.settings.fixedYCoord}px`;
      this.magnifierElement.style.left = `${this.settings.fixedXCoord}px`;
    } else {
      let viewportBoxX = cursorXRelative - calculated.halfViewportSize;
      let viewportBoxY = cursorYRelative - calculated.halfViewportSize;

      viewportBoxX = Math.max(calculated.viewportBoxMinX, Math.min(viewportBoxX, calculated.viewportBoxMaxX));
      viewportBoxY = Math.max(calculated.viewportBoxMinY, Math.min(viewportBoxY, calculated.viewportBoxMaxY));
      
      if (environmentChecks.cssTransformCapable) {
        const transformStyles = styleApplier.composeTransformStyle(viewportBoxX, viewportBoxY);
        styleApplier.applyGeneralStyles(this.magnifierElement, transformStyles);
      } else {
        styleApplier.applyGeneralStyles(this.magnifierElement, {
          top: `${viewportBoxY}px`,
          left: `${viewportBoxX}px`
        });
      }
    }

    let backgroundX = -(cursorXRelative * calculated.ratioX - (calculated.halfViewportSize - this.magnifierInternalData.frame.size));
    let backgroundY = -(cursorYRelative * calculated.ratioY - (calculated.halfViewportSize - this.magnifierInternalData.frame.size));

    backgroundX = Math.max(-calculated.magnifiedScrollLimitX, Math.min(0, backgroundX));
    backgroundY = Math.max(-calculated.magnifiedScrollLimitY, Math.min(0, backgroundY));

    this.magnifierElement.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
  }
}

function establishMagnification(targetSelector, firstArgument, secondArgument) {
  let activationTrigger = environmentChecks.touchEnabled ? 'touchstart' : 'click';
  let userConfiguration = {};

  if (typeof firstArgument === 'string') {
    activationTrigger = firstArgument;
    userConfiguration = secondArgument || {};
  } else if (typeof firstArgument === 'object' && firstArgument !== null) {
    userConfiguration = firstArgument;
  }

  userConfiguration.activationEvent = activationTrigger;

  const elementsToProcess = document.querySelectorAll(targetSelector);
  elementsToProcess.forEach(el => {
    new ImageMagnifier(el, userConfiguration);
  });
}