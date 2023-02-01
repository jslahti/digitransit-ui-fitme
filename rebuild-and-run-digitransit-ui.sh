#!/bin/bash
LOGFILE="/home/openuser/log/log.log"
ScriptDirectory="/home/openuser/scripts/"

cd $ScriptDirectory

/bin/bash /home/openuser/scripts/build-dt.sh

echo "$(date "+%m%d%Y %T") : build script done"

/bin/bash /home/openuser/scripts/run-dt.sh

echo "$(date "+%m%d%Y %T") : run script done"

echo "$(date "+%m%d%Y %T") : All ok"



