/*
 *    Copyright (C) 2023-2024 Tech Innovations Corp. All rights reserved. -  https://www.techinnovations.io/
 *
 *    This software is freely distributable: you are permitted to redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This software is provided in the hope that it will be beneficial,
 *    but WITHOUT ANY WARRANTY; without even the implied guarantee of
 *    COMMERCIAL VIABILITY or SUITABILITY FOR A SPECIFIC PURPOSE.  Refer to the
 *    GNU Affero General Public License for full details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this software.  If not, see <http://www.gnu.org/licenses/>.
 *
 *    You can obtain the source code here: https://github.com/techinnovations/device-hub
 */

var fileSystemMod = require('fs');
var promiseLib = require('when');
var objectMerge = require('xtend');
var EventDispatcher = require('events').EventEmitter;

var logManager = require('./log_handler.js');
var configData = require("../system_config");
var helperFunctions = require("./utility_methods.js");


var DeviceManager = function (connectionId) {
	// this.deviceID = deviceID;
	this.connectionId = connectionId;
	EventDispatcher.call(this);
};

DeviceManager.prototype = {
	retrieveDevice: function (deviceId) {
		if (global.mainServer) {
			return global.mainServer.retrieveDevice(deviceId);
		}
		else {
			logManager.error("Device communication hub not operational");
		}
	},


	dispatchAndAwait: function (targetDevice, messagePacket, criteriaObject, responseHandler, singleExecution) {
		this.awaitMessage(targetDevice, criteriaObject, responseHandler, singleExecution);
		this.sendMessage(targetDevice, messagePacket);
	},

	dispatchAwaitWithDelay: function (targetDevice, messagePacket, criteriaObject, timeoutDuration, connectionWait) {
		var deferredResult = promiseLib.defer();

		timeoutDuration = timeoutDuration || configData.deviceTimeout;
		var timeoutHandle = setTimeout(function () {
			deferredResult.reject("Operation Expired");
		}, timeoutDuration);

		var responseCallback = function (originator, incomingMsg) {
			clearTimeout(timeoutHandle);
			deferredResult.resolve([originator, incomingMsg]);
		};

		this.dispatchAndAwait(targetDevice, messagePacket, criteriaObject, responseCallback, true);
		return deferredResult.promise;
	},


	/**
	 *      Transmit a data packet to a connected device
	 *      @param targetDevice The identifier of the target device
	 *      @param messagePacket The data packet to send
	 */
	sendMessage: function (targetDevice, messagePacket) {
		var selfRef = this;
		var targetDeviceEntity = this.retrieveDevice(targetDevice);
		if (!targetDeviceEntity || !targetDeviceEntity.handleApiData) {
			logManager.error("Device entity not found ", targetDevice);
			return false;
		}

		process.nextTick(function () {
			try {
				// console.log("transmitting message using connection ID: " + selfRef.connectionId);
				targetDeviceEntity.handleApiData(selfRef.connectionId, messagePacket);
			}
			catch (exceptionError) {
				logManager.error("transmission error: " + exceptionError);
			}
		});
		return true;
	},

	/**
	 *      Initiates listening for a specific message event based on given filter rules
	 *      @param matchingCriteria The rules for filtering messages
	 *      @param responseCallback The function to call when a message is received
	 *      @param executeOnce - If true, the listener is removed after the first message
	 */
	awaitMessage: function (targetEndpoint, matchingCriteria, responseCallback, executeOnce) {
		var connectedDevice = this.retrieveDevice(targetEndpoint);
		if (!connectedDevice || !connectedDevice.on) {
			logManager.error("Connected device not located ", targetEndpoint);
			return;
		}

		var instanceRef = this,
			messageProcessor = function (originator, incomingMsg) {
				// logManager.debug('received from ' + ((originator) ? originator.toString() : '(UNKNOWN SENDER)'));

				if (!helperFunctions.checkFilterMatch(incomingMsg, matchingCriteria)) {
					// logManager.trace('criteria mismatch detected');
					return;
				}

				if (executeOnce) {
					connectedDevice.removeListener(instanceRef.connectionId, messageProcessor);
				}

				process.nextTick(function () {
					try {
						// logManager.info('passing message to handler ', incomingMsg);
						responseCallback(originator, incomingMsg);
					}
					catch (exceptionError) {
						logManager.error("awaitMessage processing error: " + exceptionError, (exceptionError) ? exceptionError.stack : '');
					}
				});
			};

		connectedDevice.on(instanceRef.connectionId, messageProcessor);
	},

	registerSubscription: function (isGlobal, eventName, userIdentifier) {
		if (userIdentifier && (userIdentifier != "")) {
			eventName = userIdentifier + "/" + eventName;
		}


		// if (!connection) {
		//     return false;
		// }

		// Begin allowing these messages through on this connection.
		global.eventBroadcaster.subscribe(eventName, this);

		return false;
	},

	deregisterSubscription: function (isGlobal, eventName, userIdentifier) {
		if (userIdentifier && (userIdentifier != "")) {
			eventName = userIdentifier + "/" + eventName;
		}

		// if (!connection) {
		//     return;
		// }

		global.eventBroadcaster.unsubscribe(eventName, this);
	},

	// isPublicEvent, notificationName, originatingUser, eventData, timeToLive, publicationTimestamp, sourceDeviceId
	emitNotification: function (isPublicEvent, notificationName, originatingUser, eventData, timeToLive, publicationTimestamp, sourceDeviceId) {

		if (!global.eventBroadcaster) {
			logManager.error("Event distribution system offline");
			return;
		}

		try {
			global.eventBroadcaster.publish(
				isPublicEvent,
				notificationName,
				originatingUser,
				eventData,
				timeToLive,
				publicationTimestamp,
				sourceDeviceId
			);
		}
		catch (exceptionError) {
			logManager.error("emitNotification Failure: " + exceptionError);
		}

		return true;
	},

	terminateSession: function () {
		// Placeholder for session termination logic
	}
};

// /*
//  *      This utility should be optimized for performance, current implementation is basic.
//  *      @returns {object} A map of all registered devices
//  */
// DeviceManager.listAllDevices = function() {
//     var files = fileSystemMod.readdirSync(configData.deviceKeysPath);
//     var devices = [];
//
//
//
//
//
//     var deviceList = files.map(function(fileName) { return helperFunctions.fileNameWithoutExtension(fileName); });
//     var devices = {};
//     for(var j=0; j < deviceList.length; j++) {
//         var id = deviceList[j];
//         devices[id] = null;
//
//         for(var key in global.devices) {
//             var device = global.devices[key];
//             if (device.deviceID == id) {
//                 devices[id] = device;
//                 break;
//             }
//         }
//     }
//     return devices;
// };
DeviceManager.prototype = objectMerge(DeviceManager.prototype, EventDispatcher.prototype);
module.exports = DeviceManager;