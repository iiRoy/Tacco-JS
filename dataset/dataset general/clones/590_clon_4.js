class MusicFeedGenerator {
    constructor(targetElement, widgetConfig) {
        this.hostElement = targetElement;
        this.currentConfig = { ...MusicFeedGenerator.initialSettings, ...widgetConfig };
        this.baseSettings = MusicFeedGenerator.initialSettings;
        this.widgetName = "MusicFeedDisplay";
        this.refreshTimer = null;
        this.initialize();
    }

    static initialSettings = {
        apiKey: '',
        username: '',
        fetch: 5,
        contentType: 'recentTracks',
        artSize: 'medium',
        cssTooltips: true,
        cssThemeClass: null,
        _blankLinks: true,
        refreshResults: true,
        refreshResultsInterval: 600000,
        noAlbumArtImg: 'http://placehold.it/250x250&text=No Art',
        noResults: 'Sorry, nothing was found...',
        onEntriesRetrieved: () => {},
        onStructureRendered: () => {}
    };

    initialize() {
        if (!this.verifyConfiguration(this.currentConfig)) {
            return;
        }
        this.retrieveMediaEntries(this.hostElement, this.currentConfig);

        if (this.currentConfig.refreshResults) {
            const interval = Math.max(this.currentConfig.refreshResultsInterval, 10000);
            this.refreshTimer = setInterval(() => {
                this.clearPreviousOutput();
                this.retrieveMediaEntries(this.hostElement, this.currentConfig);
            }, interval);
        }
    }

    verifyConfiguration(widgetConfig) {
        if (!widgetConfig.apiKey) {
            this.logDiagnostic("API key is missing. Please provide a valid Last.fm API key.");
            return false;
        }
        if (!widgetConfig.username) {
            this.logDiagnostic("Username is missing. Please provide a valid Last.fm username.");
            return false;
        }
        return true;
    }

    composePrimaryApiUrl(widgetConfig) {
        return `http://ws.audioscrobbler.com/2.0/?method=user.get${widgetConfig.contentType}&user=${widgetConfig.username}&api_key=${widgetConfig.apiKey}&limit=${widgetConfig.fetch}&format=json`;
    }

    composeSupplementaryApiUrl(entryType, widgetConfig, identifier) {
        return `http://ws.audioscrobbler.com/2.0/?method=${entryType}.getinfo&api_key=${widgetConfig.apiKey}&mbid=${identifier}&format=json`;
    }

    async makeApiRequest(url) {
        try {
            const feedback = await fetch(url);
            if (!feedback.ok) {
                throw new Error(`HTTP error! Status: ${feedback.status}`);
            }
            return await feedback.json();
        } catch (mistake) {
            this.logDiagnostic(`API request failed: ${mistake.message}`);
            return null;
        }
    }

    async retrieveMediaEntries(hostElement, widgetConfig) {
        const instanceRef = this;
        const mediaTypeMap = {
            'recentTracks': 'track',
            'lovedTracks': 'track',
            'topAlbums': 'album',
            'topTracks': 'track',
            'topArtists': 'artist',
            'weeklyAlbumChart': 'album',
            'weeklyArtistChart': 'artist',
            'weeklyTrackChart': 'track'
        };

        const processedEntries = [];
        const shortMediaTypeKey = mediaTypeMap[widgetConfig.contentType];
        const mediaSourceType = widgetConfig.contentType.toLowerCase();
        const mainApiEndpoint = this.composePrimaryApiUrl(widgetConfig);

        const apiResponse = await this.makeApiRequest(mainApiEndpoint);

        if (!apiResponse) {
            processedEntries.push('dataRetrievalFailure');
        } else {
            const responseContainer = apiResponse[mediaSourceType];
            if (responseContainer && responseContainer.total === "0") {
                processedEntries.push('dataRetrievalFailure');
            } else {
                const rawEntryData = responseContainer[shortMediaTypeKey];

                let dynamicBreakIndex = rawEntryData.length - 1;
                const finalProcessedItems = [];

                for (let i = 0; i < rawEntryData.length; i++) {
                    const entry = rawEntryData[i];
                    const transformed = await instanceRef.transformRawEntry(widgetConfig, entry);
                    if (transformed) {
                        finalProcessedItems.push(transformed);
                        if (transformed.entryIsCurrentlyPlaying) {
                            dynamicBreakIndex--;
                        }
                    }
                    if (i === dynamicBreakIndex) {
                        break;
                    }
                }
                processedEntries.push(...finalProcessedItems);
            }
        }

        if (typeof widgetConfig.onEntriesRetrieved === 'function') {
            widgetConfig.onEntriesRetrieved.call(this.hostElement);
        }

        this.renderOutputStructure(processedEntries, hostElement, widgetConfig);
    }

    async transformRawEntry(widgetConfig, rawItem) {
        const processed = {};
        processed.fullItem = rawItem;
        processed.entryLink = rawItem.url;
        processed.entryMbid = rawItem.mbid;
        processed.entryIsCurrentlyPlaying = null;
        processed.entryPlayCount = null;
        processed.entryAlbum = null;
        processed.entryImage = null;
        processed.entryTitle = null;

        switch (widgetConfig.contentType) {
            case 'recentTracks':
                if (rawItem['@attr']) {
                    processed.entryIsCurrentlyPlaying = rawItem['@attr']['nowplaying'];
                }
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist['#text']}`;
                processed.entryAlbum = rawItem.album;
                processed.entryImage = rawItem.image;
                break;
            case 'lovedTracks':
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist.name}`;
                processed.entryAlbum = rawItem.album;
                processed.entryImage = rawItem.image;
                break;
            case 'topAlbums':
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist.name}`;
                processed.entryPlayCount = rawItem.playcount;
                processed.entryImage = rawItem.image;
                break;
            case 'topTracks':
                processed.entryPlayCount = rawItem.playcount;
                processed.entryImage = rawItem.image;
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist.name}`;
                break;
            case 'topArtists':
                processed.entryImage = rawItem.image;
                processed.entryTitle = rawItem.name;
                processed.entryPlayCount = rawItem.playcount;
                break;
            case 'weeklyAlbumChart':
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist['#text']}`;
                processed.entryPlayCount = rawItem.playcount;
                if (processed.entryMbid) {
                    const albumInfoRequest = this.composeSupplementaryApiUrl('album', widgetConfig, processed.entryMbid);
                    const albumResponse = await this.makeApiRequest(albumInfoRequest);
                    if (albumResponse && albumResponse.album) {
                        processed.entryImage = albumResponse.album.image;
                    }
                }
                break;
            case 'weeklyArtistChart':
                processed.entryPlayCount = rawItem.playcount;
                if (processed.entryMbid) {
                    const artistInfoRequest = this.composeSupplementaryApiUrl('artist', widgetConfig, processed.entryMbid);
                    const artistResponse = await this.makeApiRequest(artistInfoRequest);
                    if (artistResponse && artistResponse.artist) {
                        processed.entryImage = artistResponse.artist.image;
                    }
                }
                processed.entryTitle = rawItem.name;
                break;
            case 'weeklyTrackChart':
                processed.entryImage = rawItem.image;
                processed.entryTitle = `'${rawItem.name}' by ${rawItem.artist['#text']}`;
                processed.entryPlayCount = rawItem.playcount;
                break;
            default:
                // No specific handling for default
        }
        return processed;
    }

    clearPreviousOutput() {
        const existingContainer = this.hostElement.querySelector('.feedContainerElement');
        if (existingContainer) {
            existingContainer.remove();
        }
    }

    renderOutputStructure(processedEntries, hostElement, widgetConfig) {
        this.clearPreviousOutput();

        const feedContainerElement = document.createElement('ul');
        feedContainerElement.classList.add('feedContainerElement');
        if (widgetConfig.cssThemeClass) {
            feedContainerElement.classList.add(widgetConfig.cssThemeClass);
        }
        feedContainerElement.classList.add(`feedSizeClass_${widgetConfig.artSize}`);

        if (processedEntries.includes('dataRetrievalFailure') || processedEntries.length === 0) {
            feedContainerElement.classList.add('dataRetrievalFailure');
            const listItem = document.createElement('li');
            listItem.textContent = widgetConfig.noResults;
            feedContainerElement.appendChild(listItem);
        } else {
            processedEntries.forEach((singleEntry, index) => {
                let displayImageUrl = widgetConfig.noAlbumArtImg;

                if (singleEntry.entryImage) {
                    if (singleEntry.entryImage[4]) {
                        displayImageUrl = singleEntry.entryImage[4]['#text'];
                    } else if (singleEntry.entryImage[3]) {
                        displayImageUrl = singleEntry.entryImage[3]['#text'];
                    } else if (singleEntry.entryImage[2]) {
                        displayImageUrl = singleEntry.entryImage[2]['#text'];
                    } else if (singleEntry.entryImage[1]) {
                        displayImageUrl = singleEntry.entryImage[1]['#text'];
                    } else {
                        displayImageUrl = widgetConfig.noAlbumArtImg;
                    }
                }

                const tooltipText = singleEntry.entryTitle
                    ? `${singleEntry.entryTitle}${singleEntry.entryPlayCount ? ` (${singleEntry.entryPlayCount} plays)` : ''}`
                    : '';

                const listItemContent = `
                    <a href="${singleEntry.entryLink}"
                        ${(widgetConfig.cssTooltips && singleEntry.entryTitle) ? `data-tip="${tooltipText}"` : ''}
                        class="entryCase${singleEntry.entryIsCurrentlyPlaying ? ' currentPlayStatus' : ''}"
                        ${widgetConfig._blankLinks ? ' target="_blank"' : ''}>
                        <div class="overlay"></div>
                        <div class="cover"><img src="${displayImageUrl}"/></div>
                        <div class="vinyl"></div>
                    </a>
                `;

                const listItem = document.createElement('li');
                listItem.style.zIndex = (500 - index);
                listItem.innerHTML = listItemContent;
                feedContainerElement.appendChild(listItem);
            });
        }

        hostElement.appendChild(feedContainerElement);

        if (typeof widgetConfig.onStructureRendered === 'function') {
            widgetConfig.onStructureRendered.call(this.hostElement);
        }
    }

    logDiagnostic(issue) {
        if (typeof console === 'object') {
            console.warn(`[${this.widgetName}] ${issue}`);
        }
    }

    haltRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
}

function activateMusicFeedDisplay(selectorOrElement, configuration = {}) {
    const targetNodes = typeof selectorOrElement === 'string'
        ? document.querySelectorAll(selectorOrElement)
        : [selectorOrElement];

    targetNodes.forEach(function(currentDomElement) {
        if (!currentDomElement._musicFeedInstance_V4) {
            currentDomElement._musicFeedInstance_V4 = new MusicFeedGenerator(currentDomElement, configuration);
        }
    });

    return targetNodes.length === 1 ? targetNodes[0] : targetNodes;
}