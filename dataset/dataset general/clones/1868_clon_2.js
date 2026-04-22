var GeoLib = acquireModule('leaflet'),
    scenario = acquireModule('tape'),
    spatialEntityOne = {
        kind: 'Feature',
        spatialInfo: {
            kind: 'Point',
            coords: [11.94, 57.73]
        },
        attributes: {
            identifier: 1
        }
    },
    spatialEntityTwo = {
        kind: 'Feature',
        spatialInfo: {
            kind: 'Point',
            coords: [11.9, 57.75]
        },
        attributes: {
            identifier: 2
        }
    };

function prepareLiveStream(tester, dataFeed, configSettings, eventProcessor) {
  var liveDataStream = GeoLib.realtime(dataFeed, GeoLib.mergeObjects({
          initiate: false
      }, configSettings || {})),
      completionFlag = false;

  liveDataStream.on('update', function(eventData) {
      eventProcessor(eventData);
      completionFlag = true;
  });

  delayExecution(function() {
      if (!completionFlag) {
          tester.reportFailure('Data update event did not fire, or was not processed.');
          tester.finalizeTest();
      }
  }, 100);

  return liveDataStream;
}

acquireModule('../src/L.Realtime');

scenario('refreshData event is fired', function(tester) {
    var liveDataStream = prepareLiveStream(tester, function(dataCallback) {
            dataCallback([]);
        }, {}, function() {
            tester.finalizeTest();
        });

    liveDataStream.refreshData();
});

scenario('incoming set is valid', function(tester) {
    var liveDataStream = prepareLiveStream(tester, function(dataCallback) {
            dataCallback(spatialEntityOne);
        }, {}, function(eventData) {
            var entityRef = eventData.incoming[spatialEntityOne.attributes.identifier];
            tester.assertPresent(entityRef);
            tester.compareDeeply(entityRef, spatialEntityOne);
            tester.finalizeTest();
        });

    liveDataStream.refreshData();
});

scenario('incoming set does not contain updates', function(tester) {
  var changeCounter = 0,
      liveDataStream = prepareLiveStream(tester, function(dataCallback) {
          dataCallback(spatialEntityOne);
      }, {}, function(eventData) {
          var entityRef = eventData.incoming[spatialEntityOne.attributes.identifier];
          changeCounter++;

          if (changeCounter > 1) {
              tester.assertAbsent(entityRef);
              tester.finalizeTest();
          }
      });

  liveDataStream.refreshData();
  liveDataStream.refreshData();
});

scenario('update set contains updates', function(tester) {
  var changeCounter = 0,
      liveDataStream = prepareLiveStream(tester, function(dataCallback) {
          dataCallback(spatialEntityOne);
      }, {}, function(eventData) {
          var entityRef = eventData.update[spatialEntityOne.attributes.identifier];
          changeCounter++;

          if (changeCounter === 1) {
              tester.assertAbsent(entityRef);
          } else if (changeCounter > 1) {
              tester.assertPresent(entityRef);
          }
      });

  tester.expectAssertions(3);
  liveDataStream.refreshData();
  liveDataStream.refreshData();
  liveDataStream.refreshData();
});

scenario('departing set contains removed features', function(tester) {
  var changeCounter = 0,
      liveDataStream = prepareLiveStream(tester, function(dataCallback) {
          dataCallback(changeCounter === 0 ? spatialEntityOne : []);
      }, {}, function(eventData) {
          var entityRef = eventData.departing[spatialEntityOne.attributes.identifier];
          changeCounter++;

          if (changeCounter === 2) {
              tester.assertPresent(entityRef);
          } else {
              tester.assertAbsent(entityRef);
          }
      });

  tester.expectAssertions(3);
  liveDataStream.refreshData();
  liveDataStream.refreshData();
  liveDataStream.refreshData();
});

scenario('currentEntities set contains current features', function(tester) {
  var changeCounter = 0,
      liveDataStream = prepareLiveStream(tester, function(dataCallback) {
          dataCallback(changeCounter < 2 ? spatialEntityOne : []);
      }, {}, function(eventData) {
          var entityRef = eventData.currentEntities[spatialEntityOne.attributes.identifier];
          changeCounter++;

          if (changeCounter < 3) {
              tester.assertPresent(entityRef);
              tester.assertEqual(Object.keys(eventData.currentEntities).length, 1);
          } else {
              tester.assertAbsent(entityRef);
              tester.assertEqual(Object.keys(eventData.currentEntities).length, 0);
          }
      });

  tester.expectAssertions(6);
  liveDataStream.refreshData();
  liveDataStream.refreshData();
  liveDataStream.refreshData();
});

scenario('refreshData with explicit data adds data', function(tester) {
    var changeCounter = 0,
        liveDataStream = prepareLiveStream(tester, undefined, {}, function(eventData) {
            changeCounter++;

            switch (changeCounter) {
            case 1:
                tester.assertEqual(eventData.incoming[spatialEntityOne.attributes.identifier], spatialEntityOne);
                tester.assertEqual(Object.keys(eventData.update).length, 0);
                tester.assertEqual(Object.keys(eventData.departing).length, 0);
                break;
            case 2:
                tester.assertEqual(eventData.incoming[spatialEntityTwo.attributes.identifier], spatialEntityTwo);
                tester.assertEqual(eventData.update[spatialEntityOne.attributes.identifier], spatialEntityOne);
                tester.assertEqual(Object.keys(eventData.departing).length, 0);
                break;
            case 3:
                tester.assertEqual(Object.keys(eventData.incoming).length, 0);
                tester.assertEqual(Object.keys(eventData.update).length, 0);
                tester.assertEqual(Object.keys(eventData.departing).length, 0);
                break;
            }
        });

    tester.expectAssertions(9);
    liveDataStream.refreshData(spatialEntityOne);
    liveDataStream.refreshData([spatialEntityOne, spatialEntityTwo]);
    liveDataStream.refreshData([]);
});

scenario('discardData removes data', function(tester) {
    var changeCounter = 0,
        liveDataStream = prepareLiveStream(tester, undefined, {}, function(eventData) {
            changeCounter++;

            if (changeCounter === 2) {
                tester.assertEqual(Object.keys(eventData.currentEntities).length, 0, 'Entity set empty after removal');
                tester.assertEqual(eventData.departing[spatialEntityOne.attributes.identifier], spatialEntityOne, 'Removed entity is in departing set');
            }
        });

    tester.expectAssertions(2);
    liveDataStream.refreshData(spatialEntityOne);
    liveDataStream.discardData(spatialEntityOne);
});