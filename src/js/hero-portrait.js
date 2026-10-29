/* Animate the supplied artwork with a continuous depth warp. No altered asset
   or duplicated portrait is needed, and the original image is the fallback. */
(() => {
  const scene = document.querySelector('.hero-portrait');
  const source = document.querySelector('#portrait-source');
  const surface = document.querySelector('#portrait-canvas');
  const toggle = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gl = surface.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
      gl_Position = vec4(position, 0., 1.);
    }
  `;
  const fragment = `
    precision mediump float;
    uniform sampler2D artwork;
    uniform sampler2D depthMask;
    uniform vec2 drift;
    varying vec2 uv;
    void main() {
      float portrait = texture2D(depthMask, uv).r;
      // Buildings and portrait move in opposite directions. The lettering
      // stays anchored, with a soft transition so there are no cutout seams.
      float lettering = 1. - smoothstep(.55, .80, uv.y);
      float edge = smoothstep(0., .045, uv.x) * (1. - smoothstep(.955, 1., uv.x));
      edge *= smoothstep(0., .04, uv.y) * (1. - smoothstep(.95, 1., uv.y));
      vec2 offset = drift * mix(.8, -1., portrait) * lettering * edge;
      gl_FragColor = texture2D(artwork, uv - offset);
    }
  `;

  function compile(type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const drift = gl.getUniformLocation(program, 'drift');

  // A soft depth mask follows the hat, hair, and shoulders in Hero.png.
  // This is a runtime effect map; the supplied artwork is never rewritten.
  const depth = document.createElement('canvas');
  depth.width = 842;
  depth.height = 470;
  const context = depth.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0, 0, depth.width, depth.height);
  context.scale(.5, .5);
  context.filter = 'blur(12px)';
  context.fillStyle = 'white';
  context.beginPath();
  context.moveTo(578, 556);
  context.bezierCurveTo(588, 510, 624, 476, 659, 468);
  context.bezierCurveTo(577, 464, 596, 390, 628, 337);
  context.bezierCurveTo(616, 249, 640, 151, 740, 110);
  context.bezierCurveTo(833, 56, 965, 91, 997, 191);
  context.bezierCurveTo(1068, 219, 1078, 263, 1025, 280);
  context.bezierCurveTo(1047, 321, 1066, 394, 1031, 441);
  context.lineTo(997, 470);
  context.bezierCurveTo(1080, 487, 1093, 546, 1133, 650);
  context.lineTo(577, 650);
  context.closePath();
  context.fill();

  function texture(image, unit, name) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    const item = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, item);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, name), unit);
  }

  let ready = false;
  let visible = true;
  let lost = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  const isPaused = () => toggle.getAttribute('aria-pressed') === 'true';

  function render(time) {
    frame = 0;
    if (!ready || lost) return;
    const stopped = isPaused();
    const delta = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    if (!stopped) {
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 5);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
    }
    const still = preference.matches && stopped;
    const x = still ? 0 : Math.sin(elapsed * Math.PI / 6) * .010 + pointerX * .007;
    const y = still ? 0 : Math.sin(elapsed * Math.PI / 8) * .006 + pointerY * .004;
    gl.uniform2f(drift, x, y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    scene.classList.add('portrait-ready');
    if (!stopped && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    scene.classList.toggle('portrait-paused', isPaused());
    if (ready && !lost && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function resize() {
    const rect = surface.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    surface.width = Math.max(1, Math.round(rect.width * ratio));
    surface.height = Math.max(1, Math.round(rect.height * ratio));
    gl.viewport(0, 0, surface.width, surface.height);
    sync();
  }

  function initialize() {
    if (ready || !source.naturalWidth) return;
    texture(source, 0, 'artwork');
    texture(depth, 1, 'depthMask');
    ready = true;
    resize();
  }

  scene.addEventListener('pointermove', event => {
    if (!finePointer.matches || isPaused()) return;
    const rect = scene.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  scene.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  new MutationObserver(sync).observe(toggle, { attributes: true, attributeFilter: ['aria-pressed'] });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(scene);
  new ResizeObserver(resize).observe(scene);
  document.addEventListener('visibilitychange', sync);
  surface.addEventListener('webglcontextlost', () => {
    lost = true;
    if (frame) cancelAnimationFrame(frame);
    scene.classList.remove('portrait-ready');
  });
  source.addEventListener('load', initialize, { once: true });
  if (source.complete) initialize();
})();
