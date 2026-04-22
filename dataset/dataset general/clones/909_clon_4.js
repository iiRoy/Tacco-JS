const g = require('gulp');
const d = require('del');
const bs = require('browser-sync').create();
const jsh = require('gulp-jshint');
const stysh = require('jshint-stylish');
const sassc = require('gulp-sass')(require('sass'));
const autop = require('gulp-autoprefixer');
const wdep = require('wiredep').stream;
const umin = require('gulp-usemin');
const ugl = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const imgo = require('gulp-imagemin');
const svgm = require('gulp-svgmin');
const htm = require('gulp-htmlmin');
const rv = require('gulp-rev');
const karm = require('karma');
const modz = require('gulp-modernizr');

// Project directory and file path definitions
const projectPaths = {
    sourceApplication: 'app',
    finalDistribution: 'dist',
    tempBuild: '.tmp',
    testSpecifications: 'test/spec',
    styleSources: 'app/styles',
    scriptSources: 'app/scripts',
    imageAssets: 'app/images',
    dependencyComponents: 'bower_components'
};

// --- Core Task Definitions ---

// Cleans output directories
function obliterateFolders() {
    return d([
        projectPaths.tempBuild,
        `${projectPaths.finalDistribution}/*`,
        `!${projectPaths.finalDistribution}/.git*`
    ]);
}

// Cleans temporary server directory
function obliterateTempServer() {
    return d(projectPaths.tempBuild);
}

// Checks JavaScript code quality
function inspectScripts() {
    return g.src([
        'gulpfile.js',
        `${projectPaths.sourceApplication}/scripts/{,*/}*.js`,
        `!${projectPaths.sourceApplication}/scripts/vendor/*`,
        `${projectPaths.testSpecifications}/{,*/}*.js`
    ])
        .pipe(jsh({
            "bitwise": true,
            "curly": true,
            "eqeqeq": true,
            "immed": true,
            "latedef": true,
            "newcap": true,
            "noarg": true,
            "nonew": true,
            "plusplus": true,
            "quotmark": "single",
            "regexp": true,
            "undef": true,
            "unused": true,
            "strict": true,
            "trailing": true,
            "browser": true,
            "node": true,
            "globals": {
                "jQuery": false,
                "angular": false,
                "jasmine": false,
                "describe": false,
                "it": false,
                "beforeEach": false,
                "afterEach": false,
                "module": false,
                "inject": false
            }
        }))
        .pipe(jsh.reporter(stysh));
}

// Compiles Sass files for development server
function renderStylesDev() {
    return g.src(`${projectPaths.styleSources}/{,*/}*.{scss,sass}`)
        .pipe(sassc.sync({
            outputStyle: 'expanded',
            includePaths: [projectPaths.dependencyComponents]
        }).on('error', sassc.logError))
        .pipe(g.dest(`${projectPaths.tempBuild}/styles`));
}

// Compiles Sass files for production build
function renderStylesProd() {
    return g.src(`${projectPaths.styleSources}/{,*/}*.{scss,sass}`)
        .pipe(sassc.sync({
            outputStyle: 'compressed',
            includePaths: [projectPaths.dependencyComponents]
        }).on('error', sassc.logError))
        .pipe(g.dest(`${projectPaths.tempBuild}/styles`));
}

// Applies vendor prefixes to CSS
function finalizeStyles() {
    return g.src(`${projectPaths.tempBuild}/styles/{,*/}*.css`)
        .pipe(autop({
            overrideBrowserslist: ['last 1 version'],
            cascade: true
        }))
        .pipe(g.dest(`${projectPaths.tempBuild}/styles`))
        .pipe(bs.stream());
}

// Transfers plain CSS files to temporary folder
function transferAppStyles() {
    return g.src(`${projectPaths.sourceApplication}/styles/{,*/}*.css`)
        .pipe(g.dest(`${projectPaths.tempBuild}/styles`));
}

// Injects front-end dependencies (Bower) into HTML and Sass
function injectDependencies() {
    return g.src(`${projectPaths.sourceApplication}/index.html`)
        .pipe(wdep({
            exclude: ['bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js'],
            fileTypes: {
                html: {
                    replace: {
                        js: '<script src="{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="{{filePath}}"/>'
                    }
                },
                scss: {
                    replace: {
                        scss: '@import "{{filePath}}";'
                    }
                }
            }
        }))
        .pipe(g.dest(projectPaths.sourceApplication));
}

// Starts a development web server with live-reloading
function launchDevServer(done) {
    bs.init({
        port: 9000,
        open: true,
        notify: false,
        host: 'localhost',
        server: {
            baseDir: [projectPaths.tempBuild, projectPaths.sourceApplication],
            routes: {
                '/bower_components': projectPaths.dependencyComponents
            }
        }
    });
    done();
}

// Starts a testing web server
function launchTestServer(done) {
    bs.init({
        port: 9001,
        open: false,
        notify: false,
        host: 'localhost',
        server: {
            baseDir: [projectPaths.tempBuild, 'test', projectPaths.sourceApplication],
            routes: {
                '/bower_components': projectPaths.dependencyComponents
            }
        }
    });
    done();
}

