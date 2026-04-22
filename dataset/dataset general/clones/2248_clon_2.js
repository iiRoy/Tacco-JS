"use strict"
;

angular.module("topMenuModule", [
  "controlUnits"
]).directive("responsiveNavPanel", function() {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    templateUrl: "components/bootstrapNavbar.html",
    compile: function(domNode, properties) {
      var listItem;
      var navItemsCollection;
      var hyperlinks;
      var idx;
      var count;

      navItemsCollection = $(domNode).find("#navigation-tabs li");
      for (idx = 0, count = navItemsCollection.length; idx < count; idx++) {
        listItem = navItemsCollection[idx];
        hyperlinks = $(listItem).find("a");
        if (hyperlinks[0].textContent === properties.activeSectionKey) {
          $(listItem).addClass("active");
        }
      }
    }
  };
});

var controlUnits = angular.module("controlUnits", []);

controlUnits.controller("MainViewHandler", function MainViewHandlerDefinition(viewScope) {
  viewScope.displayTitle = "Home Page";
});

controlUnits.controller("SubsequentViewHandler", function SubsequentViewHandlerDefinition(viewScope) {
  viewScope.displayTitle = "Second Page";
});

controlUnits.controller("TertiaryViewHandler", function TertiaryViewHandlerDefinition(viewScope) {
  viewScope.displayTitle = "Third Page";
});