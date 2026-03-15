import os from 'os';

export async function collectSystem() {
  return {
    os: process.platform,
    os_version: os.release(),
    arch: process.arch,
    hostname: os.hostname(),
    cpu_cores: os.cpus().length,
    memory_gb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    shell: process.env.SHELL ?? null,
  };
}