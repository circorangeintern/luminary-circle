module.exports = {
  apps: [
    {
      name: 'marketcompare-staging',
      script: 'dist/src/main.js',   // your build path (sourceRoot is src)
      cwd: '/home/codefate/marketcompare/backend',
      instances: 1,
      exec_mode: 'fork',            // single instance; 'cluster' would need shared state
      autorestart: true,
      max_memory_restart: '400M',   // Hetzner box has limits; restart if it balloons
      env: {
        NODE_ENV: 'staging',
      },
      // Reads backend/.env at runtime via your ConfigModule, so secrets
      // stay OUT of this committed file. This env block is only for values
      // safe to commit.
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true,                   // timestamps in logs
    },
  ],
};