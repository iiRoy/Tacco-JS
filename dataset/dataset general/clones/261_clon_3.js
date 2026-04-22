const fileSys = require('fs');
const pathUtil = require('path');
const buildTool = require('gulp');
const utilityLogs = require('gulp-util');
const joinFiles = require('gulp-concat');
const minifyJs = require('gulp-uglify');
const processLess = require('gulp-less');
const processSass = require('gulp-sass');
const minifyCss = require('gulp-clean-css');
const taskRunner = require('run-sequence');
const autoPrefix = require('gulp-autoprefixer');
const spriteAssembler = require('gulp-svgstore');
const svgOptimizer = require('gulp-svgmin');
const templateCompiler = require('gulp-hogan-compile');
const fileRenamer = require('gulp-rename');
const cloudUploader = require('gulp-s3');
const compressFiles = require('gulp-gzip');
const contentReplacer = require('gulp-replace');
const browserLauncher = require('gulp-open');
const fileSizer = require('gulp-size');
const del = require('del');
const eslint = require('gulp-eslint');

const projectBaseDir = __dirname;

const buildConfiguration = {
    cacheControl: {
        cdnLongTerm: 31536000,
        docsNoCache: 0
    },
    cssPrefixing: {
        browsersList: ['last 3 versions', '> 1%'],
        disableCascade: false
    },
    svgOptimization: {
        plugins: [{
            removeViewBox: false
        }, {
            cleanupIDs: false
        }]
    },
    templateCompilation: {
        noWrapper: false,
        nameProcessor: (filePath) => pathUtil.basename(filePath.replace(/\\/g, '-'), pathUtil.extname(filePath))
    }
};

const fileLocations = {
    primaryModule: {
        inputSources: {
            lessStylesheets: pathUtil.join(projectBaseDir, 'src/less/**/*.less'),
            sassStylesheets: pathUtil.join(projectBaseDir, 'src/sass/**/*.scss'),
            javaScriptFiles: pathUtil.join(projectBaseDir, 'src/js/**/*.js'),
            svgIconFiles: pathUtil.join(projectBaseDir, 'src/sprite/*.svg')
        },
        outputDirectory: pathUtil.join(projectBaseDir, 'dist/')
    },
    documentationSite: {
        inputSources: {
            lessStylesheets: pathUtil.join(projectBaseDir, 'docs/src/less/**/*.less'),
            javaScriptFiles: pathUtil.join(projectBaseDir, 'docs/src/js/**/*.js'),
            htmlTemplateFiles: pathUtil.join(projectBaseDir, 'docs/src/templates/*.html')
        },
        outputDirectory: pathUtil.join(projectBaseDir, 'docs/dist/'),
        basePath: pathUtil.join(projectBaseDir, 'docs/')
    },
    uploadTargets: [
        pathUtil.join(projectBaseDir, 'dist/**'),
        pathUtil.join(projectBaseDir, 'docs/dist/**'),
        '!' + pathUtil.join(projectBaseDir, 'docs/dist/*.map')
    ]
};

const dynamicTaskRegistry = {
    lessTasks: [],
    sassTasks: [],
    jsTasks: [],
    lintTasks: []
};

