import { strict as asserter } from 'assert';

const NEGATIVE_ACK     = exports.NEGATIVE_ACK     = 1;
const REQUEST_PREPARE  = exports.REQUEST_PREPARE  = 10;
const RESPONSE_PREPARED = exports.RESPONSE_PREPARED = 11;
const REQUEST_COMMIT   = exports.REQUEST_COMMIT   = 20;
const RESPONSE_COMMITTED = exports.RESPONSE_COMMITTED = 21;

exports.createProposalManager = function(agentId, agentEpoch, slotId,
                                        peerNodes, messageRelay, configOptions) {
  asserter(agentId !== null, 'Agent identifier must be provided.');
  asserter(agentEpoch > 0, 'Agent epoch must be positive.');
  asserter(peerNodes.length > 0, 'At least one peer node is required.');

  const options = configOptions || {};
  let proposalTimeoutMs = options.proposalTimeoutMs || 3000; // Time limit for phase responses.
  const requiredConsensus = options.requiredConsensus || calculateMajorityThreshold;

  // Operational metrics
  let totalPhaseExecutions = 0;
  let totalMessagesSent = 0;
  let totalMessagesReceived = 0;
  let totalBadMessages = 0;
  let totalVotesCounted = 0;
  let totalDuplicateVotes = 0;
  let totalPhaseTimeouts = 0;

  /**
   * Initiates the two-phase commit process for a given value.
   * @param {any} proposedValue The value to be proposed.
   * @param {Function} completionCallback Callback function (err, result).
   * @returns {object} An object with a message handling method.
   */
  function initiateProposal(proposedValue, completionCallback) {
    const proposalContext = {};
    let responseTimer = null;
    let currentBallotId = generateNextBallot();

    // Track the highest accepted ballot and value across phases.
    let highestAcceptedBallot = MIN_BALLOT;
    let finalAcceptedValue = null;

    // First, the prepare phase.
    executePhase(REQUEST_PREPARE, RESPONSE_PREPARED, proposedValue,
      function(phaseError, phaseInfo) {
        if (phaseError) {
          console.warn(`Prepare phase failed for slot ${slotId}:`, phaseError);
          completionCallback(phaseError, phaseInfo);
        } else {
          // If a value was already accepted by a higher ballot, use that.
          if (phaseInfo.acceptedBallot && phaseInfo.acceptedValue !== undefined) {
            proposedValue = phaseInfo.acceptedValue;
            highestAcceptedBallot = phaseInfo.acceptedBallot; // Update for next phase
          }
          // Now, the commit phase.
          executePhase(REQUEST_COMMIT, RESPONSE_COMMITTED, proposedValue, completionCallback);
        }
      });

    /**
     * Executes a single phase (prepare or commit) of the Paxos protocol.
     * @param {number} messageType The type of message for this phase (e.g., REQUEST_PREPARE).
     * @param {number} successMessageType The expected success response type (e.g., RESPONSE_PREPARED).
     * @param {any} valueForPhase The value relevant to this phase (e.g., proposed value).
     * @param {Function} phaseCompletionCallback Callback for phase completion (err, info).
     */
    function executePhase(messageType, successMessageType, valueForPhase, phaseCompletionCallback) {
      totalPhaseExecutions++;

      const phaseRequest = {
        slot: slotId,
        type: messageType,
        ballot: currentBallotId,
        initiator: agentId,
      };

      if (messageType === REQUEST_COMMIT) {
        phaseRequest.value = valueForPhase;
      }

      const totalPeers = peerNodes.length;
      messageRelay.broadcast(peerNodes, phaseRequest);
      totalMessagesSent += totalPeers;
      resetPhaseTimer();

      const affirmativeCountNeeded = requiredConsensus(totalPeers);
      const negativeCountNeeded = totalPeers - affirmativeCountNeeded + 1;

      // Structure to track votes and required counts.
      const voteTracker = {
        [successMessageType]: {
          received: [],
          needed: affirmativeCountNeeded,
          result: null // Success result
        },
        [NEGATIVE_ACK]: {
          received: [],
          needed: negativeCountNeeded,
          result: 'rejection' // Failure result
        }
      };

      proposalContext.handleIncomingMessage = function(messageSource, responseMsg) {
        if (!messageSource || !responseMsg) {
          totalBadMessages++;
          return; // Ignore invalid messages.
        }

        totalMessagesReceived++;

        // Ignore messages if the timer has already expired or been cleared.
        if (!responseTimer) {
          return;
        }

        clearTimeout(responseTimer);
        responseTimer = null; // Mark timer as inactive.

        // Pre-process response if an option is provided.
        const processedResponse = options.on_msg_preprocess
          ? options.on_msg_preprocess(messageSource, responseMsg)
          : responseMsg;

        // Check if message is from a known peer, valid, and matches current ballot.
        if (peerNodes.includes(messageSource) &&
            processedResponse &&
            areBallotsEqual(processedResponse.ballot, currentBallotId) &&
            voteTracker[processedResponse.type]) {

          const categoryInfo = voteTracker[processedResponse.type];
          const receivedVotes = categoryInfo.received;

          // Ensure we only count unique votes from each source.
          if (!receivedVotes.includes(messageSource)) {
            totalVotesCounted++;

            // For prepare phase, update highest accepted value seen.
            if (messageType === REQUEST_PREPARE &&
                isBallotGreaterOrEqual(processedResponse.acceptedBallot, highestAcceptedBallot)) {
              highestAcceptedBallot = processedResponse.acceptedBallot;
              finalAcceptedValue = processedResponse.acceptedValue;
            }

            receivedVotes.push(messageSource);

            // Check if quorum for this category has been reached.
            if (receivedVotes.length >= categoryInfo.needed) {
              if (options.on_phase_complete) {
                options.on_phase_complete(successMessageType, categoryInfo.result);
              }
              const responseData = {
                highestProposedBallot: processedResponse.highestProposedBallot,
                acceptedBallot: highestAcceptedBallot,
                acceptedValue: finalAcceptedValue
              };
              phaseCompletionCallback(categoryInfo.result, responseData);
              return; // Phase completed, no more processing for this phase.
            }
          } else {
            totalDuplicateVotes++;
          }
        } else {
          totalBadMessages++; // Message was not valid or from an unknown source.
        }
        
        // If phase not completed, restart timer for next incoming message.
        resetPhaseTimer();
      };

      /** Resets the timeout timer for the current phase. */
      function resetPhaseTimer() {
        asserter(!responseTimer, 'Timer should be null before setting.');
        responseTimer = setTimeout(() => {
          totalPhaseTimeouts++;
          if (responseTimer !== null) { // Check if it hasn't been cleared by a late message.
            responseTimer = null;
            console.warn(`Phase timeout for slot ${slotId}, ballot ${currentBallotId.sequence}`);
            phaseCompletionCallback('timeout');
          }
        }, proposalTimeoutMs);
      }
    }

    return proposalContext; // Provides the handleIncomingMessage method.
  }

  let activeBallotId = createBallot(-1, agentId, agentEpoch);

  /** Generates the next ballot identifier for this proposer. */
  function generateNextBallot() {
    activeBallotId = incrementBallot(activeBallotId);
    return activeBallotId;
  }

  /**
   * Retrieves current operational statistics.
   * @returns {object} An object containing various statistics.
   */
  function getStatistics() {
    return {
      totalPhaseExecutions,
      totalMessagesSent,
      totalMessagesReceived,
      totalBadMessages,
      totalVotesCounted,
      totalDuplicateVotes,
      totalPhaseTimeouts
    };
  }

  return { initiateProposal, getStatistics };
};

