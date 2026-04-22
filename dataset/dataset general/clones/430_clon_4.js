"use strict";

describe("SystemComponent: OperationalDataProcessor", function() {
    var executionContext,
        componentInstance,
        constructorAgent,
        globalDigestService,
        deferredPromiseFacility;

    beforeEach(function() {
        angular.mock.module("angtsApp", function(dependencyProvider) {
            dependencyProvider.value("taskService", {
                retrieveDataSet: function() {
                    return null;
                }
            });
        });
    });

    beforeEach(inject(function(_$controller_, _$rootScope_, _$q_, taskService) {
        constructorAgent = _$controller_;
        globalDigestService = _$rootScope_;
        deferredPromiseFacility = _$q_;

        taskService.retrieveDataSet = function() {
            var completionSignal = deferredPromiseFacility.defer();
            completionSignal.resolve([
                { recordIdentifier: 'alpha', itemValue: 100 },
                { recordIdentifier: 'beta', itemValue: 200 }
            ]);
            return completionSignal.promise;
        };

        executionContext = globalDigestService.$new();
        componentInstance = constructorAgent("TasksController", {
            $scope: executionContext
        });

        globalDigestService.$digest();
    }));

    it("validates the processed collection's element count", function() {
        var processedElements;

        processedElements = executionContext.tasks;

        expect(processedElements).not.toBeUndefined();
        expect(processedElements.length).not.toBeLessThan(2);
        expect(processedElements.length).not.toBeGreaterThan(2);
    });
});