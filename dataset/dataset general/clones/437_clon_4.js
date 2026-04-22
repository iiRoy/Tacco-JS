const { exec: executeShellCommand, spawn } = require('child_process');
const { promises: filesystemOperations } = require('fs');
const pathResolver = require('path');

const projectManifest = {
  buildTargetDirectory: './public_output',
  htmlAssets: {
    sourceFilePath: './__web/index.html',
    destinationFolder: './public_output'
  },
  styleSheets: {
    sourceFilePath: './__styles/index.styl',
    outputFileName: 'main_styles.css',
    destinationFolder: './public_output/css_assets'
  },
  applicationCode: {
    sourceFilesPattern: './__app/**/*.js',
    temporaryBuildFolder: './intermediate_code_stage',
    entryPointFile: './intermediate_code_stage/index.js',
    outputFileName: 'application_bundle.js',
    destinationFolder: './public_output/js_assets'
  }
};

async function invokeExternalTool(operationDescription, commandLine) {
  console.log(`Initiating: ${operationDescription}`);
  try {
    const { stdout, stderr } = await executeShellCommand(commandLine);
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
  } catch (error) {
    console.error(`Failure during ${operationDescription}:`, error.message);
    throw error;
  }
}

async function clearBuildArtifacts() {
  await invokeExternalTool('Removing prior build directories',
    `npx rimraf ${projectManifest.buildTargetDirectory} ${projectManifest.applicationCode.temporaryBuildFolder}`
  );
}

async function replicateHtmlMarkup() {
  await invokeExternalTool('Copying main HTML file',
    `npx cpx "${projectManifest.htmlAssets.sourceFilePath}" "${projectManifest.htmlAssets.destinationFolder}"`
  );
}

async function convertJsxToJs() {
  const sourceDirectory = pathResolver.dirname(projectManifest.applicationCode.sourceFilesPattern.replace(/\/\*\*\/.*$/, ''));
  await invokeExternalTool('Transpiling React components from JSX',
    `npx babel ${sourceDirectory} --out-dir ${projectManifest.applicationCode.temporaryBuildFolder} --extensions ".js,.jsx"`
  );
}

async function processStylingAssets() {
  const inputStylusFile = projectManifest.styleSheets.sourceFilePath;
  const outputCssDirectory = projectManifest.styleSheets.destinationFolder;
  const finalCssFileName = projectManifest.styleSheets.outputFileName;

  await filesystemOperations.mkdir(outputCssDirectory, { recursive: true });

  await invokeExternalTool('Compiling Stylus to temporary CSS',
    `npx stylus "${inputStylusFile}" -o "${outputCssDirectory}/temp_style.css"`
  );

  await invokeExternalTool('Applying autoprefixing and minification to CSS',
    `npx postcss "${outputCssDirectory}/temp_style.css" --use autoprefixer cssnano --output "${outputCssDirectory}/${finalCssFileName}"`
  );

  await invokeExternalTool('Discarding temporary CSS file',
    `npx rimraf "${outputCssDirectory}/temp_style.css"`
  );
}

async function packageAndOptimizeCode() {
  const codeEntryPoint = projectManifest.applicationCode.entryPointFile;
  const outputJsDirectory = projectManifest.applicationCode.destinationFolder;
  const finalJsFileName = projectManifest.applicationCode.outputFileName;

  await filesystemOperations.mkdir(outputJsDirectory, { recursive: true });

  await invokeExternalTool('Bundling JavaScript modules with Browserify',
    `npx browserify "${codeEntryPoint}" -o "${outputJsDirectory}/temp_bundle.js"`
  );

  await invokeExternalTool('Minifying bundled JavaScript with UglifyJS',
    `npx uglifyjs "${outputJsDirectory}/temp_bundle.js" -o "${outputJsDirectory}/${finalJsFileName}"`
  );

  await invokeExternalTool('Discarding temporary JavaScript bundle',
    `npx rimraf "${outputJsDirectory}/temp_bundle.js"`
  );
}

async function buildAllProjectComponents() {
  await clearBuildArtifacts();
  await convertJsxToJs();
  await Promise.all([
    replicateHtmlMarkup(),
    processStylingAssets(),
    packageAndOptimizeCode()
  ]);
  await invokeExternalTool('Removing intermediate code stage files',
    `npx rimraf ${projectManifest.applicationCode.temporaryBuildFolder}`
  );
  console.log('Comprehensive project build completed successfully!');
}

async function launchDevelopmentEnvironment() {
  await buildAllProjectComponents();
  console.log('Initiating development server with live-reload capability...');

  const liveServerProcess = spawn('npx', ['live-server', projectManifest.buildTargetDirectory], {
    stdio: 'inherit'
  });

  liveServerProcess.on('close', (exitCode) => {
    console.log(`Development server terminated with code ${exitCode}`);
    process.exit(exitCode);
  });

  liveServerProcess.on('error', (err) => {
    console.error('Failed to launch development server:', err);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down development server...');
    liveServerProcess.kill('SIGINT');
  });
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down development server...');
    liveServerProcess.kill('SIGTERM');
  });
}

async function executeUnitTests() {
  await invokeExternalTool('Running automated unit tests', 'npm test');
}

async function mainExecutionFlow() {
  const requestedOperation = process.argv[2];

  if (!requestedOperation) {
    console.log('Usage: node project_builder.js [assemble|develop|test_suite]');
    process.exit(1);
  }

  try {
    switch (requestedOperation) {
      case 'assemble':
        await buildAllProjectComponents();
        break;
      case 'develop':
        await launchDevelopmentEnvironment();
        break;
      case 'test_suite':
        await executeUnitTests();
        break;
      default:
        console.error(`Unrecognized operation: ${requestedOperation}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred during the build process:', error);
    process.exit(1);
  }
}

mainExecutionFlow();