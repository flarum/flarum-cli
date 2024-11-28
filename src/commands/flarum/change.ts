import { Command } from '@oclif/core';
import path from 'path';
import { PromptsIO } from 'boilersmith/io';
import { exit } from '@oclif/errors';
import { execSync } from 'child_process';
import chalk from 'chalk';

export default class Info extends Command {
  static description = 'Related Flarum version information.';

  /**
   * Should only need to keep two registered at all times.
   */
  static map: { cli: string | number; flarum: string | number }[] = [
    { cli: 3, flarum: 2 },
    { cli: 2, flarum: 1 },
  ];

  async run(): Promise<void> {
    const jsonPath = path.resolve(__dirname, '../../../package.json');
    const json = require(jsonPath);

    const currentFlarumVersion = Number(json.flarum.split('.')[0]);
    const currentCliVersion = Number(json.version.split('.')[0]);

    const other = Info.map.find((i) => i.cli !== currentCliVersion);

    if (!other) {
      this.error('No other versions to switch to.');
    }

    const otherCliVersion = other.cli;
    const otherFlarumVersion = other.flarum;

    const io = new PromptsIO({}, [], false, exit);

    const currentCli = chalk.bold.yellow(`CLI ${currentCliVersion}.x`);
    const currentFlarum = chalk.bold.green(`Flarum ${currentFlarumVersion}.x`);
    const otherCli = chalk.bold.yellow(`CLI ${otherCliVersion}.x`);
    const otherFlarum = chalk.bold.green(`Flarum ${otherFlarumVersion}.x`);

    // Show current versions
    this.log(`Currently using ${currentCli} compatible with ${currentFlarum}\n\n`);

    // confirm the switch to the other cli version
    const yes = await io.getParam({
      name: 'verify',
      type: 'confirm',
      message: `Switch to ${otherCli} compatible with ${otherFlarum}?`,
      initial: true,
    });

    if (!yes) {
      return;
    }

    // CLI v3 will have a fl2 bin
    // CLI v2 will have a fl1 bin
    // We need to replace the default fl bin with the now installed fl2 or fl1 bin
    const otherBin = `fl${otherFlarumVersion}`;
    let otherBinPath = this.binPath(otherBin);

    if (!otherBinPath) {
      this.install(otherCliVersion, otherFlarumVersion);
      otherBinPath = this.binPath(otherBin);

      if (!otherBinPath) {
        this.error('Could not install the other version.');
      }
    }

    const defaultBinPath = otherBinPath.split('/').slice(0, -1).join('/') + '/fl';

    if (!this.isWindows()) {
      // replace the default fl bin with the now installed fl2 or fl1 bin
      // the path to the fl bin is the same as the path to the fl2 or fl1 bin, just without the 2 or 1
      this.execRetryingAsSudo(`rm -f ${defaultBinPath}`);
      this.execRetryingAsSudo(`cp -P ${otherBinPath} ${defaultBinPath}`);
    } else {
      execSync(`del /F /Q ${defaultBinPath}`, { stdio: 'inherit' });
      execSync(`xcopy /B /Y ${otherBinPath} ${defaultBinPath}`, { stdio: 'inherit' });
    }
  }

  install(cli: number | string, flarum: number | string, sudo = false) {
    try {
      execSync((sudo ? 'sudo ' : '') + `npm install -g fl${flarum}@npm:@flarum/cli@${cli} --force`, { stdio: 'inherit' });
    } catch (error: any) {
      if (error.stderr && error.stderr.toString().includes('Permission denied') && !sudo && !this.isWindows()) {
        this.log(chalk.red('Permission denied. Running with sudo.'));
        this.install(cli, flarum, true);
      }
    }
  }

  isWindows() {
    return process.platform === 'win32';
  }

  binPath(bin: string): null | string {
    try {
      return this.isWindows() ? execSync('where ' + bin, { encoding: 'utf8' }).trim() : execSync('which ' + bin, { encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  }

  protected execRetryingAsSudo(command: string): void {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error: any) {
      if (error.stderr && error.stderr.toString().includes('Permission denied')) {
        this.log(chalk.red('Permission denied. Running with sudo.'));
        execSync('sudo ' + command, { stdio: 'inherit' });
      }
    }
  }
}
