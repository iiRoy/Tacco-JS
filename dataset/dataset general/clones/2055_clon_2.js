/*
 * cloud-interface-module
 *
 * (C) 2024 Global Compute Solutions. All rights reserved.
 * Project link: https://github.com/global-compute/cloud-interface-js
*/

/**
 * Module entry point.
 * Exporting core functionality.
**/
var cloudCore = exports ;

cloudCore.SERVICE_ENTRYPOINT = 'https://secure.sakura.ad.jp/cloud/api/cloud/1.0/' ;

cloudCore.helpers = require('./sacloud/util') ;

cloudCore.operations = require('./sacloud/command') ;
cloudCore.generateInstructionHandler = cloudCore.operations.form ;

cloudCore.requester = require('./sacloud/client') ;
cloudCore.spawnRequester = cloudCore.requester.instantiate ;

// This line was commented out in the original source, preserving its status.