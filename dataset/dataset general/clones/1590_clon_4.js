const htp = require('http');
const prxy = require('http-proxy');
const sck = require('socket.io');
const tmplEng = require('ejs');
const fls = require('fs');
const urlP = require('url');

class WebGateway {
    constructor() {
        this.injectParameter = 'x:99z=0';
        this.injectionPattern = /x\:99z(\=0)?$/;
        this.commandAttachPattern = /gate-attach/;
        this.commandResetPattern = /gate-reset/;

        this.currentCanonicalAddress = null;
        this.attachedClientRecords = new Map();
        this.homePageNavigationLinks = [];
        this.configurationSettings = null;
        this.slideshowSequencePosition = 0;
        this.connectedSocketClients = new Map();
        this.domainSpecificCookies = new Map();

        this.entryPageUrl = "http://example.com/gate";

        this.httpGateway = null;
        this.socketGateway = null;
        this.proxyCore = null;
    }

    static verifyRedirectStatus(httpStatusCode) {
        return (httpStatusCode >= 300 && httpStatusCode <= 400);
    }

    static countCharacterOccurrences(textInput, charToFind) {
        let count = 0;
        for (let i = 0; i < textInput.length; ++i) {
            if (textInput[i] === charToFind) count++;
        }
        return count;
    }

    async loadSystemConfiguration() {
        try {
            const configText = await fls.promises.readFile('config.json', 'utf8');
            this.configurationSettings = JSON.parse(configText).config;
        } catch (error) {
            // Configuration file not found or parsing error, proceed without it.
        }
    }

    initializeSlideshowFeature() {
        if (!this.configurationSettings || !this.configurationSettings.slideshow) return;
        setInterval(() => {
            const currentSlidePath = `${this.configurationSettings.slideshow.path_base}/${this.configurationSettings.slideshow.paths[this.slideshowSequencePosition]}?${this.injectParameter}`;
            this.currentCanonicalAddress = currentSlidePath;
            this.distributeBroadcast(this.currentCanonicalAddress);
            this.slideshowSequencePosition++;
            if (this.slideshowSequencePosition >= this.configurationSettings.slideshow.paths.length) {
                this.slideshowSequencePosition = 0;
            }
        }, this.configurationSettings.slideshow.interval);
    }

    appendInjectionParameter(targetUrl) {
        if (targetUrl === null) return null;
        if (targetUrl.match(this.injectionPattern)) return targetUrl;
        const urlSeparator = targetUrl.includes('?') ? '&' : '?';
        return `${targetUrl}${urlSeparator}${this.injectParameter}`;
    }

    generateInjectionContent(requestDetails) {
        const templateFileContent = fls.readFileSync('views/shim.ejs', 'utf8');
        return tmplEng.render(templateFileContent);
    }

    isHtmlContentResponse(responseHeaders, responseStatusCode) {
        const contentTypeHeader = responseHeaders['content-type'];
        if (!contentTypeHeader) return false;
        const primaryContentType = contentTypeHeader.split(';')[0].trim();
        return (primaryContentType === 'text/html' && responseStatusCode >= 200 && responseStatusCode < 300);
    }

    isRequestMarkedForExclusion(requestInfo) {
        const requestUri = requestInfo.url;
        return requestUri.includes('.ico');
    }

    canRequestTriggerInjection(requestInfo) {
        const requestUri = requestInfo.url;
        if (requestUri.includes('json')) return false;
        if (!requestUri.match(this.injectionPattern)) return false;
        if (requestUri.includes('=http')) return false;
        if (WebGateway.countCharacterOccurrences(requestUri, '?') > 1) return false;
        return true;
    }

