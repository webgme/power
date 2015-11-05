/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Mon Oct 05 2015 14:19:37 GMT-0500 (CDT).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase'
], function (
    PluginConfig,
    PluginBase) {
    'use strict';

    /**
     * Initializes a new instance of OpenDSS_Generator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin OpenDSS_Generator.
     * @constructor
     */
    var OpenDSS_Generator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
    };

    // Prototypal inheritance from PluginBase.
    OpenDSS_Generator.prototype = Object.create(PluginBase.prototype);
    OpenDSS_Generator.prototype.constructor = OpenDSS_Generator;

    /**
     * Gets the name of the OpenDSS_Generator.
     * @returns {string} The name of the plugin.
     * @public
     */
    OpenDSS_Generator.prototype.getName = function () {
        return 'New Plugin';
    };

    /**
     * Gets the semantic version (semver.org) of the OpenDSS_Generator.
     * @returns {string} The version of the plugin.
     * @public
     */
    OpenDSS_Generator.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    OpenDSS_Generator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;


        // Using the logger.
        self.logger.debug('This is a debug message.');
        self.logger.info('This is an info message.');
        self.logger.warn('This is a warning message.');
        self.logger.error('This is an error message.');

        // Using the coreAPI to make changes.

        nodeObject = self.activeNode;

        //self.core.setAttribute(nodeObject, 'name', 'My new obj');
        //self.core.setRegistry(nodeObject, 'position', {x: 70, y: 70});


        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        //self.save('New Plugin updated model.', function (err) {
        //    if (err) {
        //        callback(err, self.result);
        //        return;
        //    }
            self.result.setSuccess(true);
            callback(null, self.result);
        //});

    };

    return OpenDSS_Generator;
});