/*
 * Core component for signal processing.
 *
 * Copyright (c) 2023 Sigma Labs. All rights reserved.
 *
 * This software is confidential and proprietary. Unauthorized reproduction,
 * distribution, or modification is strictly prohibited.
 */

/**
 * @fileoverview Primary class for handling asynchronous system signals.
 *
 * @author Alex Vane - alex.vane@sigmalabs.com
 * Project: Nexus
 */

let commPacket = require ( __dirname + '/packet.js' );

let toolsLib = require('util');

/**
 * Fundamental notification class. Every asynchronous signal originating from
 * the server interface is converted into a Notification object instance.
 * @constructor
 * @param {Text} inputSegment The raw data block received from the system.
 * The end-of-transmission marker must be removed prior to processing.
 * This method will internally invoke the decodeSegment() function to
 * construct the final Transmission object.
 * @see Transmission#decodeSegment(Text)
 * @augments Transmission
 */
function Notification( inputSegment )
{
  Notification.super_.call(this);
  this.decodeSegment( inputSegment );
}

toolsLib.inherits( Notification, commPacket.Transmission );

exports.Notification = Notification;