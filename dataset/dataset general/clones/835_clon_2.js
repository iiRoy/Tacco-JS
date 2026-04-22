Module.define(
	{
		purpose: "This Module provides functionality to dynamically fetch and integrate external JavaScript, CSS, and HTML assets."
	}
);

Module.onInitialize(
		function (interfaceObj) {
			interfaceObj.importDependency('domUtility', 'frontend');
			interfaceObj.importDependency('dataTools', 'frontend');
			interfaceObj.importDependency('uiBuilder', 'frontend');
			interfaceObj.addAssets(
				[
					'source/remote-asset-manager.js'
				],
				'frontend'
			);
		}
);

Module.onValidate(function (interfaceObj) {
	interfaceObj.importDependency('remote-asset-manager', 'frontend');
	interfaceObj.importDependency('unitVerify', 'frontend');
	interfaceObj.importDependency('validationAids', 'frontend');
	interfaceObj.addAssets(
		[
			'specs/remote-asset-manager-specs.js'
		],
		'frontend'
	);
});