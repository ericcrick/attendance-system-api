@echo off
REM python-services/digitalpersona/start.bat

echo Starting DigitalPersona Fingerprint Service...

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start the service
python digitalpersona_service.py

pause