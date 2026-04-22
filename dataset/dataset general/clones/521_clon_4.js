const fse = require('fs-extra');
const path = require('path');
const { minify: performCodeCompression } = require('terser');
const StyleOptimizer = require('clean-css');
const fileWatcher = require('chokidar');

const reportAction = (message) => console.log(`[AUTOMATOR] ${message}`);

const projectConfiguration = {
  javascriptCompression: {
    sourceAsset: 'src/gumi.js',
    outputLocation: 'dist/gumi.min.js',
    compressionSettings: {
      compress: {
        hoist_funs: false,
        join_vars: false,
        loops: false,
        unused: false
      },
      format: {
        ascii_only: true,
        beautify: true,
      }
    }
  },

  stylesheetOptimization: {
    baseSourcePath: 'src/',
    destinationPath: 'dist/',
    ignorePattern: /\.min\.css$/,
    resultExtension: '.min.css'
  },

  assetTransfer: [
    {
      sourcePattern: 'src/*',
      targetDirectory: 'dist/',
      stripDirectoryStructure: true
    },
    {
      sourcePattern: 'dist/*.min.*',
      targetDirectory: 'example/',
      stripDirectoryStructure: true
    }
  ],

  fileObservation: {
    pathsToMonitor: ['src/*'],
    triggerOperation: 'fullBuildProcess'
  }
};

async function executeJavascriptCompression(configDetails) {
  reportAction(`Compressing JavaScript: ${configDetails.sourceAsset} -> ${configDetails.outputLocation}`);
  try {
    const rawContent = await fse.readFile(configDetails.sourceAsset, 'utf8');
    const processedResult = await performCodeCompression(rawContent, configDetails.compressionSettings);

    if (processedResult.error) {
      throw processedResult.error;
    }

    await fse.ensureDir(path.dirname(configDetails.outputLocation));
    await fse.writeFile(configDetails.outputLocation, processedResult.code);
    reportAction('JavaScript compression completed.');
  } catch (error) {
    console.error(`Error during JS compression: ${error.message}`);
    process.exit(1);
  }
}

async function executeStylesheetOptimization(configDetails) {
  reportAction(`Optimizing stylesheets from ${configDetails.baseSourcePath} to ${configDetails.destinationPath}`);
  try {
    await fse.ensureDir(configDetails.destinationPath);
    const allItems = await fse.readdir(configDetails.baseSourcePath);
    const relevantCssFiles = allItems.filter(file => file.endsWith('.css') && !configDetails.ignorePattern.test(file));

    for (const cssItem of relevantCssFiles) {
      const inputAssetPath = path.join(configDetails.baseSourcePath, cssItem);
      const outputAssetName = cssItem.replace('.css', configDetails.resultExtension);
      const outputAssetPath = path.join(configDetails.destinationPath, outputAssetName);

      const cssText = await fse.readFile(inputAssetPath, 'utf8');
      const optimizedCss = new StyleOptimizer().minify(cssText);

      if (optimizedCss.errors && optimizedCss.errors.length > 0) {
        throw new Error(`StyleOptimizer errors: ${optimizedCss.errors.join(', ')}`);
      }
      if (optimizedCss.warnings && optimizedCss.warnings.length > 0) {
        reportAction(`StyleOptimizer warnings for ${cssItem}: ${optimizedCss.warnings.join(', ')}`);
      }

      await fse.writeFile(outputAssetPath, optimizedCss.styles);
      reportAction(`  Optimized ${cssItem} -> ${outputAssetName}`);
    }
    reportAction('Stylesheet optimization completed.');
  } catch (error) {
    console.error(`Error during CSS optimization: ${error.message}`);
    process.exit(1);
  }
}

