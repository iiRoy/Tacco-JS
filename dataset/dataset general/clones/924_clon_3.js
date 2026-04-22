// ==UserScript==
// @name         MusicBrainz: Submit Release Details from Apple Music
// @description  Facilitates the import of album and track information from Apple Music (iTunes Store) pages into MusicBrainz.
// @version      2023.11.28
// @author       CloneGenerator
// @namespace    https://github.com/CloneFactory/userscripts
// @match        *://itunes.apple.com/*
// @match        *://music.apple.com/*
// @grant        none
// ==/UserScript==

// This script aims to extract relevant metadata from an Apple Music album page
// and pre-fill a MusicBrainz 'Add Release' form for streamlined submission.

(function() {
    'use strict';

    // --- Configuration and Initialization ---
    const MUSICBRAINZ_SUBMIT_URL = `https://musicbrainz.org/release/add`;
    const ITUNES_API_BASE_URL = `https://itunes.apple.com/lookup`;
    const SCRIPT_REFERENCE_URL = `https://github.com/CloneFactory/userscripts/blob/main/AppleMusic-to-MB.user.js`;
    const HIDDEN_FORM_ID_PREFIX = 'mb_auto_field_';

    // Ensure we are on an Apple Music page before proceeding
    if (!document.location.hostname.includes('apple.com')) {
        console.warn("Script activated on non-Apple Music domain. Aborting.");
        return;
    }

    // --- DOM Element Query Helpers ---
    /**
     * Safely query a single DOM element.
     * @param {string} selector - CSS selector string.
     * @param {Element} [context=document] - The element to start the search from.
     * @returns {Element|null} The found element or null.
     */
    const getSingleElement = (selector, context = document) => {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.error(`Error querying element with selector "${selector}":`, error);
            return null;
        }
    };

    /**
     * Safely query multiple DOM elements.
     * @param {string} selector - CSS selector string.
     * @param {Element} [context=document] - The element to start the search from.
     * @returns {NodeListOf<Element>} A NodeList of found elements, or empty NodeList.
     */
    const getMultipleElements = (selector, context = document) => {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.error(`Error querying elements with selector "${selector}":`, error);
            return document.createDocumentFragment().children; // Return an empty NodeList-like object
        }
    };

    // --- Main Form Setup ---
    // Prepare the submission form for MusicBrainz
    const releaseSubmissionForm = document.createElement("form");
    releaseSubmissionForm.method = "POST";
    releaseSubmissionForm.target = "_blank"; // Open in a new tab
    releaseSubmissionForm.action = MUSICBRAZINZ_SUBMIT_URL;
    releaseSubmissionForm.acceptCharset = "UTF-8";
    releaseSubmissionForm.id = "mb-import-data-form";

    // Define custom styles for our interactive elements
    const customControlStyles = document.createElement("style");
    customControlStyles.type = "text/css";
    customControlStyles.textContent = `
        .releaseImportButton {
            border: 1px solid #C0C0C0;
            cursor: pointer;
            border-radius: 5px;
            padding: 8px 14px;
            margin-top: 20px;
            background: linear-gradient(to bottom, #F9F9F9, #EBEBEB);
            color: #333;
            font-weight: bold;
            font-size: 14px;
            transition: background 0.2s ease-in-out;
        }
        .releaseImportButton:hover {
            background: linear-gradient(to bottom, #EBEBEB, #D0D0D0);
            border-color: #A0A0A0;
        }
        .artworkResolutionLinks {
            margin-top: 12px;
            font-size: 0.9em;
            color: #555;
        }
        .artworkResolutionLinks a {
            color: #007AFF;
            text-decoration: none;
            margin-right: 10px;
        }
        .artworkResolutionLinks a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(customControlStyles); // Append styles to head for better practice

    // Create the submission button
    const submitToMBButton = document.createElement("input");
    submitToMBButton.type = "submit";
    submitToMBButton.value = "Submit to MusicBrainz";
    submitToMBButton.classList.add("releaseImportButton");
    releaseSubmissionForm.appendChild(submitToMBButton);

    // --- Artwork Link Generation ---
    const primaryContentArea = getSingleElement('#left-stack'); // Or a more general selector like 'div[role="main"]'
    if (primaryContentArea) {
        const albumArtworkElement = getSingleElement('img', primaryContentArea);
        const itunesAppViewLink = getSingleElement('.view-in-itunes', primaryContentArea);

        if (albumArtworkElement && itunesAppViewLink) {
            const highResImageSource = albumArtworkElement.getAttribute('src-swap-high-dpi');

            if (highResImageSource) {
                const artworkDisplayContainer = document.createElement("p");
                artworkDisplayContainer.classList.add("artworkResolutionLinks");

                // Replace common image size patterns with higher resolutions
                const largeSizeSrc = highResImageSource.replace(/340x340|250x250/g, "600x600");
                const xlargeSizeSrc = highResImageSource.replace(/340x340|250x250/g, "1200x1200");

                artworkDisplayContainer.innerHTML = `Artwork: <a href="${largeSizeSrc}" target="_blank">600px</a>, ` +
                                                    `<a href="${xlargeSizeSrc}" target="_blank">1200px</a>`;

                // Insert the artwork links just before the "view in iTunes" button
                itunesAppViewLink.before(artworkDisplayContainer);
            } else {
                console.info("High-DPI artwork source not found.");
            }
        }
    } else {
        console.warn("Primary content area for artwork not found.");
    }

    // --- Data Extraction from URL and API Call ---
    const currentDocumentLocation = document.location.href;
    const urlMatcher = /^https?:\/\/(?:itunes|music)\.apple\.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/;
    const urlMatchResult = urlMatcher.exec(currentDocumentLocation);

    let detectedCountryCode = 'XW'; // Default to worldwide
    let albumIdentifier = null;

    if (urlMatchResult) {
        detectedCountryCode = urlMatchResult[1] || detectedCountryCode;
        albumIdentifier = urlMatchResult[2];
    } else {
        console.error("Could not parse album ID from URL. Script cannot proceed with API lookup.");
        return; // Exit if album ID isn't found
    }

    const outputFormWrapper = document.createElement("div");
    outputFormWrapper.classList.add("right-side-import-panel");

    // Initialize release metadata variables
    let primaryArtist = '', releaseTitle = '', recordLabel = '', releaseYear = 0, releaseMonth = 0, releaseDay = 0;
    let releaseType = 'album', totalDiscs = 0;

    if (albumIdentifier) {
        let apiRequestLink = `${ITUNES_API_BASE_URL}?id=${albumIdentifier}&entity=song&limit=200`;
        if (detectedCountryCode !== 'XW') {
            apiRequestLink += `&country=${detectedCountryCode}`;
        }

        const apiRequestHandle = new XMLHttpRequest();
        apiRequestHandle.open('GET', apiRequestLink, true);

        apiRequestHandle.onload = function() { // Use onload for modern event handling
            if (apiRequestHandle.status >= 200 && apiRequestHandle.status < 300) {
                processApiResponse(apiRequestHandle.responseText);
            } else {
                console.error(`iTunes API request failed with status: ${apiRequestHandle.status}`);
            }
        };

        apiRequestHandle.onerror = function() {
            console.error("Network error occurred during iTunes API request.");
        };

        apiRequestHandle.send(null);
    }

    // --- Helper for adding hidden form fields ---
    /**
     * Creates a hidden input element and appends it to the submission form.
     * @param {string} inputName - The 'name' attribute for the input.
     * @param {any} inputValue - The 'value' attribute for the input.
     */
    function createAndAppendHiddenInput(inputName, inputValue) {
        const hiddenFormInput = document.createElement("input");
        hiddenFormInput.type = "hidden";
        hiddenFormInput.name = inputName;
        hiddenFormInput.value = inputValue;
        hiddenFormInput.id = `${HIDDEN_FORM_ID_PREFIX}${inputName.replace(/[^a-zA-Z0-9]/g, '_')}`; // Sanitize ID for safety
        releaseSubmissionForm.appendChild(hiddenFormInput);
    }

    // --- API Response Processing ---
    /**
     * Parses the iTunes API response and populates the hidden form fields.
     * @param {string} rawApiResponse - The raw JSON string from the API.
     */
    function processApiResponse(rawApiResponse) {
        let parsedResponseData;
        try {
            parsedResponseData = JSON.parse(rawApiResponse);
        } catch (e) {
            console.error("Failed to parse iTunes API response JSON:", e);
            return;
        }

        if (!parsedResponseData || !parsedResponseData.results || parsedResponseData.results.length === 0) {
            console.warn("No results found in iTunes API response.");
            return;
        }

        // Iterate through results to extract collection and track data
        for (let entryIndex = 0; entryIndex < parsedResponseData.results.length; entryIndex++) {
            const currentEntry = parsedResponseData.results[entryIndex];

            if (currentEntry.wrapperType === "collection") {
                // Collection details (album level)
                primaryArtist = currentEntry.artistName || '';
                releaseTitle = currentEntry.collectionName || '';

                // Check for Single/EP in title and adjust type
                const titleTypeMatch = /(.*?) - (Single|EP)/.exec(currentEntry.collectionName);
                if (titleTypeMatch) {
                    releaseTitle = titleTypeMatch[1].trim();
                    releaseType = titleTypeMatch[2].toLowerCase();
                }

                // Parse release date
                const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(currentEntry.releaseDate);
                if (dateMatch) {
                    releaseYear = dateMatch[1];
                    releaseMonth = dateMatch[2];
                    releaseDay = dateMatch[3];
                }

                // Extract label, removing copyright year if present
                recordLabel = currentEntry.copyright || '';
                const copyrightMatch = /(?:[0-9]{4}\s*)?(.+)/.exec(currentEntry.copyright);
                if (copyrightMatch && copyrightMatch[1]) {
                    recordLabel = copyrightMatch[1].trim();
                }

            } else if (currentEntry.wrapperType === "track") {
                // Track details
                const currentDiscNumber = (currentEntry.discNumber || 1) - 1; // 0-indexed
                const currentTrackNumber = (currentEntry.trackNumber || 1) - 1; // 0-indexed
                totalDiscs = currentEntry.discCount || 1;

                let trackDisplayName = currentEntry.trackName || '';

                // Handle censored track names if different and meaningful
                if (currentEntry.trackCensoredName && trackDisplayName !== currentEntry.trackCensoredName) {
                    // Check if the censored name is just the original name with a suffix
                    const censoredSuffixMatch = new RegExp(`^${trackDisplayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(.+\\)$`);
                    if (censoredSuffixMatch.test(currentEntry.trackCensoredName)) {
                        trackDisplayName = currentEntry.trackCensoredName;
                    }
                }

                createAndAppendHiddenInput(`mediums.${currentDiscNumber}.track.${currentTrackNumber}.name`, trackDisplayName);
                createAndAppendHiddenInput(`mediums.${currentDiscNumber}.track.${currentTrackNumber}.length`, currentEntry.trackTimeMillis || '');

                // Process track artist credits
                const trackArtists = (currentEntry.artistName || '').split(/[,&]/).map(name => name.trim()).filter(name => name.length > 0);
                for (let artistPartIdx = 0; artistPartIdx < trackArtists.length; artistPartIdx++) {
                    const currentArtistPart = trackArtists[artistPartIdx];
                    createAndAppendHiddenInput(`mediums.${currentDiscNumber}.track.${currentTrackNumber}.artist_credit.names.${artistPartIdx}.name`, currentArtistPart);

                    // Determine join phrase
                    let joinPhrase = '';
                    if (artistPartIdx < trackArtists.length - 1) {
                        joinPhrase = (artistPartIdx === trackArtists.length - 2) ? " & " : ", ";
                    }
                    if (joinPhrase) {
                        createAndAppendHiddenInput(`mediums.${currentDiscNumber}.track.${currentTrackNumber}.artist_credit.names.${artistPartIdx}.join_phrase`, joinPhrase);
                    }
                }
            }
        }

        // Add disc format for each disc
        for (let discIdx = 0; discIdx < totalDiscs; discIdx++) {
            createAndAppendHiddenInput(`mediums.${discIdx}.format`, 'Digital Media');
        }

        // Populate main release fields
        createAndAppendHiddenInput("name", releaseTitle);
        createAndAppendHiddenInput("artist_credit.names.0.artist.name", primaryArtist);
        createAndAppendHiddenInput("packaging", 'None'); // Common for digital releases
        createAndAppendHiddenInput("date.year", releaseYear);
        createAndAppendHiddenInput("date.month", releaseMonth);
        createAndAppendHiddenInput("date.day", releaseDay);
        createAndAppendHiddenInput("labels.0.name", recordLabel);
        createAndAppendHiddenInput("country", detectedCountryCode);
        createAndAppendHiddenInput("status", "official");
        createAndAppendHiddenInput("type", releaseType);
        createAndAppendHiddenInput("edit_note", `Imported from: ${currentDocumentLocation}\nUsing userscript: ${SCRIPT_REFERENCE_URL}`);
        createAndAppendHiddenInput("urls.0.link_type", "74"); // Official release URL
        createAndAppendHiddenInput("urls.0.url", currentDocumentLocation);
        createAndAppendHiddenInput("urls.0.text", "Apple Music / iTunes Store"); // Descriptive text for the URL

        // Append the populated form to the page, typically near the title or a prominent section.
        // We'll try to find a suitable location, like the parent of the main title element.
        const mainTitleElement = getSingleElement('h1');
        if (mainTitleElement && mainTitleElement.parentNode) {
            outputFormWrapper.appendChild(releaseSubmissionForm);
            mainTitleElement.parentNode.insertBefore(outputFormWrapper, mainTitleElement.nextSibling);
            console.info("MusicBrainz import form successfully appended to the page.");
        } else {
            document.body.appendChild(outputFormWrapper); // Fallback to body if specific element not found
            outputFormWrapper.appendChild(releaseSubmissionForm);
            console.warn("Could not find optimal placement for form; appended to body.");
        }
    }
})();