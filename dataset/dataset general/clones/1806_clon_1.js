/*!
 * SWFObject v2.2 - Modified by Brandon Mathis.
 * This version contains only the essential components for dynamic Flash object embedding.
 *
 * Original uncompressed source: javascripts/libs/swfobject-dynamic.js
 * Project homepage: <http://code.google.com/p/swfobject/>
 *
 * Licensed under the MIT License.
 * For details, please see: <http://www.opensource.org/licenses/mit-license.php>
 *
 * This header comment has been visually reformatted.
 */

var swfobject=function(){


var UNDEF="undefined"
,	OBJECT="object"
,	SHOCKWAVE_FLASH="Shockwave Flash"
,	SHOCKWAVE_FLASH_AX="ShockwaveFlash.ShockwaveFlash"
,	FLASH_MIME_TYPE="application/x-shockwave-flash"
,	EXPRESS_INSTALL_ID="SWFObjectExprInst"

; // End of constant declarations

var win=window; // Global window object reference
var doc=document; // Global document object reference
var nav=navigator; // Global navigator object reference


var plugin=false; // Flag to indicate if Flash plugin is detected
var regObjArr=[]; // Array to store registered objects (not used in this modified version)
var objIdArr=[]; // Array to store object IDs for IE cleanup
var storedAltContent; // Stored alternative content (not used)
var storedAltContentId; // Stored alternative content ID (not used)
var storedCallbackFn; // Stored callback function (not used)
var storedCallbackObj; // Stored callback object (not used)
var autoHideShow=true; // Flag for auto hide/show behavior (not used)


	/*
	 * ua - Centralized function for browser feature detection.
	 * User agent string detection is employed only when no superior alternative is available.
	 * This function executes immediately upon definition for optimal performance.
	 */
	var ua=function()
	{
		var w3cdom=(typeof doc.getElementById!=UNDEF&&typeof doc.getElementsByTagName!=UNDEF&&typeof doc.createElement!=UNDEF);
		var u=nav.userAgent.toLowerCase();
		var p=nav.platform.toLowerCase();
		var windows=(p?/win/.test(p):/win/.test(u));
		var mac=(p?/mac/.test(p):/mac/.test(u));
		// Detects WebKit version, or returns false if not WebKit.
		var webkit=(/webkit/.test(u)?parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false);
		// IE detection using Andrea Giammarchi's compact solution.
		var ie=(!+"\v1");
		var playerVersion=[0,0,0]; // Initialize player version array
		var d=null;


		if(typeof nav.plugins!=UNDEF&&typeof nav.plugins[SHOCKWAVE_FLASH]==OBJECT)
		{
			d=nav.plugins[SHOCKWAVE_FLASH].description;
			// Check if the plugin is enabled in Safari 3+.
			if(d&&!(typeof nav.mimeTypes!=UNDEF&&nav.mimeTypes[FLASH_MIME_TYPE]&&!nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin))
			{
				plugin=true; // Flash plugin detected.
				ie=false; // If plugin detected, it's not IE (cascaded detection).
				d=d.replace(/^.*\s+(\S+\s+\S+$)/,"$1");
				playerVersion[0]=parseInt(d.replace(/^(.*)\..*$/,"$1"),10);
				playerVersion[1]=parseInt(d.replace(/^.*\.(.*)\s.*$/,"$1"),10);
				playerVersion[2]=(/[a-zA-Z]/.test(d)?parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0);
			}
		}
		else if(typeof win.ActiveXObject!=UNDEF)
		{
			try
			{
				var a=new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if(a) // Check if ActiveX object was successfully created.
				{
					d=a.GetVariable("$version");
					if(d)
					{
						ie=true; // ActiveX detected, so it's IE.
						d=d.split(" ")[1].split(",");
						playerVersion=[parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10)];
					}
				}
			}
			catch(e)
			{
				// Error handling for ActiveX object creation.
				// For Type I clone, this block remains empty as in original.
			}
		}

		// Return the collected browser capabilities.
		return {w3:w3cdom,pv:playerVersion,wk:webkit,ie:ie,win:windows,mac:mac};
	}()


	/*
	 * main - The primary function responsible for initiating SWFObject logic.
	 * It will preferentially execute onDomLoad, or fall back to onload if necessary.
	 * This function is not directly called in this modified version, its logic is
	 * implicitly handled by `embedSWF` and `testPlayerVersion` if needed.
	 */
	function main() {
		if(plugin){testPlayerVersion();}
		else{matchVersions();} // This function `matchVersions` is not defined in the provided code.
	}

	/*
	 * testPlayerVersion - Detects the Flash Player version for non-Internet Explorer browsers.
	 *
	 * Advantages of this method:
	 *   a. Provides both release and build numbers.
	 *   b. Bypasses incorrect descriptions from faulty Adobe installers.
	 *   c. Avoids issues with multiple Flash Player entries in the plugin Array due to browser import errors.
	 * Disadvantage: Relies on DOM availability, unlike the immediately accessible plugins collection.
	 */
	function testPlayerVersion()
	{
		var b=doc.getElementsByTagName("body")[0];
		var o=createElement(OBJECT); // Create an object element.
		o.setAttribute("type",FLASH_MIME_TYPE);
		var t=b.appendChild(o);

		if(t)
		{
			var counter=0;
			(function()
			{
				if(typeof t.GetVariable!=UNDEF)
				{
					var d=t.GetVariable("$version");
					if(d)
					{
						d=d.split(" ")[1].split(",");
						ua.pv=[parseInt(d[0],10),parseInt(d[1],10),parseInt(d[2],10)];
					}
				}
				else if(counter<10)
				{
					counter++;
					setTimeout(arguments.callee,10); // Retry after 10ms.
					return;
				}
				b.removeChild(o); // Clean up the temporary object.
				t=null;
				// This function `matchVersions` is not defined in the provided code.
				// It would typically proceed with embedding logic after version detection.
				matchVersions();
			})();
		}
		else
		{
			// If temporary object couldn't be appended, proceed without precise version detection.
			matchVersions(); // This function `matchVersions` is not defined.
		}
	}


	/*
	 * createSWF - Performs cross-browser dynamic SWF creation.
	 * This function handles the actual embedding of the Flash movie into the DOM.
	 */
	function createSWF(attObj,parObj,id)
	{
		var r,el=getElementById(id); // Get the element to be replaced.

		// Early exit for specific WebKit versions with known issues.
		if(ua.wk&&ua.wk<312){return r;}

		if(el)
		{
			// If no 'id' is provided for the object element, it inherits from the alternative content.
			if(typeof attObj.id==UNDEF){attObj.id=id;}

			if(ua.ie&&ua.win) // Special handling for Internet Explorer on Windows.
			{
				// IE + HTML object element + W3C DOM methods don't mix well; fall back to outerHTML.
				var att="";
				for(var i in attObj)
				{
					// Filter out prototype additions from other libraries.
					if(attObj[i]!=Object.prototype[i])
					{
						if(i.toLowerCase()=="data")
						{
							parObj.movie=attObj[i];
						}
						else if(i.toLowerCase()=="styleclass")
						{
							// 'class' is an ECMA4 reserved keyword, use 'styleclass' attribute.
							att+=' class="'+attObj[i]+'"';
						}
						else if(i.toLowerCase()!="classid")
						{
							att+=' '+i+'="'+attObj[i]+'"';
						}
					}
				}
				var par="";
				for(var j in parObj)
				{
					// Filter out prototype additions.
					if(parObj[j]!=Object.prototype[j])
					{
						par+='<param name="'+j+'" value="'+parObj[j]+'" />';
					}
				}
				// Use outerHTML to replace the element with the Flash object.
				el.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+att+'>'+par+'</object>';
				// Store object ID for proper cleanup on unload (IE specific).
				objIdArr[objIdArr.length]=attObj.id;
				r=getElementById(attObj.id);
			}
			else // For well-behaving browsers (non-IE).
			{
				var o=createElement(OBJECT);
				o.setAttribute("type",FLASH_MIME_TYPE);
				for(var m in attObj)
				{
					// Filter out prototype additions.
					if(attObj[m]!=Object.prototype[m])
					{
						if(m.toLowerCase()=="styleclass")
						{
							o.setAttribute("class",attObj[m]);
						}
						else if(m.toLowerCase()!="classid") // Filter out IE-specific attribute.
						{
							o.setAttribute(m,attObj[m]);
						}
					}
				}
				for(var n in parObj)
				{
					// Filter out prototype additions and IE-specific "movie" param.
					if(parObj[n]!=Object.prototype[n]&&n.toLowerCase()!="movie")
					{
						createObjParam(o,n,parObj[n]);
					}
				}
				// Replace the original element with the new Flash object.
				el.parentNode.replaceChild(o,el);
				r=o;
			}
		}
		return r;
	}

	// Helper function to create <param> elements for the Flash object.
	function createObjParam(el,pName,pValue)
	{
		var p=createElement("param");
		p.setAttribute("name",pName);
		p.setAttribute("value",pValue);
		el.appendChild(p);
	}

	/*
	 * Cross-browser SWF removal (not implemented in this modified version).
	 * This is particularly crucial for safe and complete SWF removal in Internet Explorer.
	 */

	/*
	 * Functions to optimize JavaScript compression.
	 * These are simple utility functions.
	 */

	// getElementById: Safely retrieve an element by its ID.
	function getElementById(id)
	{
		var el=null;
		try
		{
			el=doc.getElementById(id);
		}
		catch(e)
		{
			// Error handling for getElementById.
		}
		return el;
	}

	// createElement: A wrapper for document.createElement.
	function createElement(el)
	{
		return doc.createElement(el);
	}

	/*
	 * hasPlayerVersion - Compares the detected Flash Player version with a required version.
	 * Returns true if the player version meets or exceeds the required version.
	 */
	function hasPlayerVersion(rv)
	{
		var pv=ua.pv,v=rv.split(".");
		v[0]=parseInt(v[0],10);
		v[1]=parseInt(v[1],10)||0; // Supports short notation like "9" instead of "9.0.0".
		v[2]=parseInt(v[2],10)||0;

		return(pv[0]>v[0]||(pv[0]==v[0]&&pv[1]>v[1])||(pv[0]==v[0]&&pv[1]==v[1]&&pv[2]>=v[2]))?true:false;
	}


	/*
	 * urlEncodeIfNecessary - Filters against potential XSS attacks by URL-encoding problematic characters.
	 */
	function urlEncodeIfNecessary(s)
	{
		var regex=/[\\\"<>\.;]/;
		var hasBadChars=(regex.exec(s)!=null);
		// Encode if bad characters are found and encodeURIComponent is available.
		return hasBadChars&&typeof encodeURIComponent!=UNDEF?encodeURIComponent(s):s;
	}

	return{
		/*
		 * Public API of SWFObject.
		 * Reference documentation: http://code.google.com/p/swfobject/wiki/documentation
		 */

		/**
		 * embedSWF: Dynamically embeds a SWF into the HTML page.
		 * @param {string} swfUrlStr - URL of the SWF file.
		 * @param {string} replaceElemIdStr - ID of the HTML element to be replaced.
		 * @param {string} widthStr - Width of the SWF.
		 * @param {string} heightStr - Height of the SWF.
		 * @param {string} swfVersionStr - Minimum required Flash Player version (e.g., "9.0.124").
		 * @param {object} flashvarsObj - Object containing Flashvars.
		 * @param {object} parObj - Object containing <param> attributes.
		 * @param {object} attObj - Object containing <object> attributes.
		 * @param {function} callbackFn - Callback function to execute after embedding attempt.
		 */
		embedSWF:function(swfUrlStr,replaceElemIdStr,widthStr,heightStr,swfVersionStr,flashvarsObj,parObj,attObj,callbackFn)
		{
			var callbackObj={success:false,id:replaceElemIdStr};
			if(ua.w3&&!(ua.wk&&ua.wk<312)&&swfUrlStr&&replaceElemIdStr&&widthStr&&heightStr&&swfVersionStr)
			{
				widthStr+=""; // Ensure string type.
				heightStr+=""; // Ensure string type.
				var att={};
				if(attObj&&typeof attObj===OBJECT)
				{
					for(var i in attObj)
					{
						// Copy object to prevent reference issues if attObj is reused.
						att[i]=attObj[i];
					}
				}
				att.data=swfUrlStr;
				att.width=widthStr;
				att.height=heightStr;
				var par={};
				if(parObj&&typeof parObj===OBJECT)
				{
					for(var j in parObj)
					{
						// Copy object to prevent reference issues if parObj is reused.
						par[j]=parObj[j];
					}
				}
				if(flashvarsObj&&typeof flashvarsObj===OBJECT)
				{
					for(var k in flashvarsObj)
					{
						// Copy object to prevent reference issues if flashvarsObj is reused.
						if(typeof par.flashvars!=UNDEF)
						{
							par.flashvars+="&"+k+"="+flashvarsObj[k];
						}
						else
						{
							par.flashvars=k+"="+flashvarsObj[k];
						}
					}
				}
				if(hasPlayerVersion(swfVersionStr)) // Check if player version is sufficient.
				{
					var obj=createSWF(att,par,replaceElemIdStr); // Create the SWF.
					callbackObj.success=true;
					callbackObj.ref=obj;
				}
				if(callbackFn){callbackFn(callbackObj);}
			}
			else if(callbackFn)
			{
				callbackFn(callbackObj); // Execute callback even if embedding fails.
			}
		}

		,ua:ua // Expose the user agent detection object.

		/**
		 * getFlashPlayerVersion: Returns the detected Flash Player version.
		 * @returns {object} An object with major, minor, and release properties.
		 */
		,getFlashPlayerVersion:function()
		{
			return{major:ua.pv[0],minor:ua.pv[1],release:ua.pv[2]};
		}

		,hasFlashPlayerVersion:hasPlayerVersion // Expose the version comparison function.

		/**
		 * createSWF: Directly creates a SWF object given attributes and parameters.
		 * This is a lower-level function than embedSWF.
		 * @param {object} attObj - Object attributes.
		 * @param {object} parObj - Parameter attributes.
		 * @param {string} replaceElemIdStr - ID of the element to replace.
		 * @returns {HTMLElement|undefined} The created SWF object element or undefined.
		 */
		,createSWF:function(attObj,parObj,replaceElemIdStr)
		{
			if(ua.w3)
			{
				return createSWF(attObj,parObj,replaceElemIdStr);
			}
			else
			{
				return undefined; // Return undefined if not a W3C DOM browser.
			}
		}

		/**
		 * getQueryParamValue: Retrieves a query parameter value from the URL.
		 * @param {string} param - The name of the query parameter.
		 * @returns {string} The value of the parameter, or an empty string if not found.
		 */
		,getQueryParamValue:function(param)
		{
			var q=doc.location.search||doc.location.hash;
			if(q)
			{
				if(/\?/.test(q)){q=q.split("?")[1];} // Strip the leading question mark.
				if(param==null)
				{
					return urlEncodeIfNecessary(q);
				}
				var pairs=q.split("&");
				for(var i=0;i<pairs.length;i++)
				{
					if(pairs[i].substring(0,pairs[i].indexOf("="))==param)
					{
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=")+1)));
					}
				}
			}
			return""; // Return empty string if parameter not found or no query string.
		}
	};
}()
;