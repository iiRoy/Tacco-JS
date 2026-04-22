const CommMessage = Object.freeze({
  NACK_RESPONSE_CODE: 1,
  PROPOSE_REQUEST_CODE: 10,
  PROPOSED_RESPONSE_CODE: 11,
  ACCEPT_REQUEST_CODE: 20,
  ACCEPTED_RESPONSE_CODE: 21
});

class ProposalId {
  constructor(sequenceNumber, uniqueIdentifier, nodeResets) {
    if (typeof sequenceNumber !== 'number' || typeof uniqueIdentifier !== 'string' || typeof nodeResets !== 'number') {
      throw new Error('Invalid ProposalId construction parameters.');
    }
    this.sequenceNumber = sequenceNumber;
    this.uniqueIdentifier = uniqueIdentifier;
    this.nodeResets = nodeResets;
  }

  advanceId() {
    return new ProposalId(this.sequenceNumber + 1, this.uniqueIdentifier, this.nodeResets);
  }

  isGreaterOrEqual(otherId) {
    if (!otherId) {
      return true;
    }
    if (this.sequenceNumber > otherId.sequenceNumber) return true;
    if (this.sequenceNumber < otherId.sequenceNumber) return false;
    if (this.uniqueIdentifier > otherId.uniqueIdentifier) return true;
    if (this.uniqueIdentifier < otherId.uniqueIdentifier) return false;
    return this.nodeResets >= otherId.nodeResets;
  }

  isEqual(otherId) {
    if (!otherId) return false;
    return this.sequenceNumber === otherId.sequenceNumber &&
           this.uniqueIdentifier === otherId.uniqueIdentifier &&
           this.nodeResets === otherId.nodeResets;
  }

  serialize() {
    return `${this.sequenceNumber}:${this.uniqueIdentifier}:${this.nodeResets}`;
  }

  static deserialize(serializedId) {
    const parts = serializedId.split(':');
    if (parts.length !== 3) throw new Error('Invalid serialized ProposalId string.');
    return new ProposalId(Number(parts[0]), parts[1], Number(parts[2]));
  }
}

const BASE_PROPOSAL_ID = new ProposalId(-1, '', -1);

const calculateThreshold = (totalParticipants) => Math.floor(totalParticipants / 2) + 1;

const containsElement = (collection, item) => collection.includes(item);

const ensure = (condition, message) => {
  if (!condition) {
    throw new Error(`Integrity Check Failed: ${message}`);
  }
};

