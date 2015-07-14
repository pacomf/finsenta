/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var Agenda = require('agenda');
var AgendaUI = require('agenda-ui');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/sentiment', require('./api/sentiment'));
  var agenda = new Agenda();
  agenda.database('localhost:27017/finsenta-jobs', 'finsentaJobs');
  app.use('/agenda-ui', AgendaUI(agenda, {poll: 100000}));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
