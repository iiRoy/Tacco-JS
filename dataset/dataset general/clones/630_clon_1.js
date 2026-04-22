// This file contains JavaScript code for cohort visualization.
// It is licensed under the Apache License, Version 2.0.

/*
   Copyright 2012 Brett Slatkin

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   This is a Type I clone, meaning only whitespace and comments have been altered.
*/


var GROUP_TYPE_COLUMN = 0; // Index for group type in data structure
var GROUP_VALUE_COLUMN = 1; // Index for group value in data structure
var DAY_COLUMN = 2; // Index for day in data structure


function getSelectedGroupType (  )
{
    // Retrieves the value of the currently selected group type radio button.
    return $('input:radio[name=\'chart1\']:checked').val();
}


function getTotalGroupValues(   )
{
    // Counts the total number of group value checkboxes available.
    return $('.group-value-checkbox').length;
}


function getSelectedGroupValues( )
{
    // Gathers the values of all checked group value checkboxes into an array.
    return $.makeArray(
        $('.group-value-checkbox:checked').map(function(  index, el  ) {
            return $(el).val();
        })
    );
}


function getEnabledStateNames(   )
{
    // Fetches the 'data-stateName' attribute from all enabled legend rows.
    return $.makeArray($('.legend-row:not(.disabled)').map(
        function(  i, n  ) {
            return $(n).data('stateName');
        }
    ));
}


function getIsNormalized(  )
{
    // Checks if the 'normalize' checkbox is selected.
    return $('input:checkbox[name=\'normalize\']:checked').val();
}


function getPeriod(  )
{
    // Gets the selected period (e.g., daily, weekly) from radio buttons.
    return $('input:radio[name=\'period\']:checked').val();
}


function getPointType(   )
{
    // Determines the type of point selected for the chart.
    return $('input:radio[name=\'point_type\']:checked').val();
}


function getIncludedSigns(   )
{
    // Retrieves the selected 'sign' radio button value.
    return $('input:radio[name=\'sign\']:checked').val();
}


// Global object to store the last checked state of group values.
// This helps preserve selections when switching group types.
var LAST_GROUP_VALUES = {};


function createGroupTypeRadios(  groupTypes  )
{
    var vizDiv = $('#viz_group_type1');
    vizDiv.empty(); // Clear existing content

    // Logic to guess the default checked group type (topline data).
    var checkedType = null;
    $.each(groupTypes, function(key, value) {
        if (value.length == 1 && value[0] === '')
        {
            checkedType = key;
        }
    });

    // Sort the group names alphabetically for consistent display.
    var groupTypesSorted = Object.keys(groupTypes);
    groupTypesSorted.sort();

    // If no topline type found, default to the first sorted type.
    if (!checkedType)
    {
        checkedType = groupTypesSorted[0];
    }

    var i = 0; // Counter for unique radio button IDs.
    $.each(groupTypesSorted, function(index, key) {
        var value = groupTypes[key];
        var radioId = 'group_type_radio1_' + (i++);
        var useRadio = $('<input type="radio">')
            .addClass('group-type-radio')
            .attr('id', radioId)
            .attr('name', 'chart1')
            .attr('value', key);

        // Mark the default group type as checked.
        if (!!checkedType && checkedType === key)
        {
            useRadio.attr('checked', 'checked');
        }

        var container = $('<div>');
        container.append(useRadio);
        container.append($('<label>').attr('for', radioId).text(key));

        vizDiv.append(container);
    });

    // Attach click event handlers to the newly created radio buttons.
    $('.group-type-radio').click(function( ) {
        createGroupValueCheckboxes(groupTypes); // Recreate checkboxes based on new selection.
        $(document).trigger('cohorts.viz', 'group-type'); // Trigger a custom event.
    });
}


