( function ( ) {

    var validateSystem = function ( systemDefinition ) {
        if ( ! ( ValidationRoutines.ensureMandatoryFields( systemDefinition, [ 'uniqueId', 'designation', 'initialInvestment', 'copiesDistributed', 'licenseFee', 'releaseDate', 'systemDecommissionDate', 'creationExpenses', 'categoryPriorities', 'targetDemographicFocus', 'technologicalMaturity', 'visualAssetPath' ] )
            && ValidationRoutines.verifySingularity( systemDefinition, 'uniqueId', HardwareEntities.entireCollection )
            && ValidationRoutines.examineDemographicFocus( systemDefinition.targetDemographicFocus )
            && ValidationRoutines.examineCategoryPriorities( systemDefinition.categoryPriorities ) )
        )
            return false ;

        if ( ! ( ValidationRoutines.confirmDateValidity( systemDefinition.releaseDate )
            && ValidationRoutines.confirmDateValidity( systemDefinition.systemDecommissionDate ) )
        )
            return false ;

        if ( systemDefinition.milestoneEvents ) {
            for ( var idx = 0 ; idx < systemDefinition.milestoneEvents.length ; idx++ ) {
                if ( ! ValidationRoutines.confirmDateValidity( systemDefinition.milestoneEvents[idx].eventOccasion ) )
                    return false ;
            }
        }

        return true ;
    } ;


    GameDevTycoon.registerSystem = function ( systemDefinition ) {
        if ( ! validateSystem( systemDefinition ) )
            return ;

        HardwareEntities.entireCollection.push( systemDefinition ) ;
        if ( systemDefinition.lifecycleEvents ) {
            for ( var idx = 0 ; idx < systemDefinition.lifecycleEvents.length ; idx++ ) {
                GameDevTycoon.incorporateEvent( systemDefinition.lifecycleEvents[idx] ) ;
            }
        }
    } ;

} ) ( ) ;