"use strict";

function GameState(width, height)
{
	this.width = width;
	this.height = height;
	// this.buffer = new ArrayBuffer(Math.ceil((this.width * this.height) / 8));
	// this.view = new Int8Array(this.buffer);
	this.buffer = new Array(width * height);
}

GameState.prototype.isAlive = function(x, y)
{
	var offset = y * this.width + x;

	// return this.view[offset / 8 | 0] & (1 << offset % 8);
	return this.buffer[offset] == true;
}

GameState.prototype.setAlive = function(x, y, alive)
{
	var offset = y * this.width + x;

	// if (alive)
	// 	this.view[offset / 8 | 0] &= (1 << offset % 8);
	// else
	// 	this.view[offset / 8 | 0] ^= (1 << offset % 8);
	this.buffer[offset] = alive;
}

GameState.prototype.next = function()
{
	var w = this.width,
		h = this.height,
		diff = [];

	for (var i = 0; i < w; ++i)
	{
		for (var j = 0; j < h; ++j)
		{
			var n = 0;
			if (i>0 && j>0 && this.isAlive(i-1, j-1)) n++;
			if (       j>0 && this.isAlive(i  , j-1)) n++;
			if (i<w && j>0 && this.isAlive(i+1, j-1)) n++;
			if (i>0        && this.isAlive(i-1, j  )) n++;
			if (i<w        && this.isAlive(i+1, j  )) n++;
			if (i>0 && j<h && this.isAlive(i-1, j+1)) n++;
			if (       j<h && this.isAlive(i  , j+1)) n++;
			if (i<w && j<h && this.isAlive(i+1, j+1)) n++;

			var alive = (this.isAlive(i, j) && n == 2) || n == 3;

			if (this.isAlive(i, j) !== alive)
				diff.push({'x': i, 'y': j, 'alive': alive});
		}
	}

	return diff;
}

GameState.prototype.apply = function(diff)
{
	for (var i = 0; i < diff.length; ++i)
		this.setAlive(diff[i].x, diff[i].y, diff[i].alive);
}

GameState.prototype.randomize = function()
{
	for (var i = 0; i < this.width; ++i)
		for (var j = 0; j < this.height; ++j)
			this.setAlive(i, j, Math.random() > 0.8);
}

var state = null;

self.onmessage = function(event) {
	switch (event.data.command)
	{
		case 'next':
			var diff = state.next();
			self.postMessage({'type': 'diff', 'diff': diff});
			state.apply(diff);
			break;

		case 'set':
			state.buffer = event.data.buffer;
			break;

		case 'reset':
			state = new GameState(event.data.width, event.data.height);
			state.randomize();
			self.postMessage({'type': 'state', 'state': state});
			break;
	}
}
