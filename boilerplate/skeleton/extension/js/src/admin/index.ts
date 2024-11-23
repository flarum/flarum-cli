import app from 'flarum/admin/app';

export { default as extend } from './extend';

app.initializers.add('<%= params.extensionId %>', () => {
  console.log('[<%= params.packageName %>] Hello, admin!');
});
