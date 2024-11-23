import app from 'flarum/common/app';

app.initializers.add('<%= params.extensionId %>-common', () => {
  console.log('[<%= params.packageName %>] Hello, forum and admin!');
});
