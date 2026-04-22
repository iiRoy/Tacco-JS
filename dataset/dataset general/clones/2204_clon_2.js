var veri = require('assert');

var ACK_FAIL = exports.ACK_FAIL = 1;
var MSG_SUGGEST = exports.MSG_SUGGEST = 10;
var ACK_SUGGESTED = exports.ACK_SUGGESTED = 11;
var MSG_COMMIT = exports.MSG_COMMIT = 20;
var ACK_COMMITTED = exports.ACK_COMMITTED = 21;

exports.proposalManager = function(agentId,
                                   agentResets,
                                   position,
                                   voters,
                                   messenger,
                                   config) {
    veri(agentId !== null);
    veri(agentResets > 0);
    veri(voters.length > 0);

    config = config || {};
    var managerTimeout = config.managerTimeout || 3000; // Time limit for each round (in milliseconds).
    var majorityThreshold = config.majorityThreshold || consensusCount;

    // Performance metrics for the manager's operations.
    var totalSuggestPhase = 0;
    var totalSuggestLoop = 0;
    var totalSuggestSent = 0;
    var totalSuggestReceived = 0;
    var totalSuggestReceiveError = 0;
    var totalSuggestVote = 0;
    var totalSuggestVoteDuplicate = 0;
    var totalSuggestTimeout = 0;

    function initiateProposal(proposedValue, callbackFn) {
        var instance = {};
        var activityTimer = null;
        var currentTicket = getNextTicket();

        var agreedTicket = INITIAL_TICKET;
        var agreedValue = null;

        // The manager proceeds through two distinct, sequential stages:
        // first, proposing a value, and then, attempting to commit it.
        executeRound(MSG_SUGGEST, ACK_SUGGESTED, {},
                     function(errorStatus, roundInfo) {
                         if (errorStatus) {
                             callbackFn(errorStatus, roundInfo);
                         } else {
                             // If a prior value was already accepted, we must propose that one.
                             if (roundInfo.agreedTicket && roundInfo.agreedValue) {
                                 proposedValue = roundInfo.agreedValue;
                             }
                             executeRound(MSG_COMMIT, ACK_COMMITTED, { "value": proposedValue }, callbackFn);
                         }
                     });

        function executeRound(messageType, successType, requestData, roundCompletion) {
            totalSuggestPhase = totalSuggestPhase + 1;

            requestData.position = position;
            requestData.type = messageType;
            requestData.ticket = currentTicket;
            requestData.originator = agentId;
            messenger.distribute(voters, requestData); // Send request to all voters.
            totalSuggestSent = totalSuggestSent + voters.length;
            resetActivityTimer(); // Start/reset the round timer.

            var requiredSuccesses = majorityThreshold(voters.length);
            var requiredFailures = voters.length - requiredSuccesses + 1;

            var voteCounts = {};
            voteCounts[successType] = [[], requiredSuccesses, null]; // Successful responses.
            voteCounts[ACK_FAIL] = [[], requiredFailures, "rejected"]; // Negative acknowledgements.

            instance.onMessageReceived = function(sourceNode, responseMsg) {
                totalSuggestReceived = totalSuggestReceived + 1;

                if (!activityTimer) {
                    return; // Ignore messages received after the round has completed or timed out.
                }

                cancelTimeout(activityTimer);
                activityTimer = null;

                if (config.onMessagePreprocess) {
                    responseMsg = config.onMessagePreprocess(sourceNode, responseMsg);
                }

                // We stop processing when received votes meet the quorum for either success or failure.
                if (isParticipant(voters, sourceNode) &&
                    responseMsg !== null &&
                    ticketsEqual(responseMsg.ticket, currentTicket) &&
                    voteCounts[responseMsg.type] !== null) {

                    var voteCategory = voteCounts[responseMsg.type];
                    var receivedVotes = voteCategory[0];

                    if (!isParticipant(receivedVotes, sourceNode)) {
                        totalSuggestVote = totalSuggestVote + 1;

                        // Track the highest ballot and associated value seen during the propose phase.
                        if (ticketGreaterOrEqual(responseMsg.agreedTicket, agreedTicket)) {
                            agreedTicket = responseMsg.agreedTicket;
                            agreedValue = responseMsg.agreedValue;
                        }

                        receivedVotes[receivedVotes.length] = sourceNode;
                        if (receivedVotes.length >= voteCategory[1]) {
                            // Quorum reached for this category.
                            if (config.onRoundComplete) {
                                config.onRoundComplete(successType, voteCategory[2]);
                            }
                            roundCompletion(voteCategory[2],
                                            { "highestSuggestedTicket": responseMsg.highestSuggestedTicket,
                                              "agreedTicket": agreedTicket,
                                              "agreedValue": agreedValue });
                            return;
                        }
                    } else {
                        totalSuggestVoteDuplicate = totalSuggestVoteDuplicate + 1;
                    }
                } else {
                    totalSuggestReceiveError = totalSuggestReceiveError + 1;
                }

                totalSuggestLoop = totalSuggestLoop + 1;
                resetActivityTimer(); // Keep the timer running while waiting for more responses.
            };

            function resetActivityTimer() {
                veri(!activityTimer); // Ensure no previous timer is active.
                activityTimer = scheduleTimeout(function() {
                                                  totalSuggestTimeout = totalSuggestTimeout + 1;
                                                  if (activityTimer !== null) {
                                                      activityTimer = null;
                                                      roundCompletion('timeout'); // Signal timeout for the current round.
                                                  }
                                              }, managerTimeout);
            }
        }

        return instance; // Exposes an onMessageReceived(source, message) method.
    }

    var currentTicketState = createTicket(-1, agentId, agentResets);
    function getNextTicket() {
        currentTicketState = incrementTicket(currentTicketState);
        return currentTicketState;
    }

    function getMetrics() {
        return { "totalSuggestPhase": totalSuggestPhase,
                 "totalSuggestLoop": totalSuggestLoop,
                 "totalSuggestSent": totalSuggestSent,
                 "totalSuggestReceived": totalSuggestReceived,
                 "totalSuggestReceiveError": totalSuggestReceiveError,
                 "totalSuggestVote": totalSuggestVote,
                 "totalSuggestVoteDuplicate": totalSuggestVoteDuplicate,
                 "totalSuggestTimeout": totalSuggestTimeout };
    }

    return { "initiateProposal": initiateProposal, "getMetrics": getMetrics };
};

