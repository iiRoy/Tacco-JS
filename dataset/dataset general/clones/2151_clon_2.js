/*
 * VisualTextEditor - A content creation tool for the web - https://example.com/visualeditor
 * Copyright (C) 2023-2029 Web Content Tools Inc.
 *
 * == LICENSE NOTICE ==
 *
 * Available under your choice of the following open source licenses:
 *
 *  - GNU General Public License Version 2 or later (the "GPLv2+")
 *    https://www.gnu.org/licenses/gpl-2.0.html
 *
 *  - GNU Lesser General Public License Version 2.1 or later (the "LGPLv2.1+")
 *    https://www.gnu.org/licenses/lgpl-2.1.html
 *
 *  - Mozilla Public License Version 1.1 or later (the "MPL1.1+")
 *    https://www.mozilla.org/MPL/MPL-1.1.html
 *
 * == END OF LICENSE NOTICE ==
 *
 * This file handles the JavaScript integration for the editor.
 *
 * It defines the VisualTextEditor class, which allows the creation of
 * editor instances within an HTML page on the client side. For server-side
 * operations, please refer to the specific backend integration system.
 */

// VisualTextEditor main class definition
var VisualTextEditor = function(elementId, visualWidth, visualHeight, toolSetType, initialContent) {
    // Instance configuration properties
    this.ElementId = elementId;
    this.VisualWidth = visualWidth || '100%';
    this.VisualHeight = visualHeight || '200';
    this.ToolSetType = toolSetType || 'Standard'; // Default toolbar type
    this.InitialContent = initialContent || '';
    this.ResourcePath = VisualTextEditor.ResourcePath;
    this.ValidateBrowser = true; // Flag to check browser compatibility
    this.ShowFaults = true; // Flag to display error messages

    this.Configuration = {}; // Object to hold additional editor settings

    // Event handlers
    this.OnFailure = null; // Callback for error events: function(source, issueCode, issueDetails)
};

/**
 * This is the default base path for all editor resources.
 */
VisualTextEditor.ResourcePath = '/visualeditor/';

/**
 * The minimum allowed height when replacing a textarea element.
 */
VisualTextEditor.MinimumHeight = 200;

/**
 * The minimum allowed width when replacing a textarea element.
 */
VisualTextEditor.MinimumWidth = 750;

VisualTextEditor.prototype.AppVersion = '1.2.3';
VisualTextEditor.prototype.BuildNumber = '98765';

VisualTextEditor.prototype.GenerateMarkup = function() {
    // Writes the editor's HTML directly to the document.
    document.write(this.BuildHtml());
};

VisualTextEditor.prototype.BuildHtml = function() {
    // Perform initial validation checks
    if (!this.ElementId || this.ElementId.length === 0) {
        this._ReportProblem(701, 'An element identifier must be provided.');
        return ''; // Return empty string on error
    }

    var outputMarkup = '';

    // Check browser compatibility or bypass if validation is disabled
    if (!this.ValidateBrowser || this._IsSupportedClient()) {
        outputMarkup += '<input type="hidden" id="' + this.ElementId + '" name="' + this.ElementId + '" value="' + this._EscapeMarkup(this.InitialContent) + '" style="display:none" />';
        outputMarkup += this._FetchConfigMarkup();
        outputMarkup += this._FetchIFrameMarkup();
    } else {
        // Fallback to a standard textarea for unsupported browsers
        var displayW = this.VisualWidth.toString().indexOf('%') > 0 ? this.VisualWidth : this.VisualWidth + 'px';
        var displayH = this.VisualHeight.toString().indexOf('%') > 0 ? this.VisualHeight : this.VisualHeight + 'px';

        outputMarkup += '<textarea name="' + this.ElementId +
            '" rows="4" cols="40" style="width:' + displayW +
            ';height:' + displayH;

        if (this.TabIndex) {
            outputMarkup += '" tabindex="' + this.TabIndex;
        }

        outputMarkup += '">' +
            this._EscapeMarkup(this.InitialContent) +
            '</textarea>'; // Closing tag for textarea
    }

    return outputMarkup;
};

