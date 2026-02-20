// vue.config.js の例 (デフォルト設定の確認)
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // '@' が正しく 'src' に解決されているか確認
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  }
};