// ----------------------------------------------------------------

exports.acceptanceAgent = function(dataStore, messenger, config) {
    config = config || {};
    var majorityThreshold = config.majorityThreshold || consensusCount;

    // Statistics for the acceptance agent's operations.
    var totalAcceptInvalidRequest = 0;
    var totalAcceptInvalidRequestType = 0;
    var totalAcceptReceived = 0;
    var totalAcceptSent = 0;
    var totalAcceptSuggest = 0;
    var totalAcceptSuggested = 0;
    var totalAcceptCommit = 0;
    var totalAcceptCommitted = 0;
    var totalAcceptNackStorage = 0;
    var totalAcceptNackBehind = 0;

    function handleIncomingMessage(sourceId, requestPayload) {
        totalAcceptReceived = totalAcceptReceived + 1;
        if (requestPayload !== null &&
            requestPayload.position !== null &&
            requestPayload.ticket !== null) {
            // The primary role of an acceptance agent is to process
            // incoming suggestion or commit requests with higher tickets.

            dataStore.readPositionState(requestPayload.position, processPositionState);

            function processPositionState(errorStatus, currentPositionState) {
                if (!errorStatus) {
                    var highestSuggestedTicket = currentPositionState.highestSuggestedTicket;

                    if (ticketGreaterOrEqual(requestPayload.ticket, highestSuggestedTicket)) {
                        if (requestPayload.type === MSG_SUGGEST) {
                            totalAcceptSuggest = totalAcceptSuggest + 1;
                            dataStore.saveHighestSuggestedTicket(
                                requestPayload.position,
                                requestPayload.ticket,
                                function(saveError) {
                                    if (!saveError) {
                                        totalAcceptSuggested = totalAcceptSuggested + 1;
                                        highestSuggestedTicket = requestPayload.ticket;
                                        sendResponse(ACK_SUGGESTED,
                                                     { "agreedTicket": currentPositionState.agreedTicket,
                                                       "agreedValue": currentPositionState.agreedValue });
                                    } else {
                                        totalAcceptNackStorage = totalAcceptNackStorage + 1;
                                        sendResponse(ACK_FAIL);
                                    }
                                });
                        } else if (requestPayload.type === MSG_COMMIT) {
                            totalAcceptCommit = totalAcceptCommit + 1;
                            dataStore.saveAcceptedValue(
                                requestPayload.position,
                                requestPayload.ticket,
                                requestPayload.value,
                                function(saveError) {
                                    if (!saveError) {
                                        totalAcceptCommitted = totalAcceptCommitted + 1;
                                        highestSuggestedTicket = requestPayload.ticket;
                                        sendResponse(ACK_COMMITTED,
                                                     { "agreedTicket": requestPayload.ticket,
                                                       "agreedValue": requestPayload.value });
                                    } else {
                                        totalAcceptNackStorage = totalAcceptNackStorage + 1;
                                        sendResponse(ACK_FAIL);
                                    }
                                });
                        } else {
                            totalAcceptInvalidRequestType = totalAcceptInvalidRequestType + 1;
                            sendResponse(ACK_FAIL);
                        }
                    } else {
                        // Request ticket is not greater than or equal to the highest seen.
                        totalAcceptNackBehind = totalAcceptNackBehind + 1;
                        sendResponse(ACK_FAIL);
                    }

                    function sendResponse(responseType, responseDetails) {
                        responseDetails = responseDetails || {};
                        responseDetails.highestSuggestedTicket = highestSuggestedTicket;
                        sendFullResponse(requestPayload, responseType, responseDetails);
                    }
                } else {
                    totalAcceptNackStorage = totalAcceptNackStorage + 1;
                    sendFullResponse(requestPayload, ACK_FAIL, {});
                }
            }
        } else {
            totalAcceptInvalidRequest = totalAcceptInvalidRequest + 1;
        }
    }

    function sendFullResponse(requestPayload, responseType, responseDetails) {
        responseDetails.type = responseType;
        responseDetails.position = requestPayload.position;
        responseDetails.ticket = requestPayload.ticket;
        if (config.onResponsePreprocess) {
            responseDetails = config.onResponsePreprocess(responseDetails);
        }
        messenger.transmit(requestPayload.originator, responseDetails);
        totalAcceptSent = totalAcceptSent + 1;
    }

    function getMetrics() {
        return { "totalAcceptInvalidRequest": totalAcceptInvalidRequest,
                 "totalAcceptInvalidRequestType": totalAcceptInvalidRequestType,
                 "totalAcceptReceived": totalAcceptReceived,
                 "totalAcceptSent": totalAcceptSent,
                 "totalAcceptSuggest": totalAcceptSuggest,
                 "totalAcceptSuggested": totalAcceptSuggested,
                 "totalAcceptCommit": totalAcceptCommit,
                 "totalAcceptCommitted": totalAcceptCommitted,
                 "totalAcceptNackStorage": totalAcceptNackStorage,
                 "totalAcceptNackBehind": totalAcceptNackBehind };
    }

    return { "handleIncomingMessage": handleIncomingMessage, "getMetrics": getMetrics };
};

