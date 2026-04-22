/**
 * Global configuration object for the user interaction and messaging service.
 * This object holds various parameters controlling how messages are composed and routed
 * within the application's communication subsystem.
 *
 * It encapsulates settings related to message originators, recipients, and subject line generation logic.
 *
 * @namespace MessagingSystemConfiguration
 */
const messagingSystemConfiguration = {

  // The primary set of operational parameters for the messaging service.
  // This object contains all the adjustable settings that govern message creation.
  operationalParameters: {

    /**
     * @property {string} senderIdentifier - The default or configured display name of the message originator.
     *                                      This value can be overridden by specific message data.
     *                                      Initially set to an empty string, expecting dynamic assignment or fallback.
     *                                      Renamed from `fullName`.
     */
    senderIdentifier: '',

    /**
     * @property {string} targetEmailAddress - The primary email recipient for outgoing communications.
     *                                        This address is used when a specific recipient is not provided
     *                                        or for general inquiries.
     *                                        Renamed from `emailTo`.
     */
    targetEmailAddress: 'admin@example.com', // Changed to a default value instead of empty

    /**
     * @property {boolean} enableLogging - A boolean flag to determine if message generation events,
     *                                    or specific details like timestamps, should be logged or included
     *                                    in the generated output (e.g., subject lines).
     *                                    This is a newly added configuration parameter.
     */
    enableLogging: true,

    /**
     * @property {string} applicationSourceTag - A unique identifier or tag for the application module
     *                                          originating these messages. Useful for tracing and categorization.
     *                                          This is a newly added configuration parameter.
     */
    applicationSourceTag: 'WebFormGateway',

    /**
     * Function responsible for dynamically generating the subject line of an outgoing message.
     * It incorporates details from the provided data bundle and internal configuration settings
     * to compose a relevant and informative title for the communication.
     *
     * Renamed from `customSubject` to `composeMessageHeadline`.
     *
     * @function composeMessageHeadline
     * @param {object} messageDetails - An object containing various data points relevant to the message being sent.
     * @param {string} [messageDetails.originatorName] - The specific name of the person or entity
     *                                                  sending the current message. This takes precedence
     *                                                  over `senderIdentifier` if provided.
     * @returns {string} The fully composed and formatted subject line for the message.
     */
    composeMessageHeadline: function (messageDetails) {

      // Define a constant for the interaction platform's recognizable name.
      // This is a new helper variable for consistency.
      const PLATFORM_IDENTIFIER = 'Customer Inquiry Portal';

      // Determine the actual originator's name with robust fallback logic.
      // This includes a guard clause and checks for object validity and property existence.
      // If `messageDetails` is invalid or `originatorName` is missing, it falls back to
      // `this.senderIdentifier` (from `operationalParameters`), then to a generic string.
      const effectiveOriginator = (
        messageDetails &&
        typeof messageDetails === 'object' &&
        typeof messageDetails.originatorName === 'string' &&
        messageDetails.originatorName.trim() !== ''
      )
        ? messageDetails.originatorName.trim()
        : this.senderIdentifier || 'Anonymous Submitter'; // Using 'this' to access other config properties.

      // Prepare an optional timestamp fragment based on the `enableLogging` setting.
      // This is a new conditional fragment added to the subject.
      const timestampFragment = this.enableLogging
        ? ` [${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}]`
        : '';

      // Construct the final subject line using template literals for enhanced readability.
      // The structure is significantly rewritten from the original string concatenation.
      return `New Message from ${effectiveOriginator} via ${PLATFORM_IDENTIFIER}${timestampFragment}`;
    }
  }
};