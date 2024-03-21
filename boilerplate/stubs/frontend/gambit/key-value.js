import app from 'flarum/<%= frontend %>/app';
import { KeyValueGambit } from 'flarum/common/query/IGambit';

export default class <%= className %> extends KeyValueGambit {
  key() {
    return app.translator.trans('<%= extensionId %>.lib.gambits.<%= filterKey %>.key', {}, true);
  }

  hint() {
    return app.translator.trans('<%= extensionId %>.lib.gambits.<%= filterKey %>.hint', {}, true);
  }

  filterKey() {
    return '<%= filterKey %>';
  }
}
