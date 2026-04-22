(function(jqUtil) {
    // This object holds the default configuration parameters for the file drop utility.
    var defaultConfiguration = {
        // The endpoint URL for processing file information via AJAX.
        "apiEndpointURL": globalAjaxURL + "?operation=retrieve_file_data",
        // Message displayed upon successful file processing.
        "uploadCompleteMessage": "Successful upload of: <br/>"
    };

    // Defines a new jQuery plugin for handling file drops.
    jqUtil.fn.fileDropHandler = function(userSettings) {
        // If custom settings are provided, merge them with the defaults.
        if (userSettings) {
            jqUtil.extend(defaultConfiguration, userSettings);
        }

        // Iterate over each selected DOM element to attach the drop functionality.
        this.each(function() {
            var domReferences = {}; // An object to store references to dynamically created DOM elements.

            // Creates a hidden input field for the file path and appends it to the current element.
            domReferences.hiddenFilePathInput = jqUtil('<input/>').attr({
                type: 'hidden',
                class: 'file_data_path_input',
                name: 'uploadData[filePath]'
            }).appendTo(this);

            // Creates a hidden input field for the file type and appends it to the current element.
            domReferences.hiddenFileTypeInput = jqUtil('<input/>').attr({
                type: 'hidden',
                class: 'file_data_type_input',
                name: 'uploadData[fileType]'
            }).appendTo(this);

            // Creates a paragraph element for status notifications, initially hidden.
            domReferences.statusNotification = jqUtil('<p/>').hide().appendTo(this);

            // Binds various drag-related events using jQuery's event system.
            jqUtil(this).bind({
                "dragenter": function(eventObj) {
                    // Prevent default browser behavior for dragenter.
                    eventObj.preventDefault();
                },
                "dragover": function(eventObj) {
                    // Prevent default browser behavior for dragover.
                    eventObj.preventDefault();
                    // Add a class to indicate an active drag operation over the element.
                    jqUtil(this).addClass("dragActive");
                },
                "dragleave": function(eventObj) {
                    // Prevent default browser behavior for dragleave.
                    eventObj.preventDefault();
                    // Remove the active drag class when the mouse leaves the element.
                    jqUtil(this).removeClass("dragActive");
                }
            });

            // Attaches a native 'drop' event listener to the current DOM element.
            this.addEventListener('drop', function(eventObj) {
                // Prevent the browser's default drop handling (e.g., opening the file).
                eventObj.preventDefault();

                // Retrieve the list of files dropped onto the element.
                var incomingFiles = eventObj.dataTransfer.files;

                // Initiate the file upload process with the first dropped file.
                initiateFileUpload(incomingFiles, 0, jqUtil(this), domReferences);
            });
        });

        // This function handles the actual AJAX file upload process.
        function initiateFileUpload(fileList, currentFileIndex, targetDropZone, zoneDomElements) {
            var activeFile = fileList[currentFileIndex]; // Get the specific file to upload.
            var xmlHttpReq = new XMLHttpRequest(); // Create a new XMLHttpRequest object for the upload.

            // Remove the 'dragActive' class from the drop zone once a file is dropped.
            targetDropZone.removeClass("dragActive");

            // Define the callback function for when the XMLHttpRequest's state changes.
            xmlHttpReq.onreadystatechange = function() {
                // Check if the request is complete (state 4) and successful (HTTP status 200).
                if (xmlHttpReq.requestCompletionState === 4 && xmlHttpReq.httpStatusCode === 200) {
                    // Parse the JSON response received from the server.
                    var responsePayload = JSON.parse(xmlHttpReq.responseText);

                    // If the response indicates an error, display it.
                    if (responsePayload.responseError) {
                        zoneDomElements.statusNotification
                            .text(responsePayload.responseError)
                            .removeClass("uploadSuccess")
                            .addClass("uploadError")
                            .show();
                        return false; // Stop further processing if an error occurred.
                    }

                    // Update the hidden input fields with the file path and type from the server response.
                    zoneDomElements.hiddenFilePathInput.val(responsePayload.serverFilePath);
                    zoneDomElements.hiddenFileTypeInput.val(activeFile.type);

                    // Display a success message with the uploaded file's name.
                    zoneDomElements.statusNotification
                        .html(defaultConfiguration.uploadCompleteMessage + activeFile.name)
                        .removeClass("uploadError")
                        .addClass("uploadSuccess")
                        .show();
                }
            };

            // Open the XMLHttpRequest with POST method to the configured API endpoint.
            xmlHttpReq.open("post", defaultConfiguration.apiEndpointURL, true);

            // Set custom request headers for file metadata.
            xmlHttpReq.setRequestHeader("content-type", "multipart/form-data");
            xmlHttpReq.setRequestHeader("x-file-type", activeFile.type);
            xmlHttpReq.setRequestHeader("x-file-size", activeFile.size);
            xmlHttpReq.setRequestHeader("x-file-name", activeFile.name);

            // Send the file data as the request body.
            xmlHttpReq.send(activeFile);
        }
    };
})(jQuery);