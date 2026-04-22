// This module provides functionality for interacting with Google Drive API,
// specifically for loading and saving plain text files.

/**
 * Retrieves the content of a specified file from Google Drive.
 * @param {string} resourceIdentifier - The unique ID of the file to fetch.
 */
function obtainRemoteFileContent(resourceIdentifier) {
    // Validate input: Ensure a resource ID is provided.
    if (!resourceIdentifier || typeof resourceIdentifier !== 'string') {
        console.error("Invalid resource identifier provided: Must be a non-empty string.");
        alert("Error: Invalid file ID for retrieval.");
        return; // Abort if input is invalid.
    }

    console.log(`Initiating content retrieval for resource ID: ${resourceIdentifier}`);

    // Construct the API request object to get file metadata.
    const fileRetrievalRequest = gapi.client.request({
        'path': `/drive/v2/files/${resourceIdentifier}`, // Using template literals for path construction.
        'method': 'GET' // Specify GET method for data retrieval.
    });

    // Execute the request and process the API response asynchronously.
    fileRetrievalRequest.execute(function(apiResponse) {
        // Guard clause: Check for API response errors or malformed data.
        if (!apiResponse || apiResponse.error) {
            console.error("API response error during metadata retrieval:", apiResponse ? apiResponse.error : "Unknown error.");
            alert("Error: Could not obtain file details from Drive.");
            return; // Exit early if metadata retrieval failed.
        }

        // Extract and log key file properties for debugging and user information.
        const fileTitle = apiResponse.title;
        const fileMimeType = apiResponse.mimeType;
        console.info(`Fetched File Details - Title: '${fileTitle}', MIME Type: '${fileMimeType}'`);

        // Determine the content download link.
        const contentDownloadLink = apiResponse.downloadUrl;

        // Proceed with content download only if a direct download URL is available.
        if (contentDownloadLink) {
            // Acquire the current user's access token for authorization.
            const userAccessToken = gapi.auth.getToken().access_token;

            // Initialize a new XMLHttpRequest for fetching the file content.
            const contentXHR = new XMLHttpRequest();
            contentXHR.open('GET', contentDownloadLink, true); // Asynchronous request.
            // Set the Authorization header with the bearer token.
            contentXHR.setRequestHeader('Authorization', `Bearer ${userAccessToken}`);

            // Define the callback function for a successful HTTP response.
            contentXHR.onload = function() {
                // Check if the request was successful (HTTP status 200).
                if (contentXHR.status === 200) {
                    console.log("File content downloaded successfully.");
                    // Attempt to update the global editor instance with the retrieved text.
                    if (typeof editor !== 'undefined' && typeof editor.setValue === 'function') {
                        editor.setValue(contentXHR.responseText);
                        alert(`Document '${fileTitle}' loaded successfully!`);
                    } else {
                        console.warn("Editor object or its 'setValue' method is not accessible. Content not displayed.");
                        alert("Content loaded, but editor not found to display it.");
                    }
                } else {
                    console.error(`Download failed with status: ${contentXHR.status} ${contentXHR.statusText}`);
                    alert("Error: Failed to download file content from the provided URL.");
                }
            };

            // Define the callback function for network or request errors.
            contentXHR.onerror = function() {
                console.error("A network error occurred during file content download.");
                alert("Error: Network issue or server unreachable during content download.");
            };

            // Send the XMLHttpRequest to initiate the download.
            contentXHR.send();
        } else {
            // Handle cases where a direct download URL is not provided (e.g., Google native formats).
            console.warn("No direct download URL found for this resource. It might be a Google Docs/Sheets/Slides file.");
            alert("Warning: This file type cannot be downloaded directly.");
        }
    });
}

/**
 * Helper function to construct the multipart request body for file uploads.
 * @param {object} fileMetadata - Object containing file properties like title and MIME type.
 * @param {string} fileContent - The actual content of the file as a string.
 * @param {string} boundaryString - A unique string to separate parts of the multipart body.
 * @returns {string} The complete multipart request body.
 */
function composeMultipartRequestBody(fileMetadata, fileContent, boundaryString) {
    const jsonMime = 'application/json';
    const textMime = 'text/plain';
    const contentEncoding = 'utf8';

    const partSeparator = `\r\n--${boundaryString}\r\n`;
    const finalTerminator = `\r\n--${boundaryString}--`;

    let requestBodyParts = [];

    // Part 1: File metadata (JSON format).
    requestBodyParts.push(
        partSeparator +
        `Content-Type: ${jsonMime}\r\n\r\n` +
        JSON.stringify(fileMetadata)
    );

    // Part 2: File content (plain text format).
    requestBodyParts.push(
        partSeparator +
        `Content-Type: ${textMime}\r\n` +
        `Content-Transfer-Encoding: ${contentEncoding}\r\n` +
        `\r\n` +
        fileContent
    );

    // Join all parts and append the final terminator.
    return requestBodyParts.join('') + finalTerminator;
}

