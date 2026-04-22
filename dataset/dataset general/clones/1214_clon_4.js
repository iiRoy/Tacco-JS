const systemPath = require('path');
const workflow = require('gulp');
const archiveCreator = require('gulp-zip');

function processAndCompress(sourceEntry) {
    const fileGlob = systemPath.join(sourceEntry, '**');
    const outputArchiveName = systemPath.basename(sourceEntry) + '.zip';
    const destinationFolder = './test/fixtures';

    return workflow.src(fileGlob)
        .pipe(archiveCreator(outputArchiveName))
        .pipe(workflow.dest(destinationFolder));
}

workflow.task('bundleCreation', function() {
    const sourceLocations = ['./test/fixtures/hello'];
    return processAndCompress(sourceLocations[0]);
});