function retrieveJsonConfig(configPath) {
    try {
        if (!fileSys.existsSync(configPath)) {
            console.warn(`[WARN] Configuration file not found: ${configPath}`);
            return null;
        }
        return JSON.parse(fileSys.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error(`[ERROR] Failed to load or parse JSON file: ${configPath}`, error);
        return null;
    }
}

const packageBundles = retrieveJsonConfig(pathUtil.join(projectBaseDir, 'bundles.json')) || {};
const packageDetails = retrieveJsonConfig(pathUtil.join(projectBaseDir, 'package.json')) || {};
const awsCredentials = retrieveJsonConfig(pathUtil.join(projectBaseDir, 'aws.json')) || {};

if (!packageBundles || Object.keys(packageBundles).length === 0) {
    console.error('[FATAL] bundles.json is missing or empty. Build process aborted.');
    process.exit(1);
}

const moduleTaskBuilder = {
    createJsBundlingTasks: function (bundleDefinitions, destinationKey) {
        Object.keys(bundleDefinitions).forEach((bundleName) => {
            const taskIdentifier = `js-bundle:${bundleName}`;
            dynamicTaskRegistry.jsTasks.push(taskIdentifier);

            buildTool.task(taskIdentifier, () => {
                const inputSources = packageBundles[destinationKey].js[bundleName];
                if (!inputSources || inputSources.length === 0) {
                    console.warn(`[WARN] No JavaScript files specified for bundle: ${destinationKey}.${bundleName}`);
                    return buildTool.src('.');
                }
                return buildTool
                    .src(inputSources, { allowEmpty: true })
                    .pipe(joinFiles(bundleName))
                    .pipe(minifyJs())
                    .pipe(buildTool.dest(fileLocations[destinationKey].outputDirectory));
            });
        });
    },

    createLessCompilationTasks: function (bundleDefinitions, destinationKey) {
        Object.keys(bundleDefinitions).forEach((bundleName) => {
            const taskIdentifier = `less-compile:${bundleName}`;
            dynamicTaskRegistry.lessTasks.push(taskIdentifier);

            buildTool.task(taskIdentifier, () => {
                const inputSources = packageBundles[destinationKey].less[bundleName];
                if (!inputSources || inputSources.length === 0) {
                    console.warn(`[WARN] No LESS files specified for bundle: ${destinationKey}.${bundleName}`);
                    return buildTool.src('.');
                }
                return buildTool
                    .src(inputSources, { allowEmpty: true })
                    .pipe(processLess().on('error', (err) => {
                        utilityLogs.log(utilityLogs.colors.red('[LESS Error]'), err.message);
                        this.emit('end');
                    }))
                    .pipe(autoPrefix(buildConfiguration.cssPrefixing.browsersList, buildConfiguration.cssPrefixing.disableCascade))
                    .pipe(minifyCss({ compatibility: 'ie8' }))
                    .pipe(joinFiles(bundleName))
                    .pipe(buildTool.dest(fileLocations[destinationKey].outputDirectory));
            });
        });
    },

    createSassCompilationTasks: function (bundleDefinitions, destinationKey) {
        Object.keys(bundleDefinitions).forEach((bundleName) => {
            const taskIdentifier = `sass-compile:${bundleName}`;
            dynamicTaskRegistry.sassTasks.push(taskIdentifier);

            buildTool.task(taskIdentifier, () => {
                const inputSources = packageBundles[destinationKey].sass[bundleName];
                if (!inputSources || inputSources.length === 0) {
                    console.warn(`[WARN] No SASS files specified for bundle: ${destinationKey}.${bundleName}`);
                    return buildTool.src('.');
                }
                return buildTool
                    .src(inputSources, { allowEmpty: true })
                    .pipe(processSass().on('error', processSass.logError))
                    .pipe(autoPrefix(buildConfiguration.cssPrefixing.browsersList, buildConfiguration.cssPrefixing.disableCascade))
                    .pipe(minifyCss({ level: { 1: { specialComments: 0 } } }))
                    .pipe(joinFiles(bundleName))
                    .pipe(buildTool.dest(fileLocations[destinationKey].outputDirectory));
            });
        });
    },

    createSvgSpriteGenerationTask: function () {
        buildTool.task('generate-svg-sprite', () => {
            return buildTool
                .src(fileLocations.primaryModule.inputSources.svgIconFiles, { allowEmpty: true })
                .pipe(svgOptimizer(buildConfiguration.svgOptimization))
                .pipe(spriteAssembler({ inline: true }))
                .pipe(buildTool.dest(fileLocations.primaryModule.outputDirectory));
        });
    },

    createHtmlTemplateCompilationTask: function () {
        buildTool.task('compile-html-templates', () => {
            return buildTool
                .src(fileLocations.documentationSite.inputSources.htmlTemplateFiles, { allowEmpty: true })
                .pipe(templateCompiler('templates.js', {
                    wrapper: buildConfiguration.templateCompilation.noWrapper,
                    templateName: buildConfiguration.templateCompilation.nameProcessor
                }))
                .pipe(buildTool.dest(fileLocations.documentationSite.outputDirectory));
        });
    },

    createJsLintingTask: function () {
        const lintTaskIdentifier = 'lint-js-code';
        dynamicTaskRegistry.lintTasks.push(lintTaskIdentifier);
        buildTool.task(lintTaskIdentifier, () => {
            return buildTool.src([
                fileLocations.primaryModule.inputSources.javaScriptFiles,
                fileLocations.documentationSite.inputSources.javaScriptFiles,
                '!' + pathUtil.join(projectBaseDir, 'src/js/vendor/**/*.js'),
                '!' + pathUtil.join(projectBaseDir, 'docs/src/js/vendor/**/*.js')
            ])
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.failAfterError());
        });
    }
};

