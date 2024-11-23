import ejs from "ejs";
import {BaseUpgradeStep, GitCommit, Replacement} from "../base";

export default class EmailViews extends BaseUpgradeStep {
  type = 'Email notifications now require both Plain Text and HTML views.';

  protected collected: {
    [file: string]: {
      html: string;
      text: string;
    }
  } = {};

  protected templates = {
    html: '/../../../../../boilerplate/stubs/views/email/html/notification.blade.php',
    text: '/../../../../../boilerplate/stubs/views/email/plain/notification.blade.php',
  };

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      async (file, code) => {
        if (! code.includes('MailableInterface')) {
          return null;
        }

        const output = this.php!.run('upgrade.2-0.email-views', { file, code });

        this.collected[file] = output.collected;

        return {
          updated: output.code
        }
      },
      async (file, code) => {
        if (Object.keys(this.collected).length === 0) return null;

        const fileName = file.split('/').pop();
        const newFiles: any[] = [];

        Object.keys(this.collected).forEach((classFile) => {
          if (! this.collected[classFile]) {
            return;
          }

          if (! this.collected[classFile].html && ! this.collected[classFile].text) {
            return;
          }

          // if there is a text view but no html view, use the same content for both.
          // same for html view but no text view.

          ['text', 'html'].forEach((view) => {
            const viewType = view as 'html' | 'text';
            const viewPath = this.collected[classFile][viewType] || this.collected[classFile][viewType === 'html' ? 'text' : 'html'];
            const viewFileName = viewPath.split('::')[1].split('.').pop();

            if (fileName === `${viewFileName}.blade.php`) {
              const templateContent = this.fsEditor!.read(__dirname + this.templates[viewType]);
              const viewTypePath = viewType === 'text' ? 'plain' : 'html';
              newFiles.push({
                path: file.split('/views/')[0] + '/views/email/' + viewTypePath + '/' + viewFileName + '.blade.php',
                code: ejs.render(templateContent, { content: code.trimEnd() }),
              });
            }
          });
        });

        return {
          updated: code,
          delete: newFiles.length > 0,
          newFiles,
        };
      },
    ];
  }

  targets(): string[] {
    return [
      'src/**/*',
      'views/**/*.blade.php',
      'resources/views/**/*.blade.php',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): notification emails now require both plain text and HTML views',
      description: 'You now need to provide both plain text and HTML views for notification emails.'
    };
  }

  pauseMessage(): string {
    return `Flarum 2.0 requires both plain text and HTML views for notification emails.
                     The upgrader has attempted to convert your email views to include both.
                     Please review the changes and ensure that both views are present. Then proceed.`;
  }
}