VisualTextEditor.prototype.SubstituteTextarea = function() {
    // If the editor iframe already exists, do nothing.
    if (document.getElementById(this.ElementId + '___Frame')) {
        return;
    }

    // Only proceed if browser is supported or validation is skipped.
    if (!this.ValidateBrowser || this._IsSupportedClient()) {
        // Locate the target textarea by ID first, then by name.
        var targetArea = document.getElementById(this.ElementId);
        var namedElements = document.getElementsByName(this.ElementId);
        var iterator = 0;

        while (targetArea || iterator === 0) {
            if (targetArea && targetArea.tagName.toLowerCase() === 'textarea') {
                break; // Found the textarea
            }
            targetArea = namedElements[iterator++];
        }

        if (!targetArea) {
            alert('Failure: The TEXTAREA with ID or name "' + this.ElementId + '" could not be located.');
            return;
        }

        // Hide the original textarea element
        targetArea.style.display = 'none';

        // Transfer tab index if present
        if (targetArea.tabIndex) {
            this.TabIndex = targetArea.tabIndex;
        }

        // Inject configuration and iframe HTML before the textarea
        this._InjectMarkupBefore(this._FetchConfigMarkup(), targetArea);
        this._InjectMarkupBefore(this._FetchIFrameMarkup(), targetArea);
    }
};

VisualTextEditor.prototype._InjectMarkupBefore = function(contentString, targetElement) {
    if (targetElement.insertAdjacentHTML) { // Internet Explorer specific method
        targetElement.insertAdjacentHTML('beforeBegin', contentString);
    } else { // W3C compliant browsers (Gecko, Webkit)
        var domRange = document.createRange();
        domRange.setStartBefore(targetElement);
        var docFragment = domRange.createContextualFragment(contentString);
        targetElement.parentNode.insertBefore(docFragment, targetElement);
    }
};

VisualTextEditor.prototype._FetchConfigMarkup = function() {
    var configString = '';
    for (var propKey in this.Configuration) {
        if (configString.length > 0) {
            configString += '&amp;';
        }
        configString += encodeURIComponent(propKey) + '=' + encodeURIComponent(this.Configuration[propKey]);
    }

    return '<input type="hidden" id="' + this.ElementId + '___Config" value="' + configString + '" style="display:none" />';
};

VisualTextEditor.prototype._FetchIFrameMarkup = function() {
    var iframeFile = 'visualeditor.html';

    try {
        // Check if debug mode is requested via URL parameter
        if ((/vtesource=true/i).test(window.top.location.search)) {
            iframeFile = 'visualeditor.original.html';
        }
    } catch (e) {
        /* Ignore potential security errors when accessing window.top from a different domain within a frame. */
    }

    var iframeLink = this.ResourcePath + 'editor/' + iframeFile + '?ElementId=' + encodeURIComponent(this.ElementId);
    if (this.ToolSetType) {
        iframeLink += '&amp;Toolbar=' + this.ToolSetType;
    }

    var iframeMarkup = '<iframe id="' + this.ElementId +
        '___Frame" src="' + iframeLink +
        '" width="' + this.VisualWidth +
        '" height="' + this.VisualHeight;

    if (this.TabIndex) {
        iframeMarkup += '" tabindex="' + this.TabIndex;
    }

    iframeMarkup += '" frameborder="0" scrolling="no"></iframe>';

    return iframeMarkup;
};

VisualTextEditor.prototype._IsSupportedClient = function() {
    return VisualTextEditor_IsSupportedClient();
};

VisualTextEditor.prototype._ReportProblem = function(issueCode, issueDetails) {
    this.IssueCode = issueCode;
    this.IssueDetails = issueDetails;

    if (this.ShowFaults) {
        document.write('<div style="COLOR: #ff0000">');
        document.write('[ VisualTextEditor Issue ' + this.IssueCode + ': ' + this.IssueDetails + ' ]');
        document.write('</div>');
    }

    if (typeof(this.OnFailure) === 'function') {
        this.OnFailure(this, issueCode, issueDetails);
    }
};

