/*
 This module provides utility functions for handling specific download links.
 It aims to facilitate the initiation of file transfers via external services.

 Copyright (c) 2010, A. B. Shehata and D. Castagna.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
 3. Neither the name of the copyright holder nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 THE POSSIBILITY OF SUCH DAMAGE.
*/

// Main object for managing torrent-related download functionality.
var TorrentLinkHandler = {

    /**
     * Attempts to open a new browser window for a given torrent resource.
     * @param {string} resourceIdentifier The URL of the torrent file.
     * @returns {boolean} True if the window was successfully opened, false otherwise.
     */
    launchDownloadWindow: function(resourceIdentifier) {
        if (!resourceIdentifier || resourceIdentifier.trim().length === 0) {
            console.warn("Attempted to launch download window with an empty resource identifier.");
            return false;
        }

        const externalServiceHost = "http://www.bitlet.org/download";
        const currentOrigin = encodeURIComponent(window.location.href);
        const clientSourceTag = "extension_v1";

        // Construct the full download URL using template literals for clarity.
        const fullDownloadUrl = `${externalServiceHost}?torrent=${resourceIdentifier}&referer=${currentOrigin}&source=${clientSourceTag}`;

        // Define window properties. Reordered and slightly changed from original.
        const windowFeatures = 'resizable=yes,scrollbars=yes,toolbar=no,location=no,status=no,menubar=no,width=420,height=210';

        // Attempt to open the new window.
        let createdPopUp = window.open(fullDownloadUrl, '_blank', windowFeatures);

        // Check if the popup was blocked or failed to open.
        const isPopupValid = (createdPopUp && typeof createdPopUp.blur === 'function');
        if (!isPopupValid) {
            console.error("Popup window creation failed or was blocked.");
            return false;
        }

        // Focus the new window for better user experience.
        createdPopUp.focus();
        return true;
    },

    /**
     * Tries to open the download window and alerts the user if it fails,
     * typically due to popup blockers.
     * @param {string} targetResource The URL of the torrent to download.
     * @returns {boolean} True if the download process was initiated, false otherwise.
     */
    attemptSecureDownload: function(targetResource) {
        if (this.launchDownloadWindow(targetResource)) {
            console.log("Download window successfully initiated for:", targetResource);
            return true;
        } else {
            // Inform the user about potential popup blocking.
            alert("Oops! It seems a popup blocker prevented the download window from opening. Please allow popups for this site.");
            console.warn("User was notified about popup blocker for:", targetResource);
            return false;
        }
    },

    /**
     * Extracts a torrent URL from an anchor element's href attribute
     * and initiates the download process.
     * @param {HTMLAnchorElement} linkElement The anchor HTML element.
     * @returns {boolean} True if the download process was attempted, false otherwise.
     */
    processAnchorForDownload: function(linkElement) {
        if (!linkElement || typeof linkElement.href !== 'string') {
            console.error("Invalid link element provided for processing.");
            return false;
        }

        // Use the internal utility to get the 'torrent' parameter.
        const mediaLocator = this.extractQueryParameter('torrent', linkElement.href);

        if (!mediaLocator || mediaLocator.length === 0) {
            alert("Error: The download link is missing the 'torrent' parameter.");
            console.error("Missing 'torrent' parameter in anchor href:", linkElement.href);
            return false;
        }

        // Proceed with the secure download attempt.
        const downloadInitiated = this.attemptSecureDownload(mediaLocator);
        return downloadInitiated; // Return whether the attempt was made.
    },

    /**
     * Parses a URL string to find the value of a specific query parameter.
     * This version uses a more robust string splitting approach.
     * @param {string} keyName The name of the parameter to find.
     * @param {string} sourceUrl The full URL string to parse.
     * @returns {string|null} The decoded value of the parameter, or null if not found.
     */
    extractQueryParameter: function(keyName, sourceUrl) {
        if (!keyName || !sourceUrl || typeof sourceUrl !== 'string') {
            console.warn("Invalid input for extractQueryParameter. Key or URL is missing.");
            return null;
        }

        const queryStartIndex = sourceUrl.indexOf('?');
        if (queryStartIndex === -1) {
            return null; // No query string found.
        }

        // Extract the query string part.
        const rawQueryString = sourceUrl.substring(queryStartIndex + 1);

        // Split into individual parameter pairs.
        const paramPairs = rawQueryString.split('&');

        let foundValue = null;

        // Iterate through each pair to find the matching key.
        for (let j = 0; j < paramPairs.length; j++) {
            const currentPair = paramPairs[j];
            const eqIndex = currentPair.indexOf('=');

            // Ensure the pair has an equals sign and a key part.
            if (eqIndex > 0) {
                const currentKey = currentPair.substring(0, eqIndex);
                if (currentKey === keyName) {
                    foundValue = currentPair.substring(eqIndex + 1);
                    break; // Found the parameter, exit loop.
                }
            }
        }

        // Decode the found value to handle URL-encoded characters.
        return foundValue ? decodeURIComponent(foundValue) : null;
    }
};