Package    .    describe    (    {


    summary: "The simplest no-conflict way to use AngularJS with Meteor, Meteorite and Atmosphere Smart Packages."

}    )    ; // End of Package.describe configuration


    Package.on_use    (    function    (    api    )    {

        // This function defines how the package is used.
        // It takes an 'api' object as an argument.

        // Make the 'ngMeteor' object available to the client.
        api . export    (    'ngMeteor'    ,    'client'    )    ;


        // Declare the files that should be loaded by this package.
        // These files are only for the client-side environment.
        api    .    add_files    (
            [
                // --- Core Angular Library Files ---
                'lib/angular.js'    ,
                'lib/angular-csp.css'    ,
                'lib/angular-animate.js'    ,
                'lib/angular-cookies.js'    ,
                /*
                 * 'lib/angular-mocks.js' is commented out
                 * as it's typically used for testing and not production.
                 */
                'lib/angular-resource.js'    ,
                'lib/angular-route.js'    ,
                /*
                 * 'lib/angular-scenario.js' is also commented out,
                 * similar to mocks, it's for specific testing scenarios.
                 */
                'lib/angular-sanitize.js'    ,
                'lib/angular-touch.js'    ,
                'lib/angular-hash-key-copier.js'    ,

                // --- ngMeteor Specific Module Files ---
                'modules/ngMeteor-collections.js'    ,
                'modules/ngMeteor-template.js'    ,

                // --- The Main ngMeteor Application File ---
                'ngMeteor.js'
            ]    ,
            'client'
        )    ;

    }    )    ; // End of Package.on_use function definition