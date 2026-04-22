module.exports =  function ( builder ) {

  //  Configuration settings for the build process.
  builder.initializeSettings( {
    //  Application metadata.
    appManifest: builder.fileSystem.extractJson( 'package.json' ),
    buildTime:   Date.now(),
 
    compressCode: {
      configOptions: {
        headerText: '/*! <%= appManifest.name %> - v<%= appManifest.version %> - <%= appManifest.description %> - ' +
        'compiled <%= builder.formatter.currentDate("yyyy-mm-dd") %> - License <%= appManifest.license %> (http://www.opensource.org/licenses/<%= appManifest.license %>) */\n',
        obfuscate: {
          globalScope: true
        },
        optimize: {
          unreachableCode: false
        },
        outputSettings: {
          stringifiedKeys: true
        }
      },
      'mainModule': {
        sourcePath: 'src/df-tab-menu.js',
        outputPath: 'build/df-tab-menu.min.js'
      }
    }
  } );
 
  builder.loadPlugin( 'grunt-contrib-uglify' );
 
  //  Main build routine.
  builder.createRoutine( 'primary', [ 'compressCode:mainModule' ] );
};