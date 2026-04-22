'use strict';

window.DisplayBot = window.DisplayBot || {};

DisplayBot.ApplicationCore = (function (jQ) {

    let renderTitleRow = null;
    let renderLinkRow = null;
    let renderConnectionStatus = null;

    let activeSocket = null;
    let heartbeatTimeoutId = null;

    const retrieveTemplateString = (elementId) => {
        const element = document.getElementById(elementId);
        return element ? element.innerHTML : '';
    };

    class BotService {
        constructor() {
            jQ(() => {
                this.prepareRenderFunctions();
                this.setupTemplateHelpers();
                this.beginSocketCommunication();
                this.displayStartupMessage();
            });
        }

        prepareRenderFunctions() {
            renderTitleRow = renderTitleRow || Handlebars.compile(retrieveTemplateString('titleRow'));
            renderLinkRow = renderLinkRow || Handlebars.compile(retrieveTemplateString('linkRow'));
            renderConnectionStatus = renderConnectionStatus || Handlebars.compile(retrieveTemplateString('connectingMessage'));
        }

        setupTemplateHelpers() {
            Handlebars.registerHelper('elapsedTime', (dateValue) => moment(dateValue).fromNow());
        }

        beginSocketCommunication() {
            this.establishSocketConnection();
        }

        displayStartupMessage() {
            jQ('.message-container').html(renderConnectionStatus());
        }

        processVoteAction(triggerElement) {
            const rowElement = triggerElement.closest('tr');
            if (!rowElement) return false;

            const entryIdentifier = jQ(rowElement).data('recordId');
            if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
                activeSocket.send(JSON.stringify({ opCode: 'CAST_VOTE', entityId: entryIdentifier }));
            }

            const voteDisplaySpan = rowElement.querySelector('.vote-count');
            if (voteDisplaySpan) {
                voteDisplaySpan.textContent = (parseInt(voteDisplaySpan.textContent, 10) || 0) + 1;
            }
            triggerElement.remove();
            return false;
        }

        handleNavigationRequest(linkElement) {
            const destinationUrl = linkElement.href;
            const confirmationPrompt = "Proceed with caution; external links are not verified!\nDo you wish to navigate to:\n\n" + destinationUrl;
            if (confirm(confirmationPrompt)) {
                window.location.href = destinationUrl;
            }
            return false;
        }

        restoreUserInterfaceDefaults() {
            jQ('.message-container').fadeOut(400, () => {
                jQ('.data-tables').fadeIn(400);
            });
        }

        sendHeartbeat() {
            if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
                activeSocket.send(JSON.stringify({ opCode: 'HEARTBEAT_PING' }));
            }

            jQ('.event-time-display').each((_idx, element) => {
                const timestamp = jQ(element).data('timestamp');
                if (timestamp) {
                    element.textContent = moment(timestamp).fromNow();
                }
            });

            heartbeatTimeoutId = setTimeout(() => this.sendHeartbeat(), 30000);
        }

        establishSocketConnection() {
            if (activeSocket === null || activeSocket.readyState === WebSocket.CLOSED) {
                const hostAddress = window.location.hostname;
                const endpointUrl = (hostAddress === 'localhost' || hostAddress === '') ?
                    'ws://localhost:5001' :
                    'ws://thawing-bayou-3232.herokuapp.com:80';

                activeSocket = new WebSocket(endpointUrl);

                activeSocket.onopen = (event) => {
                    this.restoreUserInterfaceDefaults();
                    this.sendHeartbeat();
                };

                activeSocket.onmessage = (messageEvent) => {
                    this.processIncomingSocketMessage(JSON.parse(messageEvent.data));
                };

                activeSocket.onclose = (closeEvent) => {
                    jQ('.data-tables').fadeOut(400, () => {
                        jQ('.message-container').fadeIn(400);
                    });
                    clearTimeout(heartbeatTimeoutId);
                    setTimeout(() => this.establishSocketConnection(), 5000);
                };

                activeSocket.onerror = (errorEvent) => {
                    console.error("WebSocket Communication Error: ", errorEvent);
                };
            } else {
                setTimeout(() => this.establishSocketConnection(), 5000);
            }
        }

        messageDispatchMap = {
            'FULL_REFRESH': (dataPayload) => {
                const contentArticles = dataPayload.contentList;
                const articlesTableDisplay = jQ('.articles-display tbody');
                articlesTableDisplay.empty();

                const orderedArticles = [...contentArticles].sort((a, b) => b.voteCount - a.voteCount);
                let articleRenderedHtml = '';
                const votedArticleIdentifiers = new Set();

                orderedArticles.forEach(article => {
                    articleRenderedHtml += renderTitleRow(article);
                    if (article.hasUserVoted) {
                        votedArticleIdentifiers.add(article.uniqueId);
                    }
                });

                articlesTableDisplay.html(articleRenderedHtml);

                votedArticleIdentifiers.forEach(id => {
                    jQ(`tr[data-record-id="${id}"]`).find('.vote-trigger').remove();
                });

                if (!jQ('.articles-display').is(':visible')) {
                    jQ('.articles-display').fadeIn();
                }

                const externalWebLinks = dataPayload.externalReferences;
                const externalLinksTableDisplay = jQ('.external-links-display tbody');
                externalLinksTableDisplay.empty();
                
                const linkRenderedHtml = externalWebLinks.map(link => renderLinkRow(link)).join('');
                externalLinksTableDisplay.html(linkRenderedHtml);

                if (!externalLinksTableDisplay.is(':visible')) {
                    externalLinksTableDisplay.fadeIn();
                }
            },
            'NEW_CONTENT_ITEM': (dataPayload) => {
                jQ('.articles-display tbody').append(renderTitleRow(dataPayload.contentItem));
            },
            'NEW_WEB_LINK': (dataPayload) => {
                jQ('.external-links-display tbody').append(renderLinkRow(dataPayload.linkItem));
            },
            'VOTE_COUNT_UPDATE': (dataPayload) => {
                const targetRow = jQ(`tr[data-record-id="${dataPayload.entityId}"]`);
                targetRow.find('.vote-count').html(dataPayload.currentVoteCount);
            },
            'HEARTBEAT_ACK': (dataPayload) => { /* No operation required */ }
        };

        processIncomingSocketMessage(parsedPacket) {
            const processorFunction = this.messageDispatchMap[parsedPacket.opCode];
            if (processorFunction) {
                processorFunction(parsedPacket);
            } else {
                console.warn("Unrecognized WebSocket operation code:", parsedPacket.opCode);
            }
        }
    }

    const instance = new BotService();
    return {
        triggerVoteAction: (el) => instance.processVoteAction(el),
        initiateLinkNavigation: (el) => instance.handleNavigationRequest(el)
    };

})(jQuery);