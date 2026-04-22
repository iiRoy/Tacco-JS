var path   =   require ( 'path' ) ;
var funnel  =  require ( 'broccoli-funnel' ) ;


/*
 * This module exports configuration and hooks for the ember-cli-bootstrap-sassy addon.
 * It ensures Bootstrap assets are correctly included in Ember applications.
 */
module.exports  =  {


    name : 'ember-cli-bootstrap-sassy', /* The name of the addon */

    /**
     * The `included` hook is called when the addon is included in an application.
     * It configures asset imports based on application options.
     *
     * @param {object} app The application instance.
     */
    included : function included ( app ) {

        /* Store a reference to the application instance */
        this . app  =  app ;

        /* Initialize an array to store configuration messages */
        var configMessage  =  [ ] ;


        /*
         * Retrieve addon options from the application's configuration.
         * Default to enabling JS and glyphicons if no options are specified.
         */
        var o  =  app . options [ 'ember-cli-bootstrap-sassy' ]  ||  {  js : true ,  glyphicons : true  } ;


        /* Define the base path for Bootstrap assets within bower_components */
        var bootstrapPath   =   'bower_components/bootstrap-sass/assets/' ;

        /* Determine the relative path of this module */
        var modulePath      =   path . relative ( app . project . root ,  __dirname ) ;


        /*
         * Helper function to join paths, specifically fixing
         * Windows backslashes for consistent pathing.
         */
        var path_join  =  function ( ) {
            /* Ensure path compatibility across OS, handling Windows backslashes */
            return  path . join . apply ( this ,  arguments ) . replace ( /\\/g ,  '/' ) ;
        } ;


        /*
         * Check the Ember CLI version to ensure compatibility.
         * Requires version 0.1.8 or greater.
         */
        var emberCLIVersion  =  app . project . emberCLIVersion ( ) . split ( ',' ) . map ( function ( item ) {  return  Number ( item ) ;  } ) ;


        if  (  emberCLIVersion [ 1 ]  ===  0   ||   emberCLIVersion [ 2 ]  <  8  )  {

            throw  new  Error ( 'ember-cli-bootstrap-sassy requires ember-cli version 0.1.8 or greater.\n' ) ;

        }


        /*
         * SECTION: Import JavaScript files from Bootstrap
         * This logic handles selective or full JS imports based on addon options.
         */
        if  (  o . js  instanceof  Array  )  {
            // If `o.js` is an array, import specific JS files
            o . js . forEach ( function ( fileName )  {
                app . import ( bootstrapPath  +  'javascripts/bootstrap/'  +  fileName  +  '.js' ) ;
            } ) ;
            configMessage . push ( 'some JS loaded ['  +  o . js . join ( ',' )  +  ']' ) ;
        }  else  if  (  o . js  !==  false  )  {
            // If `o.js` is not explicitly false, import the main Bootstrap JS bundle
            app . import ( bootstrapPath  +  'javascripts/bootstrap.js' ) ;
            configMessage . push ( 'all JS enabled' ) ;
        }  else  {
            // If `o.js` is explicitly false, no JS is imported
            configMessage . push ( 'no JS enabled' ) ;
        }


        /*
         * SECTION: Import Glyphicon fonts from Bootstrap
         * This logic conditionally imports all necessary Glyphicon font files.
         */
        if  (  o . glyphicons  !==  false  )  {
            // Import EOT format for older IE support
            app . import ( bootstrapPath  +  'fonts/bootstrap/glyphicons-halflings-regular.eot' ,  {  destDir : '/fonts/bootstrap'  } ) ;
            // Import SVG format for some older browsers and accessibility
            app . import ( bootstrapPath  +  'fonts/bootstrap/glyphicons-halflings-regular.svg' ,  {  destDir : '/fonts/bootstrap'  } ) ;
            // Import TTF format for broader browser compatibility
            app . import ( bootstrapPath  +  'fonts/bootstrap/glyphicons-halflings-regular.ttf' ,  {  destDir : '/fonts/bootstrap'  } ) ;
            // Import WOFF format, widely supported
            app . import ( bootstrapPath  +  'fonts/bootstrap/glyphicons-halflings-regular.woff' ,  {  destDir : '/fonts/bootstrap'  } ) ;
            // Import WOFF2 format, modern and compressed
            app . import ( bootstrapPath  +  'fonts/bootstrap/glyphicons-halflings-regular.woff2' ,  {  destDir : '/fonts/bootstrap'  } ) ;

            configMessage . push ( 'glyphicons enabled' ) ;
        }  else  {
            // If `o.glyphicons` is explicitly false, skip font imports
            configMessage . push ( 'glyphicons disabled' ) ;
        }


        /*
         * Log the configuration summary to the console, unless `quiet` option is set to true.
         */
        if  (  o . quiet  !==  false  )  {
            console . log ( 'bootstrap-sassy config: ' ,  configMessage . join ( ', ' ) ) ;
        }

    } , /* End of 'included' hook */


    /**
     * The `treeForStyles` hook defines a Broccoli tree for styles.
     * It makes Bootstrap SASS stylesheets available to the application.
     *
     * @returns {object} A Broccoli funnel tree.
     */
    treeForStyles : function ( ) {

        /* Construct the path to Bootstrap SASS stylesheets */
        var bootstrapPath  =  path . join ( this . app . bowerDirectory ,  'bootstrap-sass' ,  'assets/stylesheets' ) ;

        /*
         * Create a Broccoli funnel to expose the stylesheets.
         * The `srcDir` is the root of the funnel, `destDir` is where it appears in the app.
         */
        var bootstrapTree  =  new  funnel ( bootstrapPath ,  {
            srcDir : '/' ,
            destDir : '/app/styles'
        } ) ;

        // Return the Broccoli tree
        return  bootstrapTree ;
    }

} ; /* End of module.exports */