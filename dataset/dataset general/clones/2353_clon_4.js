class SessionArchiver {
    constructor() {
        this.componentMap = Components.classes;
        this.interfaceMap = Components.interfaces;
        this.configurationHandle = null;
        this.intervalHandle = null;
    }

    _getService(classID, interfaceID) {
        return this.componentMap[classID].getService(this.interfaceMap[interfaceID]);
    }

    _createInstance(classID, interfaceID) {
        return this.componentMap[classID].createInstance(this.interfaceMap[interfaceID]);
    }

    commenceOperation() {
        const prefServiceAccessor = this._getService(
            "@mozilla.org/preferences-service;1",
            "nsIPrefService"
        );
        this.configurationHandle = prefServiceAccessor.getBranch("extensions.savemytabs.");
        this.initiateCycle();
    }

    captureSessionSnapshot() {
        const windowOverseer = this._getService(
            "@mozilla.org/appshell/window-mediator;1",
            "nsIWindowMediator"
        );

        if (window !== windowOverseer.getMostRecentWindow("navigator:browser")) {
            this.initiateCycle();
            return;
        }

        const dataEntries = [];
        const windowIterator = windowOverseer.getEnumerator("navigator:browser");
        let currentWindowCount = 0;

        while (windowIterator.hasMoreElements()) {
            currentWindowCount++;
            const currentBrowserWindow = windowIterator.getNext();
            const tabManagementUnit = currentBrowserWindow.gBrowser;

            Array.from(tabManagementUnit.browsers).forEach((aTab, tabPosition) => {
                const tabURL = aTab.currentURI.spec.replace(/\t/g, " ");
                const tabTitle = aTab.contentDocument.title.replace(/\t/g, " ");
                dataEntries.push(`window #${currentWindowCount}/tab #${tabPosition + 1}\t${tabURL}\t${tabTitle}`);
            });
        }

        const padSingleDigit = (num) => String(num).padStart(2, '0');

        const currentMoment = new Date();
        const yearVal = currentMoment.getFullYear();
        const monthVal = padSingleDigit(currentMoment.getMonth() + 1);
        const dayVal = padSingleDigit(currentMoment.getDate());
        const hourVal = padSingleDigit(currentMoment.getHours());
        const minuteVal = padSingleDigit(currentMoment.getMinutes());

        const outputIdentifier = this.retrieveSystemDesignation();
        const outputFilename = `session-snapshot-${outputIdentifier}-${yearVal}${monthVal}${dayVal}-${hourVal}${minuteVal}.txt`;

        let targetPath = null;
        const preferencePath = this.configurationHandle.getCharPref("directory");

        const directoryService = this._getService(
            "@mozilla.org/file/directory_service;1",
            "nsIProperties"
        );

        switch (preferencePath) {
            case "Profile":
                targetPath = directoryService.get("ProfD", this.interfaceMap.nsIFile);
                break;
            case "Home":
                targetPath = directoryService.get("Home", this.interfaceMap.nsIFile);
                break;
            default:
                targetPath = this._createInstance(
                    "@mozilla.org/file/local;1",
                    "nsILocalFile"
                );
                targetPath.initWithPath(preferencePath);
        }

        if (targetPath && targetPath.exists()) {
            targetPath.append(outputFilename);

            const fileOutputPipe = this._createInstance(
                "@mozilla.org/network/file-output-stream;1",
                "nsIFileOutputStream"
            );
            fileOutputPipe.init(targetPath, 0x02 | 0x08 | 0x20, 0o666, 0);

            const streamConverter = this._createInstance(
                "@mozilla.org/intl/converter-output-stream;1",
                "nsIConverterOutputStream"
            );
            streamConverter.init(fileOutputPipe, "UTF-8", 0, 0);
            streamConverter.writeString(dataEntries.join("\r\n"));
            streamConverter.close();
        }

        this.initiateCycle();
    }

    initiateCycle() {
        if (this.intervalHandle) {
            clearTimeout(this.intervalHandle);
        }
        const delayMinutes = this.configurationHandle.getIntPref("period");
        const delayMilliseconds = delayMinutes * 60 * 1000;

        this.intervalHandle = setTimeout(() => this.captureSessionSnapshot(), delayMilliseconds);
    }

    retrieveSystemDesignation() {
        const environmentQuery = this._getService(
            "@mozilla.org/process/environment;1",
            "nsIEnvironment"
        );
        let systemDesignation = "";

        if (environmentQuery.exists("computername")) {
            systemDesignation = environmentQuery.get('computername');
        } else if (environmentQuery.exists("username")) {
            systemDesignation = environmentQuery.get('username');
        } else if (environmentQuery.exists("user")) {
            systemDesignation = environmentQuery.get('user');
        }

        return systemDesignation;
    }
}

window.addEventListener("load", () => {
    const mainArchiver = new SessionArchiver();
    mainArchiver.commenceOperation();
}, false);