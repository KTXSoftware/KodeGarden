﻿package motion.actuators;
#if (flash || nme || openfl)


import flash.display.DisplayObject;
import flash.filters.BitmapFilter;


class FilterActuator extends SimpleActuator<DisplayObject, BitmapFilter> {
	
	
	private var filter:BitmapFilter;
	private var filterClass:Class <BitmapFilter>;
	private var filterIndex:Int;
	
	
	public function new (target:DisplayObject, duration:Float, properties:Dynamic) {
		
		filterIndex = -1;
		
		super (target, duration, properties);
		
		if (Std.is (properties.filter, Class)) {
			
			filterClass = properties.filter;
			
			if (target.filters.length == 0) {
				target.filters = [Type.createInstance(filterClass, [])];
			}
			
			for (filter in target.filters) {
				
				if (Std.is (filter, filterClass)) {
					
					this.filter = filter;
					
				}
				
			}
			
		} else {
			
			filterIndex = properties.filter;
			this.filter = target.filters [filterIndex];
			
		}
		
	}
	
	
	private override function apply ():Void {
		
		for (propertyName in Reflect.fields (properties)) {
			
			if (propertyName != "filter") {
				
				Reflect.setField (filter, propertyName, Reflect.field (properties, propertyName));
				
			}
			
		}
		
		var filters:Array <BitmapFilter> = getField (target, "filters");
		Reflect.setField (filters, properties.filter, filter);
		setField (target, "filters", filters);
		
	}
	
	
	private override function initialize ():Void {
		
		var details:PropertyDetails<BitmapFilter>;
		var start:Float;
		
		for (propertyName in Reflect.fields (properties)) {
			
			if (propertyName != "filter") {
				
				start = getField (filter, propertyName);
				details = new PropertyDetails (filter, propertyName, start, Reflect.field (properties, propertyName) - start);
				propertyDetails.push (details);
				
			}
			
		}
		
		detailsLength = propertyDetails.length;
		initialized = true;
		
	}
	
	
	private override function update (currentTime:Float):Void {
		
		super.update (currentTime);
		
		var filters = target.filters;
		
		if (filterIndex > -1) {
			
			Reflect.setField (filters, properties.filter, filter);
			
		} else {
			
			for (i in 0...filters.length) {
				
				if (Std.is (filters[i], filterClass)) {
					
					filters[i] = filter;
					
				}
				
			}
			
		}
		
		setField (target, "filters", filters);
		
	}
	
	
}


#end
