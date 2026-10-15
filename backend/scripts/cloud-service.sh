#!/bin/sh
# Dedicated PM2 home: never manages the teacher's other apps or ImperialWood.
set -eu
KripTop_directory=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
if [ "$KripTop_directory" != /app/std6730202025IPFinal2026 ]; then
  printf 'This service script is only for /app/std6730202025IPFinal2026.\n' >&2
  exit 1
fi
cd "$KripTop_directory"
export PM2_HOME="$KripTop_directory/.KripTop_runtime/pm2"
export PORT=3117
export HOST=0.0.0.0
export EMPLOYEE_STORAGE=mysql
KripTop_name=KripTop_HR_Std6730202025IPFinal2026
case "${1:-status}" in
  start|resurrect)
    if [ -n "$(ss -ltnH '( sport = :3117 )')" ]; then
      printf 'Port 3117 is occupied. No process was stopped or restarted.\n' >&2
      exit 1
    fi
    umask 077
    mkdir -p "$PM2_HOME"
    if [ "${1:-}" = resurrect ]; then
      pm2 resurrect
    else
      pm2 start src/server.js --name "$KripTop_name" --cwd "$KripTop_directory" --node-args='--env-file=.env' --instances 1 --time
    fi
    # Saves only this project's isolated PM2 process list, not shared services.
    pm2 save
    ;;
  status) pm2 status ;;
  logs) pm2 logs "$KripTop_name" --lines 30 --nostream ;;
  *) printf 'Use start, resurrect, status or logs.\n' >&2; exit 1 ;;
esac
