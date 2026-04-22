app.controller('DashboardCtrl',function( $scope, $filter , $location , CampaignService, ngTableParams , $http )
{
    // This array will hold all the campaign objects fetched from the service.
    $scope.campaigns = [ ]


    // Initialize ngTableParams for the main dashboard table.
    // This handles pagination, sorting, and data retrieval.
    $scope.mainTableParams = new ngTableParams(
        {
            page: 1, // The initial page number to display.
            count: 10, // The number of items to show per page.
            sorting: {
                name: 'asc' // Default sorting by campaign name in ascending order.
            }
        },
        {
            total: 0, // Initially, the total number of items is zero.
            // The getData function is called by ngTableParams to fetch data.
            getData: function( $defer, params )
            {
                // Query the CampaignService to get a list of all campaigns.
                CampaignService.query( function( campaigns )
                {
                    // Assign the fetched campaigns to the scope for display.
                    $scope.campaigns = campaigns


                    /*
                     * Prepare data for charting.
                     * campaign_series will temporarily hold campaign data.
                     */
                    var campaign_series = [ ] ;

                    // Initialize a variable to calculate the average success rate across all campaigns.
                    var avg = 0 ;


                    // Create a deep copy of the campaigns array.
                    // This ensures that modifications for chart data don't affect the original 'campaigns' array
                    // if it's used elsewhere in its original form.
                    angular.copy( campaigns , campaign_series )


                    // Iterate over each campaign to process its results for charting.
                    angular.forEach( campaigns, function( campaign, key )
                    {
                        // Convert the created_date string into a Date object for the x-axis of the chart.
                        campaign.x = new Date( campaign.created_date )

                        // Initialize the 'y' property (representing successful phishes count) to 0.
                        campaign.y = 0

                        // Iterate through the results of the current campaign.
                        angular.forEach( campaign.results, function( result, r_key )
                        {
                            // Check if the result status indicates a successful phish.
                            if ( result.status == "Success" )
                            {
                                campaign.y++ ; // Increment the count of successful phishes for this campaign.
                            }
                        } )


                        // Calculate the percentage of successful phishes for the current campaign.
                        // Math.floor is used to get a whole number percentage.
                        campaign.y = Math.floor( ( campaign.y / campaign.results.length ) * 100 )

                        // Add the campaign's success percentage to the running total for overall average calculation.
                        avg += campaign.y
                    } ) ;


                    // Calculate the final average success rate across all campaigns.
                    avg = Math.floor( avg / campaigns.length ) ;


                    // Configuration object for the main overview chart.
                    // This chart displays phishing success over time.
                    $scope.overview_chart = {
                        options: {
                            chart: {
                                type: 'area', // Specifies the chart type as an area chart.
                                zoomType: "x" // Allows zooming functionality on the x-axis.
                            },
                            tooltip: {
                                // Custom formatter function for the tooltip to display relevant campaign details.
                                formatter: function() {
                                    return "Name: " + this.point.name + "<br/>Successful Phishes: " + this.point.y + "%<br/>Date: " + $filter( "date" )( this.point.x, "medium" )
                                },
                                style: {
                                    padding: 10, // Adds padding inside the tooltip box.
                                    fontWeight: 'bold' // Makes the tooltip text bold.
                                }
                            },
                            plotOptions: {
                                series: {
                                    cursor: 'pointer', // Changes the mouse cursor to a pointer when hovering over series points.
                                    point: {
                                        events: {
                                            click: function( e ) {
                                                // When a point on the chart is clicked, navigate to the campaign's detail page.
                                                $location.path( "/campaigns/" + this.id )
                                                $scope.$apply( ) // Manually triggers a digest cycle to update the view after navigation.
                                            }
                                        }
                                    }
                                }
                            },
                            xAxis: {
                                type: 'datetime', // Sets the x-axis type to display date and time values.
                                max: Date.now(), // Sets the maximum value on the x-axis to the current date and time.
                                title: {
                                    text: 'Date' // Label for the x-axis.
                                }
                            },
                        },
                        series: [
                            {
                                name: "Campaigns", // Name of the data series shown in the legend.
                                data: $scope.campaigns // The actual data points for the series.
                            }
                        ],
                        title: {
                            text: 'Phishing Success Overview' // The main title of the chart.
                        },
                        size: {
                            height: 300 // Sets the fixed height of the chart in pixels.
                        },
                        credits: {
                            enabled: false // Disables the Highcharts credits link.
                        },
                        loading: false, // Initial state of the chart's loading spinner.
                    }

                    // Configuration object for the average phishing results chart.
                    // This chart is a pie chart displaying overall success vs. failure.
                    $scope.average_chart = {
                        options: {
                            chart: {
                                type: 'pie' // Specifies the chart type as a pie chart.
                            },
                            tooltip: {
                                // Custom formatter for the tooltip to show only the percentage.
                                formatter: function() {
                                    return this.point.y + "%"
                                },
                                style: {
                                    padding: 10, // Padding for the tooltip box.
                                    fontWeight: 'bold' // Makes the tooltip text bold.
                                }
                            },
                            plotOptions: {
                                pie: {
                                    innerSize: '60%', // Creates a donut chart effect by setting an inner radius.
                                    allowPointSelect: true, // Allows individual slices of the pie to be selected.
                                    cursor: 'pointer', // Changes the mouse cursor to a pointer when hovering over slices.
                                    dataLabels: {
                                        enabled: false // Disables displaying data labels directly on the pie slices.
                                    },
                                    showInLegend: true // Displays the legend for the pie chart.
                                }
                            },
                        },
                        series: [
                            {
                                data: [
                                    {
                                        name: "Successful Phishes", // Name for the first slice.
                                        color: "#e74c3c", // Color for the successful phishes slice.
                                        y: avg // Data value (percentage) for successful phishes.
                                    },
                                    {
                                        name: "Unsuccessful Phishes", // Name for the second slice.
                                        color: "#7cb5ec", // Color for the unsuccessful phishes slice.
                                        y: 100 - avg // Data value (percentage) for unsuccessful phishes.
                                    }
                                ]
                            }
                        ],
                        title: {
                            text: 'Average Phishing Results' // The main title of the average results chart.
                        },
                        size: {
                            height: 300 // Sets the fixed height of the chart in pixels.
                        },
                        credits: {
                            enabled: false // Disables the Highcharts credits link.
                        },
                        loading: false, // Initial state of the chart's loading spinner.
                    }

                    // Update the total number of items for ngTableParams.
                    // It takes the minimum of actual campaign count or 5 for initial display.
                    params.total( Math.min( campaigns.length, 5 ) ) ;

                    // Resolve the deferred object with a slice of the campaigns
                    // to display on the current page of the table.
                    $defer.resolve( campaigns.slice( 0, params.total( ) ) ) ;
                } )
            }
        }
    ) ;
} )


