import app from 'flarum/admin/app';

export { default as extend } from './extend';

app.initializers.add('<%= params.packageName %>', () => {
  console.log('[<%= params.packageName %>] Hello, admin!');
});
