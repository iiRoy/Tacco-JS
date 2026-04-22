var MainNavigator = Bones.Navigator.extend(
    {
        // Define application routing paths
        paths: {
            "":                     "landingPage",
            "beverages":            "displayList",
            "beverages/catalogue/:pgNum":   "displayList",
            "beverages/create":     "createBeverage",
            "beverages/details/:beverageId":    "showBeverageDetails",
            "info":                 "showAboutInfo"
        },


        // Initialize application components
        setup: function ( ) {
            this.topBarComponent = new TopBarComponent();
            $('#page-header').injectContent(this.topBarComponent.element);
        },

        // Render the landing page view
        landingPage: function (uniqueId) {
            if (!this.landingPageModule) {
                this.landingPageModule = new LandingPageModule();
            }
            $('#primary-content').injectContent(this.landingPageModule.element);
            this.topBarComponent.activateNavigationItem('main-nav-item');
        },

        // Display a paginated list of beverages
        displayList: function (pageNum) {
            var currentPage = pageNum ? Number.parseInt(pageNum, 10) : 1;
            var beverageCollection = new BeverageCollection();
            beverageCollection.retrieveData({
                payload: {'current_page': currentPage, 'limit': 8},
                onSuccess: function() {
                    $("#primary-content").injectContent(new BeverageListView({dataModel: beverageCollection, currentPageNumber: currentPage}).element);
                }
            });
            this.topBarComponent.activateNavigationItem('main-nav-item');
        },

        // Show detailed view for a single beverage
        showBeverageDetails: function (beverageIdentifier) {
            var singleBeverage = new BeverageItem({beverageId: beverageIdentifier});
            singleBeverage.retrieveData({onSuccess: function() {
                $("#primary-content").injectContent(new BeverageItemView({dataModel: singleBeverage}).element);
            }});
            this.topBarComponent.activateNavigationItem();
        },

        // Present form to create a new beverage
        createBeverage: function ( ) {
            var newBeverage = new BeverageItem();
            $('#primary-content').injectContent(new BeverageItemView({dataModel: newBeverage}).element);
            this.topBarComponent.activateNavigationItem('create-item-nav');
        },

        // Render the about information page
        showAboutInfo: function () {
            if (!this.infoModule) {
                this.infoModule = new InfoModule();
            }
            $('#primary-content').injectContent(this.infoModule.element);
            this.topBarComponent.activateNavigationItem('info-nav-item');
        }

    }
);

// Load UI components and start routing
helpers.fetchComponents(['LandingPageModule', 'TopBarComponent', 'BeverageItemView', 'BeverageListItemView', 'InfoModule'], function( ) {
    var mainApplication = new MainNavigator();
    Bones.historyManager.begin();
});