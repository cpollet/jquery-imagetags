;(function($, window, undefined) {
  var document = window.document;
  
  var ImageTags = function(element, options) {
    this._options          = $.extend({}, $.ImageTags.options, options);
    this._container        = $(element);
    this._image            = $(element).children('img');
    this._contentContainer = $('<div/>');

    this._mode             = "corner";

    this._tags             = [];
    this._tagId            = 0;
    
    this._currentTag       = null;
    this._drawingTag       = false;
    
    this._init();
  };
  
  ImageTags.options = {
    enableCreation: true,
    enableRemoval: true,
    htmlClassPrefix: 'jquery-imagetags-'
  };
  
  $.extend(ImageTags.prototype, {
    // public
    getTags: function() {
      return this._tags;
    },
    
    getCurrentTag: function() {
      return this._currentTag;
    },
    
    finalize: function() {
      if (this._currentTag._origin) {
        delete this._currentTag._origin;
      }
      
      this._currentTag.tagElement()
        .removeClass(this._htmlClass('tag-active'))
        .addClass(this._htmlClass('tag'))
        .on('mousemove.jquery-tag', null, { tag: this._currentTag }, ImageTags.Handlers.tag.mousemove)
        .on('mouseleave.jquery-tag', null, { tag: this._currentTag }, ImageTags.Handlers.tag.mouseleave);
      
      this._tags.push(this._currentTag);
      
      this._container.trigger('tagadded', this._currentTag);
      
      this._currentTag = null;
    },
    
    cancel: function() {
      this._currentTag.tagElement().remove();
      this._currentTag = null;
    },
    
    add: function(html, area, data) {
      area = area.toFixed(this._image.height(), this._image.width());
      
      this._currentTag = new ImageTags.Tag({
        tagger:       this,
        tagElement:   this._buildTagElement({
            x: area.fixed().topLeftX,
            y: area.fixed().topLeftY
          }, area.fixed().bottomRightY - area.fixed().topLeftY, area.fixed().bottomRightX - area.fixed().topLeftX),
        tagContent:   html,
        tagArea:      area,
        tagData:      data,
        domContainer: this._container,
        domContent:   this._contentContainer,
        domImage:     this._image
      });
      
      this._currentTag.tagElement().attr('data-imagetags-tagid', this._currentTag.tagId());
      
      this.finalize();
    },
    
    remove: function(tagid) {
      if (this._options.enableRemoval) {
        for (var i = 0; i < this._tags.length; i++) {
          if (this._tags[i].tagId() == tagid) {
            var tag = this._tags[i];
            break;
          }
        }
        
        this._tags.splice(i, 1);
        
        tag.domContent().hide();
        tag.tagElement().remove();
        
        this._container.trigger('tagremoved', tag);
      }
    },
    
    enableCreation: function() {
      this._options.enableCreation = true;
    },
    
    disableCreation: function() {
      this._options.enableCreation = false;
    },
    
    enableRemoval: function() {
      this._options.enableRemoval = true;
    },
    
    disableRemoval: function() {
      this._options.enableRemoval = false;
    },
    
    // private
    _getTagId: function() {
      return this._tagId++;
    },
    
    _init: function () {
      var self = this;
      
      this._image.attr('draggable', 'false');
      
      if ((this._container.css('position') != 'relative') && (this._container.css('position') != 'absolute') && (this._container.css('position') != 'fixed')) {
        this._container.css('position', 'relative');
      }
      
      this._contentContainer
        .css('position', 'absolute')
        .css('display', 'none')
        .css('z-index', 9999)
        .addClass(this._htmlClass('text-container'));
      
      this._container
        .addClass(this._htmlClass('container'))
        .width(this._image.width())
        .height(this._image.height())
        .on('mousemove.jquery-tag', null, { tagger: this }, ImageTags.Handlers.container.mousemove)
        .on('mousedown.jquery-tag', null, { tagger: this }, ImageTags.Handlers.container.mousedown)
        .on('mouseup.jquery-tag',   null, { tagger: this }, ImageTags.Handlers.container.mouseup)
        .on('mouseleave.jquery-tag', null, { tagger: this}, ImageTags.Handlers.container.mouseleave)
        .append(this._contentContainer);
        
       $(document)
         .on('keydown.jquery-tag', '*', function(e) {
           if (self._drawingTag && e.shiftKey) {
             self._mode = 'center';
           }
         })
         .on('keyup.jquery-tag', function(e) {
           if (self._drawingTag) {
             self._mode = 'corner';
           }
         });
    },
    
    _buildTagElement: function(position, height, width) {
      var element = $($('<a/>'))
        .css('position', "absolute")
        .css('top', this._px(position.y))
        .css('left', this._px(position.x))
        .css('width', this._px(width || 1))
        .css('height', this._px(height || 1))
        .addClass(this._htmlClass('tag-active'));
      
      this._container.append(element);
      
      return element;
    },
    
    _beginTag: function(position) {
      if (this._options.enableCreation) {
        this._drawingTag = true;
        
        this._currentTag = new ImageTags.Tag({
          tagger:       this,
          tagElement:   this._buildTagElement(position),
          domContainer: this._container,
          domContent:   this._contentContainer,
          domImage:     this._image
        });
        
        this._currentTag.tagElement().attr("data-imagetags-tagid", this._currentTag.tagId());
        this._currentTag._origin = position;
      }
    },
    
    _updateTag: function(position) {
      if (!this._drawingTag) {
        return;
      }
      
      var element = this._currentTag.tagElement();
      var origin = this._currentTag._origin;
      
      if (this._mode == 'center') {
        var width  = Math.abs(position.x - origin.x);
        var height = Math.abs(position.y - origin.y);
        var top    = origin.y - height;
        var left   = origin.x - width;
        
        element
          .css('width', this._px(width * 2))
          .css('height', this._px(height * 2))
          .css('top', this._px(top))
          .css('left', this._px(left));
      }
      
      else if (this._mode == 'corner') {
        var width  = position.x - origin.x;
        var height = position.y - origin.y;
        var top    = height > 0 ? origin.y : origin.y + height;
        var left   = width > 0 ? origin.x : origin.x + width;
        
        element
          .css('top', this._px(top))
          .css('left', this._px(left))
          .css('width', this._px(Math.abs(width)))
          .css('height', this._px(Math.abs(height)))
      }
      
      var x1 = Math.round(this._currentTag.tagElement().position().left);
      var y1 = Math.round(this._currentTag.tagElement().position().top);
      var x2 = Math.round(x1 + this._currentTag.tagElement().width());
      var y2 = Math.round(y1 + this._currentTag.tagElement().height());
      
      this._currentTag._tagArea = new ImageTags.Area(
        x1,
        y1,
        x2,
        y2,
        'fixed',
        this._image.height(),
        this._image.width()
      );
    },
    
    _endTag: function(position) {
      if (this._drawingTag) {
        this._drawingTag = false;
        this._container.trigger('drawend', this._currentTag);
      }
    },
    
    _imagePosition: function(position) {
      return {
        x: position.x - this._image.offset().left,
        y: position.y - this._image.offset().top
      };
    },
    
    _px: function(px) {
      return px + 'px';
    },
    
    _htmlClass: function(htmlClass) {
      return this._options.htmlClassPrefix + htmlClass;
    }
  });
  
  ImageTags.Area = function(x1, y1, x2, y2, mode, height, width) {
    this._x1 = Math.min(x1, x2);
    this._y1 = Math.min(y1, y2);
    this._x2 = Math.max(x1, x2);
    this._y2 = Math.max(y1, y2);
    
    this._mode = mode || 'fixed';
    this.setImageSize(height, width);
  }
  
  $.extend(ImageTags.Area.prototype, {
    setImageSize: function(height, width) {
      if (height != undefined && width != undefined) {
        this._height = height;
        this._width  = width;
      } else {
        this._height = null;
        this._width  = null;
      }
    },
    
    fixed: function(height, width) {
      if (this._mode == 'fixed') {
        return {
          topLeftX:     this._x1,
          topLeftY:     this._y1,
          bottomRightX: this._x2,
          bottomRightY: this._y2
        };
      } else if (this._height != null && this._width != null) {
        return {
          topLeftX:     Math.round(this._x1 * this._width),
          topLeftY:     Math.round(this._y1 * this._height),
          bottomRightX: Math.round(this._x2 * this._width),
          bottomRightY: Math.round(this._y2 * this._height)
        };
      } else if (height != undefined && width != undefined) {
        return {
          topLeftX:     Math.round(this._x1 * width),
          topLeftY:     Math.round(this._y1 * height),
          bottomRightX: Math.round(this._x2 * width),
          bottomRightY: Math.round(this._y2 * height)
        };
      } else {
        return {};
      }
    },
    
    toFixed: function(height, width) {
      return new ImageTags.Area(
        this.fixed(height, width).topLeftX,
        this.fixed(height, width).topLeftY,
        this.fixed(height, width).bottomRightX,
        this.fixed(height, width).bottomRightY,
        'fixed'
      );
    },
    
    proportional: function(height, width) {
      if (this._mode == 'proportional') {
        return {
          topLeftX:     this._x1,
          topLeftY:     this._y1,
          bottomRightX: this._x2,
          bottomRightY: this._y2
        };
      } else if (this._height != null && this._width != null) {
        return {
          topLeftX:     this._x1 / this._width,
          topLeftY:     this._y1 / this._height,
          bottomRightX: this._x2 / this._width,
          bottomRightY: this._y2 / this._height
        };
      } else if (height != undefined && width != undefined) {
        return {
          topLeftX:     this._x1 / width,
          topLeftY:     this._y1 / height,
          bottomRightX: this._x2 / width,
          bottomRightY: this._y2 / height
        };
      } else {
        return {};
      }
    },
    
    toProportional: function(height, width) {
      return new ImageTags.Area(
        this.proportional(height, width).topLeftX,
        this.proportional(height, width).topLeftY,
        this.proportional(height, width).bottomRightX,
        this.proportional(height, width).bottomRightY,
        'proportional'
      );
    },
  });
  
  ImageTags.Tag = function(properties) {
    this._tagger        = properties.tagger;
    
    this._tagElement    = properties.tagElement;
    this._tagContent    = properties.tagContent;
    this._tagArea       = properties.tagArea;
    this._tagData       = properties.tagData; // custom data
    
    this._domContainer  = properties.domContainer;
    this._domContent    = properties.domContent;
    this._domImage      = properties.domImage;
    
    this._isDisplayed   = false;
    this._tagId         = properties.tagger._getTagId();
  };
  
  $.extend(ImageTags.Tag.prototype, {
    finalize: function() {
      this._tagger.finalize();
    },
    
    cancel: function() {
      this._tagger.cancel();
    },
    
    remove: function() {
      this._tagger.remove(this._tagId);
    },
    
    tagger: function() {
      return this._tagger;
    },
    
    tagId: function() {
      return this._tagId;
    },
    
    tagElement: function() {
      return this._tagElement;
    },
    
    tagContent: function() {
      return this._tagContent;
    },
    
    setTagContent: function(tagContent) {
      this._tagContent = tagContent;
      return this;
    },
    
    tagArea: function() {
      return this._tagArea
    },
    
    tagData: function() {
      return this._tagData
    },
    
    setTagData: function(data) {
      this._tagData = data;
      return this;
    },
    
    domContainer: function() {
      return this._domContainer;
    },
    
    domContent: function() {
      return this._domContent;
    },
    
    domImage: function() {
      return this._domImage;
    },
    
    isDisplayed: function(flag) {
      if (flag === undefined) {
        return this._isDisplayed;
      }
      
      this._isDisplayed = flag;
    }
  });
  
  ImageTags.Handlers = {
    container: {
      mousemove: function(e) {
        var self = e.data.tagger;
        var tags = self._tags;
        
        if (self._drawingTag) {
          self._updateTag(self._imagePosition({
            x: e.pageX, 
            y: e.pageY
          }));
        }
        
        for (var i = 0; i < tags.length; i++) {
          tags[i].tagElement()
            .addClass(self._htmlClass('tag-inactive'))
            .removeClass(self._htmlClass('tag'));
        }
      },
      
      mousedown: function(e) {
        var self = e.data.tagger;

        if (!self._drawingTag && self._currentTag === null) {
          self._beginTag(self._imagePosition({
            x: e.pageX, 
            y: e.pageY
          }));
        }
        e.preventDefault();
      },
      
      mouseup: function(e) {
        var self = e.data.tagger;

        e.preventDefault();

        self._endTag(self._imagePosition({
          x: e.pageX, 
          y: e.pageY
        }));
      },
      
      mouseleave: function(e) {
        var self = e.data.tagger;
        var tags = self._tags;

        for (var i = 0; i < tags.length; i++) {
          tags[i].tagElement()
            .addClass(self._htmlClass('tag'))
            .removeClass(self._htmlClass('tag-inactive'));
        }
      },
      
      drawend: function(e, tag) {
        var text = prompt('Tag', '');
        
        if (text != null) {
          tag
            .setTagContent(text)
            .finalize();
        } else {
          tag.cancel();
        }
      },
      
      tagshow: function(e, tag) {
        var self = tag.tagger();
        
        tag.isDisplayed(true);
        
        tag.tagElement()
          .addClass(self._htmlClass('tag-active'))
          .removeClass(self._htmlClass('tag'))
          .removeClass(self._htmlClass('tag-inactive'));
        
        tag.domContent()
          .hide()
          .html(tag.tagContent())
          .css('top', self._px(tag.tagArea().fixed().topLeftY + tag.tagElement().outerHeight()))
          .css('left', self._px(tag.tagArea().fixed().topLeftX))
          .off('mousemove.jquery-tag').on('mousemove.jquery-tag', null, { tag: tag }, ImageTags.Handlers.tag.mousemove)
          .off('mouseleave.jquery-tag').on('mouseleave.jquery-tag', null, { tag: tag }, ImageTags.Handlers.tag.mouseleave)
          .show();
      },
      
      taghide: function(e, tag) {
        var self = tag.tagger();
        
        tag.isDisplayed(false);
        
        tag.domContent().hide();
        
        tag.tagElement()
          .addClass(self._htmlClass('tag-inactive'))
          .removeClass(self._htmlClass('tag'))
          .removeClass(self._htmlClass('tag-active'));
      }
    },
    
    tag: {
      mousemove: function(e) {
        var tag = e.data.tag;
        
        if (!tag.isDisplayed()) {
          tag.domContainer().trigger('tagshow', tag);
        }
      },
      
      mouseleave: function(e) {
        var tag = e.data.tag;
        
        if (tag.isDisplayed()) {
          tag.domContainer().trigger('taghide', tag);
        }
      }
    }
  }
  
  $.fn.imageTags = function (options) {
    // call ImageTags's function
    if (typeof options === 'string' && options[0] !== '_') {
      var args = arguments;
      
      if (options.substring(0, 3) === 'get') {
        return this.map(function () {
          var instance = $.data(this, 'plugin_tag');
          if (instance instanceof ImageTags && typeof instance[options] === 'function') {
            return instance[options].apply( instance, Array.prototype.slice.call(args, 1));
          }
        });
      } else {
        return this.each(function () {
          var instance = $.data(this, 'plugin_tag');
          if (instance instanceof ImageTags && typeof instance[options] === 'function') {
            instance[options].apply( instance, Array.prototype.slice.call(args, 1));
          }
        });
      }
    }
    
    // new ImageTags on element
    else if (options === undefined || typeof options === 'object') {
      return this.each(function() {
        if (!$.data(this, 'plugin_tag')) {
          $.data(this, 'plugin_tag', new ImageTags(this, options));
        }
      });
    }
    
  };
  
  $.ImageTags = ImageTags;
  
  // special events
  $.event.special.drawend = {
    setup: function(data, namespaces) {
      return false;
    },
    
    teardown: function(namespaces) {
      return false;
    },
    
    _default: function(e, tag) {
      ImageTags.Handlers.container.drawend.call(e.target, e, tag);
    }
  };
  
  $.event.special.tagshow = {
    setup: function(data, namespaces) {
      return false;
    },
    
    teardown: function(namespaces) {
      return false;
    },
    
    _default: function(e, tag) {
      ImageTags.Handlers.container.tagshow.call(tag.domContainer()[0], e, tag);
    }
  };
  
  $.event.special.taghide = {
    setup: function(data, namespaces) {
      return false;
    },
    
    teardown: function(namespaces) {
      return false;
    },
    
    _default: function(e, tag) {
      ImageTags.Handlers.container.taghide.call(tag.domContainer()[0], e, tag);
    }
  };
}(jQuery, window));