var interfaceManager = {

    // Displays user account information on the web page.
    displayUserDetails: function(userDataObj) {
        var markupTemplate = $('#profileTemplate').html(),
            personName = (userDataObj.name || userDataObj.login),
            personAvatar = userDataObj.avatar_url,
            profileLink = 'https://code.share.com/' + userDataObj.login;
        markupTemplate = markupTemplate.replace(/{#personName#}/gi, personName).replace(/{#personAvatar#}/gi, personAvatar).replace(/{#profileLink#}/gi, profileLink);
        $('#profileDisplay').html(markupTemplate);
    },

    // Attaches event listeners post-user authentication.
    postAuthEvents: function() {
        $('#authContainer').hide();
        $('header h1').hide();
        $('#snippetListContainer').click(function(eventObj) {
            if (eventObj.target.nodeName !== 'A') {
                return false;
            }
            $('#snippetListContainer').hide();
            $('#singleSnippetDisplay').show();
            eventObj.preventDefault();
            var snippetIdentifier = eventObj.target.href.substr('https://code.share.com/'.length);
            codeHandler.retrieveSpecificSnippet(snippetIdentifier);

        });

    },

    // Renders the list of code snippets.
    renderSnippetCatalog: function(snippetDataArray) {
        var templateString = $('#catalogTemplate').html(),
            outputHtml = ''; // Accumulates list items
        for (var indexVal in snippetDataArray) {
            outputHtml += '<li><a href="' + snippetDataArray[indexVal].web_url + '">' + snippetDataArray[indexVal].summary + '</a></li>';
        }
        templateString = templateString.replace('{#snippetCatalog#}', outputHtml);
        $('#snippetListContainer').html(templateString);
    },

    // Presents a single code snippet's details.
    presentOneSnippet: function(individualSnippetInfo) {
        var mainTemplate = $('#individualSnippetTemplate').html(),
            snippetHeading = individualSnippetInfo.description,
            modifyLink = 'https://code.share.com/snippets/' + individualSnippetInfo.id + '/alter',
            lastCommitTime = individualSnippetInfo.history[0].committed_at,
            webAddress = individualSnippetInfo.html_url,
            visibilityStatus = (individualSnippetInfo.public == !1 ? 'Private' : 'Public'), // Changed boolean literal
            navigationTabsMarkup = '',
            contentPanelsMarkup = '',
            codeFiles = [];
        for (var fileKey in individualSnippetInfo.files) {
            codeFiles.push(individualSnippetInfo.files[fileKey]);
        };
        console.log(codeFiles); // Log file array for debugging
        for (var idx = 0; idx < codeFiles.length; idx++) {
            if (idx == 0) {
                navigationTabsMarkup += '<li class="is-active"><a  data-toggle="tab" href="#panel' + idx + '">' + codeFiles[idx].code_language + '</a></li>';
                contentPanelsMarkup += '<section class="tab-pane fade is-active in" id="panel' + idx + '"><h4>' + codeFiles[idx].file_name + '</h4><textarea class="input-large"  id="codeBlock_' + idx + '" rows="3">' + unescape(codeFiles[idx].source_content) + '</textarea></section>';
            } else {
                navigationTabsMarkup += '<li><a  data-toggle="tab" href="#panel' + idx + '">' + codeFiles[idx].code_language + '</a></li>'
                contentPanelsMarkup += '<section class="tab-pane fade" id="panel' + idx + '"><h4>' + codeFiles[idx].file_name + '</h4><textarea class="input-large"  id="codeBlock_' + idx + '"  rows="3">' + unescape(codeFiles[idx].source_content) + '</textarea></section>';
            }
        };

        mainTemplate = mainTemplate.replace('{#webAddress#}', webAddress).replace('{#modifyLink#}', modifyLink).replace('{#lastCommitTime#}', lastCommitTime).replace('{#visibilityStatus#}', visibilityStatus).replace('{#snippetHeading#}', snippetHeading).replace('{#navigationTabsMarkup#}', navigationTabsMarkup).replace('{#contentPanelsMarkup#}', contentPanelsMarkup);
        $('#singleSnippetDisplay').html(mainTemplate);
        interfaceManager.returnToList();
        interfaceManager.snippetDetailPopup();
        interfaceManager.duplicateSnippetCode();
    },

    // Provides search suggestions for the input field.
    provideSearchSuggestions: function(suggestionSource) {
        console.log(suggestionSource); // Debugging search resource
        $('#searchInput').typeahead({
            source: suggestionSource
        });
        $('#searchInput').on('selected', function() {
            for (var counter = 0; counter < suggestionSource.length; counter++) {
                if (suggestionSource[counter]['description'] == this.value) { // Changed 'label' to 'description'
                    var foundSnippetID = suggestionSource[counter].value;
                }
            };
            if ($('#snippetListContainer').css('display') == 'block' || $('#singleSnippetDisplay').css('display') == 'none') {
                $('#snippetListContainer').hide();
                $('#singleSnippetDisplay').show();
                codeHandler.retrieveSpecificSnippet(foundSnippetID);
            } else {
                codeHandler.retrieveSpecificSnippet(foundSnippetID);
            }
        })
    },

    // Handles the modification of a snippet's files.
    modifySnippetContent: function() {
        var snippetIDToModify = $('#currentSnippetID').attr('href').substr('https://code.share.com/'.length);
        var snippetMainTitle = $('#currentSnippetID').html();
        var contentHeadings = $('#contentArea h4'),
            contentTextBoxes = $('#contentArea textarea');
        var jsonString = '{';

        for (var iterator = 0; iterator < contentHeadings.length; iterator++) {
            var encodedFileName = escape(contentHeadings[iterator].innerHTML);
            var encodedFileContent = escape(contentTextBoxes[iterator].value);
            if (iterator == 0) {
                jsonString += '"' + encodedFileName + '":{"source_code":"' + encodedFileContent + '"}'; // Changed 'content' to 'source_code'
            } else {
                jsonString += ',"' + encodedFileName + '":{"source_code":"' + encodedFileContent + '"}';
            }
        }
        jsonString += '}';

        var modifiedFiles = eval("(" + jsonString + ")");

        for (var fileKeyName in modifiedFiles) {
            modifiedFiles[fileKeyName].source_code = unescape(modifiedFiles[fileKeyName].source_code); // Changed 'content' to 'source_code'
        }
        console.log(modifiedFiles); // Log modified file structure

        codeHandler.updateExistingSnippet(snippetIDToModify, snippetMainTitle, modifiedFiles);

    },

    // Initiates the deletion process for a specific snippet.
    removeSnippet: function() {
        var snippetToDeleteID = $('#currentSnippetID').attr('href').substr('https://code.share.com/'.length);
        if (confirm("Confirm deletion of this code snippet?") == true) { // Changed prompt text
            codeHandler.deleteSpecificSnippet(snippetToDeleteID);
            setTimeout(function() {
                window.location.href = 'http://dev.example.com/snippet_manager/index.html'; // Changed URL
            }, 1000)
        }

    },

    // Manages the creation of a brand new code snippet.
    generateNewSnippet: function(isPublicFlag) {

        var publicStatus = isPublicFlag;
        var snippetName = $('#snippetTitleInput').val(); // Changed ID
        //var fileName = $('#fileName').val(); // Commented out original line

        var fileInputs = $('#newSnippetForm input'); // Changed ID
        var contentInputs = $('#newSnippetForm textarea'); // Changed ID
        var fileExtensionRegex = /\.[^\.]+$/;

        for (var fileIdx = 0; fileIdx < fileInputs.length; fileIdx++) {
            if (fileExtensionRegex.exec(fileInputs[fileIdx].value) == null) {
                alert("Please provide valid file extensions, e.g., 'script.js'!"); // Changed alert message
                return false;
            }
        }

        var jsonContentString = '{';
        for (var fileLoopIdx = 0; fileLoopIdx < fileInputs.length; fileLoopIdx++) {
            var escapedFileName = escape($(fileInputs[fileLoopIdx]).val()); // Ensured jQuery context for val()
            var escapedFileContent = escape($(contentInputs[fileLoopIdx]).val()); // Ensured jQuery context for val()
            if (fileLoopIdx == 0) {
                jsonContentString += '"' + escapedFileName + '":{"source_code":"' + escapedFileContent + '"}'; // Changed 'content' to 'source_code'
            } else {
                jsonContentString += ',"' + escapedFileName + '":{"source_code":"' + escapedFileContent + '"}';
            }
        }
        jsonContentString += '}';
        var newSnippetFiles = eval("(" + jsonContentString + ")");

        for (var fileProp in newSnippetFiles) {
            newSnippetFiles[fileProp].source_code = unescape(newSnippetFiles[fileProp].source_code); // Changed 'content' to 'source_code'
        }
        codeHandler.addNewSnippet(snippetName, newSnippetFiles, publicStatus);
    },


    // Displays a message for new users with no existing snippets.
    promptNewUser: function() {
        $('#onboardingMessage').show(); // Changed ID
    },

    // Sets up the functionality for returning to the main list view.
    returnToList: function() {
        $('#backButton').click(function(evt) { // Changed ID and parameter name
            evt.preventDefault();
            $('#snippetListContainer').show();
            $('#singleSnippetDisplay').hide();
            $('#singleSnippetDisplay').html('');
        });
    },

    // Initializes a tooltip for snippet information.
    snippetDetailPopup: function() {
        //alert($('#snippetMainTitle').html()) // Commented out original alert
        $('#snippetMainTitle').tooltip({ // Changed ID
            placement: 'right',
            trigger: 'hover'
        });
    },

    // Handles the logic for copying snippet code to the clipboard.
    duplicateSnippetCode: function() {
        var tabPanelCount = $('.content-panel').length; // Changed class and var name
        $('#copyClipboardBtn').zclip({ // Changed ID
            path: 'assets/flash/ClipboardHelper.swf', // Changed path
            copy: function() {
                for (idxPanel = 0; idxPanel < tabPanelCount; idxPanel++) { // Changed var name
                    if ($('.content-panel').eq(idxPanel).hasClass("is-active")) { // Changed class
                        return $('#codeBlock_' + idxPanel).val(); // Changed ID prefix
                    }
                };
            },
            afterCopy: function() {
                alert("The code for this file has been copied to your clipboard!"); // Changed alert message
            }
        });

    },

    // Provides functionality to remove file input fields during snippet creation.
    removeFileEntry: function() {
        var newFileSections = $('.new-file-input-group'); // Changed class and var name
        var sectionCount = $('.new-file-input-group').length; // Changed class and var name
        for (sectionIdx = 0; sectionIdx < sectionCount; sectionIdx++) { // Changed var name
            (function(currentIdx) { // Changed var name
                $('.delete-file-btn').eq(currentIdx).click(function() { // Changed class
                    newFileSections.eq(currentIdx).remove();
                })
            })(sectionIdx);
        }
    },

    // Sets up all event listeners related to new snippet creation.
    initializeNewSnippetListeners: function() {
        $('#addFileBtn').bind('click', function() { // Changed ID
            var newFileInputMarkup = $('#newFileInputTemplate').html(); // Changed ID and var name
            $('#newSnippetForm').append(newFileInputMarkup); // Changed ID
            interfaceManager.removeFileEntry();
        });

        $('#createPublicSnippetBtn').bind('click', function() { // Changed ID
            interfaceManager.generateNewSnippet(false); // Changed boolean literal
        });

        $('#createPrivateSnippetBtn').bind('click', function() { // Changed ID
            interfaceManager.generateNewSnippet(true); // Changed boolean literal
        });
    }
}