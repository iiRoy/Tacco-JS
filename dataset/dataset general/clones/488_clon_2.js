/*
 * wireframe-generator
 *
 * Transforms basic web layouts and styling into visual wireframes
 *
 * http://www.framify.com/ (original source)
 *
 * Copyright (c) 2012 Art Lawry (original author)
 * Licensed under the terms of the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

/*
 *
 *  ON CONTENT MODIFICATION
 *  Allows code execution when the web page's structure changes.
 *
 *  Licensed under the MIT License.
 *  (c) 2010 Balázs Galambosi (original author)
 *
 */

(function (scope) {

    'use strict';

    var
        lastActivityTime      = +new Date(), // '+' converts to numeric timestamp
        executionInterval     = 100,         // default processing delay in ms
        eventQueue            = [],          // holds functions to execute
        featureDetection      = {},          // tracks mutation event support
        rootElement           = document.documentElement,
        pendingTests          = 3,           // number of feature tests remaining
        onContentModified,                   // the exposed public method
        temporaryDiv;                        // element for feature probing

    function processQueue() {
        var
            currentTime = +new Date(), // '+' converts to numeric timestamp
            idx;                       // loop counter variable
        if (currentTime - lastActivityTime > executionInterval) {
            for (idx = 0; idx < eventQueue.length; idx += 1) {
                eventQueue[idx]();
            }
            lastActivityTime = currentTime;
        }
    }

    // Public API function for DOM change detection
    onContentModified = function (handlerFunction, newInterval) {
        if (newInterval) {
            executionInterval = newInterval;
        }
        eventQueue.push(handlerFunction);
    };

    // Simple polling method for older browsers
    function fallbackPolling() {

        var
            previousElements  = document.getElementsByTagName('*'),
            previousCount     = previousElements.length,
            pollingTimer      = setTimeout(function checkChanges() {

                // grab the current state of all elements in the document
                var
                    currentElements = document.getElementsByTagName('*'),
                    currentCount    = currentElements.length,
                    elemIndex;

                // if the total number of elements has changed
                // it's an obvious structural alteration
                if (currentCount !== previousCount) {
                    // force a re-scan on next iteration
                    previousElements = [];
                }

                // iterate through all current elements to find differences
                for (elemIndex = 0; elemIndex < currentCount; elemIndex += 1) {
                    if (currentElements[elemIndex] !== previousElements[elemIndex]) {
                        processQueue();
                        previousElements = currentElements;
                        previousCount    = currentCount;
                        break; // exit loop after first change detected and processed
                    }
                }

                // schedule the next check
                setTimeout(checkChanges, executionInterval);

            }, executionInterval);
    }

    //
    //  Determine browser's mutation event capabilities
    //

    // callback to decide which DOM change detection strategy to use
    function determineStrategy() {
        if (featureDetection.nodeInsertion) {
            scope.addEventListener("DOMContentLoaded", function () {
                if (featureDetection.subtreeModifications) { // for modern Firefox, Chrome
                    rootElement.addEventListener('elementSubtreeModified', processQueue, false);
                } else { // for older Firefox, Safari, Opera 9.6+
                    rootElement.addEventListener('elementNodeInserted', processQueue, false);
                    rootElement.addEventListener('elementNodeRemoved', processQueue, false);
                }
            }, false);
        } else if (document.onpropertychange) { // for Internet Explorer 5.5+
            document.onpropertyChangeHandler = processQueue;
        } else { // if no native support found, use the fallback polling
            fallbackPolling();
        }
    }

    // performs a test for a specific mutation event
    function probeEvent(eventName) {
        rootElement.addEventListener(eventName, function testHandler() {
            featureDetection[eventName] = true;
            rootElement.removeEventListener(eventName, testHandler, false);
            pendingTests -= 1;
            if (pendingTests === 0) {
                determineStrategy();
            }
        }, false);
    }

    // attach initial test events if the browser supports addEventListener
    if (scope.addEventListener) {
        probeEvent('elementSubtreeModified');
        probeEvent('elementNodeInserted');
        probeEvent('elementNodeRemoved');
    } else {
        determineStrategy(); // if no addEventListener, jump straight to decision
    }

    // perform a quick dummy element insertion/removal test
    temporaryDiv = document.createElement("div");
    rootElement.appendChild(temporaryDiv);
    rootElement.removeChild(temporaryDiv);

    // make the DOM change detection function globally accessible
    scope.onContentModified = onContentModified;

}(window));

