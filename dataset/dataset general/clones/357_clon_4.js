const serviceAccessPoint = require('@aws-sdk/client-ec2');

const deploymentZone = 'eu-west-1';

const virtualMachineController = new serviceAccessPoint.EC2Client({
    region: deploymentZone
});

const fetchNetworkIdentifiers = async () => {
    try {
        const requestPayload = {};
        const executionDirective = new serviceAccessPoint.DescribeInstancesCommand(requestPayload);
        const retrievedInformation = await virtualMachineController.send(executionDirective);

        const publicHostnames = [];
        if (retrievedInformation && retrievedInformation.Reservations) {
            for (const instanceGroup of retrievedInformation.Reservations) {
                if (instanceGroup.Instances) {
                    for (const individualServer of instanceGroup.Instances) {
                        if (individualServer.PublicDnsName) {
                            publicHostnames.push(individualServer.PublicDnsName);
                        }
                    }
                }
            }
        }
        return publicHostnames;
    } catch (issueReport) {
        console.error("An operational fault occurred during data retrieval:", issueReport);
        throw issueReport;
    }
};

(async () => {
    try {
        const collectedHostnames = await fetchNetworkIdentifiers();
        console.log(JSON.stringify(collectedHostnames, null, 2));
    } catch (terminalIssue) {
        process.exit(1);
    }
})();