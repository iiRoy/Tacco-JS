jQuery(document).onReady(function() {

    // Data Entity Definition ===========================================
    var VisualAsset = Backbone.Model.extend({
        serverEndpoint: "/content/api/fetchAsset",
        initialProperties: {
            assetLabel: 'unspecified-file-name',
            assetIdentifier: 'missing-asset-id',
            assetDescription: 'no-descriptive-text'
        }
    });

    // Display Component - Image ========================================
    var AssetDisplayView = Backbone.View.extend({
        htmlElementTag: "section",
        elementId: "media-content",

        renderContent: function() {
            // Placeholder for collecting associated keywords
            // var keywords = this.itemData.get("keywords");

            // Construct the inner HTML for the section
            var outputHtml = "<picture><img src=\"web/images/gallery/" + this.itemData.get("assetLabel") + "\"></picture>";
            outputHtml += "<h4>" + this.itemData.get("assetDescription") + "</h4>";

            /*
            if (keywords.length !== 0) {
                var keywordButtons = "";
                keywords.forEach(function(keyword) {
                    keywordButtons += "<button class=\"btn-styled btn-info\">" + keyword + "</button>&nbsp; ";
                });
                outputHtml += keywordButtons;
            }
            */

            return this.$el.html(outputHtml);
        }
    });

    // Display Component - Main Page ====================================
    var HomepageDisplayView = Backbone.View.extend({
        htmlElementTag: "article",
        elementId: "main-banner-area",

        renderContent: function() {
            var pageMarkup = "<div class=\"welcome-panel\"><h1>Explore our collection.</h1>";
            pageMarkup += "<p>This platform allows sharing visual content globally.</p></div>";
            return this.$el.html(pageMarkup);
        }
    });

    // Display Component - Error (Currently unused) =====================
    /* This component is not required at this time for the application */

    // Application Router ===============================================
    var MediaRouteHandler = new (Backbone.Router.extend({
        pathDefinitions: {
            "": "showHome",
            "display/:ref": "showItem",
            "keywords": "viewKeywords",
            "profile": "viewUserAccount"
        },

        initializeRouter: function() {
            // console.log("Router initialization complete.");
        },

        showHome: function() {
            // console.log("Navigating to the main landing page.");
            this.homePageView = new HomepageDisplayView({});
            jQuery("#main-app-container").html(this.homePageView.renderContent());
        },

        startNavigation: function() {
            Backbone.history.start();
        },

        showItem: function(uniqueRef) {
            // if (typeof applicationData.assets[uniqueRef] === "undefined") {
            //     console.log("The requested visual asset was not found.");
            //     jQuery("#error-display").slideDown("fast");
            // } else {
            //     this.currentAsset = new VisualAsset(applicationData.assets[uniqueRef]);
            this.currentAsset = new VisualAsset({itemId: uniqueRef});
            this.assetDetailView = new AssetDisplayView({itemData: this.currentAsset});

            // console.log("Displaying a specific media item with ID: "+uniqueRef);
            jQuery("#main-app-container").html(this.assetDetailView.renderContent());
            // }
        },

        viewKeywords: function() {
            // console.log("Accessing all keywords or tags associated with media.");
        },

        viewUserAccount: function() {
            // console.log("Displaying a user's profile, including their uploads and associated keywords.");
        }
    }));

    jQuery(function() {
        MediaRouteHandler.startNavigation();
    });

});