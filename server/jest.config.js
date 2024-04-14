module.exports = {
	transform: {
	  '^.+\\.js$': 'babel-jest'
	},
	testEnvironment: 'node',
	collectCoverage: true, // This line enables coverage collection
	coverageThreshold: {  // Define minimum coverage thresholds
	  global: {
		statements: 70,
		branches: 50,
		functions: 70,
		lines: 70
	  }
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
  