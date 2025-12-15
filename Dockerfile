# Stage 1: Build React Frontend
FROM node:18-slim as build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Force rebuild of frontend
ARG CACHE_BUST=v12
COPY frontend/ .
RUN npm run build

# Stage 2: Python Backend
FROM python:3.9-slim

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Set up persistent data directory (as root)
ENV DATA_DIR=/data
RUN mkdir -p $DATA_DIR && chown -R user:user $DATA_DIR && chmod 777 $DATA_DIR

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=user . $HOME/app

# Force frontend rebuild
ARG CACHE_BUST=v2
COPY --from=build --chown=user /app/dist $HOME/app/frontend/dist

# Install requirements
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
