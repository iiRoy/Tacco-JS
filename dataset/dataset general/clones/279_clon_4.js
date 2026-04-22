(function() {
  "use strict";

  const mainDoc = document;
  const mainWin = window;

  const combineObjects = (target, source) => Object.assign(target, source);
  const doNothing = () => {};
  const preventDefaultSelection = () => false;

  const isTransformSupported = (() => {
    const testDiv = mainDoc.createElement('div');
    return 'transform' in testDiv.style || 'webkitTransform' in testDiv.style || 'msTransform' in testDiv.style;
  })();

  const isPointerEvent = 'onpointerdown' in mainWin;
  const startAction = isPointerEvent ? 'pointerdown' : ('ontouchstart' in mainWin ? 'touchstart' : 'mousedown');
  const moveAction = isPointerEvent ? 'pointermove' : ('ontouchmove' in mainWin ? 'touchmove' : 'mousemove');
  const endAction = isPointerEvent ? 'pointerup' : ('ontouchend' in mainWin ? 'touchend' : 'mouseup');

  const directionalKeys = {
    37: "leftward",
    38: "upward",
    39: "rightward",
    40: "downward"
  };

  const initialConfig = {
    slideSelector: ".slide-item",
    movementAxis: "horizontal",
    minimumGesture: 45,
    onStartGesture: doNothing,
    onMoveGesture: doNothing,
    onEndGesture: doNothing,
    onSlideTransitionStart: doNothing,
    onSlideTransitionEnd: doNothing,
    afterSetup: doNothing,
    allowKeyboard: false,
    preventPropagation: false,
    gapBetweenSlides: 0,
    animationDuration: 320,
    blockUserInteraction: false
  };

  function applyElementStyles(element, styleProps) {
    for (const prop in styleProps) {
      if (styleProps.hasOwnProperty(prop)) {
        let val = styleProps[prop];
        if (typeof val === 'number' && ['width', 'height', 'margin-left', 'margin-top', 'margin-right', 'margin-bottom'].includes(prop)) {
          val += 'px';
        }
        element.style[prop] = val;
      }
    }
  }

  function getEventCoordinates(eventSource) {
    const targetData = (eventSource.touches && eventSource.touches.length) ? eventSource.touches : eventSource.changedTouches;
    const isTouchInput = targetData && targetData.length;

    return {
      pointX: isTouchInput ? targetData[0].pageX : eventSource.pageX,
      pointY: isTouchInput ? targetData[0].pageY : eventSource.pageY
    };
  }

  class SlideNavigator {
    constructor(hostElement, options) {
      this.hostElement = hostElement;
      this.currentConfig = combineObjects(combineObjects({}, initialConfig), options);

      this.internalState = {
        activeSlideIndex: 0,
        xOffset: 0,
        yOffset: 0,
        startClientX: 0,
        startClientY: 0,
        isDragging: false,
        slideElements: [],
        containerDimensions: {
          width: 0,
          height: 0
        },
        slideDimensions: {
          width: 0,
          height: 0
        },
        isScrollBlocked: false
      };

      this.slideWrapper = mainDoc.createElement("div");
      this.slideWrapper.innerHTML = hostElement.cloneNode(true).innerHTML;
      hostElement.innerHTML = "";
      hostElement.appendChild(this.slideWrapper);

      this.handlePress = this.handlePress.bind(this);
      this.handleMovement = this.handleMovement.bind(this);
      this.handleRelease = this.handleRelease.bind(this);
      this.handleKeyCommand = this.handleKeyCommand.bind(this);
      this.adjustLayout = this.adjustLayout.bind(this);
      this.transitionEndCallback = this.transitionEndCallback.bind(this);

      this.applyInitialStyles();

      setTimeout(() => {
        this.updateConfiguration(options);
        if (!this.currentConfig.blockUserInteraction) {
          this.attachListeners();
        }
        this.currentConfig.afterSetup.call(this);
      }, 10);
    }

    applyInitialStyles() {
      applyElementStyles(this.hostElement, {
        overflow: "hidden",
        padding: 0
      });

      applyElementStyles(this.slideWrapper, {
        display: "flex",
        margin: 0,
        padding: 0,
        boxSizing: "content-box",
        webkitBackfaceVisibility: "hidden",
        webkitPerspective: "1000px"
      });
    }

    attachListeners() {
      this.hostElement.addEventListener(startAction, this.handlePress, false);
      this.hostElement.onselectstart = preventDefaultSelection;
      this.hostElement.ondragstart = preventDefaultSelection;

      if (this.currentConfig.allowKeyboard) {
        mainDoc.body.addEventListener("keydown", this.handleKeyCommand, false);
      }

      mainWin.addEventListener("resize", this.adjustLayout, false);
    }

    detachListeners() {
      this.hostElement.removeEventListener(startAction, this.handlePress, false);
      mainDoc.body.removeEventListener("keydown", this.handleKeyCommand, false);
      mainWin.removeEventListener("resize", this.adjustLayout, false);
      mainDoc.removeEventListener(moveAction, this.handleMovement, false);
      mainDoc.removeEventListener(endAction, this.handleRelease, false);
    }

    updateConfiguration(newOptions) {
      combineObjects(this.currentConfig, newOptions);
      this.adjustLayout();
    }

    adjustLayout() {
      this.internalState.slideElements = Array.from(this.slideWrapper.querySelectorAll(this.currentConfig.slideSelector));
      if (this.internalState.slideElements.length === 0) {
        console.warn("No slide elements found with selector: " + this.currentConfig.slideSelector);
        return;
      }

      const parentWidth = this.hostElement.offsetWidth;
      const parentHeight = this.hostElement.offsetHeight;
      this.internalState.containerDimensions = {
        width: parentWidth,
        height: parentHeight
      };

      const slideWidth = parentWidth;
      const slideHeight = parentHeight;
      this.internalState.slideDimensions = {
        width: slideWidth,
        height: slideHeight
      };

      if (this.currentConfig.movementAxis === "horizontal") {
        applyElementStyles(this.slideWrapper, {
          flexDirection: "row",
          width: (slideWidth + this.currentConfig.gapBetweenSlides) * this.internalState.slideElements.length + "px"
        });
        this.internalState.slideElements.forEach(slide => {
          applyElementStyles(slide, {
            width: slideWidth + "px",
            height: slideHeight + "px",
            marginRight: this.currentConfig.gapBetweenSlides + "px",
            flexShrink: 0
          });
        });
      } else {
        applyElementStyles(this.slideWrapper, {
          flexDirection: "column",
          height: (slideHeight + this.currentConfig.gapBetweenSlides) * this.internalState.slideElements.length + "px"
        });
        this.internalState.slideElements.forEach(slide => {
          applyElementStyles(slide, {
            width: slideWidth + "px",
            height: slideHeight + "px",
            marginBottom: this.currentConfig.gapBetweenSlides + "px",
            flexShrink: 0
          });
        });
      }

      this.moveToSlide(this.internalState.activeSlideIndex, false);
    }

    handlePress(evt) {
      if (this.currentConfig.preventPropagation) {
        evt.stopPropagation();
      }

      mainDoc.addEventListener(moveAction, this.handleMovement, false);
      mainDoc.addEventListener(endAction, this.handleRelease, false);

      const initialCoords = getEventCoordinates(evt);
      this.internalState.startClientX = initialCoords.pointX;
      this.internalState.startClientY = initialCoords.pointY;
      this.internalState.isDragging = true;
      this.internalState.isScrollBlocked = false;

      this.currentConfig.onStartGesture.call(this, evt);
    }

    handleMovement(evt) {
      if (evt.touches && evt.touches.length > 1) return;
      if (!this.internalState.isDragging) return;

      evt.preventDefault();
      if (this.currentConfig.preventPropagation) {
        evt.stopPropagation();
      }

      const currentCoords = getEventCoordinates(evt);
      const deltaX = currentCoords.pointX - this.internalState.startClientX;
      const deltaY = currentCoords.pointY - this.internalState.startClientY;

      const gestureData = this.interpretGesture(deltaX, deltaY);
      const overscrollResult = this.calculateOverscroll(gestureData.direction, deltaX, deltaY);

      this.currentConfig.onMoveGesture.call(this, this.internalState.slideElements[this.internalState.activeSlideIndex], gestureData, overscrollResult.hitBoundary, evt);

      if (!this.internalState.isScrollBlocked) {
        this.applyTranslation(overscrollResult.adjustedX, overscrollResult.adjustedY);
      }
    }

    handleRelease(evt) {
      if (this.currentConfig.preventPropagation) {
        evt.stopPropagation();
      }

      this.internalState.isDragging = false;
      mainDoc.removeEventListener(moveAction, this.handleMovement, false);
      mainDoc.removeEventListener(endAction, this.handleRelease, false);

      const finalCoords = getEventCoordinates(evt);
      const totalDeltaX = this.internalState.startClientX - finalCoords.pointX;
      const totalDeltaY = this.internalState.startClientY - finalCoords.pointY;

      const gestureData = this.interpretGesture(totalDeltaX, totalDeltaY);

      if (Math.abs(gestureData.displacementX) > this.currentConfig.minimumGesture || Math.abs(gestureData.displacementY) > this.currentConfig.minimumGesture) {
        this.advanceSlide(gestureData.direction);
      } else if (Math.abs(gestureData.displacementX) > 0 || Math.abs(gestureData.displacementY) > 0) {
        this.revertToCurrentSlide();
      }

      this.currentConfig.onEndGesture.call(this, this.hostElement, this.internalState.slideElements[this.internalState.activeSlideIndex], this.internalState.activeSlideIndex + 1, evt);
    }

    interpretGesture(diffX, diffY) {
      const gesture = {
        displacementX: 0,
        displacementY: 0,
        direction: null
      };

      if (this.currentConfig.movementAxis === "horizontal") {
        gesture.displacementX = diffX;
        gesture.direction = diffX > 0 ? "leftward" : "rightward";
      } else {
        gesture.displacementY = diffY;
        gesture.direction = diffY > 0 ? "upward" : "downward";
      }
      return gesture;
    }

    calculateOverscroll(direction, currentDeltaX, currentDeltaY) {
      const slidesCount = this.internalState.slideElements.length;
      const slideWidth = this.internalState.slideDimensions.width + this.currentConfig.gapBetweenSlides;
      const slideHeight = this.internalState.slideDimensions.height + this.currentConfig.gapBetweenSlides;

      let adjustedDeltaX = currentDeltaX;
      let adjustedDeltaY = currentDeltaY;
      let hitBoundary = false;

      if (this.currentConfig.movementAxis === "horizontal") {
        if (direction === "rightward" && this.internalState.activeSlideIndex === 0) {
          adjustedDeltaX = Math.round(currentDeltaX / 5);
          hitBoundary = true;
        } else if (direction === "leftward" && this.internalState.activeSlideIndex === slidesCount - 1) {
          adjustedDeltaX = Math.round(currentDeltaX / 5);
          hitBoundary = true;
        }
      } else {
        if (direction === "downward" && this.internalState.activeSlideIndex === 0) {
          adjustedDeltaY = Math.round(currentDeltaY / 5);
          hitBoundary = true;
        } else if (direction === "upward" && this.internalState.activeSlideIndex === slidesCount - 1) {
          adjustedDeltaY = Math.round(currentDeltaY / 5);
          hitBoundary = true;
        }
      }

      return {
        adjustedX: this.internalState.xOffset + adjustedDeltaX,
        adjustedY: this.internalState.yOffset + adjustedDeltaY,
        hitBoundary: hitBoundary
      };
    }

    applyTranslation(newX, newY, animate = false) {
      if (isTransformSupported) {
        this.slideWrapper.style.transitionDuration = animate ? `${this.currentConfig.animationDuration}ms` : '0ms';
        this.slideWrapper.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        if (animate) {
          this.slideWrapper.removeEventListener('transitionend', this.transitionEndCallback);
          this.slideWrapper.addEventListener('transitionend', this.transitionEndCallback, {
            once: true
          });
        } else {
          this.transitionEndCallback();
        }
      } else {
        if (animate) {
          let start = null;
          const currentX = parseFloat(this.slideWrapper.style.left || 0);
          const currentY = parseFloat(this.slideWrapper.style.top || 0);

          const animateFrame = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / this.currentConfig.animationDuration, 1);

            this.slideWrapper.style.left = currentX + (newX - currentX) * percentage + "px";
            this.slideWrapper.style.top = currentY + (newY - currentY) * percentage + "px";

            if (percentage < 1) {
              requestAnimationFrame(animateFrame);
            } else {
              this.transitionEndCallback();
            }
          };
          requestAnimationFrame(animateFrame);
        } else {
          this.slideWrapper.style.left = newX + "px";
          this.slideWrapper.style.top = newY + "px";
          this.transitionEndCallback();
        }
      }
      this.internalState.xOffset = newX;
      this.internalState.yOffset = newY;
    }

    advanceSlide(direction) {
      let targetIndex = this.internalState.activeSlideIndex;
      const slideCount = this.internalState.slideElements.length;

      if (this.currentConfig.movementAxis === "horizontal") {
        if (direction === "leftward" && targetIndex < slideCount - 1) {
          targetIndex++;
        } else if (direction === "rightward" && targetIndex > 0) {
          targetIndex--;
        }
      } else {
        if (direction === "upward" && targetIndex < slideCount - 1) {
          targetIndex++;
        } else if (direction === "downward" && targetIndex > 0) {
          targetIndex--;
        }
      }
      this.moveToSlide(targetIndex, true);
    }

    revertToCurrentSlide() {
      this.moveToSlide(this.internalState.activeSlideIndex, true);
    }

    moveToSlide(index, animate = true) {
      if (index < 0 || index >= this.internalState.slideElements.length) {
        return;
      }

      this.internalState.activeSlideIndex = index;
      this.currentConfig.onSlideTransitionStart.call(this, this.internalState.slideElements[index], index + 1);

      let targetX = 0;
      let targetY = 0;

      if (this.currentConfig.movementAxis === "horizontal") {
        targetX = -index * (this.internalState.slideDimensions.width + this.currentConfig.gapBetweenSlides);
      } else {
        targetY = -index * (this.internalState.slideDimensions.height + this.currentConfig.gapBetweenSlides);
      }

      this.applyTranslation(targetX, targetY, animate);
    }

    transitionEndCallback() {
      this.currentConfig.onSlideTransitionEnd.call(this, this.internalState.slideElements[this.internalState.activeSlideIndex], this.internalState.activeSlideIndex + 1);
    }

    handleKeyCommand(evt) {
      const command = directionalKeys[evt.keyCode];
      if (command) {
        this.advanceSlide(command);
      }
    }

    goToSlide(slideNumber) {
      this.moveToSlide(slideNumber - 1, true);
    }

    nextSlide() {
      if (this.currentConfig.movementAxis === "horizontal") {
        this.advanceSlide("leftward");
      } else {
        this.advanceSlide("upward");
      }
    }

    previousSlide() {
      if (this.currentConfig.movementAxis === "horizontal") {
        this.advanceSlide("rightward");
      } else {
        this.advanceSlide("downward");
      }
    }

    refreshLayout() {
      this.adjustLayout();
    }

    destroyInstance() {
      this.detachListeners();
      this.hostElement.innerHTML = this.slideWrapper.innerHTML;
      this.slideWrapper = null;
      this.internalState = null;
      this.currentConfig = null;
    }
  }

  mainWin.createSlideManager = function(element, configuration = {}) {
    if (!(element instanceof HTMLElement)) {
      console.error("Provided element is not a valid DOM element.");
      return null;
    }
    return new SlideNavigator(element, configuration);
  };

  if (typeof jQuery !== 'undefined') {
    jQuery.fn.slideManager = function(optionsOrCommand, ...args) {
      const instanceKey = 'slideManagerInstance';
      let instance = this.data(instanceKey);

      if (typeof optionsOrCommand === 'string') {
        if (instance && typeof instance[optionsOrCommand] === 'function') {
          return instance[optionsOrCommand](...args);
        } else {
          console.warn(`SlideManager: Method "${optionsOrCommand}" not found or not initialized.`);
          return this;
        }
      } else {
        if (!instance) {
          instance = new SlideNavigator(this[0], optionsOrCommand);
          this.data(instanceKey, instance);
        } else {
          instance.updateConfiguration(optionsOrCommand);
        }
        return this;
      }
    };
  }

})();