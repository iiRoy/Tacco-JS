/*
 * Copyright 2012 Brett Slatkin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var CATEGORY_KIND_INDEX = 0;
var CATEGORY_ITEM_INDEX = 1;
var DATE_ENTRY_INDEX = 2;


function fetchChosenCategoryKind() {
    return $('input:radio[name=\'chart1\']:checked').val();
}


function retrieveTotalCategoryItems() {
    return $('.group-value-checkbox').length;
}


function fetchChosenCategoryItems() {
    return $.makeArray(
        $('.group-value-checkbox:checked').map(function(idx, node) {
            return $(node).val();
        }));
}


function retrieveActiveSegmentLabels() {
    return $.makeArray($('.legend-row:not(.disabled)').map(
        function(idx, node) {
            return $(node).data('stateName');
        }));
}


function queryIsStandardized() {
    return $('input:checkbox[name=\'normalize\']:checked').val();
}


function obtainTimeframe() {
    return $('input:radio[name=\'period\']:checked').val();
}


function fetchPlotStyle() {
    return $('input:radio[name=\'point_type\']:checked').val();
}

function getIncludedSymbols() {
    return $('input:radio[name=\'sign\']:checked').val();
}


// Maintain a record of the most recent selections for category items
// to restore their choice status later.
var PREVIOUS_CATEGORY_ITEM_SELECTIONS = {};


function constructCategoryKindOptions(categoryVarieties) {
    var displayPanel = $('#viz_group_type1');
    displayPanel.empty();

    // Assume the category kind that possesses only one item, and that item is
    // empty, represents the primary data series.
    var selectedVariety = null;
    $.each(categoryVarieties, function(attribute, content) {
        if (content.length == 1 && content[0] === '') {
            selectedVariety = attribute;
        }
    });

    // Arrange the category names in alphabetical sequence.
    var sortedCategoryVarieties = Object.keys(categoryVarieties);
    sortedCategoryVarieties.sort();

    // If no default variety for the primary data exists, utilize the first one.
    if (!selectedVariety) {
        selectedVariety = sortedCategoryVarieties[0];
    }

    var counter = 0;
    $.each(sortedCategoryVarieties, function(idx, attribute) {
        var content = categoryVarieties[attribute];
        var optionId = 'group_type_radio1_' + (counter++);
        var currentOption = $('<input type="radio">')
            .addClass('group-type-radio')
            .attr('id', optionId)
            .attr('name', 'chart1')
            .attr('value', attribute);

        // Designate the default category variety.
        if (!!selectedVariety && selectedVariety === attribute) {
            currentOption.attr('checked', 'checked');
        }

        var wrapper = $('<div>');
        wrapper.append(currentOption);
        wrapper.append($('<label>').attr('for', optionId).text(attribute));

        displayPanel.append(wrapper);
    });

    // Enroll event listeners
    $('.group-type-radio').click(function() {
        constructCategoryItemCheckboxes(categoryVarieties);
        $(document).trigger('cohorts.viz', 'group-type');
    });
}


function constructCategoryItemCheckboxes(categoryVarieties) {
    var kind = fetchChosenCategoryKind();
    var items = categoryVarieties[kind];
    if (!items) {
        $.error('Invalid category kind: ' + kind);
    }

    var itemsPanel = $('#viz_group_value1');
    itemsPanel.empty();

    // Specific scenario for category kinds that contain only a single, empty item.
    if (items.length == 1 && items[0] === '') {
        return;
    }

    // Alphabetize items!
    items.sort();

    var itemsHeading = $('<div class="section-header">')
        .text('Included category items');

    // Controls for toggling all checkboxes.
    var choiceSwitcher = $('<span class="selection-toggle">')
        .append(' &ndash; ');
    $('<a href="javascript:void(0)">')
        .text('all')
        .click(function() {
            $('.group-value-checkbox').prop('checked', true);
            // Reset the collection of previously chosen category items.
            PREVIOUS_CATEGORY_ITEM_SELECTIONS = {};
            $(document).trigger('cohorts.viz');
        })
        .appendTo(choiceSwitcher);
    choiceSwitcher.append(' or ');
    $('<a href="javascript:void(0)">')
        .text('none')
        .click(function() {
            $('.group-value-checkbox').prop('checked', false);
            // Reset the collection of previously chosen category items.
            PREVIOUS_CATEGORY_ITEM_SELECTIONS = {};
            $(document).trigger('cohorts.viz');
        })
        .appendTo(choiceSwitcher);
    choiceSwitcher.appendTo(itemsHeading);
    itemsHeading.appendTo(itemsPanel);

    // Checkboxes for each category item
    var sectionBody = $('<div class="section-content">');
    var counter = 0;
    $.each(items, function(attribute, content) {
        var boxIdentifier = 'group_value_checkbox1_' + (counter++);
        var wrapper = $('<div>');
        wrapper.append(
            $('<input type="checkbox" class="group-value-checkbox" checked>')
            .attr('value', content)
            .attr('id', boxIdentifier));
        wrapper.append(
            $('<label>').attr('for', boxIdentifier).text(content));
        sectionBody.append(wrapper);
    });
    itemsPanel.append(sectionBody);

    // Enroll event listeners
    $('.group-value-checkbox').click(function(eventObject) {
        // When an item is explicitly checked or unchecked, retain its status so
        // it can be restored if the category kind is altered later. This will be
        // cleared by selecting None or All.
        var checkElement = $(eventObject.target);
        PREVIOUS_CATEGORY_ITEM_SELECTIONS[checkElement.val()] = checkElement.attr('checked') === 'checked';

        $(document).trigger('cohorts.viz');
    });

    // Pre-select those category items whose states were preserved earlier. Any items that were
    // previously removed will default to unchecked. Thus, only explicit
    // selections are retained.
    if (Object.keys(PREVIOUS_CATEGORY_ITEM_SELECTIONS).length > 0) {
        $('.group-value-checkbox').attr('checked', false);

        $.each(PREVIOUS_CATEGORY_ITEM_SELECTIONS, function(attribute, content) {
            $('.group-value-checkbox[value="' + attribute + '"]').attr('checked', content);
        });
    }
}


function buildKey(dataRowsWithHeader) {
    var segmentLabels = dataRowsWithHeader[0].slice(3);
    var keyContainer = $('#viz_legend');
    keyContainer.empty();

    var keyDisplay = $('<div class="legend-table inactive">');

    var visualHue = d3.scale.category20();
    $.each(segmentLabels, function(idx, content) {
        var lineEntry = $('<div class="legend-row">')
            .attr('data-state-name', content)
            .click(function(eventObject) {
                lineEntry.toggleClass('disabled');
                $(document).trigger('cohorts.viz');
            });
        $('<div class="legend-box">')
            .attr('style', 'background-color: ' + visualHue(idx))
            .appendTo(lineEntry);
        $('<div class="legend-label">')
            .text(content)
            .appendTo(lineEntry);
        $('<div class="legend-value">')
            .appendTo(lineEntry);
        $('<div class="legend-percentage">')
            .appendTo(lineEntry);
        // Invert order to align with graph layering.
        keyDisplay.prepend(lineEntry);
    });

    // Append a line for the grand totals
    var lineEntry = $('<div class="legend-total">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .text('Total')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    keyDisplay.append(lineEntry);

    // Append line for cumulative percentage ascending
    var calculationContainer = $('#calc_legend');
    calculationContainer.empty();
    var calculationDisplay = $('<div class="legend-table">');

    var lineEntry = $('<div class="legend-cumulative-up">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('&#x2211;&uarr; / &#x2211;&#x2195;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage descending
    var lineEntry = $('<div class="legend-cumulative-down">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('&#x2211;&darr; / &#x2211;&#x2195;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage leftwards
    var lineEntry = $('<div class="legend-cumulative-left">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('X / &#x2211;&larr;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage rightwards
    var lineEntry = $('<div class="legend-cumulative-right">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('X / &#x2211;&rarr;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage horizontally
    var lineEntry = $('<div class="legend-cumulative-horizontal">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('X / &#x2211;&#x2194;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage left over percentage horizontal
    var lineEntry = $('<div class="legend-cumulative-left-ratio">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('&#x2211;&larr; / &#x2211;&#x2194;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for cumulative percentage right over percentage horizontal
    var lineEntry = $('<div class="legend-cumulative-right-ratio">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('&#x2211;&rarr; / &#x2211;&#x2194;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for x over maximum
    var lineEntry = $('<div class="legend-max-ratio">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('X / Max &#x2194;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    // Append line for 1 - (x over maximum)
    var lineEntry = $('<div class="legend-complement-max-ratio">');
    $('<div class="legend-box">').appendTo(lineEntry);
    $('<div class="legend-label">')
        .html('1 - X / Max &#x2194;')
        .appendTo(lineEntry);
    $('<div class="legend-value">')
        .appendTo(lineEntry);
    $('<div class="legend-percentage">')
        .appendTo(lineEntry);
    calculationDisplay.append(lineEntry);

    calculationContainer.append(calculationDisplay);
    keyContainer.append(keyDisplay);
}

// Restores the information panel to its initial configuration.
function resetDetailsPane() {
    $('.legend-row').removeClass('highlighted');
    $('.legend-value').text('');
    $('.legend-percentage').text('');
    $('.legend-target').attr('data-target', '').text('');
    $('.legend-table').addClass('inactive');

    // Restore the status of all cohort bars to unhighlighted if
    // the information panel is being cleared.
    $('rect[class="bar"]').attr('fill-opacity', '1');
}


// Resets the information panel to a state where the mouse is not hovering
// over any part of the graph. The selected column should remain fixed, but
// all other elements should be reset.
function resetDetailsPaneMouseInfo() {
    $('.legend-row').removeClass('highlighted');

    var calcKey = $('#calc_legend');
    calcKey.find('.legend-cumulative-up>.legend-value').text('');
    calcKey.find('.legend-cumulative-up>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-down>.legend-value').text('');
    calcKey.find('.legend-cumulative-down>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-left>.legend-value').text('');
    calcKey.find('.legend-cumulative-left>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-right>.legend-value').text('');
    calcKey.find('.legend-cumulative-right>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-horizontal>.legend-value').text('');
    calcKey.find('.legend-cumulative-horizontal>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-left-ratio>.legend-value').text('');
    calcKey.find('.legend-cumulative-left-ratio>.legend-percentage').text('');
    calcKey.find('.legend-cumulative-right-ratio>.legend-value').text('');
    calcKey.find('.legend-cumulative-right-ratio>.legend-percentage').text('');
    calcKey.find('.legend-max-ratio>.legend-value').text('');
    calcKey.find('.legend-max-ratio>.legend-percentage').text('');
    calcKey.find('.legend-complement-max-ratio>.legend-value').text('');
    calcKey.find('.legend-complement-max-ratio>.legend-percentage').text('');
}


function manageDetailsPane(eventObject) {
    if (eventObject.type == 'mouseenter') {
        var elementRef = $(eventObject.currentTarget);
        var dataGroup = elementRef.attr('data-cohort');
        var segmentLabel = elementRef.attr('data-state-name');
        refreshDetailsPane(dataGroup, segmentLabel);
    } else {
        // Mouse exits
        resetDetailsPaneMouseInfo();
    }
}


function refreshDetailsPane(dataGroup, emphasizedSegmentLabel) {
    var mainKey = $('#viz_legend');
    if (!dataGroup) {
        // Data group was not provided. Use the value present in the key.
        dataGroup = $('.legend-target').attr('data-target');
        if (!dataGroup) {
            return;
        }
    }

    // Reset the status of the previous data group bars.
    var previousDataGroup = $('.legend-target').attr('data-target');
    if (previousDataGroup != dataGroup) {
        // Reset the status of the old data group bars to unhighlighted if
        // a new bar is being entered. Otherwise, keep the previous bar
        // highlighted.
        $('rect[data-cohort="' + previousDataGroup + '"]').attr('fill-opacity', '1');
    }

    var dataGroupBars = $('rect[data-cohort="' + dataGroup + '"]');
    dataGroupBars.attr('fill-opacity', '0.8');

    // Reset the key
    $('.legend-target').attr('data-target', dataGroup);
    $('.legend-target').text(' \u2013 ' + dataGroup);
    $('.legend-table').removeClass('inactive');

    // Calculate totals for the highlighted column. This iterates from the
    // bottom item in the key up to the top of the chart, vertically.
    var overallSum = 0;
    var cumulativeUpwards = 0;
    var priorToHighlight = true;
    var cumulativeDownwards = 0;
    var emphasizedCount = 0;
    $.each(dataGroupBars, function(idx, content) {
        var elementRef = $(content);
        var segmentCount = parseInt(elementRef.attr('data-state-count'));
        overallSum += segmentCount;

        // Cumulative percentages. Include the point itself.
        var segmentLabel = elementRef.attr('data-state-name');
        if (segmentLabel == emphasizedSegmentLabel) {
            priorToHighlight = false;
            emphasizedCount = segmentCount;
            cumulativeUpwards += segmentCount;
            cumulativeDownwards += segmentCount;
        } else if (priorToHighlight) {
            cumulativeDownwards += segmentCount;
        } else {
            cumulativeUpwards += segmentCount;
        }
    });
    mainKey.find('.legend-total>.legend-value').text(overallSum);

    // Calculate totals for the emphasized segment label horizontally across data groups.
    var cumulativeLeft = 0;
    var cumulativeHorizontal = 0;
    var maximumHorizontal = 0;
    if (!!emphasizedSegmentLabel) {
        var emphasizedDataGroupTime = parseDate(dataGroup);
        var allSegmentBars = $('rect[data-state-name="' + emphasizedSegmentLabel + '"]');
        $.each(allSegmentBars, function(idx, content) {
            var elementRef = $(content);
            if (elementRef.attr('width') == 0) {
                // Disregard bars concealed by weekly or monthly aggregation.
                return;
            }
            var dataGroup = parseDate(elementRef.attr('data-cohort'));
            var segmentCount = parseInt(elementRef.attr('data-state-count'));
            cumulativeHorizontal += segmentCount;
            if (dataGroup <= emphasizedDataGroupTime) {
                cumulativeLeft += segmentCount;
            }
            if (segmentCount > maximumHorizontal) {
                maximumHorizontal = segmentCount;
            }
        });
    }