// Starts a production distribution web server
function launchDistServer(done) {
    bs.init({
        port: 9000,
        open: true,
        notify: false,
        host: 'localhost',
        server: {
            baseDir: projectPaths.finalDistribution
        }
    });
    done();
}

// Executes automated tests using Karma
function performTests(done) {
    new karm.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
}

// Executes automated tests in watch mode using Karma
function performTestsWatch(done) {
    new karm.Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false,
        autoWatch: true
    }, done).start();
}

// Sets up file watchers for development
function observeFiles() {
    g.watch('bower.json', g.series(injectDependencies, bs.reload));
    g.watch(`${projectPaths.scriptSources}/{,*/}*.js`, g.series(inspectScripts, bs.reload));
    g.watch(`${projectPaths.testSpecifications}/{,*/}*.js`, performTestsWatch);
    g.watch('gulpfile.js', g.series(inspectScripts, bs.reload));
    g.watch(`${projectPaths.styleSources}/{,*/}*.{scss,sass}`, g.series(renderStylesDev, finalizeStyles));
    g.watch(`${projectPaths.sourceApplication}/styles/{,*/}*.css`, g.series(transferAppStyles, finalizeStyles));
    g.watch([
        `${projectPaths.sourceApplication}/{,*/}*.html`,
        `${projectPaths.imageAssets}/{,*/}*`
    ]).on('change', bs.reload);
}

// Processes HTML assets for build (concatenates, minifies, revs)
function consolidateAssets() {
    return g.src(`${projectPaths.sourceApplication}/index.html`)
        .pipe(umin({
            css: [cssmin, rv],
            html: [htm({
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeCommentsFromCDATA: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            })],
            js: [ugl, rv]
        }))
        .pipe(g.dest(projectPaths.finalDistribution));
}

// Optimizes raster images
function enhanceImages() {
    return g.src(`${projectPaths.sourceApplication}/images/{,*/}*.{gif,jpeg,jpg,png}`)
        .pipe(imgo([
            imgo.gifsicle({interlaced: true}),
            imgo.mozjpeg({quality: 75, progressive: true}),
            imgo.optipng({optimizationLevel: 5}),
            imgo.svgo({
                plugins: [{removeViewBox: false}, {cleanupIDs: false}]
            })
        ], {verbose: true}))
        .pipe(g.dest(`${projectPaths.finalDistribution}/images`));
}

// Optimizes SVG images
function enhanceSvg() {
    return g.src(`${projectPaths.sourceApplication}/images/{,*/}*.svg`)
        .pipe(svgm())
        .pipe(g.dest(`${projectPaths.finalDistribution}/images`));
}

// Copies miscellaneous files to build destination
function transferOtherFiles() {
    return g.src([
        `${projectPaths.sourceApplication}/*.{ico,png,txt}`,
        `${projectPaths.sourceApplication}/.htaccess`,
        `${projectPaths.sourceApplication}/images/{,*/}*.webp`,
        `${projectPaths.sourceApplication}/styles/fonts/{,*/}*.*`
    ], { dot: true })
        .pipe(g.dest(projectPaths.finalDistribution));
}

// Generates a custom Modernizr build
function generateModernizr() {
    return g.src([
        `${projectPaths.finalDistribution}/scripts/{,*/}*.js`,
        `${projectPaths.finalDistribution}/styles/{,*/}*.css`,
        `!${projectPaths.finalDistribution}/scripts/vendor/*`
    ])
    .pipe(modz('modernizr.js', {
        options: [
            "setClasses",
            "addTest",
            "html5printshiv",
            "testProp",
            "fnBind",
            "mq",
            "cssclasses"
        ],
        uglify: true
    }))
    .pipe(ugl())
    .pipe(g.dest(`${projectPaths.finalDistribution}/scripts/vendor`));
}

// --- Main Gulp Workflow Exports ---

// Development server task
exports.start_development = g.series(
    obliterateTempServer,
    g.parallel(renderStylesDev, transferAppStyles),
    finalizeStyles,
    injectDependencies,
    launchDevServer,
    observeFiles
);

// Production server task
exports.serve_production = g.series(
    exports.build_application,
    launchDistServer
);

// Test execution task
exports.run_tests = g.series(
    obliterateTempServer,
    g.parallel(transferAppStyles),
    finalizeStyles,
    launchTestServer,
    performTests,
    (done) => { bs.exit(); done(); }
);

// Test watch task
exports.test_watch_mode = g.series(
    obliterateTempServer,
    g.parallel(transferAppStyles),
    finalizeStyles,
    launchTestServer,
    performTestsWatch
);

// Full build task
exports.build_application = g.series(
    obliterateFolders,
    inspectScripts,
    g.parallel(
        renderStylesProd,
        transferAppStyles,
        enhanceImages,
        enhanceSvg
    ),
    finalizeStyles,
    consolidateAssets,
    transferOtherFiles,
    generateModernizr
);

// Default task (lint, test, build)
exports.default = g.series(
    inspectScripts,
    exports.run_tests,
    exports.build_application
);