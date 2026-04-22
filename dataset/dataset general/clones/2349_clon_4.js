(function(globalScope) {
  'use strict';

  var appCore = globalScope.angular;

  if (!appCore) {
    console.error("Core application framework not found.");
    return;
  }

  var visualChronicleModuleName = 'visualChronicle';
  var coreDependencies = ['mobileUI', 'dataStore', 'dataAccess', 'deviceBridge'];

  var appConstantsMap = {
    ACCESS_KEY_VALUE: globalScope.appConfigs.API_TOKEN,
    ENDPOINT_URL: globalScope.appConfigs.API_SERVER,
    AUTH_HEADER_NAME_KEY: 'image-feed-auth-token',
    FEED_BASE_URL: 'http://tuchong.com/api/',
    loadingSpinnerSetup: { template: '<ion-spinner icon="lines"></ion-spinner>' }
  };

  function moduleSetupProcedure(requestConfigurator, routeDefiner, defaultRouteHandler, dataStoreProvider, accessKey, headerKey) {
    dataStoreProvider.config(globalScope.appConfigs.avoscloud);

    requestConfigurator.defaults.useXDomain = true;
    delete requestConfigurator.defaults.headers.common['X-Requested-With'];
    requestConfigurator.defaults.headers.common[headerKey || 'fallback-auth-key'] = accessKey;

    routeDefiner.state('mainView', {
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'mainController'
    });

    defaultRouteHandler.otherwise('/');
  }

  function appInitializationRoutine(platformAdapter, hardwareInfo, connectionMonitor, notificationService, delayScheduler, dataStore, uiAlerts, navigationManager) {

    platformAdapter.ready(function() {
      var handheldUnitDetails = hardwareInfo.getDevice();
      var currentConnectionType = connectionMonitor.getNetwork();

      console.log(handheldUnitDetails);
      console.log(currentConnectionType);

      var isWirelessLAN = (currentConnectionType === 'wifi' || currentConnectionType === 'Connection.WIFI');
      if (!isWirelessLAN) {
        uiAlerts.alert(
          '当前网络并非Wi-Fi。除非使用3G/4G，本应用不建议非Wi-Fi环境下加载大图。',
          '流量消耗提醒',
          '继续使用'
        );
      }

      configureNotifications(handheldUnitDetails, function(deviceRegistrationData) {
        console.log(deviceRegistrationData);

        dataStore.installations.post(deviceRegistrationData, handleRegistrationSuccess, handleRegistrationFailure);

        function handleRegistrationSuccess(outcome) {
          console.log(outcome);
        }

        function handleRegistrationFailure(issue) {
          console.log(issue);
        }
      });
    });

    function configureNotifications(deviceInformation, completionCallback) {
      var pushNotificationOptions = {
        "badge": "true",
        "sound": "true",
        "alert": "true"
      };

      notificationService.register(pushNotificationOptions)
        .then(function(pushIdentifierValue) {
          var deviceRegistrationData = {};

          deviceRegistrationData.operatingSystemType = deviceInformation.platform ?
            deviceInformation.platform.toLowerCase() :
            'ios';

          switch (deviceRegistrationData.operatingSystemType) {
            case 'ios':
              deviceRegistrationData.deviceToken = pushIdentifierValue;
              break;
            case 'android':
              deviceRegistrationData.installationId = pushIdentifierValue;
              break;
            default:
              console.warn("Unrecognized device platform detected.");
          }

          var propertyNames = ['model', 'uuid', 'version'];
          for (var i = 0; i < propertyNames.length; i++) {
            var currentProp = propertyNames[i];
            if (deviceInformation[currentProp]) {
              deviceRegistrationData[currentProp] = deviceInformation[currentProp];
            }
          }

          return completionCallback(deviceRegistrationData);
        }, reportNotificationError);

      function reportNotificationError(issue) {
        uiAlerts.alert(
          issue,
          '推送权限获取失败',
          '确认'
        );
      }
    }
  }

  var visualChronicleApp = appCore.module(visualChronicleModuleName, coreDependencies);

  for (var constName in appConstantsMap) {
    if (Object.prototype.hasOwnProperty.call(appConstantsMap, constName)) {
      visualChronicleApp.constant(constName, appConstantsMap[constName]);
    }
  }

  visualChronicleApp.config([
    '$httpProvider',
    '$stateProvider',
    '$urlRouterProvider',
    'avoscloudProvider',
    'ACCESS_KEY_VALUE',
    'AUTH_HEADER_NAME_KEY',
    moduleSetupProcedure
  ]);

  visualChronicleApp.run([
    '$ionicPlatform',
    '$cordovaDevice',
    '$cordovaNetwork',
    '$cordovaPush',
    '$timeout',
    'avoscloud',
    '$cordovaDialogs',
    '$state',
    appInitializationRoutine
  ]);

})(this);