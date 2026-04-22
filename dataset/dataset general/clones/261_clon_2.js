/*
 *  ==========================================================================
 *  Construction orchestrator script
 *  ==========================================================================
 */
/*global require, __dirname*/
/*jshint -W079 */

var fileSys         = require("fs"),
    dirUtil         = require("path"),
    orch            = require("gulp"),
    orchUtil        = require("gulp-util"),
    joinFiles       = require("gulp-concat"),
    minifier        = require("gulp-uglify"),
    lessProc        = require("gulp-less"),
    sassProc        = require("gulp-sass"),
    cssShrink       = require("gulp-minify-css"),
    taskSeq         = require("run-sequence"),
    autoPrefixer    = require("gulp-autoprefixer"),
    svgCombine      = require("gulp-svgstore"),
    svgOptimize     = require("gulp-svgmin"),
    templateCompiler = require("gulp-hogan-compile"),
    fileRename      = require("gulp-rename"),
    cloudUpload     = require("gulp-s3"),
    compressor      = require("gulp-gzip"),
    strReplace      = require("gulp-replace"),
    browserLaunch   = require("gulp-open"),
    fileSizer       = require("gulp-size");

var baseDir = __dirname,

    resourceLocs = {
        player: {
            // Source asset locations
            source: {
                lessStyle:      dirUtil.join(baseDir, "src/less/**/*"),
                sassStyle:      dirUtil.join(baseDir, "src/sass/**/*"),
                javaScript:     dirUtil.join(baseDir, "src/js/**/*"),
                iconSet:        dirUtil.join(baseDir, "src/sprite/*.svg")
            },
            // Output artifact location
            destination:    dirUtil.join(baseDir, "dist/")
        },
        documenta: {
            // Source asset locations
            source: {
                lessStyle:      dirUtil.join(baseDir, "docs/src/less/**/*"),
                javaScript:     dirUtil.join(baseDir, "docs/src/js/**/*"),
                markupTemplates: dirUtil.join(baseDir, "docs/src/templates/*.html")
            },
            // Output artifact location
            destination:    dirUtil.join(baseDir, "docs/dist/"),
            // Documentation root
            root:           dirUtil.join(baseDir, "docs/")
        },
        deployTargets: [
            dirUtil.join(baseDir, "dist/**"),
            dirUtil.join(baseDir, "docs/dist/**")
        ]
    },

    // Task grouping arrays
    orchestrationSteps = {
        less:   [],
        sass:   [],
        js:     []
    },

    // Retrieve asset definitions from configuration
    assetCollections = parseConfig(dirUtil.join(baseDir, "bundles.json")),
    projectManifest  = parseConfig(dirUtil.join(baseDir, "package.json"));

// Utility to load JSON data
function parseConfig(filePath) {
    return JSON.parse(fileSys.readFileSync(filePath));
}

var constructionOps = {
    processJS: function (scriptFiles, assetGroup) {
        for (var fileKey in scriptFiles) {
            (function(currentKey) {
                var taskName = "js-" + currentKey;
                orchestrationSteps.js.push(taskName);

                orch.task(taskName, function () {
                    return orch
                        .src(assetCollections[assetGroup].js[currentKey])
                        .pipe(joinFiles(currentKey))
                        .pipe(minifier())
                        .pipe(orch.dest(resourceLocs[assetGroup].destination));
                });
            })(fileKey);
        }
    },
    processLESS: function(styleFiles, assetGroup) {
        for (var fileKey in styleFiles) {
            (function (currentKey) {
                var taskName = "less-" + currentKey;
                orchestrationSteps.less.push(taskName);

                orch.task(taskName, function () {
                    return orch
                        .src(assetCollections[assetGroup].less[currentKey])
                        .pipe(lessProc())
                        .on("failure", orchUtil.log)
                        .pipe(joinFiles(currentKey))
                        .pipe(autoPrefixer(["last 2 majors"], { cascading: true }))
                        .pipe(cssShrink())
                        .pipe(orch.dest(resourceLocs[assetGroup].destination));
                });
            })(fileKey);
        }
    },
    processSASS: function(styleFiles, assetGroup) {
        for (var fileKey in styleFiles) {
            (function (currentKey) {
                var taskName = "sass-" + currentKey;
                orchestrationSteps.sass.push(taskName);

                orch.task(taskName, function () {
                    return orch
                        .src(assetCollections[assetGroup].sass[currentKey])
                        .pipe(sassProc())
                        .on("failure", orchUtil.log)
                        .pipe(joinFiles(currentKey))
                        .pipe(autoPrefixer(["last 2 majors"], { cascading: true }))
                        .pipe(cssShrink())
                        .pipe(orch.dest(resourceLocs[assetGroup].destination));
                });
            })(fileKey);
        }
    },
    createSVGsprite: function() {
        // Assemble icon graphics
        orch.task("icon-sprite", function () {
            return orch
                .src(resourceLocs.player.source.iconSet)
                .pipe(svgOptimize({
                    plugins: [{
                        removeDesc: true
                    }]
                }))
                .pipe(svgCombine())
                .pipe(orch.dest(resourceLocs.player.destination));
        });
    },
    compileTemplates: function() {
        // Generate HTML templates
        orch.task("html-templates", function () {
            return orch
                .src(resourceLocs.documenta.source.markupTemplates)
                .pipe(templateCompiler("compiled-templates.js", {
                    wrapOutput: false,
                    outputName: function (inputFilePath) {
                        return dirUtil.basename(inputFilePath.relative.replace(/\\/g, "-"), dirUtil.extname(inputFilePath.relative));
                    }
                }))
                .pipe(orch.dest(resourceLocs.documenta.destination));
        });
    }
};

