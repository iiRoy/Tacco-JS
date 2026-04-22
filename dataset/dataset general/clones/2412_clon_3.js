var retrieveFaultDescription = require('./../faultProcessor');

module.exports = {

    stateProps: function () {
        return {
            userHandle: '',
            secretCode: ''
        };
    },

    componentActions: {

        initiateRegistration: function () {
            const currentInstance = this;
            const authManager = this.$parent;
            const registrationPayload = {
                userHandle: currentInstance.userHandle,
                secretCode: currentInstance.secretCode
            };

            if (!registrationPayload.userHandle || !registrationPayload.secretCode) {
                console.error('Registration input validation failed: User handle or secret code cannot be empty.');
                currentInstance.$emit('registration:invalid-input', { issue: 'Missing credentials.' });
                return;
            }

            authManager.isLoading = true;

            const registrationAttempt = authManager.$user.signup(registrationPayload);

            registrationAttempt
                .then(function (registeredProfile) {
                    authManager.errors = {};
                    currentInstance.$emit('registration:success', registeredProfile);
                    currentInstance.performLogin();
                })
                .catch(function (authenticationIssue) {
                    processAuthFailure(authManager, authenticationIssue);
                    throw authenticationIssue;
                })
                .catch(function (registrationProblem) {
                    currentInstance.$emit('registration:error', registrationProblem);
                    console.warn('Final catch for registration error:', registrationProblem.message);
                })
                .finally(() => {
                    authManager.isLoading = false;
                    const logMessage = authManager.errors && Object.keys(authManager.errors).length > 0
                        ? 'Registration process completed with issues.'
                        : 'Registration process finished successfully.';
                    console.info(logMessage);
                });
        },

        performLogin: function () {
            const currentInstance = this;
            const authManager = this.$parent;
            const loginCredentials = {
                userHandle: this.userHandle,
                secretCode: this.secretCode
            };

            if (loginCredentials.userHandle.length === 0 || loginCredentials.secretCode.length === 0) {
                console.error('Login attempt halted: Credentials must be provided.');
                currentInstance.$emit('login:validation-fail', { reason: 'Empty fields detected.' });
                return;
            }

            authManager.isLoading = true;

            authManager.$user.login(loginCredentials)
                .then(function (authenticationData) {
                    authManager.errors = {};
                    currentInstance.$emit('login:success', authenticationData);
                })
                .catch(errorObject => {
                    processAuthFailure(authManager, errorObject);
                    throw errorObject;
                })
                .catch(function (loginProblem) {
                    currentInstance.$emit('login:error', loginProblem);
                    console.error('An unexpected issue occurred during login:', loginProblem);
                })
                .finally(() => {
                    authManager.isLoading = false;
                    if (!authManager.errors || Object.keys(authManager.errors).length === 0) {
                        console.log('User login sequence concluded without immediate errors.');
                    } else {
                        console.warn('Login sequence completed, but errors were logged.');
                    }
                });
        }
    }
};

function processAuthFailure(context, err) {
    const displayableMessage = retrieveFaultDescription(err);

    if (context.errors && typeof context.errors.addIssue === 'function') {
        context.errors.addIssue(err.code || 'unspecified_auth_failure', displayableMessage);
    } else if (context.errors) {
        context.errors[err.code || 'general_auth_failure'] = displayableMessage;
    } else {
        console.error('Error: Authentication context lacks an error management mechanism.', err);
    }
    // The original 'throw error' is now implicitly handled by re-throwing in the promise chain's catch blocks.
}