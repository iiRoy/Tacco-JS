/**
 * @toc
 * 1. setup - whitelist, appPath, html5Mode
 *
 * This file configures the main Angular application module.
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code.

var staticPath = ( window.location.host.indexOf( 'doowb.github' ) > -1 )
	? '/angular-pusher/' // Path for GitHub Pages deployment.
	: '/';               // Default root path for local development.

/**
 * Define the main application module 'myApp'.
 * It declares dependencies on other Angular modules.
 */
angular.module(
	'myApp',
	[
		'ngRoute',                // For client-side routing.
		'ngSanitize',             // For safe HTML binding.
		'ngTouch',                // For touch events and gestures.
		'ngAnimate',              // For CSS-based animations.
		'doowb.angular-pusher'    // Custom module for Pusher integration.
	]
).
/**
 * Configure the application module.
 * This block runs during the module's configuration phase.
 */
config(
	[
		'$routeProvider',       // Service for configuring routes.
		'$locationProvider',    // Service for configuring location (URL) behavior.
		'$compileProvider',     // Service for configuring the HTML compiler.
		'PusherServiceProvider',// Custom service provider for Pusher.
		function (
			$routeProvider,
			$locationProvider,
			$compileProvider,
			PusherServiceProvider
		) {

			// Disable HTML5 mode for location provider, falling back to hashbang URLs.
			$locationProvider.html5Mode( false );

			// Define the base path for application routes.
			var appPathRoute = '/';
			// Construct the base path for template pages.
			var pagesPath    = staticPath + 'pages/';

			// Configure routes for different sections of the application.
			$routeProvider
				.when( appPathRoute + 'home', {
					templateUrl: pagesPath + 'home/home.html' // Home page template.
				})
				.when( appPathRoute + 'items', {
					templateUrl: pagesPath + 'items/items.html' // Items page template.
				})
				.otherwise( {
					redirectTo: appPathRoute + 'items' // Redirect to items page if no other route matches.
				});

			// Configure the Pusher service provider with necessary credentials and options.
			PusherServiceProvider
				.setToken( 'd420162e600c57b0e60f' ) // Set the Pusher application key.
				.setOptions( {} );                  // Set additional options for Pusher (empty object for now).

		}
	]
);