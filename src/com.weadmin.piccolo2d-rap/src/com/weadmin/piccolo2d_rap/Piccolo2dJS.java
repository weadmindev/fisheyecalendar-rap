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
	}

	//show text
	public void showText(String text){
		JsonObject parameters = new JsonObject();
		parameters.add("text", text);
		super.callRemoteMethod("showText", parameters);
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
		res.add(new CustomRes("esl.js", true, false));
		res.add(new CustomRes("zrender.js", true, false));
		res.add(new CustomRes("jquery.js", true, false));
		res.add(new CustomRes("echarts.min.js", true, false));
		res.add(new CustomRes("piccolo2d.js", true, false));
		res.add(new CustomRes("detailCharts.js", true, false));
		res.add(new CustomRes("fishEyeCalendar.js", true, false));
		res.add(new CustomRes("handler.js", true, false));
		return res;
	}

}
