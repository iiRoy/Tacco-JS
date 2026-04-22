/*
 * Document Structure Inspector - Enhanced Version
 * Originally conceived by S. Faulkner (2003-2004)
 * This script analyzes page structure, focusing on frames and heading elements.
 */

function initiateContentAudit() {

    /**
     * Determines if a given DOM element or any of its ancestors
     * has a computed 'display' style property set to 'none'.
     *
     * @param {HTMLElement} currentElement The element to start checking from.
     * @returns {boolean} True if 'display: none' is found in the element's hierarchy, false otherwise.
     */
    const detectHiddenAncestor = (currentElement) => {
        let traversalNode = currentElement;
        let isVisuallyHidden = false; // Flag to indicate if any part of the hierarchy is hidden

        // Input validation: ensure we have a valid DOM node to begin with.
        if (!traversalNode || !(traversalNode instanceof Element)) {
            // console.warn("Invalid element provided for visibility check.");
            return false; // Treat invalid input as not hidden
        }

        // Iterate upwards through the DOM tree until no parent is found or a hidden element is encountered.
        while (traversalNode) {
            // Check if the current node is a document object, which signifies the end of the element hierarchy.
            if (traversalNode === document || traversalNode === document.documentElement || traversalNode === document.body) {
                break; // Reached the document root, no 'display:none' found in element ancestors
            }

            // Attempt to get the computed style of the current node.
            // This is more robust than currentStyle and works cross-browser.
            const computedStyles = window.getComputedStyle(traversalNode);
            const elementDisplayValue = computedStyles.getPropertyValue('display');

            // If the display property is 'none', then the element or one of its parents is hidden.
            if (elementDisplayValue === 'none') {
                isVisuallyHidden = true;
                break; // Found a hidden element, no need to check further up.
            }

            // Move to the parent node for the next iteration.
            traversalNode = traversalNode.parentNode;
        }

        return isVisuallyHidden;
    };


    /**
     * Performs an audit of all frame elements on the page.
     * Reports on their presence, names, titles, and sources.
     *
     * @returns {boolean} True if no frames are found, false if frames are present and reported.
     */
    function examinePageFrames() {
        const frameElementTag = 'frame';
        const iframeElementTag = 'iframe'; // Also consider iframes for a more complete audit
        const missingTitleText = "<span style='color:red;font-weight:bold;'>[Title Attribute Missing]</span>";

        const allFrames = Array.from(document.getElementsByTagName(frameElementTag))
                            .concat(Array.from(document.getElementsByTagName(iframeElementTag)));

        if (allFrames.length === 0) {
            // console.log("No frame or iframe elements detected on this page.");
            return true; // No frames, proceed with other checks.
        }

        // Notify the user about detected frames.
        alert(`Detected ${allFrames.length} frame/iframe elements.\nReview the detailed report in the new window.`);

        let frameReportMarkup = '';
        frameReportMarkup += `<p>This document incorporates ${allFrames.length} embedded frames/iframes.<br>`;
        frameReportMarkup += `It is crucial to verify the appropriateness of their 'title' attributes for accessibility.<br>`;
        frameReportMarkup += `<ul>`;

        allFrames.forEach((currentFrame, index) => {
            let frameDescriptiveTitle = missingTitleText;
            // Modern and reliable way to check for attribute presence and value.
            if (currentFrame.hasAttribute('title') && currentFrame.title.trim() !== '') {
                frameDescriptiveTitle = currentFrame.title;
            }

            frameReportMarkup += `<li>`;
            frameReportMarkup += `${currentFrame.tagName.toLowerCase()}-${index + 1}`;
            frameReportMarkup += `<ul>`;
            frameReportMarkup += `<li>Name: ${currentFrame.name || '[Unnamed]'}</li>`;
            frameReportMarkup += `<li>Title: ${frameDescriptiveTitle}</li>`;
            frameReportMarkup += `<li>Source: <a href="${currentFrame.src}">${currentFrame.src}</a></li>`;
            frameReportMarkup += `</ul>`;
            frameReportMarkup += `</li>`;
        });

        frameReportMarkup += `</ul>`;

        // Attempt to open a new window for the report.
        const reportDisplayWindow = window.open('', 'frameReportWindow', 'width=700,height=500,scrollbars=yes');

        if (reportDisplayWindow) {
            reportDisplayWindow.document.open();
            reportDisplayWindow.document.write(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Frame Audit Report</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        ul { list-style-type: disc; margin-left: 20px; }
                        li ul { list-style-type: circle; margin-left: 20px; }
                        a { color: #007bff; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        strong { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Frame Audit Report</h1>
                    ${frameReportMarkup}
                </body>
                </html>`);
            reportDisplayWindow.document.close();
        } else {
            alert('A popup window for the frame report was blocked by your browser. Please allow popups for this site to view the report.');
        }

        return false; // Frames were found and reported.
    }


    /**
     * Analyzes all heading elements (h1-h6) on the page.
     * It counts them, checks for visibility and empty content,
     * then annotates them visually on the page and reports statistics.
     */
    function analyzeDocumentHeadings() {
        const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headingCountsByLevel = new Array(headingLevels.length).fill(0);
        let totalProcessedHeadings = 0;
        let hiddenHeadingCounter = 0;
        let emptyContentHeadingCounter = 0;
        let summaryDetails = '';

        // Only proceed if no frames are detected, or if the frame check allows it.
        // The original code called FrameGuard() and then proceeded.
        // We ensure a similar flow.
        if (!examinePageFrames()) {
            console.info("Frame analysis completed. Proceeding with heading analysis.");
        }

        headingLevels.forEach((tagIdentifier, levelIndex) => {
            const elementsAtCurrentLevel = Array.from(document.getElementsByTagName(tagIdentifier));
            let visibleHeadingsInLevel = 0;

            elementsAtCurrentLevel.forEach(currentHeadingElement => {
                // Check if the heading or any of its ancestors are hidden via display: none.
                if (detectHiddenAncestor(currentHeadingElement)) {
                    hiddenHeadingCounter++;
                    // Do not count this heading towards the visible count for its level.
                } else {
                    visibleHeadingsInLevel++;
                    // Check for empty content in visible headings.
                    if (currentHeadingElement.textContent.trim() === '') {
                        emptyContentHeadingCounter++;
                    }

                    // Visually annotate the heading on the page.
                    // Using a more robust method that preserves existing styling.
                    try {
                        const originalHeadingContent = currentHeadingElement.innerHTML;
                        const annotationSpan = `<span style='color:navy;font:small bold;background-color:#f5deb3;padding:2px 4px;border-radius:3px;'>
                                                &lt;${tagIdentifier}&gt;
                                                </span> `;
                        const closingAnnotationSpan = ` <span style='color:navy;font:small bold;background-color:#f5deb3;padding:2px 4px;border-radius:3px;'>
                                                    &lt;/${tagIdentifier}&gt;
                                                    </span>`;

                        // Prepend and append the annotation, preserving original content.
                        currentHeadingElement.innerHTML = annotationSpan + originalHeadingContent + closingAnnotationSpan;
                    } catch (errorDetails) {
                        console.error(`Failed to annotate heading <${tagIdentifier}>:`, errorDetails);
                    }
                }
            });

            // Update counts for this level.
            headingCountsByLevel[levelIndex] = visibleHeadingsInLevel;
            totalProcessedHeadings += visibleHeadingsInLevel;

            if (visibleHeadingsInLevel > 0) {
                summaryDetails += `; ${visibleHeadingsInLevel} ${tagIdentifier}`;
            }
        });

        // Final reporting based on gathered statistics.
        let finalReportMessage = '';
        if (totalProcessedHeadings === 0) {
            finalReportMessage = 'No visible heading elements (h1-h6) were found on this page.';
        } else {
            finalReportMessage = `${totalProcessedHeadings} visible heading(s) detected${summaryDetails}.`;

            if (hiddenHeadingCounter > 0) {
                finalReportMessage += ` (Note: ${hiddenHeadingCounter} heading(s) were found but visually hidden by 'display: none' styling.)`;
            }
            if (emptyContentHeadingCounter > 0) {
                finalReportMessage += ` (Additionally, ${emptyContentHeadingCounter} visible heading(s) contained no text content.)`;
            }
        }
        alert(finalReportMessage);
    }

    // Execute the main heading analysis function.
    analyzeDocumentHeadings();
}

// Ensure the script runs only after the entire DOM is ready.
// This prevents errors from trying to access elements that haven't been loaded yet.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initiateContentAudit);
} else {
    // If the DOM is already ready (e.g., script loaded asynchronously or at end of body)
    initiateContentAudit();
}