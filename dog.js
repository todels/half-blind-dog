(() => {
  const svg = document.getElementById('dog');
  const $ = id => document.getElementById(id);
  const el = {
    head: $('head'), ears: $('ears'), earShade: $('earShade'), face: $('face'),
    nose: $('nose'), eyeGood: $('eyeGood'), eyeBlind: $('eyeBlind'),
    body: $('body'), chest: $('chest'), neckShadow: $('neckShadow'),
  };
  const HEAD = { x: 192, y: 186 };   // head centre
  const NECK = { x: 192, y: 262 };   // pivot for the head tilt

  let target = null;
  const cur = { x: 0, y: 0, tilt: 0 };
  const blind = { x: 0, y: 0 };

  function toSvg(e) {
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  addEventListener('pointermove', e => { target = toSvg(e); });
  document.addEventListener('pointerleave', () => { target = null; });
  addEventListener('blur', () => { target = null; });

  const clamp = v => Math.max(-1, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const move = (node, x, y) => node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);

  function frame(t) {
    const s = t / 1000;
    // -1..1 in each direction, relative to the head
    let tx = Math.sin(s * 0.5) * 0.12, ty = Math.sin(s * 0.7) * 0.06;
    if (target) {
      tx = clamp((target.x - HEAD.x) / 220);
      ty = clamp((target.y - HEAD.y) / 220);
    }
    // his blind eye is on the viewer's left: he turns further and cocks his head there
    const blindSide = Math.max(0, -tx);
    cur.x = lerp(cur.x, tx * (1 + blindSide * 0.35), 0.1);
    cur.y = lerp(cur.y, ty, 0.1);
    cur.tilt = lerp(cur.tilt, tx * 3 - blindSide * 7, 0.07);

    const x = cur.x, y = cur.y;

    // layers closer to the viewer move further: ears < skull < face < nose
    el.head.setAttribute('transform',
      `translate(${(x * 7).toFixed(2)} ${(y * 5).toFixed(2)}) rotate(${cur.tilt.toFixed(2)} ${NECK.x} ${NECK.y})`);
    move(el.ears, -x * 5, -y * 4);
    move(el.earShade, -x * 5, -y * 4);
    move(el.face, x * 14, y * 5);
    move(el.nose, x * 6, y * 4);

    // good eye tracks; blind eye lags, moves less and drifts
    move(el.eyeGood, x * 4, y * 3);
    blind.x = lerp(blind.x, x * 1.5 + Math.sin(s * 0.8) * 1.5, 0.03);
    blind.y = lerp(blind.y, y * 1 + Math.cos(s * 0.6) * 1, 0.03);
    move(el.eyeBlind, blind.x, blind.y);

    // body follows a little
    move(el.body, x * 2, 0);
    move(el.chest, x * 6, 0);
    move(el.neckShadow, x * 8, y * 3);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // blink
  const eyes = document.querySelectorAll('.eye');
  (function blink() {
    eyes.forEach(e => e.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.1)' }, { transform: 'scaleY(1)' }],
      { duration: 180, easing: 'ease-in-out' }));
    setTimeout(blink, 2500 + Math.random() * 3500);
  })();
})();
