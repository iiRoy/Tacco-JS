var assert = require ('assert');

// Define various message types and their corresponding numeric codes.
// These are exported for external use.
var RES_NACK = exports.RES_NACK = 1; // Negative Acknowledgment
var REQ_PROPOSE = exports.REQ_PROPOSE = 10; // Request to Propose
var RES_PROPOSED = exports.RES_PROPOSED = 11; // Response: Proposed
var REQ_ACCEPT = exports.REQ_ACCEPT = 20; // Request to Accept
var RES_ACCEPTED = exports.RES_ACCEPTED = 21; // Response: Accepted

// The main proposer function.
// It orchestrates the Paxos propose and accept phases.
exports.proposer = function (
  node_name,
  node_restarts,
  slot,
  acceptors,
  comm,
  opts
) {
  // --- Input Validation ---
  assert(node_name != null); // Node name must be provided.
  assert(node_restarts > 0); // Node restarts count must be positive.
  assert(acceptors.length > 0); // Must have at least one acceptor.

  // --- Configuration and Defaults ---
  opts = opts || {}; // Initialize options if not provided.
  var proposer_timeout = opts.proposer_timeout || 3000; // Default timeout for phases.
  var quorum = opts.quorum || majority; // Quorum function, defaults to simple majority.

  // --- Statistics Counters ---
  var tot_propose_phase = 0; // Total times a propose/accept phase was initiated.
  var tot_propose_phase_loop = 0; // Total times the phase loop iterated (excluding completion).
  var tot_propose_send = 0; // Total messages sent during propose/accept.
  var tot_propose_recv = 0; // Total messages received during propose/accept.
  var tot_propose_recv_err = 0; // Total erroneous/ignored messages received.
  var tot_propose_vote = 0; // Total valid votes counted.
  var tot_propose_vote_repeat = 0; // Total duplicate votes from same source.
  var tot_propose_timeout = 0; // Total phase timeouts.

  /**
   * Initiates the Paxos proposal process for a given value.
   * @param {any} val - The value to be proposed.
   * @param {function} cb - Callback function (err, info).
   */
  function propose (val, cb) {
    var self = {}; // Object to hold instance-specific methods (like on_msg).
    var timer = null; // Timer for phase timeouts.
    var ballot = next_ballot(); // Generate a new ballot for this proposal.

    var accepted_ballot = BOTTOM_BALLOT; // Highest accepted ballot seen so far.
    var accepted_val = null; // Value associated with the highest accepted ballot.

    // This block executes the two main phases of Paxos: Propose and Accept.
    // They are sequential and share similar logic.

    // Phase 1: Propose (REQ_PROPOSE)
    // The proposer sends a proposal request to acceptors.
    phase(
      REQ_PROPOSE,
      RES_PROPOSED,
      {}, // No specific value needed for the propose request itself.
      function (err, info) {
        if (err) {
          // If the propose phase fails (e.g., timeout or NACKs),
          // the overall proposal fails.
          cb(err, info);
        } else {
          // Propose phase successful.
          // Check if any acceptor has already accepted a value with a higher ballot.
          if (info.accepted_ballot && info.accepted_val) {
            // If so, we must propose that previously accepted value
            // to ensure consistency (Paxos P-C property).
            val = info.accepted_val;
          }

          // Phase 2: Accept (REQ_ACCEPT)
          // The proposer sends an accept request for the determined value.
          phase(REQ_ACCEPT, RES_ACCEPTED, { "val": val }, cb);
        }
      }
    );

    /**
     * Executes a single Paxos phase (either Propose or Accept).
     * @param {number} kind - The request kind (REQ_PROPOSE or REQ_ACCEPT).
     * @param {number} yea_kind - The success response kind (RES_PROPOSED or RES_ACCEPTED).
     * @param {object} req_data - Additional data for the request message.
     * @param {function} cb_phase - Callback for this phase (err, info).
     */
    function phase (kind, yea_kind, req_data, cb_phase) {
      tot_propose_phase = tot_propose_phase + 1; // Increment phase counter.

      // Construct the request message.
      var req = req_data;
      req.slot = slot; // Which slot this proposal is for.
      req.kind = kind; // The type of request.
      req.ballot = ballot; // The current ballot number.
      req.sender = node_name; // The sender's identifier.

      // Broadcast the request to all acceptors.
      comm.broadcast(acceptors, req);
      tot_propose_send = tot_propose_send + acceptors.length; // Update send statistics.
      restart_timer(); // Start or restart the phase timeout timer.

      // Determine quorum requirements.
      var yea_needed = quorum(acceptors.length); // Number of 'yea' votes required.
      var nay_needed = acceptors.length - yea_needed + 1; // Number of 'nay' votes to reject.

      // Tally object to track votes for different response kinds.
      // Format: { kind: [ received_votes_array, needed_count, error_message ] }
      var tally = {};
      tally[yea_kind] = [ [], yea_needed, null ]; // Success votes.
      tally[RES_NACK] = [ [], nay_needed, "rejected" ]; // Rejection votes.

      /**
       * Handler for incoming messages from acceptors during a phase.
       * @param {string} src - Source of the message.
       * @param {object} res - The response message from the acceptor.
       */
      self.on_msg = function (src, res) {
        tot_propose_recv = tot_propose_recv + 1; // Increment receive counter.

        // If the timer is null, it means the phase has already completed or timed out.
        // Ignore late messages.
        if (!timer) {
          return;
        }

        // A valid message was received, so clear the current timeout.
        clearTimeout(timer);
        timer = null;

        // Apply any pre-processing function defined in options.
        if (opts.on_msg_preprocess) {
          res = opts.on_msg_preprocess(src, res);
        }

        // Check if the message is valid for this phase:
        // 1. Source is a known acceptor.
        // 2. Response is not null.
        // 3. Ballot in response matches our current ballot.
        // 4. Response kind is recognized (yea_kind or RES_NACK).
        if (
          is_member(acceptors, src) &&
          res != null &&
          ballot_eq(res.ballot, ballot) &&
          tally[res.kind] != null
        ) {
          var vkind = tally[res.kind]; // Get the tally entry for this response kind.
          var votes = vkind[0]; // Array of sources that have voted this kind.

          // Check if this source has already voted for this phase.
          if (!is_member(votes, src)) {
            tot_propose_vote = tot_propose_vote + 1; // Count as a new valid vote.

            // If this is a RES_PROPOSED message, update the highest accepted ballot/value
            // seen so far, if the acceptor's accepted_ballot is higher.
            if (ballot_gte(res.accepted_ballot, accepted_ballot)) {
              accepted_ballot = res.accepted_ballot;
              accepted_val = res.accepted_val;
            }

            votes[votes.length] = src; // Add source to the list of votes.

            // Check if quorum has been reached for this response kind.
            if (votes.length >= vkind[1]) {
              // Quorum reached! Phase complete.
              if (opts.on_phase_complete) {
                opts.on_phase_complete(yea_kind, vkind[2]);
              }
              // Invoke the phase callback with success or error.
              cb_phase(
                vkind[2], // Error message if NACK quorum, otherwise null.
                {
                  "highest_proposed_ballot": res.highest_proposed_ballot,
                  "accepted_ballot": accepted_ballot,
                  "accepted_val": accepted_val
                }
              );
              return; // Phase is complete, no more processing for this phase.
            }
          } else {
            // This source has already voted in this phase, ignore.
            tot_propose_vote_repeat = tot_propose_vote_repeat + 1;
          }
        } else {
          // Message was invalid or ignored.
          tot_propose_recv_err = tot_propose_recv_err + 1;
        }

        // If phase is not complete, continue waiting and restart timer.
        tot_propose_phase_loop = tot_propose_phase_loop + 1;
        restart_timer();
      };

      /**
       * Restarts the timeout timer for the current phase.
       * If the timer fires, the phase is considered timed out.
       */
      function restart_timer () {
        assert(!timer); // Should not have an active timer when restarting.
        timer = setTimeout(function () {
          tot_propose_timeout = tot_propose_timeout + 1; // Increment timeout counter.
          if (timer != null) {
            timer = null; // Clear the timer reference.
            cb_phase('timeout'); // Signal timeout to the phase callback.
          }
        }, proposer_timeout);
      }
    }

    return self; // Returns object with on_msg handler.
  }

  // --- Ballot Management ---
  // Initialize the current ballot for this proposer.
  // The sequence number is -1 because ballot_inc will increment it to 0.
  var cur_ballot = ballot_mk(-1, node_name, node_restarts);

  /**
   * Generates the next ballot number for this proposer.
   * Ensures ballots are monotonically increasing for this proposer.
   * @returns {Array} The next ballot.
   */
  function next_ballot () {
    cur_ballot = ballot_inc(cur_ballot);
    return cur_ballot;
  }

  /**
   * Returns the current statistics for the proposer.
   * @returns {object} An object containing all proposer-related stats.
   */
  function stats () {
    return {
      "tot_propose_phase": tot_propose_phase,
      "tot_propose_phase_loop": tot_propose_phase_loop,
      "tot_propose_send": tot_propose_send,
      "tot_propose_recv": tot_propose_recv,
      "tot_propose_recv_err": tot_propose_recv_err,
      "tot_propose_vote": tot_propose_vote,
      "tot_propose_vote_repeat": tot_propose_vote_repeat,
      "tot_propose_timeout": tot_propose_timeout
    };
  }

  // Return the public API for the proposer.
  return { "propose": propose, "stats": stats };
};