app.controller('CampaignCtrl',function($scope, $modal, CampaignService, GroupService, TemplateService, ngTableParams, $http )
{
    /**
     * @function errorFlash
     * Displays an error message in a flash notification.
     * @param {string} message - The error message to display.
     */
    $scope.errorFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ; // Initialize flash message containers.
        $scope.flashes.main.push( {
            "type": "danger",
            "message": message,
            "icon": "fa-exclamation-circle"
        } )
    }


    /**
     * @function successFlash
     * Displays a success message in a flash notification.
     * @param {string} message - The success message to display.
     */
    $scope.successFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ; ; // Initialize flash message containers.
        $scope.flashes.main.push( {
            "type": "success",
            "message": message,
            "icon": "fa-check-circle"
        } )
    }


    // Initialize ngTableParams for the main campaigns table.
    $scope.mainTableParams = new ngTableParams(
        {
            page: 1, // Initial page number.
            count: 10, // Items per page.
            sorting: {
                name: 'asc' // Default sorting by name.
            }
        },
        {
            total: 0, // Initial total count.
            getData: function( $defer, params )
            {
                CampaignService.query( function( campaigns )
                {
                    $scope.campaigns = campaigns // Assign campaigns to scope.
                    params.total( campaigns.length ) // Update total count for pagination.
                    // Resolve with the sliced data for the current page.
                    $defer.resolve( campaigns.slice( ( params.page( ) - 1 ) * params.count( ) , params.page( ) * params.count( ) ) ) ;
                } )
            }
        }
    ) ;


    // Fetch all groups from GroupService and assign to scope.
    GroupService.query( function( groups ) {
        $scope.groups = groups ;
    } ) ;


    // Fetch all templates from TemplateService and assign to scope.
    TemplateService.query( function( templates ) {
        $scope.templates = templates ;
    } ) ;


    /**
     * @function newCampaign
     * Initializes a new campaign object for creation.
     */
    $scope.newCampaign = function( )
    {
        $scope.campaign = {
            name: '',
            groups: [ ]
        } ;
        $scope.editCampaign( $scope.campaign ) // Open modal to edit the new campaign.
    } ;


    /**
     * @function editCampaign
     * Opens a modal to create or edit a campaign.
     * @param {object} campaign - The campaign object to edit (or a new empty one).
     */
    $scope.editCampaign = function( campaign )
    {
        var modalInstance = $modal.open( {
            templateUrl: '/js/app/partials/modals/campaignModal.html',
            controller: CampaignModalCtrl,
            scope: $scope
        } ) ;

        modalInstance.result.then( function( message )
        {
            $scope.successFlash( message ) // Display success message upon modal close.
            $scope.campaign = {
                name: '',
                groups: [ ],
            } ;
        }, function( )
        {
            $scope.campaign = {
                name: '',
                groups: [ ],
            } ;
        } ) ;
        $scope.mainTableParams.reload( ) // Reload the main campaigns table after modal interaction.
    } ;


    // ngTableParams for managing groups within a campaign in the modal.
    $scope.editGroupTableParams = new ngTableParams(
        {
            page: 1, // Initial page.
            count: 10, // Items per page.
            sorting: {
                name: 'asc' // Default sorting.
            }
        },
        {
            total: 0, // Initial total.
            getData: function( $defer, params )
            {
                params.total( $scope.campaign.groups.length ) // Update total based on campaign's groups.
                // Resolve with sliced data for the current page.
                $defer.resolve( $scope.campaign.groups.slice( ( params.page( ) - 1 ) * params.count( ) , params.page( ) * params.count( ) ) ) ;
            }
        }
    ) ;


    /**
     * @function deleteCampaign
     * Deletes a specified campaign.
     * @param {object} campaign - The campaign object to delete.
     */
    $scope.deleteCampaign = function( campaign )
    {
        var deleteCampaign = new CampaignService( campaign ) ; // Create a new CampaignService instance for the campaign.
        deleteCampaign.$delete( {
            id: deleteCampaign.id
        }, function( response )
        {
            if ( response.success )
            {
                $scope.successFlash( response.message ) // Show success message.
            }
            else
            {
                $scope.errorFlash( response.message ) // Show error message.
            }
            $scope.mainTableParams.reload( ) ; // Reload the main campaigns table.
        } ) ;
    }
} ) ;


