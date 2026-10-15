#!/bin/sh
# Read-only inventory. Does not install, create directories, start services or read secrets.
printf '\n--- Account and directories ---\n'
id -un
pwd
printf 'Home: %s\n' "$HOME"
for KripTop_directory in /app "$HOME" "$HOME/Std0202025IPFinal2026" "$HOME/Std0202025IPFinal2026/backend"; do
  if [ -d "$KripTop_directory" ]; then
    ls -ld "$KripTop_directory"
    if [ -w "$KripTop_directory" ]; then printf 'Writable by this account\n'; else printf 'Not writable by this account\n'; fi
  else
    printf 'Does not exist or is inaccessible: %s\n' "$KripTop_directory"
  fi
done
printf '\n--- Existing app directory names (no file contents) ---\n'
if [ -r /app ]; then ls -1 /app; fi
printf '\n--- Home deployment directory names ---\n'
find "$HOME" -mindepth 1 -maxdepth 2 -type d ! -name '.*' ! -path '*/.*' ! -path '*/node_modules*' 2>/dev/null | head -60
printf '\n--- Runtime versions ---\n'
if command -v node >/dev/null 2>&1; then node --version; else printf 'Node.js not on PATH\n'; fi
if command -v npm >/dev/null 2>&1; then npm --version; else printf 'npm not on PATH\n'; fi
printf '\n--- Current account processes (no command arguments) ---\n'
ps -u "$(id -u)" -o pid=,comm=,etime=
printf '\n--- Node process working directories (when permitted) ---\n'
for KripTop_pid in $(pgrep -u "$(id -u)" -x node 2>/dev/null); do
  printf 'PID %s: ' "$KripTop_pid"
  readlink "/proc/$KripTop_pid/cwd" 2>/dev/null || printf 'unavailable\n'
done
printf '\n--- Listening TCP ports (no process command arguments) ---\n'
if command -v ss >/dev/null 2>&1; then ss -ltn; elif command -v netstat >/dev/null 2>&1; then netstat -ltn; else printf 'No ss/netstat; ask the teacher for the assigned API port\n'; fi
printf '\nInspection complete. No services started or restarted. An unlisted port is not proof of permission or external reachability.\n'
