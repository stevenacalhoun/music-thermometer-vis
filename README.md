## Overview ##
We're gonna use something called Webpack to help with development, deployment, and package management. All this heavily relies on Node.js, so if you don't have it download and install it [here](https://nodejs.org/en/). After that's installed your Terminal should have the command `npm` We'll use npm to install all the necessary things for development.

## Steps ##
1. Open a Terminal window
2. Install webpack: `npm install webpack -g`
3. Clone the repo: `git clone git@github.com:stevenacalhoun/music-thermometer-vis.git` (if git isn't installed then install it first)
4. cd to the repository
5. Install all necessary packages for development: `npm install`
6. Run the webserver: `npm run dev`
7. This should spit out a bunch of stuff then say `webpack: bundle is now VALID`
8. Go to your browser and go to the URL localhost:8080, you should be presented with a page that has the title "Music Thermometer"

### Why? ###
So the cool thing about webpack is that it allows use to use cool things like Sass, robust Javascript packages, livereload, etc. If you don't know what any of those are, they are all good things. This stuff is pretty cool and is the latest stuff in the web dev world, I think it will be cool.

I have no idea what your backgrounds are when it comes to web dev so if this readme sounds condescending I'm sorry D:

Let me know if you have any issues, I'd be happy to help. Email me or just drop a message in Slack.

-Steven

## Deployment ##
Deployment is done through npm as well. To deploy simply run `npm deploy`. This builds the project then pushes the built code to the gh-pages branch of our repo. By pushing to this branch GitHub pages will automatically serve the website. To view the deployed project go [here](http://stevenacalhoun.github.io/music-thermometer-vis)

## GATech GitHub vs Public GitHub ##
I chose to post the repo on my personal GitHub account at github.com instead of GATech's private instance of GitHub at github.gatech.com. I'm not all that worried about people cheating, and that's the only benefit the GATech GitHub offers over the public GitHub. Projects are meant to be shared, and not everyone can access GATech's GitHub instance. It's also a pain to push to GATech's GitHub when you're not on campus. I hope no one has an issue with this.

## Weird Side Effect ##
We're actually hosting the site on GitHub through something called GitHub Pages. It's super slick and free. I host my personal website on GH Pages. Because I do that, it causes the URL for this site to be redirected from "http://stevenacalhoun.github.io/music-thermometer-vis" to "http://stevenacalhoun.me/music-thermometer-vis/" which I don't like. May or may not be fixable, not sure yet.
