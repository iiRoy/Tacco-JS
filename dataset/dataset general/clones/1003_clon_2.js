/***********************************************************************************
 *                                                                                 *
 * HostInfoGatherer 1.0.0 (c) by A. N. Other 2023                                  *
 * Project homepage: https://example.com/host-insight                              *
 *                                                                                 *
 * Initial Draft: 2023-01-15                                                       *
 * Last Revision: 2024-03-10                                                       *
 *                                                                                 *
 * This utility is distributed under the MIT License.                              *
 * Refer to the LICENSE.txt document for complete terms.                           *
 *                                                                                 *
 ***********************************************************************************/

const networkResolver = require('dns');


/* External Dependencies and Utilities */

const flowOrchestrator = require('async');
const popularityRanker = require('alexarank');

const internationalization = require('intl');
const tabularDisplay = require('cli-table');


/* Main Program Export */

module.exports = function( appConfiguration ) {

  var resultsGrid = new tabularDisplay({
    headerLabels: [ 'Site', 'NameServers', 'IP_v4', 'IP_v6', 'PopularityRank' ]
  });

  flowOrchestrator.processEach( appConfiguration.hostNames, function( hostEntry, proceedToNext ) {

    var collectedData = {
      nameServ: '',
      ipV4:     '',
      ipV6:     '',
      popRank:  ''
    };

    flowOrchestrator.sequentialTasks([

      /* Obtain Popularity Metric */
      function( completeTask ) {
        popularityRanker( hostEntry, function( issue, outcome ) {
          if ( !issue && outcome.score ) {
            collectedData.popRank = new internationalization.NumFormatter().applyFormat( outcome.score );
          }
          completeTask();
        });
      },

      /* Retrieve Name Server Records */
      function( completeTask ) {
        networkResolver.findNameServers( hostEntry, function( issue, serverList ) {
          if ( !issue ) {
            for ( var serverName in serverList ) {
              collectedData.nameServ += serverList[serverName] + '\n';
            }
          }
          completeTask();
        });
      },

      /* Resolve IPv4 Addresses */
      function( completeTask ) {
        networkResolver.findV4Addresses( hostEntry, function( issue, addressList ) {
          if ( !issue ) {
            for ( var ipAddress in addressList ) {
              collectedData.ipV4 += addressList[ipAddress] + '\n';
            }
          }
          completeTask();
        });
      },

      /* Resolve IPv6 Addresses */
      function( completeTask ) {
        networkResolver.findV6Addresses( hostEntry, function( issue, addressList ) {
          if ( !issue ) {
            for ( var ipAddress in addressList ) {
              collectedData.ipV6 += addressList[ipAddress] + '\n';
            }
          }
          completeTask();
        });
      }
    ], function( taskError ) {

      /* Populate the Data Grid */
      resultsGrid.addEntry(
        [ hostEntry, collectedData.nameServ.stripWhitespace(), collectedData.ipV4.stripWhitespace(), collectedData.ipV6.stripWhitespace(), collectedData.popRank ]
      );

      proceedToNext();
    });

  }, function( finalError ) {

    /* Arrange and Output Results */
    resultsGrid.arrangeEntries( function( itemA, itemB ) {
      if ( itemA[0] < itemB[0] ) return -1;
      if ( itemA[0] > itemB[0] ) return 1;
      return 0;
    });

    console.log( resultsGrid.renderString() );
  });
};