/*global module, inject, beforeEach, expect, describe, it */
'use strict';

describe('numeraljs filter', function () {

  var numeraljsFilter;

  beforeEach(module('ngNumeraljs'));

  describe('without configuration', function () {
    beforeEach(inject(function ($filter) {
      numeraljsFilter = $filter('numeraljs');
    }));

    it('should return the default formatted value if format is missing', function () {
      /* Default numeral.js format is '0,0' */
      expect(numeraljsFilter('1234567890')).toEqual('1,234,567,890');
      expect(numeraljsFilter('12345', null)).toEqual('12,345');
    });

    it('should return value if value is null or undefined', function () {
      expect(numeraljsFilter(undefined, '0%')).toEqual(undefined);
      expect(numeraljsFilter(null)).toEqual(null);
      expect(numeraljsFilter(null, '0.0')).toEqual(null);
    });

    it('should format strings as numbers', function () {
      expect(numeraljsFilter('1024.34', '0.0')).toEqual('1024.3');
      expect(numeraljsFilter('1024.38', '0.0')).toEqual('1024.4');
      expect(numeraljsFilter('34039.1', '0,0.00')).toEqual('34,039.10');
      expect(numeraljsFilter('-0.23', '(.000)')).toEqual('(.230)');
      expect(numeraljsFilter('1230974', '0.0a')).toEqual('1.2m');
    });

    it('should format zeros as numbers', function () {
      expect(numeraljsFilter(0, '0,0')).toEqual('0');
      expect(numeraljsFilter(0, '0.0')).toEqual('0.0');
      expect(numeraljsFilter(0, '$0.00')).toEqual('$0.00');
    });

    it('should format numbers as numbers', function () {
      expect(numeraljsFilter(1024.34, '0.0')).toEqual('1024.3');
      expect(numeraljsFilter(1024.38, '0.0')).toEqual('1024.4');
      expect(numeraljsFilter(34039.1, '0,0.00')).toEqual('34,039.10');
      expect(numeraljsFilter(-0.23, '(.000)')).toEqual('(.230)');
      expect(numeraljsFilter(1230974, '0.0a')).toEqual('1.2m');
    });

    it('should format strings as currency', function () {
      expect(numeraljsFilter('1024.34', '$0.0')).toEqual('$1024.3');
      expect(numeraljsFilter('-1024.38', '($ 0.0)')).toEqual('($ 1024.4)');
    });

    it('should format strings as bytes', function () {
      expect(numeraljsFilter('2048', '0ib')).toEqual('2KiB');
      expect(numeraljsFilter('3467479682787', '0.00ib')).toEqual('3.15TiB');
    });
  });

  describe('with configuration', function () {
    describe('when setting format string', function () {
      beforeEach(module('ngNumeraljs', function ($numeraljsConfigProvider) {
        $numeraljsConfigProvider.namedFormat('currency', '$ 0,0.00');
        $numeraljsConfigProvider.namedFormat('currencySuffix', '0,0.00 $');
      }));

      beforeEach(inject(function ($filter) {
        numeraljsFilter = $filter('numeraljs');
      }));

      it('should use configured format string', function () {
        expect(numeraljsFilter('1024.344', 'currency')).toEqual('$ 1,024.34');
        expect(numeraljsFilter('1024.344', 'currencySuffix')).toEqual('1,024.34 $');
      });
    });

    describe('when setting default format', function () {
      beforeEach(module('ngNumeraljs', function ($numeraljsConfigProvider) {
        $numeraljsConfigProvider.defaultFormat('0.0 $');
      }));

      beforeEach(inject(function ($filter) {
        numeraljsFilter = $filter('numeraljs');
      }));

      it('should use default format string', function () {
        expect(numeraljsFilter('1024.344')).toEqual('1024.3 $');
      });
    });

    describe('when using configProvider', function () {
      var configureOnce = true;
      beforeEach(module('ngNumeraljs', function ($numeraljsConfigProvider) {
        if (configureOnce) {
          $numeraljsConfigProvider.defaultFormat('0,0');
          $numeraljsConfigProvider.register('locale', 'de', {
            delimiters: {
              thousands: ' ',
              decimal: ','
            },
            abbreviations: {
              thousand: 'k',
              million: 'm',
              billion: 'b',
              trillion: 't'
            },
            ordinal: function () {
              return '.';
            },
            currency: {
              symbol: '€'
            }
          });
          configureOnce = false;
        }
      }));

      describe('with default language', function () {
        beforeEach(inject(function ($filter) {
          numeraljsFilter = $filter('numeraljs');
        }));

        it('should use default format', function () {
          expect(numeraljsFilter(1234567)).toEqual('1,234,567');
          expect(numeraljsFilter('1234567')).toEqual('1,234,567');
        });

        it('should use default (en) settings for currency', function () {
          expect(numeraljsFilter(1024.344, '$ 0,0.00')).toEqual('$ 1,024.34');
          expect(numeraljsFilter('1024.344', '$ 0,0.00')).toEqual('$ 1,024.34');
        });
      });

      describe('with switch to language', function () {
        beforeEach(module('ngNumeraljs', function ($numeraljsConfigProvider) {
          $numeraljsConfigProvider.locale('de');
        }));

        beforeEach(inject(function ($filter) {
          numeraljsFilter = $filter('numeraljs');
        }));

        it('should use default format', function () {
          expect(numeraljsFilter(1234567)).toEqual('1 234 567');
          expect(numeraljsFilter('1234567')).toEqual('1 234 567');
        });

        it('should use set (de) settings for currency', function () {
          expect(numeraljsFilter(1024.344, '$ 0,0.00')).toEqual('€ 1 024,34');
          expect(numeraljsFilter('1024,344', '$ 0,0.00')).toEqual('€ 1 024,34');
        });
      });
    });
  });

  describe('with runtime configuration', function () {
    var $config;

    describe('when setting default format', function () {
      beforeEach(inject(function ($filter, $numeraljsConfig) {
        numeraljsFilter = $filter('numeraljs');
        $config = $numeraljsConfig;
      }));

      it('should override the default format', function () {
        $config.defaultFormat('0.0 $');
        $config.locale('en');
        expect(numeraljsFilter('1024.344')).toEqual('1024.3 $');
      });
    });
  });
});
