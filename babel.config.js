module.exports = {
  presets: ['@babel/preset-env', '@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.js', '.vue'],
        alias: {
          '^app/(.+)': './src/\\1',
        },
      },
    ],
  ],
};
