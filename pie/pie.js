function createPIE() {
	const PIE_SELECTOR = '.diagram',
		ITEM_SELECTOR = '.data-list>div', // selectors below must be inside this element
		VALUE_SELECTOR = 'dt', //background-color and content from this elements uses for diagram
		DESCRIPTION_SELECTOR = 'dd'

	const sectors=[], container=$(PIE_SELECTOR).empty(),
	 svg=$('<svg><g class="pie-pointer">').appendTo(container),
	 pointer=$('g', svg).html('<rect class="pie-line"/><rect class="pie-marker"/>'),
	 angle=svg[0].createSVGAngle();
	angle.valueAsString=container.css('--turn');
	let sum=0, start0=0;
	$('circle', svg).remove();
	$(ITEM_SELECTOR).each((i,el)=>{
		let val=parseFloat($(VALUE_SELECTOR, el).text())/100;
		sum+=val;
		sectors.push({
			val: val,
			text: $(DESCRIPTION_SELECTOR, el).html(),
			el: el,
			color: $(VALUE_SELECTOR, el).css('background-color')
		})
	});
	sectors.sort((a,b)=>a.val-b.val)
	.forEach((item,i)=>{
		item.val/=sum;
		const {val, text, el, color} = item, start=start0, isLast = i+1==sectors.length;
		const title=$('<div class="pie-title">').hide().html(text).appendTo(container);
		const sector=$('circle', '<svg><circle pathLength="1">').css({
			stroke: color,
			'stroke-dashoffset': -start,
			'stroke-dasharray': val+.0015+', '+(1-val-.001)
		}).appendTo(svg);
		sector.add(el).mouseenter(hover)
		function hover() {
			let turn=angle.value/360;
			const begin=start+turn,
			 end=(+isLast||start+val)+turn,
			 turn0=parseFloat(pointer.css('--turn'));
			turn=isLast?end:distTo(begin, .5)<distTo(end, .5)?begin:end;
			turn=((turn-turn0+.5)%1+1)%1-.5;
			pointer.css({
				'--turn': turn0+turn+'turn',
				transition: Math.max(Math.abs(turn*1.5), .2)+'s'
			});
		}
		start0+=val;
		if (isLast) document.readyState=='complete'?hover():$(document).one('load', hover);
	})
}
function distTo(a, base=1){
	a=Math.abs(a%base)
	return Math.min(a, base-a)
}
