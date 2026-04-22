// This file contains configuration settings for the websiteduck.wdminimap module.
// Copyright (c) 2013 Website Duck LLC. All rights reserved.
// Licensed under the MIT License. For full details, see the original source or documentation.

define ( function ( require , exports , module )
{
    // Define the exports for this module.
    module . exports =
    {
        // The unique name of the module.
        NAME : 'websiteduck.wdminimap'
        ,
        // The default width for the minimap.
        MINIMAP_WIDTH : 120
        ,
        // Default user preferences for the minimap functionality.
        defaultPreferences :
        {
            // Is the minimap enabled by default?
            enabled : true
            ,
            // The type of minimap to use (e.g., 'codemirror').
            type : 'codemirror'
        }
    } ;
} ) ;