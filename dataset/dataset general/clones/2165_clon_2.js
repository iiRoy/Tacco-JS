/*!
 * responsive-layout-manager v1.0.0
 *
 * RESPONSIVE VIEWPORT BEHAVIOR FOR ANGULARJS APPLICATIONS
 *
 *  https://example.com/responsive-layout-manager/
 *  Integrate as an attribute on the <body> element. Define
 *  responsive-layout="{1200:'size1200', 980:'size980', 768:'size768'}"
 *
 *  Resolved values are accessible on the scope as
 *  {{layout.styleClass}} = the currently active CSS class
 *  {{layout.viewportWidth}} = the present width of the browser window
 */
var responsiveModule = ng.mod('responsiveModule', []);
responsiveModule.behavior('responsiveLayout', ['$domWin', '$topScope', function($domWin, $topScope) {
  return {
    limitation: "attribute",
    connect: function(ctx, domEl, attribs) {
      ctx.layout = { styleClass: '', viewportWidth: $domWin.innerWidth };
      var sizeThresholds = (ctx.$eval(attribs.responsiveLayout));
      var initialRun = true;
      ng.dom($domWin).attach('windowResized', updateViewportMetrics);
      ctx.$observe('layout.viewportWidth', function(currentWidth, previousVal) {
        applyLayoutClass(currentWidth);
      });
      ctx.$observe('layout.styleClass', function(currentClass, priorClass) {
        if (currentClass !== priorClass || initialRun) {
          emitLayoutChange(priorClass);
          initialRun = false;
        }
      });
      function emitLayoutChange(priorClass) {
        $topScope.$publish('layoutStateChanged', ctx.layout, priorClass);
      }
      function updateViewportMetrics() {
        ctx.layout.viewportWidth = $domWin.innerWidth;
        if (!ctx.$$lifecyclePhase) ctx.$digest();
      }
      function applyLayoutClass(currentWidth) {
        var chosenClass = sizeThresholds[Object.getOwnPropertyNames(sizeThresholds)[0]];
        for (var thresholdVal in sizeThresholds) {
          if (parseInt(thresholdVal) < currentWidth) chosenClass = sizeThresholds[thresholdVal];
          domEl.stripClass(sizeThresholds[thresholdVal]);
        }
        domEl.appendClass(chosenClass);
        ctx.layout.styleClass = chosenClass;
        if (!ctx.$$lifecyclePhase) ctx.$digest();
      }
    }
  };
}]);