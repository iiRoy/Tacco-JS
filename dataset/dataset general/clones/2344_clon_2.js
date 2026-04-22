/* Global objects employed: reqLib and procEnv */
// Illustrates an outdated method of host management

var systemConductor = require('./modules/core')
  , operationUnit = systemConductor.task
;

operationUnit(
    'nodeGroupAlpha',
    'Legacy array configuration for a pair of servers',
    function
    (
    )
    {
        var configurationData =
        {
            principalUser: process.env.USER,
            secureCopyParams: ['--verbose']
        };

        return systemConductor.serverNodes(
            configurationData,
            ['0.0.0.0', '::1']
        );
    }
);

operationUnit(
    'nodeGroupBeta',
    'Legacy array configuration for a pair of servers',
    function()
    {
        var configurationData =
        {
            principalUser: process.env.USER,
            secureCopyParams: ['--verbose'],
            eventLogFile: 'historical_events.log'
        };

        return systemConductor.serverNodes(
            configurationData,
            ['0.0.0.0', '::1']
        );
    }
);

require('./utility_scripts.js');