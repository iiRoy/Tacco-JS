const fileSystemOperations = require('fs-extra');
const pathUtilities = require('path');
const scriptPackager = require('browserify');
const codeCompressor = require('uglify-js');
const styleTranspiler = require('sass');
const fileChangeMonitor = require('chokidar');
const assetHost = require('browser-sync').create();

async function logAndPersist(targetLocation, contentPayload) {
  await fileSystemOperations.ensureDir(pathUtilities.dirname(targetLocation));
  await fileSystemOperations.writeFile(targetLocation, contentPayload);
}

function displayProblem(encounteredError) {
  if (encounteredError) {
    console.error(encounteredError.toString());
  }
}

async function processStyles() {
  const sourcePath = 'scss/literallycanvas.scss';
  const targetDir = 'lib/css';
  const finalPath = pathUtilities.join(targetDir, 'literallycanvas.css');

  try {
    const compilationResult = await styleTranspiler.compileAsync(sourcePath, { style: 'compressed' });
    await logAndPersist(finalPath, compilationResult.css);
    assetHost.reload();
    console.log(`Styling processed: ${sourcePath} -> ${finalPath}`);
  } catch (issue) {
    displayProblem(issue);
  }
}

async function assembleCode() {
  const primaryEntry = './index.coffee';
  const baseSourceFolder = 'src';
  const outputLocation = './lib/js/';
  const resultFileName = 'literallycanvas.js';
  const resultFilePath = pathUtilities.join(outputLocation, resultFileName);

  const packagerInstance = scriptPackager({
    basedir: baseSourceFolder,
    extensions: ['.js', '.coffee'],
    debug: true
  });

  packagerInstance.add(pathUtilities.join(baseSourceFolder, primaryEntry));
  packagerInstance.external('React/addons');
  packagerInstance.external('React');
  packagerInstance.transform('coffeeify');

  return new Promise((completion, rejection) => {
    packagerInstance.bundle({ standalone: 'LC' }, (issue, bufferContent) => {
      if (issue) {
        displayProblem(issue);
        return rejection(issue);
      }
      logAndPersist(resultFilePath, bufferContent.toString())
        .then(() => {
          assetHost.reload();
          console.log(`Code assembled: ${resultFilePath}`);
          completion();
        })
        .catch(rejection);
    });
  });
}

async function compressCode() {
  const inputFilePath = './lib/js/literallycanvas.js';
  const destinationFolder = './lib/js';
  const compressedFileName = 'literallycanvas.min.js';
  const compressedFilePath = pathUtilities.join(destinationFolder, compressedFileName);

  try {
    const codeContent = await fileSystemOperations.readFile(inputFilePath, 'utf8');
    const compressionOutcome = codeCompressor.minify(codeContent);

    if (compressionOutcome.error) {
      displayProblem(compressionOutcome.error);
      throw compressionOutcome.error;
    }

    await logAndPersist(compressedFilePath, compressionOutcome.code);
    console.log(`Code compressed: ${inputFilePath} -> ${compressedFilePath}`);
  } catch (issue) {
    displayProblem(issue);
  }
}

async function performCompleteBuild() {
  await assembleCode();
  await compressCode();
  await processStyles();
}

function refreshPresentation() {
  assetHost.reload('demo/*');
  console.log('Demonstration assets updated.');
}

function observeSourceChanges() {
  fileChangeMonitor.watch(['src/**/*.coffee'], { ignoreInitial: true })
    .on('change', async (modifiedPath) => {
      console.log(`Modification in CoffeeScript: ${modifiedPath}`);
      await assembleCode();
      await compressCode();
    })
    .on('add', async (newPath) => {
      console.log(`New CoffeeScript file: ${newPath}`);
      await assembleCode();
      await compressCode();
    });

  fileChangeMonitor.watch(['scss/**/*.scss'], { ignoreInitial: true })
    .on('change', async (modifiedPath) => {
      console.log(`Modification in Sass: ${modifiedPath}`);
      await processStyles();
    })
    .on('add', async (newPath) => {
      console.log(`New Sass file: ${newPath}`);
      await processStyles();
    });

  fileChangeMonitor.watch(['demo/**/*'], { ignoreInitial: true })
    .on('change', refreshPresentation)
    .on('add', refreshPresentation)
    .on('unlink', refreshPresentation);
  console.log('Monitoring source files...');
}

function startContentHost() {
  assetHost.init({
    server: {
      baseDir: './'
    },
    port: 3000,
    ui: {
      port: 3001
    },
    files: false,
    ghostMode: false,
    open: false,
    logLevel: 'silent',
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: function (injectedSnippet, matchedText) {
          return injectedSnippet + matchedText;
        }
      }
    }
  }, () => {
    console.log('Web content host initiated with live updates.');
  });
}

async function activateDevelopmentMode() {
  await assembleCode();
  await compressCode();
  await processStyles();
  startContentHost();
  observeSourceChanges();
}

const operationCatalog = {
  'process-styles': processStyles,
  'assemble-code': assembleCode,
  'compress-code': compressCode,
  'full-build': performCompleteBuild,
  'update-presentation': refreshPresentation,
  'monitor-sources': observeSourceChanges,
  'host-content': startContentHost,
  'develop-mode': activateDevelopmentMode
};

const requestedAction = process.argv[2];

if (requestedAction && operationCatalog[requestedAction]) {
  console.log(`Commencing action: ${requestedAction}...`);
  operationCatalog[requestedAction]()
    .catch(errorDetails => {
      console.error(`Action ${requestedAction} terminated with error:`, errorDetails);
      process.exit(1);
    });
} else if (requestedAction) {
  console.error(`Unrecognized action: ${requestedAction}`);
  console.log('Available actions:', Object.keys(operationCatalog).join(', '));
  process.exit(1);
} else {
  console.log('No action specified. Executing default full-build.');
  operationCatalog['full-build']()
    .catch(errorDetails => {
      console.error('Default action terminated with error:', errorDetails);
      process.exit(1);
    });
}