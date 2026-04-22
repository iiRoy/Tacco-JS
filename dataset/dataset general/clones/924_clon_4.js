// ==UserScript==
// @name        MusicBrainz: Import from iTunes (Type IV Clone)
// @description Import releases from iTunes using a divergent approach
// @version     2023-11-20-clone
// @author      Clone Generator
// @namespace   http://userscripts.org/users/clone-generator
// @include     *://itunes.apple.com/*
// ==/UserScript==
//**************************************************************************//

(async function() {

    // Helper to generate and inject DOM elements more functionally
    const domInjector = {
        injectStyle: (styleContent, targetElement = document.head) => {
            const styleNode = document.createElement('style');
            styleNode.type = 'text/css';
            styleNode.textContent = styleContent;
            targetElement.appendChild(styleNode);
        },
        createAndAppend: (parent, tagName, attributes = {}, textContent = '') => {
            const element = document.createElement(tagName);
            Object.assign(element, attributes);
            if (textContent) {
                element.textContent = textContent;
            }
            parent.appendChild(element);
            return element;
        },
        insertAsSibling: (referenceElement, tagName, attributes = {}, innerHtml = '', position = 'beforebegin') => {
            const newElement = document.createElement(tagName);
            Object.assign(newElement, attributes);
            if (innerHtml) {
                newElement.innerHTML = innerHtml;
            }
            referenceElement.insertAdjacentElement(position, newElement);
            return newElement;
        }
    };

    // --- Dynamic Styles for UI Elements ---
    const isViewMorePresent = document.querySelectorAll('.view-more').length > 0;
    const buttonExtraMargin = isViewMorePresent ? 'margin-right: -150px;' : '';
    domInjector.injectStyle(`.submitBtn { border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-top: 25px; background: #F7F7F7; ${buttonExtraMargin} } .submitBtn:hover { background: #DEDEDE }`);
    domInjector.injectStyle('.imageLinkContainer { margin-top: 10px; }');

    // --- Form Setup ---
    const submissionGateway = document.createElement('form');
    Object.assign(submissionGateway, {
        method: 'post',
        target: '_blank',
        action: window.location.protocol + '//musicbrainz.org/release/add',
        acceptCharset: 'UTF-8'
    });

    domInjector.createAndAppend(submissionGateway, 'button', {
        type: 'submit',
        className: 'submitBtn'
    }, 'Transfer to MusicBrainz');

    // --- Artwork Links Generation ---
    const leftPane = document.getElementById('left-stack');
    const albumArtImage = leftPane ? leftPane.querySelector('img[src-swap-high-dpi]') : null;
    const itunesAppLaunchButton = leftPane ? leftPane.querySelector('.view-in-itunes') : null;

    if (albumArtImage && itunesAppLaunchButton) {
        const originalImageSource = albumArtImage.getAttribute('src-swap-high-dpi');
        const linkHtmlContent = `Artwork: <a href="${originalImageSource.replace(/340x340/g, '600x600')}">600px</a>, <a href="${originalImageSource.replace(/340x340/g, '1200x1200')}">1200px</a>`;
        domInjector.insertAsSibling(itunesAppLaunchButton, 'p', { className: 'imageLinkContainer' }, linkHtmlContent, 'beforebegin');
    }

    // --- Data Retrieval and Processing ---
    const currentWebAddress = window.location.href;
    const addressPatternMatch = currentWebAddress.match(/^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/);

    if (!addressPatternMatch) {
        return; // Terminate if URL does not conform
    }

    const marketRegion = addressPatternMatch[1];
    const itemReferenceId = addressPatternMatch[2];

    let queryServiceUrl = `${window.location.protocol}//itunes.apple.com/lookup?id=${itemReferenceId}&entity=song&limit=200`;
    if (marketRegion) {
        queryServiceUrl += `&country=${marketRegion}`;
    }

    let parsedReleaseData = {
        mainArtistName: '',
        releaseName: '',
        recordLabel: '',
        releaseYear: 0,
        releaseMonth: 0,
        releaseDay: 0,
        releaseCountry: marketRegion || 'XW',
        releaseCategory: 'album',
        totalDiscs: 0,
        tracks: []
    };

    // Functional approach for adding hidden form fields
    const appendHiddenInput = (formHost) => (inputName, inputValue) => {
        domInjector.createAndAppend(formHost, 'input', {
            type: 'hidden',
            name: inputName,
            value: inputValue
        });
    };
    const addFormEntry = appendHiddenInput(submissionGateway);

    try {
        const apiResponse = await fetch(queryServiceUrl);
        if (!apiResponse.ok) {
            throw new Error(`Network issue: ${apiResponse.status}`);
        }
        const apiPayload = await apiResponse.json();

        apiPayload.results.forEach(itemEntry => {
            switch (itemEntry.wrapperType) {
                case "collection":
                    parsedReleaseData.mainArtistName = itemEntry.artistName;
                    parsedReleaseData.releaseName = itemEntry.collectionName;

                    const titleFormatMatch = itemEntry.collectionName.match(/(.*?) - (Single|EP)/);
                    if (titleFormatMatch) {
                        parsedReleaseData.releaseName = titleFormatMatch[1];
                        parsedReleaseData.releaseCategory = titleFormatMatch[2];
                    }

                    const dateComponentsMatch = itemEntry.releaseDate.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/);
                    if (dateComponentsMatch) {
                        parsedReleaseData.releaseYear = dateComponentsMatch[1];
                        parsedReleaseData.releaseMonth = dateComponentsMatch[2];
                        parsedReleaseData.releaseDay = dateComponentsMatch[3];
                    }

                    parsedReleaseData.recordLabel = itemEntry.copyright;
                    const copyrightParseMatch = itemEntry.copyright.match(/(?:[0-9]{4} )?(.*)/);
                    if (copyrightParseMatch) {
                        parsedReleaseData.recordLabel = copyrightParseMatch[1];
                    }
                    break;

                case "track":
                    const discIndex = itemEntry.discNumber - 1;
                    const trackIndex = itemEntry.trackNumber - 1;
                    parsedReleaseData.totalDiscs = Math.max(parsedReleaseData.totalDiscs, itemEntry.discCount);

                    let finalTrackTitle = itemEntry.trackName;
                    if (itemEntry.trackCensoredName && finalTrackTitle !== itemEntry.trackCensoredName) {
                        const censoredPrefix = itemEntry.trackCensoredName.substring(0, finalTrackTitle.length);
                        const censoredSuffix = itemEntry.trackCensoredName.substring(finalTrackTitle.length);
                        if (finalTrackTitle === censoredPrefix && censoredSuffix.match(/^ \(.*\)$/)) {
                            finalTrackTitle = itemEntry.trackCensoredName;
                        }
                    }

                    parsedReleaseData.tracks.push({
                        discOrdinal: discIndex,
                        trackOrdinal: trackIndex,
                        title: finalTrackTitle,
                        durationMillis: itemEntry.trackTimeMillis,
                        trackContributors: itemEntry.artistName.split(/[,&]/).map(contributor => contributor.trim())
                    });
                    break;
            }
        });

        // Populate the form with collected data
        addFormEntry("name", parsedReleaseData.releaseName);
        addFormEntry("artist_credit.names.0.artist.name", parsedReleaseData.mainArtistName);
        addFormEntry("packaging", 'None');
        addFormEntry("date.year", parsedReleaseData.releaseYear);
        addFormEntry("date.month", parsedReleaseData.releaseMonth);
        addFormEntry("date.day", parsedReleaseData.releaseDay);
        addFormEntry("labels.0.name", parsedReleaseData.recordLabel);
        addFormEntry("country", parsedReleaseData.releaseCountry);
        addFormEntry("status", "official");
        addFormEntry("type", parsedReleaseData.releaseCategory);
        addFormEntry("edit_note", `Data imported from: ${window.location.href} via an external script.`);
        addFormEntry("urls.0.link_type", "74");
        addFormEntry("urls.0.url", window.location.href);

        for (let i = 0; i < parsedReleaseData.totalDiscs; i++) {
            addFormEntry(`mediums.${i}.format`, 'Digital Media');
        }

        parsedReleaseData.tracks.forEach(individualTrack => {
            addFormEntry(`mediums.${individualTrack.discOrdinal}.track.${individualTrack.trackOrdinal}.name`, individualTrack.title);
            addFormEntry(`mediums.${individualTrack.discOrdinal}.track.${individualTrack.trackOrdinal}.length`, individualTrack.durationMillis);

            individualTrack.trackContributors.forEach((contributorName, contributorIdx) => {
                addFormEntry(`mediums.${individualTrack.discOrdinal}.track.${individualTrack.trackOrdinal}.artist_credit.names.${contributorIdx}.name`, contributorName);
                if (contributorIdx < individualTrack.trackContributors.length - 1) {
                    let joinPhraseText = '';
                    if (contributorIdx === individualTrack.trackContributors.length - 2) {
                        joinPhraseText = ' & ';
                    } else {
                        joinPhraseText = ', ';
                    }
                    addFormEntry(`mediums.${individualTrack.discOrdinal}.track.${individualTrack.trackOrdinal}.artist_credit.names.${contributorIdx}.join_phrase`, joinPhraseText);
                }
            });
        });

        const contentWrapperDiv = document.createElement('div');
        contentWrapperDiv.className = 'right';
        contentWrapperDiv.appendChild(submissionGateway);

        const targetAnchor = document.getElementById('title');
        if (targetAnchor) {
            targetAnchor.appendChild(contentWrapperDiv);
        } else {
            document.body.appendChild(contentWrapperDiv); // Fallback
        }

    } catch (operationError) {
        console.error('Failed to process iTunes data:', operationError);
        // Implement user-facing error feedback if necessary
    }

})();