(function(domLib) {

    // The central application context object.
    const applicationCore = {};
    // Making the application core globally accessible for convenience and debugging.
    window.applicationCore = applicationCore;

    // Extend the core object with Backbone's event capabilities,
    // allowing for cross-component communication.
    Object.assign(applicationCore, Backbone.Events);

    /**
     * Sets up the primary configuration for the application.
     * This function should be called once at application startup.
     * @param {object} appConfiguration - Configuration object containing initial settings.
     *                                   Expected properties: mode, url_scheme, query.
     */
    applicationCore.setupApplication = function(appConfiguration) {
        console.info('Application setup process initiated with provided configuration:', appConfiguration);

        // Validate configuration presence; use an empty object if none provided to avoid errors.
        if (!appConfiguration || typeof appConfiguration !== 'object') {
            console.warn('No valid application configuration object supplied. Proceeding with default settings.');
            appConfiguration = {};
        }

        // Determine the operational mode of the application. Defaults to 'view_routes'.
        const defaultOperatingMode = 'view_routes'; // Helper variable for default mode.
        applicationCore.currentOperatingMode = appConfiguration.mode || defaultOperatingMode;
        console.log(`Application operating in mode: '${applicationCore.currentOperatingMode}'`);

        // Store the URL scheme used for opening external links (e.g., in an IDE).
        applicationCore.externalLinkScheme = appConfiguration.url_scheme;
        if (!applicationCore.externalLinkScheme) {
            console.warn('External link scheme (url_scheme) is not defined in configuration.');
        }

        // Store any initial search query provided.
        applicationCore.initialSearchQuery = appConfiguration.query || '';
    };

    // --- Application Navigation Controller ---

    // This Backbone.Router manages the application's state by mapping URL fragments to actions.
    const MainAppRouter = Backbone.Router.extend({
        // Define the application's routing table.
        currentRoutes: { // Renamed 'routes' to 'currentRoutes'
            'view_routes/': 'showRoutePatterns', // Maps to the method for displaying URL patterns.
            'template_files/': 'showTemplateFiles' // Maps to the method for displaying template files.
        },

        /**
         * Navigates to and displays the list of URL routing patterns.
         * This function initializes the necessary collection and views for route patterns.
         */
        showRoutePatterns: function() {
            console.log('Router: Navigating to display URL routing patterns.');

            // Initialize the collection for route patterns.
            applicationCore.availableRoutePatterns = new RoutePatternCollection([]);
            const searchListContainer = domLib('#searchlist-container'); // Use specific container ID.

            // Initialize the view for displaying search results (list of patterns).
            applicationCore.activeResultList = new ResultListView({
                dataCollection: applicationCore.availableRoutePatterns, // Pass the pattern collection.
                elementContainer: searchListContainer // Specify the DOM element for this view.
            });

            // Initialize the panel for displaying detailed information about a selected route pattern.
            applicationCore.activeDisplayPanel = new RouteDetailsPanel({
                el: domLib(RouteDetailsPanel.prototype.panelElementId) // Explicitly pass the panel element.
            });
            applicationCore.activeDisplayPanel.setupPanel(); // Initialize the panel's internal components.

            // Fetch the route pattern data from the server.
            applicationCore.availableRoutePatterns.fetch({
                success: () => {
                    console.log('Route patterns fetched successfully. Rendering list.');
                    // The ResultListView is bound to 'reset' event, so renderDisplay will be called automatically.
                    // applicationCore.activeResultList.renderDisplay();
                },
                error: (collection, response) => {
                    console.error('Failed to fetch URL routing patterns:', response);
                    searchListContainer.html('<li class="error-message">Failed to load route patterns.</li>');
                }
            });
        },

        /**
         * Navigates to and displays the list of template files.
         * This function initializes the necessary collection and views for template files.
         * @param {string} [itemId] - An optional ID, not typically used for template lists.
         */
        showTemplateFiles: function(itemId) {
            console.log('Router: Navigating to display template files.');

            // Initialize the collection for template files.
            applicationCore.availableTemplateFiles = new TemplateFileCollection([]);
            const searchListContainer = domLib('#searchlist-container'); // Use specific container ID.

            // Initialize the view for displaying search results (list of templates).
            applicationCore.activeResultList = new ResultListView({
                dataCollection: applicationCore.availableTemplateFiles, // Pass the template collection.
                elementContainer: searchListContainer // Specify the DOM element for this view.
            });

            // Initialize the panel for displaying detailed information about a selected template.
            applicationCore.activeDisplayPanel = new TemplateDetailsPanel({
                el: domLib(TemplateDetailsPanel.prototype.panelElementId) // Explicitly pass the panel element.
            });
            applicationCore.activeDisplayPanel.setupPanel(); // Initialize the panel's internal components.

            // Fetch the template file data from the server.
            applicationCore.availableTemplateFiles.fetch({
                success: () => {
                    console.log('Template files fetched successfully. Rendering list.');
                    // The ResultListView is bound to 'reset' event, so renderDisplay will be called automatically.
                    // applicationCore.activeResultList.renderDisplay();
                },
                error: (collection, response) => {
                    console.error('Failed to fetch template file paths:', response);
                    searchListContainer.html('<li class="error-message">Failed to load template paths.</li>');
                }
            });
        }
    });

    // --- Data Models ---

    // Backbone Model representing a single URL routing pattern.
    const RoutePatternModel = Backbone.Model.extend({
        // No custom initialization logic needed for this model.

        /**
         * Generates a combined string from model attributes suitable for fuzzy searching.
         * @returns {string} A space-separated string of relevant pattern details.
         */
        retrieveSearchableText: function() {
            const normalizedPattern = this.get('normalized_pattern') || '';
            const viewModule = this.get('view_module') || '';
            const viewName = this.get('view_name') || '';
            return `${normalizedPattern} ${viewModule}.${viewName}`;
        },

        /**
         * Retrieves the primary text to be displayed for this pattern (e.g., in a list).
         * @returns {string} The annotated pattern string.
         */
        getDisplayTitle: function() {
            return this.get('annotated_pattern') || '[Untitled Pattern]';
        },

        /**
         * Retrieves secondary, descriptive text for this pattern.
         * @returns {string} The module path and view name, or an empty string if not available.
         */
        getSubtitleDetail: function() {
            const modulePathIdentifier = this.get('view_module') || '';
            const viewNameIdentifier = this.get('view_name') || '';
            return modulePathIdentifier && viewNameIdentifier ? `${modulePathIdentifier}.${viewNameIdentifier}` : '';
        }
    });

    // Backbone Collection for managing multiple RoutePatternModel instances.
    const RoutePatternCollection = Backbone.Collection.extend({
        model: RoutePatternModel,
        // Dynamically constructs the URL endpoint for fetching route patterns.
        // Can include an initial search query if available in applicationCore.
        url: function() {
            const baseApiEndpoint = 'routing-patterns/'; // Renamed from 'urlpatterns/'
            if (applicationCore.initialSearchQuery) {
                return `${baseApiEndpoint}?q=${encodeURIComponent(applicationCore.initialSearchQuery)}`;
            }
            return baseApiEndpoint;
        }
    });

    // Backbone Model representing detailed information about a backend view function.
    const BackendViewInfo = Backbone.Model.extend({
        // No custom initialization logic needed.

        /**
         * Constructs the root URL for fetching a specific backend view's detailed information.
         * This includes its file path, line number, and source code.
         * @returns {string} The API endpoint for the view.
         */
        urlRoot: function() {
            const viewBaseEndpoint = 'backend-views/'; // Renamed from 'views/'
            const moduleIdentifier = this.get('modulePath') || 'unknown-module';
            const viewIdentifier = this.get('viewName') || 'unknown-view';
            return `${viewBaseEndpoint}${moduleIdentifier}/${viewIdentifier}/`;
        }
    });

    // Backbone Model representing a single template file path.
    const TemplateFileModel = Backbone.Model.extend({
        // No custom initialization logic needed.

        /**
         * Generates a string from the template name suitable for fuzzy searching.
         * @returns {string} The template's name.
         */
        retrieveSearchableText: function() {
            return this.get('name') || '';
        },

        /**
         * Retrieves the primary display title for this template (its name).
         * @returns {string} The template's name.
         */
        getDisplayTitle: function() {
            return this.get('name') || '[Untitled Template]';
        },

        /**
         * Retrieves secondary, descriptive text for this template.
         * For templates, this is typically empty or could be a path.
         * @returns {string} An empty string.
         */
        getSubtitleDetail: function() {
            return ''; // Templates usually don't have secondary detail in the list.
        }
    });

    // Backbone Collection for managing multiple TemplateFileModel instances.
    const TemplateFileCollection = Backbone.Collection.extend({
        model: TemplateFileModel,
        url: '/_app_data/template-locations/' // Renamed from '/_alto/template-paths/'
    });

    // Backbone Model representing the actual content of a template file.
    const TemplateContentModel = Backbone.Model.extend({
        // No custom initialization logic needed.

        /**
         * Constructs the root URL for fetching a specific template's source content.
         * @returns {string} The API endpoint for the template content.
         */
        urlRoot: function() {
            const templateBaseEndpoint = '/_app_data/template-contents/'; // Renamed from '/_alto/templates/'
            const templateName = this.get('name') || 'default-template';
            return `${templateBaseEndpoint}${templateName}/`;
        }
    });

    // --- UI Views ---

    // Backbone View representing a single selectable item within a list of search results.
    const ListItemView = Backbone.View.extend({
        tagName: 'li', // Each item will be rendered as an <li> element.
        className: 'app-list-item', // Custom class for styling.

        // Map DOM events to view methods.
        itemEvents: { // Renamed 'events' to 'itemEvents'
            'click': 'handleSelectionClick'
        },

        /**
         * Renders the individual list item's HTML content and appends it to its parent.
         * @returns {ListItemView} The current view instance for method chaining.
         */
        renderItem: function() { // Renamed 'render' to 'renderItem'
            if (!this.model) {
                console.warn('ListItemView: Attempted to render without an associated model.');
                return this; // Guard clause.
            }

            const targetListElement = this.options.targetListElement; // The parent <ul> element.
            const primaryDisplay = this.model.getDisplayTitle();
            const secondaryDisplay = this.model.getSubtitleDetail();

            // Construct the HTML for the list item using template literals.
            this.$el.html(`
                <a href="#" class="item-link">
                    <span class="primary-info">${primaryDisplay}</span>
                    ${secondaryDisplay ? `<br><span class="secondary-info">${secondaryDisplay}</span>` : ''}
                </a>
            `);

            // Append the rendered list item to the specified parent container.
            domLib(targetListElement).append(this.$el);
            return this;
        },

        /**
         * Handles the click event on this list item.
         * Prevents default link behavior and triggers a global event.
         * @param {Event} event - The DOM click event object.
         */
        handleSelectionClick: function(event) {
            event.preventDefault(); // Stop the browser from navigating.
            console.log(`ListItemView: Item with ID '${this.model.id}' selected.`);
            // Notify the application that this specific item has been selected.
            applicationCore.trigger('itemSelected', this); // Renamed 'selectedRowChanged' event.
        }
    });

    // Backbone View managing the overall list of search results.
    const ResultListView = Backbone.View.extend({
        // 'el' is expected to be passed in options.elementContainer during instantiation.

        /**
         * Initializes the ResultListView, setting up internal state and event listeners.
         */
        initView: function() { // Renamed 'initialize' to 'initView'
            this.currentlyActiveItem = null; // Stores the currently highlighted ListItemView.
            this.renderedItems = []; // An array of all ListItemView instances currently displayed.

            // Bind the view's rendering method to the collection's 'reset' event.
            // Using an arrow function maintains the correct 'this' context, replacing `_.bindAll`.
            this.dataCollection.on('reset', () => this.renderDisplay(), this);

            // Listen for the global 'itemSelected' event to update the active item.
            applicationCore.on('itemSelected', this.handleListItemSelection, this);
        },

        /**
         * Renders or re-renders the entire list of results based on the current search query.
         * Clears existing items, filters the collection, and displays new items.
         * @returns {ResultListView} The current view instance.
         */
        renderDisplay: function() { // Renamed 'render' to 'renderDisplay'
            console.log('ResultListView: Initiating list rendering based on search criteria.');
            this.$el.empty(); // Clear all previously rendered list items.
            this.renderedItems = []; // Reset the array of rendered item views.
            this.currentlyActiveItem = null; // Reset active item on re-render.

            const filteredAndScoredResults = this.computeFilteredResults();
            const listContainerElement = this.$el;

            if (filteredAndScoredResults.length === 0) {
                listContainerElement.html('<li class="no-results-message">No matching items found. Try a different search.</li>');
                console.log('ResultListView: No results found for the current query.');
                return this;
            }

            // Iterate over the filtered results and create a ListItemView for each.
            filteredAndScoredResults.forEach((resultTuple) => {
                const modelInstance = resultTuple[1];
                const newListItem = new ListItemView({
                    targetListElement: listContainerElement,
                    model: modelInstance
                });
                this.renderedItems.push(newListItem);
                newListItem.renderItem();
            });

            // Automatically select the first item if none is active.
            if (this.renderedItems.length > 0 && !this.currentlyActiveItem) {
                console.log('ResultListView: Auto-selecting the first item in the list.');
                applicationCore.trigger('itemSelected', this.renderedItems[0]);
            }

            return this;
        },

        /**
         * Internal helper function to score a model against a search query using LiquidMetal.
         * Provides a fallback if LiquidMetal is not available.
         * @param {Backbone.Model} modelInstance - The model to be scored.
         * @param {string} queryText - The search string.
         * @returns {number} The score, or 0 if no match or library missing.
         */
        _scoreModelWithQuery: function(modelInstance, queryText) { // New helper function
            if (!modelInstance || !queryText) return 0;
            const textToSearch = modelInstance.retrieveSearchableText();

            if (typeof LiquidMetal !== 'undefined' && LiquidMetal.score) {
                return LiquidMetal.score(textToSearch, queryText);
            } else {
                console.warn('LiquidMetal library not found. Falling back to basic string inclusion for search.');
                return textToSearch.toLowerCase().includes(queryText.toLowerCase()) ? 1 : 0;
            }
        },

        /**
         * Filters the collection models based on the current search input value.
         * Scores each model and returns them sorted by score in descending order.
         * @returns {Array<Array<number, Backbone.Model>>} An array of [score, model] pairs.
         */
        computeFilteredResults: function() { // Renamed 'getSearchResults'
            const currentSearchQuery = domLib('#search-input').val(); // Get value from the search input.
            const scoredAndFiltered = [];
            let sequentialOrder = 0; // Used for consistent ordering when no search query.

            this.dataCollection.each((modelItem) => {
                if (currentSearchQuery) {
                    const score = this._scoreModelWithQuery(modelItem, currentSearchQuery);
                    if (score > 0) {
                        scoredAndFiltered.push([score, modelItem]);
                    }
                } else {
                    // If no query, assign negative sequential scores to maintain collection order.
                    scoredAndFiltered.push([-sequentialOrder, modelItem]);
                    sequentialOrder++;
                }
            });

            // Sort results by score in descending order.
            return scoredAndFiltered.sort((itemA, itemB) => itemB[0] - itemA[0]);
        },

        /**
         * Handles the event when a new list item is selected, updating UI and triggering model details.
         * @param {ListItemView} newlySelectedItemView - The ListItemView instance that was selected.
         */
        handleListItemSelection: function(newlySelectedItemView) { // Renamed 'selectedRowChanged'
            // Remove 'active' class from the previously selected item.
            if (this.currentlyActiveItem) {
                this.currentlyActiveItem.$el.removeClass('active');
            }

            // Add 'active' class to the newly selected item.
            newlySelectedItemView.$el.addClass('active');
            this.currentlyActiveItem = newlySelectedItemView; // Update the reference to the active item.

            console.log(`ResultListView: Triggering model details request for ID '${newlySelectedItemView.model.id}'.`);
            // Trigger a global event to request detailed display of the selected model.
            applicationCore.trigger('modelDetailsRequested', newlySelectedItemView.model); // Renamed 'selectedModelChanged'
        },

        /**
         * Navigates to and activates the next item in the rendered list.
         * Loops to the first item if currently at the end.
         */
        activateNextItem: function() { // Renamed 'selectNextRow'
            if (this.renderedItems.length === 0) {
                console.log('ResultListView: Cannot activate next item, list is empty.');
                return; // Guard clause.
            }

            let currentIndex = -1;
            if (this.currentlyActiveItem) {
                currentIndex = this.renderedItems.indexOf(this.currentlyActiveItem);
            }

            // Calculate the index of the next item, looping to the start if at the end.
            const nextIndex = (currentIndex < this.renderedItems.length - 1) ? currentIndex + 1 : 0;

            if (nextIndex !== -1) {
                console.log(`ResultListView: Activating next item at index ${nextIndex}.`);
                applicationCore.trigger('itemSelected', this.renderedItems[nextIndex]);
            }
        },

        /**
         * Navigates to and activates the previous item in the rendered list.
         * Loops to the last item if currently at the beginning.
         */
        activatePreviousItem: function() { // Renamed 'selectPreviousRow'
            if (this.renderedItems.length === 0) {
                console.log('ResultListView: Cannot activate previous item, list is empty.');
                return; // Guard clause.
            }

            let currentIndex = -1;
            if (this.currentlyActiveItem) {
                currentIndex = this.renderedItems.indexOf(this.currentlyActiveItem);
            }

            // Calculate the index of the previous item, looping to the end if at the start.
            const previousIndex = (currentIndex > 0) ? currentIndex - 1 : this.renderedItems.length - 1;

            if (previousIndex !== -1) {
                console.log(`ResultListView: Activating previous item at index ${previousIndex}.`);
                applicationCore.trigger('itemSelected', this.renderedItems[previousIndex]);
            }
        }
    });

    // Backbone View for displaying detailed information about a selected URL Route Pattern.
    const RouteDetailsPanel = Backbone.View.extend({
        panelElementId: '#details-panel', // The main DOM element ID for this panel.
        tagName: 'section', // Use a semantic HTML5 section tag.

        /**
         * Initializes the RouteDetailsPanel, setting up the CodeMirror editor.
         */
        setupPanel: function() { // Renamed 'initialize'
            this.model = null; // The model currently being displayed in the panel.

            // Bind the handler for when a model is selected for detail display.
            applicationCore.on('modelDetailsRequested', this.handleModelUpdate, this);

            // Initialize the CodeMirror editor.
            const codeMirrorTargetElement = domLib('#code-viewer-textarea')[0]; // Renamed 'viewcode'
            if (codeMirrorTargetElement && typeof CodeMirror !== 'undefined') {
                applicationCore.codeDisplayArea = CodeMirror.fromTextArea(codeMirrorTargetElement, { // Renamed 'alto.editor'
                    mode: "python", // Set editor mode for Python syntax highlighting.
                    theme: "elegant",
                    lineWrapping: true,
                    lineNumbers: true,
                    firstLineNumber: 1, // Default starting line number.
                    readOnly: true // Editor is read-only.
                });
            } else {
                console.error('RouteDetailsPanel: CodeMirror library or target textarea (#code-viewer-textarea) not found. Code display will be non-functional.');
                // Provide a mock editor to prevent errors if CodeMirror is missing.
                applicationCore.codeDisplayArea = {
                    setValue: (val) => console.log('Mock CodeMirror: Setting value:', val),
                    setOption: (opt, val) => console.log('Mock CodeMirror: Setting option:', opt, val)
                };
            }
        },

        /**
         * Renders the detailed information of the selected route pattern into the panel.
         * Fetches additional backend view details to populate the editor and file links.
         */
        updatePanelContent: function() { // Renamed 'render'
            if (!this.model) {
                this.$el.empty();
                this.$el.html('<p class="info-message">Please select a route pattern from the list to view its details here.</p>');
                if (applicationCore.codeDisplayArea) {
                    applicationCore.codeDisplayArea.setValue('');
                }
                return; // Guard clause: nothing to render if no model is selected.
            }
            console.log(`RouteDetailsPanel: Updating content for model ID '${this.model.id}'.`);

            const patternData = this.model.toJSON();
            const panelInfoArea = this.$('#panel-info-area'); // Renamed 'paneldetails'

            panelInfoArea.empty(); // Clear previous content in the info area.
            this.$('h2.panel-title').html(patternData.view_name || 'View Details'); // Update title.

            // Display module path and raw pattern.
            panelInfoArea.append(`<p class="module-path-id">Module: <code>${patternData.view_module || 'N/A'}</code></p>`);
            panelInfoArea.append(`<code class="regex-pattern-code">Pattern: ${patternData.raw_pattern || 'N/A'}</code>`);

            // Helper function to create a clickable file link (new fragment).
            const createSourceFileLink = (filePath, lineNumber = null) => {
                if (!filePath) return '<span class="no-file-info">File path unavailable.</span>';
                const baseLink = `${applicationCore.externalLinkScheme}://open?url=file://${filePath}`;
                const fullLink = lineNumber ? `${baseLink}&line=${lineNumber}` : baseLink;
                return `<a href="${fullLink}" class="source-file-link">${filePath}${lineNumber ? ` (line ${lineNumber})` : ''}</a>`;
            };

            // Fetch additional details about the backend view.
            const viewDetailModel = new BackendViewInfo({
                modulePath: patternData.view_module,
                viewName: patternData.view_name
            });

            viewDetailModel.fetch({
                success: (fetchedModel) => {
                    const viewAttributes = fetchedModel.toJSON();
                    const fileLocationDisplay = domLib('#file-location-display'); // Renamed 'filename'

                    fileLocationDisplay.html(createSourceFileLink(viewAttributes.file, viewAttributes.line_number));

                    // Update the CodeMirror editor with the fetched source code.
                    if (applicationCore.codeDisplayArea) {
                        applicationCore.codeDisplayArea.setValue(viewAttributes.source || '// Source code not available.');
                        applicationCore.codeDisplayArea.setOption('firstLineNumber', viewAttributes.line_number || 1);
                    }
                },
                error: (model, response) => {
                    console.error(`RouteDetailsPanel: Failed to fetch backend view details for '${patternData.view_name}':`, response);
                    domLib('#file-location-display').html('<span class="error-message">Error loading source file details.</span>');
                    if (applicationCore.codeDisplayArea) {
                        applicationCore.codeDisplayArea.setValue('// Error: Could not retrieve view source code.');
                    }
                }
            });
        },

        /**
         * Updates the panel's model and triggers a re-render of its content.
         * @param {Backbone.Model} newModel - The new model to display.
         */
        handleModelUpdate: function(newModel) { // Renamed 'selectedModelChanged'
            this.model = newModel;
            this.updatePanelContent();
        }
    });

    // Backbone View for displaying detailed content of a selected Template File.
    const TemplateDetailsPanel = Backbone.View.extend({
        panelElementId: '#details-panel', // The main DOM element ID for this panel.
        tagName: 'section', // Use a semantic HTML5 section tag.

        /**
         * Initializes the TemplateDetailsPanel, setting up the CodeMirror editor for HTML.
         */
        setupPanel: function() { // Renamed 'initialize'
            this.model = null; // The model currently being displayed.

            // Bind the handler for when a model is selected for detail display.
            applicationCore.on('modelDetailsRequested', this.handleModelUpdate, this);

            // Initialize the CodeMirror editor for HTML content.
            const codeMirrorTargetElement = domLib('#code-viewer-textarea')[0]; // Renamed 'viewcode'
            if (codeMirrorTargetElement && typeof CodeMirror !== 'undefined') {
                applicationCore.codeDisplayArea = CodeMirror.fromTextArea(codeMirrorTargetElement, { // Renamed 'alto.editor'
                    mode: "htmlmixed", // Set editor mode for HTML syntax highlighting.
                    theme: "elegant",
                    lineWrapping: true,
                    lineNumbers: true,
                    readOnly: true // Editor is read-only.
                });
            } else {
                console.error('TemplateDetailsPanel: CodeMirror library or target textarea (#code-viewer-textarea) not found. Code display will be non-functional.');
                // Provide a mock editor to prevent errors if CodeMirror is missing.
                applicationCore.codeDisplayArea = {
                    setValue: (val) => console.log('Mock CodeMirror: Setting value:', val),
                    setOption: (opt, val) => console.log('Mock CodeMirror: Setting option:', opt, val)
                };
            }
        },

        /**
         * Renders the detailed content of the selected template file into the panel.
         * Fetches the template's source code and displays parent templates.
         */
        updatePanelContent: function() { // Renamed 'render'
            if (!this.model) {
                this.$el.empty();
                this.$el.html('<p class="info-message">Please select a template file from the list to view its content here.</p>');
                if (applicationCore.codeDisplayArea) {
                    applicationCore.codeDisplayArea.setValue('');
                }
                return; // Guard clause: nothing to render if no model is selected.
            }
            console.log(`TemplateDetailsPanel: Updating content for model ID '${this.model.id}'.`);

            const currentTemplateName = this.model.get('name');
            this.$('h2.panel-title').html(currentTemplateName || 'Template Content'); // Update title.

            const panelInfoArea = this.$('#panel-info-area'); // Renamed 'paneldetails'
            panelInfoArea.empty(); // Clear previous content.

            // Helper function to create a clickable file link (re-used from RouteDetailsPanel, or could be global).
            const createSourceFileLink = (filePath, linkText = filePath) => {
                if (!filePath) return '<span class="no-file-info">File path unavailable.</span>';
                const url = `${applicationCore.externalLinkScheme}://open?url=file://${filePath}`;
                return `<a href="${url}" class="source-file-link">${linkText}</a>`;
            };

            // Fetch the actual content of the template.
            const templateContentModel = new TemplateContentModel({
                name: currentTemplateName
            });

            templateContentModel.fetch({
                success: (fetchedModel) => {
                    const contentDetails = fetchedModel.toJSON();
                    const fileLocationDisplay = domLib('#file-location-display'); // Renamed 'filename'

                    fileLocationDisplay.html(createSourceFileLink(contentDetails.file));

                    // Update the CodeMirror editor with the fetched template source.
                    if (applicationCore.codeDisplayArea) {
                        applicationCore.codeDisplayArea.setValue(contentDetails.source || '// Template source not available.');
                        applicationCore.codeDisplayArea.setOption('firstLineNumber', 1); // Templates typically start at line 1.
                    }

                    // Display any parent templates (templates that this one extends/includes).
                    if (contentDetails.parents && contentDetails.parents.length > 0) {
                        const parentTemplatesList = domLib('<ul class="parent-templates-list"></ul>'); // Added class.
                        panelInfoArea.append('<h3>Included/Extended Templates:</h3>'); // New fragment/title.
                        panelInfoArea.append(parentTemplatesList);
                        contentDetails.parents.forEach((parent) => { // Using forEach instead of _.each.
                            parentTemplatesList.append(`<li>${createSourceFileLink(parent.file, parent.name)}</li>`);
                        });
                    }
                },
                error: (model, response) => {
                    console.error(`TemplateDetailsPanel: Failed to fetch template content for '${currentTemplateName}':`, response);
                    domLib('#file-location-display').html('<span class="error-message">Error loading template file details.</span>');
                    if (applicationCore.codeDisplayArea) {
                        applicationCore.codeDisplayArea.setValue('// Error: Could not retrieve template source code.');
                    }
                }
            });
        },

        /**
         * Updates the panel's model and triggers a re-render of its content.
         * @param {Backbone.Model} newModel - The new model to display.
         */
        handleModelUpdate: function(newModel) { // Renamed 'selectedModelChanged'
            this.model = newModel;
            this.updatePanelContent();
        }
    });

    // --- Application Initialization on DOM Ready ---

    // Execute this block of code once the entire DOM is loaded and parsed.
    domLib(document).ready(function() {
        console.log('DOM is ready. Starting application initialization sequence.');

        const baseRouterPath = '/_app_root/'; // Define the base URL for Backbone router.
        const appRouterInstance = new MainAppRouter(); // Instantiate the main application router.

        // Start Backbone's history management, enabling HTML5 pushState for cleaner URLs.
        Backbone.history.start({
            pushState: true,
            root: baseRouterPath
        });

        // Navigate to the initial route based on the application's configured operating mode.
        // The 'trigger: true' option ensures that the corresponding router method is called.
        appRouterInstance.navigate(`${applicationCore.currentOperatingMode}/`, {
            trigger: true
        });

        const searchInputField = domLib('#search-input'); // Reference to the search input field.
        searchInputField.focus(); // Set initial focus on the search input for immediate typing.

        // Global keyboard event listener on the document body for application-wide shortcuts.
        domLib('body').on('keyup', function(keyboardEvent) {
            // Ensure the active result list is available before processing keyboard events.
            if (!applicationCore.activeResultList) {
                console.warn('Keyboard handler: Active result list not yet initialized. Skipping navigation actions.');
                return;
            }

            switch (keyboardEvent.keyCode) {
                case 27: // Escape key
                    searchInputField.val(''); // Clear the search input.
                    searchInputField.focus(); // Re-focus on the search input.
                    applicationCore.activeResultList.renderDisplay(); // Re-render the list to show all items.
                    break;
                case 38: // Up arrow key
                    keyboardEvent.preventDefault(); // Prevent default browser scroll behavior.
                    applicationCore.activeResultList.activatePreviousItem(); // Move selection up.
                    break;
                case 40: // Down arrow key
                    keyboardEvent.preventDefault(); // Prevent default browser scroll behavior.
                    applicationCore.activeResultList.activateNextItem(); // Move selection down.
                    break;
                default:
                    // For any other key press, if the search input is focused,
                    // re-render the list to update search results dynamically.
                    if (document.activeElement === searchInputField[0]) {
                        // A debounce function could be added here for performance on rapid typing.
                        applicationCore.activeResultList.renderDisplay();
                    }
                    break;
            }
        });

        // Add an 'input' event listener to the search field for real-time filtering as the user types.
        searchInputField.on('input', function() {
            if (applicationCore.activeResultList) {
                applicationCore.activeResultList.renderDisplay();
            }
        });

        console.log('Application startup complete.');
    });

})(jQuery); // Pass jQuery as `domLib` into the IIFE for local scoping.