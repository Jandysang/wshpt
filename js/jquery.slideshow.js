/*
*
* @ Plagiarize jQuery plugins slideshow.js
* @ jquery.slideshow.js
* @ require jquery.js
* @ sangyoutao
* @ syt4528@ly.com
* @ version:1.0
* @ time 2015-04-13
*
*/

;(function ($,undefind) {
	var settings={
        //配置
        canvas:".ui-slideshow"       //幻灯框
        ,items:".ui-slideshow-item"                  //幻灯项
        ,itemWidth:false             //为每一张幻灯设置一个宽度
        ,itemHeight:false            //为每一张幻灯设置一个高度
        ,jumpQueue:true              //是否允许.to()方法在动画期间使用
        ,offset:1                    //开始动画的索引(起始为1)
        
        
        //控制
        ,skip:true                  //是否需要切换按钮
        ,nav:true                   //是否需要导航
        ,navTrigger:'mouseover'     //导航触发方式(nav:false,情况下无效)
        ,auto:1000*6                //是否自动(动画间隔)
        ,autostop:true              //当用户手动修改幻灯时，是否停止自动播放
        ,hoverPause:true            //鼠标悬浮在幻灯上，是否停止
        ,loop:true                  //切换是否循环(显示到最后一张图片时是否从头开始，false就停止不动了)
        ,circle:true                //图片是否循环(图片是否首尾相连,transition:fade下无效)
        ,nextText:"Next"            //切换按钮（下一张)的文字显示
        ,prevText:"Prev"            //切换按钮（上一张)的文字显示

        //效果
        ,transition:"moveX"       //动画效果
        ,speed:600                  //动画速度(确保小于动画间隔的1/2)
        ,easing:'swing'             //动画缓和方式
        ,visible: 1                 //可见幻灯个数(transition:'fade',情况下无效)

        //回调
       
        ,oninit:false            	//幻灯初始化回调函数

        
        ,onupdate:false                 //用于幻灯发生改变时触发
        ,onbefore:false  				//幻灯动画开始前
        ,onafter:false   				//幻灯动画开始后
    };


    function Slides(target, options) {
        
        this.$target = $(target);
        this.opts = $.extend({}, settings, options, this.$target.data());
        this.$canvas = this.$target.children(this.opts.canvas);
        this.$items = this.$canvas.children(this.opts.items);
        this.$itemClone=this.$items.clone(true);
        this.count = this.$items.length;
        this.scrollable = true;

        if ( this.count > 1 ) {
            this.init();
        }

        return this;
    }

    Slides.prototype={
    	init:function(){
    		var self=this; //作用域
    		//1、封装外框
    		this.$wrapper = this.$canvas.wrap('<div style="position:relative;overflow:hidden;height:100%;width:100%;">').parent();
    		//2、加分页按钮
    		if(this.opts.nav){

    			//创建分页按钮
                this.$nav = $('<ul class="ui-slideshow-nav">');
                for ( var i = 0, len = this.count; i < len; i++ ) {
                    this.$nav.append('<li><a href="#" data-slides="' + i + '">' + (i+1) + '</a></li>');
                }
                this.$target.append(this.$nav);

                //分页按钮注册事件
                this.$target.on(this.opts.navTrigger+".slides",'.ui-slideshow-nav a[data-slides]',function(e){
                    var $this=$(this);
                    
                    e.preventDefault();
                    self.to($this.data("slides"),false);
                });
    		}
    		//3、加分页按钮
    		if(this.opts.skip){
    			//创建切换按钮按钮
                this.$next = $('<a href="#" class="ui-slideshow-prev" data-slides="previous">' + this.opts.prevText + '</a>');
                this.$prev = $('<a href="#" class="ui-slideshow-next" data-slides="next">' + this.opts.nextText + '</a>');
                this.$target.append(this.$next,this.$prev);

                //切换按钮注册事件
                this.$target.on("click.slides",".ui-slideshow-prev[data-slides],.ui-slideshow-next[data-slides]",function(e){
                    var $this = $(this);

                    e.preventDefault();

                    if ( ! $this.hasClass('disabled') ) {
                        self.to($this.data('slides'), false);
                    }
                });
    		}

    		//4、重置或初始化动画事件
    		this.redraw();

    		//5、轮播方法
    		if(this.opts.auto){
    			if ( this.opts.hoverPause ) {  //是否支持
	                this.$target.hover(function() {
	                    if ( ! self.stopped ) {
	                        self.pause();
	                    }
	                }, function() {
	                    if ( self.paused ) {
	                        self.play();
	                    }
	                });
	            }

	            this.play();
    		}

            if ( this.opts.oninit && $.isFunction(this.opts.oninit)) {
                this.opts.oninit.call(this);
            }
    	}
    	,redraw:function(trans){
    		//1、判断之前是否已经渲染过幻灯，如果真：清楚效果
    		if(this.transition){ 
    			this.transition.teardown.call(this);
    		}

    		//2、是否自定义transition
    		if(trans){
    			this.opts.transition=trans;
    		}

    		//3、清除当前索引
    		this.current=undefined;

    		//4、初始化anim方法\函数
    		this.transition=this.transitions[this.opts.transition].call(this);

    		//5、还原到初始位置
    		this.to(this.opts.offset-1);
    	}
    	,transitions:{
    		fade:function(){
    			//初始化
    			this.$items.eq(this.opts.offset-1).css({'position':'absolute','opacity':1,'z-index':1}).end().filter($.proxy(function(i){
    				return i!==(this.opts.offset-1);
    			},this)).css({'position':'absolute','opacity':0,'z-index':0});
    			//animate
    			this.execute=function(){
    				//
                    this.before.call(this);
    				this.$items.eq(this.current).css('z-index',0).stop()
	                .animate({'opacity': 0}, this.opts.speed,this.opts.easing).end()
	                .eq(this.future).css('z-index',1).stop()
	                .animate({'opacity': 1}, this.opts.speed,this.opts.easing,$.proxy(function(){
	                	this.after.call(this);
	                },this));
    			}
    			//清楚效果
    			this.teardown=function(){
                    this.$items.css({'position':'','opacity':'','z-index':''});
    			}
    			return this;
    		}
    		,moveX:function(){
    			var canvasWidth=0;
				this.$items.css({
					'float':'left',
					'width':typeof(this.opts.itemWidth)=="number"?this.opts.itemWidth:this.$items.outerWidth(true),
					'height':typeof(this.opts.itemHeight)=="number"?this.opts.itemHeight: this.$items.outerHeight(true)
				});
				for(var i=0;i<this.count;i++){
					canvasWidth+=this.$items.eq(i).outerWidth(true);
				}
				this.$canvas.css({
					'minWidth':canvasWidth,
					'width':canvasWidth
				});
				this.$wrapper.css({
					'width':this.opts.itemWidth?(this.opts.itemWidth*this.opts.visible):(this.$items.outerWidth(true)*this.opts.visible),
					'height':this.opts.itemHeight?this.opts.itemHeight:this.$items.outerHeight(true)
				});
    			if(this.opts.circle){ 
                    this.$canvas.css({
                        'minWidth':canvasWidth+(this.$items.outerWidth(true)*this.opts.visible*2),
                        'width':canvasWidth+(this.$items.outerWidth(true)*this.opts.visible*2)
                    });
                    this.$canvas.append(this.$items.clone().slice(0,this.opts.visible));
                    this.$items.eq(0).before(this.$items.clone().slice((this.count-(this.opts.visible)),this.count))
                    this.$wrapper.scrollLeft(this.$items.outerWidth(true)*this.opts.visible)
                }
    			this.execute=function(){

					var scroll=this.$items.eq(this.future).position().left+this.$wrapper.scrollLeft();
					var maxScroll=this.$canvas.width()-this.$wrapper.width();
					var limitScroll=scroll>=maxScroll;
					if ( ! limitScroll || this.scrollable ) {
                        this.before.call(this);
                		this.$wrapper.animate({
                        	scrollLeft: limitScroll ? maxScroll : scroll
                    	}, this.opts.speed, this.opts.easing, $.proxy(function() {
                            this.after.call(this);
                        },this));
                	}
                	this.scrollable=!limitScroll;
				};
				this.teardown = function() {
                    this.$wrapper.css({"width":"","height":""}).scrollLeft(0);
                    this.$canvas.css({"minWidth":"","width":""})
                    this.$items.css({"float": "","width": "","height":"" });
                    this.$canvas.empty().append(this.$items);
	            };
	            return this;
    		}
    		,moveY:function(){
                var canvasHeight = 0;
                this.$items.css({
                    'float': 'left',
                    'width':typeof(this.opts.itemWidth)=="number"?this.opts.itemWidth:this.$items.outerWidth(true),
                    'height':typeof(this.opts.itemHeight)=="number"?this.opts.itemHeight: this.$items.outerHeight(true)
                });
                for ( var i = 0; i < this.count; i++ ) {
                    canvasHeight+= this.$items.eq(i).outerHeight(true);
                }
                this.$canvas.css({
                	'minHeight': canvasHeight,
                    'height': canvasHeight
                });
                this.$wrapper.css({
                   	'width':this.opts.itemWidth?this.opts.itemWidth:this.$items.outerWidth(true),
					'height':this.opts.itemHeight?(this.opts.itemHeight*this.opts.visible):(this.$items.outerHeight(true)*this.opts.visible)
                });
    			if(this.opts.circle){ 
                    this.$canvas.css({
                        'minHeight':canvasHeight+(this.$items.outerHeight(true)*this.opts.visible*2),
                        'height':canvasHeight+(this.$items.outerHeight(true)*this.opts.visible*2)
                    });
                    this.$canvas.append(this.$items.clone().slice(0,this.opts.visible));
                    this.$items.eq(0).before(this.$items.clone().slice((this.count-(this.opts.visible)),this.count))
                    this.$wrapper.scrollTop(this.$items.outerHeight(true)*this.opts.visible)
                }
    			this.execute = function() {
                    var scroll = this.$items.eq(this.future).position().top + this.$wrapper.scrollTop();
                    var maxScroll = this.$canvas.height() - this.$wrapper.height();
                    var limitScroll = scroll >= maxScroll;

                    if ( ! limitScroll || this.scrollable ) {
                         this.before.call(this);
                        this.$wrapper.animate({
                            scrollTop: limitScroll ? maxScroll : scroll
                        }, this.opts.speed, this.opts.easing, $.proxy(function() {
                            this.after.call(this);
                        },this));
                    }
                    this.scrollable = ! limitScroll;
                };
                this.teardown = function() {
                    this.$wrapper.css({"width":"","height":""}).scrollTop(0);
                    this.$canvas.css({"minHeight":"","height":""})
                    this.$items.css({"float": "","width": "","height":"" });
                    this.$canvas.empty().append(this.$items);
                };
                return this;
    		}
    	}
    	,to:function(x,user){
            //按钮
			if ( x === 'next' ) {
			    x = this.current + 1;
			}
			else if ( x === 'previous' ) {
			    x = this.current - 1;
			}

			if ( typeof x !== 'number' ) {
			    x = parseInt(x, 10);
			}
			//循环
			if ( x >= this.count ) {
			    x = this.opts.loop ? 0 : this.count - 1;
			}
			else if ( x < 0 ) {
			    x = this.opts.loop ? this.count - 1 : 0;
			}

			//
			if ( user && ! this.stopped ) {
			    if ( this.opts.autostop ) {
			        this.stop();
			    }
			    else if ( ! this.paused ) {
			        this.play();
			    }
			}
            //处理动画中，切换混乱的问题
            if(this.opts.transition=="fade"){
                if(this.opts.jumpQueue && (this.$items.eq(this.current||0).queue('fx').length || this.$items.eq(this.future||0).queue('fx').length)){
                    this.$items.eq(this.future||0).stop().css({"opacity":0,"z-index":0});
                    this.$items.eq(this.current||0).stop().css({"opacity":1,"z-index":1});
                }else if(!this.opts.jumpQueue && (this.$items.eq(this.current||0).queue('fx').length || this.$items.eq(this.future||0).queue('fx').length)){
                    return false;
                }
                if ( x !== this.current ) {
                    this.future = x;
                    this.transition.execute.call(this);

                    if ( this.opts.onupdate ) {
                        this.opts.onupdate.call(this, x);
                    }
                }
            }else{
                if(this.opts.jumpQueue && this.$wrapper.queue('fx').length){
                    this.$wrapper.stop();
                }else if(!this.opts.jumpQueue && this.$wrapper.queue('fx').length){
                    return false;
                }
                this.future = x;
                this.transition.execute.call(this);

                if ( this.opts.onupdate ) {
                    this.opts.onupdate.call(this, x);
                }
            }
    	}
    	,play:function(){
    		var self = this;

	        clearInterval(this.timeout);
	        this.paused = this.stopped = false;

	        this.timeout = setInterval(function() {
	            self.to('next');
	        }, this.opts.auto);
    	}
    	,pause:function(){
    		this.paused = true;
        	clearInterval(this.timeout);
    	}
    	,stop:function(){
        	this.stopped = true;
        	this.paused = false;
        	clearInterval(this.timeout);
    	}
        ,before:function(){
            if ( this.opts.nav ) {
                this.$nav.children().removeClass('selected').slice(this.future, this.future + this.opts.visible).addClass('selected');
            }
            if(this.opts.transition!="fade"&&this.opts.loop&& this.opts.circle&&((this.future==0&&(this.current==this.count-1))||((this.future==this.count-1)&&this.current==0))){
                if(this.opts.transition=="moveX"){
                    if(this.future==0&&(this.current==this.count-1)){
                        this.$wrapper.scrollLeft(this.$items.outerWidth(true)*(this.opts.visible-1));
                    }else if((this.future==this.count-1)&&this.current==0){
                        this.$wrapper.scrollLeft(this.$items.outerWidth(true)*(this.opts.visible+this.count)) 
                    }
                }
                if(this.opts.transition=="moveY"){
                    if(this.future==0&&(this.current==this.count-1)){
                        this.$wrapper.scrollTop(this.$items.outerHeight(true)*(this.opts.visible-1));
                    }else if((this.future==this.count-1)&&this.current==0){
                        this.$wrapper.scrollTop(this.$items.outerHeight(true)*(this.opts.visible+this.count)) 
                    }
                }
            }
            if ( this.opts.onbefore && $.isFunction(this.opts.onbefore)) {
                this.opts.onbefore.call(this);
            }
        }
        ,after:function(){
            if(this.current!=this.future){
                this.update.call(this);
            }
            this.current = this.future;
            if ( this.opts.nav ) {
                this.$nav.children().removeClass('selected').slice(this.current, this.current + this.opts.visible).addClass('selected');
            }
            if ( this.opts.skip ) {
                if ( ! this.hasNext() && ! this.opts.loop ) {
                    this.$next.addClass('disabled');
                }
                else {
                    this.$next.removeClass('disabled');
                }

                if ( ! this.hasPrevious() && ! this.opts.loop ) {
                    this.$prev.addClass('disabled');
                }
                else {
                    this.$prev.removeClass('disabled');
                }
            }
            if ( this.opts.onafter && $.isFunction(this.opts.onafter)) {
                this.opts.onafter.call(this);
            }
        }
        ,update:function(){
            if ( this.opts.onupdate && $.isFunction(this.opts.onupdate)) {
                this.opts.onupdate.call(this);
            }
        }
		,hasNext:function() {
	        return this.scrollable && this.current < (this.count - 1);
	    }
	    ,hasPrevious:function() {
	        return this.current > 0;
	    }
	    ,next : function() {
	        this.to(this.current + 1);
	    }
	    ,previous : function() {
	        this.to(this.current - 1);
	    }
    };

    //封装插件
    $.fn.slideshow=function(options){
        return this.each(function(){
            if ( ! $.data(this, 'slides') ) {
                $.data(this, 'slides', new Slides(this, options));
            }
        })
    };

    /*
    *
    * 模块化处理 让类似requireJS脚本可以模块化使用
    *
    */
    if ( typeof define === 'function' && define.amd ){
        define(function() {
            return Slides;
        });
    }
    else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Slides;
    }

})(jQuery);