import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import PageStructure from 'flarum/forum/components/PageStructure';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import listItems from 'flarum/common/helpers/listItems';
import ItemList from 'flarum/common/utils/ItemList';

export default class <%= className %> extends Page {
  loading = false;

  oninit(vnode) {
    super.oninit(vnode);

    const title = app.translator.trans('<%= extensionId %>.forum.<%= pathName %>.title', {}, true);

    app.setTitle(title);
    app.history.push('<%= pathName %>', title);
  }

  view() {
    return (
      <PageStructure
        className="<%= className %>"
        loading={this.loading}
        hero={this.hero.bind(this)}
        sidebar={() => <IndexSidebar />}
        // sidebar={this.sidebar.bind(this)}
      >
        {this.loading || (
          <div className="<%= className %>-content">
            {app.translator.trans('<%= extensionId %>.forum.<%= pathName %>.content')}
          </div>
        )}
      </PageStructure>
    );
  }

  hero() {
    return (
      <header className="Hero <%= className %>Hero">
        <div className="container">
          <div className="containerNarrow">
            <h1 className="Hero-title">
              {app.translator.trans('<%= extensionId %>.forum.<%= pathName %>.hero.title')}
            </h1>
            <div className="Hero-subtitle">
              {app.translator.trans('<%= extensionId %>.forum.<%= pathName %>.hero.subtitle')}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // sidebar() {
  //   return (
  //     <nav className="<%= className %>-nav">
  //       <ul>{listItems(this.sidebarItems().toArray())}</ul>
  //     </nav>
  //   );
  // }
  //
  // sidebarItems() {
  //   const items = new ItemList();
  //
  //   return items;
  // }
}
