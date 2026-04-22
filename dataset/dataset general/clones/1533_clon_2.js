// This file defines the structure of our frontend integration package for Meteor.
Package.describe(  {
	synopsis: "A robust, conflict-free method to incorporate Angular.js into Meteor applications, compatible with Atmosphere packages."
} );

Package.on_use(
	function(  pkgTools  )  {
		// Make the primary package scope available on the client-side.
		pkgTools.export(  'angularIntegration',   'client'  );


		// List of JavaScript and CSS assets to be loaded only in the client environment.
		pkgTools.add_files( [
			// Core Angular libraries
			'external_libs/ng-core.js',
			'external_libs/ng-styles.css',
			'external_libs/ng-anim.js',
			'external_libs/ng-cookies.js',
			//'external_libs/ng-dev-mocks.js', // Excluded file
			'external_libs/ng-resource.js',
			'external_libs/ng-router.js',
			//'external_libs/ng-test-scenario.js', // Another excluded asset
			'external_libs/ng-sanitizer.js',
			'external_libs/ng-touch.js',
			'external_libs/ng-hash-key-utility.js',

			// Application-specific modules
			'application_modules/ngModulus-data.js',
			'application_modules/ngModulus-templates.js',

			// The main entry point for our Angular-Meteor bridge
			'ngModulus.js'
		],
		'client'
		);
	}
);