module.exports = {
  apps: [
    {
      name: 'marketcompare-staging',
      script: 'dist/src/main.js',
      cwd: '/home/codefate/marketcompare/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'staging',
      },
      error_file: '/home/codefate/logs/marketcompare-error.log',
      out_file: '/home/codefate/logs/marketcompare-out.log',
      time: true,
    },
  ],
};