const path = require('path');
const webpack = require('webpack');
const { spawn } = require('child_process');
const chokidar = require('chokidar');
const colorizer = require('chalk');

// Webpack configuration for asset assembly
const assetConfiguration = {
    mode: 'development',
    entry: './source/application.entry.js',
    output: {
        path: path.resolve(__dirname, 'output/scripts'),
        filename: 'main.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
};

/**
 * Executes the asset bundling and transformation process using Webpack.
 * @param {function(number?): void} [completionCallback] - Optional callback to signal completion with an exit code.
 */
function assembleAssets(completionCallback) {
    console.log(colorizer.blue('Initiating asset assembly...'));
    webpack(assetConfiguration, (operationError, processStats) => {
        if (operationError) {
            console.error(colorizer.bold.red('Webpack Execution Error:', operationError.stack || operationError));
            if (operationError.details) {
                console.error(colorizer.bold.red('Webpack Error Details:', operationError.details));
            }
            if (completionCallback) completionCallback(1);
            return;
        }

        const report = processStats.toJson();

        if (processStats.hasErrors()) {
            report.errors.forEach(error => console.error(colorizer.bold.red('Webpack Compilation Error:', error)));
            if (completionCallback) completionCallback(1);
            return;
        }

        if (processStats.hasWarnings()) {
            report.warnings.forEach(warning => console.warn(colorizer.yellow('Webpack Compilation Warning:', warning)));
        }

        console.log(colorizer.green('Asset assembly complete.'));
        if (completionCallback) completionCallback(0);
    });
}

/**
 * Runs the codebase validation tests using Jest.
 * @param {function(number?): void} [completionCallback] - Optional callback to signal completion with an exit code.
 */
function verifyCodebase(completionCallback) {
    console.log(colorizer.blue('Initiating code verification...'));
    const testProcess = spawn('jest', [
        '--rootDir', 'source',
        '--testMatch', '<rootDir>/**/?(*.)+(spec|test).[jt]s?(x)',
        '--moduleFileExtensions', 'js', 'json', 'jsx', 'es6',
        '--unmockedModulePathPatterns', '<rootDir>/node_modules/react'
    ], { stdio: 'inherit' });

    testProcess.on('close', (exitCode) => {
        if (exitCode !== 0) {
            console.error(colorizer.bold.red(`Code verification failed with exit code ${exitCode}`));
        } else {
            console.log(colorizer.green('Code verification successful.'));
        }
        if (completionCallback) completionCallback(exitCode);
    });

    testProcess.on('error', (operationError) => {
        console.error(colorizer.bold.red('Failed to start Jest process:', operationError));
        if (completionCallback) completionCallback(1);
    });
}

/**
 * Monitors source files for changes and triggers asset assembly.
 */
function monitorFiles() {
    console.log(colorizer.magenta('Commencing file monitoring...'));
    const fileObserver = chokidar.watch(['source/**/*.js', 'source/**/*.jsx'], {
        ignored: /(^|[\/\\])\./,
        persistent: true
    });

    fileObserver
        .on('change', (filePath) => {
            console.log(colorizer.cyan(`File changed: ${filePath}. Reassembling assets...`));
            assembleAssets(() => {});
        })
        .on('error', (monitoringError) => {
            console.error(colorizer.bold.red('File monitoring error:', monitoringError));
        });
}

// Define available operations
const operationalMap = {
    'assemble': assembleAssets,
    'validate': verifyCodebase,
    'observe': monitorFiles
};

// Determine which operation to run based on command-line arguments
const requestedOperation = process.argv[2];

if (requestedOperation && operationalMap[requestedOperation]) {
    console.log(colorizer.yellow(`Executing operation: ${requestedOperation}`));
    operationalMap[requestedOperation]((exitCode) => {
        if (exitCode !== undefined && exitCode !== 0) {
            process.exit(exitCode);
        }
    });
} else if (!requestedOperation || requestedOperation === 'default') {
    console.log(colorizer.yellow('Executing default operation (observe files)...'));
    monitorFiles();
} else if (requestedOperation === 'test-all') {
    console.log(colorizer.yellow('Executing validation operation...'));
    verifyCodebase((exitCode) => {
        if (exitCode !== undefined && exitCode !== 0) {
            process.exit(exitCode);
        }
    });
} else {
    console.error(colorizer.bold.red(`Unknown operation: ${requestedOperation}. Available: ${Object.keys(operationalMap).join(', ')}, default, test-all.`));
    process.exit(1);
}