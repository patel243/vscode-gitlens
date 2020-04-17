'use strict';
import { TextEditor, Uri } from 'vscode';
import { ActiveEditorCachedCommand, command, CommandContext, Commands, getCommandUri } from './common';
import { GitReference } from '../git/git';
import { executeGitCommand } from './gitCommands';
import { GitUri } from '../git/gitUri';

export interface ShowQuickBranchHistoryCommandArgs {
	repoPath?: string;
	branch?: string;
}

@command()
export class ShowQuickBranchHistoryCommand extends ActiveEditorCachedCommand {
	constructor() {
		super([Commands.ShowQuickBranchHistory, Commands.ShowQuickCurrentBranchHistory]);
	}

	protected preExecute(context: CommandContext, args?: ShowQuickBranchHistoryCommandArgs) {
		if (context.command === Commands.ShowQuickCurrentBranchHistory) {
			args = { ...args };
			args.branch = 'HEAD';
		}

		return this.execute(context.editor, context.uri, args);
	}

	async execute(editor?: TextEditor, uri?: Uri, args?: ShowQuickBranchHistoryCommandArgs) {
		uri = getCommandUri(uri, editor);

		const gitUri = uri && (await GitUri.fromUri(uri));

		const repoPath = args?.repoPath ?? gitUri?.repoPath;

		return executeGitCommand({
			command: 'log',
			state:
				repoPath != null
					? {
							repo: repoPath,
							reference:
								args?.branch != null
									? args.branch === 'HEAD'
										? 'HEAD'
										: GitReference.create(args.branch, repoPath, {
												refType: 'branch',
												name: args.branch,
												remote: false,
										  })
									: undefined,
					  }
					: {},
		});
	}
}
