/*
 * This module provides utility functions for interacting with an application's
 * internal dependency injection container to retrieve services and components.
 *
 * It is designed for use in environments where the application object
 * exposes a '__container__' property.
 */


// --- Function to lookup a service by its registered name ---
export    function    lookupService    (    application    ,    serviceName    )
{
    // The core logic involves accessing the private '__container__' property
    // on the provided 'application' object, and then calling its 'lookup' method.
    // The lookup string is formatted as 'service:SERVICE_NAME'.
    return    application    .    __container__    .    lookup    (    `service:${serviceName}`    )    ;

}


// --- Function to lookup a component by its registered name ---
export    function    lookupComponent    (    application    ,    componentName    )
{
    // Similar to service lookup, but targets components.
    // We access the application's internal container.
    return    application    .    __container__    .    lookup    (    `component:${componentName}`    )    ;    // The lookup string uses the 'component:COMPONENT_NAME' format.
}