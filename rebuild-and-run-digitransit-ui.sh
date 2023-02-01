#!/bin/bash
LOGFILE="/home/fituser/logs/log.log"
ScriptDirectory="/home/fituser/digitransit-ui-fitme/"

cd $ScriptDirectory

/bin/bash /home/fituser/digitransit-ui-fitme/build-dt.sh

echo "$(date "+%m%d%Y %T") : build script done"

/bin/bash /home/fituser/digitransit-ui-fitme/run-dt.sh

echo "$(date "+%m%d%Y %T") : run script done"

echo "$(date "+%m%d%Y %T") : All ok"



