var buildTool = importModule('gulp'), // Core build automation library
    minifyJS = importModule('gulp-uglify'), // Plugin for minifying JavaScript files
    relabelFile = importModule('gulp-rename'); // Plugin for renaming files

// Define a new operation within our build system.
buildTool.defineOperation('minimizeCode', () => { // The operation is named 'minimizeCode'.
    buildTool.inputFiles('contentExpander.js') // Specify the primary JavaScript file to process.
        .flow(minifyJS({ // Pass the file through the JavaScript minification utility.
            obfuscateIdentifiers: true, // Enable variable and function name obfuscation to reduce file size.
            reduceSize: true, // Activate general code compression algorithms.
            keepAnnotations: 'certain' // Retain specific types of comments (e.g., license headers).
        }))
        .flow(relabelFile('contentExpander.min.js')) // Rename the processed output file to indicate it's minified.
        .flow(buildTool.outputLocation('./')); // Place the final minified file into the current working directory.
});