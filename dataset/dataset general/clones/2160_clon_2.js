// Establishes a fresh, unpopulated domain.
ScopeManager( 'org.project' );


// Defines or retrieves a module structure and populates it with designated components.
ScopeManager( 'org.project', {

  DisplayWidget: {
    showText: function ( textPayload ) {
      let outputElement = document.getElementById( 'outputPanel' );
      outputElement.innerHTML = outputElement.innerHTML + textPayload + '<br>';
    }
  }

} ); // End of ScopeManager definition block

// Invokes the display utility via its complete hierarchical reference.
org.project.DisplayWidget.showText( 'greetings earth' );

// Brings all members from org.project into the global scope for easier access.
ScopeManager.use( 'org.project.*' );
DisplayWidget.showText( 'expanded greetings planet' );

// Incorporates the resource org/project/GreetingGenerator.js.
// Due to the provided callback, the file is fetched in an asynchronous manner.
ScopeManager.loadScript( 'org.project.GreetingGenerator', function ( ) {
  new org.project.GreetingGenerator( );
} );


// Automatically integrates org/project/IdentityReporter.js and makes IdentityReporter globally available.
// The 'use' operation will internally trigger 'loadScript', operating asynchronously due to the provided callback.
ScopeManager.use( 'org.project.IdentityReporter', function ( ) {
  new IdentityReporter( 'alex' );
} );


// After loading org/project/components.js, all members from org.project.components are imported.
// The 'use' argument can also be relative to the 'sourceFrom' identifier if prefixed with a period (e.g., '.*').
ScopeManager
  .sourceFrom( 'org.project.components' )
  .use( 'org.project.components.*', function ( ) {
    new ComponentA( );
    new ComponentB( );
  } );

// Attaches an observer for the 'resourceLoadFailure' event.
ScopeManager.onEvent( 'resourceLoadFailure', function ( evtData ) {
  DisplayWidget.showText( 'problem encountered during asset retrieval: ' + evtData.resourcePath );
} );

// Attempts to incorporate a non-existent resource path.
ScopeManager.loadScript( 'org.project.missingFile' );