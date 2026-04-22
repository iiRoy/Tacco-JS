const dataVisualizer = {
    colorPalette: () => {
        const shadeSet = [
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
            "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
            "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
        ];
        return (idx) => shadeSet[idx % shadeSet.length];
    }
};

const dateInterpreter = (dateString) => new Date(dateString);

const TYPE_INDEX = 0;
const VALUE_INDEX = 1;
const DAY_INDEX = 2;


function obtainSelectedGroupingType() {
  const chosenOption = document.querySelector('input[type="radio"][name="chart1_kind"]:checked');
  return chosenOption ? chosenOption.value : null;
}


function fetchTotalGroupingValues() {
  return document.querySelectorAll('.group-value-toggle').length;
}


function retrieveSelectedGroupingValues() {
  const activeToggles = document.querySelectorAll('.group-value-toggle:checked');
  return Array.from(activeToggles).map(element => element.value);
}


function extractActiveStateLabels() {
  const liveEntries = document.querySelectorAll('.legend-entry:not(.deactivated)');
  return Array.from(liveEntries).map(node => node.dataset.stateLabel);
}


function queryNormalizationStatus() {
  const normalizerSwitch = document.querySelector('input[type="checkbox"][name="normalize_option"]:checked');
  return normalizerSwitch ? normalizerSwitch.value : null;
}


function determineInterval() {
  const periodSwitch = document.querySelector('input[type="radio"][name="period_selection"]:checked');
  return periodSwitch ? periodSwitch.value : null;
}


function identifyElementKind() {
  const typeSwitch = document.querySelector('input[type="radio"][name="point_form"]:checked');
  return typeSwitch ? typeSwitch.value : null;
}

function acquireIncludedSigns() {
  const signSwitch = document.querySelector('input[type="radio"][name="sign_choice"]:checked');
  return signSwitch ? signSwitch.value : null;
}


const retainedGroupingSelections = new Map();


function constructGroupingTypeSelectors(groupCategoryData) {
  const containerElement = document.getElementById('viz_group_type1');
  containerElement.innerHTML = '';

  let initialCategoryKey = null;
  for (const [key, values] of Object.entries(groupCategoryData)) {
    if (values.length === 1 && values[0] === '') {
      initialCategoryKey = key;
      break;
    }
  }

  const orderedCategoryKeys = Object.keys(groupCategoryData).sort();

  if (!initialCategoryKey) {
    initialCategoryKey = orderedCategoryKeys[0];
  }

  let elementCounter = 0;
  orderedCategoryKeys.forEach(categoryKey => {
    const radioIdentifier = 'category_selector_' + (elementCounter++);
    const inputElement = document.createElement('input');
    inputElement.type = 'radio';
    inputElement.classList.add('group-kind-selector');
    inputElement.id = radioIdentifier;
    inputElement.name = 'chart1_kind';
    inputElement.value = categoryKey;

    if (initialCategoryKey && initialCategoryKey === categoryKey) {
      inputElement.checked = true;
    }

    const wrapperDiv = document.createElement('div');
    wrapperDiv.appendChild(inputElement);
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = radioIdentifier;
    labelElement.textContent = categoryKey;
    wrapperDiv.appendChild(labelElement);

    containerElement.appendChild(wrapperDiv);
  });

  document.querySelectorAll('.group-kind-selector').forEach(selector => {
    selector.addEventListener('click', () => {
      buildGroupingValueToggleBoxes(groupCategoryData);
      document.dispatchEvent(new CustomEvent('viz.cohorts.update', { detail: 'group-kind-change' }));
    });
  });
}


