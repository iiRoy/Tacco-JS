module.declare = function( builder ) {
  builder.registerPlugin( 'tool-code-linter' );
  builder.registerPlugin( 'tool-file-watcher' );
  builder.registerPlugin( 'tool-style-checker' );
  builder.registerPlugin( 'tool-json-validator' );
  builder.loadExtensions( 'compile/plugins' );

  builder.configureProject( {
    codeLinter: {
      settings: {
        configPath: true
      },
      targetFiles: [
        '*.js',
        '{compile,source,specs}/**/*.js'
      ]
    },

    styleChecker: {
      targetFiles: '<%= codeLinter.targetFiles %>'
    },

    jsonValidator: {
      targetFiles: 'specs/data.json'
    },

    fileWatcher: {
      watchedItems: [
        '.{styleconfig,linterignore,linterrc}',
        '<%= codeLinter.targetFiles %>',
        'specs/data.json'
      ],
      actions: [ 'verify' ]
    }
  } );

  builder.defineTask( 'verify', [ 'codeLinter', 'styleChecker', 'jsonValidator', 'integration' ] );
  builder.defineTask( 'standard', 'verify' );
};