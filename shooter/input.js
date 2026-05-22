const Input = (() => {
  const keys = {};
  let mouseX = 0, mouseY = 0;
  let mouseDown = false;
  let mouseClicked = false;
  let canvas = null;

  function init(c) {
    canvas = c;
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'Space' || ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseX = (e.clientX - rect.left) * scaleX;
      mouseY = (e.clientY - rect.top) * scaleY;
    });
    canvas.addEventListener('mousedown', e => { if (e.button === 0) mouseDown = true; });
    canvas.addEventListener('mouseup', e => { if (e.button === 0) mouseDown = false; });
    canvas.addEventListener('click', e => { if (e.button === 0) mouseClicked = true; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  function isDown(code) { return !!keys[code]; }
  function isMoving() {
    return isDown('ArrowUp') || isDown('ArrowDown') || isDown('ArrowLeft') || isDown('ArrowRight')
        || isDown('KeyW') || isDown('KeyS') || isDown('KeyA') || isDown('KeyD');
  }
  function consumeClick() { const c = mouseClicked; mouseClicked = false; return c; }

  return { init, isDown, isMoving, consumeClick,
    get mx() { return mouseX; },
    get my() { return mouseY; },
    get firing() { return mouseDown; },
  };
})();
