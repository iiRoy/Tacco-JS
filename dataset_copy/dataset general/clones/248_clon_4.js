let jsonpGlobalCounter = 0;
const performJsonpRequest = (targetUrl, callbackParameter = 'callback') => {
    return new Promise((resolve, reject) => {
        const callbackFunctionName = `_jsonpResponse_${jsonpGlobalCounter++}_${Date.now()}`;
        const scriptElement = document.createElement('script');
        
        window[callbackFunctionName] = (responseData) => {
            resolve(responseData);
            document.head.removeChild(scriptElement);
            delete window[callbackFunctionName];
        };

        scriptElement.onerror = () => {
            reject(new Error(`JSONP request to ${targetUrl} failed or timed out.`));
            document.head.removeChild(scriptElement);
            delete window[callbackFunctionName];
        };

        const urlSeparator = targetUrl.includes('?') ? '&' : '?';
        scriptElement.src = `${targetUrl}${urlSeparator}${callbackParameter}=${callbackFunctionName}`;
        document.head.appendChild(scriptElement);
    });
};

const createSimpleTemplateRenderer = () => {
    const substituteVariables = (templateString, dataContext) => {
        return templateString.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, keyPath) => {
            const keys = keyPath.split('.');
            let value = dataContext;
            for (const key of keys) {
                if (value === null || typeof value === 'undefined') return '';
                value = value[key];
            }
            return (value !== null && typeof value !== 'undefined') ? String(value) : '';
        });
    };

    return (templateMarkup, data, options = {}) => {
        if (!templateMarkup || typeof templateMarkup !== 'string') {
            throw new Error('Template markup must be a non-empty string.');
        }

        if (Array.isArray(data)) {
            const startIdx = options.start || 0;
            const endIdx = options.end || data.length;
            const slicedData = data.slice(startIdx, endIdx);
            return slicedData.map(item => substituteVariables(templateMarkup, item)).join('');
        } else if (typeof data === 'object' && data !== null) {
            return substituteVariables(templateMarkup, data);
        } else {
            return '';
        }
    };
};
const renderHtmlSnippet = createSimpleTemplateRenderer();

const deepFlattenObject = (targetObj, traversePrototypes = false, outputObj = {}, keyPrefix = "") => {
    for (const key in targetObj) {
        if (traversePrototypes || Object.prototype.hasOwnProperty.call(targetObj, key)) {
            const value = targetObj[key];
            if (value && typeof value === "object" && !(value instanceof Date || value instanceof RegExp)) {
                deepFlattenObject(value, traversePrototypes, outputObj, keyPrefix + key + "_");
            } else {
                outputObj[keyPrefix + key] = value;
            }
        }
    }
    return outputObj;
};

class SoundSmithError extends Error {
    constructor(message, originalResponse = null) {
        super(message);
        this.name = 'SoundSmithError';
        this.originalResponse = originalResponse;
    }
}

class ApiResponseHandler {
    constructor(rawData) {
        this.rawData = rawData;
        if (this.rawData && this.rawData.response && this.rawData.response.status && this.rawData.response.status.code !== 0) {
            throw new SoundSmithError(this.rawData.response.status.message, this.rawData);
        }
    }

    extractPayload() {
        return this.rawData.response;
    }
}

class ApiRequester {
    constructor(mainInstance, requestSpecificDetails = {}) {
        this.mainRef = mainInstance;
        this.requestDetails = requestSpecificDetails;
    }

    composeRequestUrl(endpointSegment) {
        const base = this.mainRef.apiSettings.apiBaseUrl;
        const version = this.mainRef.apiSettings.apiVersion;
        const format = this.mainRef.apiSettings.responseFormat;
        const key = this.mainRef.accessKey;

        let queryParams = new URLSearchParams();
        queryParams.append('format', format);
        queryParams.append('api_key', key);

        Object.entries(this.requestDetails).forEach(([paramKey, paramValue]) => {
            if (Array.isArray(paramValue)) {
                paramValue.forEach(item => queryParams.append(paramKey, item));
            } else if (typeof paramValue === 'object' && paramValue !== null) {
                 // For complex objects, URLSearchParams will stringify as [object Object].
                 // If the API expects specific serialization, this needs more logic.
                 // Assuming flat key-value pairs for now, as in original's usage.
                queryParams.append(paramKey, JSON.stringify(paramValue));
            } else {
                queryParams.append(paramKey, paramValue);
            }
        });

        const fullUrl = `${base}${version}/${endpointSegment}?${queryParams.toString()}`;
        return fullUrl;
    }

    async executeRequest(endpointSegment, successProcessor) {
        try {
            const url = this.composeRequestUrl(endpointSegment);
            const rawResponse = await performJsonpRequest(url);
            const processedResponse = new ApiResponseHandler(rawResponse);
            successProcessor(processedResponse);
        } catch (error) {
            if (error instanceof SoundSmithError) {
                throw error;
            } else {
                throw new SoundSmithError(`Failed to fetch data for ${endpointSegment}: ${error.message}`);
            }
        }
    }
}

class DataUnit {
    constructor(apiResponseData, identifier) {
        this.apiResponseData = apiResponseData;
        this.unitIdentifier = identifier;
    }

    get content() {
        return this.apiResponseData[this.unitIdentifier];
    }

    displayAsHtml(templateMarkup, options) {
        return renderHtmlSnippet(templateMarkup, this.content, options);
    }
}

class DataCollection extends DataUnit {
    constructor(apiResponseData, identifier) {
        super(apiResponseData, identifier);
        this.workingIndex = null;
    }

