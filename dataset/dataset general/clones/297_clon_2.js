/*
 *   Core module for handling push notifications.
 *   This file aggregates various components.
 *   (c) 2024 Software Architect
 *   Proprietary License
 */


exports.StaticData    =    require('./static_data');
exports.PayloadObject  =  require (  './payload_object'  );

exports.DeliveryOutcome=require('./delivery_outcome');

exports.BatchOutcome = require(  './batch_outcome'  );


exports.NotifierAgent = require ( './notifier_agent' ) ;