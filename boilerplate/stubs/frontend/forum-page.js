import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import PageStructure from 'flarum/forum/components/PageStructure';

export default class <%= className %> extends Page {
  loading = false;

  oninit(vnode) {
    super.oninit(vnode);

    const title = app.translator.trans('<%= extensionId %>.forum.<%= pathName %>.title');

    app.setTitle(title);
    app.history.push('<%= pathName %>', title);
  }

  view() {
    return (
      <PageStructure
        className="<%= className %>"
        loading={this.loading}
        hero={this.hero.bind(this)}
        sidebar={this.sidebar.bind(this)}
      >
        {this.loading || (
          <div className="<%= className %>-content">
            Hello, world!
          </div>
        )}
      </PageStructure>
    );
  }

  hero(): Mithril.Children {
    return (
      <header className="Hero <%= className %>Hero">
        <div className="container">
          <div className="containerNarrow">
            <h1 className="Hero-title">
              <%= className %> Hero
            </h1>
            <div className="Hero-subtitle">
              <%= className %> Hero subtitle
            </div>
          </div>
        </div>
      </header>
    );
  }

  sidebar(): Mithril.Children {
    return (
      <nav className="<%= className %>-nav">
        <ul>{listItems(this.sidebarItems().toArray())}</ul>
      </nav>
    );
  }

  sidebarItems() {
    const items = new ItemList();

    return items;
  }
}
