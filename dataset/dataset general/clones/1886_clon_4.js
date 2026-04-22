'use strict';

const { exec, spawn } = require('child_process');
const { promises: fileSystem } = require('fs');
const pathModule = require('path');
const chokidar = require('chokidar');
const express = require('express');

// --- Configuration Data ---
const projectManifest = require('./package.json');
const currentYear = new Date().getFullYear();
const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

const activeLocale = process.argv.find(arg => arg.startsWith('--lang='))?.split('=')[1] || 'en';

const mainHeader = `/**
 * ${projectManifest.title || projectManifest.name} - v${projectManifest.version} - ${todayDate}
 * ${projectManifest.homepage}
 * Copyright (c} ${currentYear} ${projectManifest.author.name}
 * License: ${projectManifest.license}
 */
`;

const outputBase = 'dist';

const primarySources = [
  'src/deferred-bootstrap.js'
];

const validationScripts = ['test/**/*.js'];

const sourcePrefixFile = 'src/deferred-bootstrap.prefix';
const sourceSuffixFile = 'src/deferred-bootstrap.suffix';

const compiledCoreFile = pathModule.join(outputBase, 'angular-deferred-bootstrap.js');
const minifiedCoreFile = pathModule.join(outputBase, 'angular-deferred-bootstrap.min.js');

const webServerPort = 3005;
const testConfigPath = 'karma.conf.js';

// --- Utility Functions ---

/**
 * Executes a shell command and returns a Promise.
 * @param {string} commandExpression The command string to execute.
 * @param {object} [executionOptions] Options for child_process.exec.
 * @returns {Promise<string>} Resolves with stdout, rejects with stderr or error.
 */
function runShellCommand(commandExpression, executionOptions = {}) {
  return new Promise((resolve, reject) => {
    exec(commandExpression, executionOptions, (error, standardOutput, standardError) => {
      if (error) {
        console.error(`Command failed: ${commandExpression}\n${standardError}`);
        return reject(new Error(standardError || error.message));
      }
      if (standardError) {
        console.warn(`Command stderr: ${commandExpression}\n${standardError}`);
      }
      console.log(standardOutput);
      resolve(standardOutput);
    });
  });
}

/**
 * Executes a shell command and streams output, useful for long-running processes.
 * @param {string} program The program to execute.
 * @param {string[]} programArguments Arguments for the command.
 * @param {object} [spawnOptions] Options for child_process.spawn.
 * @returns {Promise<number>} Resolves with exit code.
 */
function streamShellCommand(program, programArguments, spawnOptions = {}) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(program, programArguments, { stdio: 'inherit', ...spawnOptions });
        childProcess.on('close', (exitCode) => {
            if (exitCode !== 0) {
                reject(new Error(`Process "${program} ${programArguments.join(' ')}" exited with code ${exitCode}`));
            } else {
                resolve(exitCode);
            }
        });
        childProcess.on('error', (err) => {
            reject(err);
        });
    });
}


// --- Core Operations ---

async function performStaticAnalysis(targetFilePaths = []) {
  console.log('\n--- Running Static Analysis (ESLint) ---');
  const filesForAnalysis = targetFilePaths.length > 0 ? targetFilePaths : [
    'project-operator.js', // Equivalent to Gruntfile.js
    ...primarySources,
    ...validationScripts
  ];
  try {
    await runShellCommand(`npx eslint ${filesForAnalysis.join(' ')} --max-warnings 0`);
    console.log('Static analysis passed.');
  } catch (error) {
    console.error('Static analysis failed:', error.message);
    throw error;
  }
}

async function runUnitChecks(browserSetting = 'PhantomJS', singleExecutionFlag = true) {
  console.log(`\n--- Running Unit Tests (${browserSetting}) ---`);
  const karmaArgs = ['start', testConfigPath, `--single-run=${singleExecutionFlag}`];
  if (browserSetting) {
    karmaArgs.push(`--browsers=${browserSetting}`);
  }
  try {
    await streamShellCommand('npx', ['karma', ...karmaArgs]);
    console.log('Unit tests passed.');
  } catch (error) {
    console.error('Unit tests failed:', error.message);
    throw error;
  }
}

