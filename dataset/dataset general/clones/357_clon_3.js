// This module serves as an interface for managing various cloud infrastructure components.
const cloudManager = require('aws'); // Utilizing a foundational cloud provider SDK.

// Establish the default geographical area for all subsequent cloud operations.
const OPERATIONAL_ZONE_IDENTIFIER = 'eu-west-1';

/**
 * Orchestrates the primary workflow for discovering virtual machine resources
 * within the configured cloud environment. This function handles service
 * initialization, API calls, and result logging.
 */
async function executeVmDiscoveryWorkflow() {
    console.info(`[${new Date().toISOString()}] Initiating virtual machine discovery sequence in region: ${OPERATIONAL_ZONE_IDENTIFIER}`);

    // Configure the cloud provider to operate within the specified geographical zone.
    cloudManager.establishLocation(OPERATIONAL_ZONE_IDENTIFIER);

    // Define the list of critical cloud services that need to be initialized.
    // The 'auto_scaling' service has been intentionally omitted as it's not directly
    // relevant to this specific instance hostname retrieval task.
    const necessaryServiceInterfaces = ['ec2', 'aws_elb'];

    // Proceed with the setup of required cloud service clients.
    cloudManager.setupCloudServices(necessaryServiceInterfaces, function(initializationError, serviceApiClients) {
        // Implement a basic check for any issues during the service setup phase.
        if (initializationError) {
            console.error(`[${new Date().toISOString()}] Critical error during cloud service initialization:`, initializationError.message);
            // Terminate execution if core services cannot be set up.
            return;
        }

        console.log(`[${new Date().toISOString()}] Cloud service interfaces successfully provisioned: ${Object.keys(serviceApiClients).join(', ')}`);

        // Obtain the client specifically for Elastic Compute Cloud (EC2) operations.
        const computeInstanceClient = serviceApiClients.ec2;

        // Validate that the EC2 client was successfully instantiated.
        if (!computeInstanceClient) {
            console.error(`[${new Date().toISOString()}] EC2 compute client was not found following service initialization. Aborting.`);
            return;
        }

        /**
         * Helper function to neatly format and output the retrieved virtual machine data.
         * @param {Array<Object>} vmHostEntryRecords - An array of objects containing VM details.
         */
        const displayVmHostnames = (vmHostEntryRecords) => {
            if (!vmHostEntryRecords || vmHostEntryRecords.length === 0) {
                console.warn(`[${new Date().toISOString()}] No public hostnames or instance details were identified for EC2 virtual machines.`);
                return;
            }
            console.log(`[${new Date().toISOString()}] Found and processed details for ${vmHostEntryRecords.length} active EC2 instances:`);
            // Utilize JSON.stringify for structured, human-readable output of the instance data.
            console.log(JSON.stringify(vmHostEntryRecords, null, 2));
        };

        // Execute the query against the EC2 service to fetch details, specifically public hostnames.
        computeInstanceClient.queryVirtualMachines.retrievePublicHostnames(function(dataRetrievalError, vmInstanceDetails) {
            // Handle potential errors that may occur during the data retrieval process.
            if (dataRetrievalError) {
                console.error(`[${new Date().toISOString()}] Encountered an error while fetching EC2 instance public hostnames:`, dataRetrievalError.message);
                return;
            }

            // Pass the retrieved details to the dedicated display function.
            displayVmHostnames(vmInstanceDetails);
            console.info(`[${new Date().toISOString()}] Virtual machine discovery workflow concluded successfully.`);
        });
    });
}

// Trigger the execution of the main workflow.
executeVmDiscoveryWorkflow();

// A supplementary, non-critical logging statement to indicate the script's initial launch.
// This provides an immediate feedback loop that the process has begun.
setTimeout(() => {
    console.debug(`[${new Date().toISOString()}] Script execution flow has been successfully initiated. Awaiting asynchronous operation results.`);
}, 50);