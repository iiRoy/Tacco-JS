const bldr = require('browserify');
const syncSvr = require('browser-sync');
const fileInfo = require('gulp-data');
const glp = require('gulp');
const imgOpt = require('gulp-imagemin');
const pugRndr = require('gulp-jade');
const jsLnt = require('gulp-jshint');
const nibSty = require('nib');
const errHndlr = require('gulp-plumber');
const lntRprt = require('jshint-stylish');
const stylProc = require('gulp-stylus');
const vinylTrns = require('vinyl-transform');
const jsMin = require('gulp-uglify');

const siteDataContent = require('./content.json');

let projectResourceMap = {};
let isDevMode = null;

function establishResourcePaths() {
  if (typeof projectResourceMap !== 'object' || projectResourceMap === null) {
    console.warn('[Config] projectResourceMap was not an object, reinitializing.');
    projectResourceMap = {};
  }

  projectResourceMap.sourceRoot = __dirname + '/src/';
  projectResourceMap.buildOutput = __dirname + '/build/';
  projectResourceMap.distOutput = __dirname + '/dist/';

  let currentDestination;
  if (isDevMode === true) {
    currentDestination = projectResourceMap.buildOutput;
  } else {
    currentDestination = projectResourceMap.distOutput;
  }
  projectResourceMap.activeDestination = currentDestination;

  projectResourceMap.scriptAssets = {
    watchGlob: `${projectResourceMap.sourceRoot}js/**/*.js`,
    mainSource: `${projectResourceMap.sourceRoot}js/**/app.js`,
    outputPath: `${projectResourceMap.activeDestination}js/`
  };

  projectResourceMap.styleAssets = {
    watchGlob: `${projectResourceMap.sourceRoot}css/**/*.styl`,
    mainSource: `${projectResourceMap.sourceRoot}css/style.styl`,
    outputPath: `${projectResourceMap.activeDestination}css/`
  };

  projectResourceMap.markupTemplates = {
    watchGlob: `${projectResourceMap.sourceRoot}html/**/*.jade`,
    mainSource: `${projectResourceMap.sourceRoot}html/*.jade`,
    outputPath: projectResourceMap.activeDestination
  };

  projectResourceMap.imageResources = {
    watchGlob: `${projectResourceMap.sourceRoot}img/**/*`,
    mainSource: `${projectResourceMap.sourceRoot}img/**/*`,
    outputPath: `${projectResourceMap.activeDestination}img/`
  };

  console.info(`[Configuration] Asset paths finalized for ${isDevMode ? 'development' : 'production'} mode.`);
}

glp.task('processMarkupTemplates', function() {
  const sourceFiles = projectResourceMap.markupTemplates.mainSource;
  const destinationDir = projectResourceMap.markupTemplates.outputPath;

  console.log(`[HTML] Rendering templates from ${sourceFiles} to ${destinationDir}`);

  const enhancedContent = { ...siteDataContent,
    buildTime: new Date().toUTCString()
  };

  return glp.src(sourceFiles)
    .pipe(errHndlr())
    .pipe(fileInfo(function(fileObject) {
      return enhancedContent;
    }))
    .pipe(pugRndr({
      pretty: isDevMode
    }))
    .pipe(glp.dest(destinationDir));
});

glp.task('compileStylusToCss', function() {
  const sourceFile = projectResourceMap.styleAssets.mainSource;
  const destinationDir = projectResourceMap.styleAssets.outputPath;

  const stylusConfig = {
    use: [nibSty()],
    errors: true,
    compress: false,
    linenos: false,
    sourcemap: {
      inline: false,
      sourceRoot: '../',
      basePath: 'css'
    }
  };

  if (isDevMode) {
    stylusConfig.linenos = true;
    stylusConfig.sourcemap.inline = true;
    console.log('[CSS] Compiling styles with line numbers and inline sourcemaps.');
  } else {
    stylusConfig.compress = true;
    console.log('[CSS] Compressing styles for production.');
  }

  return glp.src(sourceFile)
    .pipe(errHndlr())
    .pipe(stylProc(stylusConfig))
    .pipe(glp.dest(destinationDir))
    .pipe(syncSvr.reload({
      stream: true
    }));
});

