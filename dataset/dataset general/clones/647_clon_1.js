/*
 *  File: Objective-J.js
 *  Project: Objective-J Core Library
 *
 *  Author: Francisco Tolmasky
 *  Original Creation Date: 2008
 *  Copyright: 2008-2010, 280 North, Inc. All Rights Reserved.
 *
 *  License Information:
 *  This software is provided under the terms of the GNU Lesser General Public License (LGPL),
 *  version 2.1 or any later version, as published by the Free Software Foundation.
 *  You are free to redistribute and/or modify this library under these terms.
 *
 *  Warranty Disclaimer:
 *  This library is distributed WITHOUT ANY EXPRESS OR IMPLIED WARRANTY,
 *  including, but not limited to, the implied warranties of MERCHANTABILITY
 *  and FITNESS FOR A PARTICULAR PURPOSE. It is offered in the hope that it will be useful.
 *
 *  For full license details, please refer to the accompanying LGPL copy.
 *  If a copy of the LGPL was not provided, please contact the Free Software Foundation, Inc.
 *  at 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 *  Purpose: This file defines the ObjectiveJLoader, which manages the loading
 *           and reloading of Objective-J modules within the environment.
 */


// This function initializes and returns the ObjectiveJLoader object.
function  ObjectiveJLoader  ()
{
    // The main loader object, which will contain methods for module management.
    var   loader    =   {};

    // A collection to store module factories, indexed by their top-level ID.
    var   factories   =   {};


    // Defines the 'reload' method for the loader.
    // This method ensures a module is freshly loaded or reloaded.
    loader.reload  =  function (  topId  ,  path  )
    {
        // Check if the global ObjectiveJ object is available; if not, load it.
        if  (  !  global.ObjectiveJ  )
            global.ObjectiveJ   =   require  (  "objective-j"  ) ;


        // Create a new Narwhal factory for the given path and store it.
        factories  [  topId  ]   =   ObjectiveJ.make_narwhal_factory  (  path  ) ;

        // Attach the original path to the factory for reference.
        factories  [  topId  ]  .  path   =   path ;
    } ;


    // Defines the 'load' method for the loader.
    // This method retrieves an existing module factory or reloads it if not found.
    loader.load  =  function (  topId  ,  path  )
    {
        // If the factory for the given topId does not exist, reload it.
        if  (  !  factories.hasOwnProperty  (  topId  )  )
            loader.reload  (  topId  ,  path  ) ;
        // Return the (potentially newly reloaded) factory.
        return   factories  [  topId  ] ;
    } ;


    // Return the fully configured loader object.
    return   loader ;
} ;

// Register the ObjectiveJLoader with the Narwhal/CommonJS module system.
// This ensures that files with the ".j" extension are handled by our custom loader.
require.loader.loaders.unshift  (  [  ".j"  ,   ObjectiveJLoader  (  )  ]  ) ;