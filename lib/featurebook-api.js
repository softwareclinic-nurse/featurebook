'use strict';

var fs = require('fs'),
    path = require('path'),
    walker = require('./dir-walker'),
    gherkin = require('./gherkin-model'),
    markdown = require('./markdown-parser');

var DEFAULT_FILE_ENCODING = 'UTF-8';

module.exports = {
    commands: {
        build: build,
        serve: serve
    },
    getMetadataSync: getMetadataSync,
    getFeaturesSync: getFeaturesSync,
    getFeatureSync: getFeatureSync,
    getSummarySync: getSummarySync,
    descriptionMarkdownToHTML: descriptionMarkdownToHTML
};

function build(sourceDir, format, outputDir) {
    var buildCommand = require('./command-build');

    // TODO Experimenting with "dynamic" builders registration
    buildCommand.use(require('./builder/builder-html'));
    buildCommand.use(require('./builder/builder-pdf'));
    buildCommand.use(require('./builder/builder-docx'));

    buildCommand.execute({
        sourceDir: sourceDir,
        format: format,
        outputDir: outputDir
    });
}

function serve(sourceDir, port) {
    var serveCommand = require('./command-serve');
    serveCommand.execute({
        sourceDir: sourceDir,
        port: port
    });
}

function getMetadataSync(sourceDir) {
    var metadata = {
            title: path.basename(sourceDir)
        },
        metadataFilePath = path.join(sourceDir, 'featurebook.json');

    if (fs.existsSync(metadataFilePath)) {
        var data = JSON.parse(fs.readFileSync(metadataFilePath, DEFAULT_FILE_ENCODING));
        metadata.title = data.title;
        metadata.authors = data.authors;
        metadata.contributors = data.contributors;
        metadata.version = data.version;
    }
    return metadata;
}

function getFeaturesSync(sourceDir) {
    function visibleDirectoriesAndGherkinSourceFilesFilter(filePath, stats) {
        var basename = path.basename(filePath),
            isGherkinSourceFile = stats.isFile() && path.extname(filePath) === '.feature',
            isVisibleDirectory = stats.isDirectory() && basename[0] !== '.';

        return (isVisibleDirectory && basename !== 'assets') || isGherkinSourceFile;
    }

    return walker.walkSync(sourceDir, visibleDirectoriesAndGherkinSourceFilesFilter);
}

function getFeatureSync(filePath) {
    return gherkin.fromFileSync(filePath);
}

function getSummarySync(dir) {
    var summaryFilePath = path.join(dir, 'SUMMARY.md');

    if (fs.existsSync(summaryFilePath)) {
        var data = fs.readFileSync(summaryFilePath, DEFAULT_FILE_ENCODING);
        return data;
    }
    return null;
}

function descriptionMarkdownToHTML(feature) {
    var background = feature.background,
        scenarioDefinitions = feature.scenarioDefinitions,
        scenarioDefinition,
        examples,
        example;

    if (feature.description) {
        feature.description = markdown.toHTML(feature.description);
    }
    if (background && background.description) {
        background.description = markdown.toHTML(background.description);
    }
    if (scenarioDefinitions) {
        for (var s = 0; s < scenarioDefinitions.length; s++) {
            scenarioDefinition = scenarioDefinitions[s];
            examples = scenarioDefinition.examples;
            if (scenarioDefinition.description) {
                scenarioDefinition.description = markdown.toHTML(scenarioDefinition.description);
            }
            if (examples) {
                for (var e = 0; e < examples.length; e++) {
                    example = examples[e];
                    if (example.description) {
                        example.description = markdown.toHTML(example.description);
                    }
                }
            }
        }
    }
    return feature;
}