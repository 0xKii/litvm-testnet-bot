#!/bin/bash
# LitVM Testnet Bot - 24/7 Runner with Auto-Restart
# Run in background: nohup bash run-24h.sh &

cd "$(dirname "$0")"

LOG_FILE="logs/24h-runner.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting 24/7 LitVM bot..." | tee -a "$LOG_FILE"

while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting bot loop..." | tee -a "$LOG_FILE"
    
    npm start loop >> "$LOG_FILE" 2>&1
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -ne 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Bot crashed with exit code $EXIT_CODE" | tee -a "$LOG_FILE"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restarting in 60 seconds..." | tee -a "$LOG_FILE"
        sleep 60
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Bot stopped normally" | tee -a "$LOG_FILE"
        break
    fi
done
