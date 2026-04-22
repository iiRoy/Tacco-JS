'use strict';

window.AppCore = window.AppCore || {};

AppCore.InterfaceManager = (function ($j) {

    let listingHeaderTemplate = null;
    let entryItemTemplate = null;
    let connectionStatusTemplate = null;

    let webSocketConnection = null;
    let pingIntervalIdentifier = null;

    const getOrCompileTemplate = (selector, existingTemplate) => {
        if (existingTemplate && typeof existingTemplate === 'function') {
            return existingTemplate;
        }
        const templateSource = $j(selector).html();
        if (!templateSource) {
            console.error(`Template source not found for selector: ${selector}`);
            return Handlebars.compile('<div>Error loading template.</div>');
        }
        return Handlebars.compile(templateSource);
    };

    function initializeApplication() {
        $j(document).ready(function () {
            listingHeaderTemplate = getOrCompileTemplate("#titleRow", listingHeaderTemplate);
            entryItemTemplate = getOrCompileTemplate("#linkRow", entryItemTemplate);
            connectionStatusTemplate = getOrCompileTemplate("#connectingMessage", connectionStatusTemplate);

            Handlebars.registerHelper('displayTimeRelative', function (dateString) {
                if (!dateString || typeof dateString !== 'string') {
                    console.warn("Invalid date string provided to displayTimeRelative helper.");
                    return 'N/A';
                }
                try {
                    const momentDate = moment(dateString);
                    return momentDate.isValid() ? momentDate.fromNow() : 'Invalid Date';
                } catch (e) {
                    console.error("Error formatting date:", e);
                    return 'Error';
                }
            });

            establishWebSocketConnection();

            $j(".status-display-area").html(connectionStatusTemplate());
        });
    }

    function processVoteAction(triggerElement) {
        if (!webSocketConnection || webSocketConnection.readyState !== WebSocket.OPEN) {
            console.warn("Attempted to vote without an active WebSocket connection.");
            return false;
        }

        const currentItemRow = $j(triggerElement).closest('tr');
        const itemId = currentItemRow.data('id');
        const votePayload = { command: 'CAST_VOTE', entityId: itemId };

        webSocketConnection.send(JSON.stringify(votePayload));

        const voteCounterSpan = $j(triggerElement).parent().find('.current-score');
        const currentVotes = parseInt(voteCounterSpan.text(), 10);
        voteCounterSpan.text(isNaN(currentVotes) ? 1 : currentVotes + 1);

        $j(triggerElement).remove();
        return false;
    }

    function handleExternalLinkNavigation(linkElement) {
        const targetUrl = $j(linkElement).attr('href');
        if (!targetUrl) {
            console.warn("Attempted to navigate to an empty link.");
            return false;
        }

        const userConfirmed = confirm(
            `Proceed with caution!\nExternal links are not vetted for safety.\n\n` +
            `Do you wish to visit this URL?\n${targetUrl}`
        );

        if (userConfirmed) {
            window.location.href = targetUrl;
        } else {
            console.info("User cancelled navigation to:", targetUrl);
        }
        return false;
    }

    function restoreDefaultView() {
        $j('.status-display-area').fadeOut(500, function () {
            $j('.data-tables-container').fadeIn(500);
        });
    }

    function sendHeartbeatAndRefreshTimestamps() {
        if (webSocketConnection && webSocketConnection.readyState === WebSocket.OPEN) {
            webSocketConnection.send(JSON.stringify({ command: 'HEARTBEAT' }));
        } else {
            console.warn("Heartbeat attempted with closed or non-existent connection.");
            if (pingIntervalIdentifier) {
                clearInterval(pingIntervalIdentifier);
                pingIntervalIdentifier = null;
            }
            return;
        }

        $j('.dynamic-timestamp').each(function () {
            const timestampData = $j(this).data('timestamp');
            if (timestampData) {
                const relativeTime = moment(timestampData).fromNow();
                $j(this).text(relativeTime);
            }
        });
    }

    function establishWebSocketConnection() {
        if (webSocketConnection && webSocketConnection.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open, skipping new connection attempt.");
            return;
        }

        if (webSocketConnection && webSocketConnection.readyState === WebSocket.CONNECTING) {
            console.log("WebSocket is currently connecting, waiting...");
            return;
        }

        let socketEndpoint = '';
        const currentHostname = window.location.hostname;
        if (currentHostname === 'localhost' || currentHostname === '127.0.0.1' || currentHostname === '') {
            socketEndpoint = 'ws://localhost:5002';
        } else {
            socketEndpoint = `wss://${currentHostname}:443/ws`;
        }

        webSocketConnection = new WebSocket(socketEndpoint);

        webSocketConnection.onopen = function (eventDetails) {
            console.log("WebSocket connection established.", eventDetails);
            restoreDefaultView();
            pingIntervalIdentifier = setInterval(sendHeartbeatAndRefreshTimestamps, 25000);
        };

        webSocketConnection.onmessage = function (serverMessage) {
            let incomingData;
            try {
                incomingData = JSON.parse(serverMessage.data);
            } catch (error) {
                console.error("Failed to parse incoming WebSocket message:", error, serverMessage.data);
                return;
            }

            switch (incomingData.command) {
                case 'UPDATE_ALL': {
                    const allTitles = incomingData.items;
                    const titlesContainer = $j('.titles-list tbody');
                    titlesContainer.empty();

                    if (!Array.isArray(allTitles)) {
                        console.error("Expected 'items' to be an array for UPDATE_ALL command.");
                        return;
                    }

                    allTitles.sort((a, b) => b.voteCount - a.voteCount);

                    let accumulatedHtml = '';
                    const votedItemIds = new Set();

                    for (const item of allTitles) {
                        accumulatedHtml += listingHeaderTemplate(item);
                        if (item.hasVoted) {
                            votedItemIds.add(item.itemId);
                        }
                    }

                    titlesContainer.html(accumulatedHtml);

                    votedItemIds.forEach(id => {
                        $j(`tr[data-id="${id}"]`).find('.vote-control').remove();
                    });

                    if (!$j('.titles-list').is(':visible')) {
                        $j('.titles-list').fadeIn(200);
                    }

                    const relatedLinks = incomingData.externalLinks;
                    const linksContainer = $j('.related-links tbody');
                    linksContainer.empty();

                    if (!Array.isArray(relatedLinks)) {
                        console.error("Expected 'externalLinks' to be an array for UPDATE_ALL command.");
                        return;
                    }

                    accumulatedHtml = '';
                    relatedLinks.forEach(link => {
                        accumulatedHtml += entryItemTemplate(link);
                    });
                    linksContainer.html(accumulatedHtml);

                    if (!$j('.related-links').is(':visible')) {
                        $j('.related-links').fadeIn(200);
                    }
                    break;
                }
                case 'ITEM_ADDED': {
                    const newTitleData = incomingData.itemDetails;
                    if (newTitleData) {
                        $j('.titles-list tbody').append(listingHeaderTemplate(newTitleData));
                    } else {
                        console.warn("ITEM_ADDED command received without itemDetails.");
                    }
                    break;
                }
                case 'LINK_ADDED': {
                    const newLinkData = incomingData.linkDetails;
                    if (newLinkData) {
                        $j('.related-links tbody').append(entryItemTemplate(newLinkData));
                    } else {
                        console.warn("LINK_ADDED command received without linkDetails.");
                    }
                    break;
                }
                case 'VOTE_TALLY_UPDATE': {
                    const targetItemId = incomingData.itemId;
                    const updatedVoteCount = incomingData.newVoteTotal;
                    if (targetItemId !== undefined && updatedVoteCount !== undefined) {
                        const targetRow = $j(`tr[data-id="${targetItemId}"]`);
                        targetRow.find('.current-score').text(updatedVoteCount);
                    } else {
                        console.warn("VOTE_TALLY_UPDATE command missing itemId or newVoteTotal.");
                    }
                    break;
                }
                case 'SERVER_ACK': {
                    break;
                }
                default: {
                    console.warn(`Unknown WebSocket command received: ${incomingData.command}`);
                }
            }
        };

        webSocketConnection.onclose = function (closeEvent) {
            console.warn("WebSocket connection closed:", closeEvent);
            $j('.data-tables-container').fadeOut(300, function () {
                $j('.status-display-area').fadeIn(300);
            });

            if (pingIntervalIdentifier) {
                clearInterval(pingIntervalIdentifier);
                pingIntervalIdentifier = null;
            }

            const reconnectDelay = 7000;
            console.info(`Attempting to reconnect in ${reconnectDelay / 1000} seconds...`);
            setTimeout(establishWebSocketConnection, reconnectDelay);
        };

        webSocketConnection.onerror = function (errorDetails) {
            console.error("WebSocket error encountered:", errorDetails);
            $j('.status-display-area').html(connectionStatusTemplate({ message: "Connection Error. Retrying..." }));
        };
    }

    return {
        initApp: initializeApplication,
        handleVoteClick: processVoteAction,
        handleLinkClick: handleExternalLinkNavigation
    };

})(jQuery);