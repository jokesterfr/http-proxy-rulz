http-proxy-rulz
===============

## TLTR

This is a [reverse proxy](http://en.wikipedia.org/wiki/Reverse_proxy), written in [nodejs](http://nodejs.org).
Proxying rules are stored in a *JSON* file.

## Description

Lately the [node-http-proxy](https://github.com/nodejitsu/node-http-proxy)
1.0.x version has been released.
Since then, the proxy rulz feature were removed from the API,
that's why comes *http-proxy-rulz*, to fill the lack.

This is only a slight wrapper over *node-http-proxy*, providing an easy-to-use
executable proxy file. The JSON file rulz are dynamically updated on file change.

Usage instructions are described below.

## Usage

	npm install http-proxy-rulz -g
	proxy-server examples/https-redirection.json

## Contributing

@TODO: grunt stuff

## Licence

The MIT License (MIT)

Copyright (c) 2014 Clément Désiles

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
