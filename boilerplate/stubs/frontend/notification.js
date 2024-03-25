import app from 'flarum/forum/app';
import Notification from 'flarum/forum/components/Notification';

export default class <%= className %> extends Notification {
  icon() {
    // return 'fas fa-???';
  }

  href() {
    const notification = this.attrs.notification;

    // return ...;
  }

  content() {
    return app.translator.trans('<%= extensionId %>.forum.notifications.<%= type %>_text', { user: this.attrs.notification.fromUser() });
  }

  excerpt() {
    return null;
  }
}
