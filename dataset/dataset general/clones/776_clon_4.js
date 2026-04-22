function retrieveFirstImage(element) {
  if (element.tagName === 'IMG') {
    return element;
  }
  return element.querySelector('img');
}

function noOperation() {}

function loadAllImages(elements) {
  const imagePromises = [];
  elements.forEach(el => {
    if (el.tagName === 'IMG') {
      if (!el.complete) {
        imagePromises.push(new Promise(resolve => {
          el.onload = () => resolve();
          el.onerror = () => resolve();
        }));
      }
    } else {
      Array.from(el.querySelectorAll('img')).forEach(img => {
        if (!img.complete) {
          imagePromises.push(new Promise(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }));
        }
      });
    }
  });
  return Promise.all(imagePromises);
}

class PanelCycler {
  constructor(hostElement, optionsObject) {
    this.configSettings = {
      transitionType: 'horizontal-push',
      transitionDuration: 600,
      autoAdvance: true,
      advanceInterval: 4000,
      pauseOnMouseOver: false,
      resumeOnMouseOut: false,
      resumeDelay: 1000,
      arrowNavigation: true,
      arrowRightLabel: 'Right',
      arrowLeftLabel: 'Left',
      displayCaptions: true,
      captionTransition: 'fade',
      captionTransitionDuration: 600,
      resetTimerOnManual: false,
      dotNavigation: false,
      dotThumbnails: false,
      dotThumbnailPath: '',
      onPanelChange: noOperation,
      onLoadComplete: noOperation,
      responsiveLayout: true,
      centerDotNav: true
    };

    Object.assign(this.configSettings, optionsObject);

    if (this.configSettings.autoAdvance === 'false') this.configSettings.autoAdvance = false;
    if (this.configSettings.displayCaptions === 'false') this.configSettings.displayCaptions = false;
    if (this.configSettings.arrowNavigation === 'false') this.configSettings.arrowNavigation = false;

    this.currentPanelIndex = 0;
    this.totalPanels = 0;
    this.isTransitionLocked = false;
    this.isAdvanceRunning = false;
    this.advanceTimerId = null;
    this.mouseOutTimerId = null;

    this.host = hostElement;
    this.mainContainer = null;
    this.panelElements = null;
    this.timeIndicatorComponent = null;
    this.timeIndicatorRotator = null;
    this.timeIndicatorMask = null;
    this.timeIndicatorPauseButton = null;
    this.captionDisplay = null;
    this.paginationDots = null;

    this.handleTimeIndicatorClick = this.handleTimeIndicatorClick.bind(this);
    this.addPaginationDot = this.addPaginationDot.bind(this);
    this.releaseTransitionLock = this.releaseTransitionLock.bind(this);
    this.pauseAutomaticAdvance = this.pauseAutomaticAdvance.bind(this);
    this.delayAdvanceOnMouseOut = this.delayAdvanceOnMouseOut.bind(this);
    this.cancelAdvanceDelay = this.cancelAdvanceDelay.bind(this);
    this.transitionEndHandler = this.transitionEndHandler.bind(this);
    this.handleVisualTimerEnd = this.handleVisualTimerEnd.bind(this);

    this.prepareSystem();
  }

  prepareSystem() {
    this.mainContainer = document.createElement('div');
    this.mainContainer.classList.add('cycler-container');
    this.host.parentNode.insertBefore(this.mainContainer, this.host);
    this.mainContainer.appendChild(this.host);

    this.panelElements = Array.from(this.host.children);
    this.panelElements.forEach(panel => panel.classList.add('cycler-panel'));

    this.host.addEventListener('cycler.next', () => this.changePanel('next'));
    this.host.addEventListener('cycler.previous', () => this.changePanel('previous'));
    this.host.addEventListener('cycler.moveTo', (e) => this.changePanel(e.detail.index));
    this.host.addEventListener('cycler.start', () => this.beginAutomaticAdvance());
    this.host.addEventListener('cycler.stop', () => this.pauseAutomaticAdvance());

    loadAllImages(this.panelElements).then(() => this.systemReady());
  }

