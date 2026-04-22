let activeInteractionTarget = null;

const computeMagnitude = (pointOne, pointTwo) => {
  const horizontalDelta = pointOne.x - pointTwo.x;
  const verticalDelta = pointOne.y - pointTwo.y;
  return Math.sqrt((horizontalDelta * horizontalDelta) + (verticalDelta * verticalDelta));
};

const bindGesture = function(targetElements, settings = {}) {
  const defaultSettings = {
    distanceLimit: 15,
    onActivation: null,
    touchDeviceExclusive: undefined,
    onAborted: null,
    onThresholdBreach: null
  };

  let effectiveSettings = { ...defaultSettings };
  if (typeof settings === 'function') {
    effectiveSettings.onActivation = settings;
  } else if (typeof settings === 'object') {
    effectiveSettings = { ...defaultSettings, ...settings };
  }

  if (typeof effectiveSettings.distanceLimit !== 'number' || isNaN(effectiveSettings.distanceLimit)) {
    effectiveSettings.distanceLimit = defaultSettings.distanceLimit;
  }

  const elementsCollection = targetElements instanceof NodeList ? Array.from(targetElements) : [targetElements];
  const environmentHasTouch = 'ontouchstart' in window;

  elementsCollection.forEach(subjectElement => {
    if (!subjectElement || !(subjectElement instanceof Element)) return;

    if (environmentHasTouch) {
      let currentTravelledPath = 0;
      let initialTouchCoordinates = null;
      let gestureInitiated = false;

      const onTouchInitiate = (eventInstance) => {
        if (activeInteractionTarget !== null && activeInteractionTarget !== subjectElement) {
          return;
        }
        activeInteractionTarget = subjectElement;

        gestureInitiated = true;
        currentTravelledPath = 0;

        if (eventInstance.touches && eventInstance.touches[0]) {
          const primaryTouch = eventInstance.touches[0];
          initialTouchCoordinates = { x: primaryTouch.screenX, y: primaryTouch.screenY };
        }
      };

      const onTouchConclude = (eventInstance) => {
        if (activeInteractionTarget === subjectElement) {
          activeInteractionTarget = null;
        }
        if (!gestureInitiated) return;
        gestureInitiated = false;

        if (currentTravelledPath < effectiveSettings.distanceLimit) {
          if (typeof effectiveSettings.onActivation === 'function') {
            effectiveSettings.onActivation.apply(subjectElement, Array.from(arguments));
          }
        } else {
          if (typeof effectiveSettings.onAborted === 'function') {
            effectiveSettings.onAborted.apply(subjectElement, Array.from(arguments));
          }
          subjectElement.dispatchEvent(new CustomEvent('gesture-failed', { bubbles: true, detail: { element: subjectElement } }));
        }
      };

      const onTouchMovement = (eventInstance) => {
        if (!gestureInitiated) return;
        if (eventInstance.touches.length === 0 || initialTouchCoordinates === null) {
          gestureInitiated = false;
          return;
        }

        const currentTouch = eventInstance.touches[0];
        const currentPosition = { x: currentTouch.screenX, y: currentTouch.screenY };

        currentTravelledPath = computeMagnitude(initialTouchCoordinates, currentPosition);

        if (currentTravelledPath > effectiveSettings.distanceLimit) {
          if (typeof effectiveSettings.onThresholdBreach === 'function') {
            effectiveSettings.onThresholdBreach.apply(subjectElement, Array.from(arguments));
          }
          subjectElement.dispatchEvent(new CustomEvent('gesture-distance-exceeded', { bubbles: true, detail: { element: subjectElement } }));
          gestureInitiated = false;
        }
      };

      const onTouchInterruption = (eventInstance) => {
        if (activeInteractionTarget === subjectElement) {
          activeInteractionTarget = null;
        }
        gestureInitiated = false;
        if (typeof effectiveSettings.onAborted === 'function') {
          effectiveSettings.onAborted.apply(subjectElement, Array.from(arguments));
        }
        subjectElement.dispatchEvent(new CustomEvent('gesture-failed', { bubbles: true, detail: { element: subjectElement } }));
      };

      subjectElement.addEventListener('touchstart', onTouchInitiate, { passive: true });
      subjectElement.addEventListener('touchend', onTouchConclude, { passive: true });
      subjectElement.addEventListener('touchmove', onTouchMovement, { passive: true });
      subjectElement.addEventListener('touchcancel', onTouchInterruption, { passive: true });

    } else if (!effectiveSettings.touchDeviceExclusive) {
      subjectElement.addEventListener('click', function(clickEvent) {
        if (typeof effectiveSettings.onActivation === 'function') {
          effectiveSettings.onActivation.apply(this, Array.from(arguments));
        }
      });
    }
  });

  return targetElements;
};