$( document ).ready(
    function    ( )
{
    /*
     * This section defines the Backbone Model for 'Pics'.
     * It specifies the RESTful endpoint and default attribute values.
     */
    var Pics  = Backbone.Model.extend(
        {
            urlRoot: "/assets/api/getPic",
            defaults: {
                fileName: 'No-file',     /* Default filename if not provided */
                fileNumber: 'No-number', /* Default file number */
                description: 'No-description' /* Default description text */
            }
        }
    ); /* End of Pics Model definition */


    // ----------------------------------------------------------------------------------------------------
    // View - Pic: This view is responsible for rendering a single picture.
    // ----------------------------------------------------------------------------------------------------
    var PicsView = Backbone.View.extend(
        {
            tagName: "div", // The HTML tag for the view's root element
            id: "pic",      // The ID for the view's root element

            /*
             * The render method constructs the HTML representation of the picture.
             * It uses the model's attributes to populate the image source and description.
             */
            render: function() {
                // Collect the tags for this image
                // var tags = this.model.get("tags"); // This line is currently commented out,
                                                    // suggesting tag functionality is not active.

                // Assign the content of the main div
                var html = "<img src=\"assets/photos/miike/" + this.model.get("fileName") + "\">";
                html += "<h3>" + this.model.get("description") + "</h3>";

                /*
                 * This block would iterate through tags and create buttons for each.
                 * It is commented out, indicating tag display is disabled.
                 *
                 * if (tags.length !== 0) {
                 *     var temp = "";
                 *     tags.forEach(function(tag) {
                 *         temp += "<button class=\"btn btn-primary\">" + tag + "</button>&nbsp; ";
                 *     });
                 *     html += temp;
                 * }
                 */

                return this.$el.html(html); // Return the view's element with the new HTML content
            }
        }
    ); /* End of PicsView definition */


    /*
     * View - Index: This view renders the main landing page content.
     * It provides an introductory message to the user.
     */
    var IndexView = Backbone.View.extend(
        {
            tagName: "div",
            id: "hero-container",

            render: function()
            {
                var html = "<div class=\"hero-unit\"><h1>We got pics.</h1>";
                html += "<p>Pics is a tool for sharing photos with anyone online.</p></div>";

                return this.$el.html(html);
            }
        }
    ); // End of IndexView


    // View - Errors ============================================
    /* May not need one for now. This comment suggests error handling views are not a priority yet. */


    /*
     * Router: This section defines the application's routing logic.
     * It maps URL fragments to specific actions (functions) within the application.
     */
    var PicsRouter = new (Backbone.Router.extend(
        {
            routes: {
                "": "index",       // Default route, maps to the 'index' function
                "view/:id": "view", // Route for viewing a specific picture by ID
                "tags": "tags",    // Route for viewing tags
                "user": "usr"      // Route for viewing user profiles
            },

            initialize: function()
            {
                // console.log("Initialize invoked"); // Debugging message, currently commented out
            },

            index: function()
            {
                // console.log("Index invoked"); // Debugging message
                this.indexView = new IndexView({}); // Create a new instance of the IndexView
                $( "#console" ).html( this.indexView.render( ) ); // Render the IndexView into the '#console' element
            },

            start: function()
            {
                Backbone.history.start(); // Initiates Backbone's history management, enabling routing
            },

            view: function(id)
            {
                /*
                 * The following block is commented out, indicating that direct data lookup
                 * and error handling based on 'data.pics' is not currently active.
                 *
                 * if (typeof data.pics[id] === "undefined") {
                 *     console.log("This image cannot be found");
                 *     $("#error").slideDown("fast");
                 * } else {
                 *     this.pics = new Pics(data.pics[id]);
                 */
                this.pics = new Pics({refid: id}); // Create a new Pics model with a reference ID
                this.picsView = new PicsView({model: this.pics}); // Create a PicsView using the new model

                // console.log("View a particular image. In this case, "+id); // Debugging message
                $( "#console" ).html( this.picsView.render( ) ); // Render the PicsView into the '#console' element
                // }
            },

            tags: function()
            {
                // console.log("View the tags of a pic or the tags posted by a user"); // Debugging message
            },

            usr: function()
            {
                // console.log("View the profile of a user, including their pics and tags"); // Debugging message
            }
        }
    )); // End of PicsRouter definition


    // This block executes when the DOM is ready, similar to $(document).ready()
    $(
        function()
        {
            PicsRouter.start(); // Start the Backbone router
        }
    );
} ); // End of document.ready function