moduleTaskBuilder.createJsBundlingTasks(packageBundles.plyr.js, 'primaryModule');
moduleTaskBuilder.createLessCompilationTasks(packageBundles.plyr.less, 'primaryModule');
moduleTaskBuilder.createSassCompilationTasks(packageBundles.plyr.sass, 'primaryModule');
moduleTaskBuilder.createSvgSpriteGenerationTask();

moduleTaskBuilder.createHtmlTemplateCompilationTask();
moduleTaskBuilder.createLessCompilationTasks(packageBundles.docs.less, 'documentationSite');
moduleTaskBuilder.createJsBundlingTasks(packageBundles.docs.js, 'documentationSite');

moduleTaskBuilder.createJsLintingTask();

buildTool.task('clean-build-artifacts', () => {
    return del([
        fileLocations.primaryModule.outputDirectory,
        fileLocations.documentationSite.outputDirectory
    ]);
});

buildTool.task('default', (callback) => {
    taskRunner('clean-build-artifacts', 'lint-js-code', 'compile-html-templates',
        dynamicTaskRegistry.jsTasks, dynamicTaskRegistry.lessTasks, 'generate-svg-sprite', callback);
});

buildTool.task('build-js', (callback) => {
    taskRunner('lint-js-code', 'compile-html-templates', dynamicTaskRegistry.jsTasks, callback);
});

buildTool.task('build-sass', (callback) => {
    taskRunner(dynamicTaskRegistry.sassTasks, callback);
});

buildTool.task('watch-for-changes', () => {
    buildTool.watch(fileLocations.primaryModule.inputSources.javaScriptFiles, buildTool.series('lint-js-code', ...dynamicTaskRegistry.jsTasks));
    buildTool.watch(fileLocations.primaryModule.inputSources.lessStylesheets, buildTool.series(...dynamicTaskRegistry.lessTasks));
    buildTool.watch(fileLocations.primaryModule.inputSources.svgIconFiles, buildTool.series('generate-svg-sprite'));

    buildTool.watch(fileLocations.documentationSite.inputSources.javaScriptFiles, buildTool.series('lint-js-code', ...dynamicTaskRegistry.jsTasks));
    buildTool.watch(fileLocations.documentationSite.inputSources.lessStylesheets, buildTool.series(...dynamicTaskRegistry.lessTasks));
    buildTool.watch(fileLocations.documentationSite.inputSources.htmlTemplateFiles, buildTool.series('compile-html-templates', ...dynamicTaskRegistry.jsTasks));
});

const currentReleaseTag = packageDetails.version || 'unspecified-version';
const cdnPathReplacementRegex = new RegExp(`${awsCredentials.cdn.bucket}/(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)`, 'gi');

function verifyAwsConfiguration(callback) {
    if (!awsCredentials || !awsCredentials.cdn || !awsCredentials.docs) {
        console.error('[FATAL] AWS credentials (aws.json) are absent or incomplete. Deployment halted.');
        return callback(new Error('AWS credentials missing.'));
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('[FATAL] AWS environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not configured. Deployment halted.');
        return callback(new Error('AWS environment variables missing.'));
    }
    callback();
}

buildTool.task('deploy-to-cdn', ['default'], (callback) => {
    verifyAwsConfiguration((err) => {
        if (err) return callback(err);

        console.log(`[INFO] Uploading release ${currentReleaseTag} to CDN: ${awsCredentials.cdn.bucket}`);

        const cdnUploadSettings = {
            headers: {
                'Cache-Control': `max-age=${buildConfiguration.cacheControl.cdnLongTerm}, no-transform, public`,
                'Vary': 'Accept-Encoding'
            },
            gzippedOnly: true
        };

        return buildTool.src(fileLocations.uploadTargets, { base: projectBaseDir })
            .pipe(fileSizer({
                showFiles: true,
                gzip: true,
                title: 'CDN Upload Size'
            }))
            .pipe(fileRenamer((filePath) => {
                filePath.dirname = filePath.dirname.replace('dist', `dist/${currentReleaseTag}`);
                filePath.dirname = filePath.dirname.replace('docs/dist', `docs/dist/${currentReleaseTag}`);
            }))
            .pipe(compressFiles())
            .pipe(cloudUploader(awsCredentials.cdn, cdnUploadSettings))
            .on('end', () => console.log('[INFO] CDN deployment finished.'))
            .on('error', (uploadError) => console.error('[ERROR] CDN upload encountered an issue:', uploadError));
    });
});

