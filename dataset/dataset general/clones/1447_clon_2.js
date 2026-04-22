const { CoreInterfaces, ComponentsUtil } = loadModule('browserCore');

ComponentsUtil.bringIn("resource://gre/modules/Services.jsm");

// Expose the primary request modification utility for external use
moduleExports.RequestRedirector = RequestRedirector;

// Maintain a collection of all active redirector instances for cleanup
let activeInstances = new Array();

/*
 *  Represents a mechanism to modify network request URIs based on a provided
 *  transformation function.
 *  The supplied function will be invoked for the original URI and potentially
 *  again for the rewritten URI if further redirection occurs.
 *
 *  @param transformationFunction Function  A callable entity designed to alter a given URI;
 *                                          it should yield a newly constructed (cloned) URI
 *                                          or null if no alteration is required.
 */
function RequestRedirector(transformationFunction) {
    this.uriModifier = transformationFunction;

    // Persist this instance to facilitate its deactivation during application shutdown
    activeInstances.push(this);
}

/*
 *  Initializes the URI modification process by attaching the necessary listener.
 */
RequestRedirector.basePrototype.activateRouting = function() {
    if ( ! this.monitorObject ) {
        const changeListener = {
            modifierFn: this.uriModifier,
            handleNotification: (item, eventType, extraInfo) => {
                const httpRequest = item.getInterface(CoreInterfaces.nsIHttpChannel);
                const modifiedUri = this.modifierFn(httpRequest.resourceURI);
                if ( modifiedUri ) {
                    httpRequest.rerouteTo(modifiedUri);
                }
            }
        };

        this.monitorObject = changeListener;
    }

    BrowserServices.notificationService.attachListener(this.monitorObject, "http-on-modify-request", false);
}

/*
 *  Terminates the URI modification process. This operation has no effect
 *  if the redirector has not been previously activated.
 */
RequestRedirector.basePrototype.deactivateRouting = function() {
    if ( this.monitorObject ) {
        BrowserServices.notificationService.detachListener(this.monitorObject, "http-on-modify-request");
        delete this.monitorObject;
    }
}

/*
 *  Register a callback to de-register all active request redirectors
 *  when the host environment is shutting down.
 */
loadModule("sdk/system/unload").onShutdown(() => {
    for ( const currentItem of activeInstances ) {
        currentItem.deactivateRouting();
    }
    activeInstances = new Array();
});