function createGroupValueCheckboxes(  groupTypes  )
{
    var type = getSelectedGroupType();
    var values = groupTypes[type];
    if (!values)
    {
        $.error('Bad group type: ' + type); // Log an error if type is invalid.
    }

    var valuesDiv = $('#viz_group_value1');
    valuesDiv.empty(); // Clear previous checkboxes.

    // Handle special case: group types with a single, empty value (e.g., topline data).
    if (values.length == 1 && values[0] === '')
    {
        return;
    }

    // Sort the group values alphabetically.
    values.sort();

    var valuesHeader = $('<div class="section-header">')
        .text('Included group values'); // Header for the checkbox section.

    // Create selection toggles (All/None).
    var selectionToggle = $('<span class="selection-toggle">')
        .append(' &ndash; ');
    $('<a href="javascript:void(0)">')
        .text('all')
        .click(function( ) {
            $('.group-value-checkbox').prop('checked', true); // Check all checkboxes.
            // Clear the record of last selected group values.
            LAST_GROUP_VALUES = {};
            $(document).trigger('cohorts.viz');
        })
        .appendTo(selectionToggle);
    selectionToggle.append(' or ');
    $('<a href="javascript:void(0)">')
        .text('none')
        .click(function( ) {
            $('.group-value-checkbox').prop('checked', false); // Uncheck all checkboxes.
            // Clear the record of last selected group values.
            LAST_GROUP_VALUES = {};
            $(document).trigger('cohorts.viz');
        })
        .appendTo(selectionToggle);
    selectionToggle.appendTo(valuesHeader);
    valuesHeader.appendTo(valuesDiv);

    // Generate checkboxes for each group value.
    var sectionContent = $('<div class="section-content">');
    var i = 0; // Counter for unique checkbox IDs.
    $.each(values, function(key, value) {
        var checkboxId = 'group_value_checkbox1_' + (i++);
        var container = $('<div>');
        container.append(
            $('<input type="checkbox" class="group-value-checkbox" checked>')
                .attr('value', value)
                .attr('id', checkboxId)
        );
        container.append(
            $('<label>').attr('for', checkboxId).text(value)
        );
        sectionContent.append(container);
    });
    valuesDiv.append(sectionContent);

    // Register event handler for individual checkbox clicks.
    $('.group-value-checkbox').click(function(e) {
        // When a checkbox is explicitly clicked, update its state in LAST_GROUP_VALUES.
        var checkbox = $(e.target);
        LAST_GROUP_VALUES[checkbox.val()] = checkbox.attr('checked') === 'checked';

        $(document).trigger('cohorts.viz');
    });

    // Restore previously selected group values if any were stored.
    if (Object.keys(LAST_GROUP_VALUES).length > 0)
    {
        $('.group-value-checkbox').attr('checked', false); // Start by unchecking all.

        $.each(LAST_GROUP_VALUES, function(key, value) {
            $('.group-value-checkbox[value="' + key + '"]').attr('checked', value);
        });
    }
}


