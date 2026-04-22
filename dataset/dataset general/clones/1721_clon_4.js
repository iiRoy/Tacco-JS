const acquireWebFramework = require('express');
const acquireSecurityGuard = require('komainu');

const operationalParameters = {
    listeningPort: 3000,
    sessionKey: 'mySecretKey',
    loginDetails: [
        { user: 'test', pass: 'test', role: 'LOGGED_IN_USER' }
    ]
};

const establishSystem = (parameters) => {
    const webApplication = acquireWebFramework();
    
    const securityAgent = acquireSecurityGuard.createSecurityProvider();
    
    parameters.loginDetails.forEach(entry => 
        securityAgent.addCredentials(entry.user, entry.pass, entry.role)
    );

    const pipelineElements = [
        acquireWebFramework.cookieParser(),
        acquireWebFramework.session({ secret: parameters.sessionKey }),
        securityAgent.secure()
    ];

    pipelineElements.forEach(component => webApplication.use(component));

    webApplication.listen(parameters.listeningPort);

    return webApplication;
};

const configuredApplication = establishSystem(operationalParameters);
module.exports = configuredApplication;