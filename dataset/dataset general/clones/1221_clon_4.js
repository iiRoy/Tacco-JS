class SliderWidget {
  constructor(viewportSelector, itemSelectors, navControlSelectors, runtimeConfig) {
    this.animationController = new AnimationEngine();
    this.animationInProgress = false;
    this.advanceTimerId = null;

    this.viewportElement = this.#fetchElement(viewportSelector);
    this.itemElements = this.#fetchAllElements(itemSelectors);
    this.navControlElements = navControlSelectors ? this.#fetchAllElements(navControlSelectors) : [];

    this.configSettings = Object.assign({
      animDurationSeconds: 1,
      autoPlayEnabled: false,
      autoPlayIntervalSeconds: 3,
      visibleItemCount: 1,
      directionalControlClass: 'carousel-control',
      directJumpControlClass: 'carousel-jumper',
      inactiveControlClass: 'carousel-disabled',
      highlightedControlClass: 'carousel-selected',
      loopContinuously: false,
      wheelNavigationEnabled: true,
      visualTransitionType: 'scroll',
      easingFunctionType: 'sinusoidal',
      initialItem: null,
      beforeTransition: null,
      afterTransition: null,
    }, runtimeConfig || {});

    if (this.configSettings.visualTransitionType === 'fade') {
      this.configSettings.loopContinuously = true;
    }

    this.itemDataMap = new Map();
    this.itemElements.forEach((item, idx) => {
      this.itemDataMap.set(item, { originalIndex: idx });
    });

    if (this.navControlElements.length > 0) {
      this.navControlElements.forEach(ctrl => {
        ctrl.addEventListener('click', this.handleNavigationClick.bind(this));
      });
    }

    if (this.configSettings.wheelNavigationEnabled) {
      this.viewportElement.addEventListener('wheel', this.handleScrollWheel.bind(this));
      this.viewportElement.addEventListener('DOMMouseScroll', this.handleScrollWheel.bind(this));
    }

    if (this.configSettings.autoPlayEnabled) {
      this.initiateAutoAdvance();
    }

    if (this.configSettings.initialItem) {
      const initialElement = this.#fetchElement(this.configSettings.initialItem);
      let initialIdx = this.itemElements.indexOf(initialElement);

      if (initialIdx === -1) initialIdx = 0;

      if (initialIdx > (this.configSettings.visibleItemCount - 1) && this.configSettings.visibleItemCount > 1) {
        if (initialIdx > this.itemElements.length - (this.configSettings.visibleItemCount + 1)) {
          initialIdx = this.itemElements.length - this.configSettings.visibleItemCount;
        }
      }
      this.transitionToItem(this.itemElements[initialIdx]);
    } else {
      this.activeItem = this.itemElements[0];
      this.priorItem = null;
    }
  }

  #fetchElement(selector) {
    if (typeof selector === 'string') {
      return document.querySelector(selector);
    }
    return selector;
  }

  #fetchAllElements(selector) {
    if (typeof selector === 'string') {
      return Array.from(document.querySelectorAll(selector));
    }
    if (Array.isArray(selector)) {
      return selector.map(s => this.#fetchElement(s));
    }
    return Array.from(selector);
  }

  #getItemIndex(item) {
    return this.itemDataMap.get(item)?.originalIndex ?? -1;
  }

  #controlActions = {
    prev: this.moveBackward,
    next: this.moveForward,
    first: this.jumpToStart,
    last: this.jumpToEnd,
    toggle: this.revertToPrevious,
  };

  handleNavigationClick(evt) {
    this.haltAutoAdvance();
    const clickedAnchor = evt.target.closest('a');

    if (!clickedAnchor || clickedAnchor.classList.contains(this.configSettings.inactiveControlClass)) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }

    if (clickedAnchor.classList.contains(this.configSettings.directionalControlClass)) {
      const actionMethod = this.#controlActions[clickedAnchor.rel];
      if (actionMethod) {
        actionMethod.call(this);
      }
    } else if (clickedAnchor.classList.contains(this.configSettings.directJumpControlClass)) {
      const targetItem = this.#fetchElement(clickedAnchor.rel);
      if (targetItem) {
        this.transitionToItem(targetItem);
        if (this.configSettings.highlightedControlClass) {
          this.navControlElements.forEach(ctrl => ctrl.classList.remove(this.configSettings.highlightedControlClass));
          clickedAnchor.classList.add(this.configSettings.highlightedControlClass);
        }
      }
    }

    this.disableNavigation();
    evt.preventDefault();
    evt.stopPropagation();
  }

  transitionToItem(targetElement) {
    this.configSettings.beforeTransition?.();

    this.priorItem = this.activeItem || this.itemElements[0];
    this.activeItem = targetElement;

    const viewportRect = this.viewportElement.getBoundingClientRect();
    const itemRect = this.activeItem.getBoundingClientRect();

    const targetScrollLeft = itemRect.left - viewportRect.left + this.viewportElement.scrollLeft;
    const targetScrollTop = itemRect.top - viewportRect.top + this.viewportElement.scrollTop;

    this.animationController.cancelActiveAnimation();
    this.animationInProgress = true;

    const animDurationMs = this.configSettings.animDurationSeconds * 1000;

    const onAnimFinish = () => {
      this.animationInProgress = false;
      if (this.navControlElements.length > 0) {
        this.enableNavigation();
      }
      this.configSettings.afterTransition?.();
    };

    if (this.configSettings.visualTransitionType === 'fade') {
      this.animationController.fadeElement(this.viewportElement, 1.0, 0, animDurationMs, () => {
        this.viewportElement.scrollLeft = targetScrollLeft;
        this.viewportElement.scrollTop = targetScrollTop;
        this.animationController.fadeElement(this.viewportElement, 0, 1.0, animDurationMs, onAnimFinish);
      });
    } else {
      const easeFn = AnimationEngine.easingFunctions[this.configSettings.easingFunctionType] || AnimationEngine.easingFunctions.sinusoidal;
      this.animationController.scrollElement(
        this.viewportElement,
        this.viewportElement.scrollLeft,
        this.viewportElement.scrollTop,
        targetScrollLeft,
        targetScrollTop,
        animDurationMs,
        onAnimFinish,
        easeFn
      );
    }
    return false;
  }

  moveBackward() {
    let currentIdx = this.#getItemIndex(this.activeItem);
    if (currentIdx === -1) currentIdx = 0;

    let previousIdx = (currentIdx === 0) ?
      (this.configSettings.loopContinuously ? this.itemElements.length - 1 : 0) :
      currentIdx - 1;

    if (previousIdx === (this.itemElements.length - 1) && this.configSettings.loopContinuously && this.configSettings.visualTransitionType !== 'fade') {
      const lastItem = this.itemElements[this.itemElements.length - 1];
      this.viewportElement.scrollLeft = lastItem.offsetLeft;
      this.viewportElement.scrollTop = lastItem.offsetTop;
      previousIdx = this.itemElements.length - 2;
    }

    this.transitionToItem(this.itemElements[previousIdx]);
  }

  moveForward() {
    let currentIdx = this.#getItemIndex(this.activeItem);
    if (currentIdx === -1) currentIdx = 0;

    let nextIdx = (this.itemElements.length - 1 === currentIdx) ?
      (this.configSettings.loopContinuously ? 0 : currentIdx) :
      currentIdx + 1;

    if (nextIdx === 0 && this.configSettings.loopContinuously && this.configSettings.visualTransitionType !== 'fade') {
      this.viewportElement.scrollLeft = 0;
      this.viewportElement.scrollTop = 0;
      nextIdx = 1;
    }

    if (nextIdx > this.itemElements.length - (this.configSettings.visibleItemCount + 1)) {
      nextIdx = this.itemElements.length - this.configSettings.visibleItemCount;
    }

    this.transitionToItem(this.itemElements[nextIdx]);
  }

  jumpToStart() {
    this.transitionToItem(this.itemElements[0]);
  }

  jumpToEnd() {
    this.transitionToItem(this.itemElements[this.itemElements.length - 1]);
  }

  revertToPrevious() {
    if (this.priorItem) {
      this.transitionToItem(this.itemElements[this.#getItemIndex(this.priorItem)]);
    } else {
      return false;
    }
  }

  haltAutoAdvance() {
    if (this.advanceTimerId) {
      clearTimeout(this.advanceTimerId);
      this.advanceTimerId = null;
    }
  }

  initiateAutoAdvance() {
    this.performTimedAdvance();
  }

  suspendAdvance() {
    this.haltAutoAdvance();
    this.enableNavigation();
  }

  continueAdvance(event) {
    if (event) {
      const related = event.relatedTarget || event.toElement;
      const isRelatedWithinItems = this.itemElements.some(item => item === related || item.contains(related));
      if (!related || !isRelatedWithinItems) {
        this.initiateAutoAdvance();
      }
    } else {
      this.initiateAutoAdvance();
    }
  }

  performTimedAdvance() {
    if (this.advanceTimerId !== null) {
      clearTimeout(this.advanceTimerId);
      this.moveForward();
    }
    this.advanceTimerId = setTimeout(this.performTimedAdvance.bind(this), this.configSettings.autoPlayIntervalSeconds * 1000);
  }

  handleScrollWheel(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.animationInProgress) {
      return;
    }

    this.disableNavigation();

    let scrollDelta = 0;
    if (evt.wheelDelta) {
      scrollDelta = evt.wheelDelta / 120;
    } else if (evt.detail) {
      scrollDelta = -evt.detail / 3;
    } else if (evt.deltaY) {
      scrollDelta = -evt.deltaY / 100;
    }

    if (scrollDelta > 0) {
      this.moveBackward();
    } else if (scrollDelta < 0) {
      this.moveForward();
    }
  }

  disableNavigation() {
    this.navControlElements.forEach(ctrl => ctrl.classList.add(this.configSettings.inactiveControlClass));
  }

  enableNavigation() {
    this.navControlElements.forEach(ctrl => ctrl.classList.remove(this.configSettings.inactiveControlClass));
  }
}

