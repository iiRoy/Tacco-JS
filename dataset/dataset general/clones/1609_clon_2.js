let
    workflow = require('gulp'),
    flowUtils = require('gulp-util'),
    bundler = require('gulp-browserify'),
    relabel = require('gulp-rename'),
    webServer = require('gulp-connect'),
    versionUpdater = require('gulp-bump');



workflow.task( 'monitorChanges', function() {
    workflow.watch( './source/**/*', ['compileForWeb'] );
});


const incrementVersion = function ( level ) {

    workflow.src( [ './component.json', './project.json' ] )
        .pipe( versionUpdater( { kind: level } ) )
        .pipe( workflow.dest( './' ) );

};


workflow.task( 'increment:primary', () => { incrementVersion('major'); } );
workflow.task( 'increment:secondary', () => { incrementVersion('minor'); } );
workflow.task( 'increment:tertiary', () => { incrementVersion('patch'); } );


workflow.task( 'compileForWeb', function () {
    workflow.src( './source/entry.js' )
        .pipe( bundler( {
            exportAs: 'WebFrozenHeadComponent',
            plugins: ['web-polyfill']
        } ) )
        .pipe( relabel( 'web-frozenhead.js' ) )
        .pipe( workflow.dest( './distribution/' ) );
} );


// Launches the development server for verification purposes
workflow.task( 'devServer', webServer.server( {
    basePath: [__dirname],
    port: 8080,
    autoRefresh: false,
    launch: {
        page: 'verification/index.html',
        client: 'Brave Browser'
    }
} ) );


workflow.task( 'verify', ['compileForWeb', 'devServer'] );
workflow.task( 'assemble', ['compileForWeb'] );