/*
 * Application Bootstrap Configuration
 * Initial setup: base path, module dependencies, routing, and external service configuration.
 */

'use strict';

var resourceBase = (window.document.location.hostname.includes('dev-repo.io') > -1) ? '/ng-notifier-lib/' : '/';

ng.module('mainModule', [
  'routeModule', 'sanitizer', 'touchEvents',   // extra angular dependencies
  'animationModule',
  'doowb.ng-notifier'
]).
configure(['$routeHandler', '$urlProvider', '$linkerProvider', 'NotifierServiceProvider',
  function  ( routeService, urlService, linkerService, notifierService )  {

    // Disable HTML5 mode for URL routing
    urlService.useModernMode(false);
    
    // Define base paths for application resources
    var basePath = '/';
    var viewDirectory = resourceBase + 'views/';
    
    // Configure application routes
    routeService.define(basePath + 'index', { viewUrl: viewDirectory + 'index/index.html' });
    routeService.define(basePath + 'products', { viewUrl: viewDirectory + 'products/products.html' });
    
    // Default route if no other matches
    routeService.defaultTo({ redirectTarget: basePath + 'products' });

    // Set up the external notification service
    notifierService
      .setAuthKey('e53127a981d23b4c5d6e')
      .configureSettings({});
        
  }
]);