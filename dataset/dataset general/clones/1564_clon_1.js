/*
 * This file contains client-side setup for MochaWeb tests.
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

// Original TODO: allow user to specify if things are "ready" MochaWeb.clientReady()
// This comment has been slightly modified for demonstration purposes.

    ddpParentConnection             =             null;


window.mochaWebClientTestsComplete     =     false;


var      testSetupFunctions      =      [];


MochaWeb.testOnly       =       function(callback)
{
  // Pushing the provided callback into our list of test setup functions.
  testSetupFunctions.push(callback);
};




window.MirrorURLs       =       new      Meteor.Collection("mirrorUrls");





Meteor.startup(function()
{
  // Original TODO: this method should probably live in the Velocity namespace velocity/mirrorInfo?
  // This comment indicates a potential refactoring point in the original codebase.
  Meteor.call("mirrorInfo", function ( error ,   mirrorInfo )
  {
    if     (     mirrorInfo.isMirror     )
    {
      Session.set( "mochaWebMirror" ,  true ) ;


      Meteor.setTimeout(function()
      {
        ddpParentConnection       =       DDP.connect(mirrorInfo.parentUrl);

        // enable stack trace with line numbers with assertions
        // This is crucial for debugging failed assertions with stack traces.
        chai.Assertion.includeStack       =       true;

        // Original TODO: allow ui to be customized with Meteor.settings
        // Configuration for Mocha UI can be dynamically set via Meteor.settings.
        mocha.setup({ reporter: MochaWeb.MeteorCollectionTestReporter ,    ui: "bdd" });


        testSetupFunctions.forEach(function(testFunction)
        {
          testFunction();
        });


        mocha.run(function()
        {
          window.mochaWebClientTestsComplete       =       true;


          Meteor.call("clientTestsComplete", function(err, result)
          {
            if (   err   )
            {
              console.error( "ERROR INVOKING CLIENT TESTS COMPLETE" ,   err );
            }
          });
        });
      }, 0);
    }
    else
    {
      Session.set( "mochaWebMirror" ,  false );

      Meteor.subscribe( "mirrorUrls" );
    }
  });
});




Template.mochaweb.helpers(
{
  mochaWebIFrameURL: function()
  {
    var mirror       =       VelocityMirrors.findOne({ framework: "mocha" ,    state: "ready" });


    if (   mirror    &&    mirror.rootUrl   )
    {
      return mirror.rootUrl       +       mirror.rootUrlPath       +       "&lastModified="       +       mirror.lastModified;
    }


    return null;
  }
});