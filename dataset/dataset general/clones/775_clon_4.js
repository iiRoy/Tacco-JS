const { exec: runShellCommand, spawn: startChildProcess } = require('node:child_process');
const { promises: filesystemOperations } = require('node:fs');
const pathUtility = require('node:path');

const getAssetPath = (resourceIdentifier) => pathUtility.join(__dirname, 'test', 'fixtures', resourceIdentifier);
const retrieveFileContents = async (resourceIdentifier) => filesystemOperations.readFile(getAssetPath(resourceIdentifier), 'utf8');
const deleteTemporaryFile = async (resourceIdentifier) => {
    try {
        await filesystemOperations.unlink(getAssetPath(resourceIdentifier));
    } catch (incident) {
        if (incident.code !== 'ENOENT') {
            throw incident;
        }
    }
};
const stringIncludesSubstring = (fullText, subText) => fullText.includes(subText);
const pauseExecution = (durationMilliseconds) => new Promise(resolver => setTimeout(resolver, durationMilliseconds));

const applicationLauncher = 'node bin/cssnext';

let primaryInputContent, expectedOutputContent;

beforeAll(async () => {
    primaryInputContent = await retrieveFileContents('cli.css');
    expectedOutputContent = await retrieveFileContents('cli.expected');
});

const executeCliCommand = (commandString, stdinData = null, executionOptions = {}) => {
    return new Promise((completionResolver, rejectionHandler) => {
        const processHandle = runShellCommand(commandString, executionOptions, (errorResult, standardOutput, standardError) => {
            if (errorResult) {
                errorResult.stdout = standardOutput;
                errorResult.stderr = standardError;
                return rejectionHandler(errorResult);
            }
            completionResolver({ standardOutput, standardError });
        });

        if (stdinData) {
            processHandle.stdin.write(Buffer.from(stdinData));
            processHandle.stdin.end();
        }
    });
};

const transformToSlug = (phraseInput) => phraseInput.toLowerCase().replace(/\s+/g, '-');
const transformToSpaced = (phraseInput) => phraseInput.replace(/-/g, ' ');

