// This build script requires the following npm packages:
// rimraf, uglify-js, less, replace-in-file, chokidar, eslint, http-server, node-fetch, semver
// You would typically install them with:
// npm install --save-dev rimraf uglify-js less replace-in-file chokidar eslint http-server node-fetch semver

const fileSystem = require('fs');
const pathModule = require('path');
const processExecution = require('child_process');
const rimraf = require('rimraf');
const UglifyJS = require('uglify-js');
const lessCompiler = require('less');
const replaceInFile = require('replace-in-file');
const chokidar = require('chokidar');
const httpServer = require('http-server');
const fetch = require('node-fetch');
const semver = require('semver');

// --- Configuration Data Store ---
const buildConfiguration = {};

// --- Helper Functions ---
function retrieveProjectDetails() {
  const manifestData = fileSystem.readFileSync('package.json', 'utf8');
  return JSON.parse(manifestData);
}

function constructHeader(templateString, details, forMinified = false) {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}/${month}/${day}`;

  let licenses = [];
  if (Array.isArray(details.licenses)) {
    licenses = details.licenses.map(lic => lic.type);
  } else if (typeof details.license === 'string') {
    licenses = [details.license];
  } else if (typeof details.license === 'object' && details.license.type) {
    licenses = [details.license.type];
  }

  let finalHeader = templateString
    .replace(/<%= pkg\.title \|\| pkg\.name %>/g, details.title || details.name)
    .replace(/<%= pkg\.homepage %>/g, details.homepage)
    .replace(/<%= grunt\.template\.today\(\"yyyy\"\)/g, currentYear)
    .replace(/<%= pkg\.author\.name %>/g, details.author ? (typeof details.author === 'string' ? details.author.split('<')[0].trim() : details.author.name) : 'Unknown Author')
    .replace(/<%= _.pluck\(pkg\.licenses, "type"\)\.join\(\", \"\) %>/g, licenses.join(', '))
    .replace(/<%= pkg\.version %>/g, details.version)
    .replace(/<%= grunt\.template\.today\(\"yyyy\/mm\/dd\"\)/g, formattedDate);

  if (forMinified) {
    // This specific minified banner structure doesn't really have newlines to strip,
    // but the original `bannermin` uses `/*! ... */\n` which is handled.
  }

  return finalHeader;
}

// --- Task Definitions ---

async function eraseArtifacts(pathsToClean) {
  console.log(`Clearing directories: ${pathsToClean.join(', ')}`);
  for (const targetPath of pathsToClean) {
    await new Promise((resolve, reject) => {
      rimraf(targetPath, (err) => {
        if (err) {
          console.error(`Failed to clean ${targetPath}:`, err);
          return reject(err);
        }
        console.log(`Cleaned: ${targetPath}`);
        resolve();
      });
    });
  }
}

let serverProcess;
async function launchServer(portNumber) {
  if (serverProcess) {
    console.log('Stopping existing server...');
    serverProcess.kill('SIGTERM'); // Terminate existing server
    serverProcess = null;
  }
  console.log(`Starting local server on port ${portNumber}...`);
  return new Promise((resolve, reject) => {
    // Run http-server as a child process
    serverProcess = processExecution.spawn('npx', ['http-server', '.', '-p', portNumber], {
      stdio: 'pipe' // Pipe stdout/stderr to capture, or 'inherit' to show in console
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes(`Starting up http-server, serving ./`)) {
        console.log(`Server running at http://localhost:${portNumber}`);
        resolve(serverProcess);
      }
      // console.log(`http-server: ${output.trim()}`); // Uncomment to see server output
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`http-server error: ${data.toString().trim()}`);
    });

    serverProcess.on('close', (code) => {
      if (code !== 0 && serverProcess) {
        console.error(`http-server process exited with code ${code}`);
        // Only reject if it failed to start, not if it was intentionally closed.
      }
      serverProcess = null;
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start http-server process:', err);
      reject(err);
      serverProcess = null;
    });

    // Give it a moment to start up before resolving in case stdout is delayed
    setTimeout(() => {
      if (!serverProcess) { // If it failed quickly
        reject(new Error('http-server failed to start within timeout.'));
      }
    }, 2000);
  });
}

