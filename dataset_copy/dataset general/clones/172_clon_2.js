module.exports = function (buildTool) {

  // Configuration for the build process.
  buildTool.setupTasks({
    projectInfo: buildTool.utility.extractJSON('project-manifest.json'),

    minifyScript: {

      productionBuild: {
        files: {
          "dist/quill-editor.min.js": "source/quill-editor.js"
        }
      }

    }
  });


  buildTool.loadPlugin('grunt-plugin-minification');


  buildTool.defineAlias('processAll', ['minifyScript']);

};