#!/bin/bash

# Stop and remove docker container
docker stop hitchcar
docker rm hitchcar

# Remove docker image
docker rmi dkpillo/we-hitchcar

# Start docker container from dockerhub image: dkpillo/we-hitchcar
docker run -d -p 8000:8000 --name hitchcar dkpillo/we-hitchcar

# Create superuser
docker exec -i -t hitchcar python manage.py createsuperuser
