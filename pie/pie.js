function createPIE() {
	if (document.readyState!='complete' && $(window).one('load', createPIE)) return;

	const PIE_SELECTOR = '.pie-vidget',
		ITEM_SELECTOR = '.data-list>div', // selectors below must be inside this element
		VALUE_SELECTOR = 'dt', //background-color and content from this elements uses for diagram
		DESCRIPTION_SELECTOR = 'dd'

	const sectors=[], container=$(PIE_SELECTOR).empty(),
	 svg=$('<svg><g class="pie-pointer"><rect class="pie-line"/><rect class="pie-marker"/>').appendTo(container),
	 pointer=$('g', svg),
	 line=$('.pie-line', svg),
	 marker=$('.pie-marker', svg),
	 angle=svg[0].createSVGAngle();
	angle.valueAsString=container.css('--turn');
	let sum=0, start0=0, hovered;
	$('circle', svg).remove();
	$(ITEM_SELECTOR).each((i,el)=>{
		let valText=$(VALUE_SELECTOR, el).html();
		 val=parseFloat(valText)/100;
		 sum+=val;
		sectors.push({
			val, valText, el,
			text: $(DESCRIPTION_SELECTOR, el).html(),
			color: $(VALUE_SELECTOR, el).css('background-color')
		})
	});
	sectors.sort((a,b)=>a.val-b.val)
	.forEach((item,i)=>{
		item.val/=sum;
		const {val, valText, text, el, color} = item,
		 start=start0,
		 isLast = i+1==sectors.length,
		 title=$('<div class="pie-title">').html(`<div>${valText}</div><div><div>${text}</div></div>`)
		  .css('color', color).appendTo(container),
		 sector=item.sector=$('circle', '<svg><circle pathLength="1">').css({
			stroke: color,
			'--start': start-isLast*.001+'',
			'--val': val+.0015+''
		}).appendTo(svg);

		sector.add(el).on('mouseenter touchstart', item.hover=hover);
		function hover() {
			if (hovered==i) return;
			hovered=i;
			const turnGlobal=angle.value/360,
			 begin=start+turnGlobal-.0002,
			 end=(+isLast||start+val)+turnGlobal-.0005,
			 turn0=parseFloat(pointer.css('--turn')),
			 turn1=isLast?end:distTo(begin, .5)<distTo(end, .5)?begin:end-.0008,
			 absTurn = ((turn1+.25)%1+1)%1,
			 turn=((turn1-turn0+.5)%1+1)%1-.5,
			 near = Math.abs(turn)<.0015,
			 duration=Math.max(Math.abs(turn*1.5), .2-near*.1),
			 left = absTurn>.5,
			 up = Math.abs(absTurn)>.124 && Math.abs(turn1-(left?begin:end))<.002 || Math.abs(absTurn-.5)<.125,
			 r0=svg[0].getBoundingClientRect().width/2,
			 r=r0+line.width(),
			 width=container[0].getBoundingClientRect().width,
			 side=width<r0*5.85,
			 center=side?r0:width/2;

			pointer.css({
				'--turn': turn0+turn*(1+near*3)+'turn',
				fill: color,
				transition: duration+'s'
			}).off('transitionend');

			if (near) pointer.one('transitionend', e=>{
				pointer.css({
					'--turn': turn0+turn+'turn',
					transition: '.2s cubic-bezier(.1, 0, .35, 1)'
				});
			});

			// $('circle', svg).css({filter: '', zIndex:''});
			// sector.appendTo(svg).css({filter: 'drop-shadow(0 0 3px '+color+')', zIndex:-1});

			svg.css('transform', `translateX(${(left?side:-side)*(width/2-r0)}px)`);

			$('.pie-title.visible').not(title[0]).removeClass('visible');
			title.css({
				[left?'right':'left']: Math.cos(turn1*Math.PI*2)*(left?-r:r)+center,
				[up?'bottom':'top']: Math.sin(turn1*Math.PI*2)*(up?-r:r)+r0,
				// top: *r,
				transitionDelay: Math.max((duration-.4)*(1+.2*side), .1)+'s'
			})[left?'addClass':'removeClass']('pie-left').addClass('visible');
			//console.log(turn1)
		}
		start0+=val;
		if (isLast) hover();
	})

	svg.addClass('complete');
	let timeout;
	$(window).on('resize', e=>{
		clearTimeout(timeout);
		timeout=setTimeout(()=>{
			console.log($(window).width())
			const i=hovered;
			hovered='-';
			container.append(svg.detach());
			sectors[i].hover();
		}, 10)
	})
}
function distTo(a, base=1){
	a=Math.abs(a%base)
	return Math.min(a, base-a)
}
