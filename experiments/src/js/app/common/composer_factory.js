'use strict';
var UTILS = require('./utils');

require('./shaders/CopyShader')
require('./processing/EffectComposer')
require('./processing/GlitchPass')
require('./processing/MaskPass')
require('./processing/RenderPass')
require('./processing/ShaderPass')
require('./processing/TexturePass')

var Composer = function() {

	function createComposer(renderer, scene, camera) {
		var renderTargetParameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: true
		};
		var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
		var renderPass = new THREE.RenderPass(scene, camera);
		renderPass.clear = false;
		var composerScene = new THREE.EffectComposer(renderer, renderTarget);
		composerScene.renderPass = renderPass;
		composerScene.addPass( renderPass );
		return composerScene;
	}

	return {
		createComposer: createComposer
	}
};

module.exports = Composer;