package com.weadmin.piccolo2d_rap;

import java.util.ArrayList;

import org.eclipse.rap.json.JsonObject;
import org.eclipse.swt.widgets.Composite;

public class Piccolo2dJS extends SVWidgetBase{

	/**
	 * 
	 */
	private static final long serialVersionUID = -7580109674486263430L;

	public Piccolo2dJS(Composite parent, int style) {
		super(parent, style);
		// TODO Auto-generated constructor stub
	}

	@Override
	protected void handleSetProp(JsonObject properties) {
		
	}

	@Override
	protected void handleCallMethod(String method, JsonObject parameters) {
		
	}

	@Override
	protected void handleCallNotify(String event, JsonObject parameters) {
		
	}

	@Override
	protected String getWidgetName() {
		return "piccolo2djs";
	}

	@Override
	protected ArrayList<CustomRes> getCustomRes() {
		ArrayList<CustomRes> res = new ArrayList<>();
		res.add(new CustomRes("piccolo2d.js", true, false));
		res.add(new CustomRes("handler.js", true, false));
		return res;
	}

}
