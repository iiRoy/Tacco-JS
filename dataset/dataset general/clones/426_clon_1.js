$( function ( ) {

    /*
     * This is the Backbone Model definition for an 'Event'.
     * It represents a single event entity within the application.
     */
    var Event = Backbone.Model.extend( {
        // The initialize method is called when an instance of the model is created.
        initialize: function ( ) {
            // Optional initialization logic can be added here if needed for the model.
        },

        /*
         * rsvp: This function handles the RSVP action for an event.
         * When a user RSVPs, it updates the attendee count and sets the 'my_rsvp' flag.
         * It also adds the event to the user's personal events collection if available.
         */
        rsvp: function ( ) {
            // Save the updated attendee count and set 'my_rsvp' to true.
            this.save( { "attendees": this.get( "attendees" ) + 1, "my_rsvp": true } );

            // If the 'myEvents' collection exists, add this event to it.
            if ( myEvents != null ) {
                myEvents.add( this );
            }
        }

    } ); // End of Event Model definition.


    /*
     * EventView: This Backbone View is responsible for rendering a single 'Event' model.
     * It manages the display and user interactions for an individual event item.
     */
    var EventView = Backbone.View.extend( {

        /*
         * template: This property holds the template function used to render the event.
         * It utilizes ICanHaz.js (a Mustache-based templating engine).
         * The template is fetched by calling ich.<template_id>, where 'event' is the ID.
         * Refer to 'home.html.erb' for the actual template definition.
         */
        template: ich.event,


        /*
         * events: A hash of DOM events specific to this view's element.
         * The keys are event selectors, and values are method names to be called.
         */
        events: {
            "click a.rsvp": "rsvpToEvent", // Handle clicks on the RSVP link.
            "click div.title": "eventDetail" // Handle clicks on the event title to view details.
            // Other potential events commented out for now:
            // "dblclick div.todo-content" : "edit",
            // "click span.todo-destroy"   : "clear",
            // "keypress .todo-input"      : "updateOnEnter"
        },


        // Constructor method for the EventView.
        initialize: function ( ) {
            // Ensure 'render' method's 'this' context is always the view instance.
            _.bindAll( this, 'render' );

            // Bind the 'render' method to the model's 'change' event.
            // This ensures the view updates whenever its model changes.
            this.model.bind( 'change', this.render );

            // The line below would link the model to its view,
            // allowing the model to directly trigger view operations.
            // It is currently commented out as per the original code's intention.
            // this.model.view = this;
        },


        /*
         * rsvpToEvent: A DOM action handler.
         * When the RSVP link is clicked, it invokes the 'rsvp' method on the associated model.
         */
        rsvpToEvent: function ( ) {
            this.model.rsvp( );
        },


        /*
         * eventDetail: Another DOM action handler.
         * When the event title is clicked, it navigates to the event detail page.
         * It passes a clone of the current model to the application's eventDetail function.
         */
        eventDetail: function ( ) {
            app.eventDetail( this.model.clone( ) );
        },


        /*
         * render: Re-renders the contents of the EventView.
         * It populates the view's element (this.el) with data from the model using the template.
         */
        render: function ( ) {
            // Use jQuery to set the HTML of the view's element.
            // The template function is called with the model's JSON representation.
            $( this.el ).html( this.template( this.model.toJSON( ) ) );

            // Return the view instance for method chaining.
            return this;
        }

    } ); // End of EventView definition.


    /*
     * MyEventView: This view extends EventView, providing a different UI template.
     * It's specifically designed for events displayed in the "My Events" section.
     */
    var MyEventView = EventView.extend( {

        /*
         * template: This view uses Handlebars.js for templating.
         * It compiles a template defined in a script tag with ID 'my_event'.
         * Check 'home.html.erb' for the Handlebars template markup.
         */
        template: Handlebars.compile( $( "#my_event" ).html( ) ),

        // Initialize method for MyEventView.
        initialize: function ( ) {
            // Bind 'render' to the view instance.
            _.bindAll( this, 'render' );

            // Re-render when the model changes.
            this.model.bind( 'change', this.render );

            // This line is commented out, similar to its parent view.
            // this.model.view = this;
        },


        /*
         * render: Overrides the parent's render method to use its own template.
         * It displays the contents of the My Event model within its view.
         */
        render: function ( ) {
            // Update the view's element with the Handlebars template output.
            $( this.el ).html( this.template( this.model.toJSON( ) ) );

            // Return 'this' for chaining.
            return this;
        }

    } ); // End of MyEventView definition.


    /*
     * EventCollection: A Backbone Collection for 'Event' models.
     * It's configured to fetch data from a RESTful source at '/events'.
     */
    var EventCollection = Backbone.Collection.extend( {
        model: Event, // Specifies that this collection holds 'Event' models.
        url: '/events' // The URL endpoint for fetching and saving events.
    } );

    /*
     * hubEvents: This variable will hold the global instance of EventCollection.
     * It represents the main collection of all events available in the hub.
     */
    var hubEvents;


    /*
     * MyEventCollection: Another Backbone Collection for 'Event' models.
     * This collection is specifically for "My Events", fetched from '/events?my=true'.
     */
    var MyEventCollection = Backbone.Collection.extend( {
        model: Event, // This collection also holds 'Event' models.
        url: '/events?my=true' // Endpoint to fetch events specific to the current user.
    } );

    /*
     * myEvents: This variable will store the global instance of MyEventCollection.
     * It represents the collection of events that the current user has RSVP'd to.
     */
    var myEvents;


    /*
     * HubEventsView: This view is responsible for managing and displaying the 'hubEvents' collection.
     * It renders all events in the main "Events Home" tab and handles related DOM actions.
     */
    var HubEventsView = Backbone.View.extend( {
        el: $( "#events-main-tab" ), // The main DOM element this view is bound to.

        /*
         * initialize: Sets up the view, binds methods, creates the collection, and fetches data.
         * It listens for changes in the 'hubEvents' collection to update the UI.
         */
        initialize: function ( ) {
            _.bindAll( this, 'render' ); // Bind 'render' to the view instance.

            hubEvents = new EventCollection; // Create a new instance of EventCollection.
            hubEvents.bind( 'refresh', this.render ); // Re-render the view when the collection refreshes.
            hubEvents.fetch( ); // Fetch the events data from the server.
        },

        /*
         * render: Re-renders the entire collection of events.
         * It clears the existing event list and appends a new view for each event.
         */
        render: function ( ) {
            this.$( "#events-home" ).empty( ); // Clear the container for events.
            hubEvents.each( function ( event ) { // Iterate over each event in the collection.
                var view = new EventView( { model: event } ); // Create a new EventView for each event.
                this.$( "#events-home" ).append( view.render( ).el ); // Append the rendered event view to the DOM.
            }, this ); // Ensure 'this' context is correct within the loop.
        }

    } ); // End of HubEventsView definition.

    /*
     * hubEventsView: This variable will hold the global instance of HubEventsView.
     * It manages the display of general hub events.
     */
    var hubEventsView;


    /*
     * MyEventsView: This view manages and displays the 'myEvents' collection.
     * It's designed to render events specific to the current user in a designated section.
     */
    var MyEventsView = Backbone.View.extend( {
        el: $( "#events-main-tab" ), // This view also binds to the main events tab.

        /*
         * initialize: Configures the view for 'myEvents' collection.
         * It ensures the collection exists, binds events, and fetches user-specific events.
         */
        initialize: function ( ) {
            _.bindAll( this, 'addOne', 'render' ); // Bind necessary methods.

            if ( myEvents == null ) { // If 'myEvents' collection hasn't been initialized yet.
                myEvents = new MyEventCollection; // Create a new instance.
            }
            myEvents.bind( 'refresh', this.render ); // Re-render on collection refresh.
            myEvents.bind( 'add', this.addOne ); // Add a single event view when a new event is added to the collection.
            myEvents.fetch( ); // Fetch the user's events from the server.
        },

        /*
         * addOne: Handles the addition of a single new event to the 'My Events' display.
         * It creates a MyEventView for the new event and appends it to the list.
         */
        addOne: function ( event ) {
            var view = new MyEventView( { model: event } ); // Create a view using MyEventView.
            this.$( "#my-events" ).append( view.render( ).el ); // Append its rendered element.
        },

        /*
         * render: Re-renders the entire 'myEvents' collection.
         * It clears the current list and displays all events in the collection.
         */
        render: function ( ) {
            this.$( "#my-events" ).empty( ); // Clear the container for 'my events'.
            myEvents.each( function ( event ) { // Iterate through each event in 'myEvents'.
                var view = new MyEventView( { model: event } ); // Create a MyEventView.
                this.$( "#my-events" ).append( view.render( ).el ); // Append the rendered view.
            }, this );
        }

    } ); // End of MyEventsView definition.

    /*
     * hubEventsView: Note: This variable re-declaration is present in the original code.
     * It seems like a potential typo, as 'hubEventsView' was declared earlier for HubEventsView.
     * This might intend to be 'myEventsView' or another specific instance.
     * Preserving as per Type I cloning rules.
     */
    var hubEventsView;


    /*
     * EventsHomePage: This view acts as a container for the "Events Home" tab.
     * It orchestrates the HubEventsView and MyEventsView, which display different event collections.
     */
    var EventsHomePage = Backbone.View.extend( {

        /*
         * initialize: Instantiates the sub-views responsible for displaying events.
         * Any general page-level interactions for this tab would be bound here.
         */
        initialize: function ( ) {
            hubEventsView = new HubEventsView; // Create an instance of the HubEventsView.
            myEventsView = new MyEventsView; // Create an instance of the MyEventsView.
        }

    } ); // End of EventsHomePage definition.


    /*
     * MyEventsPage: This view specifically handles the "My Events" header tab.
     * Unlike EventsHomePage, it focuses solely on the user's events, potentially with a different layout.
     * It reuses the MyEventCollection but renders events using EventView for a distinct UI.
     */
    var MyEventsPage = Backbone.View.extend( {
        el: $( "#my-events-tab" ), // Binds to the specific DOM element for the "My Events" tab.

        /*
         * initialize: Sets up the view for the "My Events" page.
         * It ensures the 'myEvents' collection is active, binds render methods, and fetches data.
         */
        initialize: function ( ) {
            _.bindAll( this, 'addOne', 'render' ); // Bind methods to the view instance.

            if ( myEvents == null ) { // Ensure 'myEvents' collection is initialized.
                myEvents = new MyEventCollection;
            }
            myEvents.bind( 'refresh', this.render ); // Render the page on collection refresh.
            myEvents.bind( 'add', this.addOne ); // Add a single event when a new one is added.
            myEvents.fetch( ); // Fetch the user's events.
        },


        /*
         * addOne: Renders a single new event added to the 'myEvents' collection.
         * It uses EventView (not MyEventView) to render on this specific page.
         */
        addOne: function ( event ) {
            var view = new EventView( { model: event } ); // Uses EventView for rendering here.
            this.$( "#my-events2" ).append( view.render( ).el ); // Appends to a different container.
        },


        /*
         * render: Re-renders all events in the 'myEvents' collection for this page.
         * This function logs its execution and clears/repopulates the event list.
         */
        render: function ( ) {
            console.log( "inside MyEventsPage render" ); // Debugging log.
            this.$( "#my-events2" ).empty( ); // Clear the container.
            myEvents.each( function ( event ) { // Iterate through the collection.
                var view = new EventView( { model: event } ); // Create a view for each event.
                this.$( "#my-events2" ).append( view.render( ).el ); // Append the rendered view.
            }, this );
        }

    } ); // End of MyEventsPage definition.


    /*
     * This section defines components for the 'Event Details' page.
     * This page displays detailed information about an event and allows users to add comments.
     * It combines an EventDetailView for event info and an EventCommentsView for comments.
     */

    /*
     * Comment: A Backbone Model for representing a single comment.
     */
    var Comment = Backbone.Model.extend( {
        initialize: function ( ) {
            // No specific initialization logic defined for a Comment model currently.
        }

    } ); // End of Comment Model definition.


    /*
     * CommentCollection: A Backbone Collection for 'Comment' models.
     * Its URL is dynamically set based on the parent event's ID.
     */
    var CommentCollection = Backbone.Collection.extend( {
        model: Comment, // This collection holds 'Comment' models.

        /*
         * initialize: Sets the URL for the collection based on the parent event model.
         * This allows fetching comments specific to a particular event.
         */
        initialize: function ( parentModel ) {
            console.log( "inside COmmentCOllection wikth parent" ); // Debugging log.
            this.url = "/event/" + parentModel.id + "/comments"; // Dynamic URL construction.
            console.log( this.url ); // Log the constructed URL.
        }

    } ); // End of CommentCollection definition.

    /*
     * eventComments: This variable will hold the global instance of CommentCollection
     * for the currently viewed event.
     */
    var eventComments;


    /*
     * EventCommentsView: This view manages the display and interaction for event comments.
     * It binds to the 'eventComments' collection and allows users to add new comments.
     */
    var EventCommentsView = Backbone.View.extend( {
        el: $( "#event-detail-tab" ), // Binds to the event detail tab.
        parentEvent: null, // Stores a reference to the parent Event model.

        /*
         * initialize: Sets up the comment view, including binding methods, creating the collection,
         * fetching initial data (simulated), and attaching an event handler for adding comments.
         */
        initialize: function ( parentEvent ) {
            _.bindAll( this, 'render', 'addOne', 'addComment' ); // Bind methods.
            this.parentEvent = parentEvent; // Store the parent event.

            eventComments = new CommentCollection( parentEvent ); // Create the CommentCollection.
            eventComments.bind( 'refresh', this.render ); // Re-render on collection refresh.
            eventComments.bind( 'add', this.addOne ); // Add a single comment when a new one is added.

            // Simulate initial comments data as server-side saving is skipped for demo.
            eventComments.refresh( [ { "text": "Hello World" }, { "text": "More of Hello World stuff" } ] );

            // Attach click handler for the 'Add Comment' button.
            $( "#submit-comment" ).click( this.addComment );
        },

        /*
         * render: Re-renders the entire collection of comments.
         * It clears the comment section, updates the parent event's comment count,
         * and appends each comment's HTML directly.
         */
        render: function ( ) {
            this.$( "#event-comments" ).empty( ); // Clear the comments container.
            this.parentEvent.set( { "comment_count": eventComments.length } ); // Update comment count on parent event.
            eventComments.each( function ( comment ) { // Iterate and append each comment.
                this.$( "#event-comments" ).append( "<div>Amol:" + comment.get( 'text' ) + "</div>" );
            }, this ); // Ensure 'this' context is correct.
        },

        /*
         * addOne: Renders a single new comment that has been added to the collection.
         * This function appends the new comment's HTML to the display.
         */
        addOne: function ( comment ) {
            this.$( "#event-comments" ).append( "<div>Amol:" + comment.get( 'text' ) + "</div>" );
        },

        /*
         * addComment: Handler for when the user submits a new comment.
         * It retrieves the comment text, adds it to the collection, and updates the comment count.
         */
        addComment: function ( ) {
            eventComments.add( { "text": this.$( "#new-comment" ).val( ) } ); // Add new comment to collection.
            this.parentEvent.set( { "comment_count": eventComments.length } ); // Update comment count.
        }

    } ); // End of EventCommentsView definition.


    /*
     * EventDetailView: This view displays the detailed information of a single 'Event' model.
     * It uses a specific template for event details and handles RSVP actions within this context.
     */
    var EventDetailView = Backbone.View.extend( {

        el: $( "#event-detail-tab" ), // Binds to the event detail tab.

        /*
         * template: Uses ICanHaz.js for the event detail template.
         * 'event_detail' is the ID of the template.
         */
        template: ich.event_detail,

        /*
         * events: Defines DOM events for the event detail view.
         */
        events: {
            "click a.rsvp": "rsvpToEvent" // Handles RSVP clicks on the detail page.
            // Other commented-out event handlers:
            // "dblclick div.todo-content" : "edit",
            // "click span.todo-destroy"   : "clear",
            // "keypress .todo-input"      : "updateOnEnter"
        },

        /*
         * initialize: Sets up the view, binds render, and links the model to the view.
         * It also triggers an initial change event to ensure rendering.
         */
        initialize: function ( ) {
            _.bindAll( this, 'render' ); // Bind 'render' method.
            this.model.bind( 'change', this.render ); // Re-render when model changes.

            // Link the model directly to this view instance.
            this.model.view = this;
            this.model.trigger( 'change' ); // Trigger initial render.
        },

        /*
         * rsvpToEvent: Calls the 'rsvp' method on the associated event model.
         * This action is specific to the detail view's RSVP button.
         */
        rsvpToEvent: function ( ) {
            this.model.rsvp( );
        },

        /*
         * render: Re-renders the contents of the entire event detail view.
         * It populates the designated area with the template output.
         */
        render: function ( ) {
            this.$( "#event-detail" ).html( this.template( this.model.toJSON( ) ) ); // Render event details.
            return this; // Return 'this' for chaining.
        }

    } ); // End of EventDetailView definition.


    /*
     * EventDetailPage: This is the top-level view for the "Event Details" page.
     * It manages both the EventDetailView (for event info) and EventCommentsView (for comments).
     */
    var EventDetailPage = Backbone.View.extend( {

        el: $( "#event-detail-tab" ), // Binds to the main event detail tab.

        eventDetailView: null, // Instance of EventDetailView.
        eventCommentsView: null, // Instance of EventCommentsView.

        /*
         * initialize: Sets up the page view. It binds the render and showEvent methods.
         * Child views are instantiated only when an event is selected to be displayed.
         */
        initialize: function ( ) {
            _.bindAll( this, 'render', 'showEvent' );
        },

        /*
         * render: This method handles the initial rendering of the event detail tab.
         * It clears any existing content and then calls 'showEvent' to display the event.
         */
        render: function ( ) {
            this.$( "#event-detail-tab" ).empty( ); // Clear the tab content.
            this.showEvent( ); // Display the event (will be blank without an event passed).
        },

        /*
         * showEvent: This is the primary method to display an event's details.
         * It creates instances of EventDetailView and EventCommentsView for the given event.
         * This method is typically called from other pages (e.g., "Events Home") when an event is clicked.
         */
        showEvent: function ( event ) {
            eventDetailView = new EventDetailView( { model: event } ); // Create detail view.
            eventCommentsView = new EventCommentsView( event ); // Create comments view.
        }

    } ); // End of EventDetailPage definition.


    /*
     * Global variable declarations for page-level view instances.
     * These will be initialized by the App view to manage the different tabs.
     */
    var eventsHomePage, myEventsPage, eventDetailPage;

    /*
     * App: The main application view, responsible for managing navigation between different tabs.
     * It uses jQuery's tab functionality and invokes the appropriate page-level views.
     */
    var App = Backbone.View.extend( {
        el: $( "#tabs" ), // Binds to the main tabs container.

        /*
         * initialize: Sets up the application's navigation.
         * It binds click events to tab fragments and initializes the EventsHomePage.
         */
        initialize: function ( ) {
            _.bindAll( this, 'hubEvents', 'myEvents', 'eventDetail' ); // Bind navigation methods.

            if ( eventsHomePage == null ) { // Initialize EventsHomePage if it doesn't exist.
                eventsHomePage = new EventsHomePage;
            }
            // Bind click handlers for tab navigation.
            this.$( "span.fragment-1" ).bind( 'click', this.hubEvents );
            this.$( "span.fragment-2" ).bind( 'click', this.myEvents );
        },

        /*
         * hubEvents: Handler for when the "Events Home" tab is clicked.
         * It ensures the EventsHomePage view is initialized and active.
         */
        hubEvents: function ( ) {
            if ( eventsHomePage == null ) { // Initialize if not already.
                eventsHomePage = new EventsHomePage;
            }
            return true; // Allow default tab behavior to proceed.
        },

        /*
         * myEvents: Handler for when the "My Events" tab is clicked.
         * It ensures the MyEventsPage view is initialized and active.
         */
        myEvents: function ( ) {
            if ( myEventsPage == null ) { // Initialize if not already.
                myEventsPage = new MyEventsPage;
            }
            return true; // Allow default tab behavior.
        },

        /*
         * eventDetail: Handler for displaying the "Event Details" page.
         * This method is called from other views to navigate to an event's detail.
         * It programmatically clicks the detail tab and then invokes the EventDetailPage's showEvent method.
         */
        eventDetail: function ( event ) {
            this.$( "a#fragment-3-tab" ).click( ); // Programmatically click the third tab.
            if ( eventDetailPage == null ) { // Initialize EventDetailPage if not already.
                eventDetailPage = new EventDetailPage;
            }
            eventDetailPage.showEvent( event ); // Display the specific event.
        }

    } ); // End of App definition.

    /*
     * app: Create the global instance of the App view.
     * This kicks off the application's main functionality.
     */
    var app = new App( );

    /*
     * Initialize jQuery UI Tabs on the element with ID "tabs".
     * This converts the tab structure into an interactive tabbed interface.
     */
    $( "#tabs" ).tabs( );

} ); // End of jQuery ready function.