class AnimationEngine {
  constructor() {
    this.currentAnimation = null;
  }

  static easingFunctions = {
    sinusoidal: (t) => 0.5 - Math.cos(t * Math.PI) / 2,
    springy: (t) => {
      const s = 1.70158;
      return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    },
    linear: (t) => t,
  };

  cancelActiveAnimation() {
    if (this.currentAnimation) {
      cancelAnimationFrame(this.currentAnimation.id);
      this.currentAnimation.onCancel?.();
      this.currentAnimation = null;
    }
  }

  startAnimation(durationMs, updateFn, completeFn, easeFn = AnimationEngine.easingFunctions.linear) {
    this.cancelActiveAnimation();

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / durationMs, 1);

      updateFn(easeFn(progress));

      if (progress < 1) {
        this.currentAnimation.id = requestAnimationFrame(animate);
      } else {
        completeFn?.();
        this.currentAnimation = null;
      }
    };

    this.currentAnimation = {
      id: requestAnimationFrame(animate),
      onCancel: () => completeFn?.(),
    };
  }

  fadeElement(targetElement, startOpacity, endOpacity, durationMs, onCompletion) {
    this.startAnimation(
      durationMs,
      (progress) => {
        const currentOpacity = startOpacity + (endOpacity - startOpacity) * progress;
        targetElement.style.opacity = currentOpacity;
      },
      () => {
        targetElement.style.opacity = endOpacity;
        onCompletion?.();
      },
      AnimationEngine.easingFunctions.sinusoidal
    );
  }

  scrollElement(targetElement, startX, startY, endX, endY, durationMs, onCompletion, easeFn) {
    this.startAnimation(
      durationMs,
      (progress) => {
        targetElement.scrollLeft = startX + (endX - startX) * progress;
        targetElement.scrollTop = startY + (endY - startY) * progress;
      },
      () => {
        targetElement.scrollLeft = endX;
        targetElement.scrollTop = endY;
        onCompletion?.();
      },
      easeFn
    );
  }
}