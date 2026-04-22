const GLOB_TUMBLR_HOST = "staff.tumblr.com"; // Placeholder: Replace with your actual Tumblr hostname
const GLOB_TUMBLR_SECRET_KEY = "your_api_key_here"; // Placeholder: Replace with your actual API key

// Utility functions (replacing $.views.helpers and their internal logic)
const AuxiliaryOperations = {
    obtainHostName: function() {
        return GLOB_TUMBLR_HOST;
    },

    colorizeAudioPlayer: function(dataEntry, tintShade) {
        let audioMarkup = dataEntry.player;
        if (tintShade !== null) {
            let colorPattern = /color=FFFFFF/g;
            let processedShade = String(tintShade).startsWith("#") ? String(tintShade).substring(1) : String(tintShade);
            return audioMarkup.replace(colorPattern, "color=" + processedShade);
        } else {
            return audioMarkup;
        }
    },

    selectImageSource: function(dataEntry, requiredWidth) {
        let availableImages = dataEntry.alt_sizes;
        let selectedSource = "";
        for (let idx = 0; idx < availableImages.length; idx++) {
            if (availableImages[idx].width >= requiredWidth) {
                selectedSource = availableImages[idx].url;
                break;
            }
        }
        return (selectedSource === "") ? availableImages[0].url : selectedSource;
    },

    determineImageOrientation: function(dataEntry) {
        let imageDimensions = dataEntry.original_size;
        if (imageDimensions.width > imageDimensions.height) {
            return "landscape";
        } else if (imageDimensions.width < imageDimensions.height) {
            return "portrait";
        } else {
            return "square";
        }
    },

    extractVideoElement: function(dataEntry, requiredWidth) {
        let availablePlayers = dataEntry.player;
        let videoContent = "";
        for (let idx = 0; idx < availablePlayers.length; idx++) {
            if (availablePlayers[idx].width <= requiredWidth) {
                videoContent = availablePlayers[idx].embed_code;
                break;
            }
        }
        return (videoContent === "") ? availablePlayers[0].embed_code : videoContent;
    }
};

// Simple templating function (replacing JsRender with a custom, regex-based parser)
function renderContentBlock(templateMarkup, dataPayload, helperCollection) {
    let output = templateMarkup;

    // Replace direct properties: {{propertyName}}
    output = output.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, propName) => {
        return dataPayload[propName] !== undefined ? dataPayload[propName] : '';
    });

    // Replace helper calls: {{#helperName(arg1, 'arg2', dataProperty)}}
    output = output.replace(/\{\{#([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)\}\}/g, (match, helperName, argsString) => {
        if (typeof helperCollection[helperName] !== 'function') {
            console.warn(`Helper function '${helperName}' not found in AuxiliaryOperations.`);
            return '';
        }

        const args = argsString.split(',').map(arg => {
            arg = arg.trim();
            if (arg.startsWith("'") && arg.endsWith("'")) {
                return arg.substring(1, arg.length - 1); // String literal
            }
            if (!isNaN(arg) && !isNaN(parseFloat(arg)) && arg.length > 0) { // Check for empty string after trim
                return parseFloat(arg); // Number literal
            }
            // Assume it's a data property or a raw string to be passed
            return dataPayload[arg] !== undefined ? dataPayload[arg] : arg;
        }).filter(arg => arg !== ''); // Remove empty string args if any from split

        // Pass the entire dataPayload as the first argument, mimicking JsRender's view.data
        try {
            return helperCollection[helperName](dataPayload, ...args);
        } catch (e) {
            console.error(`Error executing helper '${helperName}':`, e);
            return '';
        }
    });

    return output;
}


// Main class (replacing the jQuery plugin structure)
class TumblrDataProcessor {
    constructor(domElements, processingOptions) {
        this.targetElements = Array.isArray(domElements) ? domElements : [domElements];

        this.configuration = Object.assign({
            "siteDomain": GLOB_TUMBLR_HOST,
            "postKey": null,
            "postType": "", // text, quote, link, answer, video, audio, photo
            "searchTag": "",
            "itemLimit": 20, // 1 — 20
            "startOffset": 0, // 0 or integer
            "outputFormat": "", // none (for html), text, raw
            "contentTemplateId": "", // ID of custom template script tag
            "preProcessCallback": null, // Replaces beforeSend
            "postSuccessCallback": null, // Replaces done()
            "finalCompletionCallback": null, // Replaces always()
            "loadIndicatorClass": "loading-display-element" // Renamed from .tumblr-api-loading
        }, processingOptions);

        this.requestURIWithoutOffset = ""; // To store URI for infinite scroll
        this.jsonpCallbackName = `jsonpCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

        this.auxiliaryFunctions = AuxiliaryOperations; // Expose helpers
    }

    // Constructs the API URI based on configuration
    _buildRequestURI() {
        let typePath = this.configuration.postType !== "" ? "/" + this.configuration.postType : "";
        let baseURI = `http://api.tumblr.com/v2/blog/${this.configuration.siteDomain}/posts${typePath}?api_key=${GLOB_TUMBLR_SECRET_KEY}`;

        if (this.configuration.postKey) {
            baseURI += `&id=${parseInt(this.configuration.postKey)}`;
        } else {
            if (this.configuration.searchTag) baseURI += `&tag=${encodeURIComponent(this.configuration.searchTag)}`;
            if (this.configuration.itemLimit) baseURI += `&limit=${parseInt(this.configuration.itemLimit)}`;
            this.requestURIWithoutOffset = baseURI; // Store for callbacks
            if (this.configuration.startOffset) baseURI += `&offset=${parseInt(this.configuration.startOffset)}`;
        }
        return baseURI;
    }

