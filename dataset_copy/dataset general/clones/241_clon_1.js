angular  .  module  (  'DelugeMobile'  ,  [
	// Core Ionic framework dependency.
	'ionic'
	, 'jmdobry.angular-cache' // Dependency for angular caching.
	, 'dm.services' // Custom services for the application.
	, 'dm.controllers' // Custom controllers for the application.
]  )

// Configuration block for setting up application routes and states.
.config( [ '$stateProvider' , '$urlRouterProvider' , function ( $stateProvider , $urlRouterProvider ) {

	// Define application states using $stateProvider.
	$stateProvider

		.state( 'main' , {
			// URL for the main downloads view.
			url: '/downloads' ,
			// Template file for the downloads index.
			templateUrl: 'templates/downloads-index.html' ,
			// Controller responsible for the downloads index view.
			controller: 'DownloadsIndexCtrl'
		} )
		/* This entire block of tab-related states is currently commented out.
		 * It was likely used for a previous version or alternative navigation structure.
		// setup an abstract state for the tabs directive
		.state('tab', {
			url: "/tab",
			abstract: true,
			templateUrl: "templates/tabs.html"
		})

		// the pet tab has its own child nav-view and history
		.state('tab.downloads-index', {
			url: '/downloads',
			views: {
				'downloads-tab': {
					templateUrl: 'templates/downloads-index.html',
					controller: 'DownloadsIndexCtrl'
				}
			}
		})

		.state('tab.settings', {
			url: '/settings',
			views: {
				'settings-tab': {
					templateUrl: 'templates/settings.html',
					controller: 'SettingsCtrl'
				}
			}
		})

		.state('tab.about', {
			url: '/about',
			views: {
				'about-tab': {
					templateUrl: 'templates/about.html'
				}
			}
		});

		*/ // End of commented-out tab states.

	// If no other state matches, redirect to the downloads page as the default fallback.
	$urlRouterProvider. otherwise ( '/downloads' ) ;

} ] )


