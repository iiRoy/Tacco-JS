const MOTION_RIGHT_TO_LEFT = 'rtol';
const MOTION_LEFT_TO_RIGHT = 'ltor';
const MOTION_TOP_TO_BOTTOM = 'ttob';
const MOTION_BOTTOM_TO_TOP = 'btot';

const initialSettings = {
  effectKind: 'flip',
  advanceDirection: MOTION_RIGHT_TO_LEFT,
  displayHeight: '',
  keyboardControl: true,
  showPaginator: false,
  circularLoop: false
};

const dataAttributePrefix = 'data-';
const namespacePrefix = 'pageTurner-';

const TEXT_PARAMETER = 0;
const BOOLEAN_PARAMETER = 1;

const attributeMap = [
  { key: 'effectKind', attributeName: 'effect', type: TEXT_PARAMETER },
  { key: 'advanceDirection', attributeName: 'forward-dir', type: TEXT_PARAMETER },
  { key: 'displayHeight', attributeName: 'height', type: TEXT_PARAMETER },
  { key: 'keyboardControl', attributeName: 'keyboard-nav', type: BOOLEAN_PARAMETER },
  { key: 'showPaginator', attributeName: 'show-pager', type: BOOLEAN_PARAMETER },
  { key: 'circularLoop', attributeName: 'loop', type: BOOLEAN_PARAMETER }
];

const PORTION_LEADING = 1;
const PORTION_TRAILING = -1;

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;

const activeDisplayClass = 'activeDisplay';
const activeDisplaySelector = '.' + activeDisplayClass;

const baseOverlayDepth = 10000;

function mergeConfiguration(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
  return target;
}

function extractDataAttributes(element, config) {
  const newConfig = mergeConfiguration({}, config);
  attributeMap.forEach(mapping => {
    const dataAttr = dataAttributePrefix + mapping.attributeName;
    const value = element.getAttribute(dataAttr);
    if (value !== null) {
      if (mapping.type === TEXT_PARAMETER) {
        newConfig[mapping.key] = value;
      } else if (mapping.type === BOOLEAN_PARAMETER) {
        newConfig[mapping.key] = value === 'true' || value === '';
      }
    }
  });
  return newConfig;
}