async function amalgamateSources() {
  console.log('\n--- Amalgamating Source Files ---');
  try {
    await fileSystem.mkdir(outputBase, { recursive: true });

    const prefixContent = await fileSystem.readFile(sourcePrefixFile, 'utf8');
    const suffixContent = await fileSystem.readFile(sourceSuffixFile, 'utf8');

    const sourceContents = await Promise.all(
      primarySources.map(file => fileSystem.readFile(file, 'utf8'))
    );

    const fullContent = [prefixContent, ...sourceContents, suffixContent].join('\n');
    await fileSystem.writeFile(compiledCoreFile, fullContent, 'utf8');

    console.log(`Sources amalgamated into: ${compiledCoreFile}`);

    // Apply banner as a separate step, similar to concat:banner in Grunt
    const finalContentWithBanner = mainHeader + '\n' + await fileSystem.readFile(compiledCoreFile, 'utf8');
    await fileSystem.writeFile(compiledCoreFile, finalContentWithBanner, 'utf8');
    console.log(`Banner applied to: ${compiledCoreFile}`);

  } catch (error) {
    console.error('Source amalgamation failed:', error.message);
    throw error;
  }
}

async function compressCode() {
  console.log('\n--- Compressing Code (Terser) ---');
  try {
    await runShellCommand(`npx terser ${compiledCoreFile} -o ${minifiedCoreFile}`);
    console.log(`Code compressed to: ${minifiedCoreFile}`);
  } catch (error) {
    console.error('Code compression failed:', error.message);
    throw error;
  }
}

async function launchWebServer() {
  console.log(`\n--- Launching Web Server on port ${webServerPort} ---`);
  const applicationHost = express();
  applicationHost.use(express.static('.')); // Serve static files from current directory
  applicationHost.listen(webServerPort, () => {
    console.log(`Server running at http://localhost:${webServerPort}`);
  });
  // The server naturally keeps running, fulfilling the 'express-keepalive' implicitly.
}

async function monitorFiles(operationsToExecute) {
  console.log('\n--- Initiating File Monitoring ---');
  const fileWatcher = chokidar.watch([
    'project-operator.js', // Gruntfile.js equivalent
    ...primarySources,
    ...validationScripts,
    'src/**/*.js' // For livereload equivalent
  ], {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  let debounceIdentifier;
  fileWatcher.on('change', async (changedPath) => {
    console.log(`File changed: ${changedPath}. Re-running associated operations...`);
    clearTimeout(debounceIdentifier);
    debounceIdentifier = setTimeout(async () => {
        try {
            await operationsToExecute();
            console.log('Watched operations completed successfully.');
        } catch (error) {
            console.error('Error during watched operations:', error.message);
        }
    }, 500); // Debounce to avoid running too many times on rapid changes
  });

  console.log('Watching for file changes. Press Ctrl+C to stop.');
  // Keep the process alive for watching
  return new Promise(() => {}); // Never resolves
}

// --- Operation Definitions (Equivalent to Grunt Tasks) ---

async function performStandardOperations() {
  await performStaticAnalysis();
  await runUnitChecks();
}

async function executeValidation(browserName = 'PhantomJS') {
  await runUnitChecks(browserName);
}

async function constructArtifact() {
  await performStaticAnalysis();
  await runUnitChecks();
  await amalgamateSources();
  await compressCode();
}

async function initiateDevelopmentFlow() {
  await performStaticAnalysis();
  await runUnitChecks();
  await amalgamateSources(); // This covers the 'concat' part of 'dev'
  await monitorFiles(async () => { // livereload equivalent tasks
    await performStaticAnalysis();
    await runUnitChecks();
    await amalgamateSources();
  });
}

async function startApplicationHost() {
  await launchWebServer();
}

// --- Main Script Execution ---

const operationRegistry = {
  'standard': performStandardOperations, // default
  'validate': executeValidation, // test
  'validate-chrome': () => executeValidation('Chrome'), // test-chrome
  'validate-firefox': () => executeValidation('Firefox'), // test-firefox
  'validate-all': () => Promise.all([ // test-all
      runUnitChecks('PhantomJS'),
      runUnitChecks('Chrome'),
      runUnitChecks('Firefox')
  ]),
  'build-final': constructArtifact, // build
  'develop': initiateDevelopmentFlow, // dev
  'serve-app': startApplicationHost, // server
};

async function mainExecution() {
  const requestedOperation = process.argv[2] || 'standard';

  const selectedOperation = operationRegistry[requestedOperation];

  if (!selectedOperation) {
    console.error(`Unknown operation: "${requestedOperation}". Available operations: ${Object.keys(operationRegistry).join(', ')}`);
    process.exit(1);
  }

  try {
    await selectedOperation();
    console.log(`\nOperation "${requestedOperation}" completed successfully.`);
  } catch (error) {
    console.error(`\nOperation "${requestedOperation}" failed:`, error.message);
    process.exit(1);
  }
}

mainExecution();