var imageRescaler = {

   Settings: {
      imageRegistry: [],
      dummyPath: "/assets/placeholders/empty.gif"
   },

   processImages: function(targetElements) {
      var isLegacyBrowser = (document.all && !window.opera && !window.XDomainRequest) ? 1 : 0;
      if (isLegacyBrowser && document.getElementsByTagName) {
         var moduleInstance = imageRescaler;
         var mediaCollection = moduleInstance.Settings.imageRegistry;

         var graphicElements = (targetElements && targetElements.length) ? targetElements : document.getElementsByTagName("img");
         for (var counter = 0; counter < graphicElements.length; counter++) {
            graphicElements[counter].initialWidth = graphicElements[counter].offsetWidth;
            graphicElements[counter].initialHeight = graphicElements[counter].offsetHeight;

            mediaCollection.push(graphicElements[counter]);
            moduleInstance.applyAlphaFilter(graphicElements[counter]);
            graphicElements[counter].style.width = "100%";
         }

         if (mediaCollection.length) {
            moduleInstance.registerResizeHandler(function() {
               for (var idx = 0; idx < mediaCollection.length; idx++) {
                  var proportion = (mediaCollection[idx].offsetWidth / mediaCollection[idx].initialWidth);
                  mediaCollection[idx].style.height = (mediaCollection[idx].initialHeight * proportion) + "px";
               }
            });
         }
      }
   },

   applyAlphaFilter: function(visualElement) {
      var selfReference = imageRescaler;
      if (visualElement.previousSource) {
         visualElement.src = visualElement.previousSource;
      }
      var assetURL = visualElement.src;
      visualElement.style.width = visualElement.offsetWidth + "px";
      visualElement.style.height = visualElement.offsetHeight + "px";
      visualElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + assetURL + "', sizingMethod='scale')";
      visualElement.previousSource = assetURL;
      visualElement.src = selfReference.Settings.dummyPath;
   },

   registerResizeHandler: function(handlerFunction) {
      var priorHandler = window.onresize;
      if (typeof window.onresize !== 'function') {
         window.onresize = handlerFunction;
      } else {
         window.onresize = function() {
            if (priorHandler) {
               priorHandler();
            }
            handlerFunction();
         };
      }
   }
};