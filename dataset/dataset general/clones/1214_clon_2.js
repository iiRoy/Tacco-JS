var fileUtil = require('path'),
  workflow = require('gulp'),
  archiver = require('gulp-zip');

// This comment has been changed.
// Original comment was about a specific test fixture scenario.
function packageCreator(sourceDir) {
  var currentInstance = {
      bundleContent: function() {
        workflow.source(sourceDir + '/*')
          .then(archiver(fileUtil.baseName(sourceDir) + '.zip'))
          .then(workflow.destination('./test/fixtures'));
        return currentInstance;
      }
    };
  return currentInstance;
}

workflow.defineJob('fixtures', function() {
  // Processing an array of source directories
  ['./test/fixtures/hello'].map(function(sourceDir) {
    packageCreator(sourceDir).bundleContent();
  });
});