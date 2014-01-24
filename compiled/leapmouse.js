/* global Leap */
/* global jQuery */
(function() {
	'use strict';

	var defaults = {
		simMouseMove: true,
		simMouseOver: true,
		simMouseOut: true,
		simClick: true,
		clickModes: ['tap', 'keytap', 'hold', 'thumb'],
		clickHoldTime: 1000,
		enableGestures: true,
		leapLib: Leap,
		leapBounds: {top: 200, left: -150, bottom: 30, right: 150, back: -70, front: 50},
		screenBounds: null,
		pointerElt: null,
		cursorHtml: '<div class="cursor"></div>',
		hoverClass: 'hover'
	};

	var s,
		leap,
		screenBounds,
		scrPos = {},
		lPos = {},
		lRot = {},
		$,
		$cursor,
		lastCursorTarget,
		paused;

	var init = function init( options ) {
		

		if (options && options.$) {
			$ = options.$;
		} else if (window.jQuery) {
			$ = jQuery;
		} else {
			throw 'jQuery must be loaded or $ alternative provided';
		}

		s = $.extend({}, defaults, options);

		$( document ).ready( function() {
			
			$cursor = $(s.cursorHtml);
			$( 'body' ).append($cursor);
			leap = new s.leapLib.Controller({enableGestures: s.enableGestures});
			leap.loop(leapLoop);
			setScreenBounds();
			$(window).on('resize', function() {
				if (!s.screenBounds) {
					setScreenBounds();
				}
			});
		});
	};

	var setScreenBounds = function setScreenBounds( bounds ) {
		var $w;
		if (!bounds) {
			$w = $(window);
			screenBounds = {
				top: 0,
				right: $w.width(),
				bottom: $w.height(),
				left: 0
			};
			s.screenBounds = null;
		} else {
			s.screenBounds = $.extend(s.screenBounds, bounds);
			screenBounds = s.screenBounds;
		}
	};

	var leapLoop = function leapLoop( frame ) {
		var i, len, g, pointable;

		pointable = frame.pointables[0];
		if (pointable) {
			lPos.x = (pointable.tipPosition[0]);
			lPos.y = (pointable.tipPosition[1]);
			lPos.z = (pointable.tipPosition[2]);
			lRot.x = (pointable.direction[1]);
			lRot.y = (pointable.direction[0]);
			lRot.z = (pointable.direction[2]);

			scrPos = leapToScreen(lPos.x, lPos.y);
			simulateMouseMove(scrPos.x, scrPos.y);
			drawCursor(scrPos.x, scrPos.y);
		}
		if (!paused) {
			for (i = 0, len = frame.gestures.length; i < len; ++i) {
				g = frame.gestures[i];
				if (g.type === 'screenTap' && pointable) {
					
					var tapPos = leapToScreen(g.position[0], g.position[1]);
					simulateClick(tapPos.x, tapPos.y);
				}
			}
		}
	};

	var drawCursor = function drawCursor(x, y) {
		if ( withinBounds( lPos, s.leapBounds ) ) {
			$cursor.show();
			$cursor.css('top', y);
			$cursor.css('left', x);
		} else {
			
			$cursor.hide();
		}
	};

	var withinBounds = function withinBounds( position, bounds, reverseY ) {
		var rv = true,
			pos = $.extend({}, position);

		if ( ( pos.x < bounds.left || pos.x > bounds.right ) ||
		     ( reverseY && ( pos.y < bounds.top || pos.y > bounds.bottom ) ) ||
		     ( pos.y < bounds.bottom || pos.y > bounds.top ) ||
		     ( !!pos.z && bounds.front && bounds.back && ( pos.z < bounds.back || pos.z > bounds.front ) ) ) {
			rv = false;
		}

		return rv;
	};

	var simulateClick = function simulateClick( x, y ) {
		var relX, relY, offset, target;
		
		target = document.elementFromPoint(x, y) || document;
		if (target) {
			var evt = document.createEvent('MouseEvents');
			relX = 0;
			relY = 0;
			offset = $(target).offset();
			if (offset) {
				relX = x - offset.left;
				relY = y - offset.top;
			}
			evt.initMouseEvent('click', true, true, window, 1, 0, 0, relX, relY, false, false, false, false, 0, null);
			target.dispatchEvent(evt);
		}
	};

	var simulateMouseMove = function simulateMouseMove( x, y ) {
		var relX, relY, outRelX, outRelY, offset, target = document.elementFromPoint(x, y);
		if (target) {
			var evt = document.createEvent('MouseEvents');
			relX = 0;
			relY = 0;
			offset = $(target).offset();
			if (offset) {
				relX = x - offset.left;
				relY = y - offset.top;
			}
			evt.initMouseEvent('mousemove', true, true, window, 1, 0, 0, relX, relY, false, false, false, false, 0, null);
			target.dispatchEvent(evt);
			if (target !== lastCursorTarget) {
				
				// mouseout
				offset = $(lastCursorTarget).offset();
				if (offset) {
					// console.log('$$OUT$$', lastCursorTarget)
					outRelX = x - offset.left;
					outRelY = y - offset.top;
					evt = document.createEvent('MouseEvents');
					evt.initMouseEvent('mouseout', true, true, window, 0, 0, 0, outRelX, outRelY, false, false, false, false, 0, null);
					lastCursorTarget.dispatchEvent(evt);
				}
				// mouseover
				evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('mouseover', true, true, window, 0, 0, 0, relX, relY, false, false, false, false, 0, null);
				target.dispatchEvent(evt);
			}
			lastCursorTarget = target;
		}
	};

	var leapToScreen = function leapToScreen( x, y ) {
		var screenX, screenY,
			screenWidth, screenHeight, screenRatio,
			leapWidth, leapHeight, leapRatio,
			xOffset = 0, yOffset = 0,
			conversionRatio;

		leapWidth = s.leapBounds.right - s.leapBounds.left;
		leapHeight = s.leapBounds.top - s.leapBounds.bottom;
		leapRatio = leapWidth / leapHeight;
		screenWidth = screenBounds.right - screenBounds.left;
		screenHeight = screenBounds.bottom - screenBounds.top;
		screenRatio = screenWidth / screenHeight;

		if (screenRatio > leapRatio) {
			conversionRatio = screenWidth / leapWidth;
			yOffset = ( leapHeight - ( leapWidth / screenRatio ) ) * 0.5;
		} else {
			conversionRatio = screenHeight / leapHeight;
			xOffset = ( leapWidth - ( leapHeight * screenRatio ) ) * 0.5;
		}
		screenX = ( ( x - s.leapBounds.left - xOffset) * conversionRatio ) + screenBounds.left;
		screenY = screenBounds.bottom - ( ( y - s.leapBounds.bottom - yOffset ) * conversionRatio );

		return {
			x: screenX,
			y: screenY
		};
	};

	var leapMouse = {
		defaults: defaults,
		init: init,
		setScreenBounds: setScreenBounds
	};

	window.leapMouse = leapMouse;

})();