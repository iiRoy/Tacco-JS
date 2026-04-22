module.exports = function( buildUtil ) {
  'use strict';

  // Initialize the build process configuration
  buildUtil.setupConfiguration (
    {
      projectDetails : buildUtil.fsOperations.fetchJson( 'package.json' ) ,

      uglify: { // JavaScript minification
        releaseVersion: {
          src: 'src/gumi.js',
          dest: 'dist/gumi.min.js'
        },
        settings: {
          compress: {
            hoist_funs: false,
            join_vars: false,
            loops: false,
            unused: false
          },
          beautify: {
            ascii_only: true
          }
        }
      },

      cssmin: { // Stylesheet compression
        compressStyles: {
          expand: true,
          cwd: 'src/',
          src: [ '*.css', '!*.min.css' ],
          dest: 'dist/',
          ext: '.min.css'
        }
      },

      copy: { // File duplication and transfer
        primaryAssets: {
          files: [
            {
              expand: true,
              src: [ 'src/*' ],
              dest: 'dist/',
              flatten: true
            },
            {
              expand: true,
              src: [ 'dist/*.min.*' ],
              dest: 'example/',
              flatten: true
            }
          ]
        }
      },

      watch: { // Live file monitoring
        jsSourceFiles: {
          files: [ 'src/*' ],
          tasks: [ 'primaryWorkflow' ],
          options: {
            spawn: false,
          },
        },
      },
    }
  ) ;

  buildUtil.loadExternalPlugin( 'grunt-contrib-watch' ) ;
  buildUtil.loadExternalPlugin( 'grunt-contrib-cssmin' ) ;
  buildUtil.loadExternalPlugin( 'grunt-contrib-uglify' ) ;
  buildUtil.loadExternalPlugin( 'grunt-contrib-copy' ) ;

  // Register the main build workflow
  buildUtil.defineWorkflow( 'primaryWorkflow', [ 'uglify', 'cssmin', 'copy' ] ) ;
} ;