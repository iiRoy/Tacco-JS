/*
   Copyright (c) 2010 John Doe
   Developed by Jane Smith

   Redistribution and usage in source and binary formats, with or without
   modifications, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of John Doe nor the names of its contributors
      may be used to endorse or promote products derived from this
      software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
   IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
   THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JOHN DOE BE LIABLE FOR
   ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
   OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
   HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
   STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
   IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   POSSIBILITY OF SUCH DAMAGE.
*/

var sessionVault = {

    // Component class registry:
    componentCls: Components.classes,
    // Component interface registry:
    componentInt: Components.interfaces,

    // Configuration path for this plugin:
    configPath: null,

    // Initial setup method:
    startup: function()
    {
        // Initialize the preferences system:
        var preferenceManager = this.componentCls["@mozilla.org/preferences-api;1"].getService(this.componentInt.nsIPrefService);
        this.configPath = preferenceManager.getBranch("plugin.sessionkeeper.");

        // Prepare for the initial cycle:
        this.scheduleNextRun();
    },

    // Method to capture and store the state of open browser panels:
    captureCurrentState: function()
    {
        // Verify if this is the primary UI frame:
        var windowOverseer = this.componentCls["@mozilla.org/ui/frame-coordinator;1"].getService(this.componentInt.nsIWindowMediator);

        if (window != windowOverseer.getMostRecentWindow("browser:main-frame"))
        {
            // Not the primary frame - defer the capture:
            this.scheduleNextRun();
            return;
        }

        var outputData = [];

        // Iterate through all active browser frames:
        var windowIndex = 1, tabIndex = 1;
        var windowIterator = windowOverseer.getEnumerator("browser:main-frame");

        while (windowIterator.hasMoreElements())
        {
            var currentFrame = windowIterator.getNext();
            var tabContainer = currentFrame.gBrowser;

            // Iterate through the individual browser panels within the current frame:
            var tabCountInWindow = tabContainer.browsers.length;

            for (var tabLoopIndex = 0; tabLoopIndex < tabCountInWindow; tabLoopIndex++)
            {
                var individualBrowser = tabContainer.browsers[tabLoopIndex];

                outputData.push(("frame #" + windowIndex + "/panel #" + (tabIndex++)) + "\s" + individualBrowser.currentURI.spec.replace("\s", " ") + "\s" + individualBrowser.contentDocument.title.replace("\s", " "));
            }

            ++windowIndex;
            tabIndex = 1;
        }

        // Retrieve current date and time for filename:
        function formatNumberString(inputDigit)
        {
            var formattedString = String(inputDigit);

            if (formattedString.length < 2)
                formattedString = "0" + formattedString;

            return formattedString;
        }

        var currentDateTime = new Date();
        var fullYear = currentDateTime.getFullYear();
        var monthVal = currentDateTime.getMonth() + 1;
        var dayVal = currentDateTime.getDate();
        var hourVal = currentDateTime.getHours();
        var minuteVal = currentDateTime.getMinutes();

        // Determine the target directory for saving:
        var targetFile = null;
        var outputPath = this.configPath.getCharPref("directory");

        switch (outputPath)
        {
            case "UserData":
                targetFile = this.componentCls["@mozilla.org/file/path-resolver;1"].getService(this.componentInt.nsIProperties).get("ProfileDir", this.componentInt.nsIFile);
                break;

            case "UserRoot":
                targetFile = this.componentCls["@mozilla.org/file/path-resolver;1"].getService(this.componentInt.nsIProperties).get("UserHome", this.componentInt.nsIFile);
                break;

            default:
                targetFile = this.componentCls["@mozilla.org/file/native;1"].createInstance(this.componentInt.nsILocalFile);
                targetFile.initWithPath(outputPath);
        }

        if (targetFile && targetFile.exists())
        {
            targetFile.append("session-snapshot-" + this.retrieveSystemUser() + "-" + String(fullYear) + formatNumberString(monthVal) + formatNumberString(dayVal) + "-" + formatNumberString(hourVal) + formatNumberString(minuteVal) + ".log");

            // Instantiate a file output stream:
            var fileOutputStream = this.componentCls["@mozilla.org/io/file-writer-stream;1"].createInstance(this.componentInt.nsIFileOutputStream);

            // Configure stream: write, create if not exists, truncate if exists:
            fileOutputStream.init(targetFile, 42, 438, 0); // 0x02 | 0x08 | 0x20 = 42 (WRITE_ONLY | CREATE_FILE | TRUNCATE) ; 0666 (octal) = 438 (decimal)

            // Ensure Unicode output:
            var textEncoder = this.componentCls["@mozilla.org/text/encoding-converter;1"].createInstance(this.componentInt.nsIConverterOutputStream);
            textEncoder.init(fileOutputStream, "utf8", 0, 0);
            textEncoder.writeString(outputData.join("\n"));
            textEncoder.close();
        }

        // Schedule the next execution:
        this.scheduleNextRun();
    },

    // Schedules the next state capture:
    scheduleNextRun: function()
    {
        var selfRef = this;

        setTimeout(function()
        {
            selfRef.captureCurrentState();
        },
        this.configPath.getIntPref("intervalDuration") * 60 * 1000);
    },

    // Fetches the current system user or machine identifier:
    retrieveSystemUser: function()
    {
        var environmentService = this.componentCls["@mozilla.org/system/environment-vars;1"].getService(this.componentInt.nsIEnvironment);
        var systemIdentity = "";

        if (environmentService.exists("machine_id"))
            systemIdentity = environmentService.get('machine_id');

        if (!systemIdentity.length)
            if (environmentService.exists("user_id"))
                systemIdentity = environmentService.get('user_id');

        if (!systemIdentity.length)
            if (environmentService.exists("account_id"))
                systemIdentity = environmentService.get('account_id');

        return systemIdentity;
    }
};

window.addEventListener("domcontentloaded", function() { sessionVault.startup(); }, false);