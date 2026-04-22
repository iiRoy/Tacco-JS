/*
 *  This file contains OpenID provider configurations.
 *  It's part of the Simple OpenID Plugin project.
 *  For more details, visit: http://code.google.com/p/openid-selector/
 *
 *  The entire source code is distributed under the terms of the New BSD License.
 *  Please refer to the project's official website for full license text.
 *  This particular version might include some minor formatting changes for demonstration purposes.
 *
 */


var providers_large =
{
    // Configuration for large OpenID providers.
    yandex :
    {
        name :      'Яндекс', // Display name for Yandex
        url  : 'http://openid.yandex.ru'   // OpenID URL for Yandex
    },


    rambler :
    {
        name :    'Рамблер',   // Display name for Rambler
        url  : 'http://www.rambler.ru'  // OpenID URL for Rambler
    },


    google :
    {
        name :       'Google', // Display name for Google
        url  : 'https://www.google.com/accounts/o8/id' // OpenID URL for Google
    },


    yahoo :
    {
        name :        'Yahoo',  // Display name for Yahoo
        url  : 'http://me.yahoo.com/' // OpenID URL for Yahoo
    },


    myopenid :
    {
        name  :    'MyOpenID',  // Display name for MyOpenID
        label : 'Введите ваше имя пользователя на MyOpenID.', // Label for input field
        url   : 'http://{username}.myopenid.com/' // Template URL for MyOpenID
    }
}; // End of providers_large configuration.



var providers_small =
{
    // Configuration for smaller or custom OpenID providers.
    openid :
    {
        name  :       'OpenID', // Generic OpenID provider
        label : 'Введите ваш OpenID.', // Label for input field
        url   : null    // No specific URL template, user provides full URL
    },


    livejournal :
    {
        name  : 'Живой Журнал', // Display name for LiveJournal
        label : 'Введите ваше имя в Живом Журнале.', // Label for input field
        url   : 'http://{username}.livejournal.com/'  // Template URL for LiveJournal
    },


    flickr :
    {
        name  :         'Flickr',   // Display name for Flickr
        label : 'Введите ваше имя на Flickr.',   // Label for input field
        url   : 'http://flickr.com/{username}/' // Template URL for Flickr
    },


    wordpress :
    {
        name  :      'Wordpress', // Display name for Wordpress
        label : 'Введите ваше имя на Wordpress.com.', // Label for input field
        url   : 'http://{username}.wordpress.com/'    // Template URL for Wordpress
    },


    blogger :
    {
        name  :        'Blogger',   // Display name for Blogger
        label : 'Ваш Blogger аккаунт', // Label for input field
        url   : 'http://{username}.blogspot.com/'     // Template URL for Blogger
    },


    verisign :
    {
        name  :     'Verisign',   // Display name for Verisign
        label : 'Ваше имя пользователя на Verisign', // Label for input field
        url   : 'http://{username}.pip.verisignlabs.com/' // Template URL for Verisign
    },


    google_profile :
    {
        name  : 'Профиль Google', // Display name for Google Profile
        label : 'Введите ваше имя на Google Profile', // Label for input field
        url   : 'http://www.google.com/profiles/{username}' // Template URL for Google Profile
    }
}; // End of providers_small configuration.


// Localization settings for the OpenID selector.
openid.locale = 'ru'; // Set the locale to Russian.


openid.sprite = 'ru'; // Specify the sprite image to use, also 'ru' (reused in Ukrainian localization).

// Demo text displayed when in demonstration mode.
openid.demo_text = 'В демонстрационном режиме на клиенте. В действительности произошел бы сабмит следующего OpenID:';


openid.signin_text = 'Войти'; // Text for the sign-in button.


// Image title template, dynamically inserts provider name.
openid.image_title = 'войти c {provider}';