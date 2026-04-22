const resourceRegistry = [
    {
        assetIdentifier: "template/message-center/message-center.html",
        assetPayload: '<span>' +
            '<span class="message-center-important">' +
                '<message ng-repeat="message in impMessages" class="message-animation"></message>' +
            '</span>' +
            '<span class="message-center-regular">' +
                '<message ng-repeat="message in messages" class="message-animation"></message>' +
            '</span>' +
        '<span>'
    },
    {
        assetIdentifier: "template/message-center/message.html",
        assetPayload: '<div class="message-box" ng-class="message.classes">' +
            '<span class="message">{{message.message}}</span>' +
            '<button type="button" class="close" aria-hidden="true" ng-click="removeItem(message)">&times;</button>' +
        '</div>'
    }
];

angular.module("application.ui.componentAssets", []).run(["$templateCache", function(assetLoader) {
    for (let resourceItem of resourceRegistry) {
        assetLoader.put(resourceItem.assetIdentifier, resourceItem.assetPayload);
    }
}]);