    // Executes a JSONP request by injecting a script tag
    _executeJSONPRequest(requestUrl) {
        return new Promise((resolve, reject) => {
            window[this.jsonpCallbackName] = (data) => {
                resolve(data);
                this._cleanupJSONP();
            };

            const scriptElement = document.createElement('script');
            scriptElement.src = `${requestUrl}&callback=${this.jsonpCallbackName}`;
            scriptElement.id = `jsonpScript_${this.jsonpCallbackName}`;
            scriptElement.onerror = (e) => {
                reject(new Error('JSONP request failed.'));
                this._cleanupJSONP();
            };
            document.head.appendChild(scriptElement);
        });
    }

    // Cleans up the injected script tag and global callback
    _cleanupJSONP() {
        const scriptElement = document.getElementById(`jsonpScript_${this.jsonpCallbackName}`);
        if (scriptElement) {
            scriptElement.remove();
        }
        delete window[this.jsonpCallbackName];
    }

    // Processes the fetched data and renders it into the target elements
    _processFetchedData(responseData) {
        if (responseData && responseData.response && responseData.response.posts && responseData.response.posts.length > 0) {
            responseData.response.posts.forEach(postItem => {
                let templateContent = "";
                let selectedTemplateId = this.configuration.contentTemplateId !== "" ?
                                         this.configuration.contentTemplateId :
                                         `block-${postItem.type}`; // Renamed from tmpl-type to block-type

                const templateElement = document.getElementById(selectedTemplateId);
                if (templateElement && templateElement.tagName === 'SCRIPT' && templateElement.type === 'text/x-template') {
                    templateContent = templateElement.innerHTML;
                } else {
                    // Provide simple default templates if no custom template is found
                    switch (postItem.type) {
                        case 'text':
                            templateContent = `<article class="post-entry text-post"><h3>{{title}}</h3><div>{{body}}</div></article>`;
                            break;
                        case 'photo':
                            templateContent = `<figure class="post-entry photo-post"><img src="{{#selectImageSource(500)}}" alt="{{caption}}"><figcaption>{{caption}}</figcaption></figure>`;
                            break;
                        case 'audio':
                            templateContent = `<div class="post-entry audio-post">{{#colorizeAudioPlayer('#FFCC00')}}</div>`;
                            break;
                        case 'video':
                            templateContent = `<div class="post-entry video-post">{{#extractVideoElement(400)}}</div>`;
                            break;
                        default:
                            templateContent = `<article class="post-entry generic-post"><h3>{{title}}</h3><div>{{body}}</div></article>`;
                            break;
                    }
                }

                const renderedHtml = renderContentBlock(templateContent, postItem, this.auxiliaryFunctions);
                this.targetElements.forEach(element => {
                    element.insertAdjacentHTML('beforeend', renderedHtml);
                });
            });
        }
    }

    // Main method to initiate the data fetching and rendering process
    initiateDataRetrieval() {
        this.targetElements.forEach(element => {
            // Run preProcessCallback if set, maintaining context for 'this'
            if (typeof this.configuration.preProcessCallback === "function") {
                this.configuration.preProcessCallback.call(element);
            }
        });

        const requestUrl = this._buildRequestURI();

        this._executeJSONPRequest(requestUrl)
            .then(data => {
                this._processFetchedData(data);
                this.targetElements.forEach(element => {
                    // Run postSuccessCallback if set, maintaining context for 'this'
                    if (typeof this.configuration.postSuccessCallback === "function") {
                        // Mimic jQuery's done() callback arguments (data, textStatus, jqXHR, uriWithoutOffset)
                        this.configuration.postSuccessCallback.call(element, data, "success", null, this.requestURIWithoutOffset);
                    }
                });
            })
            .catch(error => {
                console.error("Tumblr data retrieval encountered an issue:", error);
                // In case of error, still call finalCompletionCallback
            })
            .finally(() => {
                this.targetElements.forEach(element => {
                    // Hide loading indicators
                    const loadingIndicators = element.querySelectorAll(`.${this.configuration.loadIndicatorClass}`);
                    loadingIndicators.forEach(indicator => {
                        indicator.style.display = 'none';
                    });

                    // Run finalCompletionCallback if set, maintaining context for 'this'
                    if (typeof this.configuration.finalCompletionCallback === "function") {
                        // Mimic jQuery's always() callback arguments (jqXHR, textStatus, uriWithoutOffset)
                        this.configuration.finalCompletionCallback.call(element, null, "completed", this.requestURIWithoutOffset);
                    }
                });
            });
    }
}

// Global factory function to mimic the jQuery plugin's entry point
window.createTumblrWidget = function(selector, options) {
    const selectedElements = Array.from(document.querySelectorAll(selector));
    if (selectedElements.length === 0) {
        console.warn(`No DOM elements found matching selector: ${selector}. Widget will not be initialized.`);
        return { // Return a no-op object to prevent errors in chained calls
            initiateDataRetrieval: () => Promise.resolve()
        };
    }
    const processorInstance = new TumblrDataProcessor(selectedElements, options);
    return processorInstance;
};