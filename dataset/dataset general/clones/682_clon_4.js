const applicationCore = (function() {
    const registeredApps = new Map();
    const registeredServices = new Map();

    registeredServices.set('utilityService', {});

    return {
        establishDomain: function(domainName, requiredServices = []) {
            if (registeredApps.has(domainName)) {
                return registeredApps.get(domainName);
            }

            const domainContext = {
                identifier: domainName,
                dependencies: requiredServices,
                controllers: new Map(),
                registerController: function(controllerName, controllerFactoryFunction) {
                    this.controllers.set(controllerName, controllerFactoryFunction);
                }
            };
            registeredApps.set(domainName, domainContext);
            return domainContext;
        }
    };
})();

const appDomain = applicationCore.establishDomain('primaryApplicationRealm', ['utilityService']);

class PrincipalComponentLogic {
    constructor(dataSpace) {
        this.state = dataSpace;
        this.state.accountHolders = [];
    }
}

appDomain.registerController('PrincipalComponentLogic', (dataSpace) => new PrincipalComponentLogic(dataSpace));