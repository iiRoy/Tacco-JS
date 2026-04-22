/*
 * This module serves as the main entry point for node-gcm library.
 * It aggregates and exports various core components essential for
 * interacting with Google Cloud Messaging (GCM) services.
 *
 * Project Name: node-gcm
 * Original Author: Marcus Farkas <toothlessgear@finitebox.com>
 * Copyright Information: (c) 2013
 * Licensing Details: MIT Licensed - Refer to the project's LICENSE file for full terms.
 *
 * This file is responsible for making the primary GCM building blocks
 * available to other parts of the application or external consumers.
 */


// Export the 'Constants' module, which provides predefined values and configurations for GCM.
  exports.Constants        =       require ( './constants' )       ;


// Export the 'Message' module, used for defining and structuring GCM messages.

  exports.Message          =       require ( './message' )         ;


// Export the 'Result' module, encapsulating the outcome of a single GCM message send attempt.

  exports.Result           =       require ( './result' )          ;


// Export the 'MulitcastResult' module, handling the aggregated results for batch GCM sends.

  exports.MulitcastResult  =       require ( './multicastresult' ) ;


// Export the 'Sender' module, which facilitates the actual sending of GCM messages to devices.

  exports.Sender           =       require ( './sender' )          ;