const textEditor = {
    setContent: function(contentString) {
        console.log("Editor content updated with new data.");
    },
    retrieveContent: function() {
        console.log("Retrieving current content from editor.");
        return "Default content if editor is not active.";
    }
};

function retrieveDocument(documentIdentifier) {
    console.log("Attempting to load document with ID:", documentIdentifier);

    let serviceRequest = gapi.client.request({
        'path': '/drive/v2/files/' + documentIdentifier,
        'method': 'GET'
    });

    serviceRequest.execute(function(serverReply) {
        console.log('Document Title: ' + serverReply.title);
        console.log('Document Summary: ' + serverReply.description);
        console.log('Media Type: ' + serverReply.mimeType);

        if (serverReply.downloadUrl) {
            const userAuthToken = gapi.auth.getToken().access_token;
            let dataFetcher = new XMLHttpRequest();
            dataFetcher.open('GET', serverReply.downloadUrl);
            dataFetcher.setRequestHeader('Authorization', 'Bearer ' + userAuthToken);

            dataFetcher.onload = function() {
                console.log("DOWNLOAD RESPONSE: " + JSON.stringify(dataFetcher.responseText));
                textEditor.setContent(dataFetcher.responseText);
            };

            dataFetcher.onerror = function() {
                window.alert("DOCUMENT DOWNLOAD FAILED!");
            };

            dataFetcher.send();
        } else {
            window.alert("NO DOWNLOAD LINK AVAILABLE FOR THIS DOCUMENT.");
        }
    });
}

jQuery("#signIn").on('click', function() {
    gapi.auth.authorize(authorizationOptions, function() {
        jQuery("#signIn").replaceWith("<span id='store'>Store File</span>|<span id='fetch'>Load File</span>|<span id='signOut'>End Session</span>");

        jQuery("#fetch").on('click', function() {
            let fileNameQuery = prompt("Enter the title of the document to load: ");
            gapi.client.load('drive', 'v2', function() {
                let fileSearchRequest = gapi.client.drive.files.list({
                    'q': "title='" + fileNameQuery + "'"
                });
                fileSearchRequest.execute(function(searchResponse) {
                    if (searchResponse.items && searchResponse.items.length > 0) {
                        retrieveDocument(searchResponse.items[0].id);
                    } else {
                        window.alert("No document found with that title.");
                    }
                });
            });
            let predefinedDocId = "0Bw7PrlWT3aWaVWQyLU5KZ1I1RVU";
        });

        jQuery("#store").on('click', function() {
            let documentContent = textEditor.retrieveContent();
            let chosenFileName = prompt("Please provide a name for the file to save: ");

            let fileAttributes = {
                'title': chosenFileName,
                'mimeType': "text/plain"
            };

            const multipartSeparator = '-------314159265358979323846';
            const partDelimiter = "\r\n--" + multipartSeparator + "\r\n";
            const finalDelimiter = "\r\n--" + multipartSeparator + "--";

            let composedPayload =
                partDelimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(fileAttributes) +
                partDelimiter +
                'Content-Type: text/plain\r\n' +
                'Content-Transfer-Encoding: utf8\r\n' +
                '\r\n' +
                documentContent +
                finalDelimiter;

            let uploadRequest = gapi.client.request({
                'path': '/upload/drive/v2/files',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + multipartSeparator + '"'
                },
                'body': composedPayload
            });

            uploadRequest.execute(function(uploadResult) {
                if (uploadResult && uploadResult.id) {
                    console.log("Document successfully stored! New ID:", uploadResult.id);
                    window.alert("Document saved successfully!");
                } else {
                    console.error("Document storage failed.", uploadResult);
                    window.alert("Failed to save the document.");
                }
            });
        });
    });
});