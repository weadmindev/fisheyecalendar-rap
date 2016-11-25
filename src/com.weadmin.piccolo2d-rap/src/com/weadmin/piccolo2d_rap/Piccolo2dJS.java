package com.weadmin.piccolo2d_rap;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.print.attribute.standard.RequestingUserName;

import org.eclipse.rap.json.JsonArray;
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
	
	public void showList(List<JsonObject> list){
		Collections.sort(list,new Comparator<JsonObject>() {//order by savetime
			public int compare(JsonObject json1,JsonObject json2){
				if (json1!=null&&json2!=null) {
					return json1.get("savetime").asString().compareTo(json2.get("savetime").asString());
				}
				return 0;
			}
		});
		super.callRemoteMethod("showList", dealWithData(list));
	}

	public static JsonObject dealWithData(List<JsonObject> list){
		JsonObject data = new JsonObject();
		String day,date = null;
		double x = 0;
		JsonArray temp_package_array,temp_retime_array = null;
		JsonObject temp = null;
		JsonObject jsons = new JsonObject();
		for(JsonObject json:list){
			date = json.get("savetime").asString();
			day = date.substring(8, 9).equals("0")?date.substring(9, 10):date.substring(8, 10);
			x = Double.valueOf(date.substring(11, 13))*24 + Double.valueOf(date.substring(14, 16));
			temp_package_array = new JsonArray();
			temp_retime_array = new JsonArray();
			temp_package_array.add(x).add(Double.valueOf(json.get("package").asString()));
			temp_retime_array.add(x).add(Double.valueOf(json.get("retime").asString()));
			temp = new JsonObject();
			temp.add("savetime", date);
			temp.add("package", temp_package_array);
			temp.add("retime", temp_retime_array);
			if (jsons.get(day)!=null) {
				jsons.set(day, ((JsonArray)jsons.get(day)).add(temp));
			}else{
				jsons.add(day, new JsonArray().add(temp));
			}
		}
		data.add("data", jsons);
		return data;
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
