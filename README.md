## Overview ##
We're gonna use something called Webpack to help with development, deployment, and package management. All this heavily relies on Node.js, so if you don't have it download and install it [here](https://nodejs.org/en/). After that's installed your Terminal should have the command `npm` We'll use npm to install all the necessary things for development.

## Steps ##
1. Open a Terminal window
2. Install webpack: `npm install webpack -g`
3. Clone the repo: `git clone git@github.com:stevenacalhoun/energy-sight-vis.git` (if git isn't installed then install it first)
4. cd to the repository
5. Install all necessary packages for development: `npm install`
6. Run the webserver: `npm run dev`
7. This should spit out a bunch of stuff then say `webpack: bundle is now VALID`
8. Go to your browser and go to the URL localhost:8080, you should be presented with a page that has the title "Energy Sight"

### Why? ###
So the cool thing about webpack is that it allows use to use cool things like Sass, robust Javascript packages, livereload, etc. If you don't know what any of those are, they are all good things. This stuff is pretty cool and is the latest stuff in the web dev world, I think it will be cool.

I have no idea what your backgrounds are when it comes to web dev so if this readme sounds condescending I'm sorry D:

Let me know if you have any issues, I'd be happy to help. Email me or just drop a message in Slack.

-Steven

## Deployment ##
Deployment is done through npm as well. To deploy simply run `npm deploy`. This builds the project then pushes the built code to the gh-pages branch of our repo. By pushing to this branch GitHub pages will automatically serve the website. To view the deployed project go [here](https://github.com/pages/stevenacalhoun/energy-sight-vis)
