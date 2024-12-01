const mochaOptions = {
	ui: 'tdd',
	color: true,
	timeout: 5000,
	reporter: undefined,
} as const

export async function run(): Promise<void> {
	return new Promise(async (resolve, reject) => {
		if (navigator) {
			try {
				// @ts-expect-error no types
				await import('mocha/mocha')

				mocha.setup(mochaOptions)

				mocha.run(failures => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`))
					} else {
						resolve()
					}
				})
			} catch (err) {
				reject(err)
			}
		} else {
			try {
				const Mocha = await import('mocha')
				const { glob } = await import('fast-glob')
				const path = await import('path')

				const mocha = new Mocha.default(mochaOptions)

				const files = await glob('./**/*.test.js', { cwd: __dirname })
				files.forEach(file => mocha.addFile(path.resolve(__dirname, file)))

				mocha.run(failures => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`))
					} else {
						resolve()
					}
				})
			} catch (err) {
				reject(err)
			}
		}
	})
}
