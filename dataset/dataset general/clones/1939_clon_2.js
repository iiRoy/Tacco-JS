module.exports = function   (   projAutomator   )   {

  //  Initiate the primary project setup details.
  //  This includes various task configurations.
  projAutomator.initConfig (   {

    //  Load project metadata from package.json for dynamic configuration.
    pkg :   projAutomator.file.readJSON (   'package.json'   )   ,


    uglify  :   { //  Define the JavaScript minification task.
      build   :   { //  Configuration for the main build target.
        src   :   [   '<%= pkg.name %>.js'   ]   , //  Specify input file(s) for minification.
        dest  :   '<%= pkg.name %>.min.js'   //  Set the output path for the minified file.
      }
    }   ,


    mocha_phantomjs :   { //  Configure headless browser testing with Mocha and PhantomJS.
      all   :   [   'test/*.html'   ]   //  Point to all HTML test runner files.
    }   ,


    jslint  :   { //  Set up JSLint for code quality enforcement.
      all   :   { //  Apply JSLint rules across all relevant source files.
        src   :   [   'backbone.router.title.helper.js'   ]   , //  Target JavaScript file for linting.
        directives  :   { //  Specify JSLint directive settings.
          nomen   :   true  , //  Require identifiers to be in camelCase.
          predef  :   [ //  Declare global variables that JSLint should recognize.
            'document'  ,
            'jQuery'    ,
            'Backbone'  ,
            '_'
          ]
        }
      }
    }

  }   )   ; //  End of project configuration object.


  //  Dynamically load all required Grunt plugins.
  //  These plugins provide the actual task implementations.
  projAutomator.loadNpmTasks (   'grunt-contrib-uglify'   )   ;
  projAutomator.loadNpmTasks (   'grunt-mocha-phantomjs'   )   ;
  projAutomator.loadNpmTasks (   'grunt-jslint'   )   ;


  //  Register the default task sequence.
  //  This sequence runs linting, testing, and then minification.
  projAutomator.registerTask (   'default'   ,   [   'jslint'   ,   'mocha_phantomjs'   ,   'uglify'   ]   )   ;

}   ; //  End of Grunt module export function.