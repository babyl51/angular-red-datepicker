Angular-Red-Datepicker
===

This is small angular directive for selecting both date ranges from one handy calendar. Useful for using in different filters.

## Usage

- Install: `bower install angular-red-datepicker`.
- Add dependencies to your code.
- Add `redDatepickerModule` module in your application dependencies.

```js
angular.module('app', ['redDatepickerModule']);
```
- Add attribute directives to your html:

```html
    <red-datepicker locale="en"
                    list-show="true"
                    list-arr="{variable}"
                    output="{variable}"
                    today-btn="true"
                    date-start="{string}"
                    date-end="{string}"
                    number-of-days="6"></red-datepicker>
```
* `locale` is optional and set language and rules for displaying calendar. By defaults is English. The list of languages you can look in the [MomentJS](http://momentjs.com/).
* `list-show` - showing the list of defalts date range. By defaults is false.
* `list-arr` - array of objects where object - item of list `{label: 'Name of label', days: 'number of days from today'}`
* `output` - set the variable for date output.
* `today-btn` - show today button.
* `date-start` - init datepicker with specific date.
* `date-end` - init datepicker with specific date.
* `number-of-days` - set quantity of days from start selection to today on init.


## Dependencies
- [Angular^1.5.8](https://angularjs.org/)
- [MomentJS](http://momentjs.com/)
- [Lodash](https://lodash.com/)


## [Demo](https://johnnyswan.github.io/angular-red-datepicker/)

