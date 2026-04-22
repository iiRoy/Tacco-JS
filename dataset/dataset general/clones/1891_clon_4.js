'use strict';

const ApplicationCentral = window.ApplicationCentral || {};
ApplicationCentral.theme = ApplicationCentral.theme || 'default.css';
ApplicationCentral.title = ApplicationCentral.title || '';

const createDebounceHandler = (delayMillis) => {
  let activeTimer = null;
  return (action) => {
    if (activeTimer) {
      clearTimeout(activeTimer);
    }
    activeTimer = setTimeout(() => {
      activeTimer = null;
      action();
    }, delayMillis);
  };
};

const headlineUpdateDebouncer = createDebounceHandler(300);

const styleSheetController = (() => {
  const stylePathPrefix = 'css/';
  const knownSchemes = new Set(['default.css', 'night.css', 'beige.css']);

  const retireStyleLink = (schemeName) => {
    const targetLink = document.head.querySelector(`link[rel="stylesheet"][href$="${schemeName}"]`);
    if (targetLink) {
      targetLink.parentNode.removeChild(targetLink);
    }
  };

  const introduceStyleLink = (schemeName) => {
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = `${stylePathPrefix}${schemeName}`;
    document.head.appendChild(newLink);
  };

  const synchronizeVisualScheme = (chosenScheme) => {
    knownSchemes.forEach(retireStyleLink);
    introduceStyleLink(chosenScheme);
  };

  return { synchronizeVisualScheme };
})();

const panelMotionSupervisor = (() => {
  let movementIsActive = false;
  const motionDuration = 300;

  const adjustPanelTransform = (panelElement, position) => {
    const transformValue = `translateX(${position})`;
    panelElement.style.setProperty('transform', transformValue);
    panelElement.style.setProperty('-webkit-transform', transformValue);
    panelElement.style.setProperty('-moz-transform', transformValue);
  };

  const commenceHiding = (panelNode) => {
    adjustPanelTransform(panelNode, '-90%');
    movementIsActive = true;
    setTimeout(() => {
      movementIsActive = false;
    }, motionDuration);
  };

  const commenceDisplaying = (panelNode) => {
    if (movementIsActive) {
      return;
    }
    adjustPanelTransform(panelNode, '0');
  };

  return { commenceHiding, commenceDisplaying };
})();

const InteractionConfigurator = (uiComponents) => {
  const { inputField, themeSelectionControl, collapseButton, sideNavigationPanel } = uiComponents;

  const processHeadlineUpdate = (event) => {
    const textValue = event.target.value;
    headlineUpdateDebouncer(() => {
      document.title = textValue;
      ApplicationCentral.title = textValue;
    });
  };

  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    ApplicationCentral.theme = selectedTheme;
    styleSheetController.synchronizeVisualScheme(selectedTheme);
  };

  const activatePanelCollapse = () => {
    const panelToAffect = collapseButton.parentNode;
    panelMotionSupervisor.commenceHiding(panelToAffect);
  };

  const activatePanelExpansion = (event) => {
    const panelToAffect = event.currentTarget;
    panelMotionSupervisor.commenceDisplaying(panelToAffect);
  };

  const establishEventBindings = () => {
    inputField.addEventListener('keyup', processHeadlineUpdate, false);
    themeSelectionControl.addEventListener('change', handleThemeChange, false);
    collapseButton.addEventListener('click', activatePanelCollapse, false);
    sideNavigationPanel.addEventListener('mouseover', activatePanelExpansion, false);
  };

  return { establishEventBindings };
};

module.exports = {
  createInteractionModule: InteractionConfigurator
};