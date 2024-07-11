import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import Dependencies from "../../steps/upgrade/twopointoh/dependencies";
import Infrastructure from "../../steps/upgrade/twopointoh/infra";
import ImportExt from "../../steps/upgrade/twopointoh/frontend/export-registry/import-ext";
import Compat from "../../steps/upgrade/twopointoh/frontend/export-registry/compat";
import ExtendLazyModules from "../../steps/upgrade/twopointoh/frontend/code-splitting/extend-lazy-modules";
import Misc from "../../steps/upgrade/twopointoh/frontend/misc";
import FormatCode from "../../steps/upgrade/twopointoh/frontend/format";
import {UpdateJSImports} from "../../steps/update/js-imports";

export default class TwoPointOh extends BaseCommand {
  static description = 'Upgrade an extension to Flarum 2.0';

  static flags = {
    ...BaseCommand.flags,
  };

  static args = [...BaseCommand.args];

  protected requireExistingExtension = false;

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    Error.stackTraceLimit = Number.POSITIVE_INFINITY;

    return stepManager
      .step(new FormatCode(this))
      .step(new Dependencies(this))
      .step(new Infrastructure(this))
      .step(new Compat(this))
      .step(new ImportExt(this))
      .step(new ExtendLazyModules(this))
      .step(new Misc(this));
  }

  protected welcomeMessage(): string {
    return `
    Welcome to the Flarum 2.0 upgrade process. This command will attempt to upgrade your extension code to be compatible with Flarum 2.0
    Make sure you have no current uncommitted changes. Each step will be committed to git, so you can easily revert if something goes wrong.
    Some changes cannot be made by the tool, so you may need to manually update your code. References to the Flarum 2.0 upgrade guide will be provided.
    `;
  }

  protected goodbyeMessage(): string {
    return `
    Your extension has been successfully upgraded to Flarum 2.0.
    You may need to make some manual changes to your code. Look for added @TODO comments in your code.
    Please refer to the Flarum 2.0 upgrade guide for more information.
    https://docs.flarum.org/extend/update-2_0
    `;
  }
}
