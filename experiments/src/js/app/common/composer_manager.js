'use strict';
var UTILS = require('./utils');

var ComposerManager = function(composer) {
	var _composer;

	function addPass(pass){
		_composer.addPass(pass);
	}
	
	return {
		addPass:addPass
	}
};

module.exports = ComposerManager;