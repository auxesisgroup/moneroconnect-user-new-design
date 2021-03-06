/* ---- particles.js config ---- */
/*!
 * A lightweight, dependency-free and responsive javascript plugin for particle backgrounds.
 *
 * @author Marc Bruederlin <hello@marcbruederlin.com>
 * @version 2.1.0
 * @license MIT
 * @see https://github.com/marcbruederlin/particles.js
 */
var Particles=function(t,e){"use strict";function n(t,e){return t.x<e.x?-1:t.x>e.x?1:t.y<e.y?-1:t.y>e.y?1:0}var i,o={};return i=function(){return function(){var t=this;t.defaults={responsive:null,selector:null,maxParticles:100,sizeVariations:3,showParticles:!0,speed:.5,color:"#000000",minDistance:120,connectParticles:!1},t.element=null,t.context=null,t.ratio=null,t.breakpoints=[],t.activeBreakpoint=null,t.breakpointSettings=[],t.originalSettings=null,t.storage=[],t.usingPolyfill=!1}}(),i.prototype.init=function(t){var e=this;return e.options=e._extend(e.defaults,t),e.options.color=t.color?e._hex2rgb(t.color):e._hex2rgb(e.defaults.color),e.originalSettings=JSON.parse(JSON.stringify(e.options)),e._animate=e._animate.bind(e),e._initializeCanvas(),e._initializeEvents(),e._registerBreakpoints(),e._checkResponsive(),e._initializeStorage(),e._animate(),e},i.prototype._initializeCanvas=function(){var n,i,o=this;if(!o.options.selector)return console.warn("particles.js: No selector specified! Check https://github.com/marcbruederlin/particles.js#options"),!1;o.element=e.querySelector(o.options.selector),o.context=o.element.getContext("2d"),n=t.devicePixelRatio||1,i=o.context.webkitBackingStorePixelRatio||o.context.mozBackingStorePixelRatio||o.context.msBackingStorePixelRatio||o.context.oBackingStorePixelRatio||o.context.backingStorePixelRatio||1,o.ratio=n/i,o.element.width=o.element.offsetParent.clientWidth*o.ratio,"BODY"===o.element.offsetParent.nodeName?o.element.height=t.innerHeight*o.ratio:o.element.height=o.element.offsetParent.clientHeight*o.ratio,o.element.style.width="100%",o.element.style.height="100%",o.context.scale(o.ratio,o.ratio)},i.prototype._initializeEvents=function(){var e=this;t.addEventListener("resize",e._resize.bind(e),!1)},i.prototype._initializeStorage=function(){var t=this;t.storage=[];for(var e=t.options.maxParticles;e--;)t.storage.push(new o(t.context,t.options))},i.prototype._registerBreakpoints=function(){var t,e,n,i=this,o=i.options.responsive||null;if("object"==typeof o&&null!==o&&o.length){for(t in o)if(n=i.breakpoints.length-1,e=o[t].breakpoint,o.hasOwnProperty(t)){for(o[t].options.color&&(o[t].options.color=i._hex2rgb(o[t].options.color));n>=0;)i.breakpoints[n]&&i.breakpoints[n]===e&&i.breakpoints.splice(n,1),n--;i.breakpoints.push(e),i.breakpointSettings[e]=o[t].options}i.breakpoints.sort(function(t,e){return e-t})}},i.prototype._checkResponsive=function(){var e,n=this,i=!1,o=t.innerWidth;if(n.options.responsive&&n.options.responsive.length&&null!==n.options.responsive){i=null;for(e in n.breakpoints)n.breakpoints.hasOwnProperty(e)&&o<=n.breakpoints[e]&&(i=n.breakpoints[e]);null!==i?(n.activeBreakpoint=i,n.options=n._extend(n.options,n.breakpointSettings[i])):null!==n.activeBreakpoint&&(n.activeBreakpoint=null,i=null,n.options=n._extend(n.options,n.originalSettings))}},i.prototype._refresh=function(){var t=this;t._initializeStorage(),t._draw()},i.prototype._resize=function(){var e=this;e.element.width=e.element.offsetParent.clientWidth*e.ratio,"BODY"===e.element.offsetParent.nodeName?e.element.height=t.innerHeight*e.ratio:e.element.height=e.element.offsetParent.clientHeight*e.ratio,e.context.scale(e.ratio,e.ratio),clearTimeout(e.windowDelay),e.windowDelay=t.setTimeout(function(){e._checkResponsive(),e._refresh()},50)},i.prototype._animate=function(){var e=this;e._draw(),e._animation=t.requestAnimFrame(e._animate)},i.prototype.resumeAnimation=function(){var t=this;t._animation||t._animate()},i.prototype.pauseAnimation=function(){var e=this;e._animation&&(e.usingPolyfill?t.clearTimeout(e._animation):(t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame)(e._animation),e._animation=null)},i.prototype._draw=function(){var e=this,i=e.element,o=i.offsetParent.clientWidth,r=i.offsetParent.clientHeight,a=e.options.showParticles,s=e.storage;"BODY"===i.offsetParent.nodeName&&(r=t.innerHeight),e.context.clearRect(0,0,i.width,i.height),e.context.beginPath(),e.context.fillStyle="rgb("+e.options.color.r+", "+e.options.color.g+", "+e.options.color.b+")";for(var l=s.length;l--;){var c=s[l];a&&c._draw(),c._updateCoordinates(o,r)}e.context.fill(),e.options.connectParticles&&(s.sort(n),e._updateEdges())},i.prototype._updateEdges=function(){for(var t=this,e=t.options.minDistance,n=t.options.color,i=Math.sqrt,o=Math.abs,r=t.storage,a=r.length,s="rgba("+n.r+","+n.g+","+n.b+",",l=0;l<a;l++)for(var c=r[l],p=l+1;p<a;p++){var u,f=r[p],h=c.x-f.x,m=c.y-f.y;if(u=i(h*h+m*m),o(h)>e)break;u<=e&&t._drawEdge(c,f,s+(1.2-u/e)+")")}},i.prototype._drawEdge=function(t,e,n){var i=this.context;i.beginPath(),i.strokeStyle=n,i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.closePath()},i.prototype._extend=function(t,e){return Object.keys(e).forEach(function(n){t[n]=e[n]}),t},i.prototype._hex2rgb=function(t){var e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null},o=function(n,i){var o=this,r=Math.random,a=i.speed;o.context=n,o.options=i;var s=e.querySelector(i.selector);o.x=r()*s.offsetParent.clientWidth,"BODY"===s.offsetParent.nodeName?o.y=r()*t.innerHeight:o.y=r()*s.offsetParent.clientHeight,o.vx=r()*a*2-a,o.vy=r()*a*2-a,o.radius=r()*r()*i.sizeVariations,o._draw()},o.prototype._draw=function(){var t=this;t.context.save(),t.context.translate(t.x,t.y),t.context.moveTo(0,0),t.context.arc(0,0,t.radius,0,2*Math.PI,!1),t.context.restore()},o.prototype._updateCoordinates=function(t,e){var n=this,i=n.x+this.vx,o=n.y+this.vy,r=n.radius;i+r>t?i=r:i-r<0&&(i=t-r),o+r>e?o=r:o-r<0&&(o=e-r),n.x=i,n.y=o},t.requestAnimFrame=function(){var e=this,n=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame;return n||(e._usingPolyfill=!0,function(e){return t.setTimeout(e,1e3/60)})}(),new i}(window,document);!function(){"use strict";"function"==typeof define&&define.amd?define("Particles",function(){return Particles}):"undefined"!=typeof module&&module.exports?module.exports=Particles:window.Particles=Particles}();
// particlesJS("particles-js", {
//   "particles": {
//     "number": {
//       "value": 80,
//       "density": {
//         "enable": true,
//         "value_area": 800
//       }
//     },
//     "color": {
//       "value": "#ffffff"
//     },
//     "shape": {
//       "type": "circle",
//       "stroke": {
//         "width": 0,
//         "color": "#000000"
//       },
//       "polygon": {
//         "nb_sides": 5
//       },
//       "image": {
//         "src": "img/github.svg",
//         "width": 100,
//         "height": 100
//       }
//     },
//     "opacity": {
//       "value": 0.5,
//       "random": false,
//       "anim": {
//         "enable": false,
//         "speed": 1,
//         "opacity_min": 0.1,
//         "sync": false
//       }
//     },
//     "size": {
//       "value": 3,
//       "random": true,
//       "anim": {
//         "enable": false,
//         "speed": 40,
//         "size_min": 0.1,
//         "sync": false
//       }
//     },
//     "line_linked": {
//       "enable": true,
//       "distance": 150,
//       "color": "#ffffff",
//       "opacity": 0.4,
//       "width": 1
//     },
//     "move": {
//       "enable": true,
//       "speed": 6,
//       "direction": "none",
//       "random": false,
//       "straight": false,
//       "out_mode": "out",
//       "bounce": false,
//       "attract": {
//         "enable": false,
//         "rotateX": 600,
//         "rotateY": 1200
//       }
//     }
//   },
//   "interactivity": {
//     "detect_on": "canvas",
//     "events": {
//       "onhover": {
//         "enable": true,
//         "mode": "grab"
//       },
//       "onclick": {
//         "enable": true,
//         "mode": "push"
//       },
//       "resize": true
//     },
//     "modes": {
//       "grab": {
//         "distance": 140,
//         "line_linked": {
//           "opacity": 1
//         }
//       },
//       "bubble": {
//         "distance": 400,
//         "size": 40,
//         "duration": 2,
//         "opacity": 8,
//         "speed": 3
//       },
//       "repulse": {
//         "distance": 200,
//         "duration": 0.4
//       },
//       "push": {
//         "particles_nb": 4
//       },
//       "remove": {
//         "particles_nb": 2
//       }
//     }
//   },
//   "retina_detect": true
// });