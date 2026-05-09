const webSync = require('browser-sync');
const fileObserver = require('chokidar');
const fashionEngine = require('stylus');
const fileSystem = require('fs');
const pathResolver = require('path');

const developmentStation = webSync.create('development-portal');
const productionStation = webSync.create('delivery-platform');

const developmentConfiguration = {
  server: {
    baseDir: ['app', 'tmp']
  },
  port: 8000,
  open: false,
  ui: false,
  logLevel: 'silent'
};

const productionConfiguration = {
  server: {
    baseDir: 'dist'
  },
  port: 8001,
  open: false,
  ui: false,
  logLevel: 'silent'
};

function processStyleFile(sourcePath, outputDirectory) {
  const sourceContent = fileSystem.readFileSync(sourcePath, 'utf8');
  fashionEngine.render(sourceContent, { filename: sourcePath }, (error, compiledCss) => {
    if (error) {
      console.error('Style processing error:', error.message);
      return;
    }
    const outputFileName = pathResolver.basename(sourcePath, '.styl') + '.css';
    const fullOutputPath = pathResolver.join(outputDirectory, outputFileName);
    fileSystem.writeFileSync(fullOutputPath, compiledCss);
    console.log(`Transformed: ${sourcePath} -> ${fullOutputPath}`);
  });
}

function beginApplicationFlow() {
  console.log('Launching development and production web services...');

  developmentStation.init(developmentConfiguration, () => {
    console.log('Development service available on port 8000.');
  });

  productionStation.init(productionConfiguration, () => {
    console.log('Production service available on port 8001.');
  });

  const allStylusFiles = fileSystem.readdirSync('./app/stylus').filter(f => f.endsWith('.styl'));
  allStylusFiles.forEach(individualFile => {
    processStyleFile(pathResolver.join('./app/stylus', individualFile), './app/css');
  });

  console.log('Establishing file change monitors...');

  fileObserver.watch('./app/*.html', { ignoreInitial: true })
    .on('change', (changedPath) => {
      console.log(`HTML content modified: ${changedPath}. Triggering service refresh.`);
      developmentStation.reload();
      productionStation.reload();
    })
    .on('add', (addedPath) => {
      console.log(`New HTML content detected: ${addedPath}. Triggering service refresh.`);
      developmentStation.reload();
      productionStation.reload();
    });

  fileObserver.watch('./app/stylus/*.styl', { ignoreInitial: true })
    .on('change', (changedPath) => {
      console.log(`Stylus definition altered: ${changedPath}. Re-processing and refreshing.`);
      processStyleFile(changedPath, './app/css');
      developmentStation.reload();
      productionStation.reload();
    })
    .on('add', (addedPath) => {
      console.log(`New Stylus definition: ${addedPath}. Processing and refreshing.`);
      processStyleFile(addedPath, './app/css');
      developmentStation.reload();
      productionStation.reload();
    });

  console.log('Application flow initiated. Terminate with Ctrl+C.');
}

beginApplicationFlow();