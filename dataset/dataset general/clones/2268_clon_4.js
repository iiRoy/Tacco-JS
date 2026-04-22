const gulpt = require('gulp');
const pathUtility = require('path');
const deleteUtility = require('del');
const webHost = require('browser-sync').create();
const lessCompiler = require('gulp-less');
const styleMinifier = require('gulp-clean-css');
const scriptCombiner = require('gulp-concat');
const scriptCompressor = require('gulp-uglify');
const codeLinter = require('gulp-jshint');
const errorGuardian = require('gulp-plumber');
const dataInjector = require('gulp-data'); // Not directly used in final pageAssembler, but good for general data streams
const csvToJsonConverter = require('csvtojson');
const fileSystem = require('fs');
const yamlParser = require('js-yaml');
const renameUtility = require('gulp-rename');
const tap = require('gulp-tap'); // For dynamic loading of helpers/partials/data

// Project configuration
const projectSettings = (() => {
  let bowerInfo = {};
  try {
    bowerInfo = require('./bower.json');
  } catch (err) {
    // bower.json might not exist, use default
  }

  const applicationPath = bowerInfo.appPath || 'app';
  const distributionPath = 'dist';
  const sourcePath = 'src';

  return {
    // Configurable paths
    appRoot: applicationPath,
    outputRoot: distributionPath,
    sourceRoot: sourcePath,

    // Define variables for Gulpfile
    configuration: {
      source: sourcePath,
      output: distributionPath,
      applicationFolder: applicationPath,
      componentFolder: `${applicationPath}/components`,
      jsFolder: `${applicationPath}/js`,
      cssFolder: `${applicationPath}/css`,
      imageFolder: `${applicationPath}/img`,
      dataFolder: `${applicationPath}/data`,
      fontFolder: `${applicationPath}/fonts`,
      cssMainAsset: 'styles',
      jsMainAsset: 'scripts'
    }
  };
})();

const settings = projectSettings.configuration;

// Path resolver utility
const resolveSource = (...segments) => pathUtility.join(settings.source, ...segments);
const resolveOutput = (...segments) => pathUtility.join(settings.output, ...segments);

// Task: Purge output directories
function purgeOutput() {
  return deleteUtility([
    '.tmp',
    `${settings.output}/**/*`,
    `!${projectSettings.outputRoot}/.git*`,
    `${settings.source}/assemble/${settings.dataFolder}/*.json`
  ], { dot: true });
}

// Task: Lint JavaScript files
function jsLinter() {
  return gulpt.src([
    'gulpfile.js',
    `${resolveSource(settings.jsFolder)}/{,*/}*.js`
  ])
    .pipe(errorGuardian())
    .pipe(codeLinter('.jshintrc'))
    .pipe(codeLinter.reporter('jshint-stylish'))
    .pipe(codeLinter.reporter('fail'));
}

// Task: Convert CSV to JSON
async function dataTransformer() {
  const outputDir = resolveSource('assemble', settings.dataFolder);

  if (!fileSystem.existsSync(outputDir)) {
    fileSystem.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    let filesProcessed = 0;
    const csvFilesStream = gulpt.src(`${resolveSource(settings.dataFolder)}/**/*.csv`);
    let totalFiles = 0;

    csvFilesStream
      .pipe(tap(file => {
        totalFiles++;
        const csvFilePath = file.path;
        const jsonFileName = pathUtility.basename(csvFilePath, '.csv') + '.json';
        const jsonFilePath = pathUtility.join(outputDir, jsonFileName);

        csvToJsonConverter()
          .fromFile(csvFilePath)
          .then(json => {
            fileSystem.writeFile(jsonFilePath, JSON.stringify(json, null, 2), (err) => {
              if (err) {
                console.error(`Error writing JSON for ${csvFilePath}:`, err);
                reject(err);
                return;
              }
              filesProcessed++;
              if (filesProcessed === totalFiles) {
                resolve();
              }
            });
          })
          .catch(err => {
            console.error(`Error converting CSV ${csvFilePath}:`, err);
            reject(err);
          });
      }))
      .on('end', () => {
        if (totalFiles === 0) {
          resolve(); // Resolve if no CSV files are found
        }
      })
      .on('error', reject);
  });
}

