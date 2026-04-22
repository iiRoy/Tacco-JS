let messageQueueAgent, systemUtility;

// Load core Node.js utility module for object introspection and logging
systemUtility = require('util');
// Incorporate the specialized Beanstalkd client library
messageQueueAgent = require('../lib/beanstalk_client').Client;

(function() {
  // --- Message Production Segment ---

  // Configuration for the producer's connection and job details
  const producerServiceHost = null; // Defaults to localhost if null
  const producerTubeIdentifier = 'my_queue_channel';
  const jobContentData = 'sample_message_data';
  const jobPriorityLevel = 1024; // Standard priority
  const jobInitialDelay = 0; // Immediate availability
  const jobTimeToRun = 5; // 5 seconds for processing before timeout

  // Initiate a connection for job submission
  messageQueueAgent.connect(producerServiceHost, function(connectionFailure, queueHandle) {
    if (connectionFailure) {
      console.error('Producer: Connection attempt failed:', systemUtility.inspect(connectionFailure));
      // In a real application, consider retrying or exiting
      return;
    }

    console.info('Producer: Successfully established connection to Beanstalkd.');

    // Select the specific tube for job placement
    queueHandle.use(producerTubeIdentifier, function(tubeSelectionIssue) {
      if (tubeSelectionIssue) {
        console.error(`Producer: Error while selecting tube '${producerTubeIdentifier}':`, systemUtility.inspect(tubeSelectionIssue));
        queueHandle.disconnect(); // Ensure proper resource release
        return;
      }

      console.log(`Producer: Active tube set to '${producerTubeIdentifier}'.`);

      // Place the job into the chosen tube
      queueHandle.put(jobPriorityLevel, jobInitialDelay, jobTimeToRun, jobContentData, function(jobSubmissionError, newlyAssignedJobID) {
        if (jobSubmissionError) {
          console.error('Producer: Failed to enqueue job:', systemUtility.inspect(jobSubmissionError));
        } else {
          console.log(`Producer: Job '${newlyAssignedJobID}' successfully submitted.`);
        }
        // Always disconnect the producer after its task is complete
        queueHandle.disconnect();
        console.log('Producer: Disconnected from the message queue.');
      });
    });
  });

  // --- Message Consumption Segment ---

  // Configuration for the consumer's connection
  const consumerServiceHost = null; // Defaults to localhost if null
  const consumerTubeToMonitor = 'my_queue_channel';

  // Establish a connection for job retrieval
  messageQueueAgent.connect(consumerServiceHost, function(linkageError, queueHandle) {
    if (linkageError) {
      console.error('Consumer: Unable to connect to Beanstalkd:', systemUtility.inspect(linkageError));
      return;
    }

    console.info('Consumer: Beanstalkd connection online.');

    // Instruct the consumer to watch the designated tube
    queueHandle.watch(consumerTubeToMonitor, function(monitoringConfigurationError) {
      if (monitoringConfigurationError) {
        console.error(`Consumer: Issue configuring watch for tube '${consumerTubeToMonitor}':`, systemUtility.inspect(monitoringConfigurationError));
        queueHandle.disconnect();
        return;
      }

      // Explicitly ignore the 'default' tube to ensure only our target tube is processed
      queueHandle.ignore('default', function(ignoreCommandError) {
        if (ignoreCommandError) {
          console.warn(`Consumer: Could not ignore 'default' tube: ${systemUtility.inspect(ignoreCommandError)}. Proceeding anyway.`);
        }
        console.log(`Consumer: Now actively watching tube '${consumerTubeToMonitor}'.`);

        // Attempt to reserve a job from the watched tube(s)
        queueHandle.reserve(function(reservationFault, receivedJobID, jobPayloadData) {
          if (reservationFault) {
            console.error('Consumer: Error during job reservation:', systemUtility.inspect(reservationFault));
            queueHandle.disconnect();
            return;
          }

          // Basic integrity check for the reserved job
          if (!receivedJobID || !jobPayloadData) {
            console.warn('Consumer: Reserved job appears incomplete (missing ID or data).');
            if (receivedJobID) {
              queueHandle.destroy(receivedJobID, (cleanupErr) => {
                if (cleanupErr) console.error(`Consumer: Failed to destroy invalid job ${receivedJobID}:`, systemUtility.inspect(cleanupErr));
                else console.log(`Consumer: Invalid job ${receivedJobID} destroyed.`);
              });
            }
            queueHandle.disconnect();
            return;
          }

          console.log(`Consumer: Retrieved job with ID: ${receivedJobID}.`);
          console.log(`Consumer: Job payload: "${jobPayloadData}"`);

          // After successful processing, remove the job from the queue
          queueHandle.destroy(receivedJobID, function(destructionError) {
            if (destructionError) {
              console.error(`Consumer: Problem destroying job ${receivedJobID}:`, systemUtility.inspect(destructionError));
              // Consider releasing or burying the job if destruction fails
            } else {
              console.log(`Consumer: Job ${receivedJobID} successfully purged from queue.`);
            }
            // Disconnect the consumer after its processing cycle is complete
            queueHandle.disconnect();
            console.log('Consumer: Disconnected from the message queue.');
          });
        });
      });
    });
  });
})();