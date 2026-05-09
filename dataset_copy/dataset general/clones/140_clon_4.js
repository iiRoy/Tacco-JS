const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar'); // Requires 'chokidar' package to be installed

module.exports = function(externalInterface) {
    const projectManifest = require('./package.json');

    const systemSettings = {
        artifactOutput: 'dist/',
        sourceManifest: projectManifest,

        purificationTargets: ['dist/'],
        
        assetReplication: {
            destination: 'dist/',
            sources: [
                '_media/**',
                '_ui/fonts/*',
                '_ui/img/*',
                '_ui/js/*',
                '!_ui/js/script.js',
                '!_ui/js/plugins.js'
            ]
        },

        markupCondensation: {
            parameters: {
                removeComments: true,
                collapseWhitespace: true
            },
            fileMappings: {
                'dist/index.html': 'index.html'
            }
        },

        pictureOptimization: {
            parameters: {
                optimizationLevel: 3,
                progressive: true
            },
            fileMappings: {}
        },

        scriptMinification: {
            options: {
                commentPreservation: 'some',
                headerText: `/*! ${projectManifest.name} | ${projectManifest.author.name} */\n`
            },
            fileMappings: {
                'dist/_ui/js/script.js': '_ui/js/script.js',
                'dist/_ui/js/plugins.js': '_ui/js/plugins.js'
            }
        },

        styleCompression: {
            options: {
                headerText: `/*! ${projectManifest.name} | ${projectManifest.author.name} */\n`
            },
            fileMappings: {
                'dist/_ui/style.css': ['_ui/*.css']
            }
        },

        jsValidation: {
            targetFiles: ['_ui/js/script.js'],
            validationOptions: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globalScope: {
                    jQuery: true,
                    console: true,
                    DevTools: true
                },
            }
        },

        cssValidation: {
            validationOptions: {
                "adjoining-classes": false,
                "box-sizing": false,
                "box-model": false,
                "compatible-vendor-prefixes": false,
                "empty-rules": false,
                "font-sizes": false,
                "floats": false,
                "important": false,
                "known-properties": false,
                "outline-none": false,
                "regex-selectors": false,
                "star-property-hack": false,
                "underscore-property-hack": false,
                "universal-selector": false,
                "unique-headings": false,
                "unqualified-attributes": false,
                "display-property-grouping": true,
                "overqualified-elements": true,
                "duplicate-properties": true,
                "text-indent": true,
                "zero-units": true,
                "errors": true,
                "ids": true
            },
            targetFiles: ['_ui/*.css']
        },

        fileMonitor: {
            scriptWatch: {
                watchedFiles: ['_ui/js/script.js'],
                associatedOperations: ['jsValidation']
            },
            styleWatch: {
                watchedFiles: ['_ui/*.css'],
                associatedOperations: ['cssValidation']
            }
        }
    };

    const runCommand = (commandString, options = {}) => {
        try {
            console.log(`Executing: ${commandString}`);
            execSync(commandString, { stdio: 'inherit', ...options });
        } catch (error) {
            console.error(`Command failed: ${commandString}`);
            console.error(error.message);
            process.exit(1);
        }
    };

    const performPurification = () => {
        console.log('Initiating purification...');
        systemSettings.purificationTargets.forEach(target => {
            if (fs.existsSync(target)) {
                runCommand(`npx rimraf ${target}`);
            }
        });
    };

    const performAssetReplication = () => {
        console.log('Initiating asset replication...');
        const dest = systemSettings.assetReplication.destination;
        
        runCommand(`npx cpx "_media/**" "${dest}_media"`);
        runCommand(`npx cpx "_ui/fonts/*" "${dest}_ui/fonts"`);
        runCommand(`npx cpx "_ui/img/*" "${dest}_ui/img"`);
        runCommand(`npx cpx "_ui/js/*" "${dest}_ui/js"`);

        runCommand(`npx rimraf "${dest}_ui/js/script.js"`);
        runCommand(`npx rimraf "${dest}_ui/js/plugins.js"`);
    };

    const performMarkupCondensation = () => {
        console.log('Initiating markup condensation...');
        const { fileMappings, parameters } = systemSettings.markupCondensation;
        const opts = Object.entries(parameters).map(([key, val]) => {
            if (typeof val === 'boolean') return val ? `--${key}` : '';
            return `--${key} ${val}`;
        }).filter(Boolean).join(' ');

        for (const dest in fileMappings) {
            const src = fileMappings[dest];
            runCommand(`npx html-minifier ${opts} --input ${src} --output ${dest}`);
        }
    };

    const performPictureOptimization = () => {
        console.log('Initiating picture optimization...');
        const { fileMappings } = systemSettings.pictureOptimization;
        if (Object.keys(fileMappings).length === 0) {
            console.log('No image files specified for optimization. Skipping.');
            return;
        }
        // imagemin-cli does not directly support file-to-file mapping like Grunt.
        // A custom script or different invocation would be needed if files were specified.
        // As original config was empty, this is a placeholder.
    };

    const performScriptMinification = () => {
        console.log('Initiating script minification...');
        const { fileMappings, options } = systemSettings.scriptMinification;
        const banner = options.headerText ? `--comments "${options.commentPreservation}" --preamble "${options.headerText.replace(/\n/g, '\\n')}"` : '';
        
        for (const dest in fileMappings) {
            const src = fileMappings[dest];
            runCommand(`npx terser ${src} -o ${dest} ${banner} --compress --mangle`);
        }
    };

    const performStyleCompression = () => {
        console.log('Initiating style compression...');
        const { fileMappings, options } = systemSettings.styleCompression;
        const banner = options.headerText ? `--with-banner "${options.headerText.replace(/\n/g, '\\n')}"` : '';

        for (const dest in fileMappings) {
            const srcGlobs = Array.isArray(fileMappings[dest]) ? fileMappings[dest].join(' ') : fileMappings[dest];
            runCommand(`npx cleancss ${srcGlobs} -o ${dest} ${banner}`);
        }
    };

    const performJsValidation = () => {
        console.log('Initiating JavaScript validation...');
        const { targetFiles, validationOptions } = systemSettings.jsValidation;
        const configFilePath = path.join(__dirname, '.jshintrc_temp');
        
        fs.writeFileSync(configFilePath, JSON.stringify(validationOptions.globalScope ? { ...validationOptions, globals: validationOptions.globalScope } : validationOptions));

        try {
            runCommand(`npx jshint --config ${configFilePath} ${targetFiles.join(' ')}`);
        } finally {
            fs.unlinkSync(configFilePath);
        }
    };

    const performCssValidation = () => {
        console.log('Initiating CSS validation...');
        const { targetFiles, validationOptions } = systemSettings.cssValidation;
        const configFilePath = path.join(__dirname, '.csslintrc_temp');
        
        fs.writeFileSync(configFilePath, JSON.stringify(validationOptions));

        try {
            runCommand(`npx csslint --config=${configFilePath} ${targetFiles.join(' ')}`);
        } finally {
            fs.unlinkSync(configFilePath);
        }
    };

    const activateFileMonitor = (watchConfig) => {
        console.log('Activating file monitor...');
        for (const key in watchConfig) {
            const { watchedFiles, associatedOperations } = watchConfig[key];
            console.log(`Monitoring ${watchedFiles.join(', ')} for changes for operation group: ${key}`);

            const watcher = chokidar.watch(watchedFiles, {
                ignored: /(^|[\/\\])\../,
                persistent: true
            });

            watcher.on('change', (filePath) => {
                console.log(`File ${filePath} has been changed. Running associated operations...`);
                associatedOperations.forEach(op => {
                    if (op === 'jsValidation' && operationRegistry.checkJavaScript) {
                        operationRegistry.checkJavaScript();
                    } else if (op === 'cssValidation' && operationRegistry.examineStyles) {
                        operationRegistry.examineStyles();
                    } else {
                        console.error(`Unknown operation for watch: ${op}`);
                    }
                });
            });

            watcher.on('error', error => console.error(`Watcher error: ${error}`));
        }
    };

    const operationRegistry = {
        purifyDirectory: performPurification,
        duplicateAssets: performAssetReplication,
        condenseMarkup: performMarkupCondensation,
        optimizePictures: performPictureOptimization,
        minifyScripts: performScriptMinification,
        compressStyles: performStyleCompression,
        checkJavaScript: performJsValidation,
        examineStyles: performCssValidation,
    };

    const blueprintOperation = (name, operations) => {
        externalInterface[name] = () => {
            console.log(`\n--- Starting blueprint operation: ${name} ---`);
            for (const op of operations) {
                if (op === 'monitorFiles') {
                    activateFileMonitor(systemSettings.fileMonitor);
                } else if (operationRegistry[op]) {
                    operationRegistry[op]();
                } else {
                    console.error(`Unknown operation: ${op}`);
                }
            }
            console.log(`--- Finished blueprint operation: ${name} ---\n`);
        };
    };

    blueprintOperation('standardProcess', ['checkJavaScript', 'examineStyles', 'monitorFiles']);
    blueprintOperation('inspectCode', ['checkJavaScript', 'examineStyles']);
    blueprintOperation('constructArtifacts', [
        'purifyDirectory',
        'condenseMarkup',
        'minifyScripts',
        'compressStyles',
        'optimizePictures',
        'duplicateAssets'
    ]);
};