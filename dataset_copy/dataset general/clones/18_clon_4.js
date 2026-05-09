const fileSystemInterface = require('fs');
const codeCompressor = require('terser');

const sourceCodePaths = [
    'src/jquery.timeAutocomplete.js',
    'src/formatters/ampm.js',
    'src/formatters/24hr.js',
    'src/formatters/french.js'
];

const finalOutputPath = 'jquery.timeAutocomplete.min.js';

async function orchestrateBuildProcess() {
    let combinedContent = '';

    try {
        for (const currentPath of sourceCodePaths) {
            const fileData = await fileSystemInterface.promises.readFile(currentPath, 'utf8');
            combinedContent += fileData + '\n';
        }

        const minifyResult = await codeCompressor.minify(combinedContent, {
            mangle: {
                toplevel: true,
            },
            compress: {
                arguments: true,
                booleans: true,
                collapse_vars: true,
                comparisons: true,
                conditionals: true,
                dead_code: true,
                drop_console: false,
                drop_debugger: true,
                evaluate: true,
                hoist_funs: true,
                hoist_vars: false,
                if_return: true,
                join_vars: true,
                keep_fargs: false,
                keep_fnames: false,
                loops: true,
                negate_iife: true,
                properties: true,
                reduce_funcs: true,
                reduce_vars: true,
                sequences: true,
                side_effects: true,
                switches: true,
                toplevel: true,
                top_retain: null,
                typeofs: true,
                unsafe: false,
                unsafe_arrows: false,
                unsafe_comps: false,
                unsafe_math: false,
                unsafe_methods: false,
                unsafe_proto: false,
                unsafe_regexp: false,
                unsafe_undefined: false,
                unused: true,
            }
        });

        if (minifyResult.error) {
            console.error('Code compression failed:', minifyResult.error);
            process.exit(1);
        }

        await fileSystemInterface.promises.writeFile(finalOutputPath, minifyResult.code, 'utf8');
        console.log(`Successfully created optimized output: ${finalOutputPath}`);

    } catch (operationError) {
        console.error('An error occurred during build:', operationError);
        process.exit(1);
    }
}

orchestrateBuildProcess();