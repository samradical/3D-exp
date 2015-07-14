var AP = 0.5625;
'use strict';

var UTILS = (function() {
	function onAspectResize(w, h, callback) {
		var containerRatio = w / h;
		var elRatio = 1280 / 720;
		var scale, x, y;

		// define scale

		if (containerRatio > elRatio) {
			scale = w / 1280;
		} else {
			scale = h / 720;
		}
		// define position
		if (containerRatio === elRatio) {
			x = y = 0;
		} else {
			x = (w - 1280 * scale) * 0.5 / scale;
			y = (h - 720 * scale) * 0.5 / scale;
		}

		// fixed
		x = Number(x.toFixed(1));
		y = Number(y.toFixed(1));

		callback(1280*scale, 720*scale);
	}

	return {
		onAspectResize: onAspectResize
	}
})();

module.exports = UTILS;