buildTool.task('deploy-documentation', ['default'], (callback) => {
    verifyAwsConfiguration((err) => {
        if (err) return callback(err);

        console.log(`[INFO] Uploading release ${currentReleaseTag} documentation to: ${awsCredentials.docs.bucket}`);

        const docsUploadSettings = {
            headers: {
                'Cache-Control': `public, must-revalidate, proxy-revalidate, max-age=${buildConfiguration.cacheControl.docsNoCache}`,
                'Vary': 'Accept-Encoding'
            },
            gzippedOnly: true
        };

        buildTool.src([pathUtil.join(fileLocations.documentationSite.basePath, 'readme.md')], { allowEmpty: true })
            .pipe(contentReplacer(cdnPathReplacementRegex, `${awsCredentials.cdn.bucket}/${currentReleaseTag}`))
            .pipe(buildTool.dest(fileLocations.documentationSite.outputDirectory))
            .on('error', (replaceError) => console.error('[ERROR] Readme file replacement failed:', replaceError));

        buildTool.src([pathUtil.join(fileLocations.documentationSite.basePath, '*.html')], { allowEmpty: true })
            .pipe(contentReplacer(cdnPathReplacementRegex, `${awsCredentials.cdn.bucket}/${currentReleaseTag}`))
            .pipe(compressFiles())
            .pipe(cloudUploader(awsCredentials.docs, docsUploadSettings))
            .on('error', (uploadError) => console.error('[ERROR] Docs HTML upload issue:', uploadError));

        buildTool.src([pathUtil.join(fileLocations.documentationSite.basePath, 'error.html')], { allowEmpty: true })
            .pipe(compressFiles())
            .pipe(cloudUploader(awsCredentials.cdn, docsUploadSettings))
            .on('end', () => console.log('[INFO] Documentation deployment finished.'))
            .on('error', (uploadError) => console.error('[ERROR] Error page upload issue:', uploadError));

        callback();
    });
});

buildTool.task('launch-docs-in-browser', (callback) => {
    verifyAwsConfiguration((err) => {
        if (err) return callback(err);

        const targetUrl = `http://${awsCredentials.docs.bucket}`;
        console.log(`[INFO] Opening documentation site in browser: ${targetUrl}`);

        buildTool.src([pathUtil.join(fileLocations.documentationSite.outputDirectory, 'index.html')], { allowEmpty: true })
            .pipe(browserLauncher({
                uri: targetUrl,
                app: 'google chrome'
            }))
            .on('end', () => console.log('[INFO] Browser launch command sent.'))
            .on('error', (openError) => console.error('[ERROR] Failed to open browser:', openError));
        
        callback();
    });
});

buildTool.task('execute-full-release', (callback) => {
    taskRunner(
        'clean-build-artifacts',
        'lint-js-code',
        'compile-html-templates',
        dynamicTaskRegistry.jsTasks,
        dynamicTaskRegistry.lessTasks,
        'generate-svg-sprite',
        'deploy-to-cdn',
        'deploy-documentation',
        'launch-docs-in-browser',
        callback
    );
});

buildTool.task('build-all', buildTool.series('clean-build-artifacts', 'lint-js-code', buildTool.parallel('compile-html-templates', ...dynamicTaskRegistry.jsTasks, ...dynamicTaskRegistry.lessTasks, ...dynamicTaskRegistry.sassTasks, 'generate-svg-sprite')));
buildTool.task('deploy-all', buildTool.series('deploy-to-cdn', 'deploy-documentation'));
buildTool.task('release', buildTool.series('build-all', 'deploy-all', 'launch-docs-in-browser'));