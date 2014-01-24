/* global leapMouse */
/* global $ */
(function() {
	'use strict';
	leapMouse.init();

	(function logCoords() {
		setTimeout(function () {
			// console.log('blah');
			$('.leapCoords .x').text(Math.floor(leapMouse.getLeapPos().x));
			$('.leapCoords .y').text(Math.floor(leapMouse.getLeapPos().y));
			$('.leapCoords .z').text(Math.floor(leapMouse.getLeapPos().z));
			$('.mouseCoords .x').text(Math.floor(leapMouse.getScreenPos().x));
			$('.mouseCoords .y').text(Math.floor(leapMouse.getScreenPos().y));
			$('.browser .width').text($(window).width());
			$('.browser .height').text($(window).height());
			logCoords();
		}, 100);
	})();
})();