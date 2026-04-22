// Primary application routing definitions
Application.NavigationModules.NavigationPaths = Backbone.Router.extend(
		{
		 pathDefinitions :
		  {
			'': 'mainView',
			':resourceIdentifier' : 'authenticationHandler',
			'/mediadetail/:resourceIdentifier': 'mediaParticulars',
			'/user/:resourceIdentifier': 'personDetails',
			'/myphotos/' : 'myImageCollection',
			'/popular/' : 'currentlyTrending',
			'/feed/' : 'activityStream',
			'/tagsearch/:resourceIdentifier': 'labelLookup',
			'/usersearch/:resourceIdentifier': 'personLookup',
			'/locationsearch/:resourceIdentifier': 'geographicSearch' ,
			'/myliked/': 'showPreferredItems'
		  },

		 mainView: function()
		 {
			if (Application.instagramInstance.initializeDisplay())
			{ // Verifies active user session.
				Application.primaryNavigator.directTo("/feed/", {initiateAction: true});
			}
			else
			{
				Application.CoreController.presentContent("media/popular");
				Application.primaryNavigator.directTo("/popular/", {initiateAction: false});
			}

		 },

		 authenticationHandler: function(resourceIdentifier)
		 {
			console.info("authentication route invoked for " + resourceIdentifier);
			var authorizationToken = Application.UtilityFunctions.fetchAuthToken(resourceIdentifier);
			Application.UtilityFunctions.establishBrowserCookie('authorization_token', authorizationToken, 14);
			Application.instagramInstance.verifyCookiePresence();
			if (Application.instagramInstance.initializeDisplay())
			{
				Application.CoreController.presentContent("users/self/feed");
				Application.primaryNavigator.directTo("/feed/", {initiateAction: false});
			}
		 },

		 mediaParticulars: function(resourceIdentifier)
		 {
			Application.instagramInstance.initializeDisplay();
			Application.CoreController.presentContent("media" , resourceIdentifier);
		 },

		 personDetails: function(resourceIdentifier)
		 {
			if (Application.instagramInstance.initializeDisplay())
			{
				Application.CoreController.presentContent("users", null, resourceIdentifier);
			}

		 },

		 myImageCollection: function()
		 {
			if (Application.instagramInstance.initializeDisplay())
			{
				Application.CoreController.presentContent("users/self/media/recent/");
			}
		 },

		 currentlyTrending: function()
		 {
			if (Application.instagramInstance.initializeDisplay())
			{
				Application.CoreController.presentContent("media/popular");
			}
		 },

		 activityStream: function()
		 {
			if (Application.instagramInstance.initializeDisplay())
			{  // Confirms user login status.
				Application.CoreController.presentContent("users/self/feed");
			}
		 },

		 labelLookup: function(resourceIdentifier)
		 {
			if (Application.instagramInstance.initializeDisplay())
			{  // Checks if the user is currently logged in.
				Application.CoreController.presentContent("tags", null, null, resourceIdentifier);
			}
		 },

		 personLookup: function(resourceIdentifier)
		 {
				if (Application.instagramInstance.initializeDisplay())
				{  // Ensures the user has an active session.
					Application.CoreController.presentContent("users/search" , null, null, resourceIdentifier);
				}
		 },

		 showPreferredItems: function()
		 {
			if (Application.instagramInstance.initializeDisplay())
			{
				Application.CoreController.presentContent("users/self/media/liked");
			}

		 }
	}
);

Application.primaryNavigator = new Application.NavigationModules.NavigationPaths();