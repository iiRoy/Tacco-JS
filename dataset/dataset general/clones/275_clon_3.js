if (typeof EpubGeniusCore === "undefined") {
  var EpubGeniusCore = {};
}

/**
 * The primary controller for managing EPUB generation functionalities within the browser.
 * This object orchestrates user interactions, file system operations, and data
 * necessary to convert web content into a basic EPUB structure.
 */
EpubGeniusCore.EpubController = {

  // A concise description of this module's purpose.
  // This component manages the user interface and underlying logic for generating EPUB files.
  moduleDescription: "Facilitates the creation of EPUB documents from web content.",

  /**
   * Initiates the EPUB export workflow.
   * This function prompts the user to select a save location, then proceeds to
   * establish the foundational directory structure and core metadata files required for an EPUB.
   *
   * @param {object} triggerEvent - The DOM event object that triggered this function (e.g., a button click).
   */
  initiateEpubExport: function(triggerEvent) {
    // Pre-flight check: Verify the availability of XPCOM components.
    // Without these, file system operations are impossible in this environment.
    if (!Components || !Components.interfaces || !Components.classes) {
      console.error("EPUBGENIUS: XPCOM components not found. Cannot proceed with file operations.");
      alert("EPUB Export Failed: Essential browser components are unavailable.");
      return;
    }

    // Define constants for improved readability and easier maintenance.
    const FILE_PICKER_COMPONENT_ID = "@mozilla.org/filepicker;1";
    const EPUB_MIME_TYPE_STRING = "application/epub+zip";
    const EPUB_SAVE_DIALOG_TITLE = "Select Folder to Save EPUB Structure";
    const HTML_FILE_FILTER_DESCRIPTION = "Web Page for EPUB (*.html)";
    const HTML_FILE_FILTER_EXTENSION = "*.html";

    // Obtain references to the necessary file picker interfaces and constants.
    const filePickerInterface = Components.interfaces.nsIFilePicker;
    const filePickerModeSave = filePickerInterface.modeSave;
    const dialogResultCancelled = filePickerInterface.returnCancel;
    const dialogResultOK = filePickerInterface.returnOK;

    // Create an instance of the file picker dialog.
    let saveLocationDialog = Components.classes[FILE_PICKER_COMPONENT_ID].createInstance(filePickerInterface);

    // Configure the dialog: parent window, title, and operation mode.
    saveLocationDialog.init(window, EPUB_SAVE_DIALOG_TITLE, filePickerModeSave);
    // Add a file filter, even though we're picking a directory, it helps guide the user conceptually.
    saveLocationDialog.appendFilter(HTML_FILE_FILTER_DESCRIPTION, HTML_FILE_FILTER_EXTENSION);

    // Display the dialog and capture the user's choice.
    let userDialogOutcome = saveLocationDialog.show();

    // If the user explicitly cancelled the operation, terminate the process.
    if (userDialogOutcome === dialogResultCancelled) {
      console.info("EPUBGENIUS: User cancelled the export operation.");
      return;
    }

    // Proceed only if the user confirmed their selection.
    if (userDialogOutcome === dialogResultOK) {
      let selectedDestinationFile = saveLocationDialog.file;
      let targetOutputDirectoryPath = selectedDestinationFile.path;

      // A quick validation: ensure a valid path was actually provided.
      if (!targetOutputDirectoryPath) {
        console.error("EPUBGENIUS: No valid destination path was selected.");
        alert("EPUB Export Failed: Please specify a valid output directory.");
        return;
      }

      console.log(`EPUBGENIUS: Initiating EPUB structure creation at: ${targetOutputDirectoryPath}`);

      // --- Dynamically load essential I/O utility scripts ---
      // These scripts are expected to define global `File` and `Dir` constructors
      // for interacting with the local file system.
      try {
        this._loadExternalScriptModule('chrome://jslib/content/io/file.js');
        this._loadExternalScriptModule('chrome://jslib/content/io/dir.js');
      } catch (scriptLoadError) {
        console.error("EPUBGENIUS: Critical error loading file system utilities:", scriptLoadError);
        alert("EPUB Export Failed: Core file system modules could not be loaded.");
        return;
      }

      /**
       * Helper function to ensure a directory exists, creating it if necessary.
       * Includes basic error handling and logging.
       * @param {string} directoryPath - The full path of the directory to ensure.
       * @returns {boolean} True if the directory exists or was successfully created, false otherwise.
       */
      const establishDirectory = (directoryPath) => {
        try {
          let directoryHandle = new Dir(directoryPath);
          if (!directoryHandle.exists()) {
            directoryHandle.create("w"); // Create with write permissions
            console.debug(`EPUBGENIUS: Directory successfully created: ${directoryPath}`);
          } else {
            console.debug(`EPUBGENIUS: Directory already exists: ${directoryPath}`);
          }
          return true;
        } catch (e) {
          console.error(`EPUBGENIUS: Failed to create directory '${directoryPath}':`, e);
          alert(`Error: Could not create directory '${directoryPath}'.`);
          return false;
        }
      };

      /**
       * Helper function to write a string of content to a specified file path.
       * Handles file creation, opening, writing, and closing, with error management.
       * @param {string} targetFilePath - The full path to the file to write.
       * @param {string} fileContent - The string content to write into the file.
       * @returns {boolean} True if content was written successfully, false otherwise.
       */
      const writeContentToFile = (targetFilePath, fileContent) => {
        let fileWriter = null;
        try {
          fileWriter = new File(targetFilePath);
          fileWriter.create(); // Create the file if it does not exist
          fileWriter.open('w'); // Open in write-only mode
          fileWriter.write(fileContent);
          fileWriter.close();
          console.debug(`EPUBGENIUS: Content successfully written to: ${targetFilePath}`);
          return true;
        } catch (e) {
          console.error(`EPUBGENIUS: Error writing to file '${targetFilePath}':`, e);
          alert(`Error: Could not write to file '${targetFilePath}'.`);
          // Ensure file is closed even if an error occurs during write.
          if (fileWriter && fileWriter.isOpen()) {
            fileWriter.close();
          }
          return false;
        }
      };

      // --- Begin constructing the EPUB directory and file structure ---
      let overallSuccess = true; // Flag to track the success of all operations.

      // Define the paths for the standard EPUB directories.
      const epubRootPath = targetOutputDirectoryPath;
      const oebpsPath = `${epubRootPath}/OEBPS`;
      const oebpsImagesPath = `${oebpsPath}/images`; // For images and other media
      const metaInfPath = `${epubRootPath}/META-INF`; // Contains container.xml

      // 1. Create the main EPUB root directory.
      overallSuccess = overallSuccess && establishDirectory(epubRootPath);
      if (!overallSuccess) return; // Exit if directory creation fails.

      // 2. Create the OEBPS directory, which holds the core content.
      overallSuccess = overallSuccess && establishDirectory(oebpsPath);
      if (!overallSuccess) return;

      // 3. Create the images subdirectory within OEBPS.
      overallSuccess = overallSuccess && establishDirectory(oebpsImagesPath);
      if (!overallSuccess) return;

      // 4. Create the META-INF directory for EPUB configuration files.
      overallSuccess = overallSuccess && establishDirectory(metaInfPath);
      if (!overallSuccess) return;

      // --- Create essential EPUB metadata files ---

      // 1. Create the 'mimetype' file.
      const mimetypeFilePath = `${epubRootPath}/mimetype`;
      overallSuccess = overallSuccess && writeContentToFile(mimetypeFilePath, EPUB_MIME_TYPE_STRING);
      if (!overallSuccess) return;

      // 2. Create the 'container.xml' file within META-INF.
      const containerXmlFilePath = `${metaInfPath}/container.xml`;
      // Construct the XML content using an array for better multiline management.
      const containerXmlDocumentContent = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>", // Added encoding for XML standard compliance.
        "<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">",
        "  <rootfiles>",
        "    <rootfile full-path=\"OEBPS/content.opf\"",
        "              media-type=\"application/oebps-package+xml\" />",
        "  </rootfiles>",
        "</container>"
      ].join('\n'); // Join array elements with newline characters.

      overallSuccess = overallSuccess && writeContentToFile(containerXmlFilePath, containerXmlDocumentContent);
      if (!overallSuccess) return;

      // Provide final feedback to the user based on the overall success.
      if (overallSuccess) {
        console.log("EPUBGENIUS: EPUB directory and core files successfully generated.");
        alert(`EPUB structure created at:\n${epubRootPath}\n\nNext steps: Populate OEBPS/content.opf and add actual content (HTML, CSS, images).`);
      } else {
        alert("EPUB Export encountered errors. Please check the browser console for detailed messages.");
      }

    } else {
      console.warn("EPUBGENIUS: File picker dialog returned an unexpected outcome:", userDialogOutcome);
    }
  }, // End of initiateEpubExport function

  /**
   * Internal helper method to load external JavaScript modules using the `include` mechanism.
   * This provides a wrapper for the XUL-specific `include` function, allowing for
   * centralized logging and potential future modification of the loading strategy.
   *
   * @param {string} scriptChromeUrl - The 'chrome://' URL of the JavaScript script to load.
   * @private
   */
  _loadExternalScriptModule: function(scriptChromeUrl) {
    try {
      // The 'include' function is a global specific to the XUL environment.
      include(scriptChromeUrl);
      console.debug(`EPUBGENIUS: Successfully loaded utility script: ${scriptChromeUrl}`);
    } catch (loadError) {
      console.error(`EPUBGENIUS: Failed to load script from '${scriptChromeUrl}':`, loadError);
      // Re-throw the error to ensure upstream functions are aware of the failure.
      throw new Error(`Script loading failure for: ${scriptChromeUrl}`);
    }
  }

}; // End of EpubGeniusCore.EpubController definition