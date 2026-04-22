const systemSettings = new Map();
systemSettings.set('timingInterval', 100);
systemSettings.set('firstPalette', ['999933', '339999', 'CC44CC']);
systemSettings.set('secondPalette', ['993333', 'FF0000', '993333', 'FF8800']);
systemSettings.set('thirdPalette', ['0055FF', '1155FF', '2255FF', '3355FF', '4455FF', '5555FF', '4455FF', '3355FF', '2255FF', '1155FF' ]);

function convertHexToRgb(hValue) {
  let r = 0, g = 0, b = 0;
  if (hValue.length === 3) {
    r = parseInt(hValue[0] + hValue[0], 16);
    g = parseInt(hValue[1] + hValue[1], 16);
    b = parseInt(hValue[2] + hValue[2], 16);
  } else if (hValue.length === 6) {
    r = parseInt(hValue.substring(0, 2), 16);
    g = parseInt(hValue.substring(2, 4), 16);
    b = parseInt(hValue.substring(4, 6), 16);
  }
  return [r, g, b];
}

function convertRgbToHex(red, green, blue) {
  const toHex = (c) => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function blendColorsSmoothly(colorA_hex, colorB_hex, progressRatio) {
  const [r1, g1, b1] = convertHexToRgb(colorA_hex);
  const [r2, g2, b2] = convertHexToRgb(colorB_hex);

  const finalRed = r1 + (r2 - r1) * progressRatio;
  const finalGreen = g1 + (g2 - g1) * progressRatio;
  const finalBlue = b1 + (b2 - b1) * progressRatio;

  return convertRgbToHex(finalRed, finalGreen, finalBlue);
}

function applyDynamicStyle(elementIdentifier, styleAttribute, colorArray, currentMoment) {
  const timeOffset = currentMoment.getSeconds() + currentMoment.getMinutes()*60 + currentMoment.getHours()*24;
  const primaryColor = colorArray[timeOffset % colorArray.length];
  const secondaryColor = colorArray[(timeOffset + 1) % colorArray.length];
  const interpolationProgress = currentMoment.getMilliseconds() / 1000;

  const interpolatedColor = blendColorsSmoothly(primaryColor, secondaryColor, interpolationProgress);

  document.querySelectorAll(elementIdentifier).forEach(targetElement => {
    targetElement.style[styleAttribute] = interpolatedColor;
  });
}

function determineSubmissionInterval() {
  return document.querySelectorAll('.arrival-sequence').length ? 1500 : 500;
}

function initiateVisualSequence() {
  const currentInstant = new Date();

  applyDynamicStyle( '.alpha-elements', 'color', systemSettings.get('firstPalette'), currentInstant );
  applyDynamicStyle( '.omega-elements', 'color', systemSettings.get('thirdPalette'), currentInstant );
  applyDynamicStyle( '.mu-elements', 'color', systemSettings.get('secondPalette'), currentInstant );

  setTimeout( initiateVisualSequence, systemSettings.get('timingInterval') );
}

function establishSessionToken(tokenKey, tokenValue, durationDays, pathValue) {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
  const expires = `expires=${expiryDate.toUTCString()}`;
  document.cookie = `${tokenKey}=${tokenValue};${expires};path=${pathValue}`;
}

function setupCollapsiblePanels(panelContainerClass) {
  document.querySelectorAll(`.${panelContainerClass}`).forEach(container => {
    const headers = container.querySelectorAll(':scope > div:nth-child(odd), :scope > h3');
    const contents = container.querySelectorAll(':scope > div:nth-child(even)');

    headers.forEach((header, index) => {
      const content = contents[index];
      if (!content) return;

      header.style.cursor = 'pointer';
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease-out, padding 0.3s ease-out';
      content.style.maxHeight = '0px';
      content.style.paddingTop = '0px';
      content.style.paddingBottom = '0px';

      header.addEventListener('click', () => {
        const isCurrentlyOpen = content.style.maxHeight !== '0px';

        contents.forEach(c => {
          if (c !== content) {
            c.style.maxHeight = '0px';
            c.style.paddingTop = '0px';
            c.style.paddingBottom = '0px';
          }
        });

        if (isCurrentlyOpen) {
          content.style.maxHeight = '0px';
          content.style.paddingTop = '0px';
          content.style.paddingBottom = '0px';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.paddingTop = '';
          content.style.paddingBottom = '';
        }
      });
    });
  });
}

function configureSwitchableSections(sectionContainerClass) {
  document.querySelectorAll(`.${sectionContainerClass}`).forEach(container => {
    const tabList = container.querySelector('ul');
    if (!tabList) return;

    const tabLinks = tabList.querySelectorAll('a');
    const tabPanels = container.querySelectorAll(':scope > div');

    tabLinks.forEach((link, index) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetPanel = container.querySelector(`#${targetId}`);

      if (index === 0) {
        link.classList.add('active-tab-link');
        if (targetPanel) targetPanel.style.display = '';
      } else {
        if (targetPanel) targetPanel.style.display = 'none';
      }

      link.addEventListener('click', (event) => {
        event.preventDefault();
        tabLinks.forEach(l => l.classList.remove('active-tab-link'));
        tabPanels.forEach(p => p.style.display = 'none');

        link.classList.add('active-tab-link');
        if (targetPanel) targetPanel.style.display = '';
      });
    });
  });
}

