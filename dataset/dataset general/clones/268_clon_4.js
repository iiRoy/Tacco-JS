const fileSystemOperations = require('fs').promises;
const pathResolver = require('path');
const codeMinifier = require('uglify-js');

const projectManifestPath = pathResolver.join(__dirname, '..', 'package.json');

const headerFormatString = '/*! datachannel.%fileExtension% build:%version%, %buildType%. Copyright(c) 2013 Jesús Leganés Combarro "Piranna" <piranna@gmail.com> */';
const bundleWrapperPrefix = '\n(function(exports){\n';
const bundleWrapperSuffix = '\n})(this);\n';

const nodeConditionalBlockStart = '// if node';
const nodeConditionalBlockEnd = '// end node';

const primarySourceFiles = [
    'lib/EventTarget.js',
    'lib/reliable.min.js',
    'datachannel.js'
].map(p => p.replace(/\.\.\//g, ''));

const outputDestinationDirectory = 'dist';
const sourceComponentDirectory = 'src';
const finalBundleName = 'datachannel';

/**
 * Orchestrates the creation of a JavaScript code bundle.
 *
 * @param {object} [buildSettings] - Configuration options for the bundle generation.
 * @param {boolean} [buildSettings.shouldCompress=true] - Flag to enable or disable code minification.
 * @param {boolean} [buildSettings.includeNodeSpecific=false] - Flag to include or exclude Node.js specific code blocks.
 * @param {Array<string>} [buildSettings.additionalSnippets=[]] - An array of extra JavaScript code strings to append.
 * @returns {Promise<string>} A promise that resolves with the complete bundled JavaScript code.
 */
const orchestrateBundleCreation = async (buildSettings = {}) => {
    const effectiveSettings = {
        shouldCompress: true,
        includeNodeSpecific: false,
        additionalSnippets: [],
        ...buildSettings
    };

    const manifestContent = await fileSystemOperations.readFile(projectManifestPath, 'utf8');
    const projectManifest = JSON.parse(manifestContent);
    const applicationVersion = projectManifest.version;

    const developmentHeader = headerFormatString
        .replace('%buildType%', 'development')
        .replace('%fileExtension%', 'js')
        .replace('%version%', applicationVersion);

    const productionHeader = headerFormatString
        .replace('%buildType%', 'production')
        .replace('%fileExtension%', 'min.js')
        .replace('%version%', applicationVersion);

    const fullComponentPaths = primarySourceFiles.map(fileName =>
        pathResolver.join(__dirname, '..', sourceComponentDirectory, fileName)
    );

    const componentContentsMap = new Map();
    await Promise.all(fullComponentPaths.map(async filePath => {
        const content = await fileSystemOperations.readFile(filePath, 'utf8');
        componentContentsMap.set(filePath, content);
    }));

    let resultingCode = developmentHeader + bundleWrapperPrefix;

    resultingCode += fullComponentPaths
        .map(filePath => componentContentsMap.get(filePath))
        .join('\n');

    if (effectiveSettings.additionalSnippets.length > 0) {
        resultingCode += '\n' + effectiveSettings.additionalSnippets.join('\n');
    }

    if (!effectiveSettings.includeNodeSpecific) {
        let exclusionLevel = 0;
        const processedLines = resultingCode.split('\n').filter(line => {
            const startsExclusion = line.includes(nodeConditionalBlockStart);
            const endsExclusion = line.includes(nodeConditionalBlockEnd);

            let shouldRetainLine = exclusionLevel === 0;

            if (startsExclusion) {
                exclusionLevel++;
                shouldRetainLine = false;
            }
            if (endsExclusion) {
                exclusionLevel--;
                if (exclusionLevel < 0) exclusionLevel = 0;
            }

            return shouldRetainLine && exclusionLevel === 0;
        });
        resultingCode = processedLines.join('\n');
    }

    resultingCode += bundleWrapperSuffix;

    if (effectiveSettings.shouldCompress) {
        const parsedAst = codeMinifier.parser.parse(resultingCode);
        const mangledAst = codeMinifier.uglify.ast_mangle(parsedAst);
        const squeezedAst = codeMinifier.uglify.ast_squeeze(mangledAst);

        resultingCode = productionHeader + codeMinifier.uglify.gen_code(squeezedAst, { ascii_only: true });
    }

    return resultingCode;
};

const synchronousPackageInfo = JSON.parse(require('fs').readFileSync(projectManifestPath, 'utf8'));
orchestrateBundleCreation.softwareRelease = synchronousPackageInfo.version;

if (require.main === module) {
    const processArguments = process.argv.slice(2); // Unused, but kept for structural similarity
    const currentWorkingDir = __dirname;
    const outputDirFullPath = pathResolver.join(currentWorkingDir, '..', outputDestinationDirectory);

    const persistBundle = async (targetFileName, contentPayload) => {
        const fullOutputPath = pathResolver.join(outputDirFullPath, targetFileName);
        await fileSystemOperations.mkdir(outputDirFullPath, { recursive: true });
        await fileSystemOperations.writeFile(fullOutputPath, contentPayload, 'utf8');
        console.log(`Report: Successfully generated: ${targetFileName}`);
    };

    (async () => {
        try {
            // Generate development bundle
            const developmentBundleContent = await orchestrateBundleCreation({
                shouldCompress: false,
            });
            await persistBundle(`${finalBundleName}.js`, developmentBundleContent);

            // Generate production bundle
            const productionBundleContent = await orchestrateBundleCreation();
            await persistBundle(`${finalBundleName}.min.js`, productionBundleContent);
        } catch (incident) {
            console.error('Issue: An error occurred during bundle creation:', incident);
            process.exit(1);
        }
    })();
}

module.exports = orchestrateBundleCreation;