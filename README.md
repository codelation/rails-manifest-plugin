# Rails Manifest Plugin

A [webpack](http://webpack.github.io) plugin for generating a Rails manifest.json file for the compiled assets.

## Installation

Install via [npm](https://www.npmjs.com):

```sh
$ npm install rails-manifest-plugin --save-dev
```

## Usage

Add to your production webpack config:

```js
var RailsManifestPlugin = require('rails-manifest-plugin');

{
  plugins: [
    new RailsManifestPlugin()
  ]
}
```

## Deploying to Heroku

We deploy almost all of our Rails apps to Heroku. Here's a glimpse at our setup:

**Buildpacks**

- heroku/nodejs
- heroku/ruby

**Webpack Config**

The file `config/webpack/production.js` contains our webpack config for production. MD5 hashes are
appended to all asset file names, which is why we need this plugin to generate the manifest.json file.

Much of the webpack config changes from one project to another, but pretty much all of our Rails
projects have this in common in the webpack production config files:

```js
var appRoot = require('app-root-path') + '';
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var RailsManifestPlugin = require('rails-manifest-plugin');

module.exports = {
  module: {
    loaders: [{
      test:    /\.(gif|png|jpe?g|svg)$/i,
      loaders: ['file?name=images/[name]-[hash].[ext]', 'image-webpack']
    }, {
      test:    /\.scss$/,
      loader:  ExtractTextPlugin.extract(['css?sourceMap', 'resolve-url', 'sass?sourceMap'])
    }]
  },

  output: {
    chunkFilename: 'javascripts/chunk.[id]-[hash].js',
    filename:      'javascripts/[name]-[hash].js',
    path:          path.join(appRoot, 'public', 'assets'),
    publicPath:    '/assets/'
  },

  plugins: [
    // Extract CSS to its own file(s)
    new ExtractTextPlugin('stylesheets/[name]-[hash].css'),

    // Create the manifest.json file so Rails can find the assets
    new RailsManifestPlugin()
  ],
};
```

**Build Script**

We add the Heroku `heroku-postbuild` script to our package.json file to compile all assets with
webpack and generate the manfest.json file. Heroku's Ruby buildpack will pick up the manfest.json
file and assume all assets have already been compiled.

```json
{
  "scripts": {
    "heroku-postbuild": "rm -rf public/assets && bower install && webpack --config config/webpack/production.js"
  }
}
```

**Heroku Config Variables**

We install all webpack packages as development dependencies in order to more easily keep track of our app's
depencencies, so we need Heroku's nodejs buildpack to install dev dependencies so webpack can compile the
assets. This is done by setting the config variable `NPM_CONFIG_PRODUCTION` to `false`.

```
NPM_CONFIG_PRODUCTION=false
```
