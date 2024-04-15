module.exports = {
	transform: {
	  '^.+\\.js$': 'babel-jest'
	},
	testEnvironment: 'node',
	collectCoverage: true,
	coverageThreshold: {
	  global: {
		statements: 70,
		branches: 50,
		functions: 70,
		lines: 70
	  }
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
  