// ----------------------------------------------------------------------------------------------------
// Acceptor Module
// ----------------------------------------------------------------------------------------------------

/**
 * Initializes an acceptor instance.
 * @param {object} storage - Storage mechanism for slot states.
 * @param {object} comm - Communication module for sending messages.
 * @param {object} opts - Optional configuration.
 * @returns {object} An object with an `on_msg` handler and `stats` function.
 */
exports.acceptor = function (storage, comm, opts) {
  opts = opts || {};
  var quorum = opts.quorum || majority; // Quorum function (not directly used by acceptor, but often available).

  // --- Statistics Counters for Acceptor ---
  var tot_accept_bad_req = 0; // Total malformed requests.
  var tot_accept_bad_req_kind = 0; // Total requests with unknown kind.
  var tot_accept_recv = 0; // Total messages received by acceptor.
  var tot_accept_send = 0; // Total messages sent by acceptor.
  var tot_accept_propose = 0; // Total REQ_PROPOSE messages received.
  var tot_accept_proposed = 0; // Total times a REQ_PROPOSE was successfully processed.
  var tot_accept_accept = 0; // Total REQ_ACCEPT messages received.
  var tot_accept_accepted = 0; // Total times a REQ_ACCEPT was successfully processed.
  var tot_accept_nack_storage = 0; // Total NACKs due to storage errors.
  var tot_accept_nack_behind = 0; // Total NACKs because proposer's ballot was too low.

  /**
   * Handler for incoming messages to the acceptor.
   * This is the core logic of the acceptor.
   * @param {string} src - The source of the message (proposer's ID).
   * @param {object} req - The request message.
   */
  function on_msg (src, req) {
    tot_accept_recv = tot_accept_recv + 1;

    // Basic validation of the incoming request.
    if (req != null && req.slot != null && req.ballot != null) {
      // The acceptor's main responsibility is to process incoming
      // propose or accept requests with higher ballots.

      // First, read the current state of the requested slot from storage.
      storage.slot_read(req.slot, on_slot_read);

      /**
       * Callback after reading slot state from storage.
       * @param {Error} err - Error if storage read failed.
       * @param {object} slot_state - The current state of the slot.
       */
      function on_slot_read (err, slot_state) {
        if (!err) {
          // Successfully read slot state.
          var highest_proposed_ballot = slot_state.highest_proposed_ballot;

          // Crucial Paxos condition:
          // Only process requests if the proposer's ballot is greater than or equal to
          // the highest ballot this acceptor has ever promised or accepted for this slot.
          if (ballot_gte(req.ballot, highest_proposed_ballot)) {
            if (req.kind == REQ_PROPOSE) {
              // --- Handle REQ_PROPOSE (Phase 1) ---
              tot_accept_propose = tot_accept_propose + 1;

              // Update the highest proposed ballot in storage.
              storage.slot_save_highest_proposed_ballot(
                req.slot,
                req.ballot,
                function (err) {
                  if (!err) {
                    tot_accept_proposed = tot_accept_proposed + 1;
                    highest_proposed_ballot = req.ballot; // Update local state.
                    // Respond with RES_PROPOSED, including any previously accepted value.
                    respond(RES_PROPOSED, {
                      "accepted_ballot": slot_state.accepted_ballot,
                      "accepted_val": slot_state.accepted_val
                    });
                  } else {
                    // Storage error during save.
                    tot_accept_nack_storage = tot_accept_nack_storage + 1;
                    respond(RES_NACK);
                  }
                }
              );
            } else if (req.kind == REQ_ACCEPT) {
              // --- Handle REQ_ACCEPT (Phase 2) ---
              tot_accept_accept = tot_accept_accept + 1;

              // Save the accepted value and ballot to storage.
              storage.slot_save_accepted(
                req.slot,
                req.ballot,
                req.val,
                function (err) {
                  if (!err) {
                    tot_accept_accepted = tot_accept_accepted + 1;
                    highest_proposed_ballot = req.ballot; // Update local state.
                    // Respond with RES_ACCEPTED, confirming the acceptance.
                    respond(RES_ACCEPTED, {
                      "accepted_ballot": req.ballot,
                      "accepted_val": req.val
                    });
                  } else {
                    // Storage error during save.
                    tot_accept_nack_storage = tot_accept_nack_storage + 1;
                    respond(RES_NACK);
                  }
                }
              );
            } else {
              // --- Unknown Request Kind ---
              tot_accept_bad_req_kind = tot_accept_bad_req_kind + 1;
              respond(RES_NACK); // Send NACK for unrecognized request kind.
            }
          } else {
            // --- Proposer's Ballot is Too Low ---
            // The proposer's ballot is behind what this acceptor has already promised.
            tot_accept_nack_behind = tot_accept_nack_behind + 1;
            respond(RES_NACK); // Send NACK.
          }

          /**
           * Helper function to construct and send a response.
           * @param {number} kind - The response kind (e.g., RES_PROPOSED, RES_ACCEPTED, RES_NACK).
           * @param {object} msg_data - Additional data for the response message.
           */
          function respond (kind, msg_data) {
            var msg = msg_data || {};
            msg.highest_proposed_ballot = highest_proposed_ballot; // Always include this.
            respond_full(req, kind, msg);
          }
        } else {
          // --- Storage Read Error ---
          tot_accept_nack_storage = tot_accept_nack_storage + 1;
          respond_full(req, RES_NACK, {}); // Respond with NACK on storage read failure.
        }
      }
    } else {
      // --- Malformed Request ---
      // Request was null or missing essential fields (slot, ballot).
      tot_accept_bad_req = tot_accept_bad_req + 1;
      // No response can be sent if basic request info is missing.
    }
  }

  /**
   * Sends a full response message back to the proposer.
   * @param {object} original_req - The original request message (to get sender, slot, ballot).
   * @param {number} kind - The kind of response message.
   * @param {object} msg_payload - The payload for the response message.
   */
  function respond_full (original_req, kind, msg_payload) {
    var msg = msg_payload;
    msg.kind = kind;
    msg.slot = original_req.slot;
    msg.ballot = original_req.ballot;

    // Apply any pre-processing function defined in options.
    if (opts.respond_preprocess) {
      msg = opts.respond_preprocess(msg);
    }

    comm.send(original_req.sender, msg); // Send message via communication layer.
    tot_accept_send = tot_accept_send + 1; // Increment send counter.
  }

  /**
   * Returns the current statistics for the acceptor.
   * @returns {object} An object containing all acceptor-related stats.
   */
  function stats () {
    return {
      "tot_accept_bad_req": tot_accept_bad_req,
      "tot_accept_bad_req_kind": tot_accept_bad_req_kind,
      "tot_accept_recv": tot_accept_recv,
      "tot_accept_send": tot_accept_send,
      "tot_accept_propose": tot_accept_propose,
      "tot_accept_proposed": tot_accept_proposed,
      "tot_accept_accept": tot_accept_accept,
      "tot_accept_accepted": tot_accept_accepted,
      "tot_accept_nack_storage": tot_accept_nack_storage,
      "tot_accept_nack_behind": tot_accept_nack_behind
    };
  }

  // Return the public API for the acceptor.
  return { "on_msg": on_msg, "stats": stats };
};

