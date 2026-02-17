import chalk from 'chalk';

export function heading(text) {
  console.log(chalk.bold.cyan(`\n${text}\n`));
}

export function success(text) {
  console.log(chalk.green(`✓ ${text}`));
}

export function error(text) {
  console.error(chalk.red(`✗ ${text}`));
}

export function info(text) {
  console.log(chalk.gray(text));
}
