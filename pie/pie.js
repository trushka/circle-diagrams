$.fn.initCirkle=function() {
	var size_chart=400,
		size_pie=340,
		thickness_chart=10,
		thickness_pie=24,
		dots_dist=15,
		offset=2.5,
		min=3;

	if (!$('#c_filter')[0]) $('body').prepend(`<svg style="position:absolute; visibility:hidden">
		<filter id="c_filter">
		    <feGaussianBlur stdDeviation="7" result="blur" />
		    <feComposite in2="blur" in="SourceAlpha" operator="out" />
		    <feComponentTransfer>
			 <feFuncA type="linear" slope=".8"/>
			</feComponentTransfer>
			<feBlend in2="SourceGraphic" mode="multiply"/>
			<feColorMatrix type="matrix" values="
				1.4 0 0 0 -.15
                0 1.4 0 0 -.15
                0 0 1.4 0 -.15
                0 0 0 1 0" />
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
			thickness=thickness_pie;
			size=size_pie+thickness;

		var R=(size_pie)/2;
		var length0=R*2*Math.PI, length=length0-.5;

		var sectors=' var(--space) var(--space)', values=[], valSum=0, cHtml=`<circle class="arc initial" r="${R}" stroke="#fff" stroke-width="${thickness}" />`, sum = 0;

		var items=$('.data-list div').clone().addClass('item').each(function(i){
			$el.append(this);
			console.log(values[i]=parseFloat($('dt',this).text().replace(',', '')), i);
			if (isNaN(values[i])) console.error('incorrect value:', $('dt',this).text());
			else sum+=values[i];
			length-=offset+min;
		}).each(function(i){
			var color=$(this).css('--color');
			var val=(values[i]||0)/sum*length+min;
			cHtml+=`<circle class="arc initial" r="${R}" style="
			 stroke-dashoffset: ${-valSum-offset*.5}px; 
			 stroke-dasharray: ${val}px ${length0}px;
			 stroke: ${color};
			" data-i="${i}"/>`;
			valSum+=val+offset;
		})
		$('.sum', $el).text(sum.toLocaleString('en'));

		for (var i = 0; i < 3; i++) {
			sectors += ` ${Math.sqrt(Math.random())*.9+.1} var(--space)`;
		}

		var svg=$(`
		<svg viewBox="${-size/2}, ${-size/2}, ${size}, ${size}">
			<circle class="arc background initial" style="stroke-dasharray:${sectors} 3" pathLength="4"/>
		</svg>
		<svg viewBox="${-size/2}, ${-size/2}, ${size}, ${size}">

			<circle class="dial initial" pathLength="360" />
			<circle class="dial initial" pathLength="360" />

			<g stroke-width="${thickness-3}" style="--trans: scale(${(R-thickness*1.5)/R})">
			${cHtml}
			</g>
		</svg>`).prependTo($el);

		setTimeout(()=>{
		 	svg.addClass('loaded');
		 	$('.initial', svg).removeClass('initial');

			$('.arc[data-i]', $el).mouseenter(function(e){
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

		}, 10);

	})
}

$(window).on('load', function(){
	$('.pie').initCirkle()
})