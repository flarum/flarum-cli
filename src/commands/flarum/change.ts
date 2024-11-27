import { Command } from '@oclif/core';
import path from 'path';
import { PromptsIO } from 'boilersmith/io';
import { exit } from '@oclif/errors';
import { execSync, exec } from 'child_process';
import util from 'util';
import chalk from 'chalk';

const execAsync = util.promisify(exec);

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
      const which = execSync('which ' + otherBin, { encoding: 'utf8' }).trim();
      // replace the default fl bin with the now installed fl2 or fl1 bin
      // the path to the fl bin is the same as the path to the fl2 or fl1 bin, just without the 2 or 1
      this.execRetryingAsSudo(`ln -sf ${which} ${defaultBinPath}`);
    } else {
      const where = execSync('where ' + otherBin, { encoding: 'utf8' }).trim();
      execSync(`mklink /H C:\\Windows\\System32\\fl.exe ${where}`, { stdio: 'inherit' });
    }
  }

  install(cli: number | string, flarum: number | string, sudo = false) {
    execAsync((sudo ? 'sudo ' : '') + `npm install -g fl${flarum}@npm:@flarum/cli@${cli} --force`).then(({ stdout }) => {
      if (stdout && stdout.toString().includes('Permission denied') && !sudo && !this.isWindows()) {
        this.log(chalk.red('Permission denied. Running with sudo.'));
        this.install(cli, flarum, true);
      }
    });
  }

  isWindows() {
    return process.platform === 'win32';
  }

  binPath(bin: string): null | string {
    const result = this.isWindows() ? execSync('where ' + bin, { encoding: 'utf8' }).trim() : execSync('which ' + bin, { encoding: 'utf8' }).trim();

    this.log(result);

    return result || null;
  }

  protected execRetryingAsSudo(command: string): void {
    execAsync(command).catch(({ stderr }) => {
      if (stderr && stderr.toString().includes('Permission denied')) {
        this.log(chalk.red('Permission denied. Running with sudo.'));
        execSync('sudo ' + command, { stdio: 'inherit' });
      }
    });
  }
}
