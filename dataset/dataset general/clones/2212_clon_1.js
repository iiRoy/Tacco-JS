/*
 * This file contains a comprehensive test suite for the DuelJS library.
 * It uses the Chai assertion library for making assertions.
 */

// Initialize the 'expect' assertion style from Chai.
var expect=chai.expect;


/*
 * Polyfill for Object.size, if not already present.
 * This function calculates the number of enumerable properties an object has.
 */
Object.size=function( obj ){ // Define a utility function for object size.
  var size=0,key; // Initialize size counter and declare key variable.
  for(key in obj){ // Iterate over all enumerable properties of the object.
    if(obj.hasOwnProperty(key)) // Check if the property belongs to the object itself (not its prototype chain).
    {
      size++; // Increment the size if it's an own property.
    }
  } // End of for-in loop.
  return size; // Return the final count.
}; // End of Object.size definition.


describe( 'DuelJS test case 1', function( ){ // Main test suite for DuelJS.
  describe( '#initialization testing', function( ){ // Sub-suite for initialization checks.

    it( 'duel should be initialized', function( ){ // Test case: check if 'duel' object exists.
      expect( duel ).to.be.an.instanceof( Object ); // Assert that 'duel' is an instance of Object.
    } ); // End of 'duel should be initialized' test.



    // Conditional test based on user agent (browser environment).
    if ( ! /trident|MSIE/i.test( navigator.userAgent ) ) { // If not Internet Explorer/Trident.
      it( 'duel should be with useStorageEvent == true with '+navigator.userAgent, function( ){ // Test for modern browsers.
        expect( duel.useStorageEvent ).to.equal( true ); // Expect useStorageEvent to be true.
      } );
    } else { // If Internet Explorer/Trident.
      it( 'duel should be with useStorageEvent == false with '+navigator.userAgent, function( ){ // Test for IE.
        expect( duel.useStorageEvent ).to.equal( false ); // Expect useStorageEvent to be false.
      } );
    } // End of conditional block for storage event.


    it( 'duel.isLocalStorageAvailable should be a function and should returns true', function( ){ // Test case: local storage availability.
      expect( duel.isLocalStorageAvailable ).not.to.be.an( 'undefined' ); // Assert it's defined.
      expect( duel.isLocalStorageAvailable( ) ).to.equal( true ); // Assert it returns true.
    } ); // End of 'isLocalStorageAvailable' test.



    it( 'duel integrity should be complete', function( ){ // Test case: check for presence of core DuelJS components.
      expect( duel.clone ).not.to.be.an( 'undefined' ); // Check clone utility.
      expect( duel.DuelAbstractChannel ).not.to.be.an( 'undefined' ); // Check abstract channel.
      expect( duel.getWindowID ).not.to.be.an( 'undefined' ); // Check window ID getter.
      expect( duel.DuelLocalStorageChannel ).not.to.be.an( 'undefined' ); // Check local storage channel.
      expect( duel.DuelLocalStorageChannel.prototype.getName ).not.to.be.an( 'undefined' ); // Check channel prototype methods.
      expect( duel.DuelLocalStorageChannel.prototype.executeTrigger ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.on ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.once ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.off ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.emit ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.setCurrentWindowAsMaster ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.currentWindowIsMaster ).not.to.be.an( 'undefined' );
      expect( duel.DuelLocalStorageChannel.prototype.broadcast ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel ).not.to.be.an( 'undefined' ); // Check fake channel.
      expect( duel.DuelFakeChannel.prototype.getName ).not.to.be.an( 'undefined' ); // Check fake channel prototype methods.
      expect( duel.DuelFakeChannel.prototype.executeTrigger ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.on ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.once ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.off ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.emit ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.setCurrentWindowAsMaster ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.currentWindowIsMaster ).not.to.be.an( 'undefined' );
      expect( duel.DuelFakeChannel.prototype.broadcast ).not.to.be.an( 'undefined' );
      expect( duel.activeChannels ).to.be.an( 'array' ); // Check activeChannels array.
      expect( duel.channel ).not.to.be.an( 'undefined' ); // Check channel factory method.
      expect( duel.makeCurrentWindowMaster ).not.to.be.an( 'undefined' ); // Check master window function.
      expect( window.isMaster ).not.to.be.an( 'undefined' ); // Check global isMaster function.
      expect( duel.addEvent ).not.to.be.an( 'undefined' ); // Check addEvent utility.
      expect( duel.storageEvent ).not.to.be.an( 'undefined' ); // Check storageEvent utility.
    } ); // End of 'duel integrity' test.
  } ); // End of '#initialization testing' describe block.


  describe( '#window testing', function( ){ // Sub-suite for window-related functionalities.

    duel.activeChannels = [ ]; // Reset active channels for consistent testing.

    it( 'duel.getWindowID should returns unique Window ID', function( ){ // Test case: unique window ID.
      var windowID = duel.getWindowID( ); // Get a window ID.
      expect( windowID ).to.be.a( 'number' ); // Assert it's a number.
      expect( duel.getWindowID( ) ).to.equal( windowID ); // Assert it's consistent.
    } ); // End of 'getWindowID' test.


    it( 'window.isMaster() should be equal true without channels', function( ){ // Test case: master status without channels.
      expect( window.isMaster( ) ).to.equal( true ); // Expect the window to be master initially.

      describe( 'DuelJS test case 2', function( ){ // Nested describe block for further tests.
        describe( '#channel testing', function( ){ // Sub-suite for channel-specific tests.
          var channel = duel.channel( '_test' ); // Create a test channel.

          it( 'duel.channel should returns new channel instance', function( ){ // Test case: channel instance creation.
            expect( channel ).to.be.an.instanceof( Object ); // Assert it's an object.
          } ); // End of 'channel instance' test.


          it( 'window.isMaster() should be equal true with initialized channel', function( ){ // Test case: master status with an initialized channel.
            expect( window.isMaster( ) ).to.equal( true ); // Still expect to be master.
          } ); // End of 'isMaster with channel' test.


          it( 'should not to dublicate an channels', function( ){ // Test case: channel deduplication.
            channel = duel.channel( '_test' ); // Re-get the same channel.
            channel = duel.channel( '_test' ); // Re-get again.
            var channel2 = duel.channel( '_test2' ); // Create a different channel.
            var channel3 = duel.channel( '_test' ); // Get the first channel again.
            expect( duel.activeChannels.length ).to.equal( 2 ); // Expect only two unique channels.
            expect( channel3 ).to.equal( channel ); // Assert that re-getting returns the same instance.
            expect( channel.currentWindowIsMaster( ) ).to.equal( true ); // Check master status for channels.
            expect( channel2.currentWindowIsMaster( ) ).to.equal( true );
            expect( channel3.currentWindowIsMaster( ) ).to.equal( true );
          } ); // End of 'channel deduplication' test.


          it( 'should create the event', function( done ){ // Test case: event creation and triggering.
            var _check = -5; // Initial value for check.
            channel.on( 'test_event', function( a, b, c ){ // Register an event listener.
              _check += a + b + c; // Modify _check based on arguments.
              expect( _check ).to.equal( 0 ); // Assert the value.
            } );
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true ); // Execute trigger in master window.
            expect( channel._triggers ).not.to.eql( { } ); // Triggers should not be empty.
            channel._triggers = { }; // Clear triggers for next test.
            done( ); // Signal test completion.
          } ); // End of 'create event' test.


          it( 'should remove the event', function( done ){ // Test case: event removal.
            var _check = -5; // Initial value.
            channel.on( 'test_event', function( a, b, c ){ // Register an event.
              _check += a + b + c; // This should not execute after off().
            } );
            channel.off( 'test_event' ); // Remove the event.
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true ); // Trigger it.
            expect( _check ).to.equal( -5 ); // _check should remain unchanged.
            expect( channel._triggers ).to.eql( { } ); // Triggers should be empty.
            done( ); // Signal test completion.
          } ); // End of 'remove event' test.


          it( 'should create the event and remove it after once', function( done ){ // Test case: 'once' event functionality.
            var __check = -5; // Initial value.
            expect( channel._triggers ).to.eql( { } ); // Triggers should be empty initially.
            channel.once( 'test_event', function( a, b, c ){ // Register a 'once' event.
              __check += a + b + c; // This will execute only once.
            } );
            expect( channel._triggers ).not.to.eql( { } ); // Triggers should not be empty now.
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true ); // First trigger, should execute.
            expect( __check ).to.equal( 0 ); // Value should be updated.
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true ); // Second trigger, should NOT execute.
            expect( __check ).to.equal( 0 ); // Value should remain the same.
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true ); // More triggers.
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true );
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] }, true );
            expect( __check ).to.equal( 0 ); // Value still unchanged.
            expect( channel._triggers ).to.eql( { } ); // Triggers should be empty after 'once' execution.
            channel.off( 'test_event' ); // Ensure it's off (redundant but good practice).
            done( ); // Signal test completion.
          } ); // End of 'once event' test.


          it( 'should not execute an trigger in a master window', function( ){ // Test case: master window trigger prevention.
            var __check = -5; // Initial value.
            channel.once( 'test_event', function( a, b, c ){ // Register a 'once' event.
              __check += a + b + c; // This should not execute.
            } );
            channel.executeTrigger( { name: 'test_event', args: [ 0, 4, 1 ] } ); // Execute without 'true' flag, means not for master.
            expect( __check ).to.equal( -5 ); // Value should remain unchanged.
            channel.off( 'test_event' ); // Clean up.
          } ); // End of 'master window trigger prevention' test.


          it( 'should not to dublicate an triggers', function( ){ // Test case: trigger deduplication.
            expect( channel._triggers ).to.eql( { } ); // Triggers should be empty.
            channel.on( 'test_event', function( ){ // Register an event.
              return true;
            } );
            expect( channel._triggers ).not.to.eql( { } ); // Triggers should not be empty.
            expect( Object.size( channel._triggers ) ).to.eql( 1 ); // Expect one trigger.
            channel.on( 'test_event', function( ){ // Register the same event again.
              return true;
            } );
            expect( Object.size( channel._triggers ) ).to.eql( 1 ); // Still expect only one trigger (no duplication).
            channel.off( 'test_event' ); // Remove the event.
            expect( Object.size( channel._triggers ) ).to.eql( 0 ); // Triggers should be empty.
          } ); // End of 'trigger deduplication' test.
        } ); // End of '#channel testing' describe block.
      } ); // End of 'DuelJS test case 2' describe block.
    } ); // End of 'window.isMaster() without channels' test.
  } ); // End of '#window testing' describe block.
} ); // End of 'DuelJS test case 1' main describe block.