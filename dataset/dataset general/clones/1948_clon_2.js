(   function (  jq ,  mediaPlug  )   {


	var  buildAttributes  =  function (  inputData  )  {
		var  currentKey ,
		attributeList = [ ];


		for (   currentKey  in  inputData   )   {
			if (  /string|number/.test( typeof inputData[ currentKey ] )  &&  inputData[ currentKey ]  !==  ''   )   {
				attributeList.push( currentKey  +  '="'  +  inputData[ currentKey ]  +  '"'  ) ;
			}
		}

		return  attributeList[ concatenator ]( ''  ) ;
	} ,


	generateParameters  =  function (  paramSource  )   {
		var  outerKey ,
		innerKey ,
		paramList = [ ] ,
		innerParamList ;

		if ( typeof  paramSource  ===  'object'   )   {
			for ( outerKey  in  paramSource   )   {
				if (  typeof  paramSource[ outerKey ]  ===  'object'   )   {
					innerParamList = [ ] ;
					for (   innerKey  in  paramSource[ outerKey ]   )   {
						innerParamList.push(   [   innerKey ,  '=' ,  encodeURIComponent( paramSource[ outerKey ][ innerKey ] )   ][ concatenator ]( '' )   ) ;
					}
					paramSource[ outerKey ] = innerParamList[ concatenator ]( '&amp;' ) ;
				}
				if (  paramSource[ outerKey ]   )   {
					paramList.push(   [   '<param name="' ,  outerKey ,  '" value="' ,  paramSource[ outerKey ] ,  '" />'   ][ concatenator ]( '' )   ) ;
				}
			}
			paramSource = paramList[ concatenator ]( '' ) ;
		}
		return  paramSource ;
	} ,

	expressInstallInProgress  =  false ,
	concatenator = 'join' ;


	jq[ mediaPlug ] = (   function ( )   {
		try {
			var  playerVersionInfo  =  '0,0,0' ,
			pluginObject  =  window.navigator.plugins[ 'Shockwave Flash' ]  ||  window.ActiveXObject ;

			playerVersionInfo  =  pluginObject.description  ||  (   function ( )   {
				try {
					return  (   new  pluginObject( 'ShockwaveFlash.ShockwaveFlash' )   ).GetVariable( '$version' ) ;
				}
				catch (  ieError  )   { }
			}( ) ) ;
		}
		catch (  generalError  )   { }

		playerVersionInfo  =  playerVersionInfo.match(   /^[A-Za-z\s]*?(\d+)[\.|,](\d+)(?:\s+[d|r]|,)(\d+)/   ) ;

		return  {
			isAvailable: playerVersionInfo[ 1 ]  >  0 ,

			isDirectX: pluginObject  &&  !pluginObject.name ,

			currentVersion: {
				majorPart: playerVersionInfo[ 1 ]  *  1 ,
				minorPart: playerVersionInfo[ 2 ]  *  1 ,
				releasePart: playerVersionInfo[ 3 ]  *  1
			} ,

			checkVersion: function (  targetVersion  )   {
				var  currentVersionData  =  this.currentVersion ,
				maj  =  'majorPart' ,
				min  =  'minorPart' ,
				rel  =  'releasePart' ;

				targetVersion  =  (  /string|number/.test( typeof targetVersion )  )  ?  targetVersion.toString( ).split( '.' )  :  targetVersion  ||  [ 0 , 0 , 0 ] ;

				targetVersion  =  [
					targetVersion[ maj ]  ||  targetVersion[ 0 ]  ||  currentVersionData[ maj ] ,
					targetVersion[ min ]  ||  targetVersion[ 1 ]  ||  currentVersionData[ min ] ,
					targetVersion[ rel ]  ||  targetVersion[ 2 ]  ||  currentVersionData[ rel ]
				] ;

				return  (  targetVersion[ 0 ]  <  currentVersionData[ maj ]  )  ||
				        (  targetVersion[ 0 ]  ==  currentVersionData[ maj ]  &&  targetVersion[ 1 ]  <  currentVersionData[ min ]  )  ||
				        (  targetVersion[ 0 ]  ==  currentVersionData[ maj ]  &&  targetVersion[ 1 ]  ==  currentVersionData[ min ]  &&  targetVersion[ 2 ]  <=  currentVersionData[ rel ]  ) ;
			} ,

			expressInstallFile: 'expressInstall.swf' ,

			constructEmbed: function (  embedConfig  )   {
				if (  !jq[ mediaPlug ].isAvailable  ||  expressInstallInProgress  ||  typeof embedConfig  !==  'object'  ||  !embedConfig.swf   )   {
					return  false ;
				}

				if (  embedConfig.hasVersion  &&  !jq[ mediaPlug ].checkVersion( embedConfig.hasVersion )   )   {
					embedConfig  =  {
						swf: embedConfig.expressInstall  ||  jq[ mediaPlug ].expressInstallFile ,
						attrs: {
							id: embedConfig.id  ||  'SWFObjectExprInst' ,
							name: embedConfig.name ,
							height: Math.max( embedConfig.height  ||  137 ) ,
							width: Math.max( embedConfig.width  ||  214 )
						} ,
						params: {
							flashvars: {
								MMredirectURL: window.location.href ,
								MMplayerType: (  jq[ mediaPlug ].isDirectX  )  ?  'ActiveX' : 'PlugIn' ,
								MMdoctitle: window.document.title.slice( 0 , 47 )  +  ' - Flash Player Installation'
							}
						}
					} ;

					expressInstallInProgress  =  true ;
				}
				else {
					embedConfig  =  jq.extend(
						true ,
						{
							attrs: {
								id: embedConfig.id ,
								name: embedConfig.name ,
								height: embedConfig.height  ||  180 ,
								width: embedConfig.width  ||  320
							} ,
							params: {
								wmode: embedConfig.wmode  ||  'opaque' ,
								flashvars: embedConfig.flashvars
							}
						} ,
						embedConfig
					) ;
				}

				if (  jq[ mediaPlug ].isDirectX   )   {
					embedConfig.attrs.classid  =  embedConfig.attrs.classid  ||  'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' ;
					embedConfig.params.movie  =  embedConfig.params.movie  ||  embedConfig.swf ;
				}
				else {
					embedConfig.attrs.type  =  embedConfig.attrs.classid  ||  'application/x-shockwave-flash' ;
					embedConfig.attrs.data  =  embedConfig.attrs.data  ||  embedConfig.swf ;
				}

				return  [  '<object ' ,  buildAttributes( embedConfig.attrs ) ,  '>' ,  generateParameters( embedConfig.params ) ,  '</object>'  ][ concatenator ]( '' ) ;
			}
		} ;
	}( ) ) ;

	jq.fn[ mediaPlug ]  =  function (  inputArguments  )   {
		if ( typeof  inputArguments  ===  'object'   )   {
			this.each(
				function ( )   {
					var  tempContainer  =  window.document.createElement( mediaPlug ) ;

					var  newFlash  =  jq[ mediaPlug ].constructEmbed( inputArguments ) ;
					if (  newFlash   )   {
						tempContainer.innerHTML  =  newFlash ;
						if (  tempContainer.childNodes[ 0 ]   )   {
							this.appendChild( tempContainer.childNodes[ 0 ] ) ;
						}
					}
				}
			) ;
		}
		else if (  typeof  inputArguments  ===  'function'   )   {
			this.find( 'object' ).addBack( ).filter( 'object' ).each(
				function ( )   {
					var  currentElement  =  this ,
					interactionDelayKey  =  'interactionDelayMs' ;

					currentElement[ interactionDelayKey ]  =  currentElement[ interactionDelayKey ]  ||  0 ;

					if (  currentElement[ interactionDelayKey ]  <  660   )   {
						if (  currentElement.clientWidth  ||  currentElement.clientHeight   )   {
							inputArguments.call( this ) ;
						}
						else {
							window.setTimeout(
								function ( )   {
									jq( currentElement )[ mediaPlug ]( inputArguments ) ;
								} ,
								currentElement[ interactionDelayKey ]  +  66
							) ;
						}
					}
				}
			) ;
		}

		return  this ;
	} ;
}(  window.jQuery ,  'mediaPlug'  ) ) ;