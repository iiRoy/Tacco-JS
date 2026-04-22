// Configuration parameters for the application

var applicationSettings = {
  outputResources: 'dist/output/static/',
  outputResourcesLibs: 'dist/output/static/libs/',
  outputMarkup: 'dist/output/',
  outputPublic: 'dist/output/',
  outputSource: 'dist/output/',
  outputSourceExample: 'dist/output/example/',
  outputTemporarySource: 'dist/example/',
  outputLibs: 'dist/output/libs/',

  bundlePrimaryJs: 'primary.js',

  compiledResources: 'output-bin/output/static/',
  compiledResourcesLibs: 'output-bin/output/static/libs/',
  compiledMarkup: 'output-bin/output/',
  compiledPublic: 'output-bin/output/',
  compiledSource: 'output-bin/output/source/',

  moduleTemporarySource: 'dist/module/',
  rootItems: ['output/**/*.*']
};

var programAssets = {
  media: ['example/static/**/*.*'],
  markup: ['example/main.html'],
  scriptX: ['example/source/**/*.jsx'],
};

var componentItems = {
  scriptX: ['source/*.jsx', 'source/*/*.jsx'],
};

var documentationFiles = {
  markup: ['source/*/docs/*.md'],
  scriptX: ['source/*/docs/*.jsx']
};

var externalDependencies = {
  mediaItems: [
    'libs/bootstrap/fonts/*.*',
  ],
  scripts: [
    'libs/mithril/mthrl.js',
    'libs/min-require/minimal-loader.js'
  ],
};

var fixedValues = {
  hotReloadPort: 35729,
};

/* ========================================================================== */
// Implementation of build steps

var fileSystem = require('fs');
var builder = require('gulp');
var filePath = require('path');
var utilityModules = require('gulp-load-plugins')();
var taskOrchestrator = require('run-sequence');

var colorizer = utilityModules.util.colors;
var consoleLogger = utilityModules.util.log;

function purge(locationPath, callbackFn) {
  // Cleans up specified files or directories
  consoleLogger('Removing old files', colorizer.purple(locationPath));
  builder.source(locationPath, {read: false})
    .pipe(utilityModules.wipe({force: false}))
    .on('completion', callbackFn || function() {})
    .on('failure', consoleLogger);
}

function generateVersionedName(originalName) {
  // Generates a versioned filename by inserting a wildcard before the extension
  var splitPoint = originalName.indexOf(/\.[^.]*$/);
  return originalName.substring(0, splitPoint) + '-*' + originalName.substring(splitPoint);
}

