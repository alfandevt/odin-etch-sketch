const minimumGridSize = '8';
const maxGridSize = '96';
const stepSize = '8';
const defaultColor = '#000000';
const defaultBgColor = '#ffffff';

let gridSize = minimumGridSize;
let color = defaultColor;
let bgColor = defaultBgColor;
let randomMode = false;
let eraseMode = false;

let hasInit = false;

const boardEl = document.querySelector('#board');
const resetButtonEl = document.querySelector('#reset-button');
const eraseButtonEl = document.querySelector('#erase-button');
const randomButtonEl = document.querySelector('#random-button');
const sizeSliderEl = document.querySelector('#size-slider');
const sliderText = document.querySelector('#slider-text');
const colorPicker = document.querySelector('#color-picker');
const colorPickerBg = document.querySelector('#color-picker-bg');

const EVENTS = {
  RENDER: 'RENDER',
  POPUP: 'POPUP',
  ERROR: 'ERROR',
};

const MouseEvents = ['mousedown', 'mousemove'];
const TouchEvents = ['touchstart', 'touchmove'];

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
document.addEventListener(EVENTS.RENDER, onRender);

function onDOMContentLoaded() {
  document.dispatchEvent(new Event(EVENTS.RENDER));
}

function onRender() {
  if (hasInit == false) {
    initRender();
  }
  renderGrid();
}

function initRender() {
  sliderText.textContent = `${minimumGridSize} x ${minimumGridSize}`;

  sizeSliderEl.setAttribute('value', gridSize);
  sizeSliderEl.setAttribute('min', minimumGridSize);
  sizeSliderEl.setAttribute('max', maxGridSize);
  sizeSliderEl.setAttribute('step', stepSize);

  sizeSliderEl.addEventListener('input', (event) => {
    gridSize = event.target.value;
    sliderText.textContent = `${gridSize} x ${gridSize}`;
    document.dispatchEvent(new Event(EVENTS.RENDER));
  });

  colorPicker.setAttribute('value', defaultColor);
  colorPicker.addEventListener('input', (event) => {
    color = event.target.value;
  });

  colorPickerBg.setAttribute('value', defaultBgColor);
  colorPickerBg.addEventListener('input', (event) => {
    boardEl.style.background = event.target.value;
  });

  resetButtonEl.addEventListener('click', (event) => {
    gridSize = minimumGridSize;
    color = defaultColor;
    bgColor = defaultBgColor;
    randomMode = false;

    // sizeSliderEl.setAttribute('value', gridSize);
    sizeSliderEl.value = gridSize;
    colorPicker.value = color;
    colorPickerBg.value = bgColor;
    sliderText.textContent = `${gridSize} x ${gridSize}`;
    boardEl.style.background = bgColor;

    document.dispatchEvent(new Event(EVENTS.RENDER));
  });

  eraseButtonEl.addEventListener('click', (event) => {
    eraseMode = !eraseMode;
    randomMode = false;

    if (eraseMode) {
      eraseButtonEl.classList.add('active');
      randomButtonEl.classList.remove('active');
    } else {
      eraseButtonEl.classList.remove('active');
    }
  });

  randomButtonEl.addEventListener('click', (event) => {
    randomMode = !randomMode;
    eraseMode = false;

    if (randomMode) {
      randomButtonEl.classList.add('active');
      eraseButtonEl.classList.remove('active');
    } else {
      randomButtonEl.classList.remove('active');
    }
  });

  hasInit = true;
}

function renderGrid() {
  if (boardEl.hasChildNodes()) {
    boardEl.removeChild(boardEl.firstChild);
  }
  const gridEl = generateGrid(gridSize);
  boardEl.append(gridEl);
}

function generateGrid(size = 1) {
  if (size <= 0) {
    return null;
  }

  const gridContainerEl = document.createElement('div');
  gridContainerEl.classList.add('container');

  const gridSize = size;
  for (let i = 0; i < gridSize; i++) {
    const cellRowEl = document.createElement('div');
    cellRowEl.classList.add('cell-row');
    cellRowEl.setAttribute('id', 'cell-row-' + i);

    for (let j = 0; j < gridSize; j++) {
      const cellColEl = document.createElement('div');
      cellColEl.classList.add('cell-col');
      cellColEl.setAttribute('id', 'cell-col-' + i + j);

      MouseEvents.forEach((evn) => {
        cellColEl.addEventListener(evn, (event) => {
          event.preventDefault();
          if (event.buttons == 1) {
            if (randomMode) {
              cellColEl.style.background = getRandomHexColor();
              cellColEl.style.background = getRandomHexColor();
            } else if (eraseMode) {
              cellColEl.style.background = 'transparent';
            } else {
              cellColEl.style.background = color;
            }
          } else if (event.buttons == 2) {
            cellColEl.style.background = 'transparent';
          }
        });
      });

      TouchEvents.forEach((evn) => {
        cellColEl.addEventListener(evn, (event) => {
          event.preventDefault();
          const touch = event.touches[0];
          const cellCollElFromPoint = document.elementFromPoint(
            touch.clientX,
            touch.clientY
          );

          if (cellCollElFromPoint) {
            const isCellCol =
              cellCollElFromPoint.classList.contains('cell-col');
            if (isCellCol) {
              if (randomMode) {
                cellCollElFromPoint.style.background = getRandomHexColor();
                cellCollElFromPoint.style.background = getRandomHexColor();
              } else if (eraseMode) {
                cellCollElFromPoint.style.background = 'transparent';
              } else {
                cellCollElFromPoint.style.background = color;
              }
            }
          }
        });
      });

      cellColEl.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        return false;
      });

      cellRowEl.append(cellColEl);
    }
    gridContainerEl.append(cellRowEl);
  }
  return gridContainerEl;
}

function getRandomHexColor() {
  const colorNum = Math.round((Math.random() * 0xffffff) << 0).toString(16);
  return `#${colorNum}`;
}

function getElementXY(el) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY;
  return { x, y };
}
