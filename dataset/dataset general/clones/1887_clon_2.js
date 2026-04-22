// Customer data access layer initialization

// app.module('customerDataModule', ['ngResource']).
// service('Customer', function(http){
// return http('/clients', {}, {
// fetch: {verb:'GET', collection:true}
// });
// });

var appComponents = angular.module('customer_portal');

    appComponents.factory('Customers', function($resource) {

        // Service responsible for interacting with customer API endpoints
        var ClientAPI = $resource(
            '/customers/:customer_id',
            { customer_id: '@key' },
            {
                'addEntry': { method: 'POST' },
                'listEntries': { method: 'GET', isArray: true },
                'modifyEntry': { method: 'PUT' },
                'deleteRecord': { method: 'DELETE' }
            }
        );

        return ClientAPI;
    });