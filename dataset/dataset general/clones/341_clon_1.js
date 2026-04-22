/*******************************************************************************
 * This is a comment block for the entire file.
 * It contains important licensing and copyright information.
 ******************************************************************************/
/*
 * Copyright (c) 2010 Alessandro Bahgat Shehata and Daniele Castagna
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.bitlet.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Additional notes: This software is provided "as is" without warranty.
 */
// End of license information.

// This object, named BitLet, facilitates interaction with the BitLet service.
// It is primarily used for handling torrent download links.
var     BitLet      =
{
    /**
     * @description This function initiates the process of opening a download popup
     *              window for a given torrent URL.
     * @param {string} torrentUrl The URL of the torrent file to be downloaded.
     * @returns {boolean} True if the popup window was successfully opened,
     *                    false otherwise (e.g., if blocked by a popup blocker).
     */
    openPopup : function (  torrentUrl  )
    {
        // Define the target URL for the popup, combining the BitLet download service
        // with the provided torrent URL and encoding the current page's referrer.
        // Also includes a source identifier for tracking.
        var fullDownloadUrl = "http://www.bitlet.org/download?torrent="
                            + torrentUrl
                            + "&referer="
                            + encodeURIComponent(location.href)
                            + '&source=bitlet4chrome';

        // Define the window features for the popup. These control its appearance and behavior.
        var windowFeatures  = 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=400,height=200';

        // Attempt to open a new browser window/tab with the constructed URL and features.
        // The empty string '' is used for the window name.
        var popUpWindow     = window.open(  fullDownloadUrl,  '',  windowFeatures  );

        // Check if the pop-up window object is null or undefined, which often indicates
        // that a pop-up blocker prevented the window from being opened.
        if  (
                ( popUpWindow  ==  null )
                ||
                ( typeof (  popUpWindow  )  ==  "undefined" )
            )
        {
            // If the window could not be opened, return false.
            return  false;
        }
        else
        {
            // If the window was opened successfully, return true.
            return  true;
        }
    },

    /**
     * @summary This method attempts to open the torrent download popup.
     * @description If the popup cannot be opened (e.g., due to a popup blocker),
     *              it displays an alert message to the user.
     * @param {string} torrentUrl The URL of the torrent to open.
     * @returns {boolean} Always returns false after attempting to open the popup
     *                    and potentially showing an alert.
     */
    openPopupChecked : function  ( torrentUrl )
    {
        // First, try to open the popup window using the dedicated openPopup method.
        // If openPopup returns false, it means the popup was blocked or failed to open.
        if  (   !  BitLet.openPopup(  torrentUrl  )   )
        {
            // In case of a failure to open the popup, notify the user.
            alert("Grrrr, someone is blocking the download popup window. Please disable any popup blocker.");
        }

        // This function consistently returns false, regardless of whether the popup opened or not.
        return  false;
    },

    /*
     * This function extracts a torrent URL from an HTML anchor element's href
     * and then attempts to open a download popup for it.
     * @param {HTMLAnchorElement} anchor The anchor element from which to extract the torrent URL.
     * @returns {boolean} Always returns false.
     */
    openDownloadFromAnchor : function  (  anchor  )
    {
        // Attempt to extract the "torrent" parameter value from the anchor's href attribute.
        var     torrentUrl      =   BitLet.getURLParam(  "torrent",  anchor.href  );

        // Check if the extracted torrent URL is empty. An empty string implies the parameter
        // was not found or was empty in the URL.
        if      (   torrentUrl.length  ==  0   )
        {
            // If the "torrent" parameter is missing, inform the user with an alert.
            alert(  "Missing \"torrent\" parameter"  );

            // Exit the function, returning false.
            return  false;
        }

        // If a torrent URL was successfully extracted, proceed to open the download popup.
        BitLet.openPopupChecked(  torrentUrl  );

        // This function always returns false after processing.
        return  false;
    },

    /**
     * @description Retrieves the value of a specified URL parameter from a given URL string.
     * @param {string} paramName The name of the parameter to search for (e.g., "id").
     * @param {string} url The full URL string to parse.
     * @returns {string|null} The value of the parameter if found, otherwise null.
     */
    getURLParam : function  (   paramName,   url   )
    {
        // Initialize paramValue to null. This will be returned if the parameter is not found.
        var     paramValue      =   null;

        // First, check if the URL contains a query string indicator ('?').
        // If not, there are no parameters to parse.
        if  (   url.indexOf(  "?"  )   >   -1   )
        {
            // Extract the query string part of the URL (everything after '?').
            var     queryString     =   url.substr(  url.indexOf(  "?"  )  );

            // Split the query string into individual parameter-value pairs using '&' as a delimiter.
            var     parameters      =   queryString.split(  "&"  );

            // Iterate through each parameter-value pair.
            for  (  var   i  =  0;   i  <  parameters.length;   i++  )
            {
                // Check if the current parameter string contains the target parameter name
                // followed by an equals sign (e.g., "paramName=").
                if  (   parameters[i].indexOf(  paramName  +  "="  )   >   -1   )
                {
                    // If found, split the pair into name and value.
                    var     paramTuple      =   parameters[i].split(  "="  );

                    // Assign the second part (the value) to paramValue.
                    paramValue      =   paramTuple[1];

                    // Since we found the parameter, we can stop searching.
                    break;
                }
            }
        }

        // Return the extracted parameter value, or null if not found.
        return  paramValue;
    }
}; // Closing brace for the BitLet object.