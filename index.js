const puppeteer = require('puppeteer');
const ora = require('ora');
const spinner = ora('Loading headless window').start();

const URL = '';
const QUERYSELECTOR = '';
const HEIGHT_RATIO = .5;


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);

  const MAX_VIEWPORT_WIDTH = 1200;
  let vw = 1;
  let results = [];
  let lines = [];

  // Start resizing the window
  for (; vw < MAX_VIEWPORT_WIDTH; ++vw) {
    await page.setViewport({ 
      width: vw,
      height: 500
    });

    // get element width
    const w = await page.evaluate(() => {
      const $el = document.querySelector(QUERYSELECTOR);
      return $el.getBoundingClientRect().width;
    });

    spinner.text = 'Resizing window {' + vw +'px}';

    results.push({
      vw: vw,
      w: w
    });

    let prevResult = results[results.length - 2];
    let currentResult = results[results.length - 1];

    if (prevResult) {
      if (currentResult.w < prevResult.w) {
        lines.push({
          vw: vw,
          low: w,
          high: null
        });
      }
    }

    if (lines.length) {
      lines[lines.length - 1].high = w;
    }
  }

  // shut down
  await browser.close();
  spinner.succeed();

  // generate srcset
  var srcset = lines.map((line) => {
    return `<source srcset="https://assets.imgix.net/examples/kingfisher.jpg?usm=20&auto=format%2Cenhance&fit=crop&w=${line.high}&h=${line.high * HEIGHT_RATIO}" media="(min-width: ${line.vw}px)">`;
  });

  console.log(srcset);
})();