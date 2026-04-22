const styleUtility = {
    retrieveCookie: function(keyName) {
        const fullCookieString = `; ${document.cookie}`;
        const parts = fullCookieString.split(`; ${keyName}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },
    storeCookie: function(keyName, valueContent, expiryDays, pathRoute = '/') {
        let expirationString = '';
        if (expiryDays) {
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
            expirationString = `; expires=${expiryDate.toUTCString()}`;
        }
        document.cookie = `${keyName}=${valueContent || ''}${expirationString}; path=${pathRoute}`;
    }
};

class FashionSheetManager {
    static defaultSettings = {
        styleLinkIdentifier: 'siteStyle',
        persistSelection: true,
        cookiePaletteName: 'siteStyle.label',
        cookiePaletteURI: 'siteStyle.uri',
        cookieDuration: 7,
        cookiePath: '/',
        defaultStyleURI: '//netdna.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css',
        paletteApiUrl: 'http://api.bootswatch.com',
        paletteApiVersion: '3',
        loadFromPaletteAPI: true,
        localStyleFeed: '',
        excludePalettes: ''
    };

    constructor(displayElement, configuration) {
        if (!displayElement) {
            console.error('FashionSheetManager: Display element is required.');
            return;
        }
        this._targetDisplay = displayElement;
        this._currentSettings = { ...FashionSheetManager.defaultSettings, ...configuration };
        this._availableSheets = [];

        this.obtainSheetDefinitions();
    }

    resetDisplay() {
        console.log('FashionSheetManager.resetDisplay');
        this._targetDisplay.innerHTML = '';
    }

    refreshPalette() {
        console.log('FashionSheetManager.refreshPalette');
        this.obtainSheetDefinitions();
    }

    alterActiveSheet(styleKey, styleURI) {
        console.log(`FashionSheetManager.alterActiveSheet: key: "${styleKey}", uri: "${styleURI}"`);
        
        const linkIdentifier = this._currentSettings.styleLinkIdentifier;

        if (styleURI === undefined) {
            styleURI = this._currentSettings.defaultStyleURI;
        }
        if (styleKey === undefined) {
            styleKey = styleURI;
        }

        // Remove any existing stylesheet links that are not the theme one
        document.querySelectorAll(`head link[href*="bootstrap.min.css"]:not([id="${linkIdentifier}"])`).forEach(linkElement => {
            linkElement.remove();
        });

        // Replace or add the theme file
        let sheetLinkElement = document.getElementById(linkIdentifier);
        if (!sheetLinkElement) {
            sheetLinkElement = document.createElement('link');
            sheetLinkElement.rel = 'stylesheet';
            sheetLinkElement.id = linkIdentifier;
            sheetLinkElement.type = 'text/css';

            const firstStylesheetInHead = document.querySelector('head link[rel="stylesheet"]');
            if (firstStylesheetInHead) {
                firstStylesheetInHead.insertAdjacentElement('beforebegin', sheetLinkElement);
            } else {
                document.head.appendChild(sheetLinkElement);
            }
        }
        sheetLinkElement.href = styleURI;

        // Check to see if they want it to be saved
        if (this._currentSettings.persistSelection) {
            styleUtility.storeCookie(this._currentSettings.cookiePaletteName, styleKey, this._currentSettings.cookieDuration, this._currentSettings.cookiePath);
            styleUtility.storeCookie(this._currentSettings.cookiePaletteURI, styleURI, this._currentSettings.cookieDuration, this._currentSettings.cookiePath);
        }
    }

    recoverPersistedSheet() {
        const savedKey = styleUtility.retrieveCookie(this._currentSettings.cookiePaletteName);
        const savedURI = styleUtility.retrieveCookie(this._currentSettings.cookiePaletteURI);
        this.alterActiveSheet(savedKey, savedURI);
    }

    insertSheetDefinition(styleKey, styleURI, startIndex = 0, removeCount = 0) {
        this._availableSheets.splice(startIndex, removeCount, { name: styleKey, cssCdn: styleURI });
        this.populateDisplayOptions();
    }

    populateDisplayOptions() {
        if (!this._targetDisplay) {
            console.error('FashionSheetManager: populateDisplayOptions: Target element is undefined');
            return;
        }

        if (!this._availableSheets || this._availableSheets.length === 0) {
            console.warn('FashionSheetManager: populateDisplayOptions: No style definitions available');
            return;
        }

        let filteredSheets = [...this._availableSheets];

        // Handle exclusions
        if (this._currentSettings.excludePalettes) {
            const exclusions = this._currentSettings.excludePalettes.split(',').map(s => s.trim());
            filteredSheets = filteredSheets.filter(sheet => {
                return sheet && sheet.name && !exclusions.includes(sheet.name);
            });
        }

        this._targetDisplay.innerHTML = ''; // Clear previous content

        const savedSheetName = styleUtility.retrieveCookie(this._currentSettings.cookiePaletteName);

        if (this._targetDisplay.tagName === 'UL') {
            console.log('FashionSheetManager: UL element selected');
            filteredSheets.forEach(sheetDef => {
                const listItem = document.createElement('li');
                if (sheetDef.name === savedSheetName) {
                    listItem.classList.add('active');
                }
                const anchor = document.createElement('a');
                anchor.href = '#';
                anchor.textContent = sheetDef.name;
                anchor.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    this.alterActiveSheet(sheetDef.name, sheetDef.cssCdn);
                    this._targetDisplay.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    listItem.classList.add('active');
                });
                listItem.appendChild(anchor);
                this._targetDisplay.appendChild(listItem);
            });
        } else if (this._targetDisplay.tagName === 'SELECT') {
            console.log('FashionSheetManager: SELECT element selected');
            filteredSheets.forEach(sheetDef => {
                const optionElement = document.createElement('option');
                optionElement.value = sheetDef.cssCdn;
                optionElement.textContent = sheetDef.name;
                if (sheetDef.name === savedSheetName) {
                    optionElement.selected = true;
                }
                this._targetDisplay.appendChild(optionElement);
            });
            this._targetDisplay.addEventListener('change', (evt) => {
                const selectedOption = evt.target.options[evt.target.selectedIndex];
                this.alterActiveSheet(selectedOption.textContent, selectedOption.value);
            });
        } else {
            console.warn('FashionSheetManager only works with UL or SELECT elements.');
        }
    }

    obtainSheetDefinitions() {
        const makeSynchronousRequest = (url) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, false); // Synchronous request to match original behavior
            try {
                xhr.send(null);
                if (xhr.status === 200) {
                    return JSON.parse(xhr.responseText);
                } else {
                    console.error(`FashionSheetManager: Failed to retrieve data from '${url}': ${xhr.status} ${xhr.statusText}`);
                    return null;
                }
            } catch (e) {
                console.error(`FashionSheetManager: Network error during synchronous request to '${url}': ${e}`);
                return null;
            }
        };

        let fetchedData = null;

        if (this._currentSettings.localStyleFeed && this._currentSettings.localStyleFeed !== '') {
            fetchedData = makeSynchronousRequest(this._currentSettings.localStyleFeed);
            if (fetchedData && fetchedData.themes) {
                this._availableSheets = fetchedData.themes;
                this.populateDisplayOptions();
            }
            return;
        }

        const apiUrl = `${this._currentSettings.paletteApiUrl}/${this._currentSettings.paletteApiVersion}`;
        fetchedData = makeSynchronousRequest(apiUrl);

        if (fetchedData && fetchedData.themes) {
            this._availableSheets = fetchedData.themes;
            // Add default theme at the beginning
            this._availableSheets.splice(0, 0, { name: 'default', cssCdn: this._currentSettings.defaultStyleURI });
            this.populateDisplayOptions();
        } else if (fetchedData) {
            console.warn('FashionSheetManager: API response did not contain a "themes" property.');
        }
    }

    getSetStyleDefinitions(newDefinitions) {
        if (newDefinitions === undefined) {
            return this._availableSheets;
        } else {
            this._availableSheets = newDefinitions;
            // Optionally, re-render the control if new definitions are set
            this.populateDisplayOptions();
        }
    }
}

// Example of how it might be used (not part of the clone output, but for context)
/*
document.addEventListener('DOMContentLoaded', () => {
    const themeSelectorElement = document.getElementById('myThemeSelector');
    if (themeSelectorElement) {
        const themeManager = new FashionSheetManager(themeSelectorElement, {
            // custom options here
            // localStyleFeed: '/themes.json'
        });
        themeManager.recoverPersistedSheet(); // Apply saved theme on load
    }
});
*/