function buildGroupingValueToggleBoxes(groupCategoryData) {
  const currentType = obtainSelectedGroupingType();
  const valuesForType = groupCategoryData[currentType];
  if (!valuesForType) {
    console.error('Invalid group type encountered: ' + currentType);
    return;
  }

  const valuesContainer = document.getElementById('viz_group_value1');
  valuesContainer.innerHTML = '';

  if (valuesForType.length === 1 && valuesForType[0] === '') {
    return;
  }

  valuesForType.sort();

  const headingDiv = document.createElement('div');
  headingDiv.classList.add('section-heading');
  headingDiv.textContent = 'Included group values';

  const controlSpan = document.createElement('span');
  controlSpan.classList.add('selection-controls');
  controlSpan.append(' – ');

  const selectAllLink = document.createElement('a');
  selectAllLink.href = '#';
  selectAllLink.textContent = 'all';
  selectAllLink.addEventListener('click', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('.group-value-toggle').forEach(checkbox => checkbox.checked = true);
    retainedGroupingSelections.clear();
    document.dispatchEvent(new CustomEvent('viz.cohorts.update'));
  });
  controlSpan.appendChild(selectAllLink);
  
  controlSpan.append(' or ');

  const selectNoneLink = document.createElement('a');
  selectNoneLink.href = '#';
  selectNoneLink.textContent = 'none';
  selectNoneLink.addEventListener('click', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('.group-value-toggle').forEach(checkbox => checkbox.checked = false);
    retainedGroupingSelections.clear();
    document.dispatchEvent(new CustomEvent('viz.cohorts.update'));
  });
  controlSpan.appendChild(selectNoneLink);
  
  headingDiv.appendChild(controlSpan);
  valuesContainer.appendChild(headingDiv);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('section-body');
  let itemCounter = 0;
  valuesForType.forEach(itemValue => {
    const checkboxId = 'value_toggle_' + (itemCounter++);
    const itemWrapper = document.createElement('div');
    
    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.classList.add('group-value-toggle');
    checkboxInput.checked = true;
    checkboxInput.value = itemValue;
    checkboxInput.id = checkboxId;
    itemWrapper.appendChild(checkboxInput);

    const itemLabel = document.createElement('label');
    itemLabel.htmlFor = checkboxId;
    itemLabel.textContent = itemValue;
    itemWrapper.appendChild(itemLabel);
    
    contentDiv.appendChild(itemWrapper);
  });
  valuesContainer.appendChild(contentDiv);

  document.querySelectorAll('.group-value-toggle').forEach(togglebox => {
    togglebox.addEventListener('click', (ev) => {
      const currentToggle = ev.target;
      retainedGroupingSelections.set(currentToggle.value, currentToggle.checked);
      document.dispatchEvent(new CustomEvent('viz.cohorts.update'));
    });
  });

  if (retainedGroupingSelections.size > 0) {
    document.querySelectorAll('.group-value-toggle').forEach(checkbox => checkbox.checked = false);
    retainedGroupingSelections.forEach((status, key) => {
      const targetCheckbox = document.querySelector(`.group-value-toggle[value="${key}"]`);
      if (targetCheckbox) {
        targetCheckbox.checked = status;
      }
    });
  }
}


function formVisualLegend(dataRowsWithHeader) {
  const dataLabels = dataRowsWithHeader[0].slice(3);
  const legendContainer = document.getElementById('viz_legend');
  legendContainer.innerHTML = '';

  const displayTable = document.createElement('div');
  displayTable.classList.add('legend-table-display', 'inert');

  const colorGenerator = dataVisualizer.colorPalette();

  const legendEntries = [];
  dataLabels.forEach((label, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('legend-entry');
    entryDiv.dataset.stateLabel = label;
    entryDiv.addEventListener('click', (ev) => {
      entryDiv.classList.toggle('deactivated');
      document.dispatchEvent(new CustomEvent('viz.cohorts.update'));
    });

    const colorBox = document.createElement('div');
    colorBox.classList.add('legend-color-swatch');
    colorBox.style.backgroundColor = colorGenerator(index);
    entryDiv.appendChild(colorBox);

    const labelSpan = document.createElement('div');
    labelSpan.classList.add('legend-label-text');
    labelSpan.textContent = label;
    entryDiv.appendChild(labelSpan);

    const valueSpan = document.createElement('div');
    valueSpan.classList.add('legend-value-display');
    entryDiv.appendChild(valueSpan);

    const percentSpan = document.createElement('div');
    percentSpan.classList.add('legend-percentage-display');
    entryDiv.appendChild(percentSpan);
    
    legendEntries.unshift(entryDiv);
  });
  legendEntries.forEach(entry => displayTable.appendChild(entry));


  const totalEntry = document.createElement('div');
  totalEntry.classList.add('legend-total-summary');
  totalEntry.appendChild(document.createElement('div')).classList.add('legend-color-swatch');
  totalEntry.appendChild(document.createElement('div')).classList.add('legend-label-text');
  totalEntry.lastChild.textContent = 'Grand Total';
  totalEntry.appendChild(document.createElement('div')).classList.add('legend-value-display');
  totalEntry.appendChild(document.createElement('div')).classList.add('legend-percentage-display');
  displayTable.appendChild(totalEntry);

  legendContainer.appendChild(displayTable);

  const targetIdentifier = document.createElement('div');
  targetIdentifier.classList.add('legend-target-identifier');
  targetIdentifier.dataset.targetId = '';
  targetIdentifier.textContent = '';
  legendContainer.appendChild(targetIdentifier);


  const calculationContainer = document.getElementById('calc_legend');
  calculationContainer.innerHTML = '';
  const calculationTable = document.createElement('div');
  calculationTable.classList.add('legend-table-calculations');

  const createCalcRow = (className, htmlContent) => {
    const row = document.createElement('div');
    row.classList.add('legend-calc-entry', className);
    row.appendChild(document.createElement('div')).classList.add('legend-color-swatch');
    row.appendChild(document.createElement('div')).classList.add('legend-label-text');
    row.lastChild.innerHTML = htmlContent;
    row.appendChild(document.createElement('div')).classList.add('legend-value-display');
    row.appendChild(document.createElement('div')).classList.add('legend-percentage-display');
    return row;
  };

  calculationTable.appendChild(createCalcRow('cumulative-upward', '&#x2211;&uarr; / &#x2211;&#x2195;'));
  calculationTable.appendChild(createCalcRow('cumulative-downward', '&#x2211;&darr; / &#x2211;&#x2195;'));
  calculationTable.appendChild(createCalcRow('cumulative-leftward', 'X / &#x2211;&larr;'));
  calculationTable.appendChild(createCalcRow('cumulative-rightward', 'X / &#x2211;&rarr;'));
  calculationTable.appendChild(createCalcRow('cumulative-horizontal-total', 'X / &#x2211;&#x2194;'));
  calculationTable.appendChild(createCalcRow('cumulative-left-ratio', '&#x2211;&larr; / &#x2211;&#x2194;'));
  calculationTable.appendChild(createCalcRow('cumulative-right-ratio', '&#x2211;&rarr; / &#x2211;&#x2194;'));
  calculationTable.appendChild(createCalcRow('max-ratio', 'X / Max &#x2194;'));
  calculationTable.appendChild(createCalcRow('complement-max-ratio', '1 - X / Max &#x2194;'));

  calculationContainer.appendChild(calculationTable);
}


