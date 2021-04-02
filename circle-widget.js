$.fn.initCirkle=function() {
	var size_chart=400,
		size_pie=280,
		thickness_chart=10,
		thickness_pie=16,
		dots_dist=15;

	if (!$('#c_filter')[0]) $('body').prepend(`<svg style="position:absolute; visibility:hidden">
		<style>
		/*set filter for g instead of the .arc to apply inner shadow to the whole cgat whith the dot*/

		.circle-widget pattern g { 
			filter: url(#c_filter);
		}
		</style>
		<filter id="c_filter">
		    <feGaussianBlur stdDeviation="2" result="blur" />
		    <feComposite in2="blur" in="SourceAlpha" operator="out" />
		    <feComponentTransfer in="image1">
			 <feFuncA type="linear" slope="0.2"/>
			</feComponentTransfer>
		</filter>
	</svg>`)

	return this.each(function(){
		var $el=$(this);
		if ($el.data('isDiagtam')) return;
		$el.data('isDiagtam', 1);

		$._cNum=($._cNum||0)+1;

		var grID='c_gradient'+$._cNum;
		var gr0ID='gtadient'+$._cNum;
		var patternID='pattern'+$._cNum;

		var isPIE=$el.hasClass('pie'),
			thickness=isPIE ? thickness_pie : thickness_chart;
			size=isPIE ? size_pie : size_chart;

		var R=(size-thickness*(isPIE || 2))/2;
		var length0=R*2*Math.PI;

		var gStops=[], values, valSum=0, cHtml='';

		if (!isPIE) {
			values=(this.dataset.values||'').split(/,\s*(?![\s\d\.])/);
			var val=(values[0]||0)/100;
			var transition=.35+val+'s cubic-bezier(0.4, 0.1, 0.4, 1), opacity .2s';
			gStops=[[values[1]], [values[2], val], [values[1], 1]];
			cHtml=`
			 <circle r="${R}" class="arc" style="transition: ${transition}; opacity:0" />
			 <circle r="${thickness/2}" stroke="url(#${gr0ID})" cy="${R}" class="dot initial" />`
		} else {
			let sum = 0;
			var items=$('.item', $el).each(function(i){
				var val=parseFloat(this.dataset.values);
				if (isNaN(val)) console.error('incorrect data-values:', this.dataset.values, item);
				else sum+=val;
			}).each(function(i){
				values=(this.dataset.values||'').split(/,\s*(?![\s\d\.])/);
				var val=(values[0]||0)/sum;
				gStops.push([values[1], valSum]);
				cHtml+='<circle class="arc initial" r="'+R+'" style="\
				 transform: scale('+(R+thickness/2)/R+');\
				 stroke-dashoffset: '+(-valSum*length0-thickness*.75)+'px; \
				 stroke-dasharray: '+(val*length0-thickness*1.5)+'px '+length0+'px;" data-i="'+i+'"/>';
				gStops.push([values[2], valSum+=val]);
			})
		}


		var gradient = new ConicGradient({
			stops: gStops, // required
			repeating: true, // Default: false
			size: 100 // Default: Math.max(innerWidth, innerHeight)
		}).blobURL;

		var defs=`
			<pattern id="${grID}" width="100%" height="100%" x="-50%" y="-50%"
			 patternUnits="userSpaceOnUse">
				<image  width="100%" height="100%" 
				 transform="rotate(90, ${size/2}, ${size/2})" xlink:href="${gradient}"
				 onload="window.URL.revokeObjectURL('${gradient}'); $(this).closest('svg:not(.loaded)').trigger('load')"
				/>
					<g stroke="#000" stroke-width="${thickness}">${cHtml.replace('initial', '')}
					<rect  width="100%" height="100%" style="opacity:0" />
					</g>
			</pattern>`;

		if (!isPIE) defs+=`
			<linearGradient  id="${gr0ID}">
				<stop offset="0" stop-color="${values[2]}" />
				<stop offset="100%" stop-color="${values[1]}" />
			</linearGradient>`;

		var svg=$(`<svg viewBox="${-size/2}, ${-size/2}, ${size}, ${size}" onload="$(this).not('.loaded').trigger('load')">
			<defs>${defs}
			</defs>
			<g stroke="url(#${grID})" stroke-width="${thickness}">${cHtml}
			</g>
			<circle class="dots initial" />
		</svg>`)
		 .one('load', function(){
		 	$(this).addClass('loaded');
		 	$('.initial', this).removeClass('initial').filter('.arc').css('transform', 'none');

			if (isPIE) {
				$('.arc', $el).mouseenter(function(e){
					var item=items.eq(this.dataset.i).addClass('visible');
					var w0=item[0].offsetWidth, w=w0-50;
					w=Math.min(w, e.clientX-10);
					w=Math.max(w, -document.body.offsetWidth+e.clientX+w0-10);
					item.css('--arrow-left', Math.min(Math.max(w-13, 4), w0-30)+'px')
					 .offset({left: e.pageX-w, top: e.pageY+20})
				}).mouseleave(function(e){
					var item=items.eq(this.dataset.i).removeClass('visible');
					$(e.relatedTarget).closest(item).addClass('visible')
					 .one('mouseleave', function(){item.removeClass('visible')})
				})
			} else {
				$el.css('--chart-color', values[2]);
				setTimeout(function(){
					var arc=$('.arc', $el).css({'stroke-dasharray': val*length0+'px 1200px', opacity: 1});
					var dot=$('.dot', $el).css({transform: 'rotate('+ -val+'turn)', transition: transition});
				}, 400);
			}
		}).prependTo($el);
		if (!window.SVGAnimateElement) svg.trigger('load'); // IE and Edge not triggers load 
	})
}

$(window).on('load', function(){
	$('.circle-widget').initCirkle()
})