const createProposerManager = (
  nodeId,
  nodeResets,
  resourceSlot,
  peerAddresses,
  networkInterface,
  configOptions = {}
) => {
  ensure(nodeId !== null, 'Node ID must be provided for proposer.');
  ensure(nodeResets > 0, 'Node resets count must be positive for proposer.');
  ensure(peerAddresses.length > 0, 'At least one peer address is required for proposer.');

  const operationalSettings = {
    activityTimeout: configOptions.activityTimeout || 3000,
    consensusThreshold: configOptions.consensusThreshold || calculateThreshold
  };

  const performanceMetrics = {
    phaseInitiations: 0,
    phaseIterations: 0,
    messagesDispatched: 0,
    messagesReceived: 0,
    messageErrors: 0,
    affirmativeVotes: 0,
    duplicateVotes: 0,
    operationTimeouts: 0
  };

  let currentProposalId = new ProposalId(-1, nodeId, nodeResets);

  const generateNextProposalId = () => {
    currentProposalId = currentProposalId.advanceId();
    return currentProposalId;
  };

  class PhaseCoordinator {
    constructor(requestType, positiveResponseType, additionalRequestData, roundId) {
      this.requestType = requestType;
      this.positiveResponseType = positiveResponseType;
      this.additionalRequestData = additionalRequestData;
      this.currentRoundId = roundId;

      this.activePhaseTimer = null;
      this.highestAcceptedId = BASE_PROPOSAL_ID;
      this.highestAcceptedValue = null;

      const requiredPositiveVotes = operationalSettings.consensusThreshold(peerAddresses.length);
      const requiredNegativeVotes = peerAddresses.length - requiredPositiveVotes + 1;

      this.voteCounts = new Map();
      this.voteCounts.set(positiveResponseType, { voters: new Set(), needed: requiredPositiveVotes, outcome: null });
      this.voteCounts.set(CommMessage.NACK_RESPONSE_CODE, { voters: new Set(), needed: requiredNegativeVotes, outcome: 'rejected' });

      this.phasePromise = new Promise((resolve) => {
        this.promiseResolver = resolve;
      });
    }

    initiatePhase() {
      performanceMetrics.phaseInitiations++;

      const outboundPayload = {
        resource: resourceSlot,
        type: this.requestType,
        proposal: this.currentRoundId.serialize(),
        originator: nodeId,
        ...this.additionalRequestData
      };

      networkInterface.broadcast(peerAddresses, outboundPayload);
      performanceMetrics.messagesDispatched += peerAddresses.length;

      this.resetPhaseTimer();
      return this.phasePromise;
    }

    processIncomingResponse(source, incomingMessage) {
      performanceMetrics.messagesReceived++;

      if (!this.activePhaseTimer) {
        return;
      }

      if (configOptions.onMessagePreprocess) {
        incomingMessage = configOptions.onMessagePreprocess(source, incomingMessage);
      }

      const messageProposalId = incomingMessage.proposal ? ProposalId.deserialize(incomingMessage.proposal) : null;
      if (containsElement(peerAddresses, source) &&
          incomingMessage != null &&
          messageProposalId && messageProposalId.isEqual(this.currentRoundId) &&
          this.voteCounts.has(incomingMessage.type)) {

        const voteEntry = this.voteCounts.get(incomingMessage.type);

        if (!voteEntry.voters.has(source)) {
          performanceMetrics.affirmativeVotes++;

          if (incomingMessage.type === CommMessage.PROPOSED_RESPONSE_CODE &&
              incomingMessage.acceptedProposal &&
              incomingMessage.acceptedValue !== undefined &&
              ProposalId.deserialize(incomingMessage.acceptedProposal).isGreaterOrEqual(this.highestAcceptedId)) {
            this.highestAcceptedId = ProposalId.deserialize(incomingMessage.acceptedProposal);
            this.highestAcceptedValue = incomingMessage.acceptedValue;
          }

          voteEntry.voters.add(source);

          if (voteEntry.voters.size >= voteEntry.needed) {
            this.clearPhaseTimer();
            if (configOptions.onPhaseCompletion) {
              configOptions.onPhaseCompletion(incomingMessage.type, voteEntry.outcome);
            }
            this.promiseResolver({
              error: voteEntry.outcome,
              details: {
                topProposedId: this.currentRoundId,
                acceptedId: this.highestAcceptedId,
                acceptedValue: this.highestAcceptedValue,
                highestProposedBallot: incomingMessage.highestProposedBallot
              }
            });
            return;
          }
        } else {
          performanceMetrics.duplicateVotes++;
        }
      } else {
        performanceMetrics.messageErrors++;
      }

      performanceMetrics.phaseIterations++;
      this.resetPhaseTimer();
    }

    resetPhaseTimer() {
      this.clearPhaseTimer();
      this.activePhaseTimer = setTimeout(() => {
        performanceMetrics.operationTimeouts++;
        if (this.activePhaseTimer !== null) {
          this.activePhaseTimer = null;
          this.promiseResolver({ error: 'timeout' });
        }
      }, operationalSettings.activityTimeout);
    }

    clearPhaseTimer() {
      if (this.activePhaseTimer) {
        clearTimeout(this.activePhaseTimer);
        this.activePhaseTimer = null;
      }
    }
  }

  const initiateConsensusRound = (desiredValue, completionListener) => {
    let currentRoundHandle = {};
    let currentRoundId = generateNextProposalId();
    let acceptedValFromPropose = null;

    (async () => {
      let firstPhaseCoordinator = new PhaseCoordinator(
        CommMessage.PROPOSE_REQUEST_CODE,
        CommMessage.PROPOSED_RESPONSE_CODE,
        {},
        currentRoundId
      );
      currentRoundHandle.onMessage = firstPhaseCoordinator.processIncomingResponse.bind(firstPhaseCoordinator);

      const firstPhaseOutcome = await firstPhaseCoordinator.initiatePhase();

      if (firstPhaseOutcome.error) {
        completionListener(firstPhaseOutcome.error, firstPhaseOutcome.details);
        return;
      }

      if (firstPhaseOutcome.details.acceptedId &&
          firstPhaseOutcome.details.acceptedId.isGreaterOrEqual(BASE_PROPOSAL_ID) &&
          firstPhaseOutcome.details.acceptedValue !== null) {
        acceptedValFromPropose = firstPhaseOutcome.details.acceptedValue;
      }

      let secondPhaseCoordinator = new PhaseCoordinator(
        CommMessage.ACCEPT_REQUEST_CODE,
        CommMessage.ACCEPTED_RESPONSE_CODE,
        { "payload": acceptedValFromPropose !== null ? acceptedValFromPropose : desiredValue },
        currentRoundId
      );
      currentRoundHandle.onMessage = secondPhaseCoordinator.processIncomingResponse.bind(secondPhaseCoordinator);

      const secondPhaseOutcome = await secondPhaseCoordinator.initiatePhase();
      completionListener(secondPhaseOutcome.error, secondPhaseOutcome.details);
    })();

    return currentRoundHandle;
  };

  const retrievePerformanceStats = () => ({ ...performanceMetrics });

  return { initiateConsensusRound, retrievePerformanceStats };
};

