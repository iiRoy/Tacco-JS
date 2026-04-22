function    loadFile( fileid )
{
    // This function is responsible for loading a file using its ID
    console.log(  fileid  ); // Log the file ID for debugging purposes


    var request = gapi.client.request(
        {
            'path': '/drive/v2/files/' + fileid,
            'method': 'GET'
        }
    );


    request.execute(
        function ( resp )
        {
            // Log file metadata received from the API
            console.log( 'Title: ' + resp.title );
            console.log( 'Description: ' + resp.description );
            console.log( 'MIME type: ' + resp.mimeType );

            if ( resp.downloadUrl )
            {
                // If a download URL is available, proceed to download the file content
                var accessToken = gapi.auth.getToken().access_token;
                var xhr = new XMLHttpRequest();

                xhr.open( 'GET', resp.downloadUrl );
                xhr.setRequestHeader( 'Authorization', 'Bearer ' + accessToken );

                xhr.onload = function ( )
                {
                    console.log( "RESPONSE: " + JSON.stringify( xhr.responseText ) );
                    editor.setValue( xhr.responseText ); // Set editor content
                };

                xhr.onerror = function ( )
                {
                    alert( "ERROR" ); // Handle network errors
                };

                xhr.send( ); // Send the XHR request
            }
            else
            {
                alert( "ERROR" ); // No download URL means an error occurred
            }
        }
    );
}


// Event handler for the login button
$( "#login" ).click(
    function ( )
    {
        // Authorize with Google API
        gapi.auth.authorize(
            config,
            function ( )
            {
                // On successful authorization, replace login button with other options
                $( "#login" ).replaceWith( "<span id='save'>Save</span>|<span id='load'>Load</span>|<span id='logout'>Logout</span>" );


                // Attach click handler for the 'Load' button
                $( "#load" ).click(
                    function ( )
                    {
                        fn = prompt( "Filename: " ); // Prompt user for filename


                        gapi.client.load(
                            'drive',
                            'v2',
                            function ( )
                            {
                                // Create a request to list files with the given title
                                var request = gapi.client.drive.files.list(
                                    {
                                        'q': "title='" + fn + "'"
                                    }
                                );

                                request.execute(
                                    function ( resp )
                                    {
                                        // Assume the first item is the desired file and load it
                                        loadFile( resp.items[0].id );
                                    }
                                );
                            }
                        );

                        fileid = "0Bw7PrlWT3aWaVWQyLU5KZ1I1RVU"; // This line seems to be a leftover or example ID
                    }
                );


                // Attach click handler for the 'Save' button
                $( "#save" ).click(
                    function ( )
                    {
                        txt = editor.getValue( ); // Get content from editor
                        filename = prompt( "Enter a filename: " ); // Prompt for filename

                        var metadata =
                            {
                                'title': filename,
                                'mimeType': "text/plain"
                            };

                        // Define multipart boundary for API request
                        const boundary = '-------314159265358979323846';
                        const delimiter = "\r\n--" + boundary + "\r\n";
                        const close_delim = "\r\n--" + boundary + "--";


                        // Construct the multipart request body
                        var multipartRequestBody =
                            delimiter +
                            'Content-Type: application/json\r\n\r\n' +
                            JSON.stringify( metadata ) +
                            delimiter +
                            'Content-Type: text/plain\r\n' +
                            'Content-Transfer-Encoding: utf8\r\n' +
                            '\r\n' +
                            txt +
                            close_delim;


                        var request = gapi.client.request(
                            {
                                'path': '/upload/drive/v2/files',
                                'method': 'POST',
                                'params': {'uploadType': 'multipart'},
                                'headers':
                                    {
                                        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                                    },
                                'body': multipartRequestBody
                            }
                        );


                        request.execute( ); // Execute the save request
                    }
                );
            }
        );
    }
);