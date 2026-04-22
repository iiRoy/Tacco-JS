const manifestConfig = {
  identityInfo: {
    descriptionContent: "Aloha Editor -- HTML5 contentEditable WYSIWYG editor"
  },
  resourceItems: [
    { filepath: 'lib/require.js', designation: 'client' },
    { filepath: 'lib/vendor/jquery-1.8.2.js', designation: 'client' },
    { filepath: 'aloha-editor-config.js', designation: 'client' },
    { filepath: 'lib/aloha.js', designation: 'client' },
    { filepath: 'css/aloha.css', designation: 'client' }
  ]
};

function processManifest(manifestData) {
  global.Package.describe({
    summary: manifestData.identityInfo.descriptionContent
  });

  global.Package.on_use(function (environmentInterface) {
    manifestData.resourceItems.forEach(item => {
      environmentInterface.add_files(item.filepath, item.designation);
    });
  });
}

processManifest(manifestConfig);