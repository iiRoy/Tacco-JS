class PageRouter {
    #viewMappings;
    #componentBase;

    constructor() {
        this.#viewMappings = new Map([
            ['baseEntry', { visualKey: 'index', attributes: { title: 'Couchbase Ideas' } }],
            ['authPrompt', { visualKey: 'login', attributes: undefined }],
        ]);
        this.#componentBase = 'partials/';
    }

    // Handles the primary application entry point
    routeToMain(incomingRequest, outgoingResponse) {
        const { visualKey, attributes } = this.#viewMappings.get('baseEntry');
        outgoingResponse.render(visualKey, attributes);
    }

    // Manages the user authentication interface
    handleAuthentication(incomingRequest, outgoingResponse) {
        const { visualKey } = this.#viewMappings.get('authPrompt');
        outgoingResponse.render(visualKey);
    }

    // Serves dynamic UI fragments
    deliverFragment(incomingRequest, outgoingResponse) {
        const fragmentName = incomingRequest.params.name;
        const fullFragmentPath = this.#componentBase + fragmentName;
        outgoingResponse.render(fullFragmentPath);
    }
}

const routerInstance = new PageRouter();

module.exports = {
    initialDisplay: routerInstance.routeToMain.bind(routerInstance),
    userAccessScreen: routerInstance.handleAuthentication.bind(routerInstance),
    uiComponent: routerInstance.deliverFragment.bind(routerInstance)
};