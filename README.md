#leap-mouse-js
=============
> Converts leap actions into native mouse events in the browser

## Sample usage

The following is a minimal example to get a leap cursor working in the browser. Please see examples for details.

```javascript
leapMouse.init();
```
With options:
```javascript
leapMouse.init({
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
});
```
