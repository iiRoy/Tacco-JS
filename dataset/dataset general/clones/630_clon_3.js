const VIZ_GROUP_CATEGORY_IDX = 0;
const VIZ_GROUP_ITEM_IDX = 1;
const VIZ_DATE_IDX = 2;

// Utility function to get a jQuery element by its ID
const getElementById = (id) => $(`#${id}`);

// Utility function to trigger a custom event
const triggerVizUpdate = (eventType = 'general', detail = {}) => {
  $(document).trigger('viz.data.update', { type: eventType, ...detail });
};

/**
 * Retrieves the currently selected category from the radio buttons.
 * @returns {string} The value of the selected radio button for chart 1.
 */
function retrieveSelectedCategory() {
  return $('input:radio[name=\'chart1\']:checked').val();
}

/**
 * Counts the total number of group item checkboxes present in the DOM.
 * @returns {number} The total count of group item checkboxes.
 */
function countAllGroupItems() {
  return $('.item-selection-checkbox').length;
}

/**
 * Fetches the values of all currently selected group item checkboxes.
 * @returns {Array<string>} An array of values from the checked checkboxes.
 */
function fetchChosenGroupItems() {
  const checkedElements = $('.item-selection-checkbox:checked');
  return Array.from(checkedElements).map(el => $(el).val());
}

/**
 * Gathers the names of all enabled (non-disabled) state labels in the legend.
 * @returns {Array<string>} An array of state names.
 */
function getActiveLegendLabels() {
  const activeRows = $('.legend-display-row:not(.disabled-entry)');
  return Array.from(activeRows).map(row => $(row).data('seriesName'));
}

/**
 * Checks if the normalization option is enabled.
 * @returns {string|undefined} The value of the checked normalization checkbox, or undefined.
 */
function isNormalizationEnabled() {
  return $('input:checkbox[name=\'normalize_data\']:checked').val();
}

/**
 * Obtains the selected timeframe period from the radio buttons.
 * @returns {string} The value of the selected period radio button.
 */
function obtainTimeframeSelection() {
  return $('input:radio[name=\'time_period\']:checked').val();
}

/**
 * Determines the chosen chart style (e.g., line, bar).
 * @returns {string} The value of the selected chart style radio button.
 */
function determineChartStyle() {
  return $('input:radio[name=\'chart_style\']:checked').val();
}

/**
 * Retrieves the selected sign/symbol filtering option.
 * @returns {string} The value of the selected sign radio button.
 */
function getIncludedSymbols() {
  return $('input:radio[name=\'symbol_filter\']:checked').val();
}

// Stores previously selected group item states to maintain user selections across category changes.
const PREVIOUSLY_SELECTED_ITEMS = {};

/**
 * Constructs and displays radio buttons for different group categories.
 * @param {Object<string, Array<string>>} categoryMap - A map where keys are category names and values are arrays of items.
 */
function buildCategorySelectors(categoryMap) {
  const categoryContainer = getElementById('category_selection_panel');
  categoryContainer.empty(); // Clear existing options

  if (!categoryMap || Object.keys(categoryMap).length === 0) {
    console.warn("No group categories provided for selector generation.");
    return;
  }

  let defaultCategoryKey = null;
  // Attempt to find a category with a single empty value, often representing a 'total' or 'all' option.
  for (const [catKey, catValues] of Object.entries(categoryMap)) {
    if (catValues.length === 1 && catValues[0] === '') {
      defaultCategoryKey = catKey;
      break;
    }
  }

  const sortedCategoryNames = Object.keys(categoryMap).sort();

  // If no default was found, use the first sorted category.
  if (!defaultCategoryKey && sortedCategoryNames.length > 0) {
    defaultCategoryKey = sortedCategoryNames[0];
  }

  let radioIndex = 0;
  for (const categoryName of sortedCategoryNames) {
    const currentRadioIdentifier = `category_radio_${radioIndex++}`;
    const optionWrapper = $('<div>');
    const radioInput = $('<input>')
      .attr({
        type: 'radio',
        id: currentRadioIdentifier,
        name: 'chart1', // Original name for consistency with other functions
        value: categoryName
      })
      .addClass('category-selector-radio');

    if (defaultCategoryKey === categoryName) {
      radioInput.prop('checked', true); // Use prop for boolean attributes
    }

    const radioLabel = $('<label>')
      .attr('for', currentRadioIdentifier)
      .text(categoryName);

    optionWrapper.append(radioInput, radioLabel);
    categoryContainer.append(optionWrapper);
  }

  // Attach event listener to the radio buttons for dynamic updates.
  $('.category-selector-radio').on('click', () => {
    constructItemCheckboxes(categoryMap);
    triggerVizUpdate('category-change');
  });
}

