jQuery(document).ready(function() {

    // Core Data Structure: Represents a single visual asset.
    // This model manages asset properties and defines its interaction with the API.
    var ImageAsset = Backbone.Model.extend({
        // The base URL for fetching individual asset details.
        apiEndpoint: "/interface/data/fetchVisual",

        // Default attributes for new asset instances.
        defaults: {
            assetName: 'placeholder-image.jpg', // Default filename
            assetIdentifier: 'XXXXX',           // Unique reference code (not strictly used in view, but good for data integrity)
            assetBlurb: 'No description available for this visual content.' // Descriptive text
        },

        // Custom initialization logic for the model.
        initialize: function() {
            // Optional: Perform any setup here when a new ImageAsset is created.
        },

        // Client-side validation for model attributes.
        validate: function(attributes) {
            if (!attributes.assetName || attributes.assetName.trim() === '') {
                return "Asset name cannot be empty.";
            }
            // A simple length check for the description.
            if (attributes.assetBlurb && attributes.assetBlurb.length < 5) {
                return "Asset description is too short.";
            }
        },

        // Helper method to retrieve a specific attribute.
        retrieve: function(key) {
            return this.get(key);
        }
    });

    // Component Renderer: Manages the visual presentation of a single image asset.
    // This view is responsible for taking an ImageAsset model and rendering its details to the DOM.
    var AssetDisplay = Backbone.View.extend({
        // The HTML tag for the view's primary DOM element.
        containerTag: "article",
        // A unique ID for the view's primary DOM element.
        elementId: "visual-asset-display",

        // Method to construct and update the view's content.
        composeContent: function() {
            // Ensure a model is associated before attempting to render.
            if (!this.model instanceof ImageAsset) {
                console.warn("AssetDisplay attempted to render without a valid model.");
                this.$el.html("<p class='error-message'>Content not available. A valid asset model is missing.</p>");
                return this.$el;
            }

            // Define the base path for visual media.
            const mediaBasePath = "static/visuals/collection/";

            // Helper function to safely format description text.
            const formatDescription = (text) => {
                if (!text || text.trim() === '') {
                    return 'No specific details provided.';
                }
                // Capitalize the first letter of the description.
                return text.charAt(0).toUpperCase() + text.slice(1);
            };

            // Build the HTML string using a template literal for better readability.
            let markupString = `
                <figure class="asset-figure">
                    <img class="asset-image" src="${mediaBasePath}${this.model.retrieve("assetName")}" alt="${this.model.retrieve("assetBlurb")}">
                    <figcaption class="asset-caption">
                        <h3 class="asset-title">${formatDescription(this.model.retrieve("assetBlurb"))}</h3>
                        <p class="asset-id-label">Reference ID: ${this.model.retrieve("assetIdentifier")}</p>
                    </figcaption>
                </figure>
            `;

            // Clear existing content and append the new markup.
            this.$el.empty().append(markupString);
            return this.$el;
        }
    });

    // Component Renderer: Manages the display of the application's landing page.
    // This view presents introductory information to the user.
    var LandingPage = Backbone.View.extend({
        // The HTML tag for the view's primary DOM element.
        containerTag: "section",
        // A unique ID for the view's primary DOM element.
        elementId: "application-intro-zone",

        // Method to generate the content for the landing page.
        composeContent: function() {
            // A simple check for the presence of the view's element.
            if (!this.$el.length) {
                console.error("LandingPage view's DOM element not found.");
                // Return an empty string or a fallback if the element isn't there.
                return "<div>Application setup error: Landing page container missing.</div>";
            }

            // Construct the introductory HTML.
            let markupString = `
                <div class="intro-banner">
                    <h2>Welcome to the Visual Archive!</h2>
                    <p>This platform offers a curated collection of digital visuals for your browsing pleasure.</p>
                    <p>Explore, discover, and enjoy high-quality images from various categories.</p>
                    <p class="call-to-action">Use the URL hash to navigate, e.g., #item/123</p>
                </div>
            `;
            // Set the generated HTML as the content of the view's element.
            return this.$el.html(markupString);
        }
    });

    // Application Navigation System: Manages URL routing and corresponding view transitions.
    // This router orchestrates which content is displayed based on the browser's URL hash.
    var AppNavigator = new (Backbone.Router.extend({
        // Define the application's URL routes and their associated handler methods.
        routes: {
            "": "showHome",               // Default route, shows the landing page.
            "item/:refid": "displayItem"  // Route for viewing a specific asset by its reference ID.
        },

        // Preparatory method called when the router is initialized.
        prepareRouter: function() {
            // For debugging: console.log("AppNavigator is ready for action.");
        },

        // Handler for the default route (""). Displays the landing page.
        showHome: function() {
            // For debugging: console.log("Navigating to the main landing page.");
            // Instantiate the landing page view.
            this.homePagePresenter = new LandingPage({});
            // Render the landing page content into the designated output area.
            jQuery("#app-output-area").html(this.homePagePresenter.composeContent());
        },

        // Handler for the "item/:refid" route. Displays a specific image asset.
        displayItem: function(incomingRefId) {
            // For debugging: console.log(`Attempting to display item with ID: ${incomingRefId}`);

            // Validate the incoming reference ID.
            const parsedRefId = parseInt(incomingRefId, 10);
            if (isNaN(parsedRefId) || parsedRefId <= 0) {
                console.error(`Invalid asset reference ID provided: ${incomingRefId}`);
                const errorOutputArea = jQuery("#app-output-area");
                errorOutputArea.html("<div class='alert alert-danger'>Error: The requested asset ID is invalid or cannot be processed.</div>");
                return; // Stop execution if ID is invalid.
            }

            // Create a new ImageAsset model instance using the provided ID.
            // We pass the ID as 'id' which Backbone uses for fetching.
            this.currentAsset = new ImageAsset({ id: parsedRefId, assetIdentifier: incomingRefId });

            // Instantiate the AssetDisplay view, linking it to the current asset model.
            this.assetPresenter = new AssetDisplay({ model: this.currentAsset });

            // Target the main content display area.
            const targetOutputElement = jQuery("#app-output-area");

            // Render a loading state immediately.
            targetOutputElement.html("<div class='loading-indicator'>Loading asset details...</div>");

            // Fetch the model data from the server.
            // This is crucial for dynamic content loading.
            this.currentAsset.fetch({
                success: (model, response) => {
                    console.log(`Asset '${model.get('assetName')}' (ID: ${model.id}) loaded successfully.`);
                    // After successful fetch, render the actual content.
                    targetOutputElement.html(this.assetPresenter.composeContent());
                },
                error: (model, response) => {
                    console.error(`Failed to load asset ${parsedRefId}:`, response);
                    // Display an error message if fetching fails.
                    targetOutputElement.html("<div class='alert alert-warning'>Warning: Could not retrieve asset details from the server.</div>");
                    // Optionally, render the view with a default/empty model if fetch fails.
                    // this.assetPresenter.model = new ImageAsset({id: parsedRefId, assetIdentifier: incomingRefId});
                    // targetOutputElement.html(this.assetPresenter.composeContent());
                }
            });
        },

        // Initiates Backbone's history to enable URL routing.
        initiateRouting: function() {
            Backbone.history.start({ pushState: false }); // Use hash-based routing for simplicity
            // console.log("Backbone routing started.");
        }
    }));

    // Once the DOM is fully loaded, start the application's routing mechanism.
    AppNavigator.initiateRouting();
});