// ----------------------------------------------------------------

exports.createAcceptanceHandler = function(dataStore, messageRelay, handlerConfig) {
  const options = handlerConfig || {};
  const majorityCalculator = options.majorityCalculator || calculateMajorityThreshold;

  // Acceptance Handler Metrics
  let totalInvalidRequests = 0;
  let totalUnknownRequestTypes = 0;
  let totalReceivedMessages = 0;
  let totalSentResponses = 0;
  let totalPrepareRequests = 0;
  let totalPreparedResponses = 0;
  let totalCommitRequests = 0;
  let totalCommittedResponses = 0;
  let totalStorageErrors = 0;
  let totalBallotBehindNacks = 0;

  /**
   * Processes an incoming message for the acceptor role.
   * @param {string} messageSource The sender of the message.
   * @param {object} requestObject The incoming request message.
   */
  function processIncomingMessage(messageSource, requestObject) {
    totalReceivedMessages++;
    if (!requestObject || requestObject.slot === undefined || requestObject.ballot === undefined) {
      totalInvalidRequests++;
      return; // Malformed request.
    }

    // Acceptor's primary role: respond to prepare/commit requests with higher ballots.
    dataStore.slot_read(requestObject.slot, (readError, currentSlotStatus) => {
      if (readError) {
        totalStorageErrors++;
        dispatchFullResponse(requestObject, NEGATIVE_ACK, {});
        return;
      }

      let maxProposedBallot = currentSlotStatus.highest_proposed_ballot;

      // If the incoming request's ballot is greater than or equal to the highest seen.
      if (isBallotGreaterOrEqual(requestObject.ballot, maxProposedBallot)) {
        switch (requestObject.type) {
          case REQUEST_PREPARE:
            totalPrepareRequests++;
            dataStore.slot_save_highest_proposed_ballot(
              requestObject.slot, requestObject.ballot,
              (saveError) => {
                if (!saveError) {
                  totalPreparedResponses++;
                  maxProposedBallot = requestObject.ballot; // Update locally.
                  sendResponse(RESPONSE_PREPARED, {
                    acceptedBallot: currentSlotStatus.accepted_ballot,
                    acceptedValue: currentSlotStatus.accepted_val
                  });
                } else {
                  totalStorageErrors++;
                  sendResponse(NEGATIVE_ACK);
                }
              });
            break;
          case REQUEST_COMMIT:
            totalCommitRequests++;
            dataStore.slot_save_accepted(
              requestObject.slot, requestObject.ballot, requestObject.value,
              (saveError) => {
                if (!saveError) {
                  totalCommittedResponses++;
                  maxProposedBallot = requestObject.ballot; // Update locally.
                  sendResponse(RESPONSE_COMMITTED, {
                    acceptedBallot: requestObject.ballot,
                    acceptedValue: requestObject.value
                  });
                } else {
                  totalStorageErrors++;
                  sendResponse(NEGATIVE_ACK);
                }
              });
            break;
          default:
            totalUnknownRequestTypes++;
            sendResponse(NEGATIVE_ACK);
            break;
        }
      } else {
        // Request's ballot is behind, NACK it.
        totalBallotBehindNacks++;
        sendResponse(NEGATIVE_ACK);
      }

      /**
       * Constructs and dispatches a response message.
       * @param {number} responseType The type of response (e.g., RESPONSE_PREPARED).
       * @param {object} [additionalData={}] Any additional data for the response.
       */
      function sendResponse(responseType, additionalData = {}) {
        const fullResponseData = { ...additionalData, highestProposedBallot: maxProposedBallot };
        dispatchFullResponse(requestObject, responseType, fullResponseData);
      }
    });
  }

  /**
   * Finalizes and sends the response back to the initiator.
   * @param {object} originalRequest The original request object.
   * @param {number} responseKind The type of response to send.
   * @param {object} messageBody The body of the response message.
   */
  function dispatchFullResponse(originalRequest, responseKind, messageBody) {
    let finalMessage = {
      type: responseKind,
      slot: originalRequest.slot,
      ballot: originalRequest.ballot,
      ...messageBody
    };
    if (options.respond_preprocess) {
      finalMessage = options.respond_preprocess(finalMessage);
    }
    messageRelay.send(originalRequest.initiator, finalMessage);
    totalSentResponses++;
  }

  /**
   * Retrieves current operational statistics for the acceptor.
   * @returns {object} An object containing various statistics.
   */
  function getStatistics() {
    return {
      totalInvalidRequests,
      totalUnknownRequestTypes,
      totalReceivedMessages,
      totalSentResponses,
      totalPrepareRequests,
      totalPreparedResponses,
      totalCommitRequests,
      totalCommittedResponses,
      totalStorageErrors,
      totalBallotBehindNacks
    };
  }

  return { processIncomingMessage, getStatistics };
};