/**
 * Generates checkboxes for items within the currently selected group category.
 * @param {Object<string, Array<string>>} groupCategoriesData - The full map of group categories and their items.
 */
function constructItemCheckboxes(groupCategoriesData) {
  const selectedCategory = retrieveSelectedCategory();
  const categoryItems = groupCategoriesData[selectedCategory];

  const itemSelectionArea = getElementById('item_selection_panel');
  itemSelectionArea.empty();

  if (!categoryItems) {
    console.error(`Invalid group category selected: ${selectedCategory}`);
    return; // Exit if no items for the category
  }

  // Special handling for categories that represent a single, empty value (e.g., 'total').
  if (categoryItems.length === 1 && categoryItems[0] === '') {
    return; // No checkboxes needed for this type of category.
  }

  // Sort items alphabetically for consistent display.
  categoryItems.sort();

  const itemHeaderSection = $('<div class="section-heading">').text('Included Group Items');
  const toggleControls = $('<span class="selection-toggles">');

  // Add 'select all' functionality.
  $('<a href="#" class="toggle-link">')
    .text('Select All')
    .on('click', (evt) => {
      evt.preventDefault();
      $('.item-selection-checkbox').prop('checked', true);
      Object.keys(PREVIOUSLY_SELECTED_ITEMS).forEach(key => PREVIOUSLY_SELECTED_ITEMS[key] = true);
      triggerVizUpdate('item-selection-all');
    })
    .appendTo(toggleControls);

  toggleControls.append(' | '); // Separator

  // Add 'select none' functionality.
  $('<a href="#" class="toggle-link">')
    .text('Clear All')
    .on('click', (evt) => {
      evt.preventDefault();
      $('.item-selection-checkbox').prop('checked', false);
      Object.keys(PREVIOUSLY_SELECTED_ITEMS).forEach(key => PREVIOUSLY_SELECTED_ITEMS[key] = false);
      triggerVizUpdate('item-selection-none');
    })
    .appendTo(toggleControls);

  itemHeaderSection.append(toggleControls);
  itemSelectionArea.append(itemHeaderSection);

  const checkboxGroupWrapper = $('<div class="checkbox-options-container">');
  let checkboxCounter = 0;

  categoryItems.forEach((itemValue) => {
    const currentCheckboxId = `item_checkbox_${checkboxCounter++}`;
    const itemOptionDiv = $('<div>');
    const checkboxInput = $('<input>')
      .attr({
        type: 'checkbox',
        id: currentCheckboxId,
        value: itemValue
      })
      .addClass('item-selection-checkbox')
      .prop('checked', true); // Default to checked

    const checkboxLabel = $('<label>')
      .attr('for', currentCheckboxId)
      .text(itemValue);

    itemOptionDiv.append(checkboxInput, checkboxLabel);
    checkboxGroupWrapper.append(itemOptionDiv);
  });
  itemSelectionArea.append(checkboxGroupWrapper);

  // Attach event handler for individual checkbox changes.
  $('.item-selection-checkbox').on('change', function() {
    const currentCheckbox = $(this);
    PREVIOUSLY_SELECTED_ITEMS[currentCheckbox.val()] = currentCheckbox.is(':checked');
    triggerVizUpdate('item-selection-individual', { item: currentCheckbox.val(), checked: currentCheckbox.is(':checked') });
  });

  // Apply preserved selections if any exist.
  if (Object.keys(PREVIOUSLY_SELECTED_ITEMS).length > 0) {
    $('.item-selection-checkbox').each(function() {
      const checkbox = $(this);
      const itemKey = checkbox.val();
      if (PREVIOUSLY_SELECTED_ITEMS.hasOwnProperty(itemKey)) {
        checkbox.prop('checked', PREVIOUSLY_SELECTED_ITEMS[itemKey]);
      } else {
        checkbox.prop('checked', false); // New items default to unchecked if not in previous state
      }
    });
  }
}

