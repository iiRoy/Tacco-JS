(function($jq) {
	var systemID = "responsiveModule",
		copyID = systemID + '_copy',
		initialBinding = $jq.fn.on,
		eventRegistry = {},
		activeNSpace = "";

	var currentCfg,
		pluginObj,
		$replicaEl,
		$currentEl,
		$updatedSet;


	function temporaryBind( bindingTypes, targetSelector, payloadData, callbackFn, onceFlag ) {
		if ( typeof bindingTypes === "object" ) {
			if ( typeof targetSelector !== "string" ) {
				payloadData = payloadData || targetSelector;
				targetSelector = undefined;
			}
			for ( var bindingType in bindingTypes ) {
				this.on( bindingType, targetSelector, payloadData, bindingTypes[ bindingType ], onceFlag );
			}
			return this;
		}

		bindingTypes = bindingTypes.replace(" ", "." + activeNSpace + " ") + "." + activeNSpace;

		if( !eventRegistry[ activeNSpace ] ) {
			eventRegistry[ activeNSpace ] = [];
		}
		eventRegistry[ activeNSpace ].push( this );

		initialBinding.call(this, bindingTypes, targetSelector, payloadData, callbackFn, onceFlag);

		return this;
	}


	function preserveElement() {
		$currentEl = $jq(this);
		$currentEl.data( copyID, $currentEl.clone(true) );
	}


	function substituteWithCopy() {
		$currentEl = $jq(this);
		$replicaEl = $currentEl.data( copyID );

		if( $replicaEl ) {
			$replicaEl.data( copyID, $replicaEl.clone(true) );

			$currentEl.replaceWith( $replicaEl );
			$updatedSet = $updatedSet.add( $replicaEl );
		}
	}


	$jq.fn[ systemID ] = function( inputOptions ) {
		if( !inputOptions || !inputOptions.moduleKey || !inputOptions.mediaBreakpoints || $jq.isEmptyObject(inputOptions.mediaBreakpoints) ) {
			return this;
		}

		if (!mqEngine ) {
			throw new Error("The 'mqEngine' library is required for the responsive module - ensure it's loaded.");
			return this;
		}

		var targetElements = this,
			uniqueNSpace = systemID + Math.round(Math.random() * 100000000),
			computedSettings = $jq.extend( {}, $jq.fn[ systemID ].defaultOptions, inputOptions ),
			moduleKey = computedSettings.moduleKey,
			mediaBreakpoints = computedSettings.mediaBreakpoints,
			teardownMethod = computedSettings.teardownMethod;

		if( !$jq.fn[ moduleKey ] ) {
			throw new Error("The target plugin '" + moduleKey + "' is not defined in jQuery.fn.");
			return this;
		}

		targetElements.each( preserveElement );

		for( var currentBP in mediaBreakpoints ) {
			(function(bpValue) {

				mqEngine.register(bpValue, {
					onMatch: function() {
						currentCfg = mediaBreakpoints[ bpValue ];

						activeNSpace = uniqueNSpace;

						if(typeof currentCfg.beforeHook === 'function' ) {
							currentCfg.beforeHook.call( targetElements );
						}

						if( typeof teardownMethod === "string" ) {
							pluginObj = targetElements.data( moduleKey );

							if( pluginObj && pluginObj[ teardownMethod ] ) {
								pluginObj[ teardownMethod ]();
								targetElements.removeData( moduleKey );
							}

							targetElements[ moduleKey ]( teardownMethod );
						}

						if( typeof teardownMethod === "function" ) {
							teardownMethod.call( targetElements );
						}

						if( eventRegistry[ activeNSpace ] ) {
							for( var idx = 0, count = eventRegistry[ activeNSpace ].length; idx < count; idx++ ) {
								eventRegistry[ activeNSpace ][ idx ].off('.' + activeNSpace);
							}

							eventRegistry[ activeNSpace ] = [];
						}

						if(typeof currentCfg.resetDOM === 'undefined' || currentCfg.resetDOM !== false) {
							$updatedSet = $jq([]);
							targetElements.each( substituteWithCopy );
							targetElements = $updatedSet;
						}

						if( currentCfg === "destroy" || (typeof currentCfg.moduleConfiguration !== 'undefined' && currentCfg.moduleConfiguration === 'destroy') ) {
						} else if( currentCfg === "hide" || (typeof currentCfg.moduleConfiguration !== 'undefined' && currentCfg.moduleConfiguration === 'hide') ) {
							targetElements.hide();
						} else {
							$jq.fn.on = temporaryBind;

							targetElements[ moduleKey ]( currentCfg.moduleConfiguration );

							$jq.fn.on = initialBinding;
						}

						if(typeof currentCfg.afterHook === 'function' ) {
							currentCfg.afterHook.call( targetElements );
						}
					}
				});

			})(currentBP);
		}

		if (mqEngine.activate) mqEngine.activate();

		return targetElements;
	};

	$jq.fn[ systemID ].defaultOptions = {
		moduleKey: "",
		mediaBreakpoints: {},
		teardownMethod: "destroy"
	};
}(jQuery));