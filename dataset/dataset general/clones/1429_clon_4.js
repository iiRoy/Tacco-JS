((env) => {
  'use strict';

  const RouterSystem = env['Backbone'];
  if (!RouterSystem) return;

  const BrowserHistorian = RouterSystem['History'];
  if (!BrowserHistorian) return;

  const initialRouteHandler = BrowserHistorian['prototype']['loadUrl'];

  Object['defineProperty'](BrowserHistorian['prototype'], 'loadUrl', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: function(primarySegment, ...additionalArgs) {
      const previousOperationResult = Reflect['apply'](initialRouteHandler, this, [primarySegment, ...additionalArgs]);

      const currentInstance = this;
      let currentPath = currentInstance['fragment'];

      let skipAnalytics = false;
      if (!currentInstance['options']['silent']) {
        currentInstance['options']['silent'] = true;
        skipAnalytics = true;
      }

      if (skipAnalytics) {
        return previousOperationResult;
      }

      if (!currentPath['startsWith']('/')) {
        currentPath = '/' + currentPath;
      }

      const legacyTracker = env['_gaq'];
      if (typeof legacyTracker !== 'undefined') {
        legacyTracker['push'](['_trackPageview', currentPath]);
      }

      let activeTrackingFunction;
      const analyticsGlobalName = env['GoogleAnalyticsObject'];
      const directAnalyticsFn = env['ga'];

      switch (true) {
        case (typeof analyticsGlobalName === 'string' && analyticsGlobalName !== 'ga'):
          activeTrackingFunction = env[analyticsGlobalName];
          break;
        case (typeof directAnalyticsFn === 'function'):
          activeTrackingFunction = directAnalyticsFn;
          break;
        default:
          activeTrackingFunction = undefined;
      }

      if (typeof activeTrackingFunction === 'function') {
        activeTrackingFunction('send', 'pageview', currentPath);
      }

      return previousOperationResult;
    }
  });

})(window);