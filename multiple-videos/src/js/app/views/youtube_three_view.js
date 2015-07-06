var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var TWEEN = require('tweenjs');
var SHADERS = require('../common/shaders');
// app dependencies
var NUM_COLUMNS = 2;
var VIDEO_WIDTH = 1280;
var VIDEO_HEIGHT = 720;
var MAX_PLANES = 4;

var statsEnabled = true;

var container, stats, loader;
var camera, scene, renderer;

var geometry;
var planes;
var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
var texture, texture2, video;
var planesGroup;

var textMesh, textGeo;

var spotLight, pointLight, ambientLight;
var isRender = true;

var mouseX = 0;
var mouseY = 0;

var controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {

	'use strict';

	Views.YoutubeThreeView = Marionette.ItemView.extend({
		template: JST['youtube_three'],
		events: {
			'click .js-go': 'startProcess'
		},
		initialize: function(options) {
			this.updateCounter = 0;
			this.guiOptions = Object.create(null);
			this.guiOptions['enableChroma'] = true;
			this.guiOptions['enableColor'] = true;
			this.guiOptions['enableDisplacement'] = true;
			this.guiOptions['enableReflection'] = true;
			this.guiOptions['saturation'] = 1.01;
			this.guiOptions['contrast'] = 1.01;
			this.guiOptions['desaturate'] = 0.01;
			this.guiOptions['brightness'] = 0.01;
			this.guiOptions['hue'] = 0.01;
			this.guiOptions['uDisplacementScale'] = 37;
			this.guiOptions['numberOfPlanes'] = MAX_PLANES;
		},
		onRender: function() {
			//gui
			var gui = new dat.GUI();
			var cameraControls = gui.addFolder('Camera');

			gui.add(this.guiOptions, 'enableColor').onChange(function(val) {
				videoMaterial.uniforms['enableColor'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'enableChroma').onChange(function(val) {
				videoMaterial.uniforms['enableChroma'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'enableReflection').onChange(function(val) {
				videoMaterial.uniforms['enableReflection'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'enableDisplacement').onChange(function(val) {
				videoMaterial.uniforms['enableDisplacement'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'saturation', 0.0, 10.0).onChange(function(val) {
				this.onPeramChanged('uSaturation', val);
			}.bind(this));
			gui.add(this.guiOptions, 'contrast', 0.0, 10.0).onChange(function(val) {
				this.onPeramChanged('uContrast', val);
			}.bind(this));
			gui.add(this.guiOptions, 'desaturate', 0.0, 1.0).onChange(function(val) {
				this.onPeramChanged('uDesaturate', val);
			}.bind(this));
			gui.add(this.guiOptions, 'brightness', 0.0, 4.0).onChange(function(val) {
				this.onPeramChanged('uBrightness', val);
			}.bind(this));
			gui.add(this.guiOptions, 'hue', 0.0, Math.PI * 2).onChange(function(val) {
				this.onPeramChanged('uHue', val);
			}.bind(this));

			gui.add(this.guiOptions, 'numberOfPlanes', 1, MAX_PLANES).step(1).onChange(_.debounce(function(val) {
				this.createPlanes();
			}.bind(this), 300));
			gui.add(this.guiOptions, 'uDisplacementScale', 1, 700).step(1).onChange(function(val) {

			}.bind(this));
			gui.width = 300;
			this.gui = gui;
		},
		onShow: function() {
			var self = this;
			this.$textEl = this.$el.find('.ThreeFonts');

			this.videoElement = document.getElementById('myVideo');
			this.videoElement.width = VIDEO_WIDTH;
			this.videoElement.height = VIDEO_HEIGHT;

			this.videoElement2 = document.getElementById('myVideo2');
			this.videoElement2.width = VIDEO_WIDTH;
			this.videoElement2.height = VIDEO_HEIGHT;

			this.boundAnimate = this.animate.bind(this);
			this.setup3D();
			this.boundAnimate();
		},

		////------------------------
		//3D
		////------------------------

		setup3D: function() {

			planes = [];

			container = document.getElementById('three');
			this.el.appendChild(container);
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.rotation.set(0, 0, 0);

			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			container.appendChild(renderer.domElement);

			// LIGHTS
			ambientLight = new THREE.AmbientLight(0xffffff);
			scene.add(ambientLight);

			controls = new THREE.TrackballControls(camera, renderer.domElement);
			renderer.gammaInput = true;
			renderer.gammaOutput = true;

			geometry = new THREE.PlaneGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 480, 270);
			geometry.computeTangents();

			texture = new THREE.Texture(this.videoElement);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			texture2 = new THREE.Texture(this.videoElement2);
			texture2.minFilter = THREE.LinearFilter;
			texture2.magFilter = THREE.LinearFilter;



			//Normal map shader
			var ambient = 0xffffff,
				diffuse = 0xffffff / 5,
				specular = 0xffffff,
				scale = 143;

			var shader = SHADERS["chroma"];
			var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

			uniforms["enableChroma"].value = true;
			uniforms["enableColor"].value = true;
			uniforms["enableReflection"].value = true;
			uniforms["enableDisplacement"].value = true;
			uniforms["enableRipples"].value = true;

			uniforms["tOne"].value = texture2;
			uniforms["tTwo"].value = texture;
			uniforms["tDisplacement"].value = texture;

			uniforms["uRes"].value = VIDEO_HEIGHT / VIDEO_WIDTH;

			uniforms["uDisplacementBias"].value = 1.0;
			uniforms["uDisplacementScale"].value = 20;

			uniforms["uAmbientColor"].value.setHex(ambient);
			uniforms["uDiffuseColor"].value.setHex(diffuse);

			uniforms["uAmbientColor"].value.convertGammaToLinear();
			uniforms["uDiffuseColor"].value.convertGammaToLinear();


			//uniforms["tOne"].value = texture;
			//uniforms["tTwo"].value = texture;

			var parameters = {
				fragmentShader: shader.fragmentShader,
				shading: THREE.SmoothShading,
				vertexShader: shader.vertexShader,
				uniforms: uniforms,
				lights: true,
				fog: false,
				map: texture,
				side: THREE.DoubleSide
			};

			videoMaterial = new THREE.ShaderMaterial(parameters);

			this.createPlanes();

			window.addEventListener('resize', this.onWindowResize, false);
		},

		createPlanes: function() {
			planesGroup = new THREE.Object3D();
			planesGroup.position.set(0, -VIDEO_HEIGHT / (MAX_PLANES / 2),0);
			for (var i = 0; i < MAX_PLANES; i++) {
				var mesh = new THREE.Mesh(geometry, videoMaterial);

				var offsetX = 2 * VIDEO_WIDTH / 4;
				var offsetY = VIDEO_HEIGHT-2;
				var d = Math.floor(i / 2);
				if (i % 2 !== 0) {
					mesh.position.set(-offsetX, offsetY * d, -1500);
				} else {
					mesh.position.set(offsetX,offsetY * d, -1500);
				}

				/*if (i % 2 !== 0) {
					mesh.rotation.set(0, Math.PI, 0);
				}*/
				planes.push(mesh);
				planesGroup.add(mesh);
			}
			scene.add(planesGroup);
		},

		onWindowResize: function() {
			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		},

		onDocumentMouseMove: function(event) {
			mouseX = (event.clientX - windowHalfX) * 10;
			mouseY = (event.clientY - windowHalfY) * 10;
		},

		animate: function() {
			window.requestAnimationFrame(this.boundAnimate);
			this.threeRender();
		},

		threeRender: function() {
			controls.update();
			TWEEN.update();
			renderer.render(scene, camera);
			texture2.needsUpdate = true;
			texture.needsUpdate = true;
			videoMaterial.uniforms['uTime'].value = this.updateCounter / 60;
			this.updateCounter++;
		}

	});
});

// export
module.exports = App.YoutubeThreeView;