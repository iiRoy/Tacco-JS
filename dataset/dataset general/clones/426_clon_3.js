jQuery(document).ready(function() {

  // A simple utility for loading templates from script tags
  const getTemplate = (selector) => _.template(jQuery(selector).html());

  // --- Configuration and Global Instances ---
  // Store for main event data
  let mainGatheringsStore;
  // Store for user's personal event data
  let personalGatheringsStore;
  // Store for remarks on a specific event
  let currentRemarksStore;

  // Instances of top-level page views
  let landingPageInstance;
  let myGatheringsPageInstance;
  let detailsPageInstance;

  // --- Core Data Structures (Backbone Models & Collections) ---

  // Represents a single 'Gathering' record
  const GatheringRecord = Backbone.Model.extend({
    // Default values for new records
    defaults: {
      title: "Untitled Gathering",
      description: "A wonderful event.",
      participantCount: 0,
      hasConfirmed: false,
      commentCount: 0 // New attribute for comment count
    },

    // Initialization logic for a new gathering record
    initialize: function() {
      // Perform any setup needed for a new gathering
      if (!this.get('createdDate')) {
        this.set('createdDate', new Date().toISOString());
      }
    },

    // User confirms attendance for this gathering
    confirmAttendance: function() {
      const currentParticipants = parseInt(this.get("participantCount") || 0, 10);
      const updatedCount = currentParticipants + 1;

      // Save changes to the server and update local state
      this.save({
        "participantCount": updatedCount,
        "hasConfirmed": true
      }, {
        success: (model, response) => {
          // If successful, and personal gatherings store exists, add this gathering there
          if (personalGatheringsStore && !personalGatheringsStore.findWhere({id: model.id})) {
            personalGatheringsStore.add(model);
          }
          console.log(`Attendance confirmed for: ${model.get('title')}`); // Added for debugging
        },
        error: (model, xhr, options) => {
          console.error(`Failed to confirm attendance for ${model.get('title')}:`, xhr);
          // Revert changes on error
          model.set({
            "participantCount": currentParticipants,
            "hasConfirmed": false
          });
          alert("Could not confirm attendance. Please try again.");
        }
      });
    }
  });

  // Represents a single 'Remark' (comment) record
  const RemarkRecord = Backbone.Model.extend({
    // Default values for new remarks
    defaults: {
      author: "Guest",
      text: "",
      timestamp: null
    },
    initialize: function() {
      if (!this.get('timestamp')) {
        this.set('timestamp', new Date().toLocaleString());
      }
    }
  });

  // Registry for all 'Gathering' records
  const GatheringRegistry = Backbone.Collection.extend({
    model: GatheringRecord,
    // API endpoint for all gatherings
    url: '/api/gatherings/all',
    // Custom parse method to handle potential nested data
    parse: function(response) {
      return response.data || response;
    }
  });

  // Registry for 'Gathering' records confirmed by the current user
  const PersonalGatheringRegistry = Backbone.Collection.extend({
    model: GatheringRecord,
    // API endpoint for user's personal gatherings
    url: '/api/gatherings/my-confirmed',
    parse: function(response) {
      return response.data || response;
    }
  });

  // Registry for 'Remark' records associated with a specific gathering
  const RemarkRegistry = Backbone.Collection.extend({
    model: RemarkRecord,
    // Dynamic URL based on the parent gathering
    initialize: function(models, options) {
      if (options && options.parentGatheringId) {
        this.url = `/api/gatherings/${options.parentGatheringId}/remarks`;
      } else {
        console.warn("RemarkRegistry initialized without a parentGatheringId. URL will be undefined.");
      }
    },
    parse: function(response) {
      return response.data || response;
    }
  });

  // --- View Components (Backbone Views) ---

  // Base view for displaying a single gathering item
  const GatheringDisplay = Backbone.View.extend({
    tagName: 'article', // Use an article tag for semantic markup
    className: 'gathering-card', // Class for styling
    template: getTemplate("#tmpl-gathering-item"), // Load template from script tag

    // DOM events specific to a single gathering item
    events: {
      "click .action-confirm-attendance": "handleAttendanceConfirm",
      "click .gathering-title": "showFullDetails"
    },

    // View constructor
    initialize: function() {
      if (!this.model) {
        console.error("GatheringDisplay initialized without a model.");
        return;
      }
      this.listenTo(this.model, 'change', this.render); // Use listenTo for better memory management
      this.listenTo(this.model, 'destroy', this.remove); // Remove view when model is destroyed
      this.render(); // Initial render
    },

    // Handles user clicking to confirm attendance
    handleAttendanceConfirm: function(e) {
      e.preventDefault();
      this.model.confirmAttendance();
    },

    // Displays the full details page for this gathering
    showFullDetails: function() {
      // Delegate to the global application manager to switch views
      appManager.displayGatheringDetails(this.model.clone()); // Pass a clone to prevent direct modification
    },

    // Renders the gathering details into the view's element
    render: function() {
      // Add a loading indicator or disable button if pending save
      if (this.model.isNew() || this.model.isDirty()) {
        this.$el.addClass('is-pending-save');
      } else {
        this.$el.removeClass('is-pending-save');
      }

      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  // Specialized view for displaying a personal gathering item (e.g., in "My Events")
  const PersonalGatheringDisplay = GatheringDisplay.extend({
    className: 'personal-gathering-card', // Different class for styling
    template: getTemplate("#tmpl-personal-gathering-item"), // Use a different template
    events: {
      "click .action-remove-attendance": "removeAttendance" // New event for removing attendance
    },

    // Overrides initialize to add specific logic for personal gatherings
    initialize: function() {
      // Call parent initialize to ensure basic setup
      GatheringDisplay.prototype.initialize.apply(this, arguments);
      // Additional setup specific to personal gatherings
    },

    // New method to handle removing attendance (e.g., leaving an event)
    removeAttendance: function(e) {
      e.preventDefault();
      if (confirm(`Are you sure you want to unconfirm for "${this.model.get('title')}"?`)) {
        // Here you would typically call a model method to update attendance status on the server
        // For this clone, we'll just remove it from the local collection and decrement count
        this.model.save({
          "participantCount": Math.max(0, parseInt(this.model.get("participantCount") || 0, 10) - 1),
          "hasConfirmed": false
        }, {
          success: (model) => {
            if (personalGatheringsStore) {
              personalGatheringsStore.remove(model); // Remove from the client-side collection
            }
            console.log(`Attendance removed for: ${model.get('title')}`);
          },
          error: (model, xhr) => {
            console.error(`Failed to remove attendance for ${model.get('title')}:`, xhr);
            alert("Could not remove attendance. Please try again.");
          }
        });
      }
    }
  });

  // View for displaying a list of all available gatherings
  const MainGatheringsDisplay = Backbone.View.extend({
    el: "#main-events-section", // Target element for this view

    // Initialization: create collection, bind events, fetch data
    initialize: function() {
      this.listenTo(this.collection, 'reset', this.render); // Render on collection reset
      this.listenTo(this.collection, 'add', this.addSingleGathering); // Add single item on add
      this.listenTo(this.collection, 'request', this.showLoading); // Show loading state
      this.listenTo(this.collection, 'sync error', this.hideLoading); // Hide loading state

      // If collection is not yet initialized, create it
      if (!mainGatheringsStore) {
        mainGatheringsStore = new GatheringRegistry();
      }
      this.collection = mainGatheringsStore; // Assign to this.collection
      this.collection.fetch({
        reset: true
      }); // Fetch initial data and reset the collection
    },

    // Shows a loading indicator
    showLoading: function() {
      this.$el.find('.gathering-list').empty().append('<div class="loading-spinner">Loading gatherings...</div>');
    },

    // Hides the loading indicator
    hideLoading: function() {
      this.$el.find('.loading-spinner').remove();
    },

    // Adds a single gathering record to the DOM
    addSingleGathering: function(gathering) {
      const display = new GatheringDisplay({
        model: gathering
      });
      this.$(".gathering-list").append(display.render().el);
    },

    // Renders the entire collection of gatherings
    render: function() {
      this.$(".gathering-list").empty(); // Clear existing items
      if (this.collection.isEmpty()) {
        this.$(".gathering-list").append('<p class="no-results">No gatherings available at the moment.</p>');
      } else {
        this.collection.each(this.addSingleGathering, this); // Use context for `this`
      }
      return this;
    }
  });

  // View for displaying the user's personal list of gatherings
  const PersonalGatheringsListing = Backbone.View.extend({
    el: "#my-events-section", // Target element

    // Initialization: create collection, bind events, fetch data
    initialize: function() {
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'add', this.addSinglePersonalGathering);
      this.listenTo(this.collection, 'remove', this.render); // Re-render on remove
      this.listenTo(this.collection, 'request', this.showLoading);
      this.listenTo(this.collection, 'sync error', this.hideLoading);

      // If personal gatherings store is not initialized, create it
      if (!personalGatheringsStore) {
        personalGatheringsStore = new PersonalGatheringRegistry();
      }
      this.collection = personalGatheringsStore; // Assign to this.collection
      this.collection.fetch({
        reset: true
      });
    },

    // Shows a loading indicator
    showLoading: function() {
      this.$el.find('.personal-gathering-list').empty().append('<div class="loading-spinner">Fetching your events...</div>');
    },

    // Hides the loading indicator
    hideLoading: function() {
      this.$el.find('.loading-spinner').remove();
    },

    // Adds a single personal gathering record to the DOM
    addSinglePersonalGathering: function(gathering) {
      const display = new PersonalGatheringDisplay({
        model: gathering
      });
      this.$(".personal-gathering-list").append(display.render().el);
    },

    // Renders the entire collection of personal gatherings
    render: function() {
      this.$(".personal-gathering-list").empty();
      if (this.collection.isEmpty()) {
        this.$(".personal-gathering-list").append('<p class="no-results">You have not confirmed attendance for any gatherings yet.</p>');
      } else {
        this.collection.each(this.addSinglePersonalGathering, this);
      }
      return this;
    }
  });

  // View for displaying the remarks section of an event
  const RemarkSectionDisplay = Backbone.View.extend({
    el: "#event-details-remarks-area", // Target element for remarks
    associatedGathering: null, // Reference to the parent gathering model
    template: getTemplate("#tmpl-remark-item"), // Template for single remark

    events: {
      "click #submit-remark-btn": "submitNewRemark",
      "keypress #new-remark-text": "handleEnterKey"
    },

    // Initialization; takes the parent gathering model as an argument
    initialize: function(options) {
      if (!options || !options.parentModel) {
        console.error("RemarkSectionDisplay requires a parentModel.");
        return;
      }
      this.associatedGathering = options.parentModel;

      // Initialize the remarks collection for this gathering
      currentRemarksStore = new RemarkRegistry([], {
        parentGatheringId: this.associatedGathering.id
      });
      this.collection = currentRemarksStore; // Assign to this.collection

      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'add', this.addOneRemark);

      // Fetch existing remarks, or populate with dummy data if not fetched
      this.collection.fetch({
        success: () => {
          // If no remarks from server, add some sample ones for demo
          if (this.collection.isEmpty()) {
            this.collection.add([{
              text: "This looks like a great event!",
              author: "Jane Doe"
            }, {
              text: "Can't wait to attend.",
              author: "John Smith"
            }]);
          }
          this.updateGatheringRemarkCount();
        },
        error: (collection, xhr, options) => {
          console.error("Failed to fetch remarks:", xhr);
          // Fallback to demo data on error
          this.collection.reset([{
            text: "Error fetching remarks, here are some defaults.",
            author: "System"
          }]);
          this.updateGatheringRemarkCount();
        }
      });
    },

    // Updates the parent gathering model's remark count
    updateGatheringRemarkCount: function() {
      this.associatedGathering.set({
        "commentCount": this.collection.length
      });
    },

    // Renders a single remark
    addOneRemark: function(remark) {
      this.$("#remarks-list").append(this.template(remark.toJSON()));
    },

    // Renders all remarks in the collection
    render: function() {
      this.$("#remarks-list").empty();
      if (this.collection.isEmpty()) {
        this.$("#remarks-list").append('<p class="no-remarks">No remarks yet. Be the first to comment!</p>');
      } else {
        this.collection.each(this.addOneRemark, this);
      }
      return this;
    },

    // Handles submitting a new remark
    submitNewRemark: function() {
      const remarkInput = this.$("#new-remark-text");
      const remarkText = remarkInput.val().trim();

      if (!remarkText) {
        alert("Please enter some text for your remark!");
        return;
      }

      // Add the new remark to the collection (client-side only for this clone)
      this.collection.add({
        text: remarkText,
        author: "Current User"
      });
      remarkInput.val(''); // Clear the input field
      this.updateGatheringRemarkCount(); // Update count on parent model
    },

    // Handles the Enter key press in the remark input field
    handleEnterKey: function(e) {
      if (e.which === 13) { // Enter key
        this.submitNewRemark();
      }
    }
  });

  // View for displaying the detailed information of a single gathering
  const GatheringDetailsDisplay = Backbone.View.extend({
    el: "#event-details-main-area", // Target element for details
    template: getTemplate("#tmpl-gathering-details"), // Template for details

    events: {
      "click .action-confirm-attendance": "confirmParticipation"
    },

    initialize: function() {
      if (!this.model) {
        console.error("GatheringDetailsDisplay initialized without a model.");
        return;
      }
      this.listenTo(this.model, 'change', this.render);
      // Force an initial render if model data is already present
      this.render();
    },

    // Handles user confirming participation from the details page
    confirmParticipation: function(e) {
      e.preventDefault();
      this.model.confirmAttendance();
    },

    // Renders the detailed gathering information
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  // --- Page-Level Views (Orchestrators) ---

  // Orchestrates the display of main and personal gatherings on the landing page
  const LandingPageModule = Backbone.View.extend({
    el: "#main-tab-content", // Main container for the landing page
    mainGatheringsViewComponent: null,
    personalGatheringsViewComponent: null,

    initialize: function() {
      // Initialize sub-views. They will handle their own data fetching.
      this.mainGatheringsViewComponent = new MainGatheringsDisplay();
      this.personalGatheringsViewComponent = new PersonalGatheringsListing();
      // Render immediately if needed, or let sub-views render on data sync
      // this.render(); // This would be for orchestrating child view renders
    },
    // No explicit render method here, as sub-views manage their own rendering.
    // This view primarily ensures sub-views are instantiated.
  });

  // Orchestrates the display of personal gatherings on a dedicated page
  const MyGatheringsPageModule = Backbone.View.extend({
    el: "#my-events-tab-content", // Main container for my events page
    personalGatheringsListingComponent: null,

    initialize: function() {
      // Create a new instance of PersonalGatheringsListing specific to this page.
      // This is to avoid conflicts if the LandingPageModule also uses PersonalGatheringsListing.
      // A more robust solution might involve passing an 'el' option or managing shared instances carefully.
      this.personalGatheringsListingComponent = new PersonalGatheringsListing({
        el: this.$("#my-events-dedicated-list")
      });
      // The child view fetches and renders itself.
    }
  });

  // Orchestrates the display of a single gathering's details and remarks
  const DetailsPageModule = Backbone.View.extend({
    el: "#event-details-tab-content", // Main container for event details page
    detailsViewComponent: null,
    remarksViewComponent: null,

    initialize: function() {
      // Ensure sub-views are cleaned up if this page is re-rendered
      this.listenTo(this, 'before:render', this.destroySubViews);
    },

    // Cleans up existing sub-views to prevent memory leaks
    destroySubViews: function() {
      if (this.detailsViewComponent) {
        this.detailsViewComponent.remove();
        this.detailsViewComponent = null;
      }
      if (this.remarksViewComponent) {
        this.remarksViewComponent.remove();
        this.remarksViewComponent = null;
      }
      this.$el.empty(); // Clear the main content area
    },

    // Presents a specific gathering's details
    presentGathering: function(gatheringModel) {
      if (!gatheringModel || !(gatheringModel instanceof GatheringRecord)) {
        console.error("Attempted to present invalid gathering model.");
        this.$el.html('<p class="error-message">Could not load gathering details. Please try again.</p>');
        return;
      }

      this.destroySubViews(); // Clean up before rendering new content
      this.$el.html(getTemplate("#tmpl-details-page-layout")()); // Render the layout for details page

      // Instantiate and render the details and remarks sub-views
      this.detailsViewComponent = new GatheringDetailsDisplay({
        model: gatheringModel,
        el: this.$("#event-details-main-area")
      });
      this.remarksViewComponent = new RemarkSectionDisplay({
        parentModel: gatheringModel,
        el: this.$("#event-details-remarks-area")
      });

      // Render the sub-views explicitly if they don't auto-render on initialize
      this.detailsViewComponent.render();
      this.remarksViewComponent.render();
    }
  });


  // --- Application Core (Main Controller/Router) ---

  // Manages top-level application flow and tab navigation
  const ApplicationCore = Backbone.View.extend({
    el: "#tab-navigation-container", // The main tab container element

    events: {
      "click .nav-link[data-target-tab='main-tab-content']": "loadMainGatherings",
      "click .nav-link[data-target-tab='my-events-tab-content']": "loadPersonalGatherings"
      // Note: Event details tab is activated programmatically
    },

    initialize: function() {
      // Ensure methods have the correct 'this' context
      _.bindAll(this, 'loadMainGatherings', 'loadPersonalGatherings', 'displayGatheringDetails');

      // Initialize the landing page view if it hasn't been already
      if (!landingPageInstance) {
        landingPageInstance = new LandingPageModule();
      }

      // Activate initial tab (e.g., "Events Home")
      this.$(".nav-link[data-target-tab='main-tab-content']").trigger('click');

      // Setup jQuery UI tabs
      this.$el.tabs({
        // Optional: Add a activate callback for more control
        activate: (event, ui) => {
          // You could trigger specific methods here based on the activated tab
          // console.log(`Tab activated: ${ui.newTab.find('a').text()}`);
        }
      });
    },

    // Activates the main gatherings tab and ensures its view is initialized
    loadMainGatherings: function(e) {
      if (e) e.preventDefault();
      // If the instance doesn't exist, create it
      if (!landingPageInstance) {
        landingPageInstance = new LandingPageModule();
      }
      this.$el.tabs("option", "active", 0); // Activate the first tab
    },

    // Activates the personal gatherings tab and ensures its view is initialized
    loadPersonalGatherings: function(e) {
      if (e) e.preventDefault();
      // If the instance doesn't exist, create it
      if (!myGatheringsPageInstance) {
        myGatheringsPageInstance = new MyGatheringsPageModule();
      }
      this.$el.tabs("option", "active", 1); // Activate the second tab
    },

    // Activates the event details tab and displays the given gathering model
    displayGatheringDetails: function(gatheringModel) {
      // Programmatically activate the details tab
      this.$el.tabs("option", "active", 2); // Activate the third tab (index 2)

      // Initialize the details page view if it hasn't been already
      if (!detailsPageInstance) {
        detailsPageInstance = new DetailsPageModule();
      }
      // Pass the gathering model to the details page view for rendering
      detailsPageInstance.presentGathering(gatheringModel);
    }
  });

  // --- Application Bootstrap ---
  // Create the main application manager instance
  const appManager = new ApplicationCore();

  // --- Dummy Templates (for demonstration without external files) ---
  // These would typically be in external HTML files or served by the backend
  jQuery('body').append(`
    <script type="text/html" id="tmpl-gathering-item">
      <div class="gathering-header">
        <h3 class="gathering-title"><%= title %></h3>
        <span class="gathering-date">Scheduled: <%= createdDate.substring(0, 10) %></span>
      </div>
      <p class="gathering-description"><%= description %></p>
      <div class="gathering-meta">
        <span>Participants: <strong><%= participantCount %></strong></span>
        <% if (!hasConfirmed) { %>
          <button class="action-confirm-attendance">Confirm Attendance</button>
        <% } else { %>
          <span class="confirmed-status">Attending!</span>
        <% } %>
      </div>
    </script>

    <script type="text/html" id="tmpl-personal-gathering-item">
      <div class="personal-gathering-header">
        <h4 class="gathering-title"><%= title %></h4>
        <span class="gathering-date">Confirmed: <%= createdDate.substring(0, 10) %></span>
      </div>
      <p class="personal-gathering-summary"><%= description.substring(0, 50) %>...</p>
      <div class="personal-gathering-actions">
        <span>Your Status: Attending</span>
        <button class="action-remove-attendance">Unconfirm</button>
      </div>
    </script>

    <script type="text/html" id="tmpl-gathering-details">
      <section class="gathering-full-details">
        <h2><%= title %></h2>
        <p class="detail-description"><%= description %></p>
        <div class="detail-meta">
          <span>Total Participants: <strong><%= participantCount %></strong></span>
          <span class="detail-comments">Remarks: <strong><%= commentCount %></strong></span>
        </div>
        <% if (!hasConfirmed) { %>
          <button class="action-confirm-attendance detail-action">Confirm Attendance</button>
        <% } else { %>
          <span class="confirmed-status detail-status">You're Attending!</span>
        <% } %>
        <hr/>
      </section>
    </script>

    <script type="text/html" id="tmpl-remark-item">
      <div class="remark-entry">
        <span class="remark-author"><%= author %>:</span>
        <p class="remark-text"><%= text %></p>
        <span class="remark-timestamp"><%= timestamp %></span>
      </div>
    </script>

    <script type="text/html" id="tmpl-details-page-layout">
      <div id="event-details-main-area" class="details-main-pane"></div>
      <div id="event-details-remarks-area" class="details-remarks-pane">
        <h3>Remarks</h3>
        <div id="remarks-list" class="remarks-listing"></div>
        <div class="remark-input-area">
          <textarea id="new-remark-text" placeholder="Add your remark here..."></textarea>
          <button id="submit-remark-btn">Post Remark</button>
        </div>
      </div>
    </script>
  `);

});