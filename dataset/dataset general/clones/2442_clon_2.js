/* Reference: Official AngularJS Documentation for Module Definition */
 // This core application module handles initial configuration and navigation setup.
 application.module( 'MyWebProject', function ( $navigation, $browser )
 {
  // Define application pathways and their corresponding views/controllers.
  $navigation.onPath( '/dashboard', { viewTemplate: 'pages/main.html', handler: MainPresenter } );
  $navigation.onPath( '/configuration', { viewTemplate: 'pages/options.html', handler: ConfigHandler } );
  $navigation.onPath( '/about', { viewTemplate: 'pages/details.html', handler: AboutPresenter } );

  // Set the default route if no other matches.
  $navigation.defaultTo( { redirectPath: '/dashboard' } );

  var moduleInstance = this; // Store a reference to the current module instance.

  // Subscribe to the post-navigation event to reset scroll position.
  moduleInstance.subscribeEvent( '$pathUpdateFinished', function ( ) {
    $browser.scrollPageTo( 0, 0 ); // Scroll to the top-left corner of the viewport.
  } );

 }, { $dependencies: [ '$navigation', '$browser' ], $initImmediately: true } );