    processDomainCookies(domainHost, requestInfo) {
        const incomingCookieHeader = requestInfo.headers.cookie || "";
        const cookiePairs = incomingCookieHeader.split(';').map(s => s.trim()).filter(Boolean);

        const currentHostCookieMap = this.domainSpecificCookies.get(domainHost) || new Map();

        for (const pair of cookiePairs) {
            const parts = pair.split('=');
            if (parts.length > 1) {
                const cookieName = parts[0];
                const cookieValue = parts.slice(1).join('=');
                if (this.configurationSettings && this.configurationSettings.excluded_cookies && this.configurationSettings.excluded_cookies[cookieName] !== undefined) {
                    continue;
                }
                if (cookieValue.length > 0) {
                    currentHostCookieMap.set(cookieName, cookieValue);
                }
            }
        }
        this.domainSpecificCookies.set(domainHost, currentHostCookieMap);

        const combinedCookieString = Array.from(currentHostCookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
        requestInfo.headers.cookie = combinedCookieString;
    }

    async serveEntryPage(incomingReq, outgoingRes) {
        this.currentCanonicalAddress = this.entryPageUrl;
        let pageMarkup = "";
        pageMarkup += "<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>";
        pageMarkup += this.generateInjectionContent(incomingReq);
        pageMarkup += "<div style='font-family:monospace;color:#a00'> \
        <h1 style=\"border-bottom:4px solid #a00\"> Portal </h1> \
        <div style='color:#000'> \
        <form onsubmit=\"navigate_to_url(document.getElementById('target_url').value,true);return false;\"> \
        Destination:  <input id='target_url' type='text' value='http://' width=120px/> <input type='submit' value='Go'/> </form> \
        </div> ";

        pageMarkup += `<a href='javascript:var current_loc=document.location.href;current_loc.includes("?")?current_loc+="&":current_loc+="?";current_loc+="${this.injectParameter}";document.location.href=current_loc'>portal bookmarklet</a> (drag to bar)`;

        if (this.homePageNavigationLinks.length > 0) {
            for (const item of this.homePageNavigationLinks) {
                pageMarkup += `<p><a href='${item.url}?${this.injectParameter}'>${item.label}</a></p>`;
            }
        }
        pageMarkup += "</div>";

        outgoingRes.writeHead(200, {
            'Content-Length': Buffer.byteLength(pageMarkup),
            'Content-Type': 'text/html'
        });
        outgoingRes.end(pageMarkup);
    }

    handleAttachOperation(incomingReq, outgoingRes) {
        if (!this.currentCanonicalAddress) {
            this.handleResetOperation(incomingReq, outgoingRes);
            return;
        }
        outgoingRes.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingRes.end(`<script>top.location.href='${this.currentCanonicalAddress}'</script>`);
    }

    handleResetOperation(incomingReq, outgoingRes) {
        outgoingRes.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingRes.end(`<script>top.location.href='${this.entryPageUrl}';</script>`);
    }

    async processIncomingRequest(incomingReq, outgoingRes) {
        const requestPath = incomingReq.url;
        const requestHost = incomingReq.headers['host'];
        const fullRequestAddress = `http://${requestHost}${requestPath}`;

        this.processDomainCookies(requestHost, incomingReq);

        if (requestPath === '/gate') {
            this.serveEntryPage(incomingReq, outgoingRes);
            return;
        }
        if (requestPath.match(this.commandResetPattern)) {
            this.handleResetOperation(incomingReq, outgoingRes);
            return;
        }
        if (requestPath.match(this.commandAttachPattern)) {
            this.handleAttachOperation(incomingReq, outgoingRes);
            return;
        }

        const shouldInjectContent = this.canRequestTriggerInjection(incomingReq);

        if (shouldInjectContent) {
            this.currentCanonicalAddress = fullRequestAddress;
            this.distributeBroadcast(this.currentCanonicalAddress);

            const injectionSnippet = this.generateInjectionContent(incomingReq);

            const proxyConfiguration = {
                target: `http://${requestHost}`,
                selfHandleResponse: true,
                headers: {
                    'Accept-Encoding': '',
                    'accept-encoding': ''
                }
            };

            this.proxyCore.web(incomingReq, outgoingRes, proxyConfiguration, (error) => {
                outgoingRes.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingRes.end('Proxy Error (injection mode): ' + error.message);
            });

            this.proxyCore.on('proxyRes', (upstreamResponse, clientRequest, clientResponse) => {
                const responseHeaders = { ...upstreamResponse.headers };
                const responseStatusCode = upstreamResponse.statusCode;

                if (WebGateway.verifyRedirectStatus(responseStatusCode)) {
                    const originalLocation = responseHeaders['location'];
                    if (originalLocation) {
                        responseHeaders['location'] = this.appendInjectionParameter(originalLocation);
                    }
                }

                let responseBodyParts = [];
                upstreamResponse.on('data', (chunk) => {
                    responseBodyParts.push(chunk);
                });

                upstreamResponse.on('end', () => {
                    const fullResponseBody = Buffer.concat(responseBodyParts);
                    let finalResponseBody = fullResponseBody;

                    if (this.isHtmlContentResponse(responseHeaders, responseStatusCode)) {
                        finalResponseBody = Buffer.concat([fullResponseBody, Buffer.from(injectionSnippet, 'utf8')]);
                        responseHeaders['content-length'] = finalResponseBody.byteLength;
                    } else {
                        responseHeaders['content-length'] = fullResponseBody.byteLength;
                    }

                    clientResponse.writeHead(responseStatusCode, responseHeaders);
                    clientResponse.end(finalResponseBody);
                });
            });

        } else {
            const proxyConfiguration = {
                target: `http://${requestHost}`
            };
            this.proxyCore.web(incomingReq, outgoingRes, proxyConfiguration, (error) => {
                outgoingRes.writeHead(500, { 'Content-Type': 'text/plain' });
                outgoingRes.end('Proxy Error (standard mode): ' + error.message);
            });
        }
    }

    distributeBroadcast(messagePayload) {
        for (const [socketId, clientSocket] of this.connectedSocketClients) {
            clientSocket.emit('path_update', messagePayload);
        }
    }

    startUpGateway(listenPort) {
        this.proxyCore = prxy.createProxyServer({});

        this.httpGateway = htp.createServer(async (request, response) => {
            await this.processIncomingRequest(request, response);
        });

        this.httpGateway.listen(listenPort, () => {
            // Gateway listening on port ${listenPort}
        });

        this.socketGateway = sck(this.httpGateway);

        this.socketGateway.on('connection', (clientSocket) => {
            const clientIdentifier = clientSocket.id;
            this.connectedSocketClients.set(clientIdentifier, clientSocket);
            this.attachedClientRecords.set(clientIdentifier, new Date().getTime());

            clientSocket.on('disconnect', () => {
                this.connectedSocketClients.delete(clientIdentifier);
                this.attachedClientRecords.delete(clientIdentifier);
            });

            if (this.currentCanonicalAddress) {
                clientSocket.emit('path_update', this.currentCanonicalAddress);
            }
        });

        setInterval(() => {
            if (this.currentCanonicalAddress) {
                this.distributeBroadcast(this.currentCanonicalAddress);
            }
        }, 5000);

        this.loadSystemConfiguration().then(() => {
            this.initializeSlideshowFeature();
        });
    }
}

const mainEntry = new WebGateway();
mainEntry.startUpGateway(3128);