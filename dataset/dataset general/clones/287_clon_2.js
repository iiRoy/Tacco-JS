// Core logic adapted from a utility initially crafted by Stephen Faulkner in 2003-2004.
// DocumentHeaderAnalyzer.js

function initiateProcessing()
{
    // Utility for verifying element visibility within its ancestral chain.
    // This part ensures that elements with 'display: none' in their parent hierarchy are not counted.
    function verifyAncestorsVisibility(currentElement)
    {
        var isDisplayHidden = false; // Flag to indicate if 'display: none' is found.
        var currentParent = currentElement; // Start checking from the given element.

        // Loop through parents until no more parents or a 'display: none' is found.
        while (currentParent)
        {
            // Check if 'currentParent' is a valid object to prevent errors when traversing too far.
            if (currentParent != '[object]')
            {
                // Retrieve the computed style for 'display' using an IE-specific method.
                var displayValue = currentParent.currentStyle.getPropertyValue('display');
                // If 'display' is 'none', then the element is hidden.
                if (displayValue == 'none')
                {
                    currentParent = false; // Terminate the loop.
                    isDisplayHidden = true; // Mark as hidden.
                }
                else
                {
                    currentParent = currentParent.parentNode; // Move up to the next parent.
                    // Stop if we reach the document object itself.
                    if ((currentParent == '[object Document]') || (currentParent == '[object HTMLDocument]'))
                    {
                        currentParent = false; // Terminate loop.
                        isDisplayHidden = false; // Not hidden by document.
                    }
                }
            }
            else // Fallback for specific DOM structures, e.g., older IE or non-standard nodes.
            {
                // If a style property exists, it's likely an element.
                if (currentParent.style)
                {
                    // Check inline style for 'display: none'.
                    if (currentParent.style.getAttribute('display') == 'none')
                    {
                        currentParent = false; // Terminate loop.
                        isDisplayHidden = true; // Mark as hidden.
                    }
                    currentParent = currentParent.parentNode; // Continue up.
                }
                else // No style property, likely the root or an invalid node.
                {
                    currentParent = false; // Terminate loop.
                    isDisplayHidden = false; // Not hidden by this path.
                }
            }
        }
        return isDisplayHidden; // Return the visibility status.
    }

    // Function to analyze the presence and attributes of HTML frames.
    function inspectFrameStructure()
    {
        // Create a dummy element to check for IE7 attribute behavior.
        var tempHtmlObject = document.createElement("var");
        var isLegacyIE = false;
        // If attributes collection has length, it implies older IE behavior.
        if (tempHtmlObject.attributes.length > 0)
        {
            isLegacyIE = true;
        }

        var titleAttributeIssue = "<span style=\'color:red;font: bold;\'><strong> Missing title attribute!</strong></span>";
        var frameTagIdentifier = 'frame';
        var foundFrames = document.getElementsByTagName(frameTagIdentifier);

        // If no frames are present, proceed with heading analysis.
        if (foundFrames.length == 0)
        {
            return true;
        }
        else
        {
            alert('Detected ' + foundFrames.length + ' frames.\nReview the list of frames that will open shortly.');
            var reportString = '';
            reportString += '<p>This website comprises ' + foundFrames.length + ' frames.<br>\n';
            reportString += 'Please verify the essential title attributes for each frame.<br>\n';
            reportString += '<ul>\n';

            // Iterate through each detected frame.
            for (var frameIndex = 0; frameIndex < foundFrames.length; frameIndex++)
            {
                var frameTitleContent = '';
                // Check if title attribute is specified (IE7) or exists (modern browsers).
                if ((isLegacyIE && foundFrames[frameIndex].attributes.title.specified) || (!isLegacyIE && foundFrames[frameIndex].hasAttribute('title')))
                {
                    frameTitleContent = foundFrames[frameIndex].title;
                }
                else
                {
                    frameTitleContent = titleAttributeIssue;
                }
                reportString += '<li>';
                reportString += frameTagIdentifier + '-' + (frameIndex + 1) + '</li>\n';
                reportString += '\t<ul>\n\t\t<li> Name (' + foundFrames[frameIndex].name + ')</li>\n';
                reportString += '\t\t<li>Title (' + frameTitleContent + ')</li>\n';
                reportString += '\t\t<li>Source (<a href=\"' + foundFrames[frameIndex].src + '\">' + foundFrames[frameIndex].src + '</a>)</li>\n';
                reportString += '\t</ul>\n';
            }
            reportString += '</ul>\n';

            // Open a new popup window to display the frame report.
            var reportWindow = window.open('', 'frameReport');
            if (reportWindow != null)
            {
                reportWindow.document.open();
                reportWindow.document.write(reportString);
                reportWindow.document.close();
            }
            else
            {
                alert('Popup window for frame details was blocked.');
            }

            return false; // Frames detected, main heading analysis should not proceed directly.
        }
    }

    // Primary function to analyze and highlight document headings.
    function processDocumentHeadings()
    {
        var totalVisibleHeadings = 0; // Cumulative count of visible headings.
        var headingLevelTags = ['h1','h2','h3','h4','h5','h6']; // Array of heading tag names.
        var levelCountArray = [0,0,0,0,0,0]; // Counts for each heading level.
        var summaryMessage = ''; // String to build the final summary.

        var hiddenHeadingCount = 0; // Counter for headings hidden via 'display:none'.
        var emptyTextHeadingCount = 0; // Counter for headings with no textual content.

        // Only proceed if no frames are detected or if frame analysis allows (returns true).
        if (inspectFrameStructure())
        {
            // Iterate through each heading level (h1 to h6).
            for (var levelIterator = 0; levelIterator < headingLevelTags.length; levelIterator++)
            {
                var currentLevelHeadings = document.getElementsByTagName(headingLevelTags[levelIterator]);
                levelCountArray[levelIterator] = currentLevelHeadings.length;

                // Check each heading for 'display:none' in its parent chain.
                for (var headingIterator = 0; headingIterator < currentLevelHeadings.length; headingIterator++)
                {
                    if (verifyAncestorsVisibility(currentLevelHeadings[headingIterator]))
                    {
                        hiddenHeadingCount++; // Increment count of hidden headings.
                        if (levelCountArray[levelIterator] != 0)
                        {
                            levelCountArray[levelIterator]--; // Decrement the count for this level.
                        }
                    }
                }
                totalVisibleHeadings = totalVisibleHeadings + levelCountArray[levelIterator]; // Sum up visible headings.

                // If headings of this level are found, add to the summary message.
                if (levelCountArray[levelIterator] > 0)
                {
                    summaryMessage = summaryMessage + '; ' + levelCountArray[levelIterator] + ' ' + headingLevelTags[levelIterator];
                    // Iterate again to modify the inner HTML of each visible heading.
                    for (var headingIterator = 0; headingIterator < currentLevelHeadings.length; headingIterator++)
                    {
                        var originalHeadingContent;
                        originalHeadingContent = currentLevelHeadings[headingIterator].innerHTML;
                        try
                        {
                            currentLevelHeadings[headingIterator].innerHTML = '<span style=\'color:darkblue;font:small bold;background-color:#ffe4c4\'><strong>&lt; ' + headingLevelTags[levelIterator] + '&gt; </strong></span> ' + originalHeadingContent + '<span style=\'color:darkblue;font:small bold;background-color:#ffe4c4\'><strong>&lt;/' + headingLevelTags[levelIterator] + '&gt; </strong></span> ';
                        }
                        catch (exceptionObject)
                        {
                            // Error handling for cases where innerHTML modification fails.
                            // console.error("Failed to modify heading content:", exceptionObject);
                        }
                        // If the heading's content is empty, increment the counter.
                        if (originalHeadingContent == '')
                        {
                            emptyTextHeadingCount++;
                        }
                    }
                }
            }

            // Display final alerts based on the analysis.
            if (totalVisibleHeadings == 0)
            {
                alert('No Heading Elements Found in the Document.');
            }
            else
            {
                if ((hiddenHeadingCount == 0) && (emptyTextHeadingCount == 0))
                {
                    alert(totalVisibleHeadings + ' Headings' + summaryMessage);
                }
                else if ((hiddenHeadingCount != 0) && (emptyTextHeadingCount == 0))
                {
                    alert(totalVisibleHeadings + ' Headings' + summaryMessage + ", (hidden by display:none: " + hiddenHeadingCount + " headings)");
                }
                else if ((hiddenHeadingCount == 0) && (emptyTextHeadingCount != 0))
                {
                    alert(totalVisibleHeadings + ' Headings' + summaryMessage + ", (" + emptyTextHeadingCount + " headings without text content)");
                }
                else
                {
                    alert(totalVisibleHeadings + ' Headings' + summaryMessage + ", (hidden by display:none: " + hiddenHeadingCount + " headings, including " + emptyTextHeadingCount + " headings lacking text)");
                }
            }
        }
    }

    processDocumentHeadings(); // Initiate the main heading analysis.

}

initiateProcessing(); // Execute the primary function upon script load.