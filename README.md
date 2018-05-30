## WebGME Power Domain

This repository contains the seeds and plugins for the WebGME power project.

The goal of the project is to develop a domain specific modeling language (DSML) to model power system models in WebGme platform and use the dedicated methods/plugins to transform these models according the input semantics of the required simulation platforms by performing error checking, constriant checking, type checking, etc. In addition the tool can be exentendible to perform the required analysis by integrating the simulation tools together within the WebGme platform. 

## Run as a standalone webgme app
Make sure the [dependencies for webgme](https://github.com/webgme/webgme/blob/master/README.md#dependencies) are installed.
 1. Clone this repository and from the root of the repo do:
 2. `npm install` - installs all dependencies
 3. `npm install webgme` - installs webgme (it's a [peer-dependency](https://nodejs.org/en/blog/npm/peer-dependencies/)).
 4. Launch a local mongodb instance (if not local edit the webgme config).
 5. `npm start`
 6. Visit localhost:8888 from a browser.
