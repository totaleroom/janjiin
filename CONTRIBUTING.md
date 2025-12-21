# Contributing to Janjiin

Thank you for your interest in contributing to Janjiin! We welcome contributions from the community and appreciate your efforts to help improve this project. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Standards](#commit-standards)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to uphold a high standard of professional and respectful conduct. We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

### Expected Behavior

- Be respectful and inclusive in all interactions
- Provide constructive feedback and accept criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or intimidation of any kind
- Personal attacks or derogatory comments
- Unwelcome sexual attention or advances
- Trolling, insulting comments, or other disruptive behavior

Violations of the code of conduct may result in removal from the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Git
- Node.js (v14.0.0 or higher)
- npm or yarn package manager
- A GitHub account

### Fork and Clone

1. **Fork the repository** by clicking the "Fork" button on GitHub
2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/janjiin.git
   cd janjiin
   ```

3. **Add the upstream remote** to stay in sync with the main repository:
   ```bash
   git remote add upstream https://github.com/totaleroom/janjiin.git
   git fetch upstream
   ```

## Development Setup

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

2. **Create a `.env` file** (if needed) based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update with your local configuration values.

### Running the Project

**Development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run tests:**
```bash
npm test
```

**Run linter:**
```bash
npm run lint
```

**Format code:**
```bash
npm run format
```

### Project Structure

```
janjiin/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── styles/
│   └── index.js
├── tests/
├── public/
├── .github/
├── package.json
├── README.md
└── CONTRIBUTING.md
```

## Making Changes

### Create a Feature Branch

1. **Update your local repository:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a new branch** with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-description
   ```

### Branch Naming Conventions

Use the following prefixes for your branch names:

- `feature/` - For new features (e.g., `feature/add-dark-mode`)
- `fix/` - For bug fixes (e.g., `fix/navigation-bug`)
- `docs/` - For documentation updates (e.g., `docs/update-readme`)
- `refactor/` - For code refactoring (e.g., `refactor/optimize-queries`)
- `test/` - For adding or updating tests (e.g., `test/add-unit-tests`)
- `chore/` - For maintenance tasks (e.g., `chore/update-dependencies`)

### Code Style Guidelines

- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use camelCase for variables and functions, PascalCase for components and classes
- **Comments**: Write clear, concise comments for complex logic
- **Imports**: Organize imports alphabetically and by type
- **Line length**: Keep lines under 100 characters when possible

### Example Code Style

```javascript
// Good
function fetchUserData(userId) {
  // Implementation
}

const handleButtonClick = () => {
  // Implementation
};

// Bad
function fetch_user_data(userId) {
  // Implementation
}
```

## Commit Standards

### Commit Message Format

We follow the Conventional Commits specification. Use the following format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or tooling

### Scope

The scope specifies what section of the codebase is affected (optional but recommended):

- `auth` - Authentication related changes
- `api` - API related changes
- `ui` - User interface changes
- `database` - Database related changes
- etc.

### Subject

- Use the imperative mood ("add feature" not "added feature")
- Don't capitalize the first letter
- No period at the end
- Keep under 50 characters

### Body

- Use the imperative mood
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 72 characters
- Separate from subject with a blank line

### Footer

Reference any issues with `Closes #123` or `Fixes #456`

### Example Commits

**Good:**
```
feat(auth): add password reset functionality

Users can now reset their passwords via email.
An email with a reset link is sent to their registered
email address valid for 24 hours.

Closes #123
```

**Also Good:**
```
fix(navigation): prevent menu from closing on click
```

**Avoid:**
```
Updated stuff
```

## Pull Request Process

### Before Submitting

1. **Ensure your branch is up to date:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests locally:**
   ```bash
   npm test
   ```

3. **Run linter and format code:**
   ```bash
   npm run lint
   npm run format
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

### Creating a Pull Request

1. **Push your branch to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Go to the GitHub repository** and click "New Pull Request"

3. **Fill out the pull request template** with:
   - A clear, descriptive title
   - Description of changes made
   - Motivation and context
   - Types of changes (feature, bugfix, etc.)
   - Testing performed
   - Screenshots (if applicable)
   - Related issues

### PR Title Format

Use the same Conventional Commits format as your commit messages:

```
feat(scope): description
fix(scope): description
docs: description
```

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested this change

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing tests pass locally with my changes
```

### During Review

- Respond to feedback promptly and respectfully
- Make requested changes in new commits (don't force push during review)
- Keep discussions focused and constructive
- Be patient - reviewers are volunteers

### After Approval

- Ensure all CI/CD checks pass
- All requested changes must be completed before merging
- A maintainer will merge your PR

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test filename.test.js
```

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow the existing test structure and patterns
- Use the project's testing framework and conventions

Example test:

```javascript
describe('fetchUserData', () => {
  it('should return user data when given valid ID', async () => {
    const userId = '123';
    const result = await fetchUserData(userId);
    expect(result).toHaveProperty('id', userId);
  });

  it('should throw error when given invalid ID', async () => {
    expect(fetchUserData('invalid')).rejects.toThrow();
  });
});
```

## Documentation

- Update README.md if you add new features or change functionality
- Add JSDoc comments to functions and classes
- Update API documentation if applicable
- Create or update guides for new features
- Ensure examples in documentation are accurate and tested

### Documentation Format

```javascript
/**
 * Fetches user data from the API
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} User data object containing id, name, and email
 * @throws {Error} Throws error if user not found
 */
function fetchUserData(userId) {
  // Implementation
}
```

## Reporting Issues

### Before Reporting

- Check existing issues to avoid duplicates
- Try to reproduce the issue in a fresh environment
- Gather relevant information about your system

### Issue Template

When creating an issue, include:

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 11]
- Node version: [e.g., 14.0.0]
- npm/yarn version: [e.g., 6.0.0]

## Additional Context
Any other relevant information
```

## Tips for Successful Contributions

1. **Start small** - Begin with small fixes or documentation updates if you're new
2. **Communicate** - Discuss large changes in an issue before starting work
3. **Keep it focused** - One feature or fix per PR when possible
4. **Be patient** - Reviews take time; don't be discouraged
5. **Learn from feedback** - Use reviews as learning opportunities
6. **Help others** - Review and provide feedback to other contributors

## Questions?

- Check existing documentation and issues
- Open a discussion or question issue on GitHub
- Reach out to maintainers respectfully

## Recognition

Contributors who make significant improvements will be recognized in:
- The project's README
- Release notes
- GitHub's contributor graph

Thank you for contributing to Janjiin! 🎉