// ----------------------------------------------------------------

/**
 * Calculates the simple majority threshold for a given number of participants.
 * @param {number} numParticipants The total number of participants.
 * @returns {number} The number of votes required for a majority.
 */
function calculateMajorityThreshold(numParticipants) {
  return Math.floor(numParticipants / 2) + 1;
}
exports.calculateMajorityThreshold = calculateMajorityThreshold;

/**
 * Checks if an item is present in a collection.
 * @param {Array<any>} collection The array to search within.
 * @param {any} item The item to search for.
 * @returns {boolean} True if the item is found, false otherwise.
 */
function checkCollectionMembership(collection, item) {
  return collection.includes(item);
}
exports.checkCollectionMembership = checkCollectionMembership;

// ----------------------------------------------------------------

// Ballot structure fields (using object properties for clarity)
const BALLOT_FIELD_SEQUENCE           = 'sequence';
const BALLOT_FIELD_PROPOSER_ID        = 'proposerId';
const BALLOT_FIELD_PROPOSER_RESTARTS  = 'proposerRestarts';

/**
 * Creates a new ballot identifier object.
 * @param {number} sequence The sequence number of the ballot.
 * @param {string} proposerId The identifier of the proposer.
 * @param {number} proposerRestarts The number of restarts for the proposer.
 * @returns {object} A ballot object.
 */
