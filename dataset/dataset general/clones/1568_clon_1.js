// This file handles report-related operations for campaigns.
// It exposes functions to list sent campaigns and view detailed reports.

/**
 * Endpoint to retrieve a list of all sent campaigns.
 * This is primarily used for displaying a summary or index of reports.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.list = function ( req , res ) {

  // Call the MailChimp API to get campaigns with 'sent' status.
  mc.campaigns.list( { 'status' : 'sent' } , function( data ) {

    // Render the reports index page, passing campaign data.
    res.render( 'reports/index' , { title : 'Report' , campaigns : data.data } ) ;

  } , function ( error ) { // Error handling callback for the MailChimp API call.

    // Check if a specific error message is available from the API.
    if ( error.error ) {
      req.session.error_flash = error.code + ": " + error.error ;
    }
    else {
      // Generic error message for unknown API errors.
      req.session.error_flash = "An unknown error occurred" ;
    }

    // Redirect to the home page after an error.
    res.redirect( "/" ) ;

  } ) ;
} ;

//-----------------------------------------------------------------------------

/**
 * Endpoint to view a detailed report for a specific campaign.
 * The campaign ID is expected in the request parameters.
 *
 * @param {object} req - The Express request object, containing `params.id` for campaign ID.
 * @param {object} res - The Express response object.
 */
exports.view = function ( req , res ) {

  // First, fetch the campaign details using the provided ID.
  mc.campaigns.list( { campaign_id : req.params.id } , function ( campaignData ) {

    // Extract the campaign object from the data array.
    var campaign = campaignData.data[ 0 ] ;

    // Now, fetch the detailed report summary for the same campaign ID.
    mc.reports.summary( { cid : req.params.id } , function ( reportData ) {

      // Render the report view page with campaign and report details.
      res.render( 'reports/view' , { title : 'Report for ' + campaign.title , campaign : campaign , report : reportData } ) ;

    } , function ( error ) { // Error handling for the reports summary call.

      console.log( error ) ; // Log the raw error object for debugging.

      // Handle specific MailChimp API errors.
      if ( error.name == "Campaign_DoesNotExist" ) {
        req.session.error_flash = "The campaign does not exist" ;
      }
      else if ( error.error ) {
        req.session.error_flash = error.code + ": " + error.error ;
      }
      else {
        req.session.error_flash = "An unknown error occurred" ; // Fallback error message.
      }

      // Redirect to the reports list page if an error occurs.
      res.redirect( '/reports' ) ;

    } ) ;

  } ) ;

} ;
// End of file.