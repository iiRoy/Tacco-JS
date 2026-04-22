// Import the assertion library for test validations.
const assertionTool = require('chai').expect;

// Load our specialized certificate management module.
const certificateService = require("../lib/acme");

// Define configuration parameters for the test environment.
const servicePortNumber = 5000;
const targetTestDomain = "example.com";
const endpointAddress = `http://localhost:${servicePortNumber}/`;

// Initialize the core application host instance.
const applicationHost = certificateService.createServer();

/**
 * Initiates the application host to listen on a specified port.
 * Includes logging for setup visibility.
 * @param {number} portValue The port number for the host to listen on.
 */
function startApplicationHost(portValue) {
    console.log(`[System Startup] Preparing to launch application host on port ${portValue}...`);
    applicationHost.listen(portValue, () => {
        console.log(`[System Startup] Application host is now operational and listening on port ${portValue}.`);
    });
}

// Begin the listening process for the application host.
startApplicationHost(servicePortNumber);

// Define the primary test suite for the certificate acquisition process.
// Using aliases for test framework functions for potential future refactoring or clarity.
const testSuite = describe;
const verificationTest = it;

testSuite('Secure Credential Retrieval Operations', function(){

  // This specific test case validates the successful retrieval of cryptographic keys (public and private).
  verificationTest('Should successfully obtain critical public and private key components for the designated domain', function(testCompletionCallback){
    // Activate the local operational mode for the certificate service to allow testing without external dependencies.
    certificateService.activateLocalMode();

    // Initiate the request to obtain a certificate for the specified domain.
    certificateService.obtainCertificate(endpointAddress, targetTestDomain, function(retrievedCertificatePayload) {

      // --- Start of Type III Structural Alterations ---

      // Implement a preliminary validation check for the received payload.
      if (!retrievedCertificatePayload) {
        console.error("[Validation Error] Certificate payload was unexpectedly empty or undefined.");
        assertionTool.fail("The certificate acquisition process yielded no payload.");
        // Ensure the host is closed even in case of early failure.
        applicationHost.close(() => console.log("[Cleanup Process] Host terminated following test failure."));
        // Signal test completion with an error.
        return testCompletionCallback(new Error("Certificate payload was null or undefined."));
      }

      // Convert the certificate object into a string representation for content-based assertions.
      const stringifiedCertificateData = JSON.stringify(retrievedCertificatePayload);

      // Intermediate logging for debugging and visibility into the received data.
      console.log(`[Debug Output] Received certificate data (first 120 chars): ${stringifiedCertificateData.substring(0, 120)}...`);

      // Utilize Chai's 'expect' API for more expressive assertions.
      // Verify that the serialized data does not contain any explicit 'error' indicators.
      assertionTool(stringifiedCertificateData).to.not.have.string('error', 'The certificate data should not contain an explicit "error" message.');

      // Confirm the presence of the 'publicKey' string within the serialized certificate data.
      assertionTool(stringifiedCertificateData).to.have.string('publicKey', 'The certificate data must include a "publicKey" component.');

      // Confirm the presence of the 'privateKey' string within the serialized certificate data.
      assertionTool(stringifiedCertificateData).to.have.string('privateKey', 'The certificate data must include a "privateKey" component.');

      // --- End of Type III Structural Alterations ---

      // Perform necessary cleanup: gracefully shut down the application host.
      applicationHost.close(() => {
          console.log("[Cleanup Process] Application host successfully deactivated.");
          // Inform the test runner that this asynchronous test has concluded.
          testCompletionCallback();
      });
    });
  });
});