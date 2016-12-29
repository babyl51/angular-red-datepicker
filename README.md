Angular-Red-Datepicker
===

This is small angular directive for selecting both date ranges from one handy calendar. Useful for using in different filters.

## Usage

- Install: `bower install angular-red-datepicker`.
- Add dependencies to your code.
- Add a dependency to the `redDatepickerModule` module in your application.

```js
angular.module('app', ['redDatepickerModule']);
```
- Add attribute directives to your html:

```html
    <red-datepicker locale="en" list-show="true" output="{variable}"></red-datepicker>
```
* `locale` is optional and set language and rules for displaying calendar. By defaults is English. The list of languages you can look in the [MomentJS](http://momentjs.com/).
* `list-show` - showing the list of defalts date range. By defaults is false.
* `output` - set the variable for date output. 
* `today-btn` - show today button.


## Dependencies
- [Angular^1.5.8](https://angularjs.org/)
- [MomentJS](http://momentjs.com/)
- [Lodash](https://lodash.com/)


## [Demo](https://johnnyswan.github.io/angular-red-datepicker/)