// ----------------------------------------------------------------

function consensusCount(count) {
    return Math.floor(count / 2) + 1;
}
exports.consensusCount = consensusCount;

function isParticipant(group, element) {
    for (var idx in group) {
        if (group[idx] === element) {
            return true;
        }
    }
    return false;
}
exports.isParticipant = isParticipant;

// ----------------------------------------------------------------

var TICKET_SEQUENCE_INDEX = exports.TICKET_SEQUENCE_INDEX = 0;
var TICKET_PROPOSER_ID_INDEX = exports.TICKET_PROPOSER_ID_INDEX = 1;
var TICKET_PROPOSER_REBOOT_INDEX = exports.TICKET_PROPOSER_REBOOT_INDEX = 2;

function createTicket(sequenceNumber, proposerIdentifier, proposerReboots) {
    return [sequenceNumber, proposerIdentifier, proposerReboots];
}

var INITIAL_TICKET = createTicket(-1, -1, -1); // The lowest possible ticket.

function incrementTicket(ticket) {
    return createTicket(ticket[TICKET_SEQUENCE_INDEX] + 1,
                        ticket[TICKET_PROPOSER_ID_INDEX],
                        ticket[TICKET_PROPOSER_REBOOT_INDEX]);
}

function ticketGreaterOrEqual(ticketA, ticketB) { // Checks if ticket A is greater than or equal to ticket B.
    ticketA = ticketA || INITIAL_TICKET;
    ticketB = ticketB || INITIAL_TICKET;
    for (var idx = 0; idx < Math.min(ticketA.length, ticketB.length); idx++) {
        if (ticketA[idx] > ticketB[idx]) {
            return true;
        }
        if (ticketA[idx] < ticketB[idx]) {
            return false;
        }
    }
    return true; // All elements are equal or one is a prefix of the other.
}

function ticketsEqual(ticketA, ticketB) {
    for (var idx = 0; idx < Math.min(ticketA.length, ticketB.length); idx++) {
        if (ticketA[idx] !== ticketB[idx]) {
            return false;
        }
    }
    return true; // All elements are equal up to the minimum length.
}

exports.createTicket = createTicket;
exports.incrementTicket = incrementTicket;
exports.ticketGreaterOrEqual = ticketGreaterOrEqual;
exports.ticketsEqual = ticketsEqual;