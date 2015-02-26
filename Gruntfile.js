'use strict';

module.exports = function (grunt) {
    // Show elapsed time at the end
    // require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: []
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: [
                    '*.js'
                ]
            },
            test: {
                src: []
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'nodeunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'nodeunit']
            }
        },
        jsbeautifier: {
            files: [
                '*.js'
            ],
            options: {
                js: {
                    jslint_happy: true,
                    indentChar: ' ',
                    indentSize: 4
                }
            },
        }
    });

    // Default task.
    // grunt.registerTask('default', ['jsbeautifier', 'jshint', 'nodeunit']);
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);

};
