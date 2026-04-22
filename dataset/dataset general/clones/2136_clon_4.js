class InterfaceHandler {
    constructor() {
        // Initialization can go here if needed, but for now, it's empty.
    }

    // Internal utility to fill template placeholders
    #processTemplate(targetTemplate, replacementMap) {
        return Object.keys(replacementMap).reduce((currentText, key) => {
            const placeholderRegex = new RegExp(`{#${key}#}`, 'gi');
            return currentText.replace(placeholderRegex, replacementMap[key]);
        }, targetTemplate);
    }

    // Internal utility to fetch an element's innerHTML
    #getElementMarkup(elementId) {
        const targetElement = document.getElementById(elementId);
        return targetElement ? targetElement.innerHTML : '';
    }

    // Internal utility to update an element's innerHTML
    #updateElementMarkup(elementId, newContent) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.innerHTML = newContent;
        }
    }

    // Internal utility to modify an element's display style
    #alterElementVisibility(elementId, displayValue) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.style.display = displayValue;
        }
    }

    // Renders the user's profile details into the interface
    displayUserProfile(profileData) {
        const profileTemplate = this.#getElementMarkup('userDom');
        const userAlias = profileData.name || profileData.login;
        const userAvatar = profileData.avatar_url;
        const userProfilePage = `https://gist.github.com/${profileData.login}`;

        const substitutionValues = {
            userName: userAlias,
            userPic: userAvatar,
            userLink: userProfilePage
        };
        const finalOutput = this.#processTemplate(profileTemplate, substitutionValues);
        this.#updateElementMarkup('userInfo', finalOutput);
    }

    // Configures event handling after a successful login
    setupPostLoginEvents() {
        this.#alterElementVisibility('loginWrap', 'none');
        const mainHeading = document.querySelector('h1');
        if (mainHeading) mainHeading.style.display = 'none';

        const gistCollectionContainer = document.getElementById('glistList');
        if (gistCollectionContainer) {
            gistCollectionContainer.addEventListener('click', (eventObject) => {
                const clickedNode = eventObject.target;
                if (clickedNode.tagName !== 'A') {
                    return;
                }
                eventObject.preventDefault();

                this.#alterElementVisibility('glistList', 'none');
                this.#alterElementVisibility('singleList', 'block');

                const gistReference = clickedNode.href.substring('https://gist.github.com/'.length);
                gist.getSingleGist(gistReference);
            });
        }
    }

    // Populates the list of Gists
    renderGistOverview(gistCollection) {
        const listTemplate = this.#getElementMarkup('gistListDom');
        const listItemsHTML = Object.values(gistCollection)
            .map(itemEntry => `<li><a href="${itemEntry.html_url}">${itemEntry.description}</a></li>`)
            .join('');

        const completedList = this.#processTemplate(listTemplate, { gistList: listItemsHTML });
        this.#updateElementMarkup('glistList', completedList);
    }

    // Displays the detailed view of a single Gist
    presentDetailedGist(gistDetails) {
        const detailLayout = this.#getElementMarkup('singleGistDom');
        const detailTitle = gistDetails.description;
        const editSourceLink = `https://gist.github.com/gists/${gistDetails.id}/edit`;
        const lastActivityTime = gistDetails.history[0].committed_at;
        const gistUrl = gistDetails.html_url;
        const accessStatus = (gistDetails.public === true ? 'Public' : 'Private');

        let navigationTabsFragment = '';
        let contentSectionsFragment = '';

        const fileEntries = Object.values(gistDetails.files);

        fileEntries.forEach((fileDescriptor, indexPosition) => {
            const isFirst = indexPosition === 0;
            const activeClass = isFirst ? 'active' : '';
            const inClass = isFirst ? 'in' : '';

            navigationTabsFragment += `<li class="${activeClass}"><a data-toggle="tab" href="#con${indexPosition}">${fileDescriptor.language}</a></li>`;
            contentSectionsFragment += `<section class="tab-pane fade ${activeClass} ${inClass}" id="con${indexPosition}"><h4>${fileDescriptor.filename}</h4><textarea class="input-xlarge" id="codeWrap_${indexPosition}" rows="3">${unescape(fileDescriptor.content)}</textarea></section>`;
        });

        const detailReplacements = {
            htmlUrl: gistUrl,
            editGistLink: editSourceLink,
            updateTime: lastActivityTime,
            isPublic: accessStatus,
            gistTitle: detailTitle,
            tabNavHtml: navigationTabsFragment,
            tabConHtml: contentSectionsFragment
        };

        const finalDetailMarkup = this.#processTemplate(detailLayout, detailReplacements);
        this.#updateElementMarkup('singleList', finalDetailMarkup);

        this.returnToList();
        this.initializeInfoPopup();
        this.activateCodeCopyFeature();
    }

    // Manages search functionality and suggestions
    implementSearchSuggestions(suggestionDataSource) {
        console.log(suggestionDataSource);

        const searchInputControl = document.getElementById('search');
        if (searchInputControl && typeof $(searchInputControl).typeahead === 'function') {
            $(searchInputControl).typeahead({
                source: suggestionDataSource
            });

            $(searchInputControl).on('selected', function() {
                const currentSelectionLabel = this.value;
                const matchedSourceEntry = suggestionDataSource.find(entry => entry.label === currentSelectionLabel);

                if (!matchedSourceEntry) return;

                const selectedGistIdentifier = matchedSourceEntry.value;
                const listDisplay = document.getElementById('glistList').style.display;
                const singleDisplay = document.getElementById('singleList').style.display;

                if (listDisplay === 'block' || singleDisplay === 'none') {
                    document.getElementById('glistList').style.display = 'none';
                    document.getElementById('singleList').style.display = 'block';
                    gist.getSingleGist(selectedGistIdentifier);
                } else {
                    gist.getSingleGist(selectedGistIdentifier);
                }
            });
        }
    }

    // Handles the process of editing and updating a Gist's files
    manageGistFileUpdate() {
        const gistIdLink = document.getElementById('getGistId');
        if (!gistIdLink) return;

        const currentGistId = gistIdLink.getAttribute('href').substring('https://gist.github.com/'.length);
        const currentGistTitle = gistIdLink.innerHTML;

        const fileTitleNodes = document.querySelectorAll('#myTabContent h4');
        const fileContentNodes = document.querySelectorAll('#myTabContent textarea');

        const filePayload = Array.from(fileTitleNodes).reduce((accumulator, titleNode, index) => {
            const contentNode = fileContentNodes[index];
            if (titleNode && contentNode) {
                const encodedFileName = escape(titleNode.innerHTML);
                const encodedFileContent = escape(contentNode.value);
                accumulator[encodedFileName] = { content: encodedFileContent };
            }
            return accumulator;
        }, {});

        Object.keys(filePayload).forEach(fileNameKey => {
            filePayload[fileNameKey].content = unescape(filePayload[fileNameKey].content);
        });

        gist.updateGist(currentGistId, currentGistTitle, filePayload);
    }

    // Triggers the deletion of a specific Gist
    initiateGistDeletion() {
        const gistIdElement = document.getElementById('getGistId');
        if (!gistIdElement) return;

        const targetGistId = gistIdElement.getAttribute('href').substring('https://gist.github.com/'.length);
        if (window.confirm("Are you sure to delete this gist？")) {
            gist.deleteGist(targetGistId);
            setTimeout(() => {
                window.location.href = 'http://lab.reeqi.name/easyGist/index.html';
            }, 1000);
        }
    }

    // Orchestrates the creation of a new Gist
    coordinateGistCreation(isVisibilityPublic) {
        const gistNameInput = document.getElementById('gistName');
        if (!gistNameInput) return;

        const gistDescription = gistNameInput.value;
        const fileNameInputs = document.querySelectorAll('#newGistInfo input');
        const fileContentTextareas = document.querySelectorAll('#newGistInfo textarea');

        const fileExtensionRegex = /\.[^\.]+$/;
        const allFilesValid = Array.from(fileNameInputs).every(inputField => {
            if (!fileExtensionRegex.test(inputField.value)) {
                alert("Please input the file extensions! example: index.html");
                return false;
            }
            return true;
        });

        if (!allFilesValid) return;

        const newFilesDefinition = Array.from(fileNameInputs).reduce((accumulator, nameField, index) => {
            const contentField = fileContentTextareas[index];
            if (nameField && contentField) {
                const encodedName = escape(nameField.value);
                const encodedContent = escape(contentField.value);
                accumulator[encodedName] = { content: encodedContent };
            }
            return accumulator;
        }, {});

        Object.keys(newFilesDefinition).forEach(fileName => {
            newFilesDefinition[fileName].content = unescape(newFilesDefinition[fileName].content);
        });

        gist.newGist(gistDescription, newFilesDefinition, isVisibilityPublic);
    }

    // Shows a prompt for users with no Gists
    displayFirstTimeUserPrompt() {
        this.#alterElementVisibility('newer', 'block');
    }

    // Sets up the action to return to the Gist list view
    returnToList() {
        const backToListViewButton = document.getElementById('toBack');
        if (backToListViewButton) {
            backToListViewButton.addEventListener('click', (eventObject) => {
                eventObject.preventDefault();
                this.#alterElementVisibility('glistList', 'block');
                this.#alterElementVisibility('singleList', 'none');
                this.#updateElementMarkup('singleList', '');
            });
        }
    }

    // Activates the Gist information tooltip
    initializeInfoPopup() {
        const gistTitleDisplay = document.getElementById('gistTitle');
        if (gistTitleDisplay && typeof $(gistTitleDisplay).tooltip === 'function') {
            $(gistTitleDisplay).tooltip({
                placement: 'right',
                trigger: 'hover'
            });
        }
    }

    // Enables the feature to copy code snippets to clipboard
    activateCodeCopyFeature() {
        const copyActionTrigger = document.getElementById('copy_button');
        if (copyActionTrigger && typeof $(copyActionTrigger).zclip === 'function') {
            $(copyActionTrigger).zclip({
                path: 'js/ZeroClipboard.swf',
                copy: function() {
                    const allTabPanes = Array.from(document.querySelectorAll('.tab-pane'));
                    const currentlyActivePane = allTabPanes.find(paneElement => paneElement.classList.contains('active'));
                    if (currentlyActivePane) {
                        const codeAreaId = currentlyActivePane.id.replace('con', 'codeWrap_');
                        const codeContentArea = document.getElementById(codeAreaId);
                        return codeContentArea ? codeContentArea.value : '';
                    }
                    return '';
                },
                afterCopy: function() {
                    alert("This file's code has copied to your clipboard !");
                }
            });
        }
    }

    // Handles the removal of file input fields during new Gist creation
    manageDynamicFileRemoval() {
        const fileEntryContainers = document.querySelectorAll('.new_files_area');
        Array.from(fileEntryContainers).forEach(containerElement => {
            const deleteFileButton = containerElement.querySelector('.del_file');
            if (deleteFileButton) {
                deleteFileButton.addEventListener('click', () => {
                    containerElement.remove();
                });
            }
        });
    }

    // Sets up all event listeners for the Gist creation interface
    configureNewGistListeners() {
        const addNewFileButton = document.getElementById('newFile');
        if (addNewFileButton) {
            addNewFileButton.addEventListener('click', () => {
                const newFileBlockMarkup = this.#getElementMarkup('newFileDom');
                const gistInfoFormArea = document.getElementById('newGistInfo');
                if (gistInfoFormArea) {
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = newFileBlockMarkup;
                    while (tempWrapper.firstChild) {
                        gistInfoFormArea.appendChild(tempWrapper.firstChild);
                    }
                    this.manageDynamicFileRemoval();
                }
            });
        }

        const createPublicButton = document.getElementById('cPublicGist');
        if (createPublicButton) {
            createPublicButton.addEventListener('click', () => {
                this.coordinateGistCreation(0);
            });
        }

        const createPrivateButton = document.getElementById('cPrivateGist');
        if (createPrivateButton) {
            createPrivateButton.addEventListener('click', () => {
                this.coordinateGistCreation(1);
            });
        }
    }
}

const applicationInterface = new InterfaceHandler();