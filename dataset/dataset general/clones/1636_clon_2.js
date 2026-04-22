testSuite('InstrumentManager', function () {
	var viewContext, logicHandler;

	preTestSetup( function()
	{
		this.extendAssertions({
			isAtLeast: function(minimum) {
				return this.currentValue >= minimum;
			}
		});

		viewContext = angular.createView();
		logicHandler = viewContext.deriveChild(InstrumentModule);
	});

	testCase( 'checks transmission delay', function ()
	{
		var networkAgent = viewContext.getService('$webClient').httpClient;
		var messagePayload = { midiPort: 0, midiCommandCode: 144, notePitch: 77, strikeStrength: 60 };
		networkAgent.anticipatePostRequest('/api/instrument/dispatch', messagePayload).respondWith(messagePayload);
		logicHandler.transmissionDelay = -1;
		logicHandler.transmitMidiInstruction(logicHandler.NOTE_ACTIVATION, 77);
		networkAgent.processPending();
		verify(logicHandler.transmissionDelay).isAtLeast(0);
	});
});