// Controller for the Campaign modal.
var CampaignModalCtrl = function( $scope, CampaignService, $modalInstance )
{
    /**
     * @function errorFlash
     * Displays an error message specifically for the modal context.
     * @param {string} message - The error message to display.
     */
    $scope.errorFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ; // Initialize flash message containers.
        $scope.flashes.modal.push( {
            "type": "danger",
            "message": message,
            "icon": "fa-exclamation-circle"
        } )
    }


    /**
     * @function addGroup
     * Adds a new group to the current campaign being edited in the modal.
     * @param {object} group - The group object to add.
     */
    $scope.addGroup = function( group )
    {
        if ( group.name != "" )
        {
            $scope.campaign.groups.push( {
                name: group.name
            } ) ;
            group.name = "" // Clear the input field after adding.
            $scope.editGroupTableParams.reload( ) // Reload the groups table within the modal.
        }
    } ;


    /**
     * @function removeGroup
     * Removes a group from the current campaign being edited.
     * @param {object} group - The group object to remove.
     */
    $scope.removeGroup = function( group )
    {
        $scope.campaign.groups.splice( $scope.campaign.groups.indexOf( group ), 1 ) ; // Remove group from array.
        $scope.editGroupTableParams.reload( ) // Reload the groups table.
    } ;


    /**
     * @function cancel
     * Closes the modal without saving changes.
     */
    $scope.cancel = function( )
    {
        $modalInstance.dismiss( 'cancel' ) ;
    } ;


    /**
     * @function ok
     * Saves the campaign and closes the modal with a success message.
     * @param {object} campaign - The campaign object to save.
     */
    $scope.ok = function( campaign )
    {
        var newCampaign = new CampaignService( campaign ) ; // Create a new CampaignService instance.
        newCampaign.$save( { }, function( )
        {
            $modalInstance.close( "Campaign added successfully" ) // Close modal with success message.
            $scope.campaigns.push( newCampaign ) ; // Add the new campaign to the list.
            $scope.mainTableParams.reload( ) // Reload the main campaigns table.
        }, function( response )
        {
            $scope.errorFlash( response.data.message ) // Display error if save fails.
        } ) ;
    }
} ;


