const toolkit = require('utility-collection');
const visualBlueprint = require('./layout/view-config.js');

function makeDisplayItem(scope, metadata) {
  const instance = {
    scope: scope,
    metadata: metadata,
    presentContent: function() {
      
    }
  };
  return instance;
}