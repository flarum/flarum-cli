import {Command} from "@oclif/core";
import path from "path";

export default class Info extends Command {
  static description = 'Related Flarum version information.';

  async run(): Promise<void> {
    const jsonPath = path.resolve(__dirname, '../../../package.json');
    const json = require(jsonPath);
    const flarumVersion = json.flarum;
    const cliVersion = json.version;

    this.log(`Flarum version: ${flarumVersion}`);
    this.log(`CLI version: ${cliVersion}`);
  }
}