// The run block executes after all modules have been loaded.
.run( [ '$q' , '$interval' , '$rootScope' , '$ionicPopup' , '$angularCacheFactory' , '$window' , 'storage' , 'DelugeService' , function ( $q , $interval , $rootScope , $ionicPopup , $angularCacheFactory , $window , storage , deluge ) {

	// Initialize the torrent cache using $angularCacheFactory.
	$angularCacheFactory ( 'torrentCache' , {
		maxAge: 5 * 60 * 1000 , // Cache items expire after 5 minutes (in milliseconds).
		deleteOnExpire: 'aggressive' // Aggressively delete expired items to free up memory.
	} ) ;


	// Function to handle adding a torrent from the device's clipboard.
	var addClipboardTorrent = function ( ) {
		// Check if Cordova (hybrid app environment) is available.
		if ( cordova ) {
			// Access the clipboard plugin to paste content.
			cordova.plugins.clipboard.paste ( function ( text ) {
				// Handle cases where clipboard content is empty or undefined.
				if ( text === undefined || text === null ) {
					console.log ( 'unknown clipboard contents' ) ;
					return ; // Exit if no valid text.
				}

				// Check if the clipboard content looks like a valid torrent URL or magnet link.
				if ( text.indexOf ( 'http://' ) === 0 || text.indexOf ( 'https://' ) === 0 || text.indexOf ( 'magnet:' ) === 0 ) {
					console.log ( 'prompt to open: ' + text ) ;

					// Retrieve current application settings.
					var settings = storage.get ( 'dm.settings' ) ;

					// Prevent adding the same URL repeatedly if it was the last one seen.
					if ( text === settings.lastUrl ) {
						console.log ( "We've already seen this URL: " + text ) ;
						return ;
					}

					// Update the last seen URL in settings.
					settings.lastUrl = text ;
					storage.set ( 'dm.settings' , settings ) ;

					// Show a confirmation popup to the user.
					$ionicPopup.confirm ( {
						title: 'Add URL?' ,
						subTitle: 'Would you like to add this URL in Deluge?<br/><br/>' + text ,
						cancelText: 'Cancel' ,
						okText: 'Add'
					} ) . then ( function ( result ) {
						// If user confirms, add the torrent via DelugeService.
						if ( result ) {
							console.log ( 'Adding: ' + text ) ;
							deluge.add ( text ) ;
						} else {
							// User cancelled the addition.
							console.log ( "Don't add the URL from the clipboard." ) ;
						}
					} ) ;
				} else {
					// Log if the clipboard content is not a recognized URL/magnet link.
					console.log ( 'unknown clipboard contents' ) ;
				}
			} , function ( error ) {
				// Handle any errors during clipboard access.
				console.log ( 'clipboard error: ' + error ) ;
			} ) ;
		}
	} ;


	// Execute this code when the Ionic platform is ready.
	ionic.Platform.ready ( function ( ) {
		console.log ( 'Ionic is Ready.' ) ;
		// Retrieve application settings to check for server configuration.
		var settings = storage.get ( 'dm.settings' ) ;
		// If server and password are configured, attempt to add clipboard torrent.
		if ( settings.server && settings.password ) {
			addClipboardTorrent ( ) ;
		}
	} , function ( ) {
		// Callback for when the platform is NOT mobile (e.g., in a browser).
		console.log ( 'Not mobile!' ) ;
	} ) ;


	// Function to register Deluge event listeners recursively.
	var registerListeners = function ( sessionId ) {
		var deferred = $q.defer ( ) ; // Create a new deferred object for async operations.

		// List of Deluge events to register for.
		var events = [
			'ConfigValueChangedEvent' ,
			'NewVersionAvailableEvent' ,
			'PluginDisabledEvent' ,
			'PluginEnabledEvent' ,
			'PreTorrentRemovedEvent' ,
			'SessionPausedEvent' ,
			'SessionResumedEvent' ,
			'SessionStartedEvent' ,
			'TorrentAddedEvent' ,
			'TorrentFileRenamedEvent' ,
			'TorrentFinishedEvent' ,
			'TorrentFolderRenamedEvent' ,
			'TorrentQueueChangedEvent' ,
			'TorrentRemovedEvent' ,
			'TorrentResumedEvent' ,
			'TorrentStateChangedEvent' // Final event in the list.
		] ;

		// Helper function to recursively register events.
		var registerEvent = function ( def ) {
			if ( events.length > 0 ) {
				var ev = events.shift ( ) ; // Get the next event from the list.
				console.log ( 'Registering for event: ' + ev ) ;

				// Attempt to register the event listener with the Deluge service.
				deluge.registerEventListener ( ev ) . then ( function ( ) {
					registerEvent ( def ) ; // Recursively call for the next event on success.
				} , function ( err ) {
					def.reject ( err ) ; // Reject the deferred if an error occurs.
				} ) ;
			} else {
				def.resolve ( true ) ; // Resolve the deferred when all events are registered.
			}
		} ;

		registerEvent ( deferred ) ; // Start the recursive registration process.
		return deferred.promise ; // Return the promise associated with the deferred object.
	} ;


	// Function to initiate the update process, including event listener registration.
	var startUpdates = function ( ) {
		console.log ( 'Starting updates.' ) ;

		// Register event listeners, passing the current session ID.
		registerListeners ( $rootScope.sessionId ) . then ( function ( ) {
			// After listeners are registered, check connection and start Deluge.
			deluge.connected ( ) . then ( function ( ) {
				deluge.start ( ) ; // Start the Deluge client.
			} ) ;
		} , function ( error ) {
			// Log any errors encountered during listener registration.
			console.log ( 'Error: ' + error ) ;
		} ) ;
	} ;


	// Initialization function for the Deluge service.
	var init = function ( ) {
		deluge.start ( ) ; // Simply starts the Deluge service.
	} ;

	init ( ) ; // Call the initialization function immediately when the run block executes.

	// Listen for 'dm.settings-changed' event broadcast on the root scope.
	$rootScope.$on ( 'dm.settings-changed' , function ( ev , settings ) {
		// When settings change, re-initialize the Deluge service.
		init ( ) ;
	} ) ;

} ] ) ; // End of the .run block and module definition.