  systemReady() {
    this.host.classList.add('cycler-active');
    this.host.style.width = '1px';
    this.host.style.height = '1px';

    this.configureDimensions();
    this.adjustOptionsForSinglePanel();
    this.setupFirstPanel();

    if (this.configSettings.autoAdvance) {
      this.prepareTimerComponents();
      this.beginAutomaticAdvance();
    }

    if (this.configSettings.displayCaptions) {
      this.prepareCaptionDisplay();
    }

    if (this.configSettings.arrowNavigation) {
      this.prepareNavigationArrows();
    }

    if (this.configSettings.dotNavigation) {
      this.preparePaginationDots();
      this.highlightActiveDot();
    }

    this.configSettings.onLoadComplete.call(this);
  }

  getActivePanel() {
    return this.panelElements[this.currentPanelIndex];
  }

  configureDimensions() {
    let maxW = 0;
    let maxH = 0;
    let responsiveImagePlaceholder = null;

    this.totalPanels = this.panelElements.length;

    this.panelElements.forEach(panel => {
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;

      if (panelWidth > maxW) maxW = panelWidth;
      if (panelHeight > maxH) {
        maxH = panelHeight;
        responsiveImagePlaceholder = retrieveFirstImage(panel);
      }
    });

    this.host.style.width = `${maxW}px`;
    this.host.style.height = `${maxH}px`;
    this.mainContainer.style.width = `${maxW}px`;
    this.mainContainer.style.height = `${maxH}px`;

    if (this.configSettings.responsiveLayout) {
      let placeholderElement = null;
      if (typeof this.configSettings.responsiveLayout === "string") {
        placeholderElement = document.createElement('div');
        const dimensions = this.configSettings.responsiveLayout.split('x');
        if (dimensions.length === 2 && !isNaN(dimensions[0]) && !isNaN(dimensions[1])) {
          placeholderElement.style.paddingTop = `calc(100% / (${dimensions[0]} / ${dimensions[1]}))`;
          placeholderElement.style.height = '0';
          placeholderElement.style.width = '100%';
        }
      } else if (responsiveImagePlaceholder) {
        placeholderElement = responsiveImagePlaceholder.cloneNode(true);
        placeholderElement.style.opacity = '0';
        placeholderElement.style.position = 'absolute';
        placeholderElement.style.top = '0';
        placeholderElement.style.left = '0';
        placeholderElement.style.width = '100%';
        placeholderElement.style.height = '100%';
      } else {
        placeholderElement = document.createElement('div');
        placeholderElement.style.paddingTop = `${(maxH / maxW) * 100}%`;
        placeholderElement.style.height = '0';
        placeholderElement.style.width = '100%';
      }

      if (placeholderElement) {
        placeholderElement.classList.add('cycler-responsive-placeholder');
        this.host.prepend(placeholderElement);
      }

      this.host.style.width = 'inherit';
      this.host.style.height = 'inherit';
      this.mainContainer.style.width = 'inherit';
      this.mainContainer.style.height = 'inherit';
    }
  }

  engageLock() {
    this.isTransitionLocked = true;
  }

  releaseLock() {
    this.isTransitionLocked = false;
  }

  adjustOptionsForSinglePanel() {
    if (this.totalPanels === 1) {
      this.configSettings.arrowNavigation = false;
      this.configSettings.autoAdvance = false;
      this.configSettings.dotNavigation = false;
    }
  }

  setupFirstPanel() {
    this.panelElements.forEach((panel) => {
      panel.style.display = 'none';
      panel.style.position = 'absolute';
      panel.style.top = '0';
      panel.style.left = '0';
      panel.style.width = '100%';
      panel.style.height = '100%';
      panel.style.zIndex = '1';
      panel.style.opacity = '0';
      panel.style.transition = `opacity ${this.configSettings.transitionDuration}ms ease-in-out`;
    });

    const firstPanel = this.panelElements[0];
    if (firstPanel) {
      firstPanel.style.zIndex = '3';
      firstPanel.style.display = 'block';
      setTimeout(() => {
        firstPanel.style.opacity = '1';
      }, 50);
    }
  }

