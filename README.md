# Web Engineering - Hitchcar

Hitchcar is a modern car-sharing application.

The project is developed with Python 3 and JavaScript and uses the following components:

* Backend (Python 3):
  * Django
  * Django Rest Framework
* Frontend (JavaScript):
  * AngularJS  
  * Bootstrap
  * FontAwesome
  * jQuery

A demo application can be found under [https://hitchcar.pillo.ch/](https://hitchcar.pillo.ch/)

* User: tester
* Password: hitchcar

## Database

The hitchcar application uses the built-in SQLite3 database.

The database is automatically generated when the migration script is executed.
    
## Setup

The hitchcar application can be started as docker container or directly with Python 3.

### Production

Building docker image and start as container:

    docker build -t hitchcar .
    docker run -d -p 8000:8000 --name hitchcar hitchcar
    docker exec -i -t hitchcar python manage.py migrate
    docker exec -i -t hitchcar python manage.py createsuperuser

Start container with prebuilt docker image from docker hub:

    docker run -d -p 8000:8000 --name hitchcar dkpillo/we-hitchcar
    docker exec -i -t hitchcar python manage.py migrate
    docker exec -i -t hitchcar python manage.py createsuperuser

Alternatively use bash script [./deployment/deploy.sh](https://github.com/DKPillo/we-hitchcar/blob/master/deployment/deploy.sh) 

### Development

Install dependencies and run django server application:

    pip install --no-cache-dir -r requirements.txt
    python manage.py migrate
    python manage.py createsuperuser 
    python manage.py runserver 8000