describe('Command Line Interface Validation', () => {

    it('should correctly process source file and write to a destination file', async () => {
        const destinationFile = 'cli.output--io.css';
        const destinationPath = getAssetPath(destinationFile);
        try {
            await executeCliCommand(`${applicationLauncher} ${getAssetPath('cli.css')} ${destinationPath}`);
            const generatedContent = await filesystemOperations.readFile(destinationPath, 'utf8');
            expect(generatedContent).toBe(expectedOutputContent);
        } finally {
            await deleteTemporaryFile(destinationFile);
        }
    });

    it('should process a source file and print the result to standard output', async () => {
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} ${getAssetPath('cli.css')}`);
        expect(standardOutput).toBe(expectedOutputContent);
    });

    it('should accept input from standard input and direct output to standard output', async () => {
        const { standardOutput } = await executeCliCommand(applicationLauncher, primaryInputContent);
        expect(standardOutput).toBe(expectedOutputContent);
    });

    it('should report an error when the input file cannot be accessed', async () => {
        await expect(executeCliCommand(`${applicationLauncher} ${getAssetPath('cli.non-existent.css')}`)).rejects.toMatchObject({
            code: 1,
            stderr: expect.stringContaining('Unable to read file')
        });
    });

    it('should indicate an error during the CSS processing phase', async () => {
        await expect(executeCliCommand(`${applicationLauncher} ${getAssetPath('cli.error.css')}`)).rejects.toMatchObject({
            code: 2,
            stderr: expect.stringContaining('encounters an error') && expect.stringContaining('If this error looks like a bug, please report it here')
        });
    });

    it('should load and apply settings from a specified configuration file', async () => {
        const anticipatedConfigResult = await retrieveFileContents('config.expected');
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --config ${getAssetPath('config.json')} ${getAssetPath('config.css')}`);
        expect(standardOutput).toBe(anticipatedConfigResult);
    });

    it('should respect the --browsers flag for feature polyfilling', async () => {
        const customPropertySource = ":root{--foo:bar}baz{qux:var(--foo)}";
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --browsers "Firefox >= 31"`, customPropertySource);
        expect(standardOutput).toBe(customPropertySource);
    });

    it('should provide additional logging information when --verbose is active', async () => {
        const verboseOutputFile = 'cli.output--verbose.css';
        const verboseOutputPath = getAssetPath(verboseOutputFile);
        try {
            const { standardOutput } = await executeCliCommand(`${applicationLauncher} --verbose ${getAssetPath('cli.css')} ${verboseOutputPath}`);
            expect(stringIncludesSubstring(standardOutput, 'Output written')).toBeTruthy();
        } finally {
            await deleteTemporaryFile(verboseOutputFile);
        }
    });

    it('should ignore @import directives when --no-import is specified', async () => {
        const expectedImportedContent = await retrieveFileContents('import');
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --no-import ${getAssetPath('import.css')}`);
        expect(standardOutput).toBe(expectedImportedContent);
    });

    it('should not modify relative URLs when --no-url is provided', async () => {
        const expectedUrlAdjustedContent = await retrieveFileContents('url/dep');
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --no-url ${getAssetPath('url.css')}`, null, { cwd: process.cwd() });
        expect(standardOutput).toBe(expectedUrlAdjustedContent);
    });

    it('should output compressed CSS when the --compress flag is set', async () => {
        const expectedCompressedResult = (await retrieveFileContents('compress.default.expected')).trim();
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --compress ${getAssetPath('compress.css')}`);
        expect(standardOutput).toBe(expectedCompressedResult);
    });

    it('should append sourcemap data when --sourcemap is enabled', async () => {
        const expectedSourcemapResult = (await retrieveFileContents('sourcemap.expected')).trim();
        const { standardOutput } = await executeCliCommand(`${applicationLauncher} --sourcemap ${getAssetPath('sourcemap.css')}`);
        expect(standardOutput).toBe(expectedSourcemapResult);
    });

    const supportedCapabilities = [
        "customProperties", "customMedia", "applyRule", "nesting", "customSelectors",
        "colorFunction", "fontVariant", "mediaQueries", "pseudoElements", "attributeCaseInsensitive",
        "rebeccapurple", "hwb", "not", "anyLink", "matches", "focusVisible", "focusWithin",
        "has", "blank", "dir", "logicalProperties", "gapProperties", "overflowShorthand",
        "systemUi", "icUnit", "place", "doublePositionGradients", "selectors",
        "insert", "url", "import", "calc", "gradients", "initial", "opacity", "all", "filter", "flexbox", "rgba", "whitespace", "sourcemaps"
    ];

    it('should not alter CSS for individual features when all are explicitly deactivated', async () => {
        const deactivationFlags = supportedCapabilities.map(capability => `--no-${transformToSlug(capability)}`).join(' ');
        for (const capabilityName of supportedCapabilities) {
            const featureSlug = transformToSlug(capabilityName);
            const featureSourcePath = getAssetPath(`features/${featureSlug}.css`);
            const featureAnticipatedPath = getAssetPath(`features/${featureSlug}`);

            let featureAnticipatedContent;
            try {
                featureAnticipatedContent = await retrieveFileContents(featureAnticipatedPath);
            } catch (fileError) {
                throw fileError;
            }

            const { standardOutput } = await executeCliCommand(`${applicationLauncher} ${deactivationFlags} ${featureSourcePath}`);
            expect(standardOutput).toBe(featureAnticipatedContent);
        }
    }, 60000);

    it('should throw an error when --watch is invoked without necessary input/output specifications', async () => {
        await expect(executeCliCommand(`${applicationLauncher} --watch`)).rejects.toMatchObject({
            code: 3,
            stderr: expect.stringContaining('--watch option need')
        });
        await expect(executeCliCommand(`${applicationLauncher} --watch ${getAssetPath('cli.css')}`)).rejects.toMatchObject({
            code: 3,
            stderr: expect.stringContaining('--watch option need')
        });
    });

    it('should detect and report errors in a watched file and allow process termination', async () => {
        if (process.env.CI_ENV_TRAVIS || process.env.CI_ENV_APPVEYOR) {
            console.warn('Skipping watch mode error test on designated CI environments.');
            return;
        }

        const watchErrOutputFile = 'cli.output--watch-error.css';
        const watchErrOutputPath = getAssetPath(watchErrOutputFile);
        let terminationInitiated = false;

        const monitorProcess = startChildProcess(
            'node',
            ['bin/cssnext', '--watch', getAssetPath('cli.error.css'), watchErrOutputPath],
            { stdio: ['pipe', 'pipe', 'pipe'] }
        );

        const capturedErrorChunks = [];
        monitorProcess.stderr.on('data', (dataChunk) => {
            capturedErrorChunks.push(dataChunk.toString());
        });

        const errorMessageDetected = new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const fullErrorOutput = capturedErrorChunks.join('');
                if (stringIncludesSubstring(fullErrorOutput, 'encounters an error')) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);
        });

        const maxWaitTimeout = pauseExecution(5000);
        const detectionResult = await Promise.race([errorMessageDetected, maxWaitTimeout]);

        expect(detectionResult).toBe(true, 'Expected error message should be detected in watch mode');

        monitorProcess.kill('SIGTERM');
        terminationInitiated = true;

        await new Promise((resolve) => {
            monitorProcess.on('close', (exitCode, signalReceived) => {
                expect(signalReceived).toBe('SIGTERM', 'Process should be terminated by SIGTERM signal');
                resolve();
            });
            monitorProcess.on('error', (procError) => {
                if (!terminationInitiated) {
                    throw procError;
                }
                resolve();
            });
        });
    }, 15000);

    it('should refresh the output file when an imported CSS file changes in watch mode', async () => {
        if (process.env.CI_ENV_TRAVIS || process.env.CI_ENV_APPVEYOR) {
            console.warn('Skipping watch mode import modification test on designated CI environments.');
            return;
        }

        const primaryWatchSource = 'cli.watch-import.css';
        const primaryWatchSourcePath = getAssetPath(primaryWatchSource);
        const secondaryImportedFile = 'cli.watch-import-import.css';
        const secondaryImportedPath = getAssetPath(secondaryImportedFile);
        const generatedWatchOutput = 'cli.output--watch-import.css';
        const generatedWatchOutputPath = getAssetPath(generatedWatchOutput);

        await filesystemOperations.writeFile(primaryWatchSourcePath, '/* initial */', 'utf8');
        await filesystemOperations.writeFile(secondaryImportedPath, 'imported-content{}', 'utf8');
        await deleteTemporaryFile(generatedWatchOutput);

        const activeWatcherProcess = startChildProcess(
            'node',
            ['bin/cssnext', '--watch', primaryWatchSourcePath, generatedWatchOutputPath],
            { stdio: ['pipe', 'pipe', 'pipe'] }
        );

        let cleanupWatcher = async () => {
            if (activeWatcherProcess.pid) {
                activeWatcherProcess.kill('SIGTERM');
                await new Promise(resolve => activeWatcherProcess.on('close', resolve));
            }
        };

        try {
            await pauseExecution(2000);
            expect(await filesystemOperations.readFile(generatedWatchOutputPath, 'utf8')).toBe('/* initial */', 'Initial output should match primary source');

            await filesystemOperations.writeFile(primaryWatchSourcePath, `/* updated */ @import '${pathUtility.basename(secondaryImportedPath)}';`, 'utf8');
            await pauseExecution(4000);
            expect(await filesystemOperations.readFile(generatedWatchOutputPath, 'utf8')).toBe('/* updated */ imported-content{}', 'Output should update with imported content');

            await filesystemOperations.writeFile(primaryWatchSourcePath, '/* reverted */', 'utf8');
            await pauseExecution(4000);
            expect(await filesystemOperations.readFile(generatedWatchOutputPath, 'utf8')).toBe('/* reverted */', 'Output should revert after import removal');

            const priorOutputStats = await filesystemOperations.stat(generatedWatchOutputPath);
            const currentTime = new Date();
            await filesystemOperations.utimes(secondaryImportedPath, currentTime, currentTime);
            await pauseExecution(4000);

            const finalOutputStats = await filesystemOperations.stat(generatedWatchOutputPath);
            expect(finalOutputStats.mtime.getTime()).toBe(priorOutputStats.mtime.getTime(), 'Output file should not change if a de-imported file is modified');

        } finally {
            await cleanupWatcher();
            await deleteTemporaryFile(primaryWatchSource);
            await deleteTemporaryFile(secondaryImportedFile);
            await deleteTemporaryFile(generatedWatchOutput);
        }
    }, 45000);
});