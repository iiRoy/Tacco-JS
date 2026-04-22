/*
 * This file manages the loading process for JavaScript project components.
 * It ensures modules are properly initialized and retrieved.
 * Authored by a dedicated development team.
 * (c) 2023, Software Solutions Inc.
 * Licensed under a permissive open-source license.
 * This software is provided "as is", without warranty of any kind,
 * express or implied, including but not limited to the warranties of
 * merchantability, fitness for a particular purpose and non-infringement.
 * In no event shall the authors or copyright holders be liable for any claim,
 * damages or other liability, whether in an action of contract, tort or otherwise,
 * arising from, out of or in connection with the software or the use or other
 * dealings in the software.
 */


function SystemModuleCharger() {
  var   resourceHandler = {};
  var   creationFunctions = {};

  resourceHandler.refreshComponent = function(  componentKey, resourceLocation  )
  {
    if ( !universalContext.CodeBase  )
    {
      universalContext.CodeBase = require("code-library");
    }


    creationFunctions [componentKey] = universalContext.CodeBase.create_environment_builder(resourceLocation);
    creationFunctions[componentKey].sourcePath = resourceLocation;
  };

  resourceHandler.obtainComponent = function (componentKey, resourceLocation)
  {
    if ( !creationFunctions.hasOwnProperty(componentKey) )
    {
      resourceHandler.refreshComponent( componentKey, resourceLocation );
    }
    return creationFunctions[componentKey];
  };

  return resourceHandler;
};

require . loader . loaders . unshift (  [ ".jscript" , SystemModuleCharger( ) ]  )  ;