// ----------------------------------------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------------------------------------

/**
 * Calculates the simple majority for a given number of members.
 * @param {number} n - Total number of members.
 * @returns {number} The number of members constituting a majority.
 */
function majority (n) {
  return Math.floor(n / 2) + 1;
}
exports.majority = majority;

/**
 * Checks if an item is present in a collection (array).
 * @param {Array} collection - The array to search.
 * @param {any} item - The item to look for.
 * @returns {boolean} True if the item is found, false otherwise.
 */
function is_member (collection, item) {
  for (var i in collection) {
    if (collection[i] == item) {
      return true;
    }
  }
  return false;
}
exports.is_member = is_member;

// ----------------------------------------------------------------------------------------------------
// Ballot Representation and Operations
// ----------------------------------------------------------------------------------------------------

// Constants for ballot array indices.
var BALLOT_SEQ_NUM = exports.BALLOT_SEQ_NUM = 0; // Sequence number component.
var BALLOT_PROPOSER_NAME = exports.BALLOT_PROPOSER_NAME = 1; // Proposer name component.
var BALLOT_PROPOSER_RESTARTS = exports.BALLOT_PROPOSER_RESTARTS = 2; // Proposer restarts component.

/**
 * Creates a new ballot array.
 * A ballot is typically [sequence_number, proposer_name, proposer_restarts].
 * @param {number} seq_num - The sequence number.
 * @param {string} proposer_name - The unique name of the proposer.
 * @param {number} proposer_restarts - A counter for proposer restarts (tie-breaker).
 * @returns {Array} The ballot array.
 */
