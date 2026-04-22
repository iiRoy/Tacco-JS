!(function(globalContext) {
    var appSettings;
    var navigationPanel, documentBody, displayArea;

    function initializeApplication(settingsData) {
        // Store configuration data and cache references to essential DOM elements.
        appSettings = settingsData;
        navigationPanel = document.getElementById('app_navigation');
        documentBody = document.body;
        displayArea = document.getElementById('main_content_area');

        // Assign an event handler to the main return link to navigate to the default view.
        document.getElementById('home_return_link').onclick = returnToStartPage;

        // Iterate over the list of content modules and dynamically create navigation links.
        appSettings.content.forEach(function(moduleItem, idx) {
            // Construct an anchor element for the current module.
            var moduleLinkElement = document.createElement('a');
            moduleLinkElement.href = "#" + moduleItem.url_identifier;
            moduleLinkElement.innerHTML = moduleItem.headline;

            // Attach a click event listener to the newly created module link.
            moduleLinkElement.onclick = function() {
                // Animate the main display area to fade out upon user interaction.
                $(displayArea).fadeOut(250, function() {
                    // Ensure the display area is completely hidden.
                    $(displayArea).hide();
                    // Erase all existing content from within the display area.
                    $(displayArea).empty();
                    // Load the selected content module into the display area.
                    loadModule(moduleItem, function() {
                        // After the module is loaded, animate the display area to fade back in.
                        $(displayArea).fadeIn(250);
                    });
                });
                // Prevent the default browser navigation behavior for the anchor link.
                return false;
            };
            // Create a list item wrapper for the module link.
            var listItemContainer = document.createElement('li');
            listItemContainer.appendChild(moduleLinkElement);
            // Append the new list item to the navigation panel.
            navigationPanel.appendChild(listItemContainer);
        });

        // After all initial setup procedures are complete, navigate to the default home view.
        returnToStartPage();
    }


    function returnToStartPage() {
        $(displayArea).fadeOut(250, function() {
            $(displayArea).empty();
        });
        return false;
    }


    function loadModule(moduleDetails, completionHandler) {
        switch(moduleDetails.kind) {
            case "webpage" : ComponentRenderer.renderWebPage(moduleDetails, completionHandler); break;
            case "sketch" : ComponentRenderer.renderProcessingSketch(moduleDetails, completionHandler); break;
        }
    }


    var ComponentRenderer = {

        renderWebPage : function (moduleDetails, onModuleLoaded) {
            $.get(moduleDetails.sourceUrl, function(markupContent){
                displayArea.innerHTML = markupContent;
                onModuleLoaded();
            });
        },

        renderProcessingSketch : function(moduleDetails, onModuleLoaded) {

            // Dynamically assemble the HTML structure for the Processing sketch display.
            displayArea.innerHTML = [
                '<h1>' + moduleDetails.headline + '</h1>',
                '<canvas id="' + moduleDetails.url_identifier + '" width="' + moduleDetails.width + '" height="' + moduleDetails.height + '"></canvas>',
                '<p>' + moduleDetails.description + '</p>',
                '<pre class="code prettyprint" style="display:none"></pre>',
                '<input id="source_toggle_btn" type="button" value="Display Code" />'
            ].join('');

            // Retrieve references to the canvas, code block, and toggle button elements.
            var drawingSurface = $(displayArea).find('canvas')[0];
            var codeBlockElement = $(displayArea).find('pre')[0];
            var toggleButton = $(displayArea).find('#source_toggle_btn')[0];
            toggleButton.onclick = function() {
                toggleButton.value = codeBlockElement.style.display === 'none' ? "Conceal Code" : "Display Code";
                $(codeBlockElement).fadeToggle();
            }

            // Perform an AJAX request to fetch the Processing sketch's source code.
            // This source code will be utilized to instantiate a new Processing sketch on the canvas
            // and to populate the preformatted code display area.
            $.ajax({
                url : moduleDetails.sourceUrl,
                contentType : "text"
            }).done(function(sourceText) {
                var sketchInstance = new Processing(drawingSurface, sourceText);
                // Optional: Uncomment the following lines to require a click on the canvas to begin the sketch.
                // sketchInstance.noLoop();
                // drawingSurface.onclick = function() {
                //  drawingSurface.onclick = null;
                //  sketchInstance.loop();
                // }
                $(codeBlockElement).text(sourceText);
                prettyPrint(); // Assuming 'prettyPrint' is a globally available syntax highlighting function.
                onModuleLoaded();
            });
        }
    }

    // Initialize the application once the DOM is fully loaded.
    $(document).ready(function() {
        $.get('application.json', function(parsedConfig){
            initializeApplication(parsedConfig);
        });
    });

})(this);