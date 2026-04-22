(function(doc) {
  'use strict';

  window.establishSlidingMechanism = function(triggerElement, configParams) {
    if (!(triggerElement instanceof Element)) {
      console.error('The initial argument for establishing the sliding mechanism must be a DOM Element.');
      return;
    }

    const activationTrigger = triggerElement;

    const defaultParameters = {
      'paneIdentifier': ('#menu'),
      'shifterIdentifier': ('.push'),
      'displayOrientation': 'left',
      'paneDimension': '15.625em',
      'animationDuration': '300',
      'initialStatus': 'closed',
      'activeIndicationClass': 'active',
      'clickOffToDismiss': false
    };

    const operationalParameters = Object.assign({}, defaultParameters, configParams);

    let currentStatus = (operationalParameters.initialStatus === 'open');

    let paneElement;
    let shifterElement;

    function isDescendantOrSelf(childCandidate, parentCandidate) {
        let current = childCandidate;
        while (current) {
            if (current === parentCandidate) {
                return true;
            }
            current = current.parentNode;
        }
        return false;
    }

    function beginSetup() {
      paneElement = doc.querySelector(operationalParameters.paneIdentifier);
      shifterElement = doc.querySelector(operationalParameters.shifterIdentifier);

      if (!paneElement || !shifterElement) {
          console.error('Target pane or content shifter element not found with provided identifiers.');
          return;
      }

      const initialPanePlacement = {
        'position': 'fixed',
        'top': '0',
        'bottom': '0',
        'height': '100%'
      };

      initialPanePlacement[operationalParameters.displayOrientation] = '-' + operationalParameters.paneDimension;
      initialPanePlacement.width = operationalParameters.paneDimension;

      if (!currentStatus) {
        Object.keys(initialPanePlacement).forEach(prop => {
          paneElement.style[prop] = initialPanePlacement[prop];
        });
        shifterElement.style[operationalParameters.displayOrientation] = '0';
      } else {
        paneElement.style[operationalParameters.displayOrientation] = '0';
        shifterElement.style[operationalParameters.displayOrientation] = operationalParameters.paneDimension;
        activationTrigger.classList.add(operationalParameters.activeIndicationClass);
      }

      const motionAttributes = {
        '-webkit-transition': '',
        '-moz-transition': '',
        '-ms-transition': '',
        '-o-transition': '',
        'transition': ''
      };
      const motionStyleValue = operationalParameters.displayOrientation + ' ' + operationalParameters.animationDuration + 'ms ease';
      Object.keys(motionAttributes).forEach(prop => {
        motionAttributes[prop] = motionStyleValue;
      });

      Object.keys(motionAttributes).forEach(prop => {
        paneElement.style[prop] = motionAttributes[prop];
        shifterElement.style[prop] = motionAttributes[prop];
      });

      activationTrigger.addEventListener('click', handleToggleAction);
      activationTrigger.addEventListener('touchstart', handleToggleAction);

      if (operationalParameters.clickOffToDismiss) {
        doc.body.addEventListener('click', handleGlobalClick);
      }
    }

    function handleToggleAction(event) {
      event.preventDefault();
      if (currentStatus) {
        hidePane();
      } else {
        showPane();
      }
    }

    function handleGlobalClick(event) {
      if (currentStatus && !isDescendantOrSelf(event.target, activationTrigger)) {
        hidePane();
      }
    }

    function showPane() {
      currentStatus = true;
      paneElement.style[operationalParameters.displayOrientation] = '0';
      shifterElement.style[operationalParameters.displayOrientation] = operationalParameters.paneDimension;
      activationTrigger.classList.add(operationalParameters.activeIndicationClass);
    }

    function hidePane() {
      currentStatus = false;
      paneElement.style[operationalParameters.displayOrientation] = '-' + operationalParameters.paneDimension;
      shifterElement.style[operationalParameters.displayOrientation] = '0';
      activationTrigger.classList.remove(operationalParameters.activeIndicationClass);
    }

    beginSetup();
  };

}(document));