/**
 * Creates the legend for the visualization, displaying series labels and interaction options.
 * @param {Array<Array<any>>} datasetRows - Data rows, with the first row containing headers.
 */
function renderVisualizationLegend(datasetRows) {
  if (!datasetRows || datasetRows.length === 0 || datasetRows[0].length < 3) {
    console.warn("Invalid dataset provided for legend creation.");
    return;
  }

  const seriesLabels = datasetRows[0].slice(3); // Extract actual series labels
  const mainLegendPanel = getElementById('main_viz_legend');
  mainLegendPanel.empty();

  const primaryLegendContainer = $('<div class="legend-table-main inactive-legend">');
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Using a different D3 color scheme

  seriesLabels.forEach((labelName, index) => {
    const legendEntryElement = $('<div class="legend-display-row">')
      .attr('data-series-name', labelName)
      .on('click', function() {
        $(this).toggleClass('disabled-entry');
        triggerVizUpdate('legend-toggle');
      });

    $('<div class="legend-color-box">')
      .css('background-color', colorScale(index))
      .appendTo(legendEntryElement);

    $('<div class="legend-label-text">')
      .text(labelName)
      .appendTo(legendEntryElement);

    $('<div class="legend-value-display">')
      .appendTo(legendEntryElement);

    $('<div class="legend-percentage-display">')
      .appendTo(legendEntryElement);

    primaryLegendContainer.prepend(legendEntryElement); // Prepend to reverse order
  });

  // Add a row for total values
  const totalRow = $('<div class="legend-total-row">');
  $('<div class="legend-color-box">').appendTo(totalRow);
  $('<div class="legend-label-text">')
    .text('Total Sum')
    .appendTo(totalRow);
  $('<div class="legend-value-display">').appendTo(totalRow);
  $('<div class="legend-percentage-display">').appendTo(totalRow);
  primaryLegendContainer.append(totalRow);

  // Function to create a calculation row
  const createCalcRow = (className, labelHtml) => {
    const row = $(`<div class="legend-calculation-row ${className}">`);
    $('<div class="legend-color-box">').appendTo(row);
    $('<div class="legend-label-text">')
        .html(labelHtml)
        .appendTo(row);
    $('<div class="legend-value-display">')
        .appendTo(row);
    $('<div class="legend-percentage-display">')
        .appendTo(row);
    return row;
  };

  const calcLegendPanel = getElementById('calculation_legend');
  calcLegendPanel.empty();
  const secondaryCalculationsTable = $('<div class="legend-table-secondary">');

  secondaryCalculationsTable.append(createCalcRow('cumulative-up', '&#x2211;&uarr; / &#x2211;&#x2195;'));
  secondaryCalculationsTable.append(createCalcRow('cumulative-down', '&#x2211;&darr; / &#x2211;&#x2195;'));
  secondaryCalculationsTable.append(createCalcRow('cumulative-left', 'Current / &#x2211;&larr;'));
  secondaryCalculationsTable.append(createCalcRow('cumulative-right', 'Current / &#x2211;&rarr;'));
  secondaryCalculationsTable.append(createCalcRow('cumulative-horizontal', 'Current / &#x2211;&#x2194;'));

  // Removed less frequently used cumulative ratios for simplification (Type III deletion)
  // secondaryCalculationsTable.append(createCalcRow('max-ratio', 'Current / Max &#x2194;'));
  // secondaryCalculationsTable.append(createCalcRow('complement-max-ratio', '1 - Current / Max &#x2194;'));

  calcLegendPanel.append(secondaryCalculationsTable);
  mainLegendPanel.append(primaryLegendContainer);
}

