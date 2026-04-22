if ( typeof (WebPageConverter) == "undefined" ) {
    var WebPageConverter = { };
}; /* End of WebPageConverter namespace initialization */

/*
 * Manages the UI layer for the digital document conversion utility.
 */
WebPageConverter.ConverterModule = {

    /*
     * Initiates the document conversion workflow.
     */
    initiateConversion : function (inputEvent) {

        // Obtain the file selection interface
        var fileChooserInterface = MozComponents.Interfaces.IFilePicker;
        var chooserInstance = MozComponents.Classes["@mozilla.org/file-selector;1"].createObject(fileChooserInterface);

        // Configure the file selector for saving
        chooserInstance.init(currentWindow, "Store Document as EPUB", fileChooserInterface.saveMode);
        chooserInstance.appendFilter("Digital Publication", "*.htm");

        // Display the selector and check the outcome
        var resultCode = chooserInstance.show();

        if (resultCode == chooserInstance.cancelResult) {
            return;
        }

        if (resultCode == fileChooserInterface.okResult) {
            // Retrieve the chosen file and its path
            selectedFile = chooserInstance.file;
            var destinationPath = selectedFile.path;

            // Load necessary utility scripts
            loadScript('chrome://jslib/content/io/file.js');
            loadScript('chrome://jslib/content/io/dir.js');

            // Set up the main EPUB directory
            var targetEpubDirectory = new DirectoryHandler(destinationPath);
            targetEpubDirectory.make("writeAccess");

            // Create and populate the mimetype file
            var mimeTypeFile = new FileHandler(destinationPath + "/mimetype");
            mimeTypeFile.make();
            mimeTypeFile.openStream('w')
            mimeTypeFile.writeData("app/epub+zip");
            mimeTypeFile.closeStream();

            // Establish the OEBPS directory
            var oebpsContentDirectory = new DirectoryHandler(destinationPath + "/OEBPS");
            oebpsContentDirectory.make("writeAccess");

            // Create the images subdirectory within OEBPS
            var imageAssetsDirectory = new DirectoryHandler(destinationPath + "/OEBPS" + "/images");
            imageAssetsDirectory.make("writeAccess");

            // Set up the META-INF directory
            var metaInformationDirectory = new DirectoryHandler(destinationPath + "/META-INF");
            metaInformationDirectory.make("writeAccess");

            // Generate the container descriptor file
            var containerDescriptorFile = new FileHandler(destinationPath + "/META-INF" + "/manifest.xml");
            containerDescriptorFile.make();
            containerDescriptorFile.openStream('w')
            containerDescriptorFile.writeData("<?xml version=\"1.0\"?> \n <container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\"> \n <rootfiles> \n <rootfile full-path=\"OEBPS/content.opf\" \n media-type=\"application/oebps-package+xml\" /> \n </rootfiles> \n </container>");
            containerDescriptorFile.closeStream();

            // Notify completion
            console.log("Process completed.");
        }
    }
};