function resetDisplayPanel() {
  document.querySelectorAll('.legend-entry').forEach(row => row.classList.remove('highlighted-legend'));
  document.querySelectorAll('.legend-value-display').forEach(val => val.textContent = '');
  document.querySelectorAll('.legend-percentage-display').forEach(pct => pct.textContent = '');
  document.querySelector('.legend-target-identifier').dataset.targetId = '';
  document.querySelector('.legend-target-identifier').textContent = '';
  document.querySelector('.legend-table-display').classList.add('inert');

  document.querySelectorAll('rect.bar').forEach(rect => rect.style.fillOpacity = '1');
}


function clearDisplayPanelHoverData() {
  document.querySelectorAll('.legend-entry').forEach(row => row.classList.remove('highlighted-legend'));

  const calcLegendElem = document.getElementById('calc_legend');
  const updateCalcValue = (selector) => {
    const valueElem = calcLegendElem.querySelector(`.${selector}>.legend-value-display`);
    if (valueElem) valueElem.textContent = '';
    const percentElem = calcLegendElem.querySelector(`.${selector}>.legend-percentage-display`);
    if (percentElem) percentElem.textContent = '';
  };

  updateCalcValue('cumulative-upward');
  updateCalcValue('cumulative-downward');
  updateCalcValue('cumulative-leftward');
  updateCalcValue('cumulative-rightward');
  updateCalcValue('cumulative-horizontal-total');
  updateCalcValue('cumulative-left-ratio');
  updateCalcValue('cumulative-right-ratio');
  updateCalcValue('max-ratio');
  updateCalcValue('complement-max-ratio');
}


function processDisplayPanelEvent(eventObject) {
  if (eventObject.type === 'mouseenter') {
    const currentElement = eventObject.currentTarget;
    const cohortIdentifier = currentElement.dataset.cohortId;
    const stateLabel = currentElement.dataset.stateLabel;
    refreshDisplayPanel(cohortIdentifier, stateLabel);
  } else {
    clearDisplayPanelHoverData();
  }
}


