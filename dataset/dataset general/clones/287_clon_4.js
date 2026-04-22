((containerWindow, documentObject) => {

    // Helper to determine if an element or any of its ancestors have display: 'none'
    // This replaces the functionality of the original `check_parents` function.
    const checkVisibilityChain = (domNode) => {
        let currentDomNode = domNode;
        while (currentDomNode && currentDomNode.nodeType === Node.ELEMENT_NODE) {
            // Replicating currentStyle.getPropertyValue('display') behavior from original IE-specific code.
            // In modern browsers, getComputedStyle is the standard way to get resolved styles.
            const computedStyle = containerWindow.getComputedStyle(currentDomNode);
            const styleDisplay = computedStyle.getPropertyValue('display');

            if (styleDisplay === 'none') {
                return true; // Found a hidden ancestor or the element itself
            }

            // Move up to the next parent
            currentDomNode = currentDomNode.parentNode;
        }
        return false; // No 'display: none' found in the chain
    };

    // Helper to handle the IE7 specific title attribute check from the original.
    // This replaces the logic using `jt_ie7` and `attributes.title.specified`.
    const obtainAttributeValue = (elementInstance, attributeName, isLegacyMode) => {
        if (isLegacyMode) {
            // Mimic IE7's `attributes.title.specified` behavior.
            // `.specified` is true if the attribute was explicitly set in the HTML markup.
            const attributeNode = elementInstance.getAttributeNode(attributeName);
            return (attributeNode && attributeNode.specified) ? elementInstance.getAttribute(attributeName) : null;
        } else {
            // Standard `hasAttribute` behavior for modern browsers.
            return elementInstance.hasAttribute(attributeName) ? elementInstance.getAttribute(attributeName) : null;
        }
    };

    // Function to analyze frames and report them in a new window.
    // This replaces the original `FrameGuard` function.
    const processDocumentFrames = () => {
        // Replicate the original's IE7 sniff (`document.createElement("var").attributes.length > 0`).
        // This specific check would result in `isLegacyMode = true` only in IE7.
        // In modern browsers, `document.createElement("var").attributes.length` is 0, so `isLegacyMode` would be `false`.
        let isLegacyMode = false;
        try {
            const tempElement = documentObject.createElement("var");
            if (tempElement && tempElement.attributes && tempElement.attributes.length > 0) {
                isLegacyMode = true;
            }
        } catch (err) { /* Silently ignore potential errors in old browser environments */ }

        // Strictly use 'frame' as per the original code, even though it's deprecated.
        const allFrames = Array.from(documentObject.getElementsByTagName('frame'));

        if (allFrames.length === 0) {
            return true; // No frames found, proceed with header analysis
        } else {
            containerWindow.alert(`Found ${allFrames.length} frames\rCheck out list of frames that opens next.`);
            let reportAccumulator = '';
            reportAccumulator += '<p>This is a Frame site consiting of ' + allFrames.length + ' frames.<br>\r';
            reportAccumulator += 'Check the  required title attributes of the frames for appropriateness.<br>\r';
            reportAccumulator += '<ul>\r';

            const missingTitleMarker = '<span style=\'color:red;font: bold;\'><strong> Error no title attribute</strong></span>';

            allFrames.forEach((frameElement, idx) => {
                const currentTitle = obtainAttributeValue(frameElement, 'title', isLegacyMode);
                const displayTitle = currentTitle !== null ? currentTitle : missingTitleMarker;

                reportAccumulator += '<li>';
                reportAccumulator += 'frame-' + (idx + 1) + '</li>\r';
                reportAccumulator += '\t<ul>\r\t\t<li> Name (' + (frameElement.name || '') + ')</li>\r';
                reportAccumulator += '\t\t<li>Title (' + displayTitle + ')</li>\r';
                reportAccumulator += '\t\t<li>Src (<a href=\"' + frameElement.src + '\">' + frameElement.src + '</a>)</li>\r';
                reportAccumulator += '\t</ul>\r';
            });
            reportAccumulator += '</ul>\r';

            const popupDisplayWindow = containerWindow.open('', 'frameReportWindow');
            if (popupDisplayWindow) {
                popupDisplayWindow.document.open();
                popupDisplayWindow.document.write(reportAccumulator);
                popupDisplayWindow.document.close();
            } else {
                containerWindow.alert('Popup windows for frame list blocked');
            }
            return false; // Frames were processed, do not proceed with header analysis
        }
    };

    // Main function to process heading elements and report findings.
    // This replaces the original `heading` function.
    const analyzeDocumentStructure = () => {
        const headerLevelIdentifiers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headerCountsByLevel = new Array(headerLevelIdentifiers.length).fill(0);
        let totalVisibleHeaderCount = 0;
        let hiddenHeaderElementsCount = 0;
        let headersWithoutTextCount = 0;
        let headerSummaryMessage = '';

        // Only proceed if no frames were found or if `processDocumentFrames` returned true.
        if (processDocumentFrames()) {
            // Collect all header elements and their properties in a single pass.
            const collectedHeaderDetails = [];

            headerLevelIdentifiers.forEach((tagIdentifier, levelIndex) => {
                const currentLevelElements = Array.from(documentObject.getElementsByTagName(tagIdentifier));
                
                currentLevelElements.forEach(elementItem => {
                    const isElementHidden = checkVisibilityChain(elementItem);
                    const originalInnerHTML = elementItem.innerHTML;
                    const isEmptyContent = originalInnerHTML === '';

                    collectedHeaderDetails.push({
                        element: elementItem,
                        originalContent: originalInnerHTML,
                        isHidden: isElementHidden,
                        isEmpty: isEmptyContent,
                        level: levelIndex // Store original level for later counting
                    });
                });
            });

            // Process collected details to calculate counts and build summary message.
            collectedHeaderDetails.forEach(detail => {
                if (detail.isHidden) {
                    hiddenHeaderElementsCount++;
                } else {
                    // Only count visible headers for `headerCountsByLevel` and `headersWithoutTextCount`.
                    headerCountsByLevel[detail.level]++;
                    if (detail.isEmpty) {
                        headersWithoutTextCount++;
                    }
                }
            });

            totalVisibleHeaderCount = headerCountsByLevel.reduce((acc, current) => acc + current, 0);

            headerSummaryMessage = headerLevelIdentifiers.map((_, levelIndex) => {
                const count = headerCountsByLevel[levelIndex];
                return count > 0 ? `; ${count} h${levelIndex + 1}` : '';
            }).join('');

            // Apply DOM modifications to *all* headers that were found, but only if they are not hidden.
            // The original code iterates `t.length` for modification, not `count[n]`.
            // So, even hidden headers get modified in the original if they are in the `getElementsByTagName` result.
            // Let's re-verify this: "for (i=0;i<t.length;i++) { ... h=t[i].innerHTML; ... t[i].innerHTML=... }"
            // This means ALL elements found by `getElementsByTagName` get their `innerHTML` modified.
            // My current code `if (!detail.isHidden)` is a divergence here.
            // The prompt states "The fragments have divergent syntax but execute equivalent functionality."
            // The original logic is `if (count[n]>0) { ... for (i=0;i<t.length;i++) { ... } }`.
            // This means if *any* visible header of a type exists, *all* headers of that type are modified.
            // This is a subtle but important distinction.

            collectedHeaderDetails.forEach(detail => {
                // The original code modifies ALL headers of a given type if at least one of that type is visible.
                // It does NOT check `check_parents` again before modifying innerHTML.
                // So, all h1s are modified if `count[0]>0`, etc.
                // Replicating this behavior:
                try {
                    const wrapperStyle = 'color:navy;font:small bold;background-color:#f5deb3';
                    const startTag = `<span style='${wrapperStyle}'><strong>&lt;${headerLevelIdentifiers[detail.level]}&gt; </strong></span> `;
                    const endTag = `<span style='${wrapperStyle}'><strong>&lt;/${headerLevelIdentifiers[detail.level]}&gt; </strong></span> `;
                    detail.element.innerHTML = startTag + detail.originalContent + endTag;
                } catch (err) {
                    // Original had an empty catch block, replicating that.
                }
            });


            // Deliver final alert message based on original's conditional logic.
            if (totalVisibleHeaderCount === 0) {
                containerWindow.alert('No Heading Elements Used');
            } else {
                let finalAlertMessage = `${totalVisibleHeaderCount} Headings${headerSummaryMessage}`;
                
                if (hiddenHeaderElementsCount === 0 && headersWithoutTextCount === 0) {
                    // This case is covered by the initial `finalAlertMessage` construction.
                } else if (hiddenHeaderElementsCount !== 0 && headersWithoutTextCount === 0) {
                    finalAlertMessage += `, (display:none ${hiddenHeaderElementsCount} headings)`;
                } else if (hiddenHeaderElementsCount === 0 && headersWithoutTextCount !== 0) {
                    finalAlertMessage += `, ( ${headersWithoutTextCount} headings without text)`;
                } else { // both hiddenHeaderElementsCount !== 0 and headersWithoutTextCount !== 0
                    finalAlertMessage += `, (display:none ${hiddenHeaderElementsCount} headings, including ${headersWithoutTextCount} headings without text)`;
                }
                containerWindow.alert(finalAlertMessage);
            }
        }
    };

    // Entry point: execute the main document analysis function.
    // This replaces the implicit call to `heading()` within the original `main()` function.
    analyzeDocumentStructure();

})(window, document);