  beginAutomaticAdvance() {
    if (!this.configSettings.autoAdvance) {
      return false;
    }

    this.isAdvanceRunning = true;
    clearTimeout(this.advanceTimerId);

    if (this.timeIndicatorPauseButton) {
      this.timeIndicatorPauseButton.classList.remove('active');
    }

    if (this.timeIndicatorComponent && getComputedStyle(this.timeIndicatorComponent).display !== 'none') {
      this.startVisualTimerAnimation();
    }

    this.advanceTimerId = setTimeout(() => {
      this.host.dispatchEvent(new CustomEvent('cycler.next'));
      if (this.isAdvanceRunning) {
          this.beginAutomaticAdvance();
      }
    }, this.configSettings.advanceInterval);
  }

  pauseAutomaticAdvance() {
    if (!this.configSettings.autoAdvance) {
      return false;
    }
    this.isAdvanceRunning = false;
    clearTimeout(this.advanceTimerId);
    if (this.timeIndicatorPauseButton) {
      this.timeIndicatorPauseButton.classList.add('active');
    }
    if (this.timeIndicatorComponent && getComputedStyle(this.timeIndicatorComponent).display !== 'none') {
        this.pauseVisualTimerAnimation();
    }
  }

  startVisualTimerAnimation() {
    if (!this.timeIndicatorRotator) return;
    this.timeIndicatorRotator.style.transition = 'none';
    this.timeIndicatorRotator.style.transform = `rotate(0deg)`;
    this.timeIndicatorRotator.classList.remove('move');
    this.timeIndicatorMask.classList.remove('move');
    void this.timeIndicatorRotator.offsetWidth;
    this.timeIndicatorRotator.style.transition = `transform ${this.configSettings.advanceInterval}ms linear`;
    this.timeIndicatorRotator.style.transform = `rotate(360deg)`;
    this.timeIndicatorRotator.addEventListener('transitionend', this.handleVisualTimerEnd, { once: true });
  }

  pauseVisualTimerAnimation() {
    if (!this.timeIndicatorRotator) return;
    const currentTransform = getComputedStyle(this.timeIndicatorRotator).transform;
    this.timeIndicatorRotator.style.transition = 'none';
    this.timeIndicatorRotator.style.transform = currentTransform;
    this.timeIndicatorRotator.removeEventListener('transitionend', this.handleVisualTimerEnd);
  }

  handleVisualTimerEnd() {
    if (this.isAdvanceRunning) {
        this.startVisualTimerAnimation();
    }
  }

  prepareTimerComponents() {
    const timerMarkup = `<div class="time-indicator"><span class="indicator-mask"><span class="indicator-rotator"></span></span><span class="indicator-pause"></span></div>`;
    this.timeIndicatorComponent = document.createElement('div');
    this.timeIndicatorComponent.innerHTML = timerMarkup;
    this.timeIndicatorComponent = this.timeIndicatorComponent.firstElementChild;

    this.mainContainer.appendChild(this.timeIndicatorComponent);

    this.timeIndicatorRotator = this.timeIndicatorComponent.querySelector('.indicator-rotator');
    this.timeIndicatorMask = this.timeIndicatorComponent.querySelector('.indicator-mask');
    this.timeIndicatorPauseButton = this.timeIndicatorComponent.querySelector('.indicator-pause');

    this.timeIndicatorComponent.addEventListener('click', this.handleTimeIndicatorClick);

    if (this.configSettings.resumeOnMouseOut) {
      this.mainContainer.addEventListener('mouseleave', this.delayAdvanceOnMouseOut);
      this.mainContainer.addEventListener('mouseenter', this.cancelAdvanceDelay);
    }

    if (this.configSettings.pauseOnMouseOver) {
      this.mainContainer.addEventListener('mouseenter', this.pauseAutomaticAdvance);
      if (!this.configSettings.resumeOnMouseOut) {
          this.mainContainer.addEventListener('mouseleave', () => {
              if (!this.isAdvanceRunning && this.configSettings.autoAdvance) {
                  this.beginAutomaticAdvance();
              }
          });
      }
    }
  }

