angular.module('applicationCore', [
  'ngRoute', 'ngSanitize', 'ngTouch', 'ngAnimate', 'doowb.angular-pusher'
])
.constant('systemConfiguration', {
  broadcasterKey: 'd420162e600c57b0e60f',
  broadcasterOptions: {},
  baseApplicationSegment: '/',
  contentRoot: (function() {
    var locationSegments = window.location.hostname.split('.');
    return (locationSegments[0] === 'doowb') ? '/angular-pusher/pages/' : '/pages/';
  })(),
  applicationPaths: {
    'landing': 'home/home.html',
    'itemListing': 'items/items.html'
  },
  defaultRouteFallback: '/itemListing'
})
.config(['$routeProvider', '$locationProvider', '$compileProvider', 'PusherServiceProvider', 'systemConfiguration',
  function(routeHandler, locationManager, compilerConfig, pusherService, appSettings) {

    locationManager.html5Mode(false);

    var entryPoint = appSettings.baseApplicationSegment;
    var contentDirectory = appSettings.contentRoot;

    Object.keys(appSettings.applicationPaths).forEach(function(pathKey) {
      var templateFileLocation = appSettings.applicationPaths[pathKey];
      routeHandler.when(entryPoint + pathKey, {
        templateUrl: contentDirectory + templateFileLocation
      });
    });

    routeHandler.otherwise({
      redirectTo: appSettings.defaultRouteFallback
    });

    pusherService.setToken(appSettings.broadcasterKey);
    pusherService.setOptions(appSettings.broadcasterOptions);
  }
]);