async function closeServer() {
  if (serverProcess) {
    console.log('Closing local server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function combineSources(sourceFilePath, destinationFilePath, headerContent) {
  console.log(`Combining source: ${sourceFilePath} to ${destinationFilePath}`);
  try {
    const sourceCode = fileSystem.readFileSync(sourceFilePath, 'utf8');
    const combinedContent = headerContent + sourceCode;
    fileSystem.mkdirSync(pathModule.dirname(destinationFilePath), { recursive: true });
    fileSystem.writeFileSync(destinationFilePath, combinedContent);
    console.log(`Combined and wrote to: ${destinationFilePath}`);
  } catch (error) {
    console.error(`Error combining files: ${error.message}`);
    throw error;
  }
}

async function substituteVariables(filePath, variableMap) {
  console.log(`Substituting variables in: ${filePath}`);
  try {
    const results = await replaceInFile({
      files: filePath,
      from: Object.keys(variableMap).map(key => new RegExp(`<%= ${key} %>`, 'g')),
      to: Object.values(variableMap),
    });
    if (results.some(r => r.hasChanged)) {
      console.log(`Variables substituted in: ${filePath}`);
    } else {
      console.log(`No substitutions needed in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error during variable substitution: ${error.message}`);
    throw error;
  }
}

async function processStyles(sourceLessPath, destinationCssPath, minify = false) {
  console.log(`Processing LESS: ${sourceLessPath} to ${destinationCssPath}`);
  try {
    const lessContent = fileSystem.readFileSync(sourceLessPath, 'utf8');
    const output = await lessCompiler.render(lessContent, { compress: minify });
    fileSystem.mkdirSync(pathModule.dirname(destinationCssPath), { recursive: true });
    fileSystem.writeFileSync(destinationCssPath, output.css);
    console.log(`Processed LESS and wrote to: ${destinationCssPath}`);
  } catch (error) {
    console.error(`Error processing LESS: ${error.message}`);
    throw error;
  }
}

async function minifyScripts(sourceFilePath, destinationFilePath, headerContent) {
  console.log(`Minifying script: ${sourceFilePath} to ${destinationFilePath}`);
  try {
    const sourceCode = fileSystem.readFileSync(sourceFilePath, 'utf8');
    const minified = UglifyJS.minify(sourceCode, {
      output: {
        comments: 'some',
      },
      compress: {
        drop_console: true
      }
    });
    if (minified.error) {
      throw minified.error;
    }
    fileSystem.mkdirSync(pathModule.dirname(destinationFilePath), { recursive: true });
    fileSystem.writeFileSync(destinationFilePath, headerContent + minified.code);
    console.log(`Minified and wrote to: ${destinationFilePath}`);
  } catch (error) {
    console.error(`Error minifying script: ${error.message}`);
    throw error;
  }
}

async function inspectCode(filePatterns, baseDir = process.cwd()) {
  console.log(`Linting code with ESLint for patterns: ${filePatterns.join(', ')}`);
  return new Promise((resolve, reject) => {
    const eslintProcess = processExecution.spawn('npx', ['eslint', ...filePatterns], {
      cwd: baseDir,
      stdio: 'inherit' // Show ESLint output directly
    });

    eslintProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ESLint inspection failed with exit code ${code}.`));
      }
      console.log('ESLint inspection complete.');
      resolve();
    });

    eslintProcess.on('error', (err) => {
      console.error('Failed to start ESLint process:', err);
      reject(err);
    });
  });
}

async function validateTests(testUrls, serverPort) {
  console.log('Running QUnit tests via HTTP...');
  let allTestsPassed = true;
  for (const urlPath of testUrls) {
    const fullUrl = `http://localhost:${serverPort}${urlPath}`;
    console.log(`Fetching test results from: ${fullUrl}`);
    try {
      const response = await fetch(fullUrl, { timeout: 60000 });
      if (!response.ok) {
        console.error(`Failed to fetch ${fullUrl}: ${response.statusText}`);
        allTestsPassed = false;
        continue;
      }
      const htmlContent = await response.text();
      // Simple check for QUnit success based on expected HTML content
      // A more robust solution might use a headless browser to parse the QUnit UI.
      if (htmlContent.includes('<li class="fail">0</li>')) {
        console.log(`Tests passed for ${urlPath}`);
      } else {
        console.error(`Tests FAILED for ${urlPath}. Check the page at ${fullUrl} for details.`);
        allTestsPassed = false;
      }
    } catch (fetchError) {
      console.error(`Error fetching ${fullUrl}: ${fetchError.message}`);
      allTestsPassed = false;
    }
  }
  if (!allTestsPassed) {
    throw new Error('Some QUnit tests failed.');
  }
  console.log('All QUnit tests completed successfully.');
}

async function monitorFiles(watchConfig) {
  console.log('Starting file monitoring...');
  const activeWatchers = [];

  for (const config of watchConfig) {
    const watcher = chokidar.watch(config.files, { ignored: /(^|[\/\\])\../, persistent: true });
    console.log(`Watching: ${config.files.join(', ')}`);

    watcher.on('change', async (path) => {
      console.log(`File changed: ${path}. Running associated tasks.`);
      for (const taskName of config.tasks) {
        try {
          await executeProcedure([taskName]);
        } catch (error) {
          console.error(`Error running task '${taskName}' during watch: ${error.message}`);
        }
      }
      console.log('Waiting for next changes...');
    });
    watcher.on('error', error => console.error(`Watcher error: ${error}`));
    activeWatchers.push(watcher);
  }

  // Keep the process alive indefinitely for watch mode
  await new Promise(() => {});
}

async function incrementVersion(filePaths, tabSize = 2) {
  console.log('Incrementing project version...');
  let newVersion = null;

  for (const filePath of filePaths) {
    try {
      const fileContent = fileSystem.readFileSync(filePath, 'utf8');
      const fileJson = JSON.parse(fileContent);

      if (!newVersion) {
        const currentVersion = fileJson.version;
        if (!currentVersion || !semver.valid(currentVersion)) {
          throw new Error(`Invalid version found in ${filePath}: ${currentVersion}`);
        }
        newVersion = semver.inc(currentVersion, 'patch');
        console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
      }

      fileJson.version = newVersion;
      fileSystem.writeFileSync(filePath, JSON.stringify(fileJson, null, tabSize));
      console.log(`Updated version in: ${filePath} to ${newVersion}`);
    } catch (error) {
      console.error(`Error updating version in ${filePath}: ${error.message}`);
      throw error;
    }
  }
}

// --- Global Configuration Setup ---
async function configureBuild() {
  const projectManifest = retrieveProjectDetails();

  const mainHeader = constructHeader(
    '/* <%= pkg.title || pkg.name %> jQuery plugin\n' +
    ' * <%= pkg.homepage %>\n' +
    ' *\n' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %> \n' +
    ' * Released under the <%= _.pluck(pkg.licenses, "type").join(", ") %> licence \n' +
    ' *\n' +
    ' * version: <%= pkg.version %> \n' +
    ' * <%= grunt.template.today("yyyy/mm/dd") %>\n' +
    ' */\n',
    projectManifest
  );

  const minifiedHeader = constructHeader(
    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> | ' + '<%= pkg.homepage %> | ' +
    '(c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' + ' | ' +
    'License <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    projectManifest, true
  );

  const baseFileName = 'jquery.rcrumbs';

  Object.assign(buildConfiguration, {
    project: projectManifest,
    mainHeader: mainHeader,
    minifiedHeader: minifiedHeader,
    baseFileName: baseFileName,
    eraseArtifacts: {
      targets: ['dist']
    },
    launchServer: {
      port: 8075
    },
    combineSources: {
      main: {
        source: `src/${baseFileName}.js`,
        destination: `dist/${baseFileName}.js`,
        header: mainHeader
      }
    },
    substituteVariables: {
      main: {
        filePath: `dist/${baseFileName}.js`,
        variables: {
          version: projectManifest.version
        }
      }
    },
    processStyles: {
      dev: {
        source: `src/less/${baseFileName}.less`,
        destination: `dist/${baseFileName}.css`,
        minify: false
      },
      prod: {
        source: `src/less/${baseFileName}.less`,
        destination: `dist/${baseFileName}.min.css`,
        minify: true
      }
    },
    minifyScripts: {
      main: {
        source: `src/${baseFileName}.js`,
        destination: `dist/${baseFileName}.min.js`,
        header: minifiedHeader
      }
    },
    inspectCode: {
      gruntfile: {
        patterns: ['Gruntfile.js'] // Refers to the original Gruntfile, assuming it exists for linting
      },
      src: {
        patterns: ['src/**/*.js']
      },
      test: {
        patterns: ['test/**/*.js']
      }
    },
    validateTests: {
      serverPort: 8075,
      all: {
        urls: ['1.7.0', '1.8.0', '1.8.3', '1.9.1', '1.11.0', '2.0.0', '2.1.0'].map(version =>
          `/test/test.html?jquery=${version}`
        )
      },
      recent: {
        urls: ['1.11.0', '2.1.0'].map(version =>
          `/test/test.html?jquery=${version}`
        )
      },
      local: ['test/**/!(window-resize).html'] // This requires a specialized local file runner
    },
    monitorFiles: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['inspectCode:gruntfile', 'validateTests:local']
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['inspectCode:src', 'validateTests:local']
      },
      test: {
        files: ['test/**/*.js', 'test/**/!(window-resize).html'],
        tasks: ['inspectCode:test', 'validateTests:local']
      },
      less: {
        files: ['src/**/*.less'],
        tasks: ['processStyles:dev']
      }
    },
    incrementVersion: {
      targets: ['package.json', 'rcrumbs.jquery.json'],
      indentation: 2
    }
  });
}

// --- Procedure Definitions (similar to Grunt tasks) ---
const procedures = {
  // Main build procedure
  'default': async () => {
    const config = buildConfiguration;
    let serverIsActive = false;
    try {
      await launchServer(config.launchServer.port);
      serverIsActive = true;

      await eraseArtifacts(config.eraseArtifacts.targets);
      await inspectCode(config.inspectCode.src.patterns);
      await processStyles(config.processStyles.dev.source, config.processStyles.dev.destination, config.processStyles.dev.minify);
      await processStyles(config.processStyles.prod.source, config.processStyles.prod.destination, config.processStyles.prod.minify);
      await combineSources(config.combineSources.main.source, config.combineSources.main.destination, config.mainHeader);
      await substituteVariables(config.substituteVariables.main.filePath, config.substituteVariables.main.variables);
      await minifyScripts(config.minifyScripts.main.source, config.minifyScripts.main.destination, config.minifiedHeader);
      await validateTests(config.validateTests.recent.urls, config.validateTests.serverPort);
    } finally {
      if (serverIsActive) {
        await closeServer();
      }
    }
  },

  // Test procedure
  'test': async () => {
    const config = buildConfiguration;
    let serverIsActive = false;
    try {
      await launchServer(config.launchServer.port);
      serverIsActive = true;

      await inspectCode(config.inspectCode.src.patterns);
      await inspectCode(config.inspectCode.test.patterns);
      await validateTests(config.validateTests.recent.urls, config.validateTests.serverPort);
    } finally {
      if (serverIsActive) {
        await closeServer();
      }
    }
  },

  // Test-all procedure
  'test-all': async () => {
    const config = buildConfiguration;
    let serverIsActive = false;
    try {
      await launchServer(config.launchServer.port);
      serverIsActive = true;

      await inspectCode(config.inspectCode.src.patterns);
      await inspectCode(config.inspectCode.test.patterns);
      await validateTests(config.validateTests.all.urls, config.validateTests.serverPort);
    } finally {
      if (serverIsActive) {
        await closeServer();
      }
    }
  },

  // Individual tasks for watch (need to be callable)
  'inspectCode:gruntfile': async () => await inspectCode(buildConfiguration.inspectCode.gruntfile.patterns),
  'inspectCode:src': async () => await inspectCode(buildConfiguration.inspectCode.src.patterns),
  'inspectCode:test': async () => await inspectCode(buildConfiguration.inspectCode.test.patterns),
  'processStyles:dev': async () => {
    // Ensure dist directory exists for CSS output
    fileSystem.mkdirSync(pathModule.dirname(buildConfiguration.processStyles.dev.destination), { recursive: true });
    await processStyles(buildConfiguration.processStyles.dev.source, buildConfiguration.processStyles.dev.destination, buildConfiguration.processStyles.dev.minify);
  },
  // Placeholder for local QUnit tests, as direct HTTP fetch is not applicable
  'validateTests:local': async () => console.log('Note: Local QUnit tests are not automatically run by this script in watch mode. Manual browser refresh or a dedicated local test runner is needed.'),
  'monitorFiles:all': async () => {
    const watchConfigs = [
      buildConfiguration.monitorFiles.gruntfile,
      buildConfiguration.monitorFiles.js,
      buildConfiguration.monitorFiles.test,
      buildConfiguration.monitorFiles.less
    ];
    await monitorFiles(watchConfigs);
  },
  'incrementVersion:all': async () => await incrementVersion(buildConfiguration.incrementVersion.targets, buildConfiguration.incrementVersion.indentation)
};


// --- Execution Logic ---
async function executeProcedure(procedureNames) {
  if (procedureNames.length === 0) {
    console.error('No build procedure specified. Defaulting to "default".');
    procedureNames = ['default'];
  }

  for (const procName of procedureNames) {
    if (procedures[procName]) {
      console.log(`\n--- Running procedure: ${procName} ---`);
      try {
        await procedures[procName]();
        console.log(`--- Procedure ${procName} completed successfully ---`);
      } catch (error) {
        console.error(`--- Procedure ${procName} FAILED: ${error.message} ---`);
        process.exit(1);
      }
    } else {
      console.error(`Unknown procedure: ${procName}`);
      process.exit(1);
    }
  }
}

// Initialize configuration and then run the requested procedure
async function main() {
  await configureBuild();

  const args = process.argv.slice(2);
  const requestedProcedures = args.length > 0 ? args : ['default'];

  await executeProcedure(requestedProcedures);
}

main().catch(err => {
  console.error('An unhandled error occurred in the build process:', err);
  process.exit(1);
});