function createBallot(sequence, proposerId, proposerRestarts) {
  return {
    [BALLOT_FIELD_SEQUENCE]: sequence,
    [BALLOT_FIELD_PROPOSER_ID]: proposerId,
    [BALLOT_FIELD_PROPOSER_RESTARTS]: proposerRestarts
  };
}

const MIN_BALLOT = createBallot(-1, -1, -1); // Represents the lowest possible ballot.

/**
 * Increments the sequence number of a ballot to create a new, higher ballot.
 * @param {object} oldBallot The ballot to increment.
 * @returns {object} A new ballot object with an incremented sequence.
 */
function incrementBallot(oldBallot) {
  return createBallot(oldBallot[BALLOT_FIELD_SEQUENCE] + 1,
                      oldBallot[BALLOT_FIELD_PROPOSER_ID],
                      oldBallot[BALLOT_FIELD_PROPOSER_RESTARTS]);
}

/**
 * Compares two ballots to check if ballot 'a' is greater than or equal to ballot 'b'.
 * Ballots are compared lexicographically: sequence, then proposerId, then proposerRestarts.
 * @param {object|null} ballotA The first ballot.
 * @param {object|null} ballotB The second ballot.
 * @returns {boolean} True if ballot 'a' is >= ballot 'b', false otherwise.
 */
function isBallotGreaterOrEqual(ballotA, ballotB) {
  const a = ballotA || MIN_BALLOT;
  const b = ballotB || MIN_BALLOT;

  if (a[BALLOT_FIELD_SEQUENCE] > b[BALLOT_FIELD_SEQUENCE]) return true;
  if (a[BALLOT_FIELD_SEQUENCE] < b[BALLOT_FIELD_SEQUENCE]) return false;

  if (a[BALLOT_FIELD_PROPOSER_ID] > b[BALLOT_FIELD_PROPOSER_ID]) return true;
  if (a[BALLOT_FIELD_PROPOSER_ID] < b[BALLOT_FIELD_PROPOSER_ID]) return false;

  if (a[BALLOT_FIELD_PROPOSER_RESTARTS] > b[BALLOT_FIELD_PROPOSER_RESTARTS]) return true;
  if (a[BALLOT_FIELD_PROPOSER_RESTARTS] < b[BALLOT_FIELD_PROPOSER_RESTARTS]) return false;

  return true; // Ballots are equal.
}

/**
 * Compares two ballots for exact equality.
 * @param {object} ballotA The first ballot.
 * @param {object} ballotB The second ballot.
 * @returns {boolean} True if ballots are identical, false otherwise.
 */
function areBallotsEqual(ballotA, ballotB) {
  return ballotA[BALLOT_FIELD_SEQUENCE] === ballotB[BALLOT_FIELD_SEQUENCE] &&
         ballotA[BALLOT_FIELD_PROPOSER_ID] === ballotB[BALLOT_FIELD_PROPOSER_ID] &&
         ballotA[BALLOT_FIELD_PROPOSER_RESTARTS] === ballotB[BALLOT_FIELD_PROPOSER_RESTARTS];
}

exports.createBallot = createBallot;
exports.incrementBallot = incrementBallot;
exports.isBallotGreaterOrEqual = isBallotGreaterOrEqual;
exports.areBallotsEqual = areBallotsEqual;