function refreshDisplayPanel(identifier, highlightStateLabel) {
  const visualLegend = document.getElementById('viz_legend');
  let currentIdentifier = identifier;

  if (!currentIdentifier) {
    currentIdentifier = document.querySelector('.legend-target-identifier').dataset.targetId;
    if (!currentIdentifier) {
      return;
    }
  }

  const lastIdentifier = document.querySelector('.legend-target-identifier').dataset.targetId;
  if (lastIdentifier !== currentIdentifier) {
    document.querySelectorAll(`rect[data-cohort-id="${lastIdentifier}"]`).forEach(rect => rect.style.fillOpacity = '1');
  }

  const cohortSegments = document.querySelectorAll(`rect[data-cohort-id="${currentIdentifier}"]`);
  cohortSegments.forEach(segment => segment.style.fillOpacity = '0.8');

  document.querySelector('.legend-target-identifier').dataset.targetId = currentIdentifier;
  document.querySelector('.legend-target-identifier').textContent = ' – ' + currentIdentifier;
  document.querySelector('.legend-table-display').classList.remove('inert');

  let totalSum = 0;
  let sumFromBottom = 0;
  let foundHighlight = false;
  let sumFromTop = 0;
  let highlightedSegmentCount = 0;

  cohortSegments.forEach(segment => {
    const segmentCount = Number.parseInt(segment.dataset.stateCount);
    totalSum += segmentCount;

    const segmentLabel = segment.dataset.stateLabel;
    if (segmentLabel === highlightStateLabel) {
      foundHighlight = true;
      highlightedSegmentCount = segmentCount;
      sumFromBottom += segmentCount;
      sumFromTop += segmentCount;
    } else if (!foundHighlight) {
      sumFromTop += segmentCount;
    } else {
      sumFromBottom += segmentCount;
    }
  });
  visualLegend.querySelector('.legend-total-summary>.legend-value-display').textContent = totalSum;

  let totalHorizontalSum = 0;
  let sumToLeft = 0;
  let maxHorizontalValue = 0;

  if (!!highlightStateLabel) {
    const currentCohortDate = dateInterpreter(currentIdentifier);
    const allStateSegments = document.querySelectorAll(`rect[data-state-label="${highlightStateLabel}"]`);
    
    allStateSegments.forEach(segment => {
      if (segment.getAttribute('width') === '0') {
        return;
      }
      const segmentCohortDate = dateInterpreter(segment.dataset.cohortId);
      const segmentCount = Number.parseInt(segment.dataset.stateCount);
      totalHorizontalSum += segmentCount;
      if (segmentCohortDate <= currentCohortDate) {
        sumToLeft += segmentCount;
      }
      if (segmentCount > maxHorizontalValue) {
        maxHorizontalValue = segmentCount;
      }
    });
  }

  const calcLegendElem = document.getElementById('calc_legend');

  const formatPercentage = (numerator, denominator) => {
    if (denominator === 0) return '0.00%';
    return ((numerator / denominator) * 100).toFixed(2) + '%';
  };
  
  calcLegendElem.querySelector('.cumulative-upward>.legend-value-display').textContent = sumFromBottom;
  calcLegendElem.querySelector('.cumulative-upward>.legend-percentage-display').textContent = formatPercentage(sumFromBottom, totalSum);

  calcLegendElem.querySelector('.cumulative-downward>.legend-value-display').textContent = sumFromTop;
  calcLegendElem.querySelector('.cumulative-downward>.legend-percentage-display').textContent = formatPercentage(sumFromTop, totalSum);

  calcLegendElem.querySelector('.cumulative-leftward>.legend-value-display').textContent = highlightedSegmentCount;
  calcLegendElem.querySelector('.cumulative-leftward>.legend-percentage-display').textContent = formatPercentage(highlightedSegmentCount, sumToLeft);

  const sumToRight = totalHorizontalSum - sumToLeft + highlightedSegmentCount;
  calcLegendElem.querySelector('.cumulative-rightward>.legend-value-display').textContent = highlightedSegmentCount;
  calcLegendElem.querySelector('.cumulative-rightward>.legend-percentage-display').textContent = formatPercentage(highlightedSegmentCount, sumToRight);

  calcLegendElem.querySelector('.cumulative-horizontal-total>.legend-value-display').textContent = highlightedSegmentCount;
  calcLegendElem.querySelector('.cumulative-horizontal-total>.legend-percentage-display').textContent = formatPercentage(highlightedSegmentCount, totalHorizontalSum);

  calcLegendElem.querySelector('.cumulative-left-ratio>.legend-value-display').textContent = sumToLeft;
  calcLegendElem.querySelector('.cumulative-left-ratio>.legend-percentage-display').textContent = formatPercentage(sumToLeft, totalHorizontalSum);

  calcLegendElem.querySelector('.cumulative-right-ratio>.legend-value-display').textContent = sumToRight;
  calcLegendElem.querySelector('.cumulative-right-ratio>.legend-percentage-display').textContent = formatPercentage(sumToRight, totalHorizontalSum);

  calcLegendElem.querySelector('.max-ratio>.legend-value-display').textContent = highlightedSegmentCount;
  calcLegendElem.querySelector('.max-ratio>.legend-percentage-display').textContent = formatPercentage(highlightedSegmentCount, maxHorizontalValue);

  const complementMaxRatioValue = maxHorizontalValue === 0 ? 0 : 1 - (highlightedSegmentCount / maxHorizontalValue);
  calcLegendElem.querySelector('.complement-max-ratio>.legend-value-display').textContent = complementMaxRatioValue.toFixed(2);
  calcLegendElem.querySelector('.complement-max-ratio>.legend-percentage-display').textContent = (complementMaxRatioValue * 100).toFixed(2) + '%';
}