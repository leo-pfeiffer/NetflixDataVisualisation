Our visualisation is hosted on the following URLs:

https://ljp9.host.cs.st-andrews.ac.uk/cs5044-p2
https://gasj1.host.cs.st-andrews.ac.uk/D3/gitcode/CS5044-Practical2-master

The visualisations can be viewed on these hosts or alternatively by hosting this project folder. Hosting is
required (as opposed to just opening the HTML file) as we're using ES modules.

Our project contains the following files and folders:

- index.html : HTML file to view the web page; imports all required JS files as modules as well as the stylesheet.

- js
  - bar.js : JavaScript code to produce the bar chart
  - map.js : JavaScript code to produce the map
  - streamgraph.js : JavaScript code to produce the stream graph
  - utils.js : Utility functions that are used across files

- css
  - style.css : Stylesheet for the web page

- data
  - geo.csv : CSV file containing the coordinates for countries
  - netflix_clean.csv : The working data set
  - netflix_titles.csv : The uncleaned data set from Kaggle
  - prep.R : R-Script used for data cleaning (takes netflix_titles.csv and outputs netflix_clean.csv)

- media
  - bar-video.mp4 : Demo video for the bar chart
  - map-video.mp4 : Demo video for the map
  - streamgraph-video.mp4 : Demo video for the streamgraph