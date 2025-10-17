#!/bin/bash
# python-services/digitalpersona/start.sh

echo "Starting DigitalPersona Fingerprint Service..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start the service
python digitalpersona_service.py