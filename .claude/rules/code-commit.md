# Code Commit

Stage related files in small chunks after completing a task

## Commit Message

### Prefix

- build
- chore
- ci
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

### Message Example

```bash
# <prefix>: <message>

git commit -m "foo: some message" # fails(reason: no matched prefix)
git commit -m "Fix: some message" # fails(reason: prefix is lower case)
git commit -m ": some message"    # fails(reason: prefix empty)
git commit -m "fix:"              # fails(reason: message empty)
git commit -m "fix: SomeMessage"  # fails(reason: message is lower case)
git commit -m "fix: some message" # passes
```
