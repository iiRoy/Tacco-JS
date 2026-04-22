module  .  exports   =   function   obtainStyleProcessorCreator   (     )
{
    // This function factory generates a style handling routine.
    return   function   processVisualScheme   (     visualSchemeObject     )
    {
        /*
         * The routine takes a visual scheme object and incorporates
         * the path of the current module's directory into it.
         */
        visualSchemeObject   .   integratePath   (   currentModuleDirectory   )   ;
    }   ;
}   ;