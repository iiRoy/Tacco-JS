import { promises as fileSystemOperations } from 'node:fs';
import { minify as compressScript } from 'terser';
import { ESLint as CodeQualityChecker } from 'eslint';
import projectManifest from './package.json' assert { type: 'json' };

async function produceComponentSchema() {
    const assetDescription = {
        label: projectManifest.config.componentManifest.identifier,
        summary: projectManifest.description,
        release: projectManifest.version,
        dependencies: projectManifest.dependencies,
        tags: projectManifest.keywords,
        creators: [projectManifest.authorInfo],
        license: projectManifest.licenseType,
        website: projectManifest.projectURL,
        exclusionList: projectManifest.config.componentManifest.ignorePatterns,
        vcs: projectManifest.versionControl,
        mainEntry: projectManifest.config.primaryEntry,
    };
    await fileSystemOperations.writeFile('component.json', JSON.stringify(assetDescription, null, '  '));
    return true;
}

async function prepareDistributionAssets(sourceCodeContent) {
    const minificationResult = await compressScript(sourceCodeContent, {
        mangle: true,
        compress: true,
        format: {
            comments: false
        }
    });
    const minimizedForm = minificationResult.code;

    const introductoryBanner = `/*!
    ${projectManifest.config.displayTitle} ${projectManifest.version}
    license: ${projectManifest.licenseType}
    ${projectManifest.projectURL}
*/

`;

    const targetArtifactsDirectory = 'build';
    const baseOutputName = projectManifest.config.outputName;

    await fileSystemOperations.mkdir(targetArtifactsDirectory, { recursive: true });
    await fileSystemOperations.writeFile(`${targetArtifactsDirectory}/${baseOutputName}.js`, introductoryBanner + sourceCodeContent);
    await fileSystemOperations.writeFile(`${targetArtifactsDirectory}/${baseOutputName}.min.js`, introductoryBanner + minimizedForm);
    return true;
}

async function performCodeValidation(inputSource) {
    const checkerInstance = new CodeQualityChecker({
        useEslintrc: false,
        overrideConfig: {
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                browser: true,
            },
            env: {
                browser: true,
                es2021: true,
            },
            rules: {
                'no-undef': 'error',
                'no-unused-vars': ['error', { args: 'none' }],
                'no-implied-eval': 'error',
                'eqeqeq': 'error',
                'no-eq-null': 'error',
                'no-caller': 'error',
            },
            globals: {
                define: 'readonly',
                module: 'readonly'
            }
        },
    });

    const verificationResults = await checkerInstance.lintText(inputSource);
    const issues = verificationResults[0].messages;

    if (issues.length) {
        issues.forEach((issue) => {
            console.error(`${issue.line}:${issue.column} ${issue.message} [${issue.ruleId}]`);
        });
        return false;
    } else {
        return true;
    }
}

async function orchestrateBuildSequence() {
    try {
        const sourceAssetPath = `source_assets/${projectManifest.config.outputName}.js`;
        const rawScriptContent = await fileSystemOperations.readFile(sourceAssetPath, { encoding: 'utf8' });

        const qualityCheckPassed = await performCodeValidation(rawScriptContent);
        if (!qualityCheckPassed) {
            console.error("Code quality assessment failed. Halting build process.");
            return;
        }

        const artifactGenerationSuccess = await prepareDistributionAssets(rawScriptContent);
        if (!artifactGenerationSuccess) {
            console.error("Distribution artifact generation failed. Halting build process.");
            return;
        }

        const componentSchemaWritten = await produceComponentSchema();
        if (!componentSchemaWritten) {
            console.error("Component schema file creation failed.");
            return;
        }

        console.log("Development assets successfully prepared and validated.");
    } catch (operationError) {
        console.error("An unexpected error occurred during the orchestration:", operationError);
    }
}

orchestrateBuildSequence();