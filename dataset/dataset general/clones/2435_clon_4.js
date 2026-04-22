const elementConfigurationCatalog = new WeakMap();
let activeInputElement = null;
let timeSelectionPanel = null;

const standardConfiguration = {
    panelVisualClass: 'moment-selector-panel',
    panelVisualWidth: '22em',
    hourDisplayLabel: 'Hour',
    minuteDisplayLabel: 'Minutes',
    actionButtonLabel: 'Apply',
    triggerButtonContent: undefined,
    showOnFocus: true,
    layerOrder: 10,
    beforePanelOpens: undefined,
    afterPanelCloses: undefined
};

function constructDomElement(tag, classes = [], attributes = {}, content = '') {
    const domElement = document.createElement(tag);
    if (classes.length) {
        domElement.className = classes.join(' ');
    }
    for (const key in attributes) {
        domElement.setAttribute(key, attributes[key]);
    }
    if (content) {
        domElement.innerHTML = content;
    }
    return domElement;
}

function extractTimeComponents(timeString) {
    let currentHour = 1;
    let currentMinute = '00';
    let currentAmPm = 'AM';

    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const timeMatch = timePattern.exec(timeString);

    if (timeMatch) {
        currentHour = parseInt(timeMatch[1], 10);
        currentMinute = timeMatch[2];
        currentAmPm = timeMatch[3].toUpperCase();
    }

    return { hour: currentHour, minute: currentMinute, ampm: currentAmPm };
}

function refreshPanelDisplay(hr, min, ampm) {
    if (timeSelectionPanel) {
        timeSelectionPanel.querySelector('[data-time-identifier="hour-display"]').textContent = hr;
        timeSelectionPanel.querySelector('[data-time-identifier="minute-display"]').textContent = min;
        timeSelectionPanel.querySelector('[data-time-identifier="ampm-display"]').textContent = ampm;
    }
}

function onHourSelection(event) {
    const selectedHour = event.target.textContent;
    const currentMinute = timeSelectionPanel.querySelector('[data-time-identifier="minute-display"]').textContent;
    const currentAmPm = timeSelectionPanel.querySelector('[data-time-identifier="ampm-display"]').textContent;
    refreshPanelDisplay(selectedHour, currentMinute, currentAmPm);
}

function onMinuteSelection(event) {
    const selectedMinute = event.target.textContent;
    const currentHour = timeSelectionPanel.querySelector('[data-time-identifier="hour-display"]').textContent;
    const currentAmPm = timeSelectionPanel.querySelector('[data-time-identifier="ampm-display"]').textContent;
    refreshPanelDisplay(currentHour, selectedMinute, currentAmPm);
}

function onAmPmSelection(event) {
    const selectedAmPm = event.target.textContent;
    const currentHour = timeSelectionPanel.querySelector('[data-time-identifier="hour-display"]').textContent;
    const currentMinute = timeSelectionPanel.querySelector('[data-time-identifier="minute-display"]').textContent;
    refreshPanelDisplay(currentHour, currentMinute, selectedAmPm);
}