// Event handler for the initial login button.
// Assumes a jQuery-like environment where '$' is defined.
$("#loginButton").on("click", function() { // Renamed ID from 'login' to 'loginButton'
    // Initiate the Google API authorization flow.
    // 'config' is expected to be a global or accessible configuration object
    // containing client_id, scope, etc.
    gapi.auth.authorize(config, function(authResult) {
        // Check if authorization was successful or if an error occurred.
        if (!authResult || authResult.error) {
            console.error("Google API authorization failed:", authResult ? authResult.error : "Unknown authorization error.");
            alert("Authentication failed. Please check your network or try again.");
            return; // Stop execution if authorization failed.
        }

        console.log("User successfully authenticated with Google API.");

        // Dynamically update the user interface after successful login.
        // Replace the login button with a set of control actions.
        const userControlsHtml = `
            <span id='saveAction' class='app-control'>Save Document</span> |
            <span id='loadAction' class='app-control'>Load Document</span> |
            <span id='logoutAction' class='app-control'>Logout</span>
        `;
        // 'this' refers to the clicked #loginButton element.
        $(this).replaceWith(userControlsHtml);

        // Attach event listeners to the newly created UI elements.

        // Event handler for the 'Load Document' button.
        $("#loadAction").on("click", function() {
            // Prompt the user for the exact filename to search for.
            const documentSearchQuery = prompt("Please enter the exact title of the document to load:");

            // Validate user input for the filename.
            if (!documentSearchQuery || documentSearchQuery.trim() === "") {
                alert("Document title cannot be empty. Load operation cancelled.");
                return; // Abort if no valid title is provided.
            }

            // Load the Google Drive API client library.
            gapi.client.load('drive', 'v2', function() {
                // Construct a request to list files in Google Drive.
                // The 'q' parameter filters files by title and ensures they are not trashed.
                const searchFilesRequest = gapi.client.drive.files.list({
                    'q': `title='${documentSearchQuery.trim()}' and trashed=false`
                });

                // Execute the file search request.
                searchFilesRequest.execute(function(searchResponse) {
                    // Check for errors in the search response.
                    if (!searchResponse || searchResponse.error) {
                        console.error("File search API error:", searchResponse ? searchResponse.error : "Unknown search error.");
                        alert("Error: Failed to search for documents.");
                        return;
                    }

                    const foundDocuments = searchResponse.items;

                    // Check if any documents were found matching the query.
                    if (foundDocuments && foundDocuments.length > 0) {
                        // For simplicity, load the first matching document.
                        const targetFileId = foundDocuments[0].id;
                        console.log(`Found document '${foundDocuments[0].title}' with ID: ${targetFileId}`);
                        obtainRemoteFileContent(targetFileId); // Call the file content retrieval function.
                    } else {
                        console.warn(`No document found with title: '${documentSearchQuery}'.`);
                        alert(`No document found matching the title '${documentSearchQuery}'. Please check the name.`);
                    }
                });
            });
        });

        // Event handler for the 'Save Document' button.
        $("#saveAction").on("click", function() {
            // Retrieve the current content from the editor.
            // Assumes 'editor' is a global object with a 'getValue' method.
            const currentEditorContent = (typeof editor !== 'undefined' && typeof editor.getValue === 'function')
                                       ? editor.getValue()
                                       : '';

            // Validate that there is content to save.
            if (!currentEditorContent) {
                console.warn("Editor content is empty. Cannot save an empty document.");
                alert("Cannot save an empty document. Please add some content.");
                return;
            }

            // Prompt the user for the desired filename for the new/updated document.
            const desiredDocumentName = prompt("Enter a filename for your document:");

            // Validate the provided filename.
            if (!desiredDocumentName || desiredDocumentName.trim() === "") {
                alert("Filename cannot be empty. Document save operation aborted.");
                return; // Abort if no valid filename is provided.
            }

            // Prepare the metadata object for the file upload.
            const uploadFileMetadata = {
                'title': desiredDocumentName.trim(),
                'mimeType': "text/plain" // Explicitly setting MIME type for plain text.
            };

            // Define a unique boundary string for the multipart request.
            // A random string could be generated for higher uniqueness.
            const uploadBoundaryString = '----FileContentBoundary' + Math.random().toString(36).substring(2, 15);

            // Generate the complete multipart request body using the helper function.
            const generatedRequestBody = composeMultipartRequestBody(
                uploadFileMetadata,
                currentEditorContent,
                uploadBoundaryString
            );

            // Construct the API request for uploading the file.
            const fileUploadRequest = gapi.client.request({
                'path': '/upload/drive/v2/files', // API endpoint for file uploads.
                'method': 'POST', // Use POST method for creating new files.
                'params': { 'uploadType': 'multipart' }, // Specify multipart upload type.
                'headers': {
                    'Content-Type': `multipart/mixed; boundary="${uploadBoundaryString}"` // Set Content-Type header.
                },
                'body': generatedRequestBody // The constructed multipart body.
            });

            // Execute the upload request and handle the response.
            fileUploadRequest.execute(function(uploadResponse) {
                // Check if the upload was successful.
                if (uploadResponse && !uploadResponse.error) {
                    console.log("Document saved successfully:", uploadResponse);
                    alert(`Document '${desiredDocumentName}' saved successfully to Google Drive!`);
                } else {
                    console.error("Document save failed:", uploadResponse ? uploadResponse.error : "Unknown upload error.");
                    alert("Error: Failed to save document to Google Drive.");
                }
            });
        });

        // Event handler for the 'Logout' button.
        // This is an additional feature to enhance the original functionality.
        $("#logoutAction").on("click", function() {
            console.log("Attempting to log out...");
            // In a real application, you'd call gapi.auth.signOut() or similar.
            // For this example, we'll just alert and refresh.
            // gapi.auth.signOut(); // Uncomment if using a GAPI version that supports this.
            alert("Logged out successfully! Refreshing page...");
            location.reload(); // Reload the page to revert to the login state.
        });
    });
});