// Task: Process LESS/CSS files (Development)
function styleProcessorDevelopment() {
  return gulpt.src([`${resolveSource(settings.cssFolder)}/**/*.{less,css}`, `!${resolveSource(settings.cssFolder)}/**/_*.{less,css}`])
    .pipe(errorGuardian())
    .pipe(lessCompiler())
    .pipe(renameUtility({ extname: '.css' }))
    .pipe(gulpt.dest(resolveOutput(settings.cssFolder)));
}

// Task: Process LESS/CSS files (Production)
function styleProcessorProduction() {
  return gulpt.src([`${resolveSource(settings.cssFolder)}/**/*.{less,css}`, `!${resolveSource(settings.cssFolder)}/**/_*.{less,css}`])
    .pipe(errorGuardian())
    .pipe(lessCompiler())
    .pipe(styleMinifier({ compatibility: 'ie8' }))
    .pipe(renameUtility({ extname: '.min.css' }))
    .pipe(gulpt.dest(resolveOutput(settings.cssFolder)));
}

// Task: Copy assets
function assetTransfer() {
  return gulpt.src([
    resolveSource('*.{ico,png,txt,xml}'),
    resolveSource('.htaccess'),
    resolveSource('*.html'),
    resolveSource('views/{,*/}*.html'),
    resolveSource(settings.componentFolder, '/**/*'),
    resolveSource(settings.imageFolder, '/{,*/}*'),
    resolveSource(settings.fontFolder, '/{,*/}*'),
    resolveSource(settings.dataFolder, '/{,*/}*'),
    resolveSource(settings.imageFolder, '/{,*/}*'), // Duplicated in original Gruntfile, replicating
    resolveSource(settings.jsFolder, '/{,*/}*.js')
  ], { dot: true })
    .pipe(gulpt.dest(settings.outputRoot));
}

// Task: Concatenate scripts
function scriptCombinerTask() {
  return gulpt.src(`${resolveSource(settings.jsFolder)}/{,*/}*.js`)
    .pipe(errorGuardian())
    .pipe(scriptCombiner(`${settings.jsMainAsset}.js`))
    .pipe(gulpt.dest(resolveOutput(settings.jsFolder)));
}

// Task: Minify scripts
function scriptCompressorTask() {
  const bannerText = `/*! ${settings.jsMainAsset}.js (generated ${new Date().toLocaleDateString('en-GB')}) */\n`;
  return gulpt.src(resolveOutput(settings.jsFolder, `${settings.jsMainAsset}.js`))
    .pipe(errorGuardian())
    .pipe(scriptCompressor({ output: { comments: 'some' } }))
    .pipe(renameUtility({ extname: '.min.js' }))
    .pipe(tap(file => {
      // Prepend banner manually as gulp-uglify might strip it depending on options
      file.contents = Buffer.concat([Buffer.from(bannerText), file.contents]);
    }))
    .pipe(gulpt.dest(resolveOutput(settings.jsFolder)));
}

