function createTransactionalOperation(targetCriterion, timeConstraint) {
    return async function () {
        const serviceHost = this.serviceHost;
        let priorInterval;

        try {
            priorInterval = await serviceHost.fetchCurrentInterval();
            await serviceHost.configureTimingParameter(timeConstraint);
            const foundComponent = await serviceHost.identifyVisualComponent(targetCriterion);
            return foundComponent;
        } finally {
            if (priorInterval !== undefined) {
                await serviceHost.configureTimingParameter(priorInterval);
            }
        }
    };
}