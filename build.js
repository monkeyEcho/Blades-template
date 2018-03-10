#!/usr/bin/env node
// Configuration
const config = {
	enableBabel: true, // change to false to disable babel
	pretty: false // change to true if you want to produce human-readable output
};

// Code below
const pug = require('pug'),
	fs = require('fs'),
	execSync = require('child_process').execSync,
	t0 = process.hrtime(),
	data = fs.readFileSync('Source/data.json', 'utf8');

const options = {
	data: JSON.parse(data),
	pretty: config.pretty,
	translation: JSON.parse(fs.readFileSync('translation.json', 'utf8')),
	workers: `\n"use strict";\n` +
		`const data = ${data.trim()};\n` +
		`${fs.readFileSync('Source/sheetworkers.js', 'utf8').trim()}\n`
};

// Handle presence/absence of babel
if (config.enableBabel && !config.pretty) {
	try {
		const babel = require('jstransformer')(require('jstransformer-babel'));
		options.workers = babel.render(options.workers, {presets: ['minify']}).body;
	} catch (err) {
		console.log('jstransformer or jstransformer-babel did not execute successfully. Proceeding without minifying sheet workers. Error message was:');
		console.log(err);
	}
}

// Build CSS file
const sassopts = '--default-encoding=UTF-8 --unix-newlines --sourcemap=none --no-cache --style ' + (config.pretty ? 'expanded' : 'compressed'),
	cssOutput = execSync(`scss ${sassopts} Source/blades.scss`, {encoding: 'utf8'}).replace(/^@charset "UTF-8";\s*/, '');
fs.writeFileSync('blades.css', cssOutput);

// Build HTML
const htmlOutput = pug.renderFile('Source/Blades.pug', options).trim().replace(/\n+/g, '\n');
fs.writeFileSync('blades.html', htmlOutput);

console.log(`Sheet build completed. Time taken: ${(process.hrtime(t0)[0] + (process.hrtime(t0)[1] / 1e9)).toFixed(3)} s.`);