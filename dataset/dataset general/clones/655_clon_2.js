var CommNexusCore = require('./lib/core-module');
var webEngine = require('http').Server;
var validateAssertion = require('expect.js');

var systemConfig = {
  transformer: 'web-sockets-protocol',
  parser: 'JsonDataParser'
};

// This utility function generates a client instance connected to the given server
function initiateClient(hostService, nexusSystem, listenPort) {
  var hostAddress = hostService.address();
  var resourceLocator = 'http://' + hostAddress.address + ':' + (listenPort || hostAddress.port);
  return new nexusSystem.Socket(resourceLocator);
}

// This function sets up the core communication server
function establishNexus(hostService, systemConfig) {
  return CommNexusCore(hostService, systemConfig);
}


testSuite('nexus.communication functionality', function() {

  // Verifies that the communication layer includes its middleware
  testCase('should incorporate the nexus.io.middleware layer', function() {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    validateAssertion(~nexusSystem.indexOfLayer('nexus.io.middleware')).to.be.ok();
  });

  // Confirms compatibility with event emitters
  testCase('should interact correctly with an event emitter', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        completionCallback(); // Signal test completion
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
  });

  // Tests server-to-client message transmission
  testCase('should enable sending messages from the server to a client', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.send('dataPacket', {
          greeting: 'salutations'
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
    clientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be.eql({
        greeting: 'salutations'
      });
      completionCallback();
    });
  });

  // Checks if the channel method is available when using createSocket
  testCase('should expose channel method when utilizing createSocket', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        completionCallback();
      });
    });

    var hostAddress = hostService.address();
    var ClientConnection = CommNexusCore.createSocket(systemConfig);
    var clientInstance = new ClientConnection('http://' + hostAddress.address + ':' + hostAddress.port);
    var clientChanAlpha = clientInstance.channel('alpha');
  });

  // Validates client-to-server message transmission
  testCase('should permit sending messages from a client to the server', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('dataPacket', function(payloadContent) {
          validateAssertion(payloadContent).to.be.eql({
            greeting: 'salutations'
          });
          completionCallback();
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
    clientChanAlpha.send('dataPacket', {
      greeting: 'salutations'
    });
  });

  // Tests acknowledgment support on the client side
  testCase('should support acknowledgment mechanism on the client', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('dataPacket', function(payloadContent, ackFunction) {
          validateAssertion(payloadContent).to.be.eql({
            greeting: 'salutations'
          });
          ackFunction('acknowledged');
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
    clientChanAlpha.send('dataPacket', {
      greeting: 'salutations'
    }, function(payloadContent) {
      validateAssertion(payloadContent).to.be('acknowledged');
      completionCallback();
    });
  });

  // Tests acknowledgment support on the server side
  testCase('should support acknowledgment mechanism on the server', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.send('dataPacket', {
          greeting: 'salutations'
        }, function(payloadContent) {
          validateAssertion(payloadContent).to.be('acknowledged');
          completionCallback();
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
    clientChanAlpha.on('dataPacket', function(payloadContent, ackFunction) {
      validateAssertion(payloadContent).to.be.eql({
        greeting: 'salutations'
      });
      ackFunction('acknowledged');
    });
  });

  // Verifies the ability for a client to join a group
  testCase('should allow a client to enter a group', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.enterGroup('alpha', function() {
          completionCallback();
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
  });

  // Verifies the ability for a client to leave a group
  testCase('should allow a client to exit a group', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.enterGroup('alpha');
        clientUnit.exitGroup('alpha', function() {
          completionCallback();
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var clientChanAlpha = clientInstance.channel('alpha');
  });

  // Tests broadcasting a message to a single client in a group
  testCase('should allow broadcasting a message to a single client', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('rawPayload', function(groupName) {
          if ('self' === groupName) {
            clientUnit.room('roomOne').write('helloWorld');
          } else {
            clientUnit.enterGroup(groupName);
          }
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var firstClientChanAlpha = clientInstance.channel('alpha');
    firstClientChanAlpha.on('rawPayload', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      completionCallback();
    });
    firstClientChanAlpha.write('roomOne');

    // Introduce a small delay to ensure room joining happens
    setTimeout(function() {
      var currentClientChan = clientInstance.channel('alpha');
      currentClientChan.write('self');
    }, 0);

  });

  // Tests broadcasting a message to multiple clients in different groups
  testCase('should allow broadcasting a message to multiple clients', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');
    var remainingOperations = 3; // Expecting 3 messages

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('rawPayload', function(groupName) {
          if ('self' === groupName) {
            clientUnit.room('roomOne roomTwo roomThree').write('helloWorld');
          } else {
            clientUnit.enterGroup(groupName);
          }
        });
      });
    });


    var clientInstance = initiateClient(hostService, nexusSystem);
    var firstClientChanAlpha = clientInstance.channel('alpha');
    var secondClientChanAlpha = clientInstance.channel('alpha');
    var thirdClientChanAlpha = clientInstance.channel('alpha');

    firstClientChanAlpha.write('roomOne');
    secondClientChanAlpha.write('roomTwo');
    thirdClientChanAlpha.write('roomThree');

    firstClientChanAlpha.on('rawPayload', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    secondClientChanAlpha.on('rawPayload', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    thirdClientChanAlpha.on('rawPayload', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    // Send the broadcast trigger
    setTimeout(function() {
      var currentClientChan = clientInstance.channel('alpha');
      currentClientChan.write('self');
    }, 0);

  });

  // Tests broadcasting a message to a client using an emitter-style send
  testCase('should allow broadcasting a message to a client with emitter', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('enterGroup', function(groupName) {
          clientUnit.enterGroup(groupName);
        });

        clientUnit.on('dataPacket', function(payloadContent) {
          if ('multicastMessage' === payloadContent) {
            clientUnit.room('roomOne').send('dataPacket', 'helloWorld');
          }
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var firstClientChanAlpha = clientInstance.channel('alpha');
    firstClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      completionCallback();
    });
    firstClientChanAlpha.send('enterGroup', 'roomOne');

    // Trigger the broadcast after a short delay
    setTimeout(function() {
      var currentClientChan = clientInstance.channel('alpha');
      currentClientChan.send('dataPacket', 'multicastMessage');
    }, 0);

  });

  // Tests sending messages to multiple specific groups from the server
  testCase('should allow sending to multiple groups from the server', function(completionCallback) {
    this.timeout(0); // Disable timeout for this test
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var expectedTotalEvents = 2; // Expected events to complete test
    var currentJoinCount = 0; // Tracks successful joins

    hostService.listen(function() {

      var firstClientEntity = initiateClient(hostService, nexusSystem);
      var secondClientEntity = initiateClient(hostService, nexusSystem);
      var thirdClientEntity = initiateClient(hostService, nexusSystem);
      var fourthClientEntity = initiateClient(hostService, nexusSystem);

      nexusSystem.on('onConnect', function(clientUnit) {
        clientUnit.on('enterGroup', function(groupName) {
          clientUnit.enterGroup(groupName, function() {
            if (3 === currentJoinCount++) { // After 3 clients have joined
              nexusSystem.room('groupA groupB groupC').send('updatesFeed');
            }
          });
        });
      });

      firstClientEntity.on('updatesFeed', function(receivedData) {
        --expectedTotalEvents || concludeTest();
      });

      secondClientEntity.on('updatesFeed', function(receivedData) {
        --expectedTotalEvents || concludeTest();
      });

      thirdClientEntity.on('updatesFeed', function(receivedData) {
        --expectedTotalEvents || concludeTest();
      });

      fourthClientEntity.on('updatesFeed', function(receivedData) {
        concludeTest(new Error('failure')); // This client should not receive data
      });

      function concludeTest(receivedData) {
        hostService.close();
        completionCallback(receivedData);
      }

      firstClientEntity.send('enterGroup', 'groupA');
      secondClientEntity.send('enterGroup', 'groupB');
      thirdClientEntity.send('enterGroup', 'groupC');
      fourthClientEntity.send('enterGroup', 'groupD'); // This client should not receive broadcast

    });
  });

  // Tests broadcasting a message to multiple clients using an emitter from a channel
  testCase('should allow broadcasting a message to multiple clients with emitter from channel;', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');
    var remainingOperations = 3;

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('enterGroup', function(groupName) {
          clientUnit.enterGroup(groupName);
        });

        clientUnit.on('dataPacket', function(payloadContent) {
          if ('multicastMessage' === payloadContent) {
            channelAlpha.room('roomOne roomTwo roomThree').send('dataPacket', 'helloWorld');
          }
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var firstClientChanAlpha = clientInstance.channel('alpha');
    var secondClientChanAlpha = clientInstance.channel('alpha');
    var thirdClientChanAlpha = clientInstance.channel('alpha');

    firstClientChanAlpha.send('enterGroup', 'roomOne');
    secondClientChanAlpha.send('enterGroup', 'roomTwo');
    thirdClientChanAlpha.send('enterGroup', 'roomThree');

    firstClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    secondClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    thirdClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    setTimeout(function() {
      var currentClientChan = clientInstance.channel('alpha');
      currentClientChan.send('dataPacket', 'multicastMessage');
    }, 0);

  });

  // Tests broadcasting a message to multiple clients using an emitter from a spark
  testCase('should allow broadcasting a message to multiple clients with emitter', function(completionCallback) {
    var hostService = webEngine();
    var nexusSystem = establishNexus(hostService, systemConfig);
    var channelAlpha = nexusSystem.channel('alpha');
    var remainingOperations = 3;

    hostService.listen(function() {
      channelAlpha.on('onConnect', function(clientUnit) {
        clientUnit.on('enterGroup', function(groupName) {
          clientUnit.enterGroup(groupName);
        });

        clientUnit.on('dataPacket', function(payloadContent) {
          if ('multicastMessage' === payloadContent) {
            clientUnit.room('roomOne roomTwo roomThree').send('dataPacket', 'helloWorld');
          }
        });
      });
    });

    var clientInstance = initiateClient(hostService, nexusSystem);
    var firstClientChanAlpha = clientInstance.channel('alpha');
    var secondClientChanAlpha = clientInstance.channel('alpha');
    var thirdClientChanAlpha = clientInstance.channel('alpha');

    firstClientChanAlpha.send('enterGroup', 'roomOne');
    secondClientChanAlpha.send('enterGroup', 'roomTwo');
    thirdClientChanAlpha.send('enterGroup', 'roomThree');

    firstClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    secondClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    thirdClientChanAlpha.on('dataPacket', function(payloadContent) {
      validateAssertion(payloadContent).to.be('helloWorld');
      if (!--remainingOperations) completionCallback();
    });

    setTimeout(function() {
      var currentClientChan = clientInstance.channel('alpha');
      currentClientChan.send('dataPacket', 'multicastMessage');
    }, 0);

  });

});