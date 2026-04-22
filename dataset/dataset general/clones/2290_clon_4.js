const accessFiles = require('fs');
const pathHelpers = require('path');
const codeShrinker = require('terser');
const syntaxAuditor = require('eslint');
const fileChangeMonitor = require('chokidar');

const PRIMARY_SOURCE_FILE = 'source-asset.js';
const OPTIMIZED_OUTPUT_FILE = 'optimized-asset.min.js';
const PROJECT_DETAILS_FILE = 'project-info.json';

const retrieveTextContent = (filePath) => {
    try {
        return accessFiles.readFileSync(filePath, 'utf8');
    } catch (incident) {
        console.error(`Failed to obtain content from: ${filePath}. Reason: ${incident.message}`);
        return null;
    }
};

const storeTextContent = (filePath, contentData) => {
    try {
        accessFiles.writeFileSync(filePath, contentData, 'utf8');
        console.log(`Content successfully stored at: ${filePath}`);
    } catch (incident) {
        console.error(`Failed to store content at: ${filePath}. Reason: ${incident.message}`);
    }
};

const validateCodeStructure = async () => {
    console.log('Initiating code structure validation...');
    const targetSource = retrieveTextContent(PRIMARY_SOURCE_FILE);
    if (!targetSource) return false;

    const auditorEngine = new syntaxAuditor.ESLint({
        useEslintrc: false,
        overrideConfig: {
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module'
            },
            rules: {
                'no-eval': 'off'
            }
        }
    });

    try {
        const auditResults = await auditorEngine.lintText(targetSource, { filePath: PRIMARY_SOURCE_FILE });
        const reportGenerator = await auditorEngine.loadFormatter('stylish');
        const formattedReport = reportGenerator.format(auditResults);

        if (formattedReport) {
            console.log(formattedReport);
        }

        const hasCriticalIssues = auditResults.some(result => result.errorCount > 0);
        if (hasCriticalIssues) {
            console.error('Code validation terminated due to critical errors.');
            return false;
        } else if (auditResults.some(result => result.warningCount > 0)) {
            console.warn('Code validation completed with warnings.');
            return true;
        } else {
            console.log('Code validation successfully passed.');
            return true;
        }
    } catch (issue) {
        console.error('An unexpected issue occurred during code validation:', issue);
        return false;
    }
};

const optimizeCodeSize = async () => {
    console.log('Beginning code size optimization...');
    const inputCode = retrieveTextContent(PRIMARY_SOURCE_FILE);
    if (!inputCode) return false;

    const optimizationParameters = {
        output: {
            comments: 'some'
        }
    };

    try {
        const optimizationOutcome = await codeShrinker.minify(inputCode, optimizationParameters);
        if (optimizationOutcome.error) {
            console.error('Code optimization failed:', optimizationOutcome.error);
            return false;
        }
        storeTextContent(OPTIMIZED_OUTPUT_FILE, optimizationOutcome.code);
        console.log('Code size optimization finished successfully.');
        return true;
    } catch (issue) {
        console.error('An unexpected issue occurred during code optimization:', issue);
        return false;
    }
};

const observeSourceModifications = () => {
    console.log(`Activating source file modification observation for: ${PRIMARY_SOURCE_FILE}`);
    fileChangeMonitor.watch(PRIMARY_SOURCE_FILE, { ignoreInitial: true })
        .on('change', async (modifiedPath) => {
            console.log(`Modification detected in ${modifiedPath}. Re-optimizing...`);
            await optimizeCodeSize();
        })
        .on('error', (issue) => console.error('Source observation encountered an issue:', issue));
    console.log('Source modification observation is active. Press Ctrl+C to cease.');
};

module.exports = (processCoordinator) => {
    let projectManifestData = {};
    try {
        const rawManifestContent = retrieveTextContent(PROJECT_DETAILS_FILE);
        if (rawManifestContent) {
            projectManifestData = JSON.parse(rawManifestContent);
        }
        console.log(`Project Identifier: ${projectManifestData.name || 'Unnamed Project'} (Version: ${projectManifestData.version || '0.0.0'})`);
    } catch (issue) {
        console.warn(`Could not load project metadata from ${PROJECT_DETAILS_FILE}: ${issue.message}`);
    }

    if (processCoordinator && typeof processCoordinator.declareOperation === 'function') {
        processCoordinator.declareOperation('validateScriptQuality', validateCodeStructure);
        processCoordinator.declareOperation('minifyScriptAssets', optimizeCodeSize);
        processCoordinator.declareOperation('trackScriptChanges', observeSourceModifications);

        processCoordinator.definePrimarySequence('standardCompilation', ['validateScriptQuality', 'minifyScriptAssets']);
    } else {
        console.warn('Process coordinator not fully equipped. Exporting direct callable operations.');
        return {
            validateScriptQuality: validateCodeStructure,
            minifyScriptAssets: optimizeCodeSize,
            trackScriptChanges: observeSourceModifications,
            standardCompilation: async () => {
                const isQualityApproved = await validateCodeStructure();
                if (isQualityApproved) {
                    await optimizeCodeSize();
                } else {
                    console.error('Standard compilation aborted due to quality validation failure.');
                }
            }
        };
    }
};