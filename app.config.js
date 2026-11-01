const { execSync } = require('node:child_process');

module.exports = ({ config }) => {
  let commitHash = process.env.EAS_BUILD_GIT_COMMIT_HASH?.trim();

  if (!commitHash) {
    try {
      commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      commitHash = 'desconhecido';
    }
  }

  return {
    ...config,
    extra: {
      ...(config.extra ?? {}),
      commitHash: commitHash || 'desconhecido',
      builtAt: new Date().toISOString(),
    },
  };
};
