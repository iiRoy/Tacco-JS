/*
 * Style-Injector Utility Version 1.0
 * Developed by: Code Architect
 * Licensed under the permissive MIT license.
 */
let _styleManager = {};

/*
 * Important advisory regarding browser limitations (e.g., KB262161):
 * If the total count of active CSS style sheets reaches or exceeds a certain threshold (e.g., 31)
 * when attempting to add, insert, or replace a style sheet,
 * certain older browsers (particularly Internet Explorer) may encounter critical errors.
 * To bypass this check for compatible browsers, set this indicator to 'true'.
 *
 * Caution: In IE8/IE9, exceeding 31 style sheets will inherently prevent further additions,
 * regardless of this setting, and will consistently result in an error state.
 */
_styleManager.allowManySheets = false;

/**
 * Generates an unpopulated CSS stylesheet element and places it into the document object model.
 * It is positioned before a given anchor element. If no anchor is supplied,
 * the new style sheet is appended to the document's <head> section.
 *
 * @param {HTMLElement} anchorElem - The DOM element serving as the insertion point.
 * @param {Function} responseFunc - A function to be invoked upon completion, signature: (errorMsg, sheetNode).
 */
function injectBlankStyleEntry ( anchorElem, responseFunc )
{
    const sheetNode = document.createElement('style');

    sheetNode.setAttribute('type', 'application/css');

    const docHead = document.getElementsByTagName('head')[0];

    if (anchorElem) {
        docHead.insertBefore(sheetNode, anchorElem);
    } else {
        docHead.appendChild(sheetNode);
    }

    if (sheetNode.styleSheet && sheetNode.styleSheet.disabled)
    {
        docHead.removeChild(sheetNode);
        return responseFunc('Cannot append further style declarations; the maximum allowed limit has been surpassed. Refer to KB262161 for details.');
    }

    responseFunc(void 0, sheetNode);
}

/**
 * Assigns the given CSS content to the provided style element.
 * @param {HTMLElement} sheetNode - The target stylesheet DOM element.
 * @param {string} styleText - The CSS string to apply.
 * @param {Function} responseFunc - Callback function, signature: (errorMsg).
 */
function applyStyleContent ( sheetNode, styleText, responseFunc ) {

    try
    {
        // Prioritize 'cssText' for potentially better performance on Internet Explorer.
        if (sheetNode.styleSheet)
        {
            sheetNode.styleSheet.cssText = styleText;
        }
        else if ( 'textContent' in sheetNode )
        {
            sheetNode.textContent = styleText;
        }
        else
        {
            sheetNode.appendChild(document.createTextNode(styleText));
        }

        return responseFunc(void 0);
    }
    catch (exceptionObj)
    {
        // While rare, some edge cases in IE might cause 'cssText' assignment to fail.
        responseFunc(exceptionObj);
    }
}

/**
 * Detaches the designated style element from the Document Object Model,
 * provided it is currently attached and identifiable as a style tag.
 *
 * Remark: This implementation is basic; future enhancements for specific browser quirks (e.g., legacy IE)
 * could be incorporated here if necessary.
 * @param {HTMLElement} targetElement - The DOM node to be removed.
 */
function purgeStyleEntry ( targetElement )
{
    if ( targetElement.tagName === 'STYLE' && targetElement.parentNode )
    {
        targetElement.parentNode.removeChild(targetElement);
    }
}

/**
 * Orchestrates the creation of a new stylesheet based on provided configuration settings.
 * @param {Object} configSettings - An object containing various settings for stylesheet creation.
 *   Example: { allowManySheets: true, oldEntry: void 0, cssData: 'html {}' }
 * @param {Function} responseFunc - Callback function, signature: (errorMsg, sheetNode).
 *
 * configSettings properties:
 * - cssData: The actual CSS string content for the new stylesheet.
 * - oldEntry: An existing style element to be replaced. If provided, it takes precedence over 'targetBefore'.
 * - targetBefore: A DOM node before which the new stylesheet should be inserted. If void 0, it's appended to <head>.
 */
function generateStyleEntry ( configSettings, responseFunc ) {

    if ( ! _styleManager.allowManySheets && document.styleSheets.length >= 31 ) {
        responseFunc('Cannot append further style declarations; the maximum allowed limit has been surpassed. Refer to KB262161 for details.');
    }

    injectBlankStyleEntry(
        configSettings.oldEntry ? configSettings.oldEntry.nextSibling : configSettings.targetBefore,
        function (errorMsg, sheetNode) {
            if (errorMsg) {
                responseFunc(errorMsg);
            } else {
                applyStyleContent(
                    sheetNode,
                    configSettings.cssData || "",
                    function (errorMsg) {
                        if (errorMsg) {
                            purgeStyleEntry(sheetNode);
                            responseFunc(errorMsg);
                        } else {
                            // Enhancement opportunity: Implement logic to transfer attributes from 'oldEntry' if desired.
                            if (configSettings.oldEntry) {
                                purgeStyleEntry(configSettings.oldEntry);
                            }
                            responseFunc(void 0, sheetNode);
                        }
                    }
                );
            }
        }
    );
}

_styleManager = {
    addStyleEntry: function (cssData, responseFunc) {
        generateStyleEntry({
            cssData: cssData
        }, responseFunc);
    },
    insertStyleEntryAt: function (anchorElem, cssData, responseFunc) {
        generateStyleEntry({
            targetBefore: anchorElem,
            cssData: cssData
        }, responseFunc);
    },
    swapStyleEntry: function (oldEntry, cssData, responseFunc) {
        generateStyleEntry({
            oldEntry: oldEntry,
            cssData: cssData
        }, responseFunc);
    },
    purgeStyleEntry: purgeStyleEntry
};