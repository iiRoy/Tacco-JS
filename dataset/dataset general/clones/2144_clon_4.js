const { PassThrough } = require('stream');

function createChannel() {
    const internalConduit = new PassThrough();

    const externalInterface = internalConduit;

    externalInterface.feedData = function(payload) {
        internalConduit.write(payload);
    };

    externalInterface.conclude = function() {
        internalConduit.end();
    };

    return externalInterface;
}

module.exports = createChannel;