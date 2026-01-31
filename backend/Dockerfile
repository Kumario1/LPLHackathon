# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the file from your host to your current location.
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We also install psycopg2-binary in case you switch to Postgres later
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2-binary

# Copy the rest of the application
COPY . .

# Copy the local SQLite database if you want to seed it with current data
# Note: In a cloud container, this file will be ephemeral (changes lost on restart)
# unless you mount a volume or switch to an external DB like RDS.
# COPY transition_os.db .  <-- This would need to be passed in or generated inside. Commenting out for now.

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run app.py when the container launches
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