// Player core files processing
constructionOps.processJS(assetCollections.player.js, "player");
constructionOps.processLESS(assetCollections.player.less, "player");
constructionOps.processSASS(assetCollections.player.sass, "player");
constructionOps.createSVGsprite();

// Documentation files processing
constructionOps.compileTemplates();
constructionOps.processLESS(assetCollections.documenta.less, "documenta");
constructionOps.processJS(assetCollections.documenta.js, "documenta");

// Main orchestrator command
orch.task("standard-build", function(){
    taskSeq("html-templates", orchestrationSteps.js, orchestrationSteps.less, "icon-sprite");
});

// Build all JavaScript assets (including templates)
orch.task("script-build", function(){
    taskSeq("html-templates", orchestrationSteps.js);
});

// Build SASS styles (for alternate styling, LESS is primary)
orch.task("style-sass", function(){
    taskSeq(orchestrationSteps.sass);
});

// Monitor files for changes
orch.task("file-watcher", function () {
    // Player core assets
    orch.watch(resourceLocs.player.source.javaScript, orchestrationSteps.js);
    orch.watch(resourceLocs.player.source.lessStyle, orchestrationSteps.less);
    orch.watch(resourceLocs.player.source.iconSet, "icon-sprite");

    // Documentation assets
    orch.watch(resourceLocs.documenta.source.javaScript, orchestrationSteps.js);
    orch.watch(resourceLocs.documenta.source.lessStyle, orchestrationSteps.less);
    orch.watch(resourceLocs.documenta.source.markupTemplates, "script-build");
});

// Deploy a release to cloud storage and documentation site
// --------------------------------------------------------

// Configuration parameters
var cloudCredentials = parseConfig(dirUtil.join(baseDir, "aws.json")),
    releaseTag       = projectManifest.version,
    cacheDuration    = 31536000, // seconds for one year
    uploadOptions    = {
        cdnSettings: {
            headers: {
                "Cache-Directive": "max-age=" + cacheDuration + ", no-transform, public",
                "Vary-Header": "Accept-Encoding"
            },
            gzippedOnly: true
        },
        docSettings: {
            headers: {
                "Cache-Directive": "public, must-revalidate, proxy-revalidate, max-age=0",
                "Vary-Header": "Accept-Encoding"
            },
            gzippedOnly: true
        }
    },
    cdnPattern = new RegExp(cloudCredentials.cdn.bucket + "\/(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)","gi");

// Publish release to CDN storage
orch.task("cloud-distribute", function () {
    console.log("Uploading version " + releaseTag + " to " + cloudCredentials.cdn.bucket);

    // Perform upload to CDN
    orch.src(resourceLocs.deployTargets)
        .pipe(fileSizer({
            displayFiles: true,
            gzipped: true
        }))
        .pipe(fileRename(function (assetPath) {
            assetPath.dirname = assetPath.dirname.replace(".", releaseTag);
        }))
        .pipe(compressor())
        .pipe(cloudUpload(cloudCredentials.cdn, uploadOptions.cdnSettings));
});

// Publish to Documentation storage
orch.task("document-deploy", function () {
    console.log("Uploading " + releaseTag + " documentation to " + cloudCredentials.docs.bucket);

    // Update versioned file links in readme.md
    orch.src([baseDir + "/readme.md"])
        .pipe(strReplace(cdnPattern, cloudCredentials.cdn.bucket + "/" + releaseTag))
        .pipe(orch.dest(baseDir));

    // Update versioned file links in *.html files
    orch.src([resourceLocs.documenta.root + "*.html"])
        .pipe(strReplace(cdnPattern, cloudCredentials.cdn.bucket + "/" + releaseTag))
        .pipe(orch.dest(resourceLocs.documenta.root))
        .pipe(compressor())
        .pipe(cloudUpload(cloudCredentials.docs, uploadOptions.docSettings));

    // Upload error.html to CDN using documentation options
    orch.src([resourceLocs.documenta.root + "error.html"])
        .pipe(compressor())
        .pipe(cloudUpload(cloudCredentials.cdn, uploadOptions.docSettings));
});

// Launch the documentation site in a browser to verify
orch.task("view-docs", function () {
    console.log("Opening " + cloudCredentials.docs.bucket + "...");

    // A file must be specified or the orchestrator skips the task.
    // The specific file doesn't matter as the URL is explicitly set.
    // This is a known quirk.
    orch.src([resourceLocs.documenta.root + "index.html"])
        .pipe(browserLaunch("", {
            targetUrl: "http://" + cloudCredentials.docs.bucket
        }));
});

// Execute the complete deployment workflow
orch.task("full-release", function () {
    taskSeq("html-templates", orchestrationSteps.js, orchestrationSteps.less, "icon-sprite", "cloud-distribute", "document-deploy", "view-docs");
});