// Task: Assemble HTML pages
async function pageAssembler() {
  const handlebars = require('handlebars');

  // Clear all registered helpers and partials for a fresh run
  // This is crucial for watch tasks to pick up changes
  handlebars.helpers = {};
  handlebars.partials = {};

  // 1. Load Helpers
  await new Promise(resolve => {
    gulpt.src(resolveSource('assemble', 'helpers', '{,*/}*.js'), { read: false })
      .pipe(tap(file => {
        try {
          delete require.cache[require.resolve(file.path)];
          const helperModule = require(file.path);
          if (typeof helperModule === 'function') {
            helperModule(handlebars);
          } else if (typeof helperModule === 'object') {
            for (const key in helperModule) {
              if (Object.prototype.hasOwnProperty.call(helperModule, key)) {
                handlebars.registerHelper(key, helperModule[key]);
              }
            }
          }
        } catch (e) {
          console.error(`Error loading Handlebars helper from ${file.path}:`, e);
        }
      }))
      .on('end', resolve);
  });

  // 2. Load Partials
  await new Promise(resolve => {
    gulpt.src(resolveSource('assemble', 'partials', '{,*/}*.hbs'))
      .pipe(tap(file => {
        const partialName = pathUtility.basename(file.path, '.hbs');
        handlebars.registerPartial(partialName, file.contents.toString());
      }))
      .on('end', resolve);
  });

  // 3. Load Data
  const allCollectedData = {};
  await new Promise(resolve => {
    gulpt.src(resolveSource('assemble', 'data', '{,*/}*.{json,yml}'))
      .pipe(tap(file => {
        const fileName = pathUtility.basename(file.path, pathUtility.extname(file.path));
        let fileContent = file.contents.toString();
        try {
          if (pathUtility.extname(file.path) === '.yml') {
            allCollectedData[fileName] = yamlParser.load(fileContent);
          } else {
            allCollectedData[fileName] = JSON.parse(fileContent);
          }
        } catch (e) {
          console.error(`Error parsing data file ${file.path}:`, e);
        }
      }))
      .on('end', resolve);
  });

  // 4. Load Layout
  const layoutPath = resolveSource('assemble', 'layouts', 'default.hbs');
  const layoutContent = fileSystem.readFileSync(layoutPath, 'utf8');
  const layoutTemplate = handlebars.compile(layoutContent);

  // 5. Process Pages
  return gulpt.src(resolveSource('assemble', 'pages', '{,*/}*.hbs'))
    .pipe(errorGuardian())
    .pipe(tap(file => {
      const pageTemplate = handlebars.compile(file.contents.toString());
      const pageData = { ...allCollectedData, ...file.data };
      pageData.page = { filename: pathUtility.basename(file.path) };

      const compiledPageContent = pageTemplate(pageData);
      const finalHtml = layoutTemplate({ body: compiledPageContent, ...pageData });
      file.contents = Buffer.from(finalHtml);
    }))
    .pipe(renameUtility({ extname: '.html' }))
    .pipe(gulpt.dest(settings.outputRoot));
}

// Task: Start web server and watch files
function webServerLaunch(done) {
  webHost.init({
    port: 9000,
    host: 'localhost',
    livereload: 35729,
    open: true,
    server: {
      baseDir: settings.outputRoot
    }
  });
  done();
}

// Task: Watch for file changes
function fileMonitor() {
  gulpt.watch(`${resolveSource(settings.jsFolder)}/{,*/}*.js`, gulpt.series(jsLinter, assetTransfer, webHost.reload));
  gulpt.watch(`${resolveSource(settings.cssFolder)}/**/*.{css,less}`, gulpt.series(styleProcessorDevelopment, webHost.reload));
  gulpt.watch('gulpfile.js', webHost.reload);
  gulpt.watch(`${resolveSource('assemble', 'pages')}/{,*/}*.hbs`, gulpt.series(pageAssembler, webHost.reload));
  gulpt.watch(`${resolveSource('assemble')}/{helpers,layouts,partials}/{,*/}*.{hbs,yml,json,js}`, gulpt.series(pageAssembler, webHost.reload));
  gulpt.watch(`${resolveSource('assemble', 'data')}/{,*/}*.yml`, gulpt.series(dataTransformer, pageAssembler, webHost.reload));
  gulpt.watch(`${resolveSource(settings.dataFolder)}/{,*/}*.csv`, gulpt.series(dataTransformer, pageAssembler, assetTransfer, webHost.reload));
  gulpt.watch(`${resolveSource(settings.imageFolder)}/{,*/}*`, gulpt.series(assetTransfer, webHost.reload));
}

// Main tasks
const launchServer = gulpt.series(webServerLaunch, fileMonitor);

const constructProject = gulpt.series(
  purgeOutput,
  dataTransformer,
  gulpt.parallel(styleProcessorDevelopment, jsLinter),
  assetTransfer,
  pageAssembler
);

const constructProjectProd = gulpt.series(
  purgeOutput,
  dataTransformer,
  gulpt.parallel(styleProcessorProduction, jsLinter),
  assetTransfer,
  pageAssembler,
  scriptCombinerTask,
  scriptCompressorTask
);

// Export tasks
exports.clean = purgeOutput;
exports.lint = jsLinter;
exports.styles = styleProcessorDevelopment;
exports.stylesProd = styleProcessorProduction;
exports.data = dataTransformer;
exports.pages = pageAssembler;
exports.copy = assetTransfer;
exports.concat = scriptCombinerTask;
exports.uglify = scriptCompressorTask;
exports.server = launchServer;
exports.serve = launchServer;
exports.build = constructProject;
exports.buildProd = constructProjectProd;
exports.default = constructProject;