  delayAdvanceOnMouseOut() {
    clearTimeout(this.mouseOutTimerId);
    this.mouseOutTimerId = setTimeout(() => {
      if (!this.isAdvanceRunning) {
        this.beginAutomaticAdvance();
      }
    }, this.configSettings.resumeDelay);
  }

  cancelAdvanceDelay() {
    clearTimeout(this.mouseOutTimerId);
  }

  handleTimeIndicatorClick() {
    if (!this.isAdvanceRunning) {
        this.beginAutomaticAdvance();
    } else {
        this.pauseAutomaticAdvance();
    }
  }

  prepareCaptionDisplay() {
    const captionMarkup = `<div class="cycler-caption"></div>`;
    this.captionDisplay = document.createElement('div');
    this.captionDisplay.innerHTML = captionMarkup;
    this.captionDisplay = this.captionDisplay.firstElementChild;

    this.mainContainer.appendChild(this.captionDisplay);
    this.updateCaptionContent();
  }

  updateCaptionContent() {
    if (!this.configSettings.displayCaptions || !this.captionDisplay) {
      return false;
    }

    const currentPanel = this.getActivePanel();
    const captionSourceId = currentPanel.getAttribute('data-caption');
    const captionSourceElement = captionSourceId ? document.querySelector(captionSourceId) : null;
    let captionText = '';

    if (captionSourceElement) {
      captionText = captionSourceElement.innerHTML;
      if (captionText.trim().length < 1) {
        captionText = '';
      }
    }

    this.captionDisplay.innerHTML = captionText;
    this.captionDisplay.style.transition = `opacity ${this.configSettings.captionTransitionDuration}ms ease-in-out, height ${this.configSettings.captionTransitionDuration}ms ease-in-out`;

    if (captionText) {
      this.captionDisplay.style.display = 'block';
      switch (this.configSettings.captionTransition) {
        case 'none':
          this.captionDisplay.style.opacity = '1';
          this.captionDisplay.style.height = 'auto';
          break;
        case 'fade':
          this.captionDisplay.style.opacity = '0';
          setTimeout(() => this.captionDisplay.style.opacity = '1', 50);
          this.captionDisplay.style.height = 'auto';
          break;
        case 'slideOpen':
          this.captionDisplay.style.height = '0';
          this.captionDisplay.style.opacity = '1';
          setTimeout(() => this.captionDisplay.style.height = `${this.captionDisplay.scrollHeight}px`, 50);
          break;
      }
    } else {
      switch (this.configSettings.captionTransition) {
        case 'none':
          this.captionDisplay.style.display = 'none';
          break;
        case 'fade':
          this.captionDisplay.style.opacity = '0';
          setTimeout(() => this.captionDisplay.style.display = 'none', this.configSettings.captionTransitionDuration);
          break;
        case 'slideOpen':
          this.captionDisplay.style.height = '0';
          setTimeout(() => this.captionDisplay.style.display = 'none', this.configSettings.captionTransitionDuration);
          break;
      }
    }
  }

  prepareNavigationArrows() {
    const navMarkup = `<div class="cycler-arrows"><span class="arrow-right"></span><span class="arrow-left"></span></div>`;
    const directionalControls = document.createElement('div');
    directionalControls.innerHTML = navMarkup;
    const arrowContainer = directionalControls.firstElementChild;

    const rightArrow = arrowContainer.querySelector('.arrow-right');
    const leftArrow = arrowContainer.querySelector('.arrow-left');

    rightArrow.innerHTML = this.configSettings.arrowRightLabel;
    leftArrow.innerHTML = this.configSettings.arrowLeftLabel;

    this.mainContainer.appendChild(arrowContainer);

    leftArrow.addEventListener('click', () => {
      this.pauseAutomaticAdvance();
      if (this.configSettings.resetTimerOnManual) {
        this.startVisualTimerAnimation();
        this.beginAutomaticAdvance();
      }
      this.host.dispatchEvent(new CustomEvent('cycler.previous'));
    });

    rightArrow.addEventListener('click', () => {
      this.pauseAutomaticAdvance();
      if (this.configSettings.resetTimerOnManual) {
        this.startVisualTimerAnimation();
        this.beginAutomaticAdvance();
      }
      this.host.dispatchEvent(new CustomEvent('cycler.next'));
    });
  }

