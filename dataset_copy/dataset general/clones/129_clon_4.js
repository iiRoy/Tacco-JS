const fileOperations = require('fs/promises');
const scriptAnnotator = require('ng-annotate');
const scriptCompressor = require('terser');
const styleCompiler = require('less');
const cssProcessor = require('postcss');
const autoPrefixerModule = require('autoprefixer');
const cssMinifierModule = require('cssnano');
const fileWatcher = require('chokidar');
const pathResolver = require('path');

const sourceDirectory = 'src';
const outputDirectory = '.';
const jsSourceFile = pathResolver.join(sourceDirectory, 'ng-grid-panel.js');
const lessSourceFile = pathResolver.join(sourceDirectory, 'ng-grid-panel.less');
const jsAnnotatedOutput = pathResolver.join(outputDirectory, 'ng-grid-panel.js');
const jsMinifiedOutput = pathResolver.join(outputDirectory, 'ng-grid-panel.min.js');
const cssProcessedOutput = pathResolver.join(outputDirectory, 'ng-grid-panel.css');
const cssMinifiedOutput = pathResolver.join(outputDirectory, 'ng-grid-panel.min.css');

async function processScriptAssets() {
    console.log('Initiating JavaScript asset processing...');
    try {
        const rawJsContent = await fileOperations.readFile(jsSourceFile, 'utf8');

        const annotationResult = scriptAnnotator(rawJsContent, { add: true, single_quotes: true });
        if (annotationResult.errors && annotationResult.errors.length > 0) {
            throw new Error(`Annotation errors: ${annotationResult.errors.join(', ')}`);
        }
        await fileOperations.writeFile(jsAnnotatedOutput, annotationResult.src);
        console.log(`Annotated JS written to: ${jsAnnotatedOutput}`);

        const compressionResult = await scriptCompressor.minify(annotationResult.src, {
            output: { comments: 'some' }
        });
        if (compressionResult.error) {
            throw new Error(`Minification error: ${compressionResult.error}`);
        }
        await fileOperations.writeFile(jsMinifiedOutput, compressionResult.code);
        console.log(`Minified JS written to: ${jsMinifiedOutput}`);
        console.log('JavaScript asset processing complete.');
    } catch (err) {
        console.error('Error during JavaScript asset processing:', err.message);
        throw err;
    }
}

async function processStyleAssets() {
    console.log('Initiating Style asset processing...');
    try {
        const rawLessContent = await fileOperations.readFile(lessSourceFile, 'utf8');

        const lessOutput = await styleCompiler.render(rawLessContent, {
            paths: [sourceDirectory]
        });

        const prefixedResult = await cssProcessor([autoPrefixerModule]).process(lessOutput.css, {
            from: lessSourceFile,
            to: cssProcessedOutput
        });
        await fileOperations.writeFile(cssProcessedOutput, prefixedResult.css);
        console.log(`Processed CSS written to: ${cssProcessedOutput}`);

        const minifiedResult = await cssProcessor([cssMinifierModule]).process(prefixedResult.css, {
            from: cssProcessedOutput,
            to: cssMinifiedOutput
        });
        await fileOperations.writeFile(cssMinifiedOutput, minifiedResult.css);
        console.log(`Minified CSS written to: ${cssMinifiedOutput}`);
        console.log('Style asset processing complete.');
    } catch (err) {
        console.error('Error during Style asset processing:', err.message);
        throw err;
    }
}

async function assembleProjectAssets() {
    console.log('Starting full project asset assembly...');
    try {
        await Promise.all([
            processScriptAssets(),
            processStyleAssets()
        ]);
        console.log('Full project asset assembly finished successfully.');
    } catch (err) {
        console.error('Project asset assembly failed:', err.message);
        process.exit(1);
    }
}

async function monitorSourceChanges() {
    console.log('Activating source file change surveillance...');

    fileWatcher.watch(lessSourceFile).on('change', async (filePath) => {
        console.log(`Change detected in LESS file: ${filePath}. Re-processing styles...`);
        try {
            await processStyleAssets();
            console.log('Style re-processing completed.');
        } catch (err) {
            console.error('Error during style re-processing:', err.message);
        }
    });

    fileWatcher.watch(jsSourceFile).on('change', async (filePath) => {
        console.log(`Change detected in JS file: ${filePath}. Re-processing scripts...`);
        try {
            await processScriptAssets();
            console.log('Script re-processing completed.');
        } catch (err) {
            console.error('Error during script re-processing:', err.message);
        }
    });

    console.log('Source change surveillance active.');
}

async function initiateWorkflow() {
    const operation = process.argv[2] || 'default';

    switch (operation) {
        case 'default':
            console.log('Executing default operation...');
            await assembleProjectAssets();
            break;
        case 'development':
            console.log('Entering development mode...');
            await assembleProjectAssets();
            await monitorSourceChanges();
            break;
        case 'build':
            console.log('Executing build operation...');
            await assembleProjectAssets();
            break;
        case 'build-script':
            console.log('Executing build-script operation...');
            await processScriptAssets();
            break;
        case 'build-style':
            console.log('Executing build-style operation...');
            await processStyleAssets();
            break;
        case 'watch-files':
            console.log('Executing watch-files operation...');
            await monitorSourceChanges();
            break;
        default:
            console.error(`Unknown operation: "${operation}". Available operations: default, development, build, build-script, build-style, watch-files.`);
            process.exit(1);
    }
}

initiateWorkflow();