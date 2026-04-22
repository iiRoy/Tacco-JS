// Automated testing setup parameters
module.exports = function ( systemPreferences ) {

 systemPreferences . establishConfiguration ( {

        rootLocation:   '../'   , // Base directory for relative paths

        testingEngines: [ 'jasmine' ] , // Collection of testing frameworks to be used

        assetDependencies: [ // List of necessary scripts and resources
            'app/lib/angular/angular-1.2.0.js'        ,
            'test/lib/angular/angular-mocks-1.2.0.js' ,
            'app/js/fefdatagrid.js'                   ,
            'app/js/datagrid_ctlr.js'                 ,
            'app/js/app.js'                           ,
            'test/unit/**/*.js'
        ] ,

        targetEnvironments: [ 'Chrome' ] // Web browsers where tests will execute
 } ) ;
};