import app from 'flarum/<%= frontend %>/app';
import { BooleanGambit } from 'flarum/common/query/IGambit';

export default class <%= className %> extends BooleanGambit {
  key() {
    return app.translator.trans('<%= extensionId %>.lib.gambits.<%= filterKey %>.key', {}, true);
  }

  filterKey() {
    return '<%= filterKey %>';
  }
}
