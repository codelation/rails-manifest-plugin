var md5 = require('md5');

function RailsManifestPlugin(options) {}

RailsManifestPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    var manifest = {
      assets:      {},
      files:       {},
      publicPath: '/assets/'
    };

    var basename;
    var pattern = /(.*)-\w+\.(\w+)$/g;
    for (var filename in compilation.assets) {
      basename = filename.replace(pattern,"$1.$2").split('/');
      basename = basename[basename.length - 1];
      manifest.assets[basename] = filename;
      manifest.files[filename] = {
        logical_path: basename
      };
    }

    var json = JSON.stringify(manifest);
    var manifestFilename = 'manifest-' + md5(json) + '.json';

    compilation.assets[manifestFilename] = {
      size: function() {
        return json.length;
      },

      source: function() {
        return json;
      }
    };

    callback();
  });
};

module.exports = RailsManifestPlugin;