/*
 * self-executing function that initializes the wireframe jQuery plugin
 *
 * @param {Object} jQ - The jQuery object
 */
(function (jQ) {

    'use strict';
    var
        configuration   = {}, // holds various settings and patterns
        utilityMethods  = {}, // helper functions for calculations and DOM manipulation
        pluginOperations = {}; // core methods for the plugin's functionality

    /*
     * CONFIGURATION - configuration.*
     */

    configuration.sizeUnits        = ['em', 'ex', 'ch', 'rem', 'cm', 'mm', 'in', 'pt', 'pc', 'px'];
    configuration.palette          = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

    configuration.mediaQueryPattern = /(min-|max-)?((device-)?(width|height)|aspect-ratio)/g;

    configuration.aspectRatioPattern = /(min-|max-)?aspect-ratio\s*:\s*(\d+)\/(\d+)/g;
    configuration.widthQueryPattern  = new RegExp(
        '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
            + configuration.sizeUnits.join('|')
            + ')?(\\s|\\))',
        'g'
    );
    configuration.heightQueryPattern = new RegExp(
        '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
            + configuration.sizeUnits.join('|')
            + ')?(\\s|\\))',
        'g'
    );

    // configuration.browserPrefixes = [
    //   '-webkit',
    //   '-moz',
    //   '-ms',
    //   '-o',
    //   ''
    // ];

    /*
     * UTILITY METHODS - utilityMethods.*
     */

    /**
     * Computes the angle of the diagonal for a given rectangular area.
     *
     * @param {Number} inputWidth - The horizontal dimension of the rectangle (in pixels).
     * @param {Number} inputHeight - The vertical dimension of the rectangle (in pixels).
     *
     * @return {Number} The calculated angle of the diagonal in degrees.
     */
    utilityMethods.computeDiagonalAngle = function (inputWidth, inputHeight) {
        var resultAngle =
            90 - Math.round(
                (
                    180 * Math.asin(
                        (
                            inputWidth * Math.sin(
                                Math.PI / 2
                            )
                        ) / Math.sqrt(
                            inputWidth * inputWidth + inputHeight * inputHeight
                        )
                    )
                ) / Math.PI * 100
            ) / 100;

        return resultAngle;
    };

    /**
     * Determines the absolute top and left pixel offsets of a DOM element from the viewport.
     *
     * @param {Object} targetElement - The DOM element whose offset is to be calculated.
     *
     * @return {Array} An array containing the [left offset, top offset] in pixels.
     */
    utilityMethods.retrieveElementPosition = function (targetElement) {
        var
            finalLeftOffset = targetElement.offsetLeft,
            finalTopOffset  = targetElement.offsetTop,
            currentElement  = targetElement;

        // Image padding can influence the reported offset, so adjust for it.
        if (currentElement.tagName.toLowerCase() === 'img') {
            finalLeftOffset += parseInt(jQ(currentElement).css('padding-left'), 10);
            finalTopOffset  += parseInt(jQ(currentElement).css('padding-top'), 10);
        }

        // Accumulate offsets from parent elements until the body is reached.
        if (currentElement.offsetParent) {
            while (currentElement.offsetParent) {
                currentElement = currentElement.offsetParent;
                if (currentElement.tagName.toLowerCase() === 'body') {
                    break;
                } else {
                    finalLeftOffset += currentElement.offsetLeft;
                    finalTopOffset  += currentElement.offsetTop;
                }
            }
        }

        return [finalLeftOffset, finalTopOffset];
    };

    /**
     * Generates and adds visual representations of CSS media query breakpoints to the DOM.
     *
     * @param {Number} breakpointId - A unique numeric identifier for this breakpoint.
     * @param {String} queryExpression - The raw CSS media query string.
     */
    utilityMethods.renderBreakpointVisual = function (breakpointId, queryExpression) {
        var
            splitQueries     = queryExpression.split(/,\s?/),
            visualClass,
            labelClass,
            visualStyle,
            labelStyle,
            labelContent,
            diagonalAngle, // This variable is declared but unused in the original logic.
            outerIdx,
            innerIdx,
            isQueryValid,
            currentQuery,
            matchedRules = [],
            queryParts   = [];

        for (outerIdx = 0; outerIdx < splitQueries.length; outerIdx += 1) {
            isQueryValid = true;

            // Filter out media queries that aren't understood by the current browser.
            if (splitQueries[outerIdx] !== 'not all') {

                // Only consider specific media types (all or screen).
                if (
                    splitQueries[outerIdx].match(/(all|screen)/i)
                        && !splitQueries[outerIdx].match(/not (all|screen)/i)
                ) {

                    // Only process specific media features (width, height, aspect-ratio).
                    if (splitQueries[outerIdx].match(configuration.mediaQueryPattern)) {

                        // Handle min/max device/non-device width queries.
                        matchedRules = splitQueries[outerIdx].match(configuration.widthQueryPattern) || [];
                        if (
                            matchedRules
                                && matchedRules.length === splitQueries[outerIdx].match(/\(/g).length
                        ) {

                            queryParts = splitQueries[outerIdx].match(/([a-z\-]+):/g);
                            for (innerIdx = 0; innerIdx < queryParts.length; innerIdx += 1) {
                                if (!queryParts[0].match(/width$/)) {
                                    isQueryValid = false;
                                    break;
                                }
                            }

                            if (isQueryValid) {

                                labelClass =
                                    'wireframe-breakpoint-label wireframe-width-breakpoint-label';

                                if (matchedRules.length === 2) {
                                    currentQuery = new RegExp(
                                        '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                                            + configuration.sizeUnits.join('|')
                                            + ')?(\\s|\\))',
                                        'g'
                                    );

                                    queryParts = currentQuery.exec(splitQueries[outerIdx]).concat(
                                        currentQuery.exec(splitQueries[outerIdx])
                                    );

                                    queryParts[1] = queryParts[1] || ''; // min/max prefix
                                    queryParts[2] = queryParts[2] || ''; // device prefix
                                    queryParts[3] = parseInt(queryParts[3], 10);
                                    queryParts[4] = queryParts[4] || ''; // unit type
                                    queryParts[7] = queryParts[7] || ''; // min/max prefix for second rule
                                    queryParts[8] = queryParts[8] || ''; // device prefix for second rule
                                    queryParts[9] = parseInt(queryParts[9], 10);
                                    queryParts[10] = queryParts[10] || ''; // unit type for second rule

                                    if (
                                        queryParts[1].match(/^(min-|max-)$/)
                                            && queryParts[7].match(/^(min-|max-)$/)
                                            && queryParts[1] !== queryParts[6] // ensure one is min and other is max
                                            && (queryParts[4] === queryParts[10] // units must match
                                                || (queryParts[3] === 0 && !queryParts[4])
                                                || (queryParts[9] === 0 && !queryParts[10])
                                            )
                                    ) {

                                        visualClass =
                                            'wireframe-breakpoint wireframe-min-max-width-breakpoint';

                                        if (queryParts[1] === 'min-') {

                                            visualStyle =
                                                'left:' + (queryParts[3] - 1) + queryParts[4] + ';'
                                                + 'width:' + (queryParts[9] - queryParts[3]) + queryParts[10] + ';';

                                            labelStyle =
                                                'left:' + queryParts[9] + queryParts[10] + ';';

                                            labelContent =
                                                matchedRules[0].replace(/\s*\)$/, '') + ' - '
                                                + matchedRules[1].replace(/\s*\)$/, '');

                                        } else {

                                            visualStyle =
                                                'left:' + (queryParts[9] - 1) + queryParts[10] + ';'
                                                + 'width:' + (queryParts[3] - queryParts[9]) + queryParts[4] + ';';

                                            labelStyle =
                                                'left:' + queryParts[3] + queryParts[4] + ';';

                                            labelContent =
                                                matchedRules[1].replace(/\s*\)$/, '') + ' - '
                                                + matchedRules[0].replace(/\s*\)$/, '');

                                        }
                                    }
                                }
                            } else if (matchedRules.length === 1) {
                                currentQuery = new RegExp(
                                    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
                                        + configuration.sizeUnits.join('|')
                                        + ')?(\\s|\\))',
                                    'g'
                                );

                                queryParts = currentQuery.exec(splitQueries[outerIdx]).concat(
                                    currentQuery.exec(splitQueries[outerIdx])
                                );

                                queryParts[1] = queryParts[1] || ''; // min/max prefix
                                queryParts[2] = queryParts[2] || ''; // device prefix
                                queryParts[3] = parseInt(queryParts[3], 10);
                                queryParts[4] = queryParts[4] || ''; // unit type

                                if (
                                    queryParts[3] === 0
                                        || (queryParts[3] > 0 && queryParts[4])
                                ) {

                                    visualClass =
                                        'wireframe-breakpoint '
                                        + 'wireframe-' + queryParts[1] + 'width-breakpoint';

                                    // min-width, standard single query
                                    visualStyle =
                                        'left: ' + queryParts[3] + queryParts[4] + ';';

                                    // max-width
                                    if (queryParts[1]) {
                                        if (queryParts[1] === 'max-') {
                                            visualStyle =
                                                'width: ' + queryParts[3] + queryParts[4] + ';';
                                        }
                                    }

                                    labelStyle =
                                        'left:' + queryParts[3] + queryParts[4] + ';';

                                    labelContent =
                                        matchedRules[0].replace(/\s*\)$/, '');
                                }
                            }
                        }

                        // Handle min/max device/non-device height queries.
                        matchedRules = splitQueries[outerIdx].match(configuration.heightQueryPattern) || [];
                        if (
                            matchedRules
                                && matchedRules.length === splitQueries[outerIdx].match(/\(/g).length
                        ) {

                            queryParts = splitQueries[outerIdx].match(/([a-z\-]+):/g);
                            for (innerIdx = 0; innerIdx < queryParts.length; innerIdx += 1) {
                                if (!queryParts[0].match(/height$/)) {
                                    isQueryValid = false;
                                    break;
                                }
                            }

                            if (isQueryValid) {

                                labelClass =
                                    'wireframe-breakpoint-label wireframe-height-breakpoint-label';

                                if (matchedRules.length === 2) {
                                    currentQuery = new RegExp(
                                        '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
                                            + configuration.sizeUnits.join('|')
                                            + ')?(\\s|\\))',
                                        'g'
                                    );

                                    queryParts = currentQuery.exec(splitQueries[outerIdx]).concat(
                                        currentQuery.exec(splitQueries[outerIdx])
                                    );

                                    queryParts[1] = queryParts[1] || ''; // min/max prefix
                                    queryParts[2] = queryParts[2] || ''; // device prefix
                                    queryParts[3] = parseInt(queryParts[3], 10);
                                    queryParts[4] = queryParts[4] || ''; // unit type
                                    queryParts[7] = queryParts[7] || ''; // min/max prefix for second rule
                                    queryParts[8] = queryParts[8] || ''; // device prefix for second rule
                                    queryParts[9] = parseInt(queryParts[9], 10);
                                    queryParts[10] = queryParts[10] || ''; // unit type for second rule

                                    if (
                                        queryParts[1].match(/^(min-|max-)$/)
                                            && queryParts[7].match(/^(min-|max-)$/)
                                            && queryParts[1] !== queryParts[6] // ensure one is min and other is max
                                            && (queryParts[4] === queryParts[10] // units must match
                                                || (queryParts[3] === 0 && !queryParts[4])
                                                || (queryParts[9] === 0 && !queryParts[10])
                                            )
                                    ) {

                                        visualClass =
                                            'wireframe-breakpoint wireframe-min-max-height-breakpoint';

                                        if (queryParts[1] === 'min-') {

                                            visualStyle =
                                                'top:' + (queryParts[3] - 1) + queryParts[4] + ';'
                                                + 'height:' + (queryParts[9] - queryParts[3]) + queryParts[10] + ';';

                                            labelStyle =
                                                'top:' + queryParts[9] + queryParts[10] + ';';

                                            labelContent =
                                                matchedRules[0].replace(/\s*\)$/, '') + ' - '
                                                + matchedRules[1].replace(/\s*\)$/, '');

                                        } else {

                                            visualStyle =
                                                'top:' + (queryParts[9] - 1) + queryParts[10] + ';'
                                                + 'height:' + (queryParts[3] - queryParts[9]) + queryParts[4] + ';';

                                            labelStyle =
                                                'top:' + queryParts[3] + queryParts[4] + ';';

                                            labelContent =
                                                matchedRules[1].replace(/\s*\)$/, '') + ' - '
                                                + matchedRules[0].replace(/\s*\)$/, '');

                                        }