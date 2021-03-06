'use strict';

describe('titleize filter', function () {

    var titleizeFilter;

    beforeEach(function () {
        module('scFeatureBook');

        inject(function ($filter) {
            titleizeFilter = $filter('titleize');
        });
    });

    it('should titleize directory name', function () {
        expect(titleizeFilter('list_users')).toEqual('List users');
        expect(titleizeFilter('vending_machine')).toEqual('Vending machine');
        expect(titleizeFilter('buying_a_can')).toEqual('Buying a can');
    });

    it('should titleize Gherking source file', function () {
        expect(titleizeFilter('eating_cucumbers.feature')).toEqual('Eating cucumbers');
        expect(titleizeFilter('using_featurebook_with_grunt.feature')).toEqual('Using featurebook with grunt');
    });

});