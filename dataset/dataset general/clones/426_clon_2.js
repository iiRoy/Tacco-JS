jQuery(function() {

    // Data structure for 'Occasion'
    var Occasion = CoreFramework.Model.extend({
        commence: function() {
            /* Optional initialization logic. */
        },

        // When a user confirms attendance for an occasion, update its participant count and add it to personal list.
        confirmAttendance: function() {
            this.save({ "participants": this.get("participants") + 1, "has_confirmed": true });
            if (personalOccasions !== null) {
                personalOccasions.add(this);
            }
        }
    });

    // Visual component for a single 'Occasion'
    var OccasionDisplay = CoreFramework.View.extend({

        // Cache the template function for an individual item.
        // This view utilizes MustacheEngine.js (based on Mustache) for templating. Invoke MustacheEngine.occasion for the compiled function.
        // Refer to layout.html for template definitions.
        visualBlueprint: MustacheEngine.occasion,

        // User interactions specific to this item.
        userInteractions: {
            "click a.confirm-attendance": "confirmOccasionAttendance",
            "click div.label": "showOccasionDetail"
        },

        // Constructor method for the display.
        commence: function() {
            Utilities.bindAll(this, 'showVisuals');
            this.dataModel.bind('change', this.showVisuals);

            // Set this display as the data model's visual component if required.
            // this.dataModel.visualComponent = this;
        },

        // Perform a DOM action: confirm attendance.
        confirmOccasionAttendance: function() {
            this.dataModel.confirmAttendance();
        },

        // Another DOM action: show detailed information.
        showOccasionDetail: function() {
            mainAppInstance.navigateToDetail(this.dataModel.clone());
        },

        // Re-render the content of the Occasion into its visual component.
        showVisuals: function() {
            jQuery(this.domElement).html(this.visualBlueprint(this.dataModel.toJSON()));
            return this;
        }

    });

    // An alternative visual component for a single Occasion, using a different UI template.
    var PersonalOccasionDisplay = OccasionDisplay.extend({

        // Cache the template function for a specific item.
        // This visual component uses TemplateRenderer.js (based on Mustache) for templating. Call TemplateRenderer.compile(<template html>) to get a compiled function.
        // See layout.html for TemplateRenderer templates.
        visualBlueprint: TemplateRenderer.compile(jQuery("#personal_occasion_template").html()),

        commence: function() {
            Utilities.bindAll(this, 'showVisuals');
            this.dataModel.bind('change', this.showVisuals);

            // Assign this visual component to the data model if needed.
            // this.dataModel.visualComponent = this;
        },

        // Re-render the content of the Personal Occasion into its visual component.
        showVisuals: function() {
            jQuery(this.domElement).html(this.visualBlueprint(this.dataModel.toJSON()));
            return this;
        }

    });

    // A registry of Occasions with a RESTful source at '/occasions'.
    var OccasionRegistry = CoreFramework.Collection.extend({
        dataModel: Occasion,
        apiEndpoint: '/occasions'
    });

    // The instance of the 'OccasionRegistry' collection used throughout the application.
    var mainOccasions;


    // Another registry of Occasions with a RESTful source at '/occasions?mine=true'. This represents only 'My Occasions' at any given time.
    var PersonalOccasionRegistry = CoreFramework.Collection.extend({
        dataModel: Occasion,
        apiEndpoint: '/occasions?mine=true',
    });

    // The instance of the 'PersonalOccasionRegistry' collection used by various parts.
    var personalOccasions;


    // The visual component that binds to the 'mainOccasions' Occasion Registry, displays its contents, and handles DOM actions.
    var CentralOccasionsDisplay = CoreFramework.View.extend({
        domElement: jQuery("#occasions-central-section"),

        // Any changes in the 'mainOccasions' registry must be handled and reflected in the UI.
        commence: function() {
            Utilities.bindAll(this, 'showVisuals');
            mainOccasions = new OccasionRegistry;
            mainOccasions.bind('refresh', this.showVisuals);
            mainOccasions.fetch();
        },

        // Re-display the contents of the entire registry.
        showVisuals: function() {
            this.jQuery("#occasions-overview").empty();
            mainOccasions.each(function(currentOccasion) {
                var displayComponent = new OccasionDisplay({ dataModel: currentOccasion });
                this.jQuery("#occasions-overview").append(displayComponent.showVisuals().domElement);
            });
        }

    });

    // The instance of the 'CentralOccasionsDisplay' visual component to be used by other parts.
    var centralOccasionsDisplayInstance;


    // The visual component that binds to 'personalOccasions' Occasion Registry, displays its contents, and handles DOM actions.
    var PersonalOccasionsDisplay = CoreFramework.View.extend({
        domElement: jQuery("#occasions-central-section"),

        // Any changes in the 'personalOccasions' registry must be handled and reflected in the UI.
        commence: function() {
            Utilities.bindAll(this, 'addSingleEntry', 'showVisuals');
            if (personalOccasions === null) {
                personalOccasions = new PersonalOccasionRegistry;
            }
            personalOccasions.bind('refresh', this.showVisuals);
            personalOccasions.bind('add', this.addSingleEntry);
            personalOccasions.fetch();
        },

        // A new occasion has been added to the Personal Occasions registry, so display it.
        addSingleEntry: function(currentOccasion) {
            var displayComponent = new PersonalOccasionDisplay({ dataModel: currentOccasion });
            this.jQuery("#personal-occasions-list").append(displayComponent.showVisuals().domElement);
        },

        // Re-display the contents of the entire registry.
        showVisuals: function() {
            this.jQuery("#personal-occasions-list").empty();
            personalOccasions.each(function(currentOccasion) {
                var displayComponent = new PersonalOccasionDisplay({ dataModel: currentOccasion });
                this.jQuery("#personal-occasions-list").append(displayComponent.showVisuals().domElement);
            });
        }

    });

    // The instance of the 'PersonalOccasionsDisplay' visual component for global use.
    var personalOccasionsDisplayInstance;


    // The header tab "Occasions Central" on our page represents the main page, showing 'Central Occasions' and 'Personal Occasions' registries.
    // Let's create a 'CentralPageLayout' visual component to manage 'CentralOccasionsDisplay' and 'PersonalOccasionsDisplay'.
    var CentralPageLayout = CoreFramework.View.extend({

        // Simply instantiate the corresponding visual components and let them handle their responsibilities.
        // Any other page-level interactions not covered by the sub-components should be bound here.
        commence: function() {
            centralOccasionsDisplayInstance = new CentralOccasionsDisplay;
            personalOccasionsDisplayInstance = new PersonalOccasionsDisplay;
        }

    });


    // The header tab "My Occasions" on our page represents the dedicated personal occasions page.
    // Let's create a 'PersonalPageLayout' visual component that binds to 'personalOccasions', displays its contents, and handles DOM actions.
    // We cannot reuse 'PersonalOccasionsDisplay' due to a different design blueprint on this page.
    // Also, unlike 'CentralPageLayout' which manages multiple sub-components, this page focuses on a single registry type.
    var PersonalPageLayout = CoreFramework.View.extend({
        domElement: jQuery("#personal-occasions-tab-section"),

        // Any changes in the 'personalOccasions' registry must be handled and reflected in the UI.
        commence: function() {
            Utilities.bindAll(this, 'addSingleEntry', 'showVisuals');
            if (personalOccasions === null) {
                personalOccasions = new PersonalOccasionRegistry;
            }
            personalOccasions.bind('refresh', this.showVisuals);
            personalOccasions.bind('add', this.addSingleEntry);
            personalOccasions.fetch();
        },


        // A new occasion has been added to the Personal Occasions registry, so display it.
        addSingleEntry: function(currentOccasion) {
            var displayComponent = new OccasionDisplay({ dataModel: currentOccasion });
            this.jQuery("#personal-occasions-list-alt").append(displayComponent.showVisuals().domElement);
        },


        // Re-display the contents of the entire registry.
        showVisuals: function() {
            console.log("Rendering PersonalPageLayout");
            this.jQuery("#personal-occasions-list-alt").empty();
            personalOccasions.each(function(currentOccasion) {
                var displayComponent = new OccasionDisplay({ dataModel: currentOccasion });
                this.jQuery("#personal-occasions-list-alt").append(displayComponent.showVisuals().domElement);
            });
        }

    });


    // Our third header tab, 'Occasion Details', shows details of an Occasion when its label is clicked.
    // This page allows users to add remarks for the occasion.
    // The page will have occasion details and remarks as two separate sections/displays, interacting with each other.

    // Data structure for a 'Remark'
    var Remark = CoreFramework.Model.extend({
        commence: function() {
            // Initialization for Remark model.
        }
    });

    // Since we are familiar with creating and binding displays to data models,
    // for Remark, we will skip a dedicated RemarkDisplay.
    // Instead, the display managing the RemarkRegistry will render the remarks directly.


    // A registry of Remarks with a RESTful source at '/occasions/:occasion_id/remarks', assuming remarks belong to an occasion.
    var RemarkRegistry = CoreFramework.Collection.extend({
        dataModel: Remark,

        commence: function(parentDataModel) {
            console.log("Initializing RemarkRegistry with parent");
            this.apiEndpoint = "/occasion/" + parentDataModel.id + "/remarks";
            console.log(this.apiEndpoint);
        }

    });

    // Instance of the RemarkRegistry for use by other parts.
    var occasionRemarks;


    // The visual component that binds to 'occasionRemarks' Remark Registry, displays its contents, and handles DOM actions.
    // We will display the total count of remarks in the Occasion Details display, not here.
    // A reference to the 'Occasion' data model is passed to notify it when a new remark is added.
    var RemarkSectionDisplay = CoreFramework.View.extend({
        domElement: jQuery("#occasion-details-section"),
        associatedOccasion: null,

        // For demonstration, remarks will be client-side only, not saved to server.
        commence: function(associatedOccasion) {
            Utilities.bindAll(this, 'showVisuals', 'addSingleEntry', 'submitRemark');
            this.associatedOccasion = associatedOccasion;
            occasionRemarks = new RemarkRegistry(associatedOccasion);
            occasionRemarks.bind('refresh', this.showVisuals);
            occasionRemarks.bind('add', this.addSingleEntry);
            occasionRemarks.refresh([{ "content": "Hello World remark" }, { "content": "More of Hello World content" }]);

            // Attach event handler for the 'Post Remark' button.
            jQuery("#post-remark-button").click(this.submitRemark);
        },

        // Re-display the contents of the entire registry.
        // As there's no dedicated RemarkDisplay, HTML is generated directly.
        showVisuals: function() {
            this.jQuery("#occasion-remarks").empty();
            this.associatedOccasion.set({ "remark_count": occasionRemarks.length });
            occasionRemarks.each(function(currentRemark) {
                this.jQuery("#occasion-remarks").append("<div>UserA:" + currentRemark.get('content') + "</div>");
            });
        },

        // A new remark has been added to the RemarkRegistry, so display it.
        addSingleEntry: function(currentRemark) {
            this.jQuery("#occasion-remarks").append("<div>UserA:" + currentRemark.get('content') + "</div>");
        },

        // The user has submitted a new remark; add it to the RemarkRegistry.
        submitRemark: function() {
            occasionRemarks.add({ "content": this.jQuery("#new-remark-input").val() });
            this.associatedOccasion.set({ "remark_count": occasionRemarks.length });
        }

    });


    // The 'Occasion Details' page needs to display details of an Occasion.
    // Let's create a visual component to render the required UI for an Occasion data model.
    var OccasionDetailsDisplay = CoreFramework.View.extend({

        domElement: jQuery("#occasion-details-section"),

        // Cache the template function for a single item.
        visualBlueprint: MustacheEngine.occasion_detail,

        // User interactions specific to this item.
        userInteractions: {
            "click a.confirm-attendance": "confirmOccasionAttendance"
        },

        commence: function() {
            Utilities.bindAll(this, 'showVisuals');
            this.dataModel.bind('change', this.showVisuals);
            // Set this display as the data model's visual component if required.
            this.dataModel.visualComponent = this;
            this.dataModel.trigger('change');
        },

        confirmOccasionAttendance: function() {
            this.dataModel.confirmAttendance();
        },

        // Re-display the contents of the entire collection.
        showVisuals: function() {
            this.jQuery("#occasion-detail-display").html(this.visualBlueprint(this.dataModel.toJSON()));
            return this;
        }

    });


    // Finally, we need a single 'OccasionDetailsPageLayout' visual component
    // to manage 'OccasionDetailsDisplay' and 'RemarkSectionDisplay'.
    var OccasionDetailsPageLayout = CoreFramework.View.extend({

        domElement: jQuery("#occasion-details-section"),

        occasionDetailsDisplayInstance: null,
        remarkSectionDisplayInstance: null,

        // This page is shown when a user clicks an Occasion label.
        // No need to refresh/render child displays during initialization.
        commence: function() {
            Utilities.bindAll(this, 'showVisuals', 'presentOccasion');
        },

        showVisuals: function() {
            this.jQuery("#occasion-details-section").empty();
            this.presentOccasion();
        },

        // This method will be called by visual components from 'Central Occasions' or 'Personal Occasions' pages
        // with the corresponding Occasion data model clone.
        // Simply instantiate the corresponding displays and let them handle their responsibilities.
        presentOccasion: function(currentOccasion) {
            occasionDetailsDisplayInstance = new OccasionDetailsDisplay({ dataModel: currentOccasion });
            remarkSectionDisplayInstance = new RemarkSectionDisplay(currentOccasion);
        }

    });

    // Now that we have our three page layouts corresponding to the tabs, it's time to set up navigation.
    // One way is using CoreFramework.Router and defining URL fragments.
    // In this example, we avoid page refresh, so URL modification is not desired. Router is not suitable.

    // Visual component to the rescue! We use jQuery for tabs and navigation.
    // We only need to intercept user clicks on tabs and invoke the corresponding page layout before/after display.
    // Let's create a top-level visual component 'MainApplication' to manage navigation using jQuery and page layouts.
    var centralPageInstance, personalPageInstance, detailsPageInstance;

    var MainApplication = CoreFramework.View.extend({
        domElement: jQuery("#main-navigation-tabs"),

        commence: function() {
            Utilities.bindAll(this, 'displayCentralOccasions', 'displayPersonalOccasions', 'navigateToDetail');
            if (centralPageInstance === null) {
                centralPageInstance = new CentralPageLayout;
            }
            this.jQuery("span.section-one-link").bind('click', this.displayCentralOccasions);
            this.jQuery("span.section-two-link").bind('click', this.displayPersonalOccasions);
        },

        // Invoke 'CentralPageLayout' since the user clicked on the 'Occasions Central' tab.
        displayCentralOccasions: function() {
            if (centralPageInstance === null) {
                centralPageInstance = new CentralPageLayout;
            }
            return true;
        },

        // Invoke 'PersonalPageLayout' since the user clicked on the 'My Occasions' tab.
        displayPersonalOccasions: function() {
            if (personalPageInstance === null) {
                personalPageInstance = new PersonalPageLayout;
            }
            return true;
        },

        // Invoke 'OccasionDetailsPageLayout' since the user clicked on an Occasion label from other pages.
        navigateToDetail: function(currentOccasion) {
            this.jQuery("a#section-three-tab-link").click();
            if (detailsPageInstance === null) {
                detailsPageInstance = new OccasionDetailsPageLayout;
            }
            detailsPageInstance.presentOccasion(currentOccasion);
        }

    });

    // Instantiate the top-level visual component.
    var mainAppInstance = new MainApplication();

    // Now, draw the jQuery tabs.
    jQuery("#main-navigation-tabs").tabs();
});