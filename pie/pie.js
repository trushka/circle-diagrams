function createPIE() {
	if (document.readyState!='complete' && $(window).one('load', createPIE)) return;

	const PIE_SELECTOR = '.pie-vidget',
		ITEM_SELECTOR = '.data-list>div', // selectors below must be inside this element
		VALUE_SELECTOR = 'dt', //background-color and content from this elements uses for diagram
		DESCRIPTION_SELECTOR = 'dd'

	const sectors=[], container=$(PIE_SELECTOR).empty(),
	 svg=$('<svg><g class="pie-pointer">').appendTo(container),
	 pointer=$('g', svg).html('<rect class="pie-line"/><rect class="pie-marker"/>'),
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
		 sector=$('circle', '<svg><circle pathLength="1">').css({
			stroke: color,
			'--start': start-isLast*.001+'',
			'--val': val+.0015+''
		}).appendTo(svg);
		sector.add(el).on('mouseenter touchstart', hover)
		function hover() {
			hovered=i;
			let turn=angle.value/360;
			const begin=start+turn-.0002,
			 end=(+isLast||start+val)+turn-.0005,
			 turn0=parseFloat(pointer.css('--turn'));

			turn=isLast?end:distTo(begin, .5)<distTo(end, .5)?begin:end-.0008;

			const absTurn = ((turn+.25)%1+1)%1,
			 left = absTurn>.5,
			 up = Math.abs(absTurn)>.124 && Math.abs(turn-(left?begin:end))<.002 || Math.abs(absTurn-.5)<.125;
			//console.log( absTurn, up)

			turn=((turn-turn0+.5)%1+1)%1-.5
			let near = Math.abs(turn)<.0015;
			pointer.css({
				'--turn': turn0+turn*(1+near*3)+'turn',
				fill: color,
				transition: Math.max(Math.abs(turn*1.5), .2-near*.1)+'s'
			}).off('transitionend').on('transitionend', e=>{
				if (e.target!=pointer[0] || e.originalEvent?.propertyName=='fill' ) return;
				if (near) {
					pointer.css({
						'--turn': turn0+turn+'turn',
						transition: '.2s cubic-bezier(.1, 0, .35, 1)'
					});
					near=0;
					return
				}
				const rect=title[0].getBoundingClientRect(),
				 svgRect=svg[0].getBoundingClientRect(),
				 divRect=container[0].getBoundingClientRect(),
				 srcRect=pointer[0].querySelector('.pie-marker').getBoundingClientRect(),
				 side=left?'left':'right',
				 x=srcRect[side]-divRect.left,
				 y=srcRect[up?'bottom':'top']-divRect.top;
				title.css({
					transform: `translate(${x}px, ${y}px) translate(${-left*100}%, ${-up*100}%)`
				}).addClass('visible')[left?'addClass':'removeClass']('pie-left')
			});
			$('.pie-title.visible').not(title[0]).removeClass('visible');
		}
		start0+=val;
		if (isLast) hover();
	})
	svg.addClass('complete');
	let fr;
	$(window).on('resize', e=>{
		svg.children().appendTo(svg);
		pointer.trigger('transitionend');
	})
}
function distTo(a, base=1){
	a=Math.abs(a%base)
	return Math.min(a, base-a)
}
