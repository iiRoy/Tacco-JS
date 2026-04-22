const webFramework = require('express');
const keyValDB = require('redis');
const secureHttpAgent = require('https');
const cipherTool = require('crypto');

// Establish a connection to our key-value data store.
// This client instance will be used for all Redis operations.
const kvStore = keyValDB.createClient();

// Initialize the core web application server.
// We configure it with JSON and URL-encoded body parsing capabilities,
// and a static file server for serving front-end assets.
const serviceHost = webFramework();

serviceHost.use(webFramework.json()); // For parsing application/json
serviceHost.use(webFramework.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
serviceHost.use(webFramework.static(__dirname + "/site")); // Serve static files from the 'site' directory

// --- Endpoint for user enrollment via Persona/BrowserID assertion verification ---
// Handles POST requests to register a new supporter.
serviceHost.post('/enrollUser', (requestObj, responseObj) => {
  // Validate incoming assertion payload.
  const userAssertion = requestObj.body?.assertion;
  if (!userAssertion) {
    console.warn('Enrollment attempt failed: Missing assertion in request body.');
    return responseObj.status(400).json({
      success: false,
      message: "Assertion parameter is required for enrollment."
    });
  }

  // Construct the payload for the identity verification service.
  const verificationPayload = JSON.stringify({
    assertion: userAssertion,
    audience: `http://${requestObj.headers.host}`
  });

  // Prepare the verification request to the identity provider.
  // This uses the secure HTTP client (HTTPS).
  const verificationRequestOptions = {
    host: 'browserid.org',
    path: '/verify',
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(verificationPayload), // Use byteLength for accuracy
      'Content-Type': 'application/json'
    },
    timeout: 5000 // Add a timeout for the external request
  };

  const externalVerificationReq = secureHttpAgent.request(verificationRequestOptions, (verificationResponse) => {
    let responseAccumulator = ''; // Buffer for accumulating data chunks.

    // Collect data as it arrives from the verification service.
    verificationResponse.on('data', (dataChunk) => {
      responseAccumulator += dataChunk;
    });

    // Process the full response once all data has been received.
    verificationResponse.on('end', () => {
      try {
        const parsedVerificationResult = JSON.parse(responseAccumulator);

        // Crucial check: ensure the verified response contains an email.
        const verifiedEmailAddress = parsedVerificationResult?.email;
        if (!verifiedEmailAddress) {
          console.error('Identity verification failed: No email returned by provider.');
          return responseObj.status(401).json({
            status: 'failed',
            reason: "Email verification failed or no email provided by identity service."
          });
        }

        const normalizedEmail = verifiedEmailAddress.toLowerCase();

        // Check if the email is already registered as a supporter.
        kvStore.sismember('activeSupporters', normalizedEmail, (checkErr, isMember) => {
          if (checkErr) {
            console.error(`Redis error during sismember check for ${normalizedEmail}:`, checkErr);
            return responseObj.status(500).json({
              status: 'error',
              reason: "Internal database error during membership check."
            });
          }

          if (isMember) {
            // User is already a supporter. Inform them.
            return responseObj.status(409).json({ // 409 Conflict status
              status: 'conflict',
              message: "This email address is already registered. Thank you for your continued support!"
            });
          } else {
            // New supporter! Add their email to the set.
            kvStore.sadd('activeSupporters', normalizedEmail, (addErr) => {
              if (addErr) {
                console.error(`Redis error during sadd for ${normalizedEmail}:`, addErr);
                return responseObj.status(500).json({
                  status: 'error',
                  reason: "Internal database error during registration."
                });
              }
              // Invalidate the cache to ensure new members are picked up next refresh.
              supporterCache = null;
              responseObj.status(201).json({ // 201 Created status
                status: 'success',
                registeredEmail: normalizedEmail,
                message: "Welcome aboard! Your support is greatly appreciated."
              });
            });
          }
        });
      } catch (jsonParseError) {
        console.error('Failed to parse identity provider response:', jsonParseError);
        responseObj.status(502).json({ // 502 Bad Gateway if external service response is malformed
          status: 'error',
          reason: "Could not process identity verification response."
        });
      }
    });

    // Handle potential errors from the verification response stream.
    verificationResponse.on('error', (streamErr) => {
      console.error('Error receiving data from identity provider:', streamErr);
      responseObj.status(503).json({ // 503 Service Unavailable
        status: 'error',
        reason: "Problem communicating with the identity verification service."
      });
    });
  });

  // Handle errors for the outgoing verification request itself.
  externalVerificationReq.on('error', (reqErr) => {
    console.error('Error sending request to identity provider:', reqErr);
    responseObj.status(503).json({
      status: 'error',
      reason: "Failed to connect to the identity verification service."
    });
  });

  // Send the verification payload and finalize the request.
  externalVerificationReq.write(verificationPayload);
  externalVerificationReq.end();
});

// --- In-memory cache for frequently accessed supporter hashes ---
// Stores an object with `lastUpdatedTs` (timestamp of last refresh)
// and `cachedHashes` (the array of MD5 hashes).
let supporterCache = null;
const CACHE_LIFESPAN_MS = 15 * 1000; // Cache valid for 15 seconds.
const MAX_DISPLAY_HASHS = 64; // Maximum number of hashes to display.

