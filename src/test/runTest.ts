import * as path from 'path'

import { runTests as runTestsDesktop } from '@vscode/test-electron'
import { runTests as runTestsWeb } from '@vscode/test-web'

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = {
			web: '.',
			desktop: path.resolve(__dirname, '../'),
		}

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = {
			web: 'out/test/suite/index',
			desktop: path.resolve(__dirname, './suite/index'),
		}

		// Run test using a specific workspace
		const untitledExtensionTestsPath = {
			web: 'out/test/untitled-suite/index',
			desktop: path.resolve(__dirname, './untitled-suite/index'),
		}

		const untitledWorkspace = {
			web: 'out/test/untitled-suite/fixtures/untitled',
			desktop: path.resolve(__dirname, './untitled-suite/fixtures/untitled'),
		}

		const browserType = 'chromium'

		// Download VS Code, unzip it and run the integration tests
		await Promise.allSettled([
			runTestsDesktop({
				extensionDevelopmentPath: extensionDevelopmentPath.desktop,
				extensionTestsPath: extensionTestsPath.desktop,
			}).then(() => {
				runTestsDesktop({
					extensionDevelopmentPath: extensionDevelopmentPath.desktop,
					extensionTestsPath: untitledExtensionTestsPath.desktop,
					launchArgs: [untitledWorkspace.desktop],
				})
			}),

			runTestsWeb({
				extensionDevelopmentPath: extensionDevelopmentPath.web,
				extensionTestsPath: extensionTestsPath.web,
				browserType,
			}).then(() => {
				runTestsWeb({
					extensionDevelopmentPath: extensionDevelopmentPath.web,
					browserType,
					extensionTestsPath: untitledExtensionTestsPath.web,
					folderPath: untitledWorkspace.web,
				})
			}),
		])
	} catch (err) {
		console.error('Failed to run tests')
		process.exit(1)
	}
}

main()