const createAcceptorService = (dataStore, networkMediator, configuration = {}) => {
  const serviceSettings = {
    consensusThreshold: configuration.consensusThreshold || calculateThreshold
  };

  const serviceMetrics = {
    invalidRequests: 0,
    invalidRequestType: 0,
    messagesReceived: 0,
    messagesSent: 0,
    proposalAttempts: 0,
    proposalSuccesses: 0,
    acceptanceAttempts: 0,
    acceptanceSuccesses: 0,
    dataStoreFailures: 0,
    behindCurrentProposal: 0
  };

  const handleIncomingMessage = async (sourceAddress, requestEnvelope) => {
    serviceMetrics.messagesReceived++;

    if (!requestEnvelope || requestEnvelope.resource == null || requestEnvelope.proposal == null) {
      serviceMetrics.invalidRequests++;
      return;
    }

    const currentSlot = requestEnvelope.resource;
    const incomingProposalId = ProposalId.deserialize(requestEnvelope.proposal);
    const requestKind = requestEnvelope.type;

    try {
      const slotData = await dataStore.retrieveSlotState(currentSlot);
      let currentHighestProposedId = slotData.highestProposedBallot ? ProposalId.deserialize(slotData.highestProposedBallot) : BASE_PROPOSAL_ID;

      if (incomingProposalId.isGreaterOrEqual(currentHighestProposedId)) {
        let responsePayload = {
          acceptedProposal: slotData.acceptedBallot,
          acceptedValue: slotData.acceptedValue
        };

        if (requestKind === CommMessage.PROPOSE_REQUEST_CODE) {
          serviceMetrics.proposalAttempts++;
          await dataStore.updateHighestProposedId(currentSlot, incomingProposalId.serialize());
          serviceMetrics.proposalSuccesses++;
          currentHighestProposedId = incomingProposalId;
          dispatchResponse(requestEnvelope, CommMessage.PROPOSED_RESPONSE_CODE, responsePayload, currentHighestProposedId);

        } else if (requestKind === CommMessage.ACCEPT_REQUEST_CODE) {
          serviceMetrics.acceptanceAttempts++;
          await dataStore.saveAcceptedValue(currentSlot, incomingProposalId.serialize(), requestEnvelope.payload);
          serviceMetrics.acceptanceSuccesses++;
          currentHighestProposedId = incomingProposalId;
          dispatchResponse(requestEnvelope, CommMessage.ACCEPTED_RESPONSE_CODE, {
            acceptedProposal: incomingProposalId.serialize(),
            acceptedValue: requestEnvelope.payload
          }, currentHighestProposedId);
        } else {
          serviceMetrics.invalidRequestType++;
          dispatchResponse(requestEnvelope, CommMessage.NACK_RESPONSE_CODE, {}, currentHighestProposedId);
        }
      } else {
        serviceMetrics.behindCurrentProposal++;
        dispatchResponse(requestEnvelope, CommMessage.NACK_RESPONSE_CODE, {}, currentHighestProposedId);
      }
    } catch (error) {
      serviceMetrics.dataStoreFailures++;
      dispatchResponse(requestEnvelope, CommMessage.NACK_RESPONSE_CODE, {}, BASE_PROPOSAL_ID);
    }
  };

  const dispatchResponse = (originalRequest, responseKind, data, highestIdForResponse) => {
    let outgoingMessage = { ...data };
    outgoingMessage.type = responseKind;
    outgoingMessage.resource = originalRequest.resource;
    outgoingMessage.proposal = originalRequest.proposal;
    outgoingMessage.highestProposedBallot = highestIdForResponse.serialize();

    if (configuration.responsePreprocess) {
      outgoingMessage = configuration.responsePreprocess(outgoingMessage);
    }
    networkMediator.send(originalRequest.originator, outgoingMessage);
    serviceMetrics.messagesSent++;
  };

  const getServiceMetrics = () => ({ ...serviceMetrics });

  return { handleIncomingMessage, getServiceMetrics };
};

module.exports = {
  NACK_RESPONSE_CODE: CommMessage.NACK_RESPONSE_CODE,
  PROPOSE_REQUEST_CODE: CommMessage.PROPOSE_REQUEST_CODE,
  PROPOSED_RESPONSE_CODE: CommMessage.PROPOSED_RESPONSE_CODE,
  ACCEPT_REQUEST_CODE: CommMessage.ACCEPT_REQUEST_CODE,
  ACCEPTED_RESPONSE_CODE: CommMessage.ACCEPTED_RESPONSE_CODE,

  createProposerManager: createProposerManager,
  createAcceptorService: createAcceptorService,

  computeMajority: calculateThreshold,
  checkInCollection: containsElement,

  ProposalIdentifier: ProposalId,
  INITIAL_PROPOSAL_ID: BASE_PROPOSAL_ID,
};