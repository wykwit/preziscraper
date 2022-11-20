#!/bin/env node

const fs = require('fs');

const argv = require('minimist')(process.argv.slice(2));
const puppeteer = require('puppeteer');

// args
var prezi = argv.url;
var chrome = ('chrome' in argv) ? argv.chrome : '/usr/bin/chromium';
var height = ('height' in argv) ? argv.height : 720;
var width = ('width' in argv) ? argv.width : 1280;
var wait = ('wait' in argv) ? argv.wait : 1200;
var out = ('out' in argv) ? argv.out : 'out';
if (!fs.existsSync(`./${out}`)) {
	fs.mkdirSync(`./${out}`);
}

const button = {
	start: '.viewer-common-info-overlay-button-icon',
	fullscreen: '.webgl-viewer-navbar-fullscreen-enter-icon',
	cookies: '.onetrust-close-btn-ui',
	next: '.webgl-viewer-navbar-next-icon',
	stop: '.webgl-viewer-navbar-ellipsis-icon',
}

async function main() {
	const browser = await puppeteer.launch({ executablePath: chrome, headless: false });
	const page = await browser.newPage();
	console.log('browser started...');

	await page.setViewport({
		width: width,
		height: height,
		deviceScaleFactor: 1,
	});
	console.log('viewport set...');

	await page.goto(prezi);
	console.log('prezi url loaded...');

	for (var label of ['start', 'cookies', 'fullscreen']) {
		await page.waitForSelector(button[label]);
		await page.click(button[label]);
		console.log(label + ' button clicked ...');
	}

	for (var i = 1; ; i++) {
		await page.mouse.move(100, 100);
		await page.waitForTimeout(wait);
		console.log(`loading slide ${i}...`)
		await page.screenshot({path: `${out}/prezi-${i}.png`});
		console.log('screenshot saved...')
		if (await page.$(button.stop) !== null) break;
		await page.waitForSelector(button.next);
		await page.click(button.next);
	}

	console.log('done...');
	await browser.close();
	console.log('browser closed...')
}

main();

