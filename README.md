# jquery-imagetags

A jQuery (> 1.7.0) plugin that provides image tagging.

_&copy; Copyright 2012 by Christophe Pollet_

_Licensed under the MIT License [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)_

##Demo
See [demo 1](http://christophe.pollet.ch/projects/jquery-imagetags/src/example1.html) or [demo 2](http://christophe.pollet.ch/projects/jquery-imagetags/src/example2.html)

## Usage

    $("#container").imageTags({
      option1: value1,
      ...
    });

## Example
HTML markup:

    <link rel="stylesheet" type="text/css" href="jquery.imagetags.css">
    <script src="jquery.js"></script>
    <script src="jquery.imagetags.js"></script>
    
    <div id="container">
      <img src="picture.jpg">
    </div>
    
Javascript, somewhere in ``$(function() { ... })``:

    $("#container").imageTags();

You're all setup! For more customization, continue reading.

## Options
``options`` are:

* **enableCreation** [_boolean_] - default: _true_  
If false, no tag can be created.
* **enableRemoval** [_boolean_] - default: _true_  
If false, tags cannot be removed.
* **htmlClassPrefix** [_string_] - default: _'jquery-imagetags-'_  
The class prefix for ImageTags's HTML classes.

## Public methods
After the ImageTags (``$.ImageTags``) initialisation through ``$(selector).imageTags(options)``, it is possible to call several methods on it using the following syntax:

    $(selector).imageTags('methodName' [ , param1, [ ... ] ] );

The available methods are:

* **getTags(): _Array[$.ImageTags.Tag]_**  
Returns a list of all tags defined.
* **getCurrentTag(): _$.ImageTags.Tag_**
Returns the currently created tag or null.
* **finalize(): _void_**  
Finalizes the currently created tag.
* **cancel(): _void_**  
Cancels the creation of currenty created tag.
* **remove(_int_ tagid): _void_**  
Removes the tag given its tagid.
* **enableCreation(): _void_**  
Enables tags creation.
* **disableCreation(): _void_**  
Disables tags creation.

## Events
The following events are triggered at different stage of tags creation, removal or display. Their target and ``this`` is the container.

* **drawend(_Event_ event, _$.ImageTags.Tag_ tag)**  
This event is fired when the user releases the mouse. Calling ``e.preventDefalut()`` inhibits the default action.  
**Default:** a Javascript prompt is displayed (see function ``ImageTags.Handlers.container.drawend``), asking the user for a tag content. If the text is empty the tag is not created.

* **tagadded(_Event_ event, _$.ImageTags.Tag_ tag)**  
This event is fired when a tag is added (after ``finalize()`` completes). By default nothing happens.  
**Default:** noop

* **tagremoved(_Event_ event, _$.ImageTags.Tag_ tag)**  
This event is fired after a tag has been removed (after ``remove()`` completes). By default nothing happend.  
**Default:** noop

* **tagshow(_Event_ event, _$.ImageTags.Tag_ tag)**  
This event is fired when a tag is about to be displayed. Calling ``e.preventDefalut()`` inhibits the default action.  
**Default:** the tag's content is displayed under the tag's frame (see function ``ImageTags.Handlers.container.tagshow``).

* **taghide(Event event, $.ImageTags.Tag tag)**  
This event is fired when a tag is about to be hidden. Calling ``e.preventDefalut()`` inhibits the default action.  
**Default:** the tag's content is hidden (see function ``ImageTags.Handlers.container.taghide``).

## Structures

### $.ImageTags.Tag
* **tagId(): _int_**  
Returns the jquery-imagetags' tagId.
* **finalize(): _void_**  
Finishes the tag's creation (through a call to ``$.ImageTags.finalize()``). Fires the ``tagadded`` event.
* **cancel(): _void_**  
Cancels the tag's creation (through a call to ``$.ImageTags.cancel()``).
* **remove(): _void_**  
Remove the tag. Fires the ``tagremoved`` event.
* **tagger(): _$.ImageTags_**  
Returns the instance if _$.ImageTags_ that is responsible of this particular tag.
* **tagElement(): _$(&lt;a&gt;)_**  
Returns the DOM element that draws the tag's frame on the picture.
* **tagContent(): _string_**  
Returns the tag's content (the text shown when the mouse is over the tag frame).
* **setTagContent(_string_): _void_**  
Sets the tag's content.
* **tagArea(): _$.ImageTags.Area_**  
Returns the tag's area (see ``$.ImageTags.Area``).
* **tagData(): _object_**  
Returns arbitraty user data associated with this tag.
* **setTagData(_object_): _void_**  
Sets arbitrary user data associated with this tag.
* **domContainer(): _$(&lt;div&gt;)_**  
Returns the DOM element that contains the image and the tags (i.e. the elements returned by ``$(selector)`` when calling ``$.fn.imageTags()`` during the setup).
* **domContent(): _$(&lt;div&gt;)_**  
Returns the DOM element that holds the tag's content when it's displayed.
* **domImage(): _$(&lt;img&gt;)_**  
Returns the DOM image the tag is associated with.
* **isDisplayed( [ boolean ] ): _boolean, void_**  
Sets/Gets (depending on the presence of the _boolean_ parameter) whether the tag should be considered as displayed by the plugin.

### $.ImageTags.Area
An area stores the location where a tag is on an image. To allow for easy image resizing, two area modes are available:

1. fixed area: the corners are defined as absolute pixel positions; when the image is resized, the tags "move" relative to the their picture objects.
2. proportional area: the corners are defined as a percentage on image's height and width; when the image is resized, the tags don't move and keep their positions relative to their picure objects.

Available method are:

* **$.ImageTags.Area(_int, float_ x1, _int, float_ y1, _int, float_ x2, _int, float_ y2, [ _{'fixed','proportional'}_ mode, [ _int_ height, _int_ width ] ] )**  
Constructor. ``(x1, y1)`` and ``(x2, y2)`` define the top-left and bottom-right corners. Mode defines the type of area, default to fixed. Height and width define the image's size, used
for conversions between fixed and proportional area, see below.
* **setImageSize( [ _int_ height, _int_ width ] )**  
Sets the image size, used to translate fixed position to/from proportional ones.
* **fixed( [ _int_ height, _int_ width ] ): _object { _int_ x1, _int_ y1, _int_ x2, _int_ y2 }_**  
Returns the fixed position corresponding to the current area. 3 cases can occur:
 1. If the area is already using fixed poistion as internal representation (defined during object's initialization) this position is returned;
 2. If the area has an known image size it is are used to compute the fixed position, regardless of height and width parameters;
 3. Otherwise, the height and width parameters are used to do the conversion.
* **toFixed( [ _int_ height, _int_ width ] ): _$.ImageTags.Area_**  
Returns a new area instance corresponding to the fixed positions. The height and width parametes usage is the same as described for ``fixed()``.
* **proportional( [ _int_ height, _int_ width ] )**  
Returns the fixed position proportional to the current area. Same remarks as ``fixed()`` apply regarding the parameters.
* **toProportional( [ _int_ height, _int_ width ] )**  
Returns a new area instance corresponding to the proportional positions. Same remarks as ``fixed()`` apply regarding the parameters.
