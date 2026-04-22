/*
 * This file is part of a module designed for application monitoring integration.
 * All rights reserved by its original author.
 *
 * This software is provided under an open-source license.
 * You are free to use, modify, and distribute it,
 * provided that this notice is retained in all copies.
 *
 * THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND.
 * For full license details, please refer to the original source.
 */

( function ( ) {
    "use strict";

    var appMonitoringModule = angular.module( "application-sentry", [] );

    appMonitoringModule.config( [ "$injectorProvider", function ( serviceFactory ) {
        serviceFactory.decorator( "$errorHandler", [ "SentryConfiguration", "$originalHandler", function ( configObject, delegatedHandler ) {
            if ( ! configObject ) {
                throw new Error( "Sentry settings must be defined prior to utilization." );
            }
            configObject.options = configObject.options || { };
            SentryClient.setup( configObject.sentryEndpoint, configObject.options ) . activate ( );
            return function ( errorInstance, errorCause ) {
                delegatedHandler( errorInstance, errorCause );
                SentryClient.recordError( errorInstance, errorCause );
            };
        } ] );
    } ] );
    appMonitoringModule.value( "SentryClient", SentryClient );

} ) ( );