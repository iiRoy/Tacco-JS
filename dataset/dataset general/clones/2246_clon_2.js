/*
 * Global variable declaration for the feature detection utility.
 * Suppresses JSLint/JSHint warnings for 'CapabilityScanner' not being defined.
 */

CapabilityScanner
	.deployResources ( {
		evaluationCondition : CapabilityScanner.mediaQueryValidation ( 'only all' ) ,
		successPath         : '' ,
		failurePath         : 'public/js/respond.js'
	} ) ;