async function executeAssetTransfer(transferDefinitions) {
  reportAction('Initiating asset transfer...');
  for (const transferInstruction of transferDefinitions) {
    const { sourcePattern, targetDirectory, stripDirectoryStructure } = transferInstruction;
    await fse.ensureDir(targetDirectory);

    const baseSourcePath = path.dirname(sourcePattern.replace(/\*$/, ''));
    const fileSelectionPattern = path.basename(sourcePattern);

    const filesForTransfer = [];
    if (baseSourcePath === sourcePattern || baseSourcePath === '.') { // Handles 'src/' or '.' for current directory
        const items = await fse.readdir(sourcePattern);
        for (const item of items) {
            const itemFullPath = path.join(sourcePattern, item);
            const stats = await fse.stat(itemFullPath);
            if (stats.isFile()) {
                filesForTransfer.push(itemFullPath);
            }
        }
    } else { // Handles 'src/*', 'dist/*.min.*'
        const items = await fse.readdir(baseSourcePath);
        for (const item of items) {
            const itemFullPath = path.join(baseSourcePath, item);
            const stats = await fse.stat(itemFullPath);
            if (stats.isFile()) {
                const currentFileName = path.basename(item);
                const patternMatches = (
                    fileSelectionPattern === '*' ||
                    (fileSelectionPattern.startsWith('*.') && currentFileName.endsWith(fileSelectionPattern.substring(1))) ||
                    (fileSelectionPattern.endsWith('*') && currentFileName.startsWith(fileSelectionPattern.slice(0, -1)))
                );
                if (patternMatches) {
                    filesForTransfer.push(itemFullPath);
                }
            }
        }
    }

    for (const sourceFilePath of filesForTransfer) {
      const fileNameOnly = path.basename(sourceFilePath);
      const destinationFilePath = path.join(targetDirectory, fileNameOnly);
      await fse.copy(sourceFilePath, destinationFilePath);
      reportAction(`  Transferred ${sourceFilePath} -> ${destinationFilePath}`);
    }
  }
  reportAction('Asset transfer completed.');
}

const allOperations = {
  async compressJs() {
    await executeJavascriptCompression(projectConfiguration.javascriptCompression);
  },
  async optimizeCss() {
    await executeStylesheetOptimization(projectConfiguration.stylesheetOptimization);
  },
  async transferAssets() {
    await executeAssetTransfer(projectConfiguration.assetTransfer);
  },
  async fullBuildProcess() {
    reportAction('Running full build process (compressJs, optimizeCss, transferAssets)...');
    await allOperations.compressJs();
    await allOperations.optimizeCss();
    await allOperations.transferAssets();
    reportAction('Full build process completed.');
  },
  async monitorChanges() {
    reportAction(`Monitoring changes in ${projectConfiguration.fileObservation.pathsToMonitor.join(', ')}`);
    const observer = fileWatcher.watch(projectConfiguration.fileObservation.pathsToMonitor, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    observer
      .on('add', p => { reportAction(`File ${p} added. Rebuilding.`); allOperations[projectConfiguration.fileObservation.triggerOperation](); })
      .on('change', p => { reportAction(`File ${p} changed. Rebuilding.`); allOperations[projectConfiguration.fileObservation.triggerOperation](); })
      .on('unlink', p => { reportAction(`File ${p} removed. Rebuilding.`); allOperations[projectConfiguration.fileObservation.triggerOperation](); })
      .on('error', error => console.error(`Observer error: ${error}`));

    allOperations[projectConfiguration.fileObservation.triggerOperation]();
  }
};

async function launchBuildAutomation(requestedFunction) {
  if (allOperations[requestedFunction]) {
    reportAction(`Starting function: ${requestedFunction}`);
    await allOperations[requestedFunction]();
    if (requestedFunction !== 'monitorChanges') {
      reportAction(`Function "${requestedFunction}" finished successfully.`);
    }
  } else {
    console.error(`Error: Function "${requestedFunction}" not found.`);
    console.error('Available functions:', Object.keys(allOperations).join(', '));
    process.exit(1);
  }
}

const functionToRun = process.argv[2] || 'fullBuildProcess';
launchBuildAutomation(functionToRun);