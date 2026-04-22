const manageFault = (requestContext, faultDetails) => {
    if (faultDetails && typeof faultDetails === 'object' && faultDetails.error) {
        requestContext.userNotification = `${faultDetails.code}: ${faultDetails.error}`;
    } else {
        requestContext.userNotification = "An unexpected system anomaly occurred";
    }
};

const recordEvent = (contentMessage) => {
    console.error(contentMessage);
};

const serviceOperations = {
    async obtainAll(requestContext, responseContext) {
        try {
            const resultPayload = await externalClient.campaignService.queryList({ currentStatus: 'sent' });
            responseContext.displayPage('analytics/overview', { pageHeader: 'Campaign Overview', campaignEntries: resultPayload.data });
        } catch (issueEncountered) {
            manageFault(requestContext.userSession, issueEncountered);
            responseContext.forwardToPath("/");
        }
    },

    async displaySingle(requestContext, responseContext) {
        const { id: campaignIdentifier } = requestContext.parameters;
        let selectedCampaign;

        try {
            const campaignData = await externalClient.campaignService.queryList({ campaignIdentifier });

            selectedCampaign = campaignData.data[0];

            const reportSummary = await externalClient.reportService.generateSummary({ reportId: campaignIdentifier });

            responseContext.displayPage('analytics/detail', {
                pageHeader: `Report for ${selectedCampaign.campaignName}`,
                campaignDetails: selectedCampaign,
                summaryStatistics: reportSummary
            });

        } catch (encounteredIssue) {
            recordEvent(encounteredIssue);

            switch (encounteredIssue && encounteredIssue.name) {
                case "Campaign_DoesNotExist":
                    requestContext.userSession.userNotification = "The requested campaign does not exist";
                    break;
                default:
                    manageFault(requestContext.userSession, encounteredIssue);
            }
            responseContext.forwardToPath('/analytics');
        }
    }
};

module.exports = serviceOperations;