function ballot_mk (seq_num, proposer_name, proposer_restarts) {
  return [seq_num, proposer_name, proposer_restarts];
}

// A special "bottom" ballot, representing no ballot or the lowest possible.
var BOTTOM_BALLOT = ballot_mk(-1, -1, -1);

/**
 * Increments the sequence number of a ballot.
 * Used by proposers to generate new, higher ballots.
 * @param {Array} ballot - The ballot to increment.
 * @returns {Array} A new ballot with an incremented sequence number.
 */
function ballot_inc (ballot) {
  return ballot_mk(
    ballot[BALLOT_SEQ_NUM] + 1,
    ballot[BALLOT_PROPOSER_NAME],
    ballot[BALLOT_PROPOSER_RESTARTS]
  );
}

/**
 * Compares two ballots to check if ballot 'a' is greater than or equal to ballot 'b'.
 * Ballots are compared lexicographically: sequence number, then proposer name, then restarts.
 * @param {Array} a - The first ballot.
 * @param {Array} b - The second ballot.
 * @returns {boolean} True if a >= b, false otherwise.
 */
function ballot_gte (a, b) {
  a = a || BOTTOM_BALLOT; // Default to BOTTOM_BALLOT if null/undefined.
  b = b || BOTTOM_BALLOT; // Default to BOTTOM_BALLOT if null/undefined.

  // Compare each component of the ballot.
  for (var i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] > b[i]) {
      return true; // 'a' is strictly greater.
    }
    if (a[i] < b[i]) {
      return false; // 'a' is strictly less.
    }
  }
  // If all components are equal up to the length of the shorter ballot,
  // then they are considered equal, thus a >= b is true.
  return true;
}

/**
 * Compares two ballots for exact equality.
 * @param {Array} a - The first ballot.
 * @param {Array} b - The second ballot.
 * @returns {boolean} True if ballots are exactly equal, false otherwise.
 */
function ballot_eq (a, b) {
  // If lengths differ, they cannot be equal.
  if (a.length !== b.length) {
    return false;
  }
  // Compare each component.
  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false; // Found a difference.
    }
  }
  return true; // All components are equal.
}

// Export ballot utility functions.
exports.ballot_mk = ballot_mk;
exports.ballot_inc = ballot_inc;
exports.ballot_gte = ballot_gte;
exports.ballot_eq = ballot_eq;