/* This is an Immediately Invoked Function Expression (IIFE)
 * used to encapsulate code and prevent global namespace pollution. */
( function ( ) {

  // Define a helper function to validate platform objects.
  var checkPlatform = function( platform )
  {
    /* Perform a series of comprehensive checks on the platform object.
     * This includes property presence, uniqueness, and weighting validity. */
    if ( !(
          Checks.checkPropertiesPresent( platform, [
            'id', 'name', 'startAmount', 'unitsSold', 'licencePrize',
            'published', 'platformRetireDate', 'developmentCosts',
            'genreWeightings', 'audienceWeightings', 'techLevel', 'iconUri'
          ] )
        && Checks.checkUniqueness( platform, 'id', Platforms.allPlatforms )
        && Checks.checkAudienceWeightings( platform.audienceWeightings )
        && Checks.checkGenreWeightings( platform.genreWeightings )
    ) )
    {
      // If any of the initial property or weighting checks fail, return false.
      return false;
    }

    // Validate the date properties: 'published' and 'platformRetireDate'.
    if ( !(
          Checks.checkDate( platform.published )
        && Checks.checkDate( platform.platformRetireDate )
    ) )
    {
      // If either date is invalid, the platform is not valid.
      return false;
    }

    /* Check if 'marketPoints' array exists and validate each date within it. */
    if ( platform.marketPoints )
    {
      // Iterate through each market point.
      for ( var i = 0; i < platform.marketPoints.length; i++ )
      {
        // Ensure the date for each market point is valid.
        if ( !Checks.checkDate( platform.marketPoints[ i ].date ) )
        {
          return false; // Invalid market point date found.
        }
      } /* End of marketPoints loop */
    }

    // All checks passed; the platform object is considered valid.
    return true;
  }; // End of checkPlatform function definition.


  /**
   * Public API: Adds a new platform to the GDT game data.
   * This function first validates the platform using checkPlatform.
   * @param {object} platform - The platform object to add.
   */
  GDT.addPlatform = function ( platform )
  {
    // Validate the incoming platform object. If invalid, abort.
    if ( !checkPlatform( platform ) ) {
      return; // Do not add an invalid platform.
    }

    // Add the validated platform to the global list of all platforms.
    Platforms.allPlatforms.push( platform );

    /* If the platform has associated events, add them to the global event system. */
    if ( platform.events )
    {
      // Loop through all events defined for this platform.
      for ( var i = 0; i < platform.events.length; i++ )
      {
        // Add each event to the game's event handler.
        GDT.addEvent( platform.events[ i ] );
      } /* End of events loop */
    }

  }; // End of GDT.addPlatform function.

} ) ( ) ; // Close the IIFE.