function createLegend(  rowsWithHeader  )
{
    var columnNames = rowsWithHeader[0].slice(3); // Extract column names from the header row.
    var container = $('#viz_legend');
    container.empty(); // Clear existing legend.

    var legendTable = $('<div class="legend-table inactive">');

    var color = d3.scale.category20(); // D3 color scale for consistent coloring.
    $.each(columnNames, function(index, value) {
        var row = $('<div class="legend-row">')
            .attr('data-state-name', value)
            .click(function(e) {
                row.toggleClass('disabled'); // Toggle disabled class on click.
                $(document).trigger('cohorts.viz');
            });
        $('<div class="legend-box">')
            .attr('style', 'background-color: ' + color(index))
            .appendTo(row);
        $('<div class="legend-label">')
            .text(value)
            .appendTo(row);
        $('<div class="legend-value">')
            .appendTo(row);
        $('<div class="legend-percentage">')
            .appendTo(row);
        // Prepend rows to match graph stacking order (bottom-up).
        legendTable.prepend(row);
    });

    // Add a row for displaying total values.
    var row = $('<div class="legend-total">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .text('Total')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    legendTable.append(row);

    // Calculations legend section.
    var calcContainer = $('#calc_legend');
    calcContainer.empty();
    var calcTable = $('<div class="legend-table">');

    // Add row for cumulative percentage upwards.
    var row = $('<div class="legend-cumulative-up">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('&#x2211;&uarr; / &#x2211;&#x2195;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage downwards.
    var row = $('<div class="legend-cumulative-down">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('&#x2211;&darr; / &#x2211;&#x2195;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage left.
    var row = $('<div class="legend-cumulative-left">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('X / &#x2211;&larr;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage right.
    var row = $('<div class="legend-cumulative-right">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('X / &#x2211;&rarr;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage horizontally.
    var row = $('<div class="legend-cumulative-horizontal">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('X / &#x2211;&#x2194;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage left over percentage horizontal.
    var row = $('<div class="legend-cumulative-left-ratio">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('&#x2211;&larr; / &#x2211;&#x2194;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for cumulative percentage right over percentage horizontal.
    var row = $('<div class="legend-cumulative-right-ratio">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('&#x2211;&rarr; / &#x2211;&#x2194;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for x over max.
    var row = $('<div class="legend-max-ratio">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('X / Max &#x2194;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    // Add row for 1 - (x over max).
    var row = $('<div class="legend-complement-max-ratio">');
    $('<div class="legend-box">').appendTo(row);
    $('<div class="legend-label">')
        .html('1 - X / Max &#x2194;')
        .appendTo(row);
    $('<div class="legend-value">')
        .appendTo(row);
    $('<div class="legend-percentage">')
        .appendTo(row);
    calcTable.append(row);

    calcContainer.append(calcTable);
    container.append(legendTable);
}

// Resets the info panel to its default, unhighlighted state.
function clearInfoPanel(   )
{
    $('.legend-row').removeClass('highlighted');
    $('.legend-value').text('');
    $('.legend-percentage').text('');
    $('.legend-target').attr('data-target', '').text('');
    $('.legend-table').addClass('inactive');

    // Reset the opacity of all cohort bars to full.
    $('rect[class="bar"]').attr('fill-opacity', '1');
}


// Clears only the mouse-over specific details in the info panel,
// preserving sticky selections.
function clearInfoPanelMouseDetail(   )
{
    $('.legend-row').removeClass('highlighted');

    var calcLegend = $('#calc_legend');
    calcLegend.find('.legend-cumulative-up>.legend-value').text('');
    calcLegend.find('.legend-cumulative-up>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-down>.legend-value').text('');
    calcLegend.find('.legend-cumulative-down>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-left>.legend-value').text('');
    calcLegend.find('.legend-cumulative-left>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-right>.legend-value').text('');
    calcLegend.find('.legend-cumulative-right>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-horizontal>.legend-value').text('');
    calcLegend.find('.legend-cumulative-horizontal>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-left-ratio>.legend-value').text('');
    calcLegend.find('.legend-cumulative-left-ratio>.legend-percentage').text('');
    calcLegend.find('.legend-cumulative-right-ratio>.legend-value').text('');
    calcLegend.find('.legend-cumulative-right-ratio>.legend-percentage').text('');
    calcLegend.find('.legend-max-ratio>.legend-value').text('');
    calcLegend.find('.legend-max-ratio>.legend-percentage').text('');
    calcLegend.find('.legend-complement-max-ratio>.legend-value').text('');
    calcLegend.find('.legend-complement-max-ratio>.legend-percentage').text('');
}


function handleInfoPanel(  e  )
{
    if (e.type == 'mouseenter')
    {
        var el = $(e.currentTarget);
        var cohort = el.attr('data-cohort');
        var stateName = el.attr('data-state-name');
        updateInfoPanel(cohort, stateName);
    }
    else // Mouse leave event
    {
        clearInfoPanelMouseDetail();
    }
}


function updateInfoPanel(  cohort, highlightStateName  )
{
    var legend = $('#viz_legend');
    if (!cohort)
    {
        // If cohort is not provided, try to use the one already in the legend.
        cohort = $('.legend-target').attr('data-target');
        if (!cohort)
        {
            return; // Exit if no cohort is determined.
        }
    }

    // Reset the state of previously highlighted cohort bars.
    var lastCohort = $('.legend-target').attr('data-target');
    if (lastCohort != cohort)
    {
        // If a new cohort is being highlighted, reset the old one's opacity.
        $('rect[data-cohort="' + lastCohort + '"]').attr('fill-opacity', '1');
    }

    var cohortBars = $('rect[data-cohort="' + cohort + '"]');
    cohortBars.attr('fill-opacity', '0.8'); // Dim the bars for the current cohort.

    // Update the legend with the current cohort information.
    $('.legend-target').attr('data-target', cohort);
    $('.legend-target').text(' \u2013 ' + cohort);
    $('.legend-table').removeClass('inactive');

    // Calculate totals and cumulative percentages for the highlighted column.
    // Iterates from bottom to top of the chart (vertically).
    var total = 0;
    var sumUp = 0;
    var before = true; // Flag to track elements before the highlighted state.
    var sumDown = 0;
    var highlightedCount = 0;
    $.each(cohortBars, function(index, value) {
        var el = $(value);
        var stateCount = parseInt(el.attr('data-state-count'));
        total += stateCount;

        // Cumulative percentages calculations.
        var stateName = el.attr('data-state-name');
        if (stateName == highlightStateName)
        {
            before = false; // We've reached the highlighted state.
            highlightedCount = stateCount;
            sumUp += stateCount;
            sumDown += stateCount;
        }
        else if (before)
        {
            sumDown += stateCount;
        }
        else
        {
            sumUp += stateCount;
        }
    });
    legend.find('.legend-total>.legend-value').text(total);

    // Calculate sums for the highlighted state name horizontally across cohorts.
    var sumLeft = 0;
    var sumHorizontal = 0;
    var maxHorizontal = 0;
    if (!!highlightStateName)
    {
        var highlightedCohortTime = parseDate(cohort); // Parse date for comparison.
        var allStateBars = $('rect[data-state-name="' + highlightStateName + '"]');
        $.each(allStateBars, function(index, value) {
            var el = $(value);
            if (el.attr('width') == 0)
            {
                // Ignore bars that are hidden (e.g., due to weekly/monthly grouping).
                return;
            }
            var cohort = parseDate(el.attr('data-cohort'));
            var stateCount = parseInt(el.attr('data-state-count'));
            sumHorizontal += stateCount;
            if (cohort <= highlightedCohortTime)
            {
                sumLeft += stateCount;
            }
            if (stateCount > maxHorizontal)
            {
                maxHorizontal = stateCount;
            }
        });
    }
}