/**
 * Resets the entire information panel to its default, unhighlighted state.
 * This clears all values and removes any highlighting.
 */
function resetDisplayPanel() {
  $('.legend-display-row').removeClass('highlighted-entry');
  $('.legend-value-display').text('');
  $('.legend-percentage-display').text('');
  $('.legend-target-info').attr('data-target-id', '').text('');
  $('.legend-table-main').addClass('inactive-legend');

  // Reset opacity of all chart bars.
  $('rect[data-chart-segment]').css('fill-opacity', '1');
}

/**
 * Clears only the dynamic, mouse-hover related details from the info panel,
 * preserving sticky selections like the primary cohort/column.
 */
function resetHoverDetails() {
  $('.legend-display-row').removeClass('highlighted-entry');

  const calcLegend = getElementById('calculation_legend');
  const calcRows = [
    '.cumulative-up', '.cumulative-down', '.cumulative-left',
    '.cumulative-right', '.cumulative-horizontal'
  ];

  calcRows.forEach(selector => {
    calcLegend.find(`${selector}>.legend-value-display`).text('');
    calcLegend.find(`${selector}>.legend-percentage-display`).text('');
  });
}

/**
 * Handles mouse events (enter/leave) on chart elements to update the info panel.
 * @param {Event} eventObject - The DOM event object.
 */
function processPanelInteraction(eventObject) {
  const targetElement = $(eventObject.currentTarget);
  const cohortIdentifier = targetElement.attr('data-chart-cohort');
  const dataSeriesName = targetElement.attr('data-chart-series');

  if (eventObject.type === 'mouseenter') {
    refreshPanelContent(cohortIdentifier, dataSeriesName);
  } else { // mouseleave
    resetHoverDetails();
  }
}

/**
 * Parses a date string from cohort data attribute into a Date object.
 * @param {string} dateString - The date string from the data attribute.
 * @returns {Date} A Date object.
 */
const parseCohortDate = (dateString) => {
  // Assuming dateString is in a format directly parseable by Date, or needs specific parsing.
  // For simplicity, let's assume 'YYYY-MM-DD' or similar.
  return new Date(dateString);
};

/**
 * Updates the information panel with details for a specific cohort and (optionally) a highlighted series.
 * @param {string} currentCohortId - The identifier of the cohort being displayed.
 * @param {string} [highlightedSeries] - Optional name of the data series to highlight.
 */
