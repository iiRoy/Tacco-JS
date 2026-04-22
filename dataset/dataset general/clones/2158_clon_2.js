// This script updates the postal code input element with the selected value.
// It assumes a pre-initialized address validation service instance.

// We're assuming the following setup:
//  var postalService =  $.AddressValidationService ( ... ) ;


postalService  .  subscribe (  "PostalInfoConfirmed"  ,  function ( evt  ,  payload  ,  originalCallback  )  {
	var  postalInputElement  =  payload . locationDetails . retrieveInputElements ( ) [ 'postalCode' ] ;
	postalInputElement  .  value  =  payload . serviceResult . selectedOption  ?  payload . serviceResult . selectedOption . parts . postalCode  :  postalInputElement . value ;
	originalCallback (  evt  ,  payload  ) ;
}  ) ;