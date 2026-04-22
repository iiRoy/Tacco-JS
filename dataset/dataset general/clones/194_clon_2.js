(function(jq) {

    jq.fn.ContentComposer = function(config) {
        // Internal Utility Functions
        function storeCurrentRange() {
	        // Clear existing markers for any previously stored selection
	        if (preservedRange) {
	            rangy.removeMarkers(preservedRange);
	        }
	        preservedRange = rangy.saveSelection();
	        preservedActiveElement = document.activeElement;
	    }

	    function reapplyStoredRange() {
	        if (preservedRange) {
	            rangy.restoreSelection(preservedRange, true);
	            window.setTimeout(function() {
	                if (preservedActiveElement && typeof preservedActiveElement.focus !== "undefined") {
	                    preservedActiveElement.focus();
	                }
	            }, 1);
	        }
	    }

        // Establish Configuration Settings
        var settings = jq.extend({
                compose_area_id: "composer-wysiwyg-main",
                code_view_id: "composer-code-source",
                display_area_id: "composer-live-preview",
                tab_control_id: "composer-navigation-tabs",
                control_panel_id: "composer-toolbar-panel"
            }, config),

            // Global Variables for Component State
            aceInstance,
            preservedRange = null,
            preservedActiveElement = null,
            currentContainer = jq(this);

        // Configure fundamental document editing behaviors
        document.execCommand('insertBrOnReturn', false, true);
        document.execCommand('enableObjectResizing', false, true);

        // Construct the primary WYSIWYG editing surface
        var wysiwygPanel = jq("<div />").attr({
            id: settings.compose_area_id,
            contentEditable: "true",
            unselectable: "false"
        }).html(currentContainer.html());

        // Build the dedicated code source display
        var codePanel = jq("<div />").attr({
            id: settings.code_view_id
        });

        // Generate the live preview section
        var previewPanel = jq("<div />").attr({
            id: settings.display_area_id
        });

        // Integrate all components into the main container
        currentContainer.html(wysiwygPanel);
        if (settings.code_view_id) {
            codePanel.html(wysiwygPanel.html());
            currentContainer.append(codePanel);
        }
        if (settings.display_area_id) {
            currentContainer.append(previewPanel);
        }
        if (settings.tab_control_id) {
            jq('#' + settings.compose_area_id).addClass("tab-pane active");
            jq('#' + settings.code_view_id).addClass("tab-pane");
            jq('#' + settings.display_area_id).addClass("tab-pane");
            jq('#' + settings.tab_control_id).tab();
        }

        // Initialize the ACE code editor instance
        aceInstance = ace.edit(settings.code_view_id);
        aceInstance.getSession().setMode("ace/mode/html");

        // Attach Event Listeners for User Interactions
        jq('#' + settings.display_area_id).on("click", function(){
            jq('#' + settings.display_area_id).html(jq('#' + settings.compose_area_id).html());
        });

        aceInstance.getSession().on("change", function() {
            try {
                jq("#" + settings.compose_area_id).html(aceInstance.getSession().getValue());
            } catch (caughtError) {
                console.warn("Error synchronizing editor from code view:", caughtError);
            }
        });

        jq(".tab-button-code, .tab-button-preview").on("mousedown", function(eventObject) {
            jq("#" + settings.control_panel_id).fadeOut();
            jq("#main-composer-wrapper").css("bottom", "0");
        });

        jq(".tab-button-wysiwyg").on("mousedown", function() {
            jq("#" + settings.control_panel_id).fadeIn();
            jq("#main-composer-wrapper").css("bottom", "33px");
        });

        jq(document).on("input, blur", "#" + settings.compose_area_id, function() {
            try {
                aceInstance.getSession().setValue(jq("#" + settings.compose_area_id).html());
            } catch (caughtError) {
                console.error("Issue updating code view from editor:", caughtError);
            }
        });

        // Handlers for color selection tools
        jq('[data-editor-action="backgroundColor"],[data-editor-action="foregroundColor"]').on("mousedown", function() {
            storeCurrentRange();
            jq(this).find("input").trigger("click");
            return false;
            
        });

        jq('[data-editor-action="backgroundColor"] input').on("change", function() {
            // document.execCommand('backColor', false, jq(this).val()); // Direct application option
            wysiwygPanel.css("background-color", jq(this).val());
            // jq('[data-editor-action="backgroundColor"] i').css('color',jq(this).val()); // Example for icon color
        });

        jq('[data-editor-action="foregroundColor"] input').on("change", function() {
            reapplyStoredRange();
            document.execCommand('foreColor', false, jq(this).val());
        });


        // Command to make text bold
        jq('[data-editor-action="boldText"]').on("mousedown", function() {
            document.execCommand('bold', false, null);
            return false;
        });

        // Command to italicize selected text
        jq('[data-editor-action="italicizeText"]').on("mousedown", function() {
            document.execCommand('italic', false, null);
            return false;
        });

        // Command to underline selected text
        jq('[data-editor-action="underlineText"]').on("mousedown", function() {
            document.execCommand('underline', false, null);
            return false;
        });

        // Command to strike through selected text
        jq('[data-editor-action="strikeThroughText"]').on("mousedown", function() {
            document.execCommand('strikeThrough', false, null);
            return false;
        });

        // Align text to the left margin
        jq('[data-editor-action="alignLeft"]').on("mousedown", function() {
            document.execCommand('justifyLeft', false, null);
            return false;
        });

        // Center align text
        jq('[data-editor-action="alignCenter"]').on("mousedown", function() {
            document.execCommand('justifyCenter', false, null);
            return false;
        });

        // Align text to the right margin
        jq('[data-editor-action="alignRight"]').on("mousedown", function() {
            document.execCommand('justifyRight', false, null);
            return false;
        });

        // Justify text across the full line width
        jq('[data-editor-action="alignJustify"]').on("mousedown", function() {
            document.execCommand('justifyFull', false, null);
            return false;
        });

        // Insert an unordered list
        jq('[data-editor-action="insertUnorderedList"]').on("mousedown", function() {
            document.execCommand('insertUnorderedList', false, null);
            return false;
        });

        // Insert an ordered (numbered) list
        jq('[data-editor-action="insertOrderedList"]').on("mousedown", function() {
            document.execCommand('insertOrderedList', false, null);
            return false;
        });

        // Insert a new paragraph block
        jq('[data-editor-action="insertParagraph"]').on("mousedown", function() {
            document.execCommand('insertParagraph', false, null);
            return false;
        });

        // Increase indentation of the current block
        jq('[data-editor-action="indentBlock"]').on("mousedown", function() {
            document.execCommand('indent', false, null);
            return false;
        });

        // Decrease indentation of the current block
        jq('[data-editor-action="outdentBlock"]').on("mousedown", function() {
            document.execCommand('outdent', false, null);
            return false;
        });

        // Prompt user for a link URL and insert it
        jq('[data-editor-action="createHyperlink"]').on("mousedown", function() {
            var hyperlinkURL = prompt("Please provide the URL for the hyperlink:");

            if (hyperlinkURL && hyperlinkURL !== '' && hyperlinkURL !== 'http://') {
                document.execCommand('createlink', false, hyperlinkURL);
            }
            return false;
        });
    };
})(jQuery);