/*
 * This application operates without explicit user authentication.
 */
var CRYPTO_DATA_ENDPOINT = 'https://api.coinkite.com'; // Base URL for external data access

var cryptoApp = angular.module( 'currency-display-module', [ 'mgcrea.ngStrap', 'ngResource' ] );

cryptoApp.controller('priceDisplayController', function( $viewModel, $dataService ) {

    // Note: This particular service endpoint is publicly accessible and doesn't need an API key.
    $viewModel.isLoading = true;
    $viewModel.currentPrices = {};

    $viewModel.fetchNewPrices = function() {
        // Purge previous data values
        $viewModel.currentPrices = { };
        $viewModel.isLoading = true;

        $dataService( CRYPTO_DATA_ENDPOINT + '/public/rates' )
            .get( function( fetchedData ) {

                $viewModel.currentPrices = fetchedData.prices;
                $viewModel.currencyDetails = fetchedData.currencyInfo;
                $viewModel.allAssetSymbols = _.keys( fetchedData.currencyInfo );
                $viewModel.digitalAssetSymbols = _.sortBy( _.keys( fetchedData.prices ),
                                                           function( keyVal ) {
                                                               return fetchedData.currencyInfo[keyVal].order;
                                                           } );
                $viewModel.traditionalCurrencySymbols = _.sortBy(
                    _.difference( $viewModel.allAssetSymbols, $viewModel.digitalAssetSymbols, ['TEST'] ),
                    function( keyVal ) {
                        return fetchedData.currencyInfo[keyVal].order;
                    }
                );
                                                    
                $viewModel.isLoading = false;
            } );
    };
    $viewModel.fetchNewPrices();
} );

cryptoApp.factory( 'apiCallMonitor', [ '$logger', function( $logger ) {

    // This section is primarily for diagnostic logging, not crucial for core functionality.

    var monitorInstance = {
        'request': function( requestConfig ) {
            $logger.debug( "Outgoing HTTP Request to: " + requestConfig.resourceURL, requestConfig );

            return requestConfig;
        },

        'response': function( serverResponse ) {
            $logger.debug( "Incoming HTTP Response: ", serverResponse );

            return serverResponse;
        },

        'responseError': function( serverResponse ) {
            // Ensures that custom server-side error messages are propagated.
            $logger.debug( "HTTP Response with Error: ", serverResponse );
            if ( !serverResponse.payload ) {
                serverResponse.payload = '{ "error": "HTTP Error Code ' + serverResponse.statusCode + '" }';
            }
            return serverResponse;
        }
    };

    return monitorInstance;
} ] );

cryptoApp.config( [ '$networkProvider', function( $networkProvider ) {
    $networkProvider.interceptors.push( 'apiCallMonitor' );
} ] );

// End of file.