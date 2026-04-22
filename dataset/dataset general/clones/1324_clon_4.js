const fileSystem = require('node:fs/promises');
const pathUtils = require('node:path');
const scriptBundler = require('esbuild');
const styleCompiler = require('less');
const changeObserver = require('chokidar');
const liveServer = require('browser-sync').create();

const projectLayout = {
  source: {
    base: './src',
    markup: './src/index.html',
    scriptEntry: './src/index.js',
    styleMain: './src/less/main.less',
    styleGlob: 'src/less/**/*.less',
  },
  output: {
    base: './build',
    scriptDir: 'build/js',
    styleDir: 'build/css',
    scriptBundleName: 'app.js',
    styleBundleName: 'app.css',
  },
};

const reportIssue = (problem) => {
  console.error('Operation failed:', problem.toString());
};

async function performCleanup() {
  console.log('Initiating cleanup of output directory...');
  try {
    await fileSystem.rm(projectLayout.output.base, { recursive: true, force: true });
    console.log('Output directory cleaned.');
  } catch (err) {
    reportIssue(`Failed to clean output directory: ${err.message}`);
  }
}

async function replicateMarkup() {
  console.log('Replicating markup...');
  const destinationPath = pathUtils.join(projectLayout.output.base, pathUtils.basename(projectLayout.source.markup));
  try {
    await fileSystem.mkdir(projectLayout.output.base, { recursive: true });
    await fileSystem.copyFile(projectLayout.source.markup, destinationPath);
    console.log('Markup replicated.');
    liveServer.reload();
  } catch (err) {
    reportIssue(`Failed to replicate markup: ${err.message}`);
  }
}

async function compileStyles() {
  console.log('Compiling styles...');
  try {
    const lessContent = await fileSystem.readFile(projectLayout.source.styleMain, 'utf8');
    const { css } = await styleCompiler.render(lessContent, {
      paths: [pathUtils.dirname(projectLayout.source.styleMain)],
      compress: false,
    });
    const outputDirPath = projectLayout.output.styleDir;
    await fileSystem.mkdir(outputDirPath, { recursive: true });
    const outputPath = pathUtils.join(outputDirPath, projectLayout.output.styleBundleName);
    await fileSystem.writeFile(outputPath, css, 'utf8');
    console.log('Styles compiled.');
    liveServer.reload('*.css');
  } catch (err) {
    reportIssue(`Failed to compile styles: ${err.message}`);
  }
}

async function processScripts(isWatching = false) {
  console.log(`Processing scripts ${isWatching ? '(watching)' : ''}...`);
  const outputDirPath = projectLayout.output.scriptDir;
  await fileSystem.mkdir(outputDirPath, { recursive: true });

  const esbuildOptions = {
    entryPoints: [projectLayout.source.scriptEntry],
    bundle: true,
    outfile: pathUtils.join(outputDirPath, projectLayout.output.scriptBundleName),
    format: 'iife',
    loader: { '.js': 'jsx' },
    target: ['es2015'],
    logLevel: 'error',
    color: true,
  };

  try {
    if (isWatching) {
      const context = await scriptBundler.context(esbuildOptions);
      await context.watch();
      console.log('Script watcher initiated.');
    } else {
      await scriptBundler.build(esbuildOptions);
      console.log('Scripts processed.');
    }
  } catch (err) {
    reportIssue(`Failed to process scripts: ${err.message}`);
  }
}

function initiateServer() {
  console.log('Initiating live server...');
  liveServer.init({
    server: {
      baseDir: projectLayout.output.base,
    },
  });
  console.log('Live server initiated.');
}

async function trackChanges() {
  console.log('Tracking file system changes...');

  changeObserver.watch(projectLayout.source.markup, { ignoreInitial: true }).on('change', () => {
    console.log('HTML file changed, replicating...');
    replicateMarkup();
  }).on('error', reportIssue);

  changeObserver.watch(projectLayout.source.styleGlob, { ignoreInitial: true }).on('change', () => {
    console.log('LESS file changed, compiling styles...');
    compileStyles();
  }).on('error', reportIssue);

  await processScripts(true);
}

async function executeBuild() {
  console.log('Starting one-time build...');
  await performCleanup();
  await Promise.all([
    replicateMarkup(),
    processScripts(false),
    compileStyles(),
  ]);
  console.log('One-time build complete.');
  process.exit(0);
}

async function startMonitoring() {
  console.log('Starting continuous monitoring...');
  await performCleanup();
  await Promise.all([
    replicateMarkup(),
    compileStyles(),
  ]);

  initiateServer();
  await trackChanges();
  console.log('Continuous monitoring initiated. Press Ctrl+C to stop.');
}

const command = process.argv[2];

if (command === 'monitor') {
  startMonitoring().catch(reportIssue);
} else if (command === 'build') {
  executeBuild().catch(reportIssue);
} else {
  console.log('Usage: node builder.js [build|monitor]');
  process.exit(1);
}