function confirmTimeSelection() {
    if (!activeInputElement) return;

    const selectedHour = timeSelectionPanel.querySelector('[data-time-identifier="hour-display"]').textContent;
    const selectedMinute = timeSelectionPanel.querySelector('[data-time-identifier="minute-display"]').textContent;
    const selectedAmPm = timeSelectionPanel.querySelector('[data-time-identifier="ampm-display"]').textContent;

    const newTimeOutput = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;
    const originalInputValue = activeInputElement.value;

    activeInputElement.value = newTimeOutput;
    if (newTimeOutput !== originalInputValue) {
        activeInputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    concealPanel();
}

function initializeTimePanelStructure() {
    if (timeSelectionPanel) return;

    timeSelectionPanel = constructDomElement('div', ['moment-selector-wrapper'], { id: 'momentSelectorPanel' });
    timeSelectionPanel.style.display = 'none';
    timeSelectionPanel.style.position = 'absolute';
    timeSelectionPanel.style.opacity = '0';

    const panelHead = constructDomElement('div', ['selector-head']);
    const closeAction = constructDomElement('a', ['selector-close-control'], { href: '#', title: 'Close Selector' }, 'X');
    closeAction.addEventListener('click', (e) => { e.preventDefault(); concealPanel(); });
    panelHead.appendChild(closeAction);

    const currentTimeDisplay = constructDomElement('div', ['selector-current-moment']);
    currentTimeDisplay.appendChild(constructDomElement('span', [], { 'data-time-identifier': 'hour-display' }, '1'));
    currentTimeDisplay.appendChild(document.createTextNode(' : '));
    currentTimeDisplay.appendChild(constructDomElement('span', [], { 'data-time-identifier': 'minute-display' }, '00'));
    currentTimeDisplay.appendChild(document.createTextNode(' '));
    currentTimeDisplay.appendChild(constructDomElement('span', [], { 'data-time-identifier': 'ampm-display' }, 'AM'));
    panelHead.appendChild(currentTimeDisplay);

    timeSelectionPanel.appendChild(panelHead);

    const selectorContent = constructDomElement('div', ['selector-body-content']);

    const ampmSection = constructDomElement('div', ['selector-meridiem-group']);
    const amBtn = constructDomElement('button', ['selector-meridiem-button'], {}, 'AM');
    const pmBtn = constructDomElement('button', ['selector-meridiem-button'], {}, 'PM');
    amBtn.addEventListener('click', onAmPmSelection);
    pmBtn.addEventListener('click', onAmPmSelection);
    ampmSection.appendChild(amBtn);
    ampmSection.appendChild(pmBtn);
    selectorContent.appendChild(ampmSection);

    const hourColumn = constructDomElement('div', ['selector-column', 'selector-hour-column']);
    hourColumn.appendChild(constructDomElement('div', ['selector-label-text'], { 'data-label-type': 'hour-label' }, 'Hour'));
    const hourGrid = constructDomElement('div', ['selector-grid', 'selector-hour-grid']);
    for (let i = 1; i <= 12; i++) {
        const hourBtn = constructDomElement('button', ['selector-time-button', 'selector-hour-button'], {}, String(i));
        hourBtn.addEventListener('click', onHourSelection);
        hourGrid.appendChild(hourBtn);
    }
    hourColumn.appendChild(hourGrid);
    selectorContent.appendChild(hourColumn);

    const minuteColumn = constructDomElement('div', ['selector-column', 'selector-minute-column']);
    minuteColumn.appendChild(constructDomElement('div', ['selector-label-text'], { 'data-label-type': 'minute-label' }, 'Minutes'));
    const minuteGrid = constructDomElement('div', ['selector-grid', 'selector-minute-grid']);
    for (let i = 0; i < 60; i += 5) {
        const minuteValue = String(i).padStart(2, '0');
        const minuteBtn = constructDomElement('button', ['selector-time-button', 'selector-minute-button'], {}, minuteValue);
        minuteBtn.addEventListener('click', onMinuteSelection);
        minuteGrid.appendChild(minuteBtn);
    }
    minuteColumn.appendChild(minuteGrid);
    selectorContent.appendChild(minuteColumn);

    timeSelectionPanel.appendChild(selectorContent);

    const finalActionArea = constructDomElement('div', ['selector-action-area']);
    const applyButton = constructDomElement('button', ['selector-apply-button'], {}, 'Apply');
    applyButton.addEventListener('click', confirmTimeSelection);
    finalActionArea.appendChild(applyButton);
    timeSelectionPanel.appendChild(finalActionArea);

    document.body.appendChild(timeSelectionPanel);
}

function revealPanel(inputEl) {
    initializeTimePanelStructure();

    activeInputElement = inputEl;
    const currentSettings = elementConfigurationCatalog.get(inputEl) || standardConfiguration;

    timeSelectionPanel.className = 'moment-selector-wrapper';
    if (currentSettings.panelVisualClass) {
        timeSelectionPanel.classList.add(currentSettings.panelVisualClass);
    }
    timeSelectionPanel.style.width = currentSettings.panelVisualWidth;
    timeSelectionPanel.style.zIndex = currentSettings.layerOrder;

    const { hour, minute, ampm } = extractTimeComponents(inputEl.value);
    refreshPanelDisplay(hour, minute, ampm);

    timeSelectionPanel.querySelector('[data-label-type="hour-label"]').textContent = currentSettings.hourDisplayLabel;
    timeSelectionPanel.querySelector('[data-label-type="minute-label"]').textContent = currentSettings.minuteDisplayLabel;
    timeSelectionPanel.querySelector('.selector-apply-button').textContent = currentSettings.actionButtonLabel;

    const inputRect = inputEl.getBoundingClientRect();
    timeSelectionPanel.style.top = `${inputRect.bottom + window.scrollY}px`;
    timeSelectionPanel.style.left = `${inputRect.left + window.scrollX}px`;

    if (currentSettings.beforePanelOpens) {
        currentSettings.beforePanelOpens(inputEl, timeSelectionPanel);
    }

    timeSelectionPanel.style.transition = 'none';
    timeSelectionPanel.style.display = 'block';
    void timeSelectionPanel.offsetWidth;
    timeSelectionPanel.style.transition = 'opacity 0.2s ease-in-out';
    timeSelectionPanel.style.opacity = '1';

    inputEl.blur();
}

function concealPanel(inputElToClose = activeInputElement) {
    if (!timeSelectionPanel || timeSelectionPanel.style.display === 'none') return;

    timeSelectionPanel.style.transition = 'opacity 0.2s ease-in-out';
    timeSelectionPanel.style.opacity = '0';

    setTimeout(() => {
        timeSelectionPanel.style.display = 'none';
        if (inputElToClose) {
            const currentSettings = elementConfigurationCatalog.get(inputElToClose) || standardConfiguration;
            if (currentSettings.afterPanelCloses) {
                currentSettings.afterPanelCloses(inputElToClose);
            }
        }
        activeInputElement = null;
    }, 200);
}

function handleExternalClick(event) {
    if (!timeSelectionPanel || timeSelectionPanel.style.display === 'none') {
        return;
    }

    const clickTarget = event.target;
    if (activeInputElement && (clickTarget === activeInputElement || activeInputElement.contains(clickTarget))) {
        return;
    }
    if (!timeSelectionPanel.contains(clickTarget)) {
        concealPanel();
    }
}

function handleKeyboardInput(event) {
    if (event.key === 'Enter' && activeInputElement && timeSelectionPanel && timeSelectionPanel.style.display !== 'none') {
        confirmTimeSelection();
    }
}

function setTimeSelector(targetInput, options = {}) {
    if (targetInput.tagName.toLowerCase() !== 'input') {
        console.warn('setTimeSelector can only be applied to <input> elements.');
        return;
    }

    const mergedSettings = { ...standardConfiguration, ...options };
    elementConfigurationCatalog.set(targetInput, mergedSettings);

    targetInput.classList.add('has-time-selector');

    const openSelector = () => revealPanel(targetInput);

    if (mergedSettings.triggerButtonContent) {
        const triggerWrapper = constructDomElement('span', ['time-selector-trigger-container']);
        triggerWrapper.innerHTML = mergedSettings.triggerButtonContent;
        const actualTrigger = triggerWrapper.children[0] || triggerWrapper;
        actualTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSelector();
        });
        targetInput.parentNode.insertBefore(triggerWrapper, targetInput.nextSibling);
    }

    if (mergedSettings.showOnFocus) {
        targetInput.addEventListener('focus', openSelector);
    }
    targetInput.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        targetInput.blur();
        openSelector();
    });
}

document.addEventListener('mousedown', handleExternalClick);
document.addEventListener('keydown', handleKeyboardInput);

window.MomentSculptor = {
    attach: setTimeSelector,
    hide: concealPanel
};