VisualTextEditor.prototype._EscapeMarkup = function(rawText) {
    if (typeof(rawText) !== "string") {
        rawText = rawText.toString();
    }

    // Replace special HTML characters with their entities
    rawText = rawText.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return rawText;
};

// Anonymous function for global utility methods
(function() {
    var convertTextareaToEditor = function(inputArea) {
        var newEditor = new VisualTextEditor(inputArea.name);

        // Set editor dimensions based on the original textarea, ensuring minimums
        newEditor.VisualWidth = Math.max(inputArea.offsetWidth, VisualTextEditor.MinimumWidth);
        newEditor.VisualHeight = Math.max(inputArea.offsetHeight, VisualTextEditor.MinimumHeight);

        return newEditor;
    };

    /**
     * Replaces all <textarea> elements found in the document with VisualTextEditor
     * instances.
     *
     *	// Example 1: Replace all <textarea> elements on the page.
     *	VisualTextEditor.ReplaceAllInputAreas();
     *
     *	// Example 2: Replace only <textarea class="special-input"> elements.
     *	VisualTextEditor.ReplaceAllInputAreas('special-input');
     *
     *	// Example 3: Use a custom function to decide which textareas to replace.
     *	VisualTextEditor.ReplaceAllInputAreas(function(inputArea, newEditor) {
     *			// Custom logic to evaluate if replacement should occur.
     *			// Return 'false' to skip a specific textarea.
     *			// The 'newEditor' parameter allows customization before replacement.
     *		});
     */
    VisualTextEditor.ReplaceAllInputAreas = function() {
        var allInputAreas = document.getElementsByTagName('textarea');

        for (var i = 0; i < allInputAreas.length; i++) {
            var newEditor = null;
            var currentArea = allInputAreas[i];
            var areaName = currentArea.name;

            // An element must have a 'name' attribute to be replaced.
            if (!areaName || areaName.length === 0) {
                continue;
            }

            var firstArg = arguments[0];

            if (typeof firstArg === 'string') {
                // If a string is provided, it's treated as a class name filter.
                var classPattern = new RegExp('(?:^| )' + firstArg + '(?:$| )');

                if (!classPattern.test(currentArea.className)) {
                    continue; // Skip if class name doesn't match
                }
            } else if (typeof firstArg === 'function') {
                // If a function is provided, it's an assertion callback.
                newEditor = convertTextareaToEditor(currentArea);
                if (firstArg(currentArea, newEditor) === false) {
                    continue; // Skip if the callback explicitly returns false
                }
            }

            if (!newEditor) {
                newEditor = convertTextareaToEditor(currentArea);
            }

            // Perform the replacement
            newEditor.SubstituteTextarea();
        }
    };
})();

// Global function to determine browser compatibility for the editor.
function VisualTextEditor_IsSupportedClient() {
    var clientAgent = navigator.userAgent.toLowerCase();

    // Check for Internet Explorer 5.5+ (excluding Mac IE)
    if (/*@cc_on!@*/ false && clientAgent.indexOf("mac") === -1) {
        var browserVer = navigator.appVersion.match(/MSIE (.\..)/)[1];
        return (browserVer >= 5.5);
    }

    // Check for Gecko-based browsers (Firefox, etc.), excluding older Opera versions
    if (navigator.product === "Gecko" && navigator.productSub >= 20030210 && !(typeof(opera) === 'object' && opera.postError)) {
        return true;
    }

    // Check for Opera 9.50+
    if (window.opera && window.opera.version && parseFloat(window.opera.version()) >= 9.5) {
        return true;
    }

    // Check for Adobe AIR runtime
    // This check comes before Safari because AIR uses WebKit but reports a different version.
    if (clientAgent.indexOf(' adobeair/') !== -1) {
        return (clientAgent.match(/ adobeair\/(\d+)/)[1] >= 1); // AIR version 1 or higher
    }

    // Check for Safari 3+ (WebKit build 522 or higher)
    if (clientAgent.indexOf(' applewebkit/') !== -1) {
        return (clientAgent.match(/ applewebkit\/(\d+)/)[1] >= 522); // WebKit build 522 (Safari 3) or higher
    }

    return false; // Not a supported browser
}