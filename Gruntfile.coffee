module.exports = (grunt) ->
    grunt.initConfig
      pkg: grunt.file.readJSON 'package.json'
      coffee:
        compile:
          expand: true,
          src: ['*.coffee', 'public/**/*.coffee'],
          dest: ''
          ext: '.js'

    grunt.loadNpmTasks 'grunt-contrib-coffee'

    grunt.registerTask 'default', ['coffee']
