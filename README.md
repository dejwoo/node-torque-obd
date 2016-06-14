# node-torque-obd
Node based server for Torque mobile application
## Goal
Project was developed as course project for Ročníkový projekt(1). Project is a web application for gathering data from Torque Android app([Google Play](https://play.google.com/store/apps/details?id=org.prowl.torque)).
### Application
Application exposes API link for Torque to  report data through HTTP GET messages with queries from choosen sensors. After accepting message application resonds with "OK!" which is required by the Torque. The working reporting link is at the time for  Ročníkový projekt(1) sumbition here: http://dejwoo.com/torque/upload/.
By matching queries to torque keys application creates log which is consequently stored in MongoDB database. This logs can be used for data analytics and visualization.
### How-to
In Torque app settings under 'Data Logging & Upload' select what data do you wish to report. Then in Webserver URL set it to point to http://dejwoo.com/torque/upload/. Fill an email and lookout for spaces  as they will break HTTP GET query.( Own experience :) ). To start reporting go to main dashboard screen and in options choose "Start Logging" which will start sending data to the server. 
### Link
On this link working application can be found. The last reported data is displayed by websockets.
http://dejwoo.com/torque/
### Future Goals
Make this app a npm.js module.
