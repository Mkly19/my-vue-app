// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://api-developers.spinalcom.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
}