app.controller('CampaignResultsCtrl', function( $scope, $filter, CampaignService, GroupService, ngTableParams, $http, $window )
{
    // Retrieve the campaign ID from the URL hash.
    id = $window.location.hash.split( '/' )[ 2 ] ;


    /**
     * @function errorFlash
     * Displays an error message.
     * @param {string} message - The error message.
     */
    $scope.errorFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ;
        $scope.flashes.main.push( {
            "type": "danger",
            "message": message,
            "icon": "fa-exclamation-circle"
        } )
    }


    /**
     * @function successFlash
     * Displays a success message.
     * @param {string} message - The success message.
     */
    $scope.successFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ; ;
        $scope.flashes.main.push( {
            "type": "success",
            "message": message,
            "icon": "fa-check-circle"
        } )
    }


    /**
     * @function delete
     * Handles the deletion of a campaign after confirmation.
     * @param {object} campaign - The campaign object to delete.
     */
    $scope.delete = function( campaign )
    {
        if ( confirm( "Delete campaign?" ) )
        {
            var deleteCampaign = new CampaignService( campaign ) ;
            deleteCampaign.$delete( {
                id: deleteCampaign.id
            }, function( response )
            {
                if ( response.success )
                {
                    $scope.successFlash( response.message )
                }
                else
                {
                    $scope.errorFlash( response.message )
                }
                $scope.mainTableParams.reload( ) ;
            } ) ;
        }
    }


    // Initialize ngTableParams for displaying campaign results.
    $scope.mainTableParams = new ngTableParams(
        {
            page: 1, // Start on the first page.
            count: 10, // Show 10 items per page.
            sorting: {
                name: 'asc' // Sort by name ascending by default.
            }
        },
        {
            total: 0, // Initial total count.
            getData: function( $defer, params )
            {
                // Fetch specific campaign details using its ID.
                CampaignService.get( {
                    "id": id
                }, function( campaign )
                {
                    $scope.campaign = campaign // Assign fetched campaign to scope.
                    var result_series = [ ] // Array to hold data for email status chart.

                    // Process campaign results to aggregate status counts.
                    angular.forEach( campaign.results, function( result, key )
                    {
                        var new_entry = true ;
                        for ( var i = 0 ; i < result_series.length ; i++ )
                        {
                            if ( result_series[ i ].name == result.status )
                            {
                                result_series[ i ].y++ ;
                                new_entry = false ;
                                break ;
                            }
                        }
                        if ( new_entry )
                        {
                            result_series.push( {
                                name: result.status,
                                y: 1
                            } )
                        }
                    } ) ;


                    // Process campaign timeline events for charting.
                    angular.forEach( campaign.timeline, function( e, key )
                    {
                        e.x = new Date( e.time ) ; // Convert time to Date object for x-axis.
                        e.y = 0 ; // Set a dummy y-value as events are typically on a single line.
                    } ) ;


                    // Configuration for the Email Status pie chart.
                    $scope.email_chart = {
                        options: {
                            chart: {
                                type: 'pie' // Chart type is pie.
                            },
                            tooltip: {
                                // Custom tooltip formatter for email status.
                                formatter: function() {
                                    return this.point.name + " : " + this.point.y
                                },
                                style: {
                                    padding: 10,
                                    fontWeight: 'bold'
                                }
                            },
                            plotOptions: {
                                pie: {
                                    allowPointSelect: true, // Allow selecting slices.
                                    cursor: 'pointer', // Pointer cursor on hover.
                                    dataLabels: {
                                        enabled: false // Disable data labels.
                                    },
                                    showInLegend: true // Show legend.
                                }
                            }
                        },
                        series: [
                            {
                                data: result_series // Data for the pie slices.
                            }
                        ],
                        title: {
                            text: 'Email Status' // Chart title.
                        },
                        size: {
                            height: 300 // Chart height.
                        },
                        credits: {
                            enabled: false // Disable credits.
                        },
                        loading: false, // Initial loading state.
                    }


                    // Configuration for the Campaign Timeline scatter chart.
                    $scope.timeline_chart = {
                        options: {
                            global: {
                                useUTC: false // Use local time for timestamps.
                            },
                            chart: {
                                type: 'scatter', // Chart type is scatter.
                                zoomType: "x" // Enable x-axis zooming.
                            },
                            tooltip: {
                                // Custom tooltip formatter for timeline events.
                                formatter: function() {
                                    var label = "Event: " + this.point.message + "<br/>" ;
                                    if ( this.point.email )
                                    {
                                        label += "Email: " + this.point.email + "<br/>" ;
                                    }
                                    label += "Date: " + $filter( "date" )( this.point.x, "medium" ) ;
                                    return label
                                },
                                style: {
                                    padding: 10,
                                    fontWeight: 'bold'
                                }
                            },
                            plotOptions: {
                                series: {
                                    cursor: 'pointer', // Pointer cursor on hover.
                                }
                            },
                            yAxis: {
                                labels: {
                                    enabled: false // Disable y-axis labels.
                                },
                                title: {
                                    text: "Events" // Y-axis title.
                                }
                            },
                            xAxis: {
                                type: 'datetime', // X-axis is datetime.
                                dateTimeLabelFormats: { // Custom date/time label formats.
                                    day: "%e of %b",
                                    hour: "%l:%M",
                                    second: '%l:%M:%S',
                                    minute: '%l:%M'
                                },
                                max: Date.now( ), // Max x-axis value is current time.
                                title: {
                                    text: 'Date' // X-axis title.
                                }
                            },
                        },
                        series: [
                            {
                                name: "Events", // Series name.
                                data: $scope.campaign.timeline // Data for timeline events.
                            }
                        ],
                        title: {
                            text: 'Campaign Timeline' // Chart title.
                        },
                        size: {
                            height: 300 // Chart height.
                        },
                        credits: {
                            enabled: false // Disable credits.
                        },
                        loading: false, // Initial loading state.
                    }
                    params.total( campaign.results.length ) // Update total for table pagination.
                    // Resolve with sliced results for the current page.
                    $defer.resolve( campaign.results.slice( ( params.page( ) - 1 ) * params.count( ) , params.page( ) * params.count( ) ) ) ;
                } )
            }
        }
    ) ;
} )


