module.exports = {
  filenameHashing: false,
  css: {
    extract: false,
  },
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    devtool: 'source-map',
  },
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: process.env.VUE_APP_BUILD_MODE === '' ? true : false,
    },
  },
};
