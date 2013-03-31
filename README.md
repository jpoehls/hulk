# Hulk

Hulk is a blog focused static site generator, a la [Jekyll](http://jekyllrb.com).

## Getting Started

Hulk should be installed locally in your project.

	npm install hulk

Next you should install [the command line interface](http://github.com/jpoehls/hulk-cli/) globally. This is what you
will use to actually run hulk and generate your site.

	npm install -g hulk-cli

Finally, run the `hulk` command inside your project to generate your site.

**Hulk isn't ready for you yet.** I don't recommend using it unless you are hacking on it.

The [hulk-example](http://github.com/jpoehls/hulk-example) is a good place to look if you want to
get a feel for how a hulk site is structured.

## Site Structure

Hulk reads and writes [all files with UTF-8 encoding](http://www.utf8everywhere.org/). Be sure to save your pages and layouts as UTF-8 to avoid encoding issues.

Your blog has to conform to a specific folder structure.

	/_layouts
	/_posts
	/_site
	/_config.yml

### _layouts

These are the template pages for your site. Each post must specify which layout to use
in the YAML front-matter.

Layout files are EJS/Underscore templates that use a mixture of EJS and Mustache syntax.

You can escape and insert a variable in the page with `{{ site.name }}`.

Insert it raw without escaping with `{{{ site.name }}}`.

Use any arbitrary JavaScript with `<% if (site.name) { %> some content <% } %>`.

### _posts

You can organize your `_posts` folder anyway you want.

	/_posts
		/2013
			/2013-01-01-title-of-my-post.md

Posts can either be either Markdown or HTML. Use the `.md` or `.markdown` extension for Markdown.

Posts are also processed as EJS/Underscore templates the same as layout files.

### _site

The generated static site will be output to this folder. This is what you will publish
to your web host.

### _config.yml

You can tweak Hulk's behaviors with this configuration file.

- **`destination`** - Changes the directory where Hulk will write files to.
- **`layouts`** - Changes the directory where layout files are located.
- **`includes`** - Changes the directory where include files are located.
- **`posts`** - Changes the directory where posts are located.
- **`permalink`** - Changes the URLs that posts are generated with.

	This default permalink can be overriden by the post's YAML front-matter.
	
	Permalinks should always start with a forward slash. You can use the following variables.

	- `{{year}}` - the 4 digit year of the post
	- `{{month}}` - the month of the post (no leading zero)
	- `{{day}}` - the day of the post (no leading zero)
	- `{{slug}}` - the slugified title of the post

- **`ignore`** - A glob pattern list of directories and files to ignore. For example, dot files are ignored by default.

- **`url`** - Sets `{{site.url}}`, useful for environment switching.

- **`global`** - Defines arbitrary global variables that will be available anywhere in your site. For example, a `name` variable would be accessible via `{{site.name}}`.

		global:
			name: My Blog
			slogan: Useless posts with useless boasts

#### Default Configuration

	destination: _site
	layouts: _layouts
	includes: _includes
	posts: _posts
	permalink: '/{{year}}/{{month}}/{{day}}/{{slug}}.html'
	ignore:
		- node_modules/**
		- package.json
		- **/.* # dot files
		- .*/** # dot files

## YAML front-matter

Every page on your site must have YAML front-matter to be included in the generated site.

Typical front-matter for a post might be:

	---
	title: The title of my blog post
	layout: post
	categories: general news
	---

## Template Data

You have access to a variety of data and helper functions in your layouts and pages.

### Site Variables

- **`site.time`** - A `Date` object with the current time (when you run the hulk command).
- **`site.url`** - The URL configuration value with any trailing forward-slashes removed.
- **`site.posts`** - An array of all the posts.
- **`site.pages`** - An array of the non-post pages.
- Any variables defined in the `global` configuration section will also be accessible via `site.VARIABLE_NAME`. 

### Page Variables

- Any variables defined in the page's YAML front-matter will be accessible via `page.VARIABLE_NAME`.

### Includes

Coming soon.

### Helper Functions

- **formatDate(date, format)**

	Formats a `Date` object or date string using [Moment.js](http://momentjs.com/docs/#/displaying/format/).

- **collapseWhitespace(string)**

	Trims the string and converts all adjacent whitespace characters to a single space.

		collapseWhitespace('  Strings   \t are   \n\n\t fun\n!  ') // 'Strings are fun !'

- **truncate(string, length)**

	Truncates a string to the given length, accounting for word bounderies.

		truncate('this is some long text', 3)  // '...'
		truncate('this is some long text', 7)  // 'this is...'
		truncate('this is some long text', 11) // 'this is...'
		truncate('this is some long text', 12) // 'this is some...'
		truncate('this is some long text', 11) // 'this is...'

- **stripHtml(input)**

	Strips all of the HTML tags from the given string.

		stripHtml('<p>just <b>some</b> text</p>') // 'just some text'

- **inspect(input)**

	Returns a string representation of any given object. Useful for debugging.

## License

See LICENSE.