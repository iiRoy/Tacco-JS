/*
 ********************************************************************************
 *
 * Copyright (c) 2010 Joseph Turian.
 * Developed by Dmitriy Khudorozhkov.
 *
 * This software is provided under the terms of the BSD-style license.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions, and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions, and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *  3. Neither the name of Joseph Turian nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JOSEPH TURIAN BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 ********************************************************************************
 */

var savemytabs =
{
    // --- Component Shortcuts ---
    // Access to XPCOM Components.classes
    Cc: Components.classes,
    // Access to XPCOM Components.interfaces
    Ci: Components.interfaces,

    // --- Extension Configuration ---
    // Stores the preference branch for the extension.
    branch: null, // This will be initialized during startup.

    // --- Core Initialization Function ---
    // This method sets up the extension upon loading.
    init: function()
    {
        // Obtain the preferences service.
        var prefservice = this.Cc["@mozilla.org/preferences-service;1"].getService(this.Ci.nsIPrefService);

        // Get the specific preference branch for 'savemytabs'.
        this.branch = prefservice.getBranch("extensions.savemytabs.");

        // Schedule the very first execution of the saving mechanism.
        // This effectively starts the periodic saving process.
        this.next();
    },

    // --- Tab Saving Logic ---
    // This function is responsible for gathering and saving all open tab URLs and titles.
    save: function()
    {
        // Check if the current window is the most recently active browser window.
        // This prevents multiple windows from attempting to save tabs simultaneously
        // or saving from non-primary windows.
        var mediator = this.Cc["@mozilla.org/appshell/window-mediator;1"].getService(this.Ci.nsIWindowMediator);

        if ( window != mediator.getMostRecentWindow("navigator:browser") )
        {
            // If it's not the most recent window, we skip the saving process.
            // Instead, we immediately schedule the next attempt.
            this.next();
            return; // Exit the function early.
        }

        // Array to hold the formatted lines of tab information.
        var lines = [];

        // Initialize counters for windows and tabs for labeling purposes.
        var w = 1, t = 1;

        // Obtain an enumerator for all open browser windows.
        var browserEnumerator = mediator.getEnumerator("navigator:browser");

        // Loop through each browser window found.
        while ( browserEnumerator.hasMoreElements() )
        {
            // Get the current browser window object.
            var browserWin = browserEnumerator.getNext();

            // Access the tab browser component within the window.
            var tabbrowser = browserWin.gBrowser;

            // Determine the total number of tabs in the current window.
            var nbrowsers = tabbrowser.browsers.length;

            // Iterate over each tab in the current window.
            for ( var i = 0; i < nbrowsers; i++ )
            {
                // Get the individual browser (tab) object.
                var browser = tabbrowser.browsers[i];

                // Construct a descriptive string for the tab, including window/tab numbers,
                // its URL, and its title. Replace any tabs in URL/title to prevent formatting issues.
                lines.push(
                    ( "window #" + w + "/tab #" + ( t++ ) ) +
                    "\t" +
                    browser.currentURI.spec.replace( "\t", " " ) +
                    "\t" +
                    browser.contentDocument.title.replace( "\t", " " )
                );
            } // End of tab iteration.

            // Increment the window counter for the next window.
            ++w;
            // Reset the tab counter for the new window.
            t = 1;
        } // End of window iteration.


        // --- Date/Time Preparation for Filename ---
        // Helper function to format numbers with a leading zero if they are single digit.
        function prepare(num)
        {
            var str = String(num); // Convert number to string.

            if ( str.length < 2 ) // Check if it's a single digit.
                str = "0" + str; // Prepend a zero.

            return str; // Return the formatted string.
        }

        // Get the current date and time.
        var today = new Date();
        var yyyy = today.getFullYear();      // Full year (e.g., 2023)
        var mm   = today.getMonth() + 1;     // Month (0-11, so add 1)
        var dd   = today.getDate();          // Day of the month
        var hh   = today.getHours();         // Hours (0-23)
        var min  = today.getMinutes();       // Minutes (0-59)


        // --- Determine Save Directory ---
        // Initialize file object to null.
        var file = null;

        // Retrieve the configured directory preference.
        var dir = this.branch.getCharPref("directory");

        // Use a switch statement to handle different directory options.
        switch ( dir )
        {
            case "Profile": // User selected 'Profile' directory.
                file = this.Cc["@mozilla.org/file/directory_service;1"].getService(this.Ci.nsIProperties).get("ProfD", this.Ci.nsIFile);
                break; // Exit switch.

            case "Home": // User selected 'Home' directory.
                file = this.Cc["@mozilla.org/file/directory_service;1"].getService(this.Ci.nsIProperties).get("Home", this.Ci.nsIFile);
                break; // Exit switch.

            default: // A custom path was provided.
                file = this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
                file.initWithPath(dir); // Initialize with the custom path.
        }

        // Proceed only if a valid file object was created and the directory exists.
        if ( file && file.exists() )
        {
            // Append the filename to the directory path.
            // Filename format: opentabs-USERNAME-YYYYMMDD-HHMM.txt
            file.append(
                "opentabs-" +
                this.getUserName() +
                "-" +
                String( yyyy ) +
                prepare( mm ) +
                prepare( dd ) +
                "-" +
                prepare( hh ) +
                prepare( min ) +
                ".txt"
            );

            // Create a file output stream for writing data.
            var foStream = this.Cc["@mozilla.org/network/file-output-stream;1"].createInstance(this.Ci.nsIFileOutputStream);

            // Initialize the file stream:
            // 0x02: write mode
            // 0x08: create file if it doesn't exist
            // 0x20: truncate file if it exists (overwrite)
            // 0666: file permissions (read/write for owner, group, others)
            // 0: no special flags for conversion.
            foStream.init( foStream, 0x02 | 0x08 | 0x20, 0666, 0 );

            // Ensure content is written as Unicode (UTF-8).
            var converter = this.Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(this.Ci.nsIConverterOutputStream);
            converter.init( foStream, "UTF-8", 0, 0 );

            // Write all collected tab lines, joined by Windows-style newlines.
            converter.writeString( lines.join("\r\n") );

            // Close the converter stream, which also closes the file output stream.
            converter.close();
        }

        // Schedule the next saving operation, ensuring continuous monitoring.
        this.next();
    }, // End of 'save' function.

    // --- Scheduling the Next Run ---
    // This function schedules the next execution of the 'save' method.
    next: function()
    {
        // Store 'this' context to ensure it's available within the setTimeout callback.
        var that = this;

        // Use setTimeout to delay the next call to 'save'.
        setTimeout(
            function()
            {
                that.save(); // Execute the save function.
            },
            // Calculate delay: preference value (minutes) * 60 (seconds/min) * 1000 (ms/sec).
            this.branch.getIntPref("period") * 60 * 1000
        );
    }, // End of 'next' function.

    // --- Utility: Get User Name ---
    // Retrieves the current user's name or computer name for use in filenames.
    getUserName: function()
    {
        // Get the environment service to access system variables.
        var env = this.Cc["@mozilla.org/process/environment;1"].getService(this.Ci.nsIEnvironment);
        var user = ""; // Initialize user variable.

        // Try to get 'computername' first (common on Windows).
        if ( env.exists("computername") )
        {
            user = env.get('computername');
        }

        // If 'computername' wasn't found or was empty, try 'username'.
        if ( !user.length )
        {
            if ( env.exists("username") )
            {
                user = env.get('username');
            }
        }

        // If still no user name, try 'user' (common on Unix-like systems).
        if ( !user.length )
        {
            if ( env.exists("user") )
            {
                user = env.get('user');
            }
        }

        return user; // Return the determined user name (or empty string if none found).
    } // End of 'getUserName' function.

}; // End of savemytabs object definition.

// --- Event Listener for Window Load ---
// Attaches an event listener to the window 'load' event.
// When the window finishes loading, it calls the 'init' method of savemytabs.
// The 'false' argument indicates event bubbling (not capturing).
window.addEventListener( "load", function() { savemytabs.init(); }, false );