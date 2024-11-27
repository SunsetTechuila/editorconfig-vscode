import {
	commands,
	DocumentSelector,
	ExtensionContext,
	languages,
	workspace,
} from 'vscode'
import {
	applyTextEditorOptions,
	fromEditorConfig,
	resolveCoreConfig,
	resolveTextEditorOptions,
	toEditorConfig,
	getEditorConfigUri,
} from './api'
import { generateEditorConfig } from './commands/generateEditorConfig'
import DocumentWatcher from './DocumentWatcher'
import EditorConfigCompletionProvider from './EditorConfigCompletionProvider'

/**
 * Main entry
 */
export async function activate(ctx: ExtensionContext) {
	ctx.subscriptions.push(new DocumentWatcher())

	// register .editorconfig file completion provider
	const editorConfigFileSelector: DocumentSelector = {
		language: 'editorconfig',
		pattern: '**/.editorconfig',
		scheme: 'file',
	}
	languages.registerCompletionItemProvider(
		editorConfigFileSelector,
		new EditorConfigCompletionProvider(),
	)

	// register an internal command used to automatically display IntelliSense
	// when editing a .editorconfig file
	commands.registerCommand('editorconfig._triggerSuggestAfterDelay', () => {
		setTimeout(() => {
			commands.executeCommand('editor.action.triggerSuggest')
		}, 100)
	})

	await updateShowMenuEntryContext()
	ctx.subscriptions.push(
		workspace.onDidCreateFiles(updateShowMenuEntryContext),
		workspace.onDidDeleteFiles(updateShowMenuEntryContext),
		workspace.onDidRenameFiles(updateShowMenuEntryContext),
	)

	// register a command handler to generate a .editorconfig file
	commands.registerCommand('EditorConfig.generate', generateEditorConfig)

	return {
		applyTextEditorOptions,
		fromEditorConfig,
		resolveCoreConfig,
		resolveTextEditorOptions,
		toEditorConfig,
	}
}

async function updateShowMenuEntryContext() {
	const workspaceUri =
		workspace.workspaceFolders && workspace.workspaceFolders[0].uri
	if (!workspaceUri) {
		setShowMenuEntryContext(false)
		return
	}

	try {
		if (await getEditorConfigUri(workspaceUri)) {
			setShowMenuEntryContext(false)
		} else {
			setShowMenuEntryContext(true)
		}
	} catch {
		setShowMenuEntryContext(false)
	}
}

function setShowMenuEntryContext(value: boolean) {
	commands.executeCommand('setContext', 'editorconfig.showMenuEntry', value)
}
