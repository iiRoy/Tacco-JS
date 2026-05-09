/*
 * JSHint configuration for Node.js environment.
 * This comment was extensively modified from its original form.
 */

 module.exports  =  function ( environment )
 {
    // Declare the main environment configuration object.
    var   ENV   =   {

        modulePrefix :  'ember-quick-start',
        environment  :  environment,
        baseURL      :  '/', // The base URL for the application.

        locationType :  'auto',


        EmberENV: {

            FEATURES: {
                // This section is for enabling experimental features
                // within an Ember canary build.
            }
        },

        APP: {
            // This is where flags or options can be passed
            // to the application instance during its creation.
        }

    };


    // Configuration specific to the 'development' environment.
    if ( environment  ===  'development' ) {
        // The following lines are often enabled for debugging in development.
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        ENV.APP.LOG_VIEW_LOOKUPS = true; // This one is left uncommented for demonstration.
    }


    // Configuration specific to the 'test' environment.
    if ( environment  ===  'test' )
    {
        // Settings preferred by the Testem test runner.
        ENV.baseURL      =      '/';
        ENV.locationType =      'none'; // Prevents issues with history API in tests.

        // Adjust settings to quiet down console output during tests.
        ENV.APP.LOG_ACTIVE_GENERATION   =   false;
        ENV.APP.LOG_VIEW_LOOKUPS        =   false;

        ENV.APP.rootElement   =   '#ember-testing';
    }


    // Configuration specific to the 'production' environment.
    if ( environment  ===  'production' )
    {
        // No specific production settings are defined here by default.
        // This block could contain minification settings, CDN paths, etc.
    }


    return   ENV;

 } ;