GlobalUtility.registerModule( 'deprecated_navigator_notifier', [ 'global_dom_access', 'global_user_state', 'notifier_settings' ], function( browser_info, current_visitor, preferences ) {


 /*
  * Check if the user has previously closed this notification banner.
  */
 if ( current_visitor.retrievePreference( 'notifier_dismissed_flag' ) === 1 )
 {
  return;
 }

 /*
  * Iterate through browser versions and determine if the current browser
  * version is below any specified threshold.
  */
 let   found_match,
       idx = 0;
 const browser_thresholds =
 [
  [ browser_info.internetExplorer, Math.floor( parseFloat( preferences.ie_version ) || 8 ) ],
  [ browser_info.firefox         , parseFloat( preferences.fx_version ) || 0 ],
  [ browser_info.chrome          , parseFloat( preferences.chrome_version ) || 0 ],
  [ browser_info.opera           , parseFloat( preferences.opera_version ) || 0 ],
  [ browser_info.safari          , parseFloat( preferences.safari_version ) || 0 ]
 ];
 const count = browser_thresholds.length;

 for ( ; idx < count; idx++ )
 {
  const current_browser_version = browser_thresholds[ idx ];

  if ( current_browser_version[ 0 ] && current_browser_version[ 1 ] >= current_browser_version[ 0 ] )
  {
   found_match = true;

   break;
  }
 }

 if ( !found_match )
 {
  return;
 }

 const agent_data = window.navigator,
       html_document = document;


 /*
  * Ascertain the user's preferred language for localization.
  */
 const user_locale = ( agent_data.language_preference || agent_data.language_setting || 'eng' ).toLowerCase();

 /*
  * Construct the hyperlink for additional details about browser updates.
  */
 const info_resource_link = '<a href="https://www.browserstatus.org/locale/' + user_locale + '/" target="_blank">';

 /*
  * Collection of translated messages for the notification.
  * Note: the anchor tag is opened within the string and closed after insertion
  * to optimize minification size.
  */
 const localized_messages =
 {
  'eng': 'You are using an outdated browser. ' + info_resource_link + 'More information &#187;',

  'af': 'Jy gebruik \'n verouderde webblaaier. ' + info_resource_link + 'Meer inligting &#187;',
  'ar': 'المتصفح الذي تستخدمه قديم وغير محدث. ' + info_resource_link + ' المزيد من المعلومات &#187; ',
  'bn': 'আপনি একটি সেকেলে ঘরানার ব্রাউজার ব্যবহার করছেন। '  + info_resource_link +  'বিস্তারিত দেখুন &#187;',
  'cs': 'Používáte zastaralý prohlížeč. ' + info_resource_link + 'Více informací &#187;',
  'da': 'Du bruger en ældre browser. ' + info_resource_link + 'Mere information &#187;',
  'de': 'Sie benutzen einen veralteten Browser. ' + info_resource_link + 'Mehr Informationen &#187;',
  'el': 'Χρησιμοποιείτε ένα ξεπερασμένο πρόγραμμα περιήγησης. ' + info_resource_link + 'Περισσότερες πληροφορίες &#187;',
  'es': 'Su navegador está obsoleto. ' + info_resource_link + 'M&aacute;s informaci&oacute;n &#187;',
  'fa': 'شما از مرورگری قدیمی استفاده می کنید. ' + info_resource_link + '&#187;اطلاعات بیشتر',
  'fi': 'Käytät vanhentunutta selainta. ' + info_resource_link + 'Lisää tietoa &#187;',
  'fr': 'Votre navigateur n\'est pas à jour. ' + info_resource_link + 'Plus d\'information &#187;',
  'ga': 'Tá tú ag baint úsáide as brabhsálaí atá as dáta. ' + info_resource_link + 'Tuilleadh eolais &#187;',
  'he': 'דפדפן האינטרנט שלך אינו מעודכן. ' + info_resource_link + 'למידע נוסף &#187;',
  'hu': 'A böngészője elavult. ' + info_resource_link + 'További információ &#187;',
  'id': 'Anda menggunakan web browser versi lama. ' + info_resource_link + 'Informasi selengkapnya &#187;',
  'is': 'Þú ert að nota úreltan vafra. ' + info_resource_link + 'Nánari upplýsingar &#187;',
  'it': 'Stai usando un browser datato. ' + info_resource_link + 'Ulteriori informazioni &#187;',
  'ja': '旧式のブラウザーを利用されています。' + info_resource_link + '詳細情報 &#187;',
  'lt': 'Jūs naudojate pasenusią naršyklę. ' + info_resource_link + 'Daugiau informacijos &#187;',
  'lv': 'Jūs izmantojat novecojušu pārlūku. ' + info_resource_link + 'Uzzināt vairāk &#187;',
  'nl': 'U gebruikt op dit moment een verouderde webbrowser. ' + info_resource_link + 'Meer informatie &#187;',
  'nb-NO': 'Du bruker en utdatert nettleser. ' + info_resource_link + 'Mer informasjon &#187;',
  'pl': 'Używasz przestarzałej przeglądarki. ' + info_resource_link + 'Więcej informacji &#187;',
  'pt': 'Você está usando um navegador desatualizado. ' + info_resource_link + 'Mais informações &#187;',
  'ro': 'Browserul dumneavoastră este depăşit. ' + info_resource_link + 'Mai multe informații &#187;',
  'ru': 'Вы используете устаревший браузер. ' + info_resource_link + 'Подробнее &#187;',
  'sk': 'Používate zastaralý prehliadač. ' + info_resource_link + 'Viac informácií &#187;',
  'sl': 'Uporabljate zastarel brskalnik. ' + info_resource_link + 'Več informacij &#187;',
  'sr': 'Vi koristite zastarelu verziju browsera. ' + info_resource_link + 'Vi&#353;e informacija &#187;',
  'sv': 'Du använder en gammal webbläsare. ' + info_resource_link + 'Mer information &#187;',
  'tr': 'Çok eski bir tarayıcı kullanıyorsunuz. ' + info_resource_link + 'Daha fazla bilgi &#187;',
  'vi': 'Trình duyệt bạn dùng đã lỗi thời rồi. ' + info_resource_link + 'Thêm thông tin &#187;',
  'zh': '您的浏览器版本过旧。 ' + info_resource_link + '更多信息 &#187;',
  'zh-tw': '你正在使用過時的瀏覽器。 ' + info_resource_link + '更多訊息 &#187;'
 };

 /*
  * Cascading Style Sheet rules to visually format the notification.
  */
 const style_declarations =
  '#outdated-browser-warning {' +
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

  '#outdated-browser-warning a {' +
   'text-decoration:underline;' +
   'color:#EBEBF4' +
  '}' +

  '#outdated-browser-warning a:hover, #outdated-browser-warning a:active {' +
   'text-decoration:none;' +
   'color:#DBDBEB' +
  '}' +

  '#outdated-browser-close-btn {' +
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

  '#outdated-browser-close-btn:hover {' +
   'background:#E04343;' +
   'color:#FFF' +
  '}';

 /*
  * Declare all DOM-related variables together for clarity and potential engine optimization.
  */
 const document_body = html_document.body,
       document_head = html_document.getElementsByTagName( 'head' )[ 0 ],
       notification_element = html_document.createElement( 'div' ),
       dismiss_button = html_document.createElement( 'a' ),

 /*
  * Create a new style element to embed the CSS rules into the document.
  */
       dynamic_stylesheet = html_document.createElement( 'style' );

 dynamic_stylesheet.id = 'deprecation-notice-style';
 dynamic_stylesheet.setAttribute( 'type', 'text/css' );

 if ( dynamic_stylesheet.styleSheet )
 {
  dynamic_stylesheet.styleSheet.cssText = style_declarations;
 }
 else
 {
  dynamic_stylesheet.appendChild( html_document.createTextNode( style_declarations ) );
 }

 document_head.insertBefore( dynamic_stylesheet, document_head.firstElementChild );

 /*
  * Configure the main notification container.
  */
 notification_element.id = 'outdated-browser-warning';
 notification_element.innerHTML = ( localized_messages[ user_locale ] || localized_messages[ user_locale.slice( 0, 2 ) ] || localized_messages.eng ) + '</a>';

 /*
  * Set up the button to close the notification.
  */
 dismiss_button.id = 'outdated-browser-close-btn';
 dismiss_button.innerHTML = '&times;';

 notification_element.appendChild( dismiss_button );

 dismiss_button.addEventListener( 'click', function( )
 {
  document_body.removeChild( notification_element );
  document_body.className = document_body.className.replace( new RegExp( '(?:\\s|^)outdated-browser-class(?:\\s|$)' ), '' );

  /*
   * Persist the dismissal preference for a period (e.g., 7 days).
   */
  current_visitor.setPreference( 'notifier_dismissed_flag', 1, 7 * 24 * 60 * 60 );

  // Prevent default link behavior
  return false;
 });

 /*
  * Insert the generated notification into the web page's body.
  */
 document_body.append( notification_element );
 document_body.classList.add( 'outdated-browser-class' );

} );