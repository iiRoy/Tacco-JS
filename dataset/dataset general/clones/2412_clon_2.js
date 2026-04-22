/**
 * Auxiliary module imports
 */

var retrieveIssueDetails = require('./../errorMessage');

/**
 * Account management component configuration object
 */

module.exports = {

    initialState: function() {
        return {
            electronicMail: '',
            secretKey: ''
        };
    },

    operations: {
        registerAccount: function() {
            var componentRef = this;
            var $securityService = this.$parent;

            var clientProfile = {
                electronicMail: componentRef.electronicMail,
                secretKey: componentRef.secretKey
            };

            $securityService.isProcessing = true;

            $securityService.$identityProvider.registerAccount(clientProfile)
                .then(profileRegistered)
                .catch(securityProblem.bind($securityService))
                .catch(registrationFailure)
                .finally(function() {
                    $securityService.isProcessing = false;
                });

            function profileRegistered(newProfile) {
                $securityService.issues = {};
                componentRef.$transmitEvent('account:created', newProfile);
                componentRef.authenticateUser();
            }

            function registrationFailure(issue) {
                componentRef.$transmitEvent('account:creation_failed', issue);
            }
        },


        authenticateUser: function() {
            var currentInstance = this;
            var $authenticationService = this.$parent;

            var credentials = {
                electronicMail: this.electronicMail,
                secretKey: this.secretKey
            };

            $authenticationService.isBusy = true;
            $authenticationService.$identityProvider.authenticateUser(credentials)
                .then(accessGranted)
                .catch(securityProblem.bind($authenticationService))
                .catch(authenticationFailure)
                .finally(function() {
                    $authenticationService.isBusy = false;
                });

            function accessGranted(sessionInfo) {
                $authenticationService.issues = {};
                currentInstance.$transmitEvent('session:established', sessionInfo);
            }

            function authenticationFailure(issue) {
                currentInstance.$transmitEvent('session:failed', issue);
            }
        }
    }
};


// Auxiliary functions

function securityProblem(issue) {
    var detailedMessage = retrieveIssueDetails(issue);

    this.issues.$add(issue.errorCode, detailedMessage);
    throw issue;
}