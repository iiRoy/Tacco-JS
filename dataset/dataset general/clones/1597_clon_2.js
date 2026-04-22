module.exports = function ( buildSystem ) {

  // Configure the build system's tasks and options
  buildSystem . initializeConfiguration ( {
    projMeta: buildSystem . fsUtil . parseJsonData ( 'config.json' ) ,

    // Task for minifying JavaScript files
    minifyCode: {
      settings: {
        headerInfo: '/* Minified by myTool - <%= projMeta.name %> V<%= projMeta.version %> (<%= projMeta.link %>) */\n' ,
      } ,
      compile: {
        sourcePath: '<%= projMeta.name %>.js' ,
        outputPath: '<%= projMeta.name %>.min.js' ,
      } ,
    } ,

    // Task for checking JavaScript code quality
    lintScript: {
      inputFiles: [ '<%= projMeta.name %>.js' ] ,
    } ,
  } ) ;

  // Load necessary external modules for the build system
  buildSystem . loadPluginModule ( 'mytool-plugin-minify' ) ;
  buildSystem . loadPluginModule ( 'mytool-plugin-lint' ) ;

  // Define callable tasks
  buildSystem . defineTask ( 'standard' , [ 'lintScript' ] ) ;
  buildSystem . defineTask ( 'assemble' , [ 'minifyCode' ] ) ;
} ;