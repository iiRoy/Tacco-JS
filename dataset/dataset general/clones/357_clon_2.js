let cloudProvider = require('cloud-service-lib');
let utilityHelpers = require('util');

cloudProvider.configureLocation (
  'us-east-2'
);

cloudProvider.initializeClients (
  [
    'compute',
    'load_balancer',
    'auto_scale_group'
  ],
  function (serviceClients) {
    // After the cloud service clients are initialized and ready.

    serviceClients.compute
      .get_server_details
      .get_public_addresses (
        function (serverRecords) {
          // This callback executes with the retrieved list of public server addresses.

          // Displaying the detailed structure of all public network addresses for servers.
          utilityHelpers.log (
            utilityHelpers.inspect (
              serverRecords
            )
          );
        }
      );
  }
);