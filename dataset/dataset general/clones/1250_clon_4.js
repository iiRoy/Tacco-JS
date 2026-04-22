const SystemFileManager = require('fs');
const EnhancedFileManager = require('fs-extra');
const ProcessExecutor = require('child_process');
const GlobPatternMatcher = require('glob');
const VersionControlTool = require('semver');
const NotificationAgent = require('node-notifier');
const PathResolver = require('path');
const CoffeeCompiler = require('coffeescript');
const JavaScriptLinter = require('jshint').JSHINT;
// JSHint reporters are usually stream-based. For Type IV, we'll simplify output.
// const JSHintStylishReporter = require('jshint-stylish');
// const JSHintDefaultReporter = require('jshint-default');
const CodeComplexityAnalyzer = require('escomplex');
const AcornParser = require('acorn'); // Required by escomplex for AST parsing
const FileChangeObserver = require('chokidar');
const TestSuiteRunner = require('mocha');
const ShouldAssertion = require('should');
const StandardAssertion = require('assert');
const ChangeLogGenerator = require('conventional-changelog');
const DirectoryRemover = require('rimraf');
const { Readable, Writable } = require('stream'); // For custom stream handling of gulp plugin
const CustomResourceTransformer = require('./dist/package/index.js'); // The original gulp plugin

// Project Configuration and Metadata
const ProjectManifest = require('./package.json');
const ConfigurationParameters = require('./gulp/options');
const LocatorPaths = require('./gulp/path');

// Global Instances and Utilities
const systemAlerter = new NotificationAgent();
const consoleUtility = console;