    get currentItems() {
        const dataArray = this.apiResponseData[this.unitIdentifier];
        if (this.workingIndex !== null && Number.isInteger(this.workingIndex) && dataArray && dataArray.length > this.workingIndex) {
            return [dataArray[this.workingIndex]];
        }
        return dataArray || [];
    }

    setWorkingItem(index) {
        this.workingIndex = Number.isInteger(index) ? index : null;
        return this;
    }

    get startOffset() {
        return parseInt(this.apiResponseData.start, 10);
    }

    get totalCount() {
        return parseInt(this.apiResponseData.total, 10);
    }

    get itemCount() {
        return this.currentItems.length;
    }

    selectItem(index) {
        return this.setWorkingItem(index);
    }

    displayAsHtml(templateMarkup, options) {
        if (this.itemCount < 1) {
            throw new SoundSmithError('Cannot render HTML for an empty collection.');
        }
        return renderHtmlSnippet(templateMarkup, this.currentItems, options);
    }
}

class AudioDataList extends DataCollection { constructor(data) { super(data, 'audio'); } }
class BlogDataList extends DataCollection { constructor(data) { super(data, 'blogs'); } }
class BiographyDataList extends DataCollection {
    constructor(data) {
        super(data, 'biographies');
        if (Array.isArray(this.apiResponseData[this.unitIdentifier])) {
            this.apiResponseData[this.unitIdentifier] = this.apiResponseData[this.unitIdentifier].map(item =>
                deepFlattenObject(item, false)
            );
        }
    }
}
class FamiliarityDatum extends DataUnit { constructor(data) { super(data, 'artist'); } }
class HotnessDatum extends DataUnit { constructor(data) { super(data, 'artist'); } }
class ImageDataList extends DataCollection { constructor(data) { super(data, 'images'); } }
class NewsDataList extends DataCollection { constructor(data) { super(data, 'news'); } }
class ProfileDatum extends DataUnit { constructor(data) { super(data, 'artist'); } }
class ReviewsDataList extends DataCollection { constructor(data) { super(data, 'reviews'); } }
class SearchResultsDataList extends DataCollection { constructor(data) { super(data, 'results'); } }
class SongsDataList extends DataCollection { constructor(data) { super(data, 'songs'); } }
class SimilarArtistsDataList extends DataCollection { constructor(data) { super(data, 'artists'); } }
class TermsDataList extends DataCollection { constructor(data) { super(data, 'terms'); } }
class TopHotnessDataList extends DataCollection { constructor(data) { super(data, 'artists'); } }
class TopTermsDataList extends DataCollection { constructor(data) { super(data, 'terms'); } }
class UrlsDataList extends DataCollection { constructor(data) { super(data, 'urls'); } }
class VideoDataList extends DataCollection { constructor(data) { super(data, 'video'); } }

class Muse {
    constructor(monikerValue, soundSmithInstance) {
        this.moniker = monikerValue;
        this.soundSmithRef = soundSmithInstance;
        this.apiEndpointRoot = 'artist/';
    }

    async _fetchArtistData(segment, callback, options = {}, ResultClass) {
        const requester = new ApiRequester(this.soundSmithRef, { ...options, name: this.moniker });
        await requester.executeRequest(this.apiEndpointRoot + segment, (responseHandler) => {
            callback(new ResultClass(responseHandler.extractPayload()));
        });
    }

    getAudio(callback, options) { return this._fetchArtistData('audio', callback, options, AudioDataList); }
    getBiographies(callback, options) { return this._fetchArtistData('biographies', callback, options, BiographyDataList); }
    getBlogs(callback, options) { return this._fetchArtistData('blogs', callback, options, BlogDataList); }
    getFamiliarity(callback, options) { return this._fetchArtistData('familiarity', callback, options, FamiliarityDatum); }
    getHotness(callback, options) { return this._fetchArtistData('hotttnesss', callback, options, HotnessDatum); }
    getImages(callback, options) { return this._fetchArtistData('images', callback, options, ImageDataList); }
    getNews(callback, options) { return this._fetchArtistData('news', callback, options, NewsDataList); }
    getProfile(callback, options) { return this._fetchArtistData('profile', callback, options, ProfileDatum); }
    getReviews(callback, options) { return this._fetchArtistData('reviews', callback, options, ReviewsDataList); }
    getSearchResults(callback, options) { return this._fetchArtistData('search', callback, options, SearchResultsDataList); }
    getSongs(callback, options) { return this._fetchArtistData('songs', callback, options, SongsDataList); }
    getSimilarArtists(callback, options) { return this._fetchArtistData('similar', callback, options, SimilarArtistsDataList); }
    getTerms(callback, options) { return this._fetchArtistData('terms', callback, options, TermsDataList); }
    getTopHotness(callback, options) { return this._fetchArtistData('top_hottt', callback, options, TopHotnessDataList); }
    getTopTerms(callback, options) { return this._fetchArtistData('top_terms', callback, options, TopTermsDataList); }
    getUrls(callback, options) { return this._fetchArtistData('urls', callback, options, UrlsDataList); }
    getVideos(callback, options) { return this._fetchArtistData('video', callback, options, VideoDataList); }
}

class SoundSmith {
    constructor(accessKey, config = {}) {
        if (!accessKey) {
            throw new SoundSmithError('An access key is required to use the API!');
        }

        this.accessKey = accessKey;
        
        this.apiSettings = {
            apiBaseUrl: "http://developer.echonest.com/api/",
            apiVersion: 'v4',
            responseFormat: 'jsonp'
        };

        this.userOptions = {};
        Object.assign(this.userOptions, config);
    }

    muse(moniker) {
        return new Muse(moniker, this);
    }
}