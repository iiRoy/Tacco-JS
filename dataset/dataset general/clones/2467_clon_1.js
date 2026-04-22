/* View on GitHub: https://github.com/xPaw/CF-ABetterBrowser */

CloudFlare.define(
	'abetterbrowser',
	[ 'cloudflare/dom', 'cloudflare/user', 'abetterbrowser/config' ],
	function( version, user, config )
{
	// Check if the user has already closed this notification message.
	if ( user.getCookie( 'cfapp_abetterbrowser' ) === 1 )
	{
		return; /* Exit early if the message was previously dismissed. */
	}

	/*
	 * This section compares the user's current browser version
	 * against a minimum required version specified in the config.
	 * If the user's browser is older than the minimum, 'matched' will be set to true.
	 */
	var matched,
		i = 0,
		versions =
		[
			[ version.internetExplorer, ( parseInt( config.ie, 10 ) || 8 ) ],
			[ version.firefox         , ( parseFloat( config.firefox ) || 0 ) ],
			[ version.chrome          , ( parseFloat( config.chrome ) || 0 ) ],
			[ version.opera           , ( parseFloat( config.opera ) || 0 ) ],
			[ version.safari          , ( parseFloat( config.safari ) || 0 ) ]
		],
		length = versions.length;

	for ( ; i < length; i++ )
	{
		version = versions[ i ];

		if ( version[ 0 ] && version[ 1 ] >= version[ 0 ] )
		{
			matched = true;

			break; /* A matching outdated browser was found, no need to check further. */
		}
	}

	// If no outdated browser was matched, then the user's browser is up-to-date enough.
	if ( !matched )
	{
		return; // No action needed.
	}


	// Initialize core DOM objects and user language settings.
	var nav = window.navigator,
		doc = document,

	// Determine the user's browser language for localized content.
	language = ( nav.language || nav.browserLanguage || 'en' ).toLowerCase(),

	// Construct the "More information" link using the detected language.
	moreInformationLink = '<a href="http://www.whatbrowser.org/intl/' + language + '/" target="_blank">',

	/*
	 * Translation strings for various languages.
	 * The 'moreInformationLink' is intentionally opened but not closed here.
	 * The closing '</a>' tag is added later, after the message content,
	 * to allow for better minification and simpler concatenation.
	 */
	translations =
	{
		'en': 'You are using an outdated browser. ' + moreInformationLink + 'More information &#187;',

		'af': 'Jy gebruik \'n verouderde webblaaier. ' + moreInformationLink + 'Meer inligting &#187;',
		'ar': 'المتصفح الذي تستخدمه قديم وغير محدث. ' + moreInformationLink + ' المزيد من المعلومات &#187; ',
		'bn': 'আপনি একটি সেকেলে ঘরানার ব্রাউজার ব্যবহার করছেন। '  + moreInformationLink +  'বিস্তারিত দেখুন &#187;',
		'cs': 'Používáte zastaralý prohlížeč. ' + moreInformationLink + 'Více informací &#187;',
		'da': 'Du bruger en ældre browser. ' + moreInformationLink + 'Mere information &#187;',
		'de': 'Sie benutzen einen veralteten Browser. ' + moreInformationLink + 'Mehr Informationen &#187;',
		'el': 'Χρησιμοποιείτε ένα ξεπερασμένο πρόγραμμα περιήγησης. ' + moreInformationLink + 'Περισσότερες πληροφορίες &#187;',
		'es': 'Su navegador está obsoleto. ' + moreInformationLink + 'M&aacute;s informaci&oacute;n &#187;',
		'fa': 'شما از مرورگری قدیمی استفاده می کنید. ' + moreInformationLink + '&#187;اطلاعات بیشتر',
		'fi': 'Käytät vanhentunutta selainta. ' + moreInformationLink + 'Lisää tietoa &#187;',
		'fr': 'Votre navigateur n\'est pas à jour. ' + moreInformationLink + 'Plus d\'information &#187;',
		'ga': 'Tá tú ag baint úsáide as brabhsálaí atá as dáta. ' + moreInformationLink + 'Tuilleadh eolais &#187;',
		'he': 'דפדפן האינטרנט שלך אינו מעודכן. ' + moreInformationLink + 'למידע נוסף &#187;',
		'hu': 'A böngészője elavult. ' + moreInformationLink + 'További információ &#187;',
		'id': 'Anda menggunakan web browser versi lama. ' + moreInformationLink + 'Informasi selengkapnya &#187;',
		'is': 'Þú ert að nota úreltan vafra. ' + moreInformationLink + 'Nánari upplýsingar &#187;',
		'it': 'Stai usando un browser datato. ' + moreInformationLink + 'Ulteriori informazioni &#187;',
		'ja': '旧式のブラウザーを利用されています。' + moreInformationLink + '詳細情報 &#187;',
		'lt': 'Jūs naudojate pasenusią naršyklę. ' + moreInformationLink + 'Daugiau informacijos &#187;',
		'lv': 'Jūs izmantojat novecojušu pārlūku. ' + moreInformationLink + 'Uzzināt vairāk &#187;',
		'nl': 'U gebruikt op dit moment een verouderde webbrowser. ' + moreInformationLink + 'Meer informatie &#187;',
		'nb-NO': 'Du bruker en utdatert nettleser. ' + moreInformationLink + 'Mer informasjon &#187;',
		'pl': 'Używasz przestarzałej przeglądarki. ' + moreInformationLink + 'Więcej informacji &#187;',
		'pt': 'Você está usando um navegador desatualizado. ' + moreInformationLink + 'Mais informações &#187;',
		'ro': 'Browserul dumneavoastră este depăşit. ' + moreInformationLink + 'Mai multe informații &#187;',
		'ru': 'Вы используете устаревший браузер. ' + moreInformationLink + 'Подробнее &#187;',
		'sk': 'Používate zastaralý prehliadač. ' + moreInformationLink + 'Viac informácií &#187;',
		'sl': 'Uporabljate zastarel brskalnik. ' + moreInformationLink + 'Več informacij &#187;',
		'sr': 'Vi koristite zastarelu verziju browsera. ' + moreInformationLink + 'Vi&#353;e informacija &#187;',
		'sv': 'Du använder en gammal webbläsare. ' + moreInformationLink + 'Mer information &#187;',
		'tr': 'Çok eski bir tarayıcı kullanıyorsunuz. ' + moreInformationLink + 'Daha fazla bilgi &#187;',
		'vi': 'Trình duyệt bạn dùng đã lỗi thời rồi. ' + moreInformationLink + 'Thêm thông tin &#187;',
		'zh': '您的浏览器版本过旧。 ' + moreInformationLink + '更多信息 &#187;',
		'zh-tw': '你正在使用過時的瀏覽器。 ' + moreInformationLink + '更多訊息 &#187;'
	},

	// CSS rules for styling the notification bar.
	rules =
		'#cloudflare-old-browser {' +
			'background:#45484d;' +
			'position:absolute;' +
			'z-index:100000;' +
			'width:100%;' +
			'height:26px;' +
			'top:0;' +
			'left:0;' +
			'overflow:hidden;' +
			'padding:8px 0;' +
			'font:18px/26px Arial,sans-serif;' +
			'text-align:center;' +
			'color:#FFF;' +
			'box-sizing:content-box' +
		'}' +

		'#cloudflare-old-browser a {' +
			'text-decoration:underline;' +
			'color:#EBEBF4' +
		'}' +

		'#cloudflare-old-browser a:hover, #cloudflare-old-browser a:active {' +
			'text-decoration:none;' +
			'color:#DBDBEB' +
		'}' +

		'#cloudflare-old-browser-close {' +
			'background:#393b40;' +
			'display:block;' +
			'width:42px;' +
			'height:42px;' +
			'position:absolute;' +
			'text-decoration:none !important;' +
			'cursor:pointer;' +
			'top:0;' +
			'right:0;' +
			'font-size:30px;' +
			'line-height:42px' +
		'}' +

		'#cloudflare-old-browser-close:hover {' +
			'background:#E04343;' +
			'color:#FFF' +
		'}',

	/*
	 * Declare all necessary DOM elements here for a cleaner, single 'var' statement.
	 * This helps with minification and scope management.
	 */
	body        = doc.body,
	head        = doc.getElementsByTagName( 'head' )[ 0 ],
	message     = doc.createElement( 'div' ),
	closeButton = doc.createElement( 'a' ),

	// Create a new style element to inject our CSS rules.
	style = doc.createElement( 'style' );

	style.id = 'cloudflare-abetterbrowser'; // Assign a unique ID to the style element.
	style.setAttribute( 'type', 'text/css' ); // Specify the content type.

	// Handle IE-specific style injection method.
	if ( style.styleSheet )
	{
		style.styleSheet.cssText = rules;
	}
	else // Standard DOM method for other browsers.
	{
		style.appendChild( doc.createTextNode( rules ) );
	}

	// Insert the style rules into the document's head.
	head.insertBefore( style, head.firstChild );


	// Configure the main message container div.
	message.id = 'cloudflare-old-browser';
	// Set the inner HTML, using translations, falling back to English, and closing the '<a>' tag.
	message.innerHTML = ( translations[ language ] || translations[ language.substring( 0, 2 ) ] || translations.en ) + '</a>';

	// Configure the close button.
	closeButton.id = 'cloudflare-old-browser-close';
	closeButton.innerHTML = '&times;'; // HTML entity for a multiplication sign (used as 'x').

	// Append the close button to the message container.
	message.appendChild( closeButton );

	// Define the click handler for the close button.
	closeButton.onclick = function( )
	{
		// Remove the message bar from the document.
		body.removeChild( message );
		// Clean up the body class added by the script.
		body.className = body.className.replace( new RegExp( '(\\s|^)cloudflare-old-browser-body(\\s|$)' ), '' );

		/*
		 * Set a cookie to hide this message for the next 7 days.
		 * The third argument '7' denotes the expiration in days.
		 */
		user.getCookie( 'cfapp_abetterbrowser', 1, 7 );

		return false; // Prevent default link behavior.
	};

	/*
	 * Finally, inject the prepared message bar into the document body.
	 * Also, add a class to the body for potential CSS adjustments.
	 */
	body.appendChild( message );
	body.className += ' cloudflare-old-browser-body';
} );