function refreshPanelContent(currentCohortId, highlightedSeries) {
  const primaryLegendElement = getElementById('main_viz_legend');

  // If no cohort ID is provided, try to use the one already set in the legend.
  if (!currentCohortId) {
    currentCohortId = $('.legend-target-info').attr('data-target-id');
    if (!currentCohortId) {
      return; // Cannot update without a cohort ID.
    }
  }

  // Reset previous cohort bar highlighting if changing cohorts.
  const previousCohortId = $('.legend-target-info').attr('data-target-id');
  if (previousCohortId && previousCohortId !== currentCohortId) {
    $(`rect[data-chart-cohort="${previousCohortId}"]`).css('fill-opacity', '1');
  }

  // Highlight bars for the current cohort.
  const relevantBars = $(`rect[data-chart-cohort="${currentCohortId}"]`);
  relevantBars.css('fill-opacity', '0.8');

  // Update the legend target information.
  $('.legend-target-info').attr('data-target-id', currentCohortId).text(` – ${currentCohortId}`);
  $('.legend-table-main').removeClass('inactive-legend');

  let totalCohortValue = 0;
  let cumulativeSumUp = 0;
  let isAfterHighlighted = false; // Flag to track segments after the highlighted one
  let highlightedSegmentValue = 0;

  // Iterate through cohort bars to calculate vertical sums.
  relevantBars.each(function() {
    const barElement = $(this);
    const segmentValue = parseInt(barElement.attr('data-segment-value'), 10);
    const segmentName = barElement.attr('data-chart-series');

    totalCohortValue += segmentValue;

    // Calculate cumulative sums based on highlight.
    if (segmentName === highlightedSeries) {
      isAfterHighlighted = true; // Mark that we've passed the highlighted segment
      highlightedSegmentValue = segmentValue;
    }
    if (!isAfterHighlighted) { // Sums up to (and including) the highlighted segment
      cumulativeSumUp += segmentValue;
    }
  });

  primaryLegendElement.find('.legend-total-row>.legend-value-display').text(totalCohortValue);

  let horizontalSumTotal = 0;
  let horizontalSumLeft = 0;
  let maxHorizontalValue = 0;

  // Calculate horizontal sums if a series is highlighted.
  if (highlightedSeries) {
    const currentCohortDate = parseCohortDate(currentCohortId);
    const allSeriesBars = $(`rect[data-chart-series="${highlightedSeries}"]`);

    allSeriesBars.each(function() {
      const seriesBarElement = $(this);
      // Skip bars hidden by aggregation (e.g., weekly/monthly).
      if (parseFloat(seriesBarElement.attr('width')) === 0) {
        return;
      }
      const segmentValue = parseInt(seriesBarElement.attr('data-segment-value'), 10);
      const barCohortDate = parseCohortDate(seriesBarElement.attr('data-chart-cohort'));

      horizontalSumTotal += segmentValue;
      if (barCohortDate <= currentCohortDate) {
        horizontalSumLeft += segmentValue;
      }
      if (segmentValue > maxHorizontalValue) {
        maxHorizontalValue = segmentValue;
      }
    });
  }

  // Update calculation legend (Type III: simplified to only update relevant fields)
  const calcLegend = getElementById('calculation_legend');
  if (highlightedSeries) {
    // Cumulative Up (sum from bottom to highlighted segment)
    calcLegend.find('.cumulative-up>.legend-value-display').text(cumulativeSumUp);
    calcLegend.find('.cumulative-up>.legend-percentage-display').text(
      totalCohortValue > 0 ? `${((cumulativeSumUp / totalCohortValue) * 100).toFixed(1)}%` : '0%'
    );

    // Cumulative Down (sum from top to highlighted segment - which is total - (cumulative up - highlighted segment))
    const cumulativeSumDown = totalCohortValue - (cumulativeSumUp - highlightedSegmentValue);
    calcLegend.find('.cumulative-down>.legend-value-display').text(cumulativeSumDown);
    calcLegend.find('.cumulative-down>.legend-percentage-display').text(
      totalCohortValue > 0 ? `${((cumulativeSumDown / totalCohortValue) * 100).toFixed(1)}%` : '0%'
    );

    // Current / Sum Left
    calcLegend.find('.cumulative-left>.legend-value-display').text(highlightedSegmentValue);
    calcLegend.find('.cumulative-left>.legend-percentage-display').text(
      horizontalSumLeft > 0 ? `${((highlightedSegmentValue / horizontalSumLeft) * 100).toFixed(1)}%` : '0%'
    );

    // Current / Sum Right (horizontalSumTotal - horizontalSumLeft + highlightedSegmentValue)
    const horizontalSumRight = horizontalSumTotal - horizontalSumLeft + highlightedSegmentValue;
    calcLegend.find('.cumulative-right>.legend-value-display').text(highlightedSegmentValue);
    calcLegend.find('.cumulative-right>.legend-percentage-display').text(
      horizontalSumRight > 0 ? `${((highlightedSegmentValue / horizontalSumRight) * 100).toFixed(1)}%` : '0%'
    );

    // Current / Sum Horizontal
    calcLegend.find('.cumulative-horizontal>.legend-value-display').text(highlightedSegmentValue);
    calcLegend.find('.cumulative-horizontal>.legend-percentage-display').text(
      horizontalSumTotal > 0 ? `${((highlightedSegmentValue / horizontalSumTotal) * 100).toFixed(1)}%` : '0%'
    );
  }
}