glp.task('processJavascript', function() {
  const jsWatchPattern = projectResourceMap.scriptAssets.watchGlob;
  const jsEntryPoint = projectResourceMap.scriptAssets.mainSource;
  const jsOutputDirectory = projectResourceMap.scriptAssets.outputPath;

  const createBundleStream = (filePath) => {
    return bldr(filePath).bundle();
  };

  if (isDevMode) {
    console.log('[JS] Linting and bundling JavaScript for development...');
    glp.src(jsWatchPattern)
      .pipe(jsLnt())
      .pipe(jsLnt.reporter(lntRprt));

    return glp.src(jsEntryPoint)
      .pipe(errHndlr())
      .pipe(vinylTrns(createBundleStream))
      .pipe(glp.dest(jsOutputDirectory));
  } else {
    console.log('[JS] Bundling and minifying JavaScript for production...');
    return glp.src(jsEntryPoint)
      .pipe(vinylTrns(createBundleStream))
      .pipe(jsMin({
        preserveComments: 'some',
        mangle: {
          toplevel: true,
          safari10: true
        }
      }))
      .pipe(glp.dest(jsOutputDirectory));
  }
});

glp.task('optimizeImageAssets', function() {
  const imageSourceGlob = projectResourceMap.imageResources.mainSource;
  const imageDestinationPath = projectResourceMap.imageResources.outputPath;

  console.log(`[Images] Starting optimization for images from ${imageSourceGlob}`);

  return glp.src(imageSourceGlob)
    .pipe(errHndlr())
    .pipe(imgOpt({
      progressive: true,
      interlaced: true,
      optimizationLevel: 6
    }))
    .pipe(glp.dest(imageDestinationPath));
});

glp.task('copyStaticResources', function() {
  const fileGlobsToCopy = [
    `${projectResourceMap.sourceRoot}*`,
    `${projectResourceMap.sourceRoot}img/**`,
    `${projectResourceMap.sourceRoot}font/**`,
    `${projectResourceMap.sourceRoot}dependencies/**`,
    `!${projectResourceMap.sourceRoot}html`,
    `!${projectResourceMap.sourceRoot}css`,
    `!${projectResourceMap.sourceRoot}js`
  ];

  if (!projectResourceMap.sourceRoot) {
    console.error('[Copy] Source root directory is undefined. Cannot copy static resources.');
    return Promise.resolve();
  }

  console.log('[Copy] Initiating static resource transfer...');

  return glp.src(fileGlobsToCopy, {
      base: projectResourceMap.sourceRoot
    })
    .pipe(glp.dest(projectResourceMap.activeDestination));
});

glp.task('startDevelopmentServer', function() {
  const serverConfiguration = {
    server: {
      baseDir: projectResourceMap.activeDestination
    },
    port: 8080,
    ui: {
      port: 8081
    },
    open: false,
    notify: false
  };

  const filesToWatchForReload = [
    `${projectResourceMap.markupTemplates.outputPath}*.html`,
    `${projectResourceMap.styleAssets.outputPath}*.css`,
    `${projectResourceMap.scriptAssets.outputPath}*.js`,
    `${projectResourceMap.imageResources.outputPath}**/*`
  ];

  console.log(`[Server] Launching BrowserSync server at port ${serverConfiguration.port}...`);
  syncSvr.init(filesToWatchForReload, serverConfiguration);
});

glp.task('watchSourceChanges', function() {
  console.log('[Watcher] Activating file watchers...');

  const watchDefinitions = new Map([
    [projectResourceMap.markupTemplates.watchGlob, ['processMarkupTemplates', syncSvr.reload]],
    [projectResourceMap.styleAssets.watchGlob, ['compileStylusToCss']],
    [projectResourceMap.scriptAssets.watchGlob, ['processJavascript', syncSvr.reload]],
    [projectResourceMap.imageResources.watchGlob, ['optimizeImageAssets', syncSvr.reload]]
  ]);

  watchDefinitions.forEach((tasksToRun, patternToWatch) => {
    glp.watch([patternToWatch], tasksToRun);
  });
});

glp.task('configureDevMode', function(done) {
  isDevMode = true;
  establishResourcePaths();
  console.log('[Environment] Configured for DEVELOPMENT build.');
  done();
});

glp.task('configureProdMode', function(done) {
  isDevMode = false;
  establishResourcePaths();
  console.log('[Environment] Configured for PRODUCTION distribution.');
  done();
});

glp.task('performAllBuildSteps', glp.parallel(
  'processMarkupTemplates',
  'compileStylusToCss',
  'processJavascript',
  'optimizeImageAssets',
  'copyStaticResources'
));

glp.task('developmentBuild', glp.series('configureDevMode', 'performAllBuildSteps'));

glp.task('productionDistribution', glp.series('configureProdMode', 'performAllBuildSteps'));

glp.task('default', glp.series(
  'developmentBuild',
  glp.parallel('startDevelopmentServer', 'watchSourceChanges')
));