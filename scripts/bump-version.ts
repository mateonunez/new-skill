const [current, type] = process.argv.slice(2);

if (!current || !type) {
  console.error('Usage: bump-version.ts <current-version> <patch|minor|major>');
  process.exit(1);
}

const [major, minor, patch] = current.split('.').map(Number);

let next: string;
switch (type) {
  case 'major':
    next = `${major + 1}.0.0`;
    break;
  case 'minor':
    next = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    next = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(next);
