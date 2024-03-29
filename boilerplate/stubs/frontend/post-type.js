import EventPost from 'flarum/forum/components/EventPost';

export default class DiscussionStickiedPost extends EventPost {
  icon() {
    return 'fas fa-???';
  }

  descriptionKey() {
    const content = this.attrs.post.content();

    return '<%= extensionId %>.forum.post_stream.<%= postType %>_text';
  }
}