function createPageTurner(mainContainerElement, userOptions) {
  let configurationSettings = mergeConfiguration(mergeConfiguration({}, initialSettings), userOptions);
  configurationSettings = extractDataAttributes(mainContainerElement, configurationSettings);

  let activeSegmentIdentifier = null;
  let currentAnimationProgress = null;
  let isTransitionOngoing = false;
  let frontFacingSegment = null;
  let rearFacingSegment = null;
  let animationRequestHandle = null;

  function generateEffectOverlay() {
    const currentDisplayElement = mainContainerElement.querySelector(activeDisplaySelector);
    if (!currentDisplayElement) return null;

    const displayWidth = currentDisplayElement.offsetWidth;
    const displayHeight = currentDisplayElement.offsetHeight;

    const shadowElement = document.createElement('div');
    shadowElement.className = namespacePrefix + 'shadowOverlay';
    shadowElement.style.position = 'absolute';
    shadowElement.style.backgroundColor = '#111111';
    shadowElement.style.opacity = '0.9';
    shadowElement.style.display = 'none';
    shadowElement.style.zIndex = baseOverlayDepth;

    if (isOrientationVertical()) {
      shadowElement.style.width = displayWidth + 'px';
      shadowElement.style.height = (displayHeight / 2) + 'px';
      shadowElement.style.top = (displayHeight / 2) + 'px';
      shadowElement.style.left = '0';
    } else {
      shadowElement.style.width = (displayWidth / 2) + 'px';
      shadowElement.style.height = displayHeight + 'px';
      shadowElement.style.left = (displayWidth / 2) + 'px';
      shadowElement.style.top = '0';
    }

    return shadowElement;
  }

  function isOrientationVertical() {
    return (configurationSettings.advanceDirection === MOTION_TOP_TO_BOTTOM ||
            configurationSettings.advanceDirection === MOTION_BOTTOM_TO_TOP);
  }

  function splitContentIntoHalves(sourceElement, segmentClassPrefix) {
    let contentToSplit = sourceElement;
    if (!contentToSplit) {
      const rootWidth = mainContainerElement.offsetWidth;
      let rootHeight = mainContainerElement.offsetHeight;

      if (configurationSettings.showPaginator) {
        const paginatorElement = mainContainerElement.querySelector('.' + namespacePrefix + 'paginator');
        if (paginatorElement) {
          rootHeight -= paginatorElement.offsetHeight;
        }
      }
      contentToSplit = document.createElement('div');
      contentToSplit.className = namespacePrefix + 'emptyPlaceholder';
      contentToSplit.style.width = rootWidth + 'px';
      contentToSplit.style.height = rootHeight + 'px';
    }

    const isVertical = isOrientationVertical();

    const leadingClass = segmentClassPrefix + 'Leading';
    const trailingClass = segmentClassPrefix + 'Trailing';

    let leadingHalf = mainContainerElement.querySelector('.' + leadingClass);
    if (!leadingHalf) {
      leadingHalf = document.createElement('div');
      leadingHalf.className = namespacePrefix + 'splitHalf ' + namespacePrefix + 'firstHalf ' + leadingClass;
      leadingHalf.style.zIndex = baseOverlayDepth;
      leadingHalf.style.position = 'absolute';
      leadingHalf.style.overflow = 'hidden';
    } else {
      while (leadingHalf.firstChild) leadingHalf.removeChild(leadingHalf.firstChild);
    }

    let trailingHalf = mainContainerElement.querySelector('.' + trailingClass);
    if (!trailingHalf) {
      trailingHalf = document.createElement('div');
      trailingHalf.className = namespacePrefix + 'splitHalf ' + namespacePrefix + 'secondHalf ' + trailingClass;
      trailingHalf.style.zIndex = baseOverlayDepth;
      trailingHalf.style.position = 'absolute';
      trailingHalf.style.overflow = 'hidden';
    } else {
      while (trailingHalf.firstChild) trailingHalf.removeChild(trailingHalf.firstChild);
    }

    const clonedLeadingContent = contentToSplit.cloneNode(true);
    const clonedTrailingContent = contentToSplit.cloneNode(true);
    leadingHalf.appendChild(clonedLeadingContent);
    trailingHalf.appendChild(clonedTrailingContent);

    [clonedLeadingContent, clonedTrailingContent].forEach(clonedNode => {
      clonedNode.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', (event) => event.preventDefault());
      });
    });

    const displayWidth = contentToSplit.offsetWidth;
    const displayHeight = contentToSplit.offsetHeight;

    if (isVertical) {
      leadingHalf.style.width = displayWidth + 'px';
      leadingHalf.style.height = Math.floor(displayHeight / 2) + 'px';
      clonedLeadingContent.style.height = displayHeight + 'px';
      clonedLeadingContent.style.display = 'block';
    } else {
      leadingHalf.style.width = Math.floor(displayWidth / 2) + 'px';
      leadingHalf.style.height = displayHeight + 'px';
      clonedLeadingContent.style.width = displayWidth + 'px';
      clonedLeadingContent.style.display = 'block';
    }

    if (isVertical) {
      trailingHalf.style.width = displayWidth + 'px';
      trailingHalf.style.height = Math.ceil(displayHeight / 2) + 'px';
      trailingHalf.style.top = Math.floor(displayHeight / 2) + 'px';
      clonedTrailingContent.style.height = displayHeight + 'px';
      clonedTrailingContent.style.display = 'block';
      clonedTrailingContent.style.position = 'relative';
      clonedTrailingContent.style.top = (-1 * Math.floor(displayHeight / 2)) + 'px';
    } else {
      trailingHalf.style.width = Math.ceil(displayWidth / 2) + 'px';
      trailingHalf.style.height = displayHeight + 'px';
      trailingHalf.style.left = Math.floor(displayWidth / 2) + 'px';
      clonedTrailingContent.style.width = displayWidth + 'px';
      clonedTrailingContent.style.display = 'block';
      clonedTrailingContent.style.position = 'relative';
      clonedTrailingContent.style.left = (-1 * Math.floor(displayWidth / 2)) + 'px';
    }

    if (!mainContainerElement.querySelector('.' + leadingClass)) {
      mainContainerElement.appendChild(leadingHalf);
    }
    if (!mainContainerElement.querySelector('.' + trailingClass)) {
      mainContainerElement.appendChild(trailingHalf);
    }

    return { leading: leadingHalf, trailing: trailingHalf };
  }

  function retrieveAdjacentContent(currentContent, container, shouldLoop, isNext) {
      let adjacentElement = isNext ? currentContent.nextElementSibling : currentContent.previousElementSibling;
      while (adjacentElement && (adjacentElement.classList.contains(namespacePrefix + 'splitHalf') || adjacentElement.classList.contains(namespacePrefix + 'shadowOverlay') || adjacentElement.classList.contains(namespacePrefix + 'paginator') || adjacentElement.classList.contains(namespacePrefix + 'emptyPlaceholder'))) {
          adjacentElement = isNext ? adjacentElement.nextElementSibling : adjacentElement.previousElementSibling;
      }
      if (!adjacentElement && shouldLoop) {
          adjacentElement = isNext ? container.firstElementChild : container.lastElementChild;
          while (adjacentElement && (adjacentElement.classList.contains(namespacePrefix + 'splitHalf') || adjacentElement.classList.contains(namespacePrefix + 'shadowOverlay') || adjacentElement.classList.contains(namespacePrefix + 'paginator') || adjacentElement.classList.contains(namespacePrefix + 'emptyPlaceholder'))) {
              adjacentElement = isNext ? adjacentElement.nextElementSibling : adjacentElement.previousElementSibling;
          }
      }
      return adjacentElement;
  }

  function prepareTransition(segmentToFlip) {
    if (currentAnimationProgress !== null) {
      return;
    }

    currentAnimationProgress = 0;
    activeSegmentIdentifier = segmentToFlip;

    const currentDisplayElement = mainContainerElement.querySelector(activeDisplaySelector);
    let underneathContentElement = null;

    const isAdvancingForward = (
        (configurationSettings.advanceDirection === MOTION_LEFT_TO_RIGHT && segmentToFlip === PORTION_LEADING) ||
        (configurationSettings.advanceDirection === MOTION_RIGHT_TO_LEFT && segmentToFlip === PORTION_TRAILING) ||
        (configurationSettings.advanceDirection === MOTION_TOP_TO_BOTTOM && segmentToFlip === PORTION_LEADING) ||
        (configurationSettings.advanceDirection === MOTION_BOTTOM_TO_TOP && segmentToFlip === PORTION_TRAILING)
    );

    underneathContentElement = retrieveAdjacentContent(currentDisplayElement, mainContainerElement, configurationSettings.circularLoop, isAdvancingForward);

    const rearSegments = splitContentIntoHalves(underneathContentElement, 'rear');
    const frontSegments = splitContentIntoHalves(currentDisplayElement, 'front');

    if (segmentToFlip === PORTION_TRAILING) {
      frontFacingSegment = frontSegments.trailing;
      rearFacingSegment = rearSegments.leading;
    } else {
      frontFacingSegment = frontSegments.leading;
      rearFacingSegment = rearSegments.trailing;
    }

    frontFacingSegment.style.zIndex = baseOverlayDepth + 1;
    rearFacingSegment.style.zIndex = baseOverlayDepth;

    const shadowElement = generateEffectOverlay();
    if (shadowElement) {
      if (isOrientationVertical()) {
        if (segmentToFlip === PORTION_LEADING) {
          shadowElement.style.top = '0px';
        }
      } else {
        if (segmentToFlip === PORTION_LEADING) {
          shadowElement.style.left = '0px';
        }
      }
      mainContainerElement.appendChild(shadowElement);
      shadowElement.style.display = 'block';
    }

    if (isOrientationVertical()) {
      frontFacingSegment.classList.add(namespacePrefix + 'verticalMotion');
      rearFacingSegment.classList.add(namespacePrefix + 'verticalMotion');
    } else {
      frontFacingSegment.classList.add(namespacePrefix + 'horizontalMotion');
      rearFacingSegment.classList.add(namespacePrefix + 'horizontalMotion');
    }

    frontFacingSegment.classList.add(namespacePrefix + 'activeFlipping');
    rearFacingSegment.classList.add(namespacePrefix + 'hiddenFlipping');

    if (currentDisplayElement) {
      currentDisplayElement.classList.remove(activeDisplayClass);
      currentDisplayElement.classList.add(namespacePrefix + 'workingContent');
    }
  }

  function calculatePrimaryRotationCSS(progressRatio) {
    if (isOrientationVertical()) {
      return 'rotateX(' + (-1 * 180 * progressRatio) + 'deg)';
    } else {
      return 'rotateY(' + (180 * progressRatio) + 'deg)';
    }
  }

  function calculateSecondaryRotationCSS(progressRatio) {
    if (isOrientationVertical()) {
      if (activeSegmentIdentifier === PORTION_LEADING) {
        return 'rotateX(' + (-1 * (180 + (180 * progressRatio))) + 'deg)';
      } else {
        return 'rotateX(' + (180 - (180 * progressRatio)) + 'deg)';
      }
    } else {
      if (activeSegmentIdentifier === PORTION_LEADING) {
        return 'rotateY(' + (180 + (180 * progressRatio)) + 'deg)';
      } else {
        return 'rotateY(' + (-1 * (180 - (180 * progressRatio))) + 'deg)';
      }
    }
  }

  function updateVisualState(progressRatio) {
    const activeWorkingElement = mainContainerElement.querySelector('.' + namespacePrefix + 'workingContent');
    if (!activeWorkingElement) {
      return;
    }

    currentAnimationProgress = progressRatio;

    frontFacingSegment.style.transform = calculatePrimaryRotationCSS(progressRatio);
    rearFacingSegment.style.transform = calculateSecondaryRotationCSS(progressRatio);

    const opacityEasingFunction = (p) => {
      const factor = 1.2;
      return -1 * factor * (p - 1) * (p - 1) + factor;
    };

    const shadowOverlay = mainContainerElement.querySelector('.' + namespacePrefix + 'shadowOverlay');
    if (!shadowOverlay) return;

    const displayHeight = frontFacingSegment.offsetHeight;

    const angleInDegrees = Math.abs(180 * progressRatio);
    let shadowOpacityValue = 0;

    if (angleInDegrees > 90) {
      frontFacingSegment.style.zIndex = baseOverlayDepth;
      rearFacingSegment.style.zIndex = baseOverlayDepth + 1;

      if (rearFacingSegment.style.display === 'none') {
        rearFacingSegment.style.display = 'block';
        frontFacingSegment.style.display = 'none';
      }

      if (isOrientationVertical()) {
        if (activeSegmentIdentifier === PORTION_TRAILING) {
          shadowOverlay.style.top = '0';
        } else {
          shadowOverlay.style.top = displayHeight + 'px';
        }
      } else {
        if (activeSegmentIdentifier === PORTION_TRAILING) {
          shadowOverlay.style.left = '0';
        } else {
          shadowOverlay.style.left = '50%';
        }
      }
      shadowOpacityValue = Math.max(0, 1 - opacityEasingFunction((180 - angleInDegrees) / 90));
    } else {
      frontFacingSegment.style.zIndex = baseOverlayDepth + 1;
      rearFacingSegment.style.zIndex = baseOverlayDepth;

      if (frontFacingSegment.style.display === 'none') {
        rearFacingSegment.style.display = 'none';
        frontFacingSegment.style.display = 'block';
      }

      if (isOrientationVertical()) {
        if (activeSegmentIdentifier === PORTION_TRAILING) {
          shadowOverlay.style.top = displayHeight + 'px';
        } else {
          shadowOverlay.style.top = '0';
        }
      } else {
        if (activeSegmentIdentifier === PORTION_TRAILING) {
          shadowOverlay.style.left = '50%';
        } else {
          shadowOverlay.style.left = '0';
        }
      }
      shadowOpacityValue = Math.max(0, 1 - opacityEasingFunction((angleInDegrees) / 90));
    }
    shadowOverlay.style.opacity = (0.9 * shadowOpacityValue).toString();
  }

  function finalizeTransition() {
    isTransitionOngoing = false;
    currentAnimationProgress = null;

    const workingContentElement = mainContainerElement.querySelector('.' + namespacePrefix + 'workingContent');
    if (workingContentElement) {
      workingContentElement.classList.remove(namespacePrefix + 'workingContent');
      workingContentElement.classList.add(activeDisplayClass);
    }

    const segmentsToRemove = mainContainerElement.querySelectorAll('.' + namespacePrefix + 'splitHalf');
    segmentsToRemove.forEach(seg => seg.remove());

    const shadowOverlayElement = mainContainerElement.querySelector('.' + namespacePrefix + 'shadowOverlay');
    if (shadowOverlayElement) {
      shadowOverlayElement.remove();
    }

    frontFacingSegment = null;
    rearFacingSegment = null;
    activeSegmentIdentifier = null;
  }

  function runAnimationSequence(targetProgress, durationMs = 500) {
    if (isTransitionOngoing) {
      cancelAnimationFrame(animationRequestHandle);
    }
    isTransitionOngoing = true;

    const startingProgress = currentAnimationProgress;
    const progressDifference = targetProgress - startingProgress;
    const animationStartTime = performance.now();

    const easeOutCubic = (t) => {
      t /= durationMs;
      t--;
      return progressDifference * (t * t * t + 1) + startingProgress;
    };

    const animationFrameCallback = (currentTime) => {
      const elapsedTime = currentTime - animationStartTime;
      const newProgressValue = easeOutCubic(elapsedTime);

      updateVisualState(newProgressValue);

      if (elapsedTime < durationMs) {
        animationRequestHandle = requestAnimationFrame(animationFrameCallback);
      } else {
        updateVisualState(targetProgress);
        finalizeTransition();
      }
    };

    animationRequestHandle = requestAnimationFrame(animationFrameCallback);
  }

  function changePage(isAdvancing) {
    if (isTransitionOngoing) return;

    let segmentToInitiateFlip;
    let targetAnimationProgress;

    if (isAdvancing) {
      targetAnimationProgress = 1;
      if (configurationSettings.advanceDirection === MOTION_RIGHT_TO_LEFT || configurationSettings.advanceDirection === MOTION_BOTTOM_TO_TOP) {
        segmentToInitiateFlip = PORTION_TRAILING;
      } else {
        segmentToInitiateFlip = PORTION_LEADING;
      }
    } else {
      targetAnimationProgress = 0;
      if (configurationSettings.advanceDirection === MOTION_RIGHT_TO_LEFT || configurationSettings.advanceDirection === MOTION_BOTTOM_TO_TOP) {
        segmentToInitiateFlip = PORTION_LEADING;
      } else {
        segmentToInitiateFlip = PORTION_TRAILING;
      }
    }

    prepareTransition(segmentToInitiateFlip);
    runAnimationSequence(targetAnimationProgress);
  }

  if (configurationSettings.keyboardControl) {
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === KEY_CODE_LEFT) {
        changePage(false);
      } else if (event.keyCode === KEY_CODE_RIGHT) {
        changePage(true);
      }
    });
  }

  return {
    moveForward: () => changePage(true),
    moveBackward: () => changePage(false)
  };
}