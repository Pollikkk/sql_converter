module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'vue'],
  testMatch: [
    '**/tests/unit/**/*.spec.js', // Путь к тестам
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],  // Правильный импорт
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Преобразует @ в путь src
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/tests/unit/__mocks__/fileMock.js'
  },
   testEnvironmentOptions: {
       customExportConditions: ["node", "node-addons"],
  },
}