  preparePaginationDots() {
    this.paginationDots = document.createElement('ul');
    this.paginationDots.classList.add('cycler-dots');
    this.mainContainer.appendChild(this.paginationDots);

    this.panelElements.forEach((panel, index) => this.addPaginationDot(index, panel));
    this.host.classList.add('with-dots');

    if (this.configSettings.centerDotNav) {
      this.mainContainer.classList.add('center-dots-container');
    }
  }

  addPaginationDot(index, panel) {
    const listItem = document.createElement('li');
    listItem.textContent = (index + 1).toString();

    if (this.configSettings.dotThumbnails) {
      const thumbSource = panel.getAttribute('data-thumb');
      if (thumbSource) {
        listItem.classList.add('has-thumbnail');
        listItem.style.background = `url(${this.configSettings.dotThumbnailPath}${thumbSource}) no-repeat center center / cover`;
      }
    }
    this.paginationDots.appendChild(listItem);
    listItem.dataset.panelIndex = index.toString();

    listItem.addEventListener('click', () => {
      this.pauseAutomaticAdvance();
      if (this.configSettings.resetTimerOnManual) {
        this.startVisualTimerAnimation();
        this.beginAutomaticAdvance();
      }
      this.host.dispatchEvent(new CustomEvent('cycler.moveTo', { detail: { index: parseInt(listItem.dataset.panelIndex) } }));
    });
  }

