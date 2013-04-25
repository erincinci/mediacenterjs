/*
	MediaCenterJS - A NodeJS based mediacenter solution
	
    Copyright (C) 2013 - Jan Smolders

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var express = require('express')
  , fs = require('fs');

module.exports = function(parent, options){
  var verbose = options.verbose;
  fs.readdirSync(__dirname + '/../apps').forEach(function(name){
    verbose && console.log('\n   %s:', name);
    var obj = require('./../apps/' + name)
      , name = obj.name || name
      , prefix = obj.prefix || ''
      , app = express()
      , method
      , path;

    // allow specifying the view engine
    if (obj.engine) app.set('view engine', obj.engine);
    app.set('views', __dirname + '/../apps/' + name + '/views');
	app.locals.pretty = true;
	
    // before middleware support
    if (obj.before) {
      path = '/' + name + '/:' + name + '_id';
      app.all(path, obj.before);
      verbose && console.log('     ALL %s -> before', path);
      path = '/' + name + '/:' + name + '_id/*';
      app.all(path, obj.before);
      verbose && console.log('     ALL %s -> before', path);
    }

    // generate routes based
    // on the exported methods
    for (var key in obj) {
      // "reserved" exports
      if (~['name', 'prefix', 'engine', 'before'].indexOf(key)) continue;
      // route exports
	  //TODO: Make this more dynamic by adding a array to the app file with possible routes
      switch (key) {	
        case 'show':
          method = 'get';
          path = '/' + name + '/:' + name + '_id';
          break;
        case 'play':
          method = 'get';
          path = '/' + name + '/play/';
          break;	
        case 'search':
          method = 'get';
          path = '/' + name + '/:searchterm';
          break;	
        case 'update':
          method = 'get';
          path = '/' + name + '/update';
          break;
        case 'cache':
          method = 'get';
          path = '/' + name + '/cache';
          break;		  
        case 'edit':
          method = 'get';
          path = '/' + name + '/:id/edit';
          break;
        case 'details':
          method = 'get';
          path = '/' + name + '/:id/details';
          break;
        case 'create':
          method = 'post';
          path = '/' + name;
          break;
        case 'post':
          method = 'post';
          path = '/' + name + '/post/';
          break;
        case 'index':
          method = 'get';
          path = '/' + name;
          break;
        default:
          throw new Error('unrecognized route: ' + name + '.' + key);
      }

      path = prefix + path;
      app[method](path, obj[key]);
      verbose && console.log('     %s %s -> %s', method.toUpperCase(), path, key);
    }

    // mount the app
    parent.use(app);
  });
};