function attachHoverInfo(elementSelectors, options) {
  const infoPanelClass = options.tooltipClass || 'default-hover-information';
  const hideDelayMs = (options.hide || 0) * 1000;

  let activeHoverTimer = null;
  let activeInfoPanel = null;

  document.querySelectorAll(elementSelectors).forEach(element => {
    const contextTitle = element.getAttribute('title');
    if (contextTitle) {
      element.removeAttribute('title');

      element.addEventListener('mouseenter', (eventDetail) => {
        if (activeHoverTimer) clearTimeout(activeHoverTimer);
        if (activeInfoPanel) activeInfoPanel.remove();

        const infoBox = document.createElement('div');
        infoBox.classList.add(infoPanelClass);
        infoBox.textContent = contextTitle;
        infoBox.style.position = 'absolute';
        infoBox.style.zIndex = '9999';
        infoBox.style.pointerEvents = 'none';
        infoBox.style.visibility = 'hidden'; // Hide initially for measurement

        document.body.appendChild(infoBox);
        activeInfoPanel = infoBox;

        const targetRect = element.getBoundingClientRect();
        const infoBoxWidth = infoBox.offsetWidth;
        const infoBoxHeight = infoBox.offsetHeight;

        let topPosition = targetRect.top + window.scrollY + (targetRect.height / 2) - (infoBoxHeight / 2);
        let leftPosition = targetRect.left + window.scrollX - infoBoxWidth - 5; // Default: left of element

        // Basic collision: if it goes off left, flip to right
        if (leftPosition < 0) {
          leftPosition = targetRect.right + window.scrollX + 5;
        }

        infoBox.style.top = `${topPosition}px`;
        infoBox.style.left = `${leftPosition}px`;
        infoBox.style.visibility = 'visible';
      });

      element.addEventListener('mouseleave', () => {
        if (activeHoverTimer) clearTimeout(activeHoverTimer);
        activeHoverTimer = setTimeout(() => {
          if (activeInfoPanel) {
            activeInfoPanel.remove();
            activeInfoPanel = null;
          }
        }, hideDelayMs);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  establishSessionToken('scriptStatus', 'active', 1, '/play');

  document.querySelectorAll('img').forEach(imageElement => {
    imageElement.addEventListener('mousedown', (eventOccasion) => {
      eventOccasion.preventDefault();
    });
  });

  document.querySelectorAll('input[name="input_mode"]').forEach(inputControl => {
    inputControl.addEventListener('change', () => {
      const relevantSwitches = document.querySelectorAll('.cardinal-selection:checked');
      const disableState = relevantSwitches.length > 0;
      document.querySelectorAll('.directional-inhibitor').forEach(directionalButton => {
        directionalButton.disabled = disableState;
      });
    });
  });

  setupCollapsiblePanels('collapsible-region');
  configureSwitchableSections('switchable-interface');
  attachHoverInfo("label, button, input, a, div", {
    position: { my: "right center", at: "left-2 center", collision: "flipfit" },
    hide: 0.25,
    tooltipClass: "hover-information-panel"
  });

  document.querySelectorAll('.autosubmit-form').forEach(formElement => { formElement.style.display = 'none'; });
  document.querySelectorAll('.delayed-autosubmit-form').forEach(formElement => { formElement.style.display = 'none'; });

  setTimeout(() => {
    document.querySelectorAll('.autosubmit-form').forEach(formElement => { formElement.submit(); });
  }, 100);

  setTimeout(() => {
    document.querySelectorAll('.delayed-autosubmit-form').forEach(formElement => { formElement.submit(); });
  }, determineSubmissionInterval());

  initiateVisualSequence();
});