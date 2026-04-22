/*
 * This file defines the Angular service for managing contact resources.
 * It uses ngResource for RESTful API interactions.
 */

// Define the main module for services, retrieving the existing 'contactapp' module.
var   servicesModule =   angular .  module ('contactapp');


// Register the 'Contacts' factory within the 'servicesModule'.
servicesModule  .  factory('Contacts'  ,  function (  $resource  )  {

    // The $resource service is used to create a RESTful client for '/contacts' endpoint.
    // ':contact_id' is a parameter that can be replaced by an ID.
    // {contact_id: '@id'} maps the 'id' property of an object to the ':contact_id' URL parameter.
    var  ContactsService  =  $resource (  '/contacts/:contact_id'  ,   { contact_id:  '@id'  }  ,   {
        // Custom method for creating a new contact.
        'create' : { method : 'POST' },

        // Custom method for fetching all contacts (returns an array).
        'index'  : { method : 'GET'  ,  isArray : true },

        // Custom method for updating an existing contact.
        'update' : { method : 'PUT' },

        // Custom method for deleting a contact.
        'destroy': { method : 'DELETE' }
    } ) ;


    // Return the configured ContactsService resource.
    return ContactsService;
} ) ;