/**
 * Asynchronously retrieves a list of random supporter email hashes.
 * Results are cached for a short period to reduce database load.
 * @param {number} desiredCount - The maximum number of hashes to retrieve.
 * @param {function(Array<string>)} completionCallback - Callback function to receive the array of hashes.
 */
function retrieveSupporterHashes(desiredCount, completionCallback) {
  // Ensure desiredCount is a positive integer.
  if (desiredCount <= 0 || !Number.isInteger(desiredCount)) {
    console.warn(`Invalid desiredCount provided: ${desiredCount}. Returning empty array.`);
    return completionCallback([]);
  }

  // Check if the cache is still valid.
  if (supporterCache && (Date.now() - supporterCache.lastUpdatedTs) < CACHE_LIFESPAN_MS) {
    // Cache is fresh, return cached data asynchronously.
    process.nextTick(() => {
      completionCallback(supporterCache.cachedHashes);
    });
    return; // Exit early.
  }

  // Cache is stale or non-existent, proceed to fetch from Redis.
  const effectiveCount = Math.min(MAX_DISPLAY_HASHS, desiredCount); // Cap the count.
  const hashCollector = []; // Array to store collected hashes.
  let fetchAttempts = effectiveCount * 2; // Attempt to fetch more than needed to ensure uniqueness.
  const HASH_ALGORITHM = 'md5';

  /**
   * Recursive helper function to fetch individual random members from Redis.
   */
  const fetchNextMember = () => {
    if (hashCollector.length >= effectiveCount || fetchAttempts <= 0) {
      // Either we have enough unique hashes or we've exhausted our attempts.
      // Update the cache and invoke the callback.
      supporterCache = {
        lastUpdatedTs: Date.now(),
        cachedHashes: hashCollector
      };
      return completionCallback(hashCollector);
    }

    fetchAttempts--; // Decrement attempt counter.

    // Fetch a random member from the 'activeSupporters' set.
    kvStore.srandmember('activeSupporters', (redisErr, rawEmail) => {
      if (redisErr) {
        console.error('Redis error during srandmember:', redisErr);
        // On error, return current collected hashes or an empty array.
        return completionCallback(hashCollector.length > 0 ? hashCollector : []);
      }

      if (!rawEmail) {
        // No more members in the set, or set is empty.
        // If we still need more, try again if attempts remain, otherwise finalize.
        if (fetchAttempts > 0 && hashCollector.length < effectiveCount) {
          return fetchNextMember(); // Try fetching again if no member was returned but attempts remain
        }
        return completionCallback(hashCollector); // Finalize with what we have.
      }

      const memberEmail = String(rawEmail).toLowerCase(); // Ensure string and normalize.
      const emailHash = cipherTool.createHash(HASH_ALGORITHM).update(memberEmail).digest("hex");

      // Only add if unique (not already in our collector).
      if (!hashCollector.includes(emailHash)) {
        hashCollector.push(emailHash);
      }

      // Continue fetching until desired count or attempts limit is reached.
      fetchNextMember();
    });
  };

  fetchNextMember(); // Initiate the recursive fetching process.
}

// --- Endpoint to retrieve supporter list and count ---
// Handles GET requests to provide a list of random supporter hashes
// and the total count of supporters.
serviceHost.get('/memberHashes', (requestInfo, responseOutput) => {
  // First, get the total number of registered supporters.
  kvStore.scard('activeSupporters', (errCount, totalRegisteredSupporters) => {
    if (errCount) {
      console.error('Redis error getting supporter count (scard):', errCount);
      return responseOutput.status(500).json({
        outcome: 'error',
        message: "Failed to retrieve total supporter count from database."
      });
    }

    // Then, retrieve a set of random supporter hashes.
    retrieveSupporterHashes(totalRegisteredSupporters, (randomIdentifiers) => {
      let finalIdentifiers = [...randomIdentifiers]; // Create a mutable copy.

      // If the request includes a 'myId' query parameter,
      // hash it and prepend it to the list.
      const personalIdentifier = requestInfo.query?.myId;
      if (personalIdentifier && typeof personalIdentifier === 'string') {
        const normalizedPersonalId = personalIdentifier.toLowerCase();
        const personalHash = cipherTool.createHash('md5').update(normalizedPersonalId).digest("hex");

        // Ensure the list doesn't exceed MAX_DISPLAY_HASHS after adding personal hash.
        // If the list is already at max and doesn't contain the personal hash, remove one
        // from the end before prepending to maintain the size limit.
        if (finalIdentifiers.length >= MAX_DISPLAY_HASHS && !finalIdentifiers.includes(personalHash)) {
            finalIdentifiers.pop(); // Remove the last random element
        }
        // Prepend the personal hash if it's not already present.
        if (!finalIdentifiers.includes(personalHash)) {
            finalIdentifiers.unshift(personalHash);
        }
      }

      // Respond with the total count and the list of identifiers.
      responseOutput.json({
        totalRegistered: totalRegisteredSupporters,
        randomIdentifiers: finalIdentifiers
      });
    });
  });
});

// --- Start the web server ---
// The server listens on the port specified by the environment variable PORT,
// or defaults to 8080 if not set.
const serverPort = process.env.SERVICE_PORT || 8080;
serviceHost.listen(serverPort, () => {
  console.log(`Web service operational and listening on port ${serverPort}.`);
  console.log(`Access application at http://localhost:${serverPort}`);
});