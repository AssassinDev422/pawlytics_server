# run app.py when the container launches
#CMD ["python", "app.py"]

# to build it
# docker build -t nameofit


# to start this, in cur dir type
# expose machine's port 4000 to cintainer's EXPOSEd port 80
# docker run -p 4000:80 myubuntu

# with a datavolume, runs app.py using python
# docker run -d -P --name web -v /webapp training/webapp python app.py



# the base image to use
FROM ubuntu:xenial-20170710

WORKDIR /workspace
# copy working directory to /app
#WORKDIR ~/workspace

# copy the current directory contents into the container at /app
ADD . /ProWeb

#add volume, and I think it must exist but i'm not sure
VOLUME ~/testvolume


RUN apt-get update
# not sure if this is good/bad... assuming good
RUN apt-get -y upgrade
# -y means assume yes
RUN apt-get install -y python3-pip
RUN apt-get install -y build-essential libssl-dev libffi-dev python-dev
#install needed pip packages specified in requirements.txt
#RUN pip install -r requirements.txt
RUN apt-get -y install npm 
RUN apt-get -y install nodejs 
RUN apt-get -y install subversion

#make port 80 available to the world outside this container
EXPOSE 80

#define environment variable
ENV NAME World

CMD ["bash"]