app.controller('GroupCtrl', function( $scope, $modal, GroupService, ngTableParams )
{
    /**
     * @function errorFlash
     * Displays an error message.
     * @param {string} message - The error message.
     */
    $scope.errorFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ;
        $scope.flashes.main.push( {
            "type": "danger",
            "message": message,
            "icon": "fa-exclamation-circle"
        } )
    }


    /**
     * @function successFlash
     * Displays a success message.
     * @param {string} message - The success message.
     */
    $scope.successFlash = function( message )
    {
        $scope.flashes = { "main" : [ ] , "modal" : [ ] } ; ;
        $scope.flashes.main.push( {
            "type": "success",
            "message": message,
            "icon": "fa-check-circle"
        } )
    }


    // Initialize ngTableParams for the main groups table.
    $scope.mainTableParams = new ngTableParams(
        {
            page: 1, // Initial page.
            count: 10, // Items per page.
            sorting: {
                name: 'asc' // Default sorting by name.
            }
        },
        {
            total: 0, // Initial total count.
            getData: function( $defer, params )
            {
                GroupService.query( function( groups )
                {
                    $scope.groups = groups // Assign fetched groups to scope.
                    params.total( groups.length ) // Update total count for pagination.
                    // Resolve with sliced data for the current page.
                    $defer.resolve( groups.slice( ( params.page( ) - 1 ) * params.count( ) , params.page( ) * params.count( ) ) ) ;
                } )
            }
        }
    ) ;


    // ngTableParams for managing targets within a group (e.g., in a modal).
    $scope.editGroupTableParams = new ngTableParams(
        {
            page: 1, // Initial page.
            count: 10, // Items per page.
            sorting: {
                name: 'asc' // Default sorting by name.
            }
        },
        {
            total: 0, // Initial total count.
            getData: function( $defer, params )
            {
                params.total( $scope.group.targets.length ) // Update total based on group's targets.
                // Resolve with sliced data for the current page.
                $defer.resolve( $scope.group.targets.slice( ( params.page( ) - 1 ) * params.count( ) , params.page( ) * params.count( ) ) ) ;
            }