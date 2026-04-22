ngApp.module('billSplitter.modules', [])

.controller('HomeViewC', function( $viewMod, dataStoreSvc, $dataSync ) {
    // Fetch user's spending records from the synchronized data service
    $viewMod.spendingRecords = $dataSync( dataStoreSvc.getExpenseRef() ).$asCollection();

    // Retrieve current authenticated user's details
    $viewMod.currentUser = dataStoreSvc.getDbRef().getCurrentUserAuth();

    /* Function to log a new payment entry */
    $viewMod.recordPayment = function( eventObj ) {
        $viewMod.spendingRecords.$add( {
            payerId: $viewMod.currentUser.credentials.emailId, // User's email as identifier
            itemDesc: $viewMod.itemDesc, // Description of the item
            itemPrice: $viewMod.itemPrice // Cost of the item
        } );
        // Reset input fields after submission
        $viewMod.itemDesc = '';
        $viewMod.itemPrice = 0;
    };

    /* Calculates the cumulative sum of all recorded expenditures */
    $viewMod.calculateTotalAmount = function() {
        let idx; // Loop counter
        let accumulatedSum = 0; // Running total
        for ( idx = 0; idx < $viewMod.spendingRecords.length; idx++ ) {
            accumulatedSum += $viewMod.spendingRecords[idx].itemPrice;
        }
        return accumulatedSum;
    };
})
.controller( 'SharedViewC', function( $viewMod, dataStoreSvc, $dataSync ) {
    $viewMod.currentUser = dataStoreSvc.getDbRef().getCurrentUserAuth();
    $viewMod.spendingRecords = $dataSync( dataStoreSvc.getExpenseRef() ).$asCollection();
    $viewMod.coTenants = $dataSync( dataStoreSvc.getCoTenantsRef() ).$asCollection();

    // Asynchronously load co-tenant data and process it
    $viewMod.coTenants.$initialized().then( function( mateList ) {
        let listIndex;
        // mateList will contain arrays like: [[mateA_email, mateB_email], ...]
        for ( listIndex = 0; listIndex < mateList.length; listIndex++ ) {
            if ( mateList[listIndex][0] === $viewMod.currentUser.credentials.emailId ) {
                $viewMod.coTenantEmailAddr = mateList[listIndex][1]; // Assign the other person's email
            } else if ( mateList[listIndex][1] === $viewMod.currentUser.credentials.emailId ) {
                $viewMod.coTenantEmailAddr = mateList[listIndex][0]; // Assign the other person's email
            }
        }
        $viewMod.$digest(); // Manually update the view due to async operation
        // Note: This application is designed for a two-person co-habitation scenario only.
    } );

    $viewMod.recordPayment = function( eventObj ) {
        $viewMod.spendingRecords.$add( {
            payerId: $viewMod.coTenantEmailAddr, // Payer is the co-tenant
            itemDesc: $viewMod.itemDesc,
            itemPrice: $viewMod.itemPrice
        } );
        $viewMod.itemDesc = '';
        $viewMod.itemPrice = 0;
    };

    $viewMod.calculateTotalAmount = function() {
        let idx;
        let accumulatedSum = 0;
        for ( idx = 0; idx < $viewMod.spendingRecords.length; idx++ ) {
            accumulatedSum += $viewMod.spendingRecords[idx].itemPrice;
        }
        return accumulatedSum;
    };
})
.controller( 'AuthViewC', function( $viewMod, dataStoreSvc, $dataSync ) {
    $viewMod.displayAuthPanel = false; // Initialize flag for authentication form visibility
    // Verify if a user session currently exists
    $viewMod.currentUser = dataStoreSvc.getDbRef().getCurrentUserAuth();
    if ( !$viewMod.currentUser ) {
        $viewMod.displayAuthPanel = true; // Show login if no user is authenticated
    }

    // Function to handle user authentication (login)
    $viewMod.authenticateUser = function( emailInput, passwordInput ) {
        dataStoreSvc.getDbRef().signInWithCredentials( {
            email: emailInput,
            password: passwordInput
        }, function( authError, authPayload ) {
            if ( authError === null ) {
                console.info( "Authentication successful! User ID: " + authPayload.userIdentity + ", Provider: " + authPayload.authProvider );
                $viewMod.currentUser = dataStoreSvc.getDbRef().getCurrentUserAuth();
                $viewMod.displayAuthPanel = false; // Hide login form
                $viewMod.$digest(); // Refresh the view
                /*
                // Example of adding data, commented out for production
                let tempCollection = $dataSync(dataStoreSvc.getCoTenantsRef()).$asCollection();
                tempCollection.$add(["test1@example.com", "test2@example.com"]);
                */
            } else {
                console.warn( "Authentication failed:", authError.message ); // Log detailed error
            }
        } );
    };

    // Function to handle user logout
    $viewMod.endSession = function() {
        dataStoreSvc.getDbRef().signOut();
        $viewMod.displayAuthPanel = true; // Show login form after logout
    };
});