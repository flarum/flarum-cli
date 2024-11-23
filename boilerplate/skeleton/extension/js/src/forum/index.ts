import app from 'flarum/forum/app';

export { default as extend } from './extend';

app.initializers.add('<%= params.extensionId %>', () => {
  console.log('[<%= params.packageName %>] Hello, forum!');
});
