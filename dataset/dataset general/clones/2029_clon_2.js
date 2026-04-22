/*  jDom.output, version 1.0.3
 *  (c) Samuel Perez, Dev Collective
 *  Licence: MIT (https://opensource.org/licenses/MIT)
 *--------------------------------------------------------------------------*/

(function(jDom) {
"use strict";
// Encapsulating closure for our utility definitions

function createJObject(contentSource) {
    // Transform input into a proper jDom object
    var elementContainer = jDom("");
    try {
        elementContainer = jDom(contentSource).clone();
    }
    catch (exceptionObject) {
        elementContainer = jDom("<figure />").html(contentSource);
    }
    return elementContainer;
}

function verifyNode(givenItem) {
    /* Based on: http://stackoverflow.com/a/384380/937891 */
    return !!( typeof Node === "object"
        ? givenItem instanceof Node
        : givenItem && typeof givenItem === "object" && typeof givenItem.nodeType === "number" && typeof givenItem.nodeName === "string"
    );
}


jDom.render = jDom.fn.render = function() {
    // Initiate printing for a specified collection of elements

    var preferences, targetSelection, thisInstance = this;

    // console.info("Commencing rendering process for:", this, arguments);

    if ( thisInstance instanceof jDom ) {
        // Retrieve the underlying DOM element if it's a jDom wrapper
        thisInstance = thisInstance.get(0);
    }

    if (verifyNode(thisInstance)) {
        // If `this` refers to an HTML element, as in:
        // jDom(selector).render()
        targetSelection = jDom(thisInstance);
        if (arguments.length > 0) {
            preferences = arguments[0];
        }
    } else {
        if (arguments.length > 0) {
            // jDom.render(selector, preferences)
            targetSelection = jDom(arguments[0]);
            if (verifyNode(targetSelection[0])) {
                if (arguments.length > 1) {
                    preferences = arguments[1];
                }
            } else {
                // jDom.render(preferences)
                preferences = arguments[0];
                targetSelection = jDom("html");
            }
        } else {
            // jDom.render()
            targetSelection = jDom("html");
        }
    }

    // Establish base configuration
    var baseConfig = {
        useUniversalStyles : true,
        includeMediaQueryPrint : false,
        externalCssLink : null,
        hiddenOnPrintSelector : ".no-output",
        renderInFrame : true,
        extraMarkupAfter : null,
        extraMarkupBefore : null
    };
    // Combine with user-supplied settings
    preferences = jDom.extend({}, baseConfig, (preferences || {}));

    var collectedStyles = jDom("");
    if (preferences.useUniversalStyles) {
        // Incorporate styles from the current document into the print output
        collectedStyles = jDom("style, link, meta, title");
    } else if (preferences.includeMediaQueryPrint) {
        // Apply stylesheets specifically marked for print media
        collectedStyles = jDom("link[media=print]");
    }
    if (preferences.externalCssLink) {
        // Append a custom stylesheet URL if provided
        collectedStyles = jDom.merge(collectedStyles, jDom('<link rel="stylesheet" href="' + preferences.externalCssLink + '">'));
    }

    // Generate a duplicate of the element intended for printing
    var clonedContent = targetSelection.clone();
    // Wrap the duplicate within a generic container to extract its HTML representation
    clonedContent = jDom("<article/>").append(clonedContent);
    // Eliminate elements marked to be excluded from printing
    clonedContent.find(preferences.hiddenOnPrintSelector).remove();
    // Insert the gathered CSS definitions
    clonedContent.append(collectedStyles.clone());
    // Append additional content, if specified
    clonedContent.append(createJObject(preferences.extraMarkupAfter));
    // Prepend additional content, if specified
    clonedContent.prepend(createJObject(preferences.extraMarkupBefore));
    // Retrieve the complete HTML string
    var renderedHtml = clonedContent.html();
    // Dispose of the temporary cloned structure
    clonedContent.remove();

    var outputWindow, printDocument;
    if (preferences.renderInFrame) {
        // Utilize an invisible iframe for the printing operation
        try {
            var targetIframe = jDom(preferences.renderInFrame + "");
            var existingFrameCount = targetIframe.length;
            if (existingFrameCount === 0) {
                // Construct a new iframe if no existing one was referenced
                targetIframe = jDom('<iframe height="0" width="0" border="0" wmode="transparent"/>')
                    .prependTo('body')
                    .css({
                        "position" : "absolute",
                        "top" : -9999,
                        "left" : -9999
                    });
            }
            outputWindow = targetIframe.get(0);
            outputWindow = outputWindow.contentWindow || outputWindow.contentDocument || outputWindow;
            printDocument = outputWindow.document || outputWindow.contentDocument || outputWindow;
            printDocument.open();
            printDocument.write(renderedHtml);
            printDocument.close();
            setTimeout(function delayExecution() {
                // IE compatibility: Allow rendering time for the iframe
                outputWindow.focus();
                outputWindow.print();
                setTimeout(function cleanupFrame() {
                    // Another IE fix
                    if (existingFrameCount === 0) {
                        // Remove the iframe if it was generated by this process
                        targetIframe.remove();
                    }
                }, 100);
            }, 250);
        }
        catch (exceptionObject) {
            // Fallback to the pop-up window method if iframe printing fails
            console.error("Iframe rendering failed:", exceptionObject.stack, exceptionObject.message);
            outputWindow = window.open();
            outputWindow.document.write(renderedHtml);
            outputWindow.document.close();
            outputWindow.focus();
            outputWindow.print();
            outputWindow.close();
        }
    } else {
        // Employ a fresh browser window for the printing task
        outputWindow = window.open();
        outputWindow.document.write(renderedHtml);
        outputWindow.document.close();
        outputWindow.focus();
        outputWindow.print();
        outputWindow.close();
    }
    return this;
};

})(jQuery);