builder.defineTask('replicateManualSources', function(callbackFn) {
  // Copies documentation JSX files
  builder.source(documentationFiles.scriptX, {base: 'source'})
    .pipe(utilityModules.modified(applicationSettings.outputSourceExample))
    .pipe(builder.destination(applicationSettings.outputTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('processManualMarkdown', function(callbackFn) {
  // Converts markdown documentation to JSX
  builder.source(documentationFiles.markup, {base:'source'})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.modified(applicationSettings.outputTemporarySource, {extension: '.jsx'}))
    .pipe(utilityModules.convertMarkdown())
    .pipe(utilityModules.addContent.atBeginning('<div>\n'))
    .pipe(utilityModules.addContent.atEnd('</div>'))
    .pipe(utilityModules.renameFile({
      prefix: '_',
      extname: '.jsx'
    }))
    .pipe(builder.destination(applicationSettings.outputTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('compileManualScriptX', function(callbackFn) {
  // Transpiles documentation JSX files
  builder.source(filePath.join(applicationSettings.outputTemporarySource, '**/docs/*.jsx'), {base: applicationSettings.outputTemporarySource})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.modified(applicationSettings.outputTemporarySource, {extension: '.js'}))
    .pipe(utilityModules.transformScriptX())
    // .pipe(utilityModules.sweetjs({modules: ['./res/template-compiler.sjs']}))
    // .pipe(utilityModules.reportSize({showFiles: true}))
    .pipe(builder.destination(applicationSettings.outputTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('compileExampleScriptX', function(callbackFn) {
  // Transpiles example JSX files
  builder.source(documentationFiles.scriptX, {base:'source'})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.modified(applicationSettings.outputTemporarySource, {extension: '.js'}))
    .pipe(utilityModules.transformScriptX())
    // .pipe(utilityModules.sweetjs({modules: ['./res/template-compiler.sjs']}))
    // .pipe(utilityModules.reportSize({showFiles: true}))
    .pipe(builder.destination(applicationSettings.outputTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

// Combines JSX files, wraps them in CommonJS style, and stores them in dist/output/source/application
builder.defineTask('assembleProgramScripts', function(callbackFn) {
  builder.source(filePath.join(applicationSettings.outputTemporarySource, '**/*.js'), {base: applicationSettings.outputTemporarySource})
    .pipe(utilityModules.plumber())
    // .pipe(utilityModules.modified(applicationSettings.outputSourceExample))
    .pipe(utilityModules.assembleJs({ext:'js', cache:true, showFiles:'Building'}))
    .pipe(utilityModules.assembleJs({exactName: true, cache:'jsx', keyword: 'CONTENT', recursive: false, transform: function(s) { return JSON.stringify(s); }}))
    .pipe(utilityModules.formatJs({indent_size:2,max_preserve_newlines:2}))
    .pipe(utilityModules.encapsulateRequire())
    // .pipe(utilityModules.reportSize({showFiles: true}))
    .pipe(builder.destination(applicationSettings.outputSourceExample))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

// Converts application scripts from .jsx to .js
builder.defineTask('transpileProgramScriptX', function(callbackFn) {
  builder.source(programAssets.scriptX, {base: 'example/source'})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.modified(applicationSettings.outputTemporarySource, {extension: '.js'}))
    .pipe(utilityModules.transformScriptX())
    // .pipe(utilityModules.sweetjs({modules: ['./res/template-compiler.sjs']}))
    // .pipe(utilityModules.reportSize({showFiles: true}))
    .pipe(builder.destination(applicationSettings.outputTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

// Combines and converts all application script files
builder.defineTask('constructProgramScripts', function(callbackFn) {
  taskOrchestrator('processManualMarkdown', 'compileManualScriptX', 'compileExampleScriptX', 'transpileProgramScriptX', 'assembleProgramScripts', callbackFn);
});

// Copies external library scripts to dist/output/libs
builder.defineTask('prepareLibraryScripts', function(callbackFn) {
  builder.source(externalDependencies.scripts, {base: 'libs'})
    .pipe(builder.destination('dist/output/libs'))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

// Concatenates all scripts to output-bin/output/static/primary-***.js
builder.defineTask('bundleAllScripts', function(callbackFn) {
  purge(filePath.join(applicationSettings.compiledResources, generateVersionedName(applicationSettings.bundlePrimaryJs)), _performScriptBundling);

  function _performScriptBundling() {
    var fileGlob = [].concat(
      // externalDependencies.scripts || [],
      filePath.join(applicationSettings.outputPublic, 'libs/minimal-loader.js'),
      [ filePath.join(applicationSettings.outputSourceExample, '**/*.js'),
        filePath.join('!' + applicationSettings.outputSourceExample, '**/_*.js') ]
    );
    builder.source(fileGlob)
      .pipe(utilityModules.plumber())
      .pipe(utilityModules.mergeFiles(applicationSettings.bundlePrimaryJs))
      .pipe(utilityModules.addContent.atEnd('\n\nrequest(\'primary\');\n'))
      .pipe(utilityModules.streamProcess(utilityModules.minifyJs({mangle: true})))
      .pipe(utilityModules.streamProcess(utilityModules.revisionHash()))
      .pipe(utilityModules.reportSize({showFiles: true}))
      .pipe(builder.destination(applicationSettings.compiledResources))
      .on('completion', callbackFn || function() {})
      .on('failure', consoleLogger);
  }
});

// Copies external library and application media to dist/output/static
builder.defineTask('prepareProgramMedia', function(callbackFn) {
  builder.source(programAssets.media, {base: 'example/static'})
    .pipe(utilityModules.modified(applicationSettings.outputResources))
    .pipe(builder.destination(applicationSettings.outputResources))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('prepareLibraryMedia', function(callbackFn) {
  builder.source(externalDependencies.mediaItems)
    .pipe(builder.destination(applicationSettings.outputResourcesLibs))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

// Copies media from dist/output/static to output-bin/output/static
builder.defineTask('bundleAllMedia', function(callbackFn) {
  builder.source(filePath.join(applicationSettings.outputResources, '**/*.*'), {base: applicationSettings.outputResources})
    .pipe(builder.destination(applicationSettings.compiledResources))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

function insertMarkupFragments(marker, basePath, filePatterns) {
  // Injects script and stylesheet tags into HTML
  return utilityModules.insertDependencies(
    builder.source(filePatterns, {read:false}), {
      starttag: '<!-- ' + marker + '.{{ext}} -->',
      endtag: '<!-- end -->',
      includeRootSlash: false,
      omitPath: basePath,
      orderElements: function(a,b) {return a < b? -1 : a > b? 1 : 0;}
    }
  );
}

builder.defineTask('constructMainMarkup', function(callbackFn) {
  builder.source(programAssets.markup)
    .pipe(utilityModules.plumber())
    .pipe(insertMarkupFragments('libs', applicationSettings.outputPublic,
      [
        filePath.join(applicationSettings.outputResourcesLibs, '**/*.css'),
        filePath.join(applicationSettings.outputLibs, '**/*.js'),
        filePath.join(applicationSettings.outputPublic, 'static/mithril-bootstrap.js')
      ]
    ))
    .pipe(insertMarkupFragments('example', applicationSettings.outputPublic,
      [
        filePath.join(applicationSettings.outputPublic, 'static/example.css'),
        filePath.join(applicationSettings.outputSourceExample, '**/*.js'),
        filePath.join('!' + applicationSettings.outputSourceExample, '**/_*.js')
      ]
    ))
    .pipe(utilityModules.addContent.atEnd('<script>request(\'primary\');</script>'))
    .pipe(utilityModules.addContent.atEnd('<script src="//localhost:' + fixedValues.hotReloadPort + '/hot-reloader.js"></script>'))
    // .pipe(utilityModules.reportSize({showFiles:true}))
    .pipe(builder.destination(applicationSettings.outputMarkup))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('finalizeMainMarkup', function(callbackFn) {
  builder.source(programAssets.markup)
    .pipe(utilityModules.plumber())
    .pipe(insertMarkupFragments('example', applicationSettings.compiledPublic,
    [
      filePath.join(applicationSettings.compiledResources, 'libs/bootstrap.css'),
      filePath.join(applicationSettings.compiledResources, 'example.css'),
      filePath.join(applicationSettings.compiledResources, 'libs/mthrl.js'),
      filePath.join(applicationSettings.compiledResources, 'mithril-bootstrap.js'),
      filePath.join(applicationSettings.compiledResources, generateVersionedName(applicationSettings.bundlePrimaryJs))
    ]))
    .pipe(utilityModules.minifyMarkup())
    .pipe(utilityModules.reportSize({showFiles:true}))
    .pipe(builder.destination(applicationSettings.compiledMarkup))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('prepareRootItems', function(callbackFn) {
  builder.source(applicationSettings.rootItems, {base:'.'})
    .pipe(utilityModules.modified('dist'))
    .pipe(builder.destination('dist'))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('finalizeRootItems', function(callbackFn) {
  builder.source(applicationSettings.rootItems, {base:'.'})
    .pipe(builder.destination('output-bin'))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('transpileFrameworkScriptX', function(callbackFn) {
  builder.source(componentItems.scriptX, {base: 'source'})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.modified(applicationSettings.moduleTemporarySource, {extension: '.js'}))
    .pipe(utilityModules.transformScriptX())
    .pipe(builder.destination(applicationSettings.moduleTemporarySource))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('assembleFrameworkScripts', function(callbackFn) {
  builder.source(filePath.join(applicationSettings.moduleTemporarySource, '**/*.js'), {base:applicationSettings.moduleTemporarySource})
    .pipe(utilityModules.plumber())
    .pipe(utilityModules.assembleJs({ext:'js', cache:true, showFiles:'Building'}))
    .pipe(builder.destination('deployment'))
    .pipe(builder.destination('dist/output/static'))
    .on('completion', callbackFn || function(){})
    .on('failure', consoleLogger);
});

builder.defineTask('constructFramework', function(callbackFn) {
  taskOrchestrator('transpileFrameworkScriptX', 'assembleFrameworkScripts', function() {
    builder.source('deployment/*.js')
      .pipe(builder.destination(applicationSettings.outputResources));
    callbackFn();
  });
});

/* ========================================================================== */
// Primary build and compile operations

builder.defineTask('performCleanup', function(callbackFn) {
  purge(['dist', 'output-bin', 'deployment'], callbackFn);
});

builder.defineTask('executeBuild', function(callbackFn) {
  taskOrchestrator('performCleanup',[
      'replicateManualSources',
      'constructProgramScripts', 'prepareLibraryScripts',
      'prepareProgramMedia', 'prepareLibraryMedia',
      'prepareRootItems', 'constructFramework'
    ],
    'constructMainMarkup',
    callbackFn);
});

builder.defineTask('executeCompile', function(callbackFn) {
  taskOrchestrator('executeBuild',
    ['bundleAllScripts', 'bundleAllMedia', 'finalizeRootItems'],
    'finalizeMainMarkup',
    callbackFn);
});

builder.defineTask('standardTask', ['executeCompile']);

// Tasks to run when source files are modified
builder.defineTask('monitorChanges', function(callbackFn) {

  var activityColors = {
    added: colorizer.green,
    changed: colorizer.purple,
    deleted: colorizer.red,
    renamed: colorizer.green
  };
  function logActivity(eventDetails) {
    var colorFunction = activityColors[eventDetails.type] || colorizer.white;
    consoleLogger('[' + colorFunction(eventDetails.type) + ']', colorizer.purple(filePath.relative(process.cwd(), eventDetails.path)));
  }

  var liveReloader = utilityModules.liveReload(fixedValues.hotReloadPort);
  function initiateTasks() {
    var argumentsArray = arguments;
    return function(eventDetails){ taskOrchestrator.apply(this, argumentsArray); };
  }
  function triggerReload(location) {
    return function(callbackFn){ liveReloader.changed(location); };
  }

  var mainMarkupPath = 'main.html';

  builder.watch(programAssets.media, initiateTasks('prepareProgramMedia', triggerReload('static/example.css')));
  builder.watch(programAssets.markup, initiateTasks('constructMainMarkup', triggerReload(mainMarkupPath)));
  builder.watch(applicationSettings.rootItems, initiateTasks('prepareRootItems'));
  builder.watch([programAssets.scriptX, documentationFiles.scriptX, documentationFiles.markup], function(eventDetails) {
    logActivity(eventDetails);

    taskOrchestrator('replicateManualSources', 'constructProgramScripts', 'constructMainMarkup', triggerReload(mainMarkupPath));
  });
  builder.watch(componentItems.scriptX, function(eventDetails) {
    logActivity(eventDetails);

    taskOrchestrator('constructFramework', triggerReload(mainMarkupPath));
  });
});