const viewManager = (function($) { // Encapsulate in an IIFE for better scope management, using jQuery alias

    // Constants for frequently used selectors and URLs
    const SELECTORS = {
        USER_PROFILE_TEMPLATE: '#userProfileTemplate',
        USER_PROFILE_CONTAINER: '#userProfileContainer',
        LOGIN_AREA: '#loginPanel',
        MAIN_TITLE: 'h1',
        GIST_LIST_DISPLAY: '#gistListing',
        SINGLE_GIST_DISPLAY: '#singleGistView',
        GIST_LIST_TEMPLATE: '#gistListTemplate',
        SINGLE_GIST_TEMPLATE: '#detailedGistTemplate',
        SEARCH_INPUT: '#searchInput',
        TAB_CONTENT_CONTAINER: '#tabContentArea',
        GIST_ID_REFERENCE: '#gistIdLink',
        GIST_NAME_INPUT: '#gistNameField',
        NEW_GIST_FORM_AREA: '#newGistForm',
        NEW_FILE_TEMPLATE: '#newFileBlockTemplate',
        PUBLIC_GIST_BTN: '#createPublicGistBtn',
        PRIVATE_GIST_BTN: '#createPrivateGistBtn',
        NEW_USER_PROMPT: '#newUserMessage',
        BACK_TO_LIST_BTN: '#returnToListBtn',
        GIST_TITLE_ELEMENT: '#gistTitleHeader',
        COPY_BUTTON: '#copyCodeButton',
        FILE_BLOCKS: '.file-input-group',
        DELETE_FILE_BUTTON: '.delete-file-btn'
    };

    const GITHUB_URLS = {
        GIST_BASE: 'https://gist.github.com/',
        GIST_EDIT_BASE: 'https://gist.github.com/gists/'
    };

    const UTILITY_MESSAGES = {
        FILE_EXT_MISSING: "Please ensure all file names include an extension (e.g., index.html).",
        DELETE_CONFIRM: "Are you absolutely sure you want to delete this Gist permanently?",
        COPY_SUCCESS: "The content of this file has been successfully copied to your clipboard!",
        NO_DATA_AVAILABLE: "No data provided for rendering."
    };

    // Helper function for simple string templating
    function applyTemplate(templateString, dataMap) {
        let processedString = templateString;
        for (const key in dataMap) {
            if (Object.prototype.hasOwnProperty.call(dataMap, key)) {
                const placeholder = new RegExp(`{{${key}}}`, 'gi');
                processedString = processedString.replace(placeholder, dataMap[key] || '');
            }
        }
        return processedString;
    }

    // Helper for URL segment extraction
    function extractGistIdFromUrl(fullUrl, baseUrl) {
        if (!fullUrl || !baseUrl || !fullUrl.startsWith(baseUrl)) {
            console.warn("Invalid URL or base URL provided for Gist ID extraction.");
            return null;
        }
        return fullUrl.substring(baseUrl.length);
    }

    // Main rendering and interaction module
    return {

        // Displays the authenticated user's profile information
        displayUserProfile: function(userData) {
            if (!userData) {
                console.error("User data is missing for profile display.");
                return;
            }
            const profileTemplate = $(SELECTORS.USER_PROFILE_TEMPLATE).html();
            const displayName = userData.name || userData.login;
            const profilePicture = userData.avatar_url;
            const profileLink = GITHUB_URLS.GIST_BASE + userData.login;

            const renderedHtml = applyTemplate(profileTemplate, {
                displayName: displayName,
                profilePicture: profilePicture,
                profileLink: profileLink
            });

            $(SELECTORS.USER_PROFILE_CONTAINER).html(renderedHtml);
        },

        // Sets up event listeners after a user successfully logs in
        setupPostLoginHandlers: function() {
            $(SELECTORS.LOGIN_AREA).hide();
            $(SELECTORS.MAIN_TITLE).hide();

            // Delegate click events for Gist links
            $(SELECTORS.GIST_LIST_DISPLAY).on('click', 'a', function(event) {
                event.preventDefault(); // Prevent default link behavior
                const targetLink = event.target;

                // Ensure the clicked element is an anchor tag
                if (targetLink.nodeName !== 'A') {
                    return;
                }

                $(SELECTORS.GIST_LIST_DISPLAY).hide();
                $(SELECTORS.SINGLE_GIST_DISPLAY).show();

                const gistIdentifier = extractGistIdFromUrl(targetLink.href, GITHUB_URLS.GIST_BASE);
                if (gistIdentifier) {
                    // Assuming a global 'gist' object exists for API calls
                    if (typeof gist !== 'undefined' && gist.getSingleGist) {
                        gist.getSingleGist(gistIdentifier);
                    } else {
                        console.error("Gist API handler 'gist.getSingleGist' is not available.");
                    }
                } else {
                    console.warn("Could not extract Gist ID from URL:", targetLink.href);
                }
            });
        },

        // Renders a collection of Gists
        renderGistCollection: function(gistDataArray) {
            if (!Array.isArray(gistDataArray) || gistDataArray.length === 0) {
                console.log(UTILITY_MESSAGES.NO_DATA_AVAILABLE, "Gist collection.");
                $(SELECTORS.GIST_LIST_DISPLAY).html('<p>No Gists to display.</p>'); // Add a message for no gists
                return;
            }

            const listTemplate = $(SELECTORS.GIST_LIST_TEMPLATE).html();
            let gistItemsHtml = '';

            // Use Array.prototype.map for cleaner iteration and HTML generation
            gistItemsHtml = gistDataArray.map(item => {
                // Ensure description exists, provide fallback
                const descriptionText = item.description || `Gist without description (ID: ${item.id})`;
                return `<li><a href="${item.html_url}">${descriptionText}</a></li>`;
            }).join('');

            const finalHtml = applyTemplate(listTemplate, {
                gistItems: gistItemsHtml
            });
            $(SELECTORS.GIST_LIST_DISPLAY).html(finalHtml);
        },

        // Renders the detailed view of a single Gist
        showIndividualGist: function(gistDetails) {
            if (!gistDetails || !gistDetails.id) {
                console.error("Invalid Gist details provided for display.");
                return;
            }

            const detailTemplate = $(SELECTORS.SINGLE_GIST_TEMPLATE).html();
            const gistTitle = gistDetails.description || `Untitled Gist ${gistDetails.id}`;
            const editUrl = GITHUB_URLS.GIST_EDIT_BASE + gistDetails.id + '/edit';
            const lastUpdateTime = gistDetails.history && gistDetails.history.length > 0 ? gistDetails.history[0].committed_at : 'Unknown';
            const publicStatus = gistDetails.public ? 'Public' : 'Private'; // Simplified boolean check
            const gistWebUrl = gistDetails.html_url;

            let navTabs = '';
            let contentPanes = '';
            const filesArray = Object.values(gistDetails.files || {}); // Convert files object to an array

            if (filesArray.length === 0) {
                contentPanes += '<p>No files found in this Gist.</p>';
            }

            filesArray.forEach((file, index) => {
                const isActive = index === 0 ? 'active' : '';
                const fadeClass = index === 0 ? 'fade in' : 'fade';
                const tabId = `gistFileTab-${index}`;
                const codeEditorId = `codeEditor-${index}`;

                navTabs += `<li class="${isActive}"><a data-toggle="tab" href="#${tabId}">${file.language || file.filename}</a></li>`;
                contentPanes += `
                    <section class="tab-pane ${fadeClass} ${isActive}" id="${tabId}">
                        <h4>${file.filename}</h4>
                        <textarea class="form-control" id="${codeEditorId}" rows="15">${unescape(file.content || '')}</textarea>
                    </section>
                `;
            });

            const finalDetailHtml = applyTemplate(detailTemplate, {
                gistUrl: gistWebUrl,
                editGistUrl: editUrl,
                lastUpdated: lastUpdateTime,
                visibilityStatus: publicStatus,
                gistDescription: gistTitle,
                tabNavigationHtml: navTabs,
                tabContentHtml: contentPanes
            });

            $(SELECTORS.SINGLE_GIST_DISPLAY).html(finalDetailHtml);

            // Call related setup functions
            this.attachBackToListHandler();
            this.activateGistMetadataTooltip();
            this.setupClipboardIntegration();
        },

        // Initializes search autocomplete functionality
        initiateSearchAutocomplete: function(searchResources) {
            if (!Array.isArray(searchResources)) {
                console.error("Search resource must be an array.");
                return;
            }

            $(SELECTORS.SEARCH_INPUT).typeahead({
                source: searchResources // Assuming typeahead expects an array of objects with 'label' and 'value'
            });

            $(SELECTORS.SEARCH_INPUT).on('typeahead:selected', function(event, suggestion) {
                const selectedGistId = suggestion.value; // Assuming suggestion object has a 'value' property for Gist ID

                // Optimize the display logic
                const isGistListVisible = $(SELECTORS.GIST_LIST_DISPLAY).is(':visible');
                const isSingleGistHidden = $(SELECTORS.SINGLE_GIST_DISPLAY).is(':hidden');

                if (isGistListVisible || isSingleGistHidden) {
                    $(SELECTORS.GIST_LIST_DISPLAY).hide();
                    $(SELECTORS.SINGLE_GIST_DISPLAY).show();
                }
                // Call gist API to fetch and display the selected Gist
                if (typeof gist !== 'undefined' && gist.getSingleGist) {
                    gist.getSingleGist(selectedGistId);
                } else {
                    console.error("Gist API handler 'gist.getSingleGist' is not available.");
                }
            });
        },

        // Handles updating the content of an existing Gist's files
        updateGistContent: function() {
            const gistId = extractGistIdFromUrl($(SELECTORS.GIST_ID_REFERENCE).attr('href'), GITHUB_URLS.GIST_BASE);
            const gistDescription = $(SELECTORS.GIST_ID_REFERENCE).text(); // Using .text() for safer content

            const fileTitleElements = $(SELECTORS.TAB_CONTENT_CONTAINER).find('h4');
            const fileContentElements = $(SELECTORS.TAB_CONTENT_CONTAINER).find('textarea');

            if (fileTitleElements.length === 0 || fileContentElements.length === 0) {
                console.warn("No files found to update.");
                return;
            }

            const filesToUpdate = {};
            fileTitleElements.each((index, titleEl) => {
                const fileName = $(titleEl).text();
                const fileContent = $(fileContentElements[index]).val();
                filesToUpdate[fileName] = {
                    content: fileContent
                };
            });

            console.log("Attempting to update Gist with ID:", gistId, "and files:", filesToUpdate);
            if (typeof gist !== 'undefined' && gist.updateGist) {
                gist.updateGist(gistId, gistDescription, filesToUpdate);
            } else {
                console.error("Gist API handler 'gist.updateGist' is not available.");
            }
        },

        // Handles the deletion of a Gist
        removeGistEntry: function() {
            const gistIdToDelete = extractGistIdFromUrl($(SELECTORS.GIST_ID_REFERENCE).attr('href'), GITHUB_URLS.GIST_BASE);

            if (!gistIdToDelete) {
                console.error("Could not determine Gist ID for deletion.");
                return;
            }

            if (confirm(UTILITY_MESSAGES.DELETE_CONFIRM)) {
                if (typeof gist !== 'undefined' && gist.deleteGist) {
                    gist.deleteGist(gistIdToDelete);
                    // Provide a slight delay before redirecting to allow API call to complete
                    setTimeout(() => {
                        window.location.href = 'http://lab.reeqi.name/easyGist/index.html'; // Direct navigation
                    }, 500);
                } else {
                    console.error("Gist API handler 'gist.deleteGist' is not available.");
                }
            }
        },

        // Creates a new Gist (public or private)
        generateNewGist: function(isPublicFlag) {
            const newGistName = $(SELECTORS.GIST_NAME_INPUT).val();
            const fileNameInputs = $(SELECTORS.NEW_GIST_FORM_AREA).find('input[type="text"]');
            const fileContentInputs = $(SELECTORS.NEW_GIST_FORM_AREA).find('textarea');

            const fileExtensionRegex = /\.[^\.]+$/;
            let isValid = true;
            fileNameInputs.each(function() {
                if (!fileExtensionRegex.test($(this).val())) {
                    alert(UTILITY_MESSAGES.FILE_EXT_MISSING);
                    isValid = false;
                    return false; // Break .each loop
                }
            });

            if (!isValid) return;

            const newFilesData = {};
            fileNameInputs.each((index, nameInput) => {
                const fileName = $(nameInput).val();
                const fileContent = $(fileContentInputs[index]).val();
                newFilesData[fileName] = {
                    content: fileContent
                };
            });

            console.log("Attempting to create new Gist:", newGistName, "Files:", newFilesData, "Public:", !isPublicFlag);
            if (typeof gist !== 'undefined' && gist.newGist) {
                // The original code passed 0 for public and 1 for private, which is inverted from a typical boolean
                // Assuming isPublicFlag is 0 for public, 1 for private as per original logic.
                // If it's a boolean, adjust accordingly: `!isPublicFlag` if 0=public, 1=private.
                // For now, mirroring original's `isPublic` parameter directly.
                gist.newGist(newGistName, newFilesData, isPublicFlag === 0); // Assuming 0 for public, 1 for private
            } else {
                console.error("Gist API handler 'gist.newGist' is not available.");
            }
        },

        // Displays a message for new users with no existing Gists
        displayNewUserPrompt: function() {
            $(SELECTORS.NEW_USER_PROMPT).show();
        },

        // Attaches event handler for the "Back to List" button
        attachBackToListHandler: function() {
            $(SELECTORS.BACK_TO_LIST_BTN).off('click').on('click', function(event) { // Use .off() to prevent multiple bindings
                event.preventDefault();
                $(SELECTORS.GIST_LIST_DISPLAY).show();
                $(SELECTORS.SINGLE_GIST_DISPLAY).hide().empty(); // Clear content when hiding
            });
        },

        // Activates a Bootstrap tooltip for Gist information
        activateGistMetadataTooltip: function() {
            // Ensure Bootstrap's tooltip plugin is loaded
            if ($.fn.tooltip) {
                $(SELECTORS.GIST_TITLE_ELEMENT).tooltip({
                    placement: 'right',
                    trigger: 'hover focus', // Added focus for accessibility
                    title: 'Click to edit Gist description (not implemented in UI)' // Added a tooltip message
                });
            } else {
                console.warn("Bootstrap tooltip plugin is not loaded.");
            }
        },

        // Sets up ZeroClipboard for copying code blocks
        setupClipboardIntegration: function() {
            const allCodeBlocks = $('.tab-pane'); // Target all tab panes for code

            if (typeof ZeroClipboard === 'undefined') {
                console.error("ZeroClipboard library is not loaded. Copy functionality will not work.");
                return;
            }

            // Ensure ZeroClipboard is initialized before use
            ZeroClipboard.config({
                swfPath: 'js/ZeroClipboard.swf' // Update path if necessary
            });

            const client = new ZeroClipboard($(SELECTORS.COPY_BUTTON));

            client.on('ready', function() {
                client.on('copy', function(event) {
                    let codeToCopy = '';
                    // Find the currently active code block
                    const activePane = allCodeBlocks.filter('.active');
                    if (activePane.length > 0) {
                        const codeEditorId = activePane.find('textarea[id^="codeEditor-"]').attr('id');
                        if (codeEditorId) {
                            codeToCopy = $('#' + codeEditorId).val();
                        }
                    }
                    event.clipboardData.setData('text/plain', codeToCopy);
                });

                client.on('aftercopy', function() {
                    alert(UTILITY_MESSAGES.COPY_SUCCESS);
                });
            });

            client.on('error', function(event) {
                console.error('ZeroClipboard error of type "' + event.name + '": ' + event.message);
                ZeroClipboard.destroy();
            });
        },

        // Binds deletion handlers for dynamically added file input blocks
        bindFileDeletion: function() {
            // Use event delegation for dynamically added elements
            $(SELECTORS.NEW_GIST_FORM_AREA).off('click', SELECTORS.DELETE_FILE_BUTTON).on('click', SELECTORS.DELETE_FILE_BUTTON, function(event) {
                event.preventDefault();
                $(this).closest(SELECTORS.FILE_BLOCKS).remove(); // Remove the entire file input group
            });
        },

        // Initializes event listeners for Gist creation workflow
        initiateGistCreationEvents: function() {
            // Add new file input block
            $('#addNewFileBtn').on('click', () => { // Using arrow function for lexical 'this' (though not critical here)
                const newFileBlockHtml = $(SELECTORS.NEW_FILE_TEMPLATE).html();
                $(SELECTORS.NEW_GIST_FORM_AREA).append(newFileBlockHtml);
                this.bindFileDeletion(); // Re-bind deletion handler for new elements
            });

            // Helper for createGist calls
            const createGistHandler = (isPublic) => {
                this.generateNewGist(isPublic ? 0 : 1); // 0 for public, 1 for private (mirroring original logic)
            };

            // Create Public Gist
            $(SELECTORS.PUBLIC_GIST_BTN).on('click', () => createGistHandler(true));

            // Create Private Gist
            $(SELECTORS.PRIVATE_GIST_BTN).on('click', () => createGistHandler(false));
        }
    };

})(jQuery); // Pass jQuery to the IIFE