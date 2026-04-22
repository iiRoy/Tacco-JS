/*
  Enhanced Identity Federation Module
  Project page: https://example.com/identity-manager/
  
  This component is distributed under the Permissive Software License 2.0.
*/

var majorAuthServices = {
	yandexId: {
		serviceName: 'Яндекс',
		targetUrl: 'http://openid.yandex.ru'
	},
	ramblerId: {
		serviceName: 'Рамблер',
		targetUrl: 'http://www.rambler.ru'
	},
	googleAuth: {
		serviceName: 'Google',
		targetUrl: 'https://www.google.com/accounts/o8/id'
	},
	yahooId: {
		serviceName: 'Yahoo',
		targetUrl: 'http://me.yahoo.com/'
	},
	myIdentity: {
		serviceName: 'MyOpenID',
		inputPrompt: 'Введите ваше имя пользователя на MyOpenID.',
		targetUrl: 'http://{username}.myopenid.com/'
	}
};

var minorAuthServices = {
	genericId: {
		serviceName: 'OpenID',
		inputPrompt: 'Введите ваш OpenID.',
		targetUrl: undefined
	},
	liveJournalId: {
		serviceName: 'Живой Журнал',
		inputPrompt: 'Введите ваше имя в Живом Журнале.',
		targetUrl: 'http://{username}.livejournal.com/'
	},
	flickrId: {
		serviceName: 'Flickr',
		inputPrompt: 'Введите ваше имя на Flickr.',
		targetUrl: 'http://flickr.com/{username}/'
	},
	wordPressBlog: {
		serviceName: 'Wordpress',
		inputPrompt: 'Введите ваше имя на Wordpress.com.',
		targetUrl: 'http://{username}.wordpress.com/'
	},
	bloggerAccount: {
		serviceName: 'Blogger',
		inputPrompt: 'Ваш Blogger аккаунт',
		targetUrl: 'http://{username}.blogspot.com/'
	},
	veriSignId: {
		serviceName: 'Verisign',
		inputPrompt: 'Ваше имя пользователя на Verisign',
		targetUrl: 'http://{username}.pip.verisignlabs.com/'
	},
	googleProfile: {
		serviceName: 'Профиль Google',
		inputPrompt: 'Введите ваше имя на Google Profile',
		targetUrl: 'http://www.google.com/profiles/{username}'
	}
};

identityConnect.localeSetting = 'ru';
identityConnect.iconSet = 'ru'; /* utilizes the same set for Ukrainian language */
identityConnect.displayMessage = 'В демонстрационном режиме на клиенте. В действительности произошел бы сабмит следующего OpenID:';
identityConnect.loginPrompt = 'Войти';
identityConnect.imageAltText = 'войти c {provider}';