// Helper function to resolve glob patterns (async)
const retrieveFilesByPattern = (pattern) => {
    return new Promise((resolve, reject) => {
        GlobPatternMatcher(pattern, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });
};

// Helper for sequential task execution (mimics run-sequence)
const executeSequence = async (taskFunctions, completionCallback) => {
    try {
        for (const taskFn of taskFunctions) {
            await taskFn();
        }
        if (completionCallback) completionCallback(null);
    } catch (error) {
        if (completionCallback) completionCallback(error);
        throw error;
    }
};

// Helper for parallel task execution
const executeParallel = async (taskFunctions, completionCallback) => {
    try {
        await Promise.all(taskFunctions.map(fn => fn()));
        if (completionCallback) completionCallback(null);
    } catch (error) {
        if (completionCallback) completionCallback(error);
        throw error;
    }
};

// Custom Build Orchestrator / Task Manager
class ProjectBuildAutomator {
    constructor() {
        this.taskRegistry = new Map();
    }

    // Register a task
    defineOperation(alias, func) {
        this.taskRegistry.set(alias, func);
    }

    // Run a task by name
    async initiateOperation(alias, completionCallback) {
        const operation = this.taskRegistry.get(alias);
        if (!operation) {
            const error = new Error(`Operation "${alias}" not found.`);
            if (completionCallback) completionCallback(error);
            throw error;
        }
        try {
            await operation();
            if (completionCallback) completionCallback(null);
        } catch (error) {
            if (completionCallback) completionCallback(error);
            throw error;
        }
    }

    // Run a sequence of tasks (by name)
    async initiateOperationSequence(aliases, completionCallback) {
        const taskFunctions = aliases.map(alias => {
            const operation = this.taskRegistry.get(alias);
            if (!operation) throw new Error(`Operation "${alias}" not found.`);
            return operation;
        });
        await executeSequence(taskFunctions, completionCallback);
    }

    // Run tasks in parallel (by name)
    async initiateParallelOperations(aliases, completionCallback) {
        const taskFunctions = aliases.map(alias => {
            const operation = this.taskRegistry.get(alias);
            if (!operation) throw new Error(`Operation "${alias}" not found.`);
            return operation;
        });
        await executeParallel(taskFunctions, completionCallback);
    }
}

const buildController = new ProjectBuildAutomator();

// Task Implementations

// --- Release Management Operations ---

buildController.defineOperation('generateHistoricalLog', async () => {
    return new Promise((resolve, reject) => {
        ChangeLogGenerator({
            repository: ProjectManifest.repository.url,
            version: ProjectManifest.version
        }, (err, logContent) => {
            if (err) return reject(err);
            SystemFileManager.writeFileSync('CHANGELOG.md', logContent, 'utf8');
            resolve();
        });
    });
});

buildController.defineOperation('incrementVersionAndTag', async () => {
    const manifestPath = './package.json';
    let currentManifest = JSON.parse(SystemFileManager.readFileSync(manifestPath, 'utf8'));

    const newVersion = VersionControlTool.inc(currentManifest.version, 'patch');
    currentManifest.version = newVersion;

    SystemFileManager.writeFileSync(manifestPath, JSON.stringify(currentManifest, null, 2), 'utf8');

    const tagName = `v${newVersion}`;
    ProcessExecutor.execSync(`git add ${manifestPath}`);
    ProcessExecutor.execSync(`git commit -m "chore: release ${tagName}"`);
    ProcessExecutor.execSync(`git tag ${tagName}`);
});

buildController.defineOperation('manageReleaseMetadata', async (cb) => {
    await buildController.initiateOperationSequence(['generateHistoricalLog', 'incrementVersionAndTag'], cb);
});

// --- Cleanup Operations ---

buildController.defineOperation('purgeJsPackageOutputs', async () => {
    const filesToPurge = await retrieveFilesByPattern(LocatorPaths.clean.js.package);
    await Promise.all(filesToPurge.map(filePath => DirectoryRemover(filePath)));
});

buildController.defineOperation('purgeJsTestOutputs', async () => {
    const filesToPurge = await retrieveFilesByPattern(LocatorPaths.clean.js.test);
    await Promise.all(filesToPurge.map(filePath => DirectoryRemover(filePath)));
});

buildController.defineOperation('purgeJavascriptArtifacts', async (cb) => {
    await buildController.initiateParallelOperations(['purgeJsPackageOutputs', 'purgeJsTestOutputs'], cb);
});

buildController.defineOperation('purgeAllBuildArtifacts', async (cb) => {
    await buildController.initiateOperationSequence(['purgeJavascriptArtifacts'], cb);
});

// --- File Copy Operations ---

buildController.defineOperation('replicateTestResources', async () => {
    const sourceFiles = await retrieveFilesByPattern(LocatorPaths.copy.js.test.src);
    const baseDir = LocatorPaths.copy.js.test.base;
    const destDir = LocatorPaths.copy.js.test.dest;

    for (const srcPath of sourceFiles) {
        const relativePath = PathResolver.relative(baseDir, srcPath);
        const targetPath = PathResolver.join(destDir, relativePath);

        EnhancedFileManager.ensureDirSync(PathResolver.dirname(targetPath));
        EnhancedFileManager.copySync(srcPath, targetPath);
    }
});

// --- JavaScript Generation, Linting, and Analysis Operations ---

buildController.defineOperation('transpileCoffeeSources', async () => {
    const coffeeFiles = await retrieveFilesByPattern(LocatorPaths.coffee.default.src);
    const destinationDirectory = LocatorPaths.coffee.default.dest;

    for (const sourcePath of coffeeFiles) {
        const fileContent = SystemFileManager.readFileSync(sourcePath, 'utf8');
        try {
            const compiledJs = CoffeeCompiler.compile(fileContent, ConfigurationParameters.coffee.general);
            const relativePathStart = LocatorPaths.coffee.default.src.split('*')[0].replace(/\\/g, '/'); // Normalize path for substring
            const relativePath = sourcePath.substring(sourcePath.indexOf(relativePathStart) + relativePathStart.length);
            const outputFilePath = PathResolver.join(destinationDirectory, relativePath.replace(/\.coffee$/, '.js'));

            EnhancedFileManager.ensureDirSync(PathResolver.dirname(outputFilePath));
            SystemFileManager.writeFileSync(outputFilePath, compiledJs, 'utf8');
        } catch (err) {
            consoleUtility.log('');
            consoleUtility.log(`${err.name} in ${err.plugin || 'CoffeeScript compilation'}`);
            consoleUtility.log(`Message: ${err.message}`);
            consoleUtility.log(`Stack: ${err.stack}`);

            const isLinuxEnv = /^linux/.test(process.platform);
            if (isLinuxEnv) {
                systemAlerter.notify({
                    title: `Processing Error: ${err.plugin || 'CoffeeScript'}`,
                    message: `${err.name} in ${err.plugin || 'CoffeeScript'}`,
                    contentImage: `${__dirname}/gulp/img/logo.png`,
                    appIcon: `${__dirname}/gulp/img/logo.png`,
                    open: `file://${__dirname}/gulp/img/logo.png`
                }, (error, response) => {
                    if (error) consoleUtility.error('Notification error:', error);
                    consoleUtility.log(response);
                });
            }
        }
    }
});

buildController.defineOperation('inspectJavaScriptQuality', async () => {
    const jsFiles = await retrieveFilesByPattern(LocatorPaths.javascript.lint);
    const jshintOptions = ConfigurationParameters.js.lint.jshintrc;
    const allErrors = [];

    for (const filePath of jsFiles) {
        const fileContent = SystemFileManager.readFileSync(filePath, 'utf8');
        const success = JavaScriptLinter(fileContent, jshintOptions);
        if (!success) {
            allErrors.push({
                file: filePath,
                errors: JavaScriptLinter.errors
            });
        }
    }

    if (allErrors.length > 0) {
        consoleUtility.log('\n--- JavaScript Quality Inspection Results ---');
        allErrors.forEach(fileReport => {
            consoleUtility.log(`\nFile: ${fileReport.file}`);
            fileReport.errors.forEach(err => {
                if (err) {
                    consoleUtility.log(`  Line ${err.line}, Col ${err.character}: ${err.reason} (${err.code})`);
                }
            });
        });
        consoleUtility.log('--- End of Inspection Results ---\n');
    } else {
        consoleUtility.log('JavaScript quality inspection passed with no issues.');
    }
});

buildController.defineOperation('evaluateCodeMetrics', async () => {
    const jsFiles = await retrieveFilesByPattern(LocatorPaths.javascript.complexity);
    const analysisResults = [];

    for (const filePath of jsFiles) {
        const fileContent = SystemFileManager.readFileSync(filePath, 'utf8');
        try {
            const ast = AcornParser.parse(fileContent, { sourceType: 'module', ecmaVersion: 2020 });
            const report = CodeComplexityAnalyzer.analyse(ast);
            analysisResults.push({ file: filePath, report: report });
        } catch (error) {
            consoleUtility.error(`Error analyzing complexity for ${filePath}:`, error.message);
        }
    }

    consoleUtility.log('\n--- Code Complexity Metrics ---');
    analysisResults.forEach(result => {
        consoleUtility.log(`\nFile: ${result.file}`);
        consoleUtility.log(`  Cyclomatic Complexity: ${result.report.aggregate.cyclomatic}`);
        consoleUtility.log(`  Maintainability Index: ${result.report.maintainability}`);
    });
    consoleUtility.log('--- End of Complexity Metrics ---\n');
});

buildController.defineOperation('orchestrateJavascriptBuild', async (cb) => {
    await buildController.initiateOperationSequence([
        'purgeJavascriptArtifacts',
        'transpileCoffeeSources',
        'replicateTestResources',
        'purgeJsTestOutputs',
        'inspectJavaScriptQuality',
        'evaluateCodeMetrics'
    ], cb);
});

// --- Watch Operations ---

buildController.defineOperation('monitorSourceChanges', () => {
    consoleUtility.log('Monitoring CoffeeScript files for changes...');
    FileChangeObserver.watch(LocatorPaths.watch.coffee, { ignoreInitial: true }).on('change', async (path) => {
        consoleUtility.log(`File changed: ${path}. Retranspiling CoffeeScript...`);
        try {
            await buildController.initiateOperation('transpileCoffeeSources');
            consoleUtility.log('CoffeeScript retranspilation complete.');
        } catch (error) {
            consoleUtility.error('Error during retranspilation:', error);
        }
    });
});

// --- Default Operations ---

buildController.defineOperation('executeDefaultWorkflow', async (cb) => {
    await buildController.initiateOperationSequence(['orchestrateJavascriptBuild'], cb);
});

// --- Test Operations ---

buildController.defineOperation('executeAutomatedTests', async () => {
    const testFiles = await retrieveFilesByPattern(LocatorPaths.mocha.js.test);

    const testFramework = new TestSuiteRunner({
        reporter: 'spec',
        recursive: true
    });

    global.should = ShouldAssertion;
    global.assert = StandardAssertion;

    testFiles.forEach(file => testFramework.addFile(file));

    return new Promise((resolve, reject) => {
        testFramework.run((failures) => {
            if (failures) {
                reject(new Error(`${failures} test failures occurred.`));
            } else {
                resolve();
            }
        });
    });
});

// --- Custom Plugin Integration ---

buildController.defineOperation('applyResourceVersioning', async () => {
    const cssSourcePath = 'test/css/test.css';
    const cssDestPath = 'test/css/versioned/test.css';

    EnhancedFileManager.ensureDirSync(PathResolver.dirname(cssDestPath));

    const originalCssContent = SystemFileManager.readFileSync(cssSourcePath, 'utf8');

    class StringReadable extends Readable {
        constructor(str, options) {
            super(options);
            this.str = str;
            this.sent = false;
        }
        _read() {
            if (!this.sent) {
                this.push(Buffer.from(this.str));
                this.sent = true;
            } else {
                this.push(null);
            }
        }
    }

    let transformedContent = '';
    const outputStream = new Writable({
        write(chunk, encoding, callback) {
            transformedContent += chunk.toString();
            callback();
        }
    });

    const input = new StringReadable(originalCssContent);
    const transformStream = CustomResourceTransformer();

    await new Promise((resolve, reject) => {
        input.pipe(transformStream).pipe(outputStream)
            .on('finish', resolve)
            .on('error', reject);
    });

    SystemFileManager.writeFileSync(cssDestPath, transformedContent, 'utf8');
});

// Entry Point / Main Execution Logic
const mainExecution = async () => {
    const args = process.argv.slice(2);
    let targetOperation = 'executeDefaultWorkflow';

    if (args.length > 0) {
        targetOperation = args[0];
    }

    try {
        await buildController.initiateOperation(targetOperation, (err) => {
            if (err) {
                consoleUtility.error(`\nOperation "${targetOperation}" failed:`, err.message);
                process.exit(1);
            } else {
                consoleUtility.log(`\nOperation "${targetOperation}" completed successfully.`);
                process.exit(0);
            }
        });
    } catch (error) {
        consoleUtility.error(`\nAn unhandled error occurred during operation "${targetOperation}":`, error.message);
        process.exit(1);
    }
};

// Execute main logic if this script is run directly
if (require.main === module) {
    mainExecution();
}