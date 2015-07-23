var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var SHADERS_LIB = require('../common/shader_lib');
var THREE_SCENE = require('../common/three_scene');
var SCENE_FACTORY = require('../common/scene_factory');
var UTILS = require('../common/utils');
var COMPOSER_FACTORY = require('../common/composer_factory');
// app dependencies
var NUM_COLUMNS = 2;
var VIDEO_WIDTH = 640;
var VIDEO_HEIGHT = 360;
var MAX_ASPECT = 2.31;

var statsEnabled = true;

var container, stats, loader;
var camera, scene, renderer;

var geometry;
var planes;
var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
var texture1, texture2, texture3, video, sceneA, sceneB;
var planesGroup;

//Normal map shader
var ambient = 0xffffff,
	diffuse = 0xffffff / 5,
	specular = 0xffffff,
	scale = 143;

var textMesh, textGeo;

var spotLight, pointLight, ambientLight;
var isRender = true;

var mouseX = 0;
var mouseY = 0;

var controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var composers = [];
var composersL = 0;

// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {

	'use strict';

	Views.EffectsComposer = Marionette.ItemView.extend({
		template: JST['effect_composer_view'],
		events: {
			'click .js-go': 'startProcess'
		},
		initialize: function(options) {},
		onRender: function() {
			//gui
			this.updateCounter = 0;
			this.guiOptions = Object.create(null);
			this.guiOptions['uMixRatio'] = 0.01;
			this.guiOptions['uThreshold'] = 0.01;
			this.guiOptions['uSaturation'] = 0.01;
		},
		onShow: function() {
			var self = this;
			var gui = new dat.GUI();
			gui.add(this.guiOptions, 'uMixRatio', 0, 1).onChange(function(val) {
				videoMaterial.uniforms["uMixRatio"].value = this.guiOptions['uMixRatio'];
			}.bind(this));

			gui.add(this.guiOptions, 'uThreshold', 0, .5).onChange(function() {
				videoMaterial.uniforms["uThreshold"].value = this.guiOptions['uThreshold'];
			}.bind(this));

			gui.add(this.guiOptions, 'uSaturation', 0, 2.).onChange(function() {
				videoMaterial.uniforms["uSaturation"].value = this.guiOptions['uSaturation'];
			}.bind(this));

			gui.width = 300;

			this.videoElement = document.getElementById('myVideo');
			this.videoElement.volume = 0;
			this.videoElement.width = VIDEO_WIDTH;
			this.videoElement.height = VIDEO_HEIGHT;

			this.videoElement2 = document.getElementById('myVideo2');
			this.videoElement2.volume = 0;
			this.videoElement2.width = VIDEO_WIDTH;
			this.videoElement2.height = VIDEO_HEIGHT;

			this.videoElement3 = document.getElementById('mixer');
			this.videoElement3.volume = 0;
			this.videoElement3.width = VIDEO_WIDTH;
			this.videoElement3.height = VIDEO_HEIGHT;

			this.gui = gui;
			this.setup3D();
		},

		////------------------------
		//3D
		////------------------------

		setup3D: function() {
			var Z_DIS = 400;
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				autoClear: false

			});
			renderer.gammaInput = true;
			renderer.gammaOutput = true;

			renderer.setSize(window.innerWidth, window.innerHeight);
			document.getElementById('three').appendChild(renderer.domElement);

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			this.el.appendChild(stats.domElement);

			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.position.set(0, 0, Z_DIS);

			controls = new THREE.TrackballControls(camera, renderer.domElement);
			controls.minDistance = Z_DIS;
			controls.maxDistance = 1000;

			texture1 = new THREE.Texture(this.videoElement);
			texture1.minFilter = THREE.LinearFilter;
			texture1.magFilter = THREE.LinearFilter;

			texture2 = new THREE.Texture(this.videoElement2);
			texture2.minFilter = THREE.LinearFilter;
			texture2.magFilter = THREE.LinearFilter;

			texture3 = new THREE.Texture(this.videoElement3);
			texture3.minFilter = THREE.LinearFilter;
			texture3.magFilter = THREE.LinearFilter;

			//texture3 = new THREE.ImageUtils.loadTexture('../img1.jpg');
			var scaleObj = UTILS.onAspectResize();

			sceneA = new SCENE_FACTORY();
			sceneA.createScene(new THREE.MeshBasicMaterial({
				map: texture1
			}));

			sceneB = new SCENE_FACTORY();
			sceneB.createScene(new THREE.MeshBasicMaterial({
				map: texture2
			}));

			scene = new THREE.Scene();

			var d = SHADERS_LIB['mix']();
			console.log(d);
			var shader = d['shader'];
			var uniforms = d['uniforms'];
			uniforms["tOne"].value = sceneA.fbo;
			uniforms["tTwo"].value = sceneB.fbo;
			/*uniforms["tOne"].value = texture1;
			uniforms["tTwo"].value = texture2;*/
			uniforms["tMix"].value = texture3;
			uniforms["uMixRatio"].value = this.guiOptions['uMixRatio'];
			uniforms["uThreshold"].value = this.guiOptions['uThreshold'];

			var parameters = {
				fragmentShader: shader.fragmentShader,
				vertexShader: shader.vertexShader,
				uniforms: uniforms
			};

			this.composerFactory = new COMPOSER_FACTORY();

			composers[0] = this.composerFactory.createComposer(renderer, scene, camera);
			//vid1
			composers[1] = this.composerFactory.createComposer(renderer, sceneA, camera);
			//vid2
			composers[2] = this.composerFactory.createComposer(renderer, sceneB, camera);


			console.log(composers[0]);

			composersL = composers.length;

			this.scenePass  = new THREE.TexturePass( composers[0].renderPass );
			composers[0].addPass(this.scenePass);
			composers[1].addPass(this.scenePass);

			var quadgeometry = new THREE.PlaneGeometry(scaleObj.w, scaleObj.h, 4, 4);

			videoMaterial = new THREE.ShaderMaterial(parameters);

			this.quad = new THREE.Mesh(quadgeometry, videoMaterial);
			scene.add(this.quad);

			this.boundAnimate = this.animate.bind(this);
			this.boundAnimate();

			window.addEventListener('resize', this.onWindowResize.bind(this), false);

			this.onWindowResize();
		},
		onWindowResize: function() {
			var w = window.innerWidth;
			var h = window.innerHeight;
			camera.aspect = w / h;
			console.log(camera.aspect);
			var scale = 0;
			if (w / h > MAX_ASPECT) {
				scale = 1 + w / h / MAX_ASPECT;
			} else {
				scale = 1
			}
			this.quad.scale.x = this.quad.scale.y = scale;
			renderer.setSize(w, h)
			_.each(composers, function(c) {
				c.setSize(w, h);
			});
		},
		handleResize: function(w, h) {
			console.log(w, h);
		},
		animate: function() {
			window.requestAnimationFrame(this.boundAnimate);
			this.threeRender();
			stats.update();
		},

		threeRender: function() {
			//	var 
			controls.update();
			texture1.needsUpdate = true;
			texture2.needsUpdate = true;
			texture3.needsUpdate = true;
			//videoMaterial.uniforms.uMixRatio.value = this.guiOptions['uMixRatio'];
			//videoMaterial.uniforms.uThreshold.value = this.guiOptions['uThreshold'];
			/*if (this.guiOptions['uMixRatio'] == 0) {
				sceneB.render(false);
			} else if (this.guiOptions['uMixRatio'] == 1) {
				sceneA.render(false);
			} else {
				sceneA.render(true);
				sceneB.render(true);
				renderer.render(scene, camera, null, true);
			}*/
			renderer.clear();
			renderer.render(scene, camera, null, true);
			//renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			for (var i = 0; i < composersL; i++) {
				composers[i].render(0.01);
			}
		}

	});
});

// export
module.exports = App.EffectsComposer;