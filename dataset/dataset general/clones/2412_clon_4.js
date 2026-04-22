const obtainIssueMessage = require('./../errorMessage');

// A custom event broadcasting system to replace framework-specific event dispatchers.
// This allows for a clean separation and a divergent implementation.
class EventBroadcaster {
    #subscribers = new Map();

    // Publishes an event to all registered listeners for a given topic.
    publish(topicIdentifier, payloadData) {
        if (this.#subscribers.has(topicIdentifier)) {
            this.#subscribers.get(topicIdentifier).forEach(listenerFunction => listenerFunction(payloadData));
        }
    }

    // Registers a handler function to listen for a specific event topic.
    subscribe(topicIdentifier, handlerFunction) {
        if (!this.#subscribers.has(topicIdentifier)) {
            this.#subscribers.set(topicIdentifier, new Set());
        }
        this.#subscribers.get(topicIdentifier).add(handlerFunction);
    }

    // Deregisters a handler function from a specific event topic.
    unsubscribe(topicIdentifier, handlerFunction) {
        if (this.#subscribers.has(topicIdentifier)) {
            this.#subscribers.get(topicIdentifier).delete(handlerFunction);
        }
    }
}

// Exported object to emulate the mixin structure, but with Type IV divergence.
// This object will provide initial state and functional operations.
module.exports = {

    // Function to provide initial data properties for a component instance.
    // Replaces the 'data' function in the original mixin.
    initialSettings: function () {
        // 'this' in a component context would refer to the component instance.
        // The component instance itself will hold the email and password.
        return {
            mailData: '',       // Renamed 'email'
            passcodeData: ''    // Renamed 'password'
        };
    },

    // Object containing functional operations (methods) for the component.
    // Replaces the 'methods' object in the original mixin.
    functionalOperations: {

        // Asynchronously handles the user registration process.
        // Replaces the 'signup' method.
        async performRegistration() {
            // 'this' refers to the component instance in the consuming framework.
            // We assume the component has 'linkedParent' (for $parent) and 'eventEmitter' (for $dispatch).
            const parentContext = this.linkedParent; // Equivalent to this.$parent
            const componentEvents = this.eventEmitter; // Equivalent to this.$dispatch (assumed to be an EventBroadcaster instance)

            const currentMail = this.mailData;       // Accesses component's data property
            const currentPass = this.passcodeData;    // Accesses component's data property

            parentContext.activityIndicator = true; // Replaces $auth.isLoading

            try {
                // Calls the parent's identity service to register a new user.
                // Replaces $auth.$user.signup(user)
                const newlyCreatedUser = await parentContext.identityService.registerNew({
                    electronicMail: currentMail,
                    secretKey: currentPass
                });

                parentContext.errorContainer = {}; // Replaces $auth.errors = {}
                componentEvents.publish('account:provisioned', newlyCreatedUser); // Replaces signup:success
                await this.executeLogin(); // Calls the login method on the current component instance
            } catch (initialOperationIssue) {
                // First catch block, equivalent to authError.bind($auth)
                try {
                    const detailedMessageText = obtainIssueMessage(initialOperationIssue);
                    // Assumes parentContext.errorContainer has an 'addEntry' method, replacing $add
                    parentContext.errorContainer.addEntry(initialOperationIssue.code, detailedMessageText);
                    throw initialOperationIssue; // Re-throw to be caught by the next catch block
                } catch (propagatedIssue) {
                    // Second catch block, equivalent to signupError
                    componentEvents.publish('registration:failed', propagatedIssue); // Replaces signup:error
                }
            } finally {
                parentContext.activityIndicator = false; // Ensures activity indicator is reset
            }
        },

        // Asynchronously handles the user login process.
        // Replaces the 'login' method.
        async executeLogin() {
            const parentContext = this.linkedParent;
            const componentEvents = this.eventEmitter;

            const currentMail = this.mailData;
            const currentPass = this.passcodeData;

            parentContext.activityIndicator = true;

            try {
                // Calls the parent's identity service to authenticate an existing user.
                // Replaces $auth.$user.login(user)
                const authenticationData = await parentContext.identityService.authenticateExisting({
                    electronicMail: currentMail,
                    secretKey: currentPass
                });

                parentContext.errorContainer = {};
                componentEvents.publish('session:activated', authenticationData); // Replaces login:success
            } catch (initialOperationIssue) {
                // First catch block, equivalent to authError.bind($auth)
                try {
                    const detailedMessageText = obtainIssueMessage(initialOperationIssue);
                    parentContext.errorContainer.addEntry(initialOperationIssue.code, detailedMessageText);
                    throw initialOperationIssue; // Re-throw
                } catch (propagatedIssue) {
                    // Second catch block, equivalent to loginError
                    componentEvents.publish('login:denied', propagatedIssue); // Replaces login:error
                }
            } finally {
                parentContext.activityIndicator = false;
            }
        }
    }
};

// Note: The consuming framework (e.g., a custom component system) would need to:
// 1. Ensure `obtainIssueMessage` is correctly resolved.
// 2. Provide `this.linkedParent` which has `identityService` (with `registerNew`, `authenticateExisting`),
//    `activityIndicator`, and `errorContainer` (with `addEntry`).
// 3. Provide `this.eventEmitter` as an instance of `EventBroadcaster` or a compatible event system.
// 4. Bind `performRegistration` and `executeLogin` to the component instance (`this`).