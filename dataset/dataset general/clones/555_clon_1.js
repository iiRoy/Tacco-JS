( function ( )
{

  /*
   * This immediately invoked function expression encapsulates the RequireJS configuration
   * and the main application logic for setting up and running Jasmine tests.
   */
  require . config
  (
    {
      // The base URL for all module lookups, relative to the document root.
      baseUrl : "/" ,

      // Define module paths for easier referencing.
      paths   :
      {
          'backbone'        : 'vendors/backbone' , // The Backbone.js library
          'underscore'      : 'vendors/underscore' , // The Underscore.js utility belt
          'react'           : "vendors/react/react" , // React library
          'jquery'          : 'vendors/jquery-1.9.1' , // jQuery core library
          'jquery.autosize' : 'vendors/jquery.autosize' , // jQuery plugin for autosizing textareas
          'jquery.timeago'  : 'vendors/jquery.timeago' , // jQuery plugin for fuzzy timestamps
          'bootstrap'       : 'vendors/bootstrap/js/bootstrap' , // Bootstrap JavaScript components
          'bootbox'         : 'vendors/bootbox' , // Bootbox.js for Bootstrap dialogs
          'jquery-ui'       : 'vendors/jquery-ui/js/jquery-ui-1.10.3.custom' , // jQuery UI library

          // TODO - local storage: Future implementation for local storage handling.

          // Paths specific to the Jasmine testing framework and its extensions.
          'jasmine'         : 'test/lib/jasmine-1.3.1/jasmine' ,
          'jasmine-jquery'  : 'test/lib/jasmine-jquery' ,
          'jasmine-html'    : 'test/lib/jasmine-1.3.1/jasmine-html' ,
          'spec'            : 'test/spec/' , // Base directory for spec files
          'sinon'           : 'test/lib/sinon-1.7.3' // Sinon.js for test spies, stubs, and mocks
      } , // End of paths object

      // Configure shims for non-AMD modules.
      shim    :
      {
        underscore       :
        {
          exports        : "_" // Underscore exports the global '_' object.
        } ,
        backbone         :
        {
          deps           : [ 'underscore' , 'jquery' ] , // Backbone depends on Underscore and jQuery.
          exports        : 'Backbone' // Backbone exports the global 'Backbone' object.
        } ,
        jasmine          :
        {
          exports        : 'jasmine' // Jasmine exports itself globally.
        } ,
        sinon            :
        {
          exports        : 'sinon' // Sinon exports itself globally.
        } ,
        'jasmine-html'   :
        {
          deps           : [ 'jasmine' ] , // The HTML reporter depends on the core Jasmine library.
          exports        : 'jasmine' // It also exports 'jasmine', extending the core.
        } ,
        'jasmine-jquery' : [ 'jasmine' ] // Jasmine-jQuery is a plugin that relies on Jasmine.
      } // End of shim object
    }
  )
  ; // End of require.config call

  // The main RequireJS call to load necessary modules and begin test execution.
  require
  (
    [
      'underscore'          ,
      'backbone'            ,
      'jquery'              ,
      'jasmine-html'        ,
      'models/current-user' ,
      'models/shared-models' ,
      'sinon'
    ] ,
    function
    (
      _          ,
      Backbone   ,
      $          ,
      jasmine    ,
      currentUser ,
      sharedModels
    )
    {

      // Obtain the current Jasmine environment instance.
      var jasmineEnv       = jasmine . getEnv ( ) ;
      // Set the update interval for the Jasmine HTML reporter.
      jasmineEnv . updateInterval = 1000 ;

      // Instantiate the Jasmine HTML reporter to display test results in the browser.
      var htmlReporter     = new jasmine . HtmlReporter ( ) ;

      // Add the HTML reporter to the Jasmine environment.
      jasmineEnv . addReporter ( htmlReporter ) ;

      // Define a spec filter function for the Jasmine environment.
      // This allows the HTML reporter to control which specs are run based on URL parameters.
      jasmineEnv . specFilter = function ( spec )
      {
        return htmlReporter . specFilter ( spec ) ;
      } ;

      // Array to hold the paths of all spec files to be loaded.
      var specs            = [ ] ;

      // Populate the 'specs' array with the paths to individual test files.
      specs . push
      (
        'spec/markdown' ,
        'spec/textarea' ,
        'spec/navbar' ,
        'spec/current-user' ,
        'spec/settings' ,
        'spec/register' ,
        'spec/quest-small' ,
        'spec/quest-big' ,
        'spec/quest-add' ,
        'spec/comment' ,
        'spec/like' ,
        'spec/event' ,
        'spec/realm' ,
        'spec/realm-controls' ,
        'spec/dashboard' ,
        'spec/user-big' ,
        'spec/model/quest' ,
        'spec/model/event' ,
        'spec/model/current-user' ,
        'spec/model/realm' ,
        'spec/model/user'
      ) ;

      // --- evil mocks ---
      // Global mocks for external services to prevent actual network calls during testing.

      // Mocking Mixpanel analytics object.
      mixpanel =
      {
        init     : function ( ) { } , // No-op for initialization
        track    : function ( ) { } , // No-op for tracking events
        identify : function ( ) { } , // No-op for identifying users
        people   :
        {
          set    : function ( ) { } // No-op for setting people properties
        } ,
        alias    : function ( ) { } , // No-op for aliasing users
        name_tag : function ( ) { } // No-op for name tags
      } ;

      // Mocking Google Analytics global function.
      ga = function ( ) { } ;

      // Mocking Persona (BrowserID) navigator.id object.
      navigator . id =
      {
        watch   : function ( ) { } , // No-op for watching login status
        request : function ( ) { } , // No-op for requesting login
        logout  : function ( ) { } // No-op for logging out
      } ;

      // Start Backbone's history, which handles URL routing.
      Backbone . history . start ( ) ;

      // Initialize the current user model with dummy data for testing purposes.
      currentUser . set
      (
        {
          registered    : 1 ,
          login         : 'jasmine' ,
          _id           : '12345678901234567890abcd' ,
          settings      : { } ,
          notifications : [ ] ,
          pic           : "/current-user.png"
        }
      ) ;

      // Initialize shared realms data with test entries.
      sharedModels . realms . set
      (
        [
          { id : 'europe' , name : 'Europe' , description : 'europe-europe' , pic : 'europe.jpg' , stat : { users : 0 , quests : 0 , stencils : 0 } } ,
          { id : 'asia' , name : 'Asia' , description : 'asia-asia' , pic : 'asia.jpg' , stat : { users : 0 , quests : 0 , stencils : 0 } }
        ]
      ) ;

      // Execute this code when the DOM is fully loaded and ready.
      $
      (
        function ( )
        {
          // Load all defined spec files using RequireJS.
          require
          (
            specs ,
            function ( )
            {
              // Once all specs are loaded, execute the Jasmine test suite.
              jasmineEnv . execute ( ) ;
            }
          ) ;
        }
      ) ;

    }
  )
  ; // End of the main RequireJS module definition.

}
)
( ) ; // Execute the IIFE.