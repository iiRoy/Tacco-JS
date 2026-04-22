/*
 *  File:       Gate.js
 *  Purpose:    Definition of the Gate entity.
 *  Module:     KBEngine
 *  Extends:    KBEngine.GameObject
 *
 *  Description:
 *  This script defines the 'Gate' class, which is a fundamental
 *  game object within the KBEngine framework. It inherits
 *  properties and methods from KBEngine.GameObject.
 *
 *  ------------------------------------------------------------
 *  Type I Clone: Whitespace and Comments extensively modified.
 *  ------------------------------------------------------------
 */


// Begin definition of the Gate class within the KBEngine namespace.
// This ensures proper scope and organization for game entities.

KBEngine . Gate  =   KBEngine . GameObject . extend (
    // Object literal defining the prototype members for KBEngine.Gate.
    {

        // The 'init' method serves as the constructor for new 'Gate' instances.
        // It is automatically invoked upon object instantiation.
        init    :   function    (    )
        {
            // Call the 'init' method of the parent class (KBEngine.GameObject).
            // This is crucial for inheriting and properly initializing
            // the base GameObject's properties and state.
            this . _super ( ) ;

        }   // End of 'init' method definition.

    }
) ; // Final semicolon terminating the KBEngine.Gate assignment statement.

// End of Gate class definition.