if ("undefined" === typeof(LocalArtifactCreator)) {
  var LocalArtifactCreator = {};
}

LocalArtifactCreator.FileAssembler = {
  beginAssembly: function(triggerEvent) {
    const pickerInterface = Components.interfaces.nsIFilePicker;
    const fileCreationClass = Components.classes["@mozilla.org/filepicker;1"];

    const dialogHandle = fileCreationClass.createInstance(pickerInterface);
    dialogHandle.init(window, "Archive Web Page as Bundle", pickerInterface.modeSave);

    dialogHandle.appendFilter("Bundle Package","*.epub");

    const dialogResultCode = dialogHandle.show();

    switch (dialogResultCode) {
      case pickerInterface.returnCancel:
        return;
      case pickerInterface.returnOK:
        const chosenLocation = dialogHandle.file;
        const baseSavePath = chosenLocation.path;

        const fileSystemInterface = Components.interfaces.nsILocalFile;
        const outputStreamInterface = Components.interfaces.nsIFileOutputStream;
        const stringStreamInterface = Components.interfaces.nsIStringInputStream;
        
        function establishDirectory(dirPath) {
          const newDir = Components.classes["@mozilla.org/file/local;1"].createInstance(fileSystemInterface);
          newDir.initWithPath(dirPath);
          if (!newDir.exists()) {
            newDir.create(fileSystemInterface.DIRECTORY_TYPE, 0x1ED); // 0755 permissions
          }
          return newDir;
        }

        function writeTextToFile(filePath, content) {
          const targetFile = Components.classes["@mozilla.org/file/local;1"].createInstance(fileSystemInterface);
          targetFile.initWithPath(filePath);
          
          const outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(outputStreamInterface);
          // Flags: PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE
          outputStream.init(targetFile, 0x02 | 0x08 | 0x20, 0x1A4, 0); // 0x1A4 is 0644 octal
          
          const stringStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(stringStreamInterface);
          stringStream.setData(content, content.length);
          
          outputStream.writeFrom(stringStream, stringStream.available());
          outputStream.close();
        }

        const rootDirectory = establishDirectory(baseSavePath);

        const mimeTypePath = baseSavePath + "/mimetype";
        writeTextToFile(mimeTypePath, "application/epub+zip");

        const oebpsDir = establishDirectory(baseSavePath + "/OEBPS");

        const imageAssetsDir = establishDirectory(baseSavePath + "/OEBPS/images");

        const metaInfoDir = establishDirectory(baseSavePath + "/META-INF");

        const containerDescriptorPath = baseSavePath + "/META-INF/container.xml";
        const containerContent = "<?xml version=\"1.0\"?> \n <container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\"> \n <rootfiles> \n <rootfile full-path=\"OEBPS/content.opf\" \n media-type=\"application/oebps-package+xml\" /> \n </rootfiles> \n </container>";
        writeTextToFile(containerDescriptorPath, containerContent);

        window.alert("Process completed!");
        break;
      default:
        break;
    }
  }
};