  highlightActiveDot() {
    if (!this.configSettings.dotNavigation || !this.paginationDots) {
      return false;
    } else {
      Array.from(this.paginationDots.children).forEach((dot, index) => {
        if (index === this.currentPanelIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  releaseTransitionLock() {
    this.releaseLock();
    this.configSettings.onPanelChange.call(this,
      this.panelElements[this.previousPanelIndex],
      this.panelElements[this.currentPanelIndex]
    );
  }

  changePanel(direction) {
    let nextPanelIndex;
    this.previousPanelIndex = this.currentPanelIndex;

    if (this.previousPanelIndex === direction) {
      return false;
    }

    if (this.totalPanels <= 1) {
      return false;
    }
    if (this.isTransitionLocked) {
      return;
    }

    this.engageLock();

    if (direction === "next") {
      nextPanelIndex = (this.currentPanelIndex + 1) % this.totalPanels;
    } else if (direction === "previous") {
      nextPanelIndex = (this.currentPanelIndex - 1 + this.totalPanels) % this.totalPanels;
    } else {
      nextPanelIndex = parseInt(direction, 10);
      if (isNaN(nextPanelIndex) || nextPanelIndex < 0 || nextPanelIndex >= this.totalPanels) {
        nextPanelIndex = this.currentPanelIndex;
      }
    }

    this.currentPanelIndex = nextPanelIndex;
    this.highlightActiveDot();
    this.updateCaptionContent();

    this.performTransition(this.previousPanelIndex, this.currentPanelIndex, direction);
  }

  performTransition(oldIndex, newIndex, transitionDirection) {
    const oldPanel = this.panelElements[oldIndex];
    const newPanel = this.panelElements[newIndex];

    oldPanel.style.zIndex = '2';
    newPanel.style.zIndex = '3';

    newPanel.style.display = 'block';

    switch (this.configSettings.transitionType) {
      case 'fade':
        newPanel.style.opacity = '0';
        setTimeout(() => {
          newPanel.style.transition = `opacity ${this.configSettings.transitionDuration}ms ease-in-out`;
          newPanel.style.opacity = '1';
          oldPanel.style.transition = `opacity ${this.configSettings.transitionDuration}ms ease-in-out`;
          oldPanel.style.opacity = '0';
        }, 50);

        newPanel.addEventListener('transitionend', this.transitionEndHandler, { once: true });
        break;

      case 'horizontal-slide':
      case 'horizontal-push':
      case 'vertical-slide':
      case 'vertical-push':
        this.applySlideTransition(oldPanel, newPanel, transitionDirection);
        break;

      default:
        newPanel.style.opacity = '0';
        setTimeout(() => {
          newPanel.style.transition = `opacity ${this.configSettings.transitionDuration}ms ease-in-out`;
          newPanel.style.opacity = '1';
          oldPanel.style.transition = `opacity ${this.configSettings.transitionDuration}ms ease-in-out`;
          oldPanel.style.opacity = '0';
        }, 50);

        newPanel.addEventListener('transitionend', this.transitionEndHandler, { once: true });
        break;
    }
  }

  applySlideTransition(oldPanel, newPanel, transitionDirection) {
    const isHorizontal = this.configSettings.transitionType.includes('horizontal');
    const isPush = this.configSettings.transitionType.includes('push');
    const panelWidth = this.host.offsetWidth;
    const panelHeight = this.host.offsetHeight;

    let newPanelStartOffset = '';
    let oldPanelEndOffset = '';

    const isForward = (transitionDirection === 'next' || (transitionDirection !== 'previous' && this.previousPanelIndex < this.currentPanelIndex));

    if (isHorizontal) {
      newPanelStartOffset = isForward ? `${panelWidth}px` : `-${panelWidth}px`;
      oldPanelEndOffset = isPush ? (isForward ? `-${panelWidth}px` : `${panelWidth}px`) : '0';

      newPanel.style.transform = `translateX(${newPanelStartOffset})`;
      oldPanel.style.transform = `translateX(0)`;
      newPanel.style.transition = `transform ${this.configSettings.transitionDuration}ms ease-in-out`;
      oldPanel.style.transition = `transform ${this.configSettings.transitionDuration}ms ease-in-out`;

      setTimeout(() => {
        newPanel.style.transform = `translateX(0)`;
        if (isPush) {
          oldPanel.style.transform = `translateX(${oldPanelEndOffset})`;
        }
      }, 50);

    } else {
      newPanelStartOffset = isForward ? `${panelHeight}px` : `-${panelHeight}px`;
      oldPanelEndOffset = isPush ? (isForward ? `-${panelHeight}px` : `${panelHeight}px`) : '0';

      newPanel.style.transform = `translateY(${newPanelStartOffset})`;
      oldPanel.style.transform = `translateY(0)`;
      newPanel.style.transition = `transform ${this.configSettings.transitionDuration}ms ease-in-out`;
      oldPanel.style.transition = `transform ${this.configSettings.transitionDuration}ms ease-in-out`;

      setTimeout(() => {
        newPanel.style.transform = `translateY(0)`;
        if (isPush) {
          oldPanel.style.transform = `translateY(${oldPanelEndOffset})`;
        }
      }, 50);
    }

    newPanel.addEventListener('transitionend', this.transitionEndHandler, { once: true });
  }

  transitionEndHandler(event) {
      if (event.target !== this.panelElements[this.currentPanelIndex]) {
          return;
      }

      this.panelElements.forEach((panel, index) => {
          if (index !== this.currentPanelIndex) {
              panel.style.display = 'none';
              panel.style.opacity = '0';
              panel.style.zIndex = '1';
              panel.style.transform = 'none';
              panel.style.transition = 'none';
          } else {
              panel.style.zIndex = '3';
              panel.style.opacity = '1';
              panel.style.transform = 'none';
              panel.style.transition = 'none';
          }
      });
      this.releaseTransitionLock();
  }
}