import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import Dependencies from "../../steps/upgrade/twopointoh/dependencies";
import Infrastructure from "../../steps/upgrade/twopointoh/infra";
import ImportExt from "../../steps/upgrade/twopointoh/frontend/export-registry/import-ext";
import Compat from "../../steps/upgrade/twopointoh/frontend/export-registry/compat";
import UsageOfLazyModules from "../../steps/upgrade/twopointoh/frontend/code-splitting/usage-of-lazy-modules";
import MiscFrontendChanges from "../../steps/upgrade/twopointoh/frontend/misc";
import FormatCode from "../../steps/upgrade/twopointoh/frontend/format";
import chalk from "chalk";
import MiscBackendChanges from "../../steps/upgrade/twopointoh/backend/misc";
import Filesystem from "../../steps/upgrade/twopointoh/backend/filesystem";
import Mailer from "../../steps/upgrade/twopointoh/backend/mailer";

export default class TwoPointOh extends BaseCommand {
  static description = 'Upgrade an extension to Flarum 2.0';

  static flags = {
    ...BaseCommand.flags,
  };

  static args = [...BaseCommand.args];

  protected requireExistingExtension = false;

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    // Error.stackTraceLimit = Number.POSITIVE_INFINITY;

    return stepManager
      // Frontend
      .step(new FormatCode(this))
      .step(new Dependencies(this))
      .step(new Infrastructure(this))
      .step(new Compat(this))
      .step(new ImportExt(this))
      .step(new UsageOfLazyModules(this))
      .step(new MiscFrontendChanges(this))
      // Backend
      .step(new MiscBackendChanges(this))
      .step(new Filesystem(this))
      .step(new Mailer(this));
  }

  protected welcomeMessage(): string {
    return `
    Welcome to the Flarum 2.0 upgrade process. This command will attempt to upgrade your extension code to be compatible with Flarum 2.0
    Make sure you have no current uncommitted changes. Each step will be committed to git, so you can easily revert if something goes wrong.
    Some changes cannot be made by the tool, so you may need to manually update your code. References to the Flarum 2.0 upgrade guide will be provided.
    `;
  }

  protected goodbyeMessage(): string {
    const composer = chalk.bold.bgYellow('composer update');
    const yarn = chalk.bold.bgYellow('yarn install');

    return `
    Your extension has been successfully upgraded to Flarum 2.0.
    You may need to make some manual changes to your code. Look for added @TODO comments in your code.
    Please refer to the Flarum 2.0 upgrade guide for more information.
    https://docs.flarum.org/extend/update-2_0

    Make sure to run ${composer} and ${yarn} then test your extension to ensure everything is working as expected.
    `;
  }
}
