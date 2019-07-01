Chicago Social Hub

By Aleem, Alisha(A20379905) and Balani,Monali(A20410147)


-------------------------------------------------------------------------------------------------------------
Total number of codes is approx. - 1500
-------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------
Installations
-------------------------------------------------------------------------------------------------------------

Angular 7
Node.js
Angular Comman Line Interface
PostgreSQL
ElasticSearch
Visual Studio


-------------------------------------------------------------------------------------------------------------
Steps to run the application
-------------------------------------------------------------------------------------------------------------

1. Download and unzip the compressed ChicagoSocialHub.zip folder. Save the folder in C:\tmp on your machine.

2. Open a Command Prompt window and set the current directory as "...\ElasticSearch\elasticsearch-6.6.1\bin".

3. Run the command "elasticsearch". This will set the elasticsearch server running on the system.

4. Open new Command Prompt window and set the current directory to "...\Logstash\Logstash-6.6.2\bin"

5. Run the command "logstash -f logstash.conf". This will set the logstash running on the system.

6. Run the python script "C:\tmp\ChicagoSocialHub\backend-build-yelp-reviews\ChicagpSocialHub-Yelp.ipynb" to fetch data for places.

7. Run the python script "C:\tmp\ChicagoSocialHub\backend-build-divvy-status\divvy_status_stations.ipynb" to populate PostgreSQL server with divvy stations status every 2 minutes. 

8. Run the python script "C:\tmp\ChicagoSocialHub\backend-build-divvy-status\divvy_stations_status_logs.py" to log periodic divvy stations status on ElasticSearch server.

9. Open new Command Prompt window and set the current directory to "C:\tmp\ChicagoSocialHub\backend"

10. Run the command "node server.js" to run the NodeJS server.

11. Open new Command Prompt window and set the current directory to "C:\tmp\ChicagoSocialHub\frontend"

12. Run the command "ng serve -o" to run the application.


-------------------------------------------------------------------------------------------------------------
About the app
-------------------------------------------------------------------------------------------------------------

The home page consists of 2 buttons

(i) Places - Lets you search for place by street name and/or zipcode
(ii) About this app

The Places button takes you to find component

(i) Search for place - Mandatory Field
(ii) Search by StreetName (and/or)
(iii) Search by ZipCode

Click the button "Go" for your results.

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
The list-of-places component displays all the list of places on the elasticsearch query

Features in this component:

Home- Takes you to the homepage
DivvyNear By - Takes you to the list-of-stations component
Find Another Place - Takes you to the find component where you can search for another place
Bar Chart - Displays the Ratings of listed Restaurants in a bar chart
Bar Review - Displays the Review Count of Listed Restaurants in a bar chart
Get My Current Location - This displays the current location marker in the agm-map
Map - Displays the list of Restaurants in agm-markers
Back - Takes you back to the previous page

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
The list-of-stations component displays 3 Divvy stations based on the selected place's latitude and longitude

Features in this component:

Home - Takes you to the homepage
Find Another Place - Takes you to the find component where you can search for another place
Stacked Bar - Displays the availableBikes and availableDocks of the listed stations in a stacked bar
Get My Current Location - This displays the current location marker in the agm-map
Map - Displays the list of Restaurants in agm-markers
Realtime Chart - Takes you to the realtimechart component
Line Chart - Takes you to the linechart component
Dashboard - Takes you to the Dashboard component
Back - Takes you back to the previous page

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
The realtimechart component displays real-time/log data for Divvy stations (hourly, daily, weekly) by line
charts with Simple Moving Averages (hourly and daily SMA) on the SAME chart

Features in this component:

Home - Takes you to the homepage
Select Another Station - Takes you to the list-of-stations component where you can click on another station
Time Range - Data for Past 1 hour, 24 hours and 7 days
SMA Checkboxes - lets you select SMA for 1 hour or 24 hours or both
Back - Takes you back to the previous page

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
The linechart component displays line real-time/log data for Divvy stations (hourly, daily, weekly) by line
chart

Features in this component:

Home - Takes you to the homepage
Select Another Station - Takes you to the list-of-stations component where you can click on another station
Time Range - Data for Past 1 hour, 24 hours and 7 days
Back - Takes you back to the previous page

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
The Dashboard component displays 3 Divvy stations based on selected place's latitude and longitude

Daily Status- 

Displays the daily average numbers of available docks for every dock station based on the user selection for
the past week, month and year
Added Loading feature until the data is retrieved from the elastic search server

Hourly Status-

Displays the hourly average numbers of available docks for every dock station based on the user selection
for the past week, month and year
Added Loading feature until the data is retrieved from the elastc search server






















